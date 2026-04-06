import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeCompanyLinks() {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const companyLinks = [
        { id: 'about', label: 'About Us', icon: 'information-circle' },
        { id: 'contact', label: 'Contact', icon: 'mail' },
        { id: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark' },
        { id: 'terms', label: 'Terms of Service', icon: 'document-text' },
    ];

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    Company
                </Text>
            </View>

            <View style={styles.linksContainer}>
                {companyLinks.map((link) => (
                    <TouchableOpacity
                        key={link.id}
                        style={[styles.linkItem, {
                            backgroundColor: theme.colors.glassBg,
                            borderColor: theme.colors.glassBorder,
                        }]}
                        onPress={() => {
                            // Map link IDs to LegalScreen tab identifiers
                            const tabMap = {
                                'about': 'terms',       // About Us → Terms section
                                'privacy': 'privacy',   // Privacy Policy
                                'terms': 'terms',       // Terms of Service
                                'contact': 'affiliate', // Contact → Affiliate (closest match)
                            };
                            const tabId = tabMap[link.id] || 'terms';
                            navigation.navigate('Legal', { initialTab: tabId });
                        }}
                    >
                        <Ionicons name={link.icon} size={16} color={theme.colors.accentSecondary} />
                        <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>
                            {link.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        padding: 20,
        paddingTop: 5,
    },
    sectionHeader: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    linksContainer: {
        gap: 8,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    linkText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
});
