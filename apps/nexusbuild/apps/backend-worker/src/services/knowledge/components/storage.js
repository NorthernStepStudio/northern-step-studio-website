/**
 * STORAGE components (2000-2025).
 * Split by era for quick filtering.
 * ~200+ storage devices: HDD, SATA SSD, NVMe
 */

export const STORAGE_BY_ERA = {
    "2025": {
        // PCIe 5.0 NVMe continued
        "crucial_t705_2tb": { name: "Crucial T705 2TB", type: "Storage", subtype: "NVMe Gen5", year: 2024, capacity: "2TB", speed: "14500/12700 MB/s", interface: "PCIe 5.0 x4", msrp: 350, notes: "Fastest consumer SSD." },
        "wd_sn5000_2tb": { name: "WD Black SN5000 2TB", type: "Storage", subtype: "NVMe Gen5", year: 2025, capacity: "2TB", speed: "14000/11000 MB/s", interface: "PCIe 5.0 x4", msrp: 300, notes: "Next-gen WD Black." },
    },
    "2000-2009": {
        // HDD Era
        "wd_caviar_blue_80gb": { name: "WD Caviar Blue 80GB", type: "Storage", subtype: "HDD", year: 2002, capacity: "80GB", speed: "7200 RPM", interface: "IDE", msrp: 80, notes: "Reliable desktop HDD." },
        "wd_caviar_se16_500gb": { name: "WD Caviar SE16 500GB", type: "Storage", subtype: "HDD", year: 2006, capacity: "500GB", speed: "7200 RPM", interface: "SATA", msrp: 150, notes: "Popular SATA HDD." },
        "wd_caviar_black_640gb": { name: "WD Caviar Black 640GB", type: "Storage", subtype: "HDD", year: 2008, capacity: "640GB", speed: "7200 RPM", interface: "SATA 3G", msrp: 100, notes: "Performance HDD." },
        "wd_caviar_black_1tb": { name: "WD Caviar Black 1TB", type: "Storage", subtype: "HDD", year: 2008, capacity: "1TB", speed: "7200 RPM", interface: "SATA 3G", msrp: 130, notes: "First TB drives." },
        "wd_raptor_74gb": { name: "WD Raptor 74GB", type: "Storage", subtype: "HDD", year: 2003, capacity: "74GB", speed: "10000 RPM", interface: "SATA", msrp: 200, notes: "Enthusiast HDD." },
        "wd_raptor_150gb": { name: "WD Raptor 150GB", type: "Storage", subtype: "HDD", year: 2004, capacity: "150GB", speed: "10000 RPM", interface: "SATA", msrp: 280, notes: "Legendary Raptor." },
        "wd_velociraptor_300gb": { name: "WD VelociRaptor 300GB", type: "Storage", subtype: "HDD", year: 2008, capacity: "300GB", speed: "10000 RPM", interface: "SATA 3G", msrp: 250, notes: "Fastest consumer HDD." },
        "seagate_barracuda_80gb": { name: "Seagate Barracuda 7200.7 80GB", type: "Storage", subtype: "HDD", year: 2003, capacity: "80GB", speed: "7200 RPM", interface: "IDE", msrp: 70, notes: "Popular Barracuda." },
        "seagate_barracuda_250gb": { name: "Seagate Barracuda 7200.10 250GB", type: "Storage", subtype: "HDD", year: 2006, capacity: "250GB", speed: "7200 RPM", interface: "SATA", msrp: 90, notes: "Mainstream HDD." },
        "seagate_barracuda_500gb": { name: "Seagate Barracuda 7200.11 500GB", type: "Storage", subtype: "HDD", year: 2007, capacity: "500GB", speed: "7200 RPM", interface: "SATA 3G", msrp: 100, notes: "Note: Some had firmware issues." },
        "seagate_barracuda_1tb": { name: "Seagate Barracuda 7200.12 1TB", type: "Storage", subtype: "HDD", year: 2009, capacity: "1TB", speed: "7200 RPM", interface: "SATA 3G", msrp: 100, notes: "Single platter reliability." },
        "seagate_cheetah_73gb": { name: "Seagate Cheetah 15K 73GB", type: "Storage", subtype: "HDD", year: 2004, capacity: "73GB", speed: "15000 RPM", interface: "SCSI", msrp: 300, notes: "Enterprise speed." },
        "hitachi_deskstar_250gb": { name: "Hitachi Deskstar 7K250", type: "Storage", subtype: "HDD", year: 2004, capacity: "250GB", speed: "7200 RPM", interface: "SATA", msrp: 120, notes: "Good reliability." },
        "hitachi_deskstar_500gb": { name: "Hitachi Deskstar 7K500", type: "Storage", subtype: "HDD", year: 2006, capacity: "500GB", speed: "7200 RPM", interface: "SATA", msrp: 150, notes: "Reliable Hitachi." },
        "maxtor_diamondmax_160gb": { name: "Maxtor DiamondMax Plus 9 160GB", type: "Storage", subtype: "HDD", year: 2003, capacity: "160GB", speed: "7200 RPM", interface: "IDE", msrp: 100, notes: "Budget HDD." },
        // Early SSDs
        "intel_x25m_80gb": { name: "Intel X25-M 80GB", type: "Storage", subtype: "SATA SSD", year: 2008, capacity: "80GB", speed: "250/70 MB/s", interface: "SATA 3G", msrp: 600, notes: "First reliable consumer SSD." },
        "intel_x25e_32gb": { name: "Intel X25-E 32GB", type: "Storage", subtype: "SATA SSD", year: 2008, capacity: "32GB", speed: "250/170 MB/s", interface: "SATA 3G", msrp: 400, notes: "Enterprise SLC." },
        "ocz_vertex_60gb": { name: "OCZ Vertex 60GB", type: "Storage", subtype: "SATA SSD", year: 2009, capacity: "60GB", speed: "230/135 MB/s", interface: "SATA 3G", msrp: 180, notes: "Early enthusiast SSD." },
        "samsung_slc_32gb": { name: "Samsung 32GB SLC SSD", type: "Storage", subtype: "SATA SSD", year: 2007, capacity: "32GB", speed: "100/80 MB/s", interface: "SATA", msrp: 800, notes: "Early Samsung SSD." },
    },
    "2010-2014": {
        // HDD continued
        "wd_blue_1tb_2010": { name: "WD Blue 1TB (2010)", type: "Storage", subtype: "HDD", year: 2010, capacity: "1TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 80, notes: "Standard blue HDD." },
        "wd_blue_1tb_2013": { name: "WD Blue 1TB (2013)", type: "Storage", subtype: "HDD", year: 2013, capacity: "1TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 60, notes: "Great value HDD." },
        "wd_black_1tb_2011": { name: "WD Black 1TB", type: "Storage", subtype: "HDD", year: 2011, capacity: "1TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 100, notes: "Performance HDD." },
        "wd_black_2tb": { name: "WD Black 2TB", type: "Storage", subtype: "HDD", year: 2012, capacity: "2TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 150, notes: "High capacity performance." },
        "wd_black_4tb": { name: "WD Black 4TB", type: "Storage", subtype: "HDD", year: 2014, capacity: "4TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 200, notes: "Large capacity Black." },
        "wd_red_2tb": { name: "WD Red 2TB", type: "Storage", subtype: "HDD", year: 2012, capacity: "2TB", speed: "5400 RPM", interface: "SATA 6G", msrp: 100, notes: "First NAS drives." },
        "wd_red_4tb": { name: "WD Red 4TB", type: "Storage", subtype: "HDD", year: 2013, capacity: "4TB", speed: "5400 RPM", interface: "SATA 6G", msrp: 170, notes: "NAS optimized." },
        "wd_green_2tb": { name: "WD Green 2TB", type: "Storage", subtype: "HDD", year: 2011, capacity: "2TB", speed: "5400 RPM", interface: "SATA 6G", msrp: 90, notes: "Low power, quiet." },
        "seagate_barracuda_2tb_2011": { name: "Seagate Barracuda 2TB (2011)", type: "Storage", subtype: "HDD", year: 2011, capacity: "2TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 100, notes: "Mainstream HDD." },
        "seagate_barracuda_3tb": { name: "Seagate Barracuda 3TB", type: "Storage", subtype: "HDD", year: 2011, capacity: "3TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 140, notes: "High capacity." },
        "seagate_barracuda_4tb": { name: "Seagate Barracuda 4TB", type: "Storage", subtype: "HDD", year: 2013, capacity: "4TB", speed: "5900 RPM", interface: "SATA 6G", msrp: 150, notes: "Mass storage." },
        "hitachi_7k3000_2tb": { name: "Hitachi 7K3000 2TB", type: "Storage", subtype: "HDD", year: 2011, capacity: "2TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 100, notes: "Reliable Hitachi." },
        "hgst_7k4000_4tb": { name: "HGST Deskstar 7K4000 4TB", type: "Storage", subtype: "HDD", year: 2012, capacity: "4TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 200, notes: "High-end HGST." },
        // SATA SSD Golden Era
        "intel_320_120gb": { name: "Intel 320 Series 120GB", type: "Storage", subtype: "SATA SSD", year: 2011, capacity: "120GB", speed: "270/130 MB/s", interface: "SATA 3G", msrp: 200, notes: "Reliable Intel SSD." },
        "intel_330_120gb": { name: "Intel 330 Series 120GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "120GB", speed: "500/400 MB/s", interface: "SATA 6G", msrp: 150, notes: "Budget Intel." },
        "intel_520_120gb": { name: "Intel 520 Series 120GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "120GB", speed: "550/500 MB/s", interface: "SATA 6G", msrp: 200, notes: "Premium Intel." },
        "intel_530_240gb": { name: "Intel 530 Series 240GB", type: "Storage", subtype: "SATA SSD", year: 2013, capacity: "240GB", speed: "540/490 MB/s", interface: "SATA 6G", msrp: 200, notes: "Great reliability." },
        "samsung_830_128gb": { name: "Samsung 830 128GB", type: "Storage", subtype: "SATA SSD", year: 2011, capacity: "128GB", speed: "520/400 MB/s", interface: "SATA 6G", msrp: 180, notes: "Excellent SSD." },
        "samsung_830_256gb": { name: "Samsung 830 256GB", type: "Storage", subtype: "SATA SSD", year: 2011, capacity: "256GB", speed: "520/400 MB/s", interface: "SATA 6G", msrp: 300, notes: "Premium Samsung." },
        "samsung_840_120gb": { name: "Samsung 840 120GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "120GB", speed: "540/130 MB/s", interface: "SATA 6G", msrp: 100, notes: "First TLC consumer." },
        "samsung_840_pro_128gb": { name: "Samsung 840 Pro 128GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "128GB", speed: "540/520 MB/s", interface: "SATA 6G", msrp: 150, notes: "Legendary Pro." },
        "samsung_840_pro_256gb": { name: "Samsung 840 Pro 256GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "256GB", speed: "540/520 MB/s", interface: "SATA 6G", msrp: 250, notes: "Best SATA SSD." },
        "samsung_840_evo_250gb": { name: "Samsung 840 EVO 250GB", type: "Storage", subtype: "SATA SSD", year: 2013, capacity: "250GB", speed: "540/520 MB/s", interface: "SATA 6G", msrp: 170, notes: "TLC with TurboWrite." },
        "samsung_840_evo_500gb": { name: "Samsung 840 EVO 500GB", type: "Storage", subtype: "SATA SSD", year: 2013, capacity: "500GB", speed: "540/520 MB/s", interface: "SATA 6G", msrp: 300, notes: "High capacity TLC." },
        "samsung_850_pro_256gb": { name: "Samsung 850 Pro 256GB", type: "Storage", subtype: "SATA SSD", year: 2014, capacity: "256GB", speed: "550/520 MB/s", interface: "SATA 6G", msrp: 200, notes: "3D V-NAND Pro." },
        "samsung_850_evo_250gb": { name: "Samsung 850 EVO 250GB", type: "Storage", subtype: "SATA SSD", year: 2014, capacity: "250GB", speed: "540/520 MB/s", interface: "SATA 6G", msrp: 120, notes: "Legendary 850 EVO." },
        "samsung_850_evo_500gb": { name: "Samsung 850 EVO 500GB", type: "Storage", subtype: "SATA SSD", year: 2014, capacity: "500GB", speed: "540/520 MB/s", interface: "SATA 6G", msrp: 200, notes: "Best value SSD." },
        "crucial_m4_128gb": { name: "Crucial M4 128GB", type: "Storage", subtype: "SATA SSD", year: 2011, capacity: "128GB", speed: "500/175 MB/s", interface: "SATA 6G", msrp: 180, notes: "Reliable Crucial." },
        "crucial_m4_256gb": { name: "Crucial M4 256GB", type: "Storage", subtype: "SATA SSD", year: 2011, capacity: "256GB", speed: "500/260 MB/s", interface: "SATA 6G", msrp: 300, notes: "High capacity M4." },
        "crucial_m500_240gb": { name: "Crucial M500 240GB", type: "Storage", subtype: "SATA SSD", year: 2013, capacity: "240GB", speed: "500/400 MB/s", interface: "SATA 6G", msrp: 150, notes: "Value Crucial." },
        "crucial_mx100_256gb": { name: "Crucial MX100 256GB", type: "Storage", subtype: "SATA SSD", year: 2014, capacity: "256GB", speed: "550/500 MB/s", interface: "SATA 6G", msrp: 110, notes: "Best value SSD 2014." },
        "crucial_mx100_512gb": { name: "Crucial MX100 512GB", type: "Storage", subtype: "SATA SSD", year: 2014, capacity: "512GB", speed: "550/500 MB/s", interface: "SATA 6G", msrp: 200, notes: "Large capacity value." },
        "sandisk_ultra_plus_128gb": { name: "SanDisk Ultra Plus 128GB", type: "Storage", subtype: "SATA SSD", year: 2013, capacity: "128GB", speed: "530/445 MB/s", interface: "SATA 6G", msrp: 100, notes: "Reliable SanDisk." },
        "sandisk_extreme_240gb": { name: "SanDisk Extreme 240GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "240GB", speed: "550/510 MB/s", interface: "SATA 6G", msrp: 200, notes: "Performance SanDisk." },
        "ocz_vertex_4_128gb": { name: "OCZ Vertex 4 128GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "128GB", speed: "535/200 MB/s", interface: "SATA 6G", msrp: 130, notes: "OCZ flagship." },
        "ocz_vector_256gb": { name: "OCZ Vector 256GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "256GB", speed: "550/530 MB/s", interface: "SATA 6G", msrp: 280, notes: "Barefoot 3 controller." },
        "kingston_hyperx_3k_120gb": { name: "Kingston HyperX 3K 120GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "120GB", speed: "555/510 MB/s", interface: "SATA 6G", msrp: 100, notes: "Gaming SSD." },
        "plextor_m5_pro_256gb": { name: "Plextor M5 Pro 256GB", type: "Storage", subtype: "SATA SSD", year: 2012, capacity: "256GB", speed: "540/450 MB/s", interface: "SATA 6G", msrp: 240, notes: "Premium Plextor." },
        // First M.2 NVMe
        "samsung_xp941_256gb": { name: "Samsung XP941 256GB", type: "Storage", subtype: "NVMe Gen2", year: 2014, capacity: "256GB", speed: "1170/950 MB/s", interface: "PCIe 2.0 x4", msrp: 350, notes: "First consumer NVMe." },
    },
    "2015-2019": {
        // SATA SSD continued
        "samsung_850_evo_1tb": { name: "Samsung 850 EVO 1TB", type: "Storage", subtype: "SATA SSD", year: 2015, capacity: "1TB", speed: "540/520 MB/s", interface: "SATA 6G", msrp: 350, notes: "High capacity 850." },
        "samsung_860_evo_250gb": { name: "Samsung 860 EVO 250GB", type: "Storage", subtype: "SATA SSD", year: 2018, capacity: "250GB", speed: "550/520 MB/s", interface: "SATA 6G", msrp: 60, notes: "Updated 850 successor." },
        "samsung_860_evo_500gb": { name: "Samsung 860 EVO 500GB", type: "Storage", subtype: "SATA SSD", year: 2018, capacity: "500GB", speed: "550/520 MB/s", interface: "SATA 6G", msrp: 80, notes: "Mainstream SATA." },
        "samsung_860_evo_1tb": { name: "Samsung 860 EVO 1TB", type: "Storage", subtype: "SATA SSD", year: 2018, capacity: "1TB", speed: "550/520 MB/s", interface: "SATA 6G", msrp: 150, notes: "Popular 1TB SATA." },
        "samsung_860_pro_512gb": { name: "Samsung 860 Pro 512GB", type: "Storage", subtype: "SATA SSD", year: 2018, capacity: "512GB", speed: "560/530 MB/s", interface: "SATA 6G", msrp: 150, notes: "Premium SATA." },
        "crucial_mx500_500gb": { name: "Crucial MX500 500GB", type: "Storage", subtype: "SATA SSD", year: 2018, capacity: "500GB", speed: "560/510 MB/s", interface: "SATA 6G", msrp: 65, notes: "Best value SATA." },
        "crucial_mx500_1tb": { name: "Crucial MX500 1TB", type: "Storage", subtype: "SATA SSD", year: 2018, capacity: "1TB", speed: "560/510 MB/s", interface: "SATA 6G", msrp: 110, notes: "Excellent value." },
        "wd_blue_3d_500gb": { name: "WD Blue 3D 500GB", type: "Storage", subtype: "SATA SSD", year: 2017, capacity: "500GB", speed: "560/530 MB/s", interface: "SATA 6G", msrp: 70, notes: "Good SATA value." },
        "wd_blue_3d_1tb": { name: "WD Blue 3D 1TB", type: "Storage", subtype: "SATA SSD", year: 2017, capacity: "1TB", speed: "560/530 MB/s", interface: "SATA 6G", msrp: 120, notes: "Reliable 1TB." },
        "sandisk_ultra_3d_500gb": { name: "SanDisk Ultra 3D 500GB", type: "Storage", subtype: "SATA SSD", year: 2017, capacity: "500GB", speed: "560/530 MB/s", interface: "SATA 6G", msrp: 65, notes: "Same as WD Blue." },
        // NVMe Gen3 Era
        "samsung_950_pro_256gb": { name: "Samsung 950 Pro 256GB", type: "Storage", subtype: "NVMe Gen3", year: 2015, capacity: "256GB", speed: "2200/900 MB/s", interface: "PCIe 3.0 x4", msrp: 200, notes: "First Samsung NVMe." },
        "samsung_950_pro_512gb": { name: "Samsung 950 Pro 512GB", type: "Storage", subtype: "NVMe Gen3", year: 2015, capacity: "512GB", speed: "2500/1500 MB/s", interface: "PCIe 3.0 x4", msrp: 350, notes: "High performance." },
        "samsung_960_evo_250gb": { name: "Samsung 960 EVO 250GB", type: "Storage", subtype: "NVMe Gen3", year: 2016, capacity: "250GB", speed: "3200/1500 MB/s", interface: "PCIe 3.0 x4", msrp: 130, notes: "Mainstream NVMe." },
        "samsung_960_evo_500gb": { name: "Samsung 960 EVO 500GB", type: "Storage", subtype: "NVMe Gen3", year: 2016, capacity: "500GB", speed: "3200/1900 MB/s", interface: "PCIe 3.0 x4", msrp: 200, notes: "Popular NVMe." },
        "samsung_960_pro_512gb": { name: "Samsung 960 Pro 512GB", type: "Storage", subtype: "NVMe Gen3", year: 2016, capacity: "512GB", speed: "3500/2100 MB/s", interface: "PCIe 3.0 x4", msrp: 330, notes: "Premium NVMe." },
        "samsung_970_evo_250gb": { name: "Samsung 970 EVO 250GB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "250GB", speed: "3400/1500 MB/s", interface: "PCIe 3.0 x4", msrp: 90, notes: "Updated controller." },
        "samsung_970_evo_500gb": { name: "Samsung 970 EVO 500GB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "500GB", speed: "3400/2300 MB/s", interface: "PCIe 3.0 x4", msrp: 130, notes: "Popular 500GB." },
        "samsung_970_evo_1tb": { name: "Samsung 970 EVO 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "1TB", speed: "3400/2500 MB/s", interface: "PCIe 3.0 x4", msrp: 200, notes: "High capacity NVMe." },
        "samsung_970_evo_plus_500gb": { name: "Samsung 970 EVO Plus 500GB", type: "Storage", subtype: "NVMe Gen3", year: 2019, capacity: "500GB", speed: "3500/3200 MB/s", interface: "PCIe 3.0 x4", msrp: 100, notes: "Faster writes." },
        "samsung_970_evo_plus_1tb": { name: "Samsung 970 EVO Plus 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2019, capacity: "1TB", speed: "3500/3300 MB/s", interface: "PCIe 3.0 x4", msrp: 170, notes: "Best Gen3 NVMe." },
        "samsung_970_pro_512gb": { name: "Samsung 970 Pro 512GB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "512GB", speed: "3500/2300 MB/s", interface: "PCIe 3.0 x4", msrp: 180, notes: "MLC premium." },
        "wd_black_sn750_500gb": { name: "WD Black SN750 500GB", type: "Storage", subtype: "NVMe Gen3", year: 2019, capacity: "500GB", speed: "3430/2600 MB/s", interface: "PCIe 3.0 x4", msrp: 100, notes: "Gaming optimized." },
        "wd_black_sn750_1tb": { name: "WD Black SN750 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2019, capacity: "1TB", speed: "3470/3000 MB/s", interface: "PCIe 3.0 x4", msrp: 170, notes: "Great gaming NVMe." },
        "crucial_p1_500gb": { name: "Crucial P1 500GB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "500GB", speed: "1900/950 MB/s", interface: "PCIe 3.0 x4", msrp: 60, notes: "Budget QLC NVMe." },
        "crucial_p1_1tb": { name: "Crucial P1 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "1TB", speed: "2000/1700 MB/s", interface: "PCIe 3.0 x4", msrp: 100, notes: "Value 1TB." },
        "intel_660p_1tb": { name: "Intel 660p 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "1TB", speed: "1800/1800 MB/s", interface: "PCIe 3.0 x4", msrp: 90, notes: "QLC budget." },
        "sabrent_rocket_1tb": { name: "Sabrent Rocket 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2019, capacity: "1TB", speed: "3400/3000 MB/s", interface: "PCIe 3.0 x4", msrp: 130, notes: "Best value Gen3." },
        "adata_xpg_sx8200_pro_1tb": { name: "ADATA XPG SX8200 Pro 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2019, capacity: "1TB", speed: "3500/3000 MB/s", interface: "PCIe 3.0 x4", msrp: 120, notes: "Excellent value." },
        "hp_ex920_1tb": { name: "HP EX920 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2018, capacity: "1TB", speed: "3200/1800 MB/s", interface: "PCIe 3.0 x4", msrp: 130, notes: "Good value HP." },
        // HDD continued (Mass storage)
        "wd_black_4tb_2015": { name: "WD Black 4TB (2015)", type: "Storage", subtype: "HDD", year: 2015, capacity: "4TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 200, notes: "Performance HDD." },
        "wd_red_4tb_2015": { name: "WD Red 4TB (2015)", type: "Storage", subtype: "HDD", year: 2015, capacity: "4TB", speed: "5400 RPM", interface: "SATA 6G", msrp: 150, notes: "NAS drive." },
        "seagate_barracuda_2tb_2016": { name: "Seagate Barracuda 2TB (2016)", type: "Storage", subtype: "HDD", year: 2016, capacity: "2TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 65, notes: "Mainstream HDD." },
        "seagate_ironwolf_4tb": { name: "Seagate IronWolf 4TB", type: "Storage", subtype: "HDD", year: 2016, capacity: "4TB", speed: "5900 RPM", interface: "SATA 6G", msrp: 120, notes: "NAS optimized." },
    },
    "2020-2024": {
        // NVMe Gen4 Era
        "samsung_980_pro_500gb": { name: "Samsung 980 Pro 500GB", type: "Storage", subtype: "NVMe Gen4", year: 2020, capacity: "500GB", speed: "6900/5000 MB/s", interface: "PCIe 4.0 x4", msrp: 100, notes: "First Samsung Gen4." },
        "samsung_980_pro_1tb": { name: "Samsung 980 Pro 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2020, capacity: "1TB", speed: "7000/5000 MB/s", interface: "PCIe 4.0 x4", msrp: 150, notes: "Flagship Gen4." },
        "samsung_980_pro_2tb": { name: "Samsung 980 Pro 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2020, capacity: "2TB", speed: "7000/5100 MB/s", interface: "PCIe 4.0 x4", msrp: 280, notes: "High capacity." },
        "samsung_990_pro_1tb": { name: "Samsung 990 Pro 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "1TB", speed: "7450/6900 MB/s", interface: "PCIe 4.0 x4", msrp: 100, notes: "Fastest Gen4." },
        "samsung_990_pro_2tb": { name: "Samsung 990 Pro 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "2TB", speed: "7450/6900 MB/s", interface: "PCIe 4.0 x4", msrp: 180, notes: "Best Pro option." },
        "samsung_990_pro_4tb": { name: "Samsung 990 Pro 4TB", type: "Storage", subtype: "NVMe Gen4", year: 2023, capacity: "4TB", speed: "7450/6900 MB/s", interface: "PCIe 4.0 x4", msrp: 350, notes: "Massive capacity." },
        "samsung_990_evo_1tb": { name: "Samsung 990 EVO 1TB", type: "Storage", subtype: "NVMe Gen4/5", year: 2024, capacity: "1TB", speed: "5000/4200 MB/s", interface: "PCIe 5.0 x2/4.0 x4", msrp: 90, notes: "Hybrid interface." },
        "samsung_980_1tb": { name: "Samsung 980 1TB", type: "Storage", subtype: "NVMe Gen3", year: 2021, capacity: "1TB", speed: "3500/3000 MB/s", interface: "PCIe 3.0 x4", msrp: 80, notes: "Budget DRAMless." },
        "wd_black_sn850_1tb": { name: "WD Black SN850 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2020, capacity: "1TB", speed: "7000/5300 MB/s", interface: "PCIe 4.0 x4", msrp: 130, notes: "Excellent Gen4." },
        "wd_black_sn850_2tb": { name: "WD Black SN850 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2020, capacity: "2TB", speed: "7000/5300 MB/s", interface: "PCIe 4.0 x4", msrp: 250, notes: "Gaming favorite." },
        "wd_black_sn850x_1tb": { name: "WD Black SN850X 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "1TB", speed: "7300/6300 MB/s", interface: "PCIe 4.0 x4", msrp: 100, notes: "Updated SN850." },
        "wd_black_sn850x_2tb": { name: "WD Black SN850X 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "2TB", speed: "7300/6600 MB/s", interface: "PCIe 4.0 x4", msrp: 180, notes: "Best WD option." },
        "wd_black_sn850x_4tb": { name: "WD Black SN850X 4TB", type: "Storage", subtype: "NVMe Gen4", year: 2023, capacity: "4TB", speed: "7300/6600 MB/s", interface: "PCIe 4.0 x4", msrp: 350, notes: "Massive gaming." },
        "wd_black_sn770_1tb": { name: "WD Black SN770 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "1TB", speed: "5150/4900 MB/s", interface: "PCIe 4.0 x4", msrp: 70, notes: "Budget Gen4." },
        "wd_blue_sn580_1tb": { name: "WD Blue SN580 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2023, capacity: "1TB", speed: "4150/4150 MB/s", interface: "PCIe 4.0 x4", msrp: 60, notes: "Value Gen4." },
        "crucial_p5_plus_1tb": { name: "Crucial P5 Plus 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2021, capacity: "1TB", speed: "6600/5000 MB/s", interface: "PCIe 4.0 x4", msrp: 90, notes: "Great value Gen4." },
        "crucial_p5_plus_2tb": { name: "Crucial P5 Plus 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2021, capacity: "2TB", speed: "6600/5000 MB/s", interface: "PCIe 4.0 x4", msrp: 150, notes: "High capacity value." },
        "crucial_t500_1tb": { name: "Crucial T500 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2023, capacity: "1TB", speed: "7400/7000 MB/s", interface: "PCIe 4.0 x4", msrp: 90, notes: "Top-tier Gen4." },
        "crucial_t500_2tb": { name: "Crucial T500 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2023, capacity: "2TB", speed: "7400/7000 MB/s", interface: "PCIe 4.0 x4", msrp: 160, notes: "Excellent value." },
        "crucial_p3_plus_1tb": { name: "Crucial P3 Plus 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "1TB", speed: "5000/4200 MB/s", interface: "PCIe 4.0 x4", msrp: 55, notes: "Budget Gen4." },
        "seagate_firecuda_530_1tb": { name: "Seagate FireCuda 530 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2021, capacity: "1TB", speed: "7300/6000 MB/s", interface: "PCIe 4.0 x4", msrp: 120, notes: "PS5 compatible." },
        "seagate_firecuda_530_2tb": { name: "Seagate FireCuda 530 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2021, capacity: "2TB", speed: "7300/6900 MB/s", interface: "PCIe 4.0 x4", msrp: 220, notes: "Fast Gen4." },
        "sabrent_rocket_4_plus_1tb": { name: "Sabrent Rocket 4 Plus 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2021, capacity: "1TB", speed: "7100/5800 MB/s", interface: "PCIe 4.0 x4", msrp: 110, notes: "Great value." },
        "sk_hynix_p41_1tb": { name: "SK Hynix Platinum P41 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "1TB", speed: "7000/6500 MB/s", interface: "PCIe 4.0 x4", msrp: 100, notes: "Excellent performance." },
        "sk_hynix_p41_2tb": { name: "SK Hynix Platinum P41 2TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "2TB", speed: "7000/6500 MB/s", interface: "PCIe 4.0 x4", msrp: 180, notes: "Best Hynix." },
        "kingston_fury_renegade_1tb": { name: "Kingston Fury Renegade 1TB", type: "Storage", subtype: "NVMe Gen4", year: 2022, capacity: "1TB", speed: "7300/6000 MB/s", interface: "PCIe 4.0 x4", msrp: 100, notes: "Phison E18." },
        // NVMe Gen5
        "crucial_t705_1tb": { name: "Crucial T705 1TB", type: "Storage", subtype: "NVMe Gen5", year: 2024, capacity: "1TB", speed: "13600/10200 MB/s", interface: "PCIe 5.0 x4", msrp: 200, notes: "Fastest Gen5." },
        "corsair_mp700_pro_2tb": { name: "Corsair MP700 Pro 2TB", type: "Storage", subtype: "NVMe Gen5", year: 2024, capacity: "2TB", speed: "12400/11800 MB/s", interface: "PCIe 5.0 x4", msrp: 300, notes: "Premium Gen5." },
        "msi_spatium_m570_2tb": { name: "MSI Spatium M570 2TB", type: "Storage", subtype: "NVMe Gen5", year: 2024, capacity: "2TB", speed: "12000/10000 MB/s", interface: "PCIe 5.0 x4", msrp: 280, notes: "Gaming Gen5." },
        // SATA continued
        "samsung_870_evo_1tb": { name: "Samsung 870 EVO 1TB", type: "Storage", subtype: "SATA SSD", year: 2021, capacity: "1TB", speed: "560/530 MB/s", interface: "SATA 6G", msrp: 90, notes: "Best SATA SSD." },
        "samsung_870_evo_2tb": { name: "Samsung 870 EVO 2TB", type: "Storage", subtype: "SATA SSD", year: 2021, capacity: "2TB", speed: "560/530 MB/s", interface: "SATA 6G", msrp: 180, notes: "High capacity SATA." },
        "crucial_mx500_2tb": { name: "Crucial MX500 2TB", type: "Storage", subtype: "SATA SSD", year: 2020, capacity: "2TB", speed: "560/510 MB/s", interface: "SATA 6G", msrp: 160, notes: "Value 2TB SATA." },
        // HDD Mass Storage
        "wd_red_plus_4tb": { name: "WD Red Plus 4TB", type: "Storage", subtype: "HDD", year: 2021, capacity: "4TB", speed: "5400 RPM", interface: "SATA 6G", msrp: 100, notes: "CMR NAS drive." },
        "seagate_ironwolf_8tb": { name: "Seagate IronWolf 8TB", type: "Storage", subtype: "HDD", year: 2020, capacity: "8TB", speed: "7200 RPM", interface: "SATA 6G", msrp: 180, notes: "NAS optimized." },
        "seagate_barracuda_8tb": { name: "Seagate Barracuda 8TB", type: "Storage", subtype: "HDD", year: 2022, capacity: "8TB", speed: "5400 RPM", interface: "SATA 6G", msrp: 150, notes: "SMR mass storage." },
    }
};

export const STORAGE_CUSTOM_PARTS = {};

export const STORAGE_PARTS = {
    ...STORAGE_BY_ERA['2000-2009'],
    ...STORAGE_BY_ERA['2010-2014'],
    ...STORAGE_BY_ERA['2015-2019'],
    ...STORAGE_BY_ERA['2020-2024'],
    ...STORAGE_BY_ERA['2025'],
    ...STORAGE_CUSTOM_PARTS,
};

export default {
    STORAGE_BY_ERA,
    STORAGE_PARTS,
};
