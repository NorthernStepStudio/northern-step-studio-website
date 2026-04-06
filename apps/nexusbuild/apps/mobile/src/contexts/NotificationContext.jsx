import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import * as Device from 'expo-device';
import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { navigationRef } from '../navigation/RootNavigation';
import { FEATURES, getWebAdminConsoleUrl } from '../core/config';

// Check if running in Expo Go - notifications are limited in SDK 53+
const isExpoGo = Constants.appOwnership === 'expo';
const Notifications = isExpoGo
    ? {
        setNotificationHandler: () => { },
        setNotificationChannelAsync: async () => { },
        getPermissionsAsync: async () => ({ status: 'denied' }),
        requestPermissionsAsync: async () => ({ status: 'denied' }),
        getExpoPushTokenAsync: async () => ({ data: null }),
        addNotificationReceivedListener: () => ({ remove: () => { } }),
        addNotificationResponseReceivedListener: () => ({ remove: () => { } }),
        AndroidImportance: { MAX: 4 },
    }
    : require('expo-notifications');

// Configure notification handler - ONLY if not in Expo Go
// Expo Go SDK 53+ has broken push notification support
if (!isExpoGo) {
    try {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    } catch (err) {
        console.log('Could not set notification handler:', err.message);
    }
} else {
    console.log('Running in Expo Go - push notifications disabled');
}

// Storage keys

// Storage keys
const NOTIFICATIONS_ENABLED_KEY = '@nexusbuild_notifications_enabled';
const NOTIFICATIONS_STORAGE_KEY = '@nexusbuild_notifications_v2';

// 30 days in milliseconds
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Helper to format time ago
const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
};

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [allNotifications, setAllNotifications] = useState([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is admin
    const isAdmin = user?.role === 'admin' || user?.is_admin === true || user?.is_moderator === true ||
        user?.username === 'DevUser' ||
        user?.email?.toLowerCase().endsWith('@nexusbuild.app') ||
        user?.email === 'admin@nexus.com';

    // Filter notifications based on user role
    const notifications = allNotifications
        .filter(n => !n.adminOnly || isAdmin)
        .map(n => ({ ...n, time: formatTimeAgo(n.createdAt) }));

    const unreadCount = notifications.filter(n => !n.read).length;

    // Save notifications to AsyncStorage
    const saveNotifications = useCallback(async (notifs) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }, []);

    // Load notifications from AsyncStorage and clean up old ones
    const loadNotifications = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
            const now = Date.now();
            let valid = [];
            if (stored) {
                const parsed = JSON.parse(stored);
                // Filter out notifications older than 30 days
                valid = parsed.filter(n => (now - n.createdAt) < THIRTY_DAYS_MS);
            }

            // Check for legacy/separate admin notifications and merge them
            try {
                const adminStored = await AsyncStorage.getItem('admin_notifications');
                if (adminStored) {
                    const adminNotifs = JSON.parse(adminStored);
                    // Convert to new format if needed, or just merge
                    // We assume they look suitable, but ensure 'adminOnly' is true
                    const formattedAdminNotifs = adminNotifs.map(n => ({
                        ...n,
                        id: n.id || Date.now() + Math.random(),
                        adminOnly: true,
                        createdAt: n.timestamp || Date.now(), // Fallback
                        type: n.type || 'system',
                        icon: n.icon || 'alert-circle',
                        color: n.color || '#EF4444'
                    }));

                    // Add to valid list if not duplicate (naive check by title/message)
                    formattedAdminNotifs.forEach(an => {
                        const exists = valid.find(v => v.title === an.title && v.message === an.message);
                        if (!exists) {
                            valid.push(an);
                        }
                    });

                    // We DO NOT clear admin_notifications yet as ProfileScreen might still use it
                    // But ideally we should migrate ProfileScreen to use this Context exclusively.
                }
            } catch (err) {
                console.log('Error merging admin notifications', err);
            }

            setAllNotifications(valid.sort((a, b) => b.createdAt - a.createdAt));

            // Save cleaned list back (now including merged admin notifs)
            if (valid.length > 0) {
                await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(valid));
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, []);

    // Load notifications and preferences on mount
    useEffect(() => {
        const initialize = async () => {
            try {
                // Load preference
                const storedPref = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
                if (storedPref !== null) {
                    setNotificationsEnabled(JSON.parse(storedPref));
                }
                // Load notifications
                await loadNotifications();

                // Register for push notifications
                if (notificationsEnabled && Constants.appOwnership !== 'expo') {
                    registerForPushNotificationsAsync().then(token => {
                        if (token) {
                            console.log('Push token:', token);
                            // TODO: Send token to backend
                        }
                    });
                }
            } catch (error) {
                console.error('Error initializing notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initialize();

        // Skip push notification listeners in Expo Go - they cause crashes in SDK 53+
        let notificationListener;
        let responseListener;

        if (!isExpoGo) {
            // Notification received listener (foreground)
            try {
                notificationListener = Notifications.addNotificationReceivedListener(notification => {
                    const { title, body, data } = notification.request.content;

                    addNotification({
                        title: title || 'New Notification',
                        message: body || '',
                        type: data?.type || 'system',
                        icon: data?.icon || 'notifications',
                        color: data?.color || '#3B82F6',
                        adminOnly: false,
                        read: false
                    });
                });
            } catch (err) {
                console.log('Could not add notification listener:', err.message);
            }

            // Notification response listener (user tapped notification)
            try {
                responseListener = Notifications.addNotificationResponseReceivedListener(response => {
                    const data = response.notification.request.content.data;
                    console.log('Notification tapped:', data);

                    if (navigationRef.isReady()) {
                        const type = data?.type;

                        switch (type) {
                            case 'build':
                                navigationRef.navigate('BuilderTab', { screen: 'MyBuilds' });
                                break;
                            case 'price_tracking':
                            case 'price_drop':
                                if (FEATURES.PRICE_TRACKING) {
                                    navigationRef.navigate('MenuTab', { screen: 'TrackedParts' });
                                } else {
                                    navigationRef.navigate('MenuTab', { screen: 'Deals' });
                                }
                                break;
                            case 'share':
                                navigationRef.navigate('HomeTab', { screen: 'Community' });
                                break;
                            case 'profile':
                                navigationRef.navigate('ProfileTab');
                                break;
                            case 'bug_report':
                            case 'contact':
                            case 'new_user':
                                if (FEATURES.WEB_ADMIN_CONSOLE) {
                                    Linking.openURL(getWebAdminConsoleUrl()).catch(() => { });
                                } else if (FEATURES.ADMIN_PANEL) {
                                    navigationRef.navigate('ProfileTab', { screen: 'AdminReports' });
                                }
                                break;
                            case 'report_received':
                            case 'report_status':
                                navigationRef.navigate('MenuTab', { screen: 'HelpSupport' });
                                break;
                            default:
                                navigationRef.navigate('HomeTab');
                        }
                    }
                });
            } catch (err) {
                console.log('Could not add response listener:', err.message);
            }
        }

        return () => {
            if (notificationListener && typeof notificationListener.remove === 'function') {
                notificationListener.remove();
            }
            if (responseListener && typeof responseListener.remove === 'function') {
                responseListener.remove();
            }
        };
    }, [loadNotifications, notificationsEnabled]);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get Project ID from app config
            // We use the string directly or fetch from Constants
            try {
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: 'c1bbdb44-8e59-448d-aba9-b8b463ee70cf' // Use hardcoded ID to be safe or imported config
                })).data;
            } catch (e) {
                console.log('Error getting push token', e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    // Mark notification as read
    const markAsRead = useCallback((id) => {
        setAllNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            saveNotifications(updated);
            return updated;
        });
    }, [saveNotifications]);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setAllNotifications(prev => {
            const updated = prev.map(n => {
                if (!n.adminOnly || isAdmin) {
                    return { ...n, read: true };
                }
                return n;
            });
            saveNotifications(updated);
            return updated;
        });
    }, [isAdmin, saveNotifications]);

    // Delete notification
    const deleteNotification = useCallback((id) => {
        setAllNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            saveNotifications(updated);
            return updated;
        });
    }, [saveNotifications]);

    // Add new notification (internal)
    const addNotification = useCallback((notification) => {
        const newNotif = {
            ...notification,
            id: Date.now() + Math.random(),
            read: false,
            createdAt: Date.now(),
        };
        setAllNotifications(prev => {
            const updated = [newNotif, ...prev];
            saveNotifications(updated);
            return updated;
        });
    }, [saveNotifications]);

    // ============================================
    // USER NOTIFICATION FUNCTIONS
    // ============================================

    // Build saved notification
    const addBuildSavedNotification = useCallback((buildName) => {
        addNotification({
            type: 'build',
            icon: 'construct',
            color: '#A855F7',
            title: 'Build Saved!',
            message: `Your build "${buildName || 'Untitled Build'}" was saved successfully`,
            adminOnly: false,
        });
    }, [addNotification]);

    // Build updated notification
    const addBuildUpdatedNotification = useCallback((buildName) => {
        addNotification({
            type: 'build',
            icon: 'checkmark-circle',
            color: '#22C55E',
            title: 'Build Updated',
            message: `Your build "${buildName || 'Untitled Build'}" was updated`,
            adminOnly: false,
        });
    }, [addNotification]);

    // Part tracked notification
    const addPartTrackedNotification = useCallback((partName) => {
        addNotification({
            type: 'price_tracking',
            icon: 'eye',
            color: '#F59E0B',
            title: 'Now Tracking',
            message: `You're now tracking price changes for "${partName}"`,
            adminOnly: false,
        });
    }, [addNotification]);

    // Part untracked notification
    const addPartUntrackedNotification = useCallback((partName) => {
        addNotification({
            type: 'price_tracking',
            icon: 'eye-off',
            color: '#6B7280',
            title: 'Stopped Tracking',
            message: `You removed "${partName}" from your watchlist`,
            adminOnly: false,
        });
    }, [addNotification]);

    // Price drop notification
    const addPriceDropNotification = useCallback((partName, oldPrice, newPrice) => {
        const savings = (oldPrice - newPrice).toFixed(2);
        addNotification({
            type: 'price_drop',
            icon: 'pricetag',
            color: '#4ECDC4',
            title: 'Price Drop Alert! 🔥',
            message: `${partName} dropped by $${savings}!`,
            adminOnly: false,
        });
    }, [addNotification]);

    // Build shared notification
    const addBuildSharedNotification = useCallback((buildName) => {
        addNotification({
            type: 'share',
            icon: 'share',
            color: '#3B82F6',
            title: 'Build Shared',
            message: `Your build "${buildName}" is now public!`,
            adminOnly: false,
        });
    }, [addNotification]);

    // Profile updated notification
    const addProfileUpdatedNotification = useCallback(() => {
        addNotification({
            type: 'profile',
            icon: 'person',
            color: '#8B5CF6',
            title: 'Profile Updated',
            message: 'Your profile changes have been saved',
            adminOnly: false,
        });
    }, [addNotification]);

    // ============================================
    // ADMIN NOTIFICATION FUNCTIONS
    // ============================================

    // Bug report notification (admin)
    const addBugReportNotification = useCallback((reportDetails) => {
        addNotification({
            type: 'bug_report',
            icon: 'bug',
            color: '#FF4757',
            title: '🐛 New Bug Report',
            message: `User reported: "${reportDetails?.substring(0, 50) || 'No details'}..."`,
            adminOnly: true,
        });
    }, [addNotification]);

    // Report received notification (User)
    const addReportConfirmationNotification = useCallback(() => {
        addNotification({
            type: 'report_received',
            icon: 'checkmark-circle',
            color: '#10B981',
            title: 'Report Received',
            message: 'Thanks for your feedback! We will look into it.',
            adminOnly: false,
        });
    }, [addNotification]);

    // Report status update notification (User)
    const addReportStatusUpdateNotification = useCallback((reportId, status, message) => {
        let color = '#3B82F6';
        let icon = 'information-circle';

        if (status === 'resolved') {
            color = '#10B981';
            icon = 'checkmark-done-circle';
        } else if (status === 'investigating') {
            color = '#F59E0B';
            icon = 'search';
        }

        addNotification({
            type: 'report_status',
            icon: icon,
            color: color,
            title: 'Report Update',
            message: message || `Your report status has been updated to: ${status}`,
            adminOnly: false,
        });
    }, [addNotification]);

    // Contact form notification (admin)
    const addContactNotification = useCallback((name, subject) => {
        addNotification({
            type: 'contact',
            icon: 'mail',
            color: '#4ECDC4',
            title: '📬 New Contact Message',
            message: `From: ${name}${subject ? ` - ${subject}` : ''}`,
            adminOnly: true,
        });
    }, [addNotification]);

    // New user registered notification (admin)
    const addNewUserNotification = useCallback((username) => {
        addNotification({
            type: 'new_user',
            icon: 'person-add',
            color: '#00D4FF',
            title: '👤 New User Registered',
            message: `${username} just signed up`,
            adminOnly: true,
        });
    }, [addNotification]);

    // Toggle notifications preference
    const toggleNotifications = useCallback(async (value) => {
        setNotificationsEnabled(value);
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving notification preference:', error);
        }
    }, []);

    // Clear all notifications
    const clearAllNotifications = useCallback(async () => {
        setAllNotifications([]);
        try {
            await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications: notificationsEnabled ? notifications : [],
            unreadCount: notificationsEnabled ? unreadCount : 0,
            notificationsEnabled,
            isLoadingPreference: isLoading,
            isAdmin,
            // Core functions
            toggleNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAllNotifications,
            addNotification,
            // User notification helpers
            addBuildSavedNotification,
            addBuildUpdatedNotification,
            addPartTrackedNotification,
            addPartUntrackedNotification,
            addPriceDropNotification,
            addBuildSharedNotification,
            addProfileUpdatedNotification,
            addReportConfirmationNotification,
            addReportStatusUpdateNotification,
            // Admin notification helpers
            addBugReportNotification,
            addContactNotification,
            addNewUserNotification,
        }}>
            {children}
        </NotificationContext.Provider >
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
