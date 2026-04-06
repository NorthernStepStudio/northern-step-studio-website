import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const TOAST_TYPES = {
    success: { icon: 'checkmark-circle', color: '#10B981' },
    error: { icon: 'alert-circle', color: '#EF4444' },
    warning: { icon: 'warning', color: '#F59E0B' },
    info: { icon: 'information-circle', color: '#3B82F6' },
};

export function ToastProvider({ children }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [toast, setToast] = useState(null);
    const animValue = useRef(new Animated.Value(0)).current;
    const timeoutRef = useRef(null);

    const hideToast = useCallback(() => {
        Animated.timing(animValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setToast(null));
    }, []);

    const showToast = useCallback(({ type = 'info', message, duration = 3000, action, actionLabel }) => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setToast({ type, message, action, actionLabel });

        Animated.spring(animValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();

        if (duration > 0) {
            timeoutRef.current = setTimeout(hideToast, duration);
        }
    }, [hideToast]);

    const success = useCallback((message, options = {}) => {
        showToast({ type: 'success', message, ...options });
    }, [showToast]);

    const error = useCallback((message, options = {}) => {
        showToast({ type: 'error', message, ...options });
    }, [showToast]);

    const warning = useCallback((message, options = {}) => {
        showToast({ type: 'warning', message, ...options });
    }, [showToast]);

    const info = useCallback((message, options = {}) => {
        showToast({ type: 'info', message, ...options });
    }, [showToast]);

    const value = { showToast, hideToast, success, error, warning, info };

    const toastConfig = toast ? TOAST_TYPES[toast.type] : null;

    return (
        <ToastContext.Provider value={value}>
            {children}
            {toast && (
                <Animated.View
                    style={[
                        styles.container,
                        {
                            bottom: insets.bottom + 80,
                            opacity: animValue,
                            transform: [{
                                translateY: animValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                }),
                            }],
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.toast,
                            {
                                backgroundColor: theme.colors.surface,
                                borderLeftColor: toastConfig?.color,
                            },
                        ]}
                    >
                        <Ionicons
                            name={toastConfig?.icon}
                            size={22}
                            color={toastConfig?.color}
                        />
                        <Text
                            style={[styles.message, { color: theme.colors.textPrimary }]}
                            numberOfLines={2}
                        >
                            {toast.message}
                        </Text>
                        {toast.action && toast.actionLabel && (
                            <TouchableOpacity
                                onPress={() => {
                                    toast.action();
                                    hideToast();
                                }}
                                style={styles.actionBtn}
                            >
                                <Text style={[styles.actionText, { color: toastConfig?.color }]}>
                                    {toast.actionLabel}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
                            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        gap: 10,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    actionBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionText: {
        fontWeight: 'bold',
        fontSize: 13,
    },
    closeBtn: {
        padding: 4,
    },
});

export default ToastContext;
