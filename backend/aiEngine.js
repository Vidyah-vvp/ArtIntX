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
        formatResponse(
            "Welcome. I am your healthcare and mental wellness assistant.",
            ["Please share what brings you here today.", "You can mention any physical symptoms or mental health concerns."],
            "How can I assist you with your health today?"
        )
    ],
    how_are_you: [
        formatResponse(
            "I'm functioning normally and ready to help assess your health.",
            ["Take a moment to evaluate your own physical and mental state.", "Let me know if you are experiencing any distress."],
            "What symptoms or feelings are you experiencing right now?"
        )
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
        formatResponse(
            "Reporting improvement is an excellent clinical indicator of resilience and effective coping.",
            ["Document the specific actions you took that led to this improvement.", "Maintain your current self-care and treatment regimen.", "Celebrate this milestone appropriately."],
            "What specific habits do you feel contributed most to this progress?"
        )
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
        formatResponse(
            "Interpersonal stress can elevate cortisol levels and exacerbate both physical and mental health issues.",
            ["Set clear, healthy boundaries to protect your energy.", "Practice active, non-judgmental communication.", "Consider couples or family counseling if the stress is chronic."],
            "Are these relationship difficulties affecting your sleep or physical health?"
        )
    ],
    work_school: [
        formatResponse(
            "Occupational burnout is a recognized health syndrome involving chronic exhaustion and reduced efficacy.",
            ["Implement strict boundaries between work/school and rest time.", "Take micro-breaks every 60-90 minutes.", "Speak to HR or a counselor regarding accommodations if necessary."],
            "Are you experiencing any physical symptoms of burnout, such as headaches or stomach issues?"
        )
    ],
    gratitude: [
        formatResponse(
            "Daily gratitude practice is clinically shown to improve sleep quality and reduce symptoms of depression.",
            ["Write down 3 specific things you are grateful for today.", "Reflect on why these transition patterns matter to your well-being.", "Share your gratitude with someone else."],
            "How does focusing on these positive aspects affect your physical energy today?"
        )
    ],
    who_are_you: [
        formatResponse(
            "I am ArtIntX, your AI health companion and symptom assessment assistant.",
            ["I am designed to help you monitor your physical symptoms and mental well-being.", "I can provide clinical guidance, coping strategies, and crisis detection.", "My goal is to support your health journey with evidence-based insights."],
            "How can I help you today? You can share any physical or emotional health concerns."
        )
    ],
    default: [
        formatResponse(
            "I'm evaluating your input from a healthcare perspective.",
            ["Please provide more details about your symptoms or feelings.", "Monitor your condition for any sudden changes.", "Ensure you are practicing baseline self-care: hydration, nutrition, and rest."],
            "Could you describe exactly what you are feeling and how long it has been going on?"
        )
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
