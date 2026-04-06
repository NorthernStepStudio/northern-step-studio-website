/**
 * 💿 NEXUS AI - Storage Deep Dive Knowledge
 * 
 * Expert-level storage knowledge including:
 * - NVMe generations (Gen3, Gen4, Gen5)
 * - Controllers (Phison, Samsung, WD)
 * - NAND types (SLC, TLC, QLC)
 * - DRAM cache vs DRAMless
 * - Endurance (TBW, DWPD)
 * - HDD vs SSD
 * - RAID configurations
 */

// === NVME GENERATIONS ===
export const NVME_GENERATIONS = {
    overview: {
        description: 'NVMe SSDs use PCIe lanes for high-speed storage access.',
        interface: 'M.2 slot (2280 most common)',
        advantage: 'Much faster than SATA SSDs (7x to 25x read speeds)',
    },

    generations: {
        gen3: {
            name: 'PCIe 3.0 / Gen 3',
            maxSpeed: '3,500 MB/s read, 3,000 MB/s write',
            status: 'Legacy, still available budget option',
            pricing: 'Cheapest NVMe option',
            examples: ['Samsung 970 EVO', 'WD Blue SN570'],
            recommendation: 'Fine for gaming, office, general use.',
        },
        gen4: {
            name: 'PCIe 4.0 / Gen 4',
            maxSpeed: '7,400 MB/s read, 6,500 MB/s write',
            status: 'Current mainstream standard',
            pricing: 'Best value/performance ratio',
            examples: ['Samsung 990 Pro', 'WD Black SN850X', 'Crucial T500'],
            recommendation: 'Best choice for most users in 2024-2025.',
        },
        gen5: {
            name: 'PCIe 5.0 / Gen 5',
            maxSpeed: '14,000+ MB/s read, 12,000+ MB/s write',
            status: 'Newest, premium pricing',
            pricing: 'Expensive, 2x Gen4 prices',
            examples: ['Crucial T700', 'Samsung 990 EVO Plus', 'Corsair MP700'],
            requirement: 'REQUIRES heatsink (runs very hot)',
            recommendation: 'Only for content creators with huge file transfers.',
        },
    },

    realWorldDifference: {
        gaming: 'Gen3 vs Gen4 vs Gen5 = barely noticeable (1-2 sec load difference)',
        bootTime: 'All NVMe = 10-15 second boot time',
        fileTransfers: 'Gen5 shines for large video files (50GB+ transfers)',
        everyday: 'Even Gen3 feels instant for daily use',
        verdict: 'For gaming, Gen4 is plenty. Gen5 only for pros.',
    },
};

// === CONTROLLERS ===
export const SSD_CONTROLLERS = {
    overview: {
        description: 'SSD controller manages NAND, handles wear leveling, caching, encryption.',
        importance: 'Controller quality affects speed, reliability, and longevity.',
    },

    manufacturers: {
        phison: {
            name: 'Phison',
            models: {
                'E18': { tier: 'High-end', generation: 'Gen4', performance: 'Top tier' },
                'E21': { tier: 'Mid-range', generation: 'Gen4', performance: 'Good value' },
                'E26': { tier: 'Flagship', generation: 'Gen5', performance: 'Maximum speed' },
            },
            note: 'Used by most SSD brands (Corsair, Sabrent, Inland, etc.)',
        },
        samsung: {
            name: 'Samsung (in-house)',
            models: {
                'Elpis': { tier: 'High-end', generation: 'Gen4', used: '990 Pro' },
                'Pascal': { tier: 'Flagship', generation: 'Gen5', used: '990 Pro Gen5' },
            },
            note: 'Samsung makes their own controllers - generally excellent.',
        },
        sandisk_wd: {
            name: 'WD/SanDisk (in-house)',
            models: {
                'G2': { tier: 'High-end', generation: 'Gen4', used: 'SN850X' },
            },
            note: 'WD owns SanDisk, uses in-house controllers for Black series.',
        },
        silicon_motion: {
            name: 'Silicon Motion (SM)',
            models: {
                'SM2262EN': { tier: 'Budget', generation: 'Gen3', performance: 'Entry-level' },
                'SM2264': { tier: 'Mid-range', generation: 'Gen4', performance: 'Decent' },
            },
            note: 'Common in budget SSDs.',
        },
        realtek: {
            name: 'Realtek',
            tier: 'Budget',
            note: 'Found in very cheap SSDs. Works, but not fastest.',
        },
    },

    quality_tiers: {
        tier1: {
            controllers: ['Samsung Elpis', 'Phison E18', 'WD G2'],
            performance: 'Maximum speed, excellent reliability',
            examples: ['Samsung 990 Pro', 'WD Black SN850X', 'Corsair MP600 Pro'],
        },
        tier2: {
            controllers: ['Phison E21', 'Silicon Motion SM2264'],
            performance: 'Great for the price',
            examples: ['Crucial P3 Plus', 'Kingston NV2', 'Inland Performance'],
        },
        tier3: {
            controllers: ['Realtek', 'SM2262'],
            performance: 'Basic - works, not fast',
            examples: ['Generic Amazon SSDs'],
        },
    },
};

// === NAND TYPES ===
export const NAND_TYPES = {
    overview: {
        description: 'NAND flash is the storage medium. Different types have different endurance.',
        bits: 'More bits per cell = more capacity, less endurance, slower.',
    },

    types: {
        slc: {
            name: 'SLC (Single-Level Cell)',
            bits: '1 bit per cell',
            endurance: 'Highest (100,000+ P/E cycles)',
            speed: 'Fastest',
            used: 'Enterprise SSDs, SLC cache in consumer drives',
            price: 'Extremely expensive',
        },
        mlc: {
            name: 'MLC (Multi-Level Cell)',
            bits: '2 bits per cell',
            endurance: 'High (10,000+ P/E cycles)',
            speed: 'Fast',
            used: 'Older high-end SSDs',
            status: 'Mostly replaced by TLC',
        },
        tlc: {
            name: 'TLC (Triple-Level Cell)',
            bits: '3 bits per cell',
            endurance: 'Good (3,000-5,000 P/E cycles)',
            speed: 'Good',
            used: 'Most consumer SSDs (Samsung 990, WD SN850X)',
            recommendation: 'Best balance of price/performance/endurance.',
        },
        qlc: {
            name: 'QLC (Quad-Level Cell)',
            bits: '4 bits per cell',
            endurance: 'Lower (1,000 P/E cycles)',
            speed: 'Slower (especially writes)',
            used: 'High-capacity budget SSDs',
            caveat: 'Fine for read-heavy, avoid for constant writes.',
        },
    },

    slcCache: {
        description: 'Consumer SSDs use part of NAND as SLC cache for burst writes.',
        behavior: {
            inCache: 'Writes at advertised speed',
            cacheExhausted: 'Writes slow down significantly (especially QLC)',
        },
        size: 'Typically 10-50GB depending on drive capacity',
        implication: 'Large single-file transfers may slow down.',
    },

    recommendation: {
        general: 'TLC - best balance',
        maximum_capacity: 'QLC if read-heavy (game storage)',
        workstation: 'TLC for any write-heavy workload',
    },
};

// === DRAM CACHE ===
export const DRAM_CACHE = {
    overview: {
        description: 'Some SSDs have DRAM chip for caching the flash translation layer (FTL).',
        purpose: 'Faster random access, better sustained performance.',
    },

    types: {
        withDRAM: {
            description: 'Has dedicated DRAM cache chip.',
            advantages: ['Faster random I/O', 'Better sustained writes', 'Longer lifespan'],
            examples: ['Samsung 990 Pro', 'WD Black SN850X', 'Crucial T500'],
            recommendation: 'Preferred for boot drives and heavy use.',
        },
        dramless: {
            description: 'No DRAM - uses Host Memory Buffer (HMB) instead.',
            advantages: ['Cheaper', 'Lower power consumption'],
            disadvantages: ['Slower random I/O', 'Performance drops under load'],
            examples: ['WD Blue SN580', 'Crucial P3', 'Kingston NV2'],
            recommendation: 'Fine for secondary storage, game libraries.',
        },
        hmb: {
            name: 'HMB (Host Memory Buffer)',
            description: 'DRAMless SSDs borrow system RAM for caching.',
            size: 'Typically 32-64MB of system RAM',
            note: 'Better than nothing, not as good as dedicated DRAM.',
        },
    },

    choosing: {
        bootDrive: 'Prefer DRAM for OS + main apps',
        gameDrive: 'DRAMless is fine (mostly sequential reads)',
        workstation: 'Always DRAM for database/VM/editing work',
        budget: 'DRAMless acceptable if cost is priority',
    },
};

// === ENDURANCE ===
export const SSD_ENDURANCE = {
    tbw: {
        name: 'TBW (Terabytes Written)',
        description: 'Total amount of data you can write before expected failure.',
        note: 'Warranty typically expires at TBW limit.',
        examples: {
            '500GB SSD': '300-600 TBW typical',
            '1TB SSD': '600-1200 TBW typical',
            '2TB SSD': '1200-2400 TBW typical',
        },
        realWorld: 'Average user writes 10-20TB/year. 600TBW = 30+ years.',
    },

    dwpd: {
        name: 'DWPD (Drive Writes Per Day)',
        description: 'Full drive writes per day over warranty period.',
        formula: 'DWPD = TBW ÷ (Capacity × Warranty Years × 365)',
        typical: {
            consumer: '0.3-0.6 DWPD',
            prosumer: '1 DWPD',
            enterprise: '3-10+ DWPD',
        },
    },

    monitoring: {
        tools: ['CrystalDiskInfo', 'Samsung Magician', 'WD Dashboard'],
        smartAttributes: ['Wear Leveling Count', 'Percentage Used', 'TB Written'],
        warning: 'Replace when approaching 90% life used.',
    },

    factors: {
        goodFor: ['TLC NAND', 'DRAM cache', 'Enterprise drives'],
        badFor: ['QLC NAND', 'Constant small writes', 'High-temperature operation'],
    },
};

// === HDD ===
export const HDD_KNOWLEDGE = {
    overview: {
        description: 'Hard drives use spinning platters. Cheap, high capacity, slow.',
        use: 'Bulk storage, backups, NAS, archives.',
        avoid: 'OS drive, game drive if you value load times.',
    },

    types: {
        hdd7200: {
            rpm: '7200 RPM',
            speed: '~150-200 MB/s sustained',
            use: 'Desktop storage, fastest HDD option',
            noise: 'Louder than 5400',
        },
        hdd5400: {
            rpm: '5400 RPM',
            speed: '~100-150 MB/s sustained',
            use: 'NAS drives, quiet builds, laptops',
            noise: 'Quieter, lower power',
        },
    },

    technology: {
        cmr: {
            name: 'CMR (Conventional Magnetic Recording)',
            description: 'Tracks don\'t overlap. Better for random writes.',
            use: 'NAS, frequent writes, RAID arrays',
            recommendation: 'Preferred for NAS use.',
        },
        smr: {
            name: 'SMR (Shingled Magnetic Recording)',
            description: 'Tracks overlap for higher density. Slower writes.',
            use: 'Archive, backup, sequential access',
            warning: 'AVOID for NAS or RAID - terrible rewrite performance.',
        },
    },

    recommendation: {
        nas: 'CMR drives (WD Red Plus, Seagate IronWolf)',
        backup: 'Any large HDD is fine',
        gaming: 'SSD only - HDD too slow for modern games',
    },
};

// === RAID ===
export const RAID_KNOWLEDGE = {
    overview: {
        description: 'RAID combines multiple drives for performance or redundancy.',
        note: 'RAID is NOT a backup! It protects against drive failure, not data loss.',
    },

    levels: {
        raid0: {
            name: 'RAID 0 (Striping)',
            drives: '2+ drives',
            capacity: '100% of all drives',
            performance: '2x+ read/write speed',
            redundancy: 'NONE - any drive fails = all data lost',
            use: 'Scratch disks, temp files where speed > safety',
            risk: 'Higher failure chance (more drives = more risk)',
        },
        raid1: {
            name: 'RAID 1 (Mirroring)',
            drives: '2 drives',
            capacity: '50% (mirror copy)',
            performance: '2x read speed, 1x write speed',
            redundancy: 'Full - one drive can fail',
            use: 'OS drive with redundancy, small critical data',
        },
        raid5: {
            name: 'RAID 5 (Striping + Parity)',
            drives: '3+ drives',
            capacity: '(N-1) drives',
            performance: 'Good read, slower write',
            redundancy: 'One drive can fail',
            use: 'NAS, file servers',
            note: 'Rebuild times can be long on large drives.',
        },
        raid10: {
            name: 'RAID 10 (1+0)',
            drives: '4+ drives (pairs of mirrors, striped)',
            capacity: '50% of total',
            performance: 'Excellent read/write',
            redundancy: 'One drive per mirror can fail',
            use: 'Databases, high-performance + redundancy',
        },
    },

    software_vs_hardware: {
        software: {
            examples: ['Windows Storage Spaces', 'ZFS', 'mdadm'],
            advantages: ['Free', 'Flexible', 'No special hardware'],
            disadvantages: ['Uses CPU', 'May not have cache'],
        },
        hardware: {
            examples: ['LSI MegaRAID', 'Dell PERC'],
            advantages: ['Dedicated processor', 'Battery backup cache'],
            disadvantages: ['Expensive', 'Proprietary'],
        },
    },

    recommendation: {
        gaming: 'Don\'t need RAID - just use one fast SSD',
        nas: 'RAID 5 or RAID 6 for redundancy',
        workstation: 'RAID 1 for OS, RAID 0 scratch disk (with backups!)',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get storage recommendation
 */
export const getStorageRecommendation = ({ useCase, budget, capacity }) => {
    if (useCase === 'boot') {
        if (budget === 'high') return { type: 'Gen4 TLC with DRAM', examples: ['Samsung 990 Pro', 'WD SN850X'] };
        return { type: 'Gen4 TLC', examples: ['Crucial T500', 'WD SN770'] };
    }
    if (useCase === 'games') {
        if (capacity >= 2000) return { type: 'Gen4 QLC or TLC', examples: ['Crucial P3 Plus 2TB', 'Samsung 990 EVO'] };
        return { type: 'Gen4 TLC', examples: ['WD SN770', 'Crucial T500'] };
    }
    if (useCase === 'video_editing') {
        return { type: 'Gen4/5 TLC with DRAM', examples: ['Samsung 990 Pro', 'Crucial T700'] };
    }
    if (useCase === 'nas') {
        return { type: 'CMR HDD', examples: ['WD Red Plus', 'Seagate IronWolf'] };
    }
    return { type: 'Gen4 TLC', examples: ['Any major brand 1TB'] };
};

/**
 * Explain storage term
 */
export const explainStorageTerm = (term) => {
    const terms = {
        nvme: NVME_GENERATIONS.overview,
        gen4: NVME_GENERATIONS.generations.gen4,
        gen5: NVME_GENERATIONS.generations.gen5,
        tlc: NAND_TYPES.types.tlc,
        qlc: NAND_TYPES.types.qlc,
        slc: NAND_TYPES.types.slc,
        dram: DRAM_CACHE.types.withDRAM,
        dramless: DRAM_CACHE.types.dramless,
        hmb: DRAM_CACHE.types.hmb,
        tbw: SSD_ENDURANCE.tbw,
        dwpd: SSD_ENDURANCE.dwpd,
        cmr: HDD_KNOWLEDGE.technology.cmr,
        smr: HDD_KNOWLEDGE.technology.smr,
        raid0: RAID_KNOWLEDGE.levels.raid0,
        raid1: RAID_KNOWLEDGE.levels.raid1,
        raid5: RAID_KNOWLEDGE.levels.raid5,
    };
    return terms[term?.toLowerCase()] || null;
};

/**
 * Compare SSDs
 */
export const compareSSD = (ssd1, ssd2) => {
    return {
        recommendation: 'Compare sequential read/write, TBW, price per GB, controller, DRAM',
        factors: ['Real-world difference is minimal for gaming', 'TLC > QLC for writes', 'DRAM preferred for boot drive'],
    };
};

export default {
    NVME_GENERATIONS,
    SSD_CONTROLLERS,
    NAND_TYPES,
    DRAM_CACHE,
    SSD_ENDURANCE,
    HDD_KNOWLEDGE,
    RAID_KNOWLEDGE,
    getStorageRecommendation,
    explainStorageTerm,
    compareSSD,
};
