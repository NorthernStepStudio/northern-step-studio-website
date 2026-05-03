import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../stores/themeStore';
import { BRAND } from '../config/brand';

export default function LegalFooter() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                    {BRAND.appName} - {new Date().getFullYear()} {t('common.allRightsReserved', 'All Rights Reserved')}
                </Text>
            </View>

            <View style={styles.linksRow}>
                <TouchableOpacity onPress={() => navigation.navigate('Legal', { type: 'privacy' })}>
                    <Text style={[styles.link, { color: colors.primary }]}>
                        {t('settings.privacyPolicy', 'Privacy Policy')}
                    </Text>
                </TouchableOpacity>
                <Text style={[styles.bullet, { color: colors.textSecondary }]}>|</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Legal', { type: 'terms' })}>
                    <Text style={[styles.link, { color: colors.primary }]}>
                        {t('settings.termsOfService', 'Terms of Service')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.companyRow}>
                <Text style={[styles.companyText, { color: colors.textSecondary }]}>
                    Developed by {BRAND.developerName}
                </Text>
            </View>

            <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                {t(
                    'home.legalDisclaimer',
                    'ProvLy is not a licensed insurance provider. Documentation does not guarantee claim approval.'
                )}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topRow: {
        marginBottom: 8,
    },
    text: {
        fontSize: 11,
        fontWeight: '500',
    },
    linksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    link: {
        fontSize: 12,
        fontWeight: '600',
    },
    bullet: {
        marginHorizontal: 8,
        fontSize: 12,
    },
    companyRow: {
        marginBottom: 8,
        opacity: 0.75,
    },
    companyText: {
        fontSize: 11,
        fontWeight: '600',
    },
    disclaimer: {
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 14,
        paddingHorizontal: 20,
    },
});

