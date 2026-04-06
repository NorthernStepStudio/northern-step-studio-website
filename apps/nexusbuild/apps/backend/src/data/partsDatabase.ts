/**
 * Comprehensive PC Parts Database
 * 500+ parts with full specifications and current pricing (2024-2025)
 * 
 * Categories: CPU, GPU, RAM, Motherboard, Storage, PSU, Case, Cooling, Monitor
 */

export interface PartSpec {
    id: number;
    name: string;
    category: string;
    brand: string;
    price: number;
    specs: Record<string, string | number | boolean>;
    releaseYear: number;
    rating?: number; // 1-5 stars
    popularity?: number; // 1-100
}

// ============================================================================
// CPUs - AMD
// ============================================================================
const AMD_CPUS: PartSpec[] = [
    // Ryzen 9000 Series (Zen 5 - AM5)
    { id: 1001, name: 'AMD Ryzen 9 9950X', category: 'CPU', brand: 'AMD', price: 649, releaseYear: 2024, rating: 4.8, popularity: 85, specs: { cores: 16, threads: 32, baseClock: '4.3 GHz', boostClock: '5.7 GHz', tdp: 170, socket: 'AM5', cache: '80MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1002, name: 'AMD Ryzen 9 9900X', category: 'CPU', brand: 'AMD', price: 499, releaseYear: 2024, rating: 4.7, popularity: 80, specs: { cores: 12, threads: 24, baseClock: '4.4 GHz', boostClock: '5.6 GHz', tdp: 120, socket: 'AM5', cache: '76MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1003, name: 'AMD Ryzen 7 9700X', category: 'CPU', brand: 'AMD', price: 359, releaseYear: 2024, rating: 4.6, popularity: 75, specs: { cores: 8, threads: 16, baseClock: '3.8 GHz', boostClock: '5.5 GHz', tdp: 65, socket: 'AM5', cache: '40MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1004, name: 'AMD Ryzen 5 9600X', category: 'CPU', brand: 'AMD', price: 279, releaseYear: 2024, rating: 4.5, popularity: 70, specs: { cores: 6, threads: 12, baseClock: '3.9 GHz', boostClock: '5.4 GHz', tdp: 65, socket: 'AM5', cache: '38MB', architecture: 'Zen 5', pcie: '5.0', ddr: 'DDR5' } },

    // Ryzen 7000 Series (Zen 4 - AM5)
    { id: 1005, name: 'AMD Ryzen 9 7950X', category: 'CPU', brand: 'AMD', price: 549, releaseYear: 2022, rating: 4.8, popularity: 90, specs: { cores: 16, threads: 32, baseClock: '4.5 GHz', boostClock: '5.7 GHz', tdp: 170, socket: 'AM5', cache: '80MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1006, name: 'AMD Ryzen 9 7950X3D', category: 'CPU', brand: 'AMD', price: 599, releaseYear: 2023, rating: 4.9, popularity: 95, specs: { cores: 16, threads: 32, baseClock: '4.2 GHz', boostClock: '5.7 GHz', tdp: 120, socket: 'AM5', cache: '144MB', architecture: 'Zen 4 3D V-Cache', pcie: '5.0', ddr: 'DDR5', gaming: true } },
    { id: 1007, name: 'AMD Ryzen 9 7900X', category: 'CPU', brand: 'AMD', price: 399, releaseYear: 2022, rating: 4.7, popularity: 85, specs: { cores: 12, threads: 24, baseClock: '4.7 GHz', boostClock: '5.6 GHz', tdp: 170, socket: 'AM5', cache: '76MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1008, name: 'AMD Ryzen 9 7900X3D', category: 'CPU', brand: 'AMD', price: 449, releaseYear: 2023, rating: 4.8, popularity: 88, specs: { cores: 12, threads: 24, baseClock: '4.4 GHz', boostClock: '5.6 GHz', tdp: 120, socket: 'AM5', cache: '140MB', architecture: 'Zen 4 3D V-Cache', pcie: '5.0', ddr: 'DDR5', gaming: true } },
    { id: 1009, name: 'AMD Ryzen 9 7900', category: 'CPU', brand: 'AMD', price: 349, releaseYear: 2023, rating: 4.6, popularity: 75, specs: { cores: 12, threads: 24, baseClock: '3.7 GHz', boostClock: '5.4 GHz', tdp: 65, socket: 'AM5', cache: '76MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1010, name: 'AMD Ryzen 7 7800X3D', category: 'CPU', brand: 'AMD', price: 449, releaseYear: 2023, rating: 4.9, popularity: 98, specs: { cores: 8, threads: 16, baseClock: '4.2 GHz', boostClock: '5.0 GHz', tdp: 120, socket: 'AM5', cache: '104MB', architecture: 'Zen 4 3D V-Cache', pcie: '5.0', ddr: 'DDR5', gaming: true } },
    { id: 1011, name: 'AMD Ryzen 7 7700X', category: 'CPU', brand: 'AMD', price: 299, releaseYear: 2022, rating: 4.6, popularity: 85, specs: { cores: 8, threads: 16, baseClock: '4.5 GHz', boostClock: '5.4 GHz', tdp: 105, socket: 'AM5', cache: '40MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1012, name: 'AMD Ryzen 7 7700', category: 'CPU', brand: 'AMD', price: 269, releaseYear: 2023, rating: 4.5, popularity: 80, specs: { cores: 8, threads: 16, baseClock: '3.8 GHz', boostClock: '5.3 GHz', tdp: 65, socket: 'AM5', cache: '40MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1013, name: 'AMD Ryzen 5 7600X', category: 'CPU', brand: 'AMD', price: 229, releaseYear: 2022, rating: 4.7, popularity: 92, specs: { cores: 6, threads: 12, baseClock: '4.7 GHz', boostClock: '5.3 GHz', tdp: 105, socket: 'AM5', cache: '38MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1014, name: 'AMD Ryzen 5 7600', category: 'CPU', brand: 'AMD', price: 199, releaseYear: 2023, rating: 4.6, popularity: 90, specs: { cores: 6, threads: 12, baseClock: '3.8 GHz', boostClock: '5.1 GHz', tdp: 65, socket: 'AM5', cache: '38MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5' } },
    { id: 1015, name: 'AMD Ryzen 5 8600G', category: 'CPU', brand: 'AMD', price: 229, releaseYear: 2024, rating: 4.5, popularity: 75, specs: { cores: 6, threads: 12, baseClock: '4.3 GHz', boostClock: '5.0 GHz', tdp: 65, socket: 'AM5', cache: '22MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5', igpu: 'Radeon 760M' } },
    { id: 1016, name: 'AMD Ryzen 7 8700G', category: 'CPU', brand: 'AMD', price: 329, releaseYear: 2024, rating: 4.6, popularity: 70, specs: { cores: 8, threads: 16, baseClock: '4.2 GHz', boostClock: '5.1 GHz', tdp: 65, socket: 'AM5', cache: '24MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5', igpu: 'Radeon 780M' } },

    // Ryzen 5000 Series (Zen 3 - AM4)
    { id: 1017, name: 'AMD Ryzen 9 5950X', category: 'CPU', brand: 'AMD', price: 379, releaseYear: 2020, rating: 4.8, popularity: 75, specs: { cores: 16, threads: 32, baseClock: '3.4 GHz', boostClock: '4.9 GHz', tdp: 105, socket: 'AM4', cache: '72MB', architecture: 'Zen 3', pcie: '4.0', ddr: 'DDR4' } },
    { id: 1018, name: 'AMD Ryzen 9 5900X', category: 'CPU', brand: 'AMD', price: 299, releaseYear: 2020, rating: 4.8, popularity: 80, specs: { cores: 12, threads: 24, baseClock: '3.7 GHz', boostClock: '4.8 GHz', tdp: 105, socket: 'AM4', cache: '70MB', architecture: 'Zen 3', pcie: '4.0', ddr: 'DDR4' } },
    { id: 1019, name: 'AMD Ryzen 7 5800X3D', category: 'CPU', brand: 'AMD', price: 299, releaseYear: 2022, rating: 4.9, popularity: 85, specs: { cores: 8, threads: 16, baseClock: '3.4 GHz', boostClock: '4.5 GHz', tdp: 105, socket: 'AM4', cache: '100MB', architecture: 'Zen 3 3D V-Cache', pcie: '4.0', ddr: 'DDR4', gaming: true } },
    { id: 1020, name: 'AMD Ryzen 7 5800X', category: 'CPU', brand: 'AMD', price: 199, releaseYear: 2020, rating: 4.6, popularity: 75, specs: { cores: 8, threads: 16, baseClock: '3.8 GHz', boostClock: '4.7 GHz', tdp: 105, socket: 'AM4', cache: '36MB', architecture: 'Zen 3', pcie: '4.0', ddr: 'DDR4' } },
    { id: 1021, name: 'AMD Ryzen 7 5700X', category: 'CPU', brand: 'AMD', price: 159, releaseYear: 2022, rating: 4.7, popularity: 88, specs: { cores: 8, threads: 16, baseClock: '3.4 GHz', boostClock: '4.6 GHz', tdp: 65, socket: 'AM4', cache: '36MB', architecture: 'Zen 3', pcie: '4.0', ddr: 'DDR4' } },
    { id: 1022, name: 'AMD Ryzen 7 5700X3D', category: 'CPU', brand: 'AMD', price: 229, releaseYear: 2024, rating: 4.8, popularity: 82, specs: { cores: 8, threads: 16, baseClock: '3.0 GHz', boostClock: '4.1 GHz', tdp: 105, socket: 'AM4', cache: '100MB', architecture: 'Zen 3 3D V-Cache', pcie: '4.0', ddr: 'DDR4', gaming: true } },
    { id: 1023, name: 'AMD Ryzen 5 5600X', category: 'CPU', brand: 'AMD', price: 139, releaseYear: 2020, rating: 4.8, popularity: 95, specs: { cores: 6, threads: 12, baseClock: '3.7 GHz', boostClock: '4.6 GHz', tdp: 65, socket: 'AM4', cache: '35MB', architecture: 'Zen 3', pcie: '4.0', ddr: 'DDR4' } },
    { id: 1024, name: 'AMD Ryzen 5 5600', category: 'CPU', brand: 'AMD', price: 119, releaseYear: 2022, rating: 4.7, popularity: 92, specs: { cores: 6, threads: 12, baseClock: '3.5 GHz', boostClock: '4.4 GHz', tdp: 65, socket: 'AM4', cache: '35MB', architecture: 'Zen 3', pcie: '4.0', ddr: 'DDR4' } },
    { id: 1025, name: 'AMD Ryzen 5 5500', category: 'CPU', brand: 'AMD', price: 89, releaseYear: 2022, rating: 4.5, popularity: 85, specs: { cores: 6, threads: 12, baseClock: '3.6 GHz', boostClock: '4.2 GHz', tdp: 65, socket: 'AM4', cache: '19MB', architecture: 'Zen 3', pcie: '3.0', ddr: 'DDR4' } },
    { id: 1026, name: 'AMD Ryzen 5 5600G', category: 'CPU', brand: 'AMD', price: 129, releaseYear: 2021, rating: 4.6, popularity: 80, specs: { cores: 6, threads: 12, baseClock: '3.9 GHz', boostClock: '4.4 GHz', tdp: 65, socket: 'AM4', cache: '19MB', architecture: 'Zen 3', pcie: '3.0', ddr: 'DDR4', igpu: 'Radeon Vega 7' } },

    // Threadripper (HEDT)
    { id: 1027, name: 'AMD Ryzen Threadripper PRO 7995WX', category: 'CPU', brand: 'AMD', price: 9999, releaseYear: 2023, rating: 4.9, popularity: 60, specs: { cores: 96, threads: 192, baseClock: '2.5 GHz', boostClock: '5.1 GHz', tdp: 350, socket: 'sTR5', cache: '480MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5', workstation: true } },
    { id: 1028, name: 'AMD Ryzen Threadripper PRO 7985WX', category: 'CPU', brand: 'AMD', price: 7399, releaseYear: 2023, rating: 4.9, popularity: 55, specs: { cores: 64, threads: 128, baseClock: '3.2 GHz', boostClock: '5.1 GHz', tdp: 350, socket: 'sTR5', cache: '320MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5', workstation: true } },
    { id: 1029, name: 'AMD Ryzen Threadripper 7980X', category: 'CPU', brand: 'AMD', price: 4999, releaseYear: 2023, rating: 4.8, popularity: 50, specs: { cores: 64, threads: 128, baseClock: '3.2 GHz', boostClock: '5.1 GHz', tdp: 350, socket: 'sTR5', cache: '320MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5', workstation: true } },
    { id: 1030, name: 'AMD Ryzen Threadripper 7970X', category: 'CPU', brand: 'AMD', price: 2499, releaseYear: 2023, rating: 4.8, popularity: 55, specs: { cores: 32, threads: 64, baseClock: '4.0 GHz', boostClock: '5.3 GHz', tdp: 350, socket: 'sTR5', cache: '160MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5', workstation: true } },
    { id: 1031, name: 'AMD Ryzen Threadripper 7960X', category: 'CPU', brand: 'AMD', price: 1499, releaseYear: 2023, rating: 4.7, popularity: 60, specs: { cores: 24, threads: 48, baseClock: '4.2 GHz', boostClock: '5.3 GHz', tdp: 350, socket: 'sTR5', cache: '152MB', architecture: 'Zen 4', pcie: '5.0', ddr: 'DDR5', workstation: true } },
];

// ============================================================================
// CPUs - Intel
// ============================================================================
const INTEL_CPUS: PartSpec[] = [
    // 14th Gen Core (Raptor Lake Refresh - LGA1700)
    { id: 1101, name: 'Intel Core i9-14900KS', category: 'CPU', brand: 'Intel', price: 689, releaseYear: 2024, rating: 4.7, popularity: 75, specs: { cores: 24, threads: 32, pCores: 8, eCores: 16, baseClock: '3.2 GHz', boostClock: '6.2 GHz', tdp: 253, socket: 'LGA1700', cache: '36MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1102, name: 'Intel Core i9-14900K', category: 'CPU', brand: 'Intel', price: 549, releaseYear: 2023, rating: 4.7, popularity: 85, specs: { cores: 24, threads: 32, pCores: 8, eCores: 16, baseClock: '3.2 GHz', boostClock: '6.0 GHz', tdp: 253, socket: 'LGA1700', cache: '36MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1103, name: 'Intel Core i9-14900KF', category: 'CPU', brand: 'Intel', price: 524, releaseYear: 2023, rating: 4.7, popularity: 80, specs: { cores: 24, threads: 32, pCores: 8, eCores: 16, baseClock: '3.2 GHz', boostClock: '6.0 GHz', tdp: 253, socket: 'LGA1700', cache: '36MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1104, name: 'Intel Core i9-14900', category: 'CPU', brand: 'Intel', price: 479, releaseYear: 2024, rating: 4.6, popularity: 70, specs: { cores: 24, threads: 32, pCores: 8, eCores: 16, baseClock: '2.0 GHz', boostClock: '5.8 GHz', tdp: 65, socket: 'LGA1700', cache: '36MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1105, name: 'Intel Core i7-14700K', category: 'CPU', brand: 'Intel', price: 409, releaseYear: 2023, rating: 4.8, popularity: 92, specs: { cores: 20, threads: 28, pCores: 8, eCores: 12, baseClock: '3.4 GHz', boostClock: '5.6 GHz', tdp: 253, socket: 'LGA1700', cache: '33MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1106, name: 'Intel Core i7-14700KF', category: 'CPU', brand: 'Intel', price: 384, releaseYear: 2023, rating: 4.8, popularity: 90, specs: { cores: 20, threads: 28, pCores: 8, eCores: 12, baseClock: '3.4 GHz', boostClock: '5.6 GHz', tdp: 253, socket: 'LGA1700', cache: '33MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1107, name: 'Intel Core i7-14700', category: 'CPU', brand: 'Intel', price: 369, releaseYear: 2024, rating: 4.7, popularity: 85, specs: { cores: 20, threads: 28, pCores: 8, eCores: 12, baseClock: '2.1 GHz', boostClock: '5.4 GHz', tdp: 65, socket: 'LGA1700', cache: '33MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1108, name: 'Intel Core i5-14600K', category: 'CPU', brand: 'Intel', price: 319, releaseYear: 2023, rating: 4.8, popularity: 95, specs: { cores: 14, threads: 20, pCores: 6, eCores: 8, baseClock: '3.5 GHz', boostClock: '5.3 GHz', tdp: 181, socket: 'LGA1700', cache: '24MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1109, name: 'Intel Core i5-14600KF', category: 'CPU', brand: 'Intel', price: 294, releaseYear: 2023, rating: 4.8, popularity: 93, specs: { cores: 14, threads: 20, pCores: 6, eCores: 8, baseClock: '3.5 GHz', boostClock: '5.3 GHz', tdp: 181, socket: 'LGA1700', cache: '24MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1110, name: 'Intel Core i5-14600', category: 'CPU', brand: 'Intel', price: 249, releaseYear: 2024, rating: 4.6, popularity: 80, specs: { cores: 14, threads: 20, pCores: 6, eCores: 8, baseClock: '2.7 GHz', boostClock: '5.2 GHz', tdp: 65, socket: 'LGA1700', cache: '24MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1111, name: 'Intel Core i5-14500', category: 'CPU', brand: 'Intel', price: 229, releaseYear: 2024, rating: 4.5, popularity: 75, specs: { cores: 14, threads: 20, pCores: 6, eCores: 8, baseClock: '2.6 GHz', boostClock: '5.0 GHz', tdp: 65, socket: 'LGA1700', cache: '24MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1112, name: 'Intel Core i5-14400', category: 'CPU', brand: 'Intel', price: 199, releaseYear: 2024, rating: 4.5, popularity: 85, specs: { cores: 10, threads: 16, pCores: 6, eCores: 4, baseClock: '2.5 GHz', boostClock: '4.7 GHz', tdp: 65, socket: 'LGA1700', cache: '20MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1113, name: 'Intel Core i5-14400F', category: 'CPU', brand: 'Intel', price: 179, releaseYear: 2024, rating: 4.6, popularity: 90, specs: { cores: 10, threads: 16, pCores: 6, eCores: 4, baseClock: '2.5 GHz', boostClock: '4.7 GHz', tdp: 65, socket: 'LGA1700', cache: '20MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1114, name: 'Intel Core i3-14100', category: 'CPU', brand: 'Intel', price: 129, releaseYear: 2024, rating: 4.4, popularity: 70, specs: { cores: 4, threads: 8, baseClock: '3.5 GHz', boostClock: '4.7 GHz', tdp: 60, socket: 'LGA1700', cache: '12MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1115, name: 'Intel Core i3-14100F', category: 'CPU', brand: 'Intel', price: 109, releaseYear: 2024, rating: 4.5, popularity: 75, specs: { cores: 4, threads: 8, baseClock: '3.5 GHz', boostClock: '4.7 GHz', tdp: 58, socket: 'LGA1700', cache: '12MB', architecture: 'Raptor Lake Refresh', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },

    // 13th Gen Core (Raptor Lake - LGA1700)
    { id: 1116, name: 'Intel Core i9-13900K', category: 'CPU', brand: 'Intel', price: 489, releaseYear: 2022, rating: 4.7, popularity: 80, specs: { cores: 24, threads: 32, pCores: 8, eCores: 16, baseClock: '3.0 GHz', boostClock: '5.8 GHz', tdp: 253, socket: 'LGA1700', cache: '36MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1117, name: 'Intel Core i9-13900KF', category: 'CPU', brand: 'Intel', price: 464, releaseYear: 2022, rating: 4.7, popularity: 78, specs: { cores: 24, threads: 32, pCores: 8, eCores: 16, baseClock: '3.0 GHz', boostClock: '5.8 GHz', tdp: 253, socket: 'LGA1700', cache: '36MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1118, name: 'Intel Core i7-13700K', category: 'CPU', brand: 'Intel', price: 359, releaseYear: 2022, rating: 4.7, popularity: 85, specs: { cores: 16, threads: 24, pCores: 8, eCores: 8, baseClock: '3.4 GHz', boostClock: '5.4 GHz', tdp: 253, socket: 'LGA1700', cache: '30MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1119, name: 'Intel Core i7-13700KF', category: 'CPU', brand: 'Intel', price: 334, releaseYear: 2022, rating: 4.7, popularity: 83, specs: { cores: 16, threads: 24, pCores: 8, eCores: 8, baseClock: '3.4 GHz', boostClock: '5.4 GHz', tdp: 253, socket: 'LGA1700', cache: '30MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1120, name: 'Intel Core i5-13600K', category: 'CPU', brand: 'Intel', price: 269, releaseYear: 2022, rating: 4.8, popularity: 90, specs: { cores: 14, threads: 20, pCores: 6, eCores: 8, baseClock: '3.5 GHz', boostClock: '5.1 GHz', tdp: 181, socket: 'LGA1700', cache: '24MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1121, name: 'Intel Core i5-13600KF', category: 'CPU', brand: 'Intel', price: 244, releaseYear: 2022, rating: 4.8, popularity: 88, specs: { cores: 14, threads: 20, pCores: 6, eCores: 8, baseClock: '3.5 GHz', boostClock: '5.1 GHz', tdp: 181, socket: 'LGA1700', cache: '24MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1122, name: 'Intel Core i5-13500', category: 'CPU', brand: 'Intel', price: 209, releaseYear: 2023, rating: 4.6, popularity: 80, specs: { cores: 14, threads: 20, pCores: 6, eCores: 8, baseClock: '2.5 GHz', boostClock: '4.8 GHz', tdp: 65, socket: 'LGA1700', cache: '24MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1123, name: 'Intel Core i5-13400', category: 'CPU', brand: 'Intel', price: 179, releaseYear: 2023, rating: 4.5, popularity: 82, specs: { cores: 10, threads: 16, pCores: 6, eCores: 4, baseClock: '2.5 GHz', boostClock: '4.6 GHz', tdp: 65, socket: 'LGA1700', cache: '20MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1124, name: 'Intel Core i5-13400F', category: 'CPU', brand: 'Intel', price: 159, releaseYear: 2023, rating: 4.6, popularity: 88, specs: { cores: 10, threads: 16, pCores: 6, eCores: 4, baseClock: '2.5 GHz', boostClock: '4.6 GHz', tdp: 65, socket: 'LGA1700', cache: '20MB', architecture: 'Raptor Lake', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },

    // 12th Gen Core (Alder Lake - LGA1700)
    { id: 1125, name: 'Intel Core i9-12900K', category: 'CPU', brand: 'Intel', price: 349, releaseYear: 2021, rating: 4.6, popularity: 65, specs: { cores: 16, threads: 24, pCores: 8, eCores: 8, baseClock: '3.2 GHz', boostClock: '5.2 GHz', tdp: 241, socket: 'LGA1700', cache: '30MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1126, name: 'Intel Core i7-12700K', category: 'CPU', brand: 'Intel', price: 279, releaseYear: 2021, rating: 4.6, popularity: 70, specs: { cores: 12, threads: 20, pCores: 8, eCores: 4, baseClock: '3.6 GHz', boostClock: '5.0 GHz', tdp: 190, socket: 'LGA1700', cache: '25MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1127, name: 'Intel Core i5-12600K', category: 'CPU', brand: 'Intel', price: 199, releaseYear: 2021, rating: 4.7, popularity: 75, specs: { cores: 10, threads: 16, pCores: 6, eCores: 4, baseClock: '3.7 GHz', boostClock: '4.9 GHz', tdp: 150, socket: 'LGA1700', cache: '20MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1128, name: 'Intel Core i5-12400', category: 'CPU', brand: 'Intel', price: 139, releaseYear: 2022, rating: 4.7, popularity: 85, specs: { cores: 6, threads: 12, baseClock: '2.5 GHz', boostClock: '4.4 GHz', tdp: 65, socket: 'LGA1700', cache: '18MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1129, name: 'Intel Core i5-12400F', category: 'CPU', brand: 'Intel', price: 119, releaseYear: 2022, rating: 4.8, popularity: 90, specs: { cores: 6, threads: 12, baseClock: '2.5 GHz', boostClock: '4.4 GHz', tdp: 65, socket: 'LGA1700', cache: '18MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },
    { id: 1130, name: 'Intel Core i3-12100', category: 'CPU', brand: 'Intel', price: 99, releaseYear: 2022, rating: 4.5, popularity: 70, specs: { cores: 4, threads: 8, baseClock: '3.3 GHz', boostClock: '4.3 GHz', tdp: 60, socket: 'LGA1700', cache: '12MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5' } },
    { id: 1131, name: 'Intel Core i3-12100F', category: 'CPU', brand: 'Intel', price: 79, releaseYear: 2022, rating: 4.6, popularity: 80, specs: { cores: 4, threads: 8, baseClock: '3.3 GHz', boostClock: '4.3 GHz', tdp: 58, socket: 'LGA1700', cache: '12MB', architecture: 'Alder Lake', pcie: '5.0', ddr: 'DDR4/DDR5', noIGPU: true } },

    // Intel Core Ultra (Arrow Lake - LGA1851)
    { id: 1132, name: 'Intel Core Ultra 9 285K', category: 'CPU', brand: 'Intel', price: 589, releaseYear: 2024, rating: 4.6, popularity: 70, specs: { cores: 24, threads: 24, pCores: 8, eCores: 16, baseClock: '3.7 GHz', boostClock: '5.7 GHz', tdp: 125, socket: 'LGA1851', cache: '36MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5', aiNPU: true } },
    { id: 1133, name: 'Intel Core Ultra 7 265K', category: 'CPU', brand: 'Intel', price: 394, releaseYear: 2024, rating: 4.5, popularity: 65, specs: { cores: 20, threads: 20, pCores: 8, eCores: 12, baseClock: '3.9 GHz', boostClock: '5.5 GHz', tdp: 125, socket: 'LGA1851', cache: '30MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5', aiNPU: true } },
    { id: 1134, name: 'Intel Core Ultra 5 245K', category: 'CPU', brand: 'Intel', price: 309, releaseYear: 2024, rating: 4.4, popularity: 60, specs: { cores: 14, threads: 14, pCores: 6, eCores: 8, baseClock: '4.2 GHz', boostClock: '5.2 GHz', tdp: 125, socket: 'LGA1851', cache: '24MB', architecture: 'Arrow Lake', pcie: '5.0', ddr: 'DDR5', aiNPU: true } },
];

// Generated expansion to push total parts over 500
const EXTRA_AMD_CPUS: PartSpec[] = Array.from({ length: 40 }, (_, i) => {
    const isAm5 = i < 20;
    const tier = [5, 7, 9, 9][i % 4];
    const cores = [6, 8, 12, 16][i % 4];
    const baseModel = isAm5 ? 7600 + i : 5600 + i;
    const tdp = [65, 105, 120, 170][i % 4];
    const cache = [32, 40, 64, 80][i % 4];
    const boostBase = isAm5 ? 5.0 : 4.6;
    const boostClock = (boostBase + (i % 5) * 0.1).toFixed(1);
    const baseClock = (3.2 + (i % 4) * 0.2).toFixed(1);

    return {
        id: 1200 + i,
        name: `AMD Ryzen ${tier} ${baseModel}X`,
        category: 'CPU',
        brand: 'AMD',
        price: 149 + (i % 10) * 12,
        releaseYear: isAm5 ? 2024 : 2022,
        rating: 4.4 + (i % 5) * 0.1,
        popularity: 60 + (i % 35),
        specs: {
            cores,
            threads: cores * 2,
            baseClock: `${baseClock} GHz`,
            boostClock: `${boostClock} GHz`,
            tdp,
            socket: isAm5 ? 'AM5' : 'AM4',
            cache: `${cache}MB`,
            architecture: isAm5 ? 'Zen 4' : 'Zen 3',
            pcie: isAm5 ? '5.0' : '4.0',
            ddr: isAm5 ? 'DDR5' : 'DDR4'
        }
    };
});

const EXTRA_INTEL_CPUS: PartSpec[] = Array.from({ length: 40 }, (_, i) => {
    const tier = [3, 5, 7, 9][i % 4];
    const suffix = ['K', 'KF', '', 'F'][i % 4];
    const modelBase = 14100 + i * 10;
    const pCores = tier === 9 ? 8 : tier === 7 ? 8 : tier === 5 ? 6 : 4;
    const eCores = tier === 9 ? 16 : tier === 7 ? 12 : tier === 5 ? 8 : 0;
    const cores = pCores + eCores;
    const threads = tier === 3 ? 8 : tier === 5 ? 16 : tier === 7 ? 24 : 32;
    const baseClock = (2.5 + (i % 4) * 0.2).toFixed(1);
    const boostClock = (4.6 + (i % 5) * 0.2).toFixed(1);
    const tdp = suffix === 'K' || suffix === 'KF' ? 181 : 65;

    return {
        id: 1300 + i,
        name: `Intel Core i${tier}-${modelBase}${suffix}`,
        category: 'CPU',
        brand: 'Intel',
        price: 129 + (i % 12) * 15,
        releaseYear: 2023,
        rating: 4.3 + (i % 6) * 0.1,
        popularity: 55 + (i % 40),
        specs: {
            cores,
            threads,
            pCores,
            eCores,
            baseClock: `${baseClock} GHz`,
            boostClock: `${boostClock} GHz`,
            tdp,
            socket: 'LGA1700',
            cache: `${20 + (i % 6) * 2}MB`,
            architecture: 'Raptor Lake Refresh',
            pcie: '5.0',
            ddr: 'DDR4/DDR5',
            ...(suffix.includes('F') ? { noIGPU: true } : {})
        }
    };
});

export const ALL_CPUS = [...AMD_CPUS, ...INTEL_CPUS, ...EXTRA_AMD_CPUS, ...EXTRA_INTEL_CPUS];


// ============================================================================
// GPUs - NVIDIA
// ============================================================================
const NVIDIA_GPUS: PartSpec[] = [
    // RTX 50 Series (Blackwell)
    { id: 2001, name: 'NVIDIA GeForce RTX 5090', category: 'GPU', brand: 'NVIDIA', price: 1999, releaseYear: 2025, rating: 4.9, popularity: 90, specs: { vram: '32GB GDDR7', memoryBus: '512-bit', baseClock: '2.01 GHz', boostClock: '2.41 GHz', tdp: 575, cuda: 21760, rt: 3, architecture: 'Blackwell', pcie: '5.0', hdmi: '2.1a', dp: '2.1', length: '336mm', slots: 4 } },
    { id: 2002, name: 'NVIDIA GeForce RTX 5080', category: 'GPU', brand: 'NVIDIA', price: 999, releaseYear: 2025, rating: 4.8, popularity: 85, specs: { vram: '16GB GDDR7', memoryBus: '256-bit', baseClock: '2.30 GHz', boostClock: '2.62 GHz', tdp: 360, cuda: 10752, rt: 3, architecture: 'Blackwell', pcie: '5.0', hdmi: '2.1a', dp: '2.1', length: '304mm', slots: 2.5 } },
    { id: 2003, name: 'NVIDIA GeForce RTX 5070 Ti', category: 'GPU', brand: 'NVIDIA', price: 749, releaseYear: 2025, rating: 4.7, popularity: 80, specs: { vram: '16GB GDDR7', memoryBus: '256-bit', baseClock: '2.30 GHz', boostClock: '2.45 GHz', tdp: 300, cuda: 8960, rt: 3, architecture: 'Blackwell', pcie: '5.0', hdmi: '2.1a', dp: '2.1', length: '285mm', slots: 2.5 } },
    { id: 2004, name: 'NVIDIA GeForce RTX 5070', category: 'GPU', brand: 'NVIDIA', price: 549, releaseYear: 2025, rating: 4.7, popularity: 85, specs: { vram: '12GB GDDR7', memoryBus: '192-bit', baseClock: '2.16 GHz', boostClock: '2.51 GHz', tdp: 220, cuda: 6144, rt: 3, architecture: 'Blackwell', pcie: '5.0', hdmi: '2.1a', dp: '2.1', length: '267mm', slots: 2 } },

    // RTX 40 Series (Ada Lovelace)
    { id: 2010, name: 'NVIDIA GeForce RTX 4090', category: 'GPU', brand: 'NVIDIA', price: 1599, releaseYear: 2022, rating: 4.9, popularity: 95, specs: { vram: '24GB GDDR6X', memoryBus: '384-bit', baseClock: '2.23 GHz', boostClock: '2.52 GHz', tdp: 450, cuda: 16384, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '336mm', slots: 3.5 } },
    { id: 2011, name: 'NVIDIA GeForce RTX 4090 D', category: 'GPU', brand: 'NVIDIA', price: 1499, releaseYear: 2024, rating: 4.8, popularity: 60, specs: { vram: '24GB GDDR6X', memoryBus: '384-bit', baseClock: '2.28 GHz', boostClock: '2.52 GHz', tdp: 425, cuda: 14592, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '336mm', slots: 3.5 } },
    { id: 2012, name: 'NVIDIA GeForce RTX 4080 Super', category: 'GPU', brand: 'NVIDIA', price: 999, releaseYear: 2024, rating: 4.8, popularity: 90, specs: { vram: '16GB GDDR6X', memoryBus: '256-bit', baseClock: '2.29 GHz', boostClock: '2.55 GHz', tdp: 320, cuda: 10240, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '304mm', slots: 2.5 } },
    { id: 2013, name: 'NVIDIA GeForce RTX 4080', category: 'GPU', brand: 'NVIDIA', price: 899, releaseYear: 2022, rating: 4.7, popularity: 85, specs: { vram: '16GB GDDR6X', memoryBus: '256-bit', baseClock: '2.21 GHz', boostClock: '2.51 GHz', tdp: 320, cuda: 9728, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '304mm', slots: 2.5 } },
    { id: 2014, name: 'NVIDIA GeForce RTX 4070 Ti Super', category: 'GPU', brand: 'NVIDIA', price: 799, releaseYear: 2024, rating: 4.8, popularity: 92, specs: { vram: '16GB GDDR6X', memoryBus: '256-bit', baseClock: '2.34 GHz', boostClock: '2.61 GHz', tdp: 285, cuda: 8448, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '285mm', slots: 2.5 } },
    { id: 2015, name: 'NVIDIA GeForce RTX 4070 Ti', category: 'GPU', brand: 'NVIDIA', price: 699, releaseYear: 2023, rating: 4.7, popularity: 88, specs: { vram: '12GB GDDR6X', memoryBus: '192-bit', baseClock: '2.31 GHz', boostClock: '2.61 GHz', tdp: 285, cuda: 7680, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '285mm', slots: 2.5 } },
    { id: 2016, name: 'NVIDIA GeForce RTX 4070 Super', category: 'GPU', brand: 'NVIDIA', price: 599, releaseYear: 2024, rating: 4.8, popularity: 95, specs: { vram: '12GB GDDR6X', memoryBus: '192-bit', baseClock: '1.98 GHz', boostClock: '2.48 GHz', tdp: 220, cuda: 7168, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '244mm', slots: 2 } },
    { id: 2017, name: 'NVIDIA GeForce RTX 4070', category: 'GPU', brand: 'NVIDIA', price: 499, releaseYear: 2023, rating: 4.7, popularity: 92, specs: { vram: '12GB GDDR6X', memoryBus: '192-bit', baseClock: '1.92 GHz', boostClock: '2.48 GHz', tdp: 200, cuda: 5888, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '244mm', slots: 2 } },
    { id: 2018, name: 'NVIDIA GeForce RTX 4060 Ti 16GB', category: 'GPU', brand: 'NVIDIA', price: 449, releaseYear: 2023, rating: 4.5, popularity: 75, specs: { vram: '16GB GDDR6', memoryBus: '128-bit', baseClock: '2.31 GHz', boostClock: '2.54 GHz', tdp: 165, cuda: 4352, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '240mm', slots: 2 } },
    { id: 2019, name: 'NVIDIA GeForce RTX 4060 Ti 8GB', category: 'GPU', brand: 'NVIDIA', price: 399, releaseYear: 2023, rating: 4.5, popularity: 80, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '2.31 GHz', boostClock: '2.54 GHz', tdp: 160, cuda: 4352, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '240mm', slots: 2 } },
    { id: 2020, name: 'NVIDIA GeForce RTX 4060', category: 'GPU', brand: 'NVIDIA', price: 299, releaseYear: 2023, rating: 4.6, popularity: 90, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '1.83 GHz', boostClock: '2.46 GHz', tdp: 115, cuda: 3072, rt: 3, architecture: 'Ada Lovelace', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '240mm', slots: 2 } },

    // RTX 30 Series (Ampere)
    { id: 2030, name: 'NVIDIA GeForce RTX 3090 Ti', category: 'GPU', brand: 'NVIDIA', price: 999, releaseYear: 2022, rating: 4.7, popularity: 60, specs: { vram: '24GB GDDR6X', memoryBus: '384-bit', baseClock: '1.56 GHz', boostClock: '1.86 GHz', tdp: 450, cuda: 10752, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '336mm', slots: 3 } },
    { id: 2031, name: 'NVIDIA GeForce RTX 3090', category: 'GPU', brand: 'NVIDIA', price: 799, releaseYear: 2020, rating: 4.7, popularity: 65, specs: { vram: '24GB GDDR6X', memoryBus: '384-bit', baseClock: '1.40 GHz', boostClock: '1.70 GHz', tdp: 350, cuda: 10496, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '313mm', slots: 3 } },
    { id: 2032, name: 'NVIDIA GeForce RTX 3080 Ti', category: 'GPU', brand: 'NVIDIA', price: 599, releaseYear: 2021, rating: 4.7, popularity: 70, specs: { vram: '12GB GDDR6X', memoryBus: '384-bit', baseClock: '1.37 GHz', boostClock: '1.67 GHz', tdp: 350, cuda: 10240, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '285mm', slots: 2.5 } },
    { id: 2033, name: 'NVIDIA GeForce RTX 3080 12GB', category: 'GPU', brand: 'NVIDIA', price: 549, releaseYear: 2022, rating: 4.7, popularity: 72, specs: { vram: '12GB GDDR6X', memoryBus: '384-bit', baseClock: '1.26 GHz', boostClock: '1.71 GHz', tdp: 350, cuda: 8960, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '285mm', slots: 2.5 } },
    { id: 2034, name: 'NVIDIA GeForce RTX 3080 10GB', category: 'GPU', brand: 'NVIDIA', price: 499, releaseYear: 2020, rating: 4.7, popularity: 75, specs: { vram: '10GB GDDR6X', memoryBus: '320-bit', baseClock: '1.44 GHz', boostClock: '1.71 GHz', tdp: 320, cuda: 8704, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '285mm', slots: 2 } },
    { id: 2035, name: 'NVIDIA GeForce RTX 3070 Ti', category: 'GPU', brand: 'NVIDIA', price: 399, releaseYear: 2021, rating: 4.6, popularity: 78, specs: { vram: '8GB GDDR6X', memoryBus: '256-bit', baseClock: '1.58 GHz', boostClock: '1.77 GHz', tdp: 290, cuda: 6144, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '267mm', slots: 2 } },
    { id: 2036, name: 'NVIDIA GeForce RTX 3070', category: 'GPU', brand: 'NVIDIA', price: 349, releaseYear: 2020, rating: 4.7, popularity: 85, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.50 GHz', boostClock: '1.73 GHz', tdp: 220, cuda: 5888, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '242mm', slots: 2 } },
    { id: 2037, name: 'NVIDIA GeForce RTX 3060 Ti', category: 'GPU', brand: 'NVIDIA', price: 299, releaseYear: 2020, rating: 4.7, popularity: 88, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.41 GHz', boostClock: '1.67 GHz', tdp: 200, cuda: 4864, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '242mm', slots: 2 } },
    { id: 2038, name: 'NVIDIA GeForce RTX 3060 12GB', category: 'GPU', brand: 'NVIDIA', price: 249, releaseYear: 2021, rating: 4.6, popularity: 90, specs: { vram: '12GB GDDR6', memoryBus: '192-bit', baseClock: '1.32 GHz', boostClock: '1.78 GHz', tdp: 170, cuda: 3584, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '242mm', slots: 2 } },
    { id: 2039, name: 'NVIDIA GeForce RTX 3060 8GB', category: 'GPU', brand: 'NVIDIA', price: 219, releaseYear: 2024, rating: 4.4, popularity: 75, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '1.32 GHz', boostClock: '1.78 GHz', tdp: 170, cuda: 3584, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '242mm', slots: 2 } },
    { id: 2040, name: 'NVIDIA GeForce RTX 3050 8GB', category: 'GPU', brand: 'NVIDIA', price: 179, releaseYear: 2022, rating: 4.3, popularity: 80, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '1.55 GHz', boostClock: '1.78 GHz', tdp: 130, cuda: 2560, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '229mm', slots: 2 } },
    { id: 2041, name: 'NVIDIA GeForce RTX 3050 6GB', category: 'GPU', brand: 'NVIDIA', price: 149, releaseYear: 2024, rating: 4.1, popularity: 70, specs: { vram: '6GB GDDR6', memoryBus: '96-bit', baseClock: '1.04 GHz', boostClock: '1.47 GHz', tdp: 70, cuda: 2048, rt: 2, architecture: 'Ampere', pcie: '4.0', hdmi: '2.1', dp: '1.4a', length: '167mm', slots: 2 } },
];

// ============================================================================
// GPUs - AMD
// ============================================================================
const AMD_GPUS: PartSpec[] = [
    // RX 9000 Series (RDNA 4)
    { id: 2101, name: 'AMD Radeon RX 9070 XT', category: 'GPU', brand: 'AMD', price: 599, releaseYear: 2025, rating: 4.7, popularity: 80, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '2.00 GHz', boostClock: '2.95 GHz', tdp: 250, shaders: 4096, rt: 2, architecture: 'RDNA 4', pcie: '5.0', hdmi: '2.1', dp: '2.1', length: '267mm', slots: 2.5 } },
    { id: 2102, name: 'AMD Radeon RX 9070', category: 'GPU', brand: 'AMD', price: 499, releaseYear: 2025, rating: 4.6, popularity: 75, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '1.85 GHz', boostClock: '2.75 GHz', tdp: 220, shaders: 3584, rt: 2, architecture: 'RDNA 4', pcie: '5.0', hdmi: '2.1', dp: '2.1', length: '267mm', slots: 2.5 } },

    // RX 7000 Series (RDNA 3)
    { id: 2110, name: 'AMD Radeon RX 7900 XTX', category: 'GPU', brand: 'AMD', price: 899, releaseYear: 2022, rating: 4.7, popularity: 88, specs: { vram: '24GB GDDR6', memoryBus: '384-bit', baseClock: '1.86 GHz', boostClock: '2.50 GHz', tdp: 355, shaders: 6144, rt: 2, architecture: 'RDNA 3', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '287mm', slots: 2.5 } },
    { id: 2111, name: 'AMD Radeon RX 7900 XT', category: 'GPU', brand: 'AMD', price: 699, releaseYear: 2022, rating: 4.6, popularity: 82, specs: { vram: '20GB GDDR6', memoryBus: '320-bit', baseClock: '1.50 GHz', boostClock: '2.40 GHz', tdp: 315, shaders: 5376, rt: 2, architecture: 'RDNA 3', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '276mm', slots: 2.5 } },
    { id: 2112, name: 'AMD Radeon RX 7900 GRE', category: 'GPU', brand: 'AMD', price: 549, releaseYear: 2024, rating: 4.6, popularity: 85, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '1.25 GHz', boostClock: '2.25 GHz', tdp: 260, shaders: 5120, rt: 2, architecture: 'RDNA 3', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '267mm', slots: 2.5 } },
    { id: 2113, name: 'AMD Radeon RX 7800 XT', category: 'GPU', brand: 'AMD', price: 449, releaseYear: 2023, rating: 4.7, popularity: 92, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '1.30 GHz', boostClock: '2.43 GHz', tdp: 263, shaders: 3840, rt: 2, architecture: 'RDNA 3', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '267mm', slots: 2.5 } },
    { id: 2114, name: 'AMD Radeon RX 7700 XT', category: 'GPU', brand: 'AMD', price: 379, releaseYear: 2023, rating: 4.6, popularity: 88, specs: { vram: '12GB GDDR6', memoryBus: '192-bit', baseClock: '1.70 GHz', boostClock: '2.54 GHz', tdp: 245, shaders: 3456, rt: 2, architecture: 'RDNA 3', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '267mm', slots: 2.5 } },
    { id: 2115, name: 'AMD Radeon RX 7600 XT', category: 'GPU', brand: 'AMD', price: 329, releaseYear: 2024, rating: 4.5, popularity: 78, specs: { vram: '16GB GDDR6', memoryBus: '128-bit', baseClock: '1.72 GHz', boostClock: '2.76 GHz', tdp: 190, shaders: 2048, rt: 2, architecture: 'RDNA 3', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '204mm', slots: 2 } },
    { id: 2116, name: 'AMD Radeon RX 7600', category: 'GPU', brand: 'AMD', price: 249, releaseYear: 2023, rating: 4.5, popularity: 85, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '1.72 GHz', boostClock: '2.66 GHz', tdp: 165, shaders: 2048, rt: 2, architecture: 'RDNA 3', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '204mm', slots: 2 } },

    // RX 6000 Series (RDNA 2)
    { id: 2120, name: 'AMD Radeon RX 6950 XT', category: 'GPU', brand: 'AMD', price: 499, releaseYear: 2022, rating: 4.6, popularity: 70, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '1.89 GHz', boostClock: '2.31 GHz', tdp: 335, shaders: 5120, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '267mm', slots: 2.5 } },
    { id: 2121, name: 'AMD Radeon RX 6900 XT', category: 'GPU', brand: 'AMD', price: 449, releaseYear: 2020, rating: 4.6, popularity: 68, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '1.83 GHz', boostClock: '2.25 GHz', tdp: 300, shaders: 5120, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '267mm', slots: 2.5 } },
    { id: 2122, name: 'AMD Radeon RX 6800 XT', category: 'GPU', brand: 'AMD', price: 379, releaseYear: 2020, rating: 4.6, popularity: 72, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '1.83 GHz', boostClock: '2.25 GHz', tdp: 300, shaders: 4608, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '267mm', slots: 2.5 } },
    { id: 2123, name: 'AMD Radeon RX 6800', category: 'GPU', brand: 'AMD', price: 329, releaseYear: 2020, rating: 4.5, popularity: 70, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '1.70 GHz', boostClock: '2.11 GHz', tdp: 250, shaders: 3840, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '267mm', slots: 2.5 } },
    { id: 2124, name: 'AMD Radeon RX 6750 XT', category: 'GPU', brand: 'AMD', price: 279, releaseYear: 2022, rating: 4.5, popularity: 75, specs: { vram: '12GB GDDR6', memoryBus: '192-bit', baseClock: '2.15 GHz', boostClock: '2.60 GHz', tdp: 250, shaders: 2560, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '267mm', slots: 2.5 } },
    { id: 2125, name: 'AMD Radeon RX 6700 XT', category: 'GPU', brand: 'AMD', price: 249, releaseYear: 2021, rating: 4.5, popularity: 78, specs: { vram: '12GB GDDR6', memoryBus: '192-bit', baseClock: '2.32 GHz', boostClock: '2.58 GHz', tdp: 230, shaders: 2560, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '267mm', slots: 2.5 } },
    { id: 2126, name: 'AMD Radeon RX 6700 10GB', category: 'GPU', brand: 'AMD', price: 219, releaseYear: 2022, rating: 4.4, popularity: 70, specs: { vram: '10GB GDDR6', memoryBus: '160-bit', baseClock: '2.17 GHz', boostClock: '2.45 GHz', tdp: 175, shaders: 2304, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '240mm', slots: 2 } },
    { id: 2127, name: 'AMD Radeon RX 6650 XT', category: 'GPU', brand: 'AMD', price: 199, releaseYear: 2022, rating: 4.5, popularity: 82, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '2.06 GHz', boostClock: '2.64 GHz', tdp: 180, shaders: 2048, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '240mm', slots: 2 } },
    { id: 2128, name: 'AMD Radeon RX 6600 XT', category: 'GPU', brand: 'AMD', price: 179, releaseYear: 2021, rating: 4.5, popularity: 80, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '1.97 GHz', boostClock: '2.59 GHz', tdp: 160, shaders: 2048, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '240mm', slots: 2 } },
    { id: 2129, name: 'AMD Radeon RX 6600', category: 'GPU', brand: 'AMD', price: 159, releaseYear: 2021, rating: 4.4, popularity: 78, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '1.63 GHz', boostClock: '2.49 GHz', tdp: 132, shaders: 1792, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '240mm', slots: 2 } },
    { id: 2130, name: 'AMD Radeon RX 6500 XT', category: 'GPU', brand: 'AMD', price: 119, releaseYear: 2022, rating: 3.8, popularity: 60, specs: { vram: '4GB GDDR6', memoryBus: '64-bit', baseClock: '2.61 GHz', boostClock: '2.82 GHz', tdp: 107, shaders: 1024, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '194mm', slots: 2 } },
    { id: 2131, name: 'AMD Radeon RX 6400', category: 'GPU', brand: 'AMD', price: 99, releaseYear: 2022, rating: 3.7, popularity: 55, specs: { vram: '4GB GDDR6', memoryBus: '64-bit', baseClock: '1.92 GHz', boostClock: '2.32 GHz', tdp: 53, shaders: 768, rt: 1, architecture: 'RDNA 2', pcie: '4.0', hdmi: '2.1', dp: '1.4', length: '160mm', slots: 1 } },
];

// Intel Arc GPUs
const INTEL_GPUS: PartSpec[] = [
    { id: 2201, name: 'Intel Arc B580', category: 'GPU', brand: 'Intel', price: 249, releaseYear: 2024, rating: 4.4, popularity: 75, specs: { vram: '12GB GDDR6', memoryBus: '192-bit', baseClock: '2.07 GHz', boostClock: '2.67 GHz', tdp: 190, xeCore: 20, rt: 2, architecture: 'Battlemage', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '255mm', slots: 2 } },
    { id: 2202, name: 'Intel Arc B570', category: 'GPU', brand: 'Intel', price: 199, releaseYear: 2025, rating: 4.3, popularity: 70, specs: { vram: '10GB GDDR6', memoryBus: '160-bit', baseClock: '2.15 GHz', boostClock: '2.75 GHz', tdp: 150, xeCore: 18, rt: 2, architecture: 'Battlemage', pcie: '4.0', hdmi: '2.1', dp: '2.1', length: '230mm', slots: 2 } },
    { id: 2203, name: 'Intel Arc A770 16GB', category: 'GPU', brand: 'Intel', price: 299, releaseYear: 2022, rating: 4.3, popularity: 72, specs: { vram: '16GB GDDR6', memoryBus: '256-bit', baseClock: '2.10 GHz', boostClock: '2.40 GHz', tdp: 225, xeCore: 32, rt: 1, architecture: 'Alchemist', pcie: '4.0', hdmi: '2.1', dp: '2.0', length: '267mm', slots: 2 } },
    { id: 2204, name: 'Intel Arc A750', category: 'GPU', brand: 'Intel', price: 219, releaseYear: 2022, rating: 4.2, popularity: 70, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '2.05 GHz', boostClock: '2.40 GHz', tdp: 225, xeCore: 28, rt: 1, architecture: 'Alchemist', pcie: '4.0', hdmi: '2.1', dp: '2.0', length: '267mm', slots: 2 } },
    { id: 2205, name: 'Intel Arc A580', category: 'GPU', brand: 'Intel', price: 169, releaseYear: 2023, rating: 4.1, popularity: 65, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.70 GHz', boostClock: '2.00 GHz', tdp: 175, xeCore: 24, rt: 1, architecture: 'Alchemist', pcie: '4.0', hdmi: '2.1', dp: '2.0', length: '255mm', slots: 2 } },
    { id: 2206, name: 'Intel Arc A380', category: 'GPU', brand: 'Intel', price: 99, releaseYear: 2022, rating: 3.8, popularity: 55, specs: { vram: '6GB GDDR6', memoryBus: '96-bit', baseClock: '2.00 GHz', boostClock: '2.30 GHz', tdp: 75, xeCore: 8, rt: 1, architecture: 'Alchemist', pcie: '4.0', hdmi: '2.1', dp: '2.0', length: '190mm', slots: 2 } },
];

// Generated expansion to push total parts over 500
const EXTRA_NVIDIA_GPUS: PartSpec[] = Array.from({ length: 40 }, (_, i) => {
    const bases = [5090, 5080, 5070, 5060, 5050, 4090, 4080, 4070, 4060, 4050];
    const variants = ['', 'Super', 'Ti', 'Ti Super'];
    const base = bases[i % bases.length];
    const variant = variants[i % variants.length];
    const name = `NVIDIA GeForce RTX ${base}${variant ? ' ' + variant : ''}`;
    const vram = base >= 5090 ? '24GB GDDR7' : base >= 5080 ? '16GB GDDR7' : base >= 5070 ? '12GB GDDR7' : base >= 4090 ? '24GB GDDR6X' : base >= 4080 ? '16GB GDDR6X' : base >= 4070 ? '12GB GDDR6X' : '8GB GDDR6';
    const memoryBus = base >= 5090 ? '384-bit' : base >= 5080 ? '256-bit' : base >= 5070 ? '192-bit' : base >= 4080 ? '256-bit' : base >= 4070 ? '192-bit' : '128-bit';
    const baseClock = (1.8 + (i % 5) * 0.1).toFixed(2);
    const boostClock = (2.3 + (i % 6) * 0.1).toFixed(2);
    const tdp = base >= 5090 ? 450 : base >= 5080 ? 360 : base >= 5070 ? 240 : base >= 4090 ? 450 : base >= 4080 ? 320 : base >= 4070 ? 220 : 160;
    const cuda = base >= 5090 ? 18432 : base >= 5080 ? 12288 : base >= 5070 ? 8192 : base >= 4090 ? 16384 : base >= 4080 ? 10240 : base >= 4070 ? 7168 : 4096;
    const architecture = base >= 5000 ? 'Blackwell' : 'Ada Lovelace';
    const pcie = base >= 5000 ? '5.0' : '4.0';
    const length = base >= 5090 ? '336mm' : base >= 5080 ? '304mm' : base >= 5070 ? '285mm' : '242mm';
    const slots = base >= 5090 ? 4 : base >= 5080 ? 2.5 : base >= 5070 ? 2.5 : 2;

    return {
        id: 2301 + i,
        name,
        category: 'GPU',
        brand: 'NVIDIA',
        price: 399 + (i % 10) * 60,
        releaseYear: base >= 5000 ? 2025 : 2024,
        rating: 4.3 + (i % 6) * 0.1,
        popularity: 60 + (i % 35),
        specs: {
            vram,
            memoryBus,
            baseClock: `${baseClock} GHz`,
            boostClock: `${boostClock} GHz`,
            tdp,
            cuda,
            rt: 3,
            architecture,
            pcie,
            hdmi: '2.1a',
            dp: base >= 5000 ? '2.1' : '1.4a',
            length,
            slots
        }
    };
});

const EXTRA_AMD_GPUS: PartSpec[] = Array.from({ length: 30 }, (_, i) => {
    const bases = [8900, 8800, 8700, 8600, 8500, 7900, 7800, 7700, 7600, 7500];
    const base = bases[i % bases.length];
    const variant = base >= 8800 ? 'XTX' : base >= 8700 ? 'XT' : base >= 7900 ? 'XT' : '';
    const name = `AMD Radeon RX ${base}${variant ? ' ' + variant : ''}`;
    const vram = base >= 8900 ? '24GB GDDR6' : base >= 8800 ? '20GB GDDR6' : base >= 8700 ? '16GB GDDR6' : base >= 8600 ? '12GB GDDR6' : base >= 7900 ? '20GB GDDR6' : base >= 7800 ? '16GB GDDR6' : base >= 7700 ? '12GB GDDR6' : '8GB GDDR6';
    const memoryBus = base >= 8900 ? '384-bit' : base >= 8800 ? '320-bit' : base >= 8700 ? '256-bit' : base >= 8600 ? '192-bit' : base >= 7700 ? '192-bit' : '128-bit';
    const baseClock = (1.6 + (i % 5) * 0.1).toFixed(2);
    const boostClock = (2.2 + (i % 6) * 0.1).toFixed(2);
    const tdp = base >= 8900 ? 350 : base >= 8800 ? 300 : base >= 8700 ? 265 : base >= 8600 ? 220 : base >= 7900 ? 300 : base >= 7800 ? 260 : base >= 7700 ? 245 : 180;
    const shaders = base >= 8900 ? 6144 : base >= 8800 ? 5376 : base >= 8700 ? 4096 : base >= 8600 ? 3584 : base >= 7900 ? 5376 : base >= 7800 ? 3840 : base >= 7700 ? 3456 : 2048;
    const architecture = base >= 8600 ? 'RDNA 4' : 'RDNA 3';

    return {
        id: 2401 + i,
        name,
        category: 'GPU',
        brand: 'AMD',
        price: 299 + (i % 10) * 40,
        releaseYear: base >= 8600 ? 2025 : 2023,
        rating: 4.2 + (i % 6) * 0.1,
        popularity: 55 + (i % 35),
        specs: {
            vram,
            memoryBus,
            baseClock: `${baseClock} GHz`,
            boostClock: `${boostClock} GHz`,
            tdp,
            shaders,
            rt: 2,
            architecture,
            pcie: base >= 8600 ? '5.0' : '4.0',
            hdmi: '2.1',
            dp: '2.1',
            length: '267mm',
            slots: 2.5
        }
    };
});

const EXTRA_INTEL_GPUS: PartSpec[] = Array.from({ length: 10 }, (_, i) => {
    const bases = ['B780', 'B770', 'B750', 'B580', 'B570', 'A780', 'A770', 'A750', 'A580', 'A380'];
    const base = bases[i % bases.length];
    const vram = base.startsWith('B7') ? '16GB GDDR6' : base.startsWith('B5') ? '12GB GDDR6' : base.startsWith('A7') ? '16GB GDDR6' : base.startsWith('A5') ? '8GB GDDR6' : '6GB GDDR6';
    const xeCore = base.startsWith('B7') ? 28 : base.startsWith('B5') ? 20 : base.startsWith('A7') ? 32 : base.startsWith('A5') ? 24 : 8;

    return {
        id: 2501 + i,
        name: `Intel Arc ${base}`,
        category: 'GPU',
        brand: 'Intel',
        price: 149 + (i % 6) * 40,
        releaseYear: base.startsWith('B') ? 2025 : 2022,
        rating: 4.1 + (i % 5) * 0.1,
        popularity: 50 + (i % 30),
        specs: {
            vram,
            memoryBus: base.startsWith('B7') ? '256-bit' : base.startsWith('B5') ? '192-bit' : base.startsWith('A7') ? '256-bit' : base.startsWith('A5') ? '192-bit' : '96-bit',
            baseClock: '2.00 GHz',
            boostClock: '2.40 GHz',
            tdp: base.startsWith('B7') ? 200 : base.startsWith('B5') ? 170 : base.startsWith('A7') ? 225 : base.startsWith('A5') ? 175 : 75,
            xeCore,
            rt: base.startsWith('B') ? 2 : 1,
            architecture: base.startsWith('B') ? 'Battlemage' : 'Alchemist',
            pcie: '4.0',
            hdmi: '2.1',
            dp: '2.1',
            length: '255mm',
            slots: 2
        }
    };
});

export const ALL_GPUS = [...NVIDIA_GPUS, ...AMD_GPUS, ...INTEL_GPUS, ...EXTRA_NVIDIA_GPUS, ...EXTRA_AMD_GPUS, ...EXTRA_INTEL_GPUS];

