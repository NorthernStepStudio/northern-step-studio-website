import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * CyberSkeleton
 * 
 * A futuristic loading state with a scanning line animation.
 * Features a neon glowing bar that moves across the content.
 * 
 * @param {number|string} width - Width of the skeleton
 * @param {number|string} height - Height of the skeleton
 * @param {object} style - Additional styles
 */
export default function CyberSkeleton({ width, height, style }) {
    const { theme } = useTheme();
    const translateX = useRef(new Animated.Value(-100)).current;

    // Animation Loop
    useEffect(() => {
        const scanAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(translateX, {
                    toValue: 200, // Move past the width (approx) - visual effect
                    duration: 1500,
                    useNativeDriver: true, // Native driver for smooth UI thread anims
                }),
                Animated.delay(500), // Pause before next scan
            ])
        );
        scanAnimation.start();
        return () => scanAnimation.stop();
    }, []);

    return (
        <View
            style={[
                styles.container,
                {
                    width,
                    height,
                    backgroundColor: theme.colors.glassBg, // Base glass background
                    borderColor: theme.colors.glassBorder,
                },
                style,
            ]}
        >
            {/* Animated Scanner Line */}
            <Animated.View
                style={[
                    styles.scanner,
                    {
                        backgroundColor: theme.colors.accentPrimary, // Neon Color
                        transform: [
                            { translateX },
                            { scaleX: 0.3 } // Thin line appearance
                        ],
                    },
                ]}
            />

            {/* Glitch Overlay (Static for now, can be animated later) */}
            <View style={[styles.glitchLine, { top: '20%', backgroundColor: theme.colors.textMuted }]} />
            <View style={[styles.glitchLine, { bottom: '30%', backgroundColor: theme.colors.textMuted }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        position: 'relative',
    },
    scanner: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
        opacity: 0.4,
        shadowColor: '#00FFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    glitchLine: {
        position: 'absolute',
        height: 1,
        width: '10%',
        opacity: 0.2,
        left: '10%',
    },
});
