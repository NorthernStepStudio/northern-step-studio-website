/**
 * CASE components (2000-2025).
 * Split by era for quick filtering.
 * ~150+ cases across all eras
 */

export const CASE_BY_ERA = {
    "2025": {
        "corsair_3500x": { name: "Corsair 3500X", type: "Case", year: 2024, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "3x 120mm included", airflow: "mesh", msrp: 130, notes: "Compact reverse connector" },
        "corsair_6500x": { name: "Corsair 6500X", type: "Case", year: 2024, formFactor: "ATX Mid-Tower", material: "Steel + Dual Glass", cooling: "3x 140mm included", airflow: "mesh", msrp: 190, notes: "Dual chamber design" },
        "lian_li_o11_vision": { name: "Lian Li O11 Vision", type: "Case", year: 2024, formFactor: "ATX Mid-Tower", material: "Aluminum + Glass", cooling: "0 fans included", airflow: "open", msrp: 200, notes: "Pillarless glass design" },
    },
    "2000-2009": {
        // Antec Era
        "antec_900": { name: "Antec Nine Hundred", type: "Case", year: 2007, formFactor: "ATX Mid-Tower", material: "Steel + Plastic", cooling: "4x fans included", airflow: "excellent", msrp: 100, notes: "Legendary gaming case" },
        "antec_1200": { name: "Antec Twelve Hundred", type: "Case", year: 2008, formFactor: "ATX Full-Tower", material: "Steel", cooling: "5x fans included", airflow: "excellent", msrp: 160, notes: "Full tower version" },
        "antec_p180": { name: "Antec P180", type: "Case", year: 2005, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "2x 120mm", airflow: "quiet", msrp: 140, notes: "Silent case pioneer" },
        "antec_p182": { name: "Antec P182", type: "Case", year: 2006, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x 120mm", airflow: "quiet", msrp: 160, notes: "Updated P180" },
        "antec_sonata_iii": { name: "Antec Sonata III", type: "Case", year: 2007, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "2x 120mm", bundledPSU: "500W", msrp: 130, notes: "Included PSU" },
        "antec_super_lanboy": { name: "Antec Super Lanboy", type: "Case", year: 2004, formFactor: "ATX Mid-Tower", material: "Aluminum", cooling: "2x 80mm", airflow: "moderate", msrp: 100, notes: "LAN party case" },
        // Cooler Master
        "cm_stacker": { name: "Cooler Master Stacker 830", type: "Case", year: 2004, formFactor: "ATX Full-Tower", material: "Aluminum", cooling: "4x 120mm", airflow: "excellent", msrp: 300, notes: "Modular enthusiast" },
        "cm_cosmos": { name: "Cooler Master Cosmos", type: "Case", year: 2007, formFactor: "ATX Full-Tower", material: "Aluminum + Steel", cooling: "4x fans", airflow: "excellent", msrp: 250, notes: "Premium flagship" },
        "cm_cosmos_1000": { name: "Cooler Master Cosmos 1000", type: "Case", year: 2008, formFactor: "ATX Full-Tower", material: "Aluminum", cooling: "4x fans", airflow: "excellent", msrp: 280, notes: "Iconic handles" },
        "cm_haf_932": { name: "Cooler Master HAF 932", type: "Case", year: 2009, formFactor: "ATX Full-Tower", material: "Steel", cooling: "5x fans (230mm front)", airflow: "extreme", msrp: 160, notes: "High Airflow" },
        "cm_rc690": { name: "Cooler Master RC-690", type: "Case", year: 2007, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x 120mm", airflow: "good", msrp: 90, notes: "Value choice" },
        "cm_centurion": { name: "Cooler Master Centurion 5", type: "Case", year: 2005, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "2x 120mm", airflow: "moderate", msrp: 60, notes: "Budget gaming" },
        // Lian Li
        "lianli_pc60": { name: "Lian Li PC-60", type: "Case", year: 2003, formFactor: "ATX Mid-Tower", material: "Aluminum", cooling: "2x 80mm", airflow: "moderate", msrp: 150, notes: "Early aluminum" },
        "lianli_pc65": { name: "Lian Li PC-65", type: "Case", year: 2005, formFactor: "ATX Mid-Tower", material: "Aluminum", cooling: "2x 120mm", airflow: "good", msrp: 180, notes: "Premium build" },
        "lianli_pc70": { name: "Lian Li PC-70", type: "Case", year: 2006, formFactor: "ATX Mid-Tower", material: "Aluminum", cooling: "3x 120mm", airflow: "good", msrp: 200, notes: "Quality aluminum" },
        "lianli_pc7b": { name: "Lian Li PC-7B", type: "Case", year: 2007, formFactor: "ATX Mid-Tower", material: "Aluminum", cooling: "3x 120mm", airflow: "good", msrp: 160, notes: "Popular model" },
        // Silverstone
        "silverstone_tj07": { name: "Silverstone Temjin TJ07", type: "Case", year: 2006, formFactor: "ATX Full-Tower", material: "Aluminum", cooling: "4x 120mm", airflow: "excellent", msrp: 350, notes: "Water cooling legend" },
        "silverstone_tj09": { name: "Silverstone TJ09", type: "Case", year: 2007, formFactor: "ATX Full-Tower", material: "Aluminum", cooling: "4x 120mm", airflow: "excellent", msrp: 320, notes: "Updated TJ07" },
        "silverstone_ft01": { name: "Silverstone Fortress FT01", type: "Case", year: 2008, formFactor: "ATX Mid-Tower", material: "Aluminum", cooling: "3x 180mm", airflow: "rotated 90°", msrp: 250, notes: "Unique airflow" },
        // NZXT
        "nzxt_tempest": { name: "NZXT Tempest", type: "Case", year: 2008, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "6x fans included", airflow: "extreme", msrp: 120, notes: "NZXT early hit" },
        "nzxt_apollo": { name: "NZXT Apollo", type: "Case", year: 2009, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "1x 120mm", airflow: "moderate", msrp: 60, notes: "Budget NZXT" },
        // Thermaltake
        "tt_armor": { name: "Thermaltake Armor", type: "Case", year: 2005, formFactor: "ATX Full-Tower", material: "Steel", cooling: "3x fans", airflow: "good", msrp: 120, notes: "Gaming focused" },
        "tt_kandalf": { name: "Thermaltake Kandalf", type: "Case", year: 2006, formFactor: "ATX Full-Tower", material: "Aluminum", cooling: "4x fans", airflow: "excellent", msrp: 250, notes: "LCS compatible" },
        "tt_v1": { name: "Thermaltake Spedo", type: "Case", year: 2008, formFactor: "ATX Full-Tower", material: "Steel", cooling: "5x fans", airflow: "excellent", msrp: 180, notes: "Aggressive styling" },
        // Budget
        "rosewill_challenger": { name: "Rosewill Challenger", type: "Case", year: 2009, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x fans", airflow: "good", msrp: 50, notes: "Budget king" },
        "nzxt_gamma": { name: "NZXT Gamma", type: "Case", year: 2009, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "1x 120mm", airflow: "moderate", msrp: 40, notes: "Ultra budget" },
    },
    "2010-2014": {
        // Corsair enters
        "corsair_800d": { name: "Corsair Obsidian 800D", type: "Case", year: 2010, formFactor: "ATX Full-Tower", material: "Aluminum + Steel", cooling: "4x fans", airflow: "excellent", msrp: 350, notes: "Corsair flagship" },
        "corsair_650d": { name: "Corsair Obsidian 650D", type: "Case", year: 2011, formFactor: "ATX Mid-Tower", material: "Aluminum + Steel", cooling: "3x fans", airflow: "good", msrp: 180, notes: "Premium mid-tower" },
        "corsair_600t": { name: "Corsair Graphite 600T", type: "Case", year: 2011, formFactor: "ATX Mid-Tower", material: "Steel + Mesh", cooling: "3x 200mm fans", airflow: "excellent", msrp: 180, notes: "Elegant design" },
        "corsair_350d": { name: "Corsair Obsidian 350D", type: "Case", year: 2013, formFactor: "Micro-ATX", material: "Aluminum + Steel", cooling: "2x 140mm", airflow: "good", msrp: 100, notes: "mATX premium" },
        "corsair_450d": { name: "Corsair Obsidian 450D", type: "Case", year: 2014, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x fans", airflow: "good", msrp: 120, notes: "Mid-range Obsidian" },
        "corsair_air540": { name: "Corsair Air 540", type: "Case", year: 2013, formFactor: "ATX Cube", material: "Steel", cooling: "3x 140mm", airflow: "excellent", msrp: 150, notes: "Cube case pioneer" },
        "corsair_air240": { name: "Corsair Air 240", type: "Case", year: 2014, formFactor: "Micro-ATX Cube", material: "Steel", cooling: "2x 120mm", airflow: "good", msrp: 90, notes: "mATX cube" },
        "corsair_250d": { name: "Corsair Obsidian 250D", type: "Case", year: 2014, formFactor: "Mini-ITX", material: "Steel + Aluminum", cooling: "1x 140mm", airflow: "good", msrp: 90, notes: "ITX premium" },
        "corsair_spec03": { name: "Corsair SPEC-03", type: "Case", year: 2014, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "2x 120mm", airflow: "moderate", msrp: 60, notes: "Budget gaming" },
        // NZXT rise
        "nzxt_phantom": { name: "NZXT Phantom", type: "Case", year: 2010, formFactor: "ATX Full-Tower", material: "Steel + Plastic", cooling: "4x fans", airflow: "excellent", msrp: 130, notes: "Iconic design" },
        "nzxt_phantom_410": { name: "NZXT Phantom 410", type: "Case", year: 2012, formFactor: "ATX Mid-Tower", material: "Steel + Plastic", cooling: "3x fans", airflow: "good", msrp: 100, notes: "Popular mid-tower" },
        "nzxt_switch_810": { name: "NZXT Switch 810", type: "Case", year: 2012, formFactor: "ATX Full-Tower", material: "Steel", cooling: "4x fans", airflow: "excellent", msrp: 180, notes: "Hybrid design" },
        "nzxt_h440": { name: "NZXT H440", type: "Case", year: 2014, formFactor: "ATX Mid-Tower", material: "Steel + Plastic", cooling: "4x fans", airflow: "quiet", msrp: 120, notes: "Silent gaming" },
        "nzxt_s340": { name: "NZXT S340", type: "Case", year: 2014, formFactor: "ATX Mid-Tower", material: "Steel + Plastic", cooling: "2x 120mm", airflow: "moderate", msrp: 70, notes: "Compact ATX" },
        // Fractal Design
        "fractal_define_r4": { name: "Fractal Design Define R4", type: "Case", year: 2012, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "2x 140mm", airflow: "quiet", msrp: 100, notes: "Silent legend" },
        "fractal_define_r5": { name: "Fractal Design Define R5", type: "Case", year: 2014, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "2x 140mm", airflow: "quiet", msrp: 110, notes: "Improved R4" },
        "fractal_arc_midi_r2": { name: "Fractal Design Arc Midi R2", type: "Case", year: 2013, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x 140mm", airflow: "excellent", msrp: 100, notes: "Airflow focus" },
        "fractal_node_304": { name: "Fractal Design Node 304", type: "Case", year: 2012, formFactor: "Mini-ITX", material: "Steel + Aluminum", cooling: "2x 92mm", airflow: "good", msrp: 90, notes: "ITX storage" },
        "fractal_node_804": { name: "Fractal Design Node 804", type: "Case", year: 2014, formFactor: "Micro-ATX Cube", material: "Steel", cooling: "2x 120mm", airflow: "good", msrp: 110, notes: "mATX NAS" },
        // Cooler Master
        "cm_haf_x": { name: "Cooler Master HAF X", type: "Case", year: 2010, formFactor: "ATX Full-Tower", material: "Steel", cooling: "5x fans", airflow: "extreme", msrp: 200, notes: "Maximum airflow" },
        "cm_haf_922": { name: "Cooler Master HAF 922", type: "Case", year: 2010, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "4x fans", airflow: "excellent", msrp: 100, notes: "Mid HAF" },
        "cm_storm_trooper": { name: "Cooler Master Storm Trooper", type: "Case", year: 2011, formFactor: "ATX Full-Tower", material: "Steel", cooling: "4x fans", airflow: "excellent", msrp: 160, notes: "Gaming focus" },
        "cm_n200": { name: "Cooler Master N200", type: "Case", year: 2013, formFactor: "Micro-ATX", material: "Steel", cooling: "2x 120mm", airflow: "good", msrp: 45, notes: "Budget mATX" },
        "cm_elite_130": { name: "Cooler Master Elite 130", type: "Case", year: 2013, formFactor: "Mini-ITX", material: "Steel", cooling: "1x 120mm", airflow: "moderate", msrp: 50, notes: "Budget ITX" },
        // be quiet
        "bequiet_silent_base_800": { name: "be quiet! Silent Base 800", type: "Case", year: 2014, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x 140mm", airflow: "quiet", msrp: 140, notes: "Silent focus" },
        // Phanteks
        "phanteks_enthoo_luxe": { name: "Phanteks Enthoo Luxe", type: "Case", year: 2014, formFactor: "ATX Full-Tower", material: "Steel", cooling: "4x fans", airflow: "excellent", msrp: 180, notes: "Feature rich" },
        "phanteks_enthoo_pro": { name: "Phanteks Enthoo Pro", type: "Case", year: 2014, formFactor: "ATX Full-Tower", material: "Steel", cooling: "3x fans", airflow: "excellent", msrp: 100, notes: "Value flagship" },
        // BitFenix
        "bitfenix_prodigy": { name: "BitFenix Prodigy", type: "Case", year: 2012, formFactor: "Mini-ITX", material: "Steel + Plastic", cooling: "2x 120mm", airflow: "good", msrp: 80, notes: "Iconic ITX" },
        "bitfenix_shinobi": { name: "BitFenix Shinobi", type: "Case", year: 2011, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x 120mm", airflow: "quiet", msrp: 70, notes: "Japanese style" },
    },
    "2015-2019": {
        "nzxt_h500": { name: "NZXT H500", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm included", airflow: "moderate", msrp: 69, notes: "Minimalist icon" },
        "nzxt_h510": { name: "NZXT H510", type: "Case", year: 2019, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm included", airflow: "moderate", msrp: 70, notes: "Updated H500" },
        "nzxt_h700i": { name: "NZXT H700i", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "4x fans", smart: true, msrp: 200, notes: "Smart features" },
        "nzxt_h200": { name: "NZXT H200", type: "Case", year: 2018, formFactor: "Mini-ITX", material: "Steel + Glass", cooling: "2x 120mm", airflow: "good", msrp: 90, notes: "ITX H-series" },
        "corsair_570x": { name: "Corsair Crystal 570X RGB", type: "Case", year: 2016, formFactor: "ATX Mid-Tower", material: "Steel + Glass (4x)", cooling: "3x SP120 RGB", airflow: "moderate", msrp: 180, notes: "All glass showcase" },
        "corsair_280x": { name: "Corsair Crystal 280X", type: "Case", year: 2018, formFactor: "Micro-ATX", material: "Steel + Glass", cooling: "2x 120mm", airflow: "good", msrp: 130, notes: "mATX showcase" },
        "corsair_680x": { name: "Corsair Crystal 680X", type: "Case", year: 2019, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "4x 120mm RGB", dualChamber: true, msrp: 250, notes: "Dual chamber" },
        "fractal_meshify_c": { name: "Fractal Design Meshify C", type: "Case", year: 2017, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "2x 120mm", airflow: "excellent", msrp: 90, notes: "Mesh pioneer" },
        "fractal_define_c": { name: "Fractal Design Define C", type: "Case", year: 2016, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "2x 120mm", airflow: "quiet", msrp: 85, notes: "Compact Define" },
        "fractal_define_r6": { name: "Fractal Design Define R6", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Steel", cooling: "3x 140mm", airflow: "quiet", msrp: 150, notes: "Premium Define" },
        "fractal_define_s2": { name: "Fractal Design Define S2", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "3x 140mm", airflow: "quiet", msrp: 150, notes: "Water focus" },
        "fractal_node_202": { name: "Fractal Design Node 202", type: "Case", year: 2015, formFactor: "Mini-ITX", material: "Steel", cooling: "2x 120mm slim", airflow: "moderate", msrp: 80, notes: "Console style" },
        "phanteks_p400": { name: "Phanteks Eclipse P400", type: "Case", year: 2016, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm", airflow: "moderate", msrp: 70, notes: "Budget Phanteks" },
        "phanteks_p400a": { name: "Phanteks Eclipse P400A", type: "Case", year: 2019, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "2x 120mm", airflow: "excellent", msrp: 90, notes: "Mesh P400" },
        "phanteks_evolv_x": { name: "Phanteks Evolv X", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Aluminum + Glass", cooling: "3x 140mm", airflow: "good", msrp: 200, notes: "Premium ATX" },
        "lianli_o11_dynamic": { name: "Lian Li PC-O11 Dynamic", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Aluminum + Glass", cooling: "0 fans (360mm x3)", dualChamber: true, msrp: 140, notes: "Custom loop king" },
        "lianli_o11_xl": { name: "Lian Li PC-O11 Dynamic XL", type: "Case", year: 2019, formFactor: "ATX Full-Tower", material: "Aluminum + Glass", cooling: "0 fans", dualChamber: true, msrp: 200, notes: "Bigger O11" },
        "lianli_lancool_ii": { name: "Lian Li Lancool II", type: "Case", year: 2019, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "3x 120mm", airflow: "excellent", msrp: 100, notes: "Lancool revival" },
        "cm_h500": { name: "Cooler Master H500", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Steel + Mesh", cooling: "2x 200mm RGB", airflow: "extreme", msrp: 120, notes: "Big fan mesh" },
        "cm_h500m": { name: "Cooler Master H500M", type: "Case", year: 2018, formFactor: "ATX Mid-Tower", material: "Steel + Glass + Mesh", cooling: "2x 200mm ARGB", airflow: "extreme", msrp: 200, notes: "Premium H500" },
        "cm_td500_mesh": { name: "Cooler Master TD500 Mesh", type: "Case", year: 2019, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "3x 120mm ARGB", airflow: "excellent", msrp: 100, notes: "Popular mesh" },
        "bequiet_dark_base_700": { name: "be quiet! Dark Base 700", type: "Case", year: 2017, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "3x Silent Wings", airflow: "quiet", msrp: 170, notes: "Modular silent" },
        "bequiet_dark_base_pro_900": { name: "be quiet! Dark Base Pro 900", type: "Case", year: 2016, formFactor: "ATX Full-Tower", material: "Steel + Glass", cooling: "4x Silent Wings", airflow: "quiet", msrp: 250, notes: "Ultimate silent" },
        "bequiet_pure_base_500": { name: "be quiet! Pure Base 500", type: "Case", year: 2019, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x Pure Wings", airflow: "moderate", msrp: 80, notes: "Value silent" },
        // SFF
        "dan_a4": { name: "Dan A4-SFX", type: "Case", year: 2017, formFactor: "Mini-ITX", material: "Aluminum", cooling: "0 fans (SFX)", airflow: "compact", msrp: 200, notes: "SFF pioneer" },
        "ghost_s1": { name: "Louqe Ghost S1", type: "Case", year: 2018, formFactor: "Mini-ITX", material: "Aluminum", cooling: "0 fans (SFX)", airflow: "compact", msrp: 280, notes: "Premium SFF" },
        "nouvolo_steck": { name: "Nouvolo Steck", type: "Case", year: 2019, formFactor: "Mini-ITX", material: "Aluminum + Steel", cooling: "0 fans", airflow: "compact", msrp: 150, notes: "Modular SFF" },
    },
    "2020-2024": {
        "nzxt_h9_elite": { name: "NZXT H9 Elite", type: "Case", year: 2023, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "4x 120mm included", dualChamber: true, msrp: 190, notes: "Full showcase" },
        "nzxt_h7_flow": { name: "NZXT H7 Flow", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm included", airflow: "excellent", msrp: 130, notes: "Mesh NZXT" },
        "nzxt_h5_flow": { name: "NZXT H5 Flow", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm", airflow: "good", msrp: 95, notes: "Compact NZXT" },
        "nzxt_h510_flow": { name: "NZXT H510 Flow", type: "Case", year: 2021, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "2x 120mm", airflow: "good", msrp: 100, notes: "Mesh H510" },
        "corsair_5000d_airflow": { name: "Corsair 5000D Airflow", type: "Case", year: 2021, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm", airflow: "excellent", msrp: 175, notes: "Modular mesh" },
        "corsair_4000d_airflow": { name: "Corsair 4000D Airflow", type: "Case", year: 2020, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm", airflow: "excellent", msrp: 105, notes: "Best budget mesh" },
        "corsair_icue_5000x": { name: "Corsair iCUE 5000X", type: "Case", year: 2021, formFactor: "ATX Mid-Tower", material: "Steel + Glass (4x)", cooling: "4x 120mm RGB", airflow: "good", msrp: 230, notes: "All glass RGB" },
        "lianli_o11_evo": { name: "Lian Li O11 Dynamic Evo", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Aluminum + Glass", cooling: "0 fans", dualChamber: true, msrp: 170, notes: "Versatile O11" },
        "lianli_o11_air_mini": { name: "Lian Li O11 Air Mini", type: "Case", year: 2021, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "3x 140mm", airflow: "excellent", msrp: 120, notes: "Air cooled O11" },
        "lianli_lancool_ii_mesh": { name: "Lian Li Lancool II Mesh", type: "Case", year: 2020, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "3x 120mm", airflow: "extreme", msrp: 110, notes: "Airflow king" },
        "lianli_lancool_iii": { name: "Lian Li Lancool III", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "4x 140mm", airflow: "extreme", msrp: 170, notes: "Latest Lancool" },
        "lianli_a4h2o": { name: "Lian Li A4-H2O", type: "Case", year: 2021, formFactor: "Mini-ITX", material: "Aluminum", cooling: "AIO support", airflow: "compact", msrp: 150, notes: "ITX with AIO" },
        "fractal_torrent": { name: "Fractal Design Torrent", type: "Case", year: 2021, formFactor: "ATX Full-Tower", material: "Steel + Glass", cooling: "2x 180mm + 3x 140mm", airflow: "best", msrp: 230, notes: "Ultimate airflow" },
        "fractal_torrent_nano": { name: "Fractal Design Torrent Nano", type: "Case", year: 2022, formFactor: "Mini-ITX", material: "Steel + Glass", cooling: "2x 180mm", airflow: "excellent", msrp: 150, notes: "ITX Torrent" },
        "fractal_north": { name: "Fractal Design North", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Wood + Glass", cooling: "2x 140mm", airflow: "good", msrp: 140, notes: "Wood accent" },
        "fractal_pop_air": { name: "Fractal Design Pop Air", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Mesh", cooling: "3x 120mm", airflow: "excellent", msrp: 100, notes: "Colorful mesh" },
        "fractal_terra": { name: "Fractal Design Terra", type: "Case", year: 2023, formFactor: "Mini-ITX", material: "Aluminum + Wood", cooling: "SFX", airflow: "compact", msrp: 180, notes: "Premium SFF" },
        "fractal_ridge": { name: "Fractal Design Ridge", type: "Case", year: 2023, formFactor: "Mini-ITX", material: "Steel + Mesh", cooling: "SFX", airflow: "good", msrp: 130, notes: "Console SFF" },
        "cm_nr200p": { name: "Cooler Master NR200P", type: "Case", year: 2020, formFactor: "Mini-ITX", material: "Steel + Glass/Mesh", cooling: "2x 120mm", airflow: "excellent", msrp: 120, notes: "Best ITX case" },
        "cm_nr200p_max": { name: "Cooler Master NR200P MAX", type: "Case", year: 2021, formFactor: "Mini-ITX", material: "Steel + Glass", cooling: "280mm AIO + SFX850", bundled: true, msrp: 450, notes: "All-in-one ITX" },
        "cm_haf_500": { name: "Cooler Master HAF 500", type: "Case", year: 2021, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 200mm", airflow: "extreme", msrp: 150, notes: "HAF returns" },
        "phanteks_g500a": { name: "Phanteks Eclipse G500A", type: "Case", year: 2021, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "3x 140mm", airflow: "excellent", msrp: 130, notes: "P400A upgrade" },
        "phanteks_xt_pro": { name: "Phanteks XT Pro", type: "Case", year: 2024, formFactor: "ATX Mid-Tower", material: "Steel + Mesh + Glass", cooling: "3x 140mm D-RGB", airflow: "excellent", msrp: 110, notes: "New Phanteks" },
        "phanteks_evolv_x2": { name: "Phanteks Evolv X2", type: "Case", year: 2024, formFactor: "ATX Mid-Tower", material: "Aluminum + Glass", cooling: "3x 140mm", airflow: "good", msrp: 250, notes: "Premium refresh" },
        "bequiet_dark_base_701": { name: "be quiet! Dark Base 701", type: "Case", year: 2023, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "3x Silent Wings", airflow: "quiet", msrp: 200, notes: "Modular silent" },
        "bequiet_pure_base_500fx": { name: "be quiet! Pure Base 500FX", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "4x Light Wings ARGB", airflow: "good", msrp: 140, notes: "RGB be quiet" },
        "hyte_y60": { name: "HYTE Y60", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "3x 120mm", panoramic: true, msrp: 200, notes: "Panoramic glass" },
        "hyte_y40": { name: "HYTE Y40", type: "Case", year: 2022, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "2x 120mm", msrp: 150, notes: "Compact Y60" },
        "montech_air_903": { name: "Montech AIR 903", type: "Case", year: 2023, formFactor: "ATX Mid-Tower", material: "Steel + Mesh", cooling: "4x 140mm ARGB", airflow: "excellent", msrp: 90, notes: "Value mesh" },
        "deepcool_ch560": { name: "DeepCool CH560", type: "Case", year: 2023, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "4x 140mm ARGB", airflow: "excellent", msrp: 100, notes: "Budget RGB mesh" },
        "antec_c8": { name: "Antec C8", type: "Case", year: 2024, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "0 fans", dualChamber: true, msrp: 150, notes: "Antec returns" },
        "ssupd_meshlicious": { name: "SSUPD Meshlicious", type: "Case", year: 2021, formFactor: "Mini-ITX", material: "Steel + Mesh", cooling: "1x 120mm", airflow: "excellent", msrp: 110, notes: "Mesh SFF" },
        "asus_tuf_gt502": { name: "ASUS TUF Gaming GT502", type: "Case", year: 2023, formFactor: "ATX Mid-Tower", material: "Steel + Glass", cooling: "4x 120mm", dualChamber: true, msrp: 180, notes: "TUF dual chamber" },
    }
};

export const CASE_CUSTOM_PARTS = {};

export const CASE_PARTS = {
    ...CASE_BY_ERA['2000-2009'],
    ...CASE_BY_ERA['2010-2014'],
    ...CASE_BY_ERA['2015-2019'],
    ...CASE_BY_ERA['2020-2024'],
    ...CASE_BY_ERA['2025'],
    ...CASE_CUSTOM_PARTS,
};

export default {
    CASE_BY_ERA,
    CASE_PARTS,
};
