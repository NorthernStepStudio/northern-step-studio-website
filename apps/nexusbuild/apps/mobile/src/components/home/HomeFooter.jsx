import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Linking,
    Alert,
    Animated,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BugReportModal from '../BugReportModal';
import { useTheme } from '../../contexts/ThemeContext';

const isWeb = Platform.OS === 'web';

// Link component - animated on web, static on native
function AnimatedLink({ icon, label, iconColor, onPress, theme }) {
    const [hovered, setHovered] = useState(false);
    const anim = useRef(new Animated.Value(0)).current;

    const handleHoverIn = () => {
        setHovered(true);
        if (isWeb) {
            Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 10 }).start();
        }
    };
    const handleHoverOut = () => {
        setHovered(false);
        if (isWeb) {
            Animated.spring(anim, { toValue: 0, useNativeDriver: true, tension: 150, friction: 10 }).start();
        }
    };

    // Static values on native, animated on web
    const translateX = isWeb ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) : 0;
    const scale = isWeb ? anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) : 1;

    const Wrapper = isWeb ? Animated.View : View;

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            onPressIn={handleHoverIn}
            onPressOut={handleHoverOut}
        >
            <Wrapper style={[
                styles.linkItem,
                isWeb ? { transform: [{ translateX }, { scale }] } : null
            ]}>
                <Ionicons name={icon} size={14} color={isWeb && hovered ? theme.colors.accentPrimary : iconColor} />
                <Text style={[styles.linkText, { color: isWeb && hovered ? theme.colors.accentPrimary : theme.colors.textSecondary }]}>
                    {label}
                </Text>
            </Wrapper>
        </Pressable>
    );
}

import { useTranslation } from '../../core/i18n';

export default function HomeFooter({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isMobile = width < 600;
    const isTablet = width >= 600 && width < 900;
    const [bugReportOpen, setBugReportOpen] = useState(false);

    const openLink = (url) => {
        Linking.openURL(url).catch(() => {
            Alert.alert(t('common.errorTitle'), t('common.linkOpenError', { url }));
        });
    };

    // Determine grid columns based on screen size
    const getSectionStyle = () => {
        if (isMobile) return { width: '45%', minWidth: 130 }; // Reduced width & min-width to fit 2 columns
        if (isTablet) return { width: '30%', minWidth: 150 };
        return { minWidth: 120 };
    };

    return (
        <View style={styles.footer}>
            {/* Sections Container - Responsive grid */}
            <View style={[styles.sectionsContainer, isMobile && styles.sectionsContainerMobile]}>

                {/* Product Section */}
                <View style={[styles.section, getSectionStyle()]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        {t('footer.product')}
                    </Text>
                    <AnimatedLink
                        icon="build"
                        label={t('nav.builder')}
                        iconColor={theme.colors.accentPrimary}
                        onPress={() => navigation.navigate('BuilderTab', { screen: 'BuilderMain' })}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="search"
                        label={t('footer.links.searchParts')}
                        iconColor={theme.colors.accentPrimary}
                        onPress={() => navigation.navigate('PartSelection')}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="people"
                        label={t('footer.links.community')}
                        iconColor={theme.colors.accentPrimary}
                        onPress={() => navigation.navigate('Community')}
                        theme={theme}
                    />
                </View>

                {/* Company Section */}
                <View style={[styles.section, getSectionStyle()]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        {t('footer.company')}
                    </Text>
                    <AnimatedLink
                        icon="information-circle"
                        label={t('footer.links.about')}
                        iconColor={theme.colors.accentSecondary}
                        onPress={() => navigation.navigate('About')}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="shield-checkmark"
                        label={t('footer.links.privacy')}
                        iconColor={theme.colors.accentSecondary}
                        onPress={() => navigation.navigate('Legal', { initialTab: 'privacy' })}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="document-text"
                        label={t('footer.links.terms')}
                        iconColor={theme.colors.accentSecondary}
                        onPress={() => navigation.navigate('Legal', { initialTab: 'terms' })}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="cash-outline"
                        label={t('footer.links.affiliateDisclosure')}
                        iconColor={theme.colors.accentSecondary}
                        onPress={() => navigation.navigate('Legal', { initialTab: 'affiliate' })}
                        theme={theme}
                    />
                </View>

                {/* Connect Section */}
                <View style={[styles.section, getSectionStyle()]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        {t('footer.connect')}
                    </Text>
                    <AnimatedLink
                        icon="logo-twitter"
                        label={t('footer.links.twitter')}
                        iconColor={theme.colors.textMuted}
                        onPress={() => openLink('https://x.com')}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="logo-youtube"
                        label={t('footer.links.youtube')}
                        iconColor={theme.colors.textMuted}
                        onPress={() => openLink('https://youtube.com')}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="logo-github"
                        label={t('footer.links.github')}
                        iconColor={theme.colors.textMuted}
                        onPress={() => openLink('https://github.com')}
                        theme={theme}
                    />
                </View>

                {/* Support Section - Last */}
                <View style={[styles.section, getSectionStyle()]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        {t('footer.support')}
                    </Text>
                    <AnimatedLink
                        icon="book"
                        label={t('footer.links.guide')}
                        iconColor={theme.colors.warning}
                        onPress={() => navigation.navigate('BuildGuide')}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="mail"
                        label={t('footer.links.contact')}
                        iconColor={theme.colors.warning}
                        onPress={() => navigation.navigate('Contact')}
                        theme={theme}
                    />
                    <AnimatedLink
                        icon="chatbubble-ellipses"
                        label={t('footer.links.feedback')}
                        iconColor={theme.colors.warning}
                        onPress={() => navigation.navigate('Contact')}
                        theme={theme}
                    />
                    {/* Bug Report Link */}
                    <Pressable
                        onPress={() => setBugReportOpen(true)}
                        style={({ pressed, hovered }) => [
                            styles.bugReportLink,
                            {
                                backgroundColor: hovered ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                opacity: pressed ? 0.7 : 1,
                            }
                        ]}
                    >
                        <Ionicons name="bug-outline" size={16} color="#EF4444" />
                        <Text style={styles.bugReportText}>{t('footer.links.bug')}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Copyright */}
            <Text style={[styles.copyright, { color: theme.colors.textMuted }]}>
                {t('footer.copyright')}
            </Text>
            <Text style={[styles.copyrightSub, { color: theme.colors.textMuted }]}>
                {t('footer.built_with')}
            </Text>

            {/* Bug Report Modal */}
            <BugReportModal
                visible={bugReportOpen}
                onClose={() => setBugReportOpen(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        marginTop: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    sectionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    sectionsContainerMobile: {
        gap: 12, // Reduced gap to ensure wrapping works for 2 columns
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    section: {
        gap: 10,
        minWidth: 120,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    linkText: {
        fontSize: 13,
        fontWeight: '400',
    },
    bugReportLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginLeft: -10,
    },
    bugReportText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '500',
    },
    socialLinks: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    socialIcon: {
        padding: 5,
    },
    copyright: {
        fontSize: 14,
        opacity: 1,
        textAlign: 'center',
        marginTop: 10,
    },
    copyrightSub: {
        fontSize: 13,
        opacity: 0.9,
        textAlign: 'center',
        marginTop: 4,
    },
});
