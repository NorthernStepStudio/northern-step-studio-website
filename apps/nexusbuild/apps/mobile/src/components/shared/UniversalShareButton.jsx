import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { shareContent } from '../../services/ShareService';

/**
 * Universal Share Button
 * @param {string} type - 'build', 'part', 'user', 'app'
 * @param {string} id - ID of the item
 * @param {string} title - Title for share dialog
 * @param {string} message - Message body
 * @param {object} style - Override styles
 * @param {number} size - Icon size
 * @param {string} color - Icon color override
 */
export default function UniversalShareButton({
    type,
    id,
    title = 'Check this out on NexusBuild!',
    message = 'I found this on NexusBuild.',
    style,
    size = 24,
    color,
    children
}) {
    const { theme, isDark } = useTheme();

    const handlePress = async () => {
        await shareContent({
            title,
            message,
            type,
            id
        });
    };

    if (children) {
        return (
            <TouchableOpacity onPress={handlePress} style={style}>
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.button, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }, style]}
        >
            <Ionicons
                name="share-outline"
                size={size}
                color={color || theme.colors.textPrimary}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
