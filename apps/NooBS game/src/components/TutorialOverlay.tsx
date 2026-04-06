
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TutorialStep = {
    title: string;
    description: string;
    icon: string;
    highlight?: 'STATS' | 'CHART' | 'HOLDINGS' | 'NONE';
};

const STEPS: TutorialStep[] = [
    {
        title: "WELCOME OPERATIVE",
        description: "You have been admitted to the Market Residency. This is a high-fidelity psychological simulation designed to forge institutional-grade discipline.",
        icon: "brain",
        highlight: 'NONE'
    },
    {
        title: "THE OBJECTIVE",
        description: "Your goal is to reach your 'Freedom Number'. You begin with liquid cash equal to 6-8 months of savings from your chosen job, and monthly income is settled as the simulation advances.",
        icon: "target",
        highlight: 'CHART'
    },
    {
        title: "PSYCHOMETRIC METRICS",
        description: "Watch your stats: PATIENCE, DISCIPLINE, and CONVICTION. They go up slowly when you stay calm, but drop fast when you panic.",
        icon: "barcode-scan",
        highlight: 'STATS'
    },
    {
        title: "COMMAND PROTOCOLS",
        description: "You have signed a BINDING CONTRACT. Breaking these rules will trigger the Guilt Engine, causing severe psychometric degradation.",
        icon: "file-certificate",
        highlight: 'NONE'
    },
    {
        title: "MARKET REALITY",
        description: "The market will test you. Decisions like 'SELL' during a crash will offer temporary relief but long-term failure. Stay the course.",
        icon: "chart-bell-curve-cumulative",
        highlight: 'NONE'
    }
];

type TutorialOverlayProps = {
    visible: boolean;
    onComplete: () => void;
};

export function TutorialOverlay({ visible, onComplete }: TutorialOverlayProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [visible]);

    const nextStep = () => {
        if (stepIndex < STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onComplete();
        }
    };

    const currentStep = STEPS[stepIndex];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                {/* Visual Highlight Layer could go here if we want to draw boxes, 
                    but for now we'll use a clean center card */}

                <View style={styles.container}>
                    <View style={styles.stepCounter}>
                        <Text style={styles.counterText}>ORIENTATION STEP {stepIndex + 1}/{STEPS.length}</Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name={currentStep.icon as any} size={40} color={theme.colors.accent} />
                        </View>

                        <Text style={styles.title}>{currentStep.title}</Text>
                        <Text style={styles.description}>{currentStep.description}</Text>
                    </View>

                    <View style={styles.footer}>
                        <Pressable style={styles.button} onPress={nextStep}>
                            <Text style={styles.buttonText}>
                                {stepIndex === STEPS.length - 1 ? "[INITIATE SIMULATION]" : "[ACKNOWLEDGE SYSTEM LOG]"}
                            </Text>
                        </Pressable>

                        {stepIndex < STEPS.length - 1 && (
                            <Pressable style={styles.skip} onPress={onComplete}>
                                <Text style={styles.skipText}>SKIP ORIENTATION</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* ANIMATED PULSE FOR HIGHLIGHTS */}
                {currentStep.highlight === 'STATS' && (
                    <Animated.View style={[styles.highlightBox, { top: 320, height: 100, opacity: pulseAnim }]} />
                )}
                {currentStep.highlight === 'CHART' && (
                    <Animated.View style={[styles.highlightBox, { top: 60, height: 240, opacity: pulseAnim }]} />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 30,
    },
    container: {
        backgroundColor: theme.colors.card,
        borderWidth: 2,
        borderColor: theme.colors.accent,
        padding: 24,
        borderRadius: 2,
    },
    stepCounter: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 8,
    },
    counterText: {
        color: theme.colors.faint,
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: '900',
    },
    content: {
        alignItems: 'center',
        gap: 20,
        marginVertical: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.accent + '10',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.accent + '30',
    },
    title: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    description: {
        color: '#AAA',
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '500',
    },
    footer: {
        marginTop: 20,
        gap: 12,
    },
    button: {
        backgroundColor: theme.colors.accent,
        padding: 16,
        alignItems: 'center',
        borderRadius: 2,
    },
    buttonText: {
        color: theme.colors.buttonText,
        fontWeight: '900',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    skip: {
        alignItems: 'center',
    },
    skipText: {
        color: theme.colors.faint,
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'monospace',
        textDecorationLine: 'underline',
    },
    highlightBox: {
        position: 'absolute',
        left: 20,
        right: 20,
        borderWidth: 2,
        borderColor: theme.colors.accent,
        borderRadius: 8,
        borderStyle: 'dashed',
        zIndex: -1,
    }
});
