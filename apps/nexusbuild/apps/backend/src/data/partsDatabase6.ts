/**
 * Parts Database - Case Fans, HDDs, Budget/Older GPUs
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// Case Fans
// ============================================================================
export const CASE_FANS: PartSpec[] = [
    // 120mm Premium
    { id: 10001, name: 'Noctua NF-A12x25 PWM', category: 'Fan', brand: 'Noctua', price: 32, releaseYear: 2018, rating: 4.9, popularity: 98, specs: { size: '120mm', rpm: '450-2000', cfm: 60.1, noise: '22.6 dBA', connector: '4-pin PWM', rgb: false, quantity: 1 } },
    { id: 10002, name: 'Noctua NF-A12x25 PWM chromax.black', category: 'Fan', brand: 'Noctua', price: 35, releaseYear: 2020, rating: 4.9, popularity: 95, specs: { size: '120mm', rpm: '450-2000', cfm: 60.1, noise: '22.6 dBA', connector: '4-pin PWM', rgb: false, quantity: 1, black: true } },
    { id: 10003, name: 'Noctua NF-F12 PWM', category: 'Fan', brand: 'Noctua', price: 22, releaseYear: 2011, rating: 4.8, popularity: 92, specs: { size: '120mm', rpm: '300-1500', cfm: 54.97, noise: '22.4 dBA', connector: '4-pin PWM', rgb: false, quantity: 1 } },
    { id: 10004, name: 'Noctua NF-P12 redux-1700 PWM', category: 'Fan', brand: 'Noctua', price: 15, releaseYear: 2014, rating: 4.7, popularity: 90, specs: { size: '120mm', rpm: '450-1700', cfm: 70.75, noise: '25.1 dBA', connector: '4-pin PWM', rgb: false, quantity: 1 } },
    { id: 10005, name: 'be quiet! Silent Wings 4 120mm PWM', category: 'Fan', brand: 'be quiet!', price: 25, releaseYear: 2022, rating: 4.8, popularity: 92, specs: { size: '120mm', rpm: '200-1600', cfm: 53.5, noise: '21.1 dBA', connector: '4-pin PWM', rgb: false, quantity: 1 } },
    { id: 10006, name: 'be quiet! Light Wings 120mm PWM ARGB', category: 'Fan', brand: 'be quiet!', price: 28, releaseYear: 2021, rating: 4.7, popularity: 88, specs: { size: '120mm', rpm: '100-1700', cfm: 52.3, noise: '20.6 dBA', connector: '4-pin PWM', rgb: true, quantity: 1 } },
    { id: 10007, name: 'Corsair iCUE ML120 RGB Elite', category: 'Fan', brand: 'Corsair', price: 30, releaseYear: 2021, rating: 4.6, popularity: 85, specs: { size: '120mm', rpm: '0-2000', cfm: 58, noise: '25-32 dBA', connector: '4-pin PWM', rgb: true, quantity: 1 } },
    { id: 10008, name: 'Corsair AF120 Elite (3-Pack)', category: 'Fan', brand: 'Corsair', price: 65, releaseYear: 2022, rating: 4.5, popularity: 88, specs: { size: '120mm', rpm: '550-1700', cfm: 65.4, noise: '30 dBA', connector: '4-pin PWM', rgb: false, quantity: 3 } },
    { id: 10009, name: 'Lian Li UNI FAN SL120 V2 (3-Pack)', category: 'Fan', brand: 'Lian Li', price: 89, releaseYear: 2022, rating: 4.8, popularity: 92, specs: { size: '120mm', rpm: '200-1900', cfm: 54.5, noise: '28 dBA', connector: '4-pin PWM', rgb: true, quantity: 3, daisy_chain: true } },
    { id: 10010, name: 'ARCTIC P12 PWM PST (5-Pack)', category: 'Fan', brand: 'ARCTIC', price: 30, releaseYear: 2019, rating: 4.7, popularity: 95, specs: { size: '120mm', rpm: '200-1800', cfm: 56.3, noise: '22.5 dBA', connector: '4-pin PWM', rgb: false, quantity: 5, daisy_chain: true } },
    { id: 10011, name: 'ARCTIC P12 PWM PST A-RGB (3-Pack)', category: 'Fan', brand: 'ARCTIC', price: 35, releaseYear: 2021, rating: 4.6, popularity: 90, specs: { size: '120mm', rpm: '200-1800', cfm: 48.8, noise: '22.5 dBA', connector: '4-pin PWM', rgb: true, quantity: 3, daisy_chain: true } },
    { id: 10012, name: 'Thermalright TL-C12C (3-Pack)', category: 'Fan', brand: 'Thermalright', price: 19, releaseYear: 2022, rating: 4.6, popularity: 88, specs: { size: '120mm', rpm: '600-1550', cfm: 66.17, noise: '25.6 dBA', connector: '4-pin PWM', rgb: false, quantity: 3 } },
    { id: 10013, name: 'Phanteks T30-120 PWM', category: 'Fan', brand: 'Phanteks', price: 30, releaseYear: 2021, rating: 4.9, popularity: 85, specs: { size: '120mm', rpm: '300-2000', cfm: 67, noise: '25.3 dBA', connector: '4-pin PWM', rgb: false, quantity: 1, thickness: '30mm' } },

    // 140mm
    { id: 10020, name: 'Noctua NF-A14 PWM', category: 'Fan', brand: 'Noctua', price: 28, releaseYear: 2012, rating: 4.9, popularity: 95, specs: { size: '140mm', rpm: '300-1500', cfm: 82.52, noise: '24.6 dBA', connector: '4-pin PWM', rgb: false, quantity: 1 } },
    { id: 10021, name: 'Noctua NF-A14 PWM chromax.black', category: 'Fan', brand: 'Noctua', price: 32, releaseYear: 2019, rating: 4.9, popularity: 92, specs: { size: '140mm', rpm: '300-1500', cfm: 82.52, noise: '24.6 dBA', connector: '4-pin PWM', rgb: false, quantity: 1, black: true } },
    { id: 10022, name: 'be quiet! Silent Wings 4 140mm PWM', category: 'Fan', brand: 'be quiet!', price: 28, releaseYear: 2022, rating: 4.8, popularity: 90, specs: { size: '140mm', rpm: '100-1100', cfm: 78.4, noise: '14.2 dBA', connector: '4-pin PWM', rgb: false, quantity: 1 } },
    { id: 10023, name: 'Corsair iCUE ML140 RGB Elite', category: 'Fan', brand: 'Corsair', price: 35, releaseYear: 2021, rating: 4.6, popularity: 85, specs: { size: '140mm', rpm: '0-1600', cfm: 63, noise: '25-32 dBA', connector: '4-pin PWM', rgb: true, quantity: 1 } },
    { id: 10024, name: 'ARCTIC P14 PWM PST (5-Pack)', category: 'Fan', brand: 'ARCTIC', price: 35, releaseYear: 2019, rating: 4.7, popularity: 92, specs: { size: '140mm', rpm: '200-1700', cfm: 72.8, noise: '22.5 dBA', connector: '4-pin PWM', rgb: false, quantity: 5, daisy_chain: true } },
    { id: 10025, name: 'Lian Li UNI FAN SL140 V2 (2-Pack)', category: 'Fan', brand: 'Lian Li', price: 69, releaseYear: 2022, rating: 4.8, popularity: 88, specs: { size: '140mm', rpm: '200-1500', cfm: 63.5, noise: '26 dBA', connector: '4-pin PWM', rgb: true, quantity: 2, daisy_chain: true } },
    { id: 10026, name: 'Fractal Design Aspect 14 RGB (3-Pack)', category: 'Fan', brand: 'Fractal Design', price: 49, releaseYear: 2021, rating: 4.5, popularity: 85, specs: { size: '140mm', rpm: '500-1000', cfm: 56.3, noise: '20.5 dBA', connector: '4-pin PWM', rgb: true, quantity: 3 } },
];

// ============================================================================
// HDDs
// ============================================================================
export const HDDS: PartSpec[] = [
    // Desktop HDDs
    { id: 10101, name: 'Seagate Barracuda 8TB', category: 'Storage', brand: 'Seagate', price: 129, releaseYear: 2020, rating: 4.5, popularity: 88, specs: { capacity: '8TB', interface: 'SATA III', formFactor: '3.5"', rpm: 5400, cache: '256MB', type: 'HDD' } },
    { id: 10102, name: 'Seagate Barracuda 4TB', category: 'Storage', brand: 'Seagate', price: 79, releaseYear: 2020, rating: 4.6, popularity: 92, specs: { capacity: '4TB', interface: 'SATA III', formFactor: '3.5"', rpm: 5400, cache: '256MB', type: 'HDD' } },
    { id: 10103, name: 'Seagate Barracuda 2TB', category: 'Storage', brand: 'Seagate', price: 54, releaseYear: 2020, rating: 4.6, popularity: 95, specs: { capacity: '2TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD' } },
    { id: 10104, name: 'WD Blue 4TB', category: 'Storage', brand: 'Western Digital', price: 72, releaseYear: 2019, rating: 4.5, popularity: 90, specs: { capacity: '4TB', interface: 'SATA III', formFactor: '3.5"', rpm: 5400, cache: '256MB', type: 'HDD' } },
    { id: 10105, name: 'WD Blue 2TB', category: 'Storage', brand: 'Western Digital', price: 49, releaseYear: 2019, rating: 4.6, popularity: 92, specs: { capacity: '2TB', interface: 'SATA III', formFactor: '3.5"', rpm: 5400, cache: '256MB', type: 'HDD' } },
    { id: 10106, name: 'WD Black 6TB', category: 'Storage', brand: 'Western Digital', price: 199, releaseYear: 2019, rating: 4.7, popularity: 78, specs: { capacity: '6TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD', performance: true } },
    { id: 10107, name: 'WD Black 4TB', category: 'Storage', brand: 'Western Digital', price: 149, releaseYear: 2019, rating: 4.7, popularity: 82, specs: { capacity: '4TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD', performance: true } },
    { id: 10108, name: 'Toshiba X300 8TB', category: 'Storage', brand: 'Toshiba', price: 149, releaseYear: 2020, rating: 4.5, popularity: 80, specs: { capacity: '8TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD', performance: true } },
    { id: 10109, name: 'Toshiba X300 6TB', category: 'Storage', brand: 'Toshiba', price: 119, releaseYear: 2020, rating: 4.5, popularity: 78, specs: { capacity: '6TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD', performance: true } },

    // NAS HDDs
    { id: 10120, name: 'Seagate IronWolf 8TB NAS', category: 'Storage', brand: 'Seagate', price: 169, releaseYear: 2020, rating: 4.6, popularity: 88, specs: { capacity: '8TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD', nas: true } },
    { id: 10121, name: 'Seagate IronWolf Pro 16TB NAS', category: 'Storage', brand: 'Seagate', price: 349, releaseYear: 2021, rating: 4.7, popularity: 82, specs: { capacity: '16TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD', nas: true } },
    { id: 10122, name: 'WD Red Plus 8TB NAS', category: 'Storage', brand: 'Western Digital', price: 179, releaseYear: 2020, rating: 4.6, popularity: 85, specs: { capacity: '8TB', interface: 'SATA III', formFactor: '3.5"', rpm: 5640, cache: '256MB', type: 'HDD', nas: true } },
    { id: 10123, name: 'WD Red Pro 12TB NAS', category: 'Storage', brand: 'Western Digital', price: 299, releaseYear: 2020, rating: 4.7, popularity: 80, specs: { capacity: '12TB', interface: 'SATA III', formFactor: '3.5"', rpm: 7200, cache: '256MB', type: 'HDD', nas: true } },
];

// ============================================================================
// Older/Budget GPUs
// ============================================================================
export const OLDER_GPUS: PartSpec[] = [
    // GTX 16 Series
    { id: 10201, name: 'NVIDIA GeForce GTX 1660 Super', category: 'GPU', brand: 'NVIDIA', price: 179, releaseYear: 2019, rating: 4.6, popularity: 82, specs: { vram: '6GB GDDR6', memoryBus: '192-bit', baseClock: '1.53 GHz', boostClock: '1.79 GHz', tdp: 125, cuda: 1408, rt: 0, architecture: 'Turing', pcie: '3.0' } },
    { id: 10202, name: 'NVIDIA GeForce GTX 1660 Ti', category: 'GPU', brand: 'NVIDIA', price: 199, releaseYear: 2019, rating: 4.6, popularity: 80, specs: { vram: '6GB GDDR6', memoryBus: '192-bit', baseClock: '1.50 GHz', boostClock: '1.77 GHz', tdp: 120, cuda: 1536, rt: 0, architecture: 'Turing', pcie: '3.0' } },
    { id: 10203, name: 'NVIDIA GeForce GTX 1660', category: 'GPU', brand: 'NVIDIA', price: 159, releaseYear: 2019, rating: 4.5, popularity: 78, specs: { vram: '6GB GDDR5', memoryBus: '192-bit', baseClock: '1.53 GHz', boostClock: '1.79 GHz', tdp: 120, cuda: 1408, rt: 0, architecture: 'Turing', pcie: '3.0' } },
    { id: 10204, name: 'NVIDIA GeForce GTX 1650 Super', category: 'GPU', brand: 'NVIDIA', price: 149, releaseYear: 2019, rating: 4.5, popularity: 85, specs: { vram: '4GB GDDR6', memoryBus: '128-bit', baseClock: '1.53 GHz', boostClock: '1.73 GHz', tdp: 100, cuda: 1280, rt: 0, architecture: 'Turing', pcie: '3.0' } },
    { id: 10205, name: 'NVIDIA GeForce GTX 1650', category: 'GPU', brand: 'NVIDIA', price: 129, releaseYear: 2019, rating: 4.3, popularity: 82, specs: { vram: '4GB GDDR6', memoryBus: '128-bit', baseClock: '1.49 GHz', boostClock: '1.67 GHz', tdp: 75, cuda: 896, rt: 0, architecture: 'Turing', pcie: '3.0', noPower: true } },
    { id: 10206, name: 'NVIDIA GeForce GTX 1630', category: 'GPU', brand: 'NVIDIA', price: 99, releaseYear: 2022, rating: 3.5, popularity: 60, specs: { vram: '4GB GDDR6', memoryBus: '64-bit', baseClock: '1.74 GHz', boostClock: '1.78 GHz', tdp: 75, cuda: 512, rt: 0, architecture: 'Turing', pcie: '3.0' } },

    // GTX 10 Series
    { id: 10210, name: 'NVIDIA GeForce GTX 1080 Ti', category: 'GPU', brand: 'NVIDIA', price: 299, releaseYear: 2017, rating: 4.7, popularity: 70, specs: { vram: '11GB GDDR5X', memoryBus: '352-bit', baseClock: '1.48 GHz', boostClock: '1.58 GHz', tdp: 250, cuda: 3584, rt: 0, architecture: 'Pascal', pcie: '3.0' } },
    { id: 10211, name: 'NVIDIA GeForce GTX 1080', category: 'GPU', brand: 'NVIDIA', price: 199, releaseYear: 2016, rating: 4.6, popularity: 65, specs: { vram: '8GB GDDR5X', memoryBus: '256-bit', baseClock: '1.61 GHz', boostClock: '1.73 GHz', tdp: 180, cuda: 2560, rt: 0, architecture: 'Pascal', pcie: '3.0' } },
    { id: 10212, name: 'NVIDIA GeForce GTX 1070 Ti', category: 'GPU', brand: 'NVIDIA', price: 149, releaseYear: 2017, rating: 4.6, popularity: 65, specs: { vram: '8GB GDDR5', memoryBus: '256-bit', baseClock: '1.61 GHz', boostClock: '1.68 GHz', tdp: 180, cuda: 2432, rt: 0, architecture: 'Pascal', pcie: '3.0' } },
    { id: 10213, name: 'NVIDIA GeForce GTX 1070', category: 'GPU', brand: 'NVIDIA', price: 129, releaseYear: 2016, rating: 4.5, popularity: 62, specs: { vram: '8GB GDDR5', memoryBus: '256-bit', baseClock: '1.51 GHz', boostClock: '1.68 GHz', tdp: 150, cuda: 1920, rt: 0, architecture: 'Pascal', pcie: '3.0' } },
    { id: 10214, name: 'NVIDIA GeForce GTX 1060 6GB', category: 'GPU', brand: 'NVIDIA', price: 99, releaseYear: 2016, rating: 4.5, popularity: 75, specs: { vram: '6GB GDDR5', memoryBus: '192-bit', baseClock: '1.51 GHz', boostClock: '1.71 GHz', tdp: 120, cuda: 1280, rt: 0, architecture: 'Pascal', pcie: '3.0' } },
    { id: 10215, name: 'NVIDIA GeForce GTX 1060 3GB', category: 'GPU', brand: 'NVIDIA', price: 79, releaseYear: 2016, rating: 4.3, popularity: 70, specs: { vram: '3GB GDDR5', memoryBus: '192-bit', baseClock: '1.51 GHz', boostClock: '1.71 GHz', tdp: 120, cuda: 1152, rt: 0, architecture: 'Pascal', pcie: '3.0' } },
    { id: 10216, name: 'NVIDIA GeForce GTX 1050 Ti', category: 'GPU', brand: 'NVIDIA', price: 79, releaseYear: 2016, rating: 4.4, popularity: 72, specs: { vram: '4GB GDDR5', memoryBus: '128-bit', baseClock: '1.29 GHz', boostClock: '1.39 GHz', tdp: 75, cuda: 768, rt: 0, architecture: 'Pascal', pcie: '3.0', noPower: true } },

    // AMD RX 5000 Series
    { id: 10220, name: 'AMD Radeon RX 5700 XT', category: 'GPU', brand: 'AMD', price: 249, releaseYear: 2019, rating: 4.5, popularity: 72, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.61 GHz', boostClock: '1.91 GHz', tdp: 225, shaders: 2560, rt: 0, architecture: 'RDNA 1', pcie: '4.0' } },
    { id: 10221, name: 'AMD Radeon RX 5700', category: 'GPU', brand: 'AMD', price: 199, releaseYear: 2019, rating: 4.4, popularity: 68, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.47 GHz', boostClock: '1.73 GHz', tdp: 180, shaders: 2304, rt: 0, architecture: 'RDNA 1', pcie: '4.0' } },
    { id: 10222, name: 'AMD Radeon RX 5600 XT', category: 'GPU', brand: 'AMD', price: 159, releaseYear: 2020, rating: 4.5, popularity: 75, specs: { vram: '6GB GDDR6', memoryBus: '192-bit', baseClock: '1.13 GHz', boostClock: '1.56 GHz', tdp: 150, shaders: 2304, rt: 0, architecture: 'RDNA 1', pcie: '4.0' } },
    { id: 10223, name: 'AMD Radeon RX 5500 XT 8GB', category: 'GPU', brand: 'AMD', price: 129, releaseYear: 2019, rating: 4.3, popularity: 70, specs: { vram: '8GB GDDR6', memoryBus: '128-bit', baseClock: '1.61 GHz', boostClock: '1.85 GHz', tdp: 130, shaders: 1408, rt: 0, architecture: 'RDNA 1', pcie: '4.0' } },
    { id: 10224, name: 'AMD Radeon RX 5500 XT 4GB', category: 'GPU', brand: 'AMD', price: 99, releaseYear: 2019, rating: 4.2, popularity: 68, specs: { vram: '4GB GDDR6', memoryBus: '128-bit', baseClock: '1.61 GHz', boostClock: '1.85 GHz', tdp: 130, shaders: 1408, rt: 0, architecture: 'RDNA 1', pcie: '4.0' } },

    // RTX 20 Series
    { id: 10230, name: 'NVIDIA GeForce RTX 2080 Ti', category: 'GPU', brand: 'NVIDIA', price: 499, releaseYear: 2018, rating: 4.7, popularity: 70, specs: { vram: '11GB GDDR6', memoryBus: '352-bit', baseClock: '1.35 GHz', boostClock: '1.55 GHz', tdp: 260, cuda: 4352, rt: 1, architecture: 'Turing', pcie: '3.0' } },
    { id: 10231, name: 'NVIDIA GeForce RTX 2080 Super', category: 'GPU', brand: 'NVIDIA', price: 399, releaseYear: 2019, rating: 4.6, popularity: 68, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.65 GHz', boostClock: '1.82 GHz', tdp: 250, cuda: 3072, rt: 1, architecture: 'Turing', pcie: '3.0' } },
    { id: 10232, name: 'NVIDIA GeForce RTX 2080', category: 'GPU', brand: 'NVIDIA', price: 349, releaseYear: 2018, rating: 4.6, popularity: 65, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.52 GHz', boostClock: '1.71 GHz', tdp: 225, cuda: 2944, rt: 1, architecture: 'Turing', pcie: '3.0' } },
    { id: 10233, name: 'NVIDIA GeForce RTX 2070 Super', category: 'GPU', brand: 'NVIDIA', price: 299, releaseYear: 2019, rating: 4.6, popularity: 75, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.61 GHz', boostClock: '1.77 GHz', tdp: 215, cuda: 2560, rt: 1, architecture: 'Turing', pcie: '3.0' } },
    { id: 10234, name: 'NVIDIA GeForce RTX 2070', category: 'GPU', brand: 'NVIDIA', price: 249, releaseYear: 2018, rating: 4.5, popularity: 72, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.41 GHz', boostClock: '1.62 GHz', tdp: 185, cuda: 2304, rt: 1, architecture: 'Turing', pcie: '3.0' } },
    { id: 10235, name: 'NVIDIA GeForce RTX 2060 Super', category: 'GPU', brand: 'NVIDIA', price: 229, releaseYear: 2019, rating: 4.6, popularity: 78, specs: { vram: '8GB GDDR6', memoryBus: '256-bit', baseClock: '1.47 GHz', boostClock: '1.65 GHz', tdp: 175, cuda: 2176, rt: 1, architecture: 'Turing', pcie: '3.0' } },
    { id: 10236, name: 'NVIDIA GeForce RTX 2060 12GB', category: 'GPU', brand: 'NVIDIA', price: 249, releaseYear: 2022, rating: 4.5, popularity: 75, specs: { vram: '12GB GDDR6', memoryBus: '192-bit', baseClock: '1.47 GHz', boostClock: '1.65 GHz', tdp: 185, cuda: 2176, rt: 1, architecture: 'Turing', pcie: '3.0' } },
    { id: 10237, name: 'NVIDIA GeForce RTX 2060 6GB', category: 'GPU', brand: 'NVIDIA', price: 199, releaseYear: 2019, rating: 4.5, popularity: 80, specs: { vram: '6GB GDDR6', memoryBus: '192-bit', baseClock: '1.37 GHz', boostClock: '1.68 GHz', tdp: 160, cuda: 1920, rt: 1, architecture: 'Turing', pcie: '3.0' } },
];

export const ALL_FANS = CASE_FANS;
export const ALL_HDDS = HDDS;
export const ALL_OLDER_GPUS = OLDER_GPUS;
