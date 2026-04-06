import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Platform,
    useWindowDimensions,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../core/i18n';

const isWeb = Platform.OS === 'web';

// Feature card for vertical swipe
function FeatureCard({ feature, theme, onPress }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={() => isWeb && setHovered(true)}
            onHoverOut={() => isWeb && setHovered(false)}
            style={styles.verticalCardWrapper}
        >
            <View
                style={[
                    styles.verticalCardOuter,
                    {
                        backgroundColor: theme.colors.glassBg,
                        borderColor: hovered ? feature.color : feature.color + '40',
                        shadowColor: feature.color,
                        shadowOpacity: hovered ? 0.4 : 0.2,
                    },
                ]}
            >
                <GlassCard style={[styles.verticalCard, { backgroundColor: theme.colors.glassBg }]}>
                    <View style={[styles.verticalIconContainer, { backgroundColor: feature.color + '20' }]}>
                        <Ionicons name={feature.icon} size={40} color={feature.color} />
                    </View>
                    <View style={styles.verticalCardContent}>
                        <Text style={[styles.verticalCardTitle, { color: hovered ? feature.color : theme.colors.textPrimary }]}>
                            {feature.title}
                        </Text>
                        <Text style={[styles.verticalCardDescription, { color: theme.colors.textSecondary }]}>
                            {feature.description}
                        </Text>
                    </View>
                    <View style={[styles.arrowContainer, { backgroundColor: feature.color + '20' }]}>
                        <Ionicons name="arrow-forward" size={20} color={feature.color} />
                    </View>
                </GlassCard>
            </View>
        </Pressable>
    );
}

export default function HomeWhySection({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const scrollViewRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const features = [
        {
            icon: 'search',
            title: t('home.powerfulTools.partsDatabase'),
            description: t('home.powerfulTools.partsDatabaseDesc'),
            color: theme.colors.accentPrimary,
            screen: 'PartSelection',
        },
        {
            icon: 'speedometer',
            title: t('home.powerfulTools.benchmarks'),
            description: t('home.powerfulTools.benchmarksDesc'),
            color: theme.colors.warning,
            screen: 'Benchmarks',
        },
        {
            icon: 'shield-checkmark',
            title: t('home.powerfulTools.compatibility'),
            description: t('home.powerfulTools.compatibilityDesc'),
            color: theme.colors.success,
            screen: 'BuilderTab',
        },
        {
            icon: 'construct',
            title: t('home.powerfulTools.assemblyGuides'),
            description: t('home.powerfulTools.assemblyGuidesDesc'),
            color: '#E91E63',
            screen: 'AssemblyGuide',
        },
        {
            icon: 'book',
            title: t('home.powerfulTools.buildGuide'),
            description: t('home.powerfulTools.buildGuideDesc'),
            color: '#9C27B0',
            screen: 'BuildGuide',
        },
    ];

    const handleFeaturePress = (feature) => {
        if (feature.screen === 'BuilderTab') {
            navigation?.navigate('BuilderTab', { screen: 'BuilderMain' });
        } else {
            navigation?.navigate(feature.screen);
        }
    };

    const cardHeight = 120;
    const cardSpacing = 12;

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / (cardHeight + cardSpacing));
        setActiveIndex(Math.min(Math.max(0, index), features.length - 1));
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={24} color={theme.colors.accentPrimary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    {t('home.powerfulTools.title')}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                    {t('home.powerfulTools.subtitle')}
                </Text>
            </View>

            {/* Both iOS and Android: Vertical scroll */}
            <View style={styles.carouselContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    pagingEnabled={false}
                    snapToOffsets={features.map((_, i) => i * (cardHeight + cardSpacing))}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.scrollContent}
                >
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            feature={feature}
                            theme={theme}
                            onPress={() => handleFeaturePress(feature)}
                        />
                    ))}
                </ScrollView>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {features.slice(0, 4).map((feature, index) => (
                        <TouchableOpacity
                            key={index}
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
                                        backgroundColor: activeIndex === index ? theme.colors.accentPrimary : theme.colors.textMuted + '40',
                                        width: activeIndex === index ? 12 : 8,
                                        height: activeIndex === index ? 12 : 8,
                                    },
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        padding: 30,
        paddingTop: 20,
    },
    sectionHeader: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 8,
    },
    sectionSubtitle: {
        fontSize: 15,
        marginTop: 6,
        opacity: 0.8,
    },
    carouselContainer: {
        flexDirection: 'row',
        height: 400,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    verticalCardWrapper: {
        marginBottom: 12,
    },
    verticalCardOuter: {
        borderRadius: 16,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    verticalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 16,
    },
    verticalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verticalCardContent: {
        flex: 1,
    },
    verticalCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    verticalCardDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    arrowContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pagination: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 16,
        gap: 8,
    },
    horizontalScrollContent: {
        paddingLeft: 30,
        paddingRight: 30,
        paddingVertical: 10,
    },
    paginationHorizontal: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
    },
    dot: {
        borderRadius: 6,
    },
});
