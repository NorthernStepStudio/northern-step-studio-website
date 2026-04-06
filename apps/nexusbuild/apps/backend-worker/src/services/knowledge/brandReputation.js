/**
 * 🏢 NEXUS AI - Brand Reputation & Detailed Analysis
 *
 * In-depth knowledge about PC component brands:
 * - GPU manufacturers
 * - Motherboard brands
 * - RAM manufacturers
 * - PSU brands
 * - Case manufacturers
 * - Cooler brands
 * - Storage brands
 * - Peripheral brands
 */

// === GPU BRANDS ===
export const GPU_BRANDS = {
    nvidia_aibs: {
        overview: 'NVIDIA doesn\'t sell most GPUs directly. AIB partners make cards with NVIDIA chips.',

        asus: {
            name: 'ASUS',
            tiers: {
                'ROG Strix': { quality: 'Premium', cooling: 'Excellent', price: 'High' },
                'TUF Gaming': { quality: 'Good', cooling: 'Good', price: 'Mid-range' },
                'Dual': { quality: 'Basic', cooling: 'Adequate', price: 'Budget' },
                'ProArt': { quality: 'Workstation', cooling: 'Good', price: 'High' },
            },
            reputation: 'Excellent build quality, great cooling, premium pricing',
            warranty: '3 years',
            rma: 'Good customer service',
        },

        msi: {
            name: 'MSI',
            tiers: {
                'Suprim': { quality: 'Ultra Premium', cooling: 'Best', price: 'Highest' },
                'Gaming X Trio': { quality: 'Premium', cooling: 'Excellent', price: 'High' },
                'Ventus': { quality: 'Budget', cooling: 'Basic', price: 'Low' },
            },
            reputation: 'Great gaming focus, Afterburner software, good value',
            warranty: '3 years',
            rma: 'Mixed experiences',
        },

        evga: {
            name: 'EVGA',
            status: 'Discontinued NVIDIA GPUs (left GPU market 2022)',
            reputation: 'Was legendary for customer service and step-up program',
            note: 'Their existing GPUs still have warranty support',
        },

        gigabyte: {
            name: 'Gigabyte',
            tiers: {
                'Aorus Master': { quality: 'Premium', cooling: 'Excellent' },
                'Aorus Elite': { quality: 'Good', cooling: 'Good' },
                'Gaming OC': { quality: 'Mid-range', cooling: 'Good' },
                'Eagle/Windforce': { quality: 'Budget', cooling: 'Basic' },
            },
            reputation: 'Good value, mixed quality control',
            warranty: '4 years (registers required)',
            rma: 'Historically difficult, improved recently',
        },

        zotac: {
            name: 'Zotac',
            reputation: 'Known for compact designs, budget-friendly',
            warranty: '5 years in some regions',
            note: 'Great for SFF builds with small cards',
        },

        pny: {
            name: 'PNY',
            reputation: 'Budget-focused, basic cooling',
            note: 'Fine for budget builds, not enthusiast-focused',
        },

        palit: {
            name: 'Palit/Gainward',
            reputation: 'Popular in Europe/Asia, good value',
            note: 'GameRock series is premium tier',
        },
    },

    amd_aibs: {
        overview: 'AMD sells reference cards (Made by AMD) and partners sell custom cards.',

        sapphire: {
            name: 'Sapphire',
            reputation: 'AMD-only, considered best AMD AIB',
            tiers: {
                'Nitro+': { quality: 'Premium', cooling: 'Excellent' },
                'Pulse': { quality: 'Good', cooling: 'Good' },
            },
            specialty: 'AMD exclusive = highly optimized designs',
        },

        powercolor: {
            name: 'PowerColor',
            reputation: 'Excellent AMD partner, great value',
            tiers: {
                'Red Devil': { quality: 'Premium', cooling: 'Excellent' },
                'Hellhound': { quality: 'Good', cooling: 'Good' },
                'Fighter': { quality: 'Budget', cooling: 'Basic' },
            },
        },

        xfx: {
            name: 'XFX',
            reputation: 'Good AMD partner, unique designs',
            tiers: {
                'Merc': { quality: 'Premium', cooling: 'Excellent' },
                'Speedster': { quality: 'Mid-range', cooling: 'Good' },
            },
        },

        asrock: {
            name: 'ASRock',
            reputation: 'Known for motherboards, AMD GPUs are decent',
            tiers: {
                'Taichi': { quality: 'Premium' },
                'Phantom Gaming': { quality: 'Good' },
                'Challenger': { quality: 'Budget' },
            },
        },
    },
};

// === MOTHERBOARD BRANDS ===
export const MOTHERBOARD_BRANDS = {
    asus: {
        name: 'ASUS',
        marketShare: 'Largest motherboard manufacturer',
        tiers: {
            'ROG Maximus': { quality: 'Ultra Premium', features: 'Everything', price: '$400-1000+' },
            'ROG Strix': { quality: 'Premium', features: 'Great for gaming', price: '$250-500' },
            'TUF Gaming': { quality: 'Mid-range', features: 'Solid VRM, gaming focus', price: '$150-300' },
            'Prime': { quality: 'Budget', features: 'Basic features', price: '$100-200' },
            'ProArt': { quality: 'Workstation', features: 'Creator features', price: '$300+' },
        },
        bios: 'Best BIOS interface in the industry',
        reputation: 'Excellent quality, premium prices, great software',
    },

    msi: {
        name: 'MSI',
        tiers: {
            'Godlike': { quality: 'Ultra Premium', price: '$700+' },
            'Ace': { quality: 'Premium', price: '$400-600' },
            'Carbon': { quality: 'High-end', price: '$300-400' },
            'Tomahawk': { quality: 'Best value mid-range', price: '$150-250' },
            'Pro': { quality: 'Budget workstation', price: '$100-200' },
        },
        reputation: 'Tomahawk series is legendary value. Good overall.',
        bios: 'Good BIOS, not as refined as ASUS',
    },

    gigabyte: {
        name: 'Gigabyte',
        tiers: {
            'Aorus Xtreme': { quality: 'Ultra Premium', price: '$600+' },
            'Aorus Master': { quality: 'Premium', price: '$350-500' },
            'Aorus Pro': { quality: 'High-end', price: '$200-350' },
            'Aorus Elite': { quality: 'Mid-range', price: '$150-250' },
            'Gaming/UD': { quality: 'Budget', price: '$100-150' },
        },
        reputation: 'Good boards, some QC issues historically',
        bios: 'Acceptable BIOS, not as good as ASUS/MSI',
    },

    asrock: {
        name: 'ASRock',
        tiers: {
            'Taichi': { quality: 'Premium', price: '$300-500' },
            'Steel Legend': { quality: 'Good value', price: '$150-250' },
            'Pro/Phantom Gaming': { quality: 'Mid-range', price: '$100-200' },
        },
        reputation: 'Great value, innovative features, some budget cuts',
        bios: 'Basic but functional BIOS',
    },

    biostar: {
        name: 'Biostar',
        reputation: 'Budget brand, limited features',
        when: 'Only if extreme budget constraints',
    },
};

// === RAM BRANDS ===
export const RAM_BRANDS = {
    tier1: {
        corsair: {
            name: 'Corsair',
            lines: {
                'Dominator': { quality: 'Premium', rgb: 'Yes', oc: 'Excellent' },
                'Vengeance': { quality: 'Good', rgb: 'Some', oc: 'Good' },
            },
            reputation: 'Reliable, great warranty, popular choice',
            warranty: 'Lifetime',
        },
        gskill: {
            name: 'G.Skill',
            lines: {
                'Trident Z5': { quality: 'Premium DDR5', oc: 'Best' },
                'Trident Z Neo': { quality: 'Ryzen optimized', oc: 'Excellent' },
                'Ripjaws': { quality: 'Good value', oc: 'Good' },
            },
            reputation: 'Best enthusiast RAM, excellent for OC',
            warranty: 'Lifetime',
        },
        kingston: {
            name: 'Kingston',
            lines: {
                'Fury Beast/Renegade': { quality: 'Good gaming RAM' },
            },
            reputation: 'Reliable, good value',
            warranty: 'Lifetime',
        },
    },

    tier2: {
        teamgroup: {
            name: 'TeamGroup',
            lines: {
                'T-Force': { quality: 'Good gaming focus', value: 'Excellent' },
            },
            reputation: 'Great value alternative',
            warranty: 'Lifetime',
        },
        crucial: {
            name: 'Crucial (Micron)',
            lines: {
                'Crucial Pro': { quality: 'Good DDR5', oc: 'Decent' },
                'Ballistix': { quality: 'Discontinued but legendary for OC' },
            },
            reputation: 'Good value, Micron-manufactured',
            warranty: 'Limited lifetime',
        },
        patriot: {
            name: 'Patriot',
            reputation: 'Good budget option',
        },
    },
};

// === PSU BRANDS ===
export const PSU_BRANDS = {
    tierA: {
        seasonic: {
            name: 'Seasonic',
            reputation: 'Gold standard of PSUs. Makes units for other brands.',
            lines: {
                'Prime': { quality: 'Ultra Premium', warranty: '12 years' },
                'Focus': { quality: 'Premium', warranty: '10 years' },
            },
            oem: 'Makes PSUs for: Corsair (some), Antec, NZXT, Phanteks, XFX',
        },
        corsair: {
            name: 'Corsair',
            reputation: 'Excellent high-end PSUs',
            lines: {
                'AXi': { quality: 'Ultra Premium', warranty: '10 years' },
                'HXi': { quality: 'Premium', warranty: '10 years' },
                'RMx': { quality: 'Great mainstream', warranty: '10 years' },
                'RM': { quality: 'Good', warranty: '10 years' },
                'CX/CXF': { quality: 'Budget acceptable', warranty: '5 years' },
            },
        },
        bequiet: {
            name: 'be quiet!',
            reputation: 'German engineering, silent focus',
            lines: {
                'Dark Power': { quality: 'Ultra Premium', noise: 'Silent' },
                'Straight Power': { quality: 'Premium' },
                'Pure Power': { quality: 'Good value' },
            },
        },
    },

    tierB: {
        evga: {
            name: 'EVGA',
            reputation: 'Good PSUs, great warranty support',
            lines: {
                'SuperNOVA G/P': { quality: 'Good' },
                'SuperNOVA GT': { quality: 'Budget' },
            },
            note: 'Still supports PSU products despite leaving GPU market',
        },
        msi: {
            name: 'MSI',
            reputation: 'Newer to PSUs, decent quality',
            lines: {
                'MEG': { quality: 'Premium' },
                'MPG': { quality: 'Good' },
            },
        },
    },

    tierC: {
        thermaltake: {
            name: 'Thermaltake',
            reputation: 'Mixed. Some good, some bad.',
            recommendation: 'Research specific model reviews',
        },
        coolermaster: {
            name: 'Cooler Master',
            reputation: 'Mid-range PSUs',
            recommendation: 'MWE Gold is acceptable',
        },
    },

    avoid: {
        description: 'Brands with known issues or poor quality',
        brands: ['Gigabyte (GP-P850GM fire risk)', 'Raidmax', 'Diablotek', 'Generic no-name'],
        note: 'These brands have had failures, fires, or component damage issues',
    },
};

// === CASE BRANDS ===
export const CASE_BRANDS = {
    premium: {
        lianli: {
            name: 'Lian Li',
            reputation: 'Premium aluminum, innovative designs',
            popular: ['O11 Dynamic', 'Lancool II Mesh', 'A4-H2O'],
        },
        fractal: {
            name: 'Fractal Design',
            reputation: 'Scandinavian design, clean aesthetics',
            popular: ['Meshify', 'North', 'Torrent'],
        },
        phanteks: {
            name: 'Phanteks',
            reputation: 'Great value premium, innovator',
            popular: ['Eclipse series', 'Enthoo Pro'],
        },
    },

    good: {
        corsair: {
            name: 'Corsair',
            reputation: 'Solid cases, good ecosystem',
            popular: ['4000D Airflow', '5000D', 'iCUE cases'],
        },
        nzxt: {
            name: 'NZXT',
            reputation: 'Clean aesthetic, mixed airflow',
            popular: ['H5 Flow', 'H9'],
            note: 'Older H510 has poor airflow - Flow versions fixed it',
        },
        bequiet: {
            name: 'be quiet!',
            reputation: 'Silent focus, great build quality',
            popular: ['Silent Base', 'Pure Base', 'Dark Base'],
        },
    },

    value: {
        coolermaster: {
            name: 'Cooler Master',
            reputation: 'Excellent value, wide range',
            popular: ['NR200', 'MasterBox', 'TD500'],
        },
        montech: {
            name: 'Montech',
            reputation: 'Great value, includes fans',
            popular: ['AIR 903', 'Sky variants'],
        },
        deepcool: {
            name: 'DeepCool',
            reputation: 'Good value, improving quality',
            popular: ['CC560', 'CH560'],
        },
    },
};

// === COOLER BRANDS ===
export const COOLER_BRANDS = {
    air: {
        noctua: {
            name: 'Noctua',
            reputation: 'Legendary quality and performance',
            popular: ['NH-D15', 'NH-U12S'],
            color: 'Brown (chromax for black)',
            warranty: '6 years',
        },
        bequiet: {
            name: 'be quiet!',
            reputation: 'Great performance, silent focus',
            popular: ['Dark Rock Pro 5', 'Pure Rock 2'],
        },
        thermalright: {
            name: 'Thermalright',
            reputation: 'Incredible value, NH-D15 competitor',
            popular: ['Peerless Assassin', 'Frost Spirit'],
        },
        deepcool: {
            name: 'DeepCool',
            reputation: 'Good value',
            popular: ['AK620', 'Assassin IV'],
        },
    },

    aio: {
        arctic: {
            name: 'Arctic',
            reputation: 'Best value AIOs, excellent performance',
            popular: ['Liquid Freezer II/III'],
            value: 'Beats $200+ AIOs at $100 price',
        },
        corsair: {
            name: 'Corsair',
            reputation: 'Great RGB ecosystem, reliable',
            popular: ['H150i Elite', 'H100i'],
        },
        ekwb: {
            name: 'EK (EKWB)',
            reputation: 'Premium water cooling',
            popular: ['EK-AIO', 'Custom loop components'],
        },
        nzxt: {
            name: 'NZXT',
            reputation: 'Aesthetic focus, good CAM software',
            popular: ['Kraken series'],
        },
    },
};

// === STORAGE BRANDS ===
export const STORAGE_BRANDS = {
    ssd: {
        samsung: {
            name: 'Samsung',
            reputation: 'Premium quality, in-house components',
            lines: {
                '990 Pro': { quality: 'Top tier Gen4' },
                '980 Pro': { quality: 'Previous gen excellent' },
            },
        },
        wdBlack: {
            name: 'WD Black',
            reputation: 'Gaming focus, excellent performance',
            popular: ['SN850X', 'SN770'],
        },
        crucial: {
            name: 'Crucial (Micron)',
            reputation: 'Great value, Micron NAND',
            popular: ['T500', 'P3 Plus'],
        },
        seagate: {
            name: 'Seagate',
            reputation: 'Good SSDs, known more for HDDs',
            popular: ['FireCuda 540', 'FireCuda 530'],
        },
        sk_hynix: {
            name: 'SK Hynix',
            reputation: 'Great value, quality NAND',
            popular: ['Platinum P41'],
        },
    },

    hdd: {
        wd: {
            name: 'Western Digital',
            lines: {
                'Red': { use: 'NAS', tech: 'CMR', reliable: true },
                'Blue': { use: 'Desktop', value: 'Good' },
                'Black': { use: 'Performance', warranty: '5yr' },
                'Purple': { use: 'Surveillance' },
            },
        },
        seagate: {
            name: 'Seagate',
            lines: {
                'IronWolf': { use: 'NAS', quality: 'Excellent' },
                'Barracuda': { use: 'Desktop', note: 'Check CMR vs SMR' },
            },
            note: 'Had reliability issues in past, improved',
        },
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get brand recommendation for component
 */
export const getBrandRecommendation = (component, budget) => {
    const recs = {
        gpu_nvidia: budget === 'premium' ? 'ASUS ROG Strix or MSI Suprim' : 'MSI Gaming X or ASUS TUF',
        gpu_amd: budget === 'premium' ? 'Sapphire Nitro+' : 'PowerColor Red Devil or Sapphire Pulse',
        motherboard: 'MSI Tomahawk for value, ASUS for premium',
        ram: 'G.Skill for OC, Corsair for RGB ecosystem',
        psu: 'Corsair RMx or Seasonic Focus for mainstream',
        case: 'Lian Li Lancool II Mesh or Phanteks P400A',
        cooler_air: 'Thermalright Peerless Assassin for value, Noctua for premium',
        cooler_aio: 'Arctic Liquid Freezer for value',
    };
    return recs[component] || 'Research specific model reviews';
};

/**
 * Check if brand is trustworthy
 */
export const isBrandTrustworthy = (brand, component) => {
    const trustworthy = {
        gpu: ['ASUS', 'MSI', 'EVGA', 'Sapphire', 'PowerColor'],
        psu: ['Seasonic', 'Corsair', 'be quiet!', 'EVGA'],
        motherboard: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
        ram: ['Corsair', 'G.Skill', 'Kingston', 'Crucial'],
    };

    const list = trustworthy[component] || [];
    return list.some(b => b.toLowerCase() === brand.toLowerCase());
};

export default {
    GPU_BRANDS,
    MOTHERBOARD_BRANDS,
    RAM_BRANDS,
    PSU_BRANDS,
    CASE_BRANDS,
    COOLER_BRANDS,
    STORAGE_BRANDS,
    getBrandRecommendation,
    isBrandTrustworthy,
};
