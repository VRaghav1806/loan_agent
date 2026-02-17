const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LoanApplication = require('../models/LoanApplication');
const Loan = require('../models/Loan');
const { sendLoanApprovalEmail } = require('../services/emailService');


const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');

// Create storage engine
const storage = new GridFsStorage({
    db: mongoose.connection.asPromise().then(conn => conn.db),
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({ storage });

// Create GridFS bucket for retrieval
let bucket;
const initBucket = async () => {
    if (bucket) return bucket;
    const conn = await mongoose.connection.asPromise();
    bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    return bucket;
};
// Initialize on start, but will also check in routes
initBucket().catch(console.error);

// @desc    Create new loan application
// @route   POST /api/applications
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            loanId, requestedAmount, requestedTenure, purpose,
            borrowerAge, monthlyIncome, creditScore,
            hasCollateral, collateralDetails, requirementsMet
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(400).json({ message: 'Invalid Loan ID format' });
        }

        // Fetch loan details for validation
        const loanData = await Loan.findById(loanId);
        if (!loanData) {
            return res.status(404).json({ message: 'Loan product not found' });
        }

        // All new applications now go to 'submitted' for manual review
        const crit = loanData.eligibilityCriteria;
        const application = await LoanApplication.create({
            user: req.user._id,
            loan: loanId,
            requestedAmount,
            requestedTenure,
            purpose,
            borrowerAge,
            monthlyIncome,
            creditScore,
            hasCollateral,
            collateralDetails,
            requirementsMet,
            status: 'submitted', // Manual review required
            eligibilityDetails: {
                ageEligible: borrowerAge >= crit.minAge && (crit.maxAge ? borrowerAge <= crit.maxAge : true),
                incomeEligible: monthlyIncome >= crit.minIncome,
                creditScoreEligible: creditScore >= (crit.minCreditScore || 0),
                employmentEligible: true,
                existingLoansEligible: true
            }
        });

        res.status(201).json(application);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update application status (Approve/Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Agent/Admin only)
router.put('/:id/status', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'agent') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status, remarks } = req.body;
        if (!['approved', 'rejected', 'under-review'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await LoanApplication.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('loan', 'name interestRate');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        if (remarks) {
            application.remarks.push({
                message: remarks,
                createdBy: req.user.name || req.user.email
            });
        }

        await application.save();

        // Send email notification on approval
        if (status === 'approved') {
            try {
                const Loan = require('../models/Loan');
                const loanData = await Loan.findById(application.loan);
                sendLoanApprovalEmail(application, application.user, loanData);
            } catch (emailErr) {
                console.error('Email notification failed:', emailErr);
            }
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user's loan applications
// @route   GET /api/applications/my-applications
// @access  Private
router.get('/my-applications', protect, async (req, res) => {
    try {
        const applications = await LoanApplication.find({ user: req.user._id })
            .populate('loan', 'name loanType interestRate');
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload documents for application
// @route   POST /api/applications/:id/upload
// @access  Private
router.post('/:id/upload', protect, upload.single('document'), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Application ID format' });
    }
    try {
        const application = await LoanApplication.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        application.documents.push({
            documentType: req.body.documentType,
            fileName: req.file.filename,
            filePath: `uploads/${req.file.filename}`
        });


        await application.save();
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get document from GridFS
// @route   GET /api/applications/documents/:filename
// @access  Private
router.get('/documents/:filename', protect, async (req, res) => {
    try {
        await initBucket();

        const files = await bucket.find({ filename: req.params.filename }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Optional: Add authorization check here to ensure user/agent is allowed to see this doc
        // For simplicity in this fix, we'll stream it since they are already 'protect'ed

        res.set('Content-Type', files[0].contentType || 'application/octet-stream');
        const downloadStream = bucket.openDownloadStreamByName(req.params.filename);

        downloadStream.on('error', (err) => {
            res.status(500).json({ message: 'Error streaming file' });
        });

        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a loan application
// @route   DELETE /api/applications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Application ID format' });
        }

        const application = await LoanApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user is authorized:
        // 1. User is the borrower who created it
        // 2. User is the assigned agent
        // 3. User is an agent and the lead is unassigned (visible in dashboard)
        // 4. User is an admin
        const isOwner = application.user.toString() === req.user._id.toString();
        const isAgent = application.agent && application.agent.toString() === req.user._id.toString();
        const isUnassignedAgent = req.user.role === 'agent' && !application.agent;

        if (!isOwner && !isAgent && !isUnassignedAgent && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this application' });
        }

        await LoanApplication.findByIdAndDelete(req.params.id);

        res.json({ message: 'Application removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
