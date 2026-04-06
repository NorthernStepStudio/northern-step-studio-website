/**
 * 🔌 NEXUS AI - Motherboard Deep Dive Knowledge
 *
 * Expert-level motherboard knowledge including:
 * - VRM (phases, MOSFETs, quality)
 * - Chipsets (Intel Z/B/H, AMD X/B/A)
 * - BIOS/UEFI (settings, flashing, recovery)
 * - Connectivity (PCIe, M.2, USB, audio)
 * - Form factors (ATX, mATX, ITX)
 */

// === VRM (Voltage Regulator Module) ===
export const VRM_KNOWLEDGE = {
    overview: {
        description: 'VRM converts 12V from PSU to ~1.2V for CPU. Quality directly affects stability and overclocking.',
        components: ['Controller IC', 'Power stages (MOSFETs)', 'Chokes', 'Capacitors'],
        importance: 'Weak VRM = throttling under load, especially with high-power CPUs.',
    },

    phases: {
        description: 'Number of parallel power delivery circuits. More phases = smoother/cleaner power.',
        marketing: 'Beware "16 phase" claims - could be 8 true phases doubled.',
        types: {
            true: 'Each phase has its own controller signal - best quality.',
            doubled: 'Two MOSFETs share one controller signal - still good.',
            virtual: 'Marketing speak - not actually more phases.',
        },
        recommendations: {
            budget: '4-6 true phases (i5, Ryzen 5)',
            midRange: '8-12 phases (i7, Ryzen 7)',
            highEnd: '14-20+ phases (i9, Ryzen 9, overclocking)',
        },
    },

    powerStages: {
        name: 'Power Stages / DrMOS / SPS',
        description: 'Integrated MOSFETs that handle current. Measured in amps per phase.',
        ratings: {
            budget: '40-50A per phase',
            midRange: '60-70A per phase',
            highEnd: '90-110A per phase',
        },
        example: '16x 90A phases = 1440A total current capability.',
        totalPower: 'More amps × more phases = more power handling for overclocking.',
    },

    heatsinks: {
        description: 'VRM heatsinks dissipate heat from power stages.',
        importance: 'Good heatsinks prevent VRM throttling during extended load.',
        indicators: {
            good: ['Large aluminum heatsinks', 'Thermal pads', 'Heatpipe design'],
            bad: ['No heatsinks', 'Small/thin heatsinks', 'No thermal contact'],
        },
    },

    quality_tiers: {
        tier1: {
            examples: ['ASUS ROG Crosshair', 'MSI MEG Godlike', 'Gigabyte Aorus Master'],
            vrm: '18-24 phases, 90A+ stages, excellent heatsinks',
            for: 'Extreme overclocking, i9/Ryzen 9 without limits',
        },
        tier2: {
            examples: ['ASUS ROG Strix', 'MSI Tomahawk', 'Gigabyte Aorus Pro'],
            vrm: '12-16 phases, 60-90A stages, good heatsinks',
            for: 'Most users, including moderate overclocking',
        },
        tier3: {
            examples: ['ASUS Prime', 'MSI Pro', 'Gigabyte Gaming'],
            vrm: '6-10 phases, 40-60A stages, basic heatsinks',
            for: 'Budget builds, locked CPUs',
        },
    },
};

// === CHIPSETS ===
export const CHIPSETS = {
    overview: {
        description: 'Chipset determines motherboard features: PCIe lanes, USB ports, overclocking.',
        naming: {
            intel: 'Z = Enthusiast, B = Mainstream, H = Budget',
            amd: 'X = Enthusiast, B = Mainstream, A = Budget',
        },
    },

    intel: {
        current: {
            Z890: {
                socket: 'LGA 1851',
                cpus: 'Core Ultra 200 (Arrow Lake)',
                pcie: 'PCIe 5.0 x16 (GPU), PCIe 5.0 x4 (SSD)',
                usb: 'USB 4.0, USB 3.2 Gen 2x2',
                features: ['Overclocking', 'WiFi 7 ready', 'DDR5 only'],
                price: '$250-600',
            },
            B860: {
                socket: 'LGA 1851',
                cpus: 'Core Ultra 200 (Arrow Lake)',
                pcie: 'PCIe 5.0 x16 (GPU), PCIe 4.0 (SSD)',
                features: ['No overclocking', 'WiFi 6E', 'DDR5 only'],
                price: '$150-250',
            },
            Z790: {
                socket: 'LGA 1700',
                cpus: '12th-14th Gen Intel',
                pcie: 'PCIe 5.0 x16 (GPU), PCIe 4.0 (SSD)',
                features: ['Overclocking', 'WiFi 6E/7', 'DDR4 or DDR5'],
                price: '$200-700',
            },
            B760: {
                socket: 'LGA 1700',
                cpus: '12th-14th Gen Intel',
                pcie: 'PCIe 5.0 x16 (GPU), PCIe 4.0 (SSD)',
                features: ['No CPU OC (RAM OC allowed)', 'DDR4 or DDR5'],
                price: '$100-200',
                note: 'Best value for most Intel builds.',
            },
        },
    },

    amd: {
        current: {
            X870E: {
                socket: 'AM5',
                cpus: 'Ryzen 7000/9000',
                pcie: 'PCIe 5.0 x16 + PCIe 5.0 x4 NVMe',
                usb: 'USB4 (native)',
                features: ['Full overclocking', 'WiFi 7 ready', 'Premium VRM'],
                price: '$300-500',
            },
            X870: {
                socket: 'AM5',
                cpus: 'Ryzen 7000/9000',
                pcie: 'PCIe 5.0 x16 + PCIe 4.0 NVMe',
                features: ['Overclocking', 'USB4', 'WiFi 7'],
                price: '$200-350',
            },
            B650E: {
                socket: 'AM5',
                cpus: 'Ryzen 7000/9000',
                pcie: 'PCIe 5.0 x16 + PCIe 5.0 x4',
                features: ['Overclocking', 'PCIe 5.0 SSD'],
                price: '$180-280',
            },
            B650: {
                socket: 'AM5',
                cpus: 'Ryzen 7000/9000',
                pcie: 'PCIe 4.0 (most boards)',
                features: ['Overclocking', 'WiFi optional'],
                price: '$120-200',
                note: 'Best value for AM5 platform.',
            },
            A620: {
                socket: 'AM5',
                cpus: 'Ryzen 7000/9000 (limited)',
                features: ['No overclocking', 'Basic features', 'Budget option'],
                price: '$80-120',
                note: 'Avoid for X3D or high-power CPUs.',
            },
        },
        legacy: {
            X570: { socket: 'AM4', pcie: 'PCIe 4.0', note: 'Top-tier AM4' },
            B550: { socket: 'AM4', pcie: 'PCIe 4.0', note: 'Best value AM4' },
            A520: { socket: 'AM4', pcie: 'PCIe 3.0', note: 'Budget AM4' },
        },
    },

    choosing: {
        needOC: 'Z (Intel) or any AMD (B650/X670/X870)',
        noOC: 'B760 (Intel) or B650 (AMD)',
        budget: 'B760 (Intel) or A620/B650 (AMD)',
        enthusiast: 'Z890/Z790 (Intel) or X870E (AMD)',
    },
};

// === BIOS/UEFI ===
export const BIOS_KNOWLEDGE = {
    overview: {
        description: 'BIOS/UEFI is firmware that initializes hardware and boots OS.',
        uefi: 'Modern replacement for legacy BIOS - graphical interface, mouse support.',
        access: 'Press DEL or F2 during boot (varies by manufacturer).',
    },

    key_settings: {
        xmp_expo: {
            name: 'XMP / EXPO',
            description: 'Enable RAM to run at advertised speeds.',
            location: 'AI Tweaker / OC Tweaker / DRAM settings',
            importance: 'RAM runs at 2133MHz without this!',
        },
        resizableBar: {
            name: 'Resizable BAR / Above 4G Decoding',
            description: 'Enable full GPU VRAM access.',
            location: 'Advanced / PCI settings',
            benefit: '5-10% FPS improvement in some games.',
        },
        virtualization: {
            name: 'VT-x / AMD-V / SVM',
            description: 'Enable CPU virtualization.',
            usage: 'Required for WSL2, Docker, VMs, Android emulators.',
        },
        secureboot: {
            name: 'Secure Boot',
            description: 'Security feature - required by Windows 11.',
            note: 'May need to disable for Linux dual boot.',
        },
        tpm: {
            name: 'TPM 2.0',
            description: 'Security chip - required by Windows 11.',
            options: 'Discrete TPM or fTPM (firmware TPM in CPU).',
        },
        pbo: {
            name: 'PBO / Precision Boost Overdrive',
            description: 'AMD auto-overclock feature.',
            location: 'AMD Overclocking section',
        },
        fanCurves: {
            name: 'Fan Curves',
            description: 'Customize fan speeds based on temperature.',
            location: 'Monitor / Fan settings',
        },
    },

    updating: {
        why: [
            'New CPU support (required for newer CPUs)',
            'Stability improvements',
            'New features (RAM compatibility, etc.)',
            'Security patches',
        ],
        methods: {
            usb: 'Most reliable - download BIOS, put on USB, flash from BIOS menu.',
            flashback: 'Flash without CPU - button on rear I/O (high-end boards).',
            windows: 'Manufacturer utility - less reliable, avoid if possible.',
        },
        cautions: [
            'Never flash during thunderstorm',
            'Use wired power (laptop) or UPS (desktop)',
            'Don\'t interrupt the process',
            'If it fails, some boards have dual BIOS'
        ],
    },

    recovery: {
        cmos_reset: {
            description: 'Reset BIOS to defaults if system won\'t boot.',
            methods: [
                'Clear CMOS jumper (move jumper for 10 seconds)',
                'Remove CMOS battery for 5 minutes',
                'Clear CMOS button on rear I/O'
            ],
        },
        bios_flashback: {
            description: 'Recover corrupted BIOS without CPU.',
            requirement: 'Motherboard with BIOS Flashback button.',
            procedure: 'Rename BIOS file, put on USB, insert in flashback port, press button.',
        },
    },
};

// === CONNECTIVITY ===
export const CONNECTIVITY = {
    pcie: {
        generations: {
            'PCIe 3.0': { bandwidth: '1 GB/s per lane', common: 'Older GPUs, SATA SSDs' },
            'PCIe 4.0': { bandwidth: '2 GB/s per lane', common: 'Current GPUs, Gen4 NVMe' },
            'PCIe 5.0': { bandwidth: '4 GB/s per lane', common: 'Newest GPUs, Gen5 NVMe' },
        },
        slots: {
            'x16': 'GPU slot (full bandwidth)',
            'x8': 'Second GPU or some NVMe adapters',
            'x4': 'NVMe SSDs, capture cards, NICs',
            'x1': 'Sound cards, USB expansion, etc.',
        },
        lanes: {
            description: 'CPU and chipset provide PCIe lanes.',
            cpuLanes: 'Direct to CPU - lowest latency (GPU, primary NVMe)',
            chipsetLanes: 'Through chipset - shared bandwidth (secondary devices)',
        },
    },

    m2: {
        description: 'M.2 slots for NVMe SSDs.',
        types: {
            'M.2 NVMe': 'Fast - uses PCIe (up to 14,000 MB/s Gen5)',
            'M.2 SATA': 'Slower - uses SATA protocol (550 MB/s)',
        },
        sizing: '2280 is standard (22mm wide, 80mm long)',
        sharing: 'Some M.2 slots share lanes with SATA ports - check manual!',
        heatsinks: 'Gen5 SSDs REQUIRE heatsinks. Gen4 benefit from them.',
    },

    usb: {
        generations: {
            'USB 2.0': { speed: '480 Mbps', use: 'Keyboards, mice' },
            'USB 3.0 (3.2 Gen 1)': { speed: '5 Gbps', use: 'Flash drives' },
            'USB 3.1 (3.2 Gen 2)': { speed: '10 Gbps', use: 'External SSDs' },
            'USB 3.2 Gen 2x2': { speed: '20 Gbps', use: 'Fast external storage' },
            'USB4': { speed: '40 Gbps', use: 'Thunderbolt-like, external GPUs' },
        },
        types: {
            'Type-A': 'Standard rectangular port',
            'Type-C': 'Reversible oval port',
        },
        headers: {
            description: 'Internal headers for front panel USB.',
            'USB 2.0 header': '9-pin',
            'USB 3.0 header': '19-pin',
            'USB-C header': '20-pin key-A',
        },
    },

    audio: {
        codecs: {
            'Realtek ALC897': 'Budget - basic quality',
            'Realtek ALC1200': 'Mid-range - good quality',
            'Realtek ALC1220': 'High-end - excellent quality (7.1)',
            'Realtek ALC4080/4082': 'Premium - near DAC quality',
        },
        features: {
            dac: 'Some boards have dedicated DAC chips (ESS Sabre)',
            opAmps: 'Replaceable op-amps on high-end boards',
            shielding: 'Audio PCB separation reduces interference',
        },
        recommendation: 'Onboard audio is good enough for most. Audiophiles get external DAC.',
    },

    network: {
        ethernet: {
            '1 Gbps': 'Standard, enough for most',
            '2.5 Gbps': 'Common on mid-range+, good for NAS',
            '5/10 Gbps': 'Enthusiast boards, needs matching switch',
        },
        wifi: {
            'WiFi 5 (802.11ac)': 'Older standard',
            'WiFi 6 (802.11ax)': 'Current mainstream',
            'WiFi 6E': 'Adds 6GHz band - less congestion',
            'WiFi 7': 'Newest - faster speeds, lower latency',
        },
    },
};

// === FORM FACTORS ===
export const FORM_FACTORS = {
    ATX: {
        size: '305mm × 244mm',
        slots: '7 expansion slots',
        features: 'Full-size, most features, best VRM/cooling',
        for: 'Standard builds, no size constraints',
        caseRequirement: 'Mid-tower or Full-tower case',
    },
    mATX: {
        name: 'Micro-ATX',
        size: '244mm × 244mm',
        slots: '4 expansion slots',
        features: 'Compact, usually good VRM, fewer PCIe slots',
        for: 'Smaller builds with some expandability',
        caseRequirement: 'Micro-ATX or ATX case',
    },
    ITX: {
        name: 'Mini-ITX',
        size: '170mm × 170mm',
        slots: '1 expansion slot (GPU only)',
        features: 'Very compact, limited VRM, premium pricing',
        for: 'SFF builds, living room PCs',
        caseRequirement: 'Mini-ITX case',
        challenges: ['Limited cooling', 'One GPU slot', 'Premium price', 'Careful thermals'],
    },
    EATX: {
        name: 'Extended ATX',
        size: '305mm × 330mm',
        slots: '7+ expansion slots',
        features: 'Extra width for better VRM, more features',
        for: 'Workstations, enthusiast builds',
        caseRequirement: 'Full-tower with E-ATX support',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get chipset recommendation based on requirements
 */
export const getChipsetRecommendation = ({ platform, needsOC, budget }) => {
    if (platform === 'intel') {
        if (needsOC) return { chipset: 'Z790', reason: 'Required for Intel overclocking' };
        return { chipset: 'B760', reason: 'Best value, RAM OC supported' };
    }
    if (platform === 'amd') {
        if (budget === 'low') return { chipset: 'B650', reason: 'Great value, full OC support' };
        if (needsOC) return { chipset: 'X870/X870E', reason: 'Best features + USB4' };
        return { chipset: 'B650', reason: 'Excellent balance of price/features' };
    }
    return null;
};

/**
 * Check VRM adequacy for a CPU
 */
export const checkVRMAdequacy = (cpuTDP, vrmPhases) => {
    if (cpuTDP <= 65) return vrmPhases >= 4 ? 'adequate' : 'weak';
    if (cpuTDP <= 125) return vrmPhases >= 8 ? 'adequate' : 'marginal';
    if (cpuTDP <= 170) return vrmPhases >= 12 ? 'adequate' : 'marginal';
    return vrmPhases >= 16 ? 'adequate' : 'needs better board';
};

/**
 * Explain a motherboard concept
 */
export const explainMoboTerm = (term) => {
    const terms = {
        vrm: VRM_KNOWLEDGE.overview,
        phases: VRM_KNOWLEDGE.phases,
        'power stages': VRM_KNOWLEDGE.powerStages,
        xmp: BIOS_KNOWLEDGE.key_settings.xmp_expo,
        expo: BIOS_KNOWLEDGE.key_settings.xmp_expo,
        'resizable bar': BIOS_KNOWLEDGE.key_settings.resizableBar,
        rebar: BIOS_KNOWLEDGE.key_settings.resizableBar,
        'cmos reset': BIOS_KNOWLEDGE.recovery.cmos_reset,
        bios: BIOS_KNOWLEDGE.overview,
        uefi: BIOS_KNOWLEDGE.overview,
        pcie: CONNECTIVITY.pcie,
        'pcie lanes': CONNECTIVITY.pcie.lanes,
        m2: CONNECTIVITY.m2,
        'm.2': CONNECTIVITY.m2,
        usb4: { description: 'Latest USB standard, 40 Gbps, replaces Thunderbolt 3' },
        wifi7: CONNECTIVITY.network.wifi['WiFi 7'],
    };
    return terms[term?.toLowerCase()] || null;
};

/**
 * Get form factor recommendation
 */
export const getFormFactorRecommendation = (useCase) => {
    const recommendations = {
        gaming: { formFactor: 'ATX', reason: 'Best cooling, full features, good GPU clearance' },
        sff: { formFactor: 'Mini-ITX', reason: 'Smallest footprint, but plan cooling carefully' },
        budget: { formFactor: 'mATX', reason: 'More affordable, still has essential features' },
        workstation: { formFactor: 'E-ATX', reason: 'Maximum expansion and VRM for high-TDP CPUs' },
    };
    return recommendations[useCase] || recommendations.gaming;
};

export default {
    VRM_KNOWLEDGE,
    CHIPSETS,
    BIOS_KNOWLEDGE,
    CONNECTIVITY,
    FORM_FACTORS,
    getChipsetRecommendation,
    checkVRMAdequacy,
    explainMoboTerm,
    getFormFactorRecommendation,
};
