import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Container, Paper, TextField, IconButton, Typography, Stack, Avatar,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import { Send, Mic, MicOff, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Message = ({ content, role, isVoice, onAcceptOffer }) => {
    const { t } = useTranslation();
    const isAssistant = role === 'assistant';
    const offerMatch = content.match(/\[\[LOAN_OFFER:(.*?)\]\]/);
    const dataMatch = content.match(/\[\[LOAN_DATA:(.*?)\]\]/);
    const eligibilityMatch = content.match(/\[\[ELIGIBILITY_RESULT\s*:\s*(.*?)\s*:\s*(.*?)(?:\s*:\s*(.*?))?\s*\]\]/);

    const displayContent = content
        .replace(/\[\[LOAN_OFFER:.*?\]\]/, '')
        .replace(/\[\[LOAN_DATA:.*?\]\]/, '')
        .replace(/\[\[ELIGIBILITY_RESULT:.*?\]\]/, '')
        .trim();

    const loanId = offerMatch ? offerMatch[1] : null;
    let loanData = null;
    try {
        loanData = dataMatch ? JSON.parse(dataMatch[1]) : null;
    } catch (e) {
        console.error("Failed to parse loan data", e);
    }

    const eligibilityStatus = eligibilityMatch ? eligibilityMatch[1] : null; // 'eligible' or 'ineligible'
    const eligibilityValue = eligibilityMatch ? eligibilityMatch[2] : null; // loanId or reason

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: isAssistant ? 'flex-start' : 'flex-end',
            mb: 2
        }}>
            <Stack direction={isAssistant ? 'row' : 'row-reverse'} spacing={1} alignItems="flex-end">
                <Avatar sx={{ bgcolor: isAssistant ? 'primary.main' : 'secondary.main', width: 32, height: 32 }}>
                    {isAssistant ? 'A' : 'U'}
                </Avatar>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        maxWidth: '80%',
                        borderRadius: isAssistant ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                        bgcolor: isAssistant ? 'white' : 'primary.main',
                        color: isAssistant ? 'text.primary' : 'white',
                        border: isAssistant ? '1px solid #e0e0e0' : 'none'
                    }}
                >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{displayContent}</Typography>

                    {eligibilityStatus === 'eligible' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', color: 'white', borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="700">{t('chat.eligible_title')}</Typography>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                sx={{ mt: 1, bgcolor: 'white', color: 'success.main', '&:hover': { bgcolor: '#f0f0f0' } }}
                                onClick={() => onAcceptOffer(eligibilityValue, loanData)}
                            >
                                {t('chat.accept_apply')}
                            </Button>
                        </Box>
                    )}

                    {eligibilityStatus === 'ineligible' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', color: 'white', borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="700">{t('chat.ineligible_title')}</Typography>
                            <Typography variant="body2">{eligibilityValue}</Typography>
                        </Box>
                    )}

                    {loanId && !eligibilityStatus && (
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mt: 2, borderRadius: 2 }}
                            onClick={() => onAcceptOffer(loanId, loanData)}
                        >
                            {t('chat.accept_apply')}
                        </Button>
                    )}
                </Paper>
            </Stack>
        </Box>
    );
};

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [error, setError] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const initChat = async () => {
            await fetchHistory();
            setIsFetchingHistory(false);
        };
        initChat();
    }, []);

    useEffect(() => {
        // Removed automatic initial "Hello" call to improve speed
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleClearChatEvent = () => handleClearChat();
        window.addEventListener('clear-chat', handleClearChatEvent);
        return () => window.removeEventListener('clear-chat', handleClearChatEvent);
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/chat/history');
            if (data && data.length > 0) {
                setMessages(data);
            } else {
                // Hardcode first message if no history
                setMessages([{
                    role: 'assistant',
                    content: t('chat.initial_message')
                }]);
            }
        } catch (err) {
            console.error('Failed to fetch chat history');
        }
    };

    const handleClearChat = async () => {
        if (window.confirm(t('chat.clear_confirm') || 'Clear entire chat history?')) {
            try {
                await api.delete('/chat/history');
                setMessages([]);
            } catch (err) {
                console.error('Failed to clear chat');
            }
        }
    };

    const handleSend = async (text = input, isVoice = false, isInternal = false) => {
        if (!text.trim()) return;

        if (!isInternal) {
            const userMessage = { role: 'user', content: text, isVoice };
            setMessages(prev => [...prev, userMessage]);
        }

        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/chat', {
                text: isInternal ? "Hello" : text, // Trigger initial greeting with "Hello" internally
                language: i18n.language,
                isVoice
            });

            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        } catch (err) {
            console.error('Communication error');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOffer = (loanId, loanData) => {
        // Basic check to ensure it's not a placeholder string
        if (!loanId || loanId === 'loanId' || loanId.length < 10) {
            alert("Invalid loan ID detected. Please ask the advisor for the specific loan details again.");
            return;
        }
        navigate(`/apply/${loanId}`, { state: { loanData } });
    };


    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t('chat.speech_unsupported') || "Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // Map i18n language to speech recognition locales
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'ta': 'ta-IN'
        };
        recognition.lang = langMap[i18n.language] || 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsRecording(true);
            setError('');
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            setInput(transcript);

            // Auto-send after a brief pause of silence if the result is final
            if (event.results[0].isFinal) {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    handleSend(transcript, true);
                    recognition.stop();
                }, 1500);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech Error:', event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                alert(t('chat.mic_permission_denied') || "Microphone permission denied.");
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: '#f0f2f5' }}>
            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 4 }}>
                <Container maxWidth="md">
                    {messages.length === 0 && (
                        <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.6 }}>
                            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.light' }}>
                                <MessageSquare size={40} />
                            </Avatar>
                            <Typography variant="h5">{t('chat.welcome') || 'Hello! I am your loan advisor.'}</Typography>
                            <Typography variant="body1">{t('chat.how_can_i_help')}</Typography>
                        </Box>
                    )}
                    {messages.map((msg, index) => (
                        <Message key={index} {...msg} onAcceptOffer={handleAcceptOffer} />
                    ))}
                    {loading && (
                        <Typography variant="caption" sx={{ ml: 6, fontStyle: 'italic', opacity: 0.7 }}>
                            {t('chat.advisor_typing')}
                        </Typography>
                    )}
                    <div ref={messagesEndRef} />
                </Container>
            </Box>

            {/* Input Area */}
            <Paper elevation={4} square sx={{ p: 2, borderTop: '1px solid #ddd' }}>
                <Container maxWidth="md">
                    <Stack direction="row" spacing={2}>
                        <IconButton
                            color={isRecording ? "error" : "primary"}
                            onClick={toggleRecording}
                            sx={{ bgcolor: isRecording ? 'rgba(211, 47, 47, 0.1)' : 'rgba(26, 35, 126, 0.05)' }}
                        >
                            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                        </IconButton>
                        <TextField
                            fullWidth
                            placeholder={isRecording ? t('chat.listening') : t('chat.input_placeholder')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isRecording}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
                        />
                        <IconButton color="primary" onClick={() => handleSend()} disabled={!input.trim()}>
                            <Send size={24} />
                        </IconButton>
                    </Stack>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center', opacity: 0.5 }}>
                        {t('chat.voice_hint')}
                    </Typography>
                </Container>
            </Paper>

        </Box>
    );
};

export default Chat;
