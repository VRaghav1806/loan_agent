import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onSpeech }) => {
    const [isListening, setIsListening] = useState(false);

    // Note: This is a browser-native Web Speech API implementation
    // It works best in Chrome and some other modern browsers

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
            alert("Speech recognition not supported in this browser. Please use Chrome.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US'; // Default, we can dynamic this based on i18n
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onSpeech) onSpeech(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
                onClick={startListening}
                sx={{
                    p: 3,
                    borderRadius: '50%',
                    bgcolor: isListening ? 'error.main' : 'primary.main',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isListening ? '0 0 20px rgba(211, 47, 47, 0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': { transform: 'scale(1.05)' }
                }}
            >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </Box>
            <Typography variant="caption" sx={{ mt: 1, color: isListening ? 'error.main' : 'text.secondary' }}>
                {isListening ? 'Listening...' : 'Tap to speak'}
            </Typography>
        </Box>
    );
};

export default VoiceInput;
