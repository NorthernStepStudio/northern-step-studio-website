/**
 * 🖥️ KNOWLEDGE: Monitor Buying Guide
 *
 * Deep dive into display technologies, specs, and recommendations.
 */

export const MONITOR_KNOWLEDGE = {
    // === PANEL TECHNOLOGIES ===
    panels: {
        'OLED': {
            name: 'OLED (Organic LED)',
            pros: ['Infinite contrast (Perfect Blacks)', 'Instant response time (0.03ms)', 'Excellent HDR', 'Wide viewing angles'],
            cons: ['Risk of Burn-in (static elements)', 'Lower brightness than Mini-LED', 'Text clarity issues (subpixel layout)'],
            bestFor: ['Immersive gaming', 'HDR movies', 'Dark room usage'],
            subtypes: ['WOLED (LG - better whites)', 'QD-OLED (Samsung - better colors)']
        },
        'IPS': {
            name: 'IPS (In-Plane Switching)',
            pros: ['Great colors', 'Good viewing angles', 'Good response times (Fast IPS)'],
            cons: ['IPS Glow', 'Low contrast (blacks look gray)', 'Backlight bleed'],
            bestFor: ['General use', 'Color accurate work', 'Gaming (standard choice)']
        },
        'VA': {
            name: 'VA (Vertical Alignment)',
            pros: ['High contrast (3000:1+)', 'Deep blacks (better than IPS)', 'Cheaper'],
            cons: ['Ghosting / Black Smearing (slow dark transitions)', 'Narrow viewing angles'],
            bestFor: ['Budget gaming', 'Movies', 'Single player games'],
            note: 'Samsung Odyssey G7/G9 are exceptions (Fast VA with no smearing).'
        },
        'TN': {
            name: 'TN (Twisted Nematic)',
            pros: ['Cheapest', 'Fastest raw refresh rates (540Hz+)'],
            cons: ['Terrible colors', 'Washed out', 'Horrible viewing angles'],
            bestFor: ['Ultra-competitive esports ONLY', 'Lowest budget'],
            status: 'Mostly obsolete due to Fast IPS.'
        },
        'Mini-LED': {
            name: 'Mini-LED (Backlight Tech)',
            description: 'IPS or VA panel with thousands of dimming zones.',
            pros: ['Near-OLED contrast', 'Insanely bright (1000+ nits)', 'No burn-in risk'],
            cons: ['Blooming (halo effect around bright objects)', 'Expensive', 'Thicker/Heavier'],
            bestFor: ['HDR gaming in bright rooms', 'Productivity + Gaming hybrid']
        }
    },

    // === RESOLUTION GUIDE ===
    resolutions: {
        '1080p': {
            pixels: '1920 x 1080',
            idealSize: '24 inch',
            gpuTier: 'Entry/Mid (RTX 4060 / RX 7600)',
            note: 'Avoid 27" 1080p (pixelated).'
        },
        '1440p': {
            pixels: '2560 x 1440 (2K)',
            idealSize: '27 inch',
            gpuTier: 'High End (RTX 4070 / RX 7800 XT)',
            note: 'The sweet spot for PC gaming. Best balance of sharpness and FPS.'
        },
        '4K': {
            pixels: '3840 x 2160',
            idealSize: '32 inch+',
            gpuTier: 'Flagship (RTX 4080/4090)',
            note: 'Requires massive GPU power. DLSS is a must.'
        },
        'Ultrawide': {
            pixels: '3440 x 1440 (UWQHD)',
            idealSize: '34 inch',
            gpuTier: 'High End+',
            note: 'Immersive but some games don\'t support 21:9 aspect ratio.'
        }
    },

    // === RECOMMENDATIONS ===
    recommendations: {
        'Esports Competitive': {
            priority: 'Refresh Rate & Motion Clarity',
            topPicks: [
                'BenQ Zowie XL2566K (360Hz TN)',
                'ASUS ROG Swift Pro PG248QP (540Hz)',
                'ViewSonic XG2431 (Best budget motion clarity)'
            ]
        },
        '1440p Sweet Spot': {
            priority: 'Balance of Res, Refresh, and Color',
            topPicks: [
                'LG 27GP850-B (Nano IPS)',
                'Gigabyte M27Q (Budget Value)',
                'MSI MAG274QRF-QD (Wide Color Gamut)',
                'Alienware AW2723DF (280Hz)'
            ]
        },
        'High End Immersion': {
            priority: 'OLED / HDR',
            topPicks: [
                'Alienware AW3423DWF (QD-OLED Ultrawide)',
                'LG 27GR95QE-B (27" 240Hz OLED)',
                'Samsung Odyssey Neo G8 (4K 240Hz Mini-LED)',
                'ASUS ROG Swift OLED PG32UCDM (4K 240Hz QD-OLED)'
            ]
        },
        'Productivity': {
            priority: 'Resolution & Real Estate',
            topPicks: [
                'Dell UltraSharp U2723QE (4K IPS Black)',
                'LG DualUp (Unique 16:18 aspect ratio)'
            ]
        }
    }
};

export default MONITOR_KNOWLEDGE;
