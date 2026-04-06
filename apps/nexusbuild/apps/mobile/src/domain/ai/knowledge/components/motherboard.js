/**
 * MOTHERBOARD components (2000-2025).
 * Split by era for quick filtering.
 * ~200+ motherboards across all eras
 */

export const MOTHERBOARD_BY_ERA = {
    "2025": {
        // Intel Arrow Lake B/H series (2025)
        "b860": { name: "Intel B860 Chipset", type: "Motherboard", year: 2025, socket: "LGA 1851", ramSupport: "DDR5", features: ["PCIe 5.0 x16", "PCIe 4.0 NVMe"], msrp: "150-250", notes: "Mainstream Arrow Lake." },
        "h810": { name: "Intel H810 Chipset", type: "Motherboard", year: 2025, socket: "LGA 1851", ramSupport: "DDR5", features: ["PCIe 5.0 x8", "PCIe 4.0 NVMe"], msrp: "100-180", notes: "Budget Arrow Lake." },
    },
    "2000-2009": {
        // Intel Chipsets (2000-2009)
        "i845": { name: "Intel 845", type: "Motherboard", year: 2001, socket: "478", ramSupport: "DDR/SDRAM", features: ["AGP 4x"], msrp: "100-150", notes: "Early Pentium 4 chipset." },
        "i865pe": { name: "Intel 865PE", type: "Motherboard", year: 2003, socket: "478", ramSupport: "DDR400", features: ["AGP 8x", "Dual Channel"], msrp: "120-180", notes: "Popular P4 chipset." },
        "i875p": { name: "Intel 875P", type: "Motherboard", year: 2003, socket: "478", ramSupport: "DDR400", features: ["PAT", "AGP 8x"], msrp: "180-250", notes: "Enthusiast P4 chipset." },
        "i915p": { name: "Intel 915P", type: "Motherboard", year: 2004, socket: "775", ramSupport: "DDR2", features: ["PCIe x16"], msrp: "130-180", notes: "First PCIe chipset." },
        "i925x": { name: "Intel 925X", type: "Motherboard", year: 2004, socket: "775", ramSupport: "DDR2", features: ["PCIe x16", "Dual Channel"], msrp: "180-250", notes: "Premium LGA775." },
        "i945p": { name: "Intel 945P", type: "Motherboard", year: 2005, socket: "775", ramSupport: "DDR2", features: ["PCIe x16"], msrp: "100-150", notes: "Mainstream 775." },
        "i955x": { name: "Intel 955X", type: "Motherboard", year: 2005, socket: "775", ramSupport: "DDR2", features: ["OC support"], msrp: "200-280", notes: "Enthusiast 775." },
        "p965": { name: "Intel P965", type: "Motherboard", year: 2006, socket: "775", ramSupport: "DDR2", features: ["Modern PCH"], msrp: "110-170", notes: "Core 2 Duo era." },
        "p35": { name: "Intel P35", type: "Motherboard", year: 2007, socket: "775", ramSupport: "DDR2/DDR3", features: ["45nm support"], msrp: "100-160", notes: "Popular Core 2 chipset." },
        "x38": { name: "Intel X38", type: "Motherboard", year: 2007, socket: "775", ramSupport: "DDR3", features: ["CrossFire", "OC"], msrp: "200-300", notes: "Enthusiast Core 2." },
        "p45": { name: "Intel P45", type: "Motherboard", year: 2008, socket: "775", ramSupport: "DDR2/DDR3", features: ["CrossFire", "OC"], msrp: "100-180", notes: "Legendary LGA775 chipset." },
        "x48": { name: "Intel X48", type: "Motherboard", year: 2008, socket: "775", ramSupport: "DDR3", features: ["SLI/CF"], msrp: "220-350", notes: "Ultimate LGA775." },
        "x58": { name: "Intel X58", type: "Motherboard", year: 2008, socket: "1366", ramSupport: "DDR3", features: ["Triple Channel", "SLI/CF"], msrp: "200-400", notes: "First Core i7 platform." },
        // AMD Chipsets (2000-2009)
        "nforce2": { name: "nForce2 Ultra", type: "Motherboard", year: 2002, socket: "A", ramSupport: "DDR400", features: ["Dual Channel"], msrp: "90-150", notes: "Best Socket A chipset." },
        "nforce3": { name: "nForce3 250", type: "Motherboard", year: 2004, socket: "754/939", ramSupport: "DDR400", features: ["Integrated GPU option"], msrp: "80-140", notes: "Athlon 64 era." },
        "nforce4_sli": { name: "nForce4 SLI", type: "Motherboard", year: 2005, socket: "939", ramSupport: "DDR400", features: ["SLI", "RAID"], msrp: "150-220", notes: "Best A64 chipset." },
        "nforce4_ultra": { name: "nForce4 Ultra", type: "Motherboard", year: 2005, socket: "939", ramSupport: "DDR400", features: ["SATA2"], msrp: "100-160", notes: "Popular A64 chipset." },
        "nforce_570": { name: "nForce 570 SLI", type: "Motherboard", year: 2006, socket: "AM2", ramSupport: "DDR2", features: ["SLI"], msrp: "120-180", notes: "AM2 SLI support." },
        "nforce_590": { name: "nForce 590 SLI", type: "Motherboard", year: 2006, socket: "AM2", ramSupport: "DDR2", features: ["Full SLI lanes"], msrp: "180-280", notes: "Enthusiast AM2." },
        "amd_770": { name: "AMD 770", type: "Motherboard", year: 2007, socket: "AM2+", ramSupport: "DDR2", features: ["CrossFire"], msrp: "80-130", notes: "Budget Phenom." },
        "amd_780g": { name: "AMD 780G", type: "Motherboard", year: 2008, socket: "AM2+", ramSupport: "DDR2", features: ["Integrated HD3200"], msrp: "80-120", notes: "First AMD IGP." },
        "amd_790fx": { name: "AMD 790FX", type: "Motherboard", year: 2007, socket: "AM2+/AM3", ramSupport: "DDR2/DDR3", features: ["Dual x16 CF"], msrp: "150-250", notes: "Enthusiast Phenom." },
        "amd_790x": { name: "AMD 790X", type: "Motherboard", year: 2008, socket: "AM2+/AM3", ramSupport: "DDR2/DDR3", features: ["CrossFire"], msrp: "100-160", notes: "Mainstream Phenom II." },
        // Popular boards of the era
        "asus_p5q": { name: "ASUS P5Q Series", type: "Motherboard", year: 2008, socket: "775", chipset: "P45", msrp: "130-200", notes: "Legendary P45 boards." },
        "gigabyte_ep45": { name: "Gigabyte EP45-UD3P", type: "Motherboard", year: 2008, socket: "775", chipset: "P45", msrp: "140-180", notes: "Popular P45 board." },
        "asus_rampage": { name: "ASUS Rampage Formula", type: "Motherboard", year: 2008, socket: "775", chipset: "X48", msrp: "280-350", notes: "ROG flagship." },
        "dfi_lanparty": { name: "DFI LANParty UT X58", type: "Motherboard", year: 2009, socket: "1366", chipset: "X58", msrp: "300-400", notes: "OC legend." },
    },
    "2010-2014": {
        // Intel LGA 1156 (Nehalem)
        "p55": { name: "Intel P55", type: "Motherboard", year: 2009, socket: "1156", ramSupport: "DDR3", features: ["PCIe 2.0", "Dual Channel"], msrp: "120-180", notes: "First Core i5/i7 mainstream." },
        "h55": { name: "Intel H55", type: "Motherboard", year: 2010, socket: "1156", ramSupport: "DDR3", features: ["iGPU output"], msrp: "80-120", notes: "Budget 1156 with iGPU." },
        "h57": { name: "Intel H57", type: "Motherboard", year: 2010, socket: "1156", ramSupport: "DDR3", features: ["iGPU", "RAID"], msrp: "100-150", notes: "Business 1156." },
        // Intel LGA 1155 (Sandy Bridge / Ivy Bridge)
        "p67": { name: "Intel P67", type: "Motherboard", year: 2011, socket: "1155", ramSupport: "DDR3", features: ["OC support", "SLI/CF"], msrp: "130-200", notes: "Enthusiast Sandy Bridge." },
        "z68": { name: "Intel Z68", type: "Motherboard", year: 2011, socket: "1155", ramSupport: "DDR3", features: ["SRT caching", "iGPU + discrete"], msrp: "140-220", notes: "Best Sandy Bridge chipset." },
        "h61": { name: "Intel H61", type: "Motherboard", year: 2011, socket: "1155", ramSupport: "DDR3", features: ["Budget"], msrp: "50-80", notes: "Ultra budget Sandy Bridge." },
        "h67": { name: "Intel H67", type: "Motherboard", year: 2011, socket: "1155", ramSupport: "DDR3", features: ["iGPU output"], msrp: "80-120", notes: "Mainstream with iGPU." },
        "b75": { name: "Intel B75", type: "Motherboard", year: 2012, socket: "1155", ramSupport: "DDR3", features: ["USB 3.0"], msrp: "60-100", notes: "Business Ivy Bridge." },
        "z77": { name: "Intel Z77", type: "Motherboard", year: 2012, socket: "1155", ramSupport: "DDR3", features: ["Native USB 3.0", "PCIe 3.0"], msrp: "130-250", notes: "Best Ivy Bridge chipset." },
        "h77": { name: "Intel H77", type: "Motherboard", year: 2012, socket: "1155", ramSupport: "DDR3", features: ["USB 3.0"], msrp: "90-140", notes: "Mainstream Ivy Bridge." },
        // Intel LGA 1150 (Haswell)
        "z87": { name: "Intel Z87", type: "Motherboard", year: 2013, socket: "1150", ramSupport: "DDR3", features: ["M.2 (some)", "OC"], msrp: "130-280", notes: "First Haswell chipset." },
        "h87": { name: "Intel H87", type: "Motherboard", year: 2013, socket: "1150", ramSupport: "DDR3", features: ["6x SATA"], msrp: "90-140", notes: "Mainstream Haswell." },
        "b85": { name: "Intel B85", type: "Motherboard", year: 2013, socket: "1150", ramSupport: "DDR3", features: ["Basic"], msrp: "60-100", notes: "Budget Haswell." },
        "h81": { name: "Intel H81", type: "Motherboard", year: 2013, socket: "1150", ramSupport: "DDR3", features: ["2x SATA"], msrp: "40-70", notes: "Ultra budget Haswell." },
        "z97": { name: "Intel Z97", type: "Motherboard", year: 2014, socket: "1150", ramSupport: "DDR3", features: ["M.2 PCIe", "SATA Express"], msrp: "130-300", notes: "Best Haswell chipset." },
        "h97": { name: "Intel H97", type: "Motherboard", year: 2014, socket: "1150", ramSupport: "DDR3", features: ["M.2"], msrp: "80-130", notes: "Mainstream refresh." },
        // Intel HEDT (2011-2014)
        "x79": { name: "Intel X79", type: "Motherboard", year: 2011, socket: "2011", ramSupport: "DDR3", features: ["Quad Channel", "40 PCIe lanes"], msrp: "200-450", notes: "First LGA 2011." },
        "x99": { name: "Intel X99", type: "Motherboard", year: 2014, socket: "2011-3", ramSupport: "DDR4", features: ["First DDR4", "40 lanes"], msrp: "230-500", notes: "Haswell-E platform." },
        // AMD AM3+
        "amd_990fx": { name: "AMD 990FX", type: "Motherboard", year: 2011, socket: "AM3+", ramSupport: "DDR3", features: ["Dual x16 CF/SLI", "OC"], msrp: "140-250", notes: "Best FX chipset." },
        "amd_990x": { name: "AMD 990X", type: "Motherboard", year: 2011, socket: "AM3+", ramSupport: "DDR3", features: ["CrossFire"], msrp: "100-160", notes: "Mainstream FX." },
        "amd_970": { name: "AMD 970", type: "Motherboard", year: 2011, socket: "AM3+", ramSupport: "DDR3", features: ["x16 + x4"], msrp: "70-120", notes: "Budget FX chipset." },
        "amd_760g": { name: "AMD 760G", type: "Motherboard", year: 2011, socket: "AM3+", ramSupport: "DDR3", features: ["IGP"], msrp: "50-80", notes: "Ultra budget with IGP." },
        // AMD FM1/FM2 (APU)
        "amd_a75": { name: "AMD A75", type: "Motherboard", year: 2011, socket: "FM1", ramSupport: "DDR3", features: ["USB 3.0", "SATA 6G"], msrp: "70-120", notes: "First APU platform." },
        "amd_a85x": { name: "AMD A85X", type: "Motherboard", year: 2012, socket: "FM2", ramSupport: "DDR3", features: ["8x SATA 6G"], msrp: "80-140", notes: "Trinity APU platform." },
        "amd_a88x": { name: "AMD A88X", type: "Motherboard", year: 2014, socket: "FM2+", ramSupport: "DDR3", features: ["xConnect"], msrp: "70-130", notes: "Kaveri APU platform." },
        // Popular boards of the era
        "asus_sabertooth_z77": { name: "ASUS Sabertooth Z77", type: "Motherboard", year: 2012, socket: "1155", chipset: "Z77", msrp: "240-280", notes: "TUF-style durability." },
        "msi_z77a_gd65": { name: "MSI Z77A-GD65", type: "Motherboard", year: 2012, socket: "1155", chipset: "Z77", msrp: "180-220", notes: "Gaming flagship." },
        "gigabyte_z77x_ud5h": { name: "Gigabyte Z77X-UD5H", type: "Motherboard", year: 2012, socket: "1155", chipset: "Z77", msrp: "200-250", notes: "Enthusiast board." },
        "asus_maximus_v": { name: "ASUS Maximus V Formula", type: "Motherboard", year: 2012, socket: "1155", chipset: "Z77", msrp: "300-380", notes: "ROG flagship." },
        "asus_z97_a": { name: "ASUS Z97-A", type: "Motherboard", year: 2014, socket: "1150", chipset: "Z97", msrp: "140-180", notes: "Popular mainstream." },
        "msi_z97_gaming_5": { name: "MSI Z97 Gaming 5", type: "Motherboard", year: 2014, socket: "1150", chipset: "Z97", msrp: "160-200", notes: "Gaming focused." },
        "asus_crosshair_v": { name: "ASUS Crosshair V Formula-Z", type: "Motherboard", year: 2013, socket: "AM3+", chipset: "990FX", msrp: "240-300", notes: "ROG AMD flagship." },
    },
    "2015-2019": {
        // Intel LGA 1151 (Skylake / Kaby Lake)
        "z170": { name: "Intel Z170", type: "Motherboard", year: 2015, socket: "1151", ramSupport: "DDR4/DDR3L", features: ["PCIe 3.0", "M.2 NVMe", "OC"], msrp: "120-300", notes: "First Skylake chipset." },
        "h170": { name: "Intel H170", type: "Motherboard", year: 2015, socket: "1151", ramSupport: "DDR4", features: ["More USB"], msrp: "90-140", notes: "Mainstream Skylake." },
        "b150": { name: "Intel B150", type: "Motherboard", year: 2015, socket: "1151", ramSupport: "DDR4", features: ["Basic M.2"], msrp: "70-110", notes: "Budget Skylake." },
        "h110": { name: "Intel H110", type: "Motherboard", year: 2015, socket: "1151", ramSupport: "DDR4", features: ["Minimal"], msrp: "50-80", notes: "Ultra budget." },
        "z270": { name: "Intel Z270", type: "Motherboard", year: 2017, socket: "1151", ramSupport: "DDR4", features: ["More PCIe lanes", "Optane"], msrp: "130-320", notes: "Kaby Lake refresh." },
        "h270": { name: "Intel H270", type: "Motherboard", year: 2017, socket: "1151", ramSupport: "DDR4", features: ["Optane"], msrp: "90-140", notes: "Kaby Lake mainstream." },
        "b250": { name: "Intel B250", type: "Motherboard", year: 2017, socket: "1151", ramSupport: "DDR4", features: ["Optane"], msrp: "70-110", notes: "Kaby Lake budget." },
        // Intel LGA 1151 v2 (Coffee Lake)
        "z370": { name: "Intel Z370", type: "Motherboard", year: 2017, socket: "1151v2", ramSupport: "DDR4", features: ["6-core support", "OC"], msrp: "130-300", notes: "First Coffee Lake." },
        "z390": { name: "Intel Z390", type: "Motherboard", year: 2018, socket: "1151v2", ramSupport: "DDR4", features: ["Native USB 3.1G2", "WiFi"], msrp: "140-400", notes: "Best Coffee Lake chipset." },
        "h370": { name: "Intel H370", type: "Motherboard", year: 2018, socket: "1151v2", ramSupport: "DDR4", features: ["USB 3.1G2"], msrp: "90-150", notes: "Coffee Lake mainstream." },
        "b360": { name: "Intel B360", type: "Motherboard", year: 2018, socket: "1151v2", ramSupport: "DDR4", features: ["Basic"], msrp: "70-120", notes: "Coffee Lake budget." },
        "b365": { name: "Intel B365", type: "Motherboard", year: 2019, socket: "1151v2", ramSupport: "DDR4", features: ["More SATA"], msrp: "65-110", notes: "B360 successor." },
        "h310": { name: "Intel H310", type: "Motherboard", year: 2018, socket: "1151v2", ramSupport: "DDR4", features: ["Minimal"], msrp: "50-80", notes: "Ultra budget Coffee Lake." },
        // Intel HEDT (2015-2019)
        "x299": { name: "Intel X299", type: "Motherboard", year: 2017, socket: "2066", ramSupport: "DDR4", features: ["Quad Channel", "44+ lanes"], msrp: "250-600", notes: "Skylake-X HEDT." },
        // AMD AM4 (2017-2019)
        "x370": { name: "AMD X370", type: "Motherboard", year: 2017, socket: "AM4", ramSupport: "DDR4", features: ["SLI/CF", "OC"], msrp: "120-250", notes: "First Ryzen chipset." },
        "b350": { name: "AMD B350", type: "Motherboard", year: 2017, socket: "AM4", ramSupport: "DDR4", features: ["OC", "CF"], msrp: "70-130", notes: "Popular Ryzen budget." },
        "a320": { name: "AMD A320", type: "Motherboard", year: 2017, socket: "AM4", ramSupport: "DDR4", features: ["No OC"], msrp: "50-80", notes: "Ultra budget, no OC." },
        "x470": { name: "AMD X470", type: "Motherboard", year: 2018, socket: "AM4", ramSupport: "DDR4", features: ["StoreMI", "XFR2"], msrp: "120-280", notes: "Ryzen 2000 optimized." },
        "b450": { name: "AMD B450", type: "Motherboard", year: 2018, socket: "AM4", ramSupport: "DDR4", features: ["OC", "StoreMI"], msrp: "70-150", notes: "Legendary value chipset." },
        "x570": { name: "AMD X570", type: "Motherboard", year: 2019, socket: "AM4", ramSupport: "DDR4", features: ["PCIe 4.0", "Dual NVMe"], msrp: "150-700", notes: "First PCIe 4.0 consumer." },
        // AMD Threadripper
        "x399": { name: "AMD X399", type: "Motherboard", year: 2017, socket: "TR4", ramSupport: "DDR4", features: ["Quad Channel", "64 lanes"], msrp: "300-550", notes: "First Threadripper." },
        "trx40": { name: "AMD TRX40", type: "Motherboard", year: 2019, socket: "sTRX4", ramSupport: "DDR4", features: ["PCIe 4.0", "88 lanes"], msrp: "400-900", notes: "3rd gen Threadripper." },
        // Popular boards of the era
        "asus_rog_strix_z370": { name: "ASUS ROG Strix Z370-E", type: "Motherboard", year: 2017, socket: "1151v2", chipset: "Z370", msrp: "200-250", notes: "Popular gaming board." },
        "msi_z390_godlike": { name: "MSI MEG Z390 Godlike", type: "Motherboard", year: 2018, socket: "1151v2", chipset: "Z390", msrp: "550-600", notes: "Ultimate flagship." },
        "gigabyte_z390_aorus": { name: "Gigabyte Z390 Aorus Master", type: "Motherboard", year: 2018, socket: "1151v2", chipset: "Z390", msrp: "270-320", notes: "Excellent VRM." },
        "msi_b450_tomahawk": { name: "MSI B450 Tomahawk", type: "Motherboard", year: 2018, socket: "AM4", chipset: "B450", msrp: "110-130", notes: "Legendary value board." },
        "asus_b450_strix": { name: "ASUS ROG Strix B450-F", type: "Motherboard", year: 2018, socket: "AM4", chipset: "B450", msrp: "120-150", notes: "Gaming B450." },
        "msi_x570_tomahawk": { name: "MSI MAG X570 Tomahawk", type: "Motherboard", year: 2020, socket: "AM4", chipset: "X570", msrp: "220-260", notes: "Fanless X570." },
        "gigabyte_x570_aorus": { name: "Gigabyte X570 Aorus Master", type: "Motherboard", year: 2019, socket: "AM4", chipset: "X570", msrp: "360-400", notes: "Premium X570." },
        "asrock_x570_taichi": { name: "ASRock X570 Taichi", type: "Motherboard", year: 2019, socket: "AM4", chipset: "X570", msrp: "300-350", notes: "Feature-rich X570." },
        "asus_crosshair_viii": { name: "ASUS Crosshair VIII Hero", type: "Motherboard", year: 2019, socket: "AM4", chipset: "X570", msrp: "380-450", notes: "ROG flagship AM4." },
    },
    "2020-2024": {
        // Intel LGA 1200 (Comet/Rocket Lake)
        "z490": { name: "Intel Z490", type: "Motherboard", year: 2020, socket: "1200", ramSupport: "DDR4", features: ["OC", "2.5G LAN"], msrp: "150-450", notes: "10th Gen Intel." },
        "h470": { name: "Intel H470", type: "Motherboard", year: 2020, socket: "1200", ramSupport: "DDR4", features: ["More USB"], msrp: "100-160", notes: "Mainstream 10th gen." },
        "b460": { name: "Intel B460", type: "Motherboard", year: 2020, socket: "1200", ramSupport: "DDR4", features: ["Limited RAM OC"], msrp: "80-130", notes: "Budget 10th gen." },
        "h410": { name: "Intel H410", type: "Motherboard", year: 2020, socket: "1200", ramSupport: "DDR4", features: ["Basic"], msrp: "60-90", notes: "Ultra budget." },
        "z590": { name: "Intel Z590", type: "Motherboard", year: 2021, socket: "1200", ramSupport: "DDR4", features: ["PCIe 4.0", "USB 3.2G2x2"], msrp: "180-600", notes: "11th Gen flagship." },
        "h570": { name: "Intel H570", type: "Motherboard", year: 2021, socket: "1200", ramSupport: "DDR4", features: ["PCIe 4.0 (limited)"], msrp: "120-180", notes: "Mainstream 11th gen." },
        "b560": { name: "Intel B560", type: "Motherboard", year: 2021, socket: "1200", ramSupport: "DDR4", features: ["RAM OC enabled"], msrp: "90-150", notes: "Value 11th gen." },
        "h510": { name: "Intel H510", type: "Motherboard", year: 2021, socket: "1200", ramSupport: "DDR4", features: ["Basic"], msrp: "60-100", notes: "Budget 11th gen." },
        // Intel LGA 1700 (Alder Lake / Raptor Lake)
        "z690": { name: "Intel Z690", type: "Motherboard", year: 2021, socket: "1700", ramSupport: "DDR5/DDR4", features: ["PCIe 5.0 x16", "4x M.2", "TB4"], msrp: "200-700", notes: "First DDR5 consumer. Hybrid CPU support." },
        "h670": { name: "Intel H670", type: "Motherboard", year: 2022, socket: "1700", ramSupport: "DDR5/DDR4", features: ["No OC, most features"], msrp: "140-220", notes: "Mainstream Alder Lake." },
        "b660": { name: "Intel B660", type: "Motherboard", year: 2022, socket: "1700", ramSupport: "DDR5/DDR4", features: ["RAM OC"], msrp: "100-180", notes: "Value Alder Lake." },
        "h610": { name: "Intel H610", type: "Motherboard", year: 2022, socket: "1700", ramSupport: "DDR5/DDR4", features: ["Basic"], msrp: "80-130", notes: "Budget Alder Lake." },
        "z790": { name: "Intel Z790", type: "Motherboard", year: 2022, socket: "1700", ramSupport: "DDR5/DDR4", features: ["More PCIe 4.0 lanes", "WiFi 6E"], msrp: "250-800", notes: "Raptor Lake flagship." },
        "b760": { name: "Intel B760", type: "Motherboard", year: 2023, socket: "1700", ramSupport: "DDR5/DDR4", features: ["Good value"], msrp: "120-200", notes: "Value Raptor Lake." },
        // Intel LGA 1851 (Arrow Lake)
        "z890": { name: "Intel Z890", type: "Motherboard", year: 2024, socket: "1851", ramSupport: "DDR5", features: ["PCIe 5.0 x16", "PCIe 5.0 NVMe", "TB4", "WiFi 7"], msrp: "250-600", notes: "Arrow Lake flagship." },
        // AMD AM4 continued (2020-2022)
        "b550": { name: "AMD B550", type: "Motherboard", year: 2020, socket: "AM4", ramSupport: "DDR4", features: ["PCIe 4.0 x16", "PCIe 4.0 NVMe"], msrp: "100-250", notes: "Mainstream PCIe 4.0." },
        "a520": { name: "AMD A520", type: "Motherboard", year: 2020, socket: "AM4", ramSupport: "DDR4", features: ["Budget", "Ryzen 5000 support"], msrp: "60-100", notes: "Ultra budget AM4." },
        // AMD AM5 (2022-2024)
        "x670e": { name: "AMD X670E", type: "Motherboard", year: 2022, socket: "AM5", ramSupport: "DDR5", features: ["Dual PCIe 5.0 x16", "PCIe 5.0 NVMe"], msrp: "300-700", notes: "Extreme enthusiast AM5." },
        "x670": { name: "AMD X670", type: "Motherboard", year: 2022, socket: "AM5", ramSupport: "DDR5", features: ["PCIe 5.0 x16", "PCIe 5.0 NVMe"], msrp: "250-450", notes: "Enthusiast AM5." },
        "b650e": { name: "AMD B650E", type: "Motherboard", year: 2022, socket: "AM5", ramSupport: "DDR5", features: ["PCIe 5.0 x16", "PCIe 5.0 NVMe"], msrp: "180-350", notes: "Value with PCIe 5.0." },
        "b650": { name: "AMD B650", type: "Motherboard", year: 2022, socket: "AM5", ramSupport: "DDR5", features: ["PCIe 4.0 x16", "PCIe 5.0 NVMe"], msrp: "140-280", notes: "Mainstream AM5." },
        "a620": { name: "AMD A620", type: "Motherboard", year: 2023, socket: "AM5", ramSupport: "DDR5", features: ["Budget", "No OC"], msrp: "80-130", notes: "Budget AM5." },
        "x870e": { name: "AMD X870E", type: "Motherboard", year: 2024, socket: "AM5", ramSupport: "DDR5", features: ["USB4", "WiFi 7"], msrp: "350-700", notes: "Premium Zen 5 chipset." },
        "x870": { name: "AMD X870", type: "Motherboard", year: 2024, socket: "AM5", ramSupport: "DDR5", features: ["USB4", "WiFi 7"], msrp: "250-400", notes: "Mainstream Zen 5." },
        // AMD Threadripper Pro
        "wrx80": { name: "AMD WRX80", type: "Motherboard", year: 2021, socket: "sWRX8", ramSupport: "DDR4", features: ["8-ch memory", "128 lanes"], msrp: "800-1200", notes: "Threadripper Pro." },
        "wrx90": { name: "AMD WRX90", type: "Motherboard", year: 2023, socket: "sTR5", ramSupport: "DDR5", features: ["8-ch DDR5", "128 lanes"], msrp: "900-1500", notes: "Zen 4 TR Pro." },
        "trx50": { name: "AMD TRX50", type: "Motherboard", year: 2023, socket: "sTR5", ramSupport: "DDR5", features: ["4-ch DDR5", "92 lanes"], msrp: "500-800", notes: "Consumer TR." },
        // Popular boards of the era
        "msi_b550_tomahawk": { name: "MSI MAG B550 Tomahawk", type: "Motherboard", year: 2020, socket: "AM4", chipset: "B550", msrp: "180-200", notes: "Excellent value." },
        "asus_b550_strix": { name: "ASUS ROG Strix B550-F", type: "Motherboard", year: 2020, socket: "AM4", chipset: "B550", msrp: "180-220", notes: "Gaming B550." },
        "gigabyte_b550_aorus": { name: "Gigabyte B550 Aorus Pro", type: "Motherboard", year: 2020, socket: "AM4", chipset: "B550", msrp: "180-220", notes: "Feature-rich B550." },
        "msi_b650_tomahawk": { name: "MSI MAG B650 Tomahawk", type: "Motherboard", year: 2022, socket: "AM5", chipset: "B650", msrp: "220-260", notes: "Best value AM5." },
        "asus_b650e_strix": { name: "ASUS ROG Strix B650E-F", type: "Motherboard", year: 2022, socket: "AM5", chipset: "B650E", msrp: "280-320", notes: "Gaming AM5." },
        "gigabyte_b650_aorus": { name: "Gigabyte B650 Aorus Elite", type: "Motherboard", year: 2022, socket: "AM5", chipset: "B650", msrp: "200-240", notes: "Value AM5." },
        "msi_z690_tomahawk": { name: "MSI MAG Z690 Tomahawk", type: "Motherboard", year: 2021, socket: "1700", chipset: "Z690", msrp: "280-320", notes: "Great value Z690." },
        "asus_z790_strix": { name: "ASUS ROG Strix Z790-A", type: "Motherboard", year: 2022, socket: "1700", chipset: "Z790", msrp: "400-450", notes: "Popular gaming board." },
        "msi_z790_edge": { name: "MSI MPG Z790 Edge", type: "Motherboard", year: 2022, socket: "1700", chipset: "Z790", msrp: "350-400", notes: "Great VRM." },
        "gigabyte_z790_aorus": { name: "Gigabyte Z790 Aorus Master", type: "Motherboard", year: 2022, socket: "1700", chipset: "Z790", msrp: "500-550", notes: "Premium Z790." },
        "asrock_b660_steel": { name: "ASRock B660 Steel Legend", type: "Motherboard", year: 2022, socket: "1700", chipset: "B660", msrp: "140-170", notes: "Value DDR4 B660." },
        "msi_pro_b760": { name: "MSI PRO B760-P", type: "Motherboard", year: 2023, socket: "1700", chipset: "B760", msrp: "130-160", notes: "Budget gaming." },
    }
};

export const MOTHERBOARD_CUSTOM_PARTS = {};

export const MOTHERBOARD_PARTS = {
    ...MOTHERBOARD_BY_ERA['2000-2009'],
    ...MOTHERBOARD_BY_ERA['2010-2014'],
    ...MOTHERBOARD_BY_ERA['2015-2019'],
    ...MOTHERBOARD_BY_ERA['2020-2024'],
    ...MOTHERBOARD_BY_ERA['2025'],
    ...MOTHERBOARD_CUSTOM_PARTS,
};

export default {
    MOTHERBOARD_BY_ERA,
    MOTHERBOARD_PARTS,
};
