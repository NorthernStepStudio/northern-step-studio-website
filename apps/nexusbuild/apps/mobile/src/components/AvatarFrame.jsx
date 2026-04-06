import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function AvatarFrame({ children, size = 120, variant = 'basic' }) {
    const { theme } = useTheme();
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const glitchValue = useRef(new Animated.Value(0)).current;

    const FRAMES = useMemo(() => ({
        // Standard Ranks
        basic: { shape: 'circle', colors: ['#00F0FF', '#00F0FF33'], speed: 0, border: 2 },
        rare: { shape: 'circle', colors: [theme.colors.accentPrimary, 'transparent', theme.colors.accentPrimary, 'transparent'], speed: 8000, hasCorners: true, glitch: true },
        epic: { shape: 'circle', colors: ['#FFD700', '#FFA500', '#FFD700'], speed: 4000, doubleRing: true },

        // New Special Frames
        neon_pulse: { shape: 'circle', colors: ['#FF00FF', '#00FFFF'], speed: 2000, pulse: true },
        cyber_ring: { shape: 'circle', colors: ['#00FF00', 'transparent', '#00FF00'], speed: 3000, dashed: true },

        // Square Frames
        hexagon_tech: { shape: 'square', colors: ['#FF4500', '#FF8C00'], speed: 0, techBorder: true },
        quantum_square: { shape: 'square', colors: ['#7B68EE', '#9370DB'], speed: 6000, doubleRing: true },

        // Elemental Frames (New)
        fire: { shape: 'circle', colors: ['#FF4500', '#FFD700', '#8B0000'], speed: 2000, pulse: true, border: 4 },
        smoke: { shape: 'circle', colors: ['#A9A9A9', '#F5F5F5', '#696969'], speed: 10000, dashed: true, border: 2 },
        lightning: { shape: 'circle', colors: ['#00BFFF', '#E0FFFF', '#FFFFFF'], speed: 500, glitch: true, border: 3 },
    }), [theme]);

    const config = FRAMES[variant] || FRAMES.basic;

    useEffect(() => {
        const animations = [];

        if (config.AnimationType === 'pulse' || config.pulse) {
            animations.push(
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseValue, { toValue: 1.1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                        Animated.timing(pulseValue, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
                    ])
                )
            );
        } else if (config.speed > 0) {
            animations.push(
                Animated.loop(
                    Animated.timing(spinValue, {
                        toValue: 1,
                        duration: config.speed,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    })
                )
            );
        } else {
            spinValue.setValue(0);
        }

        if (config.glitch) {
            const glitchAnim = Animated.loop(
                Animated.sequence([
                    Animated.timing(glitchValue, { toValue: 5, duration: 50, useNativeDriver: true }),
                    Animated.timing(glitchValue, { toValue: -5, duration: 50, useNativeDriver: true }),
                    Animated.timing(glitchValue, { toValue: 0, duration: 50, useNativeDriver: true }),
                    Animated.delay(2000 + Math.random() * 1000)
                ])
            );
            animations.push(glitchAnim);
        }

        animations.forEach(anim => anim.start());

        return () => {
            animations.forEach(anim => anim.stop());
            pulseValue.setValue(1);
            spinValue.setValue(0);
            glitchValue.setValue(0);
        };
    }, [variant, config]);

    const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const reverseSpin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

    const innerRadius = config.shape === 'circle' ? (size - 8) / 2 : 12;
    const outerRadius = config.shape === 'circle' ? size / 2 : 16;
    const frameSize = size;
    const innerSize = size - 8;

    return (
        <Animated.View
            style={[
                styles.container,
                { width: frameSize, height: frameSize },
                config.glitch && { transform: [{ translateX: glitchValue }] }
            ]}
        >

            {/* Pulse Effect */}
            {config.pulse && (
                <Animated.View style={{
                    position: 'absolute',
                    width: frameSize, height: frameSize,
                    borderRadius: outerRadius,
                    borderWidth: 2,
                    borderColor: config.colors[0],
                    transform: [{ scale: pulseValue }],
                    opacity: 0.6
                }} />
            )}

            {/* Main Rotating Ring/Border */}
            <Animated.View
                style={[
                    styles.spinnerContainer,
                    {
                        width: frameSize,
                        height: frameSize,
                        borderRadius: outerRadius,
                        transform: [{ rotate: spin }],
                        borderWidth: config.border || 0,
                        borderColor: config.border ? config.colors[0] : 'transparent',
                        borderStyle: config.dashed ? 'dashed' : 'solid',
                    },
                ]}
            >
                {!config.border && (
                    <LinearGradient
                        colors={config.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.spinnerGradient}
                    />
                )}
            </Animated.View>

            {/* Double Ring Effect */}
            {config.doubleRing && (
                <Animated.View
                    style={[
                        styles.spinnerContainer,
                        {
                            width: frameSize + (config.shape === 'square' ? 10 : 10),
                            height: frameSize + (config.shape === 'square' ? 10 : 10),
                            borderRadius: outerRadius + 4,
                            transform: [{ rotate: reverseSpin }],
                            position: 'absolute',
                            zIndex: -1,
                            borderWidth: 2,
                            borderColor: config.colors[0]
                        },
                    ]}
                />
            )}

            {/* Tech Corners (Rare) */}
            {config.hasCorners && (
                <View style={[styles.cornersContainer, { width: frameSize, height: frameSize }]}>
                    <View style={[styles.corner, styles.topLeft, { borderTopLeftRadius: outerRadius, borderColor: theme.colors.accentPrimary }]} />
                    <View style={[styles.corner, styles.topRight, { borderTopRightRadius: outerRadius, borderColor: theme.colors.accentPrimary }]} />
                    <View style={[styles.corner, styles.bottomLeft, { borderBottomLeftRadius: outerRadius, borderColor: theme.colors.accentPrimary }]} />
                    <View style={[styles.corner, styles.bottomRight, { borderBottomRightRadius: outerRadius, borderColor: theme.colors.accentPrimary }]} />
                </View>
            )}

            {/* Tech Border (Hexagon/Square) */}
            {config.techBorder && (
                <View style={{ position: 'absolute', width: '110%', height: '110%', borderWidth: 2, borderColor: config.colors[0], opacity: 0.5, borderRadius: 4 }} />
            )}

            {/* Inner Content */}
            <View style={[
                styles.innerContent,
                {
                    width: innerSize,
                    height: innerSize,
                    borderRadius: innerRadius,
                    borderColor: config.colors[0],
                    backgroundColor: theme.colors.bgSecondary,
                }
            ]}>
                {children}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        margin: 5,
    },
    spinnerContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    spinnerGradient: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    cornersContainer: {
        position: 'absolute',
        zIndex: 2,
    },
    corner: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderWidth: 3,
    },
    topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
    topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
    innerContent: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        zIndex: 1,
    },
});
