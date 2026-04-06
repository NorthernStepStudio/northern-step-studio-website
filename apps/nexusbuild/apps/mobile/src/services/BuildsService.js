// Mobile Builds Service
// Handles fetching curated and trending builds with Offline-First architecture

import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildsAPI } from './api';

const CACHE_KEY_TRENDING = 'cache_trending_builds_v3';

export const BuildsService = {
    /**
     * Fetch trending builds for the home page.
     * Strategy: Network First -> Fallback to Cache -> Fallback to Mock
     */
    getTrendingBuilds: async () => {
        try {
            // 1. Try Network
            const data = await buildsAPI.getAll(); // Using getAll as proxy for trending for now
            const normalized = Array.isArray(data)
                ? data
                : Array.isArray(data?.builds)
                    ? data.builds
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];

            if (normalized.length > 0) {
                // Save to cache
                await AsyncStorage.setItem(CACHE_KEY_TRENDING, JSON.stringify(normalized));
                return normalized;
            }
        } catch (error) {
            // Network failed, fallback to cache
        }

        // 2. Fallback to Cache
        try {
            const cachedData = await AsyncStorage.getItem(CACHE_KEY_TRENDING);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (cacheError) {
            console.error('Cache read failed', cacheError);
        }

        // 3. Fallback to Mock (if no cache matches)
        return [
            {
                id: 1,
                name: 'Ultimate Gaming Rig (Offline)',
                author: 'NexusPro_01',
                price: 3450,
                parts: 8,
                image: 'gaming_rig',
                specs: ['Intel Core i9-14900K', 'NVIDIA RTX 4090', '64GB DDR5 RAM'],
            },
            {
                id: 2,
                name: 'Budget Beast 2025 (Offline)',
                author: 'ThriftyGamer',
                price: 850,
                parts: 6,
                image: 'budget_pc',
                specs: ['AMD Ryzen 5 7600', 'Radeon RX 7600', '16GB DDR5 RAM'],
            },
            {
                id: 3,
                name: 'Creator Workstation (Offline)',
                author: 'VideoEditorX',
                price: 2200,
                parts: 7,
                image: 'workstation',
                specs: ['AMD Ryzen 9 7950X', 'NVIDIA RTX 4070 Ti', '2TB NVMe Gen5'],
            },
        ];
    },

    /**
     * Get details for a specific build
     */
    getBuildDetails: async (buildId) => {
        try {
            return await buildsAPI.getById(buildId);
        } catch (error) {
            // Add detailed caching logic here later
            return null;
        }
    }
};
