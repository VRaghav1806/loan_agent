const mongoose = require('mongoose');
const LoanApplication = require('./models/LoanApplication');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loan-advisor');
    const users = await User.find();
    const result = users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role
    }));
    const fs = require('fs');
    fs.writeFileSync('db_users.json', JSON.stringify(result, null, 2));
    process.exit(0);
}

check();
