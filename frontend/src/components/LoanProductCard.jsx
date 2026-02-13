import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Chip, Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Landmark, TrendingUp, ShieldCheck, Check } from 'lucide-react';

const LoanProductCard = ({ loan, onCheckEligibility }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const getLoanIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'home': return <Landmark size={24} />;
            case 'personal': return <TrendingUp size={24} />;
            default: return <ShieldCheck size={24} />;
        }
    };

    return (
        <Card elevation={0} sx={{
            borderRadius: 4,
            border: '1px solid #edf2f7',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.08)' }
        }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
                    <Box sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: 'primary.light', color: 'white',
                        display: 'flex'
                    }}>
                        {getLoanIcon(loan.loanType)}
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                            {loan.name[lang] || loan.name.en}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {loan.loanType}
                        </Typography>
                    </Box>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {loan.description[lang] || loan.description.en}
                </Typography>

                <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('loan.interest_rate_title')}</Typography>
                        <Typography variant="subtitle1" fontWeight="700" color="primary.main">
                            {loan.interestRate.min}% - {loan.interestRate.max}%
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('loan.max_amount')}</Typography>
                        <Typography variant="subtitle1" fontWeight="700">
                            ₹{(loan.loanAmount.max / 100000).toFixed(1)}L
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ mb: 2, opacity: 0.6 }} />

                <Stack spacing={1} sx={{ mb: 3 }}>
                    {(loan.features[lang] || loan.features.en || []).slice(0, 2).map((feature, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Check size={14} color="#4caf50" />
                            <Typography variant="caption" fontWeight="500">{feature}</Typography>
                        </Box>
                    ))}
                </Stack>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => onCheckEligibility(loan._id)}
                    sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 700 }}
                >
                    {t('loan.eligibility_check') || 'Check Eligibility'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default LoanProductCard;
