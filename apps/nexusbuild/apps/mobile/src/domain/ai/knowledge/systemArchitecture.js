/**
 * 🔗 NEXUS AI - System Architecture Knowledge
 * 
 * Expert knowledge on how PC components work together:
 * - PCIe bus and lane allocation
 * - Memory controller and bandwidth
 * - CPU-GPU communication
 * - Bottleneck analysis
 * - Data flow paths
 * - Latency considerations
 */

// === PCIE BUS ===
export const PCIE_BUS = {
    overview: {
        description: 'PCIe is the high-speed bus connecting GPU, NVMe, and expansion cards.',
        importance: 'Determines maximum bandwidth between CPU and devices.',
    },

    generations: {
        'PCIe 3.0': { bandwidth: '1 GB/s per lane', x16: '16 GB/s' },
        'PCIe 4.0': { bandwidth: '2 GB/s per lane', x16: '32 GB/s' },
        'PCIe 5.0': { bandwidth: '4 GB/s per lane', x16: '64 GB/s' },
    },

    laneAllocation: {
        description: 'CPU and chipset provide a limited number of PCIe lanes.',
        cpuLanes: {
            AMD: { AM5: '24 lanes (16 GPU + 4 NVMe + 4 chipset)', AM4: '20-24 lanes' },
            Intel: { LGA1700: '16 GPU + 4 NVMe + 4 DMI', LGA1851: '16 GPU + 4 NVMe + 8 DMI' },
        },
        chipsetLanes: {
            description: 'Additional lanes from chipset, connected via DMI/IF link.',
            bandwidth: 'Shared! Not as fast as direct CPU lanes.',
            use: 'Secondary NVMe, SATA, USB, network',
        },
    },

    gpuBandwidth: {
        x16: 'Full bandwidth - optimal',
        x8: '~0-3% performance loss for gaming',
        x4: 'Significant bottleneck - avoid for gaming GPUs',
        note: 'PCIe 4.0 x8 = PCIe 3.0 x16 bandwidth',
    },

    bifurcation: {
        description: 'Splitting one x16 slot into multiple x8 or x4 slots.',
        use: 'Multiple NVMe via adapter, multi-GPU',
        requirement: 'CPU and motherboard BIOS support needed.',
    },
};

// === MEMORY CONTROLLER ===
export const MEMORY_CONTROLLER = {
    overview: {
        description: 'IMC (Integrated Memory Controller) is built into the CPU.',
        function: 'Manages all communication between CPU cores and RAM.',
    },

    dualChannel: {
        description: 'Two parallel memory channels double bandwidth.',
        bandwidth: {
            'DDR4-3200 dual': '51.2 GB/s',
            'DDR5-6000 dual': '96 GB/s',
        },
        importance: 'Single channel = half bandwidth = 10-20% FPS loss.',
    },

    infinityFabric: {
        name: 'Infinity Fabric (AMD)',
        description: 'AMD interconnect linking cores, cache, and memory controller.',
        fclk: 'Fabric Clock - syncs with memory clock.',
        optimal: {
            'DDR4 Ryzen 5000': 'FCLK 1800MHz = DDR4-3600',
            'DDR5 Ryzen 7000': 'FCLK 3000MHz = DDR5-6000',
            'DDR5 Ryzen 9000': 'FCLK 3000MHz = DDR5-6000 (same limit)',
        },
        desync: 'Above 1:1 ratio, FCLK runs at half speed (higher latency).',
    },

    ringBus: {
        name: 'Ring Bus (Intel)',
        description: 'Intel interconnect linking cores and cache.',
        characteristics: 'Lower memory sensitivity than AMD.',
    },
};

// === CPU-GPU COMMUNICATION ===
export const CPU_GPU_COMMUNICATION = {
    overview: {
        description: 'CPU and GPU constantly exchange data for rendering.',
    },

    dataFlow: {
        cpuToGpu: [
            'Draw calls (rendering commands)',
            'Game state data',
            'Textures and assets (from storage via RAM)',
        ],
        gpuToCpu: [
            'Rendered frames for display',
            'Compute results (physics, AI)',
        ],
    },

    bottlenecks: {
        cpuBound: {
            symptoms: ['GPU usage < 95%', 'CPU at 100% on some cores', 'FPS doesn\'t increase with lower resolution'],
            cause: 'CPU can\'t send draw calls fast enough',
            solutions: ['Faster CPU', 'Lower game settings (shadows, NPCs)', 'Cap frame rate'],
        },
        gpuBound: {
            symptoms: ['GPU at 99-100%', 'CPU usage moderate', 'FPS drops with higher resolution'],
            cause: 'GPU can\'t render frames fast enough',
            solutions: ['Faster GPU', 'Lower resolution/settings', 'Use DLSS/FSR'],
            note: 'This is the IDEAL scenario - GPU fully utilized.',
        },
    },

    drawCalls: {
        description: 'Instructions from CPU telling GPU what to render.',
        impact: 'More objects = more draw calls = more CPU work.',
        optimization: 'Batching, instancing reduce draw call overhead.',
    },

    smartAccessMemory: {
        name: 'Resizable BAR / Smart Access Memory',
        description: 'CPU can access full GPU VRAM instead of 256MB chunks.',
        benefit: 'Faster texture loading, 5-10% FPS in some games.',
        requirement: 'Enable in BIOS + GPU driver.',
    },
};

// === BOTTLENECK ANALYSIS ===
export const BOTTLENECK_ANALYSIS = {
    overview: {
        description: 'Identifying which component limits overall performance.',
        goal: 'Balanced system where GPU is the limiting factor.',
    },

    detection: {
        monitoring: {
            tools: ['MSI Afterburner', 'HWiNFO64', 'Task Manager'],
            metrics: ['GPU usage %', 'CPU usage per core', 'RAM usage', 'VRAM usage'],
        },
        interpretation: {
            'GPU 99%, CPU 60%': 'GPU bottleneck - ideal',
            'GPU 70%, CPU 100%': 'CPU bottleneck - upgrade CPU or lower settings',
            'Both 50%': 'Possible RAM/VRAM issue, or game capping FPS',
        },
    },

    cpuGpuBalance: {
        guidelines: {
            '1080p': 'CPU-heavy workload, need stronger CPU',
            '1440p': 'Balanced workload',
            '4K': 'GPU-heavy workload, strong GPU matters most',
        },
        resolution_scaling: {
            higher: 'More GPU work, less CPU bottleneck',
            lower: 'More CPU work, GPU waits on CPU',
        },
    },

    pairings: {
        budget: {
            cpu: 'Ryzen 5 5600 / i5-12400F',
            gpu: 'RTX 4060 / RX 7600',
            balance: 'Good for 1080p',
        },
        midRange: {
            cpu: 'Ryzen 7 7800X3D / i5-14600K',
            gpu: 'RTX 4070 Super / RX 7800 XT',
            balance: 'Great for 1440p',
        },
        highEnd: {
            cpu: 'Ryzen 9 9800X3D / i9-14900K',
            gpu: 'RTX 4080 Super / RTX 5080',
            balance: 'Excellent for 4K',
        },
        flagship: {
            cpu: 'Ryzen 9 9800X3D',
            gpu: 'RTX 5090',
            balance: '4K/8K, no compromises',
        },
    },

    ramBottleneck: {
        symptoms: ['Stuttering', 'Low GPU usage', 'High RAM usage'],
        causes: ['Too little RAM (< 16GB)', 'Single channel', 'Slow speed', 'No XMP'],
        solutions: ['Add RAM', 'Enable XMP/EXPO', 'Use correct slots for dual channel'],
    },

    storageBottleneck: {
        symptoms: ['Long load times', 'Texture pop-in', 'Stuttering in open-world'],
        causes: ['HDD for games', 'DRAMless SSD under heavy load'],
        solutions: ['Install games on SSD', 'Upgrade to NVMe'],
    },
};

// === DATA FLOW PATHS ===
export const DATA_FLOW = {
    gameAssetPath: {
        description: 'How game assets get from storage to screen.',
        path: [
            '1. Game data stored on SSD/HDD',
            '2. Data loaded into system RAM',
            '3. CPU processes game logic',
            '4. Assets sent to GPU via PCIe',
            '5. GPU stores textures in VRAM',
            '6. GPU renders frame',
            '7. Frame sent to monitor via DisplayPort/HDMI',
        ],
    },

    streamingComparison: {
        hdd: 'Slow random access, texture pop-in',
        sata_ssd: 'Good, minimal pop-in',
        nvme: 'Excellent, virtually instant',
        directstorage: {
            description: 'GPU decompresses assets directly (DirectStorage/RTX IO)',
            benefit: 'Faster loading, less CPU overhead',
            requirement: 'NVMe SSD + supported game + Windows 11',
        },
    },
};

// === LATENCY ===
export const SYSTEM_LATENCY = {
    overview: {
        description: 'Total delay from input to display output.',
        components: ['Input device', 'USB polling', 'CPU processing', 'Render queue', 'GPU rendering', 'Display refresh'],
    },

    endToEnd: {
        components: {
            inputLag: '1-8ms (USB polling rate dependent)',
            cpuProcessing: '5-15ms',
            renderQueue: '0-30ms (depends on frame queue)',
            gpuRendering: 'One frame time (e.g., 6.9ms at 144 FPS)',
            displayOutput: '1-5ms (monitor response time)',
        },
        total: '20-60ms typical',
    },

    optimization: {
        nvidia_reflex: 'Reduces render queue latency',
        amd_antilag: 'Similar to Reflex',
        low_latency_mode: 'GPU control panel setting',
        tips: [
            'Higher FPS = lower frame time = less latency',
            'Turn off V-Sync (adds input lag)',
            'Use G-Sync/FreeSync (tear-free without V-Sync lag)',
            'Enable Reflex/Anti-Lag in supported games',
        ],
    },
};

// === COMPATIBILITY MATRIX ===
export const COMPATIBILITY_MATRIX = {
    cpuMobo: {
        description: 'CPU socket must match motherboard socket.',
        pairs: {
            'AM5': ['Ryzen 7000', 'Ryzen 9000'],
            'AM4': ['Ryzen 1000-5000'],
            'LGA 1700': ['Intel 12th-14th Gen'],
            'LGA 1851': ['Intel Core Ultra 200'],
        },
    },
    ramMobo: {
        description: 'RAM generation must match motherboard.',
        pairs: {
            'DDR5 only': ['AM5', 'LGA 1851'],
            'DDR4 or DDR5': ['LGA 1700 (board specific)'],
            'DDR4 only': ['AM4'],
        },
    },
    coolerSocket: {
        description: 'Cooler mounting must support CPU socket.',
        note: 'Most coolers include multiple brackets, check before buying.',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Analyze CPU/GPU balance
 */
export const analyzeBalance = (cpuTier, gpuTier, resolution) => {
    const tiers = { budget: 1, midRange: 2, highEnd: 3, flagship: 4 };
    const cpuScore = tiers[cpuTier] || 2;
    const gpuScore = tiers[gpuTier] || 2;

    const resolutionModifier = { '1080p': 0.5, '1440p': 0, '4K': -0.5 };
    const balance = cpuScore - gpuScore + (resolutionModifier[resolution] || 0);

    if (Math.abs(balance) < 0.5) return { status: 'Balanced', recommendation: 'Good pairing' };
    if (balance > 0.5) return { status: 'GPU bottleneck', recommendation: 'Consider faster GPU' };
    return { status: 'CPU bottleneck', recommendation: 'Consider faster CPU or higher resolution' };
};

/**
 * Get recommended pairing
 */
export const getRecommendedPairing = (gpu) => {
    const pairings = {
        'RTX 5090': { cpu: 'Ryzen 9 9800X3D', resolution: '4K' },
        'RTX 5080': { cpu: 'Ryzen 7 9800X3D / i7-14700K', resolution: '4K' },
        'RTX 4080 Super': { cpu: 'Ryzen 7 7800X3D / i7-14700K', resolution: '4K' },
        'RTX 4070 Super': { cpu: 'Ryzen 7 7800X3D / i5-14600K', resolution: '1440p' },
        'RTX 4060': { cpu: 'Ryzen 5 7600 / i5-14400F', resolution: '1080p' },
    };
    return pairings[gpu] || { cpu: 'Check specific model', resolution: 'Varies' };
};

/**
 * Explain system term
 */
export const explainSystemTerm = (term) => {
    const terms = {
        pcie: PCIE_BUS.overview,
        'pcie lanes': PCIE_BUS.laneAllocation,
        'infinity fabric': MEMORY_CONTROLLER.infinityFabric,
        fclk: MEMORY_CONTROLLER.infinityFabric,
        imc: MEMORY_CONTROLLER.overview,
        rebar: CPU_GPU_COMMUNICATION.smartAccessMemory,
        'resizable bar': CPU_GPU_COMMUNICATION.smartAccessMemory,
        bottleneck: BOTTLENECK_ANALYSIS.overview,
        latency: SYSTEM_LATENCY.overview,
    };
    return terms[term?.toLowerCase()] || null;
};

export default {
    PCIE_BUS,
    MEMORY_CONTROLLER,
    CPU_GPU_COMMUNICATION,
    BOTTLENECK_ANALYSIS,
    DATA_FLOW,
    SYSTEM_LATENCY,
    COMPATIBILITY_MATRIX,
    analyzeBalance,
    getRecommendedPairing,
    explainSystemTerm,
};
