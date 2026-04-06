import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme, sharedTheme } from '../theme/themes';
import { useTranslation } from '../core/i18n';
import { APP_VERSION } from '../core/appInfo';

// Static theme for StyleSheet
const staticTheme = { ...darkTheme, ...sharedTheme };

export default function HelpSupportScreen({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [expandedFAQ, setExpandedFAQ] = React.useState(null);
    const currentYear = String(new Date().getFullYear());

    const faqItems = [
        {
            question: t('helpSupport.faq.startBuilding.question'),
            answer: t('helpSupport.faq.startBuilding.answer'),
            icon: 'construct',
        },
        {
            question: t('helpSupport.faq.compatibility.question'),
            answer: t('helpSupport.faq.compatibility.answer'),
            icon: 'checkmark-circle',
        },
        {
            question: t('helpSupport.faq.saveBuilds.question'),
            answer: t('helpSupport.faq.saveBuilds.answer'),
            icon: 'bookmark',
        },
        {
            question: t('helpSupport.faq.prices.question'),
            answer: t('helpSupport.faq.prices.answer'),
            icon: 'pricetag',
        },
        {
            question: t('helpSupport.faq.chooseParts.question'),
            answer: t('helpSupport.faq.chooseParts.answer'),
            icon: 'chatbubbles',
        },
        {
            question: t('helpSupport.faq.commission.question'),
            answer: t('helpSupport.faq.commission.answer'),
            icon: 'cash',
        },
    ];

    const supportOptions = [
        {
            title: t('helpSupport.support.email.title'),
            description: t('helpSupport.support.email.description'),
            icon: 'mail',
            action: () => Linking.openURL('mailto:support@northernstepstudio.com?subject=NexusBuild%20Support%20Request'),
            color: '#4ECDC4',
        },
        {
            title: t('helpSupport.support.bug.title'),
            description: t('helpSupport.support.bug.description'),
            icon: 'bug',
            action: null, // Will use navigation
            color: '#FF6B6B',
        },
    ];

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <Layout scrollable={false}>
            {/* Simple Header like Legal */}
            <View style={[styles.simpleHeader, { borderBottomColor: theme.colors.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitleText, { color: theme.colors.textPrimary }]}>{t('helpSupport.headerTitle')}</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <LinearGradient
                        colors={[theme.colors.accentPrimary + '30', 'transparent']}
                        style={styles.headerGlow}
                    />
                    <Ionicons name="help-buoy" size={60} color={theme.colors.accentPrimary} />
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                        {t('helpSupport.title')}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        {t('helpSupport.subtitle')}
                    </Text>
                </View>

                {/* Quick Support Options */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    {t('helpSupport.sections.contact')}
                </Text>
                <View style={styles.supportGrid}>
                    {supportOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.supportCard, { backgroundColor: theme.colors.glassBg, borderColor: theme.colors.glassBorder }]}
                            onPress={option.action || (() => navigation.navigate('Contact', { initialSubject: option.title }))}
                        >
                            <View style={[styles.supportIconContainer, { backgroundColor: option.color + '20' }]}>
                                <Ionicons name={option.icon} size={24} color={option.color} />
                            </View>
                            <Text style={[styles.supportTitle, { color: theme.colors.textPrimary }]}>
                                {option.title}
                            </Text>
                            <Text style={[styles.supportDesc, { color: theme.colors.textMuted }]}>
                                {option.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    {t('helpSupport.sections.faq')}
                </Text>
                <GlassCard style={styles.faqCard}>
                    {faqItems.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                style={styles.faqItem}
                                onPress={() => toggleFAQ(index)}
                            >
                                <View style={styles.faqQuestion}>
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={theme.colors.accentPrimary}
                                    />
                                    <Text style={[styles.faqQuestionText, { color: theme.colors.textPrimary }]}>
                                        {item.question}
                                    </Text>
                                </View>
                                <Ionicons
                                    name={expandedFAQ === index ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={theme.colors.textMuted}
                                />
                            </TouchableOpacity>
                            {expandedFAQ === index && (
                                <View style={[styles.faqAnswer, { backgroundColor: theme.colors.bgTertiary }]}>
                                    <Text style={[styles.faqAnswerText, { color: theme.colors.textSecondary }]}>
                                        {item.answer}
                                    </Text>
                                </View>
                            )}
                            {index < faqItems.length - 1 && (
                                <View style={[styles.faqDivider, { backgroundColor: theme.colors.glassBorder }]} />
                            )}
                        </View>
                    ))}
                </GlassCard>

                {/* Helpful Links */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    {t('helpSupport.sections.links')}
                </Text>
                <GlassCard style={styles.linksCard}>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => navigation.navigate('BuildGuide')}
                    >
                        <View style={styles.linkLeft}>
                            <Ionicons name="book" size={22} color={theme.colors.accentPrimary} />
                            <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>
                                {t('helpSupport.links.buildGuide')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.linkDivider, { backgroundColor: theme.colors.glassBorder }]} />

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => navigation.navigate('AssemblyGuide')}
                    >
                        <View style={styles.linkLeft}>
                            <Ionicons name="hardware-chip" size={22} color={theme.colors.success} />
                            <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>
                                {t('helpSupport.links.assembly')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.linkDivider, { backgroundColor: theme.colors.glassBorder }]} />

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => navigation.navigate('About')}
                    >
                        <View style={styles.linkLeft}>
                            <Ionicons name="information-circle" size={22} color={theme.colors.warning} />
                            <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>
                                {t('helpSupport.links.about')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.linkDivider, { backgroundColor: theme.colors.glassBorder }]} />

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => navigation.navigate('Legal')}
                    >
                        <View style={styles.linkLeft}>
                            <Ionicons name="document-text" size={22} color={theme.colors.textSecondary} />
                            <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>
                                {t('helpSupport.links.legal')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </GlassCard>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appVersion, { color: theme.colors.textMuted }]}>
                        {t('helpSupport.appVersion', { version: APP_VERSION })}
                    </Text>
                    <Text style={[styles.appCopyright, { color: theme.colors.textMuted }]}>
                        {t('helpSupport.copyright', { year: currentYear })}
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    simpleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    headerTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        padding: 4,
    },
    container: {
        padding: 16,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 20,
    },
    headerGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: -50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 8,
    },
    supportGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    supportCard: {
        width: '48%',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    supportIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    supportTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    supportDesc: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
    },
    faqCard: {
        marginBottom: 24,
    },
    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    faqQuestionText: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    faqAnswer: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 14,
        borderRadius: 10,
    },
    faqAnswerText: {
        fontSize: 14,
        lineHeight: 20,
    },
    faqDivider: {
        height: 1,
        marginHorizontal: 16,
    },
    linksCard: {
        marginBottom: 24,
    },
    linkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    linkLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '500',
    },
    linkDivider: {
        height: 1,
        marginHorizontal: 16,
    },
    appInfo: {
        alignItems: 'center',
        paddingTop: 16,
    },
    appVersion: {
        fontSize: 13,
    },
    appCopyright: {
        fontSize: 12,
        marginTop: 4,
    },
});
