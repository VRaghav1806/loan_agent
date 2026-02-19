import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Typography, Box, Paper, Button, Stack, Card, CardContent, Chip,
    Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, IconButton, Tooltip, Divider, Modal, TextField
} from '@mui/material';
import {
    Users, TrendingUp, CheckCircle, Clock, Plus, ExternalLink,
    MessageSquare, BadgeCheck, Trash2, FileText, AlertCircle, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AgentDashboard = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [submittingLead, setSubmittingLead] = useState(false);
    const [submittingLoan, setSubmittingLoan] = useState(false);
    const [leadData, setLeadData] = useState({
        borrowerId: '',
        loanId: '',
        requestedAmount: '',
        requestedTenure: 12,
        purpose: 'Business Expansion'
    });
    const [newLoanData, setNewLoanData] = useState({
        loanType: 'personal',
        name: { en: '', hi: '', ta: '' },
        description: { en: '', hi: '', ta: '' },
        interestRate: { min: 8, max: 12 },
        loanAmount: { min: 10000, max: 1000000 },
        tenure: { min: 12, max: 60 },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 65,
            minIncome: 15000,
            minCreditScore: 650
        }
    });

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                const [dashRes, loansRes] = await Promise.all([
                    api.get('/agents/dashboard'),
                    api.get('/loans')
                ]);
                setData(dashRes.data);
                setLoans(loansRes.data);
            } catch (err) {
                console.error('Failed to fetch agent dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchAgentData();
    }, []);

    useEffect(() => {
        const handleAddLeadEvent = () => setShowLeadModal(true);
        window.addEventListener('add-lead', handleAddLeadEvent);
        return () => window.removeEventListener('add-lead', handleAddLeadEvent);
    }, []);

    const handleDeleteLead = async (leadId) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;

        try {
            await api.delete(`/applications/${leadId}`);
            alert('Lead deleted successfully');
            // Refresh dashboard data
            const dashRes = await api.get('/agents/dashboard');
            setData(dashRes.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete lead');
        }
    };

    const handleAddLoan = async (e) => {
        e.preventDefault();
        setSubmittingLoan(true);
        try {
            await api.post('/loans', newLoanData);
            alert('Loan product added successfully!');
            setShowLoanModal(false);
            // Refresh loans list
            const { data: loansList } = await api.get('/loans');
            setLoans(loansList);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add loan product');
        } finally {
            setSubmittingLoan(false);
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this application?`)) return;
        setActionLoading(true);
        try {
            await api.put(`/applications/${appId}/status`, { status });
            alert(`Application ${status} successfully`);
            setShowReviewModal(false);
            // Refresh dashboard
            const dashRes = await api.get('/agents/dashboard');
            setData(dashRes.data);
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${status} application`);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'submitted': 'info',
            'approved': 'success',
            'rejected': 'error',
            'under-review': 'warning',
            'disbursed': 'secondary'
        };
        return colors[status] || 'default';
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Skeleton variant="text" width={300} height={60} sx={{ mb: 4 }} />
                <Grid container spacing={3}>
                    {[1, 2, 3].map(i => (
                        <Grid size={{ xs: 12, md: 4 }} key={i}>
                            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            {/* Stats Cards */}
            <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: 6 }}>
                {[
                    { label: t('agent.total_leads'), value: data?.stats?.totalLeads, icon: <Users size={32} />, color: '#3949ab' },
                    { label: t('agent.accepted_loans'), value: data?.stats?.approvedLeads, icon: <CheckCircle size={32} />, color: '#43a047' },
                    { label: t('agent.conversion_rate'), value: `${data?.stats?.totalLeads ? Math.round((data.stats.approvedLeads / data.stats.totalLeads) * 100) : 0}%`, icon: <TrendingUp size={32} />, color: '#fb8c00' }
                ].map((stat, i) => (
                    <Grid size={{ xs: 12, md: 4 }} key={i}>
                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #edf2f7', bgcolor: 'white' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{
                                        p: 1.5, borderRadius: 3, bgcolor: `${stat.color}15`, color: stat.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {stat.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" fontWeight="600">{stat.label}</Typography>
                                        <Typography variant="h4" fontWeight="800" sx={{ color: '#2d3748' }}>{stat.value}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Leads Table */}
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="700">
                    {t('agent.recent_leads')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setShowLoanModal(true)}
                    sx={{ borderRadius: 2 }}
                >
                    {t('agent.add_loan_btn')}
                </Button>
            </Stack>
            {/* Desktop View: Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #edf2f7', overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>{t('agent.table_borrower')}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>{t('agent.table_loan_type')}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>{t('agent.table_amount')}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>{t('agent.table_status')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>{t('agent.table_actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.leads?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">{t('agent.no_leads')}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.leads?.map((lead) => (
                                <TableRow key={lead._id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                                {lead.user?.name ? lead.user.name[0] : '?'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">{lead.user?.name || 'Unknown'}</Typography>
                                                <Typography variant="caption" color="text.secondary">{lead.user?.phone || 'N/A'}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{lead.loan?.name?.[lang] || lead.loan?.name?.en || 'Personal Loan'}</TableCell>
                                    <TableCell>₹{lead.requestedAmount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={t(`dashboard.status_${lead.status.replace('-', '_')}`) || lead.status.replace('-', ' ').toUpperCase()}
                                            size="small"
                                            color={getStatusColor(lead.status)}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedApplication(lead);
                                                        setShowReviewModal(true);
                                                    }}
                                                >
                                                    <ExternalLink size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Lead">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteLead(lead._id)}
                                                >
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Mobile View: Cards */}
            <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
                {data?.leads?.length === 0 ? (
                    <Paper sx={{ py: 6, px: 3, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                        <Typography color="text.secondary">{t('agent.no_leads')}</Typography>
                    </Paper>
                ) : (
                    data?.leads?.map((lead) => (
                        <Card key={lead._id} elevation={0} sx={{ borderRadius: 4, border: '1px solid #edf2f7', bgcolor: 'white' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar sx={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                                            {lead.user?.name ? lead.user.name[0] : '?'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="700">{lead.user?.name || 'Unknown'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{lead.user?.phone || 'N/A'}</Typography>
                                        </Box>
                                    </Stack>
                                    <Chip
                                        label={t(`dashboard.status_${lead.status.replace('-', '_')}`) || lead.status.replace('-', ' ').toUpperCase()}
                                        size="small"
                                        color={getStatusColor(lead.status)}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {t('agent.table_loan_type')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="600">
                                        {lead.loan?.name?.[lang] || lead.loan?.name?.en || 'Personal Loan'}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {t('agent.table_amount')}
                                    </Typography>
                                    <Typography variant="h6" fontWeight="800" color="primary.main">
                                        ₹{lead.requestedAmount.toLocaleString()}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<ExternalLink size={16} />}
                                        onClick={() => {
                                            setSelectedApplication(lead);
                                            setShowReviewModal(true);
                                        }}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Review
                                    </Button>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteLead(lead._id)}
                                        sx={{ bgcolor: 'rgba(211, 47, 47, 0.05)', borderRadius: 2, p: 1 }}
                                    >
                                        <Trash2 size={20} />
                                    </IconButton>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Stack>

            {/* Add Loan Modal */}
            <Modal
                open={showLoanModal}
                onClose={() => setShowLoanModal(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Paper sx={{ width: '100%', maxWidth: 600, p: 4, borderRadius: 4, maxHeight: '90vh', overflowY: 'auto' }}>
                    <Typography variant="h5" fontWeight="800" gutterBottom color="primary">
                        {t('agent.add_loan_title')}
                    </Typography>

                    <form onSubmit={handleAddLoan}>
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <TextField
                                select
                                label={t('agent.add_loan_type')}
                                required
                                fullWidth
                                SelectProps={{ native: true }}
                                value={newLoanData.loanType}
                                onChange={(e) => setNewLoanData({ ...newLoanData, loanType: e.target.value })}
                            >
                                {['personal', 'home', 'education', 'business', 'vehicle', 'gold', 'lap', 'agricultural', 'mortgage'].map(type => (
                                    <option key={type} value={type}>{t(`loan.type_${type}`) || type.toUpperCase()}</option>
                                ))}
                            </TextField>

                            <TextField
                                label={t('agent.add_loan_name_en')}
                                required
                                fullWidth
                                value={newLoanData.name.en}
                                onChange={(e) => setNewLoanData({ ...newLoanData, name: { ...newLoanData.name, en: e.target.value, hi: e.target.value, ta: e.target.value } })}
                                helperText={t('agent.add_loan_helper')}
                            />

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label={t('agent.add_loan_name_hi')}
                                    fullWidth
                                    value={newLoanData.name.hi}
                                    onChange={(e) => setNewLoanData({ ...newLoanData, name: { ...newLoanData.name, hi: e.target.value } })}
                                />
                                <TextField
                                    label={t('agent.add_loan_name_ta')}
                                    fullWidth
                                    value={newLoanData.name.ta}
                                    onChange={(e) => setNewLoanData({ ...newLoanData, name: { ...newLoanData.name, ta: e.target.value } })}
                                />
                            </Stack>

                            <TextField
                                label={t('agent.add_loan_desc_en')}
                                required
                                multiline
                                rows={2}
                                fullWidth
                                value={newLoanData.description.en}
                                onChange={(e) => setNewLoanData({ ...newLoanData, description: { ...newLoanData.description, en: e.target.value, hi: e.target.value, ta: e.target.value } })}
                            />

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label={t('agent.add_loan_desc_hi')}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={newLoanData.description.hi}
                                    onChange={(e) => setNewLoanData({ ...newLoanData, description: { ...newLoanData.description, hi: e.target.value } })}
                                />
                                <TextField
                                    label={t('agent.add_loan_desc_ta')}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={newLoanData.description.ta}
                                    onChange={(e) => setNewLoanData({ ...newLoanData, description: { ...newLoanData.description, ta: e.target.value } })}
                                />
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label={t('agent.add_loan_min_int')} type="number" required fullWidth value={newLoanData.interestRate.min} onChange={(e) => setNewLoanData({ ...newLoanData, interestRate: { ...newLoanData.interestRate, min: e.target.value } })} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label={t('agent.add_loan_max_int')} type="number" required fullWidth value={newLoanData.interestRate.max} onChange={(e) => setNewLoanData({ ...newLoanData, interestRate: { ...newLoanData.interestRate, max: e.target.value } })} />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label={t('agent.add_loan_min_amt')} type="number" required fullWidth value={newLoanData.loanAmount.min} onChange={(e) => setNewLoanData({ ...newLoanData, loanAmount: { ...newLoanData.loanAmount, min: e.target.value } })} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField label={t('agent.add_loan_max_amt')} type="number" required fullWidth value={newLoanData.loanAmount.max} onChange={(e) => setNewLoanData({ ...newLoanData, loanAmount: { ...newLoanData.loanAmount, max: e.target.value } })} />
                                </Grid>
                            </Grid>

                            <TextField
                                label={t('agent.add_loan_min_income')}
                                type="number"
                                required
                                fullWidth
                                value={newLoanData.eligibilityCriteria.minIncome}
                                onChange={(e) => setNewLoanData({ ...newLoanData, eligibilityCriteria: { ...newLoanData.eligibilityCriteria, minIncome: e.target.value } })}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={submittingLoan}
                                sx={{ py: 1.5, mt: 2 }}
                            >
                                {submittingLoan ? t('common.processing') : t('agent.add_loan_btn')}
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Modal>
            {/* Review Application Modal */}
            <Modal
                open={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Paper sx={{ width: '100%', maxWidth: 700, p: 4, borderRadius: 4, maxHeight: '90vh', overflowY: 'auto' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h5" fontWeight="800" color="primary">
                            Review Loan Application
                        </Typography>
                        <Chip
                            label={selectedApplication?.status?.toUpperCase()}
                            color={getStatusColor(selectedApplication?.status)}
                            size="small"
                        />
                    </Stack>

                    {selectedApplication && (
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Borrower Information</Typography>
                                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" fontWeight="600">{selectedApplication.user?.name}</Typography>
                                    <Typography variant="body2">{selectedApplication.user?.email}</Typography>
                                    <Typography variant="body2">{selectedApplication.user?.phone}</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant="body2">Age: {selectedApplication.borrowerAge}</Typography>
                                    <Typography variant="body2">Monthly Income: ₹{selectedApplication.monthlyIncome?.toLocaleString()}</Typography>
                                    <Typography variant="body2">Credit Score: {selectedApplication.creditScore}</Typography>
                                    {selectedApplication.aadharNumber && (
                                        <>
                                            <Divider sx={{ my: 1.5 }} />
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body2" fontWeight="600">Aadhar: {selectedApplication.aadharNumber}</Typography>
                                                {selectedApplication.aadharVerification?.status === 'matched' && (
                                                    <Chip icon={<BadgeCheck size={14} />} label="Matched" color="success" size="small" />
                                                )}
                                                {selectedApplication.aadharVerification?.status === 'mismatch' && (
                                                    <Chip icon={<AlertCircle size={14} />} label="Mismatch" color="error" size="small" />
                                                )}
                                                {selectedApplication.aadharVerification?.status === 'pending' && (
                                                    <Chip icon={<RefreshCw size={14} className="animate-spin" />} label="Verifying..." color="warning" size="small" />
                                                )}
                                                {selectedApplication.aadharVerification?.status === 'error' && (
                                                    <Tooltip title={selectedApplication.aadharVerification?.errorMessage || 'Verification failed'}>
                                                        <Chip icon={<AlertCircle size={14} />} label="Error" color="default" size="small" />
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Loan Details</Typography>
                                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Typography variant="body2" fontWeight="600">{selectedApplication.loan?.name?.[lang] || selectedApplication.loan?.name?.en}</Typography>
                                    <Typography variant="body2">Amount: ₹{selectedApplication.requestedAmount?.toLocaleString()}</Typography>
                                    <Typography variant="body2">Tenure: {selectedApplication.requestedTenure} months</Typography>
                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>Purpose: {selectedApplication.purpose}</Typography>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Uploaded Documents</Typography>
                                <Stack direction="row" spacing={2}>
                                    {selectedApplication.documents?.length > 0 ? (
                                        selectedApplication.documents.map((doc, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<FileText size={16} />}
                                                onClick={() => window.open(doc.filePath?.startsWith('http') ? doc.filePath : `${api.defaults.baseURL}/${doc.filePath}`, '_blank')}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                {doc.documentType?.toUpperCase()}
                                            </Button>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">No documents uploaded</Typography>
                                    )}
                                </Stack>
                            </Grid>

                            {(selectedApplication.status === 'submitted' || selectedApplication.status === 'under-review') && (
                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            disabled={actionLoading}
                                            onClick={() => handleUpdateStatus(selectedApplication._id, 'rejected')}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            disabled={actionLoading}
                                            onClick={() => handleUpdateStatus(selectedApplication._id, 'approved')}
                                        >
                                            {actionLoading ? 'Processing...' : 'Approve Loan'}
                                        </Button>
                                    </Stack>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Paper>
            </Modal>
        </Container>
    );
};

export default AgentDashboard;
