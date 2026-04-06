import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const STORAGE_KEYS = {
    CLOUD_SYNC_ENABLED: 'provly_cloud_sync_enabled',
    AI_CLOUD_ENABLED: 'provly_ai_cloud_enabled',
};

interface NetworkState {
    // Auto-detected
    isOnline: boolean;
    isCheckingConnection: boolean;

    // User preferences
    cloudSyncEnabled: boolean;
    aiCloudEnabled: boolean;

    // Actions
    setOnline: (online: boolean) => void;
    toggleCloudSync: () => Promise<void>;
    toggleAICloud: () => Promise<void>;
    loadPreferences: () => Promise<void>;
    checkConnection: () => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
    isOnline: true, // Optimistic default
    isCheckingConnection: false,
    cloudSyncEnabled: true, // Default ON
    aiCloudEnabled: true, // Default ON

    setOnline: (online) => set({ isOnline: online }),

    toggleCloudSync: async () => {
        const newValue = !get().cloudSyncEnabled;
        set({ cloudSyncEnabled: newValue });
        await AsyncStorage.setItem(STORAGE_KEYS.CLOUD_SYNC_ENABLED, JSON.stringify(newValue));
    },

    toggleAICloud: async () => {
        const newValue = !get().aiCloudEnabled;
        set({ aiCloudEnabled: newValue });
        await AsyncStorage.setItem(STORAGE_KEYS.AI_CLOUD_ENABLED, JSON.stringify(newValue));
    },

    loadPreferences: async () => {
        try {
            const [cloudSync, aiCloud] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.CLOUD_SYNC_ENABLED),
                AsyncStorage.getItem(STORAGE_KEYS.AI_CLOUD_ENABLED),
            ]);

            set({
                cloudSyncEnabled: cloudSync !== null ? JSON.parse(cloudSync) : true,
                aiCloudEnabled: aiCloud !== null ? JSON.parse(aiCloud) : true,
            });
        } catch (error) {
            console.warn('Failed to load network preferences:', error);
        }
    },

    checkConnection: async () => {
        set({ isCheckingConnection: true });
        try {
            const state = await NetInfo.fetch();
            const online = !!(state.isConnected && state.isInternetReachable !== false);
            set({ isOnline: online, isCheckingConnection: false });
            return online;
        } catch (error) {
            console.warn('Connection check failed:', error);
            set({ isCheckingConnection: false });
            return false;
        }
    },
}));

// Helper hook for computed "should use cloud" states
export const useCloudStatus = () => {
    const { isOnline, cloudSyncEnabled, aiCloudEnabled } = useNetworkStore();

    return {
        canSync: isOnline && cloudSyncEnabled,
        canUseCloudAI: isOnline && aiCloudEnabled,
        isOnline,
        cloudSyncEnabled,
        aiCloudEnabled,
    };
};
