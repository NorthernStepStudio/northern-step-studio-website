/**
 * ❄️ KNOWLEDGE: Cooling Recommendations
 * 
 * CPU-to-cooler matching based on TDP, socket, and use case.
 */

export const COOLING_RECOMMENDATIONS = {
    // === AIR COOLERS BY TIER ===
    airCoolers: {
        budget: {
            name: 'Budget Air Coolers',
            tdpRange: '65W or less',
            options: [
                { name: 'ID-COOLING SE-214-XT', tdp: 180, price: 20, height: 150, notes: 'Best budget tower' },
                { name: 'Thermalright Peerless Assassin 120 SE', tdp: 200, price: 35, height: 155, notes: 'Budget king, beats $60 coolers' },
                { name: 'DeepCool AK400', tdp: 180, price: 30, height: 155, notes: 'Great value, quiet' },
                { name: 'Arctic Freezer 34 eSports Duo', tdp: 210, price: 40, height: 157, notes: 'Dual fan, great performance' },
            ],
            bestFor: ['Ryzen 5600/5600X', 'Ryzen 7600X', 'i5-13400F', 'i5-12400F']
        },
        midRange: {
            name: 'Mid-Range Air Coolers',
            tdpRange: '125-165W',
            options: [
                { name: 'Thermalright Peerless Assassin 120', tdp: 260, price: 45, height: 155, notes: 'Best value overall' },
                { name: 'DeepCool AK620', tdp: 260, price: 55, height: 160, notes: 'Dual tower, very quiet' },
                { name: 'Noctua NH-U12S Redux', tdp: 200, price: 50, height: 158, notes: 'Noctua quality, compact' },
                { name: 'be quiet! Dark Rock 4', tdp: 200, price: 75, height: 159, notes: 'Silent, great looks' },
            ],
            bestFor: ['Ryzen 7700X', 'Ryzen 7800X3D', 'i5-14600K', 'i7-13700K (stock)']
        },
        premium: {
            name: 'Premium Air Coolers',
            tdpRange: '200W+',
            options: [
                { name: 'Noctua NH-D15', tdp: 250, price: 100, height: 165, notes: 'The king of air cooling' },
                { name: 'Noctua NH-D15S chromax.black', tdp: 250, price: 110, height: 160, notes: 'Single fan, better RAM clearance' },
                { name: 'be quiet! Dark Rock Pro 4', tdp: 250, price: 90, height: 163, notes: 'Silent beast' },
                { name: 'DeepCool Assassin IV', tdp: 280, price: 100, height: 164, notes: 'Best thermals in class' },
                { name: 'Thermalright Frost Commander 140', tdp: 300, price: 70, height: 158, notes: 'Amazing value, near NH-D15' },
            ],
            bestFor: ['Ryzen 9 7900X', 'Ryzen 9 7950X', 'i7-14700K', 'i9-14900K (moderate OC)']
        }
    },

    // === AIO LIQUID COOLERS ===
    aioCoolers: {
        '240mm': {
            name: '240mm AIO',
            tdpRange: '125-200W',
            options: [
                { name: 'Arctic Liquid Freezer II 240', price: 90, notes: 'Best value 240mm' },
                { name: 'Corsair H100i Elite', price: 130, notes: 'Great RGB, iCUE software' },
                { name: 'NZXT Kraken 240', price: 150, notes: 'Clean aesthetics, CAM software' },
                { name: 'EK-AIO Basic 240', price: 100, notes: 'Great performance, quiet' },
            ],
            bestFor: ['Ryzen 7700X', 'Ryzen 7800X3D', 'i5-14600K', 'i7-13700K']
        },
        '280mm': {
            name: '280mm AIO',
            tdpRange: '165-250W',
            options: [
                { name: 'Arctic Liquid Freezer II 280', price: 110, notes: 'Best 280mm, quieter than 360' },
                { name: 'NZXT Kraken 280', price: 180, notes: 'LCD screen option' },
                { name: 'Corsair H115i Elite', price: 150, notes: 'Magnetic fan dome' },
                { name: 'be quiet! Pure Loop 2 280', price: 130, notes: 'Very silent' },
            ],
            bestFor: ['Ryzen 9 7900X', 'Ryzen 9 9900X', 'i7-14700K', 'i9-13900K (stock)']
        },
        '360mm': {
            name: '360mm AIO',
            tdpRange: '200W+, power users',
            options: [
                { name: 'Arctic Liquid Freezer II 360', price: 130, notes: 'Best overall value' },
                { name: 'Corsair H150i Elite', price: 180, notes: 'Great RGB ecosystem' },
                { name: 'NZXT Kraken Z63 RGB', price: 280, notes: 'LCD screen, premium' },
                { name: 'EK-AIO 360 D-RGB', price: 160, notes: 'Excellent pump' },
                { name: 'Lian Li Galahad II Trinity 360', price: 170, notes: 'Infinity mirror, looks amazing' },
            ],
            bestFor: ['Ryzen 9 7950X', 'Ryzen 9 9950X', 'i9-14900K', 'i9-14900KS', 'Core Ultra 9 285K']
        },
        '420mm': {
            name: '420mm AIO',
            tdpRange: '250W+ extreme',
            options: [
                { name: 'Arctic Liquid Freezer II 420', price: 150, notes: 'Maximum radiator, quiet' },
            ],
            bestFor: ['Extreme overclocking', 'Workstation thermal headroom']
        }
    },

    // === CPU-SPECIFIC RECOMMENDATIONS ===
    cpuRecommendations: {
        // AMD Zen 5
        'ryzen 9 9950x': {
            minimum: 'DeepCool AK620',
            recommended: 'Arctic Liquid Freezer II 360',
            overkill: 'Custom Loop',
            notes: '170W TDP. 360mm AIO strongly recommended for sustained loads.'
        },
        'ryzen 9 9900x': {
            minimum: 'Thermalright Peerless Assassin 120',
            recommended: 'Arctic Liquid Freezer II 280',
            overkill: '360mm AIO',
            notes: '120W TDP. Efficient, mid-range cooling is fine.'
        },
        'ryzen 7 9700x': {
            minimum: 'Stock Wraith Prism',
            recommended: 'DeepCool AK400',
            overkill: 'NH-D15',
            notes: '65W TDP. Very efficient, stock cooler works.'
        },
        'ryzen 5 9600x': {
            minimum: 'Stock Cooler',
            recommended: 'ID-COOLING SE-214-XT',
            overkill: 'Any tower cooler',
            notes: '65W TDP. Budget cooler is plenty.'
        },
        'ryzen 7 9800x3d': {
            minimum: 'Thermalright PA 120 SE',
            recommended: 'Arctic Liquid Freezer II 240',
            overkill: '360mm AIO',
            notes: 'Gaming-focused. Stays cool under gaming loads.'
        },

        // AMD Zen 4
        'ryzen 9 7950x': {
            minimum: 'DeepCool AK620',
            recommended: 'Arctic Liquid Freezer II 360',
            overkill: 'Custom Loop',
            notes: '170W TDP. Runs HOT. 360mm AIO highly recommended.'
        },
        'ryzen 7 7800x3d': {
            minimum: 'DeepCool AK400',
            recommended: 'Thermalright Peerless Assassin 120',
            overkill: '240mm AIO',
            notes: 'Gaming workloads are light. Mid tower is fine.'
        },

        // Intel Arrow Lake
        'core ultra 9 285k': {
            minimum: 'DeepCool AK620',
            recommended: 'Arctic Liquid Freezer II 360',
            overkill: 'Custom Loop',
            notes: 'New platform, runs cooler than 14th gen. 280-360mm AIO recommended.'
        },
        'core ultra 7 265k': {
            minimum: 'Thermalright PA 120',
            recommended: 'Arctic Liquid Freezer II 280',
            overkill: '360mm AIO',
            notes: 'Efficient chip. Mid-range cooling is fine.'
        },

        // Intel 14th Gen
        'i9-14900k': {
            minimum: 'Arctic Liquid Freezer II 360',
            recommended: '360mm AIO + Undervolting',
            overkill: 'Custom Loop + Delid',
            notes: 'Runs VERY hot (253W). Undervolting recommended. Do NOT use stock settings.'
        },
        'i7-14700k': {
            minimum: 'DeepCool AK620',
            recommended: 'Arctic Liquid Freezer II 280',
            overkill: '360mm AIO',
            notes: 'Hot chip. 280mm AIO recommended for quiet operation.'
        },
        'i5-14600k': {
            minimum: 'Thermalright PA 120 SE',
            recommended: 'DeepCool AK620',
            overkill: '280mm AIO',
            notes: 'Reasonable TDP. Good tower cooler is fine.'
        },
        'i5-13400f': {
            minimum: 'Stock Cooler',
            recommended: 'ID-COOLING SE-214-XT',
            overkill: 'Any tower cooler',
            notes: '65W TDP. Budget cooler works great.'
        }
    },

    // === THERMAL PASTE RECOMMENDATIONS ===
    thermalPaste: {
        budget: [
            { name: 'Arctic MX-4', thermal: 8.5, price: 8, notes: 'Best budget paste' },
            { name: 'Noctua NT-H1', thermal: 8.9, price: 10, notes: 'Easy to apply, long lasting' },
        ],
        performance: [
            { name: 'Thermal Grizzly Kryonaut', thermal: 12.5, price: 12, notes: 'Top performer' },
            { name: 'Noctua NT-H2', thermal: 9.0, price: 15, notes: 'Improved NT-H1' },
            { name: 'Honeywell PTM7950', thermal: 8.5, price: 20, notes: 'Phase change, set and forget' },
        ],
        extreme: [
            { name: 'Thermal Grizzly Conductonaut', thermal: 73, price: 15, notes: 'Liquid metal. ONLY for experts. Can damage components.' },
        ]
    },

    // === CASE AIRFLOW TIPS ===
    airflowTips: [
        'Front fans = INTAKE (pulling air in)',
        'Rear fan = EXHAUST (pushing air out)',
        'Top fans = EXHAUST (heat rises)',
        'Positive pressure (more intake than exhaust) = less dust',
        'Minimum: 2 intake + 1 exhaust',
        'Ideal: 3 intake + 2 exhaust',
        'AIO radiator: Front or top mount are both fine. Top exhaust is slightly better for GPU temps.',
        'Remove unused PCI slot covers for better airflow',
        'Cable management helps airflow significantly',
    ]
};

// Helper to get cooler recommendation for a CPU
export const getCoolerForCPU = (cpuName) => {
    const normalized = cpuName.toLowerCase().replace(/intel\s*/gi, '').replace(/amd\s*/gi, '').trim();
    return COOLING_RECOMMENDATIONS.cpuRecommendations[normalized] || null;
};

// Helper to get cooler by TDP
export const getCoolerByTDP = (tdp, preferAIO = false) => {
    if (preferAIO) {
        if (tdp <= 125) return COOLING_RECOMMENDATIONS.aioCoolers['240mm'];
        if (tdp <= 200) return COOLING_RECOMMENDATIONS.aioCoolers['280mm'];
        return COOLING_RECOMMENDATIONS.aioCoolers['360mm'];
    } else {
        if (tdp <= 100) return COOLING_RECOMMENDATIONS.airCoolers.budget;
        if (tdp <= 165) return COOLING_RECOMMENDATIONS.airCoolers.midRange;
        return COOLING_RECOMMENDATIONS.airCoolers.premium;
    }
};

export default COOLING_RECOMMENDATIONS;
