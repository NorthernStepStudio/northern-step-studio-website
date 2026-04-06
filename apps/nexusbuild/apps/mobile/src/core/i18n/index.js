/**
 * 🌍 Language Context & i18n Hook
 * 
 * Provides language state and translation function across the app.
 * Usage:
 *   const { t, language, setLanguage, languages } = useTranslation();
 *   <Text>{t('home.title')}</Text>
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS, LANGUAGES, DEFAULT_LANGUAGE } from './translations';

const LANGUAGE_STORAGE_KEY = '@nexusbuild_language';

// Context
const LanguageContext = createContext(null);

/**
 * Get nested value from object using dot notation
 * e.g., get(obj, 'home.hero.title') -> obj.home.hero.title
 */
const getNestedValue = (obj, path, fallback = null) => {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined || typeof result !== 'object') {
            return fallback;
        }
        result = result[key];
    }

    return result !== undefined ? result : fallback;
};

/**
 * Language Provider Component
 */
export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved language on mount
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (savedLanguage && TRANSLATIONS[savedLanguage]) {
                    setLanguageState(savedLanguage);
                }
            } catch (error) {
                console.warn('Failed to load language setting:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadLanguage();
    }, []);

    // Save language when changed
    const setLanguage = useCallback(async (newLanguage) => {
        if (!TRANSLATIONS[newLanguage]) {
            console.warn(`Language '${newLanguage}' not supported`);
            return;
        }

        setLanguageState(newLanguage);

        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
        } catch (error) {
            console.warn('Failed to save language setting:', error);
        }
    }, []);

    /**
     * Translation function
     * @param key - Dot notation key (e.g., 'home.hero.title')
     * @param params - Optional replacements (e.g., { count: 5 })
     */
    const t = useCallback((key, params = {}) => {
        // Get translation for current language
        let text = getNestedValue(TRANSLATIONS[language], key);

        // Fallback to English if not found
        if (text === null || text === undefined) {
            text = getNestedValue(TRANSLATIONS[DEFAULT_LANGUAGE], key);
        }

        // Still not found - return key
        if (text === null || text === undefined) {
            console.warn(`Translation not found: ${key}`);
            return key;
        }

        // If it's an object (nested translations), return it
        if (typeof text === 'object') {
            return text;
        }

        // Replace params like {name}, {count}, etc.
        if (params && Object.keys(params).length > 0) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
            });
        }

        return text;
    }, [language]);

    const value = {
        language,
        setLanguage,
        t,
        languages: LANGUAGES,
        isLoading,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * Hook to use translations
 */
export const useTranslation = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        // Return a fallback for components outside provider
        console.warn('useTranslation used outside LanguageProvider');
        return {
            language: DEFAULT_LANGUAGE,
            setLanguage: () => { },
            t: (key) => getNestedValue(TRANSLATIONS[DEFAULT_LANGUAGE], key) || key,
            languages: LANGUAGES,
            isLoading: false,
        };
    }

    return context;
};

/**
 * Get current language info
 */
export const useLanguageInfo = () => {
    const { language } = useTranslation();
    return LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
};

export default {
    LanguageProvider,
    useTranslation,
    useLanguageInfo,
    LANGUAGES,
};
