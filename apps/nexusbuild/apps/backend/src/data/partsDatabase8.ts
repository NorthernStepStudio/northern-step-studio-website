/**
 * Parts Database 8 - The Latest & Greatest (2024/2025)
 * Ryzen 9000, Intel Core Ultra, RTX 40 Super, Trending Cases
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// LATEST CPUs (Ryzen 9000 & Intel Core Ultra)
// ============================================================================
export const LATEST_CPUS: PartSpec[] = [
    // AMD Ryzen 9000 (Zen 5 - AM5)
    { id: 12001, name: 'AMD Ryzen 7 9800X3D', category: 'CPU', brand: 'AMD', price: 479, releaseYear: 2024, rating: 5.0, popularity: 99, specs: { cores: 8, threads: 16, baseClock: '4.7 GHz', boostClock: '5.2 GHz', tdp: 120, socket: 'AM5', cache: '104MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 12002, name: 'AMD Ryzen 9 9950X', category: 'CPU', brand: 'AMD', price: 649, releaseYear: 2024, rating: 4.9, popularity: 85, specs: { cores: 16, threads: 32, baseClock: '4.3 GHz', boostClock: '5.7 GHz', tdp: 170, socket: 'AM5', cache: '80MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 12003, name: 'AMD Ryzen 5 9600X', category: 'CPU', brand: 'AMD', price: 279, releaseYear: 2024, rating: 4.7, popularity: 88, specs: { cores: 6, threads: 12, baseClock: '3.9 GHz', boostClock: '5.4 GHz', tdp: 65, socket: 'AM5', cache: '38MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 12004, name: 'AMD Ryzen 7 9700X', category: 'CPU', brand: 'AMD', price: 359, releaseYear: 2024, rating: 4.8, popularity: 90, specs: { cores: 8, threads: 16, baseClock: '3.8 GHz', boostClock: '5.5 GHz', tdp: 65, socket: 'AM5', cache: '40MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },

    // Intel Core Ultra (Series 2 - Arrow Lake - LGA1851)
    { id: 12101, name: 'Intel Core Ultra 9 285K', category: 'CPU', brand: 'Intel', price: 589, releaseYear: 2024, rating: 4.8, popularity: 80, specs: { cores: 24, threads: 24, baseClock: '3.7 GHz', boostClock: '5.7 GHz', tdp: 125, socket: 'LGA1851', cache: '36MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5' } },
    { id: 12102, name: 'Intel Core Ultra 7 265K', category: 'CPU', brand: 'Intel', price: 399, releaseYear: 2024, rating: 4.7, popularity: 82, specs: { cores: 20, threads: 20, baseClock: '3.9 GHz', boostClock: '5.5 GHz', tdp: 125, socket: 'LGA1851', cache: '30MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5' } },
    { id: 12103, name: 'Intel Core Ultra 5 245K', category: 'CPU', brand: 'Intel', price: 309, releaseYear: 2024, rating: 4.6, popularity: 85, specs: { cores: 14, threads: 14, baseClock: '4.2 GHz', boostClock: '5.2 GHz', tdp: 125, socket: 'LGA1851', cache: '24MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5' } },
];

// ============================================================================
// LATEST GPUs (Super Series & RDNA3 Refresh)
// ============================================================================
export const LATEST_GPUS: PartSpec[] = [
    { id: 12201, name: 'NVIDIA GeForce RTX 4080 Super', category: 'GPU', brand: 'NVIDIA', price: 999, releaseYear: 2024, rating: 4.9, popularity: 95, specs: { vram: '16GB', type: 'GDDR6X', clock: '2550 MHz', length: '310mm', psu: '750W', hdmi: 1, dp: 3 } },
    { id: 12202, name: 'NVIDIA GeForce RTX 4070 Ti Super', category: 'GPU', brand: 'NVIDIA', price: 799, releaseYear: 2024, rating: 4.8, popularity: 96, specs: { vram: '16GB', type: 'GDDR6X', clock: '2610 MHz', length: '305mm', psu: '700W', hdmi: 1, dp: 3 } },
    { id: 12203, name: 'NVIDIA GeForce RTX 4070 Super', category: 'GPU', brand: 'NVIDIA', price: 599, releaseYear: 2024, rating: 4.9, popularity: 98, specs: { vram: '12GB', type: 'GDDR6X', clock: '2475 MHz', length: '250mm', psu: '650W', hdmi: 1, dp: 3 } },
    { id: 12204, name: 'AMD Radeon RX 7900 GRE', category: 'GPU', brand: 'AMD', price: 549, releaseYear: 2024, rating: 4.8, popularity: 92, specs: { vram: '16GB', type: 'GDDR6', clock: '2245 MHz', length: '280mm', psu: '700W', hdmi: 1, dp: 3 } },
    { id: 12205, name: 'AMD Radeon RX 7600 XT', category: 'GPU', brand: 'AMD', price: 329, releaseYear: 2024, rating: 4.5, popularity: 85, specs: { vram: '16GB', type: 'GDDR6', clock: '2755 MHz', length: '240mm', psu: '600W', hdmi: 1, dp: 3 } },
];

// ============================================================================
// LATEST MOTHERBOARDS (Z890 & X870)
// ============================================================================
export const LATEST_MOTHERBOARDS: PartSpec[] = [
    // LGA1851 (Intel Core Ultra)
    { id: 12301, name: 'ASUS ROG Maximus Z890 Hero', category: 'Motherboard', brand: 'ASUS', price: 699, releaseYear: 2024, rating: 4.8, popularity: 60, specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', memory: 'DDR5', maxRam: '192GB', pcie4: false, pcie5: true, m2Slots: 5, wifi: 'WiFi 7', lan: '5GbE' } },
    { id: 12302, name: 'MSI MAG Z890 Tomahawk WiFi', category: 'Motherboard', brand: 'MSI', price: 329, releaseYear: 2024, rating: 4.7, popularity: 75, specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', memory: 'DDR5', maxRam: '192GB', pcie4: false, pcie5: true, m2Slots: 4, wifi: 'WiFi 7', lan: '5GbE' } },

    // AM5 (Ryzen 9000 Ready)
    { id: 12303, name: 'ASUS ROG Crosshair X870E Hero', category: 'Motherboard', brand: 'ASUS', price: 649, releaseYear: 2024, rating: 4.9, popularity: 65, specs: { socket: 'AM5', chipset: 'X870E', formFactor: 'ATX', memory: 'DDR5', maxRam: '192GB', pcie4: false, pcie5: true, m2Slots: 5, wifi: 'WiFi 7', lan: '5GbE' } },
    { id: 12304, name: 'Gigabyte X870 AORUS ELITE WIFI7', category: 'Motherboard', brand: 'Gigabyte', price: 289, releaseYear: 2024, rating: 4.8, popularity: 80, specs: { socket: 'AM5', chipset: 'X870', formFactor: 'ATX', memory: 'DDR5', maxRam: '192GB', pcie4: false, pcie5: true, m2Slots: 4, wifi: 'WiFi 7', lan: '2.5GbE' } },
];

// ============================================================================
// TRENDING CASES & COOLING
// ============================================================================
export const LATEST_CASES: PartSpec[] = [
    { id: 12401, name: 'NZXT H6 Flow RGB', category: 'Case', brand: 'NZXT', price: 134, releaseYear: 2024, rating: 4.8, popularity: 98, specs: { formFactor: 'ATX', type: 'Dual Chamber', includedFans: 3, radiatorSupport: '360mm', maxGpu: '365mm', sidePanel: 'Tempered Glass' } },
    { id: 12402, name: 'Hyte Y70 Touch', category: 'Case', brand: 'Hyte', price: 359, releaseYear: 2024, rating: 4.9, popularity: 95, specs: { formFactor: 'ATX', type: 'Dual Chamber', includedFans: 0, radiatorSupport: '360mm', maxGpu: '390mm', sidePanel: 'Tempered Glass', notes: 'Integrated 4K Touchscreen' } },
    { id: 12403, name: 'Montech King 95 Pro', category: 'Case', brand: 'Montech', price: 149, releaseYear: 2024, rating: 4.7, popularity: 92, specs: { formFactor: 'ATX', type: 'Dual Chamber', includedFans: 6, radiatorSupport: '360mm', maxGpu: '420mm', sidePanel: 'Curved Glass' } },
    { id: 12404, name: 'Lian Li O11 Vision', category: 'Case', brand: 'Lian Li', price: 139, releaseYear: 2024, rating: 4.8, popularity: 94, specs: { formFactor: 'ATX', type: 'Showcase', includedFans: 0, radiatorSupport: '360mm', maxGpu: '455mm', sidePanel: '3-Sided Glass' } },
];

export const LATEST_COOLING: PartSpec[] = [
    { id: 12501, name: 'Thermalright Phantom Spirit 120 SE', category: 'Cooling', brand: 'Thermalright', price: 35, releaseYear: 2023, rating: 4.9, popularity: 99, specs: { type: 'Air', size: '120mm', fans: 2, socket: 'AM5/LGA1700/1851', tdp: 280 } },
    { id: 12502, name: 'Arctic Liquid Freezer III 360', category: 'Cooling', brand: 'Arctic', price: 119, releaseYear: 2024, rating: 4.9, popularity: 95, specs: { type: 'AIO', size: '360mm', fans: 3, socket: 'AM5/LGA1700/1851', argb: true } },
    { id: 12503, name: 'Lian Li Galahad II LCD 360', category: 'Cooling', brand: 'Lian Li', price: 249, releaseYear: 2024, rating: 4.7, popularity: 90, specs: { type: 'AIO', size: '360mm', fans: 3, socket: 'AM5/LGA1700/1851', lcd: true } },
];
