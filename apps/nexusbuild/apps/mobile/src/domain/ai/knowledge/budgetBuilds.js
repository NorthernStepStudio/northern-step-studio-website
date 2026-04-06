/**
 * 💰 KNOWLEDGE: Budget Build Templates
 * 
 * Pre-configured builds at different price points with full rationale.
 * Prices based on December 2024 US market estimates.
 */

export const BUDGET_BUILDS = {
    // === $500 BUDGET BUILD ===
    budget_500: {
        name: '$500 Budget Gaming Build',
        price: 500,
        target: '1080p Medium-High 60FPS',
        parts: {
            cpu: {
                name: 'AMD Ryzen 5 5600',
                price: 129,
                rationale: 'Best budget CPU. AM4 platform is mature and cheap.'
            },
            gpu: {
                name: 'AMD Radeon RX 6600',
                price: 150,
                rationale: 'Best 1080p value. 8GB VRAM, handles most games well.'
            },
            motherboard: {
                name: 'MSI B550M PRO-VDH WiFi',
                price: 90,
                rationale: 'Solid B550 with WiFi. Good VRMs for Ryzen 5.'
            },
            ram: {
                name: '16GB DDR4-3200 CL16',
                price: 35,
                rationale: 'Standard gaming RAM. 3200MHz is the sweet spot for Ryzen.'
            },
            storage: {
                name: '500GB NVMe SSD',
                price: 35,
                rationale: 'Fast boot + a few games. Add HDD later for more storage.'
            },
            psu: {
                name: 'EVGA 500W 80+ Bronze',
                price: 40,
                rationale: 'Reliable budget PSU. Enough headroom for this build.'
            },
            case: {
                name: 'Deepcool CC560',
                price: 55,
                rationale: 'Great airflow, tempered glass, 4 fans included.'
            },
            cooler: {
                name: 'Stock AMD Wraith Stealth',
                price: 0,
                rationale: 'Included with CPU. Adequate for stock Ryzen 5.'
            }
        },
        total: 534,
        upgradePath: 'GPU to RX 6700 XT or RTX 4060 Ti. Add more storage.',
        notes: 'Best value entry-level gaming. Can play most games at 1080p.'
    },

    // === $800 SWEET SPOT BUILD ===
    budget_800: {
        name: '$800 Sweet Spot Build',
        price: 800,
        target: '1080p High-Ultra / 1440p Medium 60FPS',
        parts: {
            cpu: {
                name: 'AMD Ryzen 5 7600',
                price: 199,
                rationale: 'Current gen Zen 4. Great gaming performance.'
            },
            gpu: {
                name: 'AMD Radeon RX 7600',
                price: 250,
                rationale: 'Best 1080p card. Plays 1440p at reduced settings.'
            },
            motherboard: {
                name: 'Gigabyte B650M AORUS Elite AX',
                price: 140,
                rationale: 'AM5 platform with WiFi. Great for upgrades.'
            },
            ram: {
                name: '32GB DDR5-5600 CL36',
                price: 85,
                rationale: 'DDR5 is required for AM5. 32GB is future-proof.'
            },
            storage: {
                name: '1TB NVMe SSD (Gen4)',
                price: 60,
                rationale: 'Good capacity, fast speeds.'
            },
            psu: {
                name: 'Corsair RM650 80+ Gold',
                price: 80,
                rationale: 'Quality PSU with headroom for upgrades.'
            },
            case: {
                name: 'NZXT H5 Flow',
                price: 80,
                rationale: 'Excellent airflow, clean design.'
            },
            cooler: {
                name: 'DeepCool AK400',
                price: 30,
                rationale: 'Great budget tower. Much better than stock.'
            }
        },
        total: 924,
        upgradePath: 'GPU to RX 7800 XT or RTX 4070. CPU to Ryzen 7 9700X.',
        notes: 'Best value for current-gen gaming. AM5 platform has years of support.'
    },

    // === $1200 BALANCED BUILD ===
    budget_1200: {
        name: '$1200 Balanced Build',
        price: 1200,
        target: '1440p High-Ultra 100+ FPS',
        parts: {
            cpu: {
                name: 'AMD Ryzen 7 7800X3D',
                price: 399,
                rationale: 'Best gaming CPU period. 3D V-Cache is amazing.'
            },
            gpu: {
                name: 'AMD Radeon RX 7800 XT',
                price: 450,
                rationale: 'Best value 1440p GPU. 16GB VRAM future-proofs it.'
            },
            motherboard: {
                name: 'MSI MAG B650 TOMAHAWK WiFi',
                price: 180,
                rationale: 'Excellent VRMs, WiFi 6E, USB-C.'
            },
            ram: {
                name: '32GB DDR5-6000 CL30',
                price: 110,
                rationale: 'Fast DDR5 for gaming. 6000MHz is sweet spot.'
            },
            storage: {
                name: '1TB NVMe SSD (Gen4)',
                price: 60,
                rationale: 'Fast and sufficient. Add second drive later.'
            },
            psu: {
                name: 'Corsair RM750 80+ Gold',
                price: 90,
                rationale: 'Headroom for GPU upgrades. Fully modular.'
            },
            case: {
                name: 'Fractal Design North',
                price: 130,
                rationale: 'Beautiful design, excellent airflow.'
            },
            cooler: {
                name: 'Thermalright Peerless Assassin 120',
                price: 45,
                rationale: 'Best value tower cooler. Quiet and effective.'
            }
        },
        total: 1464,
        upgradePath: 'GPU to RTX 5070 or RX 9800 XT. Add 2nd SSD.',
        notes: 'Optimal 1440p gaming. 7800X3D will last for years.'
    },

    // === $1500 PERFORMANCE BUILD ===
    budget_1500: {
        name: '$1500 Performance Build',
        price: 1500,
        target: '1440p Ultra 144+ FPS / 4K 60FPS',
        parts: {
            cpu: {
                name: 'AMD Ryzen 7 9800X3D',
                price: 479,
                rationale: 'Zen 5 3D V-Cache. Absolute gaming king.'
            },
            gpu: {
                name: 'NVIDIA GeForce RTX 4070 Ti Super',
                price: 750,
                rationale: 'Excellent 1440p/4K. Great ray tracing + DLSS 3.'
            },
            motherboard: {
                name: 'ASUS TUF Gaming X670E-PLUS WiFi',
                price: 280,
                rationale: 'Premium X670E. PCIe 5.0, USB4-ready.'
            },
            ram: {
                name: '32GB DDR5-6400 CL32',
                price: 130,
                rationale: 'High-speed RAM for best gaming performance.'
            },
            storage: {
                name: '2TB NVMe SSD (Gen4)',
                price: 110,
                rationale: 'Plenty of space for games.'
            },
            psu: {
                name: 'Corsair RM850x 80+ Gold',
                price: 120,
                rationale: 'Excellent build quality. Future GPU headroom.'
            },
            case: {
                name: 'Lian Li Lancool III',
                price: 140,
                rationale: 'Amazing airflow, easy building, mesh front.'
            },
            cooler: {
                name: 'Arctic Liquid Freezer II 280',
                price: 110,
                rationale: 'Best value AIO. Quiet and effective.'
            }
        },
        total: 2119,
        upgradePath: 'GPU to RTX 5080. 4TB storage.',
        notes: 'High-end gaming machine. Plays everything at high settings.'
    },

    // === $2000 ENTHUSIAST BUILD ===
    budget_2000: {
        name: '$2000 Enthusiast Build',
        price: 2000,
        target: '4K High 60+ FPS / 1440p Ultra 165+ FPS',
        parts: {
            cpu: {
                name: 'AMD Ryzen 7 9800X3D',
                price: 479,
                rationale: 'Still the gaming king. No reason to spend more.'
            },
            gpu: {
                name: 'NVIDIA GeForce RTX 4080 Super',
                price: 999,
                rationale: '4K capable. Excellent performance and efficiency.'
            },
            motherboard: {
                name: 'ASUS ROG Crosshair X670E Hero',
                price: 450,
                rationale: 'Premium features, best VRMs, WiFi 7.'
            },
            ram: {
                name: '64GB DDR5-6000 CL30',
                price: 200,
                rationale: '64GB for streaming, multitasking, future-proofing.'
            },
            storage: {
                name: '2TB NVMe SSD (Gen4) + 2TB Secondary',
                price: 180,
                rationale: '4TB total. Room for huge game libraries.'
            },
            psu: {
                name: 'Corsair RM1000x 80+ Gold',
                price: 170,
                rationale: 'Ready for next-gen GPUs.'
            },
            case: {
                name: 'Lian Li O11 Dynamic EVO',
                price: 170,
                rationale: 'Showcase build. Beautiful design.'
            },
            cooler: {
                name: 'Arctic Liquid Freezer II 360',
                price: 130,
                rationale: 'Maximum cooling headroom.'
            }
        },
        total: 2778,
        upgradePath: 'GPU to RTX 5090 when available.',
        notes: 'Premium gaming experience. Plays everything maxed out.'
    },

    // === $3000+ ULTIMATE BUILD ===
    budget_ultimate: {
        name: '$3000+ Ultimate Build',
        price: 3000,
        target: '4K Ultra Everything / 8K / No Compromises',
        parts: {
            cpu: {
                name: 'AMD Ryzen 9 9950X3D (or 9800X3D)',
                price: 750,
                rationale: '3D V-Cache + 16 cores. Gaming AND productivity.'
            },
            gpu: {
                name: 'NVIDIA GeForce RTX 5090',
                price: 1999,
                rationale: 'Flagship. Plays everything at max. 8K capable.'
            },
            motherboard: {
                name: 'ASUS ROG Crosshair X870E Extreme',
                price: 700,
                rationale: 'Best of the best. Every feature available.'
            },
            ram: {
                name: '64GB DDR5-8000 CL36',
                price: 400,
                rationale: 'Top-end RAM for maximum performance.'
            },
            storage: {
                name: '4TB NVMe SSD (Gen5) + 4TB Gen4',
                price: 500,
                rationale: '8TB of fast storage. Never worry about space.'
            },
            psu: {
                name: 'Corsair AX1600i 80+ Titanium',
                price: 500,
                rationale: 'Best PSU money can buy. RTX 5090 ready.'
            },
            case: {
                name: 'Lian Li O11D EVO XL',
                price: 250,
                rationale: 'XL for custom loop potential.'
            },
            cooler: {
                name: 'Custom Loop / EK-AIO Elite 360',
                price: 500,
                rationale: 'Maximum cooling for max performance.'
            }
        },
        total: 5599,
        upgradePath: 'Custom water loop, dual GPU (if you want).',
        notes: 'Money no object build. Best of everything.'
    }
};

// === BUILD FINDER HELPER ===
export const findBuildByBudget = (budget) => {
    const builds = Object.values(BUDGET_BUILDS);
    const sorted = builds.sort((a, b) => Math.abs(a.price - budget) - Math.abs(b.price - budget));
    return sorted[0];
};

export const findBuildByTarget = (target) => {
    const targetLower = target.toLowerCase();
    if (targetLower.includes('4k') && targetLower.includes('ultra')) return BUDGET_BUILDS.budget_ultimate;
    if (targetLower.includes('4k')) return BUDGET_BUILDS.budget_2000;
    if (targetLower.includes('1440p') && targetLower.includes('144')) return BUDGET_BUILDS.budget_1500;
    if (targetLower.includes('1440p')) return BUDGET_BUILDS.budget_1200;
    if (targetLower.includes('1080p')) return BUDGET_BUILDS.budget_800;
    return BUDGET_BUILDS.budget_500;
};

export default BUDGET_BUILDS;
