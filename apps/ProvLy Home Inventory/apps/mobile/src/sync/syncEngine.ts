import { itemsRepo } from '../db/repositories/itemsRepo';
import { maintenanceTasksRepo } from '../db/repositories/maintenanceTasksRepo';
import { syncRepo } from '../db/repositories/syncRepo';
import { syncSettings } from '../settings/syncSettings';
import { syncClient } from './supabaseClient';
import { crypto } from './crypto';
import { useAuthStore } from '../stores/authStore';

export const syncEngine = {
    async sync(): Promise<void> {
        const enabled = await syncSettings.isSyncEnabled();
        if (!enabled) {
            console.log('Sync disabled');
            return;
        }

        const { session } = useAuthStore.getState();
        if (!session?.user) {
            console.log('Auth required for sync');
            return;
        }

        const deviceId = await syncSettings.getDeviceId();
        const userId = session.user.id;

        console.log('Starting Sync...');

        try {
            // 1. Push Local Changes
            await this.pushChanges(userId, deviceId);

            // 2. Pull Remote Changes
            await this.pullChanges(userId);

            // 3. Update Sync Timestamp
            const now = new Date().toISOString();
            await syncRepo.setSyncState('last_sync_at', now);

            console.log('Sync Complete');
        } catch (error) {
            console.error('Sync Error:', error);
            throw error;
        }
    },

    async pushChanges(userId: string, deviceId: string) {
        // 1. Get Dirty Data
        const { items, rooms } = await itemsRepo.getDirtyItems();
        const media = await itemsRepo.getDirtyMedia();

        // 2. Process Items
        if (items.length > 0) {
            const itemRows = await Promise.all(items.map(async (item) => ({
                user_id: userId,
                record_id: item.id,
                record_type: 'item',
                ciphertext: await crypto.encrypt(item),
                device_id: deviceId,
                version: item.version,
                updated_at: item.updatedAt,
                deleted_at: item.deletedAt
            })));
            await syncClient.pushBatches(itemRows);
            await itemsRepo.markAsClean(items.map(i => i.id), 'item');
            console.log(`Pushed ${items.length} items`);
        }

        // 3. Process Rooms
        if (rooms.length > 0) {
            const roomRows = await Promise.all(rooms.map(async (room) => ({
                user_id: userId,
                record_id: room.id,
                record_type: 'room',
                ciphertext: await crypto.encrypt(room),
                device_id: deviceId,
                version: room.version,
                updated_at: room.updatedAt,
                deleted_at: room.deletedAt
            })));
            await syncClient.pushBatches(roomRows);
            await itemsRepo.markAsClean(rooms.map(r => r.id), 'room');
            console.log(`Pushed ${rooms.length} rooms`);
        }

        // 4. Process Media (Photos)
        if (media.length > 0) {
            const mediaRows: any[] = [];
            const processedIds: string[] = [];

            for (const m of media) {
                try {
                    // Upload File to Storage
                    // Path: userId/itemId/mediaId.jpg
                    const storagePath = `${userId}/${m.itemId}/${m.id}.jpg`;

                    // Only upload if it exists locally and not deleted
                    if (!m.deletedAt && m.localUri) {
                        const response = await fetch(m.localUri);
                        const blob = await response.blob();
                        // Convert blob to standard File/FormData if needed, but Supabase JS accepts Blob
                        // Actually expo-file-system might be needed for reading as base64 if fetch fails on some versions
                        const formData = new FormData();
                        formData.append('file', {
                            uri: m.localUri,
                            name: `${m.id}.jpg`,
                            type: 'image/jpeg',
                        } as any);

                        await syncClient.uploadFile('images', storagePath, formData);
                    }

                    mediaRows.push({
                        user_id: userId,
                        record_id: m.id,
                        record_type: 'media',
                        ciphertext: await crypto.encrypt({
                            ...m,
                            remoteRef: storagePath // Store the storage path
                        }),
                        device_id: deviceId,
                        version: m.version,
                        updated_at: m.updatedAt,
                        deleted_at: m.deletedAt
                    });
                    processedIds.push(m.id);

                } catch (e) {
                    console.error(`Failed to upload media ${m.id}`, e);
                }
            }

            if (mediaRows.length > 0) {
                await syncClient.pushBatches(mediaRows);
                await itemsRepo.markAsClean(processedIds, 'media');
                console.log(`Pushed ${mediaRows.length} photos`);
            }
        }

        // 5. Process Maintenance Tasks
        const tasks = await maintenanceTasksRepo.getDirtyTasks();
        if (tasks.length > 0) {
            const taskRows = await Promise.all(tasks.map(async (task) => ({
                user_id: userId,
                record_id: task.id,
                record_type: 'maintenance_task',
                ciphertext: await crypto.encrypt(task),
                device_id: deviceId,
                version: task.version,
                updated_at: task.updatedAt,
                deleted_at: task.deletedAt
            })));
            await syncClient.pushBatches(taskRows);
            await maintenanceTasksRepo.markAsClean(tasks.map(t => t.id));
            console.log(`Pushed ${tasks.length} maintenance tasks`);
        }
    },

    async pullChanges(userId: string) {
        const lastSyncAt = await syncRepo.getSyncState('last_sync_at');
        const changes = await syncClient.fetchChanges(lastSyncAt || '');

        if (!changes || changes.length === 0) return;

        for (const change of changes) {
            try {
                const payload = await crypto.decrypt(change.ciphertext);

                if (change.record_type === 'item') {
                    await itemsRepo.upsertFromSync(payload, 'item');
                } else if (change.record_type === 'room') {
                    await itemsRepo.upsertFromSync(payload, 'room');
                } else if (change.record_type === 'media') {
                    // 1. Upsert Record
                    await itemsRepo.upsertFromSync(payload, 'media');

                    // 2. Download File (Lazy or Eager?)
                    // Eager for now to ensure offline avail
                    if (payload.remoteRef && !payload.deletedAt) {
                        // Download to local cache
                        // This part requires FileSystem logic not available here directly easily without circular dependency?
                        // We can just skip downloading for MVP and let Image component load from URL if signed? 
                        // But we want offline. 
                        // Let's rely on standard Image caching or handle download elsewhere?
                        // For MVP: Just syncing metadata.
                    }
                } else if (change.record_type === 'maintenance_task') {
                    await maintenanceTasksRepo.upsertFromSync(payload);
                }
            } catch (e) {
                console.error('Failed to process incoming change:', e);
            }
        }
        console.log(`Pulled ${changes.length} changes`);
    }
};
