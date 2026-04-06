import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BlackSwanEvent {
    id: string;
    timestamp: string;
    type: 'CRASH' | 'CORRECTION' | 'MOON';
    headline: string;
    magnitude: number;
}

const EVENTS_KEY = 'noobs_black_swan_events';

export async function logBlackSwanEvent(event: Omit<BlackSwanEvent, 'id' | 'timestamp'>) {
    try {
        const stored = await AsyncStorage.getItem(EVENTS_KEY);
        const events: BlackSwanEvent[] = stored ? JSON.parse(stored) : [];

        const newEvent: BlackSwanEvent = {
            ...event,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };

        // Keep last 50 events
        const updated = [newEvent, ...events].slice(0, 50);
        await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to log event', e);
    }
}

export async function getBlackSwanEvents(): Promise<BlackSwanEvent[]> {
    try {
        const stored = await AsyncStorage.getItem(EVENTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export async function clearBlackSwanEvents() {
    await AsyncStorage.removeItem(EVENTS_KEY);
}
