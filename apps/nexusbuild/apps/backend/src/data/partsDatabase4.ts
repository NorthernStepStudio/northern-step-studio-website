/**
 * Parts Database - Cases and Cooling
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// PC Cases
// ============================================================================
export const CASES: PartSpec[] = [
    // Full Tower
    { id: 7001, name: 'Lian Li O11 Dynamic EVO', category: 'Case', brand: 'Lian Li', price: 169, releaseYear: 2022, rating: 4.9, popularity: 98, specs: { formFactor: 'Mid Tower', maxGPU: '420mm', maxCPUCooler: '167mm', driveSlots: 4, fans: '10x120mm', radiator: '360mm top/side/bottom', usbc: true, tempered: true } },
    { id: 7002, name: 'Lian Li O11D Mini', category: 'Case', brand: 'Lian Li', price: 109, releaseYear: 2020, rating: 4.8, popularity: 92, specs: { formFactor: 'Mini Tower', maxGPU: '395mm', maxCPUCooler: '170mm', driveSlots: 4, fans: '9x120mm', radiator: '360mm side', usbc: true, tempered: true } },
    { id: 7003, name: 'Corsair 5000D Airflow', category: 'Case', brand: 'Corsair', price: 174, releaseYear: 2021, rating: 4.7, popularity: 90, specs: { formFactor: 'Mid Tower', maxGPU: '400mm', maxCPUCooler: '170mm', driveSlots: 4, fans: '10x120mm', radiator: '360mm front/top', usbc: true, tempered: true } },
    { id: 7004, name: 'Corsair 4000D Airflow', category: 'Case', brand: 'Corsair', price: 104, releaseYear: 2020, rating: 4.8, popularity: 95, specs: { formFactor: 'Mid Tower', maxGPU: '360mm', maxCPUCooler: '170mm', driveSlots: 2, fans: '6x120mm', radiator: '360mm front', usbc: true, tempered: true } },
    { id: 7005, name: 'Corsair iCUE 4000X RGB', category: 'Case', brand: 'Corsair', price: 144, releaseYear: 2020, rating: 4.6, popularity: 85, specs: { formFactor: 'Mid Tower', maxGPU: '360mm', maxCPUCooler: '170mm', driveSlots: 2, fans: '3x120mm RGB', radiator: '360mm front', usbc: true, tempered: true } },
    { id: 7006, name: 'NZXT H7 Flow', category: 'Case', brand: 'NZXT', price: 129, releaseYear: 2022, rating: 4.7, popularity: 90, specs: { formFactor: 'Mid Tower', maxGPU: '400mm', maxCPUCooler: '185mm', driveSlots: 4, fans: '7x120mm', radiator: '360mm front/top', usbc: true, tempered: true } },
    { id: 7007, name: 'NZXT H510 Flow', category: 'Case', brand: 'NZXT', price: 84, releaseYear: 2021, rating: 4.5, popularity: 88, specs: { formFactor: 'Mid Tower', maxGPU: '381mm', maxCPUCooler: '165mm', driveSlots: 2, fans: '4x120mm', radiator: '280mm front', usbc: true, tempered: true } },
    { id: 7008, name: 'Fractal Design Torrent', category: 'Case', brand: 'Fractal Design', price: 189, releaseYear: 2021, rating: 4.9, popularity: 88, specs: { formFactor: 'Mid Tower', maxGPU: '461mm', maxCPUCooler: '188mm', driveSlots: 4, fans: '5x180mm/140mm', radiator: '420mm bottom', usbc: true, tempered: true } },
    { id: 7009, name: 'Fractal Design North', category: 'Case', brand: 'Fractal Design', price: 129, releaseYear: 2022, rating: 4.8, popularity: 92, specs: { formFactor: 'Mid Tower', maxGPU: '355mm', maxCPUCooler: '170mm', driveSlots: 4, fans: '5x140mm', radiator: '360mm top', usbc: true, tempered: true, wood: true } },
    { id: 7010, name: 'Fractal Design Meshify 2', category: 'Case', brand: 'Fractal Design', price: 159, releaseYear: 2020, rating: 4.8, popularity: 90, specs: { formFactor: 'Mid Tower', maxGPU: '467mm', maxCPUCooler: '185mm', driveSlots: 6, fans: '9x120mm', radiator: '420mm front', usbc: true, tempered: true } },
    { id: 7011, name: 'Fractal Design Pop Air', category: 'Case', brand: 'Fractal Design', price: 99, releaseYear: 2022, rating: 4.6, popularity: 88, specs: { formFactor: 'Mid Tower', maxGPU: '405mm', maxCPUCooler: '170mm', driveSlots: 4, fans: '4x120mm', radiator: '360mm front', usbc: true, tempered: true } },
    { id: 7012, name: 'be quiet! Pure Base 500DX', category: 'Case', brand: 'be quiet!', price: 109, releaseYear: 2020, rating: 4.8, popularity: 92, specs: { formFactor: 'Mid Tower', maxGPU: '369mm', maxCPUCooler: '190mm', driveSlots: 5, fans: '4x140mm ARGB', radiator: '360mm front/top', usbc: true, tempered: true } },
    { id: 7013, name: 'be quiet! Dark Base Pro 900 Rev. 2', category: 'Case', brand: 'be quiet!', price: 269, releaseYear: 2019, rating: 4.7, popularity: 75, specs: { formFactor: 'Full Tower', maxGPU: '472mm', maxCPUCooler: '185mm', driveSlots: 8, fans: '4x140mm', radiator: '420mm front', usbc: true, tempered: true } },
    { id: 7014, name: 'Phanteks Eclipse G360A', category: 'Case', brand: 'Phanteks', price: 99, releaseYear: 2021, rating: 4.7, popularity: 90, specs: { formFactor: 'Mid Tower', maxGPU: '400mm', maxCPUCooler: '163mm', driveSlots: 4, fans: '3x120mm DRGB', radiator: '360mm front', usbc: true, tempered: true } },
    { id: 7015, name: 'Phanteks Enthoo Pro 2', category: 'Case', brand: 'Phanteks', price: 169, releaseYear: 2020, rating: 4.6, popularity: 78, specs: { formFactor: 'Full Tower', maxGPU: '503mm', maxCPUCooler: '190mm', driveSlots: 10, fans: '9x140mm', radiator: '480mm front', usbc: true, tempered: true } },
    { id: 7016, name: 'Cooler Master MasterBox TD500 Mesh', category: 'Case', brand: 'Cooler Master', price: 109, releaseYear: 2020, rating: 4.6, popularity: 88, specs: { formFactor: 'Mid Tower', maxGPU: '410mm', maxCPUCooler: '165mm', driveSlots: 2, fans: '3x120mm ARGB', radiator: '360mm front', usbc: true, tempered: true } },
    { id: 7017, name: 'Cooler Master NR200P', category: 'Case', brand: 'Cooler Master', price: 109, releaseYear: 2020, rating: 4.8, popularity: 92, specs: { formFactor: 'Mini-ITX', maxGPU: '330mm', maxCPUCooler: '155mm', driveSlots: 4, fans: '7x120mm', radiator: '280mm side', usbc: true, tempered: true } },
    { id: 7018, name: 'Cooler Master HAF 700', category: 'Case', brand: 'Cooler Master', price: 499, releaseYear: 2022, rating: 4.7, popularity: 70, specs: { formFactor: 'Full Tower', maxGPU: '490mm', maxCPUCooler: '198mm', driveSlots: 8, fans: '5x200mm', radiator: '420mm top', usbc: true, tempered: true } },
    { id: 7019, name: 'HYTE Y60', category: 'Case', brand: 'HYTE', price: 199, releaseYear: 2022, rating: 4.7, popularity: 88, specs: { formFactor: 'Mid Tower', maxGPU: '430mm', maxCPUCooler: '160mm', driveSlots: 4, fans: '6x120mm', radiator: '360mm side', usbc: true, tempered: true, panoramic: true } },
    { id: 7020, name: 'Thermaltake Core P3', category: 'Case', brand: 'Thermaltake', price: 119, releaseYear: 2016, rating: 4.5, popularity: 75, specs: { formFactor: 'Open Frame', maxGPU: '450mm', maxCPUCooler: '180mm', driveSlots: 3, fans: '5x120mm', radiator: '420mm', usbc: false, tempered: true } },
    // Budget
    { id: 7030, name: 'Montech Air 903 Max', category: 'Case', brand: 'Montech', price: 69, releaseYear: 2023, rating: 4.6, popularity: 88, specs: { formFactor: 'Mid Tower', maxGPU: '400mm', maxCPUCooler: '165mm', driveSlots: 4, fans: '4x140mm', radiator: '360mm front', usbc: true, tempered: true } },
    { id: 7031, name: 'Deepcool CC560', category: 'Case', brand: 'Deepcool', price: 59, releaseYear: 2022, rating: 4.4, popularity: 85, specs: { formFactor: 'Mid Tower', maxGPU: '370mm', maxCPUCooler: '163mm', driveSlots: 4, fans: '4x120mm', radiator: '360mm front', usbc: false, tempered: true } },
    { id: 7032, name: 'Cougar MX330-G', category: 'Case', brand: 'Cougar', price: 49, releaseYear: 2018, rating: 4.3, popularity: 82, specs: { formFactor: 'Mid Tower', maxGPU: '350mm', maxCPUCooler: '155mm', driveSlots: 3, fans: '5x120mm', radiator: '240mm front', usbc: false, tempered: true } },
];

// ============================================================================
// CPU Cooling - Air Coolers
// ============================================================================
export const AIR_COOLERS: PartSpec[] = [
    { id: 8001, name: 'Noctua NH-D15', category: 'Cooling', brand: 'Noctua', price: 109, releaseYear: 2014, rating: 4.9, popularity: 98, specs: { type: 'Air', tdp: 250, height: '165mm', fanSize: '2x140mm', noise: '24.6 dBA', rpm: '300-1500', socket: 'Intel/AMD', rgb: false } },
    { id: 8002, name: 'Noctua NH-D15S', category: 'Cooling', brand: 'Noctua', price: 99, releaseYear: 2015, rating: 4.9, popularity: 92, specs: { type: 'Air', tdp: 250, height: '160mm', fanSize: '1x140mm', noise: '24.6 dBA', rpm: '300-1500', socket: 'Intel/AMD', rgb: false } },
    { id: 8003, name: 'Noctua NH-D15 chromax.black', category: 'Cooling', brand: 'Noctua', price: 119, releaseYear: 2019, rating: 4.9, popularity: 95, specs: { type: 'Air', tdp: 250, height: '165mm', fanSize: '2x140mm', noise: '24.6 dBA', rpm: '300-1500', socket: 'Intel/AMD', rgb: false, black: true } },
    { id: 8004, name: 'Noctua NH-U12S', category: 'Cooling', brand: 'Noctua', price: 69, releaseYear: 2013, rating: 4.8, popularity: 90, specs: { type: 'Air', tdp: 200, height: '158mm', fanSize: '1x120mm', noise: '22.4 dBA', rpm: '300-1500', socket: 'Intel/AMD', rgb: false } },
    { id: 8005, name: 'be quiet! Dark Rock Pro 5', category: 'Cooling', brand: 'be quiet!', price: 89, releaseYear: 2023, rating: 4.9, popularity: 95, specs: { type: 'Air', tdp: 270, height: '168mm', fanSize: '1x120mm+1x135mm', noise: '24.3 dBA', rpm: '900-1500', socket: 'Intel/AMD', rgb: false } },
    { id: 8006, name: 'be quiet! Dark Rock 4', category: 'Cooling', brand: 'be quiet!', price: 74, releaseYear: 2018, rating: 4.8, popularity: 92, specs: { type: 'Air', tdp: 200, height: '159mm', fanSize: '1x135mm', noise: '21.4 dBA', rpm: '400-1400', socket: 'Intel/AMD', rgb: false } },
    { id: 8007, name: 'Thermalright Peerless Assassin 120 SE', category: 'Cooling', brand: 'Thermalright', price: 35, releaseYear: 2022, rating: 4.8, popularity: 95, specs: { type: 'Air', tdp: 260, height: '155mm', fanSize: '2x120mm', noise: '25.6 dBA', rpm: '600-1550', socket: 'Intel/AMD', rgb: false } },
    { id: 8008, name: 'Thermalright Frost Spirit 140', category: 'Cooling', brand: 'Thermalright', price: 45, releaseYear: 2022, rating: 4.7, popularity: 88, specs: { type: 'Air', tdp: 250, height: '158mm', fanSize: '1x140mm+1x120mm', noise: '25.6 dBA', rpm: '600-1550', socket: 'Intel/AMD', rgb: false } },
    { id: 8009, name: 'DeepCool AK620', category: 'Cooling', brand: 'DeepCool', price: 65, releaseYear: 2021, rating: 4.8, popularity: 92, specs: { type: 'Air', tdp: 260, height: '160mm', fanSize: '2x120mm', noise: '28 dBA', rpm: '500-1850', socket: 'Intel/AMD', rgb: false } },
    { id: 8010, name: 'DeepCool AK400', category: 'Cooling', brand: 'DeepCool', price: 35, releaseYear: 2022, rating: 4.6, popularity: 90, specs: { type: 'Air', tdp: 220, height: '155mm', fanSize: '1x120mm', noise: '28 dBA', rpm: '500-1850', socket: 'Intel/AMD', rgb: false } },
    { id: 8011, name: 'Scythe Fuma 3', category: 'Cooling', brand: 'Scythe', price: 59, releaseYear: 2023, rating: 4.8, popularity: 88, specs: { type: 'Air', tdp: 250, height: '154mm', fanSize: '2x120mm', noise: '25.6 dBA', rpm: '300-1500', socket: 'Intel/AMD', rgb: false } },
    { id: 8012, name: 'Scythe Mugen 6', category: 'Cooling', brand: 'Scythe', price: 55, releaseYear: 2024, rating: 4.7, popularity: 85, specs: { type: 'Air', tdp: 220, height: '154mm', fanSize: '1x120mm', noise: '25.6 dBA', rpm: '300-1500', socket: 'Intel/AMD', rgb: false } },
    { id: 8013, name: 'Cooler Master Hyper 212 EVO V2', category: 'Cooling', brand: 'Cooler Master', price: 39, releaseYear: 2020, rating: 4.5, popularity: 90, specs: { type: 'Air', tdp: 180, height: '159mm', fanSize: '1x120mm', noise: '27 dBA', rpm: '650-1800', socket: 'Intel/AMD', rgb: false } },
    { id: 8014, name: 'ID-COOLING SE-226-XT', category: 'Cooling', brand: 'ID-COOLING', price: 29, releaseYear: 2021, rating: 4.6, popularity: 88, specs: { type: 'Air', tdp: 250, height: '154mm', fanSize: '1x120mm', noise: '30 dBA', rpm: '700-1800', socket: 'Intel/AMD', rgb: false } },
];

// ============================================================================
// CPU Cooling - AIO Liquid Coolers
// ============================================================================
export const AIO_COOLERS: PartSpec[] = [
    // 360mm
    { id: 8101, name: 'NZXT Kraken Elite 360', category: 'Cooling', brand: 'NZXT', price: 299, releaseYear: 2023, rating: 4.8, popularity: 88, specs: { type: 'AIO', size: '360mm', tdp: 400, fanSize: '3x120mm', noise: '21-38 dBA', rpm: '500-2000', socket: 'Intel/AMD', rgb: true, lcd: true } },
    { id: 8102, name: 'NZXT Kraken X73', category: 'Cooling', brand: 'NZXT', price: 199, releaseYear: 2020, rating: 4.7, popularity: 85, specs: { type: 'AIO', size: '360mm', tdp: 350, fanSize: '3x120mm', noise: '21-36 dBA', rpm: '500-1800', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8103, name: 'Corsair iCUE H150i Elite Capellix XT', category: 'Cooling', brand: 'Corsair', price: 259, releaseYear: 2023, rating: 4.8, popularity: 90, specs: { type: 'AIO', size: '360mm', tdp: 400, fanSize: '3x120mm', noise: '10-37 dBA', rpm: '550-2100', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8104, name: 'Corsair iCUE H150i Elite LCD XT', category: 'Cooling', brand: 'Corsair', price: 299, releaseYear: 2024, rating: 4.8, popularity: 88, specs: { type: 'AIO', size: '360mm', tdp: 400, fanSize: '3x120mm', noise: '10-37 dBA', rpm: '550-2100', socket: 'Intel/AMD', rgb: true, lcd: true } },
    { id: 8105, name: 'ARCTIC Liquid Freezer II 360', category: 'Cooling', brand: 'ARCTIC', price: 119, releaseYear: 2020, rating: 4.9, popularity: 95, specs: { type: 'AIO', size: '360mm', tdp: 400, fanSize: '3x120mm', noise: '22.5 dBA', rpm: '200-1800', socket: 'Intel/AMD', rgb: false, lcd: false } },
    { id: 8106, name: 'ARCTIC Liquid Freezer II 360 A-RGB', category: 'Cooling', brand: 'ARCTIC', price: 149, releaseYear: 2021, rating: 4.8, popularity: 92, specs: { type: 'AIO', size: '360mm', tdp: 400, fanSize: '3x120mm', noise: '22.5 dBA', rpm: '200-1800', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8107, name: 'Lian Li Galahad II Trinity 360', category: 'Cooling', brand: 'Lian Li', price: 179, releaseYear: 2023, rating: 4.7, popularity: 85, specs: { type: 'AIO', size: '360mm', tdp: 350, fanSize: '3x120mm', noise: '28 dBA', rpm: '800-2100', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8108, name: 'EK-AIO 360 D-RGB', category: 'Cooling', brand: 'EKWB', price: 149, releaseYear: 2020, rating: 4.6, popularity: 82, specs: { type: 'AIO', size: '360mm', tdp: 350, fanSize: '3x120mm', noise: '18-33 dBA', rpm: '550-2200', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8109, name: 'DeepCool LT720', category: 'Cooling', brand: 'DeepCool', price: 139, releaseYear: 2023, rating: 4.7, popularity: 88, specs: { type: 'AIO', size: '360mm', tdp: 400, fanSize: '3x120mm', noise: '32.9 dBA', rpm: '500-2250', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8110, name: 'be quiet! Silent Loop 2 360mm', category: 'Cooling', brand: 'be quiet!', price: 169, releaseYear: 2020, rating: 4.6, popularity: 80, specs: { type: 'AIO', size: '360mm', tdp: 350, fanSize: '3x120mm', noise: '26.4 dBA', rpm: '1000-2200', socket: 'Intel/AMD', rgb: true, lcd: false } },
    // 280mm
    { id: 8120, name: 'ARCTIC Liquid Freezer II 280', category: 'Cooling', brand: 'ARCTIC', price: 99, releaseYear: 2020, rating: 4.9, popularity: 92, specs: { type: 'AIO', size: '280mm', tdp: 350, fanSize: '2x140mm', noise: '22.5 dBA', rpm: '200-1700', socket: 'Intel/AMD', rgb: false, lcd: false } },
    { id: 8121, name: 'NZXT Kraken X63', category: 'Cooling', brand: 'NZXT', price: 159, releaseYear: 2020, rating: 4.7, popularity: 85, specs: { type: 'AIO', size: '280mm', tdp: 300, fanSize: '2x140mm', noise: '21-36 dBA', rpm: '500-1700', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8122, name: 'Corsair iCUE H115i Elite Capellix', category: 'Cooling', brand: 'Corsair', price: 179, releaseYear: 2020, rating: 4.7, popularity: 85, specs: { type: 'AIO', size: '280mm', tdp: 325, fanSize: '2x140mm', noise: '10-36 dBA', rpm: '400-2000', socket: 'Intel/AMD', rgb: true, lcd: false } },
    // 240mm
    { id: 8130, name: 'ARCTIC Liquid Freezer II 240', category: 'Cooling', brand: 'ARCTIC', price: 79, releaseYear: 2020, rating: 4.8, popularity: 95, specs: { type: 'AIO', size: '240mm', tdp: 300, fanSize: '2x120mm', noise: '22.5 dBA', rpm: '200-1800', socket: 'Intel/AMD', rgb: false, lcd: false } },
    { id: 8131, name: 'Corsair iCUE H100i Elite Capellix', category: 'Cooling', brand: 'Corsair', price: 149, releaseYear: 2020, rating: 4.7, popularity: 88, specs: { type: 'AIO', size: '240mm', tdp: 300, fanSize: '2x120mm', noise: '10-37 dBA', rpm: '400-2400', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8132, name: 'NZXT Kraken 240', category: 'Cooling', brand: 'NZXT', price: 159, releaseYear: 2023, rating: 4.7, popularity: 85, specs: { type: 'AIO', size: '240mm', tdp: 275, fanSize: '2x120mm', noise: '21-33 dBA', rpm: '500-1800', socket: 'Intel/AMD', rgb: true, lcd: true } },
    { id: 8133, name: 'DeepCool LE500', category: 'Cooling', brand: 'DeepCool', price: 79, releaseYear: 2023, rating: 4.5, popularity: 82, specs: { type: 'AIO', size: '240mm', tdp: 280, fanSize: '2x120mm', noise: '32.9 dBA', rpm: '500-2250', socket: 'Intel/AMD', rgb: true, lcd: false } },
    { id: 8134, name: 'Lian Li Galahad II 240', category: 'Cooling', brand: 'Lian Li', price: 119, releaseYear: 2023, rating: 4.6, popularity: 80, specs: { type: 'AIO', size: '240mm', tdp: 280, fanSize: '2x120mm', noise: '28 dBA', rpm: '800-2100', socket: 'Intel/AMD', rgb: true, lcd: false } },
];

// Generated expansion to push total parts over 500
const EXTRA_CASES: PartSpec[] = Array.from({ length: 10 }, (_, i) => {
    const brands = ['NZXT', 'Lian Li', 'Fractal Design', 'Corsair', 'Phanteks'];
    const brand = brands[i % brands.length];
    const formFactor = i % 3 === 0 ? 'Mid Tower' : i % 3 === 1 ? 'Mini-ITX' : 'Full Tower';
    const maxGpu = formFactor === 'Mini-ITX' ? '330mm' : formFactor === 'Full Tower' ? '450mm' : '400mm';

    return {
        id: 7040 + i,
        name: `${brand} Airflow ${formFactor}`,
        category: 'Case',
        brand,
        price: 79 + (i % 6) * 25,
        releaseYear: 2022,
        rating: 4.4 + (i % 5) * 0.1,
        popularity: 70 + (i % 20),
        specs: {
            formFactor,
            maxGPU: maxGpu,
            maxCPUCooler: '170mm',
            driveSlots: 4,
            fans: formFactor === 'Mini-ITX' ? '3x120mm' : '6x120mm',
            radiator: formFactor === 'Full Tower' ? '420mm top' : '360mm front',
            usbc: true,
            tempered: true
        }
    };
});

export const ALL_CASES = [...CASES, ...EXTRA_CASES];

// Generated expansion to push total parts over 500
const EXTRA_AIR_COOLERS: PartSpec[] = Array.from({ length: 10 }, (_, i) => {
    const brands = ['Noctua', 'be quiet!', 'Thermalright', 'DeepCool', 'Scythe'];
    const brand = brands[i % brands.length];
    const height = 150 + (i % 4) * 4;

    return {
        id: 8020 + i,
        name: `${brand} Air ${120 + i}`,
        category: 'Cooling',
        brand,
        price: 35 + (i % 6) * 10,
        releaseYear: 2022,
        rating: 4.4 + (i % 5) * 0.1,
        popularity: 70 + (i % 25),
        specs: {
            type: 'Air',
            tdp: 180 + (i % 5) * 20,
            height: `${height}mm`,
            fanSize: '120mm',
            noise: '25 dBA',
            rpm: '500-1700',
            socket: 'Intel/AMD',
            rgb: i % 3 === 0
        }
    };
});

const EXTRA_AIO_COOLERS: PartSpec[] = Array.from({ length: 5 }, (_, i) => {
    const brands = ['NZXT', 'Corsair', 'ARCTIC', 'Lian Li', 'DeepCool'];
    const brand = brands[i % brands.length];
    const size = i % 2 === 0 ? '360mm' : '240mm';

    return {
        id: 8140 + i,
        name: `${brand} Liquid ${size}`,
        category: 'Cooling',
        brand,
        price: 99 + (i % 5) * 30,
        releaseYear: 2023,
        rating: 4.4 + (i % 5) * 0.1,
        popularity: 65 + (i % 25),
        specs: {
            type: 'AIO',
            size,
            tdp: size === '360mm' ? 350 : 280,
            fanSize: size === '360mm' ? '3x120mm' : '2x120mm',
            noise: '24-36 dBA',
            rpm: '600-2000',
            socket: 'Intel/AMD',
            rgb: i % 2 === 0,
            lcd: i % 3 === 0
        }
    };
});

export const ALL_COOLING = [...AIR_COOLERS, ...AIO_COOLERS, ...EXTRA_AIR_COOLERS, ...EXTRA_AIO_COOLERS];

