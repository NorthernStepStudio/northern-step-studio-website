import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorageTools, type ToolContract } from '@nss/response-os';

export function createNoobsStorageTools(): ToolContract[] {
  return createStorageTools({
    async get(key: string) {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return undefined;

      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return raw;
      }
    },
    async set(key: string, value: unknown) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    },
  });
}
