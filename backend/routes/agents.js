const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const AgentProfile = require('../models/AgentProfile');
const LoanApplication = require('../models/LoanApplication');

// @desc    Get agent dashboard stats
// @route   GET /api/agents/dashboard
// @access  Private (Agent only)
router.get('/dashboard', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent') {
            return res.status(403).json({ message: 'Access denied. Agent role required.' });
        }

        const agentProfile = await AgentProfile.findOne({ user: req.user._id });
        const leads = await LoanApplication.find({
            $or: [
                { agent: req.user._id },
                { agent: { $exists: false } },
                { agent: null }
            ]
        }).populate('user', 'name email phone').populate('loan', 'name loanType');

        res.json({
            profile: agentProfile,
            leads: leads,
            stats: {
                totalLeads: leads.length,
                approvedLeads: leads.filter(l => l.status === 'approved').length,
                pendingLeads: leads.filter(l => ['submitted', 'under-review'].includes(l.status)).length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Submit a new loan lead
// @route   POST /api/agents/leads
// @access  Private (Agent only)
router.post('/leads', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent') {
            return res.status(403).json({ message: 'Access denied. Agent role required.' });
        }

        const { borrowerId, loanId, requestedAmount, requestedTenure, purpose } = req.body;

        if (!mongoose.Types.ObjectId.isValid(borrowerId)) {
            return res.status(400).json({ message: 'Invalid Borrower ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(400).json({ message: 'Invalid Loan ID format' });
        }

        const application = await LoanApplication.create({
            user: borrowerId,
            loan: loanId,
            agent: req.user._id,
            isAgentSubmission: true,
            requestedAmount,
            requestedTenure,
            purpose,
            status: 'submitted'
        });

        // Update agent stats
        await AgentProfile.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { totalLeadsSubmitted: 1 } }
        );

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register agent profile
// @route   POST /api/agents/profile
// @access  Private (Agent only)
router.post('/profile', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent') {
            return res.status(403).json({ message: 'Access denied. Agent role required.' });
        }

        const { agencyName, licenseNumber, experience, specializations } = req.body;

        const profileExists = await AgentProfile.findOne({ user: req.user._id });
        if (profileExists) {
            return res.status(400).json({ message: 'Agent profile already exists' });
        }

        const agentProfile = await AgentProfile.create({
            user: req.user._id,
            agencyName,
            licenseNumber,
            experience,
            specializations
        });

        res.status(201).json(agentProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
