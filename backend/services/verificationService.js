const LoanApplication = require('../models/LoanApplication');

/**
 * Verify Aadhar Number from an image URL using API4AI OCR
 * @param {string} applicationId - The ID of the loan application
 * @param {string} imageUrl - The URL of the uploaded identity document
 * @param {string} typedAadhar - The Aadhar number entered by the user
 */
const verifyAadhar = async (applicationId, imageUrl, typedAadhar) => {
    try {
        console.log(`Starting Aadhar verification for application ${applicationId}`);

        const apiKey = process.env.API4AI_API_KEY;
        if (!apiKey) {
            console.error('API4AI_API_KEY is not defined in environment variables');
        }
        const apiUrl = 'https://api4ai.cloud/ocr/v1/results';

        const formData = new FormData();
        formData.append('url', imageUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API4AI responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Extract text from API4AI response
        // Based on API4AI OCR response structure: data.results[0].entities[0].objects[0].entities[0].text (simplified)
        // Usually it returns a list of detected status and then results.

        let fullText = '';
        if (data.results && data.results[0] && data.results[0].entities) {
            data.results[0].entities.forEach(entity => {
                if (entity.objects) {
                    entity.objects.forEach(obj => {
                        if (obj.entities) {
                            obj.entities.forEach(ent => {
                                if (ent.text) fullText += ent.text + ' ';
                            });
                        }
                    });
                }
            });
        }

        console.log('Extracted text from OCR:', fullText);

        // Aadhar number is 12 digits, often grouped as 4-4-4
        const aadharRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
        const matches = fullText.match(aadharRegex);

        let extractedAadhar = null;
        let isMatch = false;

        if (matches) {
            // Clean matches to compare with typed Aadhar
            const cleanMatches = matches.map(m => m.replace(/\s/g, ''));
            extractedAadhar = cleanMatches[0]; // Take the first 12-digit sequence found

            // Check if typed Aadhar matches any of the found sequences
            const cleanTyped = typedAadhar.replace(/\s/g, '');
            isMatch = cleanMatches.includes(cleanTyped);
        }

        // Update application
        await LoanApplication.findByIdAndUpdate(applicationId, {
            aadharVerification: {
                status: isMatch ? 'matched' : (matches ? 'mismatch' : 'error'),
                extractedAadhar: extractedAadhar || 'Not found',
                verifiedAt: new Date(),
                errorMessage: matches ? null : 'No 12-digit Aadhar number found in document'
            }
        });

        console.log(`Aadhar verification completed for ${applicationId}: ${isMatch ? 'MATCH' : 'NO MATCH'}`);

    } catch (error) {
        console.error('Aadhar verification failed:', error);
        await LoanApplication.findByIdAndUpdate(applicationId, {
            aadharVerification: {
                status: 'error',
                verifiedAt: new Date(),
                errorMessage: error.message
            }
        });
    }
};

module.exports = { verifyAadhar };
