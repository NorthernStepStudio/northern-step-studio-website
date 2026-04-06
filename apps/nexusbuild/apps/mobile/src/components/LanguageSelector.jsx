/**
 * 🌍 Language Selector Component
 * 
 * Dropdown or button group for selecting app language.
 * Can be used in settings or as a floating button.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    Pressable
} from 'react-native';
import { useTranslation } from '../core/i18n';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Language Selector Button
 * Shows current language flag/code and opens modal to change
 */
export const LanguageSelector = ({ style }) => {
    const { language, setLanguage, languages, t } = useTranslation();
    const { theme } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    const handleSelect = (langCode) => {
        setLanguage(langCode);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme?.colors?.glassBg || 'rgba(255,255,255,0.1)' }, style]}
                onPress={() => setModalVisible(true)}
                accessibilityLabel="Change language"
            >
                <Text style={styles.flag}>{currentLang.flag}</Text>
                <Text style={[styles.buttonText, { color: theme?.colors?.textPrimary || '#fff' }]}>
                    {currentLang.code.toUpperCase()}
                </Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme?.colors?.bgSecondary || '#1a1a2e' }]}>
                        <Text style={[styles.modalTitle, { color: theme?.colors?.textPrimary || '#fff' }]}>
                            {t('common.language')}
                        </Text>

                        <FlatList
                            data={languages}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.langOption,
                                        item.code === language && styles.langOptionActive,
                                        { borderColor: theme?.colors?.glassBorder || 'rgba(255,255,255,0.1)' }
                                    ]}
                                    onPress={() => handleSelect(item.code)}
                                >
                                    <Text style={styles.langFlag}>{item.flag}</Text>
                                    <View style={styles.langInfo}>
                                        <Text style={[styles.langName, { color: theme?.colors?.textPrimary || '#fff' }]}>
                                            {item.nativeName}
                                        </Text>
                                        <Text style={[styles.langCode, { color: theme?.colors?.textSecondary || '#888' }]}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    {item.code === language && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity
                            style={[styles.closeButton, { backgroundColor: theme?.colors?.accent || '#6366f1' }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

/**
 * Compact Language Toggle (for header)
 */
export const LanguageToggle = ({ style }) => {
    const { language, setLanguage, languages } = useTranslation();
    const { theme } = useTheme();

    const currentIndex = languages.findIndex(l => l.code === language);
    const nextLang = languages[(currentIndex + 1) % languages.length];

    return (
        <TouchableOpacity
            style={[styles.toggle, { backgroundColor: theme?.colors?.glassBg || 'rgba(255,255,255,0.1)' }, style]}
            onPress={() => setLanguage(nextLang.code)}
            accessibilityLabel={`Switch to ${nextLang.name}`}
        >
            <Text style={styles.toggleFlag}>
                {languages.find(l => l.code === language)?.flag}
            </Text>
        </TouchableOpacity>
    );
};

/**
 * Settings Language Row
 */
export const LanguageSettingsRow = () => {
    const { language, languages, t } = useTranslation();
    const { theme } = useTheme();
    const [showSelector, setShowSelector] = useState(false);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: theme?.colors?.glassBorder || 'rgba(255,255,255,0.1)' }]}
            onPress={() => setShowSelector(true)}
        >
            <Text style={[styles.settingsLabel, { color: theme?.colors?.textPrimary || '#fff' }]}>
                🌍 {t('common.language')}
            </Text>
            <View style={styles.settingsValue}>
                <Text style={[styles.settingsValueText, { color: theme?.colors?.textSecondary || '#888' }]}>
                    {currentLang.flag} {currentLang.nativeName}
                </Text>
                <Text style={styles.chevron}>›</Text>
            </View>

            {showSelector && (
                <LanguageModal
                    visible={showSelector}
                    onClose={() => setShowSelector(false)}
                />
            )}
        </TouchableOpacity>
    );
};

/**
 * Standalone Language Modal
 */
const LanguageModal = ({ visible, onClose }) => {
    const { language, setLanguage, languages, t } = useTranslation();
    const { theme } = useTheme();

    const handleSelect = (langCode) => {
        setLanguage(langCode);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={[styles.modalContent, { backgroundColor: theme?.colors?.bgSecondary || '#1a1a2e' }]}>
                    <Text style={[styles.modalTitle, { color: theme?.colors?.textPrimary || '#fff' }]}>
                        {t('common.language')}
                    </Text>

                    {languages.map((item) => (
                        <TouchableOpacity
                            key={item.code}
                            style={[
                                styles.langOption,
                                item.code === language && styles.langOptionActive,
                            ]}
                            onPress={() => handleSelect(item.code)}
                        >
                            <Text style={styles.langFlag}>{item.flag}</Text>
                            <View style={styles.langInfo}>
                                <Text style={[styles.langName, { color: theme?.colors?.textPrimary || '#fff' }]}>
                                    {item.nativeName}
                                </Text>
                                <Text style={[styles.langCode, { color: theme?.colors?.textSecondary || '#888' }]}>
                                    {item.name}
                                </Text>
                            </View>
                            {item.code === language && (
                                <Text style={[styles.checkmark, { color: theme?.colors?.accent || '#6366f1' }]}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: theme?.colors?.accent || '#6366f1' }]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>{t('common.close')}</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // Button styles
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    flag: {
        fontSize: 18,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Toggle styles
    toggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleFlag: {
        fontSize: 22,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 360,
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },

    // Language option styles
    langOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    langOptionActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.5)',
    },
    langFlag: {
        fontSize: 28,
        marginRight: 12,
    },
    langInfo: {
        flex: 1,
    },
    langName: {
        fontSize: 16,
        fontWeight: '600',
    },
    langCode: {
        fontSize: 12,
        marginTop: 2,
    },
    checkmark: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6366f1',
    },

    // Close button
    closeButton: {
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Settings row
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    settingsLabel: {
        fontSize: 16,
    },
    settingsValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsValueText: {
        fontSize: 14,
        marginRight: 8,
    },
    chevron: {
        fontSize: 20,
        color: '#888',
    },
});

export default LanguageSelector;
