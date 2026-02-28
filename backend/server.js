require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const db = require('./db');
const { generateResponse, computeRiskScores, analyzeSentiment } = require('./aiEngine');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'artintx_secret_key_2024_secure';

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Translation Helper ──────────────────────────────────────────────────────
const https = require('https');

async function translateText(text, targetLang) {
    if (targetLang === 'en') return text;
    return new Promise((resolve, reject) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    let translated = '';
                    if (parsed[0]) {
                        parsed[0].forEach(item => {
                            if (item[0]) translated += item[0];
                        });
                        resolve(translated);
                    } else {
                        resolve(text);
                    }
                } catch (e) {
                    resolve(text);
                }
            });
        }).on('error', (e) => resolve(text));
    });
}

// ─── Auth Middleware ─────────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// ─── Helper: Update User Activity ────────────────────────────────────────────
async function updateUserActivity(userId) {
    try {
        const user = await db.getAsync('SELECT last_active, streak FROM users WHERE id = ?', [userId]);
        if (!user) return;
        const lastActive = new Date(user.last_active);
        const now = new Date();
        const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
        let newStreak = user.streak || 0;
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
        await db.runAsync('UPDATE users SET last_active = CURRENT_TIMESTAMP, streak = ? WHERE id = ?', [newStreak, userId]);
    } catch (e) { /* noop */ }
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, age, gender, diagnosis, therapist_name, emergency_contact } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'Name, email, and password are required.' });

        const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = uuidv4();

        await db.runAsync(
            `INSERT INTO users (id, name, email, password, age, gender, diagnosis, therapist_name, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, email, hashedPassword, age || null, gender || null,
                diagnosis || 'unspecified', therapist_name || null, emergency_contact || null]
        );

        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Account created!', token, user: { id: userId, name, email, age, gender, diagnosis } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid email or password.' });

        await updateUserActivity(user.id);
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id, name: user.name, email: user.email, age: user.age, gender: user.gender,
                diagnosis: user.diagnosis, streak: user.streak, total_sessions: user.total_sessions,
                therapist_name: user.therapist_name
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// Get Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.getAsync(
            'SELECT id, name, email, age, gender, diagnosis, therapist_name, emergency_contact, streak, total_sessions, created_at, last_active FROM users WHERE id = ?',
            [req.user.userId]
        );
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, age, gender, diagnosis, therapist_name, emergency_contact } = req.body;
        await db.runAsync(
            'UPDATE users SET name = ?, age = ?, gender = ?, diagnosis = ?, therapist_name = ?, emergency_contact = ? WHERE id = ?',
            [name, age, gender, diagnosis, therapist_name, emergency_contact, req.user.userId]
        );
        res.json({ message: 'Profile updated successfully.' });
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// CHATBOT ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Send message
app.post('/api/chat/message', authenticateToken, async (req, res) => {
    try {
        const { content, session_id, lang = 'en' } = req.body;
        if (!content || !content.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

        const sessionId = session_id || uuidv4();

        // Translate user input to English for AI Engine processing if needed
        let processedContent = content;
        if (lang !== 'en') {
            processedContent = await translateText(content, 'en');
        }

        const user = await db.getAsync('SELECT name FROM users WHERE id = ?', [req.user.userId]);
        const { response: rawResponse, sentiment, crisisFlag } = generateResponse(processedContent, { name: user?.name });

        // Translate response back to user's language if needed
        let finalResponse = rawResponse;
        if (lang !== 'en') {
            finalResponse = await translateText(rawResponse, lang);
        }

        await db.runAsync(
            `INSERT INTO chat_messages (id, user_id, role, content, sentiment, crisis_flag, session_id) VALUES (?, ?, 'user', ?, ?, 0, ?)`,
            [uuidv4(), req.user.userId, content, sentiment, sessionId]
        );
        await db.runAsync(
            `INSERT INTO chat_messages (id, user_id, role, content, sentiment, crisis_flag, session_id) VALUES (?, ?, 'assistant', ?, 'bot', ?, ?)`,
            [uuidv4(), req.user.userId, finalResponse, crisisFlag ? 1 : 0, sessionId]
        );

        await db.runAsync('UPDATE users SET total_sessions = total_sessions + 1 WHERE id = ?', [req.user.userId]);
        await updateUserActivity(req.user.userId);

        res.json({ response: finalResponse, sentiment, crisisFlag, session_id: sessionId });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: 'Failed to process message.' });
    }
});

// Get chat history
app.get('/api/chat/history', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const messages = await db.allAsync(
            'SELECT id, role, content, sentiment, crisis_flag, session_id, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?',
            [req.user.userId, limit]
        );
        res.json(messages);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// Get chat sessions
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await db.allAsync(
            'SELECT session_id, MIN(created_at) as started_at, COUNT(*) as message_count FROM chat_messages WHERE user_id = ? GROUP BY session_id ORDER BY started_at DESC LIMIT 20',
            [req.user.userId]
        );
        res.json(sessions);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// MOOD TRACKING ROUTES
// ════════════════════════════════════════════════════════════════════════════

// Log mood
app.post('/api/mood/log', authenticateToken, async (req, res) => {
    try {
        const { mood_score, energy_level, anxiety_level, sleep_hours, notes, activities } = req.body;
        if (!mood_score || mood_score < 1 || mood_score > 10)
            return res.status(400).json({ error: 'Mood score must be between 1 and 10.' });

        const id = uuidv4();
        await db.runAsync(
            'INSERT INTO mood_logs (id, user_id, mood_score, energy_level, anxiety_level, sleep_hours, notes, activities) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, req.user.userId, mood_score, energy_level || null, anxiety_level || null, sleep_hours || null, notes || null, JSON.stringify(activities || [])]
        );
        await updateUserActivity(req.user.userId);
        res.status(201).json({ message: 'Mood logged!', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Get mood history
app.get('/api/mood/history', authenticateToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const logs = await db.allAsync(
            `SELECT id, mood_score, energy_level, anxiety_level, sleep_hours, notes, activities, logged_at
       FROM mood_logs WHERE user_id = ? AND logged_at >= datetime('now', '-' || ? || ' days')
       ORDER BY logged_at ASC`,
            [req.user.userId, days]
        );
        res.json(logs);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// Mood stats
app.get('/api/mood/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await db.getAsync(
            `SELECT AVG(mood_score) as avg_mood, AVG(energy_level) as avg_energy, AVG(anxiety_level) as avg_anxiety,
              AVG(sleep_hours) as avg_sleep, MIN(mood_score) as min_mood, MAX(mood_score) as max_mood, COUNT(*) as total_logs
       FROM mood_logs WHERE user_id = ? AND logged_at >= datetime('now', '-30 days')`,
            [req.user.userId]
        );
        res.json(stats);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// PHQ-9 ROUTES
// ════════════════════════════════════════════════════════════════════════════

const PHQ9_SEVERITY = (score) => {
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    if (score <= 19) return 'Moderately Severe';
    return 'Severe';
};

app.post('/api/assessment/phq9', authenticateToken, async (req, res) => {
    try {
        const { q1, q2, q3, q4, q5, q6, q7, q8, q9 } = req.body;
        const scores = [q1, q2, q3, q4, q5, q6, q7, q8, q9];
        if (scores.some(s => s === undefined || s < 0 || s > 3))
            return res.status(400).json({ error: 'All 9 questions must have scores 0–3.' });

        const total = scores.reduce((a, b) => a + Number(b), 0);
        const severity = PHQ9_SEVERITY(total);
        const id = uuidv4();

        await db.runAsync(
            `INSERT INTO phq9_assessments (id, user_id, q1, q2, q3, q4, q5, q6, q7, q8, q9, total_score, severity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user.userId, q1, q2, q3, q4, q5, q6, q7, q8, q9, total, severity]
        );
        await updateUserActivity(req.user.userId);
        res.status(201).json({ id, total_score: total, severity, message: 'Assessment submitted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

app.get('/api/assessment/history', authenticateToken, async (req, res) => {
    try {
        const history = await db.allAsync(
            'SELECT id, q1,q2,q3,q4,q5,q6,q7,q8,q9, total_score, severity, taken_at FROM phq9_assessments WHERE user_id = ? ORDER BY taken_at DESC LIMIT 20',
            [req.user.userId]
        );
        res.json(history);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// RISK & ANALYTICS ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/risk/scores', authenticateToken, async (req, res) => {
    try {
        const user = await db.getAsync('SELECT last_active, streak, total_sessions FROM users WHERE id = ?', [req.user.userId]);
        const moodTrend = await db.allAsync('SELECT mood_score FROM mood_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 7', [req.user.userId]);
        const latestPHQ9 = await db.getAsync('SELECT * FROM phq9_assessments WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1', [req.user.userId]);
        const msgRow = await db.getAsync("SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND role = 'user'", [req.user.userId]);
        const assRow = await db.getAsync('SELECT COUNT(*) as count FROM phq9_assessments WHERE user_id = ?', [req.user.userId]);

        const lastActive = new Date(user?.last_active || Date.now());
        const daysSinceLastActive = Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));

        const scores = computeRiskScores({
            daysSinceLastActive,
            streak: user?.streak || 0,
            latestPHQ9,
            moodTrend,
            totalMessages: msgRow?.count || 0,
            assessmentCount: assRow?.count || 0,
        });

        await db.runAsync(
            'INSERT INTO risk_scores (id, user_id, attrition_risk, relapse_risk, crisis_risk, engagement_score, factors) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uuidv4(), req.user.userId, scores.attritionRisk, scores.relapseRisk, scores.crisisRisk, scores.engagementScore, JSON.stringify(scores.factors)]
        );

        res.json({ ...scores, user_stats: { streak: user?.streak || 0, total_sessions: user?.total_sessions || 0, days_since_active: daysSinceLastActive } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

app.get('/api/analytics/summary', authenticateToken, async (req, res) => {
    try {
        const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.user.userId]);
        const latestMood = await db.getAsync('SELECT mood_score, logged_at FROM mood_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 1', [req.user.userId]);
        const latestPHQ9 = await db.getAsync('SELECT total_score, severity, taken_at FROM phq9_assessments WHERE user_id = ? ORDER BY taken_at DESC LIMIT 1', [req.user.userId]);
        const chatCount = await db.getAsync("SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND role = 'user'", [req.user.userId]);
        const crisisAlerts = await db.getAsync('SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND crisis_flag = 1', [req.user.userId]);

        res.json({
            user: { name: user?.name, streak: user?.streak, total_sessions: user?.total_sessions },
            latest_mood: latestMood,
            latest_phq9: latestPHQ9,
            chat_message_count: chatCount?.count || 0,
            crisis_alerts: crisisAlerts?.count || 0,
        });
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/analytics/mood-trend', authenticateToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 14;
        const data = await db.allAsync(
            `SELECT date(logged_at) as date, AVG(mood_score) as avg_mood, AVG(energy_level) as avg_energy, AVG(anxiety_level) as avg_anxiety
       FROM mood_logs WHERE user_id = ? AND logged_at >= datetime('now', '-' || ? || ' days')
       GROUP BY date(logged_at) ORDER BY date ASC`,
            [req.user.userId, days]
        );
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.get('/api/analytics/phq9-trend', authenticateToken, async (req, res) => {
    try {
        const data = await db.allAsync(
            'SELECT total_score, severity, date(taken_at) as date FROM phq9_assessments WHERE user_id = ? ORDER BY taken_at ASC LIMIT 10',
            [req.user.userId]
        );
        res.json(data);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// REMINDER ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/api/reminders', authenticateToken, async (req, res) => {
    try {
        const reminders = await db.allAsync('SELECT * FROM reminders WHERE user_id = ? AND is_active = 1 ORDER BY reminder_time ASC', [req.user.userId]);
        res.json(reminders);
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.post('/api/reminders', authenticateToken, async (req, res) => {
    try {
        const { medicine_name, dosage, reminder_time, frequency } = req.body;
        if (!medicine_name || !reminder_time) return res.status(400).json({ error: 'Medicine name and time are required.' });
        const id = uuidv4();
        await db.runAsync('INSERT INTO reminders (id, user_id, medicine_name, dosage, reminder_time, frequency) VALUES (?, ?, ?, ?, ?, ?)',
            [id, req.user.userId, medicine_name, dosage, reminder_time, frequency || 'daily']);
        res.status(201).json({ id, message: 'Reminder set!' });
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

app.delete('/api/reminders/:id', authenticateToken, async (req, res) => {
    try {
        await db.runAsync('UPDATE reminders SET is_active = 0 WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        res.json({ message: 'Reminder removed.' });
    } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log(`║  🧠 ArtIntX AI     — http://0.0.0.0:${PORT}    ║`);
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('  📊 Database   : SQLite (artintx.db)');
    console.log('  🔐 Auth       : JWT (7-day expiry)');
    console.log('  🤖 AI Engine  : CBT + Crisis Detection');
    console.log('  ✅ Status     : All systems operational\n');
});

module.exports = app;
