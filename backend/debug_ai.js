require('dotenv').config();
const path = require('path');

try {
    console.log('Testing aiService initialization...');
    const aiService = require('./services/aiService');
    console.log('aiService required successfully.');

    // Test a simple translation or similar if possible
    // Wait for i18next to init (it's often async behind the scenes)
    setTimeout(() => {
        console.log('Checking i18next status...');
        const i18next = require('i18next');
        console.log('i18next language:', i18next.language);
        process.exit(0);
    }, 1000);
} catch (err) {
    console.error('FAILED TO INITIALIZE AI SERVICE:');
    console.error(err.stack);
    process.exit(1);
}
