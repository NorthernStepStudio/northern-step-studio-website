import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
    Animated,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../core/i18n';

const isWeb = Platform.OS === 'web';

// Step card - animated on web, static on native
function AnimatedStepCard({ step, theme, width: cardWidth }) {
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

    const scale = isWeb ? animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.03],
    }) : 1;

    const translateY = isWeb ? animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
    }) : 0;

    const CardOuter = isWeb ? Animated.View : View;

    return (
        <View style={[styles.stepCardWrapper, { width: cardWidth }]}>
            <CardOuter
                style={[
                    styles.stepCardOuter,
                    isWeb ? {
                        transform: [{ scale }, { translateY }],
                        borderColor: hovered ? step.color : step.color + '40',
                        shadowColor: hovered ? step.color : '#000',
                        shadowOpacity: hovered ? 0.4 : 0.15,
                        shadowRadius: hovered ? 16 : 6,
                    } : {
                        borderColor: step.color + '40',
                    },
                ]}
            >
                <GlassCard style={[styles.stepCard, { backgroundColor: theme.colors.glassBg }]}>
                    <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                        <Text style={styles.stepNumberText}>{step.number}</Text>
                    </View>
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: step.color + '20',
                                borderColor: isWeb && hovered ? step.color : 'transparent',
                                borderWidth: 2,
                            },
                        ]}
                    >
                        <Ionicons name={step.icon} size={32} color={step.color} />
                    </View>
                    <View style={styles.stepContent}>
                        <Text
                            style={[
                                styles.stepTitle,
                                { color: isWeb && hovered ? step.color : theme.colors.textPrimary },
                            ]}
                        >
                            {step.title}
                        </Text>
                        <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                            {step.description}
                        </Text>
                    </View>
                </GlassCard>
            </CardOuter>
        </View>
    );
}

export default function HomeHowItWorks() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();

    const steps = [
        {
            number: '1',
            title: t('home.howItWorks.step1_title'),
            description: t('home.howItWorks.step1_desc'),
            icon: 'grid',
            color: theme.colors.info,
        },
        {
            number: '2',
            title: t('home.howItWorks.step2_title'),
            description: t('home.howItWorks.step2_desc'),
            icon: 'shield-checkmark',
            color: theme.colors.success,
        },
        {
            number: '3',
            title: t('home.howItWorks.step3_title'),
            description: t('home.howItWorks.step3_desc'),
            icon: 'speedometer',
            color: theme.colors.accentPrimary,
        },
        {
            number: '4',
            title: t('home.howItWorks.step4_title'),
            description: t('home.howItWorks.step4_desc'),
            icon: 'trending-down',
            color: theme.colors.warning,
        },
    ];

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name="rocket" size={24} color={theme.colors.accentPrimary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    {t('home.howItWorks.title')}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                    {t('home.howItWorks.subtitle')}
                </Text>
            </View>

            {/* 2x2 Grid Layout */}
            <View style={styles.gridContainer}>
                {steps.map((step, index) => (
                    <AnimatedStepCard
                        key={index}
                        step={step}
                        theme={theme}
                        width={width >= 768 ? '47%' : '47%'}
                    />
                ))}
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
    stepsContainer: {
        gap: 16,
        paddingRight: 30,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    stepCardWrapper: {
        // Width handled inline
    },
    stepCardOuter: {
        borderRadius: 22,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        height: 260, // Enforce fixed height on the container
        overflow: 'hidden', // Prevent text overflow on Android
    },
    stepCard: {
        flex: 1, // Fill the outer container
        flexDirection: 'column',
        padding: 20,
        borderRadius: 20,
        gap: 16,
        justifyContent: 'space-between',
    },
    stepNumber: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 10,
    },
    stepNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    stepContent: {
        flex: 1,
        gap: 6,
        overflow: 'hidden', // Prevent text overflow
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    stepDescription: {
        fontSize: 12,
        lineHeight: 18,
        opacity: 0.9,
    },
});
