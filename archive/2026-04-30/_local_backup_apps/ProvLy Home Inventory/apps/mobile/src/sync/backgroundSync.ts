import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { syncEngine } from './syncEngine';

const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        const now = new Date();
        console.log(`[BackgroundSync] Starting sync at ${now.toISOString()}`);

        // Check if sync is needed/enabled
        await syncEngine.sync();

        console.log(`[BackgroundSync] Sync completed`);
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('[BackgroundSync] Failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const backgroundSync = {
    async register() {
        try {
            const status = await BackgroundFetch.getStatusAsync();
            if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
                console.log('[BackgroundSync] Background fetch restricted');
                return;
            }

            await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
                minimumInterval: 15 * 60, // 15 minutes
                stopOnTerminate: false, // Android only
                startOnBoot: true, // Android only
            });
            console.log('[BackgroundSync] Task registered');
        } catch (err: any) {
            if (err?.message?.includes('Background Fetch has not been configured')) {
                console.log('[BackgroundSync] Skipped (Requires Dev Build/Prebuild)');
            } else {
                console.error('[BackgroundSync] Register failed:', err);
            }
        }
    },

    async unregister() {
        try {
            await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
        } catch (err) {
            console.log('[BackgroundSync] Unregister failed (task might not exist)');
        }
    }
};
