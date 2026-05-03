import { getDB } from '../index';
import * as Crypto from 'expo-crypto';

export interface Activity {
    id: string;
    type: 'item_added' | 'item_deleted' | 'room_added' | 'room_deleted' | 'home_added' | 'home_deleted' | 'item_updated' | 'room_updated' | 'home_updated' | 'autopilot_engaged';
    title: string;
    subtitle?: string;
    timestamp: string;
    homeId: string;
}

export const activitiesRepo = {
    async logActivity(input: {
        type: Activity['type'];
        title: string;
        subtitle?: string;
        homeId: string;
    }): Promise<Activity> {
        const db = await getDB();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO activities (id, type, title, subtitle, timestamp, home_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, input.type, input.title, input.subtitle || null, now, input.homeId]
        );

        return {
            id,
            type: input.type,
            title: input.title,
            subtitle: input.subtitle,
            timestamp: now,
            homeId: input.homeId,
        };
    },

    async listRecentActivities(homeId: string, limit: number = 10): Promise<Activity[]> {
        const db = await getDB();
        const results = await db.getAllAsync<any>(
            `SELECT id, type, title, subtitle, timestamp, home_id as homeId
             FROM activities
             WHERE home_id = ?
             ORDER BY timestamp DESC
             LIMIT ?`,
            [homeId, limit]
        );

        return results.map(row => ({
            id: row.id,
            type: row.type as Activity['type'],
            title: row.title,
            subtitle: row.subtitle,
            timestamp: row.timestamp,
            homeId: row.homeId,
        }));
    },

    async clearActivities(homeId: string): Promise<void> {
        const db = await getDB();
        await db.runAsync('DELETE FROM activities WHERE home_id = ?', [homeId]);
    }
};
