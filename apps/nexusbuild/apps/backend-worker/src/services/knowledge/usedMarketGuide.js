/**
 * 🛒 NEXUS AI - Used/Refurbished Market Guide
 *
 * Expert knowledge on buying used PC parts:
 * - What to buy used vs new
 * - Pricing guides
 * - What to check/test
 * - Red flags and scams
 * - Platform recommendations
 * - Warranty and returns
 * - Mining cards
 */

// === WHAT TO BUY USED VS NEW ===
export const USED_VS_NEW = {
    safeUsed: {
        description: 'Components that are generally safe to buy used',
        items: {
            gpu: {
                name: 'Graphics Card',
                safety: 'Good if tested',
                why: 'Easy to test, significant savings',
                check: ['Artifacts test', 'Temperature test', 'Benchmark comparison'],
                savings: '30-50% off new',
            },
            cpu: {
                name: 'CPU',
                safety: 'Very safe',
                why: 'CPUs rarely fail. Either works or doesn\'t.',
                check: ['Visual inspection for bent pins', 'Verify model in BIOS'],
                savings: '20-40% off new',
            },
            ram: {
                name: 'RAM',
                safety: 'Very safe',
                why: 'No moving parts, either works or doesn\'t',
                check: ['MemTest86 or Windows Memory Diagnostic'],
                savings: '30-50% off new',
            },
            case: {
                name: 'PC Case',
                safety: 'Very safe',
                why: 'Just metal/plastic/glass',
                check: ['Physical damage', 'Missing parts', 'Dust'],
                savings: '40-60% off new',
            },
            monitor: {
                name: 'Monitor',
                safety: 'Good if inspected',
                why: 'Easy to check for defects',
                check: ['Dead pixels', 'Backlight bleed', 'Panel uniformity'],
                savings: '30-50% off new',
            },
            peripherals: {
                name: 'Keyboard/Mouse',
                safety: 'Safe',
                why: 'Easy to test, low risk',
                check: ['All keys/buttons work', 'No double-clicking'],
                savings: '40-60% off new',
            },
        },
    },

    cautionUsed: {
        description: 'Buy used with caution and proper testing',
        items: {
            motherboard: {
                name: 'Motherboard',
                safety: 'Moderate risk',
                why: 'Many failure points, harder to test fully',
                check: ['All ports work', 'BIOS boots', 'No bent socket pins'],
                risk: 'Dead slots, flaky behavior, hidden damage',
            },
            storage_hdd: {
                name: 'Hard Drive',
                safety: 'Risky',
                why: 'Mechanical wear, unknown history',
                check: ['CrystalDiskInfo SMART status', 'Reallocated sectors'],
                advice: 'Only if very cheap, not for important data',
            },
            cooler: {
                name: 'CPU Cooler',
                safety: 'Moderate',
                why: 'May have missing mounting hardware',
                check: ['All brackets included', 'Fan works'],
                savings: '30-50% off new',
            },
        },
    },

    avoidUsed: {
        description: 'Components to buy new only',
        items: {
            psu: {
                name: 'Power Supply',
                reason: 'Unknown quality, can damage other components',
                risk: 'Capacitor degradation, potential fires',
                exception: 'Lightly used high-end units from trusted seller',
            },
            storage_ssd: {
                name: 'SSD',
                reason: 'Unknown write cycles, hidden wear',
                risk: 'Data loss, sudden failure',
                exception: 'If seller shows CrystalDiskInfo with low TBW used',
            },
            aio: {
                name: 'AIO Cooler',
                reason: 'Pump failure, permeation, unknown age',
                risk: 'Leaks, pump dying within months',
                exception: 'Very recent models with proof of purchase',
            },
        },
    },
};

// === PRICING GUIDE ===
export const PRICING_GUIDE = {
    methodology: {
        howToPrice: [
            'Check eBay sold listings (not active listings)',
            'Check r/hardwareswap recent sales',
            'Account for age and condition',
            'Compare to new price (should be significant discount)',
        ],
    },

    typicalDiscounts: {
        '1_year_old': '20-30% off original MSRP',
        '2_years_old': '35-50% off original MSRP',
        '3_years_old': '50-65% off original MSRP',
        'previous_gen': 'Often 40-60% off when new gen launches',
    },

    gpu_pricing_2024: {
        note: 'Prices fluctuate. Check eBay sold listings for current.',
        examples: {
            'RTX 4090': { new: '$1600-1800', used: '$1200-1400' },
            'RTX 4080 Super': { new: '$1000', used: '$750-850' },
            'RTX 4070 Super': { new: '$600', used: '$450-500' },
            'RTX 3080': { new: 'Discontinued', used: '$350-450' },
            'RTX 3070': { new: 'Discontinued', used: '$250-300' },
            'RX 7900 XTX': { new: '$900', used: '$650-750' },
            'RX 6800 XT': { new: 'Discontinued', used: '$300-350' },
        },
    },

    redFlags: {
        tooGood: 'Price way below market = likely scam or defective',
        newInBox: '"Sealed" units often resealed returns or fakes',
        rush: 'Seller pressuring quick decision',
    },
};

// === WHAT TO CHECK/TEST ===
export const TESTING_GUIDE = {
    gpu: {
        visual: [
            'Physical damage (bent fins, broken fans)',
            'Thermal pad condition (check through heatsink gaps)',
            'PCB damage or burn marks',
            'Clean (not caked in dust/debris)',
        ],
        testing: [
            'Benchmark (3DMark) - compare to expected scores',
            'Artifact test (Furmark) - should be artifact-free',
            'Temperature test - shouldn\'t thermal throttle',
            'Test all display ports',
            'Memory test (OCCT VRAM test)',
        ],
        toolsNeeded: ['3DMark (free demo)', 'GPU-Z', 'HWiNFO64', 'Furmark'],
    },

    cpu: {
        visual: [
            'No bent pins (AMD) or socket damage (Intel)',
            'Clean IHS (integrated heat spreader)',
            'No corrosion or damage',
        ],
        testing: [
            'POST and enter BIOS - verify model',
            'Cinebench R23 - compare to expected score',
            'Temperature monitoring',
        ],
    },

    ram: {
        visual: ['No physical damage', 'All chips present', 'Clean contacts'],
        testing: [
            'Boots and recognized in BIOS',
            'XMP/EXPO works',
            'MemTest86 - full pass (no errors)',
            'Windows Memory Diagnostic',
        ],
    },

    motherboard: {
        visual: [
            'No bent socket pins',
            'No swollen/leaking capacitors',
            'No burn marks or corrosion',
            'All slots intact',
        ],
        testing: [
            'POST with known-good CPU/RAM',
            'All RAM slots work',
            'All M.2 slots work',
            'All USB ports work',
            'Audio works',
        ],
    },

    monitor: {
        visual: [
            'Panel scratches or cracks',
            'Bezels intact',
            'Stand included/working',
        ],
        testing: [
            'Dead pixel test (full-color screens)',
            'Backlight bleed test (dark image)',
            'IPS glow check (dark corners)',
            'All inputs work',
            'OSD menu functional',
        ],
        tools: ['Dead pixel test websites', 'YouTube 4K test videos'],
    },

    storage: {
        testing: [
            'CrystalDiskInfo - SMART status',
            'Check power-on hours',
            'Check reallocated sectors (should be 0)',
            'Check TBW used (for SSDs)',
        ],
        avoid: ['Any reallocated sectors on HDD', 'High TBW percentage used on SSD'],
    },
};

// === RED FLAGS AND SCAMS ===
export const SCAMS_AND_REDFLAGS = {
    commonScams: {
        fakeBios: {
            scam: 'Flashed BIOS to show different GPU model',
            example: 'GT 1030 flashed to show as RTX 3080',
            prevention: 'Test with games/benchmarks, not just GPU-Z initially',
        },
        minedCard: {
            concern: 'GPU used for cryptocurrency mining',
            reality: 'Not always bad - steady temps often better than gaming',
            check: 'Ask, check VRAM temps, look for thermal pad residue',
            risk: 'Thrermal paste/pads may be degraded',
        },
        relisted: {
            scam: 'Selling defective item returned from another buyer',
            prevention: 'Check seller history, test thoroughly',
        },
        photoScam: {
            scam: 'Photos don\'t match actual item',
            prevention: 'Request photos with username and date written on paper',
        },
        paymentScam: {
            scam: 'Request payment outside platform (Venmo, Zelle)',
            prevention: 'ALWAYS use platform payment protection',
        },
    },

    sellerRedFlags: [
        'New account with no history',
        'Price significantly below market',
        'Won\'t show item working',
        'Rushes transaction',
        'No original box (for GPUs especially)',
        'Vague description',
        'Won\'t meet in public or ship with tracking',
    ],

    itemRedFlags: [
        'No warranty sticker (may be opened/repaired)',
        'Signs of liquid damage',
        'Missing accessories without price reduction',
        'Seller doesn\'t know basic specs',
        'Serial number scratched off',
    ],
};

// === MINING CARDS ===
export const MINING_CARDS = {
    reality: {
        myth: 'Mining kills GPUs',
        truth: 'Mining at steady temps can be less wear than gaming thermals',
        concern: 'VRAM was often pushed hard - check memory temps',
    },

    considerations: {
        positive: [
            'Often run at lower temps than gaming',
            'Steady workload (no thermal cycling)',
            'May still have warranty',
        ],
        negative: [
            'High hours of operation',
            'VRAM thermal pads may be degraded',
            'Fans may be worn',
            'Unknown if overvolted/overclocked',
        ],
    },

    lhrCards: {
        description: 'LHR (Lite Hash Rate) cards were less desirable for mining',
        benefit: 'May be less used for mining',
        examples: ['RTX 3060 Ti LHR', 'RTX 3070 LHR', 'RTX 3080 LHR'],
    },

    checking: {
        thermal_pads: 'Check VRAM temps - should be under 90°C under load',
        fans: 'Check for bearing noise or wobble',
        artifacts: 'Memory artifacts may indicate dying VRAM',
        hours: 'Some GPUs track power-on hours in BIOS',
    },

    recommendation: 'Mining cards can be good deals if properly tested and priced 10-20% below equivalent non-mining cards',
};

// === PLATFORMS ===
export const BUYING_PLATFORMS = {
    online: {
        ebay: {
            name: 'eBay',
            pros: ['Buyer protection', 'Large selection', 'Price history via sold listings'],
            cons: ['Fees raise prices', 'Scams exist', 'Returns can be hassle'],
            protection: 'eBay Money Back Guarantee (30 days)',
            tips: ['Check seller feedback', 'Avoid $0 feedback sellers', 'Use eBay payment only'],
        },
        hardwareswap: {
            name: 'r/hardwareswap (Reddit)',
            pros: ['Good prices', 'Community self-policing', 'Enthusiast sellers'],
            cons: ['Less protection', 'Requires PayPal G&S'],
            protection: 'PayPal Goods & Services only',
            tips: ['Check confirmed trades', 'Always use PayPal G&S', 'Comment before PM'],
        },
        facebookMarketplace: {
            name: 'Facebook Marketplace',
            pros: ['Local deals', 'Can inspect in person', 'Negotiate easily'],
            cons: ['Scams common', 'No payment protection for shipping'],
            protection: 'Limited - local cash is safest',
            tips: ['Meet in public', 'Test before paying', 'Bring a friend'],
        },
        offerup: {
            name: 'OfferUp',
            pros: ['Local focus', 'In-app messaging'],
            cons: ['More scams than FB Marketplace'],
            protection: 'Limited',
        },
    },

    local: {
        advantages: [
            'Can test before buying',
            'No shipping risk',
            'Can negotiate in person',
            'No platform fees',
        ],
        safety: [
            'Meet in public place (police station parking lots)',
            'Bring someone with you',
            'Pay after testing',
            'Cash or platform payment (no personal Venmo)',
        ],
    },

    refurbished: {
        amazon_renewed: {
            name: 'Amazon Renewed',
            quality: 'Variable - depends on seller',
            protection: '90-day return policy minimum',
            tip: 'Check if "Renewed Premium" for longer warranty',
        },
        manufacturer: {
            name: 'Manufacturer Refurbished',
            quality: 'Best refurbished option',
            examples: ['EVGA B-Stock', 'Dell Outlet', 'Apple Refurbished'],
            protection: 'Usually 1-year warranty',
        },
        certified: {
            name: 'Certified Pre-Owned',
            quality: 'Usually tested and cleaned',
            availability: 'Some retailers offer this',
        },
    },
};

// === WARRANTY CONSIDERATIONS ===
export const WARRANTY_USED = {
    transferable: {
        description: 'Some warranties transfer to new owner',
        examples: {
            evga: 'EVGA warranties are fully transferable (by serial)',
            msi: 'MSI warranties transfer with proof of purchase',
            corsair: 'Corsair requires original receipt',
            nvidia: 'Founder\'s Edition tied to original buyer',
        },
    },

    verification: {
        nvidia: 'Check warranty via serial on NVIDIA site',
        evga: 'Check at evga.com/warranty',
        general: 'Ask seller for original receipt if possible',
    },

    expired: {
        consideration: 'No warranty = more risk, price should reflect',
        discount: 'Expect extra 10-15% off for expired warranty',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Is this component safe to buy used?
 */
export const isSafeUsed = (component) => {
    const safe = ['gpu', 'cpu', 'ram', 'case', 'monitor', 'peripherals'];
    const caution = ['motherboard', 'hdd', 'cooler'];
    const avoid = ['psu', 'ssd', 'aio'];

    const lower = component.toLowerCase();
    if (safe.some(s => lower.includes(s))) return { safe: true, level: 'Safe', advice: 'Good to buy used' };
    if (caution.some(c => lower.includes(c))) return { safe: 'partial', level: 'Caution', advice: 'Test thoroughly' };
    if (avoid.some(a => lower.includes(a))) return { safe: false, level: 'Avoid', advice: 'Buy new' };
    return { safe: 'unknown', level: 'Unknown', advice: 'Research further' };
};

/**
 * Get fair price estimate
 */
export const estimateFairPrice = (component, ageYears, condition) => {
    let discount = 0;
    if (ageYears <= 1) discount = 0.25;
    else if (ageYears <= 2) discount = 0.40;
    else if (ageYears <= 3) discount = 0.55;
    else discount = 0.65;

    if (condition === 'excellent') discount -= 0.05;
    if (condition === 'fair') discount += 0.10;

    return {
        discountPercent: Math.round(discount * 100),
        advice: `Should be ~${Math.round(discount * 100)}% off original MSRP`,
    };
};

/**
 * Get testing checklist for component
 */
export const getTestingChecklist = (component) => {
    return TESTING_GUIDE[component.toLowerCase()] || {
        testing: ['Research specific testing methods for this component'],
    };
};

export default {
    USED_VS_NEW,
    PRICING_GUIDE,
    TESTING_GUIDE,
    SCAMS_AND_REDFLAGS,
    MINING_CARDS,
    BUYING_PLATFORMS,
    WARRANTY_USED,
    isSafeUsed,
    estimateFairPrice,
    getTestingChecklist,
};
