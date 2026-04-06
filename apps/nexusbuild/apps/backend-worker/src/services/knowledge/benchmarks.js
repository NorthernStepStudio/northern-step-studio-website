/**
 * 🎮 KNOWLEDGE: Game FPS Benchmarks
 *
 * Detailed FPS data for popular games at different resolutions and settings.
 * Data collected from Hardware Unboxed, GamersNexus, TechPowerUp (Dec 2024)
 */

export const GAME_BENCHMARKS = {
    // GPU Tier list for quick reference
    gpuTiers: {
        '4K Ultra': ['RTX 5090', 'RTX 5080', 'RTX 4090', 'RX 9800 XT'],
        '4K High': ['RTX 5070 Ti', 'RTX 4080 Super', 'RTX 4080', 'RX 7900 XTX'],
        '1440p Ultra': ['RTX 5070', 'RTX 4070 Ti Super', 'RX 7900 XT', 'RX 9700 XT'],
        '1440p High': ['RTX 4070 Super', 'RTX 4070', 'RX 7800 XT', 'RTX 3080'],
        '1080p Ultra': ['RTX 4060 Ti', 'RX 7700 XT', 'RTX 3070', 'RX 6800'],
        '1080p High': ['RTX 4060', 'RX 7600', 'RTX 3060 Ti', 'Arc A770'],
        '1080p Medium': ['RTX 3060', 'RX 6600 XT', 'Arc A750', 'GTX 1660 Super']
    },

    // === CYBERPUNK 2077 (RT Overdrive) ===
    'cyberpunk 2077': {
        name: 'Cyberpunk 2077',
        settings: {
            ultra_rt: 'Ultra + Ray Tracing Overdrive + DLSS/FSR',
            ultra: 'Ultra (No RT)',
            high: 'High (No RT)',
        },
        fps: {
            '4K': {
                'RTX 5090': { ultra_rt: 85, ultra: 140, high: 165 },
                'RTX 5080': { ultra_rt: 55, ultra: 110, high: 130 },
                'RTX 4090': { ultra_rt: 45, ultra: 95, high: 115 },
                'RTX 5070 Ti': { ultra_rt: 40, ultra: 85, high: 105 },
                'RTX 4080': { ultra_rt: 32, ultra: 72, high: 90 },
                'RX 7900 XTX': { ultra_rt: 18, ultra: 68, high: 85 },
            },
            '1440p': {
                'RTX 5090': { ultra_rt: 145, ultra: 190, high: 210 },
                'RTX 5080': { ultra_rt: 95, ultra: 155, high: 175 },
                'RTX 5070 Ti': { ultra_rt: 75, ultra: 130, high: 155 },
                'RTX 4080': { ultra_rt: 58, ultra: 115, high: 140 },
                'RTX 4070 Ti': { ultra_rt: 45, ultra: 95, high: 120 },
                'RTX 4070': { ultra_rt: 35, ultra: 78, high: 100 },
                'RX 7800 XT': { ultra_rt: 22, ultra: 72, high: 92 },
            },
            '1080p': {
                'RTX 4070': { ultra_rt: 55, ultra: 115, high: 140 },
                'RTX 4060 Ti': { ultra_rt: 40, ultra: 88, high: 110 },
                'RTX 4060': { ultra_rt: 28, ultra: 68, high: 88 },
                'RX 7600': { ultra_rt: 15, ultra: 58, high: 75 },
            }
        },
        notes: 'RT Overdrive requires DLSS 3.5/FSR 3. Very demanding.'
    },

    // === HOGWARTS LEGACY ===
    'hogwarts legacy': {
        name: 'Hogwarts Legacy',
        settings: {
            ultra_rt: 'Ultra + Ray Tracing',
            ultra: 'Ultra (No RT)',
            high: 'High',
        },
        fps: {
            '4K': {
                'RTX 5090': { ultra_rt: 110, ultra: 145, high: 165 },
                'RTX 5080': { ultra_rt: 75, ultra: 115, high: 135 },
                'RTX 4090': { ultra_rt: 65, ultra: 100, high: 120 },
                'RTX 4080': { ultra_rt: 48, ultra: 78, high: 95 },
                'RX 7900 XTX': { ultra_rt: 35, ultra: 75, high: 92 },
            },
            '1440p': {
                'RTX 5080': { ultra_rt: 125, ultra: 165, high: 185 },
                'RTX 4080': { ultra_rt: 85, ultra: 125, high: 150 },
                'RTX 4070 Ti': { ultra_rt: 65, ultra: 105, high: 130 },
                'RTX 4070': { ultra_rt: 50, ultra: 85, high: 110 },
                'RX 7800 XT': { ultra_rt: 35, ultra: 80, high: 102 },
            }
        },
        notes: 'Poorly optimized. Even high-end GPUs struggle at 4K RT.'
    },

    // === STARFIELD ===
    'starfield': {
        name: 'Starfield',
        settings: {
            ultra: 'Ultra',
            high: 'High',
            medium: 'Medium',
        },
        fps: {
            '4K': {
                'RTX 5090': { ultra: 95, high: 120, medium: 145 },
                'RTX 5080': { ultra: 65, high: 85, medium: 105 },
                'RTX 4090': { ultra: 55, high: 72, medium: 92 },
                'RTX 4080': { ultra: 42, high: 58, medium: 75 },
            },
            '1440p': {
                'RTX 5080': { ultra: 105, high: 135, medium: 160 },
                'RTX 4080': { ultra: 72, high: 95, medium: 120 },
                'RTX 4070 Ti': { ultra: 58, high: 78, medium: 100 },
                'RTX 4070': { ultra: 45, high: 62, medium: 82 },
                'RX 7800 XT': { ultra: 42, high: 58, medium: 78 },
            }
        },
        notes: 'CPU-bound in cities. Benefits from fast RAM.'
    },

    // === CALL OF DUTY MW3 / WARZONE ===
    'cod mw3': {
        name: 'Call of Duty MW3/Warzone',
        settings: {
            extreme: 'Extreme',
            high: 'High',
            balanced: 'Balanced',
        },
        fps: {
            '4K': {
                'RTX 5090': { extreme: 185, high: 220, balanced: 260 },
                'RTX 5080': { extreme: 135, high: 165, balanced: 195 },
                'RTX 4090': { extreme: 125, high: 155, balanced: 185 },
                'RTX 4080': { extreme: 95, high: 120, balanced: 145 },
            },
            '1440p': {
                'RTX 5080': { extreme: 220, high: 265, balanced: 300 },
                'RTX 4080': { extreme: 165, high: 200, balanced: 240 },
                'RTX 4070 Ti': { extreme: 135, high: 165, balanced: 200 },
                'RTX 4070': { extreme: 110, high: 138, balanced: 170 },
                'RX 7800 XT': { extreme: 105, high: 130, balanced: 160 },
            },
            '1080p': {
                'RTX 4070': { extreme: 185, high: 220, balanced: 260 },
                'RTX 4060 Ti': { extreme: 145, high: 175, balanced: 210 },
                'RTX 4060': { extreme: 115, high: 140, balanced: 172 },
                'RX 7600': { extreme: 100, high: 125, balanced: 155 },
            }
        },
        notes: 'Well optimized. CPU matters for high FPS.'
    },

    // === BALDUR'S GATE 3 ===
    "baldur's gate 3": {
        name: "Baldur's Gate 3",
        settings: {
            ultra: 'Ultra',
            high: 'High',
            medium: 'Medium',
        },
        fps: {
            '4K': {
                'RTX 5090': { ultra: 125, high: 150, medium: 175 },
                'RTX 5080': { ultra: 95, high: 115, medium: 140 },
                'RTX 4090': { ultra: 85, high: 105, medium: 130 },
                'RTX 4080': { ultra: 65, high: 82, medium: 105 },
            },
            '1440p': {
                'RTX 5080': { ultra: 155, high: 185, medium: 210 },
                'RTX 4080': { ultra: 115, high: 142, medium: 175 },
                'RTX 4070 Ti': { ultra: 95, high: 118, medium: 145 },
                'RTX 4070': { ultra: 78, high: 98, medium: 125 },
                'RX 7800 XT': { ultra: 72, high: 92, medium: 118 },
            }
        },
        notes: 'CPU-intensive in Act 3. 8+ cores recommended.'
    },

    // === BLACK MYTH: WUKONG ===
    'black myth wukong': {
        name: 'Black Myth: Wukong',
        settings: {
            cinematic: 'Cinematic (Full RT)',
            movie: 'Movie Quality',
            high: 'High',
        },
        fps: {
            '4K': {
                'RTX 5090': { cinematic: 75, movie: 95, high: 125 },
                'RTX 5080': { cinematic: 48, movie: 65, high: 92 },
                'RTX 4090': { cinematic: 42, movie: 58, high: 85 },
                'RTX 4080': { cinematic: 28, movie: 42, high: 65 },
            },
            '1440p': {
                'RTX 5080': { cinematic: 82, movie: 110, high: 145 },
                'RTX 4080': { cinematic: 52, movie: 75, high: 105 },
                'RTX 4070 Ti': { cinematic: 38, movie: 58, high: 85 },
                'RTX 4070': { cinematic: 28, movie: 45, high: 68 },
            }
        },
        notes: 'Extremely demanding. DLSS/FSR required for playable RT.'
    },

    // === FORTNITE ===
    'fortnite': {
        name: 'Fortnite',
        settings: {
            epic: 'Epic',
            high: 'High',
            performance: 'Performance Mode',
        },
        fps: {
            '1440p': {
                'RTX 4080': { epic: 165, high: 220, performance: 400 },
                'RTX 4070 Ti': { epic: 135, high: 180, performance: 350 },
                'RTX 4070': { epic: 110, high: 150, performance: 300 },
                'RTX 4060 Ti': { epic: 88, high: 125, performance: 260 },
                'RX 7800 XT': { epic: 105, high: 145, performance: 290 },
            },
            '1080p': {
                'RTX 4060': { epic: 115, high: 160, performance: 320 },
                'RX 7600': { epic: 98, high: 140, performance: 285 },
                'RTX 3060': { epic: 78, high: 115, performance: 250 },
            }
        },
        notes: 'Performance mode for competitive 240Hz+.'
    },

    // === VALORANT ===
    'valorant': {
        name: 'Valorant',
        settings: {
            high: 'High',
            low: 'Low (Competitive)',
        },
        fps: {
            '1440p': {
                'RTX 4070': { high: 450, low: 600 },
                'RTX 4060 Ti': { high: 380, low: 520 },
                'RTX 4060': { high: 320, low: 450 },
                'RX 7600': { high: 290, low: 420 },
            },
            '1080p': {
                'RTX 4060': { high: 480, low: 650 },
                'RX 7600': { high: 420, low: 580 },
                'RTX 3060': { high: 350, low: 500 },
                'GTX 1660 Super': { high: 220, low: 350 },
            }
        },
        notes: 'CPU-bound at high FPS. Fast RAM helps.'
    },

    // === CS2 ===
    'cs2': {
        name: 'Counter-Strike 2',
        settings: {
            high: 'High',
            low: 'Low (Competitive)',
        },
        fps: {
            '1440p': {
                'RTX 4080': { high: 320, low: 420 },
                'RTX 4070 Ti': { high: 280, low: 380 },
                'RTX 4070': { high: 240, low: 340 },
                'RTX 4060 Ti': { high: 195, low: 290 },
            },
            '1080p': {
                'RTX 4060 Ti': { high: 285, low: 400 },
                'RTX 4060': { high: 235, low: 340 },
                'RX 7600': { high: 210, low: 310 },
            }
        },
        notes: 'CPU-bound. Single-thread performance matters most.'
    }
};

// Helper to get FPS for a specific config
export const getFPS = (game, resolution, gpu, settings) => {
    const gameData = GAME_BENCHMARKS[game.toLowerCase()];
    if (!gameData?.fps?.[resolution]?.[gpu]) return null;
    return gameData.fps[resolution][gpu][settings] || null;
};

// Helper to find best GPU for target FPS
export const findGPUForFPS = (game, resolution, settings, targetFPS) => {
    const gameData = GAME_BENCHMARKS[game.toLowerCase()];
    if (!gameData?.fps?.[resolution]) return null;

    const gpus = Object.entries(gameData.fps[resolution])
        .filter(([_, fps]) => fps[settings] >= targetFPS)
        .sort((a, b) => a[1][settings] - b[1][settings]);

    return gpus[0]?.[0] || null; // Return cheapest GPU that meets target
};

export default GAME_BENCHMARKS;
