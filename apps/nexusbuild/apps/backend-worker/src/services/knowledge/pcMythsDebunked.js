/**
 * 🤔 NEXUS AI - PC Myths Debunked
 *
 * Common misconceptions about PC building:
 * - Hardware myths
 * - Performance myths
 * - Maintenance myths
 * - Security myths
 * - Buying myths
 */

// === HARDWARE MYTHS ===
export const HARDWARE_MYTHS = {
    moreRamBetter: {
        myth: 'More RAM is always better for gaming',
        reality: '16GB is enough for most gaming. 32GB for streaming/multitasking.',
        truth: 'Beyond 32GB provides no gaming benefit. Speed/latency matters more.',
        evidence: 'Benchmarks show 16GB vs 32GB is within margin of error in games.',
    },

    cpuCoresForGaming: {
        myth: 'You need 16+ cores for gaming',
        reality: 'Most games use 4-8 cores effectively.',
        truth: '6-8 high-performance cores is ideal. More cores help streaming/productivity.',
        evidence: 'Ryzen 7 7800X3D (8 cores) beats 16-core CPUs in most games.',
    },

    nvmeVsSata: {
        myth: 'NVMe SSD massively improves game load times over SATA SSD',
        reality: 'Difference is usually 1-3 seconds per load.',
        truth: 'Any SSD is fine for gaming. NVMe matters for large file transfers.',
        evidence: 'Game loads are mostly decompression-bound, not storage-bound.',
    },

    higherWattagePsu: {
        myth: 'Higher wattage PSU uses more electricity',
        reality: 'PSU only draws what components need. A 1000W PSU at idle draws same as 650W.',
        truth: 'Efficiency matters more than wattage for power consumption.',
    },

    thermalPasteExpires: {
        myth: 'Thermal paste needs replacing every year',
        reality: 'Quality paste lasts 3-5+ years.',
        truth: 'Only replace if temperatures increase significantly.',
        exception: 'Cheap paste may dry out faster.',
    },

    degaussing: {
        myth: 'SSDs need defragmentation',
        reality: 'SSDs don\'t benefit from defrag - it can reduce lifespan.',
        truth: 'Windows knows this and runs TRIM instead.',
        action: 'Never defrag an SSD. TRIM is automatic.',
    },

    staticDanger: {
        myth: 'You\'ll destroy components by touching them without a wrist strap',
        reality: 'Static damage is possible but rare with basic precautions.',
        truth: 'Touch case/PSU before handling parts. Don\'t build on carpet.',
        evidence: 'Millions of people build PCs without wrist straps.',
    },

    airVsWater: {
        myth: 'Water cooling is always better than air cooling',
        reality: 'Top air coolers match 240-280mm AIOs.',
        truth: 'AIOs are about aesthetics and convenience, not always performance.',
        evidence: 'Noctua NH-D15 matches many 280mm AIOs.',
        exception: '360mm+ AIOs do outperform air coolers.',
    },

    pcieGen: {
        myth: 'You need PCIe 5.0 GPU slot for best performance',
        reality: 'Even RTX 4090 doesn\'t saturate PCIe 4.0 x16.',
        truth: 'PCIe 3.0 x16 is still fine for all current GPUs.',
        evidence: 'Benchmarks show <2% difference between PCIe 3.0 and 4.0 for GPUs.',
    },

    ramSlotsDontMatter: {
        myth: 'Any RAM slots work for dual channel',
        reality: 'Wrong slots = single channel = 10-20% performance loss.',
        truth: 'Use slots 2 & 4 (A2/B2) for dual channel on most boards.',
    },

    xmpDangerous: {
        myth: 'Enabling XMP is dangerous overclocking',
        reality: 'XMP is tested and validated by RAM manufacturer.',
        truth: 'It\'s the intended speed of your RAM. Without it, RAM runs at base JEDEC.',
        action: 'Always enable XMP/EXPO.',
    },
};

// === PERFORMANCE MYTHS ===
export const PERFORMANCE_MYTHS = {
    killProcesses: {
        myth: 'Killing background processes gives huge FPS gains',
        reality: 'Modern Windows manages resources well. Idle processes use minimal resources.',
        truth: 'Only close apps actively using CPU/GPU.',
        exception: 'Badly coded apps or malware can cause issues.',
    },

    registryCleaners: {
        myth: 'Registry cleaners speed up Windows',
        reality: 'Registry size doesn\'t affect performance. Cleaning can break things.',
        truth: 'Microsoft officially recommends against registry cleaners.',
        action: 'Don\'t use CCleaner registry cleaner.',
    },

    ramBoosters: {
        myth: 'RAM boosters/optimizers improve performance',
        reality: 'They just force Windows to page out cache, making things slower.',
        truth: 'Used RAM is good - it\'s caching frequently accessed data.',
        action: 'Never install RAM optimizers.',
    },

    fullHdDisappearing: {
        myth: '1080p gaming is dead',
        reality: '1080p is still the most used resolution (Steam Hardware Survey).',
        truth: 'For esports and high refresh, 1080p is still popular and valid.',
    },

    aiUpscalingCheating: {
        myth: 'DLSS/FSR is cheating and looks bad',
        reality: 'DLSS Quality often looks better than native due to AI enhancement.',
        truth: 'Upscaling is the smart way to get more FPS with minimal quality loss.',
        evidence: 'DLSS often has better anti-aliasing than native TAA.',
    },

    windowsDefenderSlow: {
        myth: 'Windows Defender kills gaming performance',
        reality: 'Modern Defender has minimal impact and auto-excludes games.',
        truth: 'Defender is one of the lightest antivirus options.',
        action: 'Defender is sufficient for most users. No need for third-party AV.',
    },

    deleteSystem32: {
        myth: 'Various "performance tweaks" involving system files',
        reality: 'NEVER delete system files. It will break Windows.',
        truth: 'If a "tip" sounds too good to be true, it probably is.',
    },

    windowsCrap: {
        myth: 'Windows is bloated garbage compared to Linux for gaming',
        reality: 'Windows has best game compatibility and driver support.',
        truth: 'Modern Windows is well-optimized. Linux gaming improved but still has limitations.',
    },

    overclockingRequired: {
        myth: 'You must overclock for good performance',
        reality: 'Modern CPUs/GPUs boost effectively out of the box.',
        truth: 'Stock performance is excellent. OC provides 5-10% gains with added heat/risk.',
    },

    higherHzIsBetter: {
        myth: '360Hz is twice as good as 180Hz',
        reality: 'Diminishing returns above 144Hz.',
        truth: '60→144Hz: massive. 144→240Hz: noticeable. 240→360Hz: subtle.',
        exception: 'Pro esports players may benefit from highest refresh.',
    },
};

// === MAINTENANCE MYTHS ===
export const MAINTENANCE_MYTHS = {
    weeklyReinstalls: {
        myth: 'Windows needs reinstalling every X months',
        reality: 'Clean Windows install can last years.',
        truth: 'Only reinstall for major issues or upgrades.',
    },

    pcAlwaysOn: {
        myth: 'Leaving PC on 24/7 is bad for components',
        reality: 'Modern components handle continuous use fine.',
        truth: 'Sleep mode is fine. Full shutdown not required.',
        exception: 'Power cycling every few days is healthy for some components.',
    },

    dustWeekly: {
        myth: 'Dust PCs weekly',
        reality: 'Every 3-6 months is usually enough.',
        truth: 'Depends on environment. Use filters on case.',
    },

    deleteTemp: {
        myth: 'Delete temp files weekly for performance',
        reality: 'Temp files don\'t affect performance.',
        truth: 'Use Storage Sense for automatic cleanup.',
    },

    compressedAir: {
        myth: 'Any compressed air is safe for PCs',
        reality: 'Some can spray liquid propellant.',
        truth: 'Keep can upright. Consider electric duster.',
    },

    biosUpdates: {
        myth: 'Always update BIOS immediately',
        reality: 'If it ain\'t broke, don\'t fix it.',
        truth: 'Only update for new CPU support, security, or fixing issues.',
        exception: 'New platforms often benefit from early BIOS updates.',
    },

    antivirusBetter: {
        myth: 'Third-party antivirus is better than Windows Defender',
        reality: 'Defender performs comparably in independent tests.',
        truth: 'Many third-party AVs are bloated with unnecessary features.',
        recommendation: 'Defender + common sense is enough for most users.',
    },

    defragSsd: {
        myth: 'Defragment SSDs for better performance',
        reality: 'Defrag harms SSDs and provides no benefit.',
        truth: 'SSDs have no moving parts - fragmentation irrelevant.',
        action: 'Windows automatically runs TRIM, not defrag, on SSDs.',
    },
};

// === BUYING MYTHS ===
export const BUYING_MYTHS = {
    latestAlwaysBest: {
        myth: 'Always buy the latest generation',
        reality: 'Previous gen often has better value.',
        truth: 'RTX 4070 at launch < RTX 3070 Ti on sale for some buyers.',
        advice: 'Compare price/performance, not just generation.',
    },

    prebuiltAlwaysBad: {
        myth: 'Prebuilts are always worse value than custom',
        reality: 'Some prebuilt deals beat individual parts (especially during sales).',
        truth: 'Check component quality (PSU, motherboard, RAM).',
    },

    brandMatters: {
        myth: 'X brand GPUs are better than Y brand',
        reality: 'Same chip, different cooler. Performance within 5%.',
        truth: 'Buy based on price, warranty, and cooling solution.',
        exception: 'Some AIB partners have better customer service.',
    },

    futureProof: {
        myth: 'Future-proofing is always worth it',
        reality: 'Technology changes fast. Mid-range now often beats last-gen flagship.',
        truth: 'Buy for current needs + 2 years. Upgrade when needed.',
        example: 'RTX 4070 vs waiting for 5060 - depends on current needs.',
    },

    cheapPsuFine: {
        myth: 'Any PSU works as long as wattage matches',
        reality: 'Cheap PSUs can damage components or catch fire.',
        truth: 'PSU is the worst place to cheap out.',
        advice: 'Tier A/B PSU from reputable brand.',
    },

    needsExpensivePaste: {
        myth: 'You need $20 thermal paste',
        reality: 'Most pastes perform within 2-3°C of each other.',
        truth: 'Stock paste or Arctic MX-4/Noctua NT-H1 is fine.',
        exception: 'Liquid metal for enthusiast cooling (with risks).',
    },

    windowsLicenses: {
        myth: 'You need expensive Windows license',
        reality: 'Unactivated Windows works fully for gaming.',
        truth: 'Watermark is only cosmetic. Personalization is locked.',
        legal: 'Cheap keys are gray market - use at own risk.',
    },

    rgbSlowsDown: {
        myth: 'RGB affects performance',
        reality: 'RGB is just LEDs. Zero performance impact.',
        truth: 'RGB software *could* use minor resources but negligible.',
    },
};

// === SECURITY MYTHS ===
export const SECURITY_MYTHS = {
    moreAntivirusBetter: {
        myth: 'Running multiple antivirus gives more protection',
        reality: 'They conflict with each other, causing slowdowns and issues.',
        truth: 'One good antivirus is enough. Defender works fine.',
    },

    macsDontGetViruses: {
        myth: 'Macs don\'t get malware',
        reality: 'Macs get malware too. Just less common due to market share.',
        truth: 'Still practice safe browsing on any platform.',
    },

    vpnAnonymous: {
        myth: 'VPN makes you completely anonymous',
        reality: 'VPN hides your IP but has other fingerprinting.',
        truth: 'VPN good for privacy, not anonymity.',
    },

    incognitoPrivate: {
        myth: 'Incognito mode makes you private',
        reality: 'Only hides history from that device.',
        truth: 'ISP, websites, and cookies (during session) still work.',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Debunk a specific myth
 */
export const debunkMyth = (topic) => {
    const allMyths = {
        ...HARDWARE_MYTHS,
        ...PERFORMANCE_MYTHS,
        ...MAINTENANCE_MYTHS,
        ...BUYING_MYTHS,
        ...SECURITY_MYTHS,
    };

    // Search for matching myth
    for (const [key, myth] of Object.entries(allMyths)) {
        if (key.toLowerCase().includes(topic.toLowerCase())) {
            return myth;
        }
    }
    return null;
};

/**
 * Get random myth for education
 */
export const getRandomMyth = () => {
    const allMyths = { ...HARDWARE_MYTHS, ...PERFORMANCE_MYTHS, ...BUYING_MYTHS };
    const keys = Object.keys(allMyths);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { key: randomKey, ...allMyths[randomKey] };
};

/**
 * Check if statement is a known myth
 */
export const isThisAMyth = (statement) => {
    const lower = statement.toLowerCase();

    if (lower.includes('more ram') && lower.includes('better')) return HARDWARE_MYTHS.moreRamBetter;
    if (lower.includes('registry') && lower.includes('clean')) return PERFORMANCE_MYTHS.registryCleaners;
    if (lower.includes('defrag') && lower.includes('ssd')) return MAINTENANCE_MYTHS.defragSsd;
    if (lower.includes('nvme') && lower.includes('game')) return HARDWARE_MYTHS.nvmeVsSata;
    if (lower.includes('rgb') && lower.includes('slow')) return BUYING_MYTHS.rgbSlowsDown;
    if (lower.includes('antivirus') && lower.includes('multiple')) return SECURITY_MYTHS.moreAntivirusBetter;

    return null;
};

export default {
    HARDWARE_MYTHS,
    PERFORMANCE_MYTHS,
    MAINTENANCE_MYTHS,
    BUYING_MYTHS,
    SECURITY_MYTHS,
    debunkMyth,
    getRandomMyth,
    isThisAMyth,
};
