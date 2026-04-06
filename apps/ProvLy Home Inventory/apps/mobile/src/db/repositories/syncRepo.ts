import { getDB } from '../index';

export const syncRepo = {
    async getSyncState(key: string): Promise<string | null> {
        const db = await getDB();
        const result = await db.getFirstAsync<{ value: string }>(
            `SELECT value FROM sync_state WHERE key = ?`,
            [key]
        );
        return result ? result.value : null;
    },

    async setSyncState(key: string, value: string): Promise<void> {
        const db = await getDB();
        await db.runAsync(
            `INSERT INTO sync_state (key, value) VALUES (?, ?) 
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            [key, value]
        );
    }
};
