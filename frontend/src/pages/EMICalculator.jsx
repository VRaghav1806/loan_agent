import React, { useState, useEffect } from 'react';
import {
    Box, Container, Grid, Paper, TextField, Typography,
    Slider, Stack, Divider, Card, CardContent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const EMICalculator = () => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState(500000);
    const [rate, setRate] = useState(10.5);
    const [tenure, setTenure] = useState(60); // In months

    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);

    useEffect(() => {
        calculateEMI();
    }, [amount, rate, tenure]);

    const calculateEMI = () => {
        const r = rate / 12 / 100;
        const n = tenure;
        const p = amount;

        const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayable = emiValue * n;
        const interest = totalPayable - p;

        setEmi(Math.round(emiValue));
        setTotalPayment(Math.round(totalPayable));
        setTotalInterest(Math.round(interest));
    };

    const data = [
        { name: t('emi.principal_legend') || 'Principal Amount', value: amount, color: '#1a237e' },
        { name: t('emi.total_interest') || 'Total Interest', value: totalInterest, color: '#c2185b' }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
                {t('emi.title')}
            </Typography>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 4, height: '100%' }}>
                        <Stack spacing={4}>
                            <Box>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography fontWeight={600}>{t('emi.loan_amount')}</Typography>
                                    <Typography fontWeight={700} color="primary.main">₹{amount.toLocaleString()}</Typography>
                                </Stack>
                                <Slider
                                    value={amount}
                                    min={50000}
                                    max={10000000}
                                    step={50000}
                                    onChange={(e, v) => setAmount(v)}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Box>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography fontWeight={600}>{t('emi.interest_rate')}</Typography>
                                    <Typography fontWeight={700} color="primary.main">{rate}%</Typography>
                                </Stack>
                                <Slider
                                    value={rate}
                                    min={5}
                                    max={30}
                                    step={0.1}
                                    onChange={(e, v) => setRate(v)}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Box>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography fontWeight={600}>{t('emi.tenure')}</Typography>
                                    <Typography fontWeight={700} color="primary.main">{tenure} {t('loan.tenure_unit') || 'Months'}</Typography>
                                </Stack>
                                <Slider
                                    value={tenure}
                                    min={6}
                                    max={360}
                                    step={6}
                                    onChange={(e, v) => setTenure(v)}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={tenure}
                                    onChange={(e) => setTenure(Number(e.target.value))}
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={3}>
                        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>{t('emi.monthly_emi')}</Typography>
                                <Typography variant="h3" fontWeight={900}>₹{emi.toLocaleString()}</Typography>
                            </CardContent>
                        </Card>

                        <Paper sx={{ p: 4 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography color="text.secondary">{t('emi.principal')}</Typography>
                                    <Typography fontWeight={700}>₹{amount.toLocaleString()}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography color="text.secondary">{t('emi.total_interest')}</Typography>
                                    <Typography fontWeight={700}>₹{totalInterest.toLocaleString()}</Typography>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography color="text.secondary">{t('emi.total_payable')}</Typography>
                                    <Typography fontWeight={800} color="primary.main">₹{totalPayment.toLocaleString()}</Typography>
                                </Stack>

                                <Box sx={{ height: 250, mt: 2 }}>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Stack direction="row" justifyContent="center" spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1a237e' }} />
                                        <Typography variant="caption" fontWeight={600}>{t('emi.principal_legend')}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#c2185b' }} />
                                        <Typography variant="caption" fontWeight={600}>{t('emi.interest_legend')}</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
};

export default EMICalculator;
