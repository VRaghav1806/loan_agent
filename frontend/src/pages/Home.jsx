import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, ShieldCheck, BookOpen, Mic } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'white', border: '1px solid #eee', height: '100%' }}>
        <Box sx={{ display: 'inline-flex', p: 2, borderRadius: 4, bgcolor: 'primary.light', mb: 2, color: 'white' }}>
            <Icon size={32} />
        </Box>
        <Typography variant="h6" gutterBottom fontWeight="700">
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {description}
        </Typography>
    </Paper>
);

const Home = () => {
    const { t } = useTranslation();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Hero Section */}
            <Box sx={{ py: 12, background: 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)', color: 'white' }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="900" sx={{ mb: 4 }}>
                        {t('common.welcome')} {t('common.app_name')}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 6, opacity: 0.9, fontWeight: 400 }}>
                        {t('home.hero_subtitle')}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mt: 4 }}>
                        <Button
                            component={RouterLink}
                            to="/borrower/login"
                            variant="contained"
                            size="large"
                            color="secondary"
                            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3 }}
                        >
                            {t('home.borrower_login')}
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/agent/login"
                            variant="contained"
                            size="large"
                            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}
                        >
                            {t('home.agent_login')}
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/education"
                            variant="outlined"
                            size="large"
                            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                        >
                            {t('home.learn_more')}
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Features Grid */}
            <Container maxWidth="lg" sx={{ mt: -8, mb: 12 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FeatureCard
                            icon={Mic}
                            title={t('home.feature_voice_title')}
                            description={t('home.feature_voice_desc')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FeatureCard
                            icon={ShieldCheck}
                            title={t('home.feature_eligibility_title')}
                            description={t('home.feature_eligibility_desc')}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FeatureCard
                            icon={BookOpen}
                            title={t('home.feature_education_title')}
                            description={t('home.feature_education_desc')}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Home;
