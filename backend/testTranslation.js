// axios removed

async function testTranslation() {
    try {
        // Since I don't have an auth token easily here, I'll bypass via aiService direct test if possible
        // but it's better to test the service
        const AIService = require('./services/aiService');
        const result = await AIService.translateText("Hello, how are you?", "hi");
        console.log("Translation Result (Hindi):", result);

        const resultTa = await AIService.translateText("Hello, how are you?", "ta");
        console.log("Translation Result (Tamil):", resultTa);
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testTranslation();
