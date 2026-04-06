import React, { useState } from 'react';
import {
    Linking,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { FEATURES, getWebAdminConsoleUrl } from '../core/config';

export default function NotificationsScreen({ navigation }) {
    const { theme } = useTheme();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const handleNotificationPress = (notification) => {
        markAsRead(notification.id);

        // Navigate based on notification type
        switch (notification.type) {
            case 'price_drop':
            // // case 'deal':
                navigation.navigate('MenuTab', { screen: 'BuilderTab' });
                break;
            case 'build':
                navigation.navigate('BuilderTab', { screen: 'MyBuilds' });
                break;
            case 'community':
                navigation.navigate('HomeTab', { screen: 'Community' });
                break;
            // Admin notification types
            case 'bug_report':
            case 'feedback':
            case 'new_user':
            case 'analytics':
            case 'system':
                if (FEATURES.WEB_ADMIN_CONSOLE) {
                    Linking.openURL(getWebAdminConsoleUrl());
                } else if (FEATURES.ADMIN_PANEL) {
                    navigation.navigate('ProfileTab', { screen: 'AdminReports' });
                }
                break;
            default:
                break;
        }
    };

    const styles = StyleSheet.create({
        container: {
            padding: 20,
            paddingBottom: 40,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
        },
        unreadBadge: {
            backgroundColor: theme.colors.accentPrimary,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
        },
        unreadText: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
        },
        markAllButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.colors.glassBg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.colors.glassBorder,
            marginBottom: 16,
            alignSelf: 'flex-end',
        },
        markAllText: {
            color: theme.colors.accentPrimary,
            fontSize: 14,
            fontWeight: '500',
        },
        notificationCard: {
            marginBottom: 12,
            overflow: 'hidden',
        },
        notificationRow: {
            flexDirection: 'row',
            padding: 16,
            gap: 14,
        },
        unreadCard: {
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.accentPrimary,
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
        },
        contentContainer: {
            flex: 1,
        },
        notificationTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 4,
        },
        notificationMessage: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 6,
            lineHeight: 20,
        },
        notificationTime: {
            fontSize: 12,
            color: theme.colors.textMuted,
        },
        unreadDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.accentPrimary,
            position: 'absolute',
            top: 16,
            right: 16,
        },
        deleteButton: {
            position: 'absolute',
            top: 12,
            right: 12,
            padding: 4,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
        },
        emptyIcon: {
            marginBottom: 16,
            opacity: 0.5,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        emptyText: {
            fontSize: 14,
            color: theme.colors.textMuted,
            textAlign: 'center',
        },
        settingsLink: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 16,
            marginTop: 20,
        },
        settingsText: {
            color: theme.colors.accentPrimary,
            fontSize: 14,
        },
    });

    return (
        <Layout scrollable={false}>
            <Header navigation={navigation} />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.accentPrimary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount} new</Text>
                        </View>
                    )}
                </View>

                {/* Mark All as Read Button */}
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                        <Ionicons name="checkmark-done" size={16} color={theme.colors.accentPrimary} />
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                )}

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            onPress={() => handleNotificationPress(notification)}
                            activeOpacity={0.7}
                        >
                            <GlassCard style={[
                                styles.notificationCard,
                                !notification.read && styles.unreadCard
                            ]}>
                                <View style={styles.notificationRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: notification.color + '20' }]}>
                                        <Ionicons name={notification.icon} size={22} color={notification.color} />
                                    </View>
                                    <View style={styles.contentContainer}>
                                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                                        <Text style={styles.notificationTime}>{notification.time}</Text>
                                    </View>
                                </View>
                                {!notification.read && <View style={styles.unreadDot} />}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deleteNotification(notification.id)}
                                >
                                    <Ionicons name="close" size={18} color={theme.colors.textMuted} />
                                </TouchableOpacity>
                            </GlassCard>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="notifications-off-outline"
                            size={64}
                            color={theme.colors.textMuted}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptyText}>
                            You don't have any notifications right now.{'\n'}
                            We'll let you know when something happens.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </Layout>
    );
}
