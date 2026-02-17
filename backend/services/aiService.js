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
            console.error("Groq Error:", error.message);

            // Fallback to rules if Groq service is unavailable
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
                content: "I'm having trouble connecting to my AI brain at the moment. Please try again in a minute.",
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
        const loanContext = availableLoans.map(l => {
            const crit = l.eligibilityCriteria;
            return `
            - Name: ${l.name.en}
            - ID: ${l._id}
            - Type: ${l.loanType}
            - Description: ${l.description.en}
            - Amount: ₹${l.loanAmount.min} - ₹${l.loanAmount.max}
            - Interest: ${l.interestRate.min}% - ${l.interestRate.max}%
            - Eligibility: Min Age ${crit.minAge}, Max Age ${crit.maxAge}, Min Income ₹${crit.minIncome}, Min Credit Score ${crit.minCreditScore}.
            - Documents Required: ${l.requiredDocuments.map(d => d.en).join(', ')}
            `;
        }).join('\n');

        const systemPrompt = `You are a helpful and professional Loan Advisor for "LoanAdvisor".
        User language: ${lang}.
        Input Script: ${detectedScript === 'ta' ? 'Tamil' : (detectedScript === 'hi' ? 'Hindi/Devanagari' : 'Latin/English')}.
        
        LANGUAGE RULES:
        1. If Input Script is 'Tamil', respond ONLY in Tamil script (e.g., "வணக்கம்..."). Do not use Tunglish.
        2. If Input Script is 'Hindi/Devanagari', respond ONLY in Hindi script (e.g., "नमस्ते..."). Do not use Hinglish.
        3. If Input Script is 'Latin/English':
           - If lang is 'ta' (Tamil), use "Tunglish" style: Natural Tamil mixed with common English terms.
           - If lang is 'hi' (Hindi), use "Hinglish" style: Natural Hindi mixed with common English terms.
           - If lang is 'en' (English), use clear professional English.
        4. ALWAYS use English for technical terms: Loan IDs, Statuses, Document names (Identity Proof, Address Proof), and specific loan names (Personal Loan, Vehicle Loan) to ensure clarity, even when writing in Tamil or Hindi script.
        5. Match the user's tone and complexity.
        
        GOAL: Collect details concisely and check eligibility.
        
        FLOW:
        1. If user hasn't picked a loan: Ask them to pick one from the list (Personal, Home, Education, Business, Vehicle, etc.).
        2. Once picked: Ask for (Age, Monthly Income, CIBIL Score) in ONE message.
        3. Once provided: Calculate eligibility and output verdict.
        
        RULES:
        - KEEP CONVERSATIONS SHORT. Max 2-3 exchanges to reach a verdict.
        - DO NOT give long financial advice unless asked.
        
        CRITICAL TAGS (MUST INCLUDE):
        - If ELIGIBLE: [[ELIGIBILITY_RESULT:eligible:LOAN_ID]]
          (Replace LOAN_ID with the actual MongoDB _ID from the database below)
        - If NOT ELIGIBLE: [[ELIGIBILITY_RESULT:ineligible:REASON]]

        Available Loan Products:
        ${loanContext}

        Current Context Status: ${context.currentIntent || 'greeting_stage'}`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...(history || []).map(msg => ({ role: (msg.role === 'assistant' ? 'assistant' : 'user'), content: msg.content })),
            { role: "user", content: text }
        ];

        if (!groq) {
            throw new Error('AI Service is not configured (missing GROQ_API_KEY)');
        }

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
}

module.exports = new AIService();
