import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYDAY_NOTIFICATION_KEY = '@noobs_payday_notification_id';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === 'granted';
}

export async function scheduleBreakingNews(title: string, body: string, seconds: number = 2) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `🚨 BREAKING NEWS: ${title}`,
            body: body,
            data: { type: 'BREAKING_NEWS' },
        },
        trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false
        },
    });
}

export async function schedulePaydayAlert(jobTitle: string) {
    const existingId = await AsyncStorage.getItem(PAYDAY_NOTIFICATION_KEY);
    if (existingId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(existingId);
        } catch (e) {
            // ignore cancellation errors
        }
    }
    // Schedule a notification for 4 hours from now to simulate activity
    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: "💰 PROTOCOL: PAY DAY",
            body: `Funds from ${jobTitle.replace(/_/g, ' ')} have been settled in your liquid cash account.`,
            data: { type: 'PAYDAY' },
        },
        trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 3600 * 4,
            repeats: false
        },
    });
    await AsyncStorage.setItem(PAYDAY_NOTIFICATION_KEY, id);
}

export async function cancelPaydayAlert() {
    const existingId = await AsyncStorage.getItem(PAYDAY_NOTIFICATION_KEY);
    if (existingId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(existingId);
        } catch (e) {
            // ignore cancellation errors
        }
        await AsyncStorage.removeItem(PAYDAY_NOTIFICATION_KEY);
    }
}
