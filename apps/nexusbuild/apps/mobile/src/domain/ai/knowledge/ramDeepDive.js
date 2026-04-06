/**
 * 💾 NEXUS AI - RAM Deep Dive Knowledge
 * 
 * Expert-level RAM knowledge including:
 * - Timings (CAS, tRCD, tRP, tRAS, subtimings)
 * - IC types (Samsung, Hynix, Micron)
 * - Channels (single, dual, quad)
 * - Ranks (single-rank, dual-rank)
 * - XMP/EXPO profiles
 * - Overclocking and stability
 */

// === RAM TIMINGS ===
export const RAM_TIMINGS = {
    overview: {
        description: 'RAM timings measure latency in clock cycles. Lower = faster.',
        format: 'Timings shown as CL-tRCD-tRP-tRAS (e.g., 16-18-18-36)',
        tradeoff: 'Higher speeds often require looser (higher) timings.',
    },

    primary: {
        CL: {
            name: 'CAS Latency (CL)',
            description: 'Time between read command and data output. Most important timing.',
            impact: 'Lower CL = faster response. Biggest single performance factor.',
            examples: { DDR4: '14-18 typical', DDR5: '28-40 typical' },
        },
        tRCD: {
            name: 'Row to Column Delay (tRCD)',
            description: 'Time to access a new row in same bank.',
            impact: 'Affects sequential read speeds.',
        },
        tRP: {
            name: 'Row Precharge Time (tRP)',
            description: 'Time to close a row before opening another.',
            impact: 'Affects random access patterns.',
        },
        tRAS: {
            name: 'Row Active Time (tRAS)',
            description: 'Minimum time a row stays open.',
            formula: 'Should be ≥ CL + tRCD',
        },
    },

    secondary: {
        tRFC: {
            name: 'Refresh Cycle Time',
            description: 'Time for memory refresh. Very impactful on performance.',
            note: 'Samsung B-die can run very low tRFC.',
        },
        tFAW: {
            name: 'Four Activate Window',
            description: 'Time window for 4 row activations.',
        },
        tWR: {
            name: 'Write Recovery Time',
            description: 'Time before precharge after write.',
        },
    },

    trueLatency: {
        description: 'Actual latency in nanoseconds. Allows comparing different speeds.',
        formula: 'True Latency (ns) = (CL ÷ MHz) × 2000',
        examples: {
            'DDR4-3200 CL16': { calc: '(16 ÷ 3200) × 2000 = 10.0ns' },
            'DDR4-3600 CL18': { calc: '(18 ÷ 3600) × 2000 = 10.0ns' },
            'DDR5-6000 CL30': { calc: '(30 ÷ 6000) × 2000 = 10.0ns' },
            'DDR5-6400 CL32': { calc: '(32 ÷ 6400) × 2000 = 10.0ns' },
            'DDR5-8000 CL40': { calc: '(40 ÷ 8000) × 2000 = 10.0ns' },
        },
        insight: 'DDR5-6000 CL30 has same latency as DDR4-3200 CL16, but higher bandwidth.',
    },
};

// === IC TYPES ===
export const RAM_IC_TYPES = {
    overview: {
        description: 'Memory ICs (chips) determine overclocking potential and quality.',
        checking: 'Use Thaiphoon Burner to identify ICs on your RAM.',
    },

    samsung: {
        bDie: {
            name: 'Samsung B-die',
            generation: 'DDR4',
            quality: 'Legendary - best DDR4 overclocker',
            capabilities: ['CL14 @ 3200+', 'CL16 @ 3600+', 'Very tight tRFC'],
            status: 'Discontinued - becoming rare and expensive',
            price: 'Premium ($$$)',
        },
        mDie: {
            name: 'Samsung M-die',
            generation: 'DDR5',
            quality: 'Good - solid DDR5 option',
            capabilities: ['DDR5-6400+ capable', 'Decent overclocking'],
        },
    },

    hynix: {
        aDie: {
            name: 'Hynix A-die',
            generation: 'DDR5',
            quality: 'Excellent - current DDR5 champion',
            capabilities: ['DDR5-8000+ capable', 'Best DDR5 overclocking'],
            price: 'Premium',
            note: 'Found in high-end DDR5 kits (G.Skill, Kingston Fury).',
        },
        mDie: {
            name: 'Hynix M-die',
            generation: 'DDR5',
            quality: 'Good - mid-range option',
            capabilities: ['DDR5-6400 typical', 'Decent headroom'],
        },
        cjr: {
            name: 'Hynix CJR',
            generation: 'DDR4',
            quality: 'Great value - second best DDR4',
            capabilities: ['CL16 @ 3600 common', 'Good for Ryzen'],
            price: 'Mid-range',
        },
        djr: {
            name: 'Hynix DJR',
            generation: 'DDR4',
            quality: 'Good - reliable DDR4',
            capabilities: ['CL18 @ 3600 typical'],
        },
    },

    micron: {
        revE: {
            name: 'Micron Rev.E (E-die)',
            generation: 'DDR4',
            quality: 'Great value overclocker',
            capabilities: ['Responds well to voltage', 'CL16 @ 3600 easy'],
            price: 'Budget-friendly',
            note: 'Crucial Ballistix used this.',
        },
        aDie: {
            name: 'Micron A-die',
            generation: 'DDR5',
            quality: 'Good - decent DDR5',
            capabilities: ['DDR5-6000 typical'],
        },
    },

    recommendation: {
        DDR4: 'Samsung B-die for max OC, Hynix CJR/Micron E-die for value',
        DDR5: 'Hynix A-die for best OC, Samsung/Micron for budget',
    },
};

// === CHANNELS ===
export const RAM_CHANNELS = {
    overview: {
        description: 'Memory channels are parallel data paths between RAM and CPU.',
        impact: 'More channels = more bandwidth = better performance.',
    },

    types: {
        single: {
            name: 'Single Channel',
            sticks: '1 stick (or 2 in wrong slots)',
            bandwidth: '1x bandwidth',
            impact: 'Significant performance loss (10-20% in games)',
            avoid: true,
        },
        dual: {
            name: 'Dual Channel',
            sticks: '2 sticks in correct slots (usually 2 & 4)',
            bandwidth: '2x bandwidth',
            impact: 'Standard configuration, full performance',
            recommendation: 'Always use dual channel.',
        },
        quad: {
            name: 'Quad Channel',
            sticks: '4 sticks in 4 channel slots',
            bandwidth: '4x bandwidth',
            platform: 'HEDT only (Threadripper, Xeon)',
            impact: 'Massive bandwidth for workstation tasks',
        },
    },

    installation: {
        description: 'Use correct slots for dual channel.',
        typical: {
            '2 sticks': 'Slots 2 and 4 (A2/B2) - second from CPU',
            '4 sticks': 'All slots',
        },
        note: 'Check motherboard manual - some use 1 and 3.',
        mistake: 'Installing in adjacent slots (1 & 2) = single channel!',
    },
};

// === RANKS ===
export const RAM_RANKS = {
    overview: {
        description: 'Ranks are independent groups of chips on a DIMM module.',
        visual: 'Dual-rank sticks often have chips on both sides.',
    },

    types: {
        single: {
            name: 'Single-Rank (1Rx8 or 1Rx16)',
            description: 'One group of chips.',
            oc: 'Usually easier to overclock.',
            capacity: 'Common for 8GB and 16GB sticks',
        },
        dual: {
            name: 'Dual-Rank (2Rx8)',
            description: 'Two groups of chips.',
            performance: '~5% better than single-rank (rank interleaving)',
            oc: 'May limit max frequency on some platforms',
            capacity: 'Common for 16GB and 32GB sticks',
        },
    },

    interleaving: {
        description: 'CPU can access alternate ranks while other refreshes.',
        benefit: 'Slight performance improvement in memory-heavy tasks.',
        total: '4 ranks ideal (2x dual-rank or 4x single-rank)',
    },

    compatibility: {
        AMD_Ryzen: {
            optimal: '2x dual-rank for 4 total ranks',
            note: 'Ryzen loves rank interleaving',
        },
        Intel: {
            optimal: '2x single-rank for easiest memory OC',
            note: 'Less rank-sensitive than AMD',
        },
    },
};

// === XMP/EXPO ===
export const XMP_EXPO = {
    xmp: {
        name: 'XMP (Extreme Memory Profile)',
        manufacturer: 'Intel',
        versions: {
            'XMP 2.0': 'DDR4 - 2 profiles',
            'XMP 3.0': 'DDR5 - 3 profiles + 2 user profiles',
        },
        description: 'Pre-configured overclock profile stored on RAM SPD.',
        howTo: 'Enable in BIOS under memory/DRAM settings.',
        importance: 'Without XMP, DDR4 runs at 2133MHz, DDR5 at 4800MHz!',
    },

    expo: {
        name: 'EXPO (Extended Profiles for Overclocking)',
        manufacturer: 'AMD',
        purpose: 'AMD-optimized memory profiles for Ryzen 7000+.',
        difference: 'Better infinity fabric sync, AMD-specific tuning.',
        compatibility: 'Works on Intel too, but XMP may be faster.',
    },

    jedec: {
        name: 'JEDEC',
        description: 'Default, non-overclocked speeds (safe fallback).',
        speeds: { DDR4: '2133-3200 MHz', DDR5: '4800-5600 MHz' },
    },

    troubleshooting: {
        notBooting: [
            'Try lower XMP profile if available',
            'Manually set speed slightly lower',
            'Increase DRAM voltage (1.35V DDR4, 1.35V DDR5)',
            'Update BIOS for better memory support',
        ],
        qvl: 'Check motherboard QVL (Qualified Vendor List) for tested RAM.',
    },
};

// === OVERCLOCKING ===
export const RAM_OVERCLOCKING = {
    overview: {
        description: 'Push RAM beyond XMP speeds for more performance.',
        benefit: 'Higher bandwidth, lower latency = better gaming performance.',
        risk: 'Instability, crashes, data corruption if not stable.',
    },

    steps: {
        basic: [
            '1. Start with XMP as baseline',
            '2. Increase frequency in 200MHz steps',
            '3. Test stability after each change',
            '4. Find max stable frequency',
            '5. Tighten timings if desired',
        ],
        advanced: [
            '1. Find max frequency at loose timings',
            '2. Tighten primary timings (CL, tRCD, tRP, tRAS)',
            '3. Optimize tRFC for your IC type',
            '4. Fine-tune secondary/tertiary timings',
            '5. Extensive stability testing',
        ],
    },

    voltage: {
        DDR4: {
            stock: '1.2V',
            xmp: '1.35V typical',
            safe: 'Up to 1.45V with good cooling',
            extreme: '1.5V+ (requires active cooling)',
        },
        DDR5: {
            stock: '1.1V',
            xmp: '1.25-1.35V typical',
            safe: 'Up to 1.45V',
            note: 'DDR5 has on-DIMM power regulation (PMIC)',
        },
    },

    stability: {
        tests: [
            'TM5 with Anta Extreme profile (30+ mins)',
            'OCCT Memory test (1+ hour)',
            'MemTest86 (full pass)',
            'y-cruncher stress test',
        ],
        symptoms: {
            unstable: ['Random crashes', 'WHEA errors', 'Corrupt files', 'Failed POST'],
        },
    },

    platformOptimal: {
        AMD_Ryzen7000: {
            sweetSpot: 'DDR5-6000 CL30 (1:1 FCLK ratio)',
            why: 'Infinity Fabric syncs with memory, 6000 is the 1:1 limit',
            over6000: 'Possible but runs 1:2 ratio, diminishing returns',
        },
        AMD_Ryzen5000: {
            sweetSpot: 'DDR4-3600 CL16 (1:1 FCLK ratio)',
            why: 'FCLK tops out at 1800MHz for most chips',
        },
        Intel: {
            sweetSpot: 'DDR5-6400+ or DDR4-3600+',
            why: 'No Infinity Fabric limitation, pure speed benefits',
        },
    },
};

// === CAPACITY ===
export const RAM_CAPACITY = {
    recommendations: {
        '8GB': { use: 'Basic browsing, office work', gaming: 'Too low', status: 'Outdated' },
        '16GB': { use: 'Gaming, light multitask', gaming: 'Minimum for modern games', status: 'Budget' },
        '32GB': { use: 'Gaming + streaming, content creation', gaming: 'Sweet spot', status: 'Recommended' },
        '64GB': { use: 'Heavy workstation, VMs, 4K editing', gaming: 'Overkill', status: 'Professional' },
        '128GB+': { use: 'Servers, heavy 3D/modeling', gaming: 'Extreme overkill', status: 'Enterprise' },
    },

    gaming2025: {
        minimum: '16GB',
        recommended: '32GB',
        reason: 'Games using 12-14GB+ at max settings (Hogwarts, Starfield)',
    },

    configuration: {
        '16GB': '2x8GB (dual channel)',
        '32GB': '2x16GB (dual channel) - recommended',
        '32GB_alt': '4x8GB (fills slots, harder to upgrade)',
        '64GB': '2x32GB or 4x16GB',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Calculate true latency in nanoseconds
 */
export const calculateTrueLatency = (speed, cl) => {
    const latency = (cl / speed) * 2000;
    return {
        latency: latency.toFixed(2) + 'ns',
        speed,
        cl,
        rating: latency < 9 ? 'Excellent' : latency < 10 ? 'Great' : latency < 11 ? 'Good' : 'Average',
    };
};

/**
 * Compare two RAM kits
 */
export const compareRAM = (kit1, kit2) => {
    const lat1 = (kit1.cl / kit1.speed) * 2000;
    const lat2 = (kit2.cl / kit2.speed) * 2000;
    const bandwidth1 = kit1.speed * 8; // Rough MB/s for dual channel
    const bandwidth2 = kit2.speed * 8;

    return {
        kit1: { ...kit1, latency: lat1.toFixed(2) + 'ns', bandwidth: bandwidth1 + ' MB/s' },
        kit2: { ...kit2, latency: lat2.toFixed(2) + 'ns', bandwidth: bandwidth2 + ' MB/s' },
        faster: lat1 < lat2 ? 'Kit 1 (lower latency)' : lat2 < lat1 ? 'Kit 2 (lower latency)' : 'Same latency',
        moreBandwidth: bandwidth1 > bandwidth2 ? 'Kit 1' : 'Kit 2',
        recommendation: lat1 <= lat2 && bandwidth1 >= bandwidth2 ? 'Kit 1' :
            lat2 <= lat1 && bandwidth2 >= bandwidth1 ? 'Kit 2' :
                'Depends on workload (gaming prefers latency)',
    };
};

/**
 * Get optimal RAM for platform
 */
export const getOptimalRAM = (platform) => {
    const recommendations = {
        'AM5': { speed: 'DDR5-6000', timing: 'CL30', reason: '1:1 FCLK sync' },
        'AM4': { speed: 'DDR4-3600', timing: 'CL16', reason: '1:1 FCLK sync' },
        'LGA1700': { speed: 'DDR5-6400+', timing: 'CL32', reason: 'Pure speed benefits' },
        'LGA1851': { speed: 'DDR5-6400+', timing: 'CL32', reason: 'Pure speed benefits' },
    };
    return recommendations[platform] || recommendations['AM5'];
};

/**
 * Explain a RAM term
 */
export const explainRAMTerm = (term) => {
    const terms = {
        cl: RAM_TIMINGS.primary.CL,
        'cas latency': RAM_TIMINGS.primary.CL,
        trcd: RAM_TIMINGS.primary.tRCD,
        trp: RAM_TIMINGS.primary.tRP,
        tras: RAM_TIMINGS.primary.tRAS,
        'true latency': RAM_TIMINGS.trueLatency,
        xmp: XMP_EXPO.xmp,
        expo: XMP_EXPO.expo,
        jedec: XMP_EXPO.jedec,
        'dual channel': RAM_CHANNELS.types.dual,
        'single channel': RAM_CHANNELS.types.single,
        'single rank': RAM_RANKS.types.single,
        'dual rank': RAM_RANKS.types.dual,
        'b-die': RAM_IC_TYPES.samsung.bDie,
        'a-die': RAM_IC_TYPES.hynix.aDie,
    };
    return terms[term?.toLowerCase()] || null;
};

export default {
    RAM_TIMINGS,
    RAM_IC_TYPES,
    RAM_CHANNELS,
    RAM_RANKS,
    XMP_EXPO,
    RAM_OVERCLOCKING,
    RAM_CAPACITY,
    calculateTrueLatency,
    compareRAM,
    getOptimalRAM,
    explainRAMTerm,
};
