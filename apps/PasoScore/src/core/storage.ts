import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistedState } from './types';

const STORAGE_KEY = 'credit_builder_companion_state_v1';

export const loadPersistedState = async (): Promise<PersistedState | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedState;
    return parsed;
  } catch {
    return null;
  }
};

export const savePersistedState = async (state: PersistedState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures in v0; app remains functional in-memory.
  }
};

export const clearPersistedState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures in v0; app remains functional in-memory.
  }
};
