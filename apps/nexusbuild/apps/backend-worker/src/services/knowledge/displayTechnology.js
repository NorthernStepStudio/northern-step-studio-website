/**
 * 🖥️ NEXUS AI - Display Technology Deep Dive
 *
 * Expert-level display knowledge including:
 * - Display connectors (HDMI, DisplayPort, USB-C)
 * - Cable versions and capabilities
 * - Monitor specs (resolution, refresh rate, response time)
 * - HDR standards
 * - Adaptive sync (G-Sync, FreeSync)
 * - Color accuracy and calibration
 * - Panel types detailed
 */

// === DISPLAY CONNECTORS ===
export const DISPLAY_CONNECTORS = {
    hdmi: {
        name: 'HDMI (High-Definition Multimedia Interface)',
        description: 'Most common display connector. Carries video + audio.',
        versions: {
            'HDMI 1.4': {
                maxRes: '4K @ 30Hz or 1080p @ 120Hz',
                bandwidth: '10.2 Gbps',
                features: ['ARC', '3D support'],
                status: 'Outdated',
            },
            'HDMI 2.0': {
                maxRes: '4K @ 60Hz or 1440p @ 144Hz',
                bandwidth: '18 Gbps',
                features: ['HDR support', 'Wider color gamut'],
                status: 'Common on older devices',
            },
            'HDMI 2.1': {
                maxRes: '4K @ 120Hz, 8K @ 60Hz, 10K @ 30Hz',
                bandwidth: '48 Gbps',
                features: ['VRR (Variable Refresh Rate)', 'ALLM', 'eARC', 'QFT', 'DSC'],
                gaming: 'Required for 4K 120Hz gaming (consoles, GPUs)',
                status: 'Current standard',
            },
            'HDMI 2.1a': {
                description: 'HDMI 2.1 with Source-Based Tone Mapping (SBTM)',
                benefit: 'Better HDR gaming',
            },
        },
        cable_notes: {
            certified: 'Use Ultra High Speed HDMI for 2.1 features',
            length: 'Active cables for runs over 3m at 4K 120Hz',
            fake: 'Many cheap cables claim 2.1 but fail certification',
        },
    },

    displayport: {
        name: 'DisplayPort',
        description: 'PC-focused connector. Generally better than HDMI for high refresh.',
        versions: {
            'DP 1.2': {
                maxRes: '4K @ 60Hz or 1080p @ 240Hz',
                bandwidth: '17.28 Gbps',
                features: ['MST (Multi-Stream)', 'Audio'],
                status: 'Still common',
            },
            'DP 1.4': {
                maxRes: '4K @ 120Hz, 8K @ 30Hz (with DSC)',
                bandwidth: '25.92 Gbps',
                features: ['DSC (Display Stream Compression)', 'HDR10'],
                gaming: 'Sufficient for most gaming monitors',
                status: 'Current mainstream',
            },
            'DP 2.0': {
                maxRes: '4K @ 240Hz, 8K @ 85Hz, 16K @ 60Hz (with DSC)',
                bandwidth: '77.37 Gbps (UHBR 20)',
                modes: {
                    'UHBR 10': '40 Gbps',
                    'UHBR 13.5': '54 Gbps',
                    'UHBR 20': '77.37 Gbps',
                },
                status: 'Newest, limited adoption',
            },
            'DP 2.1': {
                description: 'Refinement of 2.0 with better cables',
                bandwidth: 'Same as 2.0',
                status: 'Current latest standard',
            },
        },
        advantages: ['Generally higher bandwidth than HDMI', 'MST for daisy-chaining', 'Locking connector'],
        cable_notes: {
            length: 'Passive cables up to 2m for high bandwidth',
            active: 'Active cables for longer runs',
            certified: 'VESA certified cables recommended',
        },
    },

    usbc: {
        name: 'USB-C (with DisplayPort Alt Mode or Thunderbolt)',
        description: 'Versatile connector that can carry display signal.',
        modes: {
            'DP Alt Mode': {
                description: 'USB-C carrying DisplayPort signal',
                bandwidth: 'Depends on DP version supported',
                use: 'Laptops, phones, portable monitors',
            },
            'Thunderbolt 3/4': {
                description: 'Intel/Apple protocol over USB-C',
                bandwidth: '40 Gbps',
                features: ['DP 1.4 support', 'Daisy-chaining', 'PCIe tunneling'],
            },
            'Thunderbolt 5': {
                bandwidth: '80 Gbps (120 Gbps with bandwidth boost)',
                features: ['DP 2.1 support', 'Better for multiple displays'],
            },
        },
        advantages: ['Single cable for video + power + data', 'Reversible'],
        warning: 'Not all USB-C ports support video output!',
    },

    dvi: {
        name: 'DVI (Digital Visual Interface)',
        description: 'Legacy connector, being phased out.',
        types: {
            'DVI-D': 'Digital only',
            'DVI-I': 'Digital + analog',
            'Dual-Link DVI': '2560x1600 @ 60Hz or 1080p @ 144Hz',
        },
        status: 'Obsolete for new builds, still on some monitors',
    },

    vga: {
        name: 'VGA (Video Graphics Array)',
        description: 'Analog connector. Very old.',
        maxRes: '2048x1536 @ 85Hz (theoretical)',
        status: 'Obsolete. Avoid unless no other option.',
    },
};

// === CABLE QUALITY ===
export const CABLE_QUALITY = {
    hdmi: {
        certified: {
            'Standard': 'Up to 1080p @ 60Hz',
            'High Speed': 'Up to 4K @ 30Hz',
            'Premium High Speed': 'Up to 4K @ 60Hz with HDR',
            'Ultra High Speed': 'Up to 8K @ 60Hz, 4K @ 120Hz',
        },
        recommendation: 'Ultra High Speed for HDMI 2.1, Premium for 2.0',
        fake_cables: 'Many cables falsely claim specs. Buy from reputable brands.',
        brands: ['Certified cables from Monoprice', 'Cable Matters', 'Belkin', 'Zeskit'],
    },
    displayport: {
        certified: 'VESA DP8K certification for DP 1.4+',
        recommendation: 'VESA certified for 4K 144Hz+',
        brands: ['Club3D', 'Cable Matters', 'Accell'],
    },
    length: {
        hdmi: 'Passive up to 3m for 4K 120Hz, use active/fiber for longer',
        displayport: 'Passive up to 2m for 4K 120Hz, use active for longer',
        fiber: 'Fiber optic cables for 10m+ runs at full bandwidth',
    },
};

// === RESOLUTION ===
export const DISPLAY_RESOLUTIONS = {
    common: {
        '1080p': {
            name: 'Full HD',
            resolution: '1920 x 1080',
            pixels: '2.07 million',
            use: 'Budget gaming, esports',
            gpuNeed: 'Entry-level (RTX 4060, RX 7600)',
        },
        '1440p': {
            name: 'QHD / 2K',
            resolution: '2560 x 1440',
            pixels: '3.69 million',
            use: 'Sweet spot for gaming',
            gpuNeed: 'Mid-range (RTX 4070, RX 7800 XT)',
        },
        '4K': {
            name: 'UHD',
            resolution: '3840 x 2160',
            pixels: '8.29 million',
            use: 'High-end gaming, productivity',
            gpuNeed: 'High-end (RTX 4080+, RX 7900 XTX)',
        },
        '5K': {
            resolution: '5120 x 2880',
            use: 'Professional/Mac displays',
        },
        '8K': {
            resolution: '7680 x 4320',
            pixels: '33.18 million',
            use: 'Future-proofing, professional video',
            gpuNeed: 'Flagship GPU (RTX 5090)',
        },
    },

    ultrawide: {
        '2560x1080': { name: 'Ultrawide 1080p', ratio: '21:9' },
        '3440x1440': { name: 'Ultrawide 1440p', ratio: '21:9', popular: true },
        '3840x1600': { name: 'Ultrawide 1600p', ratio: '24:10' },
        '5120x1440': { name: 'Super Ultrawide', ratio: '32:9' },
        '5120x2160': { name: '5K2K Ultrawide', ratio: '21:9' },
    },

    pixelDensity: {
        description: 'Pixels per inch (PPI). Higher = sharper.',
        sweet_spots: {
            '24" 1080p': '92 PPI (OK)',
            '27" 1080p': '82 PPI (Visible pixels)',
            '27" 1440p': '109 PPI (Sweet spot)',
            '32" 1440p': '91 PPI (Decent)',
            '27" 4K': '163 PPI (Very sharp, needs scaling)',
            '32" 4K': '138 PPI (Sharp, usable at 100% scale)',
        },
    },
};

// === REFRESH RATE ===
export const REFRESH_RATES = {
    overview: {
        description: 'How many times per second the display updates.',
        measurement: 'Hz (Hertz)',
        rule: 'Higher refresh = smoother motion, needs GPU to match FPS',
    },

    common: {
        '60Hz': { use: 'Office, casual gaming', feel: 'Standard' },
        '75Hz': { use: 'Slight upgrade from 60', feel: 'Marginally smoother' },
        '120Hz': { use: 'Console gaming (PS5, Xbox)', feel: 'Noticeably smoother' },
        '144Hz': { use: 'PC gaming sweet spot', feel: 'Very smooth' },
        '165Hz': { use: 'Common on gaming monitors', feel: 'Similar to 144' },
        '180Hz': { use: 'High-refresh gaming', feel: 'Smooth' },
        '240Hz': { use: 'Competitive esports', feel: 'Extremely smooth' },
        '360Hz': { use: 'Professional esports', feel: 'Maximum fluidity' },
        '500Hz+': { use: 'Extreme competitive', feel: 'Diminishing returns' },
    },

    diminishing_returns: {
        description: 'Difference becomes less noticeable at higher refresh rates',
        noticeable: {
            '60 to 144': 'HUGE difference, very obvious',
            '144 to 240': 'Noticeable, especially in fast games',
            '240 to 360': 'Subtle, mostly competitive players notice',
            '360 to 500+': 'Minimal, requires trained eye',
        },
    },

    recommendation: {
        casual: '60-75Hz is fine',
        gaming: '144Hz minimum, 165Hz common',
        competitive: '240Hz+ for advantage',
        note: 'Your GPU must hit the FPS to benefit',
    },
};

// === RESPONSE TIME ===
export const RESPONSE_TIME = {
    overview: {
        description: 'Time for a pixel to change color.',
        measurement: 'Milliseconds (ms)',
        types: {
            gtg: 'Grey-to-Grey (most common, somewhat standardized)',
            mprt: 'Moving Picture Response Time (perceived blur)',
            btb: 'Black-to-Black (rarely used now)',
        },
    },

    ratings: {
        '1ms': 'Marketing often aggressive. Real-world ~3-5ms GTG usually.',
        '4-5ms': 'Fast IPS panels, good for gaming',
        '8-10ms': 'Standard IPS, fine for most uses',
        '15ms+': 'VA panels (slower, more ghosting)',
    },

    panelTypes: {
        TN: { response: '1-2ms real', ghosting: 'Minimal' },
        IPS: { response: '3-5ms real', ghosting: 'Low' },
        VA: { response: '8-15ms real', ghosting: 'More noticeable (dark scenes)' },
        OLED: { response: '0.1-0.3ms real', ghosting: 'None (instant)' },
    },

    overdrive: {
        description: 'Monitor setting to reduce response time',
        levels: {
            off: 'Slowest, most ghosting',
            normal: 'Balanced',
            extreme: 'Fastest but may cause inverse ghosting (overshoot)',
        },
        recommendation: 'Use Normal/Medium setting usually',
    },
};

// === HDR ===
export const HDR_STANDARDS = {
    overview: {
        description: 'High Dynamic Range - brighter highlights, darker blacks, more colors.',
        requirement: 'Content, display, and connection must all support HDR.',
    },

    vesa_displayhdr: {
        'DisplayHDR 400': {
            brightness: '400 nits peak',
            quality: 'Entry-level, barely HDR',
            verdict: 'Marketing HDR, not impressive',
        },
        'DisplayHDR 600': {
            brightness: '600 nits peak',
            quality: 'Decent HDR',
            localDimming: 'Usually required',
        },
        'DisplayHDR 1000': {
            brightness: '1000 nits peak',
            quality: 'Good HDR experience',
            localDimming: 'Required',
        },
        'DisplayHDR 1400': {
            brightness: '1400 nits peak',
            quality: 'Excellent HDR',
        },
        'DisplayHDR True Black': {
            brightness: 'Varies',
            contrast: 'Perfect blacks (OLED)',
            oled: true,
        },
    },

    formats: {
        HDR10: {
            description: 'Base HDR format',
            bitDepth: '10-bit',
            metadata: 'Static',
            support: 'Universal',
        },
        HDR10Plus: {
            description: 'Samsung\'s dynamic HDR',
            metadata: 'Dynamic (scene-by-scene)',
            support: 'Samsung TVs, some monitors',
        },
        DolbyVision: {
            description: 'Premium dynamic HDR',
            bitDepth: 'Up to 12-bit',
            metadata: 'Dynamic',
            support: 'LG OLED, some gaming',
            gaming: 'Dolby Vision Gaming on Xbox/PC',
        },
    },

    realHDR: {
        requirements: [
            'Display with 600+ nits (1000+ for great HDR)',
            'Local dimming or OLED',
            'Wide color gamut (90%+ DCI-P3)',
            'HDR-enabled content',
        ],
        avoid: 'DisplayHDR 400 is not real HDR experience',
    },
};

// === ADAPTIVE SYNC ===
export const ADAPTIVE_SYNC = {
    overview: {
        description: 'Syncs monitor refresh with GPU output to prevent tearing.',
        problem: 'Without sync: screen tearing when FPS ≠ refresh rate.',
    },

    technologies: {
        vsync: {
            name: 'V-Sync',
            description: 'Locks FPS to refresh rate',
            pros: 'No tearing',
            cons: ['Input lag', 'Stuttering if FPS drops'],
            recommendation: 'Avoid for competitive gaming',
        },
        gsync: {
            name: 'NVIDIA G-Sync',
            types: {
                'G-Sync Ultimate': 'Best, hardware module, HDR, 144Hz+ range',
                'G-Sync': 'Hardware module in monitor',
                'G-Sync Compatible': 'NVIDIA validated FreeSync monitors',
            },
            pros: 'Tear-free, low latency, wide VRR range',
            requirement: 'NVIDIA GPU',
        },
        freesync: {
            name: 'AMD FreeSync',
            types: {
                'FreeSync': 'Basic VRR',
                'FreeSync Premium': '120Hz+ VRR, LFC',
                'FreeSync Premium Pro': 'Adds HDR support',
            },
            pros: 'Tear-free, no cost premium',
            requirement: 'AMD GPU (or modern NVIDIA with Compatible)',
            lfc: 'Low Framerate Compensation - doublesframes below VRR range',
        },
        adaptivesync: {
            name: 'VESA Adaptive-Sync',
            description: 'Open standard in DisplayPort spec',
            note: 'FreeSync is based on this',
        },
    },

    recommendation: {
        nvidia: 'G-Sync or G-Sync Compatible',
        amd: 'FreeSync Premium Pro',
        either: 'Most FreeSync monitors work with modern NVIDIA GPUs',
    },

    vrrRange: {
        description: 'Range where adaptive sync works',
        good: '48-144Hz minimum',
        great: '1-240Hz (LFC handles below range)',
        check: 'Verify VRR range in monitor specs',
    },
};

// === PANEL TYPES DETAILED ===
export const PANEL_TYPES = {
    ips: {
        name: 'IPS (In-Plane Switching)',
        pros: ['Best color accuracy', 'Wide viewing angles (178°)', 'Good for color work'],
        cons: ['IPS glow in corners', 'Lower contrast (1000:1)', 'More expensive'],
        response: '3-5ms real',
        contrast: '1000-1500:1',
        use: 'General use, gaming, professional work',
        variants: {
            'Fast IPS': 'Gaming optimized, faster response',
            'Nano IPS': 'Better color (98% DCI-P3), LG tech',
            'Super IPS': 'Even wider gamut',
        },
    },
    va: {
        name: 'VA (Vertical Alignment)',
        pros: ['Best contrast (3000:1+)', 'Deep blacks', 'Good for dark content'],
        cons: ['Slower response (ghosting)', 'Worse viewing angles', 'Color shift at angles'],
        response: '8-15ms real',
        contrast: '3000-5000:1',
        use: 'Movies, dark games, immersion',
        note: 'Ghosting in dark scenes is the main complaint',
    },
    tn: {
        name: 'TN (Twisted Nematic)',
        pros: ['Fastest response (<1ms)', 'Cheapest', 'High refresh available'],
        cons: ['Worst colors', 'Worst viewing angles', 'Color shift'],
        response: '1-2ms real',
        contrast: '1000:1',
        use: 'Competitive esports only (if budget tight)',
        status: 'Being phased out',
    },
    oled: {
        name: 'OLED',
        pros: ['Perfect blacks', 'Infinite contrast', 'Instant response (0.1ms)', 'Best HDR', 'Wide viewing angles'],
        cons: ['Burn-in risk', 'Expensive', 'Limited brightness (for PC use)'],
        response: '0.1-0.3ms',
        contrast: 'Infinite',
        use: 'Premium gaming, content creation, movies',
        burnin: {
            risk: 'Static elements (taskbar, HUD) can burn in',
            prevention: ['Use dark mode', 'Screensaver', 'Vary content', 'Enable pixel refresh'],
            warranty: 'Most now cover burn-in for 3 years',
        },
        types: {
            'WOLED': 'LG panels (C/G series), RGB+W subpixel',
            'QD-OLED': 'Samsung, pure RGB, brighter, better color',
        },
    },
    miniled: {
        name: 'Mini-LED',
        description: 'LCD with many small LEDs for local dimming',
        pros: ['Better contrast than IPS/VA', 'Brighter than OLED', 'No burn-in'],
        cons: ['Blooming (halo around bright objects)', 'Not as good as OLED contrast'],
        zones: 'More zones = better (500-2000+ zones ideal)',
        use: 'HDR content, avoiding OLED risks',
    },
};

// === COLOR ACCURACY ===
export const COLOR_ACCURACY = {
    gamuts: {
        sRGB: {
            description: 'Standard for web and most content',
            coverage: 'Base - 100% sRGB is standard',
            use: 'Web, most games, general use',
        },
        adobeRGB: {
            description: 'Wider gamut for print work',
            coverage: 'Larger than sRGB (mostly greens)',
            use: 'Photography, print design',
        },
        dciP3: {
            description: 'Cinema/HDR color space',
            coverage: '25% more colors than sRGB',
            use: 'HDR content, video editing, Mac',
            target: '95%+ DCI-P3 for good HDR',
        },
        rec2020: {
            description: 'Future 4K/8K HDR standard',
            coverage: 'Wider than DCI-P3',
            use: 'Professional HDR mastering',
        },
    },

    calibration: {
        deltaE: {
            description: 'Color accuracy measurement. Lower = more accurate.',
            ratings: {
                '<1': 'Imperceptible difference - professional grade',
                '<2': 'Excellent - can\'t see difference without comparison',
                '<3': 'Good - fine for most work',
                '>5': 'Noticeable - needs calibration',
            },
        },
        factory: 'Many monitors calibrated at factory with report',
        tools: ['SpyderX', 'i1Display', 'ColorChecker'],
        icc: 'ICC profiles correct color output',
    },

    bitDepth: {
        '6-bit': 'Budget monitors, visible banding',
        '8-bit': 'Standard, 16.7 million colors',
        '8-bit+FRC': 'Simulates 10-bit with dithering',
        '10-bit': 'True 10-bit, 1 billion colors, no banding',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get cable recommendation for setup
 */
export const getCableForSetup = (resolution, refreshRate, hdr = false) => {
    if (resolution === '4K' && refreshRate >= 120) {
        return { cable: 'HDMI 2.1 Ultra High Speed or DP 1.4', notes: 'Must be certified' };
    }
    if (resolution === '4K' && refreshRate >= 60) {
        return { cable: 'HDMI 2.0 High Speed or DP 1.2+', notes: 'Common cables work' };
    }
    if (resolution === '1440p' && refreshRate >= 144) {
        return { cable: 'HDMI 2.0+ or DP 1.2+', notes: 'Standard cables usually fine' };
    }
    return { cable: 'Any HDMI or DP cable', notes: 'Most cables will work' };
};

/**
 * Recommend monitor panel
 */
export const recommendPanel = (useCase) => {
    if (useCase === 'competitive') return { panel: 'Fast IPS or TN', reason: 'Speed priority' };
    if (useCase === 'immersion') return { panel: 'OLED or VA', reason: 'Best contrast for movies/dark games' };
    if (useCase === 'professional') return { panel: 'IPS or OLED', reason: 'Color accuracy' };
    if (useCase === 'allround') return { panel: 'IPS', reason: 'Best balance' };
    return { panel: 'IPS', reason: 'Safe default choice' };
};

/**
 * Calculate if HDR worth it
 */
export const isHDRWorthIt = (displayHDRLevel) => {
    if (displayHDRLevel >= 1000) return { worth: true, quality: 'Excellent HDR' };
    if (displayHDRLevel >= 600) return { worth: true, quality: 'Decent HDR' };
    if (displayHDRLevel >= 400) return { worth: false, quality: 'Marketing HDR, not impressive' };
    return { worth: false, quality: 'Not HDR capable' };
};

export default {
    DISPLAY_CONNECTORS,
    CABLE_QUALITY,
    DISPLAY_RESOLUTIONS,
    REFRESH_RATES,
    RESPONSE_TIME,
    HDR_STANDARDS,
    ADAPTIVE_SYNC,
    PANEL_TYPES,
    COLOR_ACCURACY,
    getCableForSetup,
    recommendPanel,
    isHDRWorthIt,
};
