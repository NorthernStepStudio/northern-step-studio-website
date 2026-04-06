import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'STUDIO_BACKEND_URL';
const DEFAULT_URL = 'http://192.168.1.166:8001';

export const saveBackendUrl = async (url: string) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, url);
    } catch (e) {
        console.error('Failed to save backend URL', e);
    }
};

export const getBackendUrlResource = async () => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        return value || DEFAULT_URL;
    } catch (e) {
        console.error('Failed to load backend URL', e);
        return DEFAULT_URL;
    }
};
