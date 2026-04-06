/**
 * 📈 NEXUS AI - Upgrade Paths & Future-Proofing Guide
 * 
 * Expert knowledge on when and what to upgrade:
 * - When to upgrade each component
 * - Upgrade priority matrix
 * - Platform longevity
 * - Future-proofing analysis
 * - Budget allocation for upgrades
 * - Bottleneck identification
 */

// === WHEN TO UPGRADE ===
export const WHEN_TO_UPGRADE = {
    gpu: {
        signs: [
            'Can\'t hit 60 FPS on low settings in new games',
            'Upgrading to higher resolution monitor',
            'New games require features you don\'t have (RT, DLSS 3)',
            'VRAM limit causing stuttering',
        ],
        typical_lifespan: '3-5 years for 1080p, 2-4 years for 1440p/4K',
        recommendation: 'Wait for 50%+ performance improvement to be worthwhile',
        avoid: 'Don\'t upgrade for <30% improvement unless selling old card covers most cost',
    },

    cpu: {
        signs: [
            'GPU usage consistently under 90% (CPU bottleneck)',
            'Poor 1% lows despite decent averages',
            'Stuttering in CPU-heavy games (cities, simulation)',
            'Slow workstation tasks (rendering, compiling)',
        ],
        typical_lifespan: '4-6 years',
        recommendation: 'CPUs last longer than GPUs. Only upgrade for clear bottleneck.',
        note: 'Often requires new motherboard + RAM = expensive full platform upgrade',
    },

    ram: {
        signs: [
            'Using more than 80% RAM regularly',
            'Game requirements exceed your capacity',
            'Still on 8GB in 2024+',
        ],
        typical_lifespan: '6-8+ years (if sufficient capacity)',
        recommendation: 'Add matching RAM or upgrade to larger capacity when needed',
    },

    storage: {
        signs: [
            'Running out of space frequently',
            'Still on HDD for games (long load times)',
            'Old SSD showing wear (CrystalDiskInfo warnings)',
        ],
        typical_lifespan: 'SSDs: 5-10+ years, HDDs: 3-5 years',
        recommendation: 'Add NVMe for games, use HDD for bulk storage',
    },

    psu: {
        signs: [
            'Upgrading to high-power GPU',
            'Crashes under heavy load',
            'PSU is 7+ years old',
            'Current wattage insufficient for new hardware',
        ],
        typical_lifespan: '8-12 years for quality units',
        recommendation: 'Upgrade when adding high-power components or old unit fails',
    },

    monitor: {
        signs: [
            'GPU can push much higher FPS than monitor refresh',
            'Want higher resolution',
            'Current monitor lacks modern features (VRR, HDR)',
        ],
        typical_lifespan: '5-10+ years',
        recommendation: 'Monitor outlasts most components. Upgrade for significant feature jump.',
    },
};

// === UPGRADE PRIORITY ===
export const UPGRADE_PRIORITY = {
    gaming: {
        priority: [
            { rank: 1, component: 'GPU', reason: 'Biggest gaming impact' },
            { rank: 2, component: 'CPU', reason: 'If bottlenecking GPU' },
            { rank: 3, component: 'RAM', reason: 'If under 16GB or single channel' },
            { rank: 4, component: 'Storage', reason: 'SSD for game installs' },
            { rank: 5, component: 'Monitor', reason: 'Higher refresh/resolution' },
        ],
    },

    productivity: {
        priority: [
            { rank: 1, component: 'CPU', reason: 'Biggest productivity impact' },
            { rank: 2, component: 'RAM', reason: 'More = more multitasking' },
            { rank: 3, component: 'Storage', reason: 'Fast NVMe for large files' },
            { rank: 4, component: 'GPU', reason: 'For GPU-accelerated apps' },
            { rank: 5, component: 'Monitor', reason: 'More screens, higher res' },
        ],
    },

    streaming: {
        priority: [
            { rank: 1, component: 'GPU', reason: 'For NVENC encoding' },
            { rank: 2, component: 'CPU', reason: 'Multi-tasking while gaming' },
            { rank: 3, component: 'RAM', reason: '32GB for game + OBS + browser' },
            { rank: 4, component: 'Storage', reason: 'Fast write for recordings' },
        ],
    },
};

// === PLATFORM LONGEVITY ===
export const PLATFORM_LONGEVITY = {
    current: {
        AM5: {
            socket: 'AMD AM5',
            ddr: 'DDR5',
            support_until: '2027+ (AMD committed through Zen 5+)',
            current_cpus: 'Ryzen 7000, Ryzen 9000',
            futureProof: 'Excellent - long platform life',
            recommendation: 'Best platform for upgradability',
        },
        LGA1851: {
            socket: 'Intel LGA 1851',
            ddr: 'DDR5',
            support_until: '2026+ (likely 2 generations)',
            current_cpus: 'Core Ultra 200 (Arrow Lake)',
            futureProof: 'Good - new Intel platform',
            recommendation: 'Good for new Intel builds',
        },
        LGA1700: {
            socket: 'Intel LGA 1700',
            ddr: 'DDR4 or DDR5',
            support_until: 'End of life (no new CPUs)',
            current_cpus: '12th-14th Gen Intel',
            futureProof: 'None - no upgrade path',
            recommendation: 'Buy only for great deals, no upgrade path',
        },
    },

    legacy: {
        AM4: {
            socket: 'AMD AM4',
            ddr: 'DDR4',
            final_cpu: 'Ryzen 5000 series, 5000X3D',
            futureProof: 'None, but Ryzen 7 5800X3D is excellent endgame',
            recommendation: 'Grab 5800X3D as final upgrade if on AM4',
        },
    },

    recommendation: {
        newBuild: 'AM5 for longevity, Intel 1851 for current performance',
        existingAM4: 'Upgrade to 5800X3D, or full platform upgrade to AM5',
        existingLGA1700: 'Good CPU already? Stay. Upgrade GPU instead.',
    },
};

// === FUTUREPROOFING ANALYSIS ===
export const FUTUREPROOFING = {
    reality: {
        truth: 'Future-proofing is often a myth. Technology moves too fast.',
        advice: 'Buy for today\'s needs + 2 years. Don\'t overspend for "someday".',
    },

    worthIt: {
        platform: 'AM5 is worth it for socket longevity',
        ram: '32GB is worth it for longevity',
        psu: 'Quality 850W+ lasts through multiple upgrades',
        case: 'Good case lasts 10+ years, worth investing',
    },

    notWorthIt: {
        gpu: 'Mid-range now often beats old flagship later. Don\'t overbuy.',
        cpu: 'Technology changes. Buy what you need now.',
        storage: 'Prices drop constantly. Add more when needed.',
    },

    considerations: {
        pcie5: 'Not needed yet. Current GPUs don\'t saturate PCIe 4.0.',
        ddr5: 'Required for AM5/LGA1851. Worth it for new builds.',
        atx3psu: 'Worth it if buying RTX 40/50 series high-end cards.',
        wifi7: 'Nice to have, not essential unless you need bleeding edge.',
    },
};

// === UPGRADE BUDGET ALLOCATION ===
export const UPGRADE_BUDGET = {
    limited: {
        budget: 'Under $200',
        priorities: [
            { option: 'Add second RAM stick', condition: 'If single channel', cost: '$30-60' },
            { option: 'Add NVMe SSD', condition: 'If on HDD', cost: '$50-100' },
            { option: 'CPU cooler', condition: 'If thermal throttling', cost: '$40-80' },
        ],
    },

    moderate: {
        budget: '$200-500',
        priorities: [
            { option: 'GPU upgrade', benefit: 'Biggest gaming impact', cost: '$250-400' },
            { option: 'CPU upgrade (same socket)', benefit: 'If bottlenecking', cost: '$200-350' },
            { option: 'Monitor upgrade', benefit: 'Better experience', cost: '$200-400' },
        ],
    },

    significant: {
        budget: '$500-1000',
        options: [
            { option: 'Major GPU upgrade', benefit: 'RTX 4070/Super tier', cost: '$500-600' },
            { option: 'Platform upgrade', benefit: 'New CPU + mobo + RAM', cost: '$500-800' },
            { option: 'Full refresh', benefit: 'Sell old, buy new mid-range', split: 'GPU 60%, CPU 30%, RAM 10%' },
        ],
    },

    fullRebuild: {
        budget: '$1500+',
        recommendation: 'Consider selling old system and building new',
        approach: [
            'Plan complete new build',
            'Keep peripherals, storage, maybe PSU',
            'Sell old parts while they have value',
        ],
    },
};

// === BOTTLENECK IDENTIFICATION ===
export const BOTTLENECK_IDENTIFICATION = {
    howToCheck: {
        tools: ['MSI Afterburner overlay', 'HWiNFO64', 'Task Manager'],
        metrics: ['CPU usage per core', 'GPU usage %', 'RAM usage %'],
        whileGaming: 'Monitor during actual gameplay, not menus',
    },

    interpretation: {
        cpuBottleneck: {
            signs: ['GPU usage < 95%', 'CPU cores at 100%', 'FPS same regardless of resolution'],
            solutions: ['Upgrade CPU', 'Increase resolution (shifts load to GPU)', 'Lower CPU-heavy settings'],
        },
        gpuBottleneck: {
            signs: ['GPU at 99-100%', 'CPU usage moderate', 'FPS drops with resolution increase'],
            solutions: ['Upgrade GPU', 'Lower resolution/settings', 'Use DLSS/FSR'],
            note: 'This is the IDEAL state - means GPU is fully utilized',
        },
        ramBottleneck: {
            signs: ['RAM usage > 85%', 'Stuttering/hitching', 'Task manager shows high usage'],
            solutions: ['Add more RAM', 'Close background apps', 'Upgrade to 32GB'],
        },
        storageBottleneck: {
            signs: ['Texture pop-in', 'Long loads', 'Stuttering in open worlds'],
            solutions: ['Install on NVMe SSD', 'Add faster storage'],
        },
    },

    common_pairings: {
        balanced: {
            budget: 'RTX 4060 + Ryzen 5 7600/i5-14400F',
            midRange: 'RTX 4070 Super + Ryzen 7 7800X3D/i5-14600K',
            highEnd: 'RTX 4080 Super + Ryzen 9 9800X3D/i7-14700K',
            flagship: 'RTX 5090 + Ryzen 9 9800X3D',
        },
    },
};

// === RESALE VALUE ===
export const RESALE_VALUE = {
    bestValue: {
        nvidia_gpus: 'Hold value better than AMD historically',
        mainstream: 'Mid-range holds value better than extreme ends',
        apple: 'Apple Silicon Macs hold value excellently',
    },

    depreciation: {
        gpu: '15-25% per year, faster at new gen launch',
        cpu: '10-20% per year',
        ram: 'Drops significantly, especially previous DDR gen',
        storage: 'Drops fast - don\'t expect much resale',
    },

    whenToSell: {
        timing: 'Before new generation launches',
        example: 'Sell RTX 4080 before RTX 5080 launches for best price',
        tip: 'List 1-2 months before expected new gen announcement',
    },

    platforms: {
        recommended: ['eBay', 'Facebook Marketplace', 'Hardwareswap subreddit'],
        pricing: 'Check sold listings on eBay for fair prices',
        shipping: 'Ship GPUs with original box if possible',
    },
};

// === UPGRADE PATHS BY CURRENT SYSTEM ===
export const UPGRADE_PATHS = {
    oldIntel: {
        system: '6th-9th Gen Intel',
        limitation: 'DDR4, older socket, no upgrade path',
        recommendation: 'Full platform upgrade to AM5 or LGA 1851',
        keepable: ['GPU (if decent)', 'Storage', 'PSU (if quality)', 'Case'],
    },

    ryzen_am4: {
        system: 'Ryzen 1000-5000 on AM4',
        path: [
            { upgrade: 'Ryzen 7 5800X3D', reason: 'Best AM4 CPU, no mobo change' },
            { upgrade: 'Add RAM to 32GB', reason: 'If under 32GB' },
            { upgrade: 'GPU upgrade', reason: 'If CPU upgraded' },
        ],
        endgame: '5800X3D is the pinnacle - after that, platform swap needed',
    },

    intel_lga1700: {
        system: '12th-14th Gen Intel on LGA 1700',
        limitation: 'No future CPU upgrades',
        recommendation: 'Max out current (14900K if needed), focus on GPU',
        note: 'Already on recent platform - GPU upgrades more impactful',
    },

    newBuilders: {
        recommendation: 'Start with AM5 for longest upgrade path',
        alternative: 'LGA 1851 for latest Intel, shorter upgrade window',
        note: 'Don\'t buy LGA 1700 for new builds - no future',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get upgrade recommendation
 */
export const getUpgradeRecommendation = (currentSystem, budget, useCase) => {
    if (budget < 200) {
        return { priority: 'Minor upgrades', options: UPGRADE_BUDGET.limited.priorities };
    }
    if (useCase === 'gaming') {
        return { priority: 'GPU first', explanation: 'Biggest gaming impact' };
    }
    if (useCase === 'productivity') {
        return { priority: 'CPU/RAM first', explanation: 'More cores and memory help' };
    }
    return { priority: 'GPU', explanation: 'Default to GPU for most users' };
};

/**
 * Analyze if upgrade is worth it
 */
export const isUpgradeWorthIt = (currentComponent, newComponent, priceDifference) => {
    // Simplified logic - in reality would compare benchmarks
    if (priceDifference < 200 && currentComponent.includes('40')) {
        return { worth: false, reason: 'Minor improvement for the cost' };
    }
    return { worth: true, reason: 'Significant generational jump' };
};

/**
 * Get platform longevity score
 */
export const getPlatformScore = (socket) => {
    const scores = {
        AM5: { score: 10, reason: 'AMD committed through 2027+' },
        LGA1851: { score: 7, reason: 'New platform, 2+ generations expected' },
        LGA1700: { score: 2, reason: 'End of life' },
        AM4: { score: 3, reason: 'End of life, but 5800X3D endgame exists' },
    };
    return scores[socket] || { score: 5, reason: 'Unknown platform' };
};

export default {
    WHEN_TO_UPGRADE,
    UPGRADE_PRIORITY,
    PLATFORM_LONGEVITY,
    FUTUREPROOFING,
    UPGRADE_BUDGET,
    BOTTLENECK_IDENTIFICATION,
    RESALE_VALUE,
    UPGRADE_PATHS,
    getUpgradeRecommendation,
    isUpgradeWorthIt,
    getPlatformScore,
};
