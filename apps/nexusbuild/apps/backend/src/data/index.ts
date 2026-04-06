/**
 * Complete Parts Database Export
 * Aggregates all parts from all database files
 * Total: 600+ parts
 */

import { PartSpec, ALL_CPUS, ALL_GPUS } from './partsDatabase';
import { ALL_MOTHERBOARDS, ALL_RAM } from './partsDatabase2';
import { ALL_STORAGE, ALL_PSUS } from './partsDatabase3';
import { ALL_CASES, ALL_COOLING } from './partsDatabase4';
import { ALL_MONITORS } from './partsDatabase5';
import { ALL_FANS, ALL_HDDS, ALL_OLDER_GPUS } from './partsDatabase6';
import { ALL_MORE_CPUS, ALL_MORE_MOTHERBOARDS, ALL_MORE_RAM } from './partsDatabase7';
import { LATEST_CPUS, LATEST_GPUS, LATEST_MOTHERBOARDS, LATEST_CASES, LATEST_COOLING } from './partsDatabase8';

// Re-export PartSpec type
export { PartSpec } from './partsDatabase';

// Export all category arrays
export { ALL_CPUS } from './partsDatabase';
export { ALL_GPUS } from './partsDatabase';
export { ALL_MOTHERBOARDS, ALL_RAM } from './partsDatabase2';
export { ALL_STORAGE, ALL_PSUS } from './partsDatabase3';
export { ALL_CASES, ALL_COOLING } from './partsDatabase4';
export { ALL_MONITORS } from './partsDatabase5';
export { ALL_FANS, ALL_HDDS, ALL_OLDER_GPUS } from './partsDatabase6';
export { ALL_MORE_CPUS, ALL_MORE_MOTHERBOARDS, ALL_MORE_RAM } from './partsDatabase7';
export { LATEST_CPUS, LATEST_GPUS, LATEST_MOTHERBOARDS, LATEST_CASES, LATEST_COOLING } from './partsDatabase8';

// Combined arrays by category
export const COMBINED_CPUS = [...ALL_CPUS, ...ALL_MORE_CPUS, ...LATEST_CPUS];
export const COMBINED_GPUS = [...ALL_GPUS, ...ALL_OLDER_GPUS, ...LATEST_GPUS];
export const COMBINED_MOTHERBOARDS = [...ALL_MOTHERBOARDS, ...ALL_MORE_MOTHERBOARDS, ...LATEST_MOTHERBOARDS];
export const COMBINED_RAM = [...ALL_RAM, ...ALL_MORE_RAM];
export const COMBINED_STORAGE = [...ALL_STORAGE, ...ALL_HDDS];

// Complete parts database - all 600+ parts
export const ALL_PARTS: PartSpec[] = [
    ...ALL_CPUS,
    ...ALL_MORE_CPUS,
    ...LATEST_CPUS,
    ...ALL_GPUS,
    ...ALL_OLDER_GPUS,
    ...LATEST_GPUS,
    ...ALL_MOTHERBOARDS,
    ...ALL_MORE_MOTHERBOARDS,
    ...LATEST_MOTHERBOARDS,
    ...ALL_RAM,
    ...ALL_MORE_RAM,
    ...ALL_STORAGE,
    ...ALL_HDDS,
    ...ALL_PSUS,
    ...ALL_CASES,
    ...LATEST_CASES,
    ...ALL_COOLING,
    ...LATEST_COOLING,
    ...ALL_MONITORS,
    ...ALL_FANS,
];

// Part counts by category
export const PARTS_COUNT = {
    CPUs: COMBINED_CPUS.length,
    GPUs: COMBINED_GPUS.length,
    Motherboards: COMBINED_MOTHERBOARDS.length,
    RAM: COMBINED_RAM.length,
    Storage: COMBINED_STORAGE.length,
    PSUs: ALL_PSUS.length,
    Cases: ALL_CASES.length,
    Cooling: ALL_COOLING.length,
    Monitors: ALL_MONITORS.length,
    Fans: ALL_FANS.length,
    Total: ALL_PARTS.length,
};

// Helper functions
export function getPartById(id: number): PartSpec | undefined {
    return ALL_PARTS.find(p => p.id === id);
}

export function getPartsByCategory(category: string): PartSpec[] {
    return ALL_PARTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

export function searchParts(query: string, options?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    limit?: number;
}): PartSpec[] {
    const lowerQuery = query.toLowerCase();

    let results = ALL_PARTS.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery)
    );

    if (options?.category) {
        results = results.filter(p =>
            p.category.toLowerCase() === options.category!.toLowerCase()
        );
    }

    if (options?.minPrice !== undefined) {
        results = results.filter(p => p.price >= options.minPrice!);
    }

    if (options?.maxPrice !== undefined) {
        results = results.filter(p => p.price <= options.maxPrice!);
    }

    if (options?.brand) {
        results = results.filter(p =>
            p.brand.toLowerCase() === options.brand!.toLowerCase()
        );
    }

    // Sort by popularity (descending)
    results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return results.slice(0, options?.limit || 20);
}

// Get parts for a recommended budget build
export function getBudgetBuild(budget: number, useCase: 'gaming' | 'workstation' | 'streaming' | 'general' = 'gaming'): PartSpec[] {
    // Budget allocation percentages
    const allocation = useCase === 'gaming'
        ? { cpu: 0.18, gpu: 0.40, mobo: 0.10, ram: 0.08, storage: 0.10, psu: 0.08, case: 0.06 }
        : useCase === 'workstation'
            ? { cpu: 0.28, gpu: 0.25, mobo: 0.12, ram: 0.14, storage: 0.10, psu: 0.06, case: 0.05 }
            : { cpu: 0.22, gpu: 0.32, mobo: 0.12, ram: 0.10, storage: 0.10, psu: 0.08, case: 0.06 };

    const parts: PartSpec[] = [];

    // CPU
    const cpuBudget = budget * allocation.cpu;
    const cpu = COMBINED_CPUS.filter(p => p.price <= cpuBudget * 1.1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
    if (cpu) parts.push(cpu);

    // GPU
    const gpuBudget = budget * allocation.gpu;
    const gpu = COMBINED_GPUS.filter(p => p.price <= gpuBudget * 1.1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
    if (gpu) parts.push(gpu);

    // Motherboard (matching CPU socket)
    const moboBudget = budget * allocation.mobo;
    const cpuSocket = cpu?.specs?.socket as string;
    const mobo = COMBINED_MOTHERBOARDS.filter(p =>
        p.price <= moboBudget * 1.1 &&
        (!cpuSocket || (p.specs?.socket as string) === cpuSocket)
    ).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
    if (mobo) parts.push(mobo);

    // RAM (matching DDR type)
    const ramBudget = budget * allocation.ram;
    const ddrType = mobo?.specs?.memory as string;
    const ram = COMBINED_RAM.filter(p =>
        p.price <= ramBudget * 1.1 &&
        (!ddrType || (p.specs?.type as string) === ddrType)
    ).sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
    if (ram) parts.push(ram);

    // Storage (NVMe preferred)
    const storageBudget = budget * allocation.storage;
    const storage = ALL_STORAGE.filter(p => p.price <= storageBudget * 1.1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
    if (storage) parts.push(storage);

    // PSU
    const psuBudget = budget * allocation.psu;
    const psu = ALL_PSUS.filter(p => p.price <= psuBudget * 1.1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
    if (psu) parts.push(psu);

    // Case
    const caseBudget = budget * allocation.case;
    const pcCase = ALL_CASES.filter(p => p.price <= caseBudget * 1.1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
    if (pcCase) parts.push(pcCase);

    return parts;
}

console.log(`[PartsDB] Loaded ${PARTS_COUNT.Total} parts:`, PARTS_COUNT);
