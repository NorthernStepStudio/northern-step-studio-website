/**
 * 📦 NEXUS AI - Case Deep Dive Knowledge
 * 
 * Expert-level case knowledge including:
 * - Form factors (Full tower, Mid tower, mATX, ITX, SFF)
 * - Airflow designs (mesh, solid, hybrid)
 * - GPU and cooler clearance
 * - Radiator support and placement
 * - Cable management
 * - Materials and build quality
 */

// === FORM FACTORS ===
export const CASE_FORM_FACTORS = {
    overview: {
        description: 'Case size must match motherboard form factor.',
        rule: 'Larger can fit smaller (ATX case fits mATX), not vice versa.',
    },

    types: {
        fullTower: {
            name: 'Full Tower',
            motherboards: ['E-ATX', 'ATX', 'mATX'],
            size: '55-75cm tall',
            radiators: 'Up to 480mm',
            gpuLength: '400mm+',
            use: 'Workstations, custom loops, maximum expansion',
            examples: ['Lian Li O11 Dynamic XL', 'Corsair 7000D', 'Phanteks Enthoo 719'],
        },
        midTower: {
            name: 'Mid Tower',
            motherboards: ['ATX', 'mATX'],
            size: '45-55cm tall',
            radiators: 'Up to 360mm (most)',
            gpuLength: '350-400mm',
            use: 'Standard gaming builds, most popular',
            examples: ['Lian Li Lancool II Mesh', 'NZXT H5 Flow', 'Phanteks P400A'],
        },
        microATX: {
            name: 'Micro-ATX / Mini Tower',
            motherboards: ['mATX', 'ITX'],
            size: '35-45cm tall',
            radiators: 'Up to 280mm',
            gpuLength: '300-350mm',
            use: 'Compact builds with some expandability',
            examples: ['Fractal Design Pop Mini', 'Cooler Master MasterBox Q300L'],
        },
        itx: {
            name: 'Mini-ITX / SFF',
            motherboards: ['ITX only'],
            size: '10-30L volume',
            radiators: '120-280mm (case dependent)',
            gpuLength: '250-330mm (very case dependent)',
            use: 'Space-constrained, living room, portable',
            examples: ['NR200', 'Lian Li A4-H2O', 'SSUPD Meshlicious', 'FormD T1'],
        },
    },

    choosing: {
        considerations: [
            'Motherboard form factor',
            'GPU length',
            'CPU cooler height',
            'Radiator support',
            'Desk space',
        ],
        recommendation: 'Mid tower for most. ITX only if you need portability/space savings.',
    },
};

// === AIRFLOW DESIGNS ===
export const AIRFLOW_DESIGNS = {
    meshFront: {
        name: 'Mesh Front Panel',
        airflow: 'Excellent - unrestricted intake',
        pros: ['Best cooling', 'Lower temps', 'Quieter fans'],
        cons: ['More dust ingress', 'Less sound dampening'],
        examples: ['Phanteks P400A', 'Lancool II Mesh', 'Fractal Meshify'],
        recommendation: 'Best for gaming and high-performance builds.',
    },

    solidFront: {
        name: 'Solid/Glass Front',
        airflow: 'Poor - restricted intake',
        pros: ['Clean aesthetics', 'Quieter (sealed)'],
        cons: ['Higher temps', 'Fans work harder'],
        examples: ['NZXT H510', 'Corsair 4000X'],
        recommendation: 'Avoid for high-TDP components.',
    },

    hybrid: {
        name: 'Hybrid Design',
        airflow: 'Moderate - partial venting',
        pros: ['Balance of looks and airflow'],
        cons: ['Not as good as full mesh'],
        examples: ['NZXT H5 Flow', 'Fractal North', 'be quiet! Pure Base 500DX'],
    },

    unconventional: {
        sandwichLayout: {
            description: 'GPU in separate chamber (ITX)',
            pros: 'Independent thermals, compact',
            examples: ['SSUPD Meshlicious', 'Lian Li A4-H2O'],
        },
        openAir: {
            description: 'Test bench or open frame',
            pros: 'Maximum cooling',
            cons: 'Dust, no protection',
            examples: ['Thermaltake Core P3'],
        },
        dualChamber: {
            description: 'PSU/drives separated from main',
            pros: 'Cleaner thermals, better cable management',
            examples: ['Lian Li O11 Dynamic', 'Corsair 5000D'],
        },
    },
};

// === GPU CLEARANCE ===
export const GPU_CLEARANCE = {
    overview: {
        description: 'Modern GPUs are HUGE. Check clearance before buying.',
        measurement: 'GPU length = from bracket to tip of card.',
    },

    common_lengths: {
        compact: { length: '< 250mm', examples: ['RTX 4060', 'RX 7600'], fits: 'Almost any case' },
        standard: { length: '250-300mm', examples: ['RTX 4070', 'RX 7700 XT'], fits: 'Most cases' },
        large: { length: '300-340mm', examples: ['RTX 4070 Ti Super', 'RX 7800 XT'], fits: 'Mid towers+' },
        massive: { length: '340mm+', examples: ['RTX 4090 (336mm)', 'RTX 5090'], fits: 'Check carefully' },
    },

    conflicts: {
        frontFans: 'Thick radiators can reduce GPU clearance',
        driveCages: 'Remove unused HDD cages for more space',
        verticalMount: 'Requires specific case support and riser cable',
    },

    checking: {
        steps: [
            '1. Find case spec: "Max GPU length"',
            '2. Find GPU spec: "Card length"',
            '3. Ensure case length > GPU length + 10mm buffer',
            '4. Account for front rad if planning AIO',
        ],
    },
};

// === COOLER CLEARANCE ===
export const COOLER_CLEARANCE = {
    overview: {
        description: 'Tall CPU coolers may not fit. Check max cooler height.',
        examples: {
            'Noctua NH-D15': '165mm',
            'be quiet! Dark Rock Pro 5': '168mm',
            'budget towers': '155-160mm typical',
        },
    },

    case_heights: {
        compact: { height: '< 130mm', coolers: 'Low-profile only' },
        standard: { height: '160-170mm', coolers: 'Most tower coolers' },
        spacious: { height: '180mm+', coolers: 'Any cooler' },
    },

    tips: [
        'ITX cases often have strict height limits (37-70mm)',
        'Check RAM clearance too - tall heatsinks may conflict',
        'AIO avoids height issues (but needs radiator space)',
    ],
};

// === RADIATOR SUPPORT ===
export const RADIATOR_SUPPORT = {
    overview: {
        description: 'AIO radiators need mounting space. Check case support.',
    },

    positions: {
        front: {
            pros: 'Fresh cool air, most common',
            cons: 'Can restrict GPU clearance',
            common: '240mm, 280mm, 360mm',
        },
        top: {
            pros: 'Exhausts heat out of case',
            cons: 'May conflict with tall RAM or motherboard heatsinks',
            note: 'Best for exhaust config',
        },
        side: {
            pros: 'Available in some cases (O11 Dynamic)',
            cons: 'Case-specific',
        },
        bottom: {
            pros: 'Cool intake air',
            cons: 'Dust, uncommon support',
        },
    },

    sizing: {
        '120mm': '~100W cooling capacity',
        '240mm': '~180W cooling capacity',
        '280mm': '~200W cooling capacity',
        '360mm': '~250W cooling capacity',
        '420mm': '~280W cooling capacity',
    },

    thickness: {
        slim: '25-27mm (most AIOs)',
        standard: '30mm',
        thick: '45-60mm (custom loop)',
        note: 'Thick rads need more fan clearance',
    },
};

// === CABLE MANAGEMENT ===
export const CABLE_MANAGEMENT = {
    overview: {
        description: 'Clean cables improve airflow and aesthetics.',
    },

    features: {
        psuShroud: {
            description: 'Cover hiding PSU and cables',
            benefit: 'Hides mess, only shows GPU power cables',
        },
        rubberGrommets: {
            description: 'Rubber lined holes in motherboard tray',
            benefit: 'Clean cable routing, protects cables',
        },
        cableChannels: {
            description: 'Dedicated paths behind motherboard tray',
            benefit: 'Organized routing',
        },
        velcroTiedowns: {
            description: 'Reusable straps for bundling cables',
            benefit: 'Easy to adjust later',
        },
        backPanelClearance: {
            description: 'Space behind motherboard tray',
            good: '25mm+',
            tight: '< 20mm (cables may not fit)',
        },
    },

    tips: [
        'Route cables as you install, not after',
        'Use PSU shroud routing holes',
        'Velcro > zip ties (easier to adjust)',
        'Custom cables for visible runs',
        'SATA cables can be flat or angled',
    ],
};

// === MATERIALS ===
export const CASE_MATERIALS = {
    steel: {
        common: true,
        pros: ['Affordable', 'Sturdy', 'Good sound dampening'],
        cons: ['Heavy', 'Can rust if painted poorly'],
        typical: 'Most budget to mid-range cases',
    },
    aluminum: {
        common: true,
        pros: ['Lightweight', 'Premium feel', 'Good heat dissipation'],
        cons: ['More expensive', 'Dents more easily'],
        typical: 'Premium and SFF cases (Lian Li, NCASE)',
    },
    temperedGlass: {
        common: true,
        pros: ['Shows off internals', 'Scratch-resistant'],
        cons: ['Heavy', 'Shatters if dropped', 'Fingerprints'],
        typical: 'Side panels on most modern cases',
    },
    plastic: {
        common: true,
        pros: ['Cheap', 'Lightweight'],
        cons: ['Feels cheap', 'Can crack'],
        typical: 'Front panels, accents',
    },
    acrylic: {
        common: 'Less common',
        pros: ['Lighter than glass', 'Cheaper'],
        cons: ['Scratches easily', 'Yellows over time'],
        typical: 'Budget cases (avoid if possible)',
    },
};

// === POPULAR CASES BY CATEGORY ===
export const POPULAR_CASES = {
    bestOverall: [
        { name: 'Lian Li Lancool II Mesh', price: '$120', size: 'Mid Tower', note: 'Great airflow, features' },
        { name: 'Phanteks P400A', price: '$90', size: 'Mid Tower', note: 'Excellent value airflow' },
        { name: 'Fractal North', price: '$140', size: 'Mid Tower', note: 'Beautiful and functional' },
    ],

    bestITX: [
        { name: 'NZXT H1 V2', price: '$350', size: '12.6L', note: 'Includes PSU and AIO' },
        { name: 'Cooler Master NR200', price: '$100', size: '18L', note: 'Best value ITX' },
        { name: 'SSUPD Meshlicious', price: '$130', size: '14L', note: 'Excellent airflow ITX' },
        { name: 'Lian Li A4-H2O', price: '$150', size: '11L', note: 'Sandwich layout with AIO' },
    ],

    bestBudget: [
        { name: 'Montech AIR 903 MAX', price: '$70', size: 'Mid Tower', note: 'Great value with fans' },
        { name: 'Deepcool CC560', price: '$60', size: 'Mid Tower', note: 'Budget mesh front' },
        { name: 'Fractal Pop Air', price: '$100', size: 'Mid Tower', note: 'Solid all-rounder' },
    ],

    bestPremium: [
        { name: 'Lian Li O11 Dynamic EVO', price: '$180', size: 'Mid Tower', note: 'Showpiece case' },
        { name: 'Corsair 5000D Airflow', price: '$175', size: 'Mid Tower', note: 'Great for custom loops' },
        { name: 'Hyte Y60', price: '$200', size: 'Mid Tower', note: 'Full glass showcase' },
    ],
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Check if GPU fits in case
 */
export const checkGPUFit = (gpuLength, caseMaxGPU, hasRadiator = false) => {
    const effectiveSpace = hasRadiator ? caseMaxGPU - 55 : caseMaxGPU; // ~55mm for rad + fans
    const fits = gpuLength < effectiveSpace;
    const margin = effectiveSpace - gpuLength;

    return {
        fits,
        margin: `${margin}mm`,
        warning: margin < 10 ? 'Very tight fit - measure carefully' : null,
        recommendation: !fits ? 'Choose smaller GPU or larger case' : 'Should fit',
    };
};

/**
 * Get case recommendation
 */
export const getCaseRecommendation = ({ formFactor, gpuLength, coolerHeight, budget }) => {
    if (formFactor === 'ITX') {
        if (budget === 'high') return { case: 'Lian Li A4-H2O', reason: 'Premium compact with AIO support' };
        return { case: 'NR200', reason: 'Best value ITX case' };
    }
    if (gpuLength > 340) {
        return { case: 'Lian Li Lancool II Mesh', reason: 'Fits large GPUs, great airflow' };
    }
    if (budget === 'low') {
        return { case: 'Deepcool CC560', reason: 'Budget mesh front' };
    }
    return { case: 'Phanteks P400A', reason: 'Excellent all-around mid tower' };
};

/**
 * Explain case term
 */
export const explainCaseTerm = (term) => {
    const terms = {
        'mid tower': CASE_FORM_FACTORS.types.midTower,
        itx: CASE_FORM_FACTORS.types.itx,
        sff: CASE_FORM_FACTORS.types.itx,
        mesh: AIRFLOW_DESIGNS.meshFront,
        'psu shroud': CABLE_MANAGEMENT.features.psuShroud,
        'tempered glass': CASE_MATERIALS.temperedGlass,
    };
    return terms[term?.toLowerCase()] || null;
};

export default {
    CASE_FORM_FACTORS,
    AIRFLOW_DESIGNS,
    GPU_CLEARANCE,
    COOLER_CLEARANCE,
    RADIATOR_SUPPORT,
    CABLE_MANAGEMENT,
    CASE_MATERIALS,
    POPULAR_CASES,
    checkGPUFit,
    getCaseRecommendation,
    explainCaseTerm,
};
