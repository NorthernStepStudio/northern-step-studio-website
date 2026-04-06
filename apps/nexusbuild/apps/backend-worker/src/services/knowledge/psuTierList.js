/**
 * ⚡ KNOWLEDGE: Power Supply Unit (PSU) Evaluation
 *
 * Based on PSU Cultists Network Tier List & ATX 3.0 Standards.
 * Safety is priority #1.
 */

export const PSU_KNOWLEDGE = {
    // === STANDARDS ===
    standards: {
        'ATX 3.0 / 3.1': {
            description: 'Latest standard designed for high-power GPUs (RTX 40/50 series).',
            keyFeatures: [
                '12VHPWR / 12V-2x6 Connector (One cable for GPU)',
                'Handles 200% power excursions (spikes)',
                'Better efficiency at low loads'
            ],
            recommendation: 'MUST HAVE for RTX 4070 Ti and above.'
        },
        '80 Plus Ratings': {
            'White/Standard': 'Basic efficiency. Avoid for gaming PCs.',
            'Bronze': 'Budget standard. Okay for build < $800.',
            'Gold': 'The sweet spot. Good efficiency and quality components.',
            'Platinum/Titanium': 'Diminishing returns. Only for silence/efficiency freaks.'
        }
    },

    // === TIER LIST (Simplified) ===
    tiers: {
        'Tier A (High End)': {
            description: 'Top-tier units. Best protections, Japanese capacitors, quiet fans. Required for high-end GPUs.',
            series: [
                'Corsair RMx / RMe / RM / HX / AX (Shift Series)',
                'Seasonic Focus GX / Vertex / Prime',
                'be quiet! Pure Power 12 M / Dark Power',
                'MSI MPG A-G PCIE5',
                'Thermaltake Toughpower GF3',
                'Super Flower Leadex III / V / VI / VII',
                'XPG Core Reactor / Cybercore'
            ]
        },
        'Tier B (Mid Range)': {
            description: 'Reliable units for mid-range builds (RTX 4060/4070, RX 7800 XT).',
            series: [
                'Corsair CX-F RGB',
                'Deepcool PL-D / PN-M',
                'EVGA SuperNOVA GT / GA',
                'Cooler Master MWE Gold V2',
                'ASUS TUF Gaming'
            ]
        },
        'Tier C (Low End)': {
            description: 'Passable for budget builds (iGPU or low power dGPU).',
            series: [
                'Corsair CX (Gray label)',
                'Bifenix Formula Bronze',
                'EVGA BR / BQ',
                'MSI MAG A-BN',
                'Deepcool PK-D'
            ]
        },
        'Tier F (Replace Immediately)': {
            description: 'Dangerous. Fire hazard. Do not use.',
            series: [
                'Armageddon Voltron',
                'Gigabyte P-GM (Exploding model)',
                'Thermaltake Smart 80+ White / RGB',
                'Generic "500W PSU" included with cheap cases',
                'Diner / Diablotek / Logisys / Raidmax (Older models)'
            ]
        }
    },

    // === WATTAGE ESTIMATOR ===
    wattageRules: {
        base: 100, // Motherboard, fans, SSDs
        cpu_buffer: 50,
        gpu_buffer: 100, // Headroom

        estimate: (cpuTdp, gpuTdp) => {
            const total = 100 + cpuTdp + gpuTdp + 100;
            return Math.ceil(total / 50) * 50; // Round up to nearest 50
        }
    },

    // === COMMON MISTAKES ===
    mistakes: [
        'Modular Cables Mixing: NEVER use cables from another PSU. Pinouts are different -> Fried components.',
        'Daisy Chaining GPU Cables: Use separate PCIe cables for high power cards.',
        'Ignoring Tier List: A "Gold" rating does not guarantee quality (only efficiency).',
        'Buying too much: You unlikely need 1200W for a single GPU build.'
    ]
};

export default PSU_KNOWLEDGE;
