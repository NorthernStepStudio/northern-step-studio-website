/**
 * 🧠 NEXUS AI - General Knowledge Base
 *
 * Contains:
 * - PC Building Terminology
 * - Troubleshooting Guides
 * - Compatibility Rules
 * - Upgrade Advice
 * - Response Patterns
 */

// === TERMINOLOGY DICTIONARY ===
export const TERMINOLOGY = {
    // Hardware Terms
    'tdp': {
        term: 'TDP (Thermal Design Power)',
        definition: 'The maximum amount of heat a component generates under load, measured in watts. Used to determine cooling requirements and power supply needs.',
        example: 'An RTX 4080 has a TDP of 320W, so you need a cooler and PSU rated for that.',
        relatedTerms: ['wattage', 'cooling', 'psu'],
    },
    'vram': {
        term: 'VRAM (Video RAM)',
        definition: 'Dedicated memory on a graphics card for storing textures, frames, and graphics data. More VRAM = higher resolutions and better texture quality.',
        example: '8GB VRAM is good for 1080p, 12GB+ for 1440p, 16GB+ for 4K.',
        relatedTerms: ['gpu', 'resolution', 'textures'],
    },
    'cuda cores': {
        term: 'CUDA Cores',
        definition: 'NVIDIA parallel processing units. More cores = more parallel calculations = faster graphics/compute. AMD uses "Stream Processors" instead.',
        example: 'RTX 4090 has 16,384 CUDA cores, making it extremely powerful.',
        relatedTerms: ['gpu', 'stream processors', 'compute'],
    },
    'stream processors': {
        term: 'Stream Processors',
        definition: 'AMD equivalent of CUDA cores. Parallel processing units in AMD GPUs.',
        example: 'RX 7900 XTX has 6,144 stream processors.',
        relatedTerms: ['gpu', 'cuda cores', 'amd'],
    },
    'bottleneck': {
        term: 'Bottleneck',
        definition: 'When one component limits the performance of another. Usually CPU bottleneck (GPU waits) or GPU bottleneck (CPU waits).',
        example: 'Pairing an i3 with an RTX 4090 creates a CPU bottleneck—the GPU sits idle waiting for the CPU.',
        relatedTerms: ['cpu', 'gpu', 'balance'],
    },
    'overclocking': {
        term: 'Overclocking (OC)',
        definition: 'Running a component at higher speeds than factory settings for more performance. Requires better cooling and sometimes higher voltage.',
        example: 'An unlocked "K" Intel CPU can be overclocked from 5.0GHz to 5.5GHz with proper cooling.',
        relatedTerms: ['cooling', 'voltage', 'unlocked'],
    },
    'ray tracing': {
        term: 'Ray Tracing',
        definition: 'Realistic lighting technique that simulates how light bounces in real life. Requires RT cores (NVIDIA) or Ray Accelerators (AMD).',
        example: 'Cyberpunk 2077 with ray tracing looks stunning but requires an RTX card for good FPS.',
        relatedTerms: ['rtx', 'lighting', 'rt cores'],
    },
    'dlss': {
        term: 'DLSS (Deep Learning Super Sampling)',
        definition: 'NVIDIA AI technology that renders at lower resolution and upscales with AI, boosting FPS with minimal quality loss. DLSS 3 adds frame generation.',
        example: 'With DLSS 3, you can get 2x the FPS in supported games.',
        relatedTerms: ['nvidia', 'upscaling', 'ai', 'fsr'],
    },
    'fsr': {
        term: 'FSR (FidelityFX Super Resolution)',
        definition: 'AMD open-source upscaling technology. Works on any GPU. FSR 3 adds frame generation like DLSS 3.',
        example: 'FSR 2 works on both AMD and NVIDIA cards for a free FPS boost.',
        relatedTerms: ['amd', 'upscaling', 'dlss'],
    },
    'nvme': {
        term: 'NVMe (Non-Volatile Memory Express)',
        definition: 'Fast SSD protocol using PCIe lanes. Much faster than SATA SSDs (7000MB/s vs 550MB/s).',
        example: 'An NVMe Gen4 SSD loads games in seconds compared to an HDD.',
        relatedTerms: ['ssd', 'storage', 'pcie'],
    },
    'pcie': {
        term: 'PCIe (PCI Express)',
        definition: 'High-speed interface for GPUs, SSDs, and expansion cards. Gen4 = 2x Gen3 speed, Gen5 = 2x Gen4.',
        example: 'RTX 40 series GPUs use PCIe 4.0 x16 slots.',
        relatedTerms: ['gpu', 'nvme', 'bandwidth'],
    },
    'ddr4': {
        term: 'DDR4',
        definition: 'Fourth generation RAM. Standard for AM4 and older Intel platforms. Typical speeds: 3200-3600MHz.',
        example: '16GB DDR4-3200 is good for most gaming builds.',
        relatedTerms: ['ram', 'memory', 'ddr5'],
    },
    'ddr5': {
        term: 'DDR5',
        definition: 'Fifth generation RAM. Required for AM5 and Intel 12th+ gen. Faster but pricier. Typical speeds: 5200-6400MHz.',
        example: 'DDR5-6000 is the sweet spot for Ryzen 7000 CPUs.',
        relatedTerms: ['ram', 'memory', 'ddr4'],
    },
    'xmp': {
        term: 'XMP (Extreme Memory Profile)',
        definition: 'Intel RAM overclocking profile that enables advertised speeds. Must be enabled in BIOS. AMD equivalent is EXPO.',
        example: 'Your 3600MHz RAM runs at 2133MHz until you enable XMP in BIOS.',
        relatedTerms: ['ram', 'bios', 'expo'],
    },
    'expo': {
        term: 'EXPO (Extended Profiles for Overclocking)',
        definition: 'AMD version of XMP for Ryzen 7000 DDR5 systems.',
        example: 'Enable EXPO in BIOS to get your DDR5-6000 speeds.',
        relatedTerms: ['ram', 'amd', 'xmp'],
    },
    'socket': {
        term: 'Socket',
        definition: 'Physical CPU mount on motherboard. CPU and motherboard sockets MUST match.',
        example: 'Ryzen 7000 uses AM5. Intel 14th gen uses LGA 1700.',
        relatedTerms: ['cpu', 'motherboard', 'compatibility'],
    },
    'chipset': {
        term: 'Chipset',
        definition: 'Motherboard controller that determines features like USB ports, PCIe lanes, and overclocking support.',
        example: 'Z790 supports overclocking, B760 does not. Both work with Intel 14th gen.',
        relatedTerms: ['motherboard', 'features', 'overclocking'],
    },
    'vrm': {
        term: 'VRM (Voltage Regulator Module)',
        definition: 'Motherboard power delivery system for CPU. Better VRMs = more stable overclocking and cooler operation.',
        example: 'High-end motherboards have more VRM phases for power-hungry CPUs like the i9-14900K.',
        relatedTerms: ['motherboard', 'power', 'overclocking'],
    },
    'atx': {
        term: 'ATX',
        definition: 'Standard PC form factor for motherboards, cases, and PSUs. Other sizes: Micro-ATX (smaller), Mini-ITX (smallest).',
        example: 'Most gaming PCs use ATX motherboards and cases.',
        relatedTerms: ['form factor', 'case', 'motherboard'],
    },
    'aio': {
        term: 'AIO (All-In-One Liquid Cooler)',
        definition: 'Pre-filled liquid cooler with pump, radiator, and fans. Easy to install, better cooling than most air coolers.',
        example: 'A 360mm AIO is recommended for Intel i9 CPUs.',
        relatedTerms: ['cooling', 'radiator', 'pump'],
    },
    'psu': {
        term: 'PSU (Power Supply Unit)',
        definition: 'Converts AC wall power to DC for PC components. Rated by wattage and efficiency (80+ Bronze/Gold/Platinum).',
        example: 'An RTX 4080 build needs at least a 750W 80+ Gold PSU.',
        relatedTerms: ['power', 'wattage', 'efficiency'],
    },
    'm.2': {
        term: 'M.2',
        definition: 'Compact SSD form factor that slots directly into motherboard. Can be SATA or NVMe (NVMe is faster).',
        example: 'Modern motherboards have 2-4 M.2 slots for SSDs.',
        relatedTerms: ['ssd', 'nvme', 'storage'],
    },

    // Gaming/Display Terms
    'refresh rate': {
        term: 'Refresh Rate (Hz)',
        definition: 'How many times per second a monitor updates. Higher = smoother motion. 60Hz, 144Hz, 240Hz, 360Hz are common.',
        example: '144Hz is the sweet spot for most gamers. 240Hz+ for competitive esports.',
        relatedTerms: ['monitor', 'fps', 'smooth'],
    },
    'response time': {
        term: 'Response Time',
        definition: 'How fast pixels change color. Lower = less motion blur. 1ms GtG is standard for gaming.',
        example: 'TN panels have 1ms response, IPS is typically 4-5ms (but better colors).',
        relatedTerms: ['monitor', 'blur', 'gaming'],
    },
    'gsync': {
        term: 'G-Sync',
        definition: 'NVIDIA variable refresh rate technology. Syncs monitor refresh to GPU output, eliminating tearing and stuttering.',
        example: 'G-Sync Compatible monitors work with NVIDIA cards for tear-free gaming.',
        relatedTerms: ['nvidia', 'freesync', 'tearing'],
    },
    'freesync': {
        term: 'FreeSync',
        definition: 'AMD variable refresh rate technology. Open standard, works with AMD and many NVIDIA cards.',
        example: 'Most gaming monitors support FreeSync.',
        relatedTerms: ['amd', 'gsync', 'tearing'],
    },
    'ips': {
        term: 'IPS (In-Plane Switching)',
        definition: 'Monitor panel type with best colors and viewing angles. Slightly slower than TN, faster than VA.',
        example: 'IPS is best for general gaming and content creation.',
        relatedTerms: ['monitor', 'panel', 'va', 'tn'],
    },
    'va': {
        term: 'VA (Vertical Alignment)',
        definition: 'Monitor panel type with best contrast and deep blacks. Slower response than IPS.',
        example: 'VA panels are great for dark games and movies.',
        relatedTerms: ['monitor', 'panel', 'ips', 'contrast'],
    },
    'oled': {
        term: 'OLED',
        definition: 'Self-emitting pixel technology with perfect blacks, infinite contrast, and instant response. Best picture quality.',
        example: 'OLED gaming monitors like the LG 27GR95QE offer the best image quality.',
        relatedTerms: ['monitor', 'contrast', 'burn-in'],
    },
    'hdr': {
        term: 'HDR (High Dynamic Range)',
        definition: 'Wider color and brightness range for more realistic images. HDR400 is entry-level, HDR1000+ is true HDR.',
        example: 'Real HDR requires at least 600+ nits brightness and local dimming.',
        relatedTerms: ['monitor', 'brightness', 'colors'],
    },
};

// === TROUBLESHOOTING DATABASE ===
export const TROUBLESHOOTING = {
    'no post': {
        issue: 'PC won\'t POST / No display',
        symptoms: ['No display output', 'Fans spin but no boot', 'Debug LEDs stuck', 'No beeps'],
        causes: [
            'RAM not seated properly',
            'GPU not powered or seated',
            'CPU power cable not connected',
            'Incompatible components',
            'Dead component'
        ],
        solutions: [
            '1. Reseat RAM - remove and firmly reinstall until click',
            '2. Check all power cables - 24-pin, CPU 8-pin, GPU power',
            '3. Try one RAM stick at a time',
            '4. Ensure GPU is fully seated and powered',
            '5. Clear CMOS (reset BIOS)',
            '6. Try without GPU (if CPU has integrated graphics)',
            '7. Check motherboard debug LEDs/codes'
        ],
        prevention: 'Double-check all connections during build. Test POST before installing in case.',
    },
    'blue screen': {
        issue: 'Blue Screen of Death (BSOD)',
        symptoms: ['Blue error screen', 'System crashes', 'Automatic restart'],
        causes: [
            'Driver issues (GPU drivers most common)',
            'RAM problems',
            'Overheating',
            'Corrupted Windows files',
            'Faulty hardware'
        ],
        solutions: [
            '1. Note the error code (e.g., DRIVER_IRQL_NOT_LESS_OR_EQUAL)',
            '2. Update or rollback GPU drivers using DDU',
            '3. Run Windows Memory Diagnostic',
            '4. Check temperatures during stress test',
            '5. Run SFC /scannow in Command Prompt',
            '6. Disable XMP/EXPO if recently enabled'
        ],
        prevention: 'Keep drivers updated. Avoid unstable overclocks. Monitor temps.',
    },
    'overheating': {
        issue: 'CPU/GPU Overheating',
        symptoms: ['High temps (90°C+)', 'Thermal throttling', 'Random shutdowns', 'Poor performance'],
        causes: [
            'Inadequate cooling',
            'Dried thermal paste',
            'Poor case airflow',
            'Dust buildup',
            'Aggressive overclocking'
        ],
        solutions: [
            '1. Check if all fans are spinning',
            '2. Clean dust from heatsinks and filters',
            '3. Reapply thermal paste',
            '4. Improve case airflow (add fans, better cable management)',
            '5. Reduce overclock or enable power limits',
            '6. Upgrade cooler if undersized for CPU TDP'
        ],
        prevention: 'Use adequate cooler for TDP. Clean PC every 6 months. Good case airflow.',
    },
    'low fps': {
        issue: 'Low FPS / Poor Gaming Performance',
        symptoms: ['Lower FPS than expected', 'Stuttering', 'Not hitting target refresh rate'],
        causes: [
            'GPU bottleneck (need faster GPU)',
            'CPU bottleneck (GPU waiting for CPU)',
            'RAM in single channel or slow speed',
            'XMP/EXPO not enabled',
            'Background programs',
            'Thermal throttling',
            'Driver issues'
        ],
        solutions: [
            '1. Check GPU usage in game (should be 95-100%)',
            '2. If GPU usage low, likely CPU bottleneck',
            '3. Enable XMP/EXPO in BIOS for RAM speed',
            '4. Ensure RAM is in dual channel (slots 2 and 4)',
            '5. Update GPU drivers',
            '6. Close background apps',
            '7. Check temperatures for throttling'
        ],
        prevention: 'Balance CPU and GPU. Enable XMP. Install RAM in correct slots.',
    },
    'no gpu detected': {
        issue: 'GPU Not Detected',
        symptoms: ['GPU missing in Device Manager', 'Using integrated graphics', 'No display from GPU'],
        causes: [
            'GPU not fully seated',
            'PCIe power cables not connected',
            'Wrong display cable port',
            'Driver issues',
            'Dead GPU'
        ],
        solutions: [
            '1. Reseat GPU firmly until PCIe latch clicks',
            '2. Connect ALL required PCIe power cables',
            '3. Connect monitor to GPU, not motherboard',
            '4. Try different PCIe slot if available',
            '5. Install drivers from NVIDIA/AMD website',
            '6. Test GPU in another system if possible'
        ],
        prevention: 'Ensure PCIe latch clicks. Connect all power cables. Use GPU display outputs.',
    },
    'ram not detected': {
        issue: 'RAM Not Detected / Wrong Speed',
        symptoms: ['Less RAM showing than installed', 'RAM running at 2133MHz', 'Boot loops'],
        causes: [
            'RAM not seated properly',
            'Wrong slots used',
            'XMP/EXPO not enabled',
            'Incompatible RAM',
            'Faulty RAM stick'
        ],
        solutions: [
            '1. Reseat RAM firmly until both clips click',
            '2. Use slots 2 and 4 for dual channel (typically)',
            '3. Enable XMP/EXPO in BIOS',
            '4. Test one stick at a time',
            '5. Check motherboard QVL list for compatibility',
            '6. Try lower XMP speed if boot fails'
        ],
        prevention: 'Check motherboard QVL. Install in correct slots. Enable XMP after confirming boot.',
    },
    'coil whine': {
        issue: 'GPU Coil Whine',
        symptoms: ['High-pitched noise from GPU under load', 'Buzzing sound'],
        causes: [
            'Normal electrical vibration in inductors',
            'Very high FPS (500+ in menus)',
            'Some PSUs make it worse'
        ],
        solutions: [
            '1. Enable V-Sync or frame limiter',
            '2. Try a different quality PSU',
            '3. Coil whine often improves over time',
            '4. RMA if extremely loud (manufacturer defect)'
        ],
        prevention: 'Use frame limiters. Some coil whine is normal and not harmful.',
    },
    'stuttering': {
        issue: 'Stuttering / Frame Drops',
        symptoms: ['Game freezes momentarily', 'FPS spikes/drops', 'Microstutters'],
        causes: [
            'Shader compilation (first time playing)',
            'VRAM running out',
            'Background apps',
            'Slow storage',
            'Driver issues',
            'CPU/GPU throttling'
        ],
        solutions: [
            '1. Let shaders compile (first playthrough)',
            '2. Lower texture quality if VRAM limited',
            '3. Close background apps',
            '4. Install games on SSD',
            '5. Update GPU drivers',
            '6. Check temps for throttling'
        ],
        prevention: 'Use SSD for games. Have adequate VRAM. Keep drivers updated.',
    },
};

// === COMPATIBILITY RULES ===
export const COMPATIBILITY = {
    cpuMotherboard: {
        rule: 'CPU and motherboard sockets MUST match',
        examples: [
            { cpu: 'Intel 12th/13th/14th Gen', socket: 'LGA 1700', chipsets: ['Z790', 'B760', 'H770'] },
            { cpu: 'AMD Ryzen 7000', socket: 'AM5', chipsets: ['X670E', 'X670', 'B650E', 'B650'] },
            { cpu: 'AMD Ryzen 5000', socket: 'AM4', chipsets: ['X570', 'B550', 'A520'] },
        ],
        tips: 'Use PCPartPicker to verify compatibility. Check BIOS version for newer CPUs.',
    },
    ramMotherboard: {
        rule: 'Use correct RAM generation (DDR4 or DDR5)',
        examples: [
            { platform: 'AM5', ram: 'DDR5 only' },
            { platform: 'LGA 1700', ram: 'DDR4 OR DDR5 (board specific)' },
            { platform: 'AM4', ram: 'DDR4 only' },
        ],
        tips: 'DDR4 and DDR5 slots are physically different - cannot mix.',
    },
    gpuCase: {
        rule: 'GPU must fit in case',
        tips: 'Check case max GPU length. RTX 4090 is ~336mm. Measure twice!',
        common: [
            { gpu: 'RTX 4090', length: '336mm' },
            { gpu: 'RTX 4080', length: '304mm' },
            { gpu: 'RTX 4070', length: '244mm' },
        ],
    },
    coolerCase: {
        rule: 'CPU cooler must fit in case',
        tips: 'Check case max CPU cooler height. NH-D15 is 165mm.',
        common: [
            { cooler: 'Noctua NH-D15', height: '165mm' },
            { cooler: 'AIO radiators', sizes: '120mm, 240mm, 280mm, 360mm' },
        ],
    },
    psuWattage: {
        rule: 'PSU must provide enough power with headroom',
        formula: '(CPU TDP + GPU TDP) × 1.5 = Recommended PSU',
        examples: [
            { build: 'RTX 4090 + i9-14900K', recommended: '1000W+' },
            { build: 'RTX 4070 + Ryzen 5 7600', recommended: '650W' },
            { build: 'RTX 4060 + i5-13400F', recommended: '550W' },
        ],
        tips: 'Always buy from reputable brands. Check PSU Tier List.',
    },
};

// === UPGRADE ADVICE ===
export const UPGRADE_ADVICE = {
    bestUpgrades: [
        { priority: 1, upgrade: 'HDD to SSD', impact: 'Massive boot and load time improvement', cost: '$50-100' },
        { priority: 2, upgrade: 'More RAM (8GB → 16GB)', impact: 'Less stuttering, better multitasking', cost: '$40-80' },
        { priority: 3, upgrade: 'GPU upgrade', impact: 'Biggest gaming FPS boost', cost: 'Varies' },
        { priority: 4, upgrade: 'CPU upgrade', impact: 'Better minimum FPS, less stuttering', cost: 'Varies' },
    ],
    whenToUpgrade: {
        gpu: 'When you can\'t hit target FPS at target settings. GPU usage should be 95-100%.',
        cpu: 'When GPU usage is low (<90%) but FPS is low. CPU is bottlenecking.',
        ram: 'When you see RAM usage hitting 90%+ during gaming/work.',
        storage: 'When you run out of space or have an HDD for games.',
    },
    upgradeVsNew: 'If upgrading CPU requires new motherboard AND new RAM, consider a full new build instead.',
};

// === RESPONSE PATTERNS (for more natural conversation) ===
export const RESPONSE_PATTERNS = {
    greetings: [
        "Hey! Ready to build something awesome? 💪",
        "What's up! Let's get you the perfect PC.",
        "Hey there! What can I help you with today?",
        "Yo! Got a build in mind or need some recommendations?",
        "Hi! I'm here to help with all things PC. What's on your mind?",
    ],
    thinking: [
        "Let me think about that...",
        "Good question! Here's what I'd say:",
        "Hmm, let me break that down:",
        "That's a great question. Here's my take:",
    ],
    encouragement: [
        "You're on the right track!",
        "That's a solid choice.",
        "Good thinking!",
        "Nice pick!",
    ],
    budgetResponses: [
        "Great budget! Here's what I'd recommend:",
        "I can work with that! Check this out:",
        "Perfect, let me put together something good:",
    ],
    clarification: [
        "Just to clarify:",
        "Quick note:",
        "Heads up:",
        "One thing to keep in mind:",
    ],
    noAnswer: [
        "I'm not 100% sure about that one. Try asking in a different way?",
        "Hmm, that's outside my expertise. I stick to PC building topics!",
        "I don't have specific info on that, but I can help with PC builds!",
    ],
};

// === BUILD ARCHETYPES ===
// Pre-defined builds for common use cases
export const BUILD_ARCHETYPES = {
    'esports': {
        name: 'Esports Champion',
        budget: '$600-800',
        target: '1080p 144+ FPS in competitive games',
        focus: 'CPU-heavy for high FPS, minimal GPU needed',
        cpu: 'Ryzen 5 5600 or i5-12400F',
        gpu: 'RX 6600 or RTX 4060',
        ram: '16GB DDR4 3200MHz',
        notes: 'Prioritize high refresh rate monitor. 240Hz if budget allows.',
        games: ['Valorant', 'CS2', 'Fortnite', 'Apex Legends', 'Overwatch 2'],
    },
    'aaa 1080p': {
        name: 'AAA 1080p Beast',
        budget: '$900-1100',
        target: '1080p 60+ FPS Ultra settings in modern games',
        focus: 'Balanced CPU and GPU',
        cpu: 'Ryzen 5 7600 or i5-13400F',
        gpu: 'RTX 4060 Ti or RX 7600 XT',
        ram: '16GB DDR4/DDR5',
        notes: 'Sweet spot for most gamers. Great for monitors up to 144Hz.',
        games: ['Cyberpunk 2077', 'Elden Ring', 'Hogwarts Legacy', 'Spider-Man'],
    },
    '1440p gaming': {
        name: '1440p Master',
        budget: '$1300-1600',
        target: '1440p 100+ FPS in most games',
        focus: 'Strong GPU with capable CPU',
        cpu: 'Ryzen 7 7800X3D or i5-14600K',
        gpu: 'RTX 4070 Super or RX 7800 XT',
        ram: '32GB DDR5 6000MHz',
        notes: 'Best balance of quality and performance. The "sweet spot."',
        games: ['All modern games at high/ultra settings'],
    },
    '4k gaming': {
        name: '4K Ultra Machine',
        budget: '$2000-3000',
        target: '4K 60+ FPS in demanding games',
        focus: 'Maximum GPU power',
        cpu: 'Ryzen 7 7800X3D or i7-14700K',
        gpu: 'RTX 4080 Super or RTX 4090',
        ram: '32GB DDR5 6000MHz',
        notes: 'CPU matters less at 4K - most load is on the GPU.',
        games: ['Any game maxed out'],
    },
    'streaming': {
        name: 'Streamer Setup',
        budget: '$1200-1500',
        target: 'Gaming + streaming simultaneously',
        focus: 'NVIDIA GPU for NVENC encoder',
        cpu: 'Ryzen 7 7700X or i7-13700K',
        gpu: 'RTX 4060 Ti or better (NVENC required)',
        ram: '32GB DDR5',
        notes: 'NVENC handles encoding with no FPS loss. AMD cards lack this.',
        games: ['Whatever you stream'],
    },
    'content creation': {
        name: 'Creator Workstation',
        budget: '$1500-2500',
        target: 'Video editing, 3D rendering, photo editing',
        focus: 'High core count CPU, lots of RAM',
        cpu: 'Ryzen 9 7900X or i7-14700K',
        gpu: 'RTX 4070 or better (CUDA for Premiere/DaVinci)',
        ram: '64GB DDR5',
        notes: 'NVMe SSD essential for large projects. Consider 2TB+.',
        games: ['Not the focus, but capable'],
    },
    'budget': {
        name: 'Budget King',
        budget: '$500-700',
        target: '1080p 60 FPS in modern games',
        focus: 'Maximum value per dollar',
        cpu: 'Ryzen 5 5600 or i3-12100F',
        gpu: 'RX 6650 XT or RTX 4060',
        ram: '16GB DDR4 3200MHz',
        notes: 'AM4 platform is cheap and mature. Used parts work great here.',
        games: ['Most games at medium-high settings'],
    },
    'mini itx': {
        name: 'Small Form Factor Beast',
        budget: '$1200-1800',
        target: 'Powerful but compact',
        focus: 'ITX motherboard, SFX PSU, careful thermals',
        cpu: 'Ryzen 7 7700X (efficient) or i5-14600K',
        gpu: 'RTX 4070 (2.5 slot or smaller)',
        ram: '32GB DDR5',
        notes: 'Case choice is critical. Check GPU length and cooler height.',
        games: ['Full desktop performance in a tiny case'],
    },
};

// === GAME FPS EXPECTATIONS ===
// Expected FPS for popular games at different resolutions
export const GAME_FPS_DATA = {
    'cyberpunk 2077': {
        name: 'Cyberpunk 2077 (RT Ultra)',
        'rtx 4090': { '1080p': 120, '1440p': 90, '4k': 60 },
        'rtx 4080': { '1080p': 100, '1440p': 75, '4k': 45 },
        'rtx 4070': { '1080p': 80, '1440p': 55, '4k': 30 },
        'rtx 4060 ti': { '1080p': 60, '1440p': 40, '4k': 20 },
        notes: 'DLSS 3 can double these numbers. Path tracing is brutal.',
    },
    'fortnite': {
        name: 'Fortnite (Performance Mode)',
        'rtx 4060': { '1080p': 300, '1440p': 200, '4k': 120 },
        'rtx 3060': { '1080p': 240, '1440p': 160, '4k': 80 },
        'rx 6650 xt': { '1080p': 200, '1440p': 140, '4k': 60 },
        notes: 'CPU-bound in competitive settings. Get 240Hz monitor.',
    },
    'valorant': {
        name: 'Valorant (Competitive)',
        'any modern gpu': { '1080p': 300, '1440p': 250, '4k': 200 },
        notes: 'Extremely CPU-bound. Even mid-range GPUs hit 300+ FPS.',
    },
    'cs2': {
        name: 'Counter-Strike 2',
        'rtx 4070': { '1080p': 250, '1440p': 180, '4k': 100 },
        'rtx 4060': { '1080p': 200, '1440p': 140, '4k': 70 },
        'rx 6650 xt': { '1080p': 180, '1440p': 120, '4k': 60 },
        notes: 'Source 2 engine is demanding. CPU matters a lot.',
    },
    'elden ring': {
        name: 'Elden Ring',
        'rtx 4070': { '1080p': 60, '1440p': 60, '4k': 60 },
        notes: 'Capped at 60 FPS. Any RTX 40 series hits the cap easily.',
    },
    'hogwarts legacy': {
        name: 'Hogwarts Legacy (Ultra)',
        'rtx 4090': { '1080p': 140, '1440p': 100, '4k': 60 },
        'rtx 4070': { '1080p': 90, '1440p': 60, '4k': 35 },
        'rtx 4060 ti': { '1080p': 70, '1440p': 45, '4k': 25 },
        notes: 'VRAM hungry. 12GB+ recommended for Ultra textures.',
    },
    'starfield': {
        name: 'Starfield',
        'rtx 4090': { '1080p': 100, '1440p': 80, '4k': 50 },
        'rtx 4070': { '1080p': 70, '1440p': 50, '4k': 30 },
        notes: 'Not well optimized. Creation Engine struggles.',
    },
};

// === COMMON BEGINNER MISTAKES ===
export const COMMON_MISTAKES = [
    {
        mistake: 'Not enabling XMP/EXPO',
        why: 'RAM runs at 2133MHz instead of advertised speed (3600MHz+)',
        fix: 'Enable XMP (Intel) or EXPO (AMD) in BIOS',
        impact: '10-15% performance loss',
    },
    {
        mistake: 'Single channel RAM',
        why: 'Using one stick or wrong slots halves memory bandwidth',
        fix: 'Use 2 sticks in slots 2 and 4 (check manual)',
        impact: '10-20% gaming FPS loss',
    },
    {
        mistake: 'Plugging monitor into motherboard',
        why: 'Uses integrated graphics instead of dedicated GPU',
        fix: 'Connect display cable to GPU, not motherboard',
        impact: 'GPU literally unused',
    },
    {
        mistake: 'Forgetting CPU power cable',
        why: 'CPU needs 4+4 or 8-pin power from PSU',
        fix: 'Connect EPS cable to top-left of motherboard',
        impact: 'PC won\'t POST',
    },
    {
        mistake: 'Cheap PSU',
        why: 'Can damage expensive components or cause instability',
        fix: 'Get 80+ Gold from EVGA, Corsair, Seasonic, etc.',
        impact: 'Risk of fire, damage, crashes',
    },
    {
        mistake: 'Not removing CPU socket cover',
        why: 'Plastic cover on socket prevents CPU contact',
        fix: 'Remove it before installing CPU (but keep it for warranty)',
        impact: 'No POST, potential bent pins',
    },
    {
        mistake: 'Too much thermal paste',
        why: 'Paste should spread thin, not pool',
        fix: 'Pea-sized dot in center, let pressure spread it',
        impact: 'Higher temps, messy install',
    },
    {
        mistake: 'Not checking GPU length',
        why: 'Modern GPUs are HUGE - may not fit case',
        fix: 'Check case specs for max GPU length before buying',
        impact: 'GPU literally won\'t fit',
    },
    {
        mistake: 'Ignoring airflow',
        why: 'No case fans or wrong configuration = hot components',
        fix: '2+ intake fans front, 1+ exhaust rear/top',
        impact: 'Thermal throttling, loud fans',
    },
    {
        mistake: 'Overspending on CPU, underspending on GPU',
        why: 'Gaming is mostly GPU-bound',
        fix: 'Rule of thumb: GPU = 40-50% of build budget',
        impact: 'Lower FPS than possible',
    },
];

// === PRO TIPS ===
export const PRO_TIPS = [
    {
        category: 'Building',
        tip: 'Build outside the case first (on motherboard box)',
        why: 'Test POST before installing. Easier to troubleshoot.',
    },
    {
        category: 'Building',
        tip: 'Take your time - first build takes 2-4 hours',
        why: 'Rushing causes mistakes. Read the manual.',
    },
    {
        category: 'Building',
        tip: 'Install I/O shield BEFORE motherboard',
        why: 'You will NOT want to take it all apart later.',
    },
    {
        category: 'Performance',
        tip: 'Enable Resizable BAR in BIOS',
        why: '5-10% free FPS in supported games. Both AMD and Intel support it.',
    },
    {
        category: 'Performance',
        tip: 'Set Windows power plan to "High Performance"',
        why: 'Prevents CPU from downclocking during light loads.',
    },
    {
        category: 'Performance',
        tip: 'Use Memory Try It! in MSI BIOS or similar',
        why: 'Easy one-click RAM overclocking beyond XMP.',
    },
    {
        category: 'Value',
        tip: 'Consider previous-gen used GPUs',
        why: 'RTX 3080 used ≈ RTX 4070 new, often cheaper.',
    },
    {
        category: 'Value',
        tip: 'AM4 builds are CHEAP right now',
        why: 'Ryzen 5 5600 + B550 is incredible value for budget builds.',
    },
    {
        category: 'Value',
        tip: 'Wait for sales (Black Friday, Prime Day)',
        why: 'GPUs and CPUs often 10-20% off during sales.',
    },
    {
        category: 'Maintenance',
        tip: 'Clean dust filters every 3-6 months',
        why: 'Dust buildup = higher temps = lower performance.',
    },
    {
        category: 'Maintenance',
        tip: 'Re-paste CPU every 3-5 years',
        why: 'Thermal paste dries out over time, increasing temps.',
    },
    {
        category: 'Monitors',
        tip: 'Get 1440p 144Hz, not 1080p 240Hz',
        why: 'Better image quality, 144Hz is smooth enough for most.',
    },
    {
        category: 'Monitors',
        tip: 'IPS > VA for fast-paced games',
        why: 'Better response times, less ghosting.',
    },
    {
        category: 'Buying',
        tip: 'Use PCPartPicker for compatibility',
        why: 'Automatically checks if parts work together.',
    },
    {
        category: 'Buying',
        tip: 'Check r/buildapcsales for deals',
        why: 'Active community posting discounts daily.',
    },
];

export default {
    TERMINOLOGY,
    TROUBLESHOOTING,
    COMPATIBILITY,
    UPGRADE_ADVICE,
    RESPONSE_PATTERNS,
    BUILD_ARCHETYPES,
    GAME_FPS_DATA,
    COMMON_MISTAKES,
    PRO_TIPS,
};
