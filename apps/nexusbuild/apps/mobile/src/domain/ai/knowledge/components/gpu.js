/**
 * GPU components (2000-2025).
 * Split by era for quick filtering.
 */

export const GPU_BY_ERA = {
    "2025": {
        "rtx 5090": {
            "name": "NVIDIA GeForce RTX 5090",
            "type": "GPU",
            "architecture": "Blackwell",
            "vram": "32GB GDDR7",
            "cudaCores": 21760,
            "tdp": 575,
            "msrp": 1999,
            "year": 2025,
            "performance": "Flagship. 2x 4090 performance in some titles. Insane power draw.",
            "goodFor": [
                "8K gaming",
                "4K 240Hz",
                "AI/ML workloads",
                "Content creation"
            ],
            "psu": "1000W+",
            "notes": "Requires 600W 16-pin connector. Triple-slot cooler."
        },
        "rtx 5080": {
            "name": "NVIDIA GeForce RTX 5080",
            "type": "GPU",
            "architecture": "Blackwell",
            "vram": "16GB GDDR7",
            "cudaCores": 10752,
            "tdp": 360,
            "msrp": 999,
            "year": 2025,
            "performance": "Better than 4090 at lower power. Sweet spot for 4K.",
            "goodFor": [
                "4K gaming",
                "1440p 240Hz",
                "Streaming"
            ],
            "psu": "850W",
            "notes": "Best price/performance flagship tier."
        },
        "rtx 5070 ti": {
            "name": "NVIDIA GeForce RTX 5070 Ti",
            "type": "GPU",
            "architecture": "Blackwell",
            "vram": "16GB GDDR7",
            "cudaCores": 8960,
            "tdp": 300,
            "msrp": 749,
            "year": 2025,
            "performance": "Matches RTX 4090 in many games. Great value.",
            "goodFor": [
                "4K gaming",
                "1440p high refresh"
            ],
            "psu": "750W",
            "notes": "The new 1440p/4K sweet spot."
        },
        "rtx 5070": {
            "name": "NVIDIA GeForce RTX 5070",
            "type": "GPU",
            "architecture": "Blackwell",
            "vram": "12GB GDDR7",
            "cudaCores": 6144,
            "tdp": 220,
            "msrp": 549,
            "year": 2025,
            "performance": "RTX 4080 equivalent performance. Excellent 1440p.",
            "goodFor": [
                "1440p gaming",
                "Streaming",
                "Entry 4K"
            ],
            "psu": "650W",
            "notes": "Best mainstream option for 2025."
        },
        "rx 9800 xt": {
            "name": "AMD Radeon RX 9800 XT",
            "type": "GPU",
            "architecture": "RDNA 4",
            "vram": "20GB GDDR6",
            "streamProcessors": 7680,
            "tdp": 350,
            "msrp": 649,
            "year": 2025,
            "performance": "Competes with RTX 5070 Ti. Great ray tracing improvement.",
            "goodFor": [
                "1440p gaming",
                "4K gaming",
                "Productivity"
            ],
            "psu": "750W",
            "notes": "Major RT improvement over RDNA 3."
        },
        "rx 9700 xt": {
            "name": "AMD Radeon RX 9700 XT",
            "type": "GPU",
            "architecture": "RDNA 4",
            "vram": "16GB GDDR6",
            "streamProcessors": 5120,
            "tdp": 250,
            "msrp": 449,
            "year": 2025,
            "performance": "Strong 1440p card. Beats RX 7900 XT.",
            "goodFor": [
                "1440p gaming",
                "Budget 4K"
            ],
            "psu": "650W",
            "notes": "Best AMD value pick for 2025."
        },
        "rx 9600 xt": {
            "name": "AMD Radeon RX 9600 XT",
            "type": "GPU",
            "architecture": "RDNA 4",
            "vram": "12GB GDDR6",
            "streamProcessors": 3584,
            "tdp": 180,
            "msrp": 299,
            "year": 2025,
            "performance": "Budget 1080p/1440p champion.",
            "goodFor": [
                "1080p gaming",
                "Entry 1440p"
            ],
            "psu": "550W",
            "notes": "Great for budget builds."
        }
    },
    "2000-2009": {
        "gf2_mx200": {
            "name": "GeForce 2 MX 200",
            "year": 2000,
            "vram": "32MB",
            "bus": "AGP",
            "type": "GPU"
        },
        "gf2_mx400": {
            "name": "GeForce 2 MX 400",
            "year": 2000,
            "vram": "64MB",
            "type": "GPU"
        },
        "gf2_gts": {
            "name": "GeForce 2 GTS",
            "year": 2000,
            "vram": "32MB",
            "type": "GPU"
        },
        "gf2_ultra": {
            "name": "GeForce 2 Ultra",
            "year": 2000,
            "vram": "64MB DDR",
            "flagship": true,
            "type": "GPU"
        },
        "gf2_ti": {
            "name": "GeForce 2 Ti",
            "year": 2001,
            "vram": "64MB",
            "type": "GPU"
        },
        "gf3": {
            "name": "GeForce 3",
            "year": 2001,
            "vram": "64MB DDR",
            "firstDX8": true,
            "type": "GPU"
        },
        "gf3_ti200": {
            "name": "GeForce 3 Ti 200",
            "year": 2001,
            "vram": "64MB",
            "type": "GPU"
        },
        "gf3_ti500": {
            "name": "GeForce 3 Ti 500",
            "year": 2001,
            "vram": "64MB",
            "flagship": true,
            "type": "GPU"
        },
        "gf4_mx420": {
            "name": "GeForce 4 MX 420",
            "year": 2002,
            "vram": "64MB",
            "budget": true,
            "type": "GPU"
        },
        "gf4_mx440": {
            "name": "GeForce 4 MX 440",
            "year": 2002,
            "vram": "64MB",
            "popular": true,
            "type": "GPU"
        },
        "gf4_mx460": {
            "name": "GeForce 4 MX 460",
            "year": 2002,
            "vram": "64MB",
            "type": "GPU"
        },
        "gf4_ti4200": {
            "name": "GeForce 4 Ti 4200",
            "year": 2002,
            "vram": "128MB",
            "legendary": true,
            "type": "GPU"
        },
        "gf4_ti4400": {
            "name": "GeForce 4 Ti 4400",
            "year": 2002,
            "vram": "128MB",
            "type": "GPU"
        },
        "gf4_ti4600": {
            "name": "GeForce 4 Ti 4600",
            "year": 2002,
            "vram": "128MB",
            "flagship": true,
            "type": "GPU"
        },
        "gf4_ti4800": {
            "name": "GeForce 4 Ti 4800",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "fx_5200": {
            "name": "GeForce FX 5200",
            "year": 2003,
            "vram": "128MB",
            "budget": true,
            "type": "GPU"
        },
        "fx_5500": {
            "name": "GeForce FX 5500",
            "year": 2004,
            "vram": "256MB",
            "type": "GPU"
        },
        "fx_5600": {
            "name": "GeForce FX 5600",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "fx_5600_ultra": {
            "name": "GeForce FX 5600 Ultra",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "fx_5700": {
            "name": "GeForce FX 5700",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "fx_5700_ultra": {
            "name": "GeForce FX 5700 Ultra",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "fx_5800": {
            "name": "GeForce FX 5800",
            "year": 2003,
            "vram": "128MB",
            "hot": true,
            "type": "GPU"
        },
        "fx_5800_ultra": {
            "name": "GeForce FX 5800 Ultra",
            "year": 2003,
            "vram": "128MB",
            "dustbuster": true,
            "type": "GPU"
        },
        "fx_5900": {
            "name": "GeForce FX 5900",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "fx_5900_ultra": {
            "name": "GeForce FX 5900 Ultra",
            "year": 2003,
            "vram": "256MB",
            "type": "GPU"
        },
        "fx_5950_ultra": {
            "name": "GeForce FX 5950 Ultra",
            "year": 2003,
            "vram": "256MB",
            "flagship": true,
            "type": "GPU"
        },
        "gf6200": {
            "name": "GeForce 6200",
            "year": 2004,
            "vram": "128MB",
            "budget": true,
            "type": "GPU"
        },
        "gf6500": {
            "name": "GeForce 6500",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf6600": {
            "name": "GeForce 6600",
            "year": 2004,
            "vram": "128MB",
            "type": "GPU"
        },
        "gf6600_gt": {
            "name": "GeForce 6600 GT",
            "year": 2004,
            "vram": "128MB",
            "legendary": true,
            "type": "GPU"
        },
        "gf6800": {
            "name": "GeForce 6800",
            "year": 2004,
            "vram": "128MB",
            "type": "GPU"
        },
        "gf6800_gt": {
            "name": "GeForce 6800 GT",
            "year": 2004,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf6800_ultra": {
            "name": "GeForce 6800 Ultra",
            "year": 2004,
            "vram": "256MB",
            "flagship": true,
            "type": "GPU"
        },
        "gf7300_gt": {
            "name": "GeForce 7300 GT",
            "year": 2006,
            "vram": "256MB",
            "budget": true,
            "type": "GPU"
        },
        "gf7600_gs": {
            "name": "GeForce 7600 GS",
            "year": 2006,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf7600_gt": {
            "name": "GeForce 7600 GT",
            "year": 2006,
            "vram": "256MB",
            "legendary": true,
            "type": "GPU"
        },
        "gf7800_gs": {
            "name": "GeForce 7800 GS",
            "year": 2006,
            "vram": "256MB",
            "agpLast": true,
            "type": "GPU"
        },
        "gf7800_gt": {
            "name": "GeForce 7800 GT",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf7800_gtx": {
            "name": "GeForce 7800 GTX",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf7800_gtx512": {
            "name": "GeForce 7800 GTX 512",
            "year": 2005,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf7900_gs": {
            "name": "GeForce 7900 GS",
            "year": 2006,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf7900_gt": {
            "name": "GeForce 7900 GT",
            "year": 2006,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf7900_gtx": {
            "name": "GeForce 7900 GTX",
            "year": 2006,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf7950_gt": {
            "name": "GeForce 7950 GT",
            "year": 2006,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf7950_gx2": {
            "name": "GeForce 7950 GX2",
            "year": 2006,
            "vram": "1GB",
            "dualGPU": true,
            "type": "GPU"
        },
        "gf8400_gs": {
            "name": "GeForce 8400 GS",
            "year": 2007,
            "vram": "256MB",
            "budget": true,
            "type": "GPU"
        },
        "gf8500_gt": {
            "name": "GeForce 8500 GT",
            "year": 2007,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf8600_gs": {
            "name": "GeForce 8600 GS",
            "year": 2007,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf8600_gt": {
            "name": "GeForce 8600 GT",
            "year": 2007,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf8600_gts": {
            "name": "GeForce 8600 GTS",
            "year": 2007,
            "vram": "256MB",
            "type": "GPU"
        },
        "gf8800_gs": {
            "name": "GeForce 8800 GS",
            "year": 2008,
            "vram": "384MB",
            "type": "GPU"
        },
        "gf8800_gt": {
            "name": "GeForce 8800 GT",
            "year": 2007,
            "vram": "512MB",
            "legendary": true,
            "type": "GPU"
        },
        "gf8800_gts": {
            "name": "GeForce 8800 GTS",
            "year": 2006,
            "vram": "640MB",
            "type": "GPU"
        },
        "gf8800_gts_512": {
            "name": "GeForce 8800 GTS 512",
            "year": 2007,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf8800_gtx": {
            "name": "GeForce 8800 GTX",
            "year": 2006,
            "vram": "768MB",
            "firstDX10": true,
            "type": "GPU"
        },
        "gf8800_ultra": {
            "name": "GeForce 8800 Ultra",
            "year": 2007,
            "vram": "768MB",
            "flagship": true,
            "type": "GPU"
        },
        "gf9400_gt": {
            "name": "GeForce 9400 GT",
            "year": 2008,
            "vram": "512MB",
            "budget": true,
            "type": "GPU"
        },
        "gf9500_gt": {
            "name": "GeForce 9500 GT",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf9600_gs": {
            "name": "GeForce 9600 GS",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf9600_gso": {
            "name": "GeForce 9600 GSO",
            "year": 2008,
            "vram": "384MB",
            "type": "GPU"
        },
        "gf9600_gt": {
            "name": "GeForce 9600 GT",
            "year": 2008,
            "vram": "512MB",
            "popular": true,
            "type": "GPU"
        },
        "gf9800_gt": {
            "name": "GeForce 9800 GT",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf9800_gtx": {
            "name": "GeForce 9800 GTX",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf9800_gtx_plus": {
            "name": "GeForce 9800 GTX+",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "gf9800_gx2": {
            "name": "GeForce 9800 GX2",
            "year": 2008,
            "vram": "1GB",
            "dualGPU": true,
            "type": "GPU"
        },
        "gtx260": {
            "name": "GeForce GTX 260",
            "year": 2008,
            "vram": "896MB",
            "type": "GPU"
        },
        "gtx275": {
            "name": "GeForce GTX 275",
            "year": 2009,
            "vram": "896MB",
            "type": "GPU"
        },
        "gtx280": {
            "name": "GeForce GTX 280",
            "year": 2008,
            "vram": "1GB",
            "flagship": true,
            "type": "GPU"
        },
        "gtx285": {
            "name": "GeForce GTX 285",
            "year": 2009,
            "vram": "1GB",
            "type": "GPU"
        },
        "gtx295": {
            "name": "GeForce GTX 295",
            "year": 2009,
            "vram": "1792MB",
            "dualGPU": true,
            "type": "GPU"
        },
        "r7000": {
            "name": "Radeon 7000",
            "year": 2001,
            "vram": "64MB",
            "bus": "AGP",
            "type": "GPU"
        },
        "r7200": {
            "name": "Radeon 7200",
            "year": 2000,
            "vram": "32MB DDR",
            "type": "GPU"
        },
        "r7500": {
            "name": "Radeon 7500",
            "year": 2001,
            "vram": "64MB",
            "type": "GPU"
        },
        "r8500": {
            "name": "Radeon 8500",
            "year": 2001,
            "vram": "64MB DDR",
            "type": "GPU"
        },
        "r8500_le": {
            "name": "Radeon 8500 LE",
            "year": 2002,
            "vram": "64MB",
            "type": "GPU"
        },
        "r9000": {
            "name": "Radeon 9000",
            "year": 2002,
            "vram": "64MB",
            "type": "GPU"
        },
        "r9000_pro": {
            "name": "Radeon 9000 Pro",
            "year": 2002,
            "vram": "64MB",
            "type": "GPU"
        },
        "r9100": {
            "name": "Radeon 9100",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "r9200": {
            "name": "Radeon 9200",
            "year": 2003,
            "vram": "128MB",
            "budget": true,
            "type": "GPU"
        },
        "r9500": {
            "name": "Radeon 9500",
            "year": 2002,
            "vram": "64MB",
            "unlockable": true,
            "type": "GPU"
        },
        "r9500_pro": {
            "name": "Radeon 9500 Pro",
            "year": 2002,
            "vram": "128MB",
            "type": "GPU"
        },
        "r9600": {
            "name": "Radeon 9600",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "r9600_pro": {
            "name": "Radeon 9600 Pro",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "r9600_xt": {
            "name": "Radeon 9600 XT",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "r9700": {
            "name": "Radeon 9700",
            "year": 2002,
            "vram": "128MB",
            "type": "GPU"
        },
        "r9700_pro": {
            "name": "Radeon 9700 Pro",
            "year": 2002,
            "vram": "128MB",
            "legendary": true,
            "type": "GPU"
        },
        "r9800": {
            "name": "Radeon 9800",
            "year": 2003,
            "vram": "128MB",
            "type": "GPU"
        },
        "r9800_pro": {
            "name": "Radeon 9800 Pro",
            "year": 2003,
            "vram": "128MB",
            "legendary": true,
            "type": "GPU"
        },
        "r9800_xt": {
            "name": "Radeon 9800 XT",
            "year": 2003,
            "vram": "256MB",
            "flagship": true,
            "type": "GPU"
        },
        "x300": {
            "name": "Radeon X300",
            "year": 2004,
            "vram": "128MB",
            "budget": true,
            "type": "GPU"
        },
        "x550": {
            "name": "Radeon X550",
            "year": 2005,
            "vram": "128MB",
            "type": "GPU"
        },
        "x600": {
            "name": "Radeon X600",
            "year": 2004,
            "vram": "128MB",
            "type": "GPU"
        },
        "x600_xt": {
            "name": "Radeon X600 XT",
            "year": 2004,
            "vram": "128MB",
            "type": "GPU"
        },
        "x700": {
            "name": "Radeon X700",
            "year": 2004,
            "vram": "128MB",
            "type": "GPU"
        },
        "x700_pro": {
            "name": "Radeon X700 Pro",
            "year": 2004,
            "vram": "256MB",
            "type": "GPU"
        },
        "x800": {
            "name": "Radeon X800",
            "year": 2004,
            "vram": "256MB",
            "type": "GPU"
        },
        "x800_pro": {
            "name": "Radeon X800 Pro",
            "year": 2004,
            "vram": "256MB",
            "type": "GPU"
        },
        "x800_xl": {
            "name": "Radeon X800 XL",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "x800_xt": {
            "name": "Radeon X800 XT",
            "year": 2004,
            "vram": "256MB",
            "type": "GPU"
        },
        "x800_xt_pe": {
            "name": "Radeon X800 XT Platinum",
            "year": 2004,
            "vram": "256MB",
            "flagship": true,
            "type": "GPU"
        },
        "x850_xt": {
            "name": "Radeon X850 XT",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "x850_xt_pe": {
            "name": "Radeon X850 XT PE",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "x1300": {
            "name": "Radeon X1300",
            "year": 2005,
            "vram": "256MB",
            "budget": true,
            "type": "GPU"
        },
        "x1600_pro": {
            "name": "Radeon X1600 Pro",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "x1600_xt": {
            "name": "Radeon X1600 XT",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "x1800_xl": {
            "name": "Radeon X1800 XL",
            "year": 2005,
            "vram": "256MB",
            "type": "GPU"
        },
        "x1800_xt": {
            "name": "Radeon X1800 XT",
            "year": 2005,
            "vram": "512MB",
            "type": "GPU"
        },
        "x1900_gt": {
            "name": "Radeon X1900 GT",
            "year": 2006,
            "vram": "256MB",
            "type": "GPU"
        },
        "x1900_xt": {
            "name": "Radeon X1900 XT",
            "year": 2006,
            "vram": "512MB",
            "type": "GPU"
        },
        "x1900_xtx": {
            "name": "Radeon X1900 XTX",
            "year": 2006,
            "vram": "512MB",
            "flagship": true,
            "type": "GPU"
        },
        "x1950_pro": {
            "name": "Radeon X1950 Pro",
            "year": 2006,
            "vram": "256MB",
            "type": "GPU"
        },
        "x1950_xt": {
            "name": "Radeon X1950 XT",
            "year": 2006,
            "vram": "256MB",
            "type": "GPU"
        },
        "x1950_xtx": {
            "name": "Radeon X1950 XTX",
            "year": 2006,
            "vram": "512MB",
            "type": "GPU"
        },
        "hd2400_pro": {
            "name": "Radeon HD 2400 Pro",
            "year": 2007,
            "vram": "256MB",
            "budget": true,
            "type": "GPU"
        },
        "hd2600_pro": {
            "name": "Radeon HD 2600 Pro",
            "year": 2007,
            "vram": "256MB",
            "type": "GPU"
        },
        "hd2600_xt": {
            "name": "Radeon HD 2600 XT",
            "year": 2007,
            "vram": "256MB",
            "type": "GPU"
        },
        "hd2900_pro": {
            "name": "Radeon HD 2900 Pro",
            "year": 2007,
            "vram": "512MB",
            "type": "GPU"
        },
        "hd2900_xt": {
            "name": "Radeon HD 2900 XT",
            "year": 2007,
            "vram": "512MB",
            "type": "GPU"
        },
        "hd3450": {
            "name": "Radeon HD 3450",
            "year": 2008,
            "vram": "256MB",
            "budget": true,
            "type": "GPU"
        },
        "hd3650": {
            "name": "Radeon HD 3650",
            "year": 2008,
            "vram": "256MB",
            "type": "GPU"
        },
        "hd3850": {
            "name": "Radeon HD 3850",
            "year": 2007,
            "vram": "256MB",
            "value": true,
            "type": "GPU"
        },
        "hd3870": {
            "name": "Radeon HD 3870",
            "year": 2007,
            "vram": "512MB",
            "type": "GPU"
        },
        "hd3870_x2": {
            "name": "Radeon HD 3870 X2",
            "year": 2008,
            "vram": "1GB",
            "dualGPU": true,
            "type": "GPU"
        },
        "hd4350": {
            "name": "Radeon HD 4350",
            "year": 2008,
            "vram": "256MB",
            "budget": true,
            "type": "GPU"
        },
        "hd4550": {
            "name": "Radeon HD 4550",
            "year": 2008,
            "vram": "256MB",
            "type": "GPU"
        },
        "hd4650": {
            "name": "Radeon HD 4650",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "hd4670": {
            "name": "Radeon HD 4670",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "hd4770": {
            "name": "Radeon HD 4770",
            "year": 2009,
            "vram": "512MB",
            "first40nm": true,
            "type": "GPU"
        },
        "hd4830": {
            "name": "Radeon HD 4830",
            "year": 2008,
            "vram": "512MB",
            "type": "GPU"
        },
        "hd4850": {
            "name": "Radeon HD 4850",
            "year": 2008,
            "vram": "512MB",
            "legendary": true,
            "type": "GPU"
        },
        "hd4870": {
            "name": "Radeon HD 4870",
            "year": 2008,
            "vram": "512MB",
            "flagship": true,
            "type": "GPU"
        },
        "hd4870_x2": {
            "name": "Radeon HD 4870 X2",
            "year": 2008,
            "vram": "2GB",
            "dualGPU": true,
            "type": "GPU"
        },
        "hd4890": {
            "name": "Radeon HD 4890",
            "year": 2009,
            "vram": "1GB",
            "type": "GPU"
        }
    },
    "2010-2014": {
        "gtx 980": {
            "name": "NVIDIA GeForce GTX 980",
            "type": "GPU",
            "architecture": "Maxwell",
            "vram": "4GB GDDR5",
            "cudaCores": 2048,
            "tdp": 165,
            "msrp": 549,
            "year": 2014,
            "performance": "First Maxwell. Very efficient.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "500W"
        },
        "gtx 970": {
            "name": "NVIDIA GeForce GTX 970",
            "type": "GPU",
            "architecture": "Maxwell",
            "vram": "4GB GDDR5 (3.5GB effective)",
            "cudaCores": 1664,
            "tdp": 145,
            "msrp": 329,
            "year": 2014,
            "performance": "3.5GB controversy but good value.",
            "goodFor": [
                "1080p Medium"
            ],
            "psu": "450W"
        },
        "gtx 780 ti": {
            "name": "NVIDIA GeForce GTX 780 Ti",
            "type": "GPU",
            "architecture": "Kepler",
            "vram": "3GB GDDR5",
            "cudaCores": 2880,
            "tdp": 250,
            "msrp": 699,
            "year": 2013,
            "performance": "Top Kepler card.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "600W"
        },
        "gtx 780": {
            "name": "NVIDIA GeForce GTX 780",
            "type": "GPU",
            "architecture": "Kepler",
            "vram": "3GB GDDR5",
            "cudaCores": 2304,
            "tdp": 250,
            "msrp": 649,
            "year": 2013,
            "performance": "High-end Kepler.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "600W"
        },
        "gtx 770": {
            "name": "NVIDIA GeForce GTX 770",
            "type": "GPU",
            "architecture": "Kepler",
            "vram": "2GB GDDR5",
            "cudaCores": 1536,
            "tdp": 230,
            "msrp": 399,
            "year": 2013,
            "performance": "Mid-range Kepler.",
            "goodFor": [
                "1080p Medium"
            ],
            "psu": "550W"
        },
        "gtx 760": {
            "name": "NVIDIA GeForce GTX 760",
            "type": "GPU",
            "architecture": "Kepler",
            "vram": "2GB GDDR5",
            "cudaCores": 1152,
            "tdp": 170,
            "msrp": 249,
            "year": 2013,
            "performance": "Budget Kepler.",
            "goodFor": [
                "1080p Low-Medium"
            ],
            "psu": "450W"
        },
        "gtx 680": {
            "name": "NVIDIA GeForce GTX 680",
            "type": "GPU",
            "architecture": "Kepler",
            "vram": "2GB GDDR5",
            "cudaCores": 1536,
            "tdp": 195,
            "msrp": 499,
            "year": 2012,
            "performance": "First Kepler flagship.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "500W"
        },
        "gtx 670": {
            "name": "NVIDIA GeForce GTX 670",
            "type": "GPU",
            "architecture": "Kepler",
            "vram": "2GB GDDR5",
            "cudaCores": 1344,
            "tdp": 170,
            "msrp": 399,
            "year": 2012,
            "performance": "Great value Kepler.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "r9 290x": {
            "name": "AMD Radeon R9 290X",
            "type": "GPU",
            "architecture": "Hawaii",
            "vram": "4GB GDDR5",
            "streamProcessors": 2816,
            "tdp": 290,
            "msrp": 549,
            "year": 2013,
            "performance": "Powerful but hot and loud.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "650W"
        },
        "r9 290": {
            "name": "AMD Radeon R9 290",
            "type": "GPU",
            "architecture": "Hawaii",
            "vram": "4GB GDDR5",
            "streamProcessors": 2560,
            "tdp": 275,
            "msrp": 399,
            "year": 2013,
            "performance": "Great perf/dollar. Runs hot.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "600W"
        },
        "r9 280x": {
            "name": "AMD Radeon R9 280X",
            "type": "GPU",
            "architecture": "Tahiti",
            "vram": "3GB GDDR5",
            "streamProcessors": 2048,
            "tdp": 250,
            "msrp": 299,
            "year": 2013,
            "performance": "Rebadged HD 7970 GHz.",
            "goodFor": [
                "1080p Medium"
            ],
            "psu": "550W"
        },
        "hd 7970": {
            "name": "AMD Radeon HD 7970",
            "type": "GPU",
            "architecture": "Tahiti",
            "vram": "3GB GDDR5",
            "streamProcessors": 2048,
            "tdp": 250,
            "msrp": 549,
            "year": 2012,
            "performance": "First GCN architecture.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "550W"
        },
        "hd 7870": {
            "name": "AMD Radeon HD 7870",
            "type": "GPU",
            "architecture": "Pitcairn",
            "vram": "2GB GDDR5",
            "streamProcessors": 1280,
            "tdp": 175,
            "msrp": 349,
            "year": 2012,
            "performance": "Mid-range GCN.",
            "goodFor": [
                "1080p Medium"
            ],
            "psu": "450W"
        },
        "quadro k4200": {
            "name": "NVIDIA Quadro K4200",
            "type": "GPU (Workstation)",
            "architecture": "Kepler",
            "vram": "4GB GDDR5",
            "cudaCores": 1344,
            "tdp": 108,
            "msrp": 899,
            "year": 2014,
            "performance": "Mid-range Kepler workstation.",
            "goodFor": [
                "CAD",
                "SolidWorks",
                "3D modeling"
            ],
            "psu": "400W"
        },
        "quadro k5200": {
            "name": "NVIDIA Quadro K5200",
            "type": "GPU (Workstation)",
            "architecture": "Kepler",
            "vram": "8GB GDDR5",
            "cudaCores": 2304,
            "tdp": 150,
            "msrp": 2249,
            "year": 2014,
            "performance": "High-end Kepler workstation.",
            "goodFor": [
                "VFX",
                "Large CAD assemblies"
            ],
            "psu": "500W"
        },
        "quadro k6000": {
            "name": "NVIDIA Quadro K6000",
            "type": "GPU (Workstation)",
            "architecture": "Kepler",
            "vram": "12GB GDDR5",
            "cudaCores": 2880,
            "tdp": 225,
            "msrp": 4999,
            "year": 2013,
            "performance": "Top Kepler workstation.",
            "goodFor": [
                "Film VFX",
                "Scientific visualization"
            ],
            "psu": "600W"
        }
    },
    "2015-2019": {
        "gtx 980 ti": {
            "name": "NVIDIA GeForce GTX 980 Ti",
            "type": "GPU",
            "architecture": "Maxwell",
            "vram": "6GB GDDR5",
            "cudaCores": 2816,
            "tdp": 250,
            "msrp": 649,
            "year": 2015,
            "performance": "Top Maxwell card. Good for its time.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "600W"
        },
        "gtx 1080 ti": {
            "name": "NVIDIA GeForce GTX 1080 Ti",
            "type": "GPU",
            "architecture": "Pascal",
            "vram": "11GB GDDR5X",
            "cudaCores": 3584,
            "tdp": 250,
            "msrp": 699,
            "year": 2017,
            "performance": "Legendary GPU. Still decent for 1080p/1440p.",
            "goodFor": [
                "1080p gaming",
                "1440p medium"
            ],
            "psu": "600W"
        },
        "gtx 1080": {
            "name": "NVIDIA GeForce GTX 1080",
            "type": "GPU",
            "architecture": "Pascal",
            "vram": "8GB GDDR5X",
            "cudaCores": 2560,
            "tdp": 180,
            "msrp": 599,
            "year": 2016,
            "performance": "Great 1080p card.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "500W"
        },
        "gtx 1070 ti": {
            "name": "NVIDIA GeForce GTX 1070 Ti",
            "type": "GPU",
            "architecture": "Pascal",
            "vram": "8GB GDDR5",
            "cudaCores": 2432,
            "tdp": 180,
            "msrp": 449,
            "year": 2017,
            "performance": "Great value Pascal card.",
            "goodFor": [
                "1080p High",
                "1440p Medium"
            ],
            "psu": "500W"
        },
        "gtx 1070": {
            "name": "NVIDIA GeForce GTX 1070",
            "type": "GPU",
            "architecture": "Pascal",
            "vram": "8GB GDDR5",
            "cudaCores": 1920,
            "tdp": 150,
            "msrp": 379,
            "year": 2016,
            "performance": "Solid 1080p performance.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "gtx 1060": {
            "name": "NVIDIA GeForce GTX 1060",
            "type": "GPU",
            "architecture": "Pascal",
            "vram": "3GB/6GB GDDR5",
            "cudaCores": 1280,
            "tdp": 120,
            "msrp": 249,
            "year": 2016,
            "performance": "Budget 1080p. Get 6GB version.",
            "goodFor": [
                "1080p Medium"
            ],
            "psu": "400W"
        },
        "gtx 1050 ti": {
            "name": "NVIDIA GeForce GTX 1050 Ti",
            "type": "GPU",
            "architecture": "Pascal",
            "vram": "4GB GDDR5",
            "cudaCores": 768,
            "tdp": 75,
            "msrp": 139,
            "year": 2016,
            "performance": "Entry-level 1080p.",
            "goodFor": [
                "1080p Low-Medium"
            ],
            "psu": "300W"
        },
        "gtx 1660 super": {
            "name": "NVIDIA GeForce GTX 1660 Super",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "6GB GDDR6",
            "cudaCores": 1408,
            "tdp": 125,
            "msrp": 229,
            "year": 2019,
            "performance": "Budget 1080p. No ray tracing.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "gtx 1660 ti": {
            "name": "NVIDIA GeForce GTX 1660 Ti",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "6GB GDDR6",
            "cudaCores": 1536,
            "tdp": 120,
            "msrp": 279,
            "year": 2019,
            "performance": "Good 1080p option.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "gtx 1660": {
            "name": "NVIDIA GeForce GTX 1660",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "6GB GDDR5",
            "cudaCores": 1408,
            "tdp": 120,
            "msrp": 219,
            "year": 2019,
            "performance": "Budget Turing card.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "gtx 1650 super": {
            "name": "NVIDIA GeForce GTX 1650 Super",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "4GB GDDR6",
            "cudaCores": 1280,
            "tdp": 100,
            "msrp": 159,
            "year": 2019,
            "performance": "Entry 1080p.",
            "goodFor": [
                "1080p Medium"
            ],
            "psu": "350W"
        },
        "rtx 2080 ti": {
            "name": "NVIDIA GeForce RTX 2080 Ti",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "11GB GDDR6",
            "cudaCores": 4352,
            "tdp": 260,
            "msrp": 1199,
            "year": 2018,
            "performance": "First RTX flagship. First ray tracing.",
            "goodFor": [
                "1440p/4K gaming"
            ],
            "psu": "650W"
        },
        "rtx 2080 super": {
            "name": "NVIDIA GeForce RTX 2080 Super",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "8GB GDDR6",
            "cudaCores": 3072,
            "tdp": 250,
            "msrp": 699,
            "year": 2019,
            "performance": "Solid 1440p card.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "600W"
        },
        "rtx 2070 super": {
            "name": "NVIDIA GeForce RTX 2070 Super",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "8GB GDDR6",
            "cudaCores": 2560,
            "tdp": 215,
            "msrp": 499,
            "year": 2019,
            "performance": "Sweet spot of RTX 20 series.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "550W"
        },
        "rtx 2060 super": {
            "name": "NVIDIA GeForce RTX 2060 Super",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "8GB GDDR6",
            "cudaCores": 2176,
            "tdp": 175,
            "msrp": 399,
            "year": 2019,
            "performance": "Good entry RTX card.",
            "goodFor": [
                "1080p/1440p gaming"
            ],
            "psu": "500W"
        },
        "rtx 2060": {
            "name": "NVIDIA GeForce RTX 2060",
            "type": "GPU",
            "architecture": "Turing",
            "vram": "6GB GDDR6",
            "cudaCores": 1920,
            "tdp": 160,
            "msrp": 349,
            "year": 2019,
            "performance": "Entry RTX with ray tracing.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "rx 5700 xt": {
            "name": "AMD Radeon RX 5700 XT",
            "type": "GPU",
            "architecture": "RDNA",
            "vram": "8GB GDDR6",
            "streamProcessors": 2560,
            "tdp": 225,
            "msrp": 399,
            "year": 2019,
            "performance": "First RDNA. Great 1440p value.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "600W"
        },
        "rx 5700": {
            "name": "AMD Radeon RX 5700",
            "type": "GPU",
            "architecture": "RDNA",
            "vram": "8GB GDDR6",
            "streamProcessors": 2304,
            "tdp": 180,
            "msrp": 349,
            "year": 2019,
            "performance": "Good 1440p option.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "550W"
        },
        "rx 590": {
            "name": "AMD Radeon RX 590",
            "type": "GPU",
            "architecture": "Polaris",
            "vram": "8GB GDDR5",
            "streamProcessors": 2304,
            "tdp": 225,
            "msrp": 279,
            "year": 2018,
            "performance": "Polaris refresh. Hot but capable.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "550W"
        },
        "rx 580": {
            "name": "AMD Radeon RX 580",
            "type": "GPU",
            "architecture": "Polaris",
            "vram": "8GB GDDR5",
            "streamProcessors": 2304,
            "tdp": 185,
            "msrp": 229,
            "year": 2017,
            "performance": "Popular budget card.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "500W"
        },
        "rx 570": {
            "name": "AMD Radeon RX 570",
            "type": "GPU",
            "architecture": "Polaris",
            "vram": "4GB/8GB GDDR5",
            "streamProcessors": 2048,
            "tdp": 150,
            "msrp": 169,
            "year": 2017,
            "performance": "Budget 1080p option.",
            "goodFor": [
                "1080p Medium"
            ],
            "psu": "450W"
        },
        "rx 480": {
            "name": "AMD Radeon RX 480",
            "type": "GPU",
            "architecture": "Polaris",
            "vram": "4GB/8GB GDDR5",
            "streamProcessors": 2304,
            "tdp": 150,
            "msrp": 239,
            "year": 2016,
            "performance": "First Polaris. Good value.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "quadro m4000": {
            "name": "NVIDIA Quadro M4000",
            "type": "GPU (Workstation)",
            "architecture": "Maxwell",
            "vram": "8GB GDDR5",
            "cudaCores": 1664,
            "tdp": 120,
            "msrp": 845,
            "year": 2015,
            "performance": "Professional CAD/3D workstation card.",
            "goodFor": [
                "AutoCAD",
                "SolidWorks",
                "Maya",
                "3ds Max",
                "Revit"
            ],
            "applications": [
                "CAD/CAM",
                "3D modeling",
                "Video editing"
            ],
            "notes": "Quadro drivers are ISV-certified. Gaming not recommended.",
            "psu": "450W"
        },
        "quadro m5000": {
            "name": "NVIDIA Quadro M5000",
            "type": "GPU (Workstation)",
            "architecture": "Maxwell",
            "vram": "8GB GDDR5",
            "cudaCores": 2048,
            "tdp": 150,
            "msrp": 1799,
            "year": 2015,
            "performance": "High-end Maxwell workstation.",
            "goodFor": [
                "CAD",
                "VFX",
                "3D rendering"
            ],
            "psu": "500W"
        },
        "quadro m6000": {
            "name": "NVIDIA Quadro M6000",
            "type": "GPU (Workstation)",
            "architecture": "Maxwell",
            "vram": "12GB/24GB GDDR5",
            "cudaCores": 3072,
            "tdp": 250,
            "msrp": 4999,
            "year": 2015,
            "performance": "Top Maxwell workstation.",
            "goodFor": [
                "VFX",
                "Large assemblies",
                "8K editing"
            ],
            "psu": "600W"
        },
        "quadro p4000": {
            "name": "NVIDIA Quadro P4000",
            "type": "GPU (Workstation)",
            "architecture": "Pascal",
            "vram": "8GB GDDR5",
            "cudaCores": 1792,
            "tdp": 105,
            "msrp": 799,
            "year": 2017,
            "performance": "Mid-range Pascal workstation. Successor to M4000.",
            "goodFor": [
                "CAD",
                "3D modeling",
                "Video editing"
            ],
            "psu": "450W"
        },
        "quadro p5000": {
            "name": "NVIDIA Quadro P5000",
            "type": "GPU (Workstation)",
            "architecture": "Pascal",
            "vram": "16GB GDDR5X",
            "cudaCores": 2560,
            "tdp": 180,
            "msrp": 1899,
            "year": 2016,
            "performance": "High-end Pascal workstation.",
            "goodFor": [
                "VFX",
                "Large assemblies",
                "VR development"
            ],
            "psu": "500W"
        },
        "quadro p6000": {
            "name": "NVIDIA Quadro P6000",
            "type": "GPU (Workstation)",
            "architecture": "Pascal",
            "vram": "24GB GDDR5X",
            "cudaCores": 3840,
            "tdp": 250,
            "msrp": 5499,
            "year": 2016,
            "performance": "Top Pascal workstation.",
            "goodFor": [
                "Film production",
                "Scientific visualization"
            ],
            "psu": "600W"
        },
        "quadro rtx 4000": {
            "name": "NVIDIA Quadro RTX 4000",
            "type": "GPU (Workstation)",
            "architecture": "Turing",
            "vram": "8GB GDDR6",
            "cudaCores": 2304,
            "rtCores": 36,
            "tdp": 160,
            "msrp": 899,
            "year": 2018,
            "performance": "First RTX workstation. Ray tracing + AI.",
            "goodFor": [
                "Real-time ray tracing",
                "VR development",
                "CAD"
            ],
            "psu": "500W"
        },
        "quadro rtx 5000": {
            "name": "NVIDIA Quadro RTX 5000",
            "type": "GPU (Workstation)",
            "architecture": "Turing",
            "vram": "16GB GDDR6",
            "cudaCores": 3072,
            "rtCores": 48,
            "tdp": 265,
            "msrp": 2299,
            "year": 2018,
            "performance": "High-end RTX workstation.",
            "goodFor": [
                "VFX",
                "AI",
                "3D rendering"
            ],
            "psu": "600W"
        }
    },
    "2020-2024": {
        "rx 5600 xt": {
            "name": "AMD Radeon RX 5600 XT",
            "type": "GPU",
            "architecture": "RDNA",
            "vram": "6GB GDDR6",
            "streamProcessors": 2304,
            "tdp": 150,
            "msrp": 279,
            "year": 2020,
            "performance": "1080p champion of its time.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "rtx 4090": {
            "name": "NVIDIA GeForce RTX 4090",
            "type": "GPU",
            "architecture": "Ada Lovelace",
            "vram": "24GB GDDR6X",
            "cudaCores": 16384,
            "tdp": 450,
            "msrp": 1599,
            "year": 2022,
            "performance": "Best consumer GPU. 4K 120+ FPS.",
            "goodFor": [
                "4K gaming",
                "AI/ML",
                "3D rendering"
            ],
            "psu": "850W"
        },
        "rtx 4080 super": {
            "name": "NVIDIA GeForce RTX 4080 Super",
            "type": "GPU",
            "architecture": "Ada Lovelace",
            "vram": "16GB GDDR6X",
            "cudaCores": 10240,
            "tdp": 320,
            "msrp": 999,
            "year": 2024,
            "performance": "Excellent 4K gaming with DLSS 3.",
            "goodFor": [
                "4K gaming",
                "Content creation"
            ],
            "psu": "750W"
        },
        "rtx 4070 ti super": {
            "name": "NVIDIA GeForce RTX 4070 Ti Super",
            "type": "GPU",
            "architecture": "Ada Lovelace",
            "vram": "16GB GDDR6X",
            "cudaCores": 8448,
            "tdp": 285,
            "msrp": 799,
            "year": 2024,
            "performance": "Great 1440p and good 4K.",
            "goodFor": [
                "1440p 144Hz",
                "4K 60Hz"
            ],
            "psu": "700W"
        },
        "rtx 4070 super": {
            "name": "NVIDIA GeForce RTX 4070 Super",
            "type": "GPU",
            "architecture": "Ada Lovelace",
            "vram": "12GB GDDR6X",
            "cudaCores": 7168,
            "tdp": 220,
            "msrp": 599,
            "year": 2024,
            "performance": "Best value for 1440p. Sweet spot.",
            "goodFor": [
                "1440p gaming",
                "Streaming"
            ],
            "psu": "650W"
        },
        "rtx 4070": {
            "name": "NVIDIA GeForce RTX 4070",
            "type": "GPU",
            "architecture": "Ada Lovelace",
            "vram": "12GB GDDR6X",
            "cudaCores": 5888,
            "tdp": 200,
            "msrp": 549,
            "year": 2023,
            "performance": "Good 1440p, excellent efficiency.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "650W"
        },
        "rtx 4060 ti": {
            "name": "NVIDIA GeForce RTX 4060 Ti",
            "type": "GPU",
            "architecture": "Ada Lovelace",
            "vram": "8GB/16GB GDDR6",
            "cudaCores": 4352,
            "tdp": 160,
            "msrp": 399,
            "year": 2023,
            "performance": "1080p Ultra champion.",
            "goodFor": [
                "1080p Ultra",
                "1440p Medium"
            ],
            "psu": "550W"
        },
        "rtx 4060": {
            "name": "NVIDIA GeForce RTX 4060",
            "type": "GPU",
            "architecture": "Ada Lovelace",
            "vram": "8GB GDDR6",
            "cudaCores": 3072,
            "tdp": 115,
            "msrp": 299,
            "year": 2023,
            "performance": "Budget 1080p with DLSS 3.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "500W"
        },
        "rtx 3090 ti": {
            "name": "NVIDIA GeForce RTX 3090 Ti",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "24GB GDDR6X",
            "cudaCores": 10752,
            "tdp": 450,
            "msrp": 1999,
            "year": 2022,
            "performance": "Previous gen flagship.",
            "goodFor": [
                "4K gaming",
                "Content creation"
            ],
            "psu": "850W"
        },
        "rtx 3090": {
            "name": "NVIDIA GeForce RTX 3090",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "24GB GDDR6X",
            "cudaCores": 10496,
            "tdp": 350,
            "msrp": 1499,
            "year": 2020,
            "performance": "Great used market value.",
            "goodFor": [
                "4K gaming",
                "AI/ML"
            ],
            "psu": "750W"
        },
        "rtx 3080 ti": {
            "name": "NVIDIA GeForce RTX 3080 Ti",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "12GB GDDR6X",
            "cudaCores": 10240,
            "tdp": 350,
            "msrp": 1199,
            "year": 2021,
            "performance": "Near-3090 performance.",
            "goodFor": [
                "4K gaming"
            ],
            "psu": "750W"
        },
        "rtx 3080": {
            "name": "NVIDIA GeForce RTX 3080",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "10GB/12GB GDDR6X",
            "cudaCores": 8704,
            "tdp": 320,
            "msrp": 699,
            "year": 2020,
            "performance": "Great used value. Solid 4K.",
            "goodFor": [
                "4K gaming",
                "1440p high refresh"
            ],
            "psu": "750W"
        },
        "rtx 3070 ti": {
            "name": "NVIDIA GeForce RTX 3070 Ti",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "8GB GDDR6X",
            "cudaCores": 6144,
            "tdp": 290,
            "msrp": 599,
            "year": 2021,
            "performance": "Good 1440p/4K card.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "700W"
        },
        "rtx 3070": {
            "name": "NVIDIA GeForce RTX 3070",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "8GB GDDR6",
            "cudaCores": 5888,
            "tdp": 220,
            "msrp": 499,
            "year": 2020,
            "performance": "1440p champion of its era.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "650W"
        },
        "rtx 3060 ti": {
            "name": "NVIDIA GeForce RTX 3060 Ti",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "8GB GDDR6",
            "cudaCores": 4864,
            "tdp": 200,
            "msrp": 399,
            "year": 2020,
            "performance": "Great 1080p/1440p value.",
            "goodFor": [
                "1080p Ultra",
                "1440p"
            ],
            "psu": "600W"
        },
        "rtx 3060": {
            "name": "NVIDIA GeForce RTX 3060",
            "type": "GPU",
            "architecture": "Ampere",
            "vram": "12GB GDDR6",
            "cudaCores": 3584,
            "tdp": 170,
            "msrp": 329,
            "year": 2021,
            "performance": "Budget card with good VRAM.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "550W"
        },
        "rx 7900 xtx": {
            "name": "AMD Radeon RX 7900 XTX",
            "type": "GPU",
            "architecture": "RDNA 3",
            "vram": "24GB GDDR6",
            "streamProcessors": 6144,
            "tdp": 355,
            "msrp": 999,
            "year": 2022,
            "performance": "AMD flagship. Competes with RTX 4080.",
            "goodFor": [
                "4K gaming",
                "High VRAM workloads"
            ],
            "psu": "800W"
        },
        "rx 7900 xt": {
            "name": "AMD Radeon RX 7900 XT",
            "type": "GPU",
            "architecture": "RDNA 3",
            "vram": "20GB GDDR6",
            "streamProcessors": 5376,
            "tdp": 315,
            "msrp": 799,
            "year": 2022,
            "performance": "Great 4K value.",
            "goodFor": [
                "4K gaming"
            ],
            "psu": "750W"
        },
        "rx 7800 xt": {
            "name": "AMD Radeon RX 7800 XT",
            "type": "GPU",
            "architecture": "RDNA 3",
            "vram": "16GB GDDR6",
            "streamProcessors": 3840,
            "tdp": 263,
            "msrp": 499,
            "year": 2023,
            "performance": "Best value 1440p GPU.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "650W"
        },
        "rx 7700 xt": {
            "name": "AMD Radeon RX 7700 XT",
            "type": "GPU",
            "architecture": "RDNA 3",
            "vram": "12GB GDDR6",
            "streamProcessors": 3456,
            "tdp": 245,
            "msrp": 449,
            "year": 2023,
            "performance": "Solid 1440p performance.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "600W"
        },
        "rx 7600": {
            "name": "AMD Radeon RX 7600",
            "type": "GPU",
            "architecture": "RDNA 3",
            "vram": "8GB GDDR6",
            "streamProcessors": 2048,
            "tdp": 165,
            "msrp": 269,
            "year": 2023,
            "performance": "Budget 1080p with modern architecture.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "550W"
        },
        "rx 6950 xt": {
            "name": "AMD Radeon RX 6950 XT",
            "type": "GPU",
            "architecture": "RDNA 2",
            "vram": "16GB GDDR6",
            "streamProcessors": 5120,
            "tdp": 335,
            "msrp": 1099,
            "year": 2022,
            "performance": "Top RDNA 2 card.",
            "goodFor": [
                "4K gaming"
            ],
            "psu": "750W"
        },
        "rx 6800 xt": {
            "name": "AMD Radeon RX 6800 XT",
            "type": "GPU",
            "architecture": "RDNA 2",
            "vram": "16GB GDDR6",
            "streamProcessors": 4608,
            "tdp": 300,
            "msrp": 649,
            "year": 2020,
            "performance": "Great used value.",
            "goodFor": [
                "1440p/4K gaming"
            ],
            "psu": "700W"
        },
        "rx 6700 xt": {
            "name": "AMD Radeon RX 6700 XT",
            "type": "GPU",
            "architecture": "RDNA 2",
            "vram": "12GB GDDR6",
            "streamProcessors": 2560,
            "tdp": 230,
            "msrp": 479,
            "year": 2021,
            "performance": "Good 1440p gaming.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "600W"
        },
        "rx 6650 xt": {
            "name": "AMD Radeon RX 6650 XT",
            "type": "GPU",
            "architecture": "RDNA 2",
            "vram": "8GB GDDR6",
            "streamProcessors": 2048,
            "tdp": 180,
            "msrp": 239,
            "year": 2022,
            "performance": "Budget 1080p powerhouse.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "500W"
        },
        "rx 6600": {
            "name": "AMD Radeon RX 6600",
            "type": "GPU",
            "architecture": "RDNA 2",
            "vram": "8GB GDDR6",
            "streamProcessors": 1792,
            "tdp": 132,
            "msrp": 329,
            "year": 2021,
            "performance": "Efficient 1080p card.",
            "goodFor": [
                "1080p gaming"
            ],
            "psu": "450W"
        },
        "arc a770": {
            "name": "Intel Arc A770",
            "type": "GPU",
            "architecture": "Alchemist",
            "vram": "16GB GDDR6",
            "xeCores": 32,
            "tdp": 225,
            "msrp": 349,
            "year": 2022,
            "performance": "Intel flagship. Good DX12/Vulkan performance.",
            "goodFor": [
                "1440p gaming",
                "AV1 encoding"
            ],
            "psu": "600W"
        },
        "arc a750": {
            "name": "Intel Arc A750",
            "type": "GPU",
            "architecture": "Alchemist",
            "vram": "8GB GDDR6",
            "xeCores": 28,
            "tdp": 225,
            "msrp": 249,
            "year": 2022,
            "performance": "Budget 1440p option.",
            "goodFor": [
                "1440p gaming"
            ],
            "psu": "600W"
        }
    }
};

export const GPU_CUSTOM_PARTS = {};

export const GPU_PARTS = {
    ...GPU_BY_ERA['2000-2009'],
    ...GPU_BY_ERA['2010-2014'],
    ...GPU_BY_ERA['2015-2019'],
    ...GPU_BY_ERA['2020-2024'],
    ...GPU_BY_ERA['2025'],
    ...GPU_CUSTOM_PARTS,
};

export default {
    GPU_BY_ERA,
    GPU_PARTS,
};
