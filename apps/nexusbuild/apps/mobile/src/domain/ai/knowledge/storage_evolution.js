/**
 * 💿 Storage Evolution Database
 * HDD, SATA SSD, and NVMe history
 */

export const STORAGE_EVOLUTION = {
    // ========== HDD Era (1980s-Present) ==========
    hdd: {
        description: 'Mechanical spinning disks, still used for bulk storage',

        spindle_speeds: {
            5400: { use: 'NAS, laptops', noise: 'Quieter', speed: 'Slow' },
            7200: { use: 'Desktop', noise: 'Moderate', speed: 'Standard' },
            10000: { use: 'Enterprise, gaming', noise: 'Loud', speed: 'Fast' },
            15000: { use: 'Enterprise', noise: 'Very loud', speed: 'Fastest HDD' },
        },

        capacities_by_era: {
            '2000': ['20GB', '40GB', '80GB', '120GB'],
            '2005': ['160GB', '250GB', '320GB', '500GB'],
            '2010': ['1TB', '1.5TB', '2TB', '3TB'],
            '2015': ['4TB', '5TB', '6TB', '8TB'],
            '2020': ['10TB', '12TB', '14TB', '16TB', '18TB', '20TB'],
        },

        interfaces: {
            IDE: { years: '1986-2008', speed: '133 MB/s (ATA-133)' },
            SATA: { years: '2003-present', speed: '600 MB/s (SATA III)' },
            SAS: { years: '2004-present', speed: '2.4 GB/s (SAS-4)', use: 'Enterprise' },
        },

        technologies: {
            PMR: { name: 'Perpendicular Magnetic Recording', years: '2005+', standard: true },
            SMR: { name: 'Shingled Magnetic Recording', years: '2013+', cheap: true, avoid: true },
            CMR: { name: 'Conventional Magnetic Recording', years: 'Always', preferred: true },
            HAMR: { name: 'Heat-Assisted Magnetic Recording', years: '2020+', nextGen: true },
        },

        popular_models: {
            '2010s': ['WD Black', 'Seagate Barracuda', 'Hitachi Deskstar'],
            '2020s': ['WD Red Plus (NAS)', 'Seagate IronWolf', 'WD Black'],
        },
    },

    // ========== SATA SSD Era (2008-Present) ==========
    sata_ssd: {
        description: 'First mainstream SSDs, SATA interface limit of 550 MB/s',

        evolution: {
            '2008-2010': {
                speed: '200-250 MB/s',
                capacity: '32GB-128GB',
                price: '$5+/GB',
                examples: ['Intel X25-M', 'OCZ Vertex'],
            },
            '2010-2013': {
                speed: '400-550 MB/s',
                capacity: '64GB-512GB',
                price: '$1-2/GB',
                examples: ['Samsung 840 Pro', 'Intel 520', 'Crucial M4'],
            },
            '2013-2016': {
                speed: '550 MB/s (SATA limit)',
                capacity: '120GB-2TB',
                price: '$0.50-1/GB',
                examples: ['Samsung 850 Pro', 'Samsung 850 EVO', 'Crucial MX100'],
            },
            '2016-2020': {
                speed: '550 MB/s',
                capacity: '250GB-4TB',
                price: '$0.10-0.20/GB',
                examples: ['Samsung 860 EVO', 'Crucial MX500', 'WD Blue'],
            },
            '2020-present': {
                speed: '550 MB/s',
                capacity: '250GB-8TB',
                price: '$0.05-0.10/GB',
                examples: ['Samsung 870 EVO', 'Crucial MX500', 'WD Blue 3D'],
                note: 'Mature tech, NVMe preferred for new builds',
            },
        },

        form_factors: {
            '2.5"': { compatibility: 'Universal', cable: true },
            'mSATA': { era: '2010-2015', laptops: true, obsolete: true },
        },
    },

    // ========== NVMe SSD Era (2013-Present) ==========
    nvme: {
        description: 'Direct PCIe connection, massive speed improvements',

        generations: {
            'PCIe 3.0 NVMe': {
                years: '2013-2019',
                speed: '3500 MB/s max',
                examples: ['Samsung 970 EVO', 'WD Black SN750', 'Intel 660p', 'ADATA XPG SX8200'],
            },
            'PCIe 4.0 NVMe': {
                years: '2019-2023',
                speed: '7000 MB/s max',
                examples: ['Samsung 980 Pro', 'WD Black SN850X', 'Sabrent Rocket 4 Plus', 'Crucial T500'],
            },
            'PCIe 5.0 NVMe': {
                years: '2023+',
                speed: '14000 MB/s max',
                examples: ['Crucial T705', 'Samsung 990 Pro', 'Corsair MP700', 'Gigabyte Aorus'],
                note: 'Often run hot, need heatsink',
            },
        },

        form_factors: {
            'M.2 2280': { description: '22mm wide, 80mm long', standard: true },
            'M.2 2230': { description: '22mm wide, 30mm long', use: 'SFF, Steam Deck' },
            'M.2 2242': { description: '22mm wide, 42mm long', use: 'Laptops' },
            'U.2': { description: '2.5" with NVMe', use: 'Enterprise' },
            'Add-in Card': { description: 'PCIe slot card', use: 'Older systems, enterprise' },
        },
    },

    // ========== Controller Makers ==========
    controllers: {
        tier1: {
            Samsung: { reputation: 'Premium', inHouse: true, example: 'Phoenix' },
            WD: { reputation: 'Excellent', inHouse: true, example: 'SanDisk' },
        },
        tier2: {
            Phison: { reputation: 'Great', examples: ['E18', 'E26'], used_by: ['Sabrent', 'Corsair', 'Seagate'] },
            SiliconMotion: { reputation: 'Good', examples: ['SM2262', 'SM2264'], used_by: ['ADATA', 'Crucial'] },
        },
        tier3: {
            Maxio: { reputation: 'Budget', examples: ['MAP1602'] },
            Realtek: { reputation: 'Budget', examples: ['RTS5762'] },
        },
    },

    // ========== NAND Types ==========
    nand_types: {
        SLC: {
            name: 'Single-Level Cell',
            bits: 1,
            speed: 'Fastest',
            endurance: 'Highest (100,000 P/E)',
            cost: 'Most expensive',
            use: 'Enterprise, cache',
        },
        MLC: {
            name: 'Multi-Level Cell',
            bits: 2,
            speed: 'Fast',
            endurance: 'High (10,000 P/E)',
            cost: 'Expensive',
            use: 'Enterprise, high-end consumer',
        },
        TLC: {
            name: 'Triple-Level Cell',
            bits: 3,
            speed: 'Good',
            endurance: 'Medium (3,000 P/E)',
            cost: 'Standard',
            use: 'Consumer mainstream',
        },
        QLC: {
            name: 'Quad-Level Cell',
            bits: 4,
            speed: 'Slower',
            endurance: 'Lower (1,000 P/E)',
            cost: 'Cheapest',
            use: 'Budget, archive',
        },
    },

    // ========== Popular Models by Era ==========
    popular_models: {
        '2015_sata': [
            { name: 'Samsung 850 EVO', capacity: '120GB-4TB', type: 'SATA', legendary: true },
            { name: 'Crucial MX200', capacity: '250GB-1TB', type: 'SATA' },
            { name: 'SanDisk Ultra II', capacity: '120GB-960GB', type: 'SATA' },
        ],
        '2017_nvme': [
            { name: 'Samsung 960 EVO', capacity: '250GB-1TB', type: 'NVMe Gen3' },
            { name: 'Samsung 960 Pro', capacity: '512GB-2TB', type: 'NVMe Gen3' },
            { name: 'WD Black NVMe', capacity: '250GB-1TB', type: 'NVMe Gen3' },
        ],
        '2019_nvme': [
            { name: 'Samsung 970 EVO Plus', capacity: '250GB-2TB', type: 'NVMe Gen3', legendary: true },
            { name: 'WD Black SN750', capacity: '250GB-2TB', type: 'NVMe Gen3' },
            { name: 'Sabrent Rocket', capacity: '256GB-4TB', type: 'NVMe Gen3' },
        ],
        '2021_nvme': [
            { name: 'Samsung 980 Pro', capacity: '250GB-2TB', type: 'NVMe Gen4', legendary: true },
            { name: 'WD Black SN850', capacity: '500GB-2TB', type: 'NVMe Gen4' },
            { name: 'Seagate FireCuda 530', capacity: '500GB-4TB', type: 'NVMe Gen4' },
            { name: 'Crucial P5 Plus', capacity: '500GB-2TB', type: 'NVMe Gen4' },
        ],
        '2023_nvme': [
            { name: 'Samsung 990 Pro', capacity: '1TB-4TB', type: 'NVMe Gen4', flagship: true },
            { name: 'WD Black SN850X', capacity: '1TB-4TB', type: 'NVMe Gen4' },
            { name: 'Crucial T500', capacity: '500GB-2TB', type: 'NVMe Gen4', value: true },
            { name: 'SK Hynix Platinum P41', capacity: '500GB-2TB', type: 'NVMe Gen4' },
        ],
        '2024_nvme': [
            { name: 'Crucial T705', capacity: '1TB-4TB', type: 'NVMe Gen5', flagship: true },
            { name: 'Corsair MP700 Pro', capacity: '1TB-4TB', type: 'NVMe Gen5' },
            { name: 'WD Black SN850X', capacity: '1TB-8TB', type: 'NVMe Gen4', reliable: true },
        ],
    },

    // ========== Recommendations ==========
    recommendations: {
        budget: { type: 'Gen4 NVMe', examples: ['WD Blue SN580', 'Crucial P3 Plus'] },
        gaming: { type: 'Gen4 NVMe', examples: ['WD Black SN850X', 'Samsung 990 Pro'] },
        workstation: { type: 'Gen4/5 NVMe', examples: ['Crucial T705', 'Samsung 990 Pro 4TB'] },
        nas: { type: 'HDD CMR', examples: ['WD Red Plus', 'Seagate IronWolf'] },
        archive: { type: 'HDD', examples: ['WD Gold', 'Seagate Exos'] },
    },
};

export default STORAGE_EVOLUTION;
