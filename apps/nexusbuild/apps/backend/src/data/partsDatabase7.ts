/**
 * Parts Database - More CPUs, More Motherboards, Peripherals
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// More AMD CPUs (Budget/Older)
// ============================================================================
export const MORE_AMD_CPUS: PartSpec[] = [
    // Ryzen 3000 Series (Zen 2 - AM4)
    { id: 11001, name: 'AMD Ryzen 9 3950X', category: 'CPU', brand: 'AMD', price: 249, releaseYear: 2019, rating: 4.7, popularity: 60, specs: { cores: 16, threads: 32, baseClock: '3.5 GHz', boostClock: '4.7 GHz', tdp: 105, socket: 'AM4', cache: '72MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11002, name: 'AMD Ryzen 9 3900X', category: 'CPU', brand: 'AMD', price: 189, releaseYear: 2019, rating: 4.7, popularity: 65, specs: { cores: 12, threads: 24, baseClock: '3.8 GHz', boostClock: '4.6 GHz', tdp: 105, socket: 'AM4', cache: '70MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11003, name: 'AMD Ryzen 9 3900XT', category: 'CPU', brand: 'AMD', price: 199, releaseYear: 2020, rating: 4.6, popularity: 55, specs: { cores: 12, threads: 24, baseClock: '3.8 GHz', boostClock: '4.7 GHz', tdp: 105, socket: 'AM4', cache: '70MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11004, name: 'AMD Ryzen 7 3800X', category: 'CPU', brand: 'AMD', price: 139, releaseYear: 2019, rating: 4.5, popularity: 62, specs: { cores: 8, threads: 16, baseClock: '3.9 GHz', boostClock: '4.5 GHz', tdp: 105, socket: 'AM4', cache: '36MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11005, name: 'AMD Ryzen 7 3700X', category: 'CPU', brand: 'AMD', price: 119, releaseYear: 2019, rating: 4.7, popularity: 75, specs: { cores: 8, threads: 16, baseClock: '3.6 GHz', boostClock: '4.4 GHz', tdp: 65, socket: 'AM4', cache: '36MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11006, name: 'AMD Ryzen 5 3600', category: 'CPU', brand: 'AMD', price: 89, releaseYear: 2019, rating: 4.8, popularity: 90, specs: { cores: 6, threads: 12, baseClock: '3.6 GHz', boostClock: '4.2 GHz', tdp: 65, socket: 'AM4', cache: '35MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11007, name: 'AMD Ryzen 5 3600X', category: 'CPU', brand: 'AMD', price: 99, releaseYear: 2019, rating: 4.7, popularity: 82, specs: { cores: 6, threads: 12, baseClock: '3.8 GHz', boostClock: '4.4 GHz', tdp: 95, socket: 'AM4', cache: '35MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11008, name: 'AMD Ryzen 3 3300X', category: 'CPU', brand: 'AMD', price: 69, releaseYear: 2020, rating: 4.6, popularity: 75, specs: { cores: 4, threads: 8, baseClock: '3.8 GHz', boostClock: '4.3 GHz', tdp: 65, socket: 'AM4', cache: '18MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11009, name: 'AMD Ryzen 3 3100', category: 'CPU', brand: 'AMD', price: 59, releaseYear: 2020, rating: 4.5, popularity: 72, specs: { cores: 4, threads: 8, baseClock: '3.6 GHz', boostClock: '3.9 GHz', tdp: 65, socket: 'AM4', cache: '18MB', architecture: 'Zen 2', pcie: '4.0', ddr: 'DDR4' } },

    // Ryzen 2000 Series (Zen+ - AM4)
    { id: 11010, name: 'AMD Ryzen 7 2700X', category: 'CPU', brand: 'AMD', price: 79, releaseYear: 2018, rating: 4.5, popularity: 60, specs: { cores: 8, threads: 16, baseClock: '3.7 GHz', boostClock: '4.3 GHz', tdp: 105, socket: 'AM4', cache: '20MB', architecture: 'Zen+', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11011, name: 'AMD Ryzen 5 2600X', category: 'CPU', brand: 'AMD', price: 59, releaseYear: 2018, rating: 4.5, popularity: 65, specs: { cores: 6, threads: 12, baseClock: '3.6 GHz', boostClock: '4.2 GHz', tdp: 95, socket: 'AM4', cache: '19MB', architecture: 'Zen+', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11012, name: 'AMD Ryzen 5 2600', category: 'CPU', brand: 'AMD', price: 49, releaseYear: 2018, rating: 4.6, popularity: 70, specs: { cores: 6, threads: 12, baseClock: '3.4 GHz', boostClock: '3.9 GHz', tdp: 65, socket: 'AM4', cache: '19MB', architecture: 'Zen+', pcie: '3.0', ddr: 'DDR4' } },

    // APUs
    { id: 11020, name: 'AMD Ryzen 7 5700G', category: 'CPU', brand: 'AMD', price: 199, releaseYear: 2021, rating: 4.6, popularity: 78, specs: { cores: 8, threads: 16, baseClock: '3.8 GHz', boostClock: '4.6 GHz', tdp: 65, socket: 'AM4', cache: '20MB', architecture: 'Zen 3', pcie: '3.0', ddr: 'DDR4', igpu: 'Radeon Vega 8' } },
    { id: 11021, name: 'AMD Ryzen 5 5500', category: 'CPU', brand: 'AMD', price: 89, releaseYear: 2022, rating: 4.5, popularity: 82, specs: { cores: 6, threads: 12, baseClock: '3.6 GHz', boostClock: '4.2 GHz', tdp: 65, socket: 'AM4', cache: '19MB', architecture: 'Zen 3', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11022, name: 'AMD Ryzen 5 4500', category: 'CPU', brand: 'AMD', price: 69, releaseYear: 2022, rating: 4.3, popularity: 78, specs: { cores: 6, threads: 12, baseClock: '3.6 GHz', boostClock: '4.1 GHz', tdp: 65, socket: 'AM4', cache: '11MB', architecture: 'Zen 2', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11023, name: 'AMD Ryzen 3 4100', category: 'CPU', brand: 'AMD', price: 49, releaseYear: 2022, rating: 4.2, popularity: 72, specs: { cores: 4, threads: 8, baseClock: '3.8 GHz', boostClock: '4.0 GHz', tdp: 65, socket: 'AM4', cache: '6MB', architecture: 'Zen 2', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11024, name: 'AMD Athlon 3000G', category: 'CPU', brand: 'AMD', price: 49, releaseYear: 2019, rating: 4.0, popularity: 65, specs: { cores: 2, threads: 4, baseClock: '3.5 GHz', boostClock: '3.5 GHz', tdp: 35, socket: 'AM4', cache: '5MB', architecture: 'Zen+', pcie: '3.0', ddr: 'DDR4', igpu: 'Radeon Vega 3' } },
];

// ============================================================================
// More Intel CPUs (Budget/Older)
// ============================================================================
export const MORE_INTEL_CPUS: PartSpec[] = [
    // 11th Gen (Rocket Lake - LGA1200)
    { id: 11101, name: 'Intel Core i9-11900K', category: 'CPU', brand: 'Intel', price: 199, releaseYear: 2021, rating: 4.4, popularity: 55, specs: { cores: 8, threads: 16, baseClock: '3.5 GHz', boostClock: '5.3 GHz', tdp: 125, socket: 'LGA1200', cache: '16MB', architecture: 'Rocket Lake', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11102, name: 'Intel Core i7-11700K', category: 'CPU', brand: 'Intel', price: 169, releaseYear: 2021, rating: 4.5, popularity: 60, specs: { cores: 8, threads: 16, baseClock: '3.6 GHz', boostClock: '5.0 GHz', tdp: 125, socket: 'LGA1200', cache: '16MB', architecture: 'Rocket Lake', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11103, name: 'Intel Core i5-11600K', category: 'CPU', brand: 'Intel', price: 129, releaseYear: 2021, rating: 4.6, popularity: 68, specs: { cores: 6, threads: 12, baseClock: '3.9 GHz', boostClock: '4.9 GHz', tdp: 125, socket: 'LGA1200', cache: '12MB', architecture: 'Rocket Lake', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11104, name: 'Intel Core i5-11400', category: 'CPU', brand: 'Intel', price: 99, releaseYear: 2021, rating: 4.6, popularity: 78, specs: { cores: 6, threads: 12, baseClock: '2.6 GHz', boostClock: '4.4 GHz', tdp: 65, socket: 'LGA1200', cache: '12MB', architecture: 'Rocket Lake', pcie: '4.0', ddr: 'DDR4' } },
    { id: 11105, name: 'Intel Core i5-11400F', category: 'CPU', brand: 'Intel', price: 89, releaseYear: 2021, rating: 4.7, popularity: 82, specs: { cores: 6, threads: 12, baseClock: '2.6 GHz', boostClock: '4.4 GHz', tdp: 65, socket: 'LGA1200', cache: '12MB', architecture: 'Rocket Lake', pcie: '4.0', ddr: 'DDR4', noIGPU: true } },

    // 10th Gen (Comet Lake - LGA1200)
    { id: 11110, name: 'Intel Core i9-10900K', category: 'CPU', brand: 'Intel', price: 179, releaseYear: 2020, rating: 4.5, popularity: 55, specs: { cores: 10, threads: 20, baseClock: '3.7 GHz', boostClock: '5.3 GHz', tdp: 125, socket: 'LGA1200', cache: '20MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11111, name: 'Intel Core i7-10700K', category: 'CPU', brand: 'Intel', price: 139, releaseYear: 2020, rating: 4.6, popularity: 62, specs: { cores: 8, threads: 16, baseClock: '3.8 GHz', boostClock: '5.1 GHz', tdp: 125, socket: 'LGA1200', cache: '16MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11112, name: 'Intel Core i5-10600K', category: 'CPU', brand: 'Intel', price: 109, releaseYear: 2020, rating: 4.6, popularity: 68, specs: { cores: 6, threads: 12, baseClock: '4.1 GHz', boostClock: '4.8 GHz', tdp: 125, socket: 'LGA1200', cache: '12MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11113, name: 'Intel Core i5-10400', category: 'CPU', brand: 'Intel', price: 79, releaseYear: 2020, rating: 4.6, popularity: 78, specs: { cores: 6, threads: 12, baseClock: '2.9 GHz', boostClock: '4.3 GHz', tdp: 65, socket: 'LGA1200', cache: '12MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11114, name: 'Intel Core i5-10400F', category: 'CPU', brand: 'Intel', price: 69, releaseYear: 2020, rating: 4.7, popularity: 85, specs: { cores: 6, threads: 12, baseClock: '2.9 GHz', boostClock: '4.3 GHz', tdp: 65, socket: 'LGA1200', cache: '12MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4', noIGPU: true } },
    { id: 11115, name: 'Intel Core i3-10100', category: 'CPU', brand: 'Intel', price: 59, releaseYear: 2020, rating: 4.4, popularity: 72, specs: { cores: 4, threads: 8, baseClock: '3.6 GHz', boostClock: '4.3 GHz', tdp: 65, socket: 'LGA1200', cache: '6MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11116, name: 'Intel Core i3-10100F', category: 'CPU', brand: 'Intel', price: 49, releaseYear: 2020, rating: 4.5, popularity: 78, specs: { cores: 4, threads: 8, baseClock: '3.6 GHz', boostClock: '4.3 GHz', tdp: 65, socket: 'LGA1200', cache: '6MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4', noIGPU: true } },

    // Pentium/Celeron
    { id: 11120, name: 'Intel Pentium Gold G7400', category: 'CPU', brand: 'Intel', price: 69, releaseYear: 2022, rating: 4.0, popularity: 60, specs: { cores: 2, threads: 4, baseClock: '3.7 GHz', boostClock: '3.7 GHz', tdp: 46, socket: 'LGA1700', cache: '6MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 11121, name: 'Intel Pentium Gold G6400', category: 'CPU', brand: 'Intel', price: 49, releaseYear: 2020, rating: 4.0, popularity: 62, specs: { cores: 2, threads: 4, baseClock: '4.0 GHz', boostClock: '4.0 GHz', tdp: 58, socket: 'LGA1200', cache: '4MB', architecture: 'Comet Lake', pcie: '3.0', ddr: 'DDR4' } },
    { id: 11122, name: 'Intel Celeron G6900', category: 'CPU', brand: 'Intel', price: 42, releaseYear: 2022, rating: 3.8, popularity: 55, specs: { cores: 2, threads: 2, baseClock: '3.4 GHz', boostClock: '3.4 GHz', tdp: 46, socket: 'LGA1700', cache: '4MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
];

// ============================================================================
// More Motherboards
// ============================================================================
export const MORE_MOTHERBOARDS: PartSpec[] = [
    // LGA1200 (10th/11th Gen Intel)
    { id: 11201, name: 'ASUS ROG Strix Z590-E Gaming WiFi', category: 'Motherboard', brand: 'ASUS', price: 299, releaseYear: 2021, rating: 4.6, popularity: 70, specs: { socket: 'LGA1200', chipset: 'Z590', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 4, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 11202, name: 'MSI MAG Z590 Tomahawk WiFi', category: 'Motherboard', brand: 'MSI', price: 229, releaseYear: 2021, rating: 4.5, popularity: 72, specs: { socket: 'LGA1200', chipset: 'Z590', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 3, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 11203, name: 'ASUS TUF Gaming B560-Plus WiFi', category: 'Motherboard', brand: 'ASUS', price: 149, releaseYear: 2021, rating: 4.4, popularity: 75, specs: { socket: 'LGA1200', chipset: 'B560', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: false, m2Slots: 2, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 11204, name: 'Gigabyte B560M DS3H V2', category: 'Motherboard', brand: 'Gigabyte', price: 89, releaseYear: 2021, rating: 4.3, popularity: 78, specs: { socket: 'LGA1200', chipset: 'B560', formFactor: 'Micro-ATX', memory: 'DDR4', maxRam: '128GB', pcie4: false, m2Slots: 2, wifi: false, lan: '1GbE' } },
    { id: 11205, name: 'MSI B560M PRO-VDH', category: 'Motherboard', brand: 'MSI', price: 99, releaseYear: 2021, rating: 4.4, popularity: 80, specs: { socket: 'LGA1200', chipset: 'B560', formFactor: 'Micro-ATX', memory: 'DDR4', maxRam: '128GB', pcie4: false, m2Slots: 2, wifi: false, lan: '1GbE' } },

    // X570 (AM4)
    { id: 11210, name: 'Gigabyte X570 AORUS Master', category: 'Motherboard', brand: 'Gigabyte', price: 349, releaseYear: 2019, rating: 4.7, popularity: 75, specs: { socket: 'AM4', chipset: 'X570', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 3, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 11211, name: 'MSI MAG X570 Tomahawk WiFi', category: 'Motherboard', brand: 'MSI', price: 219, releaseYear: 2020, rating: 4.6, popularity: 82, specs: { socket: 'AM4', chipset: 'X570', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 2, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 11212, name: 'ASUS TUF Gaming X570-Plus WiFi', category: 'Motherboard', brand: 'ASUS', price: 199, releaseYear: 2019, rating: 4.6, popularity: 85, specs: { socket: 'AM4', chipset: 'X570', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 2, wifi: 'WiFi 5', lan: '1GbE' } },
    { id: 11213, name: 'Gigabyte X570S AORUS Elite AX', category: 'Motherboard', brand: 'Gigabyte', price: 239, releaseYear: 2021, rating: 4.6, popularity: 80, specs: { socket: 'AM4', chipset: 'X570S', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 3, wifi: 'WiFi 6E', lan: '2.5GbE' } },

    // A520/A620 Budget
    { id: 11220, name: 'MSI A520M-A PRO', category: 'Motherboard', brand: 'MSI', price: 59, releaseYear: 2020, rating: 4.3, popularity: 82, specs: { socket: 'AM4', chipset: 'A520', formFactor: 'Micro-ATX', memory: 'DDR4', maxRam: '64GB', pcie3: true, m2Slots: 1, wifi: false, lan: '1GbE' } },
    { id: 11221, name: 'Gigabyte A520M DS3H', category: 'Motherboard', brand: 'Gigabyte', price: 65, releaseYear: 2020, rating: 4.3, popularity: 80, specs: { socket: 'AM4', chipset: 'A520', formFactor: 'Micro-ATX', memory: 'DDR4', maxRam: '64GB', pcie3: true, m2Slots: 1, wifi: false, lan: '1GbE' } },
    { id: 11222, name: 'ASRock A520M-HDV', category: 'Motherboard', brand: 'ASRock', price: 55, releaseYear: 2020, rating: 4.2, popularity: 78, specs: { socket: 'AM4', chipset: 'A520', formFactor: 'Micro-ATX', memory: 'DDR4', maxRam: '64GB', pcie3: true, m2Slots: 1, wifi: false, lan: '1GbE' } },
    { id: 11223, name: 'ASUS PRIME A620M-K', category: 'Motherboard', brand: 'ASUS', price: 89, releaseYear: 2023, rating: 4.3, popularity: 75, specs: { socket: 'AM5', chipset: 'A620', formFactor: 'Micro-ATX', memory: 'DDR5', maxRam: '64GB', pcie4: true, m2Slots: 1, wifi: false, lan: '1GbE' } },
    { id: 11224, name: 'Gigabyte A620M Gaming X', category: 'Motherboard', brand: 'Gigabyte', price: 99, releaseYear: 2023, rating: 4.4, popularity: 78, specs: { socket: 'AM5', chipset: 'A620', formFactor: 'Micro-ATX', memory: 'DDR5', maxRam: '128GB', pcie4: true, m2Slots: 2, wifi: false, lan: '2.5GbE' } },
    { id: 11225, name: 'ASRock A620M Pro RS', category: 'Motherboard', brand: 'ASRock', price: 85, releaseYear: 2023, rating: 4.3, popularity: 76, specs: { socket: 'AM5', chipset: 'A620', formFactor: 'Micro-ATX', memory: 'DDR5', maxRam: '128GB', pcie4: true, m2Slots: 2, wifi: false, lan: '2.5GbE' } },
];

// ============================================================================
// More RAM
// ============================================================================
export const MORE_RAM: PartSpec[] = [
    // DDR5 Budget
    { id: 11301, name: 'Corsair Vengeance 16GB (2x8GB) DDR5-5200', category: 'RAM', brand: 'Corsair', price: 59, releaseYear: 2022, rating: 4.4, popularity: 85, specs: { capacity: '16GB', modules: '2x8GB', speed: 5200, type: 'DDR5', timing: 'CL40-40-40-77', voltage: 1.10, rgb: false, height: '34mm' } },
    { id: 11302, name: 'Kingston Fury Beast 16GB (2x8GB) DDR5-5200', category: 'RAM', brand: 'Kingston', price: 55, releaseYear: 2022, rating: 4.4, popularity: 88, specs: { capacity: '16GB', modules: '2x8GB', speed: 5200, type: 'DDR5', timing: 'CL40-40-40-80', voltage: 1.10, rgb: false, height: '34mm' } },
    { id: 11303, name: 'Crucial DDR5-5600 16GB (2x8GB)', category: 'RAM', brand: 'Crucial', price: 52, releaseYear: 2023, rating: 4.3, popularity: 82, specs: { capacity: '16GB', modules: '2x8GB', speed: 5600, type: 'DDR5', timing: 'CL46-45-45-90', voltage: 1.10, rgb: false, height: '31mm' } },
    { id: 11304, name: 'TeamGroup T-Force Vulcan 32GB DDR5-5600', category: 'RAM', brand: 'TeamGroup', price: 89, releaseYear: 2023, rating: 4.4, popularity: 80, specs: { capacity: '32GB', modules: '2x16GB', speed: 5600, type: 'DDR5', timing: 'CL36-36-36-76', voltage: 1.25, rgb: false, height: '35mm' } },

    // DDR4 Budget
    { id: 11310, name: 'G.Skill Ripjaws V 16GB (2x8GB) DDR4-3200', category: 'RAM', brand: 'G.Skill', price: 35, releaseYear: 2020, rating: 4.7, popularity: 95, specs: { capacity: '16GB', modules: '2x8GB', speed: 3200, type: 'DDR4', timing: 'CL16-18-18-38', voltage: 1.35, rgb: false, height: '42mm' } },
    { id: 11311, name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200', category: 'RAM', brand: 'Corsair', price: 32, releaseYear: 2020, rating: 4.7, popularity: 98, specs: { capacity: '16GB', modules: '2x8GB', speed: 3200, type: 'DDR4', timing: 'CL16-20-20-38', voltage: 1.35, rgb: false, height: '34mm' } },
    { id: 11312, name: 'Kingston Fury Beast 16GB (2x8GB) DDR4-3200', category: 'RAM', brand: 'Kingston', price: 34, releaseYear: 2021, rating: 4.6, popularity: 92, specs: { capacity: '16GB', modules: '2x8GB', speed: 3200, type: 'DDR4', timing: 'CL16-18-18-36', voltage: 1.35, rgb: false, height: '34mm' } },
    { id: 11313, name: 'Crucial Ballistix 16GB (2x8GB) DDR4-3600', category: 'RAM', brand: 'Crucial', price: 42, releaseYear: 2020, rating: 4.6, popularity: 88, specs: { capacity: '16GB', modules: '2x8GB', speed: 3600, type: 'DDR4', timing: 'CL16-18-18-38', voltage: 1.35, rgb: false, height: '39mm' } },
    { id: 11314, name: 'TeamGroup T-Force Vulcan Z 16GB DDR4-3200', category: 'RAM', brand: 'TeamGroup', price: 28, releaseYear: 2020, rating: 4.5, popularity: 90, specs: { capacity: '16GB', modules: '2x8GB', speed: 3200, type: 'DDR4', timing: 'CL16-18-18-38', voltage: 1.35, rgb: false, height: '32mm' } },
    { id: 11315, name: 'Patriot Viper Steel 16GB DDR4-3200', category: 'RAM', brand: 'Patriot', price: 30, releaseYear: 2019, rating: 4.5, popularity: 85, specs: { capacity: '16GB', modules: '2x8GB', speed: 3200, type: 'DDR4', timing: 'CL16-18-18-36', voltage: 1.35, rgb: false, height: '44mm' } },

    // High Capacity
    { id: 11320, name: 'G.Skill Trident Z5 RGB 96GB (2x48GB) DDR5-6400', category: 'RAM', brand: 'G.Skill', price: 399, releaseYear: 2023, rating: 4.8, popularity: 70, specs: { capacity: '96GB', modules: '2x48GB', speed: 6400, type: 'DDR5', timing: 'CL32-39-39-102', voltage: 1.35, rgb: true, height: '44mm' } },
    { id: 11321, name: 'Corsair Dominator Platinum RGB 128GB (4x32GB) DDR5-5600', category: 'RAM', brand: 'Corsair', price: 549, releaseYear: 2023, rating: 4.8, popularity: 65, specs: { capacity: '128GB', modules: '4x32GB', speed: 5600, type: 'DDR5', timing: 'CL36-36-36-76', voltage: 1.25, rgb: true, height: '56mm' } },
    { id: 11322, name: 'G.Skill Trident Z RGB 64GB (4x16GB) DDR4-3600', category: 'RAM', brand: 'G.Skill', price: 159, releaseYear: 2020, rating: 4.7, popularity: 75, specs: { capacity: '64GB', modules: '4x16GB', speed: 3600, type: 'DDR4', timing: 'CL16-19-19-39', voltage: 1.35, rgb: true, height: '44mm' } },
];

export const ALL_MORE_CPUS = [...MORE_AMD_CPUS, ...MORE_INTEL_CPUS];
export const ALL_MORE_MOTHERBOARDS = MORE_MOTHERBOARDS;
export const ALL_MORE_RAM = MORE_RAM;
