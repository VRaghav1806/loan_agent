import React from 'react';
import { Select, MenuItem, Box, FormControl, InputLabel } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Globe size={18} />
            <FormControl size="small" variant="standard" sx={{ minWidth: 100 }}>
                <Select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    disableUnderline
                    sx={{ fontWeight: 600 }}
                >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">हिन्दी</MenuItem>
                    <MenuItem value="ta">தமிழ்</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default LanguageSwitcher;
