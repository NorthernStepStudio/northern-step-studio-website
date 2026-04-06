/**
 * 🎮 DOMAIN: Builds Branch
 * 
 * Compatibility Checker
 * Checks if a candidate part is compatible with the current build configuration.
 * 
 * Imports from: core/helpers (for getSpec, parseSpecNumber, extractRamType)
 * Imported by: screens/BuilderScreen, screens/PartSelectionScreen
 */

import { getSpec, parseSpecNumber, extractRamType } from '../../core/helpers';

/**
 * Check if a part is compatible with the current build
 * @param {object} part - The part to check
 * @param {object} currentBuild - The current build configuration
 * @returns {{ compatible: boolean, reason?: string }} Compatibility result
 */
export const checkCompatibility = (part, currentBuild) => {
    if (!part || !currentBuild || !currentBuild.parts) return { compatible: true };

    // --- 1. CPU <-> Motherboard (Socket Match) ---
    if (part.category === 'cpu' && currentBuild.parts.motherboard) {
        const cpuSocket = getSpec(part, 'socket');
        const moboSocket = getSpec(currentBuild.parts.motherboard, 'socket');
        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
            return { compatible: false, reason: `Incompatible Socket: CPU is ${cpuSocket}, Motherboard is ${moboSocket}` };
        }
    }

    if (part.category === 'motherboard' && currentBuild.parts.cpu) {
        const moboSocket = getSpec(part, 'socket');
        const cpuSocket = getSpec(currentBuild.parts.cpu, 'socket');
        if (moboSocket && cpuSocket && moboSocket !== cpuSocket) {
            return { compatible: false, reason: `Incompatible Socket: Motherboard is ${moboSocket}, CPU is ${cpuSocket}` };
        }
    }

    // --- 2. RAM <-> Motherboard (DDR Type Match) ---
    if (part.category === 'ram' && currentBuild.parts.motherboard) {
        const ramSpeed = getSpec(part, 'speed') || getSpec(part, 'memory') || getSpec(part, 'type');
        const moboMem = getSpec(currentBuild.parts.motherboard, 'memory') || getSpec(currentBuild.parts.motherboard, 'memory_type');

        const ramType = extractRamType(ramSpeed);
        const moboType = extractRamType(moboMem);

        if (ramType && moboType && ramType !== moboType) {
            return { compatible: false, reason: `Incompatible Memory: RAM is ${ramType}, Motherboard supports ${moboType}` };
        }
    }

    if (part.category === 'motherboard' && currentBuild.parts.ram) {
        const moboMem = getSpec(part, 'memory') || getSpec(part, 'memory_type');
        const ramSpeed = getSpec(currentBuild.parts.ram, 'speed') || getSpec(currentBuild.parts.ram, 'memory') || getSpec(currentBuild.parts.ram, 'type');

        const moboType = extractRamType(moboMem);
        const ramType = extractRamType(ramSpeed);

        if (moboType && ramType && ramType !== moboType) {
            return { compatible: false, reason: `Incompatible Memory: Motherboard supports ${moboType}, RAM is ${ramType}` };
        }
    }

    // --- 3. Case <-> GPU (Length Clearance) ---
    if (part.category === 'gpu' && currentBuild.parts.case) {
        const gpuLengthStr = getSpec(part, 'length');
        const maxGpuLengthStr = getSpec(currentBuild.parts.case, 'max_gpu_length');

        if (gpuLengthStr && maxGpuLengthStr) {
            const gpuLen = parseSpecNumber(gpuLengthStr);
            const maxLen = parseSpecNumber(maxGpuLengthStr);
            if (gpuLen > maxLen) {
                return { compatible: false, reason: `Clearance Issue: GPU (${gpuLen}mm) exceeds Case limit (${maxLen}mm)` };
            }
        }
    }

    if (part.category === 'case' && currentBuild.parts.gpu) {
        const maxGpuLengthStr = getSpec(part, 'max_gpu_length');
        const gpuLengthStr = getSpec(currentBuild.parts.gpu, 'length');

        if (gpuLengthStr && maxGpuLengthStr) {
            const gpuLen = parseSpecNumber(gpuLengthStr);
            const maxLen = parseSpecNumber(maxGpuLengthStr);
            if (gpuLen > maxLen) {
                return { compatible: false, reason: `Clearance Issue: Case limit (${maxLen}mm) cannot fit GPU (${gpuLen}mm)` };
            }
        }
    }

    // --- 4. PSU <-> System (Wattage Check) ---
    if (part.category === 'psu') {
        const cpuTdpStr = currentBuild.parts.cpu ? getSpec(currentBuild.parts.cpu, 'tdp') : '0W';
        const gpuTdpStr = currentBuild.parts.gpu ? getSpec(currentBuild.parts.gpu, 'tdp') : '0W';

        const cpuWatts = parseSpecNumber(cpuTdpStr);
        const gpuWatts = parseSpecNumber(gpuTdpStr);
        const buffer = 100;
        const requiredWatts = cpuWatts + gpuWatts + buffer;

        const psuWattsStr = getSpec(part, 'wattage');
        const psuWatts = parseSpecNumber(psuWattsStr);

        if (psuWatts < requiredWatts) {
            return { compatible: false, reason: `Insufficient Power: PSU is ${psuWatts}W, Estimated usage is ~${requiredWatts}W` };
        }
    }

    // Also check if adding a high-power part exceeds existing PSU
    if ((part.category === 'cpu' || part.category === 'gpu') && currentBuild.parts.psu) {
        const psuWatts = parseSpecNumber(getSpec(currentBuild.parts.psu, 'wattage'));

        const newCpuWatts = part.category === 'cpu' ? parseSpecNumber(getSpec(part, 'tdp')) : parseSpecNumber(getSpec(currentBuild.parts.cpu, 'tdp'));
        const newGpuWatts = part.category === 'gpu' ? parseSpecNumber(getSpec(part, 'tdp')) : parseSpecNumber(getSpec(currentBuild.parts.gpu, 'tdp'));

        const requiredWatts = newCpuWatts + newGpuWatts + 100;

        if (psuWatts < requiredWatts) {
            return { compatible: false, reason: `Power Alert: Added part raises usage to ~${requiredWatts}W, exceeding PSU ${psuWatts}W` };
        }
    }

    // --- 5. Case <-> Motherboard (Form Factor) ---
    if (part.category === 'case' && currentBuild.parts.motherboard) {
        const caseForm = getSpec(part, 'form_factor') || getSpec(part, 'type');
        const moboForm = getSpec(currentBuild.parts.motherboard, 'form_factor');

        if (caseForm && moboForm) {
            const isItxCase = caseForm.includes('ITX') && !caseForm.includes('Micro');
            const isAtxMobo = moboForm.includes('ATX');

            if (isItxCase && isAtxMobo) {
                return { compatible: false, reason: `Size Mismatch: ITX Case cannot fit ATX Motherboard` };
            }
        }
    }

    if (part.category === 'motherboard' && currentBuild.parts.case) {
        const moboForm = getSpec(part, 'form_factor');
        const caseForm = getSpec(currentBuild.parts.case, 'form_factor') || getSpec(currentBuild.parts.case, 'type');

        if (caseForm && moboForm) {
            const isItxCase = caseForm.includes('ITX') && !caseForm.includes('Micro');
            const isAtxMobo = moboForm.includes('ATX');
            if (isItxCase && isAtxMobo) {
                return { compatible: false, reason: `Size Mismatch: ATX Motherboard won't fit in ITX Case` };
            }
        }
    }

    // --- 6. OVERCLOCKING SUPPORT CHECK ---
    // If CPU is unlocked (K/X series), check if motherboard supports overclocking
    if (part.category === 'cpu' && currentBuild.parts.motherboard) {
        const cpuName = (part.name || '').toUpperCase();
        const isUnlockedCpu = cpuName.includes('K') || cpuName.includes('X3D') ||
            cpuName.includes('7600X') || cpuName.includes('7800X') ||
            cpuName.includes('7900X') || cpuName.includes('7950X');

        if (isUnlockedCpu) {
            const moboName = (currentBuild.parts.motherboard.name || '').toUpperCase();
            const moboChipset = getSpec(currentBuild.parts.motherboard, 'chipset') || moboName;

            // Intel needs Z-series for overclocking
            const isIntel = cpuName.includes('INTEL') || cpuName.includes('I5-') ||
                cpuName.includes('I7-') || cpuName.includes('I9-');
            const hasIntelOCSupport = moboChipset.includes('Z7') || moboChipset.includes('Z6');

            // AMD needs X/B series (most modern AMD boards support OC)
            const isAMD = cpuName.includes('RYZEN') || cpuName.includes('AMD');
            const hasAMDOCSupport = moboChipset.includes('X6') || moboChipset.includes('X5') ||
                moboChipset.includes('B6') || moboChipset.includes('B5');

            if (isIntel && !hasIntelOCSupport && moboChipset.includes('B7')) {
                return { compatible: true, warning: `⚠️ Limited OC: ${cpuName} is unlocked but B-series motherboard limits overclocking potential` };
            }
        }
    }

    if (part.category === 'motherboard' && currentBuild.parts.cpu) {
        const cpuName = (currentBuild.parts.cpu.name || '').toUpperCase();
        const isUnlockedCpu = cpuName.includes('K') || cpuName.includes('X3D') || cpuName.includes('7600X');

        if (isUnlockedCpu) {
            const moboName = (part.name || '').toUpperCase();
            const isIntel = cpuName.includes('INTEL') || cpuName.includes('I5-') ||
                cpuName.includes('I7-') || cpuName.includes('I9-');

            if (isIntel && moboName.includes('B7') && !moboName.includes('Z7')) {
                return { compatible: true, warning: `⚠️ Limited OC: B-series board limits overclocking for your unlocked ${cpuName}` };
            }
        }
    }

    // --- 7. CPU COOLER TDP CHECK ---
    // Check if cooler is rated for CPU's TDP
    if (part.category === 'cooler' && currentBuild.parts.cpu) {
        const cpuTdp = parseSpecNumber(getSpec(currentBuild.parts.cpu, 'tdp'));
        const coolerTdp = parseSpecNumber(getSpec(part, 'tdp') || getSpec(part, 'max_tdp') || getSpec(part, 'rating'));

        if (cpuTdp && coolerTdp && coolerTdp < cpuTdp) {
            return { compatible: false, reason: `Cooling Insufficient: Cooler rated for ${coolerTdp}W, CPU TDP is ${cpuTdp}W` };
        }

        // High TDP CPUs (180W+) need serious cooling
        if (cpuTdp >= 180 && coolerTdp && coolerTdp < 200) {
            return { compatible: true, warning: `⚠️ High TDP CPU (${cpuTdp}W) - Consider stronger cooling for sustained loads` };
        }
    }

    if (part.category === 'cpu' && currentBuild.parts.cooler) {
        const cpuTdp = parseSpecNumber(getSpec(part, 'tdp'));
        const coolerTdp = parseSpecNumber(getSpec(currentBuild.parts.cooler, 'tdp') ||
            getSpec(currentBuild.parts.cooler, 'max_tdp') ||
            getSpec(currentBuild.parts.cooler, 'rating'));

        if (cpuTdp && coolerTdp && coolerTdp < cpuTdp) {
            return { compatible: false, reason: `Cooling Insufficient: Your cooler is rated for ${coolerTdp}W, this CPU needs ${cpuTdp}W` };
        }
    }

    // --- 8. CPU/GPU BALANCE CHECK (Bottleneck Warning) ---
    // Flag potential bottlenecks if there's a significant price/tier mismatch
    if (part.category === 'gpu' && currentBuild.parts.cpu) {
        const cpuPrice = currentBuild.parts.cpu.price || 0;
        const gpuPrice = part.price || 0;

        // High-end GPU with budget CPU = bottleneck warning
        if (gpuPrice > 800 && cpuPrice < 200) {
            return { compatible: true, warning: `⚠️ Potential Bottleneck: High-end GPU ($${gpuPrice}) may be limited by budget CPU ($${cpuPrice})` };
        }
    }

    if (part.category === 'cpu' && currentBuild.parts.gpu) {
        const cpuPrice = part.price || 0;
        const gpuPrice = currentBuild.parts.gpu.price || 0;

        // High-end CPU with budget GPU = imbalanced for gaming
        if (cpuPrice > 400 && gpuPrice < 250) {
            return { compatible: true, warning: `⚠️ Imbalanced for Gaming: High-end CPU ($${cpuPrice}) paired with budget GPU ($${gpuPrice})` };
        }
    }

    return { compatible: true };
};

export default { checkCompatibility };

