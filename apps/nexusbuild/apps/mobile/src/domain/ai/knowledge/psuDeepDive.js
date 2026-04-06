/**
 * ⚡ NEXUS AI - PSU Deep Dive Knowledge
 * 
 * Expert-level PSU knowledge including:
 * - Efficiency ratings (80+ Bronze/Gold/Platinum/Titanium)
 * - Protections (OVP, OCP, OPP, SCP)
 * - Modular types (full, semi, non)
 * - Topology (LLC, DC-DC, group regulated)
 * - ATX standards (ATX 2.x, ATX 3.0, ATX 3.1)
 * - Brand tier list
 * - Cable and connector types
 */

// === EFFICIENCY RATINGS ===
export const EFFICIENCY_RATINGS = {
    overview: {
        description: '80 Plus certification measures power supply efficiency.',
        formula: 'Efficiency = Power Out ÷ Power In',
        example: '850W PSU at 85% efficiency draws ~1000W from wall to deliver 850W.',
        benefit: 'Higher efficiency = less heat, less wasted electricity.',
    },

    tiers: {
        '80+ White': {
            efficiency: '80% at 20/50/100% load',
            cost: 'Cheapest',
            quality: 'Budget - avoid for expensive builds',
            note: 'Basic certification, often group-regulated design.',
        },
        '80+ Bronze': {
            efficiency: '82-85% at 20/50/100% load',
            cost: 'Budget',
            quality: 'Acceptable for budget builds',
            recommendation: 'Minimum for gaming PCs.',
        },
        '80+ Gold': {
            efficiency: '87-90% at 50% load',
            cost: 'Sweet spot',
            quality: 'Great balance of efficiency and price',
            recommendation: 'Best value for most builds.',
        },
        '80+ Platinum': {
            efficiency: '89-92% at 50% load',
            cost: 'Premium',
            quality: 'High-end, lower heat output',
            recommendation: 'Worth it for 24/7 systems, quiet builds.',
        },
        '80+ Titanium': {
            efficiency: '90-94% at 50% load',
            cost: 'Expensive',
            quality: 'Maximum efficiency',
            recommendation: 'Enthusiasts, server rooms, extreme builds.',
        },
    },

    realWorldSavings: {
        note: 'Gold vs Bronze saves ~$10-20/year on electricity.',
        calculation: 'At 6 hours daily, 850W system: Gold saves ~60 kWh/year vs Bronze.',
        verdict: 'Gold is best value. Platinum+ for 24/7 use.',
    },
};

// === PROTECTIONS ===
export const PSU_PROTECTIONS = {
    overview: {
        description: 'Safety circuits that prevent damage from electrical faults.',
        importance: 'Quality PSUs have ALL protections. Cheap ones skip some.',
    },

    types: {
        OVP: {
            name: 'Over Voltage Protection',
            description: 'Shuts down if voltage exceeds safe limits.',
            protects: 'Components from voltage spikes.',
        },
        OCP: {
            name: 'Over Current Protection',
            description: 'Shuts down if current draw is too high.',
            protects: 'PSU and components from short circuits.',
        },
        OPP: {
            name: 'Over Power Protection',
            description: 'Shuts down if total power exceeds rating.',
            protects: 'PSU from overload.',
        },
        SCP: {
            name: 'Short Circuit Protection',
            description: 'Shuts down immediately on short circuit.',
            protects: 'Everything - critical safety feature.',
        },
        OTP: {
            name: 'Over Temperature Protection',
            description: 'Shuts down if PSU gets too hot.',
            protects: 'PSU components from heat damage.',
        },
        UVP: {
            name: 'Under Voltage Protection',
            description: 'Shuts down if voltage drops too low.',
            protects: 'Components from unstable power.',
        },
        NLO: {
            name: 'No Load Operation',
            description: 'PSU can turn on with no load connected.',
            note: 'Useful for testing.',
        },
    },

    importance: {
        critical: ['OVP', 'OCP', 'SCP', 'OPP'],
        recommended: ['OTP', 'UVP'],
        nice: ['NLO'],
    },
};

// === MODULAR TYPES ===
export const MODULAR_TYPES = {
    full: {
        name: 'Fully Modular',
        description: 'ALL cables detach from PSU.',
        advantages: ['Only use cables you need', 'Easier cable management', 'Can use custom cables'],
        disadvantages: ['More expensive', 'Slightly more connection points'],
        recommendation: 'Best for builds where you want clean aesthetics.',
    },
    semi: {
        name: 'Semi-Modular',
        description: 'Essential cables attached (24-pin, CPU), others modular.',
        advantages: ['Good balance of price and flexibility', 'Fewer connection points for critical cables'],
        disadvantages: ['Must deal with attached cables you don\'t need'],
        recommendation: 'Great value option.',
    },
    non: {
        name: 'Non-Modular',
        description: 'All cables permanently attached.',
        advantages: ['Cheapest', 'Fewest connection points'],
        disadvantages: ['Stuck with all cables', 'Harder cable management'],
        recommendation: 'Budget builds, cases with PSU shrouds.',
    },
};

// === TOPOLOGY ===
export const PSU_TOPOLOGY = {
    overview: {
        description: 'Internal PSU circuit design affects quality and performance.',
        note: 'Topology determines efficiency, noise, and reliability.',
    },

    types: {
        groupRegulated: {
            name: 'Group Regulated',
            description: 'All rails share regulation. Budget design.',
            quality: 'Poor - voltage fluctuates under load',
            avoid: true,
            note: 'Common in 80+ White and cheap Bronze units.',
        },
        dcDc: {
            name: 'DC-DC Conversion',
            description: 'Independent regulation for each rail.',
            quality: 'Good - stable voltages',
            common: 'Modern mid-range and up',
            note: 'Standard for 80+ Gold and above.',
        },
        llc: {
            name: 'LLC Resonant',
            description: 'Advanced topology for high efficiency.',
            quality: 'Excellent - best performance',
            benefit: 'Higher efficiency, less heat, quieter',
            common: 'High-end 80+ Gold, all Platinum/Titanium',
        },
        fullBridge: {
            name: 'Full-Bridge LLC',
            description: 'Premium version of LLC for high wattage.',
            quality: 'Best - used in flagship PSUs',
            common: '1000W+ units, Titanium grade',
        },
    },

    indicators: {
        cheap: ['Group regulated', 'Sleeve bearing fan', 'No Japanese caps'],
        quality: ['DC-DC', 'LLC resonant', 'Japanese capacitors', 'FDB fan'],
    },
};

// === ATX STANDARDS ===
export const ATX_STANDARDS = {
    'ATX 2.x': {
        description: 'Legacy standard used for decades.',
        connectors: ['24-pin ATX', '4+4 CPU', '6+2 PCIe'],
        transient: 'May trigger OCP with GPU transient spikes',
        status: 'Being phased out for new GPUs.',
    },
    'ATX 3.0': {
        description: 'New standard designed for modern high-power GPUs.',
        features: [
            '12VHPWR connector (600W, 12+4 pin)',
            'Handles transient spikes up to 200%',
            'GPU power reporting via connector'
        ],
        requirement: 'Recommended for RTX 4080/4090/5080/5090',
        note: 'Early 12VHPWR had melting issues if not properly inserted.',
    },
    'ATX 3.1': {
        description: 'Minor revision with improved 12V-2x6 connector.',
        difference: 'Better connector locking, safety improvements',
        connector: '12V-2x6 (same performance as 12VHPWR)',
        status: 'Current latest standard (2024+)',
    },

    transients: {
        problem: 'Modern GPUs spike to 2x their TGP briefly.',
        example: 'RTX 4090 (450W TGP) can spike to 900W for microseconds.',
        atx2: 'May trigger OCP shutdown.',
        atx3: 'Designed to handle these spikes.',
        solution: 'ATX 3.0/3.1 PSU or heavily overrated ATX 2.x.',
    },
};

// === BRAND TIER LIST ===
export const PSU_BRANDS = {
    overview: {
        note: 'PSU brands vary in quality. Same brand can have good AND bad models.',
        key: 'Check specific model reviews, not just brand.',
    },

    tiers: {
        tierA: {
            name: 'A-Tier (Excellent)',
            brands: ['Seasonic', 'Corsair (RMx, AXi)', 'be quiet! (Dark Power)', 'EVGA (G/P series)'],
            note: 'Flagships are excellent. Even mid-range is reliable.',
            oem: 'Often made by Seasonic or CWT',
        },
        tierB: {
            name: 'B-Tier (Good)',
            brands: ['Corsair (RM)', 'EVGA (GT)', 'Phanteks', 'NZXT C', 'FSP (some)'],
            note: 'Solid options for most builds.',
        },
        tierC: {
            name: 'C-Tier (Budget Acceptable)',
            brands: ['Thermaltake (some)', 'Cooler Master MWE', 'Corsair CV'],
            note: 'Fine for budget builds. Check reviews carefully.',
        },
        tierD: {
            name: 'D-Tier (Avoid)',
            brands: ['Gigabyte (past issues)', 'Raidmax', 'Diablotek', 'No-name brands'],
            note: 'Known for failures, fires, poor components.',
        },
    },

    recommendation: {
        highEnd: 'Seasonic Focus/Prime, Corsair RMx, be quiet! Dark Power',
        midRange: 'Corsair RM, EVGA SuperNOVA, Phanteks AMP',
        budget: 'Corsair CX-F, Thermaltake Toughpower GF1',
    },
};

// === CABLES AND CONNECTORS ===
export const PSU_CABLES = {
    connectors: {
        atx24: {
            name: '24-pin ATX',
            purpose: 'Main motherboard power',
            required: 'Always',
        },
        eps: {
            name: 'EPS 4+4 / 8-pin CPU',
            purpose: 'CPU power',
            required: 'Always - top left of motherboard',
            note: 'High-end boards may need 2x EPS.',
        },
        pcie8: {
            name: '6+2 pin PCIe',
            purpose: 'GPU power',
            rating: '150W per connector (75W for 6-pin)',
            note: 'Use separate cables for high-power GPUs.',
        },
        '12vhpwr': {
            name: '12VHPWR / 12V-2x6',
            purpose: 'New GPU power connector',
            rating: 'Up to 600W',
            warning: 'Must click fully. Check for proper seating.',
        },
        sata: {
            name: 'SATA power',
            purpose: 'Drives, fan hubs, RGB',
            note: 'Daisy-chained on most PSUs.',
        },
        molex: {
            name: 'Molex 4-pin',
            purpose: 'Legacy - some fans, older devices',
            status: 'Mostly obsolete.',
        },
    },

    cableRules: {
        rule1: 'NEVER mix cables between PSU brands/models',
        rule2: 'Use separate PCIe cables for high-power GPUs (not daisy-chain)',
        rule3: 'Ensure 12VHPWR is fully seated until it clicks',
        rule4: 'Custom cables must be pinout-specific to your PSU',
    },

    customCables: {
        description: 'Aesthetic sleeved cables for clean builds.',
        brands: ['CableMod', 'Corsair Premium', 'EVGA PowerLink'],
        warning: 'Must be compatible with YOUR specific PSU model.',
    },
};

// === WATTAGE CALCULATOR ===
export const WATTAGE_GUIDE = {
    formula: {
        basic: 'CPU TDP + GPU TDP + 100W (rest) + 20% headroom',
        recommendation: 'Round up to nearest standard PSU size.',
    },

    builds: {
        budget: { config: 'i5 + RTX 4060', minimum: '550W', recommended: '650W' },
        midRange: { config: 'Ryzen 7 + RTX 4070 Super', minimum: '650W', recommended: '750W' },
        highEnd: { config: 'i9 + RTX 4080 Super', minimum: '850W', recommended: '1000W' },
        flagship: { config: 'Ryzen 9 + RTX 5090', minimum: '1000W', recommended: '1200W+' },
    },

    oversize: {
        benefit: 'Runs quieter (fan speed lower), room for upgrades',
        overkill: 'More than 40% headroom wastes money',
        sweetSpot: '20-30% over actual usage',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get PSU recommendation
 */
export const getPSURecommendation = ({ cpuTDP, gpuTDP, needATX3 }) => {
    const totalTDP = cpuTDP + gpuTDP + 100; // 100W for other components
    const recommended = Math.ceil(totalTDP * 1.25 / 50) * 50; // 25% headroom, round to 50W

    return {
        totalTDP,
        recommended: `${recommended}W`,
        atx3: needATX3 ? 'Required for RTX 40/50 flagship GPUs' : 'Not required',
        tier: '80+ Gold minimum',
        examples: recommended >= 850
            ? ['Corsair RM850x', 'Seasonic Focus GX-850', 'be quiet! Straight Power 12']
            : ['Corsair RM650x', 'EVGA SuperNOVA 650 G6'],
    };
};

/**
 * Explain PSU term
 */
export const explainPSUTerm = (term) => {
    const terms = {
        '80+': EFFICIENCY_RATINGS.overview,
        gold: EFFICIENCY_RATINGS.tiers['80+ Gold'],
        platinum: EFFICIENCY_RATINGS.tiers['80+ Platinum'],
        ovp: PSU_PROTECTIONS.types.OVP,
        ocp: PSU_PROTECTIONS.types.OCP,
        scp: PSU_PROTECTIONS.types.SCP,
        modular: MODULAR_TYPES.full,
        'semi-modular': MODULAR_TYPES.semi,
        llc: PSU_TOPOLOGY.types.llc,
        'dc-dc': PSU_TOPOLOGY.types.dcDc,
        'atx 3.0': ATX_STANDARDS['ATX 3.0'],
        'atx 3.1': ATX_STANDARDS['ATX 3.1'],
        '12vhpwr': ATX_STANDARDS['ATX 3.0'],
        transient: ATX_STANDARDS.transients,
    };
    return terms[term?.toLowerCase()] || null;
};

export default {
    EFFICIENCY_RATINGS,
    PSU_PROTECTIONS,
    MODULAR_TYPES,
    PSU_TOPOLOGY,
    ATX_STANDARDS,
    PSU_BRANDS,
    PSU_CABLES,
    WATTAGE_GUIDE,
    getPSURecommendation,
    explainPSUTerm,
};
