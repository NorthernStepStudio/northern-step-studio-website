import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function SkeletonLoader({ style, width, height, borderRadius = 8 }) {
    const { theme } = useTheme();
    const opacityAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.colors.surface || '#2a2a2a',
                    borderColor: theme.colors.accentPrimary || '#00d4ff',
                    opacity: opacityAnim,
                },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    skeleton: {
        borderWidth: 1,
        overflow: 'hidden',
    },
});
