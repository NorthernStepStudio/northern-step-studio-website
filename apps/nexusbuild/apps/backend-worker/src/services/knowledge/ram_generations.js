/**
 * 💾 RAM Database - All DDR Generations
 * DDR1 through DDR5 history and evolution
 */

export const RAM_GENERATIONS = {
    // ========== DDR (DDR1) - 2000-2004 ==========
    ddr: {
        era: '2000-2004',
        description: 'First DDR generation, replaced SDRAM',
        speeds: {
            'DDR-200': { speed: 200, bandwidth: '1.6 GB/s', year: 2000 },
            'DDR-266': { speed: 266, bandwidth: '2.1 GB/s', year: 2000 },
            'DDR-333': { speed: 333, bandwidth: '2.7 GB/s', year: 2001 },
            'DDR-400': { speed: 400, bandwidth: '3.2 GB/s', year: 2002, popular: true },
        },
        voltage: '2.5V',
        capacities: ['128MB', '256MB', '512MB', '1GB'],
        dimms: 184,
        platforms: ['Pentium 4', 'Athlon XP', 'Athlon 64 early'],
    },

    // ========== DDR2 - 2004-2009 ==========
    ddr2: {
        era: '2004-2009',
        description: 'Doubled prefetch, lower voltage than DDR',
        speeds: {
            'DDR2-400': { speed: 400, bandwidth: '3.2 GB/s', year: 2004 },
            'DDR2-533': { speed: 533, bandwidth: '4.3 GB/s', year: 2004 },
            'DDR2-667': { speed: 667, bandwidth: '5.3 GB/s', year: 2005, popular: true },
            'DDR2-800': { speed: 800, bandwidth: '6.4 GB/s', year: 2005, popular: true },
            'DDR2-1066': { speed: 1066, bandwidth: '8.5 GB/s', year: 2007, enthusiast: true },
        },
        voltage: '1.8V',
        capacities: ['256MB', '512MB', '1GB', '2GB', '4GB'],
        dimms: 240,
        platforms: ['Core 2 Duo', 'Core 2 Quad', 'Athlon 64 X2', 'Phenom'],
    },

    // ========== DDR3 - 2007-2015 ==========
    ddr3: {
        era: '2007-2015',
        description: 'Long-lived standard, still used today',
        speeds: {
            'DDR3-800': { speed: 800, bandwidth: '6.4 GB/s', year: 2007, budget: true },
            'DDR3-1066': { speed: 1066, bandwidth: '8.5 GB/s', year: 2007 },
            'DDR3-1333': { speed: 1333, bandwidth: '10.6 GB/s', year: 2008, popular: true },
            'DDR3-1600': { speed: 1600, bandwidth: '12.8 GB/s', year: 2009, standard: true },
            'DDR3-1866': { speed: 1866, bandwidth: '14.9 GB/s', year: 2010 },
            'DDR3-2133': { speed: 2133, bandwidth: '17.1 GB/s', year: 2011, popular: true },
            'DDR3-2400': { speed: 2400, bandwidth: '19.2 GB/s', year: 2013, enthusiast: true },
            'DDR3-2666': { speed: 2666, bandwidth: '21.3 GB/s', year: 2014, extreme: true },
        },
        voltage: '1.5V (1.35V for DDR3L)',
        capacities: ['1GB', '2GB', '4GB', '8GB'],
        dimms: 240,
        platforms: ['Sandy Bridge', 'Ivy Bridge', 'Haswell', 'Skylake early', 'Ryzen (DDR3 compat)'],
        note: 'XMP profiles became popular in this era',
    },

    // ========== DDR4 - 2014-present ==========
    ddr4: {
        era: '2014-present',
        description: 'Current mainstream, still widely used',
        speeds: {
            'DDR4-2133': { speed: 2133, bandwidth: '17.1 GB/s', year: 2014, jedec: true },
            'DDR4-2400': { speed: 2400, bandwidth: '19.2 GB/s', year: 2015, jedec: true },
            'DDR4-2666': { speed: 2666, bandwidth: '21.3 GB/s', year: 2016, standard: true },
            'DDR4-2933': { speed: 2933, bandwidth: '23.5 GB/s', year: 2017, popular: true },
            'DDR4-3000': { speed: 3000, bandwidth: '24.0 GB/s', year: 2017 },
            'DDR4-3200': { speed: 3200, bandwidth: '25.6 GB/s', year: 2018, sweetspot: true },
            'DDR4-3600': { speed: 3600, bandwidth: '28.8 GB/s', year: 2019, ryzenOptimal: true },
            'DDR4-3800': { speed: 3800, bandwidth: '30.4 GB/s', year: 2020 },
            'DDR4-4000': { speed: 4000, bandwidth: '32.0 GB/s', year: 2020, enthusiast: true },
            'DDR4-4266': { speed: 4266, bandwidth: '34.1 GB/s', year: 2021, extreme: true },
            'DDR4-4400': { speed: 4400, bandwidth: '35.2 GB/s', year: 2021 },
            'DDR4-4800': { speed: 4800, bandwidth: '38.4 GB/s', year: 2022, extreme: true },
        },
        voltage: '1.2V (1.35V+ for XMP)',
        capacities: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'],
        dimms: 288,
        platforms: ['Skylake-Coffee Lake', 'Alder Lake', 'Ryzen 1000-5000'],
        timings: {
            tight: 'CL14-16 @ 3200MHz',
            standard: 'CL16-18 @ 3200MHz',
            loose: 'CL18-20 @ 3600MHz+',
        },
    },

    // ========== DDR5 - 2021-present ==========
    ddr5: {
        era: '2021-present',
        description: 'Latest generation, on-die ECC, higher density',
        speeds: {
            'DDR5-4800': { speed: 4800, bandwidth: '38.4 GB/s', year: 2021, jedec: true },
            'DDR5-5200': { speed: 5200, bandwidth: '41.6 GB/s', year: 2022, jedec: true },
            'DDR5-5600': { speed: 5600, bandwidth: '44.8 GB/s', year: 2022, standard: true },
            'DDR5-6000': { speed: 6000, bandwidth: '48.0 GB/s', year: 2022, sweetspot: true },
            'DDR5-6200': { speed: 6200, bandwidth: '49.6 GB/s', year: 2023 },
            'DDR5-6400': { speed: 6400, bandwidth: '51.2 GB/s', year: 2023, popular: true },
            'DDR5-6600': { speed: 6600, bandwidth: '52.8 GB/s', year: 2023 },
            'DDR5-6800': { speed: 6800, bandwidth: '54.4 GB/s', year: 2023 },
            'DDR5-7000': { speed: 7000, bandwidth: '56.0 GB/s', year: 2023, enthusiast: true },
            'DDR5-7200': { speed: 7200, bandwidth: '57.6 GB/s', year: 2024 },
            'DDR5-7600': { speed: 7600, bandwidth: '60.8 GB/s', year: 2024, enthusiast: true },
            'DDR5-8000': { speed: 8000, bandwidth: '64.0 GB/s', year: 2024, extreme: true },
            'DDR5-8200': { speed: 8200, bandwidth: '65.6 GB/s', year: 2024 },
            'DDR5-8400': { speed: 8400, bandwidth: '67.2 GB/s', year: 2024, extreme: true },
        },
        voltage: '1.1V (1.25-1.4V for XMP/EXPO)',
        capacities: ['8GB', '16GB', '24GB', '32GB', '48GB', '64GB', '128GB'],
        dimms: 288,
        platforms: ['Alder Lake', 'Raptor Lake', 'Arrow Lake', 'Ryzen 7000/9000'],
        timings: {
            tight: 'CL28-32 @ 6000MHz',
            standard: 'CL32-36 @ 6000MHz',
            loose: 'CL36-40 @ 6400MHz+',
        },
        features: ['On-die ECC', 'PMIC on module', 'Higher density'],
        optimal: { AMD: 'DDR5-6000 CL30 for AM5', Intel: 'DDR5-6400+ benefits Intel' },
    },
};

// Popular RAM Kits by Era
export const POPULAR_RAM_KITS = {
    ddr3_era: {
        'Corsair Vengeance': { speed: '1600-2400', popular: true },
        'G.Skill Ripjaws': { speed: '1600-2400', value: true },
        'Kingston HyperX': { speed: '1333-2133' },
        'Crucial Ballistix': { speed: '1600-2400', oc: true },
    },
    ddr4_era: {
        'Corsair Vengeance LPX': { speed: '2666-3600', popular: true },
        'Corsair Vengeance RGB Pro': { speed: '3000-4000', rgb: true },
        'G.Skill Trident Z': { speed: '3200-4400', premium: true },
        'G.Skill Trident Z Neo': { speed: '3600', ryzen: true },
        'Crucial Ballistix': { speed: '3000-3600', value: true, oc: true },
        'Kingston Fury Beast': { speed: '2666-3600', value: true },
        'TeamGroup T-Force': { speed: '3200-4000', value: true },
    },
    ddr5_era: {
        'Corsair Vengeance DDR5': { speed: '5200-6000', popular: true },
        'Corsair Dominator Platinum': { speed: '5600-7200', premium: true },
        'G.Skill Trident Z5': { speed: '6000-8000', premium: true },
        'G.Skill Trident Z5 RGB': { speed: '6000-7600', rgb: true },
        'Kingston Fury Beast DDR5': { speed: '5200-6400', value: true },
        'TeamGroup T-Force Delta': { speed: '5600-7200', rgb: true },
        'Crucial DDR5': { speed: '4800-5600', value: true },
    },
};

// IC Types (for RAM enthusiasts)
export const RAM_IC_TYPES = {
    samsung: {
        'B-die': { oc: 'Legendary', years: '2016-2020', ddr: 'DDR4' },
        'C-die': { oc: 'Poor', years: '2019+', ddr: 'DDR4' },
        'E-die': { oc: 'Decent', years: '2020+', ddr: 'DDR4' },
        'M-die': { oc: 'Mixed', years: '2022+', ddr: 'DDR5' },
    },
    hynix: {
        'CJR': { oc: 'Good', years: '2018-2020', ddr: 'DDR4' },
        'DJR': { oc: 'Good', years: '2020+', ddr: 'DDR4' },
        'M-die': { oc: 'Excellent', years: '2022+', ddr: 'DDR5' },
        'A-die': { oc: 'Best', years: '2023+', ddr: 'DDR5' },
    },
    micron: {
        'Rev.E': { oc: 'Good', years: '2019+', ddr: 'DDR4' },
        'Rev.B': { oc: 'Decent', years: '2020+', ddr: 'DDR4' },
        'A-die': { oc: 'Good', years: '2023+', ddr: 'DDR5' },
    },
};

export default { RAM_GENERATIONS, POPULAR_RAM_KITS, RAM_IC_TYPES };
