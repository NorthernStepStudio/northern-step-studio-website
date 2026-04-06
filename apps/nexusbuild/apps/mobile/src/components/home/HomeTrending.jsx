import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Animated,
    Image,
    useWindowDimensions,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { BuildsService } from '../../services/BuildsService';
import UniversalShareButton from '../shared/UniversalShareButton';

// Import build images
import gamingRigImage from '../../../assets/images/gaming_rig.png';
import budgetPcImage from '../../../assets/images/budget_pc.png';
import workstationImage from '../../../assets/images/workstation.png';

const buildImages = {
    gaming_rig: gamingRigImage,
    budget_pc: budgetPcImage,
    workstation: workstationImage,
};

// Accent colors for each card
const cardColors = ['#FF6B6B', '#4ECDC4', '#8B5CF6'];

function SkeletonCard({ width, height, style }) {
    const { theme } = useTheme();

    // Static skeleton on native - no animations
    if (!isWeb) {
        return (
            <View
                style={[
                    {
                        width,
                        height,
                        backgroundColor: theme.colors.glassBgHover,
                        borderRadius: 12,
                        opacity: 0.5,
                    },
                    style,
                ]}
            />
        );
    }

    // Animated only on web
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    backgroundColor: theme.colors.glassBgHover,
                    borderRadius: 12,
                    opacity,
                },
                style,
            ]}
        />
    );
}

const isWeb = Platform.OS === 'web';

// Build Card - animated on web, static on native for performance
function AnimatedBuildCard({ build, navigation, theme, isMobile, accentColor }) {
    const [hovered, setHovered] = useState(false);
    const animValue = useRef(new Animated.Value(0)).current;

    const handleHoverIn = () => {
        setHovered(true);
        if (isWeb) {
            Animated.spring(animValue, {
                toValue: 1,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    };

    const handleHoverOut = () => {
        setHovered(false);
        if (isWeb) {
            Animated.spring(animValue, {
                toValue: 0,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
            }).start();
        }
    };

    // Only animate on web
    const scale = isWeb ? animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.03],
    }) : 1;

    const translateY = isWeb ? animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -6],
    }) : 0;

    const CardOuter = isWeb ? Animated.View : View;

    return (
        <Pressable
            onPress={() => navigation.navigate('BuilderTab', {
                screen: 'BuilderMain',
                params: { initialBuild: build },
            })}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            onPressIn={handleHoverIn}
            onPressOut={handleHoverOut}
            style={[
                styles.buildCardWrapper,
                !isMobile ? { flex: 1 } : { marginRight: 12, width: 240 },
            ]}
        >
            <CardOuter
                style={[
                    styles.buildCardOuter,
                    isWeb ? {
                        transform: [{ scale }, { translateY }],
                        borderColor: hovered ? accentColor : accentColor + '40',
                        shadowColor: hovered ? accentColor : '#000',
                        shadowOpacity: hovered ? 0.5 : 0.2,
                        shadowRadius: hovered ? 20 : 8,
                    } : {
                        borderColor: accentColor + '40',
                    },
                ]}
            >
                <GlassCard style={[styles.buildCard, { backgroundColor: theme.colors.glassBg }]}>
                    <View style={[styles.buildImage, { backgroundColor: theme.colors.bgSecondary }]}>
                        {build.image && buildImages[build.image] ? (
                            <Image
                                source={buildImages[build.image]}
                                style={styles.buildImageActual}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="desktop-outline" size={48} color={theme.colors.textMuted} />
                        )}
                        <UniversalShareButton
                            type="build"
                            id={build.id}
                            title={`Check out ${build.name}`}
                            message={`Found this awesome build on NexusBuild: ${build.name} by ${build.author}.`}
                            style={styles.shareButton}
                            color="#FFFFFF"
                            size={20}
                        />
                    </View>

                    <View style={styles.buildInfo}>
                        <View style={styles.buildHeader}>
                            <Text
                                style={[
                                    styles.buildName,
                                    { color: isWeb && hovered ? accentColor : theme.colors.textPrimary },
                                ]}
                                numberOfLines={1}
                            >
                                {build.name}
                            </Text>
                            <View
                                style={[
                                    styles.partsCount,
                                    {
                                        backgroundColor: isWeb && hovered ? accentColor + '20' : theme.colors.bgSecondary,
                                        borderColor: isWeb && hovered ? accentColor : 'transparent',
                                        borderWidth: 1,
                                    },
                                ]}
                            >
                                <Text style={[styles.partsCountText, { color: isWeb && hovered ? accentColor : theme.colors.textSecondary }]}>
                                    {typeof build.parts === 'object' ? Object.keys(build.parts).length : build.parts} Parts
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.buildAuthor, { color: theme.colors.textMuted }]}>
                            by {build.author}
                        </Text>

                        {build.specs.length > 0 && (
                            <View style={styles.buildSpecs}>
                                {build.specs.slice(0, 3).map((spec, index) => (
                                    <View key={index} style={styles.specItem}>
                                        <Ionicons name="hardware-chip" size={14} color={accentColor} />
                                        <Text style={[styles.specText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                            {spec}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.priceRow}>
                            <Text style={[styles.buildPrice, { color: theme.colors.success }]}>
                                ${build.price.toLocaleString()}
                            </Text>
                            {isWeb && hovered && (
                                <Ionicons name="arrow-forward-circle" size={22} color={accentColor} />
                            )}
                        </View>
                    </View>
                </GlassCard>
            </CardOuter>
        </Pressable>
    );
}

import { useTranslation } from '../../core/i18n';

export default function HomeTrending({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const getMockBuilds = () => [
        {
            id: 1,
            name: 'Ultimate Gaming Rig',
            author: 'NexusPro_01',
            price: 3450,
            parts: 8,
            image: 'gaming_rig',
            specs: ['Intel Core i9-14900K', 'NVIDIA RTX 4090', '64GB DDR5 RAM'],
        },
        {
            id: 2,
            name: 'Budget Beast 2025',
            author: 'ThriftyGamer',
            price: 850,
            parts: 6,
            image: 'budget_pc',
            specs: ['AMD Ryzen 5 7600', 'Radeon RX 7600', '16GB DDR5 RAM'],
        },
        {
            id: 3,
            name: 'Creator Workstation',
            author: 'VideoEditorX',
            price: 2200,
            parts: 7,
            image: 'workstation',
            specs: ['AMD Ryzen 9 7950X', 'NVIDIA RTX 4070 Ti', '2TB NVMe Gen5'],
        },
    ];

    // Load mock data instantly on ALL platforms
    const [builds, setBuilds] = useState(getMockBuilds());
    const [loading, setLoading] = useState(false); // Never start in loading state

    useEffect(() => {
        // Try API update in background (non-blocking)
        loadBuilds();
    }, []);

    const loadBuilds = async () => {
        try {
            const data = await BuildsService.getTrendingBuilds();
            if (data && data.length > 0) {
                setBuilds(data);
            }
        } catch (error) {
            // Keep mock data, that's fine
        }
    };

    const safeBuilds = Array.isArray(builds) ? builds : [];

    const renderContent = () => {
        if (loading) {
            return [1, 2, 3].map((key) => (
                <GlassCard key={key} style={[styles.buildCard, { backgroundColor: theme.colors.glassBg, height: 320 }]}>
                    <View style={{ padding: 15, gap: 10 }}>
                        <SkeletonCard width="100%" height={150} />
                        <SkeletonCard width="80%" height={24} />
                        <SkeletonCard width="50%" height={16} />
                        <SkeletonCard width="40%" height={24} style={{ marginTop: 10 }} />
                    </View>
                </GlassCard>
            ));
        }

        return safeBuilds.map((build, index) => (
            <AnimatedBuildCard
                key={build.id}
                build={build}
                navigation={navigation}
                theme={theme}
                isMobile={isMobile}
                accentColor={cardColors[index % cardColors.length]}
            />
        ));
    };

    const isAndroid = Platform.OS === 'android';
    const scrollViewRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const cardHeight = 320;
    const cardSpacing = 16;

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / (cardHeight + cardSpacing));
        setActiveIndex(Math.min(Math.max(0, index), safeBuilds.length - 1));
    };

    return (
        <View style={styles.section}>
            <View style={[styles.sectionHeader, { paddingHorizontal: isMobile ? 15 : 30 }]}>
                <View>
                    <Ionicons name="flame" size={28} color={theme.colors.warning} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                        {t('home.trending.title')}
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                        {t('home.trending.subtitle')}
                    </Text>
                </View>
            </View>

            {isMobile ? (
                /* Both iOS and Android: Vertical scroll with wide cards */
                <View style={styles.verticalCarousel}>
                    <ScrollView
                        ref={scrollViewRef}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        pagingEnabled={false}
                        snapToOffsets={safeBuilds.map((_, i) => i * (cardHeight + cardSpacing))}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={styles.verticalScrollContent}
                    >
                        {safeBuilds.map((build, index) => (
                            <View key={build.id} style={{ width: width - 60, height: cardHeight, alignSelf: 'center', marginBottom: cardSpacing }}>
                                <AnimatedBuildCard
                                    build={build}
                                    navigation={navigation}
                                    theme={theme}
                                    isMobile={false}
                                    accentColor={cardColors[index % cardColors.length]}
                                />
                            </View>
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {builds.map((build, index) => (
                            <TouchableOpacity
                                key={build.id}
                                onPress={() => {
                                    scrollViewRef.current?.scrollTo({
                                        y: index * (cardHeight + cardSpacing),
                                        animated: true,
                                    });
                                    setActiveIndex(index);
                                }}
                            >
                                <View
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: activeIndex === index ? theme.colors.warning : theme.colors.textMuted + '40',
                                            width: activeIndex === index ? 12 : 8,
                                            height: activeIndex === index ? 12 : 8,
                                        },
                                    ]}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.buildsGrid}>
                    {renderContent()}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    sectionHeader: {
        marginBottom: 24,
        paddingHorizontal: 30,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        marginTop: 6,
        opacity: 0.8,
    },
    buildsScroll: {
        gap: 20,
    },
    verticalCarousel: {
        flexDirection: 'row',
        height: 400,
        paddingHorizontal: 20,
    },
    pagination: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 12,
        gap: 8,
    },
    dot: {
        borderRadius: 6,
    },
    verticalScrollContent: {
        paddingBottom: 20,
        gap: 16,
    },
    buildsGrid: {
        flexDirection: 'row',
        gap: 20,
        paddingHorizontal: 30,
    },
    buildCardWrapper: {
        // Width handled inline
    },
    buildCardOuter: {
        borderRadius: 22,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    buildCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    buildImage: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
        width: '100%',
    },
    buildImageActual: {
        width: '100%',
        height: '100%',
    },
    shareButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)', // Optional for web, ignored on native
    },
    buildInfo: {
        padding: 12,
    },
    buildHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    buildName: {
        fontSize: 15,
        fontWeight: 'bold',
        flex: 1,
    },
    partsCount: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    partsCountText: {
        fontSize: 12,
        fontWeight: '500',
    },
    buildAuthor: {
        fontSize: 13,
        marginBottom: 12,
    },
    buildSpecs: {
        gap: 6,
        marginBottom: 12,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    specText: {
        fontSize: 13,
        flex: 1,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buildPrice: {
        fontSize: 17,
        fontWeight: 'bold',
    },
});
