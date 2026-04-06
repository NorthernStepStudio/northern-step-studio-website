import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

export default function GlassCard({ children, style, white = false, gradient = false, ...props }) {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        glassCard: {
            backgroundColor: theme.colors.glassBg,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: theme.colors.glassBorder,
            padding: 15,
            ...theme.shadows.glass,
        },
        glassCardWhite: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: theme.borderRadius.lg,
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            padding: theme.spacing.lg,
            ...theme.shadows.card,
        },
    });

    if (white) {
        return (
            <View style={[styles.glassCardWhite, style]} {...props}>
                {children}
            </View>
        );
    }

    return (
        <View style={[styles.glassCard, style]} {...props}>
            {children}
        </View>
    );
}
