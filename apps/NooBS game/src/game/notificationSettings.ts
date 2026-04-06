import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationFrequency = "LOW" | "STANDARD" | "HIGH";

export type NotificationSettings = {
    enabled: boolean;
    payday: boolean;
    breakingNews: boolean;
    frequency: NotificationFrequency;
};

const STORAGE_KEY = "@noobs_notification_settings_v1";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    enabled: true,
    payday: true,
    breakingNews: false,
    frequency: "STANDARD",
};

export async function loadNotificationSettings(): Promise<NotificationSettings> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
        const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
        return {
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...parsed,
        };
    } catch (e) {
        return DEFAULT_NOTIFICATION_SETTINGS;
    }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        // ignore save errors
    }
}
