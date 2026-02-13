const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    loanType: {
        type: String,
        required: true,
        enum: ['personal', 'home', 'education', 'business', 'vehicle', 'gold', 'lap', 'agricultural', 'mortgage']
    },
    name: {
        en: { type: String, required: true },
        hi: { type: String, required: true },
        ta: { type: String, required: true }
    },
    description: {
        en: { type: String, required: true },
        hi: { type: String, required: true },
        ta: { type: String, required: true }
    },
    interestRate: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    loanAmount: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    tenure: {
        min: { type: Number, required: true }, // in months
        max: { type: Number, required: true }
    },
    eligibilityCriteria: {
        minAge: { type: Number, default: 18 },
        maxAge: { type: Number, default: 65 },
        minIncome: { type: Number, required: true },
        minCreditScore: { type: Number, default: 650 },
        employmentRequired: { type: Boolean, default: true },
        maxExistingLoans: { type: Number, default: 3 }
    },
    requiredDocuments: [{
        en: String,
        hi: String,
        ta: String
    }],
    features: [{
        en: String,
        hi: String,
        ta: String
    }],
    processingFee: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
