const tamilRegex = /[\u0B80-\u0BFF]/;
const devanagariRegex = /[\u0900-\u097F]/;

function detectScript(text) {
    if (tamilRegex.test(text)) return 'ta';
    if (devanagariRegex.test(text)) return 'hi';
    return null;
}

const testCases = [
    { text: "வணக்கம்", expected: 'ta' },
    { text: "नमस्ते", expected: 'hi' },
    { text: "Hello", expected: null },
    { text: "Tunglish style வணக்கம்", expected: 'ta' },
    { text: "Hinglish style नमस्ते", expected: 'hi' },
    { text: "English only", expected: null }
];

testCases.forEach(tc => {
    const result = detectScript(tc.text);
    console.log(`Text: "${tc.text}" | Result: ${result} | Expected: ${tc.expected} | Pass: ${result === tc.expected}`);
});
