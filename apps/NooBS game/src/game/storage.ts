import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from './types';

const STORAGE_KEY = '@noobs_residency_save_v1';

export async function saveGame(state: GameState): Promise<void> {
    try {
        const jsonValue = JSON.stringify(state);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error("Failed to save game state:", e);
    }
}

export async function loadGame(): Promise<GameState | null> {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error("Failed to load game state:", e);
        return null;
    }
}

export async function clearSave(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error("Failed to clear game save:", e);
    }
}
