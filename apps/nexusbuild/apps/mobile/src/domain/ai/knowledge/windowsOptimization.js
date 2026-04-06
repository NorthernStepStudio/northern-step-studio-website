/**
 * 🪟 NEXUS AI - Windows Optimization for Gaming
 * 
 * Expert Windows optimization knowledge:
 * - Gaming optimizations
 * - Driver management
 * - Power settings
 * - Game mode and features
 * - Performance tweaks
 * - Startup optimization
 * - Privacy settings that affect performance
 */

// === WINDOWS GAMING SETTINGS ===
export const WINDOWS_GAMING = {
    gameMode: {
        name: 'Game Mode',
        location: 'Settings > Gaming > Game Mode',
        what: 'Prioritizes gaming performance, reduces background activity',
        recommendation: 'Enable (default on in Win 11)',
        impact: 'Minor improvement, mostly prevents updates during gaming',
    },

    gameBar: {
        name: 'Xbox Game Bar',
        location: 'Settings > Gaming > Xbox Game Bar',
        what: 'Overlay for screenshots, recording, stats',
        recommendation: 'Disable if not using (slight performance overhead)',
        note: 'Required for some Xbox features',
    },

    captures: {
        name: 'Captures / Background Recording',
        location: 'Settings > Gaming > Captures',
        what: 'Records last X minutes of gameplay',
        recommendation: 'Disable unless you use it',
        impact: 'Saves GPU resources when disabled',
    },

    hardwareAcceleratedGPU: {
        name: 'Hardware-accelerated GPU Scheduling',
        location: 'Settings > System > Display > Graphics > Default Graphics Settings',
        what: 'GPU handles its own memory management',
        recommendation: 'Enable on modern systems (RTX 10 series+, RX 5000+)',
        impact: 'Can reduce latency, slight FPS improvement in some games',
    },

    variableRefreshRate: {
        name: 'Variable Refresh Rate',
        location: 'Settings > System > Display > Graphics',
        what: 'Enables VRR system-wide',
        recommendation: 'Enable if you have G-Sync/FreeSync monitor',
    },

    optimizationsForWindowedGames: {
        name: 'Optimizations for Windowed Games',
        location: 'Settings > System > Display > Graphics > Default Graphics Settings',
        what: 'Improves windowed/borderless mode performance',
        recommendation: 'Enable',
    },
};

// === POWER SETTINGS ===
export const POWER_SETTINGS = {
    powerPlan: {
        balanced: {
            description: 'Default, balances power and performance',
            gaming: 'Usually fine for gaming',
            note: 'Modern CPUs boost properly on Balanced',
        },
        highPerformance: {
            description: 'Prevents CPU from downclocking',
            gaming: 'Slightly more consistent performance',
            downside: 'Uses more power at idle',
        },
        ultimate: {
            description: 'Hidden plan, maximum performance',
            enable: 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61',
            gaming: 'Marginal benefit over High Performance',
        },
        recommendation: 'Balanced is fine for most. High Performance for competitive.',
    },

    amdRyzen: {
        ryzenBalanced: {
            description: 'AMD-specific power plan',
            install: 'Chipset drivers install this',
            recommendation: 'Use this for Ryzen CPUs',
        },
    },

    laptops: {
        note: 'Laptops should use High Performance when plugged in',
        battery: 'Better Battery options reduce performance significantly',
        pluggedIn: 'Always use High Performance or Best Performance',
    },
};

// === DRIVER MANAGEMENT ===
export const DRIVER_MANAGEMENT = {
    gpu: {
        nvidia: {
            download: 'nvidia.com/drivers or GeForce Experience',
            types: {
                'Game Ready': 'Optimized for new game releases',
                'Studio': 'Optimized for creative apps',
            },
            cleanInstall: 'Check "Perform clean installation" for fresh install',
            ddu: 'Use DDU when switching brands or having issues',
            frequency: 'Update for new games, otherwise if stable don\'t bother',
        },
        amd: {
            download: 'amd.com/drivers or AMD Software',
            types: {
                'Recommended': 'Stable drivers',
                'Optional': 'Latest, may have issues',
            },
            cleanInstall: 'Factory Reset option in installer',
            ddu: 'Use DDU when switching brands or having issues',
        },
        intel: {
            download: 'intel.com or Intel Arc Control',
            note: 'Intel drivers have improved significantly since Arc launch',
        },
    },

    chipset: {
        description: 'Provides features for motherboard chipset',
        source: 'Motherboard manufacturer website OR AMD/Intel',
        importance: 'Important for stability and power management',
        frequency: 'Install once, update only if issues',
    },

    ddu: {
        name: 'Display Driver Uninstaller',
        download: 'guru3d.com/files-details/display-driver-uninstaller-download.html',
        when: [
            'Switching GPU brands (AMD ↔ NVIDIA)',
            'Driver crashes or issues',
            'Clean install wanted',
        ],
        howTo: [
            '1. Download DDU',
            '2. Boot into Safe Mode',
            '3. Run DDU, select GPU vendor',
            '4. Click Clean and Restart',
            '5. Install fresh drivers',
        ],
    },

    windowsUpdate: {
        drivers: 'Windows Update installs basic drivers automatically',
        recommendation: 'Always get GPU drivers from manufacturer, not Windows Update',
        optional: 'Check optional updates for other drivers',
    },
};

// === STARTUP OPTIMIZATION ===
export const STARTUP_OPTIMIZATION = {
    taskManager: {
        location: 'Task Manager > Startup apps',
        action: 'Disable unnecessary startup programs',
        safeToDisable: [
            'Discord', 'Spotify', 'Steam (launches fast anyway)',
            'Adobe apps', 'Office apps', 'Game launchers',
        ],
        keepEnabled: [
            'Antivirus', 'GPU control panel', 'Audio drivers',
            'Cloud sync if needed (OneDrive, Dropbox)',
        ],
    },

    services: {
        location: 'services.msc',
        warning: 'Be careful - breaking services can cause issues',
        safeToDisable: [
            'SysMain/Superfetch (on SSD, marginal)',
            'Windows Search (if you don\'t use search)',
            'Fax', 'Print Spooler (if no printer)',
        ],
        recommendation: 'Leave most services alone unless you know what you\'re doing',
    },

    backgroundApps: {
        location: 'Settings > Apps > Installed Apps > [App] > Advanced options',
        win11: 'Per-app setting for background permissions',
        recommendation: 'Disable background for apps you don\'t need running',
    },
};

// === LATENCY OPTIMIZATION ===
export const LATENCY_OPTIMIZATION = {
    nvidiaReflex: {
        description: 'NVIDIA tech to reduce system latency',
        enable: 'In-game settings (supported games)',
        modes: {
            On: 'Reduces render queue latency',
            'On + Boost': 'Also keeps GPU clock high',
        },
        impact: '20-50% latency reduction',
        requirement: 'NVIDIA GPU, supported game',
    },

    amdAntiLag: {
        description: 'AMD equivalent to NVIDIA Reflex',
        enable: 'AMD Software or in-game',
        warning: 'Anti-Lag+ caused game bans - use regular Anti-Lag only',
    },

    nvidiaControlPanel: {
        lowLatencyMode: {
            location: 'NVIDIA Control Panel > 3D Settings > Low Latency Mode',
            options: {
                Off: 'Maximum render queue (highest latency)',
                On: 'Limits queue to 1 frame',
                Ultra: 'Just-in-time frame submission',
            },
            recommendation: 'On for balance, Ultra for competitive',
        },
        maxFrameRate: {
            description: 'Cap FPS to reduce latency',
            reason: 'Capping 3-5 FPS below refresh reduces input lag',
            example: '144Hz monitor → cap at 141 FPS',
        },
    },

    fullscreenOptimizations: {
        location: 'Right-click .exe > Properties > Compatibility',
        setting: 'Disable fullscreen optimizations',
        impact: 'May reduce latency in some games',
        note: 'Try it if game feels sluggish in borderless',
    },

    mousePrecision: {
        setting: 'Enhance pointer precision',
        location: 'Control Panel > Mouse > Pointer Options',
        recommendation: 'DISABLE for gaming (it\'s acceleration)',
        gamingMice: 'Most gaming mice disable this automatically',
    },
};

// === VISUAL EFFECTS ===
export const VISUAL_EFFECTS = {
    location: 'System Properties > Advanced > Performance Settings',

    options: {
        bestPerformance: {
            description: 'Disables all animations',
            impact: 'Minimal gaming improvement, looks worse',
        },
        bestAppearance: {
            description: 'All animations enabled',
            impact: 'Normal Windows experience',
        },
        custom: {
            recommendation: 'Best balance option',
            keep: [
                'Smooth edges of screen fonts',
                'Show thumbnails instead of icons',
                'Smooth-scroll list boxes',
            ],
            disable: [
                'Animate windows when minimizing/maximizing',
                'Fade or slide menus into view',
                'Show shadows under windows',
            ],
        },
    },

    transparency: {
        location: 'Settings > Personalization > Colors',
        setting: 'Transparency effects',
        recommendation: 'Disable for slight performance boost on old systems',
        impact: 'Negligible on modern systems',
    },
};

// === WINDOWS FEATURES ===
export const WINDOWS_FEATURES = {
    virtualizationBasedSecurity: {
        name: 'VBS / Memory Integrity',
        location: 'Settings > Privacy & Security > Windows Security > Device Security',
        impact: '5-10% performance loss in some games',
        recommendation: 'Disable for maximum gaming performance',
        warning: 'Reduces security. Re-enable for sensitive work.',
    },

    indexing: {
        name: 'Windows Search Indexing',
        location: 'Indexing Options or Services > Windows Search',
        impact: 'Can cause stutters during indexing',
        recommendation: 'Exclude game folders from indexing',
    },

    notifications: {
        location: 'Settings > System > Notifications',
        recommendation: 'Disable during gaming with Focus Assist',
        focusAssist: 'Automatically enables during fullscreen gaming',
    },

    timeZone: {
        issue: 'Some online games require correct time',
        fix: 'Settings > Time & Language > Set time automatically',
    },
};

// === STORAGE OPTIMIZATION ===
export const STORAGE_OPTIMIZATION = {
    diskCleanup: {
        location: 'Disk Cleanup or Settings > System > Storage',
        what: 'Removes temp files, old Windows installations',
        frequency: 'Monthly or when low on space',
    },

    storageSense: {
        location: 'Settings > System > Storage > Storage Sense',
        what: 'Automatic cleanup of temp files',
        recommendation: 'Enable, configure to clean every month',
    },

    gameDrives: {
        recommendation: 'Install games on SSD, not HDD',
        secondary: 'Use separate drive for games if possible',
        pageFile: 'Keep on SSD, Windows-managed size',
    },

    trim: {
        description: 'SSD optimization command',
        automatic: 'Windows runs TRIM automatically on SSDs',
        verify: 'defrag.exe > Select SSD > Should say "OK"',
    },
};

// === NETWORK OPTIMIZATION ===
export const NETWORK_OPTIMIZATION = {
    nagle: {
        name: 'Nagle\'s Algorithm',
        description: 'Delays small packets for efficiency',
        gaming: 'Can add latency',
        disable: 'Registry edit - TcpNoDelay = 1',
        note: 'Some games already disable this',
    },

    dns: {
        description: 'Use fast DNS servers',
        recommended: ['1.1.1.1 (Cloudflare)', '8.8.8.8 (Google)', '9.9.9.9 (Quad9)'],
        change: 'Network adapter settings > IPv4 > Use following DNS',
    },

    qos: {
        name: 'QoS Packet Scheduler',
        myth: 'Windows reserves 20% bandwidth',
        reality: 'Only applies when QoS is active (rarely)',
        action: 'Leave default',
    },
};

// === FRESH INSTALL CHECKLIST ===
export const FRESH_INSTALL_CHECKLIST = {
    order: [
        '1. Install Windows (latest ISO from Microsoft)',
        '2. Run Windows Update until no updates remain',
        '3. Install GPU drivers (from NVIDIA/AMD/Intel site)',
        '4. Install chipset drivers (from motherboard site)',
        '5. Install any other motherboard drivers (LAN, audio)',
        '6. Enable XMP/EXPO in BIOS',
        '7. Configure Windows gaming settings',
        '8. Install game launchers and games',
    ],

    dontInstall: [
        'Driver updater software (usually crapware)',
        'Registry cleaners (don\'t help, can break things)',
        'RAM optimizers (placebo)',
        'Multiple antivirus (one is enough, Windows Defender is fine)',
    ],

    recommended: [
        'Windows Defender (built-in, good enough)',
        'HWiNFO64 (hardware monitoring)',
        'MSI Afterburner (GPU monitoring/OC)',
        '7-Zip (file compression)',
        'VLC (media player)',
    ],
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get optimization recommendations based on hardware age
 */
export const getOptimizationLevel = (systemAge) => {
    if (systemAge === 'old') {
        return {
            priority: 'High',
            tweaks: ['Disable VBS', 'Minimal visual effects', 'Clean startup'],
        };
    }
    if (systemAge === 'mid') {
        return {
            priority: 'Medium',
            tweaks: ['Enable HAGS', 'Clean startup', 'Latest drivers'],
        };
    }
    return {
        priority: 'Low',
        tweaks: ['Modern systems need minimal tweaking', 'Just keep drivers updated'],
    };
};

/**
 * Diagnose performance issue
 */
export const diagnosePerformance = (symptom) => {
    const diagnoses = {
        stuttering: {
            likely: ['Background apps', 'Driver issues', 'RAM issues'],
            check: ['Task Manager for high CPU usage', 'Disable startup apps', 'Update drivers'],
        },
        lowFps: {
            likely: ['Wrong power plan', 'GPU not used', 'Thermals'],
            check: ['Power plan settings', 'Monitor GPU usage', 'Check temperatures'],
        },
        inputLag: {
            likely: ['V-Sync enabled', 'Frame queue', 'Mouse acceleration'],
            check: ['Disable V-Sync', 'Enable Reflex/Anti-Lag', 'Disable pointer precision'],
        },
    };
    return diagnoses[symptom] || { likely: ['Unknown'], check: ['General optimization'] };
};

export default {
    WINDOWS_GAMING,
    POWER_SETTINGS,
    DRIVER_MANAGEMENT,
    STARTUP_OPTIMIZATION,
    LATENCY_OPTIMIZATION,
    VISUAL_EFFECTS,
    WINDOWS_FEATURES,
    STORAGE_OPTIMIZATION,
    NETWORK_OPTIMIZATION,
    FRESH_INSTALL_CHECKLIST,
    getOptimizationLevel,
    diagnosePerformance,
};
