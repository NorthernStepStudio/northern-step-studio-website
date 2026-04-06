/**
 * 🔧 NEXUS AI - PC Building Guide
 * 
 * Comprehensive step-by-step building knowledge:
 * - Tools needed
 * - Preparation steps
 * - Component installation order
 * - Cable management
 * - First boot process
 * - Common mistakes
 * - Troubleshooting dead builds
 */

// === TOOLS NEEDED ===
export const BUILDING_TOOLS = {
    essential: {
        phillips_1: {
            name: '#1 Phillips Screwdriver',
            use: 'M.2 screws, some motherboard screws',
            tip: 'Magnetic tip helps',
        },
        phillips_2: {
            name: '#2 Phillips Screwdriver',
            use: 'Most PC screws (case, PSU, motherboard standoffs)',
            tip: 'This is the main screwdriver you need',
        },
        workspace: {
            name: 'Clean, flat surface',
            tip: 'Dining table works great. NOT on carpet (static)',
        },
    },

    recommended: {
        magnetic_tray: 'Holds screws, prevents losing them',
        flashlight: 'See inside dark case corners',
        zip_ties: 'Cable management (velcro is reusable and better)',
        anti_static: 'Anti-static wrist strap (optional but safe)',
        thermal_paste: 'In case you need to remount cooler (most coolers include)',
        isopropyl: '99% isopropyl alcohol for cleaning thermal paste',
    },

    optional: {
        long_screwdriver: 'For deep case screws',
        tweezers: 'Dropping screws in tight spaces',
        cable_ties: 'Zip ties or velcro straps',
        monitor: 'For testing (any temporary display works)',
    },

    dontNeed: {
        items: ['Thermal paste (usually included)', 'Extra screws (included with parts)', 'Expensive tools'],
        note: 'You can build a PC with just two screwdrivers',
    },
};

// === PREPARATION ===
export const PREPARATION = {
    workspace: {
        surface: 'Large, flat, non-conductive surface (wood table ideal)',
        lighting: 'Good lighting, you\'ll be looking at small parts',
        grounding: 'Touch PSU (plugged in, switched off) or case to discharge static',
        organization: 'Open all boxes, organize parts, have manual ready',
    },

    unboxing: {
        order: [
            '1. Case - set aside, you\'ll install motherboard last',
            '2. Motherboard - keep on anti-static bag as work surface',
            '3. CPU - handle carefully by edges only',
            '4. RAM - note correct slots from manual',
            '5. Storage - set M.2 aside, don\'t bend them',
            '6. GPU - keep in box until needed (protect it)',
            '7. PSU - don\'t fully unpack until needed',
            '8. Cooler - check what\'s included (fans, paste, brackets)',
        ],
    },

    readManuals: {
        motherboard: ['RAM slot priority', 'M.2 slot locations', 'Fan headers'],
        case: ['Standoff positions', 'Fan placement', 'Cable routing'],
        cooler: ['Mounting hardware for your socket', 'Which bracket to use'],
    },

    staticPrevention: {
        basics: [
            'Don\'t build on carpet',
            'Touch grounded metal before handling parts',
            'Handle components by edges',
            'Optional: anti-static wrist strap',
        ],
        myth: 'You don\'t need to be paranoid. Reasonable caution is enough.',
    },
};

// === INSTALLATION ORDER (RECOMMENDED) ===
export const INSTALLATION_ORDER = {
    overview: {
        strategy: 'Install on motherboard first, then put motherboard in case',
        reason: 'Easier access before it\'s in the case',
    },

    order: {
        step1: {
            name: 'Install CPU',
            details: [
                'Open CPU socket lever',
                'Align CPU triangle with socket triangle',
                'Drop CPU in place (don\'t force)',
                'Close lever (requires some force)',
            ],
            warnings: ['NEVER touch CPU pins (AMD) or socket pins (Intel)', 'No force needed when placing CPU'],
        },
        step2: {
            name: 'Install M.2 SSD',
            details: [
                'Remove M.2 heatsink if present',
                'Insert at 30° angle into slot',
                'Press down and secure with screw',
                'Replace heatsink',
            ],
            note: 'Easier before cooler blocks access',
        },
        step3: {
            name: 'Install RAM',
            details: [
                'Check motherboard manual for correct slots (usually 2 & 4 for dual channel)',
                'Open clips on RAM slots',
                'Align notch on RAM with slot',
                'Press firmly until clips click',
            ],
            warnings: ['RAM takes more force than expected', 'Both clips should lock'],
        },
        step4: {
            name: 'Install CPU Cooler',
            details: [
                'Apply thermal paste if not pre-applied (pea-sized dot)',
                'Mount cooler per manufacturer instructions',
                'Connect fan to CPU_FAN header',
            ],
            warnings: ['Don\'t forget thermal paste', 'Remove plastic cover from cooler base'],
        },
        step5: {
            name: 'Prepare Case',
            details: [
                'Install standoffs matching motherboard size',
                'Remove necessary PCIe slot covers',
                'Route front panel cables to accessible area',
                'Pre-install case fans if not done',
            ],
        },
        step6: {
            name: 'Install Motherboard',
            details: [
                'Install I/O shield (if separate)',
                'Lower motherboard at angle for I/O alignment',
                'Align with standoffs',
                'Secure with screws (don\'t overtighten)',
            ],
            warnings: ['Ensure all standoffs align with mounting holes', 'Don\'t forget I/O shield'],
        },
        step7: {
            name: 'Install PSU',
            details: [
                'Mount PSU with fan facing vent (usually down)',
                'Secure with screws',
                'Route cables before fully hiding PSU',
            ],
        },
        step8: {
            name: 'Connect Power Cables',
            cables: [
                '24-pin ATX to motherboard (largest connector)',
                '4+4 or 8-pin CPU to top-left of motherboard',
                'SATA power to drives',
                'PCIe cables ready for GPU (don\'t connect yet)',
            ],
            warnings: ['CPU power is often forgotten - PC won\'t POST without it'],
        },
        step9: {
            name: 'Install GPU',
            details: [
                'Remove appropriate PCIe slot covers',
                'Unlock PCIe slot clip',
                'Insert GPU firmly until click',
                'Secure with case screws',
                'Connect PCIe power cables',
            ],
            warnings: ['Support heavy GPUs (anti-sag bracket)', 'Separate power cables for high-end GPUs'],
        },
        step10: {
            name: 'Front Panel Connectors',
            connectors: [
                'Power SW (turns PC on)',
                'Reset SW (reset button)',
                'Power LED+/- (power light)',
                'HDD LED (activity light)',
                'Audio (front headphone/mic)',
                'USB 2.0/3.0 headers',
            ],
            tip: 'Refer to motherboard manual for pin layout',
        },
        step11: {
            name: 'Cable Management',
            details: [
                'Route cables behind motherboard tray',
                'Use velcro ties to bundle',
                'Hide excess in PSU shroud area',
                'Ensure no cables blocking airflow',
            ],
        },
    },
};

// === FIRST BOOT PROCESS ===
export const FIRST_BOOT = {
    beforePowerOn: {
        checklist: [
            '[ ] CPU power connected (top-left of motherboard)',
            '[ ] 24-pin motherboard power connected',
            '[ ] GPU power connected (if required)',
            '[ ] RAM fully seated (clips locked)',
            '[ ] CPU cooler fan connected',
            '[ ] Display connected to GPU (not motherboard)',
            '[ ] Power switch connected (or short pins with screwdriver)',
        ],
    },

    firstBoot: {
        steps: [
            '1. Flip PSU switch to ON',
            '2. Press case power button',
            '3. Watch for fans spinning',
            '4. Wait for display output (may take 30 seconds first time)',
            '5. Enter BIOS (Del/F2 usually)',
        ],
    },

    inBIOS: {
        checks: [
            'Verify CPU is recognized',
            'Verify RAM is recognized (check speed)',
            'Enable XMP/EXPO for RAM',
            'Check storage is detected',
            'Set boot priority to USB (for Windows install)',
        ],
        optional: [
            'Enable Resizable BAR',
            'Check CPU/system temps',
            'Update BIOS if needed (check before for new CPUs)',
        ],
    },

    windowsInstall: {
        preparation: [
            'Download Windows Media Creation Tool',
            'Create bootable USB (8GB+ drive)',
            'Have Windows key ready (or skip to activate later)',
        ],
        steps: [
            '1. Boot from USB',
            '2. Choose Custom Install',
            '3. Delete all partitions on target drive',
            '4. Select unallocated space',
            '5. Complete installation',
        ],
        firstBoot: [
            'Install GPU drivers first (NVIDIA/AMD website)',
            'Install chipset drivers (motherboard website)',
            'Run Windows Update',
            'Install remaining drivers',
        ],
    },
};

// === COMMON BUILDING MISTAKES ===
export const BUILDING_MISTAKES = {
    critical: {
        forgotCpuPower: {
            mistake: 'Not connecting CPU power (4+4 or 8-pin)',
            symptom: 'PC won\'t POST, no display',
            fix: 'Connect CPU power cable to top-left of motherboard',
        },
        wrongDisplayOutput: {
            mistake: 'Monitor connected to motherboard instead of GPU',
            symptom: 'No display (GPU blocks integrated graphics)',
            fix: 'Connect display cable to GPU outputs',
        },
        ramNotSeated: {
            mistake: 'RAM not pushed in fully',
            symptom: 'No POST, debug LED, beep codes',
            fix: 'Push RAM until both clips click. Takes more force than expected.',
        },
        forgotIoShield: {
            mistake: 'Installing motherboard without I/O shield',
            symptom: 'Looks bad, less protected',
            fix: 'Remove motherboard, install shield first',
        },
        plasticOnCooler: {
            mistake: 'Leaving plastic film on cooler base',
            symptom: 'High temperatures, throttling',
            fix: 'Remove cooler, peel plastic, clean and reapply paste',
        },
    },

    common: {
        wrongRamSlots: {
            mistake: 'Using slots 1 & 2 instead of 2 & 4',
            symptom: 'Single channel mode, less performance',
            fix: 'Move RAM to correct slots per motherboard manual',
        },
        noXmp: {
            mistake: 'Forgetting to enable XMP/EXPO',
            symptom: 'RAM running at 2133/4800 MHz instead of rated speed',
            fix: 'Enable XMP/EXPO in BIOS',
        },
        extraStandoffs: {
            mistake: 'Installing standoffs that don\'t align with motherboard',
            symptom: 'Short circuits, dead system',
            fix: 'Only use standoffs that match motherboard holes',
        },
        overtightening: {
            mistake: 'Over-tightening screws',
            symptom: 'Cracked motherboard, stripped threads',
            fix: 'Snug is enough. Don\'t gorilla-grip it.',
        },
        singlePcieCable: {
            mistake: 'Using daisy-chain PCIe for high-power GPU',
            symptom: 'Crashes, instability, power issues',
            fix: 'Use separate PCIe cables from PSU',
        },
    },

    novice: {
        noTestBuild: {
            mistake: 'Not doing a test build outside case',
            tip: 'Build on motherboard box first to verify POST',
        },
        notReadingManual: {
            mistake: 'Ignoring motherboard manual',
            tip: 'Manuals have crucial info on RAM slots, headers, pinouts',
        },
        forcingComponents: {
            mistake: 'Using excessive force',
            tip: 'If it doesn\'t fit, you\'re doing something wrong',
        },
    },
};

// === NO POST TROUBLESHOOTING ===
export const NO_POST_GUIDE = {
    symptoms: {
        noFans: 'System completely dead',
        fansNoDisplay: 'Fans spin but no display',
        debugLed: 'Motherboard shows error LED',
        beepCodes: 'Speaker beeps in patterns',
    },

    checks: {
        completely_dead: [
            'Check PSU switch is on',
            'Check outlet works (try phone charger)',
            'Check power cable fully connected',
            'Check 24-pin and CPU power connected',
            'Try different outlet',
            'Try paperclip PSU test',
        ],
        fans_no_display: [
            'Check display connected to GPU (not motherboard)',
            'Check GPU fully seated',
            'Check GPU power connected',
            'Reseat RAM',
            'Try one RAM stick at a time',
            'Check CPU cooler fan spinning',
        ],
        debug_leds: {
            CPU: 'Reseat CPU, check for bent pins',
            DRAM: 'Reseat RAM, try single stick in different slots',
            VGA: 'Reseat GPU, check power, try different slot',
            BOOT: 'Storage not detected, check connections',
        },
    },

    breadboarding: {
        description: 'Testing with minimal components outside case',
        components: ['CPU', 'One RAM stick', 'CPU cooler', 'PSU'],
        purpose: 'Isolate issue (rules out case short circuit, extra standoffs)',
        method: 'Build on motherboard box, jump power pins with screwdriver',
    },

    cmosClear: {
        purpose: 'Reset BIOS to defaults',
        methods: [
            'Use clear CMOS button (if present)',
            'Move CMOS jumper for 10 seconds',
            'Remove CMOS battery for 5 minutes',
        ],
        when: 'After failed OC settings or if BIOS is corrupted',
    },
};

// === POST-BUILD CHECKLIST ===
export const POST_BUILD_CHECKLIST = {
    software: [
        '[ ] Windows installed and activated',
        '[ ] GPU drivers installed (latest from NVIDIA/AMD)',
        '[ ] Chipset drivers installed',
        '[ ] BIOS updated (if needed)',
        '[ ] Windows fully updated',
        '[ ] XMP/EXPO enabled',
        '[ ] Resizable BAR enabled',
    ],

    temperatures: [
        '[ ] CPU idle: 30-45°C',
        '[ ] CPU gaming: 60-80°C',
        '[ ] GPU idle: 30-45°C',
        '[ ] GPU gaming: 65-85°C',
    ],

    benchmarks: [
        'Cinebench R23 - CPU test',
        '3DMark Time Spy - GPU test',
        'UserBenchmark - quick overall check',
        'CrystalDiskMark - SSD speed',
    ],

    stressTests: [
        'Cinebench 30-min loop - CPU stability',
        'FurMark - GPU stress (careful, very hot)',
        'MemTest86 or TM5 - RAM stability',
    ],
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Diagnose no-POST issue
 */
export const diagnoseNoPOST = (symptoms) => {
    if (symptoms.includes('no fans')) {
        return { likely: 'Power issue', check: ['PSU switch', 'Power cables', 'Outlet'] };
    }
    if (symptoms.includes('fans spin')) {
        return { likely: 'Display or RAM issue', check: ['Display connection', 'Reseat RAM', 'GPU power'] };
    }
    if (symptoms.includes('debug led')) {
        return { likely: 'Component issue', check: ['Check which LED is lit', 'Reseat that component'] };
    }
    return { likely: 'Unknown', check: ['Breadboard test', 'Check all connections'] };
};

/**
 * Get installation order for component
 */
export const getInstallOrder = (component) => {
    const order = {
        cpu: { step: 1, beforeCase: true },
        m2: { step: 2, beforeCase: true },
        ram: { step: 3, beforeCase: true },
        cooler: { step: 4, beforeCase: true },
        motherboard: { step: 6, beforeCase: false },
        psu: { step: 7, beforeCase: false },
        gpu: { step: 9, beforeCase: false },
    };
    return order[component.toLowerCase()] || { step: 'varies', note: 'Check guide' };
};

export default {
    BUILDING_TOOLS,
    PREPARATION,
    INSTALLATION_ORDER,
    FIRST_BOOT,
    BUILDING_MISTAKES,
    NO_POST_GUIDE,
    POST_BUILD_CHECKLIST,
    diagnoseNoPOST,
    getInstallOrder,
};
