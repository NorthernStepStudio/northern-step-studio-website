import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withTiming,
    withRepeat,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import ConfettiCannon from 'react-native-confetti-cannon';
import { AutoTranslate } from './AutoTranslate';

interface MedalUnlockModalProps {
    visible: boolean;
    medal: {
        id: string;
        name: string;
        description: string;
        icon: string;
    } | null;
    onClose: () => void;
}

export function MedalUnlockModal({ visible, medal, onClose }: MedalUnlockModalProps) {
    // All hooks must be called unconditionally at the top
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const confettiRef = useRef<any>(null);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: withRepeat(withTiming(1.2, { duration: 1000 }), -1, true) }]
    }));

    useEffect(() => {
        if (visible && medal) {
            scale.value = withSpring(1, { damping: 12 });
            opacity.value = withTiming(1, { duration: 500 });
            glowOpacity.value = withDelay(500, withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.4, { duration: 1000 })
            ));

            if (confettiRef.current) {
                confettiRef.current.start();
            }

            const timer = setTimeout(() => {
                scale.value = withTiming(0, { duration: 500 });
                opacity.value = withTiming(0, { duration: 500 });
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            scale.value = 0;
            opacity.value = 0;
            glowOpacity.value = 0;
        }
    }, [visible, medal]);

    // Conditional render AFTER all hooks
    if (!medal) return null;

    return (
        <AutoTranslate>
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <ConfettiCannon
                    ref={confettiRef}
                    count={50}
                    origin={{ x: Dimensions.get('window').width / 2, y: -20 }}
                    fadeOut={true}
                    autoStart={false}
                />

                <Animated.View style={[styles.container, animatedStyle]}>
                    <View style={styles.glowContainer}>
                        <Animated.View style={[styles.glow, { backgroundColor: theme.colors.accent }, glowStyle]} />
                    </View>

                    <View style={styles.medalIcon}>
                        <Text style={{ fontSize: 64 }}>{medal.icon}</Text>
                    </View>

                    <Text style={styles.title}>ACHIEVEMENT UNLOCKED</Text>
                    <Text style={styles.medalName}>{medal.name}</Text>
                    <Text style={styles.medalDesc}>{medal.description}</Text>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>KEEP SPREADING THE TRUTH</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
        </AutoTranslate>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    container: {
        alignItems: 'center',
        width: '100%',
    },
    glowContainer: {
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
        height: 120,
        width: 120,
    },
    glow: {
        width: 160,
        height: 160,
        borderRadius: 80,
        opacity: 0.6,
    },
    medalIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.accent,
        marginBottom: 24,
        zIndex: 10,
    },
    title: {
        color: theme.colors.accent,
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 8,
    },
    medalName: {
        color: theme.colors.text,
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 12,
    },
    medalDesc: {
        color: theme.colors.muted,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: 16,
        paddingHorizontal: 32,
    },
    footerText: {
        color: theme.colors.accent,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    }
});
