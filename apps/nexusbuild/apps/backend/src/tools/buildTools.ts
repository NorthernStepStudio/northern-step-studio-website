/**
 * Build Tools
 * Tools for checking PC build compatibility and estimating power requirements
 */

// Build input shape - maps category to part name/id
export interface BuildInput {
    cpu?: string;
    gpu?: string;
    motherboard?: string;
    ram?: string;
    storage?: string;
    psu?: string;
    case?: string;
    cooling?: string;
}

// Compatibility check result
export interface CompatibilityResult {
    ok: boolean;
    issues: string[];
    warnings: string[];
}

// Wattage estimation result
export interface WattageResult {
    watts_recommended: number;
    breakdown: Record<string, number>;
    notes: string[];
}

// Socket compatibility data
const CPU_SOCKETS: Record<string, string> = {
    // AMD
    'ryzen 9 7950x': 'AM5',
    'ryzen 9 7900x': 'AM5',
    'ryzen 7 7800x3d': 'AM5',
    'ryzen 7 7700x': 'AM5',
    'ryzen 5 7600x': 'AM5',
    'ryzen 5 7600': 'AM5',
    'ryzen 9 5950x': 'AM4',
    'ryzen 9 5900x': 'AM4',
    'ryzen 7 5800x3d': 'AM4',
    'ryzen 7 5800x': 'AM4',
    'ryzen 5 5600x': 'AM4',
    // Intel
    'core i9-14900k': 'LGA1700',
    'core i9-13900k': 'LGA1700',
    'core i7-14700k': 'LGA1700',
    'core i7-13700k': 'LGA1700',
    'core i5-14600k': 'LGA1700',
    'core i5-13600k': 'LGA1700',
    'core i5-14400f': 'LGA1700',
    'core i5-12400f': 'LGA1700',
};

const MOBO_SOCKETS: Record<string, string> = {
    // AM5 boards
    'b650': 'AM5',
    'x670': 'AM5',
    'b650e': 'AM5',
    'x670e': 'AM5',
    // AM4 boards
    'b550': 'AM4',
    'x570': 'AM4',
    'b450': 'AM4',
    // Intel LGA1700 boards
    'b760': 'LGA1700',
    'z790': 'LGA1700',
    'b660': 'LGA1700',
    'z690': 'LGA1700',
    // Intel LGA1200 boards
    'b560': 'LGA1200',
    'z590': 'LGA1200',
};

// RAM generation detection
const DDR_GENERATIONS: Record<string, 'DDR4' | 'DDR5'> = {
    'ddr5': 'DDR5',
    'ddr4': 'DDR4',
};

// Approximate TDP values (watts)
const COMPONENT_TDP: Record<string, number> = {
    // CPUs
    'ryzen 9 7950x': 170,
    'ryzen 9 7900x': 170,
    'ryzen 7 7800x3d': 120,
    'ryzen 7 7700x': 105,
    'ryzen 5 7600x': 105,
    'core i9-14900k': 253,
    'core i9-13900k': 253,
    'core i7-14700k': 253,
    'core i7-13700k': 253,
    'core i5-14600k': 181,
    'core i5-13600k': 181,
    // GPUs
    'rtx 4090': 450,
    'rtx 4080 super': 320,
    'rtx 4080': 320,
    'rtx 4070 ti super': 285,
    'rtx 4070 ti': 285,
    'rtx 4070 super': 220,
    'rtx 4070': 200,
    'rtx 4060 ti': 165,
    'rtx 4060': 115,
    'rx 7900 xtx': 355,
    'rx 7900 xt': 315,
    'rx 7800 xt': 263,
    'rx 7700 xt': 245,
    'rx 7600': 165,
    // Base system (mobo, ram, storage, fans)
    'base': 100,
};

/**
 * Check if a build is compatible
 * @param build - Map of component categories to part names
 */
export function checkCompatibility(build: BuildInput): CompatibilityResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    const cpuName = build.cpu?.toLowerCase() || '';
    const moboName = build.motherboard?.toLowerCase() || '';
    const ramName = build.ram?.toLowerCase() || '';

    // Check CPU/Motherboard socket compatibility
    let cpuSocket: string | undefined;
    let moboSocket: string | undefined;

    for (const [cpuKey, socket] of Object.entries(CPU_SOCKETS)) {
        if (cpuName.includes(cpuKey)) {
            cpuSocket = socket;
            break;
        }
    }

    for (const [moboKey, socket] of Object.entries(MOBO_SOCKETS)) {
        if (moboName.includes(moboKey)) {
            moboSocket = socket;
            break;
        }
    }

    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
        issues.push(`Socket mismatch: CPU uses ${cpuSocket} but motherboard uses ${moboSocket}`);
    }

    // Check RAM compatibility (DDR4 vs DDR5)
    let ramGen: 'DDR4' | 'DDR5' | undefined;
    for (const [key, gen] of Object.entries(DDR_GENERATIONS)) {
        if (ramName.includes(key)) {
            ramGen = gen;
            break;
        }
    }

    // AM5 and LGA1700 support DDR5, AM4 requires DDR4
    if (ramGen && moboSocket) {
        if (moboSocket === 'AM4' && ramGen === 'DDR5') {
            issues.push('RAM incompatible: AM4 motherboards only support DDR4');
        }
        if (moboSocket === 'AM5' && ramGen === 'DDR4') {
            issues.push('RAM incompatible: AM5 motherboards only support DDR5');
        }
        // LGA1700 can support both depending on specific board
        if (moboSocket === 'LGA1700' && ramGen === 'DDR4') {
            warnings.push('Note: Make sure your motherboard supports DDR4 (some LGA1700 boards are DDR5-only)');
        }
    }

    // PSU wattage warning
    if (build.psu && build.gpu) {
        const gpuName = build.gpu.toLowerCase();
        if ((gpuName.includes('4090') || gpuName.includes('4080')) &&
            build.psu.toLowerCase().includes('650w')) {
            warnings.push('Consider a higher wattage PSU (850W+) for RTX 40 series high-end cards');
        }
    }

    return {
        ok: issues.length === 0,
        issues,
        warnings,
    };
}

/**
 * Estimate total system wattage
 * @param build - Map of component categories to part names
 */
export function estimateWattage(build: BuildInput): WattageResult {
    const breakdown: Record<string, number> = {};
    const notes: string[] = [];
    let totalTdp = 0;

    // CPU
    if (build.cpu) {
        const cpuLower = build.cpu.toLowerCase();
        let cpuTdp = 100; // default
        for (const [key, tdp] of Object.entries(COMPONENT_TDP)) {
            if (cpuLower.includes(key)) {
                cpuTdp = tdp;
                break;
            }
        }
        breakdown['CPU'] = cpuTdp;
        totalTdp += cpuTdp;
    }

    // GPU
    if (build.gpu) {
        const gpuLower = build.gpu.toLowerCase();
        let gpuTdp = 200; // default
        for (const [key, tdp] of Object.entries(COMPONENT_TDP)) {
            if (gpuLower.includes(key)) {
                gpuTdp = tdp;
                break;
            }
        }
        breakdown['GPU'] = gpuTdp;
        totalTdp += gpuTdp;
    }

    // Base system (motherboard, RAM, storage, fans)
    breakdown['Base System'] = COMPONENT_TDP['base'];
    totalTdp += COMPONENT_TDP['base'];

    // Add 20% overhead for transient spikes
    const overhead = Math.round(totalTdp * 0.2);
    breakdown['Overhead (20%)'] = overhead;
    totalTdp += overhead;

    // Round up to nearest 50W for PSU recommendation
    const recommended = Math.ceil(totalTdp / 50) * 50;

    // Notes based on components
    if (build.gpu?.toLowerCase().includes('4090')) {
        notes.push('RTX 4090 has high transient power spikes - 1000W+ PSU recommended for stability');
    }
    // Note: Removed >700W warning to prevent AI from misinterpreting it as an overheating issue

    return {
        watts_recommended: recommended,
        breakdown,
        notes,
    };
}
