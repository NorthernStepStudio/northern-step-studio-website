import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

export default function MaintenanceScreen({ message, onAdminOverride }) {
    const { theme } = useTheme();
    const { logout } = useAuth();

    // Animation for pulsing status dot
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Deep Rich Background Gradient */}
            <LinearGradient
                colors={['#0F172A', '#1E1B4B', '#312E81']}
                style={styles.background}
            />

            <View style={styles.contentContainer}>
                <GlassCard style={styles.card}>
                    <View style={styles.cardContent}>
                        {/* Robot Mechanic Image */}
                        <View style={styles.iconWrapper}>
                            <View style={[styles.iconGlow, { backgroundColor: theme.colors.primary }]} />
                            <Image
                                source={require('../../assets/images/robot_maintenance.png')}
                                style={styles.robotImage}
                                contentFit="contain"
                            />
                        </View>

                        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                            System Update
                        </Text>

                        <View style={styles.statusBadge}>
                            <Animated.View style={[styles.statusDot, { opacity: pulseAnim, backgroundColor: theme.colors.warning }]} />
                            <Text style={[styles.statusText, { color: theme.colors.warning }]}>In Progress</Text>
                        </View>

                        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                            {message || "We're currently upgrading our core systems to bring you a better experience. We'll be back online shortly."}
                        </Text>

                        {/* Visual Checklist */}
                        <View style={styles.checklist}>
                            <View style={styles.checkItem}>
                                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                                <Text style={[styles.checkText, { color: theme.colors.textSecondary }]}>Securing Data</Text>
                            </View>
                            <View style={styles.checkItem}>
                                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                                <Text style={[styles.checkText, { color: theme.colors.textSecondary }]}>Optimizing Performance</Text>
                            </View>
                            <View style={styles.checkItem}>
                                <Ionicons name="sync-circle" size={16} color={theme.colors.warning} />
                                <Text style={[styles.checkText, { color: theme.colors.textSecondary }]}>Finalizing Updates</Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                                <Text style={[styles.logoutText, { color: theme.colors.textMuted }]}>Log Out</Text>
                            </TouchableOpacity>

                            {onAdminOverride && (
                                <TouchableOpacity onPress={onAdminOverride} style={styles.adminLink}>
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>Admin Override</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </GlassCard>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    contentContainer: {
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 32,
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: 24,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
    },
    robotImage: {
        width: 180,
        height: 180,
    },
    iconGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        opacity: 0.3,
        transform: [{ scale: 1.5 }],
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 24,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    checklist: {
        width: '100%',
        marginBottom: 32,
        gap: 12,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 12,
        borderRadius: 12,
    },
    checkText: {
        fontSize: 14,
        fontWeight: '500',
    },
    actions: {
        alignItems: 'center',
        gap: 16,
    },
    logoutButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
    },
    adminLink: {
        opacity: 0.5,
    }
});
