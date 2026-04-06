import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useI18n } from '../i18n';

export type ToastType = 'INFO' | 'WARNING' | 'TRUTH';

interface TruthToastProps {
    message: string;
    type?: ToastType;
    visible: boolean;
    onHide: () => void;
}

export function TruthToast({ message, type = 'TRUTH', visible, onHide }: TruthToastProps) {
    const { tr } = useI18n();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    tension: 40,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hide();
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => onHide());
    };

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'WARNING': return 'alert-outline';
            case 'INFO': return 'information-outline';
            default: return 'shield-check-outline';
        }
    };

    const getAccent = () => {
        switch (type) {
            case 'WARNING': return theme.colors.danger;
            case 'INFO': return theme.colors.accent;
            default: return theme.colors.success;
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'WARNING': return tr('Warning').toUpperCase();
            case 'INFO': return tr('Info').toUpperCase();
            case 'TRUTH': return tr('Truth').toUpperCase();
            default: return type;
        }
    };

    return (
        <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
            <View style={[styles.content, { borderLeftColor: getAccent() }]}>
                <MaterialCommunityIcons name={getIcon()} size={24} color={getAccent()} />
                <View style={styles.textContainer}>
                    <Text style={styles.typeText}>{getTypeLabel()}</Text>
                    <Text style={styles.messageText}>{tr(message)}</Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
    },
    content: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    typeText: {
        color: theme.colors.muted,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    messageText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 18,
    },
});
