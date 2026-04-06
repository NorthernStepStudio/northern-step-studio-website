/**
 * RAM components (2000-2025).
 * Split by era for quick filtering.
 * ~200+ RAM kits across all DDR generations
 */

export const RAM_BY_ERA = {
    "2025": {
        // DDR5-8000+ kits
        "corsair_dom_plat_8000": { name: "Corsair Dominator Platinum DDR5-8000", type: "RAM", year: 2024, speed: 8000, timing: "CL38", capacity: "32GB (2x16GB)", voltage: "1.45V", msrp: 400, notes: "Ultra enthusiast DDR5." },
        "gskill_tz5_8400": { name: "G.Skill Trident Z5 RGB DDR5-8400", type: "RAM", year: 2024, speed: 8400, timing: "CL40", capacity: "32GB (2x16GB)", voltage: "1.45V", msrp: 450, notes: "Extreme speed DDR5." },
        "kingston_fury_8000": { name: "Kingston Fury Beast DDR5-8000", type: "RAM", year: 2024, speed: 8000, timing: "CL38", capacity: "32GB (2x16GB)", voltage: "1.45V", msrp: 350, notes: "High-speed value DDR5." },
    },
    "2000-2009": {
        // DDR1 (2000-2004)
        "corsair_xms_ddr400": { name: "Corsair XMS DDR-400", type: "RAM", year: 2002, speed: 400, timing: "CL2", capacity: "512MB", voltage: "2.6V", msrp: 80, notes: "Early enthusiast DDR." },
        "kingston_valueram_ddr400": { name: "Kingston ValueRAM DDR-400", type: "RAM", year: 2002, speed: 400, timing: "CL3", capacity: "512MB", voltage: "2.5V", msrp: 50, notes: "Reliable budget DDR." },
        "ocz_platinum_ddr400": { name: "OCZ Platinum DDR-400", type: "RAM", year: 2003, speed: 400, timing: "CL2", capacity: "512MB", voltage: "2.6V", msrp: 90, notes: "OCer favorite." },
        "geil_ultra_ddr400": { name: "GeIL Ultra DDR-400", type: "RAM", year: 2003, speed: 400, timing: "CL2.5", capacity: "1GB", voltage: "2.6V", msrp: 120, notes: "High capacity DDR1." },
        "crucial_ddr400": { name: "Crucial DDR-400", type: "RAM", year: 2003, speed: 400, timing: "CL3", capacity: "512MB", voltage: "2.5V", msrp: 45, notes: "Reliable Micron chips." },
        // DDR2 (2004-2009)
        "corsair_xms2_ddr2_800": { name: "Corsair XMS2 DDR2-800", type: "RAM", year: 2006, speed: 800, timing: "CL4", capacity: "2GB (2x1GB)", voltage: "1.9V", msrp: 100, notes: "Popular DDR2 kit." },
        "gskill_ddr2_800": { name: "G.Skill DDR2-800", type: "RAM", year: 2006, speed: 800, timing: "CL5", capacity: "2GB (2x1GB)", voltage: "1.8V", msrp: 70, notes: "Budget DDR2." },
        "ocz_reaper_ddr2_1066": { name: "OCZ Reaper DDR2-1066", type: "RAM", year: 2007, speed: 1066, timing: "CL5", capacity: "2GB (2x1GB)", voltage: "2.1V", msrp: 150, notes: "Enthusiast DDR2." },
        "patriot_extreme_ddr2": { name: "Patriot Extreme DDR2-800", type: "RAM", year: 2006, speed: 800, timing: "CL4", capacity: "2GB (2x1GB)", voltage: "2.0V", msrp: 90, notes: "OC focused." },
        "kingston_hyperx_ddr2": { name: "Kingston HyperX DDR2-800", type: "RAM", year: 2006, speed: 800, timing: "CL4", capacity: "2GB (2x1GB)", voltage: "1.9V", msrp: 95, notes: "Reliable enthusiast DDR2." },
        "corsair_dominator_ddr2": { name: "Corsair Dominator DDR2-1066", type: "RAM", year: 2007, speed: 1066, timing: "CL5", capacity: "2GB (2x1GB)", voltage: "2.1V", msrp: 200, notes: "Premium DDR2 with DHX." },
        "gskill_ddr2_1066": { name: "G.Skill DDR2-1066", type: "RAM", year: 2007, speed: 1066, timing: "CL5", capacity: "4GB (2x2GB)", voltage: "2.0V", msrp: 180, notes: "High capacity DDR2." },
        "crucial_ballistix_ddr2": { name: "Crucial Ballistix DDR2-800", type: "RAM", year: 2006, speed: 800, timing: "CL4", capacity: "2GB (2x1GB)", voltage: "2.0V", msrp: 85, notes: "OC friendly." },
        // DDR3 Early (2007-2009)
        "corsair_dom_ddr3_1600": { name: "Corsair Dominator DDR3-1600", type: "RAM", year: 2008, speed: 1600, timing: "CL7", capacity: "4GB (2x2GB)", voltage: "1.65V", msrp: 200, notes: "Early premium DDR3." },
        "ocz_gold_ddr3_1333": { name: "OCZ Gold DDR3-1333", type: "RAM", year: 2008, speed: 1333, timing: "CL9", capacity: "4GB (2x2GB)", voltage: "1.5V", msrp: 100, notes: "Early DDR3." },
        "gskill_ddr3_1333": { name: "G.Skill DDR3-1333", type: "RAM", year: 2008, speed: 1333, timing: "CL9", capacity: "4GB (2x2GB)", voltage: "1.5V", msrp: 80, notes: "Value DDR3." },
        "kingston_hyperx_ddr3": { name: "Kingston HyperX DDR3-1600", type: "RAM", year: 2009, speed: 1600, timing: "CL9", capacity: "4GB (2x2GB)", voltage: "1.65V", msrp: 130, notes: "Reliable DDR3." },
    },
    "2010-2014": {
        // DDR3 Peak Era
        "corsair_vengeance_1600": { name: "Corsair Vengeance DDR3-1600", type: "RAM", year: 2011, speed: 1600, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 80, notes: "Legendary DDR3 kit." },
        "corsair_vengeance_1866": { name: "Corsair Vengeance DDR3-1866", type: "RAM", year: 2012, speed: 1866, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 90, notes: "Popular enthusiast." },
        "corsair_vengeance_2133": { name: "Corsair Vengeance Pro DDR3-2133", type: "RAM", year: 2013, speed: 2133, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 110, notes: "Fast DDR3." },
        "corsair_dom_plat_2400": { name: "Corsair Dominator Platinum DDR3-2400", type: "RAM", year: 2013, speed: 2400, timing: "CL10", capacity: "16GB (2x8GB)", voltage: "1.65V", msrp: 350, notes: "Premium DDR3." },
        "gskill_ripjaws_1600": { name: "G.Skill Ripjaws DDR3-1600", type: "RAM", year: 2010, speed: 1600, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 60, notes: "Best value DDR3." },
        "gskill_ripjaws_1866": { name: "G.Skill Ripjaws X DDR3-1866", type: "RAM", year: 2011, speed: 1866, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 70, notes: "Great value." },
        "gskill_ripjaws_2133": { name: "G.Skill Ripjaws X DDR3-2133", type: "RAM", year: 2012, speed: 2133, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.6V", msrp: 90, notes: "Fast value kit." },
        "gskill_tridentx_2400": { name: "G.Skill TridentX DDR3-2400", type: "RAM", year: 2013, speed: 2400, timing: "CL10", capacity: "16GB (2x8GB)", voltage: "1.65V", msrp: 200, notes: "Enthusiast DDR3." },
        "gskill_tridentx_2666": { name: "G.Skill TridentX DDR3-2666", type: "RAM", year: 2014, speed: 2666, timing: "CL11", capacity: "8GB (2x4GB)", voltage: "1.65V", msrp: 180, notes: "Extreme DDR3." },
        "kingston_hyperx_fury_1600": { name: "Kingston HyperX Fury DDR3-1600", type: "RAM", year: 2014, speed: 1600, timing: "CL10", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 65, notes: "Auto-OC feature." },
        "kingston_hyperx_fury_1866": { name: "Kingston HyperX Fury DDR3-1866", type: "RAM", year: 2014, speed: 1866, timing: "CL10", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 75, notes: "Popular upgrade." },
        "kingston_beast_2133": { name: "Kingston HyperX Beast DDR3-2133", type: "RAM", year: 2013, speed: 2133, timing: "CL11", capacity: "16GB (2x8GB)", voltage: "1.6V", msrp: 150, notes: "High capacity." },
        "crucial_ballistix_sport_1600": { name: "Crucial Ballistix Sport DDR3-1600", type: "RAM", year: 2012, speed: 1600, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 55, notes: "Great Micron chips." },
        "crucial_ballistix_tactical_1866": { name: "Crucial Ballistix Tactical DDR3-1866", type: "RAM", year: 2013, speed: 1866, timing: "CL9", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 80, notes: "Good OC potential." },
        "crucial_ballistix_elite_2133": { name: "Crucial Ballistix Elite DDR3-2133", type: "RAM", year: 2014, speed: 2133, timing: "CL11", capacity: "16GB (2x8GB)", voltage: "1.6V", msrp: 170, notes: "Premium Crucial kit." },
        "teamgroup_elite_1600": { name: "TeamGroup Elite DDR3-1600", type: "RAM", year: 2012, speed: 1600, timing: "CL11", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 45, notes: "Ultra budget." },
        "teamgroup_vulcan_1866": { name: "TeamGroup Vulcan DDR3-1866", type: "RAM", year: 2013, speed: 1866, timing: "CL10", capacity: "8GB (2x4GB)", voltage: "1.5V", msrp: 60, notes: "Budget gaming." },
        "patriot_viper_2133": { name: "Patriot Viper 3 DDR3-2133", type: "RAM", year: 2013, speed: 2133, timing: "CL11", capacity: "8GB (2x4GB)", voltage: "1.6V", msrp: 90, notes: "Aggressive styling." },
        "adata_xpg_2133": { name: "ADATA XPG V2 DDR3-2133", type: "RAM", year: 2013, speed: 2133, timing: "CL10", capacity: "8GB (2x4GB)", voltage: "1.6V", msrp: 85, notes: "Value enthusiast." },
        // DDR4 Early (2014)
        "corsair_vengeance_lpx_2133": { name: "Corsair Vengeance LPX DDR4-2133", type: "RAM", year: 2014, speed: 2133, timing: "CL13", capacity: "16GB (2x8GB)", voltage: "1.2V", msrp: 200, notes: "First DDR4 kit." },
        "gskill_ripjaws_4_2400": { name: "G.Skill Ripjaws 4 DDR4-2400", type: "RAM", year: 2014, speed: 2400, timing: "CL15", capacity: "16GB (4x4GB)", voltage: "1.2V", msrp: 220, notes: "Early DDR4." },
        "crucial_ddr4_2133": { name: "Crucial DDR4-2133", type: "RAM", year: 2014, speed: 2133, timing: "CL15", capacity: "16GB (2x8GB)", voltage: "1.2V", msrp: 180, notes: "First Micron DDR4." },
    },
    "2015-2019": {
        // DDR4 Peak Era
        "corsair_vengeance_lpx_2666": { name: "Corsair Vengeance LPX DDR4-2666", type: "RAM", year: 2015, speed: 2666, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.2V", msrp: 90, notes: "Popular entry DDR4." },
        "corsair_vengeance_lpx_3000": { name: "Corsair Vengeance LPX DDR4-3000", type: "RAM", year: 2016, speed: 3000, timing: "CL15", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 100, notes: "Sweet spot DDR4." },
        "corsair_vengeance_lpx_3200": { name: "Corsair Vengeance LPX DDR4-3200", type: "RAM", year: 2017, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 85, notes: "Standard gaming RAM." },
        "corsair_vengeance_lpx_3600": { name: "Corsair Vengeance LPX DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL18", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 100, notes: "Ryzen optimal." },
        "corsair_vengeance_rgb_pro_3200": { name: "Corsair Vengeance RGB Pro DDR4-3200", type: "RAM", year: 2018, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 100, notes: "Popular RGB." },
        "corsair_vengeance_rgb_pro_3600": { name: "Corsair Vengeance RGB Pro DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL18", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 180, notes: "RGB enthusiast." },
        "corsair_dominator_3600": { name: "Corsair Dominator Platinum RGB DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL16", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 280, notes: "Premium DDR4." },
        "gskill_tridentz_3200": { name: "G.Skill Trident Z DDR4-3200", type: "RAM", year: 2016, speed: 3200, timing: "CL14", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 150, notes: "Samsung B-die." },
        "gskill_tridentz_3600": { name: "G.Skill Trident Z DDR4-3600", type: "RAM", year: 2017, speed: 3600, timing: "CL15", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 180, notes: "Premium B-die." },
        "gskill_tridentz_rgb_3200": { name: "G.Skill Trident Z RGB DDR4-3200", type: "RAM", year: 2017, speed: 3200, timing: "CL14", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 170, notes: "Popular RGB kit." },
        "gskill_tridentz_rgb_3600": { name: "G.Skill Trident Z RGB DDR4-3600", type: "RAM", year: 2018, speed: 3600, timing: "CL16", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 200, notes: "High capacity RGB." },
        "gskill_tridentz_neo_3600": { name: "G.Skill Trident Z Neo DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL16", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 180, notes: "Ryzen optimized." },
        "gskill_tridentz_4000": { name: "G.Skill Trident Z RGB DDR4-4000", type: "RAM", year: 2019, speed: 4000, timing: "CL17", capacity: "16GB (2x8GB)", voltage: "1.4V", msrp: 200, notes: "Enthusiast speed." },
        "gskill_ripjaws_v_3200": { name: "G.Skill Ripjaws V DDR4-3200", type: "RAM", year: 2016, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 75, notes: "Best value DDR4." },
        "gskill_ripjaws_v_3600": { name: "G.Skill Ripjaws V DDR4-3600", type: "RAM", year: 2018, speed: 3600, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 85, notes: "Value sweet spot." },
        "kingston_fury_beast_3200": { name: "Kingston Fury Beast DDR4-3200", type: "RAM", year: 2017, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 70, notes: "Budget gaming." },
        "kingston_fury_beast_3600": { name: "Kingston Fury Beast DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL18", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 80, notes: "Value DDR4." },
        "crucial_ballistix_3200": { name: "Crucial Ballistix DDR4-3200", type: "RAM", year: 2019, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 75, notes: "Great OC on Micron Rev.E." },
        "crucial_ballistix_3600": { name: "Crucial Ballistix DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 85, notes: "Enthusiast favorite." },
        "crucial_ballistix_rgb_3200": { name: "Crucial Ballistix RGB DDR4-3200", type: "RAM", year: 2019, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 90, notes: "RGB with good ICs." },
        "teamgroup_tforce_vulcan_3200": { name: "TeamGroup T-Force Vulcan DDR4-3200", type: "RAM", year: 2017, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 65, notes: "Budget value." },
        "teamgroup_tforce_delta_rgb_3200": { name: "TeamGroup T-Force Delta RGB DDR4-3200", type: "RAM", year: 2018, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 80, notes: "Budget RGB." },
        "patriot_viper_steel_3600": { name: "Patriot Viper Steel DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL17", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 80, notes: "Value performance." },
        "patriot_viper_rgb_3600": { name: "Patriot Viper RGB DDR4-3600", type: "RAM", year: 2019, speed: 3600, timing: "CL18", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 85, notes: "Budget RGB gaming." },
        "adata_xpg_spectrix_3200": { name: "ADATA XPG Spectrix D60G DDR4-3200", type: "RAM", year: 2019, speed: 3200, timing: "CL16", capacity: "16GB (2x8GB)", voltage: "1.35V", msrp: 85, notes: "Unique RGB design." },
    },
    "2020-2024": {
        // DDR4 continued
        "corsair_vengeance_lpx_3200_2020": { name: "Corsair Vengeance LPX DDR4-3200 (2020)", type: "RAM", year: 2020, speed: 3200, timing: "CL16", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 130, notes: "Updated 32GB kit." },
        "corsair_vengeance_lpx_3600_2020": { name: "Corsair Vengeance LPX DDR4-3600 (2020)", type: "RAM", year: 2020, speed: 3600, timing: "CL18", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 150, notes: "High capacity gaming." },
        "gskill_ripjaws_v_3200_32gb": { name: "G.Skill Ripjaws V DDR4-3200 32GB", type: "RAM", year: 2020, speed: 3200, timing: "CL16", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 110, notes: "Best value 32GB." },
        "gskill_ripjaws_v_3600_32gb": { name: "G.Skill Ripjaws V DDR4-3600 32GB", type: "RAM", year: 2021, speed: 3600, timing: "CL16", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 130, notes: "Sweet spot 32GB." },
        "gskill_tridentz_neo_3600_32gb": { name: "G.Skill Trident Z Neo DDR4-3600 32GB", type: "RAM", year: 2020, speed: 3600, timing: "CL16", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 180, notes: "Ryzen optimal 32GB." },
        "crucial_ballistix_max_4400": { name: "Crucial Ballistix MAX DDR4-4400", type: "RAM", year: 2020, speed: 4400, timing: "CL19", capacity: "16GB (2x8GB)", voltage: "1.4V", msrp: 200, notes: "Extreme DDR4 speed." },
        "teamgroup_tforce_dark_za_3600": { name: "TeamGroup T-Force Dark Za DDR4-3600", type: "RAM", year: 2020, speed: 3600, timing: "CL18", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 110, notes: "Great value 32GB." },
        // DDR5 Era
        "corsair_vengeance_ddr5_4800": { name: "Corsair Vengeance DDR5-4800", type: "RAM", year: 2021, speed: 4800, timing: "CL40", capacity: "32GB (2x16GB)", voltage: "1.1V", msrp: 180, notes: "First DDR5." },
        "corsair_vengeance_ddr5_5200": { name: "Corsair Vengeance DDR5-5200", type: "RAM", year: 2022, speed: 5200, timing: "CL40", capacity: "32GB (2x16GB)", voltage: "1.25V", msrp: 160, notes: "Entry DDR5." },
        "corsair_vengeance_ddr5_5600": { name: "Corsair Vengeance DDR5-5600", type: "RAM", year: 2022, speed: 5600, timing: "CL36", capacity: "32GB (2x16GB)", voltage: "1.25V", msrp: 150, notes: "Solid DDR5." },
        "corsair_vengeance_ddr5_6000": { name: "Corsair Vengeance DDR5-6000", type: "RAM", year: 2023, speed: 6000, timing: "CL30", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 150, notes: "Sweet spot DDR5." },
        "corsair_vengeance_rgb_ddr5_6000": { name: "Corsair Vengeance RGB DDR5-6000", type: "RAM", year: 2023, speed: 6000, timing: "CL30", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 170, notes: "RGB DDR5." },
        "corsair_dominator_plat_ddr5_6400": { name: "Corsair Dominator Platinum DDR5-6400", type: "RAM", year: 2023, speed: 6400, timing: "CL32", capacity: "32GB (2x16GB)", voltage: "1.4V", msrp: 280, notes: "Premium DDR5." },
        "corsair_dominator_plat_ddr5_7200": { name: "Corsair Dominator Platinum DDR5-7200", type: "RAM", year: 2024, speed: 7200, timing: "CL34", capacity: "32GB (2x16GB)", voltage: "1.4V", msrp: 350, notes: "High-end DDR5." },
        "gskill_tridentz5_5600": { name: "G.Skill Trident Z5 DDR5-5600", type: "RAM", year: 2022, speed: 5600, timing: "CL36", capacity: "32GB (2x16GB)", voltage: "1.25V", msrp: 150, notes: "Solid DDR5." },
        "gskill_tridentz5_6000": { name: "G.Skill Trident Z5 DDR5-6000", type: "RAM", year: 2022, speed: 6000, timing: "CL30", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 160, notes: "Popular DDR5." },
        "gskill_tridentz5_rgb_6000": { name: "G.Skill Trident Z5 RGB DDR5-6000", type: "RAM", year: 2022, speed: 6000, timing: "CL30", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 180, notes: "RGB enthusiast DDR5." },
        "gskill_tridentz5_6400": { name: "G.Skill Trident Z5 DDR5-6400", type: "RAM", year: 2023, speed: 6400, timing: "CL32", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 180, notes: "Fast DDR5." },
        "gskill_tridentz5_rgb_6800": { name: "G.Skill Trident Z5 RGB DDR5-6800", type: "RAM", year: 2023, speed: 6800, timing: "CL34", capacity: "32GB (2x16GB)", voltage: "1.4V", msrp: 220, notes: "High-speed DDR5." },
        "gskill_tridentz5_rgb_7200": { name: "G.Skill Trident Z5 RGB DDR5-7200", type: "RAM", year: 2024, speed: 7200, timing: "CL34", capacity: "32GB (2x16GB)", voltage: "1.4V", msrp: 280, notes: "Enthusiast DDR5." },
        "gskill_tridentz5_rgb_7600": { name: "G.Skill Trident Z5 RGB DDR5-7600", type: "RAM", year: 2024, speed: 7600, timing: "CL36", capacity: "32GB (2x16GB)", voltage: "1.45V", msrp: 350, notes: "Ultra enthusiast." },
        "gskill_flare_x5_6000": { name: "G.Skill Flare X5 DDR5-6000", type: "RAM", year: 2023, speed: 6000, timing: "CL30", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 150, notes: "AMD EXPO optimized." },
        "kingston_fury_beast_ddr5_5200": { name: "Kingston Fury Beast DDR5-5200", type: "RAM", year: 2022, speed: 5200, timing: "CL40", capacity: "32GB (2x16GB)", voltage: "1.25V", msrp: 120, notes: "Budget DDR5." },
        "kingston_fury_beast_ddr5_5600": { name: "Kingston Fury Beast DDR5-5600", type: "RAM", year: 2022, speed: 5600, timing: "CL40", capacity: "32GB (2x16GB)", voltage: "1.25V", msrp: 130, notes: "Value DDR5." },
        "kingston_fury_beast_ddr5_6000": { name: "Kingston Fury Beast DDR5-6000", type: "RAM", year: 2023, speed: 6000, timing: "CL36", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 140, notes: "Best value DDR5." },
        "kingston_fury_renegade_ddr5_6400": { name: "Kingston Fury Renegade DDR5-6400", type: "RAM", year: 2023, speed: 6400, timing: "CL32", capacity: "32GB (2x16GB)", voltage: "1.4V", msrp: 200, notes: "Enthusiast Kingston." },
        "kingston_fury_renegade_ddr5_7200": { name: "Kingston Fury Renegade DDR5-7200", type: "RAM", year: 2024, speed: 7200, timing: "CL38", capacity: "32GB (2x16GB)", voltage: "1.45V", msrp: 280, notes: "High-speed Kingston." },
        "teamgroup_tforce_delta_ddr5_5600": { name: "TeamGroup T-Force Delta DDR5-5600", type: "RAM", year: 2022, speed: 5600, timing: "CL40", capacity: "32GB (2x16GB)", voltage: "1.25V", msrp: 110, notes: "Budget RGB DDR5." },
        "teamgroup_tforce_delta_ddr5_6000": { name: "TeamGroup T-Force Delta DDR5-6000", type: "RAM", year: 2023, speed: 6000, timing: "CL30", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 130, notes: "Value sweet spot." },
        "teamgroup_tforce_delta_ddr5_6400": { name: "TeamGroup T-Force Delta RGB DDR5-6400", type: "RAM", year: 2023, speed: 6400, timing: "CL32", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 150, notes: "Good value RGB." },
        "crucial_ddr5_4800": { name: "Crucial DDR5-4800", type: "RAM", year: 2021, speed: 4800, timing: "CL40", capacity: "32GB (2x16GB)", voltage: "1.1V", msrp: 120, notes: "JEDEC DDR5." },
        "crucial_ddr5_5600": { name: "Crucial DDR5-5600", type: "RAM", year: 2023, speed: 5600, timing: "CL46", capacity: "32GB (2x16GB)", voltage: "1.1V", msrp: 100, notes: "Budget DDR5." },
        "crucial_pro_ddr5_6000": { name: "Crucial Pro DDR5-6000", type: "RAM", year: 2024, speed: 6000, timing: "CL36", capacity: "32GB (2x16GB)", voltage: "1.35V", msrp: 130, notes: "New budget line." },
    }
};

export const RAM_CUSTOM_PARTS = {};

export const RAM_PARTS = {
    ...RAM_BY_ERA['2000-2009'],
    ...RAM_BY_ERA['2010-2014'],
    ...RAM_BY_ERA['2015-2019'],
    ...RAM_BY_ERA['2020-2024'],
    ...RAM_BY_ERA['2025'],
    ...RAM_CUSTOM_PARTS,
};

export default {
    RAM_BY_ERA,
    RAM_PARTS,
};
