import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useChatUI } from '../contexts/ChatUIContext';

/**
 * FloatingChatButton - Simple, reliable chat toggle button
 * No animations to avoid crashes. Just works.
 */
export default function FloatingChatButton() {
    const { theme } = useTheme();
    const { toggleChat } = useChatUI();

    return (
        <TouchableOpacity
            style={[styles.container, {
                shadowColor: theme.colors.accentPrimary,
            }]}
            onPress={toggleChat}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={theme.gradients.primary}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name="chatbubble-ellipses" size={26} color="white" />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 9999,
        ...Platform.select({
            web: {
                position: 'fixed',
                cursor: 'pointer',
            },
        }),
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});
