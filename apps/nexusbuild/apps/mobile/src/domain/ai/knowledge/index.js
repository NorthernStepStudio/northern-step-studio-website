/**
 * PC Parts Knowledge - Master Index
 *
 * Era-based organization for scalability:
 * - 2025: Next gen (RTX 50, RX 9000, Arrow Lake, Zen 5)
 * - 2020-2024: Current gen (RTX 40, RX 7000, Ryzen 7000, 12-14th gen Intel)
 * - 2015-2019: Previous gen (RTX 20, GTX 10/16, RX 500/5000, Ryzen 1-3000)
 * - 2010-2014: Legacy (GTX 600-900, HD 7000, R9, Haswell, FX)
 * - 2000-2009: Classic (Pentium 4, Core 2 Duo, Athlon, Phenom)
 *
 * Category files:
 * - components/: CPU, GPU, motherboard, RAM, storage, PSU, case, cooler, monitor, keyboard, mouse, laptop, prebuilt
 *
 * Deep Dive Modules:
 * - benchmarks: Game FPS data at different resolutions
 * - cooling: CPU cooler recommendations
 * - budgetBuilds: Pre-configured builds at different price points
 * - overclocking: OC guides for CPU, GPU, RAM
 * - workstation: Video editing, 3D rendering, coding knowledge
 * - monitors: Panel types (OLED/IPS) and buying guide
 * - psuTierList: Safety tiers and ATX 3.0 standards
 * - audio: Headphones, DACs, mics
 * - peripheralsDeepDive: Keyboards (switches) and Mice (sensors)
 * - prebuiltAnalysis: Scam detection and brand tier list
 * - laptopGuide: GPU TGP limits and screen specs
 * - roastMyBuild: Fun mode to critique user builds
 *
 * Future scaling: If any file gets too large, split alphabetically
 */

import { CPU_BY_ERA, CPU_PARTS } from './components/cpu';
import { GPU_BY_ERA, GPU_PARTS } from './components/gpu';
import { MOTHERBOARD_BY_ERA, MOTHERBOARD_PARTS } from './components/motherboard';
import { RAM_BY_ERA, RAM_PARTS } from './components/ram';
import { STORAGE_BY_ERA, STORAGE_PARTS } from './components/storage';
import { PSU_BY_ERA, PSU_PARTS } from './components/psu';
import { CASE_BY_ERA, CASE_PARTS } from './components/case';
import { COOLER_BY_ERA, COOLER_PARTS } from './components/cooler';
import { MONITOR_BY_ERA, MONITOR_PARTS } from './components/monitor';
import { KEYBOARD_BY_ERA, KEYBOARD_PARTS } from './components/keyboard';
import { MOUSE_BY_ERA, MOUSE_PARTS } from './components/mouse';
import { LAPTOP_BY_ERA, LAPTOP_PARTS } from './components/laptop';
import { PREBUILT_BY_ERA, PREBUILT_PARTS } from './components/prebuilt';
import { GUIDE_KNOWLEDGE } from './guides';
import { TERMINOLOGY, TROUBLESHOOTING, COMPATIBILITY, UPGRADE_ADVICE, RESPONSE_PATTERNS, BUILD_ARCHETYPES, GAME_FPS_DATA, COMMON_MISTAKES, PRO_TIPS } from './general';
import { SYNONYM_MAP } from './synonyms';

// New knowledge modules
import { GAME_BENCHMARKS, getFPS, findGPUForFPS } from './benchmarks';
import { COOLING_RECOMMENDATIONS, getCoolerForCPU, getCoolerByTDP } from './cooling';
import { BUDGET_BUILDS, findBuildByBudget, findBuildByTarget } from './budgetBuilds';
import { OVERCLOCKING_GUIDE, getOCGuideForCPU, getSafeTemp } from './overclocking';
import { WORKSTATION_KNOWLEDGE } from './workstation';
import { MONITOR_KNOWLEDGE } from './monitors';
import { PSU_KNOWLEDGE } from './psuTierList';
import { AUDIO_KNOWLEDGE } from './audio';
import { PERIPHERALS_DEEP_DIVE } from './peripheralsDeepDive';
import { PREBUILT_KNOWLEDGE } from './prebuiltAnalysis';
import { LAPTOP_KNOWLEDGE } from './laptopGuide';
import { ROAST_LOGIC } from './roastMyBuild';

// === NEW DEEP DIVE MODULES (Expert Knowledge) ===
import * as CPU_DEEP_DIVE from './cpuDeepDive';
import * as GPU_DEEP_DIVE from './gpuDeepDive';
import * as MOBO_DEEP_DIVE from './motherboardDeepDive';
import * as RAM_DEEP_DIVE from './ramDeepDive';
import * as STORAGE_DEEP_DIVE from './storageDeepDive';
import * as PSU_DEEP_DIVE from './psuDeepDive';
import * as COOLING_DEEP_DIVE from './coolingDeepDive';
import * as CASE_DEEP_DIVE from './caseDeepDive';
import * as SYSTEM_ARCHITECTURE from './systemArchitecture';
import { ALL_PARTS, searchParts, formatPartInfo } from './components';

// Export general knowledge for AI
export { TERMINOLOGY, TROUBLESHOOTING, COMPATIBILITY, UPGRADE_ADVICE, RESPONSE_PATTERNS, BUILD_ARCHETYPES, GAME_FPS_DATA, COMMON_MISTAKES, PRO_TIPS, GUIDE_KNOWLEDGE, SYNONYM_MAP };

// Export new knowledge modules
export { GAME_BENCHMARKS, getFPS, findGPUForFPS };
export { COOLING_RECOMMENDATIONS, getCoolerForCPU, getCoolerByTDP };
export { BUDGET_BUILDS, findBuildByBudget, findBuildByTarget };
export { OVERCLOCKING_GUIDE, getOCGuideForCPU, getSafeTemp };
export { WORKSTATION_KNOWLEDGE, MONITOR_KNOWLEDGE, PSU_KNOWLEDGE, AUDIO_KNOWLEDGE, PERIPHERALS_DEEP_DIVE };
export { PREBUILT_KNOWLEDGE, LAPTOP_KNOWLEDGE, ROAST_LOGIC };

export { ALL_PARTS, searchParts, formatPartInfo };

// === EXPORT NEW DEEP DIVE MODULES (Expert Knowledge) ===
export { CPU_DEEP_DIVE, GPU_DEEP_DIVE, MOBO_DEEP_DIVE, RAM_DEEP_DIVE };
export { STORAGE_DEEP_DIVE, PSU_DEEP_DIVE, COOLING_DEEP_DIVE, CASE_DEEP_DIVE };
export { SYSTEM_ARCHITECTURE };

// Convenience re-exports for common deep dive functions
export const { explainConcept: explainCPUConcept, getCacheInfo, getOCPotential } = CPU_DEEP_DIVE;
export const { getArchitectureInfo, getRecommendedPSU: getGPUPSU, compareUpscaling } = GPU_DEEP_DIVE;
export const { getChipsetRecommendation, checkVRMAdequacy, explainMoboTerm } = MOBO_DEEP_DIVE;
export const { calculateTrueLatency, compareRAM, getOptimalRAM, explainRAMTerm } = RAM_DEEP_DIVE;
export const { getStorageRecommendation, explainStorageTerm } = STORAGE_DEEP_DIVE;
export const { getPSURecommendation, explainPSUTerm } = PSU_DEEP_DIVE;
export const { getCoolerRecommendation, explainCoolingTerm, checkTemperature } = COOLING_DEEP_DIVE;
export const { checkGPUFit, getCaseRecommendation, explainCaseTerm } = CASE_DEEP_DIVE;
export const { analyzeBalance, getRecommendedPairing, explainSystemTerm } = SYSTEM_ARCHITECTURE;

const buildEraParts = (eraKey) => ({
    ...(CPU_BY_ERA[eraKey] || {}),
    ...(GPU_BY_ERA[eraKey] || {}),
    ...(MOTHERBOARD_BY_ERA[eraKey] || {}),
    ...(RAM_BY_ERA[eraKey] || {}),
    ...(STORAGE_BY_ERA[eraKey] || {}),
    ...(PSU_BY_ERA[eraKey] || {}),
    ...(CASE_BY_ERA[eraKey] || {}),
    ...(COOLER_BY_ERA[eraKey] || {}),
    ...(MONITOR_BY_ERA[eraKey] || {}),
    ...(KEYBOARD_BY_ERA[eraKey] || {}),
    ...(MOUSE_BY_ERA[eraKey] || {}),
    ...(LAPTOP_BY_ERA[eraKey] || {}),
    ...(PREBUILT_BY_ERA[eraKey] || {}),
});

const ERA_PARTS = {
    '2000-2009': buildEraParts('2000-2009'),
    '2010-2014': buildEraParts('2010-2014'),
    '2015-2019': buildEraParts('2015-2019'),
    '2020-2024': buildEraParts('2020-2024'),
    '2025': buildEraParts('2025'),
};

// Era metadata for UI display
export const ERAS = {
    era2000: { name: '2000-2009', parts: ERA_PARTS['2000-2009'], count: Object.keys(ERA_PARTS['2000-2009'] || {}).length },
    era2010: { name: '2010-2014', parts: ERA_PARTS['2010-2014'], count: Object.keys(ERA_PARTS['2010-2014'] || {}).length },
    era2015: { name: '2015-2019', parts: ERA_PARTS['2015-2019'], count: Object.keys(ERA_PARTS['2015-2019'] || {}).length },
    era2020: { name: '2020-2024', parts: ERA_PARTS['2020-2024'], count: Object.keys(ERA_PARTS['2020-2024'] || {}).length },
    era2025: { name: '2025', parts: ERA_PARTS['2025'], count: Object.keys(ERA_PARTS['2025'] || {}).length },
};

/**
 * Get stats about the knowledge base
 */
export const getKnowledgeStats = () => ({
    totalParts: Object.keys(ALL_PARTS || {}).length,
    byCategory: {
        CPU: Object.keys(CPU_PARTS || {}).length,
        GPU: Object.keys(GPU_PARTS || {}).length,
        Motherboard: Object.keys(MOTHERBOARD_PARTS || {}).length,
        RAM: Object.keys(RAM_PARTS || {}).length,
        Storage: Object.keys(STORAGE_PARTS || {}).length,
        PSU: Object.keys(PSU_PARTS || {}).length,
        Case: Object.keys(CASE_PARTS || {}).length,
        Cooler: Object.keys(COOLER_PARTS || {}).length,
        Monitor: Object.keys(MONITOR_PARTS || {}).length,
        Keyboard: Object.keys(KEYBOARD_PARTS || {}).length,
        Mouse: Object.keys(MOUSE_PARTS || {}).length,
        Laptop: Object.keys(LAPTOP_PARTS || {}).length,
        Prebuilt: Object.keys(PREBUILT_PARTS || {}).length,
    },
    byEra: {
        '2000-2009': Object.keys(ERA_PARTS['2000-2009'] || {}).length,
        '2010-2014': Object.keys(ERA_PARTS['2010-2014'] || {}).length,
        '2015-2019': Object.keys(ERA_PARTS['2015-2019'] || {}).length,
        '2020-2024': Object.keys(ERA_PARTS['2020-2024'] || {}).length,
        '2025': Object.keys(ERA_PARTS['2025'] || {}).length,
    },
});

export default {
    ALL_PARTS,
    ERAS,
    searchParts,
    formatPartInfo,
    getKnowledgeStats,
    TROUBLESHOOTING,
};
