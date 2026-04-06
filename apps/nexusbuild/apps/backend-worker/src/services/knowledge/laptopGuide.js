/**
 * 💻 KNOWLEDGE: Laptop Buying Guide
 *
 * Laptops are complex. TDP limits matter more than model names.
 */

export const LAPTOP_KNOWLEDGE = {
    // === TGP / TDP TRAP ===
    tgpExplained: {
        title: 'The TGP Trap (Total Graphics Power)',
        explanation: 'Not all laptop GPUs are equal! An RTX 4060 can run at 45W or 140W.',
        examples: [
            'RTX 4060 (45W) = Slower than RTX 3060',
            'RTX 4060 (140W) = Desktop performance equivalent',
            'Max-Q designs are thinner but slower.'
        ],
        advice: 'ALWAYS check the wattage (TGP) in the specs before buying.'
    },

    // === CPU SUFFIXES ===
    cpuSuffixes: {
        'Intel': {
            'HX': 'Desktop replacement. Fastest, hot, bad battery.',
            'H': 'High performance. Standard gaming laptop CPU.',
            'P': 'Balanced. Thin gaming laptops.',
            'U': 'Ultra low power. Office laps only (No gaming).'
        },
        'AMD': {
            'HX': 'Dragon Range. Extreme performance.',
            'HS': 'Efficiency kings. Great battery life + gaming.',
            'U': 'Ultrabooks. Light gaming only.'
        }
    },

    // === SCREEN SPECS ===
    displays: {
        recommendations: [
            '**Brightness:** Aim for 400-500 nits. 250 nits is too dim.',
            '**Aspect Ratio:** 16:10 (1600p) is better for productivity than 16:9.',
            '**Color:** 100% sRGB is minimum. 100% DCI-P3 for content creation.'
        ]
    },

    // === RECOMMENDATIONS by Category ===
    recommendations: {
        'Thin & Light Gaming': {
            topPicks: ['ASUS ROG Zephyrus G14 (AMD options)', 'Razer Blade 14'],
            why: 'Incredible build quality, portability, and decent power.'
        },
        'Best Value': {
            topPicks: ['Lenovo Legion 5 / Slim 5', 'ASUS TUF A15/A16'],
            why: 'Full wattage GPUs, solid cooling, fair prices.'
        },
        'Desktop Replacement': {
            topPicks: ['MSI Raider GE78', 'Lenovo Legion 9i', 'ASUS SCAR 16/18'],
            why: 'Max performance, 175W GPUs, Mini-LED screens.'
        }
    }
};

export default LAPTOP_KNOWLEDGE;
