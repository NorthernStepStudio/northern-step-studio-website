import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    useWindowDimensions,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';

// Import Hero Images
import heroPc1 from '../../../assets/images/hero_pc.png';
import heroPc2 from '../../../assets/images/hero_pc_2.png';
import heroPc3 from '../../../assets/images/gaming_rig.png';

const isWeb = Platform.OS === 'web';

// Wrapper that uses Animated.View on web, plain View on native (no animation overhead)
const AnimatedWrapper = isWeb ? Animated.View : View;

// Floating animation component for badges - ONLY animated on web
function FloatingBadge({ children, delay = 0, style }) {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Skip animation loops on native for performance
        if (!isWeb) return;

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -15,
                    duration: 2000,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    // On native, just render static view
    if (!isWeb) {
        return <View style={style}>{children}</View>;
    }

    return (
        <Animated.View style={[style, { transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
}

import { useTranslation } from '../../core/i18n';

export default function HomeHero({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    // Animations - only create on web
    const fadeAnim = useRef(new Animated.Value(isWeb ? 0 : 1)).current;
    const slideAnim = useRef(new Animated.Value(isWeb ? 20 : 0)).current;

    // Epic title animations - skip on native
    const taglineAnim = useRef(new Animated.Value(isWeb ? 0 : 1)).current;
    const titleAnim = useRef(new Animated.Value(isWeb ? 0 : 1)).current;
    const accentAnim = useRef(new Animated.Value(isWeb ? 0 : 1)).current;
    const glowPulse = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Button hover animations - skip on native
    const primaryBtnAnim = useRef(new Animated.Value(0)).current;
    const secondaryBtnAnim = useRef(new Animated.Value(0)).current;
    const [primaryHovered, setPrimaryHovered] = useState(false);
    const [secondaryHovered, setSecondaryHovered] = useState(false);

    useEffect(() => {
        // Skip all animations on native
        if (!isWeb) return;

        // Staggered entrance animation
        Animated.stagger(200, [
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            ]),
            Animated.spring(taglineAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.spring(titleAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
            Animated.spring(accentAnim, { toValue: 1, tension: 30, friction: 8, useNativeDriver: true }),
        ]).start();

        // Continuous pulsing glow effect - WEB ONLY
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, { toValue: 1, duration: 2000, useNativeDriver: false }),
                Animated.timing(glowPulse, { toValue: 0, duration: 2000, useNativeDriver: false }),
            ])
        ).start();

        // Continuous shimmer effect - WEB ONLY
        Animated.loop(
            Animated.timing(shimmerAnim, { toValue: 1, duration: 3000, useNativeDriver: false })
        ).start();
    }, []);

    // Interpolations for epic effects - static values on native
    const taglineScale = isWeb ? taglineAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) : 1;
    const taglineTranslateX = isWeb ? taglineAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) : 0;
    const titleScale = isWeb ? titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) : 1;
    const titleTranslateY = isWeb ? titleAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) : 0;
    const accentScale = isWeb ? accentAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) : 1;
    const accentTranslateY = isWeb ? accentAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) : 0;

    // Pulsing glow intensity - static on native
    const glowIntensity = isWeb ? glowPulse.interpolate({ inputRange: [0, 1], outputRange: [20, 40] }) : 30;
    const glowOpacity = isWeb ? glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) : 0.8;

    // Hover handlers - no-op on native
    const handlePrimaryHoverIn = () => {
        if (!isWeb) return;
        setPrimaryHovered(true);
        Animated.spring(primaryBtnAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }).start();
    };
    const handlePrimaryHoverOut = () => {
        if (!isWeb) return;
        setPrimaryHovered(false);
        Animated.spring(primaryBtnAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 10 }).start();
    };
    const handleSecondaryHoverIn = () => {
        if (!isWeb) return;
        setSecondaryHovered(true);
        Animated.spring(secondaryBtnAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }).start();
    };
    const handleSecondaryHoverOut = () => {
        if (!isWeb) return;
        setSecondaryHovered(false);
        Animated.spring(secondaryBtnAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 10 }).start();
    };

    const primaryTranslateY = isWeb ? primaryBtnAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) : 0;
    const primaryScale = isWeb ? primaryBtnAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) : 1;
    const secondaryTranslateY = isWeb ? secondaryBtnAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) : 0;
    const secondaryScale = isWeb ? secondaryBtnAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) : 1;

    // Hero Image Slideshow
    const heroImages = [heroPc1, heroPc2, heroPc3];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Slower slideshow on native to reduce re-renders
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, isWeb ? 3000 : 5000);
        return () => clearInterval(interval);
    }, []);

    // Determine if we're on a large desktop
    const isLargeDesktop = width >= 1200;

    return (
        <View style={[styles.hero, {
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            padding: isMobile ? 20 : 30,
            minHeight: isMobile ? 'auto' : 550,
            paddingTop: isMobile ? 30 : 50,
            gap: isMobile ? 30 : 10, // Reduce gap on desktop for tighter layout
        }]}>
            <AnimatedWrapper
                style={[
                    styles.heroLeft,
                    {
                        minWidth: isMobile ? '100%' : 400,
                        alignItems: isMobile ? 'center' : 'flex-start',
                    },
                    isWeb && {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }
                ]}
            >
                {/* ✨ CLEAN HERO TITLE ✨ */}
                <View style={[styles.heroTitleContainer, { alignItems: isMobile ? 'center' : 'flex-start' }]}>

                    {/* Main Title - Build Your */}
                    <View>
                        <Text style={{
                            color: theme.colors.textPrimary,
                            fontSize: isMobile ? 44 : 68,
                            fontWeight: '700',
                            textAlign: isMobile ? 'center' : 'left',
                        }}>
                            {t('home.hero.title_start')}
                        </Text>
                    </View>

                    {/* Dream PC - Simple bold accent text */}
                    <View>
                        <Text style={{
                            fontSize: isMobile ? 44 : 68,
                            fontWeight: '900',
                            color: theme.colors.accentPrimary,
                            textAlign: isMobile ? 'center' : 'left',
                            letterSpacing: -1,
                        }}>
                            {t('home.hero.title_end')}
                        </Text>
                    </View>

                    {/* Badge - THE ULTIMATE PC BUILDER */}
                    <View style={{
                        marginTop: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.colors.bgSecondary,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: theme.colors.accentPrimary + '40',
                    }}>
                        <Text style={{ fontSize: isMobile ? 14 : 16, marginRight: 6 }}>🚀</Text>
                        <Text style={{
                            color: theme.colors.accentPrimary,
                            fontSize: isMobile ? 11 : 13,
                            fontWeight: '700',
                            letterSpacing: 1,
                        }}>
                            {t('home.hero.badge').toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary, textAlign: isMobile ? 'center' : 'left' }]}>
                    {t('home.hero.subtitle')}
                </Text>

                <View style={styles.heroButtons}>
                    <Pressable
                        onPress={() => navigation.navigate('BuilderTab')}
                        onHoverIn={handlePrimaryHoverIn}
                        onHoverOut={handlePrimaryHoverOut}
                        onPressIn={handlePrimaryHoverIn}
                        onPressOut={handlePrimaryHoverOut}
                    >
                        <Animated.View style={[
                            styles.btnPrimary,
                            primaryHovered && styles.btnPrimaryHovered,
                            { transform: [{ translateY: primaryTranslateY }, { scale: primaryScale }] }
                        ]}>
                            <LinearGradient
                                colors={[theme.colors.accentPrimary, theme.colors.accentSecondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.btnPrimaryText}>{t('home.hero.cta_primary')}</Text>
                                <Ionicons name="rocket" size={18} color="#FFFFFF" />
                            </LinearGradient>
                        </Animated.View>
                    </Pressable>
                </View>
            </AnimatedWrapper>

            {/* Hero Right - PC Tower with Floating Badges */}
            <View style={[styles.heroRight, {
                width: isMobile ? '100%' : (isLargeDesktop ? 600 : 500),
                marginTop: isMobile ? 20 : 0,
                marginLeft: isMobile ? 0 : -20, // Pull PC closer to text on desktop
            }]}>
                {/* PC Tower Image Slideshow */}
                <View style={[styles.pcTowerContainer, {
                    width: isMobile ? 280 : (isLargeDesktop ? 550 : 480),
                    height: isMobile ? 280 : (isLargeDesktop ? 550 : 480)
                }]}>
                    {/* Subtle glow behind PC */}
                    <View style={[styles.pcGlow, {
                        backgroundColor: theme.colors.accentPrimary,
                        shadowColor: theme.colors.accentPrimary,
                    }]} />

                    <Image
                        source={heroImages[currentImageIndex]}
                        style={{ width: '100%', height: '100%', zIndex: 2 }}
                        resizeMode="contain"
                    />
                </View>

                {/* Floating Badges - Always visible with responsive positioning */}
                <>
                    <FloatingBadge delay={0} style={[styles.floatingBadge, isMobile ? styles.badgeTopLeftMobile : styles.badgeTopLeft]}>
                        <View style={[styles.badge, isMobile && styles.badgeMobile, {
                            backgroundColor: theme.colors.bgSecondary,
                            borderWidth: 2,
                            borderColor: theme.colors.accentPrimary + '80',
                        }]}>
                            <Ionicons name="pricetag-outline" size={isMobile ? 14 : 18} color={theme.colors.accentPrimary} />
                            <Text style={[styles.badgeTitle, isMobile && styles.badgeTitleMobile, { color: theme.colors.textPrimary }]}>{t('home.hero.badge_1_title')}</Text>
                            <Text style={[styles.badgeSubtitle, { color: theme.colors.accentPrimary, fontSize: isMobile ? 10 : 12, fontWeight: '700' }]}>{t('home.hero.badge_1_subtitle')}</Text>
                        </View>
                    </FloatingBadge>

                    <FloatingBadge delay={500} style={[styles.floatingBadge, isMobile ? styles.badgeTopRightMobile : styles.badgeTopRight]}>
                        <View style={[styles.badge, isMobile && styles.badgeMobile, {
                            backgroundColor: theme.colors.bgSecondary,
                            borderWidth: 2,
                            borderColor: theme.colors.success + '80',
                        }]}>
                            <Ionicons name="checkmark-circle-outline" size={isMobile ? 14 : 18} color={theme.colors.success} />
                            <Text style={[styles.badgeTitle, isMobile && styles.badgeTitleMobile, { color: theme.colors.textPrimary }]}>{t('home.hero.badge_2_title')}</Text>
                            <Text style={[styles.badgeSubtitle, { color: theme.colors.success, fontSize: isMobile ? 10 : 12, fontWeight: '700' }]}>{t('home.hero.badge_2_subtitle')}</Text>
                        </View>
                    </FloatingBadge>

                    <FloatingBadge delay={1000} style={[styles.floatingBadge, isMobile ? styles.badgeBottomLeftMobile : styles.badgeBottomLeft]}>
                        <View style={[styles.badge, isMobile && styles.badgeMobile, {
                            backgroundColor: theme.colors.bgSecondary,
                            borderWidth: 2,
                            borderColor: theme.colors.warning + '80',
                        }]}>
                            <Ionicons name="sparkles-outline" size={isMobile ? 14 : 18} color={theme.colors.warning} />
                            <Text style={[styles.badgeTitle, isMobile && styles.badgeTitleMobile, { color: theme.colors.textPrimary }]}>{t('home.hero.badge_3_title')}</Text>
                            <Text style={[styles.badgeSubtitle, { color: theme.colors.warning, fontSize: isMobile ? 10 : 12, fontWeight: '700' }]}>{t('home.hero.badge_3_subtitle')}</Text>
                        </View>
                    </FloatingBadge>

                    <FloatingBadge delay={1500} style={[styles.floatingBadge, isMobile ? styles.badgeBottomRightMobile : styles.badgeBottomRight]}>
                        <View style={[styles.badge, isMobile && styles.badgeMobile, {
                            backgroundColor: theme.colors.bgSecondary,
                            borderWidth: 2,
                            borderColor: theme.colors.info + '80',
                        }]}>
                            <Ionicons name="trending-up-outline" size={isMobile ? 14 : 18} color={theme.colors.info} />
                            <Text style={[styles.badgeTitle, isMobile && styles.badgeTitleMobile, { color: theme.colors.textPrimary }]}>{t('home.hero.badge_4_title')}</Text>
                            <Text style={[styles.badgeSubtitle, { color: theme.colors.info, fontSize: isMobile ? 10 : 12, fontWeight: '700' }]}>{t('home.hero.badge_4_subtitle')}</Text>
                        </View>
                    </FloatingBadge>
                </>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        // Layout handled inline
        gap: 30,
        position: 'relative',
    },
    heroLeft: {
        flex: 1,
        justifyContent: 'center',
    },
    heroTitleContainer: {
        marginBottom: 15,
    },
    heroTitleSmall: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    heroTitle: {
        fontSize: 56,
        fontWeight: '800',
        lineHeight: 62,
        letterSpacing: -1,
    },
    heroTitleAccent: {
        fontSize: 64,
        fontWeight: '900',
        lineHeight: 85,
        letterSpacing: -2,
    },
    heroTitleAccentGlow: {
        fontWeight: '900',
        letterSpacing: -2,
    },
    taglineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    taglineGradient: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    lightningEmoji: {
        textShadowColor: '#FFD700',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    heroSubtitle: {
        fontSize: 17,
        lineHeight: 26,
        marginBottom: 28,
        maxWidth: 500,
        opacity: 0.9,
    },
    heroButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    btnPrimary: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    btnPrimaryHovered: {
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.9,
        shadowRadius: 28,
        elevation: 16,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 8,
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    btnSecondary: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    btnSecondaryHovered: {
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
    },
    btnSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
    },
    heroRight: {
        width: 500,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pcTowerContainer: {
        width: 480,
        height: 480,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    pcGlow: {
        position: 'absolute',
        width: '60%',
        height: '60%',
        borderRadius: 200,
        opacity: 0.3,
        zIndex: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 80,
        elevation: 20,
    },
    floatingBadge: {
        position: 'absolute',
        zIndex: 50,
        elevation: 50,
    },
    badgeTopLeft: {
        top: 20,
        left: -20,
    },
    badgeTopRight: {
        top: 20,
        right: -20,
    },
    badgeBottomLeft: {
        bottom: 80,
        left: -20,
    },
    badgeBottomRight: {
        bottom: 80,
        right: -20,
    },
    badge: {
        padding: 10,
        alignItems: 'center',
        borderRadius: 12,
        gap: 4,
        width: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    badgeTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    badgeSubtitle: {
        fontSize: 9,
        fontWeight: '500',
        opacity: 0.85,
        textAlign: 'center',
    },
    // Mobile-specific badge styles
    badgeMobile: {
        padding: 6,
        width: 115,
        borderRadius: 12,
        gap: 2,
    },
    badgeTitleMobile: {
        fontSize: 9,
    },
    // Mobile badge positions - tighter around PC
    badgeTopLeftMobile: {
        top: 10,
        left: 0,
    },
    badgeTopRightMobile: {
        top: 10,
        right: 0,
    },
    badgeBottomLeftMobile: {
        bottom: 10,
        left: 0,
    },
    badgeBottomRightMobile: {
        bottom: 10,
        right: 0,
    },
    glowEffect: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 24,
        opacity: 0.8,
        zIndex: 1,
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 3,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    }
});
