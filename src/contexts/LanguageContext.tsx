
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { i18n, t } = useTranslation();

    const [language, setLanguageState] = useState<string>(() => {
        return localStorage.getItem('language') || i18n.language || 'en';
    });

    const setLanguage = (lang: string) => {
        i18n.changeLanguage(lang).then(() => {
            setLanguageState(lang);
        localStorage.setItem('language', lang);
        }).catch((err) => {
            console.error("Failed to change language:", err);
        });
    };

    useEffect(() => {
        if (i18n.language !== language) {
        i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
