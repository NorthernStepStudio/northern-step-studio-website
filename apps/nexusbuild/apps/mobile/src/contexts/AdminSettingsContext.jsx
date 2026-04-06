/**
 * Admin Settings Context
 * Provides global access to admin settings like maintenance mode
 * Settings are stored in AsyncStorage and can be read app-wide
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_SETTINGS_KEY = 'nexusbuild_admin_settings';

const defaultSettings = {
    maintenanceMode: false,
    emailNotifications: true,
    twoFactorAuth: 'optional', // 'off', 'optional', 'required'
    cloudSync: true,
    maintenanceMessage: 'NexusBuild is currently under maintenance. Please check back soon!',
};

const AdminSettingsContext = createContext();

export const useAdminSettings = () => {
    const context = useContext(AdminSettingsContext);
    if (!context) {
        throw new Error('useAdminSettings must be used within AdminSettingsProvider');
    }
    return context;
};

export const AdminSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem(ADMIN_SETTINGS_KEY);
            if (savedSettings) {
                setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
            }
        } catch (error) {
            console.error('Error loading admin settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (newSettings) => {
        try {
            console.log('[AdminSettings] Saving to AsyncStorage:', ADMIN_SETTINGS_KEY, newSettings);
            await AsyncStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
            console.log('[AdminSettings] Save successful');
        } catch (error) {
            console.error('Error saving admin settings:', error);
            // Show error on mobile
            const { Alert, Platform } = require('react-native');
            if (Platform.OS !== 'web') {
                Alert.alert('Error', 'Failed to save settings. Please try again.');
            }
        }
    };

    const updateSetting = async (key, value) => {
        console.log('[AdminSettings] updateSetting called:', key, '=', value);
        const newSettings = { ...settings, [key]: value };
        await saveSettings(newSettings);
        console.log('[AdminSettings] Settings saved:', newSettings);

        // Show feedback on mobile
        const { Alert, Platform } = require('react-native');
        const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
        const formattedValue = typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : value;

        if (Platform.OS !== 'web') {
            Alert.alert('Setting Updated', `${formattedKey}: ${formattedValue}`);
        }

        return newSettings;
    };

    const isMaintenanceMode = settings.maintenanceMode;
    const isCloudSyncEnabled = settings.cloudSync;
    const isEmailNotificationsEnabled = settings.emailNotifications;
    const twoFactorAuthMode = settings.twoFactorAuth;

    return (
        <AdminSettingsContext.Provider
            value={{
                settings,
                loading,
                updateSetting,
                saveSettings,
                loadSettings,
                // Convenience getters
                isMaintenanceMode,
                isCloudSyncEnabled,
                isEmailNotificationsEnabled,
                twoFactorAuthMode,
            }}
        >
            {children}
        </AdminSettingsContext.Provider>
    );
};

export default AdminSettingsContext;
