try {
    const mongoose = require('mongoose');
    console.log('Loading User model...');
    const User = require('./models/User');
    console.log('User model loaded.');

    console.log('Loading Loan model...');
    const Loan = require('./models/Loan');
    console.log('Loan model loaded.');

    console.log('Loading LoanApplication model...');
    const LoanApplication = require('./models/LoanApplication');
    console.log('LoanApplication model loaded.');

    console.log('--- All models loaded successfully ---');
} catch (err) {
    console.error('FAILED TO LOAD MODELS:');
    console.error(err.stack);
}
