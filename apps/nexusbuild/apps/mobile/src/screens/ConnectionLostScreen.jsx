import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ConnectionLostScreen({ onRetry }) {
    const { theme } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const isWeb = Platform.OS === 'web';

    useEffect(() => {
        // Pulsing animation for the cyan glow
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}>
            <LinearGradient
                colors={theme.gradients.background}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                {/* Robot Mechanic Image Area */}
                <View style={styles.imageContainer}>
                    <Animated.View style={[
                        styles.glowRing,
                        {
                            borderColor: theme.colors.accentPrimary,
                            transform: [{ scale: pulseAnim }],
                            opacity: 0.6
                        }
                    ]} />
                    {/* Placeholder for the generated image - assuming it will be in assets */}
                    <Image
                        source={require('../../assets/images/robot_mechanic_error.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                    System Malfunction
                </Text>

                <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                    Connection to the Nexus has been severed. Our robot mechanics are investigating.
                </Text>

                {/* Offline Mode Indicator */}
                <View style={[styles.offlineBadge, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.glassBorder }]}>
                    <Feather name="wifi-off" size={16} color={theme.colors.warning} />
                    <Text style={[styles.offlineText, { color: theme.colors.textSecondary }]}>
                        Offline Mode Active • Cached Data Available
                    </Text>
                </View>

                {/* Retry Button */}
                <TouchableOpacity
                    style={[styles.retryButton, {
                        backgroundColor: theme.colors.accentPrimary,
                        shadowColor: theme.colors.accentPrimary
                    }]}
                    onPress={onRetry}
                    activeOpacity={0.8}
                >
                    <Text style={styles.retryText}>Reconnect System</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 500,
        width: '100%',
    },
    imageContainer: {
        width: 250,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        zIndex: 2,
    },
    glowRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 30,
        gap: 8,
    },
    offlineText: {
        fontSize: 14,
        fontWeight: '600',
    },
    retryButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
