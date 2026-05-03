import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SYNC_ENABLED_KEY = 'provly_sync_enabled';
const DEVICE_ID_KEY = 'provly_device_id';

export const syncSettings = {
    async isSyncEnabled(): Promise<boolean> {
        const result = await SecureStore.getItemAsync(SYNC_ENABLED_KEY);
        return result === 'true';
    },

    async setSyncEnabled(enabled: boolean): Promise<void> {
        await SecureStore.setItemAsync(SYNC_ENABLED_KEY, String(enabled));
    },

    async getDeviceId(): Promise<string> {
        let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = Crypto.randomUUID();
            await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
        }
        return deviceId;
    }
};
