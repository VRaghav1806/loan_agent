import React, { useState, useEffect } from 'react';
import {
    Box, Container, Grid, Paper, Typography, MenuItem,
    Select, FormControl, InputLabel, Divider, Stack, Chip, Button
} from '@mui/material';
import { Check, X, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const LoanComparison = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const [loans, setLoans] = useState([]);
    const [loan1, setLoan1] = useState('');
    const [loan2, setLoan2] = useState('');
    const [details1, setDetails1] = useState(null);
    const [details2, setDetails2] = useState(null);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const { data } = await api.get('/loans');
                setLoans(data);
            } catch (err) {
                console.error('Failed to fetch loans');
            }
        };
        fetchLoans();
    }, []);

    const handleLoan1Change = (e) => {
        const id = e.target.value;
        setLoan1(id);
        setDetails1(loans.find(l => l._id === id));
    };

    const handleLoan2Change = (e) => {
        const id = e.target.value;
        setLoan2(id);
        setDetails2(loans.find(l => l._id === id));
    };

    const ComparisonRow = ({ label, value1, value2, isCurrency = false }) => (
        <Box sx={{ py: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 6 }}>
                    <Typography variant="body1" fontWeight={600}>
                        {isCurrency ? `₹${value1?.toLocaleString()}` : value1}
                    </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <Typography variant="body1" fontWeight={600}>
                        {isCurrency ? `₹${value2?.toLocaleString()}` : value2}
                    </Typography>
                </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <ArrowLeftRight size={32} color="#1a237e" />
                <Typography variant="h4" fontWeight={900} sx={{ color: 'primary.main' }}>
                    {t('comparison.title')}
                </Typography>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>{t('comparison.select1')}</InputLabel>
                        <Select value={loan1} label={t('comparison.select1')} onChange={handleLoan1Change} sx={{ borderRadius: 3 }}>
                            {loans.map(l => (
                                <MenuItem key={l._id} value={l._id}>{l.name[lang] || l.name.en}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>{t('comparison.select2')}</InputLabel>
                        <Select value={loan2} label={t('comparison.select2')} onChange={handleLoan2Change} sx={{ borderRadius: 3 }}>
                            {loans.map(l => (
                                <MenuItem key={l._id} value={l._id}>{l.name[lang] || l.name.en}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {(details1 || details2) ? (
                <Paper sx={{ p: 4 }}>
                    <ComparisonRow
                        label={t('comparison.row_rate')}
                        value1={details1 ? `${details1.interestRate.min}% - ${details1.interestRate.max}%` : '-'}
                        value2={details2 ? `${details2.interestRate.min}% - ${details2.interestRate.max}%` : '-'}
                    />
                    <ComparisonRow
                        label={t('comparison.row_amount')}
                        value1={details1 ? `₹${details1.loanAmount.min.toLocaleString()} - ₹${details1.loanAmount.max.toLocaleString()}` : '-'}
                        value2={details2 ? `₹${details2.loanAmount.min.toLocaleString()} - ₹${details2.loanAmount.max.toLocaleString()}` : '-'}
                    />
                    <ComparisonRow
                        label={t('comparison.row_tenure')}
                        value1={details1 ? `${details1.tenure.max} ${t('loan.tenure_unit') || 'Months'}` : '-'}
                        value2={details2 ? `${details2.tenure.max} ${t('loan.tenure_unit') || 'Months'}` : '-'}
                    />
                    <ComparisonRow
                        label={t('comparison.row_score')}
                        value1={details1 ? details1.eligibilityCriteria.minCreditScore : '-'}
                        value2={details2 ? details2.eligibilityCriteria.minCreditScore : '-'}
                    />

                    <Box sx={{ py: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                            {t('comparison.row_docs')}
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 6 }}>
                                <Stack spacing={1}>
                                    {details1?.requiredDocuments.map((doc, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Check size={16} color="green" />
                                            <Typography variant="body2">{doc[lang] || doc.en}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Stack spacing={1}>
                                    {details2?.requiredDocuments.map((doc, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Check size={16} color="green" />
                                            <Typography variant="body2">{doc[lang] || doc.en}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f8fafd', borderRadius: 4, border: '2px dashed #e0e7ff' }}>
                    <Typography color="text.secondary">{t('comparison.empty_msg')}</Typography>
                </Box>
            )}
        </Container>
    );
};

export default LoanComparison;
