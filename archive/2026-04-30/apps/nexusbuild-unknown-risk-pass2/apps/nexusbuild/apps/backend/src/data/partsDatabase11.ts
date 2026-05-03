/**
 * Parts Database 11 - Premium & High-End Real Components
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// Premium CPUs (2024-2025)
// ============================================================================
export const PREMIUM_CPUS: PartSpec[] = [
    { id: 15001, name: 'Intel Core i9-14900KS', category: 'CPU', brand: 'Intel', price: 689, releaseYear: 2024, rating: 4.8, popularity: 85, specs: { cores: 24, threads: 32, baseClock: '3.2 GHz', boostClock: '6.2 GHz', tdp: 150, socket: 'LGA1700', cache: '36MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR5/DDR4' } },
    { id: 15002, name: 'AMD Ryzen 9 9950X', category: 'CPU', brand: 'AMD', price: 649, releaseYear: 2024, rating: 4.9, popularity: 90, specs: { cores: 16, threads: 32, baseClock: '4.3 GHz', boostClock: '5.7 GHz', tdp: 170, socket: 'AM5', cache: '80MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 15003, name: 'AMD Ryzen 9 9900X', category: 'CPU', brand: 'AMD', price: 499, releaseYear: 2024, rating: 4.8, popularity: 82, specs: { cores: 12, threads: 24, baseClock: '4.4 GHz', boostClock: '5.6 GHz', tdp: 120, socket: 'AM5', cache: '76MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 15004, name: 'AMD Ryzen 7 9800X3D', category: 'CPU', brand: 'AMD', price: 479, releaseYear: 2024, rating: 5.0, popularity: 100, specs: { cores: 8, threads: 16, baseClock: '4.7 GHz', boostClock: '5.2 GHz', tdp: 120, socket: 'AM5', cache: '104MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 15005, name: 'Intel Core Ultra 9 285K', category: 'CPU', brand: 'Intel', price: 589, releaseYear: 2024, rating: 4.7, popularity: 88, specs: { cores: 24, threads: 24, baseClock: '3.7 GHz', boostClock: '5.7 GHz', tdp: 125, socket: 'LGA1851', cache: '36MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5' } },
    { id: 15006, name: 'Intel Core Ultra 7 265K', category: 'CPU', brand: 'Intel', price: 394, releaseYear: 2024, rating: 4.6, popularity: 80, specs: { cores: 20, threads: 20, baseClock: '3.9 GHz', boostClock: '5.5 GHz', tdp: 125, socket: 'LGA1851', cache: '30MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5' } },
    { id: 15007, name: 'AMD Ryzen 7 9700X', category: 'CPU', brand: 'AMD', price: 359, releaseYear: 2024, rating: 4.7, popularity: 75, specs: { cores: 8, threads: 16, baseClock: '3.8 GHz', boostClock: '5.5 GHz', tdp: 65, socket: 'AM5', cache: '40MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 15008, name: 'AMD Ryzen 5 9600X', category: 'CPU', brand: 'AMD', price: 279, releaseYear: 2024, rating: 4.6, popularity: 85, specs: { cores: 6, threads: 12, baseClock: '3.9 GHz', boostClock: '5.4 GHz', tdp: 65, socket: 'AM5', cache: '38MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 15009, name: 'Intel Core i7-14700K', category: 'CPU', brand: 'Intel', price: 389, releaseYear: 2023, rating: 4.7, popularity: 88, specs: { cores: 20, threads: 28, baseClock: '3.4 GHz', boostClock: '5.6 GHz', tdp: 125, socket: 'LGA1700', cache: '33MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR5/DDR4' } },
    { id: 15010, name: 'AMD Ryzen 7 7800X3D', category: 'CPU', brand: 'AMD', price: 449, releaseYear: 2023, rating: 4.9, popularity: 98, specs: { cores: 8, threads: 16, baseClock: '4.2 GHz', boostClock: '5.0 GHz', tdp: 120, socket: 'AM5', cache: '96MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
];

// ============================================================================
// Premium GPUs (2024-2025)
// ============================================================================
export const PREMIUM_GPUS: PartSpec[] = [
    { id: 15101, name: 'NVIDIA GeForce RTX 4090 Rog Strix OC', category: 'GPU', brand: 'NVIDIA', price: 1999, releaseYear: 2022, rating: 4.9, popularity: 95, specs: { vram: 24, vramType: 'GDDR6X', baseClock: '2235 MHz', boostClock: '2640 MHz', tdp: 450, pcie: '4.0', length: '357mm' } },
    { id: 15102, name: 'NVIDIA GeForce RTX 4080 Super FE', category: 'GPU', brand: 'NVIDIA', price: 999, releaseYear: 2024, rating: 4.8, popularity: 92, specs: { vram: 16, vramType: 'GDDR6X', baseClock: '2295 MHz', boostClock: '2550 MHz', tdp: 320, pcie: '4.0', length: '310mm' } },
    { id: 15103, name: 'NVIDIA GeForce RTX 4070 Ti Super', category: 'GPU', brand: 'NVIDIA', price: 799, releaseYear: 2024, rating: 4.7, popularity: 88, specs: { vram: 16, vramType: 'GDDR6X', baseClock: '2340 MHz', boostClock: '2610 MHz', tdp: 285, pcie: '4.0', length: '300mm' } },
    { id: 15104, name: 'AMD Radeon RX 7900 XTX', category: 'GPU', brand: 'AMD', price: 929, releaseYear: 2022, rating: 4.7, popularity: 85, specs: { vram: 24, vramType: 'GDDR6', baseClock: '2300 MHz', boostClock: '2500 MHz', tdp: 355, pcie: '4.0', length: '287mm' } },
    { id: 15105, name: 'AMD Radeon RX 7900 XT', category: 'GPU', brand: 'AMD', price: 699, releaseYear: 2022, rating: 4.6, popularity: 80, specs: { vram: 20, vramType: 'GDDR6', baseClock: '2000 MHz', boostClock: '2400 MHz', tdp: 315, pcie: '4.0', length: '276mm' } },
    { id: 15106, name: 'NVIDIA GeForce RTX 4070 Super', category: 'GPU', brand: 'NVIDIA', price: 599, releaseYear: 2024, rating: 4.8, popularity: 95, specs: { vram: 12, vramType: 'GDDR6X', baseClock: '1980 MHz', boostClock: '2475 MHz', tdp: 220, pcie: '4.0', length: '240mm' } },
    { id: 15107, name: 'NVIDIA GeForce RTX 5090 Concept', category: 'GPU', brand: 'NVIDIA', price: 2499, releaseYear: 2025, rating: 5.0, popularity: 100, specs: { vram: 32, vramType: 'GDDR7', baseClock: '2500 MHz', boostClock: '2900 MHz', tdp: 600, pcie: '5.0', length: '380mm' } },
    { id: 15108, name: 'NVIDIA GeForce RTX 4060 Ti 16GB', category: 'GPU', brand: 'NVIDIA', price: 449, releaseYear: 2023, rating: 4.5, popularity: 78, specs: { vram: 16, vramType: 'GDDR6', baseClock: '2310 MHz', boostClock: '2535 MHz', tdp: 160, pcie: '4.0', length: '240mm' } },
    { id: 15109, name: 'AMD Radeon RX 7800 XT', category: 'GPU', brand: 'AMD', price: 499, releaseYear: 2023, rating: 4.7, popularity: 88, specs: { vram: 16, vramType: 'GDDR6', baseClock: '2124 MHz', boostClock: '2430 MHz', tdp: 263, pcie: '4.0', length: '267mm' } },
];

// ============================================================================
// Premium Motherboards
// ============================================================================
export const PREMIUM_MOTHERBOARDS: PartSpec[] = [
    { id: 15201, name: 'ASUS ROG Maximus Z790 Dark Hero', category: 'Motherboard', brand: 'ASUS', price: 699, releaseYear: 2023, rating: 4.9, popularity: 85, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '192GB', pcie5: true, m2Slots: 5, wifi: 'WiFi 7', lan: '2.5GbE' } },
    { id: 15202, name: 'MSI MEG X670E GODLIKE', category: 'Motherboard', brand: 'MSI', price: 1299, releaseYear: 2022, rating: 4.8, popularity: 70, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'E-ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 6, wifi: 'WiFi 6E', lan: '10GbE' } },
    { id: 15103, name: 'Gigabyte Z890 AORUS MASTER', category: 'Motherboard', brand: 'Gigabyte', price: 549, releaseYear: 2024, rating: 4.7, popularity: 75, specs: { socket: 'LGA1851', chipset: 'Z890', formFactor: 'ATX', memory: 'DDR5', maxRam: '192GB', pcie5: true, m2Slots: 5, wifi: 'WiFi 7', lan: '10GbE' } },
    { id: 15204, name: 'ASUS ProArt X670E-Creator WIFI', category: 'Motherboard', brand: 'ASUS', price: 439, releaseYear: 2022, rating: 4.9, popularity: 82, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, wifi: 'WiFi 6E', lan: '10GbE + 2.5GbE' } },
    { id: 15205, name: 'MSI MAG B650 TOMAHAWK WIFI', category: 'Motherboard', brand: 'MSI', price: 199, releaseYear: 2022, rating: 4.7, popularity: 95, specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: false, m2Slots: 3, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 15206, name: 'Gigabyte B760 AORUS ELITE AX', category: 'Motherboard', brand: 'Gigabyte', price: 189, releaseYear: 2023, rating: 4.6, popularity: 90, specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', memory: 'DDR5', maxRam: '192GB', pcie5: false, m2Slots: 3, wifi: 'WiFi 6E', lan: '2.5GbE' } },
];

// ============================================================================
// Premium RAM
// ============================================================================
export const PREMIUM_RAM: PartSpec[] = [
    { id: 15301, name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400', category: 'RAM', brand: 'G.Skill', price: 219, releaseYear: 2023, rating: 4.9, popularity: 90, specs: { capacity: '64GB', modules: '2x32GB', speed: 6400, type: 'DDR5', timing: 'CL32', voltage: 1.40, rgb: true, height: '44mm' } },
    { id: 15302, name: 'Corsair Dominator Titanium 32GB (2x16GB) DDR5-7200', category: 'RAM', brand: 'Corsair', price: 199, releaseYear: 2024, rating: 4.8, popularity: 85, specs: { capacity: '32GB', modules: '2x16GB', speed: 7200, type: 'DDR5', timing: 'CL34', voltage: 1.45, rgb: true, height: '56mm' } },
    { id: 15303, name: 'G.Skill Trident Z5 RGB 96GB (2x48GB) DDR5-6800', category: 'RAM', brand: 'G.Skill', price: 389, releaseYear: 2024, rating: 4.9, popularity: 78, specs: { capacity: '96GB', modules: '2x48GB', speed: 6800, type: 'DDR5', timing: 'CL34', voltage: 1.35, rgb: true, height: '44mm' } },
    { id: 15304, name: 'TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5-6000', category: 'RAM', brand: 'TeamGroup', price: 104, releaseYear: 2023, rating: 4.7, popularity: 90, specs: { capacity: '32GB', modules: '2x16GB', speed: 6000, type: 'DDR5', timing: 'CL30', voltage: 1.35, rgb: true, height: '46.1mm' } },
];

// ============================================================================
// Premium Storage
// ============================================================================
export const PREMIUM_STORAGE: PartSpec[] = [
    { id: 15401, name: 'Samsung 990 Pro 4TB with Heatsink', category: 'Storage', brand: 'Samsung', price: 329, releaseYear: 2023, rating: 4.9, popularity: 95, specs: { capacity: '4TB', interface: 'PCIe 4.0 x4', type: 'NVMe', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s', formFactor: 'M.2 2280' } },
    { id: 15402, name: 'Crucial T705 2TB PCIe 5.0 NVMe', category: 'Storage', brand: 'Crucial', price: 299, releaseYear: 2024, rating: 4.8, popularity: 88, specs: { capacity: '2TB', interface: 'PCIe 5.0 x4', type: 'NVMe', readSpeed: '14500 MB/s', writeSpeed: '12700 MB/s', formFactor: 'M.2 2280' } },
    { id: 15403, name: 'Sabrent Rocket 4 Plus-G 8TB', category: 'Storage', brand: 'Sabrent', price: 1099, releaseYear: 2023, rating: 4.7, popularity: 70, specs: { capacity: '8TB', interface: 'PCIe 4.0 x4', type: 'NVMe', readSpeed: '7000 MB/s', writeSpeed: '6000 MB/s', formFactor: 'M.2 2280' } },
    { id: 15404, name: 'WD_BLACK SN850X 2TB', category: 'Storage', brand: 'Western Digital', price: 159, releaseYear: 2022, rating: 4.9, popularity: 98, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', type: 'NVMe', readSpeed: '7300 MB/s', writeSpeed: '6600 MB/s', formFactor: 'M.2 2280' } },
];

// ============================================================================
// Premium PSUs
// ============================================================================
export const PREMIUM_PSUS: PartSpec[] = [
    { id: 15501, name: 'Corsair AX1600i 1600W 80+ Titanium', category: 'PSU', brand: 'Corsair', price: 609, releaseYear: 2018, rating: 5.0, popularity: 75, specs: { wattage: 1600, efficiency: '80+ Titanium', modular: 'Full', formFactor: 'ATX', length: '200mm', fanSize: '140mm' } },
    { id: 15502, name: 'Seasonic PRIME TX-1300 ATX 3.0', category: 'Seasonic', brand: 'Seasonic', price: 429, releaseYear: 2023, rating: 4.9, popularity: 82, specs: { wattage: 1300, efficiency: '80+ Titanium', modular: 'Full', formFactor: 'ATX', length: '210mm', fanSize: '135mm' } },
    { id: 15503, name: 'be quiet! Dark Power Pro 13 1600W', category: 'PSU', brand: 'be quiet!', price: 449, releaseYear: 2023, rating: 4.8, popularity: 78, specs: { wattage: 1600, efficiency: '80+ Titanium', modular: 'Full', formFactor: 'ATX', length: '200mm', fanSize: '135mm' } },
];

// ============================================================================
// Premium Cases
// ============================================================================
export const PREMIUM_CASES: PartSpec[] = [
    { id: 15601, name: 'Lian Li O11 Vision Chrome', category: 'Case', brand: 'Lian Li', price: 149, releaseYear: 2023, rating: 4.9, popularity: 95, specs: { type: 'Mid Tower', color: 'Chrome', window: 'Tempered Glass (3 sides)', psuSupport: 'ATX', gpuMax: '455mm', coolerMax: '167mm' } },
    { id: 15602, name: 'Hyte Y70 Touch Infinite', category: 'Case', brand: 'Hyte', price: 379, releaseYear: 2024, rating: 4.9, popularity: 92, specs: { type: 'Mid Tower', color: 'Black/White', window: 'Tempered Glass + 4K Screen', psuSupport: 'ATX', gpuMax: '400mm', coolerMax: '180mm' } },
    { id: 15603, name: 'Cooler Master HAF 700 EVO', category: 'Case', brand: 'Cooler Master', price: 499, releaseYear: 2022, rating: 4.8, popularity: 72, specs: { type: 'Full Tower', color: 'Titanium Grey', window: 'Tempered Glass', psuSupport: 'E-ATX', gpuMax: '490mm', coolerMax: '166mm' } },
    { id: 15604, name: 'NZXT H6 Flow RGB', category: 'Case', brand: 'NZXT', price: 129, releaseYear: 2023, rating: 4.8, popularity: 96, specs: { type: 'Mid Tower', color: 'White', window: 'Tempered Glass', psuSupport: 'ATX', gpuMax: '365mm', coolerMax: '163mm' } },
];

// ============================================================================
// Premium Cooling
// ============================================================================
export const PREMIUM_COOLING: PartSpec[] = [
    { id: 15701, name: 'Lian Li Galahad II LCD 360', category: 'Cooling', brand: 'Lian Li', price: 249, releaseYear: 2023, rating: 4.9, popularity: 90, specs: { type: 'Liquid (AIO)', size: '360mm', fans: 3, rpm: '2500 RPM', noise: '30 dB', rgb: 'LCD Screen + RGB' } },
    { id: 15702, name: 'Arctic Liquid Freezer III 420 RGB', category: 'Cooling', brand: 'Arctic', price: 139, releaseYear: 2024, rating: 4.9, popularity: 95, specs: { type: 'Liquid (AIO)', size: '420mm', fans: 3, rpm: '1900 RPM', noise: '24 dB', rgb: 'ARGB' } },
    { id: 15703, name: 'Noctua NH-D15 G2 LBC', category: 'Cooling', brand: 'Noctua', price: 149, releaseYear: 2024, rating: 4.8, popularity: 88, specs: { type: 'Air', height: '168mm', fans: 2, rpm: '1500 RPM', noise: '24.6 dB', color: 'Brown/Beige' } },
    { id: 15704, name: 'NZXT Kraken Elite 360 RGB', category: 'Cooling', brand: 'NZXT', price: 279, releaseYear: 2023, rating: 4.8, popularity: 85, specs: { type: 'Liquid (AIO)', size: '360mm', fans: 3, rpm: '1800 RPM', noise: '30 dB', rgb: 'LCD Screen + RGB' } },
];

// ============================================================================
// Premium Monitors
// ============================================================================
export const PREMIUM_MONITORS: PartSpec[] = [
    { id: 15801, name: 'ASUS ROG Swift OLED PG32UCDM', category: 'Monitor', brand: 'ASUS', price: 1299, releaseYear: 2024, rating: 4.9, popularity: 90, specs: { size: '32"', resolution: '3840x2160', refreshRate: '240Hz', panelType: 'QD-OLED', responseTime: '0.03ms' } },
    { id: 15802, name: 'Alienware AW3423DWF Curved OLED', category: 'Alienware', brand: 'Dell', price: 799, releaseYear: 2023, rating: 4.8, popularity: 95, specs: { size: '34"', resolution: '3440x1440', refreshRate: '165Hz', panelType: 'QD-OLED', responseTime: '0.1ms' } },
    { id: 15803, name: 'Samsung Odyssey Neo G9 G95NC', category: 'Monitor', brand: 'Samsung', price: 1799, releaseYear: 2023, rating: 4.7, popularity: 82, specs: { size: '57"', resolution: '7680x2160', refreshRate: '240Hz', panelType: 'Mini LED', responseTime: '1ms' } },
];

// ============================================================================
// Premium Fans
// ============================================================================
export const PREMIUM_FANS: PartSpec[] = [
    { id: 15901, name: 'Lian Li Uni Fan TL LCD 120 (3-Pack)', category: 'Fans', brand: 'Lian Li', price: 149, releaseYear: 2024, rating: 4.9, popularity: 92, specs: { size: '120mm', quantity: 3, rpm: '1900 RPM', noise: '27 dB', rgb: 'LCD Screen + RGB' } },
    { id: 15902, name: 'Corsair iCUE Link QX120 RGB (3-Pack)', category: 'Fans', brand: 'Corsair', price: 139, releaseYear: 2023, rating: 4.8, popularity: 88, specs: { size: '120mm', quantity: 3, rpm: '2400 RPM', noise: '37 dB', rgb: 'ARGB' } },
];

export const ALL_PREMIUM_PARTS = [
    ...PREMIUM_CPUS,
    ...PREMIUM_GPUS,
    ...PREMIUM_MOTHERBOARDS,
    ...PREMIUM_RAM,
    ...PREMIUM_STORAGE,
    ...PREMIUM_PSUS,
    ...PREMIUM_CASES,
    ...PREMIUM_COOLING,
    ...PREMIUM_MONITORS,
    ...PREMIUM_FANS
];
