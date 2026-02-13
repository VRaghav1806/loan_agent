const mongoose = require('mongoose');

const agentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    agencyName: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    specializations: [{
        type: String,
        enum: ['home-loan', 'personal-loan', 'business-loan', 'education-loan', 'car-loan', 'gold-loan']
    }],
    verified: {
        type: Boolean,
        default: false
    },
    commissionRate: {
        type: Number,
        default: 0
    },
    performanceRating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
    },
    totalLeadsSubmitted: {
        type: Number,
        default: 0
    },
    leadsApproved: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AgentProfile', agentProfileSchema);
