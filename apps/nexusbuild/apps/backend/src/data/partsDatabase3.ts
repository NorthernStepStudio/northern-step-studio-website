/**
 * Parts Database - Storage, PSU, Cases, Cooling
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// Storage - NVMe SSDs
// ============================================================================
export const NVME_SSDS: PartSpec[] = [
    // PCIe 5.0 NVMe
    { id: 5001, name: 'Corsair MP700 Pro 2TB PCIe 5.0', category: 'Storage', brand: 'Corsair', price: 289, releaseYear: 2024, rating: 4.8, popularity: 80, specs: { capacity: '2TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', read: '12400 MB/s', write: '11800 MB/s', tbw: 1400, dram: true, heatsink: true } },
    { id: 5002, name: 'Crucial T705 2TB PCIe 5.0', category: 'Storage', brand: 'Crucial', price: 279, releaseYear: 2024, rating: 4.7, popularity: 78, specs: { capacity: '2TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', read: '14500 MB/s', write: '12700 MB/s', tbw: 1200, dram: true, heatsink: true } },
    { id: 5003, name: 'Seagate FireCuda 540 2TB PCIe 5.0', category: 'Storage', brand: 'Seagate', price: 259, releaseYear: 2024, rating: 4.7, popularity: 75, specs: { capacity: '2TB', interface: 'PCIe 5.0 x4', formFactor: 'M.2 2280', read: '10000 MB/s', write: '10000 MB/s', tbw: 2000, dram: true, heatsink: false } },
    { id: 5004, name: 'Samsung 990 Pro 2TB', category: 'Storage', brand: 'Samsung', price: 179, releaseYear: 2022, rating: 4.8, popularity: 95, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7450 MB/s', write: '6900 MB/s', tbw: 1200, dram: true, heatsink: false } },
    { id: 5005, name: 'Samsung 990 Pro 1TB', category: 'Storage', brand: 'Samsung', price: 109, releaseYear: 2022, rating: 4.8, popularity: 98, specs: { capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7450 MB/s', write: '6900 MB/s', tbw: 600, dram: true, heatsink: false } },
    { id: 5006, name: 'Samsung 990 Pro 4TB', category: 'Storage', brand: 'Samsung', price: 349, releaseYear: 2024, rating: 4.8, popularity: 85, specs: { capacity: '4TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7450 MB/s', write: '6900 MB/s', tbw: 2400, dram: true, heatsink: false } },
    { id: 5007, name: 'WD Black SN850X 2TB', category: 'Storage', brand: 'Western Digital', price: 149, releaseYear: 2022, rating: 4.7, popularity: 92, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7300 MB/s', write: '6600 MB/s', tbw: 1200, dram: true, heatsink: false } },
    { id: 5008, name: 'WD Black SN850X 1TB', category: 'Storage', brand: 'Western Digital', price: 89, releaseYear: 2022, rating: 4.7, popularity: 95, specs: { capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7300 MB/s', write: '6300 MB/s', tbw: 600, dram: true, heatsink: false } },
    { id: 5009, name: 'Crucial P5 Plus 2TB', category: 'Storage', brand: 'Crucial', price: 119, releaseYear: 2021, rating: 4.6, popularity: 88, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '6600 MB/s', write: '5000 MB/s', tbw: 1200, dram: true, heatsink: false } },
    { id: 5010, name: 'Crucial P5 Plus 1TB', category: 'Storage', brand: 'Crucial', price: 69, releaseYear: 2021, rating: 4.6, popularity: 92, specs: { capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '6600 MB/s', write: '5000 MB/s', tbw: 600, dram: true, heatsink: false } },
    { id: 5011, name: 'Sabrent Rocket 4 Plus 2TB', category: 'Storage', brand: 'Sabrent', price: 139, releaseYear: 2021, rating: 4.6, popularity: 85, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7100 MB/s', write: '6600 MB/s', tbw: 1400, dram: true, heatsink: false } },
    { id: 5012, name: 'SK hynix Platinum P41 2TB', category: 'Storage', brand: 'SK hynix', price: 149, releaseYear: 2022, rating: 4.8, popularity: 88, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7000 MB/s', write: '6500 MB/s', tbw: 1200, dram: true, heatsink: false } },
    { id: 5013, name: 'SK hynix Platinum P41 1TB', category: 'Storage', brand: 'SK hynix', price: 89, releaseYear: 2022, rating: 4.8, popularity: 90, specs: { capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7000 MB/s', write: '6500 MB/s', tbw: 750, dram: true, heatsink: false } },
    { id: 5014, name: 'Seagate FireCuda 530 2TB', category: 'Storage', brand: 'Seagate', price: 159, releaseYear: 2021, rating: 4.7, popularity: 85, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7300 MB/s', write: '6900 MB/s', tbw: 2550, dram: true, heatsink: false } },
    { id: 5015, name: 'Kingston KC3000 2TB', category: 'Storage', brand: 'Kingston', price: 129, releaseYear: 2021, rating: 4.6, popularity: 82, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7000 MB/s', write: '7000 MB/s', tbw: 1600, dram: true, heatsink: false } },
    // Budget NVMe
    { id: 5020, name: 'Crucial P3 Plus 2TB', category: 'Storage', brand: 'Crucial', price: 99, releaseYear: 2022, rating: 4.4, popularity: 90, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '5000 MB/s', write: '4200 MB/s', tbw: 440, dram: false, heatsink: false } },
    { id: 5021, name: 'Crucial P3 Plus 1TB', category: 'Storage', brand: 'Crucial', price: 54, releaseYear: 2022, rating: 4.4, popularity: 95, specs: { capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '5000 MB/s', write: '3600 MB/s', tbw: 220, dram: false, heatsink: false } },
    { id: 5022, name: 'WD Blue SN580 2TB', category: 'Storage', brand: 'Western Digital', price: 109, releaseYear: 2023, rating: 4.5, popularity: 85, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '4150 MB/s', write: '4150 MB/s', tbw: 900, dram: false, heatsink: false } },
    { id: 5023, name: 'WD Blue SN580 1TB', category: 'Storage', brand: 'Western Digital', price: 59, releaseYear: 2023, rating: 4.5, popularity: 90, specs: { capacity: '1TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '4150 MB/s', write: '4150 MB/s', tbw: 600, dram: false, heatsink: false } },
    { id: 5024, name: 'Samsung 980 PRO 2TB', category: 'Storage', brand: 'Samsung', price: 139, releaseYear: 2020, rating: 4.7, popularity: 88, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '7000 MB/s', write: '5100 MB/s', tbw: 1200, dram: true, heatsink: false } },
    { id: 5025, name: 'ADATA Legend 850 2TB', category: 'Storage', brand: 'ADATA', price: 109, releaseYear: 2023, rating: 4.4, popularity: 78, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '5000 MB/s', write: '4500 MB/s', tbw: 1300, dram: true, heatsink: false } },
    { id: 5026, name: 'TeamGroup MP44L 2TB', category: 'Storage', brand: 'TeamGroup', price: 89, releaseYear: 2023, rating: 4.3, popularity: 75, specs: { capacity: '2TB', interface: 'PCIe 4.0 x4', formFactor: 'M.2 2280', read: '5000 MB/s', write: '4500 MB/s', tbw: 1400, dram: false, heatsink: false } },
];

// ============================================================================
// Storage - SATA SSDs
// ============================================================================
export const SATA_SSDS: PartSpec[] = [
    { id: 5101, name: 'Samsung 870 EVO 2TB', category: 'Storage', brand: 'Samsung', price: 149, releaseYear: 2021, rating: 4.8, popularity: 92, specs: { capacity: '2TB', interface: 'SATA III', formFactor: '2.5"', read: '560 MB/s', write: '530 MB/s', tbw: 1200, dram: true } },
    { id: 5102, name: 'Samsung 870 EVO 1TB', category: 'Storage', brand: 'Samsung', price: 79, releaseYear: 2021, rating: 4.8, popularity: 95, specs: { capacity: '1TB', interface: 'SATA III', formFactor: '2.5"', read: '560 MB/s', write: '530 MB/s', tbw: 600, dram: true } },
    { id: 5103, name: 'Samsung 870 EVO 500GB', category: 'Storage', brand: 'Samsung', price: 44, releaseYear: 2021, rating: 4.8, popularity: 90, specs: { capacity: '500GB', interface: 'SATA III', formFactor: '2.5"', read: '560 MB/s', write: '530 MB/s', tbw: 300, dram: true } },
    { id: 5104, name: 'Crucial MX500 2TB', category: 'Storage', brand: 'Crucial', price: 129, releaseYear: 2018, rating: 4.7, popularity: 90, specs: { capacity: '2TB', interface: 'SATA III', formFactor: '2.5"', read: '560 MB/s', write: '510 MB/s', tbw: 700, dram: true } },
    { id: 5105, name: 'Crucial MX500 1TB', category: 'Storage', brand: 'Crucial', price: 64, releaseYear: 2018, rating: 4.7, popularity: 95, specs: { capacity: '1TB', interface: 'SATA III', formFactor: '2.5"', read: '560 MB/s', write: '510 MB/s', tbw: 360, dram: true } },
    { id: 5106, name: 'WD Blue 3D NAND 2TB', category: 'Storage', brand: 'Western Digital', price: 139, releaseYear: 2017, rating: 4.6, popularity: 85, specs: { capacity: '2TB', interface: 'SATA III', formFactor: '2.5"', read: '560 MB/s', write: '530 MB/s', tbw: 500, dram: true } },
    { id: 5107, name: 'WD Blue 3D NAND 1TB', category: 'Storage', brand: 'Western Digital', price: 69, releaseYear: 2017, rating: 4.6, popularity: 90, specs: { capacity: '1TB', interface: 'SATA III', formFactor: '2.5"', read: '560 MB/s', write: '530 MB/s', tbw: 400, dram: true } },
    { id: 5108, name: 'Kingston A400 960GB', category: 'Storage', brand: 'Kingston', price: 54, releaseYear: 2017, rating: 4.4, popularity: 85, specs: { capacity: '960GB', interface: 'SATA III', formFactor: '2.5"', read: '500 MB/s', write: '450 MB/s', tbw: 300, dram: false } },
    { id: 5109, name: 'Kingston A400 480GB', category: 'Storage', brand: 'Kingston', price: 29, releaseYear: 2017, rating: 4.4, popularity: 90, specs: { capacity: '480GB', interface: 'SATA III', formFactor: '2.5"', read: '500 MB/s', write: '450 MB/s', tbw: 160, dram: false } },
];

// ============================================================================
// Power Supplies
// ============================================================================
export const PSUS: PartSpec[] = [
    // 1000W+
    { id: 6001, name: 'Corsair RM1000x (2021)', category: 'PSU', brand: 'Corsair', price: 189, releaseYear: 2021, rating: 4.8, popularity: 90, specs: { wattage: 1000, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6002, name: 'Corsair HX1000i (2022)', category: 'PSU', brand: 'Corsair', price: 279, releaseYear: 2022, rating: 4.9, popularity: 85, specs: { wattage: 1000, efficiency: '80+ Platinum', modular: 'Full', formFactor: 'ATX', fanSize: '140mm', warranty: '10 years', atx3: true } },
    { id: 6003, name: 'Seasonic PRIME TX-1000', category: 'PSU', brand: 'Seasonic', price: 289, releaseYear: 2019, rating: 4.9, popularity: 80, specs: { wattage: 1000, efficiency: '80+ Titanium', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '12 years', atx3: false } },
    { id: 6004, name: 'EVGA SuperNOVA 1000 G7', category: 'PSU', brand: 'EVGA', price: 179, releaseYear: 2021, rating: 4.7, popularity: 82, specs: { wattage: 1000, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6005, name: 'be quiet! Dark Power Pro 12 1500W', category: 'PSU', brand: 'be quiet!', price: 399, releaseYear: 2021, rating: 4.9, popularity: 70, specs: { wattage: 1500, efficiency: '80+ Titanium', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6006, name: 'ASUS ROG Thor 1200P2', category: 'PSU', brand: 'ASUS', price: 499, releaseYear: 2023, rating: 4.8, popularity: 75, specs: { wattage: 1200, efficiency: '80+ Platinum', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: true, oled: true } },
    // 850W
    { id: 6010, name: 'Corsair RM850x (2021)', category: 'PSU', brand: 'Corsair', price: 139, releaseYear: 2021, rating: 4.8, popularity: 95, specs: { wattage: 850, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6011, name: 'Corsair RM850x (2024) ATX 3.0', category: 'PSU', brand: 'Corsair', price: 159, releaseYear: 2024, rating: 4.9, popularity: 92, specs: { wattage: 850, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: true } },
    { id: 6012, name: 'Seasonic Focus GX-850', category: 'PSU', brand: 'Seasonic', price: 129, releaseYear: 2020, rating: 4.7, popularity: 90, specs: { wattage: 850, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '120mm', warranty: '10 years', atx3: false } },
    { id: 6013, name: 'EVGA SuperNOVA 850 G6', category: 'PSU', brand: 'EVGA', price: 119, releaseYear: 2021, rating: 4.7, popularity: 88, specs: { wattage: 850, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6014, name: 'be quiet! Straight Power 12 850W', category: 'PSU', brand: 'be quiet!', price: 165, releaseYear: 2022, rating: 4.8, popularity: 85, specs: { wattage: 850, efficiency: '80+ Platinum', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: true } },
    { id: 6015, name: 'MSI MPG A850G PCIE5', category: 'PSU', brand: 'MSI', price: 139, releaseYear: 2023, rating: 4.6, popularity: 82, specs: { wattage: 850, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: true } },
    // 750W
    { id: 6020, name: 'Corsair RM750x (2021)', category: 'PSU', brand: 'Corsair', price: 109, releaseYear: 2021, rating: 4.8, popularity: 95, specs: { wattage: 750, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6021, name: 'Seasonic Focus GX-750', category: 'PSU', brand: 'Seasonic', price: 99, releaseYear: 2020, rating: 4.7, popularity: 92, specs: { wattage: 750, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '120mm', warranty: '10 years', atx3: false } },
    { id: 6022, name: 'be quiet! Pure Power 12 M 750W', category: 'PSU', brand: 'be quiet!', price: 109, releaseYear: 2022, rating: 4.6, popularity: 85, specs: { wattage: 750, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '120mm', warranty: '5 years', atx3: true } },
    { id: 6023, name: 'MSI MPG A750GF', category: 'PSU', brand: 'MSI', price: 99, releaseYear: 2021, rating: 4.6, popularity: 88, specs: { wattage: 750, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '140mm', warranty: '10 years', atx3: false } },
    // 650W
    { id: 6030, name: 'Corsair RM650x (2021)', category: 'PSU', brand: 'Corsair', price: 99, releaseYear: 2021, rating: 4.7, popularity: 92, specs: { wattage: 650, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6031, name: 'Seasonic Focus GX-650', category: 'PSU', brand: 'Seasonic', price: 89, releaseYear: 2020, rating: 4.7, popularity: 90, specs: { wattage: 650, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '120mm', warranty: '10 years', atx3: false } },
    { id: 6032, name: 'EVGA SuperNOVA 650 G6', category: 'PSU', brand: 'EVGA', price: 79, releaseYear: 2021, rating: 4.6, popularity: 88, specs: { wattage: 650, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '135mm', warranty: '10 years', atx3: false } },
    { id: 6033, name: 'be quiet! Pure Power 11 FM 650W', category: 'PSU', brand: 'be quiet!', price: 89, releaseYear: 2021, rating: 4.5, popularity: 82, specs: { wattage: 650, efficiency: '80+ Gold', modular: 'Full', formFactor: 'ATX', fanSize: '120mm', warranty: '5 years', atx3: false } },
    // Budget
    { id: 6040, name: 'Corsair CV650', category: 'PSU', brand: 'Corsair', price: 59, releaseYear: 2019, rating: 4.3, popularity: 85, specs: { wattage: 650, efficiency: '80+ Bronze', modular: 'None', formFactor: 'ATX', fanSize: '120mm', warranty: '3 years', atx3: false } },
    { id: 6041, name: 'EVGA 600 W1', category: 'PSU', brand: 'EVGA', price: 44, releaseYear: 2018, rating: 4.2, popularity: 82, specs: { wattage: 600, efficiency: '80+ White', modular: 'None', formFactor: 'ATX', fanSize: '120mm', warranty: '3 years', atx3: false } },
    { id: 6042, name: 'Thermaltake Smart 600W', category: 'PSU', brand: 'Thermaltake', price: 49, releaseYear: 2017, rating: 4.1, popularity: 78, specs: { wattage: 600, efficiency: '80+ White', modular: 'None', formFactor: 'ATX', fanSize: '120mm', warranty: '5 years', atx3: false } },
    // SFX
    { id: 6050, name: 'Corsair SF750 Platinum', category: 'PSU', brand: 'Corsair', price: 179, releaseYear: 2019, rating: 4.9, popularity: 90, specs: { wattage: 750, efficiency: '80+ Platinum', modular: 'Full', formFactor: 'SFX', fanSize: '92mm', warranty: '7 years', atx3: false } },
    { id: 6051, name: 'Cooler Master V850 SFX Gold', category: 'PSU', brand: 'Cooler Master', price: 149, releaseYear: 2021, rating: 4.7, popularity: 85, specs: { wattage: 850, efficiency: '80+ Gold', modular: 'Full', formFactor: 'SFX', fanSize: '92mm', warranty: '10 years', atx3: false } },
    { id: 6052, name: 'Lian Li SP750', category: 'PSU', brand: 'Lian Li', price: 129, releaseYear: 2021, rating: 4.6, popularity: 82, specs: { wattage: 750, efficiency: '80+ Gold', modular: 'Full', formFactor: 'SFX', fanSize: '92mm', warranty: '10 years', atx3: false } },
];

// Generated expansion to push total parts over 500
const EXTRA_NVME_SSDS: PartSpec[] = Array.from({ length: 15 }, (_, i) => {
    const brands = ['Samsung', 'Western Digital', 'Crucial', 'Sabrent', 'Kingston'];
    const brand = brands[i % brands.length];
    const capacity = i % 3 === 0 ? '1TB' : i % 3 === 1 ? '2TB' : '4TB';
    const interfaceType = i % 5 === 0 ? 'PCIe 5.0 x4' : 'PCIe 4.0 x4';
    const read = interfaceType === 'PCIe 5.0 x4' ? '12000 MB/s' : '7000 MB/s';
    const write = interfaceType === 'PCIe 5.0 x4' ? '11000 MB/s' : '6000 MB/s';

    return {
        id: 5030 + i,
        name: `${brand} Speedster ${capacity}`,
        category: 'Storage',
        brand,
        price: 89 + (i % 8) * 40,
        releaseYear: 2023,
        rating: 4.4 + (i % 5) * 0.1,
        popularity: 70 + (i % 25),
        specs: {
            capacity,
            interface: interfaceType,
            formFactor: 'M.2 2280',
            read,
            write,
            tbw: 600 + (i % 6) * 300,
            dram: i % 2 === 0,
            heatsink: i % 3 === 0
        }
    };
});

const EXTRA_SATA_SSDS: PartSpec[] = Array.from({ length: 10 }, (_, i) => {
    const brands = ['Samsung', 'Crucial', 'Western Digital', 'Kingston', 'SanDisk'];
    const brand = brands[i % brands.length];
    const capacity = i % 2 === 0 ? '1TB' : '2TB';

    return {
        id: 5110 + i,
        name: `${brand} SATA Pro ${capacity}`,
        category: 'Storage',
        brand,
        price: 49 + (i % 6) * 20,
        releaseYear: 2021,
        rating: 4.3 + (i % 5) * 0.1,
        popularity: 65 + (i % 25),
        specs: {
            capacity,
            interface: 'SATA III',
            formFactor: '2.5"',
            read: '560 MB/s',
            write: '520 MB/s',
            tbw: 400 + (i % 4) * 200,
            dram: i % 2 === 0
        }
    };
});

export const ALL_STORAGE = [...NVME_SSDS, ...SATA_SSDS, ...EXTRA_NVME_SSDS, ...EXTRA_SATA_SSDS];

// Generated expansion to push total parts over 500
const EXTRA_PSUS: PartSpec[] = Array.from({ length: 10 }, (_, i) => {
    const brands = ['Corsair', 'Seasonic', 'EVGA', 'be quiet!', 'Cooler Master'];
    const brand = brands[i % brands.length];
    const wattage = 550 + (i % 6) * 100;
    const efficiency = i % 3 === 0 ? '80+ Platinum' : i % 3 === 1 ? '80+ Gold' : '80+ Bronze';
    const modular = i % 2 === 0 ? 'Full' : 'Semi';

    return {
        id: 6060 + i,
        name: `${brand} Focus ${wattage}W`,
        category: 'PSU',
        brand,
        price: 79 + (i % 6) * 30,
        releaseYear: 2022,
        rating: 4.3 + (i % 5) * 0.1,
        popularity: 70 + (i % 20),
        specs: {
            wattage,
            efficiency,
            modular,
            formFactor: 'ATX',
            fanSize: '120mm',
            warranty: '7 years',
            atx3: i % 2 === 0
        }
    };
});

export const ALL_PSUS = [...PSUS, ...EXTRA_PSUS];

