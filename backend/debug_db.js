require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    if (!process.env.MONGODB_URI) {
        console.error('CRITICAL: MONGODB_URI is not defined.');
        process.exit(1);
    }

    console.log('Attempting to connect to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected Successfully!');

        // Try a simple query
        const Loan = require('./models/Loan');
        console.log('Querying loans...');
        const count = await Loan.countDocuments();
        console.log(`Found ${count} loans.`);

        process.exit(0);
    } catch (err) {
        console.error('DATABASE CONNECTION FAILED:');
        console.error(err.message);
        process.exit(1);
    }
}

testConnection();
