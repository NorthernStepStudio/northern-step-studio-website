import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../core/i18n';

export default function LegalScreen({ navigation, route }) {
    const { theme: appTheme, isDark } = useTheme();
    const { t } = useTranslation();
    const initialTab = route.params?.initialTab || 'terms';
    const [activeTab, setActiveTab] = useState(initialTab); // 'terms' | 'privacy' | 'cookies'

    const renderTerms = () => (
        <View>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.terms.acceptance.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.terms.acceptance.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.terms.useLicense.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.terms.useLicense.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.terms.compatibility.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.terms.compatibility.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.terms.liability.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.terms.liability.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.terms.accuracy.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.terms.accuracy.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.terms.links.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.terms.links.body')}</Text>
        </View>
    );

    const renderPrivacy = () => (
        <View>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.privacy.policy.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.privacy.policy.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.privacy.collect.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.privacy.collect.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.privacy.retention.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.privacy.retention.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.privacy.sharing.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.privacy.sharing.body')}</Text>
        </View>
    );

    const renderCookies = () => (
        <View>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.cookies.what.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.cookies.what.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.cookies.use.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.cookies.use.body')}</Text>
        </View>
    );

    const renderAffiliate = () => (
        <View>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.affiliate.disclosure.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.affiliate.disclosure.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.affiliate.how.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.affiliate.how.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.affiliate.impartiality.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.affiliate.impartiality.body')}</Text>
        </View>
    );

    const renderConduct = () => (
        <View>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.conduct.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary, fontStyle: 'italic', marginBottom: 20 }]}>{t('legal.conduct.updated')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.conduct.respect.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.conduct.respect.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.conduct.safe.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.conduct.safe.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.conduct.spam.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.conduct.spam.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.conduct.honesty.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.conduct.honesty.body')}</Text>

            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.conduct.consequences.title')}</Text>
            <Text style={[styles.text, { color: appTheme.colors.textSecondary }]}>{t('legal.conduct.consequences.body')}</Text>
        </View>
    );

    return (
        <Layout scrollable={false} showChatButton={false}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: appTheme.colors.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={appTheme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: appTheme.colors.textPrimary }]}>{t('legal.headerTitle')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'terms' && { borderBottomColor: appTheme.colors.accentPrimary }]}
                    onPress={() => setActiveTab('terms')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'terms' ? appTheme.colors.accentPrimary : appTheme.colors.textMuted }
                    ]}>{t('legal.tabs.terms')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'privacy' && { borderBottomColor: appTheme.colors.accentPrimary }]}
                    onPress={() => setActiveTab('privacy')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'privacy' ? appTheme.colors.accentPrimary : appTheme.colors.textMuted }
                    ]}>{t('legal.tabs.privacy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'cookies' && { borderBottomColor: appTheme.colors.accentPrimary }]}
                    onPress={() => setActiveTab('cookies')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'cookies' ? appTheme.colors.accentPrimary : appTheme.colors.textMuted }
                    ]}>{t('legal.tabs.cookies')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'affiliate' && { borderBottomColor: appTheme.colors.accentPrimary }]}
                    onPress={() => setActiveTab('affiliate')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'affiliate' ? appTheme.colors.accentPrimary : appTheme.colors.textMuted }
                    ]}>{t('legal.tabs.affiliate')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'conduct' && { borderBottomColor: appTheme.colors.accentPrimary }]}
                    onPress={() => setActiveTab('conduct')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'conduct' ? appTheme.colors.accentPrimary : appTheme.colors.textMuted }
                    ]}>{t('legal.tabs.conduct')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <GlassCard style={styles.contentCard}>
                    {activeTab === 'terms' && renderTerms()}
                    {activeTab === 'privacy' && renderPrivacy()}
                    {activeTab === 'cookies' && renderCookies()}
                    {activeTab === 'affiliate' && renderAffiliate()}
                    {activeTab === 'conduct' && renderConduct()}

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: appTheme.colors.textMuted }]}>
                            {t('legal.footer.updated')}
                        </Text>
                        <Text style={[styles.footerText, { color: appTheme.colors.textMuted }]}>
                            {t('legal.footer.contact')}
                        </Text>
                    </View>
                </GlassCard>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    contentCard: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 10,
    },
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    footerText: {
        fontSize: 12,
        marginBottom: 5,
        fontStyle: 'italic',
    }
});
