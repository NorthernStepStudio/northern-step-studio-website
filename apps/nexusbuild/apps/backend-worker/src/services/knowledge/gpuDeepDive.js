/**
 * 🎮 NEXUS AI - GPU Deep Dive Knowledge
 *
 * Expert-level GPU knowledge including:
 * - Architecture (shaders, RT cores, tensor cores)
 * - Memory types (GDDR6, GDDR6X, GDDR7, HBM)
 * - Technologies (Ray tracing, DLSS, FSR, frame gen)
 * - Power (TGP, 12VHPWR, transients)
 * - Encoding (NVENC, VCE, QuickSync)
 * - Drivers and optimization
 */

// === GPU ARCHITECTURE ===
export const GPU_ARCHITECTURE = {
    overview: {
        description: 'GPUs use thousands of small cores for parallel processing vs CPU\'s few powerful cores.',
        terminology: {
            nvidia: 'CUDA Cores, RT Cores, Tensor Cores',
            amd: 'Stream Processors, Ray Accelerators, AI Accelerators',
            intel: 'Xe Cores, Ray Tracing Units',
        },
    },

    // NVIDIA Architectures
    nvidia: {
        blackwell: {
            name: 'Blackwell (RTX 50 Series)',
            year: 2025,
            gpus: ['RTX 5090', 'RTX 5080', 'RTX 5070 Ti', 'RTX 5070'],
            features: [
                'DLSS 4 with Multi-Frame Generation (up to 4x frames)',
                '5th gen Tensor Cores',
                '4th gen RT Cores',
                'GDDR7 memory',
                'DisplayPort 2.1 UHBR20'
            ],
            improvements: '2x RT performance, 2x AI performance vs Ada',
        },
        ada: {
            name: 'Ada Lovelace (RTX 40 Series)',
            year: 2022,
            gpus: ['RTX 4090', 'RTX 4080 Super', 'RTX 4080', 'RTX 4070 Ti Super', 'RTX 4070 Ti', 'RTX 4070 Super', 'RTX 4070', 'RTX 4060 Ti', 'RTX 4060'],
            features: [
                'DLSS 3 with Frame Generation',
                '4th gen Tensor Cores',
                '3rd gen RT Cores',
                'AV1 hardware encoding',
                'GDDR6X memory'
            ],
        },
        ampere: {
            name: 'Ampere (RTX 30 Series)',
            year: 2020,
            gpus: ['RTX 3090', 'RTX 3080 Ti', 'RTX 3080', 'RTX 3070 Ti', 'RTX 3070', 'RTX 3060 Ti', 'RTX 3060'],
            features: ['DLSS 2.0', '2nd gen RT Cores', 'PCIe 4.0'],
        },
        turing: {
            name: 'Turing (RTX 20 Series)',
            year: 2018,
            gpus: ['RTX 2080 Ti', 'RTX 2080', 'RTX 2070', 'RTX 2060'],
            features: ['First RTX with RT Cores', 'DLSS 1.0', 'Tensor Cores'],
        },
    },

    // AMD Architectures
    amd: {
        rdna4: {
            name: 'RDNA 4 (RX 9000 Series)',
            year: 2025,
            gpus: ['RX 9800 XT', 'RX 9700 XT', 'RX 9600 XT'],
            features: [
                'FSR 4 with AI upscaling',
                'Improved Ray Accelerators (2x RT)',
                'AI Accelerators for machine learning',
                'Focus on efficiency'
            ],
            note: 'No flagship - AMD focusing on mainstream/value segment',
        },
        rdna3: {
            name: 'RDNA 3 (RX 7000 Series)',
            year: 2022,
            gpus: ['RX 7900 XTX', 'RX 7900 XT', 'RX 7800 XT', 'RX 7700 XT', 'RX 7600 XT', 'RX 7600'],
            features: ['Chiplet design', 'AV1 encoding', 'DisplayPort 2.1', 'FSR 3'],
        },
        rdna2: {
            name: 'RDNA 2 (RX 6000 Series)',
            year: 2020,
            gpus: ['RX 6900 XT', 'RX 6800 XT', 'RX 6800', 'RX 6700 XT', 'RX 6600 XT', 'RX 6600'],
            features: ['First AMD ray tracing', 'Infinity Cache', 'Smart Access Memory'],
        },
    },

    // Intel Architectures
    intel: {
        battlemage: {
            name: 'Battlemage (Arc B-Series)',
            year: 2025,
            gpus: ['Arc B580', 'Arc B570'],
            features: ['XeSS 2 with Frame Gen', 'Improved drivers', 'Better ray tracing'],
            note: 'Intel\'s second attempt - much improved drivers',
        },
        alchemist: {
            name: 'Alchemist (Arc A-Series)',
            year: 2022,
            gpus: ['Arc A770', 'Arc A750', 'Arc A380'],
            features: ['XeSS upscaling', 'AV1 encoding', 'Ray tracing'],
            note: 'Driver issues at launch, mostly fixed now',
        },
    },

    components: {
        shaderCores: {
            name: 'Shader Cores (CUDA/Stream Processors)',
            description: 'Main processing units for graphics calculations.',
            impact: 'More cores = more raw performance (at same architecture).',
            comparison: 'Cannot compare across architectures (efficiency differs).',
        },
        rtCores: {
            name: 'RT Cores / Ray Accelerators',
            description: 'Dedicated hardware for ray tracing calculations.',
            nvidia: 'RT Cores (most mature, best performance)',
            amd: 'Ray Accelerators (improving each generation)',
            importance: 'Without RT cores, ray tracing is done on shader cores (very slow).',
        },
        tensorCores: {
            name: 'Tensor Cores / AI Accelerators',
            description: 'Matrix math units for AI/ML workloads.',
            usage: ['DLSS upscaling', 'AI frame generation', 'Content creation AI'],
            nvidia: 'Tensor Cores (used for DLSS)',
            amd: 'AI Accelerators (used for FSR in future)',
        },
        tmu: {
            name: 'TMUs (Texture Mapping Units)',
            description: 'Apply textures to 3D objects.',
            impact: 'Higher TMU count = faster texture sampling.',
        },
        rop: {
            name: 'ROPs (Render Output Units)',
            description: 'Write final pixels to frame buffer.',
            impact: 'More ROPs = better performance at high resolutions.',
        },
    },
};

// === GPU MEMORY ===
export const GPU_MEMORY = {
    types: {
        gddr6: {
            name: 'GDDR6',
            speed: '14-18 Gbps',
            used_by: ['RTX 4060', 'RX 7600', 'Most mid-range cards'],
            bandwidth: 'Good for 1080p-1440p gaming',
        },
        gddr6x: {
            name: 'GDDR6X',
            speed: '21-24 Gbps',
            used_by: ['RTX 4090', 'RTX 4080', 'RTX 4070 Ti/Super'],
            bandwidth: 'Higher bandwidth, but runs hotter',
            note: 'Micron exclusive technology',
        },
        gddr7: {
            name: 'GDDR7',
            speed: '28-32+ Gbps',
            used_by: ['RTX 5090', 'RTX 5080', 'RTX 5070 Ti', 'RTX 5070'],
            bandwidth: '~50% more bandwidth than GDDR6X',
            benefits: ['Higher speeds', 'Better efficiency', 'Lower voltage'],
        },
        hbm: {
            name: 'HBM (High Bandwidth Memory)',
            speed: 'Highest bandwidth available',
            used_by: ['Professional GPUs (Quadro)', 'AI accelerators', 'AMD MI300'],
            bandwidth: '1-6 TB/s',
            note: 'Extremely expensive, used only in workstation/datacenter cards',
        },
    },

    capacity: {
        '1080p': { recommended: '8GB', minimum: '6GB' },
        '1440p': { recommended: '12GB', minimum: '8GB' },
        '4k': { recommended: '16GB+', minimum: '12GB' },
        textures: 'High/Ultra textures in modern games need 10GB+ VRAM.',
        futureProof: 'More VRAM = longer GPU lifespan for new games.',
    },

    busWidth: {
        description: 'Memory interface width - wider = more bandwidth.',
        examples: {
            '128-bit': 'Budget cards (RTX 4060)',
            '192-bit': 'Mid-range (RTX 4070)',
            '256-bit': 'High-end (RTX 4080)',
            '384-bit': 'Flagship (RTX 4090, RX 7900 XTX)',
        },
        impact: 'Wider bus + faster memory = higher bandwidth = better high-res performance.',
    },

    infinityCache: {
        name: 'AMD Infinity Cache',
        description: 'Large L3 cache on AMD GPUs to reduce memory bandwidth needs.',
        sizes: { 'RX 7900 XTX': '96MB', 'RX 7800 XT': '64MB', 'RX 7600': '32MB' },
        benefit: 'Allows AMD to use narrower memory bus while maintaining performance.',
    },
};

// === GPU TECHNOLOGIES ===
export const GPU_TECHNOLOGIES = {
    rayTracing: {
        description: 'Simulates realistic light behavior - reflections, shadows, global illumination.',
        performance: 'Very demanding - can halve FPS without upscaling.',
        levels: {
            'RT Shadows': 'Least demanding, subtle improvement',
            'RT Reflections': 'Moderate impact, very noticeable',
            'Global Illumination': 'Heavy impact, most realistic',
            'Path Tracing': 'Extreme impact, fully simulated light (Cyberpunk, Minecraft RTX)',
        },
        recommendation: 'Use with DLSS/FSR to maintain playable framerates.',
    },

    dlss: {
        name: 'DLSS (Deep Learning Super Sampling)',
        manufacturer: 'NVIDIA',
        versions: {
            'DLSS 1.0': 'Per-game training, mostly replaced',
            'DLSS 2.0': 'Universal AI model, great quality',
            'DLSS 3.0': 'Frame Generation - AI creates extra frames',
            'DLSS 3.5': 'Ray Reconstruction - AI-enhanced ray tracing',
            'DLSS 4.0': 'Multi-Frame Generation (up to 4x frames)',
        },
        requirements: 'RTX 20 series+ for upscaling, RTX 40 series+ for Frame Gen',
        quality: 'DLSS Quality mode often matches native resolution.',
    },

    fsr: {
        name: 'FSR (FidelityFX Super Resolution)',
        manufacturer: 'AMD (open source)',
        versions: {
            'FSR 1.0': 'Spatial upscaling (works anywhere)',
            'FSR 2.0': 'Temporal upscaling (like DLSS 2)',
            'FSR 3.0': 'Frame Generation added',
            'FSR 4.0': 'AI-powered (coming with RDNA 4)',
        },
        advantages: 'Works on any GPU (NVIDIA, AMD, Intel, even integrated).',
        quality: 'Good but not quite DLSS quality. Great for non-RTX users.',
    },

    xess: {
        name: 'XeSS (Xe Super Sampling)',
        manufacturer: 'Intel',
        versions: {
            'XeSS 1.0': 'AI upscaling for Intel Arc',
            'XeSS 2.0': 'Frame Generation added',
        },
        note: 'Works best on Intel Arc, but can run on other GPUs.',
    },

    frameGeneration: {
        description: 'AI creates intermediate frames for higher FPS.',
        benefits: 'Can double perceived FPS.',
        downsides: ['Adds input latency', 'Requires base 60+ FPS', 'Artifacts in fast motion'],
        recommendation: 'Great for single-player, avoid in competitive multiplayer.',
    },

    reflex: {
        name: 'NVIDIA Reflex',
        description: 'Reduces system latency by syncing CPU and GPU.',
        benefit: '20-50% latency reduction in supported games.',
        requirement: 'Any NVIDIA GPU, supported game.',
        competitive: 'Must-have for competitive gaming.',
    },

    antiLag: {
        name: 'AMD Anti-Lag',
        description: 'AMD\'s equivalent to NVIDIA Reflex.',
        benefit: 'Reduces input lag in supported games.',
        note: 'Anti-Lag+ caused game bans - stick to regular Anti-Lag.',
    },

    resizableBar: {
        name: 'Resizable BAR / Smart Access Memory',
        description: 'CPU can access full GPU VRAM instead of 256MB chunks.',
        benefit: '5-10% FPS improvement in some games.',
        requirement: 'Enable in BIOS + GPU driver setting.',
        note: 'Essentially same feature - AMD calls it SAM, NVIDIA calls it ReBAR.',
    },
};

// === GPU POWER ===
export const GPU_POWER = {
    tgp: {
        name: 'TGP (Total Graphics Power)',
        description: 'Total power consumption of the GPU card.',
        note: 'Includes GPU die + VRAM + VRMs + cooling fans.',
        examples: {
            'RTX 5090': '575W',
            'RTX 5080': '360W',
            'RTX 4090': '450W',
            'RTX 4070': '200W',
            'RX 7900 XTX': '355W',
            'RX 7600': '165W',
        },
    },

    powerConnectors: {
        '6-pin': { wattage: '75W', common: 'Budget cards' },
        '8-pin': { wattage: '150W', common: 'Mid-range cards' },
        '2x 8-pin': { wattage: '300W + slot', common: 'High-end cards' },
        '3x 8-pin': { wattage: '375W + slot', common: 'Flagship cards (3080, 3090)' },
        '12VHPWR': { wattage: '600W', common: 'RTX 40/50 series flagships' },
        '12V-2x6': { wattage: '600W', common: 'Updated 12VHPWR standard' },
    },

    '12vhpwr': {
        name: '12VHPWR / 12V-2x6',
        description: 'New high-power connector for modern GPUs.',
        wattage: 'Up to 600W through single connector.',
        issues: {
            problem: 'Original 12VHPWR had melting issues if not fully inserted.',
            fix: '12V-2x6 revision and proper insertion prevents issues.',
            prevention: ['Insert connector fully until click', 'Use high-quality adapter', 'Check for damage regularly'],
        },
        recommendation: 'Get ATX 3.0/3.1 PSU with native connector for RTX 40/50 series.',
    },

    transients: {
        name: 'Transient Power Spikes',
        description: 'Brief power spikes that exceed TGP rating.',
        example: 'RTX 4090 can spike to 600W+ despite 450W TGP.',
        problem: 'Older PSUs trigger overcurrent protection → system shutdown.',
        solution: 'ATX 3.0 PSUs handle transients properly.',
    },

    undervolting: {
        description: 'Reduce GPU voltage to lower temps and power while maintaining clocks.',
        tools: ['MSI Afterburner', 'NVIDIA Profile Inspector'],
        benefit: 'Can save 50-100W with minimal performance loss.',
        safe: 'Safe to try - worst case is crash/artifacts (just reset).',
        typical: 'Run at 900mV instead of 1050mV = 20% less power, same clocks.',
    },

    powerLimit: {
        description: 'Slider to cap maximum GPU power draw.',
        location: 'MSI Afterburner, NVIDIA/AMD control panel',
        benefit: 'Lower power limit = less heat + noise, small perf loss.',
        typical: '80% power limit = ~5% FPS loss, much cooler/quieter.',
    },
};

// === VIDEO ENCODING ===
export const VIDEO_ENCODING = {
    nvenc: {
        name: 'NVENC (NVIDIA Encoder)',
        description: 'Hardware video encoding on NVIDIA GPUs.',
        quality: 'Excellent quality, rivals x264 Medium in RTX 40 series.',
        use_cases: ['Streaming (OBS)', 'Video editing export', 'GeForce recording'],
        advantages: ['Zero FPS impact', 'Great quality', 'Fast exports'],
        generations: {
            'Turing (RTX 20)': 'Good quality',
            'Ampere (RTX 30)': 'Better quality, AV1 decode only',
            'Ada (RTX 40)': 'Excellent quality, dual encoder, AV1 encode',
            'Blackwell (RTX 50)': 'Best quality, improved AV1',
        },
        streaming: 'NVENC is the gold standard for game streaming.',
    },

    vce: {
        name: 'VCE / VCN (AMD Encoder)',
        description: 'Hardware video encoding on AMD GPUs.',
        quality: 'Good but slightly behind NVENC.',
        note: 'RDNA 3+ has AV1 encoding.',
        streaming: 'Works fine, but NVENC preferred by professional streamers.',
    },

    quickSync: {
        name: 'Intel QuickSync',
        description: 'Hardware encoding on Intel CPUs/GPUs.',
        quality: 'Good for casual use.',
        advantage: 'Works even without discrete GPU.',
        arc: 'Intel Arc GPUs have excellent AV1 encoding (2 encoders on A770).',
    },

    av1: {
        name: 'AV1 Codec',
        description: 'Next-gen video codec with better compression than H.264/H.265.',
        benefit: '50% smaller files at same quality vs H.264.',
        requirement: 'RTX 40+, RX 7000+, or Intel Arc for hardware encoding.',
        youtube: 'YouTube accepts AV1 uploads for better quality.',
        streaming: 'Twitch and YouTube support AV1 streaming.',
    },
};

// === DRIVERS ===
export const GPU_DRIVERS = {
    importance: {
        description: 'GPU drivers significantly impact performance and stability.',
        updates: 'New drivers often add 5-15% performance in new games.',
        recommendation: 'Update drivers for new game releases.',
    },

    types: {
        game_ready: {
            name: 'Game Ready / Adrenalin',
            description: 'Optimized for new game launches.',
            when: 'Install for new AAA releases.',
        },
        studio: {
            name: 'Studio / Pro Drivers',
            description: 'Optimized for content creation apps.',
            when: 'Use if you prioritize Premiere/DaVinci/3D apps.',
        },
    },

    ddu: {
        name: 'DDU (Display Driver Uninstaller)',
        description: 'Clean removal of GPU drivers.',
        when_to_use: [
            'Switching GPU brands (AMD ↔ NVIDIA)',
            'Troubleshooting driver issues',
            'Clean install of new drivers'
        ],
        procedure: 'Boot into Safe Mode → Run DDU → Clean and restart → Install new drivers.',
    },

    rollback: {
        description: 'Revert to older driver if new one causes issues.',
        how: 'Device Manager → Display Adapter → Properties → Roll Back Driver',
        alternative: 'Download older driver from manufacturer website.',
    },

    issues: {
        symptoms: ['Black screens', 'Crashes', 'Artifacts', 'Poor performance'],
        fixes: [
            'Update to latest driver',
            'Roll back to older driver',
            'Clean install with DDU',
            'Check GPU temps for hardware issues'
        ],
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get architecture info for a GPU
 */
export const getArchitectureInfo = (gpuName) => {
    const lower = gpuName?.toLowerCase() || '';

    // NVIDIA
    if (lower.includes('5090') || lower.includes('5080') || lower.includes('5070')) {
        return GPU_ARCHITECTURE.nvidia.blackwell;
    }
    if (lower.includes('4090') || lower.includes('4080') || lower.includes('4070') || lower.includes('4060')) {
        return GPU_ARCHITECTURE.nvidia.ada;
    }
    if (lower.includes('3090') || lower.includes('3080') || lower.includes('3070') || lower.includes('3060')) {
        return GPU_ARCHITECTURE.nvidia.ampere;
    }

    // AMD
    if (lower.includes('9800') || lower.includes('9700') || lower.includes('9600')) {
        return GPU_ARCHITECTURE.amd.rdna4;
    }
    if (lower.includes('7900') || lower.includes('7800') || lower.includes('7700') || lower.includes('7600')) {
        return GPU_ARCHITECTURE.amd.rdna3;
    }

    // Intel
    if (lower.includes('b580') || lower.includes('b570')) {
        return GPU_ARCHITECTURE.intel.battlemage;
    }
    if (lower.includes('a770') || lower.includes('a750')) {
        return GPU_ARCHITECTURE.intel.alchemist;
    }

    return null;
};

/**
 * Get recommended PSU for a GPU
 */
export const getRecommendedPSU = (gpuName) => {
    const lower = gpuName?.toLowerCase() || '';

    if (lower.includes('5090')) return { wattage: '1000W+', connector: '12V-2x6', atx3: true };
    if (lower.includes('5080') || lower.includes('4090')) return { wattage: '850W+', connector: '12VHPWR', atx3: true };
    if (lower.includes('5070 ti') || lower.includes('4080')) return { wattage: '750W+', connector: '12VHPWR', atx3: true };
    if (lower.includes('5070') || lower.includes('4070')) return { wattage: '650W', connector: '1x 8-pin or 12VHPWR', atx3: false };
    if (lower.includes('4060')) return { wattage: '550W', connector: '1x 8-pin', atx3: false };
    if (lower.includes('7900')) return { wattage: '800W+', connector: '2x 8-pin', atx3: false };
    if (lower.includes('7800') || lower.includes('7700')) return { wattage: '650W', connector: '2x 8-pin', atx3: false };
    if (lower.includes('7600')) return { wattage: '550W', connector: '1x 8-pin', atx3: false };

    return { wattage: '650W', connector: 'Varies', note: 'Check GPU specs' };
};

/**
 * Compare upscaling technologies
 */
export const compareUpscaling = () => ({
    dlss: { quality: 'Best', requirement: 'NVIDIA RTX', frameGen: 'RTX 40+', ai: true },
    fsr: { quality: 'Good', requirement: 'Any GPU', frameGen: 'Any modern GPU', ai: false },
    xess: { quality: 'Good', requirement: 'Best on Arc', frameGen: 'Arc only', ai: true },
    verdict: 'DLSS > XeSS ≈ FSR 3 > FSR 2. Use DLSS if available, FSR otherwise.',
});

/**
 * Get encoding recommendation
 */
export const getEncodingRecommendation = (useCase) => {
    if (useCase === 'streaming') {
        return {
            best: 'NVENC (RTX 40 series)',
            alternative: 'AMD VCN or x264 Software',
            codec: 'H.264 for compatibility, AV1 for quality (if supported by platform)',
        };
    }
    if (useCase === 'editing') {
        return {
            best: 'NVENC for H.264/H.265, AV1 for future-proofing',
            note: 'Use hardware encoding for previews, software for final export (quality)',
        };
    }
    return { recommendation: 'NVENC for NVIDIA, VCN for AMD, QuickSync for Intel' };
};

export default {
    GPU_ARCHITECTURE,
    GPU_MEMORY,
    GPU_TECHNOLOGIES,
    GPU_POWER,
    VIDEO_ENCODING,
    GPU_DRIVERS,
    getArchitectureInfo,
    getRecommendedPSU,
    compareUpscaling,
    getEncodingRecommendation,
};
