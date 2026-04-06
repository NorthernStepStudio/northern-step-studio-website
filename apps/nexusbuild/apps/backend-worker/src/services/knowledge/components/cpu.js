/**
 * CPU components (2000-2025).
 * Split by era for quick filtering.
 */

export const CPU_BY_ERA = {
    "2025": {
        "ryzen 9 9950x3d": {
            "name": "AMD Ryzen 9 9950X3D",
            "type": "CPU",
            "architecture": "Zen 5 + 3D V-Cache",
            "cores": 16,
            "threads": 32,
            "baseClock": "4.0 GHz",
            "boostClock": "5.5 GHz",
            "cache": "128MB L3",
            "tdp": 170,
            "socket": "AM5",
            "msrp": 749,
            "year": 2025,
            "performance": "Ultimate gaming CPU. Massive cache.",
            "goodFor": [
                "Gaming",
                "Esports"
            ],
            "cooler": "360mm AIO",
            "notes": "3D V-Cache for massive gaming gains. Best for high-refresh."
        }
    },
    "2000-2009": {
        "pentium4_1.5": {
            "name": "Intel Pentium 4 1.5 GHz",
            "year": 2000,
            "cores": 1,
            "socket": "423",
            "nm": 180,
            "type": "CPU"
        },
        "pentium4_2.0": {
            "name": "Intel Pentium 4 2.0 GHz",
            "year": 2001,
            "cores": 1,
            "socket": "478",
            "nm": 180,
            "type": "CPU"
        },
        "pentium4_3.0": {
            "name": "Intel Pentium 4 3.0 GHz",
            "year": 2002,
            "cores": 1,
            "socket": "478",
            "nm": 130,
            "type": "CPU"
        },
        "pentium4_ht_3.0": {
            "name": "Pentium 4 HT 3.0 GHz",
            "year": 2002,
            "cores": 1,
            "threads": 2,
            "socket": "478",
            "ht": true,
            "type": "CPU"
        },
        "pentium4_ee_3.2": {
            "name": "Pentium 4 Extreme Edition",
            "year": 2003,
            "cores": 1,
            "socket": "478",
            "type": "CPU"
        },
        "pentium4_prescott": {
            "name": "Pentium 4 Prescott 3.4 GHz",
            "year": 2004,
            "cores": 1,
            "socket": "775",
            "nm": 90,
            "type": "CPU"
        },
        "pentium4_cedar_mill": {
            "name": "Pentium 4 Cedar Mill 3.6 GHz",
            "year": 2006,
            "cores": 1,
            "socket": "775",
            "nm": 65,
            "type": "CPU"
        },
        "pentiumd_820": {
            "name": "Pentium D 820",
            "year": 2005,
            "cores": 2,
            "socket": "775",
            "nm": 90,
            "type": "CPU"
        },
        "pentiumd_930": {
            "name": "Pentium D 930",
            "year": 2005,
            "cores": 2,
            "socket": "775",
            "tdp": 95,
            "type": "CPU"
        },
        "pentiumd_960": {
            "name": "Pentium D 960",
            "year": 2006,
            "cores": 2,
            "clock": "3.6 GHz",
            "socket": "775",
            "type": "CPU"
        },
        "core2duo_e6300": {
            "name": "Core 2 Duo E6300",
            "year": 2006,
            "cores": 2,
            "socket": "775",
            "nm": 65,
            "type": "CPU"
        },
        "core2duo_e6600": {
            "name": "Core 2 Duo E6600",
            "year": 2006,
            "cores": 2,
            "clock": "2.4 GHz",
            "cache": "4MB",
            "type": "CPU"
        },
        "core2duo_e6700": {
            "name": "Core 2 Duo E6700",
            "year": 2006,
            "cores": 2,
            "clock": "2.67 GHz",
            "type": "CPU"
        },
        "core2duo_e4300": {
            "name": "Core 2 Duo E4300",
            "year": 2007,
            "cores": 2,
            "budget": true,
            "type": "CPU"
        },
        "core2duo_e8400": {
            "name": "Core 2 Duo E8400",
            "year": 2008,
            "cores": 2,
            "clock": "3.0 GHz",
            "legendary": true,
            "type": "CPU"
        },
        "core2duo_e8500": {
            "name": "Core 2 Duo E8500",
            "year": 2008,
            "cores": 2,
            "clock": "3.16 GHz",
            "type": "CPU"
        },
        "core2quad_q6600": {
            "name": "Core 2 Quad Q6600",
            "year": 2007,
            "cores": 4,
            "legendary": true,
            "oc": "excellent",
            "type": "CPU"
        },
        "core2quad_q6700": {
            "name": "Core 2 Quad Q6700",
            "year": 2007,
            "cores": 4,
            "type": "CPU"
        },
        "core2quad_q9300": {
            "name": "Core 2 Quad Q9300",
            "year": 2008,
            "cores": 4,
            "nm": 45,
            "type": "CPU"
        },
        "core2quad_q9450": {
            "name": "Core 2 Quad Q9450",
            "year": 2008,
            "cores": 4,
            "type": "CPU"
        },
        "core2quad_q9550": {
            "name": "Core 2 Quad Q9550",
            "year": 2008,
            "cores": 4,
            "legendary": true,
            "type": "CPU"
        },
        "core2extreme_qx6700": {
            "name": "Core 2 Extreme QX6700",
            "year": 2006,
            "cores": 4,
            "unlocked": true,
            "type": "CPU"
        },
        "core2extreme_qx9770": {
            "name": "Core 2 Extreme QX9770",
            "year": 2008,
            "cores": 4,
            "clock": "3.2 GHz",
            "type": "CPU"
        },
        "i7_920": {
            "name": "Core i7-920",
            "year": 2008,
            "cores": 4,
            "threads": 8,
            "socket": "1366",
            "legendary": true,
            "type": "CPU"
        },
        "i7_940": {
            "name": "Core i7-940",
            "year": 2008,
            "cores": 4,
            "threads": 8,
            "socket": "1366",
            "type": "CPU"
        },
        "i7_950": {
            "name": "Core i7-950",
            "year": 2009,
            "cores": 4,
            "threads": 8,
            "socket": "1366",
            "type": "CPU"
        },
        "i7_960": {
            "name": "Core i7-960",
            "year": 2009,
            "cores": 4,
            "threads": 8,
            "socket": "1366",
            "type": "CPU"
        },
        "i7_965ee": {
            "name": "Core i7-965 Extreme",
            "year": 2008,
            "cores": 4,
            "threads": 8,
            "unlocked": true,
            "type": "CPU"
        },
        "i7_975ee": {
            "name": "Core i7-975 Extreme",
            "year": 2009,
            "cores": 4,
            "threads": 8,
            "unlocked": true,
            "type": "CPU"
        },
        "athlon_1400": {
            "name": "AMD Athlon 1.4 GHz",
            "year": 2001,
            "cores": 1,
            "socket": "A",
            "type": "CPU"
        },
        "athlon_xp_1700": {
            "name": "Athlon XP 1700+",
            "year": 2001,
            "cores": 1,
            "socket": "A",
            "type": "CPU"
        },
        "athlon_xp_2000": {
            "name": "Athlon XP 2000+",
            "year": 2002,
            "cores": 1,
            "socket": "A",
            "type": "CPU"
        },
        "athlon_xp_2500": {
            "name": "Athlon XP 2500+ (Barton)",
            "year": 2003,
            "cores": 1,
            "legendary": true,
            "type": "CPU"
        },
        "athlon_xp_3000": {
            "name": "Athlon XP 3000+",
            "year": 2003,
            "cores": 1,
            "socket": "A",
            "type": "CPU"
        },
        "athlon_xp_3200": {
            "name": "Athlon XP 3200+",
            "year": 2003,
            "cores": 1,
            "type": "CPU"
        },
        "athlon64_3000": {
            "name": "Athlon 64 3000+",
            "year": 2004,
            "cores": 1,
            "socket": "754",
            "bits": 64,
            "type": "CPU"
        },
        "athlon64_3200": {
            "name": "Athlon 64 3200+",
            "year": 2004,
            "cores": 1,
            "socket": "939",
            "type": "CPU"
        },
        "athlon64_3500": {
            "name": "Athlon 64 3500+",
            "year": 2004,
            "cores": 1,
            "socket": "939",
            "type": "CPU"
        },
        "athlon64_4000": {
            "name": "Athlon 64 4000+",
            "year": 2005,
            "cores": 1,
            "socket": "939",
            "type": "CPU"
        },
        "athlon64_x2_3800": {
            "name": "Athlon 64 X2 3800+",
            "year": 2005,
            "cores": 2,
            "socket": "939",
            "type": "CPU"
        },
        "athlon64_x2_4200": {
            "name": "Athlon 64 X2 4200+",
            "year": 2005,
            "cores": 2,
            "type": "CPU"
        },
        "athlon64_x2_4400": {
            "name": "Athlon 64 X2 4400+",
            "year": 2005,
            "cores": 2,
            "type": "CPU"
        },
        "athlon64_x2_4800": {
            "name": "Athlon 64 X2 4800+",
            "year": 2005,
            "cores": 2,
            "type": "CPU"
        },
        "athlon64_x2_5000": {
            "name": "Athlon 64 X2 5000+",
            "year": 2006,
            "cores": 2,
            "socket": "AM2",
            "type": "CPU"
        },
        "athlon64_x2_5600": {
            "name": "Athlon 64 X2 5600+",
            "year": 2006,
            "cores": 2,
            "type": "CPU"
        },
        "athlon64_x2_6000": {
            "name": "Athlon 64 X2 6000+",
            "year": 2007,
            "cores": 2,
            "type": "CPU"
        },
        "athlon64_x2_6400": {
            "name": "Athlon 64 X2 6400+ Black",
            "year": 2007,
            "cores": 2,
            "unlocked": true,
            "type": "CPU"
        },
        "athlon64_fx55": {
            "name": "Athlon 64 FX-55",
            "year": 2004,
            "cores": 1,
            "enthusiast": true,
            "type": "CPU"
        },
        "athlon64_fx57": {
            "name": "Athlon 64 FX-57",
            "year": 2005,
            "cores": 1,
            "enthusiast": true,
            "type": "CPU"
        },
        "athlon64_fx60": {
            "name": "Athlon 64 FX-60",
            "year": 2006,
            "cores": 2,
            "enthusiast": true,
            "type": "CPU"
        },
        "athlon64_fx62": {
            "name": "Athlon 64 FX-62",
            "year": 2006,
            "cores": 2,
            "socket": "AM2",
            "type": "CPU"
        },
        "athlon64_fx74": {
            "name": "Athlon 64 FX-74",
            "year": 2006,
            "cores": 2,
            "socket": "F",
            "type": "CPU"
        },
        "phenom_9500": {
            "name": "Phenom X4 9500",
            "year": 2007,
            "cores": 4,
            "socket": "AM2+",
            "type": "CPU"
        },
        "phenom_9600": {
            "name": "Phenom X4 9600",
            "year": 2007,
            "cores": 4,
            "type": "CPU"
        },
        "phenom_9750": {
            "name": "Phenom X4 9750",
            "year": 2008,
            "cores": 4,
            "type": "CPU"
        },
        "phenom_9850": {
            "name": "Phenom X4 9850 Black",
            "year": 2008,
            "cores": 4,
            "unlocked": true,
            "type": "CPU"
        },
        "phenom_9950": {
            "name": "Phenom X4 9950 Black",
            "year": 2008,
            "cores": 4,
            "unlocked": true,
            "type": "CPU"
        },
        "phenom_8450": {
            "name": "Phenom X3 8450",
            "year": 2008,
            "cores": 3,
            "type": "CPU"
        },
        "phenom_8650": {
            "name": "Phenom X3 8650",
            "year": 2008,
            "cores": 3,
            "type": "CPU"
        },
        "phenom2_x4_810": {
            "name": "Phenom II X4 810",
            "year": 2009,
            "cores": 4,
            "socket": "AM3",
            "type": "CPU"
        },
        "phenom2_x4_920": {
            "name": "Phenom II X4 920",
            "year": 2009,
            "cores": 4,
            "type": "CPU"
        },
        "phenom2_x4_940": {
            "name": "Phenom II X4 940 Black",
            "year": 2009,
            "cores": 4,
            "unlocked": true,
            "type": "CPU"
        },
        "phenom2_x4_945": {
            "name": "Phenom II X4 945",
            "year": 2009,
            "cores": 4,
            "clock": "3.0 GHz",
            "type": "CPU"
        },
        "phenom2_x4_955": {
            "name": "Phenom II X4 955 Black",
            "year": 2009,
            "cores": 4,
            "legendary": true,
            "type": "CPU"
        },
        "phenom2_x4_965": {
            "name": "Phenom II X4 965 Black",
            "year": 2009,
            "cores": 4,
            "clock": "3.4 GHz",
            "type": "CPU"
        },
        "phenom2_x3_720": {
            "name": "Phenom II X3 720 Black",
            "year": 2009,
            "cores": 3,
            "unlockable": true,
            "type": "CPU"
        }
    },
    "2010-2014": {
        "i7-5960x": {
            "name": "Intel Core i7-5960X",
            "type": "CPU",
            "architecture": "Haswell-E",
            "cores": 8,
            "threads": 16,
            "baseClock": "3.0 GHz",
            "boostClock": "3.5 GHz",
            "tdp": 140,
            "socket": "LGA 2011-3",
            "msrp": 999,
            "year": 2014,
            "performance": "First 8-core consumer. HEDT.",
            "goodFor": [
                "Workstation"
            ],
            "cooler": "240mm AIO"
        },
        "i7-4790k": {
            "name": "Intel Core i7-4790K",
            "type": "CPU",
            "architecture": "Haswell Refresh",
            "cores": 4,
            "threads": 8,
            "baseClock": "4.0 GHz",
            "boostClock": "4.4 GHz",
            "tdp": 88,
            "socket": "LGA 1150",
            "msrp": 339,
            "year": 2014,
            "performance": "Devils Canyon. Great overclocker.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "i7-4770k": {
            "name": "Intel Core i7-4770K",
            "type": "CPU",
            "architecture": "Haswell",
            "cores": 4,
            "threads": 8,
            "baseClock": "3.5 GHz",
            "boostClock": "3.9 GHz",
            "tdp": 84,
            "socket": "LGA 1150",
            "msrp": 339,
            "year": 2013,
            "performance": "First Haswell consumer.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "i5-4690k": {
            "name": "Intel Core i5-4690K",
            "type": "CPU",
            "architecture": "Haswell Refresh",
            "cores": 4,
            "threads": 4,
            "baseClock": "3.5 GHz",
            "boostClock": "3.9 GHz",
            "tdp": 88,
            "socket": "LGA 1150",
            "msrp": 242,
            "year": 2014,
            "performance": "Great gaming value.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "i7-3770k": {
            "name": "Intel Core i7-3770K",
            "type": "CPU",
            "architecture": "Ivy Bridge",
            "cores": 4,
            "threads": 8,
            "baseClock": "3.5 GHz",
            "boostClock": "3.9 GHz",
            "tdp": 77,
            "socket": "LGA 1155",
            "msrp": 332,
            "year": 2012,
            "performance": "Ivy Bridge. 22nm shrink.",
            "goodFor": [
                "Retro gaming"
            ],
            "cooler": "Tower cooler"
        },
        "i7-2600k": {
            "name": "Intel Core i7-2600K",
            "type": "CPU",
            "architecture": "Sandy Bridge",
            "cores": 4,
            "threads": 8,
            "baseClock": "3.4 GHz",
            "boostClock": "3.8 GHz",
            "tdp": 95,
            "socket": "LGA 1155",
            "msrp": 317,
            "year": 2011,
            "performance": "Legendary overclocker. Still works.",
            "goodFor": [
                "Basic use"
            ],
            "cooler": "Tower cooler"
        },
        "fx-8350": {
            "name": "AMD FX-8350",
            "type": "CPU",
            "architecture": "Piledriver",
            "cores": 8,
            "threads": 8,
            "baseClock": "4.0 GHz",
            "boostClock": "4.2 GHz",
            "tdp": 125,
            "socket": "AM3+",
            "msrp": 195,
            "year": 2012,
            "performance": "Budget 8-core. Weak single-thread.",
            "goodFor": [
                "Budget multi-threaded"
            ],
            "cooler": "Tower cooler"
        },
        "fx-8320": {
            "name": "AMD FX-8320",
            "type": "CPU",
            "architecture": "Piledriver",
            "cores": 8,
            "threads": 8,
            "baseClock": "3.5 GHz",
            "boostClock": "4.0 GHz",
            "tdp": 125,
            "socket": "AM3+",
            "msrp": 169,
            "year": 2012,
            "performance": "Budget option.",
            "goodFor": [
                "Budget builds"
            ],
            "cooler": "Tower cooler"
        },
        "fx-6300": {
            "name": "AMD FX-6300",
            "type": "CPU",
            "architecture": "Piledriver",
            "cores": 6,
            "threads": 6,
            "baseClock": "3.5 GHz",
            "boostClock": "4.1 GHz",
            "tdp": 95,
            "socket": "AM3+",
            "msrp": 132,
            "year": 2012,
            "performance": "Ultra budget.",
            "goodFor": [
                "Extreme budget"
            ],
            "cooler": "Stock included"
        }
    },
    "2015-2019": {
        "i9-9900k": {
            "name": "Intel Core i9-9900K",
            "type": "CPU",
            "architecture": "Coffee Lake Refresh",
            "cores": 8,
            "threads": 16,
            "baseClock": "3.6 GHz",
            "boostClock": "5.0 GHz",
            "tdp": 95,
            "socket": "LGA 1151",
            "msrp": 488,
            "year": 2018,
            "performance": "First mainstream i9. Great gaming.",
            "goodFor": [
                "Gaming",
                "Streaming"
            ],
            "cooler": "Tower or 240mm AIO"
        },
        "i7-9700k": {
            "name": "Intel Core i7-9700K",
            "type": "CPU",
            "architecture": "Coffee Lake Refresh",
            "cores": 8,
            "threads": 8,
            "baseClock": "3.6 GHz",
            "boostClock": "4.9 GHz",
            "tdp": 95,
            "socket": "LGA 1151",
            "msrp": 374,
            "year": 2018,
            "performance": "No hyperthreading but great gaming.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "i7-8700k": {
            "name": "Intel Core i7-8700K",
            "type": "CPU",
            "architecture": "Coffee Lake",
            "cores": 6,
            "threads": 12,
            "baseClock": "3.7 GHz",
            "boostClock": "4.7 GHz",
            "tdp": 95,
            "socket": "LGA 1151",
            "msrp": 359,
            "year": 2017,
            "performance": "First 6-core mainstream Intel.",
            "goodFor": [
                "Gaming",
                "Productivity"
            ],
            "cooler": "Tower cooler"
        },
        "i5-8600k": {
            "name": "Intel Core i5-8600K",
            "type": "CPU",
            "architecture": "Coffee Lake",
            "cores": 6,
            "threads": 6,
            "baseClock": "3.6 GHz",
            "boostClock": "4.3 GHz",
            "tdp": 95,
            "socket": "LGA 1151",
            "msrp": 257,
            "year": 2017,
            "performance": "First 6-core i5.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "i7-7700k": {
            "name": "Intel Core i7-7700K",
            "type": "CPU",
            "architecture": "Kaby Lake",
            "cores": 4,
            "threads": 8,
            "baseClock": "4.2 GHz",
            "boostClock": "4.5 GHz",
            "tdp": 91,
            "socket": "LGA 1151",
            "msrp": 339,
            "year": 2017,
            "performance": "Last quad-core flagship.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "i7-6700k": {
            "name": "Intel Core i7-6700K",
            "type": "CPU",
            "architecture": "Skylake",
            "cores": 4,
            "threads": 8,
            "baseClock": "4.0 GHz",
            "boostClock": "4.2 GHz",
            "tdp": 91,
            "socket": "LGA 1151",
            "msrp": 339,
            "year": 2015,
            "performance": "First Skylake.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "ryzen 9 3950x": {
            "name": "AMD Ryzen 9 3950X",
            "type": "CPU",
            "architecture": "Zen 2",
            "cores": 16,
            "threads": 32,
            "baseClock": "3.5 GHz",
            "boostClock": "4.7 GHz",
            "cache": "64MB L3",
            "socket": "AM4",
            "msrp": 749,
            "year": 2019,
            "performance": "First 16-core mainstream.",
            "goodFor": [
                "Content creation",
                "Workstation"
            ],
            "cooler": "280mm AIO"
        },
        "ryzen 9 3900x": {
            "name": "AMD Ryzen 9 3900X",
            "type": "CPU",
            "architecture": "Zen 2",
            "cores": 12,
            "threads": 24,
            "baseClock": "3.8 GHz",
            "boostClock": "4.6 GHz",
            "cache": "64MB L3",
            "socket": "AM4",
            "msrp": 499,
            "year": 2019,
            "performance": "Great multi-core value.",
            "goodFor": [
                "Content creation",
                "Gaming"
            ],
            "cooler": "240mm AIO"
        },
        "ryzen 7 3700x": {
            "name": "AMD Ryzen 7 3700X",
            "type": "CPU",
            "architecture": "Zen 2",
            "cores": 8,
            "threads": 16,
            "baseClock": "3.6 GHz",
            "boostClock": "4.4 GHz",
            "cache": "32MB L3",
            "socket": "AM4",
            "msrp": 329,
            "year": 2019,
            "performance": "Efficient 8-core.",
            "goodFor": [
                "Gaming",
                "Productivity"
            ],
            "cooler": "Stock included"
        },
        "ryzen 5 3600": {
            "name": "AMD Ryzen 5 3600",
            "type": "CPU",
            "architecture": "Zen 2",
            "cores": 6,
            "threads": 12,
            "baseClock": "3.6 GHz",
            "boostClock": "4.2 GHz",
            "cache": "32MB L3",
            "socket": "AM4",
            "msrp": 199,
            "year": 2019,
            "performance": "Legendary budget CPU.",
            "goodFor": [
                "Gaming",
                "Budget builds"
            ],
            "cooler": "Stock included"
        },
        "ryzen 7 2700x": {
            "name": "AMD Ryzen 7 2700X",
            "type": "CPU",
            "architecture": "Zen+",
            "cores": 8,
            "threads": 16,
            "baseClock": "3.7 GHz",
            "boostClock": "4.3 GHz",
            "cache": "16MB L3",
            "socket": "AM4",
            "msrp": 329,
            "year": 2018,
            "performance": "Great multi-core for the time.",
            "goodFor": [
                "Productivity",
                "Streaming"
            ],
            "cooler": "Stock included"
        },
        "ryzen 5 2600": {
            "name": "AMD Ryzen 5 2600",
            "type": "CPU",
            "architecture": "Zen+",
            "cores": 6,
            "threads": 12,
            "baseClock": "3.4 GHz",
            "boostClock": "3.9 GHz",
            "cache": "16MB L3",
            "socket": "AM4",
            "msrp": 199,
            "year": 2018,
            "performance": "Budget Zen+ CPU.",
            "goodFor": [
                "Gaming",
                "Budget builds"
            ],
            "cooler": "Stock included"
        },
        "ryzen 7 1700": {
            "name": "AMD Ryzen 7 1700",
            "type": "CPU",
            "architecture": "Zen",
            "cores": 8,
            "threads": 16,
            "baseClock": "3.0 GHz",
            "boostClock": "3.7 GHz",
            "cache": "16MB L3",
            "socket": "AM4",
            "msrp": 329,
            "year": 2017,
            "performance": "First gen Ryzen 7.",
            "goodFor": [
                "Productivity"
            ],
            "cooler": "Stock included"
        }
    },
    "2020-2024": {
        "i9-14900k": {
            "name": "Intel Core i9-14900K",
            "type": "CPU",
            "architecture": "Raptor Lake Refresh",
            "cores": 24,
            "threads": 32,
            "baseClock": "3.2 GHz",
            "boostClock": "6.0 GHz",
            "tdp": 125,
            "socket": "LGA 1700",
            "msrp": 589,
            "year": 2023,
            "performance": "Intel flagship. Best multi-threaded.",
            "goodFor": [
                "Content creation",
                "Streaming"
            ],
            "cooler": "360mm AIO"
        },
        "i7-14700k": {
            "name": "Intel Core i7-14700K",
            "type": "CPU",
            "architecture": "Raptor Lake Refresh",
            "cores": 20,
            "threads": 28,
            "baseClock": "3.4 GHz",
            "boostClock": "5.6 GHz",
            "tdp": 125,
            "socket": "LGA 1700",
            "msrp": 409,
            "year": 2023,
            "performance": "Excellent productivity + gaming.",
            "goodFor": [
                "Content creation",
                "Gaming"
            ],
            "cooler": "280mm AIO"
        },
        "i5-14600k": {
            "name": "Intel Core i5-14600K",
            "type": "CPU",
            "architecture": "Raptor Lake Refresh",
            "cores": 14,
            "threads": 20,
            "baseClock": "3.5 GHz",
            "boostClock": "5.3 GHz",
            "tdp": 125,
            "socket": "LGA 1700",
            "msrp": 319,
            "year": 2023,
            "performance": "Best value Intel gaming CPU.",
            "goodFor": [
                "Gaming",
                "Streaming"
            ],
            "cooler": "Tower cooler"
        },
        "i5-13400f": {
            "name": "Intel Core i5-13400F",
            "type": "CPU",
            "architecture": "Raptor Lake",
            "cores": 10,
            "threads": 16,
            "baseClock": "2.5 GHz",
            "boostClock": "4.6 GHz",
            "tdp": 65,
            "socket": "LGA 1700",
            "msrp": 199,
            "year": 2023,
            "performance": "Budget gaming king.",
            "goodFor": [
                "Gaming",
                "Budget builds"
            ],
            "cooler": "Stock or tower"
        },
        "i3-12100f": {
            "name": "Intel Core i3-12100F",
            "type": "CPU",
            "architecture": "Alder Lake",
            "cores": 4,
            "threads": 8,
            "baseClock": "3.3 GHz",
            "boostClock": "4.3 GHz",
            "tdp": 58,
            "socket": "LGA 1700",
            "msrp": 99,
            "year": 2022,
            "performance": "Incredible budget value.",
            "goodFor": [
                "Budget gaming",
                "Esports"
            ],
            "cooler": "Stock included"
        },
        "ryzen 9 7950x3d": {
            "name": "AMD Ryzen 9 7950X3D",
            "type": "CPU",
            "architecture": "Zen 4 + 3D V-Cache",
            "cores": 16,
            "threads": 32,
            "baseClock": "4.2 GHz",
            "boostClock": "5.7 GHz",
            "cache": "128MB L3",
            "socket": "AM5",
            "msrp": 699,
            "year": 2023,
            "performance": "Best of both worlds: gaming + productivity.",
            "goodFor": [
                "Gaming",
                "Content creation"
            ],
            "cooler": "280mm AIO"
        },
        "ryzen 9 7950x": {
            "name": "AMD Ryzen 9 7950X",
            "type": "CPU",
            "architecture": "Zen 4",
            "cores": 16,
            "threads": 32,
            "baseClock": "4.5 GHz",
            "boostClock": "5.7 GHz",
            "cache": "64MB L3",
            "socket": "AM5",
            "msrp": 549,
            "year": 2022,
            "performance": "AMD flagship. Massive multi-threaded power.",
            "goodFor": [
                "Content creation",
                "3D rendering"
            ],
            "cooler": "360mm AIO"
        },
        "ryzen 7 7800x3d": {
            "name": "AMD Ryzen 7 7800X3D",
            "type": "CPU",
            "architecture": "Zen 4 + 3D V-Cache",
            "cores": 8,
            "threads": 16,
            "baseClock": "4.2 GHz",
            "boostClock": "5.0 GHz",
            "cache": "96MB L3 (3D V-Cache)",
            "socket": "AM5",
            "msrp": 449,
            "year": 2023,
            "performance": "THE BEST gaming CPU. 3D V-Cache gives 10-20% extra FPS.",
            "goodFor": [
                "Gaming (absolute best)"
            ],
            "cooler": "Tower cooler"
        },
        "ryzen 7 7700x": {
            "name": "AMD Ryzen 7 7700X",
            "type": "CPU",
            "architecture": "Zen 4",
            "cores": 8,
            "threads": 16,
            "baseClock": "4.5 GHz",
            "boostClock": "5.4 GHz",
            "cache": "32MB L3",
            "socket": "AM5",
            "msrp": 349,
            "year": 2022,
            "performance": "Great all-around CPU.",
            "goodFor": [
                "Gaming",
                "Productivity"
            ],
            "cooler": "Tower cooler"
        },
        "ryzen 5 7600x": {
            "name": "AMD Ryzen 5 7600X",
            "type": "CPU",
            "architecture": "Zen 4",
            "cores": 6,
            "threads": 12,
            "baseClock": "4.7 GHz",
            "boostClock": "5.3 GHz",
            "cache": "32MB L3",
            "socket": "AM5",
            "msrp": 249,
            "year": 2022,
            "performance": "Great gaming CPU.",
            "goodFor": [
                "Gaming"
            ],
            "cooler": "Tower cooler"
        },
        "ryzen 5 7600": {
            "name": "AMD Ryzen 5 7600",
            "type": "CPU",
            "architecture": "Zen 4",
            "cores": 6,
            "threads": 12,
            "baseClock": "3.8 GHz",
            "boostClock": "5.1 GHz",
            "cache": "32MB L3",
            "socket": "AM5",
            "msrp": 199,
            "year": 2023,
            "performance": "Best value AM5 CPU. Comes with cooler.",
            "goodFor": [
                "Gaming",
                "Budget builds"
            ],
            "cooler": "Stock included"
        },
        "ryzen 9 5950x": {
            "name": "AMD Ryzen 9 5950X",
            "type": "CPU",
            "architecture": "Zen 3",
            "cores": 16,
            "threads": 32,
            "baseClock": "3.4 GHz",
            "boostClock": "4.9 GHz",
            "cache": "64MB L3",
            "socket": "AM4",
            "msrp": 549,
            "year": 2020,
            "performance": "Top AM4 CPU.",
            "goodFor": [
                "Content creation",
                "Workstation"
            ],
            "cooler": "360mm AIO"
        },
        "ryzen 7 5800x3d": {
            "name": "AMD Ryzen 7 5800X3D",
            "type": "CPU",
            "architecture": "Zen 3 + 3D V-Cache",
            "cores": 8,
            "threads": 16,
            "baseClock": "3.4 GHz",
            "boostClock": "4.5 GHz",
            "cache": "96MB L3",
            "socket": "AM4",
            "msrp": 329,
            "year": 2022,
            "performance": "Best gaming CPU for AM4.",
            "goodFor": [
                "Gaming",
                "AM4 upgrades"
            ],
            "cooler": "Tower cooler"
        },
        "ryzen 5 5600x": {
            "name": "AMD Ryzen 5 5600X",
            "type": "CPU",
            "architecture": "Zen 3",
            "cores": 6,
            "threads": 12,
            "baseClock": "3.7 GHz",
            "boostClock": "4.6 GHz",
            "cache": "32MB L3",
            "socket": "AM4",
            "msrp": 199,
            "year": 2020,
            "performance": "Legendary value CPU.",
            "goodFor": [
                "Gaming",
                "Budget builds"
            ],
            "cooler": "Stock included"
        },
        "ryzen 5 5600": {
            "name": "AMD Ryzen 5 5600",
            "type": "CPU",
            "architecture": "Zen 3",
            "cores": 6,
            "threads": 12,
            "baseClock": "3.5 GHz",
            "boostClock": "4.4 GHz",
            "cache": "32MB L3",
            "socket": "AM4",
            "msrp": 129,
            "year": 2022,
            "performance": "Best budget CPU. AM4 is cheap.",
            "goodFor": [
                "Budget gaming"
            ],
            "cooler": "Stock included"
        },
        "core ultra 9 285k": {
            "name": "Intel Core Ultra 9 285K",
            "type": "CPU",
            "architecture": "Arrow Lake",
            "cores": 24,
            "threads": 24,
            "baseClock": "3.7 GHz",
            "boostClock": "5.7 GHz",
            "cache": "36MB L3",
            "tdp": 125,
            "socket": "LGA 1851",
            "msrp": 589,
            "year": 2024,
            "performance": "Best Intel single-thread. Great for gaming.",
            "goodFor": [
                "Gaming",
                "Productivity"
            ],
            "cooler": "360mm AIO recommended",
            "notes": "No hyperthreading on P-cores. New LGA 1851 socket."
        },
        "core ultra 7 265k": {
            "name": "Intel Core Ultra 7 265K",
            "type": "CPU",
            "architecture": "Arrow Lake",
            "cores": 20,
            "threads": 20,
            "baseClock": "3.9 GHz",
            "boostClock": "5.5 GHz",
            "cache": "30MB L3",
            "tdp": 125,
            "socket": "LGA 1851",
            "msrp": 394,
            "year": 2024,
            "performance": "Sweet spot for gaming and content creation.",
            "goodFor": [
                "Gaming",
                "Streaming",
                "Productivity"
            ],
            "cooler": "280mm AIO",
            "notes": "Great balance of price and performance."
        },
        "core ultra 5 245k": {
            "name": "Intel Core Ultra 5 245K",
            "type": "CPU",
            "architecture": "Arrow Lake",
            "cores": 14,
            "threads": 14,
            "baseClock": "4.2 GHz",
            "boostClock": "5.2 GHz",
            "cache": "24MB L3",
            "tdp": 125,
            "socket": "LGA 1851",
            "msrp": 309,
            "year": 2024,
            "performance": "Budget Arrow Lake. Great gaming value.",
            "goodFor": [
                "Gaming",
                "Light productivity"
            ],
            "cooler": "Tower cooler",
            "notes": "Entry point to Arrow Lake platform."
        },
        "ryzen 9 9950x": {
            "name": "AMD Ryzen 9 9950X",
            "type": "CPU",
            "architecture": "Zen 5",
            "cores": 16,
            "threads": 32,
            "baseClock": "4.3 GHz",
            "boostClock": "5.7 GHz",
            "cache": "64MB L3",
            "tdp": 170,
            "socket": "AM5",
            "msrp": 649,
            "year": 2024,
            "performance": "Multi-threaded king. Best for productivity.",
            "goodFor": [
                "Content creation",
                "Streaming",
                "Workstation"
            ],
            "cooler": "360mm AIO",
            "notes": "Up to 16% IPC improvement over Zen 4."
        },
        "ryzen 9 9900x": {
            "name": "AMD Ryzen 9 9900X",
            "type": "CPU",
            "architecture": "Zen 5",
            "cores": 12,
            "threads": 24,
            "baseClock": "4.4 GHz",
            "boostClock": "5.6 GHz",
            "cache": "64MB L3",
            "tdp": 120,
            "socket": "AM5",
            "msrp": 499,
            "year": 2024,
            "performance": "Great all-arounder. Lower TDP than 9950X.",
            "goodFor": [
                "Gaming",
                "Content creation"
            ],
            "cooler": "280mm AIO",
            "notes": "Sweet spot for AM5 platform."
        },
        "ryzen 7 9700x": {
            "name": "AMD Ryzen 7 9700X",
            "type": "CPU",
            "architecture": "Zen 5",
            "cores": 8,
            "threads": 16,
            "baseClock": "3.8 GHz",
            "boostClock": "5.5 GHz",
            "cache": "32MB L3",
            "tdp": 65,
            "socket": "AM5",
            "msrp": 359,
            "year": 2024,
            "performance": "Efficient gamer. Great perf/watt.",
            "goodFor": [
                "Gaming",
                "General use"
            ],
            "cooler": "Tower cooler",
            "notes": "Only 65W TDP - very efficient."
        },
        "ryzen 5 9600x": {
            "name": "AMD Ryzen 5 9600X",
            "type": "CPU",
            "architecture": "Zen 5",
            "cores": 6,
            "threads": 12,
            "baseClock": "3.9 GHz",
            "boostClock": "5.4 GHz",
            "cache": "32MB L3",
            "tdp": 65,
            "socket": "AM5",
            "msrp": 279,
            "year": 2024,
            "performance": "Budget Zen 5. Beats 7600X.",
            "goodFor": [
                "Gaming",
                "Budget builds"
            ],
            "cooler": "Stock included",
            "notes": "Entry point to Zen 5. Great value."
        },
        "ryzen 7 9800x3d": {
            "name": "AMD Ryzen 7 9800X3D",
            "type": "CPU",
            "architecture": "Zen 5 + 3D V-Cache",
            "cores": 8,
            "threads": 16,
            "baseClock": "4.2 GHz",
            "boostClock": "5.2 GHz",
            "cache": "96MB L3",
            "tdp": 120,
            "socket": "AM5",
            "msrp": 479,
            "year": 2024,
            "performance": "Best gaming CPU period. 3D V-Cache is amazing.",
            "goodFor": [
                "Gaming",
                "High refresh rate"
            ],
            "cooler": "280mm AIO",
            "notes": "The gaming king. Worth every penny for gaming-focused builds."
        }
    }
};

export const CPU_CUSTOM_PARTS = {};

export const CPU_PARTS = {
    ...CPU_BY_ERA['2000-2009'],
    ...CPU_BY_ERA['2010-2014'],
    ...CPU_BY_ERA['2015-2019'],
    ...CPU_BY_ERA['2020-2024'],
    ...CPU_BY_ERA['2025'],
    ...CPU_CUSTOM_PARTS,
};

export default {
    CPU_BY_ERA,
    CPU_PARTS,
};
