const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');
const Groq = require('groq-sdk');
let groq;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
    console.error('CRITICAL: GROQ_API_KEY is not defined in environment variables.');
}

const Loan = require('../models/Loan');

i18next
    .use(Backend)
    .init({
        fallbackLng: 'en',
        lng: 'en',
        preload: ['en', 'hi', 'ta'],
        backend: {
            loadPath: path.join(__dirname, '../locales/{{lng}}.json')
        }
    });

/**
 * AI Service for handling multilingual conversations using Groq AI.
 */
class AIService {
    /**
     * Process user input and return a response
     * @param {string} text - User's input text
     * @param {string} lang - Language code (en, hi, ta)
     * @param {Object} context - Conversation context
     * @returns {Promise<Object>} - Assistant response and updated context
     */
    async processMessage(text, lang, history = [], context = {}) {
        const input = text.toLowerCase();
        let response = "";
        let nextIntent = context.currentIntent;

        // Change language if requested
        if (i18next.language !== lang) {
            await i18next.changeLanguage(lang);
        }

        try {
            const detectedScript = this.detectScript(text);
            const groqResponse = await this.getGroqResponse(text, lang, history, context, detectedScript);
            return groqResponse;
        } catch (error) {
            console.error("AI Service Error:", error.message || error);

            // If it's a rate limit error, provide a specific helpful message
            if (error.status === 429) {
                return {
                    content: "I'm currently receiving too many requests. Please wait a few minutes before trying again. I'll be ready to help you shortly!",
                    role: 'assistant',
                    context
                };
            }

            // Fallback to rules if Groq service is unavailable or generic error
            const mappings = {
                greeting: {
                    keywords: ['hello', 'hi', 'namaste', 'vanakkam', 'hey', 'नमस्ते', 'வணக்கம்'],
                    response: i18next.t('welcome') + " " + i18next.t('how_can_i_help')
                },
                loan_info: {
                    keywords: ['loan', 'credit', 'borrow', 'money', 'ऋण', 'कर्ज', 'கடன்', 'பணம்'],
                    response: i18next.t('loan_eligibility') + " " + i18next.t('loan_types')
                }
            };

            for (const [intent, data] of Object.entries(mappings)) {
                if (data.keywords.some(k => input.includes(k))) {
                    response = data.response;
                    nextIntent = intent;
                    return {
                        content: response,
                        role: 'assistant',
                        context: { ...context, currentIntent: nextIntent }
                    };
                }
            }

            return {
                content: i18next.t('ai_brain_trouble') || "I'm having trouble connecting to my AI brain at the moment. Please try again in a minute.",
                role: 'assistant',
                context
            };
        }
    }

    /**
     * Detects if the text contains Tamil or Hindi scripts.
     * @param {string} text 
     * @returns {string|null} - 'ta' for Tamil script, 'hi' for Devanagari (Hindi), or null
     */
    detectScript(text) {
        const tamilRegex = /[\u0B80-\u0BFF]/;
        const devanagariRegex = /[\u0900-\u097F]/;

        if (tamilRegex.test(text)) return 'ta';
        if (devanagariRegex.test(text)) return 'hi';
        return null;
    }

    async getGroqResponse(text, lang, history, context, detectedScript = null) {
        const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
        const availableLoans = await Loan.find({ isActive: true });

        // Optimize loan context: If user has identified an intent, focus on relevant info.
        // Otherwise, provide a very concise summary.
        const loanContext = availableLoans.map(l => {
            const crit = l.eligibilityCriteria;
            return `[${l.name.en} (ID: ${l._id})]: MinAge:${crit.minAge}, MinInc:₹${crit.minIncome}, MinCredit:${crit.minCreditScore}. Amount:₹${l.loanAmount.min}-₹${l.loanAmount.max}. Types:${l.loanType}.`;
        }).join('\n');

        const systemPrompt = `You are a professional Loan Advisor for "LoanAdvisor".
        User language: ${lang}. Current script detected: ${detectedScript || 'Latin'}.
        
        STRICT LANGUAGE RULES:
        1. If user language is 'en', respond ONLY in 100% PURE, PROFESSIONAL ENGLISH. 
           - NO Hinglish, NO mixing, NO Hindi grammar. 
        2. If user language is 'hi', respond in PURE HINDI (Devanagari script).
        3. If user language is 'ta', respond in PURE TAMIL script.
        
        FUNCTIONAL RULES & VERDICTS:
        1. FLOW: Pick loan -> Ask for (Age, Income, CIBIL) -> Give Verdict.
        2. INTERNAL TAGS (Hidden from user):
           - LOAN IDENTIFICATION: When discussing a specific loan, append [[LOAN_OFFER:LOAN_ID]] so the UI can link it.
           - ELIGIBILITY VERDICTS: At the end of a decision message, use:
             - [[ELIGIBILITY_RESULT:eligible:LOAN_ID]]
             - [[ELIGIBILITY_RESULT:ineligible:REASON:IMPROVEMENT_TIPS]]
        3. VERDICT MINIMIZATION (Eligible): If the user is ELIGIBLE, keep your text response extremely short (maximum one sentence).
        4. CONSTRUCTIVE FEEDBACK (Ineligible): If the user is INELIGIBLE, provide a clear REASON and actionable IMPROVEMENT_TIPS. 
           - Example tips: "Increase monthly savings", "Improve CIBIL score to 750+".
        5. BE CONSISTENT: Use ONLY the tags above. DO NOT create new tags like LOAN_ID or DATA_ID.
        6. TECHNICAL TERMS: IDs and tags MUST remain in English.

        Loan Products for Context:
        ${loanContext}`;

        // Truncate history to last 6 messages to save tokens
        const maxHistory = 6;
        const truncatedHistory = (history || []).slice(-maxHistory);

        const messages = [
            { role: "system", content: systemPrompt },
            ...truncatedHistory.map(msg => ({
                role: (msg.role === 'assistant' ? 'assistant' : 'user'),
                content: msg.content
            })),
            { role: "user", content: text }
        ];

        if (!groq) {
            throw new Error('AI Service is not configured (missing GROQ_API_KEY)');
        }

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: messages,
                model: model,
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            });

            return {
                content: chatCompletion.choices[0].message.content,
                role: 'assistant',
                context: {
                    ...context,
                    currentIntent: "ai_handled"
                }
            };
        } catch (error) {
            if (error.status === 429) {
                // Return a specific object that the processMessage catch block will pass through or handle
                throw {
                    status: 429,
                    message: "Rate limit reached. Please try again after some time.",
                    originalError: error
                };
            }
            throw error;
        }
    }

    async translateText(text, targetLang) {
        if (!groq) {
            throw new Error('AI Service is not configured (missing GROQ_API_KEY)');
        }

        const langNames = {
            'en': 'English',
            'ta': 'Tamil script',
            'hi': 'Hindi/Devanagari script'
        };

        const targetLangName = langNames[targetLang] || 'English';

        const messages = [
            {
                role: "system",
                content: `You are a translator. Translate the given text to ${targetLangName}. 
                Keep the tone professional. If there are any MongoDB IDs or specialized tags like [[LOAN_OFFER:id]] or [[ELIGIBILITY_RESULT:status:id]], keep them EXACTLY as they are.
                Provide ONLY the translated text.`
            },
            { role: "user", content: text }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 1,
            stream: false
        });

        return chatCompletion.choices[0].message.content.trim();
    }

    /**
     * Generate improvement tips for a rejected loan application
     * @param {Object} application - The rejected application
     * @returns {Promise<Object>} - Improvement tips in multiple languages
     */
    async generateImprovementTips(application) {
        if (!groq) return null;

        const systemPrompt = `You are a helpful Financial Health Coach for rural and low-income borrowers.
        A loan application was rejected. Your task is to analyze the reasons and provide 3 actionable, encouraging tips on how the user can improve their eligibility in the next 3-6 months.
        Focus on:
        1. Financial discipline (savings, reducing existing debt).
        2. Eligibility criteria (income vs requested amount).
        
        Provide the response in the following JSON format:
        {
            "en": "concise tips in English",
            "hi": "concise tips in Hindi",
            "ta": "concise tips in Tamil"
        }
        Keep each language's content under 250 characters. Be encouraging.`;

        const userContext = `
        Requested Amount: ₹${application.requestedAmount}
        Monthly Income: ₹${application.monthlyIncome}
        CIBIL Score: ${application.creditScore}
        Age: ${application.borrowerAge}
        Status: ${application.status}
        Eligibility Details: ${JSON.stringify(application.eligibilityDetails)}
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContext }
                ],
                model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                temperature: 0.7
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error generating improvement tips:', error);
            return {
                en: "Improve your savings and ensure timely mobile recharges to boost your score.",
                hi: "अपनी बचत में सुधार करें और अपना स्कोर बढ़ाने के लिए समय पर मोबाइल रिचार्ज सुनिश्चित करें।",
                ta: "உங்கள் சேமிப்பை மேம்படுத்தவும் மற்றும் உங்கள் மதிப்பெண்ணை அதிகரிக்க சரியான நேரத்தில் மொபைல் ரீசார்ஜ் செய்வதை உறுதி செய்யவும்."
            };
        }
    }
}

module.exports = new AIService();
