/**
 * Parts Database 9 - Premium & Enthusiast Edition (2025)
 * Flagship GPUs, Boutique Cases, High-End Workstation Gear
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// FLAGSHIP GPUs (Rich & Premium Variants)
// ============================================================================
export const PREMIUM_GPUS: PartSpec[] = [
    { id: 13001, name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition', category: 'GPU', brand: 'ASUS', price: 1999, releaseYear: 2024, rating: 5.0, popularity: 99, specs: { vram: '24GB', type: 'GDDR6X', clock: '2640 MHz', length: '357mm', psu: '1000W', hdmi: 2, dp: 3, notes: 'Premium builds, maximum cooling' } },
    { id: 13002, name: 'MSI GeForce RTX 4090 SUPRIM LIQUID X', category: 'GPU', brand: 'MSI', price: 1899, releaseYear: 2024, rating: 4.9, popularity: 92, specs: { vram: '24GB', type: 'GDDR6X', clock: '2640 MHz', length: '280mm', psu: '1000W', hdmi: 1, dp: 3, notes: 'Integrated AIO liquid cooling' } },
    { id: 13003, name: 'Gigabyte AORUS GeForce RTX 4080 Super MASTER', category: 'GPU', brand: 'Gigabyte', price: 1149, releaseYear: 2024, rating: 4.8, popularity: 88, specs: { vram: '16GB', type: 'GDDR6X', clock: '2595 MHz', length: '342mm', psu: '850W', hdmi: 1, dp: 3 } },
    { id: 13004, name: 'EVGA GeForce RTX 3090 Ti FTW3 Ultra', category: 'GPU', brand: 'EVGA', price: 1099, releaseYear: 2022, rating: 4.9, popularity: 75, specs: { vram: '24GB', type: 'GDDR6X', clock: '1920 MHz', length: '300mm', psu: '850W', hdmi: 1, dp: 3 } },
    { id: 13005, name: 'ASUS ProArt GeForce RTX 4080 Super', category: 'GPU', brand: 'ASUS', price: 1049, releaseYear: 2024, rating: 4.9, popularity: 80, specs: { vram: '16GB', type: 'GDDR6X', clock: '2580 MHz', length: '300mm', psu: '750W', hdmi: 1, dp: 3, notes: 'Designed for workstations, slim design' } },
];

// ============================================================================
// PREMIUM CASES (Boutique & Performance)
// ============================================================================
export const PREMIUM_CASES: PartSpec[] = [
    { id: 13101, name: 'Lian Li O11 Dynamic EVO XL', category: 'Case', brand: 'Lian Li', price: 234, releaseYear: 2024, rating: 4.9, popularity: 96, specs: { formFactor: 'Full Tower', type: 'Showcase', includedFans: 0, radiatorSupport: '420mm', maxGpu: '460mm', sidePanel: 'Tempered Glass' } },
    { id: 13102, name: 'Fractal Design North XL', category: 'Case', brand: 'Fractal', price: 179, releaseYear: 2024, rating: 5.0, popularity: 97, specs: { formFactor: 'ATX', type: 'Mid Tower', includedFans: 2, radiatorSupport: '420mm', maxGpu: '413mm', sidePanel: 'Mesh/TG', notes: 'Real walnut/oak front panel' } },
    { id: 13103, name: 'Phanteks NV9 Premium Showcase', category: 'Case', brand: 'Phanteks', price: 249, releaseYear: 2024, rating: 4.8, popularity: 90, specs: { formFactor: 'Full Tower', type: 'Showcase', includedFans: 0, radiatorSupport: '420mm', maxGpu: '490mm', sidePanel: 'Tempered Glass' } },
    { id: 13104, name: 'Corsair 6500X Dual Chamber', category: 'Case', brand: 'Corsair', price: 199, releaseYear: 2024, rating: 4.7, popularity: 93, specs: { formFactor: 'ATX', type: 'Dual Chamber', includedFans: 0, radiatorSupport: '360mm', maxGpu: '400mm', sidePanel: 'Tempered Glass' } },
];

// ============================================================================
// HIGH-END COOLING & POWER
// ============================================================================
export const PREMIUM_COOLING: PartSpec[] = [
    { id: 13201, name: 'NZXT Kraken Elite 360 RGB', category: 'Cooling', brand: 'NZXT', price: 279, releaseYear: 2024, rating: 4.9, popularity: 98, specs: { type: 'AIO', size: '360mm', fans: 3, socket: 'AM5/LGA1700/1851', lcd: true, notes: '2.36" Wide-Angle LCD Screen' } },
    { id: 13202, name: 'Corsair iCUE Link H150i LCD', category: 'Cooling', brand: 'Corsair', price: 289, releaseYear: 2024, rating: 4.8, popularity: 95, specs: { type: 'AIO', size: '360mm', fans: 3, socket: 'AM5/LGA1700/1851', lcd: true, notes: 'iCUE Link ecosystem' } },
    { id: 13203, name: 'Noctua NH-D15 G2', category: 'Cooling', brand: 'Noctua', price: 149, releaseYear: 2024, rating: 5.0, popularity: 94, specs: { type: 'Air', size: '140mm', fans: 2, socket: 'AM5/LGA1700/1851', tdp: 300 } },
];

export const PREMIUM_PSUS: PartSpec[] = [
    { id: 13301, name: 'Seasonic PRIME TX-1600 ATX 3.0', category: 'PSU', brand: 'Seasonic', price: 499, releaseYear: 2024, rating: 5.0, popularity: 85, specs: { wattage: 1600, efficiency: '80+ Titanium', type: 'Full Modular', pcie5: true } },
    { id: 13302, name: 'Corsair RM1200x Shift', category: 'PSU', brand: 'Corsair', price: 239, releaseYear: 2023, rating: 4.8, popularity: 90, specs: { wattage: 1200, efficiency: '80+ Gold', type: 'Full Modular', pcie5: true, notes: 'Side-mounted connectors' } },
    { id: 13303, name: 'be quiet! Dark Power Pro 13 1300W', category: 'PSU', brand: 'be quiet!', price: 399, releaseYear: 2023, rating: 4.9, popularity: 82, specs: { wattage: 1300, efficiency: '80+ Titanium', type: 'Full Modular', pcie5: true } },
];

// ============================================================================
// ULTRA-FAST RAM & STORAGE
// ============================================================================
export const PREMIUM_RAM: PartSpec[] = [
    { id: 13401, name: 'G.Skill Trident Z5 RGB 64GB DDR5-8000', category: 'RAM', brand: 'G.Skill', price: 359, releaseYear: 2024, rating: 4.7, popularity: 80, specs: { capacity: '64GB', modules: '2x32GB', speed: 8000, type: 'DDR5', timing: 'CL38-48-48-128', voltage: 1.45, rgb: true } },
    { id: 13402, name: 'TeamGroup T-Force Delta RGB 48GB DDR5-7200', category: 'RAM', brand: 'TeamGroup', price: 199, releaseYear: 2024, rating: 4.8, popularity: 85, specs: { capacity: '48GB', modules: '2x24GB', speed: 7200, type: 'DDR5', timing: 'CL34-42-42-84', voltage: 1.40, rgb: true } },
];

export const PREMIUM_STORAGE: PartSpec[] = [
    { id: 13501, name: 'Samsung 990 Pro 4TB with Heatsink', category: 'Storage', brand: 'Samsung', price: 349, releaseYear: 2024, rating: 5.0, popularity: 98, specs: { capacity: '4TB', type: 'NVMe Gen4', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s' } },
    { id: 13502, name: 'Crucial T705 2TB Gen5 NVMe', category: 'Storage', brand: 'Crucial', price: 299, releaseYear: 2024, rating: 4.8, popularity: 90, specs: { capacity: '2TB', type: 'NVMe Gen5', readSpeed: '14500 MB/s', writeSpeed: '12700 MB/s' } },
];

export const ALL_PREMIUM_PARTS = [
    ...PREMIUM_GPUS,
    ...PREMIUM_CASES,
    ...PREMIUM_COOLING,
    ...PREMIUM_PSUS,
    ...PREMIUM_RAM,
    ...PREMIUM_STORAGE,
];
