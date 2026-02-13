import React from 'react';
import { Fab, Zoom, useTheme, Tooltip } from '@mui/material';
import { MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const ChatFAB = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Only show if user is logged in and NOT on the chat page
    const showFab = user && location.pathname !== '/chat';

    return (
        <Zoom
            in={showFab}
            timeout={{
                enter: theme.transitions.duration.enteringScreen,
                exit: theme.transitions.duration.leavingScreen,
            }}
            unmountOnExit
        >
            <Tooltip title={t('nav.talk_to_advisor')} placement="left" arrow>
                <Fab
                    color="secondary"
                    aria-label="chat"
                    onClick={() => navigate('/chat')}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        boxShadow: '0 8px 32px rgba(194, 24, 91, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: '0 12px 40px rgba(194, 24, 91, 0.5)',
                        }
                    }}
                >
                    <MessageSquare size={28} />
                </Fab>
            </Tooltip>
        </Zoom>
    );
};

export default ChatFAB;
