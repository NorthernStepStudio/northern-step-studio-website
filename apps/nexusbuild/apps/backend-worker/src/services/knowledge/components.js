/**
 * Nexus Components Catalog
 *
 * Central place for component data lookup + formatting.
 * This keeps Nexus AI stable when the knowledge base grows.
 */

import { CPU_PARTS } from './components/cpu';
import { GPU_PARTS } from './components/gpu';
import { MOTHERBOARD_PARTS } from './components/motherboard';
import { RAM_PARTS } from './components/ram';
import { STORAGE_PARTS } from './components/storage';
import { PSU_PARTS } from './components/psu';
import { CASE_PARTS } from './components/case';
import { COOLER_PARTS } from './components/cooler';
import { MONITOR_PARTS } from './components/monitor';
import { KEYBOARD_PARTS } from './components/keyboard';
import { MOUSE_PARTS } from './components/mouse';
import { LAPTOP_PARTS } from './components/laptop';
import { PREBUILT_PARTS } from './components/prebuilt';

// Category-first components (new additions go here).
// Keys should be lowercase lookup strings.
export const CATEGORY_COMPONENTS = {
    ...(CPU_PARTS || {}),
    ...(GPU_PARTS || {}),
    ...(MOTHERBOARD_PARTS || {}),
    ...(RAM_PARTS || {}),
    ...(STORAGE_PARTS || {}),
    ...(PSU_PARTS || {}),
    ...(CASE_PARTS || {}),
    ...(COOLER_PARTS || {}),
    ...(MONITOR_PARTS || {}),
    ...(KEYBOARD_PARTS || {}),
    ...(MOUSE_PARTS || {}),
    ...(LAPTOP_PARTS || {}),
    ...(PREBUILT_PARTS || {}),
};

// Combine all parts into single lookup (newest first for priority)
export const ALL_PARTS = {
    ...(CATEGORY_COMPONENTS || {}),
};

/**
 * Search for a part by name/keyword
 */
export const searchParts = (query) => {
    if (!query) return null;
    const lower = query.toLowerCase().trim()
        .replace(/nvidia\s*/gi, '')
        .replace(/amd\s*/gi, '')
        .replace(/intel\s*/gi, '')
        .replace(/geforce\s*/gi, '')
        .replace(/radeon\s*/gi, '')
        .replace(/core\s*/gi, '')
        .trim();

    // Direct match
    if (ALL_PARTS[lower]) {
        return ALL_PARTS[lower];
    }

    // Fuzzy search
    const matches = [];
    for (const [key, part] of Object.entries(ALL_PARTS || {})) {
        const partName = part.name?.toLowerCase() || '';
        if (key.includes(lower) || partName.includes(lower)) {
            matches.push({ ...part, _key: key });
        }
    }

    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return matches;
    return null;
};

/**
 * Format part info as readable text for Nexus AI
 */
export const formatPartInfo = (part) => {
    if (!part) return null;

    let text = `## ${part.name}\n\n`;

    // Basic info line
    const infoParts = [];
    if (part.type) infoParts.push(`**${part.type}**`);
    if (part.architecture) infoParts.push(part.architecture);
    if (part.year) infoParts.push(`(${part.year})`);
    if (infoParts.length) text += `${infoParts.join(' • ')}\n\n`;

    // Price
    if (part.msrp) text += `MSRP: $${part.msrp}\n`;

    // GPU Specs
    if (part.vram) text += `VRAM: ${part.vram}\n`;
    if (part.cudaCores) text += `CUDA Cores: ${part.cudaCores.toLocaleString()}\n`;
    if (part.streamProcessors) text += `Stream Processors: ${part.streamProcessors.toLocaleString()}\n`;
    if (part.xeCores) text += `Xe Cores: ${part.xeCores}\n`;
    if (part.rtCores) text += `RT Cores: ${part.rtCores}\n`;

    // CPU Specs
    if (part.cores) text += `Cores/Threads: ${part.cores}/${part.threads || part.cores * 2}\n`;
    if (part.baseClock) text += `Base Clock: ${part.baseClock}\n`;
    if (part.boostClock) text += `Boost Clock: ${part.boostClock}\n`;
    if (part.cache) text += `Cache: ${part.cache}\n`;
    if (part.socket) text += `Socket: ${part.socket}\n`;

    // Power
    if (part.tdp) text += `TDP: ${part.tdp}W\n`;
    if (part.psu) text += `PSU Recommendation: ${part.psu}\n`;
    if (part.cooler) text += `Cooler: ${part.cooler}\n`;

    // Performance summary
    if (part.performance) {
        text += `\n### Performance\n${part.performance}\n`;
    }

    // Use cases
    if (part.goodFor && part.goodFor.length) {
        text += `\n### Best For\n`;
        part.goodFor.forEach(use => text += `- ${use}\n`);
    }

    // Applications (workstation)
    if (part.applications && part.applications.length) {
        text += `\n### Applications\n`;
        part.applications.forEach(app => text += `- ${app}\n`);
    }

    // Notes
    if (part.notes) {
        text += `\n### Notes\n${part.notes}\n`;
    }

    return text;
};

export default {
    ALL_PARTS,
    CATEGORY_COMPONENTS,
    searchParts,
    formatPartInfo,
};
