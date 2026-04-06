import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { AutoTranslate } from './AutoTranslate';

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetPosition?: { top: number; left: number; width: number; height: number };
    arrowDirection?: 'up' | 'down' | 'left' | 'right' | 'none';
    action?: 'tap' | 'swipe' | 'scroll' | 'type';
    highlightStyle?: 'circle' | 'rectangle';
}

interface TutorialOverlayProps {
    visible: boolean;
    steps: TutorialStep[];
    currentStep: number;
    onNext: () => void;
    onSkip: () => void;
    onComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function TutorialOverlay({
    visible,
    steps,
    currentStep,
    onNext,
    onSkip,
    onComplete
}: TutorialOverlayProps) {
    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const progress = (currentStep + 1) / steps.length;

    const spotlightScale = useSharedValue(0);
    const cardOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            spotlightScale.value = 0;
            spotlightScale.value = withSpring(1, { damping: 15 });
            cardOpacity.value = 0;
            cardOpacity.value = withTiming(1, { duration: 300 });
        }
    }, [visible, currentStep]);

    const spotlightStyle = useAnimatedStyle(() => ({
        transform: [{ scale: spotlightScale.value }],
        opacity: spotlightScale.value
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ translateY: (1 - cardOpacity.value) * 20 }]
    }));

    if (!visible || !step) return null;

    const hasSpotlight = step.targetPosition;

    const getArrowIcon = () => {
        switch (step.arrowDirection) {
            case 'up': return 'arrow-up';
            case 'down': return 'arrow-down';
            case 'left': return 'arrow-left';
            case 'right': return 'arrow-right';
            default: return null;
        }
    };

    const getActionIcon = () => {
        switch (step.action) {
            case 'tap': return 'gesture-tap';
            case 'swipe': return 'gesture-swipe-horizontal';
            case 'scroll': return 'gesture-swipe-vertical';
            case 'type': return 'keyboard-outline';
            default: return 'gesture-tap';
        }
    };

    return (
        <AutoTranslate>
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Dark overlay with spotlight cutout */}
                <View style={styles.darkMask} pointerEvents="none" />

                {/* Spotlight highlight */}
                {hasSpotlight && step.targetPosition && (
                    <Animated.View
                        style={[
                            styles.spotlight,
                            spotlightStyle,
                            {
                                top: step.targetPosition.top - 8,
                                left: step.targetPosition.left - 8,
                                width: step.targetPosition.width + 16,
                                height: step.targetPosition.height + 16,
                                borderRadius: step.highlightStyle === 'circle'
                                    ? (step.targetPosition.width + 16) / 2
                                    : 16
                            }
                        ]}
                    />
                )}

                {/* Arrow pointing to target */}
                {hasSpotlight && step.arrowDirection && step.arrowDirection !== 'none' && (
                    <Animated.View
                        style={[
                            styles.arrowContainer,
                            spotlightStyle,
                            step.arrowDirection === 'up' && {
                                top: (step.targetPosition?.top || 0) - 50,
                                left: (step.targetPosition?.left || 0) + (step.targetPosition?.width || 0) / 2 - 20
                            },
                            step.arrowDirection === 'down' && {
                                top: (step.targetPosition?.top || 0) + (step.targetPosition?.height || 0) + 10,
                                left: (step.targetPosition?.left || 0) + (step.targetPosition?.width || 0) / 2 - 20
                            }
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={getArrowIcon() as any}
                            size={40}
                            color={theme.colors.accent}
                        />
                    </Animated.View>
                )}

                {/* Tutorial Card */}
                <Animated.View style={[styles.card, cardStyle]}>
                    {/* Progress Bar */}
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>

                    {/* Step Counter */}
                    <Text style={styles.stepCounter}>
                        Step {currentStep + 1} of {steps.length}
                    </Text>

                    {/* Action Icon */}
                    <View style={styles.actionIconContainer}>
                        <MaterialCommunityIcons
                            name={getActionIcon() as any}
                            size={32}
                            color={theme.colors.accent}
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{step.title}</Text>

                    {/* Description */}
                    <Text style={styles.description}>{step.description}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <Pressable onPress={onSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>Skip Tutorial</Text>
                        </Pressable>

                        <Pressable
                            onPress={isLastStep ? onComplete : onNext}
                            style={({ pressed }) => [
                                styles.nextButton,
                                { opacity: pressed ? 0.8 : 1 }
                            ]}
                        >
                            <Text style={styles.nextText}>
                                {isLastStep ? "Got It!" : "Next"}
                            </Text>
                            {!isLastStep && (
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={20}
                                    color={theme.colors.bg}
                                />
                            )}
                        </Pressable>
                    </View>
                </Animated.View>

                {/* Tap to continue hint */}
                {hasSpotlight && (
                    <View style={styles.hintContainer}>
                        <View style={styles.hintBadge}>
                            <MaterialCommunityIcons
                                name={getActionIcon() as any}
                                size={16}
                                color={theme.colors.bg}
                            />
                            <Text style={styles.hintText}>
                                {step.action === 'tap' && 'Tap here to continue'}
                                {step.action === 'swipe' && 'Swipe to continue'}
                                {step.action === 'scroll' && 'Scroll to continue'}
                                {step.action === 'type' && 'Type to continue'}
                                {!step.action && 'Tap Next below'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
        </AutoTranslate>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        position: 'relative',
    },
    darkMask: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    spotlight: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: theme.colors.accent,
        backgroundColor: 'transparent',
    },
    arrowContainer: {
        position: 'absolute',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 2,
        borderColor: theme.colors.accent + '40',
    },
    progressBar: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.accent,
        borderRadius: 2,
    },
    stepCounter: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    actionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 8,
    },
    description: {
        color: theme.colors.muted,
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '600',
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    skipText: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: '600',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accent,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 4,
    },
    nextText: {
        color: theme.colors.bg,
        fontSize: 16,
        fontWeight: '900',
    },
    hintContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accent,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
    },
    hintText: {
        color: theme.colors.bg,
        fontSize: 13,
        fontWeight: '700',
    },
});
