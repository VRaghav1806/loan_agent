const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    language: {
        type: String,
        enum: ['en', 'hi', 'ta'],
        default: 'en'
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant', 'system'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        isVoice: {
            type: Boolean,
            default: false
        }
    }],
    context: {
        currentIntent: String,
        discussedLoans: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Loan'
        }],
        userQueries: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
