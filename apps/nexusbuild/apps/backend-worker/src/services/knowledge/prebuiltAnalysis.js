/**
 * 📦 KNOWLEDGE: Prebuilt PC Analysis
 *
 * Logic to detect scams, "e-waste" masquerading as gaming PCs,
 * and red flags in prebuilt listings.
 */

export const PREBUILT_KNOWLEDGE = {
    // === RED FLAGS ===
    redFlags: [
        {
            term: 'i7 PC',
            check: 'Always check generation! An "i7" could be 12 years old (i7-2600). If it doesn\'t say the generation (e.g., i7-13700F), run away.',
            severity: 'Critical'
        },
        {
            term: 'GT 710 / GT 730 / GT 1030 (DDR4)',
            check: 'These are NOT gaming cards. They are display adapters. You cannot play modern games on them.',
            severity: 'Critical'
        },
        {
            term: '8GB RAM',
            check: 'In 2024, 16GB is the minimum. 8GB single channel cuts performance by 20-30%.',
            severity: 'Warning'
        },
        {
            term: 'HDD only',
            check: 'If it has no SSD, it will feel incredibly slow. Avoid.',
            severity: 'Crucial'
        },
        {
            term: 'Proprietary Motherboard/PSU',
            check: 'Dell/Alienware/HP often use custom parts that prevent future upgrades.',
            severity: 'Warning'
        }
    ],

    // === TIER LIST (Brands) ===
    brandTiers: {
        'S Tier (Premium/Custom)': {
            brands: ['Maingear', 'Starforge', 'Corsair', 'Build Redux'],
            verdict: 'Expensive but high quality. Standard parts (fully upgradable).'
        },
        'A Tier (Solid Retail)': {
            brands: ['CyberPowerPC', 'iBuyPower', 'Skytech', 'ABS (Newegg)'],
            verdict: 'Hit or miss on cable management, but usually standard parts. Good value on sales.'
        },
        'B Tier (System Integrators)': {
            brands: ['NZXT', 'Lenovo Legion', 'HP Omen (some)', 'ASUS ROG'],
            verdict: 'Decent, but watch out for bloatware and proprietary software.'
        },
        'F Tier (Avoid if possible)': {
            brands: ['Dell (non-Alienware)', 'HP Pavilion', 'Amazon "Renewal" Scams', 'AlibabaSpecials'],
            verdict: 'Proprietary e-waste. Poor airflow. Impossible to upgrade.'
        }
    },

    // === "SCAM" DETECTION Logic ===
    detectScam: (specString) => {
        const lower = specString.toLowerCase();
        const warnings = [];

        // Check for old CPUs disguised as "High End"
        if (lower.includes('i7') && !lower.match(/i7-\d{4,5}/)) {
            warnings.push('⚠️ Mentions "i7" without generation. Likely an ancient CPU.');
        }

        // Check for e-waste GPUs
        if (/gt 710|gt 730|gt 610|gtx 1050 2gb/i.test(lower)) {
            warnings.push('❌ Contains e-waste GPU (GT 710/730/etc). Cannot play modern games.');
        }

        // Check for "Generic PSU"
        if (!lower.includes('gold') && !lower.includes('bronze') && !lower.includes('corsair') && !lower.includes('evga')) {
            warnings.push('⚠️ PSU brand undefined. Likely a "bomb" tier unit. replace immediately.');
        }

        return warnings;
    }
};

export default PREBUILT_KNOWLEDGE;
