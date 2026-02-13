const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Loan = require('../models/Loan');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const loans = [
    {
        loanType: 'home',
        name: { en: 'Home Loan', hi: 'होम लोन', ta: 'வீட்டுக்கடன்' },
        description: {
            en: 'Low-interest loans for house purchase or construction.',
            hi: 'घर खरीदने या निर्माण के लिए कम ब्याज वाला ऋण।',
            ta: 'வீடு வாங்குவதற்கு அல்லது கட்டுவதற்கு குறைந்த வட்டி கடன்.'
        },
        interestRate: { min: 8.5, max: 12 },
        loanAmount: { min: 500000, max: 50000000 },
        tenure: { min: 60, max: 360 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 65,
            minIncome: 30000,
            minCreditScore: 700,
            employmentRequired: true
        },
        requiredDocuments: [
            { en: 'Aadhaar / Passport', hi: 'आधार / पासपोर्ट', ta: 'ஆதார் / பாஸ்போர்ட்' },
            { en: 'Income Proof (Salary slips / ITR / Bank statements)', hi: 'आय प्रमाण (वेतन पर्ची / आईटीआर)', ta: 'வருமானச் சான்று' },
            { en: 'Property documents (Sale agreement, Title deed)', hi: 'संपत्ति के दस्तावेज', ta: 'சொத்து ஆவணங்கள்' },
            { en: 'PAN Card', hi: 'पैन कार्ड', ta: 'பான் கார்டு' }
        ],
        features: [
            { en: 'Down payment: 10–25%', hi: 'डाउन पेमेंट: 10–25%', ta: 'முன்பணம்: 10-25%' }
        ]
    },
    {
        loanType: 'vehicle',
        name: { en: 'Vehicle Loan', hi: 'वाहन ऋण', ta: 'வாகனக் கடன்' },
        description: {
            en: 'Loans for cars, bikes, and commercial vehicles.',
            hi: 'कारों, बाइक और व्यावसायिक वाहनों के लिए ऋण।',
            ta: 'கார், பைக் மற்றும் வணிக வாகனங்களுக்கான கடன்கள்.'
        },
        interestRate: { min: 9.0, max: 15 },
        loanAmount: { min: 100000, max: 5000000 },
        tenure: { min: 12, max: 84 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 65,
            minIncome: 20000,
            minCreditScore: 650
        },
        requiredDocuments: [
            { en: 'ID & Address proof', hi: 'पहचान और पता प्रमाण', ta: 'அடையாளம் மற்றும் முகவரிச் சான்று' },
            { en: 'Income proof', hi: 'आय प्रमाण', ta: 'வருமானச் சான்று' },
            { en: 'Vehicle Quotation', hi: 'वाहन उद्धरण (Quotation)', ta: 'வாகன மேற்கோள்' }
        ],
        features: [
            { en: 'Vehicle acts as collateral', hi: 'वाहन ही गारंटी है', ta: 'வாகனமே பிணையாக செயல்படுகிறது' }
        ]
    },
    {
        loanType: 'education',
        name: { en: 'Education Loan', hi: 'शिक्षा ऋण', ta: 'கல்வி கடன்' },
        description: {
            en: 'Support for higher studies in India and abroad.',
            hi: 'भारत और विदेशों में उच्च अध्ययन के लिए सहायता।',
            ta: 'இந்தியா மற்றும் வெளிநாடுகளில் உயர்கல்விக்கு ஆதரவு.'
        },
        interestRate: { min: 8.0, max: 14 },
        loanAmount: { min: 100000, max: 7500000 },
        tenure: { min: 60, max: 180 },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 35,
            minIncome: 15000, // Co-applicant income
            minCreditScore: 600
        },
        requiredDocuments: [
            { en: 'Admission letter', hi: 'प्रवेश पत्र', ta: 'சேர்க்கை கடிதம்' },
            { en: 'Fee structure', hi: 'शुल्क संरचना', ta: 'கட்டண அமைப்பு' },
            { en: 'Academic records', hi: 'शेक्षणिक रिकॉर्ड', ta: 'கல்விப் பதிவுகள்' },
            { en: 'Income proof of co-applicant', hi: 'सह-आवेदक का आय प्रमाण', ta: 'கூட்டு விண்ணப்பதாரரின் வருமானச் சான்று' }
        ],
        features: [
            { en: 'Moratorium period included', hi: 'मोरेटोरियम अवधि शामिल', ta: 'தவணை கால அவகாசம் சேர்க்கப்பட்டுள்ளது' }
        ]
    },
    {
        loanType: 'personal',
        name: { en: 'Personal Loan', hi: 'व्यक्तिगत ऋण', ta: 'தனிநபர் கடன்' },
        description: {
            en: 'Unsecured loans for personal needs.',
            hi: 'व्यक्तिगत जरूरतों के लिए असुरक्षित ऋण।',
            ta: 'தனிப்பட்ட தேவைகளுக்கான பாதுகாப்பற்ற கடன்கள்.'
        },
        interestRate: { min: 10.5, max: 24 },
        loanAmount: { min: 50000, max: 2500000 },
        tenure: { min: 12, max: 60 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 60,
            minIncome: 25000,
            minCreditScore: 750
        },
        requiredDocuments: [
            { en: 'ID & Address proof', hi: 'पहचान और पता प्रमाण', ta: 'அடையாளம் மற்றும் முகவரிச் சான்று' },
            { en: 'Income proof', hi: 'आय प्रमाण', ta: 'வருமானச் சான்று' },
            { en: 'Bank statements (6 months)', hi: 'बैंक विवरण (6 महीने)', ta: 'வங்கி அறிக்கைகள் (6 மாதங்கள்)' }
        ],
        features: [
            { en: 'No collateral required', hi: 'कोई गारंटी की आवश्यकता नहीं', ta: 'பிணை தேவையில்லை' }
        ]
    },
    {
        loanType: 'business',
        name: { en: 'Business Loan', hi: 'व्यवसाय ऋण', ta: 'வணிகக் கடன்' },
        description: {
            en: 'Funding for business expansion and operational needs.',
            hi: 'व्यापार विस्तार और परिचालन संबंधी आवश्यकताओं के लिए धन।',
            ta: 'வணிக விரிவாக்கம் மற்றும் செயல்பாட்டுத் தேவைகளுக்கான நிதி.'
        },
        interestRate: { min: 12, max: 22 },
        loanAmount: { min: 100000, max: 50000000 },
        tenure: { min: 12, max: 84 },
        eligibilityCriteria: {
            minAge: 25,
            maxAge: 65,
            minIncome: 100000,
            minCreditScore: 700
        },
        requiredDocuments: [
            { en: 'Business registration proof', hi: 'व्यवसाय पंजीकरण प्रमाण', ta: 'வணிக பதிவுச் சான்று' },
            { en: 'GST registration', hi: 'जीएसटी पंजीकरण', ta: 'ஜிஎஸ்டி பதிவு' },
            { en: 'ITR (2–3 years)', hi: 'आईटीआर (2-3 वर्ष)', ta: 'ஐடிஆர் (2-3 ஆண்டுகள்)' },
            { en: 'Financial statements', hi: 'वित्तीय विवरण', ta: 'நிதிநிலை அறிக்கைகள்' }
        ],
        features: [
            { en: 'Secured/Unsecured options', hi: 'सुरक्षित/असुरक्षित विकल्प', ta: 'பாதுகாப்பான/பாதுகாப்பற்ற விருப்பங்கள்' }
        ]
    },
    {
        loanType: 'gold',
        name: { en: 'Gold Loan', hi: 'स्वर्ण ऋण', ta: 'தங்கக் கடன்' },
        description: {
            en: 'Immediate cash by pledging your gold jewelry.',
            hi: 'अपने सोने के गहने गिरवी रखकर तत्काल नकद।',
            ta: 'உங்கள் தங்க நகைகளை அடகு வைத்து உடனடி ரொக்கம்.'
        },
        interestRate: { min: 7.0, max: 14 },
        loanAmount: { min: 10000, max: 50000000 },
        tenure: { min: 3, max: 24 },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 80,
            minIncome: 0 // No income proof usually
        },
        requiredDocuments: [
            { en: 'ID proof', hi: 'पहचान प्रमाण', ta: 'அடையாளச் சான்று' },
            { en: 'Address proof', hi: 'पता प्रमाण', ta: 'முகவரிச் சான்று' }
        ],
        features: [
            { en: 'Quick approval, no income proof required', hi: 'त्वरित स्वीकृति, किसी आय प्रमाण की आवश्यकता नहीं', ta: 'விரைவான ஒப்புதல், வருமானச் சான்று தேவையில்லை' }
        ]
    },
    {
        loanType: 'lap',
        name: { en: 'Loan Against Property (LAP)', hi: 'संपत्ति पर ऋण (LAP)', ta: 'சொத்து மீதான கடன் (LAP)' },
        description: {
            en: 'Unlock the value of your property for financial needs.',
            hi: 'वित्तीय जरूरतों के लिए अपनी संपत्ति के मूल्य का उपयोग करें।',
            ta: 'நிதியியல் தேவைகளுக்காக உங்கள் சொத்தின் மதிப்பைத் திறக்கவும்.'
        },
        interestRate: { min: 9.5, max: 15 },
        loanAmount: { min: 500000, max: 100000000 },
        tenure: { min: 60, max: 180 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 65,
            minIncome: 40000,
            minCreditScore: 700
        },
        requiredDocuments: [
            { en: 'Property papers', hi: 'संपत्ति के कागजात', ta: 'சொத்து ஆவணங்கள்' },
            { en: 'ID & address proof', hi: 'पहचान और पता प्रमाण', ta: 'அடையாளம் மற்றும் முகவரிச் சான்று' },
            { en: 'Income proof', hi: 'आय प्रमाण', ta: 'வருமானச் சான்று' }
        ],
        features: [
            { en: 'Property valuation required', hi: 'संपत्ति का मूल्यांकन आवश्यक', ta: 'சொத்து மதிப்பீடு தேவை' }
        ]
    },
    {
        loanType: 'agricultural',
        name: { en: 'Agricultural Loan', hi: 'कृषि ऋण', ta: 'விவசாயக் கடன்' },
        description: {
            en: 'Loans for farming, equipment, and seasonal needs.',
            hi: 'खेती, उपकरण और मौसमी जरूरतों के लिए ऋण।',
            ta: 'விவசாயம், உபகரணங்கள் மற்றும் பருவகால தேவைகளுக்கான கடன்கள்.'
        },
        interestRate: { min: 4.0, max: 12 },
        loanAmount: { min: 10000, max: 5000000 },
        tenure: { min: 6, max: 120 },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 70,
            minIncome: 10000
        },
        requiredDocuments: [
            { en: 'Land documents', hi: 'भूमि के दस्तावेज', ta: 'நில ஆவணங்கள்' },
            { en: 'ID proof', hi: 'पहचान प्रमाण', ta: 'அடையாளச் சான்று' },
            { en: 'Crop details / farming plan', hi: 'फसल विवरण / खेती की योजना', ta: 'பயிர் விவரங்கள் / விவசாயத் திட்டம்' }
        ],
        features: [
            { en: 'Subsidies and Kisan Credit Card (KCC) options', hi: 'सब्सिडी और किसान क्रेडिट कार्ड (KCC) विकल्प', ta: 'மானியம் மற்றும் கிசான் கிரெடிட் கார்டு (KCC) விருப்பங்கள்' }
        ]
    },
    {
        loanType: 'mortgage',
        name: { en: 'Mortgage Loan', hi: 'बंधक ऋण (Mortgage)', ta: 'அடமான கடன்' },
        description: {
            en: 'Long-term loans secured by real estate property.',
            hi: 'रियल एस्टेट संपत्ति द्वारा सुरक्षित दीर्घकालिक ऋण।',
            ta: 'ரியல் எஸ்டேட் சொத்து மூலம் பாதுகாக்கப்பட்ட நீண்ட கால கடன்கள்.'
        },
        interestRate: { min: 8.5, max: 13 },
        loanAmount: { min: 1000000, max: 200000000 },
        tenure: { min: 60, max: 300 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 65,
            minIncome: 50000,
            minCreditScore: 750
        },
        requiredDocuments: [
            { en: 'Property ownership papers', hi: 'संपत्ति के स्वामित्व के कागजात', ta: 'சொத்து உரிமை ஆவணங்கள்' },
            { en: 'Income proof', hi: 'आय प्रमाण', ta: 'வருமானச் சான்று' },
            { en: 'Credit score report', hi: 'क्रेडिट स्कोर रिपोर्ट', ta: 'கிரெடிட் ஸ்கோர் அறிக்கை' }
        ],
        features: [
            { en: 'Legal verification of property mandatory', hi: 'संपत्ति का कानूनी सत्यापन अनिवार्य', ta: 'சொத்தின் சட்டப்பூர்வ சரிபார்ப்பு கட்டாயம்' }
        ]
    }
];

const seedLoans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing loans
        await Loan.deleteMany({ isActive: true });
        console.log('Existing active loans removed.');

        // Insert new loans
        await Loan.insertMany(loans);
        console.log(`${loans.length} demo loans inserted successfully!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding loans:', error);
        process.exit(1);
    }
};

seedLoans();
