import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../core/i18n';

/**
 * Empty state component for lists and screens with no data
 */
export default function EmptyState({
    icon = 'folder-open-outline',
    title,
    message,
    actionLabel,
    onAction,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const resolvedTitle = title || t('emptyState.defaultTitle');
    const resolvedMessage = message || t('emptyState.defaultMessage');

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.glassBg }]}>
                <Ionicons name={icon} size={48} color={theme.colors.textMuted} />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {resolvedTitle}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                {resolvedMessage}
            </Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.accentPrimary }]}
                    onPress={onAction}
                >
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

/**
 * Error state component for failed operations
 */
export function ErrorState({
    title,
    message,
    onRetry,
    retryLabel,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const resolvedTitle = title || t('errorState.title');
    const resolvedMessage = message || t('errorState.message');
    const resolvedRetryLabel = retryLabel || t('errorState.retry');

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: '#ef444422' }]}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {resolvedTitle}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                {resolvedMessage}
            </Text>
            {onRetry && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                    onPress={onRetry}
                >
                    <Ionicons name="refresh" size={18} color="white" />
                    <Text style={styles.actionText}>{resolvedRetryLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

/**
 * Offline state component
 */
export function OfflineState({ onRetry }) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: '#f59e0b22' }]}>
                <Ionicons name="cloud-offline" size={48} color="#f59e0b" />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {t('offlineState.title')}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                {t('offlineState.message')}
            </Text>
            {onRetry && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                    onPress={onRetry}
                >
                    <Ionicons name="refresh" size={18} color="white" />
                    <Text style={styles.actionText}>{t('offlineState.retry')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

/**
 * No search results state
 */
export function NoResultsState({ query, onClear }) {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.glassBg }]}>
                <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {t('emptyState.noResultsTitle')}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                {t('emptyState.noResultsMessage', { query })}
            </Text>
            {onClear && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.accentPrimary }]}
                    onPress={onClear}
                >
                    <Text style={styles.actionText}>{t('emptyState.clearSearch')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        minHeight: 300,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 24,
        gap: 8,
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
