import React, { useState, useCallback, memo } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../services/api';

// Memoized setting item to prevent re-renders
const SettingItem = memo(({ icon, label, value, onValueChange, accentColor, textColor, borderColor }) => (
    <View style={[styles.item, { borderBottomColor: borderColor }]}>
        <Ionicons name={icon} size={24} color={accentColor} style={styles.itemIcon} />
        <Text style={[styles.itemLabel, { color: textColor }]}>{label}</Text>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: accentColor }}
            thumbColor={value ? '#fff' : '#f4f3f4'}
        />
    </View>
));

export default function SettingsScreen({ navigation }) {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, updateUser } = useAuth();
    const { notificationsEnabled, isLoadingPreference, toggleNotifications } = useNotifications();
    const [isPublic, setIsPublic] = useState(user?.is_public || false);

    const handleTogglePublic = useCallback((value) => {
        setIsPublic(value);
        if (user) {
            updateUser({ ...user, is_public: value });
            api.put('/auth/update', { is_public: value }).catch(() => { });
        }
    }, [user, updateUser]);

    const handleToggleNotifications = useCallback((value) => {
        toggleNotifications(value);
    }, [toggleNotifications]);

    const handleLogout = async () => {
        try {
            await logout();
            navigation.replace('HomeTab');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout>
            <Header navigation={navigation} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Settings</Text>

                <GlassCard style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Appearance</Text>
                    <SettingItem
                        icon={theme.isDark ? "moon" : "sunny"}
                        label="Dark Mode"
                        value={theme.isDark}
                        onValueChange={toggleTheme}
                        accentColor={theme.colors.accentPrimary}
                        textColor={theme.colors.textPrimary}
                        borderColor={theme.colors.glassBorder}
                    />
                </GlassCard>

                {user && (
                    <GlassCard style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Privacy & Account</Text>
                        <SettingItem
                            icon="lock-closed-outline"
                            label="Public Profile"
                            value={isPublic}
                            onValueChange={handleTogglePublic}
                            accentColor={theme.colors.accentPrimary}
                            textColor={theme.colors.textPrimary}
                            borderColor={theme.colors.glassBorder}
                        />
                        {!isLoadingPreference && (
                            <SettingItem
                                icon="notifications-outline"
                                label="Notifications"
                                value={notificationsEnabled}
                                onValueChange={handleToggleNotifications}
                                accentColor={theme.colors.accentPrimary}
                                textColor={theme.colors.textPrimary}
                                borderColor="transparent"
                            />
                        )}
                    </GlassCard>
                )}

                <GlassCard style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Support</Text>
                    <TouchableOpacity
                        style={[styles.linkItem, { borderBottomColor: theme.colors.glassBorder }]}
                        onPress={() => navigation.navigate('Legal')}
                    >
                        <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>Legal & Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.linkItem, { borderBottomColor: 'transparent' }]}
                        onPress={() => navigation.navigate('About')}
                    >
                        <Text style={[styles.linkText, { color: theme.colors.textPrimary }]}>About NexusBuild</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </GlassCard>

                {user && (
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: theme.colors.danger }]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color="white" />
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    section: {
        padding: 0,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        padding: 15,
        paddingBottom: 5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        height: 56,
    },
    itemIcon: {
        width: 32,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginLeft: 10,
    },
    linkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
    },
    linkText: {
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        gap: 8,
        marginTop: 20,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
