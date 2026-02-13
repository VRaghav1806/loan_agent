import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language || 'en');

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setLanguage(lang);
        localStorage.setItem('preferredLanguage', lang);
    };

    useEffect(() => {
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) {
            changeLanguage(savedLang);
        }
    }, []);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
