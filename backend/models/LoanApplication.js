const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isAgentSubmission: {
        type: Boolean,
        default: false
    },
    requestedAmount: {
        type: Number,
        required: true
    },
    requestedTenure: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    borrowerAge: Number,
    monthlyIncome: Number,
    creditScore: Number,
    hasCollateral: {
        type: Boolean,
        default: false
    },
    collateralDetails: String,
    requirementsMet: {
        identityVerified: { type: Boolean, default: false },
        addressVerified: { type: Boolean, default: false },
        incomeVerified: { type: Boolean, default: false }
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'disbursed'],
        default: 'draft'
    },
    documents: [{
        documentType: String,
        fileName: String,
        filePath: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    eligibilityScore: {
        type: Number,
        min: 0,
        max: 100
    },
    eligibilityDetails: {
        ageEligible: Boolean,
        incomeEligible: Boolean,
        creditScoreEligible: Boolean,
        employmentEligible: Boolean,
        existingLoansEligible: Boolean
    },
    remarks: [{
        message: String,
        createdBy: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    approvedAmount: Number,
    approvedTenure: Number,
    interestRate: Number,
    disbursementDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
