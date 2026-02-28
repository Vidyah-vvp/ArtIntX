/**
 * ArtIntX AI Engine - Healthcare & Mental Health Focus
 * Simulates ML-driven therapeutic & medical chatbot responses using:
 * - Pattern recognition & intent classification
 * - CBT-based & clinical response generation
 * - Crisis & symptom detection
 * - Personalized therapeutic techniques
 */

// Crisis keywords that require immediate escalation
const CRISIS_PATTERNS = [
    /\b(kill|suicide|suicidal|end my life|want to die|hurt myself|self.?harm|overdose|not worth living)\b/i,
    /\b(no reason to live|better off dead|give up on life|can't go on)\b/i,
];

// Expanded Physical illness/pain keywords covering all sorts of symptoms
const MEDICAL_SYMPTOMS = {
    emergency: /\b(severe pain|unbearable pain|chest pain|heart attack|can't breathe|breathing difficulty|coughing blood|stroke|bleeding profusely|seizure|medical emergency|passing out|loss of consciousness|paralysis|sudden weakness|choking|severe burn|poisoning|anaphylaxis|unable to speak)\b/i,
    consult_doctor: /\b(fever|persistent cough|rash|back pain|stomach pain|joint pain|illness|dizzy|dizziness|nausea|vomiting|diarrhea|chronic pain|migraine|infection|sick|physically hurting|swelling|lump|unexplained weight loss|palpitations|high blood pressure|blurred vision|frequent urination|blood in stool|chronic fatigue)\b/i,
    self_care: /\b(mild headache|headache|sniffles|sneeze|mild cold|sore throat|minor cut|scrape|bruise|muscle soreness|runny nose|fatigue|minor pain|itchy|mild allergy|stiffness|cramps|mild heartburn|chills|stuffy nose)\b/i,
    general_symptom: /\b(symptoms?|pain|ache|hurt|hurting|swollen|discomfort|feel unwell|feeling sick|body ache|bodyaches)\b/i
};

// Sentiment analysis keywords
const SENTIMENT_MAP = {
    positive: ['happy', 'better', 'great', 'good', 'hopeful', 'excited', 'grateful', 'proud', 'calm', 'peaceful', 'motivated', 'progress', 'healthy', 'healing'],
    negative: ['sad', 'depressed', 'hopeless', 'worthless', 'tired', 'exhausted', 'anxious', 'worried', 'alone', 'isolated', 'failure', 'numb', 'empty', 'dark', 'pain', 'sick', 'hurt'],
    neutral: ['okay', 'fine', 'alright', 'normal', 'same', 'unsure', 'not sure'],
};

// Intent patterns
const INTENTS = {
    greeting: /\b(hello|hi|hey|good morning|good evening|good afternoon|greetings)\b/i,
    how_are_you: /\b(how are you|what's up|whats up|how do you do)\b/i,
    sad_or_depressed: /\b(sad|depressed|depression|down|low|unhappy|miserable|crying|cried|tears)\b/i,
    anxious: /\b(anxious|anxiety|panic|worried|worry|nervous|stress|stressed|overwhelm)\b/i,
    hopeless: /\b(hopeless|no hope|pointless|meaningless|futile|give up|giving up|can't do this)\b/i,
    sleep: /\b(sleep|insomnia|can't sleep|tired|fatigue|exhausted|no energy|woke up)\b/i,
    social: /\b(alone|lonely|isolated|no friends|no one cares|abandoned|rejected|left out)\b/i,
    work_school: /\b(work|job|school|college|university|boss|coworker|grades|failing|fired)\b/i,
    relationships: /\b(relationship|partner|boyfriend|girlfriend|husband|wife|breakup|divorce|family|parents)\b/i,
    therapy: /\b(therapy|therapist|counselor|psychiatrist|medication|medicine|treatment|help|doctor|pill)\b/i,
    progress: /\b(better|improving|progress|good day|doing well|feeling good|managed|accomplished|healed)\b/i,
    cbt_thoughts: /\b(thoughts|thinking|mind|believe|belief|thought|think|feel like)\b/i,
    gratitude: /\b(grateful|gratitude|thankful|appreciate|blessed)\b/i,
    breathing: /\b(breathe|breathing|breath|calm down|relax|panic attack)\b/i,
    who_are_you: /\b(who are you|what are you|your name|introduce yourself)\b/i,
    crisis: CRISIS_PATTERNS[0],
};

// Formatting helper
const formatResponse = (assessment, nextSteps, followUp) => {
    return `🩺 **Clinical Assessment**\n${assessment}\n\n📋 **Recommended Next Steps**\n${nextSteps.map(step => `• ${step}`).join('\n')}\n\n💬 **Follow-up**\n${followUp}`;
};

// CBT & Healthcare response templates organized by intent
const RESPONSES = {
    greeting: [
        "Hello! I am ArtIntX, your AI healthcare guardian. How can I assist you with your health or wellness today?",
        "Hi there! I'm here to provide healthcare guidance and support. What's on your mind?",
        "Greetings! I'm ArtIntX. How are you feeling physically and emotionally today?"
    ],
    how_are_you: [
        "I'm functioning at full capacity and ready to assist you! How are you doing?",
        "I'm doing well, thank you for asking. How can I help you with your health journey today?"
    ],
    sad_or_depressed: [
        formatResponse(
            "I recognize signs of depression and low mood from your message. This is a clinically valid health concern.",
            ["Engage in one small, manageable activity today (e.g., taking a short walk).", "Ensure you are drinking water and eating balanced meals.", "Consider logging these feelings in your journal to track patterns."],
            "Have you experienced any changes in your appetite or physical energy levels?"
        )
    ],
    anxious: [
        formatResponse(
            "You are exhibiting signs of anxiety or heightened stress, which affects both mind and body.",
            ["Try the 5-4-3-2-1 grounding technique.", "Practice slow diaphragmatic breathing (inhale 4s, hold 4s, exhale 6s).", "Reduce caffeine intake for the next 24 hours."],
            "Where in your body do you feel this anxiety right now (e.g., chest tightness, stomach upset)?"
        )
    ],
    hopeless: [
        formatResponse(
            "Feelings of hopelessness are severe symptoms of depression and warrant careful attention.",
            ["Reach out to a trusted individual or healthcare provider immediately.", "Remind yourself that this cognitive distortion is a symptom, not a permanent reality.", "Focus only on getting through the next hour, rather than the whole day."],
            "Can you tell me about your sleep and eating patterns over the last 48 hours?"
        )
    ],
    sleep: [
        formatResponse(
            "Sleep disturbances profoundly impact immune function, cardiovascular health, and emotional regulation.",
            ["Maintain a consistent sleep-wake cycle.", "Eliminate screen exposure 1 hour before bed.", "Keep your bedroom cool (65–68°F) and completely dark."],
            "Are you having trouble falling asleep, or staying asleep?"
        )
    ],
    social: [
        formatResponse(
            "Social isolation is a recognized health risk factor, comparable to chronic physical conditions.",
            ["Identify one person you feel safe sending a brief message to.", "Look into local or online support groups.", "Schedule a brief, low-pressure social interaction this week."],
            "Do you have a regular healthcare provider or therapist you can talk to?"
        )
    ],
    progress: [
        "That's wonderful to hear! Seeing progress is a great indicator that your wellness strategies are working. Keep up the great work!",
        "I'm so glad you're feeling better. Improvement in your health journey is always something to celebrate."
    ],
    cbt_thoughts: [
        formatResponse(
            "Cognitive distortions can simulate a stress response in the body, affecting your overall health.",
            ["Write down the negative thought.", "Identify whether it is based on objective facts or subjective feelings.", "Reframe the thought into a more balanced, realistic statement."],
            "What is the most distressing thought you are currently focused on?"
        )
    ],
    breathing: [
        formatResponse(
            "Regulating your breath is a physiological intervention that lowers heart rate and blood pressure.",
            ["Begin Box Breathing: Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.", "Repeat this cycle 4 times.", "Focus entirely on the physical sensation of the air moving."],
            "How does your chest and body feel after completing the breathing cycle?"
        )
    ],
    therapy: [
        formatResponse(
            "Engaging with professional healthcare and therapy is a crucial step in managing your well-being.",
            ["Adhere to your prescribed treatment or medication plan.", "Prepare a list of symptoms to discuss at your next appointment.", "Communicate openly with your provider about any side effects."],
            "Are you currently following a specific treatment plan or taking any medications?"
        )
    ],
    relationships: [
        "Interpersonal relationships can certainly impact our overall stress and health. It's important to navigate these carefully. Have you been able to talk to anyone about this?",
        "I understand that relationship stress can be heavy. Dealing with these situations often requires patience and clear boundaries."
    ],
    work_school: [
        "Work and school related stress is very common. It's important to find a balance that doesn't compromise your health. Are you getting enough time to rest?",
        "Managing professional or academic pressure is key to preventing burnout. Remember to take breaks when you need them."
    ],
    gratitude: [
        "Practicing gratitude is a powerful tool for wellness. It's great that you're focusing on the positive things in your life!",
        "That's a lovely sentiment. Focusing on what we're thankful for can really improve our perspective and mental health."
    ],
    who_are_you: [
        "I am ArtIntX, your AI healthcare guardian and health companion. I'm here to help you assess symptoms, track your wellness, and provide general healthcare guidance.",
        "ArtIntX at your service! I'm an AI companion dedicated to supporting your physical and mental health journey with symptom assessment and recovery tools."
    ],
    default: [
        "I'm here to listen and help. Could you tell me more about what's on your mind or if you're experiencing any specific symptoms?",
        "I'm ArtIntX, your health companion. I'm ready to help you with any health-related questions or if you just need someone to talk to.",
        "Could you provide a bit more detail? I want to make sure I give you the most helpful guidance possible."
    ],
};

// Analyze sentiment of message
function analyzeSentiment(message) {
    const lower = message.toLowerCase();
    let posCount = 0, negCount = 0;

    SENTIMENT_MAP.positive.forEach(word => { if (lower.includes(word)) posCount++; });
    SENTIMENT_MAP.negative.forEach(word => { if (lower.includes(word)) negCount++; });

    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
}

// Detect crisis signals
function detectCrisis(message) {
    return CRISIS_PATTERNS.some(p => p.test(message));
}

function extractMedicalState(message) {
    if (MEDICAL_SYMPTOMS.emergency.test(message)) return 'emergency';
    if (MEDICAL_SYMPTOMS.consult_doctor.test(message)) return 'consult_doctor';
    if (MEDICAL_SYMPTOMS.self_care.test(message)) return 'self_care';
    if (MEDICAL_SYMPTOMS.general_symptom.test(message)) return 'general_symptom';
    return null;
}

// Classify primary intent
function classifyIntent(message) {
    for (const [intent, pattern] of Object.entries(INTENTS)) {
        if (pattern instanceof RegExp && pattern.test(message)) {
            return intent;
        }
    }
    return 'default';
}

// Get random response from array
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate therapeutic/healthcare response
function generateResponse(message, userContext = {}) {
    const isCrisis = detectCrisis(message);
    const medicalState = extractMedicalState(message);

    if (isCrisis) {
        return {
            response: `🚨 **CRITICAL MEDICAL ALERT**\n\n🩺 **Assessment:**\nHigh-risk indicators detected. You require immediate professional intervention.\n\n📋 **Mandatory Next Steps:**\n• 📞 Call **9999 666 555** (Vandrevala Foundation) or **9820 466 726** (AASRA).\n• 🏥 Call **112** for Emergency Services immediately.\n• Proceed to the nearest hospital emergency room.\n\n💬 **Follow-up:**\nPlease confirm that you are currently safe and are contacting emergency services.`,
            sentiment: 'crisis',
            crisisFlag: true,
        };
    }

    if (medicalState) {
        let responseMsg = '';
        let crisisFlag = false;

        if (medicalState === 'emergency') {
            responseMsg = `🚨 **Medical Category: Emergency**\n\n🩺 **Assessment:**\nSevere physical distress or potential critical medical event detected.\n\n📋 **Immediate Next Steps:**\n• 🏥 **Seek immediate medical attention.**\n• Go to the nearest hospital emergency room immediately.\n• Call **112** for emergency services.\n• Do not attempt to drive yourself if you are experiencing severe pain, chest tightness, or altered consciousness.\n\n💬 **Follow-up:**\nAre emergency responders on their way, or is someone taking you to the hospital right now?`;
            crisisFlag = true;
        } else if (medicalState === 'consult_doctor') {
            responseMsg = `⚕️ **Medical Category: Consult Doctor**\n\n🩺 **Assessment:**\nModerate physical illness or persistent symptoms detected that require professional evaluation.\n\n📋 **Recommended Next Steps:**\n• Schedule an appointment with your primary care physician or visit an urgent care clinic.\n• Keep a detailed log of your symptoms, including severity and duration.\n• Monitor your temperature and stay hydrated.\n• Treat as an emergency if symptoms suddenly become severe or unbearable.\n\n💬 **Follow-up:**\nHow long have these symptoms been going on, and are they worsening?`;
        } else if (medicalState === 'self_care') {
            responseMsg = `🩹 **Medical Category: Self-Care**\n\n🩺 **Assessment:**\nMild discomfort or minor physical symptoms detected, typically manageable at home.\n\n📋 **Recommended Next Steps:**\n• Prioritize rest and ensure adequate hydration.\n• Use over-the-counter remedies according to package instructions, if appropriate.\n• Monitor for any signs of worsening.\n• Consult a doctor if symptoms persist beyond a few days.\n\n💬 **Follow-up:**\nAre you able to rest comfortably right now?`;
        } else if (medicalState === 'general_symptom') {
            responseMsg = `🩺 **Medical Category: General Symptom Assessment**\n\n🩺 **Assessment:**\nYou have reported experiencing symptoms or discomfort, but more specific information is needed.\n\n📋 **Recommended Next Steps:**\n• Take a moment to assess exactly what part of your body is affected.\n• Note if the pain/discomfort is sharp, dull, throbbing, or constant.\n• Check if you have a fever or any rapidly changing symptoms.\n\n💬 **Follow-up:**\nPlease describe your specific symptoms in more detail (e.g., location, severity from 1-10, type of pain).`;
        }

        let userResponse = responseMsg;
        if (userContext.name) {
            const firstName = userContext.name.split(' ')[0];
            userResponse = userResponse.replace('🩺 **Assessment:**\n', `🩺 **Assessment:**\nPatient: ${firstName}\n`);
        }

        return {
            response: userResponse,
            sentiment: crisisFlag ? 'crisis' : 'neutral',
            crisisFlag: crisisFlag,
        };
    }

    const intent = classifyIntent(message);
    const sentiment = analyzeSentiment(message);
    const responsePool = RESPONSES[intent] || RESPONSES.default;
    let response = pickRandom(responsePool);

    // Personalize with user name if available
    if (userContext.name) {
        const firstName = userContext.name.split(' ')[0];
        // Insert name into the assessment part
        response = response.replace('🩺 **Clinical Assessment**\n', `🩺 **Clinical Assessment**\nPatient: ${firstName}\n`);
    }

    return { response, sentiment, crisisFlag: false };
}

// Compute ML-simulated risk scores based on user data
function computeRiskScores(userData) {
    const {
        daysSinceLastActive = 0,
        streak = 0,
        latestPHQ9 = null,
        moodTrend = [],
        totalMessages = 0,
        assessmentCount = 0,
    } = userData;

    // Attrition risk: based on engagement gaps and low interaction
    let attritionRisk = 0;
    if (daysSinceLastActive > 7) attritionRisk += 0.4;
    else if (daysSinceLastActive > 3) attritionRisk += 0.2;
    if (streak < 3) attritionRisk += 0.2;
    if (totalMessages < 5) attritionRisk += 0.2;
    if (assessmentCount === 0) attritionRisk += 0.2;
    attritionRisk = Math.min(1, attritionRisk);

    // Relapse risk: based on PHQ-9 trajectory and mood trend
    let relapseRisk = 0.1;
    if (latestPHQ9) {
        if (latestPHQ9.total_score >= 20) relapseRisk += 0.5;
        else if (latestPHQ9.total_score >= 15) relapseRisk += 0.35;
        else if (latestPHQ9.total_score >= 10) relapseRisk += 0.2;
    }
    if (moodTrend.length >= 3) {
        const recent = moodTrend.slice(-3).map(m => m.mood_score);
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
        if (avg < 4) relapseRisk += 0.3;
        else if (avg < 6) relapseRisk += 0.1;
    }
    relapseRisk = Math.min(1, relapseRisk);

    // Crisis risk: based on PHQ-9 Q9 (suicidality) and mood
    let crisisRisk = 0;
    if (latestPHQ9 && latestPHQ9.q9 >= 2) crisisRisk += 0.6;
    else if (latestPHQ9 && latestPHQ9.q9 === 1) crisisRisk += 0.3;
    if (moodTrend.length > 0) {
        const lastMood = moodTrend[moodTrend.length - 1]?.mood_score || 5;
        if (lastMood <= 2) crisisRisk += 0.3;
    }
    crisisRisk = Math.min(1, crisisRisk);

    // Engagement score: higher is better
    let engagementScore = 0.5;
    if (streak >= 7) engagementScore += 0.3;
    else if (streak >= 3) engagementScore += 0.2;
    if (totalMessages >= 20) engagementScore += 0.1;
    if (assessmentCount >= 2) engagementScore += 0.1;
    if (daysSinceLastActive === 0) engagementScore += 0.1;
    engagementScore = Math.min(1, engagementScore);

    // Build explanatory factors
    const factors = [];
    if (daysSinceLastActive > 3) factors.push(`${daysSinceLastActive} days since last login`);
    if (streak < 3) factors.push('Low engagement streak');
    if (latestPHQ9?.total_score >= 15) factors.push('High severity (PHQ-9)');
    if (moodTrend.length >= 3) {
        const avg = moodTrend.slice(-3).map(m => m.mood_score).reduce((a, b) => a + b, 0) / 3;
        if (avg < 5) factors.push('Declining clinical trend');
    }

    return {
        attritionRisk: parseFloat(attritionRisk.toFixed(2)),
        relapseRisk: parseFloat(relapseRisk.toFixed(2)),
        crisisRisk: parseFloat(crisisRisk.toFixed(2)),
        engagementScore: parseFloat(engagementScore.toFixed(2)),
        factors,
    };
}

module.exports = { generateResponse, computeRiskScores, analyzeSentiment, detectCrisis };
