import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Grid, Paper, Stack } from '@mui/material';
import { ChevronDown, Book, PiggyBank, Scale, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EducationItem = ({ icon: Icon, title, content }) => (
    <Paper sx={{ p: 4, height: '100%', borderRadius: 4, border: '1px solid #eee' }} elevation={0}>
        <Box sx={{ color: 'primary.main', mb: 2 }}>
            <Icon size={32} />
        </Box>
        <Typography variant="h6" fontWeight="700" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{content}</Typography>
    </Paper>
);

const FinancialEducation = () => {
    const { t } = useTranslation();

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ mb: 8, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="900" gutterBottom color="primary">
                    {t('education.title')}
                </Typography>
                <Typography variant="h6" color="text.secondary" maxWidth="md" sx={{ mx: 'auto' }}>
                    {t('education.subtitle')}
                </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 10 }}>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <EducationItem
                        icon={Book}
                        title={t('education.basics_title')}
                        content={t('education.basics_content')}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <EducationItem
                        icon={PiggyBank}
                        title={t('education.rates_title')}
                        content={t('education.rates_content')}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <EducationItem
                        icon={Calculator}
                        title={t('education.emi_title')}
                        content={t('education.emi_content')}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <EducationItem
                        icon={Scale}
                        title={t('education.credit_title')}
                        content={t('education.credit_content')}
                    />
                </Grid>
            </Grid>

            <Typography variant="h5" fontWeight="800" sx={{ mb: 4 }}>{t('education.faq_title')}</Typography>
            <Box>
                <Accordion elevation={0} sx={{ border: '1px solid #eee', mb: 1, borderRadius: '12px !important' }}>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                        <Typography variant="subtitle1" fontWeight="600">{t('education.q1')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                            {t('education.a1')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion elevation={0} sx={{ border: '1px solid #eee', mb: 1, borderRadius: '12px !important' }}>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                        <Typography variant="subtitle1" fontWeight="600">{t('education.q2')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                            {t('education.a2')}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Container>
    );
};

export default FinancialEducation;
