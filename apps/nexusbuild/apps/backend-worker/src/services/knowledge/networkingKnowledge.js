/**
 * 🌐 NEXUS AI - Networking Deep Dive Knowledge
 *
 * Expert-level networking knowledge including:
 * - WiFi standards (WiFi 5/6/6E/7)
 * - Ethernet (Cat5e/Cat6/Cat6a/Cat7/Cat8)
 * - NICs (network interface cards)
 * - Routers and access points
 * - Latency and online gaming
 * - Network troubleshooting
 * - Mesh systems and extenders
 */

// === WIFI STANDARDS ===
export const WIFI_STANDARDS = {
    overview: {
        description: 'WiFi generations determine max speed, range, and features.',
        naming: 'WiFi 6 = 802.11ax, WiFi 5 = 802.11ac, etc.',
    },

    generations: {
        wifi5: {
            name: 'WiFi 5 (802.11ac)',
            year: 2013,
            maxSpeed: '3.5 Gbps theoretical',
            realWorld: '300-500 Mbps typical',
            frequency: '5 GHz only',
            features: ['MU-MIMO (4 devices)', 'Beamforming'],
            status: 'Outdated but still functional',
            gaming: 'Acceptable for most games',
        },
        wifi6: {
            name: 'WiFi 6 (802.11ax)',
            year: 2019,
            maxSpeed: '9.6 Gbps theoretical',
            realWorld: '500-1000 Mbps typical',
            frequency: '2.4 GHz and 5 GHz',
            features: ['OFDMA', 'MU-MIMO (8 devices)', 'Target Wake Time', '1024-QAM'],
            benefits: ['Better in crowded networks', 'Lower latency', 'Better battery for devices'],
            gaming: 'Excellent for gaming',
        },
        wifi6e: {
            name: 'WiFi 6E',
            year: 2021,
            maxSpeed: '9.6 Gbps theoretical',
            realWorld: '1-2 Gbps typical',
            frequency: '2.4 GHz, 5 GHz, AND 6 GHz',
            features: ['All WiFi 6 features', '6 GHz band (less congestion)', 'More channels'],
            benefits: ['Much less interference', 'More bandwidth', 'Lower latency'],
            gaming: 'Excellent, 6 GHz band is uncrowded',
            requirement: 'Need 6E router AND 6E device',
        },
        wifi7: {
            name: 'WiFi 7 (802.11be)',
            year: 2024,
            maxSpeed: '46 Gbps theoretical',
            realWorld: '2-4 Gbps typical',
            frequency: '2.4 GHz, 5 GHz, 6 GHz',
            features: ['MLO (Multi-Link Operation)', '4096-QAM', '320 MHz channels', '16 spatial streams'],
            benefits: ['Massive bandwidth', 'Ultra-low latency', 'Better reliability'],
            mlo: 'Can use multiple bands simultaneously for redundancy',
            gaming: 'Best possible - sub-2ms latency achievable',
            status: 'Newest standard, premium pricing',
        },
    },

    choosing: {
        budget: 'WiFi 6 is the sweet spot',
        performance: 'WiFi 6E for uncrowded 6 GHz',
        futureProof: 'WiFi 7 if budget allows',
        note: 'Router AND devices need to support the standard',
    },

    gamingRecommendation: {
        best: 'Wired Ethernet is always better for gaming',
        wireless: 'WiFi 6E/7 on 6 GHz band for minimal latency',
        avoid: '2.4 GHz for gaming (congested, high latency)',
    },
};

// === ETHERNET ===
export const ETHERNET = {
    overview: {
        description: 'Wired connection - always better than WiFi for gaming.',
        benefits: ['Lower latency', 'More stable', 'No interference', 'Full speed'],
    },

    categories: {
        cat5e: {
            name: 'Cat5e',
            speed: '1 Gbps',
            maxLength: '100m',
            shielding: 'Usually unshielded (UTP)',
            use: 'Basic home networking, fine for most',
            gaming: 'Perfectly fine for gaming',
            cost: 'Cheapest',
        },
        cat6: {
            name: 'Cat6',
            speed: '1 Gbps (10 Gbps up to 55m)',
            maxLength: '100m (1G) / 55m (10G)',
            shielding: 'Available shielded or unshielded',
            use: 'Standard recommendation',
            gaming: 'Excellent, slight future-proofing',
            cost: 'Slightly more than Cat5e',
        },
        cat6a: {
            name: 'Cat6a',
            speed: '10 Gbps',
            maxLength: '100m at 10 Gbps',
            shielding: 'Usually shielded (STP)',
            use: '10 Gigabit networks, NAS',
            gaming: 'Overkill for gaming, great for file transfers',
            cost: 'Moderate',
        },
        cat7: {
            name: 'Cat7',
            speed: '10 Gbps (up to 100 Gbps short runs)',
            maxLength: '100m',
            shielding: 'Shielded (S/FTP)',
            use: 'Data centers, professional',
            note: 'Not officially recognized by TIA/EIA',
            cost: 'Expensive',
        },
        cat8: {
            name: 'Cat8',
            speed: '25-40 Gbps',
            maxLength: '30m',
            shielding: 'Heavily shielded',
            use: 'Data centers, server rooms',
            gaming: 'Complete overkill',
            cost: 'Very expensive',
        },
    },

    recommendation: {
        gaming: 'Cat5e or Cat6 is plenty',
        nas: 'Cat6a for 10 Gigabit NAS',
        futureProof: 'Cat6 for easy 10G upgrade later',
        avoid: 'Flat cables for long runs (signal degradation)',
    },

    tips: {
        quality: 'Buy from reputable brands (Monoprice, Cable Matters)',
        testing: 'Use cable tester if running through walls',
        powerline: 'Powerline adapters are a last resort (high latency)',
        moca: 'MoCA (coax to Ethernet) is better than powerline',
    },
};

// === NETWORK INTERFACE CARDS ===
export const NETWORK_CARDS = {
    overview: {
        description: 'NIC handles network communication. Most motherboards have built-in.',
        addOn: 'Add-on NICs for faster speeds or WiFi capability.',
    },

    ethernet: {
        onboard: {
            '1 Gbps': 'Standard on all motherboards',
            '2.5 Gbps': 'Common on gaming/mid-range+ boards',
            '10 Gbps': 'High-end boards only',
        },
        controllers: {
            Intel: { quality: 'Excellent', drivers: 'Best stability' },
            Realtek: { quality: 'Good', drivers: 'Occasional issues' },
            Killer: { quality: 'Mixed', drivers: 'Historically buggy, improved recently' },
            Aquantia: { quality: 'Excellent', note: 'Common for 10G' },
        },
    },

    wifi: {
        addOn: {
            description: 'PCIe WiFi cards for desktop WiFi',
            examples: ['TP-Link Archer TX3000E', 'ASUS PCE-AX58BT', 'Intel AX210'],
            features: ['WiFi 6/6E/7', 'Bluetooth included', 'External antennas'],
        },
        m2: {
            description: 'M.2 WiFi modules (some motherboards)',
            examples: ['Intel AX210', 'MediaTek MT7922'],
            note: 'Often included way with WiFi motherboards',
        },
    },

    gaming: {
        myth: 'Gaming NICs don\'t improve latency meaningfully',
        reality: 'Any 1 Gbps NIC is fine for gaming',
        recommendation: 'Use onboard unless you specifically need WiFi or 10G',
    },
};

// === ROUTERS ===
export const ROUTERS = {
    overview: {
        description: 'Router = your gateway to the internet. Quality matters!',
        isp: 'ISP-provided routers are usually mediocre.',
    },

    types: {
        standard: {
            name: 'Standard Router',
            description: 'Single unit, covers small-medium homes',
            range: '1500-2500 sq ft typical',
            examples: ['ASUS RT-AX88U', 'TP-Link Archer AX6000', 'Netgear Nighthawk'],
        },
        mesh: {
            name: 'Mesh System',
            description: 'Multiple units for whole-home coverage',
            range: '3000-6000+ sq ft',
            benefits: ['Seamless roaming', 'Better coverage', 'Self-healing network'],
            examples: ['ASUS ZenWiFi', 'Eero Pro 6E', 'Google Nest WiFi Pro', 'TP-Link Deco'],
            recommendation: 'Best for large homes or multi-story',
        },
        gaming: {
            name: 'Gaming Routers',
            description: 'Routers with QoS and gaming features',
            features: ['Traffic prioritization', 'Low latency modes', 'VPN support'],
            examples: ['ASUS ROG Rapture', 'Netgear Nighthawk Pro Gaming'],
            reality: 'QoS helps if bandwidth is limited, otherwise minimal benefit',
        },
    },

    features: {
        qos: {
            name: 'QoS (Quality of Service)',
            description: 'Prioritize gaming/streaming traffic',
            benefit: 'Reduces latency when network is busy',
        },
        portForwarding: {
            description: 'Open specific ports for games/services',
            use: 'Required for hosting game servers, some P2P games',
        },
        upnp: {
            name: 'UPnP',
            description: 'Automatic port forwarding',
            note: 'Convenient but slight security risk',
        },
        guestNetwork: {
            description: 'Separate network for guests',
            benefit: 'Keeps your main network secure',
        },
    },

    placement: {
        ideal: 'Central location, elevated, not in closet',
        avoid: ['Behind TV', 'In corner', 'Near microwave', 'In closet'],
        antennas: 'Point perpendicular to desired coverage direction',
    },

    recommendedBrands: {
        excellent: ['ASUS', 'Ubiquiti', 'MikroTik'],
        good: ['TP-Link', 'Netgear', 'Eero'],
        avoid: ['Most ISP-provided routers'],
    },
};

// === LATENCY FOR GAMING ===
export const GAMING_LATENCY = {
    overview: {
        description: 'Ping/latency is the delay between you and the game server.',
        measurement: 'Measured in milliseconds (ms)',
    },

    levels: {
        excellent: { range: '< 20ms', experience: 'Competitive viable, no perceivable delay' },
        good: { range: '20-50ms', experience: 'Very playable, slight delay in fast-paced games' },
        acceptable: { range: '50-100ms', experience: 'Noticeable in FPS, fine for most games' },
        poor: { range: '100-150ms', experience: 'Rubber banding possible, disadvantage in FPS' },
        unplayable: { range: '> 150ms', experience: 'Significant delay, not competitive' },
    },

    factors: {
        distance: 'Physical distance to server (can\'t fix)',
        isp: 'Internet service provider quality',
        routing: 'Path data takes (can\'t control)',
        local: 'Your home network setup (you can fix)',
        hardware: 'Router, NIC, cables',
    },

    optimization: {
        wired: 'Use Ethernet instead of WiFi (-5 to -20ms)',
        router: 'Quality router with QoS',
        dns: 'Use fast DNS (Cloudflare 1.1.1.1, Google 8.8.8.8)',
        close: 'Close background apps using bandwidth',
        vpn: 'Gaming VPNs are usually snake oil (may increase latency)',
    },

    bufferBloat: {
        description: 'Excessive buffering causing lag spikes',
        test: 'dslreports.com/speedtest',
        fix: 'Enable SQM/fq_codel on router if available',
    },
};

// === NETWORK TROUBLESHOOTING ===
export const NETWORK_TROUBLESHOOTING = {
    slowSpeeds: {
        symptoms: ['Downloads slower than expected', 'Buffering on streams'],
        checks: [
            'Test with Ethernet (isolate WiFi issues)',
            'Run speed test (speedtest.net, fast.com)',
            'Check for bandwidth-hogging apps',
            'Restart router and modem',
            'Check for ISP outages',
        ],
        solutions: [
            'Move closer to router',
            'Switch to 5 GHz or 6 GHz band',
            'Upgrade router if old',
            'Check ethernet cable quality',
        ],
    },

    highLatency: {
        symptoms: ['High ping in games', 'Delayed responses'],
        checks: [
            'Ping test to game server (ping command)',
            'Check for downloads/uploads in background',
            'Test at different times (peak hours?)',
        ],
        solutions: [
            'Use Ethernet',
            'Enable QoS for gaming traffic',
            'Change WiFi channel (use WiFi analyzer app)',
            'Contact ISP if consistent',
        ],
    },

    disconnections: {
        symptoms: ['Random drops', 'WiFi reconnecting'],
        checks: [
            'Check for interference (microwave, baby monitors)',
            'Check router logs for errors',
            'Test with different device',
        ],
        solutions: [
            'Update router firmware',
            'Change WiFi channel',
            'Replace ethernet cables',
            'Reset network settings on PC',
        ],
    },

    noConnection: {
        symptoms: ['No internet', 'Connected but no access'],
        checks: [
            'Check if issue is router or modem',
            'Check ISP status page',
            'Try different DNS servers',
            'Release/renew IP (ipconfig /release, /renew)',
        ],
        solutions: [
            'Power cycle modem and router (unplug 30 seconds)',
            'Reset network adapter in Windows',
            'Flush DNS (ipconfig /flushdns)',
        ],
    },

    commands: {
        windows: {
            ping: 'ping google.com - Test connectivity',
            tracert: 'tracert google.com - Show network path',
            ipconfig: 'ipconfig /all - Show network config',
            flushdns: 'ipconfig /flushdns - Clear DNS cache',
            release: 'ipconfig /release - Release IP',
            renew: 'ipconfig /renew - Get new IP',
            reset: 'netsh winsock reset - Reset network stack',
        },
    },
};

// === MESH VS EXTENDERS ===
export const MESH_VS_EXTENDERS = {
    meshSystems: {
        description: 'Multiple units create unified network.',
        pros: [
            'Seamless roaming (one network name)',
            'Self-healing (units communicate)',
            'Better coverage',
            'Equal speed throughout',
        ],
        cons: ['More expensive', 'Need multiple units'],
        recommendation: 'Best solution for large/multi-story homes.',
    },

    extenders: {
        description: 'Repeats WiFi signal to extend range.',
        pros: ['Cheaper', 'Simple setup'],
        cons: [
            'Halves bandwidth (repeating)',
            'Creates second network',
            'Handoff issues',
            'Adds latency',
        ],
        avoid: 'Avoid for gaming',
    },

    accessPoints: {
        description: 'Wired backhaul, broadcasts WiFi.',
        pros: [
            'Full speed (wired connection)',
            'Can create seamless roaming',
            'Professional grade',
        ],
        cons: ['Requires ethernet runs'],
        recommendation: 'Best if you can run ethernet to APs.',
    },
};

// === PORT FORWARDING ===
export const PORT_FORWARDING = {
    overview: {
        description: 'Opening specific ports for games/services.',
        use: 'Required for hosting, some NAT issues.',
    },

    commonPorts: {
        steam: { tcp: '27015-27030', udp: '27000-27031' },
        xbox: { tcp: '3074', udp: '3074' },
        playstation: { tcp: '3478-3480', udp: '3478-3479' },
        discord: { udp: '50000-65535' },
        minecraft: { tcp: '25565' },
        valorant: { tcp: '8393-8400', udp: '7000-7500' },
    },

    nat_types: {
        open: 'Best - all features work',
        moderate: 'OK - some restrictions',
        strict: 'Bad - may have connection issues',
        fix: 'Enable UPnP or manually forward ports',
    },

    howTo: {
        steps: [
            '1. Find router IP (usually 192.168.1.1)',
            '2. Login to router admin panel',
            '3. Find Port Forwarding section',
            '4. Add rule with PC IP and ports',
            '5. Save and restart router',
        ],
        static_ip: 'Assign static IP to gaming PC to prevent IP changes.',
    },
};

// === EXPERT HELPER FUNCTIONS ===

/**
 * Get WiFi recommendation
 */
export const getWiFiRecommendation = (useCase) => {
    if (useCase === 'gaming') {
        return {
            best: 'Ethernet',
            wireless: 'WiFi 6E/7 on 6 GHz',
            avoid: '2.4 GHz',
        };
    }
    if (useCase === 'budget') {
        return { recommendation: 'WiFi 6 router', reason: 'Best value' };
    }
    return { recommendation: 'WiFi 6E', reason: 'Future-proof with 6 GHz' };
};

/**
 * Diagnose latency issue
 */
export const diagnoseLatency = (ping) => {
    if (ping < 20) return { status: 'Excellent', action: 'No issues' };
    if (ping < 50) return { status: 'Good', action: 'Acceptable, try Ethernet if needed' };
    if (ping < 100) return { status: 'Fair', action: 'Use Ethernet, check for bandwidth hogs' };
    return { status: 'Poor', action: 'Use Ethernet, restart router, contact ISP' };
};

/**
 * Get cable recommendation
 */
export const getCableRecommendation = (speed) => {
    if (speed <= 1000) return { cable: 'Cat5e or Cat6', note: 'Either is fine for gigabit' };
    if (speed <= 10000) return { cable: 'Cat6a', note: 'Required for 10 Gbps' };
    return { cable: 'Cat8', note: 'For 25-40 Gbps data center use' };
};

export default {
    WIFI_STANDARDS,
    ETHERNET,
    NETWORK_CARDS,
    ROUTERS,
    GAMING_LATENCY,
    NETWORK_TROUBLESHOOTING,
    MESH_VS_EXTENDERS,
    PORT_FORWARDING,
    getWiFiRecommendation,
    diagnoseLatency,
    getCableRecommendation,
};
