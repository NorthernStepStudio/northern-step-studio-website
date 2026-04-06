/**
 * Simple Centralized State Management
 * Used to share backend URL and selected voice across tabs.
 */

export let STUDIO_CONFIG = {
    backendUrl: "https://neural-studio.loca.lt",
    selectedVoice: "blended_hybrid",
    pitch: 1.0,
    valence: 0.0,
    arousal: 0.0,
    baseValence: 0.0,
    baseArousal: 0.0
};

export const updateStudioConfig = (updates: Partial<typeof STUDIO_CONFIG>) => {
    STUDIO_CONFIG = {
        ...STUDIO_CONFIG,
        ...updates
    };
};
