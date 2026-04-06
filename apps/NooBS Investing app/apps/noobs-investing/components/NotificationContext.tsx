import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated, Dimensions, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useI18n } from '../i18n';

export type NudgeType = 'DANGER' | 'SUCCESS' | 'INFO' | 'WARNING';

interface NudgeOptions {
    title: string;
    message: string;
    type: NudgeType;
    icon?: string;
}

interface NotificationContextType {
    showNudge: (options: NudgeOptions) => void;
    history: NudgeOptions[];
    clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { tr } = useI18n();
    const [nudge, setNudge] = useState<NudgeOptions | null>(null);
    const [history, setHistory] = useState<NudgeOptions[]>([]);
    const translateY = useRef(new RNAnimated.Value(-200)).current;

    const showNudge = useCallback((options: NudgeOptions) => {
        setNudge(options);
        setHistory(prev => [options, ...prev].slice(0, 50)); // Keep last 50

        // Slide down - Adjusted toValue to 80 to prevent clipping in headers
        RNAnimated.spring(translateY, {
            toValue: 80,
            useNativeDriver: true,
            bounciness: 10
        }).start();

        // Auto hide after 5s
        setTimeout(() => {
            RNAnimated.timing(translateY, {
                toValue: -200,
                duration: 500,
                useNativeDriver: true
            }).start(() => setNudge(null));
        }, 5000);
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    const hideNudge = () => {
        RNAnimated.timing(translateY, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true
        }).start(() => setNudge(null));
    };

    const getIcon = () => {
        if (nudge?.icon) return nudge.icon;
        switch (nudge?.type) {
            case 'DANGER': return 'alert-decagram';
            case 'SUCCESS': return 'check-decagram';
            case 'WARNING': return 'alert-outline';
            default: return 'information-outline';
        }
    };

    const getColor = () => {
        switch (nudge?.type) {
            case 'DANGER': return theme.colors.danger;
            case 'SUCCESS': return theme.colors.success;
            case 'WARNING': return theme.colors.accent;
            default: return theme.colors.muted;
        }
    };

    return (
        <NotificationContext.Provider value={{ showNudge, history, clearHistory }}>
            {children}
            {nudge && (
                <RNAnimated.View style={[
                    styles.toastContainer,
                    { transform: [{ translateY }] }
                ]}>
                    <Pressable
                        onPress={hideNudge}
                        style={[styles.toast, { borderColor: getColor() + '40' }]}
                    >
                        <View style={[styles.iconBox, { backgroundColor: getColor() + '20' }]}>
                            <MaterialCommunityIcons name={getIcon() as any} size={24} color={getColor()} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.toastTitle, { color: getColor() }]}>{tr(nudge.title)}</Text>
                            <Text style={styles.toastMessage}>{tr(nudge.message)}</Text>
                        </View>
                        <MaterialCommunityIcons name="close" size={16} color={theme.colors.faint} />
                    </Pressable>
                </RNAnimated.View>
            )}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
    },
    toast: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 2,
        // Elevation for android, shadow for ios
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toastTitle: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    toastMessage: {
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    }
});
