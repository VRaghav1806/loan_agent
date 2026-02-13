const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        required: true
    },
    languagePreference: {
        type: String,
        enum: ['en', 'hi', 'ta'],
        default: 'en'
    },
    financialProfile: {
        monthlyIncome: {
            type: Number,
            default: 0
        },
        employmentStatus: {
            type: String,
            enum: ['employed', 'self-employed', 'unemployed', 'student', 'retired'],
            default: 'employed'
        },
        creditScore: {
            type: Number,
            min: 300,
            max: 900,
            default: 650
        },
        existingLoans: {
            type: Number,
            default: 0
        },
        age: {
            type: Number,
            min: 18,
            max: 100
        }
    },
    role: {
        type: String,
        enum: ['borrower', 'agent', 'admin'],
        default: 'borrower'
    },
    loanApplications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanApplication'
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
