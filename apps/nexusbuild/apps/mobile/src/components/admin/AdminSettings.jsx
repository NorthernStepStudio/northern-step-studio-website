import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAppVersionLabel } from '../../core/appInfo';

export default function AdminSettings({ apiStatus, checkApiStatus }) {
    const { theme } = useTheme();
    const { settings, updateSetting } = useAdminSettings();

    const twoFactorOptions = ['off', 'optional', 'required'];
    const nextTwoFactor = () => {
        const currentIndex = twoFactorOptions.indexOf(settings.twoFactorAuth);
        const nextIndex = (currentIndex + 1) % twoFactorOptions.length;
        updateSetting('twoFactorAuth', twoFactorOptions[nextIndex]);
    };

    const clearCache = async () => {
        const confirm = Platform.OS === 'web'
            ? window.confirm('Are you sure you want to clear all cache? This will reset local data.')
            : true;

        if (confirm) {
            try {
                await AsyncStorage.multiRemove([
                    'nexusbuild_bug_reports',
                    'nexusbuild_builds',
                    'nexusbuild_tracked_parts',
                ]);
                Alert.alert('Success', 'Cache cleared successfully!');
                // Wait a bit then check status to refresh things if needed
                setTimeout(checkApiStatus, 1000);
            } catch (error) {
                console.error('Error clearing cache:', error);
            }
        }
    };

    const SettingItem = ({ icon, label, children, danger }) => (
        <View style={[styles.settingItem, { borderBottomColor: theme.colors.glassBorder }]}>
            <View style={styles.settingLeft}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={danger ? theme.colors.error : theme.colors.accentPrimary}
                />
                <Text style={[styles.settingLabel, { color: danger ? theme.colors.error : theme.colors.textPrimary }]}>
                    {label}
                </Text>
            </View>
            {children}
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <GlassCard style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Platform Controls</Text>

                <SettingItem icon="construct-outline" label="Maintenance Mode">
                    <Switch
                        value={settings.maintenanceMode}
                        onValueChange={(value) => updateSetting('maintenanceMode', value)}
                        trackColor={{ false: theme.colors.glassBorder, true: theme.colors.warning }}
                        thumbColor={settings.maintenanceMode ? '#fff' : theme.colors.textMuted}
                    />
                </SettingItem>

                <SettingItem icon="notifications-outline" label="System Notifications">
                    <Switch
                        value={settings.emailNotifications}
                        onValueChange={(value) => updateSetting('emailNotifications', value)}
                        trackColor={{ false: theme.colors.glassBorder, true: theme.colors.success }}
                        thumbColor={settings.emailNotifications ? '#fff' : theme.colors.textMuted}
                    />
                </SettingItem>

                <TouchableOpacity onPress={nextTwoFactor}>
                    <SettingItem icon="shield-checkmark-outline" label="Two-Factor Auth">
                        <View style={[styles.badge, {
                            backgroundColor: settings.twoFactorAuth === 'required' ? '#10B98120' : '#F59E0B20'
                        }]}>
                            <Text style={[styles.badgeText, {
                                color: settings.twoFactorAuth === 'required' ? '#10B981' : '#F59E0B'
                            }]}>
                                {settings.twoFactorAuth.toUpperCase()}
                            </Text>
                        </View>
                    </SettingItem>
                </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>System Diagnostics</Text>

                <TouchableOpacity onPress={checkApiStatus}>
                    <SettingItem icon="server-outline" label="Backend Connection">
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, {
                                backgroundColor: apiStatus.backend === 'healthy' ? '#10B981' : '#EF4444'
                            }]} />
                            <Text style={{ color: apiStatus.backend === 'healthy' ? '#10B981' : '#EF4444' }}>
                                {apiStatus.backend === 'healthy' ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </SettingItem>
                </TouchableOpacity>

                <SettingItem icon="cloud-upload-outline" label="Auto Cloud Sync">
                    <Switch
                        value={settings.cloudSync}
                        onValueChange={(value) => updateSetting('cloudSync', value)}
                        trackColor={{ false: theme.colors.glassBorder, true: theme.colors.success }}
                        thumbColor={settings.cloudSync ? '#fff' : theme.colors.textMuted}
                    />
                </SettingItem>
            </GlassCard>

            <TouchableOpacity style={styles.dangerButton} onPress={clearCache}>
                <GlassCard style={[styles.dangerCard, { backgroundColor: '#EF444410', borderColor: '#EF444440' }]}>
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                    <Text style={[styles.dangerText, { color: '#EF4444' }]}>Clear App Cache</Text>
                </GlassCard>
            </TouchableOpacity>

            <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>
                {getAppVersionLabel('Admin Build')}
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    section: {
        marginBottom: 20,
        borderRadius: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dangerButton: {
        marginTop: 10,
        marginBottom: 20,
    },
    dangerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 10,
    },
    dangerText: {
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
    },
});
