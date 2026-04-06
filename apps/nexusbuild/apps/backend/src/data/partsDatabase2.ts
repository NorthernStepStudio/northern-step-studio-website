/**
 * Parts Database - Additional Components
 * RAM, Motherboards, Storage, PSUs, Cases, Cooling
 */

import { PartSpec } from './partsDatabase';

// ============================================================================
// RAM - DDR5
// ============================================================================
export const DDR5_RAM: PartSpec[] = [
    { id: 3001, name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000', category: 'RAM', brand: 'G.Skill', price: 139, releaseYear: 2023, rating: 4.8, popularity: 95, specs: { capacity: '32GB', modules: '2x16GB', speed: 6000, type: 'DDR5', timing: 'CL30-40-40-96', voltage: 1.35, rgb: true, height: '44mm' } },
    { id: 3002, name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6000', category: 'RAM', brand: 'G.Skill', price: 249, releaseYear: 2023, rating: 4.8, popularity: 85, specs: { capacity: '64GB', modules: '2x32GB', speed: 6000, type: 'DDR5', timing: 'CL30-40-40-96', voltage: 1.35, rgb: true, height: '44mm' } },
    { id: 3003, name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-7200', category: 'RAM', brand: 'G.Skill', price: 199, releaseYear: 2024, rating: 4.9, popularity: 90, specs: { capacity: '32GB', modules: '2x16GB', speed: 7200, type: 'DDR5', timing: 'CL34-45-45-115', voltage: 1.40, rgb: true, height: '44mm' } },
    { id: 3004, name: 'Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5-6000', category: 'RAM', brand: 'Corsair', price: 159, releaseYear: 2023, rating: 4.7, popularity: 88, specs: { capacity: '32GB', modules: '2x16GB', speed: 6000, type: 'DDR5', timing: 'CL30-36-36-76', voltage: 1.35, rgb: true, height: '56mm' } },
    { id: 3005, name: 'Corsair Dominator Platinum RGB 64GB (2x32GB) DDR5-6400', category: 'RAM', brand: 'Corsair', price: 299, releaseYear: 2024, rating: 4.8, popularity: 82, specs: { capacity: '64GB', modules: '2x32GB', speed: 6400, type: 'DDR5', timing: 'CL32-39-39-76', voltage: 1.40, rgb: true, height: '56mm' } },
    { id: 3006, name: 'Corsair Vengeance 32GB (2x16GB) DDR5-5600', category: 'RAM', brand: 'Corsair', price: 99, releaseYear: 2023, rating: 4.6, popularity: 92, specs: { capacity: '32GB', modules: '2x16GB', speed: 5600, type: 'DDR5', timing: 'CL36-36-36-76', voltage: 1.25, rgb: false, height: '34mm' } },
    { id: 3007, name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5-6000', category: 'RAM', brand: 'Corsair', price: 129, releaseYear: 2023, rating: 4.7, popularity: 90, specs: { capacity: '32GB', modules: '2x16GB', speed: 6000, type: 'DDR5', timing: 'CL30-36-36-76', voltage: 1.35, rgb: true, height: '44mm' } },
    { id: 3008, name: 'Kingston Fury Beast 32GB (2x16GB) DDR5-5600', category: 'RAM', brand: 'Kingston', price: 89, releaseYear: 2023, rating: 4.5, popularity: 88, specs: { capacity: '32GB', modules: '2x16GB', speed: 5600, type: 'DDR5', timing: 'CL40-40-40-80', voltage: 1.25, rgb: false, height: '34mm' } },
    { id: 3009, name: 'Kingston Fury Beast RGB 32GB (2x16GB) DDR5-6000', category: 'RAM', brand: 'Kingston', price: 119, releaseYear: 2023, rating: 4.6, popularity: 85, specs: { capacity: '32GB', modules: '2x16GB', speed: 6000, type: 'DDR5', timing: 'CL30-38-38-80', voltage: 1.35, rgb: true, height: '44mm' } },
    { id: 3010, name: 'Crucial DDR5-4800 32GB (2x16GB)', category: 'RAM', brand: 'Crucial', price: 79, releaseYear: 2022, rating: 4.4, popularity: 80, specs: { capacity: '32GB', modules: '2x16GB', speed: 4800, type: 'DDR5', timing: 'CL40-39-39-77', voltage: 1.10, rgb: false, height: '31mm' } },
    { id: 3011, name: 'TeamGroup T-Force Delta RGB 32GB DDR5-6000', category: 'RAM', brand: 'TeamGroup', price: 109, releaseYear: 2023, rating: 4.5, popularity: 82, specs: { capacity: '32GB', modules: '2x16GB', speed: 6000, type: 'DDR5', timing: 'CL30-38-38-78', voltage: 1.35, rgb: true, height: '49mm' } },
    { id: 3012, name: 'ADATA XPG Lancer RGB 32GB DDR5-6000', category: 'RAM', brand: 'ADATA', price: 99, releaseYear: 2023, rating: 4.5, popularity: 78, specs: { capacity: '32GB', modules: '2x16GB', speed: 6000, type: 'DDR5', timing: 'CL30-40-40-76', voltage: 1.35, rgb: true, height: '44mm' } },
];

// ============================================================================
// RAM - DDR4
// ============================================================================
export const DDR4_RAM: PartSpec[] = [
    { id: 3101, name: 'G.Skill Trident Z RGB 32GB (2x16GB) DDR4-3600', category: 'RAM', brand: 'G.Skill', price: 79, releaseYear: 2021, rating: 4.8, popularity: 92, specs: { capacity: '32GB', modules: '2x16GB', speed: 3600, type: 'DDR4', timing: 'CL16-19-19-39', voltage: 1.35, rgb: true, height: '44mm' } },
    { id: 3102, name: 'G.Skill Ripjaws V 32GB (2x16GB) DDR4-3200', category: 'RAM', brand: 'G.Skill', price: 59, releaseYear: 2020, rating: 4.7, popularity: 95, specs: { capacity: '32GB', modules: '2x16GB', speed: 3200, type: 'DDR4', timing: 'CL16-18-18-38', voltage: 1.35, rgb: false, height: '42mm' } },
    { id: 3103, name: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4-3200', category: 'RAM', brand: 'Corsair', price: 54, releaseYear: 2020, rating: 4.7, popularity: 98, specs: { capacity: '32GB', modules: '2x16GB', speed: 3200, type: 'DDR4', timing: 'CL16-20-20-38', voltage: 1.35, rgb: false, height: '34mm' } },
    { id: 3104, name: 'Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4-3600', category: 'RAM', brand: 'Corsair', price: 89, releaseYear: 2020, rating: 4.7, popularity: 90, specs: { capacity: '32GB', modules: '2x16GB', speed: 3600, type: 'DDR4', timing: 'CL18-22-22-42', voltage: 1.35, rgb: true, height: '51mm' } },
    { id: 3105, name: 'Kingston Fury Beast 32GB (2x16GB) DDR4-3200', category: 'RAM', brand: 'Kingston', price: 55, releaseYear: 2021, rating: 4.6, popularity: 88, specs: { capacity: '32GB', modules: '2x16GB', speed: 3200, type: 'DDR4', timing: 'CL16-18-18-36', voltage: 1.35, rgb: false, height: '34mm' } },
    { id: 3106, name: 'Crucial Ballistix 32GB (2x16GB) DDR4-3600', category: 'RAM', brand: 'Crucial', price: 65, releaseYear: 2020, rating: 4.6, popularity: 85, specs: { capacity: '32GB', modules: '2x16GB', speed: 3600, type: 'DDR4', timing: 'CL16-18-18-38', voltage: 1.35, rgb: false, height: '39mm' } },
    { id: 3107, name: 'TeamGroup T-Force Vulcan Z 32GB DDR4-3200', category: 'RAM', brand: 'TeamGroup', price: 49, releaseYear: 2020, rating: 4.5, popularity: 85, specs: { capacity: '32GB', modules: '2x16GB', speed: 3200, type: 'DDR4', timing: 'CL16-18-18-38', voltage: 1.35, rgb: false, height: '32mm' } },
];

// ============================================================================
// Motherboards - AM5
// ============================================================================
export const AM5_MOTHERBOARDS: PartSpec[] = [
    { id: 4001, name: 'ASUS ROG Crosshair X670E Hero', category: 'Motherboard', brand: 'ASUS', price: 699, releaseYear: 2022, rating: 4.8, popularity: 85, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 5, usb4: true, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4002, name: 'ASUS ROG Strix X670E-E Gaming WiFi', category: 'Motherboard', brand: 'ASUS', price: 499, releaseYear: 2022, rating: 4.7, popularity: 88, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4003, name: 'ASUS ROG Strix B650E-F Gaming WiFi', category: 'Motherboard', brand: 'ASUS', price: 289, releaseYear: 2022, rating: 4.7, popularity: 92, specs: { socket: 'AM5', chipset: 'B650E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 3, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4004, name: 'MSI MEG X670E ACE', category: 'Motherboard', brand: 'MSI', price: 699, releaseYear: 2022, rating: 4.8, popularity: 80, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'E-ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 5, usb4: true, wifi: 'WiFi 6E', lan: '10GbE' } },
    { id: 4005, name: 'MSI MAG X670E Tomahawk WiFi', category: 'Motherboard', brand: 'MSI', price: 299, releaseYear: 2022, rating: 4.6, popularity: 90, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4006, name: 'MSI MAG B650 Tomahawk WiFi', category: 'Motherboard', brand: 'MSI', price: 239, releaseYear: 2022, rating: 4.6, popularity: 92, specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: false, m2Slots: 3, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4007, name: 'Gigabyte X670E AORUS Master', category: 'Motherboard', brand: 'Gigabyte', price: 479, releaseYear: 2022, rating: 4.7, popularity: 82, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '10GbE' } },
    { id: 4008, name: 'Gigabyte B650 AORUS Elite AX', category: 'Motherboard', brand: 'Gigabyte', price: 199, releaseYear: 2022, rating: 4.5, popularity: 90, specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: false, m2Slots: 2, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4009, name: 'ASUS ProArt X670E-Creator WiFi', category: 'Motherboard', brand: 'ASUS', price: 499, releaseYear: 2022, rating: 4.7, popularity: 75, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: true, wifi: 'WiFi 6E', lan: '10GbE', thunderbolt: true } },
    { id: 4010, name: 'ASRock X670E Taichi', category: 'Motherboard', brand: 'ASRock', price: 459, releaseYear: 2022, rating: 4.6, popularity: 78, specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4011, name: 'ASUS TUF Gaming B650-Plus WiFi', category: 'Motherboard', brand: 'ASUS', price: 189, releaseYear: 2022, rating: 4.5, popularity: 88, specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: false, m2Slots: 2, usb4: false, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 4012, name: 'MSI PRO B650-P WiFi', category: 'Motherboard', brand: 'MSI', price: 159, releaseYear: 2022, rating: 4.4, popularity: 85, specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: false, m2Slots: 2, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4013, name: 'Gigabyte B650M AORUS Elite', category: 'Motherboard', brand: 'Gigabyte', price: 159, releaseYear: 2022, rating: 4.4, popularity: 82, specs: { socket: 'AM5', chipset: 'B650', formFactor: 'Micro-ATX', memory: 'DDR5', maxRam: '128GB', pcie5: false, m2Slots: 2, usb4: false, wifi: false, lan: '2.5GbE' } },
    { id: 4014, name: 'ASUS ROG Strix B650E-I Gaming WiFi', category: 'Motherboard', brand: 'ASUS', price: 309, releaseYear: 2022, rating: 4.6, popularity: 78, specs: { socket: 'AM5', chipset: 'B650E', formFactor: 'Mini-ITX', memory: 'DDR5', maxRam: '64GB', pcie5: true, m2Slots: 2, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
];

// ============================================================================
// Motherboards - LGA1700
// ============================================================================
export const LGA1700_MOTHERBOARDS: PartSpec[] = [
    { id: 4101, name: 'ASUS ROG Maximus Z790 Hero', category: 'Motherboard', brand: 'ASUS', price: 599, releaseYear: 2022, rating: 4.8, popularity: 85, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 5, usb4: true, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4102, name: 'ASUS ROG Strix Z790-E Gaming WiFi', category: 'Motherboard', brand: 'ASUS', price: 449, releaseYear: 2022, rating: 4.7, popularity: 90, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4103, name: 'ASUS ROG Strix Z790-A Gaming WiFi', category: 'Motherboard', brand: 'ASUS', price: 379, releaseYear: 2022, rating: 4.7, popularity: 88, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4104, name: 'MSI MEG Z790 ACE', category: 'Motherboard', brand: 'MSI', price: 699, releaseYear: 2022, rating: 4.8, popularity: 78, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'E-ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 5, usb4: true, wifi: 'WiFi 6E', lan: '10GbE' } },
    { id: 4105, name: 'MSI MAG Z790 Tomahawk WiFi', category: 'Motherboard', brand: 'MSI', price: 279, releaseYear: 2022, rating: 4.6, popularity: 92, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4106, name: 'MSI PRO Z790-A WiFi', category: 'Motherboard', brand: 'MSI', price: 229, releaseYear: 2022, rating: 4.5, popularity: 90, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4107, name: 'Gigabyte Z790 AORUS Master', category: 'Motherboard', brand: 'Gigabyte', price: 469, releaseYear: 2022, rating: 4.7, popularity: 82, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 5, usb4: false, wifi: 'WiFi 6E', lan: '10GbE' } },
    { id: 4108, name: 'Gigabyte Z790 AORUS Elite AX', category: 'Motherboard', brand: 'Gigabyte', price: 289, releaseYear: 2022, rating: 4.6, popularity: 88, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: true, m2Slots: 4, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4109, name: 'ASUS TUF Gaming B760-Plus WiFi D4', category: 'Motherboard', brand: 'ASUS', price: 179, releaseYear: 2023, rating: 4.5, popularity: 85, specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie5: false, m2Slots: 3, usb4: false, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 4110, name: 'MSI MAG B760 Tomahawk WiFi', category: 'Motherboard', brand: 'MSI', price: 189, releaseYear: 2023, rating: 4.6, popularity: 90, specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', memory: 'DDR5', maxRam: '128GB', pcie5: false, m2Slots: 3, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4111, name: 'MSI PRO B760-P WiFi DDR4', category: 'Motherboard', brand: 'MSI', price: 139, releaseYear: 2023, rating: 4.4, popularity: 88, specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie5: false, m2Slots: 2, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4112, name: 'Gigabyte B760 AORUS Elite AX DDR4', category: 'Motherboard', brand: 'Gigabyte', price: 159, releaseYear: 2023, rating: 4.5, popularity: 85, specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie5: false, m2Slots: 2, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4113, name: 'ASRock B760M Pro RS/D4', category: 'Motherboard', brand: 'ASRock', price: 99, releaseYear: 2023, rating: 4.3, popularity: 82, specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'Micro-ATX', memory: 'DDR4', maxRam: '128GB', pcie5: false, m2Slots: 2, usb4: false, wifi: false, lan: '2.5GbE' } },
    { id: 4114, name: 'ASUS ROG Strix Z790-I Gaming WiFi', category: 'Motherboard', brand: 'ASUS', price: 449, releaseYear: 2022, rating: 4.6, popularity: 75, specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'Mini-ITX', memory: 'DDR5', maxRam: '64GB', pcie5: true, m2Slots: 2, usb4: true, wifi: 'WiFi 6E', lan: '2.5GbE' } },
];

// ============================================================================
// Motherboards - AM4
// ============================================================================
export const AM4_MOTHERBOARDS: PartSpec[] = [
    { id: 4201, name: 'ASUS ROG Crosshair VIII Dark Hero', category: 'Motherboard', brand: 'ASUS', price: 399, releaseYear: 2020, rating: 4.8, popularity: 80, specs: { socket: 'AM4', chipset: 'X570', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 3, usb4: false, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 4202, name: 'ASUS ROG Strix X570-E Gaming WiFi II', category: 'Motherboard', brand: 'ASUS', price: 329, releaseYear: 2021, rating: 4.7, popularity: 82, specs: { socket: 'AM4', chipset: 'X570', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 3, usb4: false, wifi: 'WiFi 6E', lan: '2.5GbE' } },
    { id: 4203, name: 'MSI MEG X570 ACE', category: 'Motherboard', brand: 'MSI', price: 369, releaseYear: 2019, rating: 4.7, popularity: 75, specs: { socket: 'AM4', chipset: 'X570', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 3, usb4: false, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 4204, name: 'MSI MAG B550 Tomahawk', category: 'Motherboard', brand: 'MSI', price: 169, releaseYear: 2020, rating: 4.7, popularity: 95, specs: { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 2, usb4: false, wifi: false, lan: '2.5GbE' } },
    { id: 4205, name: 'ASUS TUF Gaming B550-Plus WiFi II', category: 'Motherboard', brand: 'ASUS', price: 179, releaseYear: 2021, rating: 4.6, popularity: 92, specs: { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 2, usb4: false, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 4206, name: 'Gigabyte B550 AORUS Elite V2', category: 'Motherboard', brand: 'Gigabyte', price: 149, releaseYear: 2020, rating: 4.5, popularity: 90, specs: { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 2, usb4: false, wifi: false, lan: '2.5GbE' } },
    { id: 4207, name: 'ASRock B550M Pro4', category: 'Motherboard', brand: 'ASRock', price: 99, releaseYear: 2020, rating: 4.5, popularity: 88, specs: { socket: 'AM4', chipset: 'B550', formFactor: 'Micro-ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 2, usb4: false, wifi: false, lan: '1GbE' } },
    { id: 4208, name: 'MSI B550-A PRO', category: 'Motherboard', brand: 'MSI', price: 129, releaseYear: 2020, rating: 4.5, popularity: 88, specs: { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memory: 'DDR4', maxRam: '128GB', pcie4: true, m2Slots: 2, usb4: false, wifi: false, lan: '1GbE' } },
    { id: 4209, name: 'ASUS ROG Strix B550-I Gaming', category: 'Motherboard', brand: 'ASUS', price: 219, releaseYear: 2020, rating: 4.6, popularity: 80, specs: { socket: 'AM4', chipset: 'B550', formFactor: 'Mini-ITX', memory: 'DDR4', maxRam: '64GB', pcie4: true, m2Slots: 2, usb4: false, wifi: 'WiFi 6', lan: '2.5GbE' } },
    { id: 4210, name: 'Gigabyte B550I AORUS Pro AX', category: 'Motherboard', brand: 'Gigabyte', price: 189, releaseYear: 2020, rating: 4.5, popularity: 78, specs: { socket: 'AM4', chipset: 'B550', formFactor: 'Mini-ITX', memory: 'DDR4', maxRam: '64GB', pcie4: true, m2Slots: 2, usb4: false, wifi: 'WiFi 6', lan: '2.5GbE' } },
];

// Generated expansion to push total parts over 500
const EXTRA_AM5_MOTHERBOARDS: PartSpec[] = Array.from({ length: 10 }, (_, i) => {
    const brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'ASUS', 'MSI', 'Gigabyte', 'ASRock', 'ASUS', 'MSI'];
    const brand = brands[i % brands.length];
    const chipset = i % 2 === 0 ? 'B650' : 'X670';
    const formFactor = i % 3 === 0 ? 'ATX' : i % 3 === 1 ? 'Micro-ATX' : 'Mini-ITX';
    const m2Slots = chipset === 'X670' ? 4 : 3;

    return {
        id: 4020 + i,
        name: `${brand} ${chipset} Pro ${formFactor}`,
        category: 'Motherboard',
        brand,
        price: 159 + (i % 6) * 30,
        releaseYear: 2023,
        rating: 4.4 + (i % 5) * 0.1,
        popularity: 70 + (i % 20),
        specs: {
            socket: 'AM5',
            chipset,
            formFactor,
            memory: 'DDR5',
            maxRam: '128GB',
            pcie5: chipset === 'X670',
            m2Slots,
            usb4: chipset === 'X670',
            wifi: i % 2 === 0 ? 'WiFi 6E' : 'WiFi 6',
            lan: '2.5GbE'
        }
    };
});

const EXTRA_LGA1700_MOTHERBOARDS: PartSpec[] = Array.from({ length: 6 }, (_, i) => {
    const brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'ASUS', 'MSI'];
    const brand = brands[i % brands.length];
    const chipset = i % 2 === 0 ? 'Z790' : 'B760';
    const formFactor = i % 3 === 0 ? 'ATX' : i % 3 === 1 ? 'Micro-ATX' : 'Mini-ITX';

    return {
        id: 4120 + i,
        name: `${brand} ${chipset} Edge ${formFactor}`,
        category: 'Motherboard',
        brand,
        price: 139 + (i % 5) * 40,
        releaseYear: 2023,
        rating: 4.3 + (i % 5) * 0.1,
        popularity: 68 + (i % 20),
        specs: {
            socket: 'LGA1700',
            chipset,
            formFactor,
            memory: chipset === 'Z790' ? 'DDR5' : 'DDR4',
            maxRam: '128GB',
            pcie5: chipset === 'Z790',
            m2Slots: chipset === 'Z790' ? 4 : 3,
            usb4: false,
            wifi: i % 2 === 0 ? 'WiFi 6E' : 'WiFi 6',
            lan: '2.5GbE'
        }
    };
});

const EXTRA_AM4_MOTHERBOARDS: PartSpec[] = Array.from({ length: 4 }, (_, i) => {
    const brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock'];
    const brand = brands[i % brands.length];
    const chipset = i % 2 === 0 ? 'B550' : 'X570';

    return {
        id: 4220 + i,
        name: `${brand} ${chipset} Classic`,
        category: 'Motherboard',
        brand,
        price: 109 + (i % 4) * 35,
        releaseYear: 2021,
        rating: 4.2 + (i % 5) * 0.1,
        popularity: 65 + (i % 20),
        specs: {
            socket: 'AM4',
            chipset,
            formFactor: i % 2 === 0 ? 'ATX' : 'Micro-ATX',
            memory: 'DDR4',
            maxRam: '128GB',
            pcie4: true,
            m2Slots: 2,
            usb4: false,
            wifi: i % 2 === 0 ? 'WiFi 6' : false,
            lan: '2.5GbE'
        }
    };
});

export const ALL_MOTHERBOARDS = [...AM5_MOTHERBOARDS, ...LGA1700_MOTHERBOARDS, ...AM4_MOTHERBOARDS, ...EXTRA_AM5_MOTHERBOARDS, ...EXTRA_LGA1700_MOTHERBOARDS, ...EXTRA_AM4_MOTHERBOARDS];

// Generated expansion to push total parts over 500
const EXTRA_DDR5_RAM: PartSpec[] = Array.from({ length: 20 }, (_, i) => {
    const brands = ['G.Skill', 'Corsair', 'Kingston', 'Crucial', 'TeamGroup', 'ADATA'];
    const brand = brands[i % brands.length];
    const capacity = i % 2 === 0 ? '32GB' : '64GB';
    const modules = i % 2 === 0 ? '2x16GB' : '2x32GB';
    const speed = 5200 + (i % 6) * 400;
    const rgb = i % 3 === 0;

    return {
        id: 3020 + i,
        name: `${brand} Performance ${capacity} (${modules}) DDR5-${speed}`,
        category: 'RAM',
        brand,
        price: 89 + (i % 10) * 12,
        releaseYear: 2023,
        rating: 4.4 + (i % 5) * 0.1,
        popularity: 70 + (i % 25),
        specs: {
            capacity,
            modules,
            speed,
            type: 'DDR5',
            timing: `CL${30 + (i % 6) * 2}-40-40-96`,
            voltage: 1.25 + (i % 3) * 0.05,
            rgb,
            height: rgb ? '44mm' : '34mm'
        }
    };
});

const EXTRA_DDR4_RAM: PartSpec[] = Array.from({ length: 20 }, (_, i) => {
    const brands = ['G.Skill', 'Corsair', 'Kingston', 'Crucial', 'TeamGroup', 'Patriot'];
    const brand = brands[i % brands.length];
    const capacity = i % 2 === 0 ? '16GB' : '32GB';
    const modules = i % 2 === 0 ? '2x8GB' : '2x16GB';
    const speed = 3000 + (i % 6) * 200;
    const rgb = i % 4 === 0;

    return {
        id: 3120 + i,
        name: `${brand} Classic ${capacity} (${modules}) DDR4-${speed}`,
        category: 'RAM',
        brand,
        price: 49 + (i % 10) * 8,
        releaseYear: 2021,
        rating: 4.3 + (i % 5) * 0.1,
        popularity: 68 + (i % 25),
        specs: {
            capacity,
            modules,
            speed,
            type: 'DDR4',
            timing: `CL${16 + (i % 5) * 2}-18-18-36`,
            voltage: 1.35,
            rgb,
            height: rgb ? '44mm' : '34mm'
        }
    };
});

export const ALL_RAM = [...DDR5_RAM, ...DDR4_RAM, ...EXTRA_DDR5_RAM, ...EXTRA_DDR4_RAM];

