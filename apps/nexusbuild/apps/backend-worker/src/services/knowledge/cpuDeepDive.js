/**
 * 🧠 NEXUS AI - CPU Deep Dive Knowledge
 *
 * Expert-level CPU knowledge including:
 * - Architecture (x86, ARM, chiplet, monolithic)
 * - Core types (P-cores, E-cores, CCX, CCD)
 * - Cache hierarchy (L1, L2, L3, V-Cache)
 * - Instruction sets (AVX-512, SSE)
 * - Power management (PBO, Turbo Boost)
 * - Overclocking fundamentals
 */

// === CPU ARCHITECTURE ===
export const CPU_ARCHITECTURE = {
    x86: {
        name: 'x86-64 (AMD64)',
        description: 'Dominant desktop/laptop architecture. Used by Intel and AMD for all desktop CPUs.',
        history: 'Originally 32-bit x86 by Intel, extended to 64-bit by AMD in 2003.',
        characteristics: ['CISC architecture', 'Variable instruction length', 'Backward compatible to 8086'],
        platforms: ['Desktop PCs', 'Laptops', 'Servers', 'Workstations'],
    },
    arm: {
        name: 'ARM (AArch64)',
        description: 'Mobile-first architecture known for efficiency. Apple M-series uses this.',
        characteristics: ['RISC architecture', 'Fixed instruction length', 'Lower power consumption'],
        platforms: ['Apple Mac (M1-M4)', 'Smartphones', 'Tablets', 'Some Windows laptops'],
        notes: 'Apple Silicon (M1-M4) proves ARM can match x86 performance with better efficiency.',
    },
    chiplet: {
        name: 'Chiplet Design',
        description: 'Multiple smaller dies connected together instead of one monolithic die.',
        advantages: [
            'Higher yields (smaller dies = fewer defects)',
            'Mix and match dies for different products',
            'Can use different manufacturing processes for different parts'
        ],
        users: ['AMD Ryzen (since Zen 2)', 'Intel (some server chips)'],
        example: 'Ryzen 9 7950X uses 2x CCD chiplets (cores) + 1x IOD (I/O die)',
    },
    monolithic: {
        name: 'Monolithic Design',
        description: 'Single die containing all CPU components.',
        advantages: ['Lower latency between cores', 'Simpler design', 'No cross-die communication'],
        disadvantages: ['Lower yields at large sizes', 'Less flexible product stack'],
        users: ['Intel desktop (12th-14th gen)', 'AMD APUs'],
    },
    nodeSizes: {
        description: 'Manufacturing process size - smaller = more transistors = more performance/efficiency',
        current: {
            'TSMC N4/N5': { used_by: ['AMD Ryzen 7000', 'Apple M3'], transistorDensity: '~125 MTr/mm²' },
            'TSMC N3': { used_by: ['Apple M4', 'AMD Ryzen 9000 (Zen 5)'], transistorDensity: '~200 MTr/mm²' },
            'Intel 7': { used_by: ['Intel 12th-14th Gen'], transistorDensity: '~100 MTr/mm²' },
            'Intel 4/3': { used_by: ['Intel Core Ultra (Meteor Lake)'], transistorDensity: '~150 MTr/mm²' },
        },
        note: 'Node names are marketing - TSMC 5nm ≈ Intel 7 in actual density.',
    },
};

// === CORE TYPES ===
export const CORE_TYPES = {
    pCores: {
        name: 'P-Cores (Performance Cores)',
        description: 'High-performance cores optimized for single-threaded workloads.',
        characteristics: [
            'Higher clock speeds (5+ GHz)',
            'Larger caches',
            'Support hyperthreading (2 threads per core)',
            'Higher power consumption'
        ],
        used_by: 'Intel 12th-14th Gen (Golden Cove, Raptor Cove)',
        bestFor: ['Gaming', 'Single-threaded apps', 'Latency-sensitive tasks'],
    },
    eCores: {
        name: 'E-Cores (Efficiency Cores)',
        description: 'Smaller cores optimized for power efficiency and background tasks.',
        characteristics: [
            'Lower clock speeds (3-4 GHz)',
            'Smaller cache',
            'No hyperthreading (1 thread per core)',
            'Much lower power consumption'
        ],
        used_by: 'Intel 12th-14th Gen (Gracemont)',
        bestFor: ['Background tasks', 'Multi-threaded workloads', 'Power savings'],
        ratio: 'i9-14900K has 8 P-cores + 16 E-cores = 24 cores / 32 threads',
    },
    ccx: {
        name: 'CCX (Core Complex)',
        description: 'AMD grouping of CPU cores that share L3 cache.',
        details: [
            'Zen 3: Up to 8 cores per CCX (unified cache)',
            'Zen 2: 4 cores per CCX (split cache, higher latency)',
            'Zen 4/5: 8 cores per CCX'
        ],
        gamingImpact: 'Unified CCX (Zen 3+) reduces latency for gaming.',
    },
    ccd: {
        name: 'CCD (Core Chiplet Die)',
        description: 'Physical chiplet containing CPU cores.',
        details: [
            'Ryzen 9 CPUs have 2x CCDs',
            'Ryzen 7 and below have 1x CCD',
            'CCDs communicate through the IOD (I/O Die)'
        ],
        latency: 'Cross-CCD communication adds ~20ns latency vs same-CCD.',
    },
    smt: {
        name: 'SMT / Hyperthreading',
        description: 'Simultaneous Multi-Threading allows 2 threads per core.',
        performance: 'Adds ~20-30% performance in multi-threaded workloads.',
        gaming: 'Minimal gaming benefit, sometimes causes micro-stutters in older games.',
        note: 'Intel calls it Hyperthreading, AMD calls it SMT. Same concept.',
    },
};

// === CACHE HIERARCHY ===
export const CACHE_HIERARCHY = {
    overview: {
        description: 'CPU cache is ultra-fast memory that stores frequently accessed data.',
        hierarchy: 'L1 (fastest, smallest) → L2 → L3 (slowest, largest) → RAM',
        importance: 'Larger/faster cache = less waiting for RAM = better performance.',
    },
    l1Cache: {
        name: 'L1 Cache',
        size: '32-80KB per core (split: instruction + data)',
        latency: '~4-5 cycles (~1ns)',
        description: 'Fastest cache, private to each core. Holds most critical data.',
    },
    l2Cache: {
        name: 'L2 Cache',
        size: '256KB-2MB per core',
        latency: '~12-14 cycles (~4ns)',
        description: 'Larger, slightly slower. Private to each core in modern CPUs.',
        trends: 'Intel Arrow Lake: 4MB L2 per P-core. AMD Zen 4: 1MB L2 per core.',
    },
    l3Cache: {
        name: 'L3 Cache (Last Level Cache)',
        size: '16-128MB shared (varies by CPU)',
        latency: '~40-50 cycles (~10-15ns)',
        description: 'Shared between all cores. Last stop before going to RAM.',
        examples: {
            'i9-14900K': '36MB L3',
            'Ryzen 9 7950X': '64MB L3',
            'Ryzen 7 7800X3D': '96MB L3 (with V-Cache)',
        },
    },
    vCache: {
        name: '3D V-Cache (AMD)',
        description: 'Additional L3 cache stacked vertically on top of the CPU die.',
        benefit: 'Massive gaming performance boost (+10-25% in cache-sensitive games).',
        howItWorks: '64MB extra cache stacked on CCD, totaling 96MB+ L3.',
        bestFor: 'Gaming - games love cache. Huge improvement in CPU-bound scenarios.',
        models: ['Ryzen 7 5800X3D', 'Ryzen 7 7800X3D', 'Ryzen 9 9800X3D', 'Ryzen 9 9950X3D'],
        tradeoff: 'Slightly lower clock speeds due to heat + power constraints.',
    },
    cacheImpact: {
        gaming: 'More L3 cache = better minimum FPS, especially at high refresh rates.',
        productivity: 'Less impactful - RAM bandwidth often more important.',
        measurement: 'Cache hit rate determines how often CPU finds data without going to RAM.',
    },
};

// === INSTRUCTION SETS ===
export const INSTRUCTION_SETS = {
    overview: {
        description: 'Special CPU instructions for specific workloads. Newer = faster for supported apps.',
    },
    sse: {
        name: 'SSE (Streaming SIMD Extensions)',
        versions: ['SSE', 'SSE2', 'SSE3', 'SSSE3', 'SSE4.1', 'SSE4.2'],
        description: '128-bit SIMD instructions. Required by modern games and software.',
        support: 'All modern CPUs (baseline since ~2006)',
    },
    avx: {
        name: 'AVX (Advanced Vector Extensions)',
        versions: ['AVX', 'AVX2'],
        description: '256-bit SIMD instructions for floating-point math.',
        benefits: 'Massive speedup in video editing, 3D rendering, scientific computing.',
        support: 'All modern CPUs support AVX2 (since Haswell/Zen)',
    },
    avx512: {
        name: 'AVX-512',
        description: '512-bit SIMD instructions for extreme computational workloads.',
        support: {
            'Intel HEDT': 'Full support',
            'Intel 11th Gen+': 'Partial support (varies by model)',
            'AMD Zen 4+': 'Full support',
        },
        controversy: 'Causes clock speed drops when active. Disabled on some Intel consumer CPUs.',
        bestFor: 'Scientific computing, AI inference, video encoding.',
    },
    xd: {
        name: 'XD/NX Bit',
        description: 'Security feature preventing code execution in data regions.',
        support: 'All modern CPUs. Required by Windows.',
    },
    aesni: {
        name: 'AES-NI',
        description: 'Hardware-accelerated encryption/decryption.',
        benefit: 'Fast disk encryption (BitLocker), VPNs, HTTPS.',
        support: 'All modern CPUs.',
    },
};

// === POWER MANAGEMENT ===
export const POWER_MANAGEMENT = {
    tdp: {
        name: 'TDP (Thermal Design Power)',
        description: 'Heat output the cooler must handle, NOT actual power consumption.',
        note: 'Real power draw often exceeds TDP during boost. i9-14900K can draw 250W+.',
    },
    pbo: {
        name: 'PBO (Precision Boost Overdrive)',
        description: 'AMD auto-overclocking feature. Increases power limits for higher clocks.',
        settings: {
            'PBO Disabled': 'Stock power limits (safer)',
            'PBO Enabled': 'Removes power limits (higher performance, more heat)',
            'PBO + Curve Optimizer': 'Advanced per-core voltage tuning',
        },
        benefits: '5-10% performance increase with proper cooling.',
    },
    curveOptimizer: {
        name: 'Curve Optimizer (AMD)',
        description: 'Per-core voltage offset for efficiency and performance.',
        howItWorks: 'Negative offset = lower voltage = cooler temps OR higher clocks.',
        typical: '-15 to -30 all-core is common. Test stability with Cinebench/OCCT.',
    },
    intelTurbo: {
        name: 'Intel Turbo Boost',
        versions: {
            'Turbo Boost 2.0': 'Single/multi-core boost based on power/thermal headroom',
            'Turbo Boost Max 3.0': 'Identifies best cores, boosts them higher',
            'Thermal Velocity Boost': 'Extra boost when under 70°C',
        },
    },
    powerLimits: {
        PL1: 'Long-term sustained power limit',
        PL2: 'Short-term boost power limit (higher)',
        PL4: 'Peak transient power limit (highest, very short)',
        note: 'Motherboard vendors often remove limits for higher performance.',
    },
    cStates: {
        name: 'C-States (Power States)',
        description: 'CPU idle power savings modes.',
        states: {
            'C0': 'Active - CPU executing instructions',
            'C1': 'Halt - Cores idle, instant wake',
            'C6': 'Deep sleep - Very low power, longer wake time',
        },
        gaming: 'Some disable deep C-states to reduce input latency.',
    },
};

// === OVERCLOCKING ===
export const OVERCLOCKING = {
    overview: {
        description: 'Running CPU above stock speeds for more performance.',
        requirements: ['Unlocked CPU (K/X series)', 'Z/X chipset motherboard', 'Good cooler'],
    },
    unlocked: {
        intel: {
            unlocked: ['K-series (i5-14600K)', 'X-series (i9-14900KS)'],
            locked: ['Non-K (i5-14400F, i7-14700)'],
            note: 'K-series has unlocked multiplier for easy overclocking.',
        },
        amd: {
            unlocked: ['All Ryzen CPUs are unlocked'],
            note: 'AMD relies more on PBO than manual OC.',
        },
    },
    methods: {
        multiplier: {
            description: 'Increase CPU multiplier (easiest method)',
            example: '5.0GHz base → 5.5GHz is changing multiplier from 50x to 55x',
        },
        bclk: {
            description: 'Base clock overclocking (affects everything, advanced)',
            note: 'Not recommended - can cause instability in other components.',
        },
        voltage: {
            description: 'Increasing voltage allows higher clocks but more heat.',
            safe: {
                'Intel 14th Gen': 'Up to 1.35V for most users',
                'AMD Zen 4': 'Leave to PBO, manual voltage can cause degradation',
            },
            risk: 'Too much voltage = CPU degradation over time.',
        },
    },
    stability: {
        tests: ['Cinebench R23 (10-minute)', 'OCCT', 'Prime95 (extreme)', 'Real-world gaming'],
        symptoms: ['Blue screens', 'Application crashes', 'Incorrect calculations'],
        fix: 'Lower clocks or increase voltage (within safe limits).',
    },
    degradation: {
        description: 'CPUs can lose stability over time with aggressive settings.',
        causes: ['Excessive voltage', 'Excessive heat', 'Electromigration'],
        prevention: 'Stay within safe voltage limits. Good cooling.',
    },
    delidding: {
        description: 'Removing CPU heat spreader to replace thermal compound.',
        benefit: '10-20°C temperature drop on older Intel CPUs.',
        risk: 'Can damage CPU. Voids warranty.',
        modern: 'Modern CPUs use soldered IHS - delidding rarely needed.',
    },
};

// === IPC (Instructions Per Cycle) ===
export const IPC_KNOWLEDGE = {
    definition: {
        name: 'IPC (Instructions Per Cycle)',
        description: 'How much work a CPU does per clock cycle. Higher = more efficient.',
        formula: 'Performance = IPC × Clock Speed × Core Count',
        importance: 'A 4GHz CPU with high IPC beats a 5GHz CPU with low IPC.',
    },
    comparison: {
        description: 'IPC improvements generation over generation:',
        examples: {
            'Zen 3 → Zen 4': '~13% IPC gain',
            'Zen 4 → Zen 5': '~16% IPC gain',
            'Intel 13th → 14th': '~0% IPC gain (same cores)',
            'Intel 14th → Arrow Lake': '~5-10% IPC gain',
        },
    },
    measurement: {
        howToCompare: 'Compare same-clock single-threaded benchmarks.',
        benchmarks: ['Cinebench R23 Single', 'CPU-Z Single Thread', 'Geekbench Single'],
    },
};

// === CPU SOCKET COMPATIBILITY ===
export const CPU_SOCKETS = {
    current: {
        AM5: {
            manufacturer: 'AMD',
            supported: ['Ryzen 7000 (Zen 4)', 'Ryzen 9000 (Zen 5)'],
            memory: 'DDR5 only',
            pcie: 'PCIe 5.0',
            longevity: 'Support through 2027+',
            chipsets: ['X670E', 'X670', 'B650E', 'B650', 'A620', 'X870E', 'X870'],
        },
        'LGA 1700': {
            manufacturer: 'Intel',
            supported: ['12th Gen (Alder Lake)', '13th Gen (Raptor Lake)', '14th Gen (Refresh)'],
            memory: 'DDR4 or DDR5 (board-specific)',
            pcie: 'PCIe 5.0',
            longevity: 'End of life (replaced by LGA 1851)',
            chipsets: ['Z790', 'B760', 'H770', 'Z690', 'B660'],
        },
        'LGA 1851': {
            manufacturer: 'Intel',
            supported: ['Core Ultra 200 (Arrow Lake)'],
            memory: 'DDR5 only',
            pcie: 'PCIe 5.0',
            longevity: 'Current platform (2024+)',
            chipsets: ['Z890', 'B860', 'H870'],
        },
    },
    legacy: {
        AM4: {
            manufacturer: 'AMD',
            supported: ['Ryzen 1000-5000 series'],
            memory: 'DDR4 only',
            status: 'Mature platform, great budget option',
            chipsets: ['X570', 'B550', 'A520', 'B450', 'X470'],
        },
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get cache information for a CPU
 */
export const getCacheInfo = (cpuName) => {
    const lower = cpuName?.toLowerCase() || '';

    if (lower.includes('x3d')) {
        return {
            type: '3D V-Cache',
            l3: '96MB+',
            benefit: 'Massive gaming performance from extra cache.',
            bestFor: 'Gaming, especially at high refresh rates.',
        };
    }
    if (lower.includes('ryzen 9') && (lower.includes('7950') || lower.includes('9950'))) {
        return { l3: '64MB', note: 'Dual CCD, great for productivity.' };
    }
    if (lower.includes('i9-14900')) {
        return { l3: '36MB', note: 'Largest Intel consumer cache.' };
    }
    return { l3: 'Varies', note: 'Check specific model specs.' };
};

/**
 * Get overclocking potential for a CPU
 */
export const getOCPotential = (cpuName) => {
    const lower = cpuName?.toLowerCase() || '';

    if (lower.includes('k') && lower.includes('intel')) {
        return { unlocked: true, method: 'Multiplier OC', typical: '200-500MHz gains' };
    }
    if (lower.includes('ryzen')) {
        return { unlocked: true, method: 'PBO + Curve Optimizer', typical: '100-300MHz boost gains' };
    }
    if (lower.includes('x3d')) {
        return { unlocked: true, method: 'PBO only (limited)', note: 'V-Cache limits OC headroom' };
    }
    return { unlocked: false, note: 'Locked CPU, no overclocking.' };
};

/**
 * Explain a CPU concept
 */
export const explainConcept = (concept) => {
    const conceptMap = {
        ipc: IPC_KNOWLEDGE.definition,
        'p-cores': CORE_TYPES.pCores,
        'e-cores': CORE_TYPES.eCores,
        ccx: CORE_TYPES.ccx,
        ccd: CORE_TYPES.ccd,
        smt: CORE_TYPES.smt,
        hyperthreading: CORE_TYPES.smt,
        'v-cache': CACHE_HIERARCHY.vCache,
        '3d v-cache': CACHE_HIERARCHY.vCache,
        vcache: CACHE_HIERARCHY.vCache,
        pbo: POWER_MANAGEMENT.pbo,
        'curve optimizer': POWER_MANAGEMENT.curveOptimizer,
        chiplet: CPU_ARCHITECTURE.chiplet,
        monolithic: CPU_ARCHITECTURE.monolithic,
        avx512: INSTRUCTION_SETS.avx512,
        'avx-512': INSTRUCTION_SETS.avx512,
    };

    return conceptMap[concept?.toLowerCase()] || null;
};

export default {
    CPU_ARCHITECTURE,
    CORE_TYPES,
    CACHE_HIERARCHY,
    INSTRUCTION_SETS,
    POWER_MANAGEMENT,
    OVERCLOCKING,
    IPC_KNOWLEDGE,
    CPU_SOCKETS,
    getCacheInfo,
    getOCPotential,
    explainConcept,
};
