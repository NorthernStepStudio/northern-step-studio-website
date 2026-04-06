/**
 * ❄️ NEXUS AI - Cooling Deep Dive Knowledge
 * 
 * Expert-level cooling knowledge including:
 * - Air cooling (tower coolers, heat pipes)
 * - Liquid cooling (AIO, custom loops)
 * - Thermal paste types and application
 * - TDP matching and headroom
 * - Fan configurations and curves
 * - Case airflow
 */

// === AIR COOLING ===
export const AIR_COOLING = {
    overview: {
        description: 'Air coolers use heat pipes and fins to dissipate heat with fans.',
        advantages: ['Reliable', 'No leak risk', 'Lower maintenance', 'Often cheaper'],
        disadvantages: ['Size/clearance issues', 'Can be heavier', 'Less aesthetically sleek'],
    },

    types: {
        stock: {
            name: 'Stock Coolers',
            description: 'Included with CPU (not all CPUs).',
            quality: {
                AMD: 'Wraith coolers are decent for stock settings',
                Intel: 'Stock coolers barely adequate, noisy under load',
            },
            recommendation: 'Replace if overclocking or using high-TDP CPU.',
        },
        tower: {
            name: 'Tower Coolers',
            description: 'Vertical fin stack with heat pipes from CPU base.',
            types: {
                single: { name: 'Single Tower', example: 'be quiet! Pure Rock 2', tdp: '~150W' },
                dual: { name: 'Dual Tower', example: 'Noctua NH-D15', tdp: '~250W' },
            },
            top: ['Noctua NH-D15', 'be quiet! Dark Rock Pro 5', 'Thermalright Peerless Assassin', 'DeepCool AK620'],
        },
        lowProfile: {
            name: 'Low-Profile Coolers',
            description: 'Short height for SFF/ITX builds.',
            height: 'Under 70mm typically',
            examples: ['Noctua NH-L9i', 'ID-Cooling IS-60', 'Thermalright AXP90'],
            tdp: '~65W (limited by size)',
        },
        downdraft: {
            name: 'Downdraft/Top-Down Coolers',
            description: 'Fan blows down onto motherboard, cooling VRM too.',
            use: 'ITX builds, helps with VRM cooling',
            examples: ['Noctua NH-C14S', 'be quiet! Shadow Rock TF 2'],
        },
    },

    heatPipes: {
        description: 'Copper tubes filled with fluid that transfers heat to fins.',
        count: 'More heat pipes = more heat transfer capacity',
        directContact: 'Direct touch (HDT) vs copper base plate - both work well.',
        quality: 'Sintered > Grooved heat pipes for performance.',
    },

    fans: {
        types: {
            axial: 'Standard fan - moves air parallel to blade axis',
            pwm: 'PWM fans = 4-pin, better speed control',
            dc: 'DC fans = 3-pin, voltage-controlled',
        },
        size: {
            '92mm': 'Compact coolers',
            '120mm': 'Standard tower coolers',
            '140mm': 'Large tower coolers (more quiet)',
        },
        recommendation: 'PWM fans for better noise/performance control.',
    },
};

// === LIQUID COOLING ===
export const LIQUID_COOLING = {
    aio: {
        name: 'AIO (All-In-One) Liquid Coolers',
        description: 'Pre-filled closed-loop with pump, radiator, and fans.',
        advantages: ['Better cooling than most air', 'Cleaner look', 'RAM clearance'],
        disadvantages: ['Pump can fail', 'Permeation over time', 'More expensive'],

        sizes: {
            '120mm': { for: 'ITX builds', tdp: '~100W', examples: ['EK-AIO 120'] },
            '240mm': { for: 'Most builds', tdp: '~180W', examples: ['Arctic LF II 240', 'Corsair H100i'] },
            '280mm': { for: 'Balanced', tdp: '~200W', examples: ['Arctic LF II 280', 'NZXT Kraken X63'] },
            '360mm': { for: 'High-end', tdp: '~250W+', examples: ['Arctic LF III 360', 'Corsair H150i'] },
            '420mm': { for: 'Maximum cooling', tdp: '~280W+', examples: ['Arctic LF III 420'] },
        },

        topAIOs: ['Arctic Liquid Freezer III', 'EK-AIO', 'Corsair iCUE H150i Elite', 'NZXT Kraken'],
    },

    customLoop: {
        name: 'Custom Loop',
        description: 'User-assembled liquid cooling with individual components.',
        components: ['CPU block', 'GPU block (optional)', 'Radiator(s)', 'Pump/res', 'Tubing', 'Fittings', 'Coolant'],
        advantages: ['Maximum cooling', 'Full customization', 'Can cool GPU too'],
        disadvantages: ['Expensive ($400+)', 'Complex assembly', 'Maintenance required', 'Leak risk'],

        tubing: {
            soft: { material: 'EPDM/Silicone', ease: 'Easy to work with', look: 'Clean bends' },
            hard: { material: 'PETG/Acrylic', ease: 'Requires heat bending', look: 'Premium aesthetics' },
        },

        coolant: {
            clear: 'Least maintenance, see-through',
            colored: 'Looks cool, may stain/clog over time',
            pastel: 'Opaque - highest risk of buildup, clean every 6-12 months',
        },

        recommendation: 'Only for enthusiasts willing to invest time and money.',
    },

    pumpPlacement: {
        rule: 'Pump should NOT be highest point (air bubbles collect there).',
        correct: ['Radiator tubes at bottom', 'Top-mounted rad with tubes down'],
        incorrect: ['Front rad with tubes at top', 'Pump above rad'],
        reason: 'Air in pump = noise, reduced lifespan, poor cooling.',
    },
};

// === THERMAL PASTE ===
export const THERMAL_PASTE = {
    overview: {
        purpose: 'Fills microscopic gaps between CPU and cooler for better heat transfer.',
        importance: 'Poor application = 5-15°C higher temps.',
    },

    types: {
        standard: {
            name: 'Standard Paste',
            composition: 'Silicone + ceramic/metal oxides',
            conductivity: '4-8 W/mK typical',
            examples: ['Arctic MX-5', 'Noctua NT-H1', 'Thermal Grizzly Kryonaut'],
            recommendation: 'Best for most users.',
        },
        liquidMetal: {
            name: 'Liquid Metal',
            composition: 'Gallium alloy',
            conductivity: '70+ W/mK',
            performance: 'Best temps (5-10°C better than paste)',
            risks: ['Conducts electricity', 'Corrodes aluminum', 'Harder to apply'],
            use: 'Delidding, laptop repaste, extreme cooling',
            warning: 'NEVER use on aluminum heatsinks.',
        },
        preApplied: {
            description: 'Paste already on cooler',
            quality: 'Usually fine, slightly worse than premium paste',
            recommendation: 'OK to use, replace if reinstalling cooler.',
        },
    },

    application: {
        methods: {
            pea: { name: 'Pea/Dot', description: 'Small dot in center, pressure spreads it', best: true },
            X: { name: 'X Pattern', description: 'X shape across IHS', good: true },
            line: { name: 'Line', description: 'Line down center', good: true },
            spread: { name: 'Pre-Spread', description: 'Manually spread thin layer', risk: 'Air bubbles' },
        },
        amount: {
            correct: 'Pea-sized (~3-4mm diameter)',
            tooMuch: 'Spills over edges, doesn\'t improve cooling',
            tooLittle: 'Doesn\'t cover IHS, hot spots',
        },
        reapply: {
            when: ['Temps increase 5-10°C over time', 'Removing cooler', 'Every 3-5 years'],
            cleaning: 'Isopropyl alcohol 99% and lint-free cloth',
        },
    },

    topPastes: {
        bestOverall: 'Thermal Grizzly Kryonaut',
        bestValue: 'Arctic MX-5, Noctua NT-H1',
        bestLongevity: 'Honeywell PTM7950 (phase change)',
        bestExtreme: 'Thermal Grizzly Conductonaut (liquid metal)',
    },
};

// === TDP MATCHING ===
export const TDP_MATCHING = {
    overview: {
        description: 'Cooler must handle CPU heat output with headroom.',
        rule: 'Cooler TDP rating should be 20-50% above CPU TDP for quiet operation.',
    },

    cpuTDP: {
        'AMD Ryzen 5': { tdp: '65W', minimum: '100W cooler', recommended: '150W cooler' },
        'AMD Ryzen 7': { tdp: '65-105W', minimum: '120W cooler', recommended: '180W cooler' },
        'AMD Ryzen 9': { tdp: '120-170W', minimum: '200W cooler', recommended: '240W+ cooler' },
        'Intel i5 K': { tdp: '125W', minimum: '150W cooler', recommended: '200W cooler' },
        'Intel i7 K': { tdp: '125-150W', minimum: '180W cooler', recommended: '240W cooler' },
        'Intel i9 K': { tdp: '150-253W', minimum: '240W cooler', recommended: '280W+ AIO' },
    },

    thermals: {
        safe: {
            idle: '30-45°C',
            gaming: '60-80°C',
            stress: '80-90°C',
        },
        concerning: '90-100°C - throttling begins',
        dangerous: '100°C+ - immediate throttle, reduce load',
        tjMax: 'Maximum junction temp (usually 100-105°C)',
    },

    comparison: {
        stockCooler: 'Handles 65W, loud under load',
        budgetTower: 'Handles 100-150W quietly',
        premiumTower: 'Handles 200-250W, very quiet',
        '240mmAIO': 'Handles 180-200W',
        '360mmAIO': 'Handles 250W+, best for high-TDP CPUs',
    },
};

// === FAN CONFIGURATION ===
export const FAN_CONFIGURATION = {
    pressure: {
        positive: {
            description: 'More intake than exhaust.',
            result: 'Clean system, air pushed out of gaps.',
            recommendation: 'Preferred for most builds.',
        },
        negative: {
            description: 'More exhaust than intake.',
            result: 'Dust pulled in through gaps.',
            avoid: true,
        },
        neutral: {
            description: 'Equal intake and exhaust.',
            result: 'Balanced, moderate dust.',
        },
    },

    placement: {
        intake: {
            locations: ['Front', 'Bottom', 'Side (pulling air in)'],
            role: 'Bring cool air into case',
        },
        exhaust: {
            locations: ['Rear', 'Top'],
            role: 'Remove hot air from case',
        },
        standard: '2-3 front intake + 1 rear exhaust + 1-2 top exhaust',
    },

    fanCurves: {
        description: 'Adjust fan speed based on temperature.',
        location: 'BIOS or software (ASUS Armoury, iCUE, etc.)',
        goal: 'Balance between cooling and noise.',
        example: {
            quiet: { '40C': '30%', '60C': '50%', '80C': '80%' },
            performance: { '40C': '50%', '60C': '70%', '80C': '100%' },
        },
    },

    static_vs_airflow: {
        static: {
            description: 'Optimized for pushing through resistance.',
            use: 'Radiators, heatsinks',
        },
        airflow: {
            description: 'Optimized for moving volume of air.',
            use: 'Case intake/exhaust',
        },
    },
};

// === CASE AIRFLOW ===
export const CASE_AIRFLOW = {
    designs: {
        mesh: {
            name: 'Mesh Front',
            airflow: 'Excellent - unrestricted intake',
            examples: ['Lian Li Lancool II Mesh', 'Phanteks P400A', 'Fractal Meshify'],
            recommendation: 'Best for high-performance builds.',
        },
        solid: {
            name: 'Solid/Glass Front',
            airflow: 'Restricted - limited intake',
            examples: ['NZXT H510', 'Some Corsair cases'],
            note: 'Looks clean but runs hotter.',
        },
        hybrid: {
            name: 'Hybrid Panels',
            airflow: 'Moderate - some venting',
            examples: ['Fractal North', 'NZXT H5 Flow'],
        },
    },

    dustFilters: {
        importance: 'Prevent dust buildup, need cleaning every 1-3 months.',
        locations: ['Front intake', 'Bottom (PSU)', 'Top (if intake)'],
        types: ['Magnetic', 'Slide-out', 'Snap-on'],
    },

    optimization: {
        tips: [
            'Remove unused HDD cages for better airflow',
            'Good cable management helps airflow',
            'Don\'t block intake fans with desk/wall',
            'Consider GPU orientation (vertical can restrict)',
        ],
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get cooler recommendation based on CPU TDP
 */
export const getCoolerRecommendation = (cpuTDP, formFactor = 'ATX') => {
    if (formFactor === 'ITX') {
        if (cpuTDP <= 65) return { type: 'Low-profile', example: 'Noctua NH-L9i' };
        if (cpuTDP <= 95) return { type: 'Compact tower or 120mm AIO', example: 'Thermalright AXP90, EK-AIO 120' };
        return { type: '240mm AIO', example: 'Arctic LF II 240' };
    }

    if (cpuTDP <= 65) return { type: 'Budget tower', examples: ['be quiet! Pure Rock 2', 'ID-Cooling SE-224-XT'] };
    if (cpuTDP <= 105) return { type: 'Mid-range tower', examples: ['Thermalright Peerless Assassin', 'DeepCool AK620'] };
    if (cpuTDP <= 150) return { type: 'Premium tower or 240mm AIO', examples: ['Noctua NH-D15', 'Arctic LF III 240'] };
    if (cpuTDP <= 200) return { type: '280-360mm AIO', examples: ['Arctic LF III 360', 'Corsair H150i'] };
    return { type: '360mm+ AIO', examples: ['Arctic LF III 420', 'Custom loop'], note: 'High-TDP CPU, aggressive cooling needed' };
};

/**
 * Explain cooling term
 */
export const explainCoolingTerm = (term) => {
    const terms = {
        aio: LIQUID_COOLING.aio,
        'custom loop': LIQUID_COOLING.customLoop,
        'heat pipes': AIR_COOLING.heatPipes,
        'thermal paste': THERMAL_PASTE.overview,
        'liquid metal': THERMAL_PASTE.types.liquidMetal,
        'positive pressure': FAN_CONFIGURATION.pressure.positive,
        'fan curve': FAN_CONFIGURATION.fanCurves,
        tdp: TDP_MATCHING.overview,
        'static pressure': FAN_CONFIGURATION.static_vs_airflow.static,
    };
    return terms[term?.toLowerCase()] || null;
};

/**
 * Check if temps are safe
 */
export const checkTemperature = (temp, condition = 'gaming') => {
    if (condition === 'idle') {
        if (temp < 45) return { status: 'Normal', message: 'Idle temps are fine.' };
        if (temp < 55) return { status: 'Warm', message: 'Slightly warm for idle, check fan curves.' };
        return { status: 'Hot', message: 'Too hot for idle - check cooler mounting or paste.' };
    }
    if (condition === 'gaming') {
        if (temp < 80) return { status: 'Normal', message: 'Good gaming temps.' };
        if (temp < 90) return { status: 'Warm', message: 'Getting warm, consider better cooling.' };
        return { status: 'Hot', message: 'May throttle - improve cooling.' };
    }
    if (temp < 95) return { status: 'Normal', message: 'Acceptable under stress test.' };
    return { status: 'Hot', message: 'At thermal limit - reduce load or improve cooling.' };
};

export default {
    AIR_COOLING,
    LIQUID_COOLING,
    THERMAL_PASTE,
    TDP_MATCHING,
    FAN_CONFIGURATION,
    CASE_AIRFLOW,
    getCoolerRecommendation,
    explainCoolingTerm,
    checkTemperature,
};
