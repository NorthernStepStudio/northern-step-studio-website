/**
 * COOLER components (2000-2025).
 * Split by era for quick filtering.
 * ~150+ coolers across all eras
 */

export const COOLER_BY_ERA = {
    "2025": {
        "noctua_nh_d15_g2": { name: "Noctua NH-D15 G2", type: "CPU Cooler (Air)", year: 2024, tdpRating: "300W+", height: "168mm", fans: "2x 140mm NF-A14x25r", sockets: "LGA1700, LGA1851, AM5", msrp: 150, notes: "New flagship air cooler" },
        "bequiet_dark_rock_elite": { name: "be quiet! Dark Rock Elite", type: "CPU Cooler (Air)", year: 2024, tdpRating: "280W", height: "168mm", fans: "2x 135mm Silent Wings 4", sockets: "LGA1700, LGA1851, AM5", msrp: 100, notes: "Flagship be quiet" },
        "arctic_lf3_360": { name: "Arctic Liquid Freezer III 360", type: "CPU Cooler (AIO)", year: 2024, tdpRating: "350W+", radiator: "360mm", fans: "3x 120mm P12", sockets: "LGA1700, LGA1851, AM5", msrp: 120, notes: "New gen Arctic AIO" },
    },
    "2000-2009": {
        // Legendary early coolers
        "zalman_cnps7000": { name: "Zalman CNPS7000", type: "CPU Cooler (Air)", year: 2002, tdpRating: "100W", height: "130mm", fans: "1x 92mm flower", sockets: "478, A", msrp: 40, notes: "Iconic flower design" },
        "zalman_cnps9500": { name: "Zalman CNPS9500", type: "CPU Cooler (Air)", year: 2005, tdpRating: "130W", height: "140mm", fans: "1x 92mm flower", sockets: "775, AM2", msrp: 50, notes: "LED flower cooler" },
        "zalman_cnps9700": { name: "Zalman CNPS9700 LED", type: "CPU Cooler (Air)", year: 2006, tdpRating: "140W", height: "152mm", fans: "1x 110mm flower", sockets: "775, AM2", msrp: 60, notes: "Popular enthusiast" },
        "thermalright_ultra120": { name: "Thermalright Ultra-120", type: "CPU Cooler (Air)", year: 2006, tdpRating: "150W+", height: "160mm", fans: "None included", sockets: "775", msrp: 55, notes: "Legendary OC cooler" },
        "thermalright_ultra120e": { name: "Thermalright Ultra-120 Extreme", type: "CPU Cooler (Air)", year: 2007, tdpRating: "180W", height: "160mm", fans: "None included", sockets: "775, AM2", msrp: 60, notes: "OC legend" },
        "thermalright_ifx14": { name: "Thermalright IFX-14", type: "CPU Cooler (Air)", year: 2008, tdpRating: "200W+", height: "180mm", fans: "None included", sockets: "775, 1366", msrp: 80, notes: "Massive heatsink" },
        "thermalright_true_black": { name: "Thermalright TRUE Black 120", type: "CPU Cooler (Air)", year: 2008, tdpRating: "180W", height: "161mm", fans: "None included", sockets: "775, 1366", msrp: 65, notes: "Black coating" },
        "scythe_ninja": { name: "Scythe Ninja", type: "CPU Cooler (Air)", year: 2005, tdpRating: "120W", height: "163mm", fans: "None included", sockets: "775, AM2", msrp: 40, notes: "Silent operation" },
        "scythe_mugen": { name: "Scythe Mugen", type: "CPU Cooler (Air)", year: 2007, tdpRating: "140W", height: "155mm", fans: "1x 120mm", sockets: "775, AM2", msrp: 35, notes: "Value tower" },
        "scythe_mugen2": { name: "Scythe Mugen 2", type: "CPU Cooler (Air)", year: 2009, tdpRating: "160W", height: "158mm", fans: "1x 120mm", sockets: "775, 1366, AM3", msrp: 40, notes: "Popular Mugen" },
        "scythe_zipang": { name: "Scythe Zipang", type: "CPU Cooler (Air)", year: 2009, tdpRating: "150W", height: "125mm", fans: "1x 140mm", sockets: "775, 1366", msrp: 45, notes: "Top-down" },
        "tuniq_tower120": { name: "Tuniq Tower 120", type: "CPU Cooler (Air)", year: 2006, tdpRating: "160W", height: "162mm", fans: "1x 120mm", sockets: "775", msrp: 50, notes: "Tall tower" },
        "cm_hyper212": { name: "Cooler Master Hyper 212", type: "CPU Cooler (Air)", year: 2008, tdpRating: "130W", height: "158mm", fans: "1x 120mm", sockets: "775, AM2", msrp: 30, notes: "Budget legend begins" },
        "cm_v8": { name: "Cooler Master V8", type: "CPU Cooler (Air)", year: 2009, tdpRating: "180W", height: "161mm", fans: "1x 120mm", sockets: "775, 1366, AM3", msrp: 70, notes: "Aggressive design" },
        "noctua_nh_u12p": { name: "Noctua NH-U12P", type: "CPU Cooler (Air)", year: 2008, tdpRating: "140W", height: "158mm", fans: "1x 120mm NF-P12", sockets: "775, 1366, AM2", msrp: 70, notes: "Quality Noctua" },
        "noctua_nh_u9b": { name: "Noctua NH-U9B", type: "CPU Cooler (Air)", year: 2008, tdpRating: "100W", height: "125mm", fans: "1x 92mm NF-B9", sockets: "775, AM2", msrp: 50, notes: "Compact Noctua" },
        // Early AIO/water
        "corsair_h50": { name: "Corsair H50", type: "CPU Cooler (AIO)", year: 2009, tdpRating: "120W", radiator: "120mm", fans: "1x 120mm", sockets: "775, 1366, AM3", msrp: 80, notes: "First mainstream AIO" },
        "swiftech_h20_220": { name: "Swiftech H20-220", type: "CPU Cooler (Kit)", year: 2006, tdpRating: "200W+", radiator: "220mm", fans: "2x 120mm", msrp: 180, notes: "Custom loop kit" },
        "thermaltake_bigwater": { name: "Thermaltake BigWater 780e", type: "CPU Cooler (Kit)", year: 2008, tdpRating: "180W", radiator: "240mm", fans: "2x 120mm", msrp: 150, notes: "External radiator" },
    },
    "2010-2014": {
        // Noctua era
        "noctua_nh_d14": { name: "Noctua NH-D14", type: "CPU Cooler (Air)", year: 2009, tdpRating: "220W", height: "160mm", fans: "2x 140mm/120mm", sockets: "1155, 1366, AM3", msrp: 85, notes: "Legendary dual tower" },
        "noctua_nh_d15": { name: "Noctua NH-D15", type: "CPU Cooler (Air)", year: 2014, tdpRating: "250W+", height: "165mm", fans: "2x 140mm NF-A15", sockets: "1150, AM3, AM4", msrp: 99, notes: "King of air cooling" },
        "noctua_nh_u12s": { name: "Noctua NH-U12S", type: "CPU Cooler (Air)", year: 2013, tdpRating: "150W", height: "158mm", fans: "1x 120mm NF-F12", sockets: "1150, AM3, AM4", msrp: 65, notes: "Popular 120mm" },
        "noctua_nh_u14s": { name: "Noctua NH-U14S", type: "CPU Cooler (Air)", year: 2013, tdpRating: "180W", height: "165mm", fans: "1x 140mm NF-A15", sockets: "1150, AM3", msrp: 75, notes: "Single tower 140mm" },
        "noctua_nh_l9i": { name: "Noctua NH-L9i", type: "CPU Cooler (Air)", year: 2012, tdpRating: "65W", height: "37mm", fans: "1x 92mm NF-A9x14", sockets: "115x", msrp: 45, notes: "Ultra low profile" },
        "noctua_nh_l12": { name: "Noctua NH-L12", type: "CPU Cooler (Air)", year: 2013, tdpRating: "95W", height: "66mm", fans: "1x 120mm + 1x 92mm", sockets: "1150, AM3", msrp: 55, notes: "Low profile hybrid" },
        "noctua_chromax": { name: "Noctua NH-D14 SE2011", type: "CPU Cooler (Air)", year: 2011, tdpRating: "220W", height: "160mm", fans: "2x 140mm/120mm", sockets: "2011", msrp: 90, notes: "HEDT version" },
        // Cooler Master
        "cm_hyper_212_evo": { name: "Cooler Master Hyper 212 EVO", type: "CPU Cooler (Air)", year: 2011, tdpRating: "150W", height: "159mm", fans: "1x 120mm", sockets: "1155, AM3", msrp: 35, notes: "Legendary budget" },
        "cm_hyper_212_plus": { name: "Cooler Master Hyper 212 Plus", type: "CPU Cooler (Air)", year: 2010, tdpRating: "140W", height: "159mm", fans: "1x 120mm", sockets: "1156, AM3", msrp: 30, notes: "EVO predecessor" },
        "cm_v8_gts": { name: "Cooler Master V8 GTS", type: "CPU Cooler (Air)", year: 2014, tdpRating: "200W", height: "166mm", fans: "2x 120mm", sockets: "1150, AM3", msrp: 80, notes: "Updated V8" },
        "cm_n520": { name: "Cooler Master Hyper N520", type: "CPU Cooler (Air)", year: 2010, tdpRating: "180W", height: "146mm", fans: "2x 92mm", sockets: "1156, AM3", msrp: 45, notes: "Dual 92mm" },
        // be quiet
        "bequiet_dark_rock_3": { name: "be quiet! Dark Rock 3", type: "CPU Cooler (Air)", year: 2013, tdpRating: "190W", height: "159mm", fans: "1x 135mm", sockets: "1150, AM3", msrp: 70, notes: "Silent operation" },
        "bequiet_dark_rock_pro_3": { name: "be quiet! Dark Rock Pro 3", type: "CPU Cooler (Air)", year: 2013, tdpRating: "250W", height: "163mm", fans: "2x 135mm/120mm", sockets: "1150, AM3", msrp: 90, notes: "Premium silent" },
        "bequiet_shadow_rock_2": { name: "be quiet! Shadow Rock 2", type: "CPU Cooler (Air)", year: 2014, tdpRating: "160W", height: "159mm", fans: "1x 120mm", sockets: "1150, AM3", msrp: 50, notes: "Mid-range silent" },
        // Phanteks
        "phanteks_tc14pe": { name: "Phanteks PH-TC14PE", type: "CPU Cooler (Air)", year: 2012, tdpRating: "220W", height: "171mm", fans: "2x 140mm", sockets: "1155, 2011, AM3", msrp: 80, notes: "Colorful options" },
        // Cryorig
        "cryorig_h7": { name: "CRYORIG H7", type: "CPU Cooler (Air)", year: 2014, tdpRating: "150W", height: "145mm", fans: "1x 120mm", sockets: "1150, AM3", msrp: 49, notes: "Popular budget" },
        "cryorig_r1": { name: "CRYORIG R1 Ultimate", type: "CPU Cooler (Air)", year: 2014, tdpRating: "240W", height: "168mm", fans: "2x 140mm", sockets: "1150, AM3", msrp: 89, notes: "D15 rival" },
        // AIO Era
        "corsair_h60": { name: "Corsair H60", type: "CPU Cooler (AIO)", year: 2011, tdpRating: "130W", radiator: "120mm", fans: "1x 120mm", sockets: "1155, AM3", msrp: 60, notes: "Budget AIO" },
        "corsair_h80": { name: "Corsair H80", type: "CPU Cooler (AIO)", year: 2011, tdpRating: "180W", radiator: "120mm (thick)", fans: "2x 120mm", sockets: "1155, AM3", msrp: 100, notes: "Thick rad" },
        "corsair_h100": { name: "Corsair H100", type: "CPU Cooler (AIO)", year: 2011, tdpRating: "220W", radiator: "240mm", fans: "2x 120mm", sockets: "1155, 2011", msrp: 100, notes: "Popular 240mm" },
        "corsair_h100i": { name: "Corsair H100i", type: "CPU Cooler (AIO)", year: 2012, tdpRating: "250W", radiator: "240mm", fans: "2x 120mm", sockets: "1155, 2011, AM3", msrp: 110, notes: "Legendary 240mm" },
        "corsair_h110": { name: "Corsair H110", type: "CPU Cooler (AIO)", year: 2013, tdpRating: "280W", radiator: "280mm", fans: "2x 140mm", sockets: "1150, 2011", msrp: 130, notes: "First 280mm" },
        "nzxt_kraken_x60": { name: "NZXT Kraken X60", type: "CPU Cooler (AIO)", year: 2013, tdpRating: "280W", radiator: "280mm", fans: "2x 140mm", sockets: "1150, AM3", msrp: 140, notes: "Aesthetic AIO" },
        "nzxt_kraken_x40": { name: "NZXT Kraken X40", type: "CPU Cooler (AIO)", year: 2013, tdpRating: "150W", radiator: "140mm", fans: "1x 140mm", sockets: "1150, AM3", msrp: 100, notes: "140mm single" },
        "cm_seidon_240m": { name: "Cooler Master Seidon 240M", type: "CPU Cooler (AIO)", year: 2013, tdpRating: "220W", radiator: "240mm", fans: "2x 120mm", sockets: "1150, AM3", msrp: 90, notes: "Value AIO" },
        "swiftech_h220": { name: "Swiftech H220", type: "CPU Cooler (AIO)", year: 2013, tdpRating: "300W", radiator: "240mm", fans: "2x 120mm", sockets: "1150, 2011", msrp: 150, notes: "Expandable AIO" },
    },
    "2015-2019": {
        // Noctua continued
        "noctua_nh_d15s": { name: "Noctua NH-D15S", type: "CPU Cooler (Air)", year: 2015, tdpRating: "220W", height: "160mm", fans: "1x 140mm NF-A15", sockets: "1151, AM4", msrp: 89, notes: "RAM cleared D15" },
        "noctua_nh_u12a": { name: "Noctua NH-U12A", type: "CPU Cooler (Air)", year: 2019, tdpRating: "200W", height: "158mm", fans: "2x 120mm NF-A12x25", sockets: "1151, AM4", msrp: 109, notes: "120mm flagship" },
        "noctua_nh_l12s": { name: "Noctua NH-L12S", type: "CPU Cooler (Air)", year: 2017, tdpRating: "95W", height: "70mm", fans: "1x 120mm NF-A12x15", sockets: "1151, AM4", msrp: 55, notes: "Low profile" },
        "noctua_chromax_black": { name: "Noctua NH-D15 chromax.black", type: "CPU Cooler (Air)", year: 2019, tdpRating: "250W+", height: "165mm", fans: "2x 140mm NF-A15 chromax", sockets: "1151, AM4", msrp: 109, notes: "All black D15" },
        // be quiet
        "bequiet_dark_rock_4": { name: "be quiet! Dark Rock 4", type: "CPU Cooler (Air)", year: 2018, tdpRating: "200W", height: "159mm", fans: "1x 135mm Silent Wings", sockets: "1151, AM4", msrp: 75, notes: "Silent single tower" },
        "bequiet_dark_rock_pro_4": { name: "be quiet! Dark Rock Pro 4", type: "CPU Cooler (Air)", year: 2018, tdpRating: "250W", height: "163mm", fans: "2x 120mm/135mm", sockets: "1151, AM4", msrp: 89, notes: "Premium silent" },
        "bequiet_pure_rock_slim": { name: "be quiet! Pure Rock Slim", type: "CPU Cooler (Air)", year: 2016, tdpRating: "120W", height: "124mm", fans: "1x 92mm", sockets: "1151, AM4", msrp: 29, notes: "Compact budget" },
        // Scythe
        "scythe_mugen5": { name: "Scythe Mugen 5", type: "CPU Cooler (Air)", year: 2016, tdpRating: "180W", height: "154mm", fans: "1x 120mm Kaze Flex", sockets: "1151, AM4", msrp: 50, notes: "Value tower" },
        "scythe_fuma2": { name: "Scythe Fuma 2", type: "CPU Cooler (Air)", year: 2019, tdpRating: "200W", height: "155mm", fans: "2x 120mm", sockets: "1151, AM4", msrp: 60, notes: "Best value dual tower" },
        "scythe_kotetsu_ii": { name: "Scythe Kotetsu Mark II", type: "CPU Cooler (Air)", year: 2018, tdpRating: "150W", height: "154mm", fans: "1x 120mm", sockets: "1151, AM4", msrp: 40, notes: "Budget tower" },
        // Cooler Master
        "cm_hyper_212_black": { name: "Cooler Master Hyper 212 Black Edition", type: "CPU Cooler (Air)", year: 2018, tdpRating: "150W", height: "158mm", fans: "1x 120mm", sockets: "1151, AM4", msrp: 40, notes: "Black EVO" },
        "cm_hyper_212_rgb": { name: "Cooler Master Hyper 212 RGB Black", type: "CPU Cooler (Air)", year: 2019, tdpRating: "150W", height: "159mm", fans: "1x 120mm RGB", sockets: "1151, AM4", msrp: 45, notes: "RGB EVO" },
        "cm_ma620m": { name: "Cooler Master MasterAir MA620M", type: "CPU Cooler (Air)", year: 2019, tdpRating: "220W", height: "165mm", fans: "2x 120mm", sockets: "1151, AM4", msrp: 80, notes: "Dual tower RGB" },
        // Cryorig continued
        "cryorig_h7_quad": { name: "CRYORIG H7 Quad Lumi", type: "CPU Cooler (Air)", year: 2017, tdpRating: "160W", height: "145mm", fans: "1x 120mm RGB", sockets: "1151, AM4", msrp: 70, notes: "RGB H7" },
        "cryorig_c7": { name: "CRYORIG C7", type: "CPU Cooler (Air)", year: 2016, tdpRating: "100W", height: "47mm", fans: "1x 92mm", sockets: "1151, AM4", msrp: 40, notes: "Top-down compact" },
        // DeepCool
        "deepcool_assassin3": { name: "DeepCool Assassin III", type: "CPU Cooler (Air)", year: 2019, tdpRating: "280W", height: "165mm", fans: "2x 140mm", sockets: "1151, AM4", msrp: 90, notes: "D15 competitor" },
        "deepcool_gammaxx_400": { name: "DeepCool GAMMAXX 400", type: "CPU Cooler (Air)", year: 2015, tdpRating: "130W", height: "154mm", fans: "1x 120mm", sockets: "1151, AM4", msrp: 25, notes: "Ultra budget" },
        // AIO continued
        "corsair_h100i_v2": { name: "Corsair H100i v2", type: "CPU Cooler (AIO)", year: 2016, tdpRating: "250W", radiator: "240mm", fans: "2x 120mm", sockets: "1151, AM4", msrp: 110, notes: "Updated H100i" },
        "corsair_h115i": { name: "Corsair H115i", type: "CPU Cooler (AIO)", year: 2016, tdpRating: "280W", radiator: "280mm", fans: "2x 140mm", sockets: "1151, AM4", msrp: 150, notes: "280mm Corsair" },
        "corsair_h150i_pro": { name: "Corsair H150i Pro", type: "CPU Cooler (AIO)", year: 2017, tdpRating: "350W", radiator: "360mm", fans: "3x 120mm ML", sockets: "1151, AM4", msrp: 190, notes: "First 360mm" },
        "corsair_h100i_rgb_platinum": { name: "Corsair H100i RGB Platinum", type: "CPU Cooler (AIO)", year: 2018, tdpRating: "250W", radiator: "240mm", fans: "2x 120mm ML RGB", sockets: "1151, AM4", msrp: 160, notes: "RGB AIO" },
        "nzxt_kraken_x52": { name: "NZXT Kraken X52", type: "CPU Cooler (AIO)", year: 2016, tdpRating: "220W", radiator: "240mm", fans: "2x 120mm Aer P", sockets: "1151, AM4", msrp: 150, notes: "Infinity mirror" },
        "nzxt_kraken_x62": { name: "NZXT Kraken X62", type: "CPU Cooler (AIO)", year: 2016, tdpRating: "280W", radiator: "280mm", fans: "2x 140mm Aer P", sockets: "1151, AM4", msrp: 160, notes: "Popular 280mm" },
        "nzxt_kraken_x72": { name: "NZXT Kraken X72", type: "CPU Cooler (AIO)", year: 2018, tdpRating: "350W", radiator: "360mm", fans: "3x 120mm Aer P", sockets: "1151, AM4", msrp: 180, notes: "NZXT 360mm" },
        "evga_clc_280": { name: "EVGA CLC 280", type: "CPU Cooler (AIO)", year: 2017, tdpRating: "280W", radiator: "280mm", fans: "2x 140mm", sockets: "1151, AM4", msrp: 120, notes: "Good value 280mm" },
        "arctic_lf2_240": { name: "Arctic Liquid Freezer II 240", type: "CPU Cooler (AIO)", year: 2019, tdpRating: "280W", radiator: "240mm", fans: "2x 120mm P12", sockets: "1151, AM4", msrp: 80, notes: "Value king" },
        "arctic_lf2_280": { name: "Arctic Liquid Freezer II 280", type: "CPU Cooler (AIO)", year: 2019, tdpRating: "350W", radiator: "280mm", fans: "2x 140mm P14", sockets: "1151, AM4", msrp: 90, notes: "Best value 280" },
        "arctic_lf2_360": { name: "Arctic Liquid Freezer II 360", type: "CPU Cooler (AIO)", year: 2019, tdpRating: "350W+", radiator: "360mm", fans: "3x 120mm P12", sockets: "1151, AM4", msrp: 110, notes: "Best value 360" },
        "ek_aio_240": { name: "EK-AIO 240 D-RGB", type: "CPU Cooler (AIO)", year: 2019, tdpRating: "280W", radiator: "240mm", fans: "2x 120mm Vardar", sockets: "1151, AM4", msrp: 130, notes: "Premium AIO" },
    },
    "2020-2024": {
        // Air coolers
        "deepcool_ak620": { name: "DeepCool AK620", type: "CPU Cooler (Air)", year: 2021, tdpRating: "260W", height: "160mm", fans: "2x 120mm", sockets: "LGA1700, AM5, AM4", msrp: 65, notes: "D15 killer value" },
        "deepcool_ak500": { name: "DeepCool AK500 Digital", type: "CPU Cooler (Air)", year: 2023, tdpRating: "220W", height: "164mm", fans: "1x 120mm", sockets: "LGA1700, AM5", msrp: 70, notes: "Digital display" },
        "deepcool_assassin4": { name: "DeepCool Assassin IV", type: "CPU Cooler (Air)", year: 2023, tdpRating: "280W", height: "164mm", fans: "2x 120mm/140mm", sockets: "LGA1700, AM5", msrp: 100, notes: "New flagship" },
        "thermalright_pa120": { name: "Thermalright Peerless Assassin 120", type: "CPU Cooler (Air)", year: 2021, tdpRating: "260W", height: "155mm", fans: "2x 120mm", sockets: "LGA1700, AM5", msrp: 41, notes: "Best value cooler" },
        "thermalright_pa120se": { name: "Thermalright PA120 SE", type: "CPU Cooler (Air)", year: 2022, tdpRating: "250W", height: "155mm", fans: "2x 120mm", sockets: "LGA1700, AM5", msrp: 35, notes: "Budget king" },
        "thermalright_fc140": { name: "Thermalright Frost Commander 140", type: "CPU Cooler (Air)", year: 2022, tdpRating: "280W", height: "167mm", fans: "2x 140mm TL-D14X", sockets: "LGA1700, AM5", msrp: 60, notes: "D15 rival" },
        "bequiet_dark_rock_pro_5": { name: "be quiet! Dark Rock Pro 5", type: "CPU Cooler (Air)", year: 2023, tdpRating: "270W", height: "168mm", fans: "2x 120mm/135mm", sockets: "LGA1700, AM5", msrp: 90, notes: "Silent flagship" },
        "noctua_nh_u12a_chromax": { name: "Noctua NH-U12A chromax.black", type: "CPU Cooler (Air)", year: 2020, tdpRating: "200W", height: "158mm", fans: "2x 120mm NF-A12x25", sockets: "1200, AM4", msrp: 120, notes: "Black U12A" },
        "noctua_nh_d15s_chromax": { name: "Noctua NH-D15S chromax.black", type: "CPU Cooler (Air)", year: 2020, tdpRating: "220W", height: "160mm", fans: "1x 140mm NF-A15", sockets: "1200, AM4", msrp: 99, notes: "Black D15S" },
        "noctua_nh_p1": { name: "Noctua NH-P1", type: "CPU Cooler (Air)", year: 2021, tdpRating: "125W (passive)", height: "158mm", fans: "None (passive)", sockets: "LGA1700, AM5", msrp: 110, notes: "Passive cooler" },
        "cm_hyper_212_halo": { name: "Cooler Master Hyper 212 Halo", type: "CPU Cooler (Air)", year: 2023, tdpRating: "150W", height: "158mm", fans: "1x 120mm ARGB", sockets: "LGA1700, AM5", msrp: 45, notes: "RGB 212" },
        "id_cooling_se226xt": { name: "ID-COOLING SE-226-XT", type: "CPU Cooler (Air)", year: 2021, tdpRating: "200W", height: "158mm", fans: "1x 120mm", sockets: "LGA1700, AM5", msrp: 45, notes: "Budget single tower" },
        "arctic_freezer_36": { name: "Arctic Freezer 36", type: "CPU Cooler (Air)", year: 2024, tdpRating: "200W", height: "157mm", fans: "1x 120mm P12", sockets: "LGA1700, LGA1851, AM5", msrp: 30, notes: "New gen budget" },
        // AIO continued
        "corsair_h100i_elite": { name: "Corsair iCUE H100i Elite Capellix", type: "CPU Cooler (AIO)", year: 2020, tdpRating: "280W", radiator: "240mm", fans: "2x 120mm ML RGB", sockets: "1200, AM4", msrp: 150, notes: "Popular 240mm" },
        "corsair_h150i_elite": { name: "Corsair iCUE H150i Elite Capellix", type: "CPU Cooler (AIO)", year: 2020, tdpRating: "350W+", radiator: "360mm", fans: "3x 120mm ML RGB", sockets: "LGA1700, AM5", msrp: 190, notes: "Flagship 360mm" },
        "corsair_h170i_elite": { name: "Corsair iCUE H170i Elite", type: "CPU Cooler (AIO)", year: 2021, tdpRating: "350W+", radiator: "420mm", fans: "3x 140mm", sockets: "LGA1700, AM5", msrp: 250, notes: "420mm monster" },
        "nzxt_kraken_x53": { name: "NZXT Kraken X53", type: "CPU Cooler (AIO)", year: 2020, tdpRating: "220W", radiator: "240mm", fans: "2x 120mm Aer P", sockets: "LGA1700, AM5", msrp: 130, notes: "Updated Kraken" },
        "nzxt_kraken_x63": { name: "NZXT Kraken X63", type: "CPU Cooler (AIO)", year: 2020, tdpRating: "280W", radiator: "280mm", fans: "2x 140mm Aer P", sockets: "LGA1700, AM5", msrp: 150, notes: "Popular 280mm" },
        "nzxt_kraken_x73": { name: "NZXT Kraken X73", type: "CPU Cooler (AIO)", year: 2020, tdpRating: "350W", radiator: "360mm", fans: "3x 120mm Aer P", sockets: "LGA1700, AM5", msrp: 180, notes: "360mm Kraken" },
        "nzxt_kraken_z63": { name: "NZXT Kraken Z63", type: "CPU Cooler (AIO)", year: 2020, tdpRating: "280W", radiator: "280mm", fans: "2x 140mm", lcd: true, sockets: "LGA1700, AM5", msrp: 250, notes: "LCD pump head" },
        "nzxt_kraken_z73": { name: "NZXT Kraken Z73", type: "CPU Cooler (AIO)", year: 2020, tdpRating: "350W", radiator: "360mm", fans: "3x 120mm", lcd: true, sockets: "LGA1700, AM5", msrp: 300, notes: "LCD 360mm" },
        "nzxt_kraken_elite_360": { name: "NZXT Kraken Elite 360", type: "CPU Cooler (AIO)", year: 2023, tdpRating: "350W+", radiator: "360mm", fans: "3x 120mm F120 RGB", lcd: true, sockets: "LGA1700, AM5", msrp: 300, notes: "Latest Kraken" },
        "arctic_lf2_rev5": { name: "Arctic Liquid Freezer II Rev.5", type: "CPU Cooler (AIO)", year: 2023, tdpRating: "350W+", radiator: "360mm", fans: "3x 120mm P12", sockets: "LGA1700, AM5", msrp: 110, notes: "Improved pump" },
        "ek_nucleus_360": { name: "EK-Nucleus AIO CR360", type: "CPU Cooler (AIO)", year: 2023, tdpRating: "350W", radiator: "360mm", fans: "3x 120mm", sockets: "LGA1700, AM5", msrp: 180, notes: "EK premium" },
        "lian_li_galahad_ii": { name: "Lian Li Galahad II LCD 360", type: "CPU Cooler (AIO)", year: 2023, tdpRating: "350W+", radiator: "360mm", fans: "3x 120mm Infinity", lcd: true, sockets: "LGA1700, AM5", msrp: 250, notes: "LCD pump head" },
        "deepcool_lt720": { name: "DeepCool LT720", type: "CPU Cooler (AIO)", year: 2023, tdpRating: "350W", radiator: "360mm", fans: "3x 120mm FK120", sockets: "LGA1700, AM5", msrp: 140, notes: "Value 360mm" },
        "msi_coreliquid_360": { name: "MSI MAG CoreLiquid 360R V2", type: "CPU Cooler (AIO)", year: 2022, tdpRating: "350W", radiator: "360mm", fans: "3x 120mm", sockets: "LGA1700, AM5", msrp: 120, notes: "MSI value AIO" },
        "asus_rog_ryujin_iii": { name: "ASUS ROG Ryujin III 360", type: "CPU Cooler (AIO)", year: 2023, tdpRating: "350W+", radiator: "360mm", fans: "3x 120mm Noctua", lcd: true, sockets: "LGA1700, AM5", msrp: 400, notes: "Premium LCD AIO" },
    }
};

export const COOLER_CUSTOM_PARTS = {};

export const COOLER_PARTS = {
    ...COOLER_BY_ERA['2000-2009'],
    ...COOLER_BY_ERA['2010-2014'],
    ...COOLER_BY_ERA['2015-2019'],
    ...COOLER_BY_ERA['2020-2024'],
    ...COOLER_BY_ERA['2025'],
    ...COOLER_CUSTOM_PARTS,
};

export default {
    COOLER_BY_ERA,
    COOLER_PARTS,
};
