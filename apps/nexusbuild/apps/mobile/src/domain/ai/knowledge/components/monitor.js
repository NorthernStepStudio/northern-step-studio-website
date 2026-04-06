/**
 * MONITOR components (2000-2025).
 * Split by era for quick filtering.
 * ~150+ monitors across all eras
 */

export const MONITOR_BY_ERA = {
    "2025": {
        "samsung_g8_oled_32": { name: "Samsung Odyssey OLED G8 32\"", type: "Monitor", year: 2024, size: "32\"", resolution: "3840x2160", panel: "QD-OLED", refreshRate: "240Hz", responseTime: "0.03ms", hdr: "HDR True Black 400", msrp: 1300, notes: "4K OLED gaming" },
        "asus_pg32ucdp": { name: "ASUS ROG Swift PG32UCDP", type: "Monitor", year: 2024, size: "32\"", resolution: "3840x2160", panel: "Dual-mode OLED", refreshRate: "240Hz/480Hz", responseTime: "0.03ms", hdr: "HDR True Black 400", msrp: 1500, notes: "Dual mode 4K/1080p" },
        "lg_27gr93u": { name: "LG UltraGear 27GR93U", type: "Monitor", year: 2024, size: "27\"", resolution: "3840x2160", panel: "IPS", refreshRate: "144Hz", responseTime: "1ms", hdr: "HDR400", msrp: 600, notes: "Value 4K gaming" },
    },
    "2000-2009": {
        // CRT End Era
        "sony_fw900": { name: "Sony GDM-FW900", type: "Monitor", year: 2000, size: "24\"", resolution: "2304x1440", panel: "CRT", refreshRate: "80Hz", msrp: 2500, notes: "Legendary CRT. Still sought after" },
        "viewsonic_p225f": { name: "ViewSonic P225f", type: "Monitor", year: 2002, size: "22\"", resolution: "2048x1536", panel: "CRT", refreshRate: "85Hz", msrp: 900, notes: "Premium CRT" },
        "iiyama_visionmaster_510": { name: "Iiyama Vision Master Pro 510", type: "Monitor", year: 2001, size: "22\"", resolution: "2048x1536", panel: "CRT", refreshRate: "85Hz", msrp: 800, notes: "Pro CRT" },
        // LCD Rise
        "dell_2001fp": { name: "Dell 2001FP", type: "Monitor", year: 2003, size: "20\"", resolution: "1600x1200", panel: "IPS", refreshRate: "60Hz", responseTime: "25ms", msrp: 900, notes: "Early quality IPS" },
        "dell_2005fpw": { name: "Dell 2005FPW", type: "Monitor", year: 2005, size: "20\"", resolution: "1680x1050", panel: "IPS", refreshRate: "60Hz", responseTime: "16ms", msrp: 550, notes: "Popular widescreen" },
        "dell_2407wfp": { name: "Dell 2407WFP", type: "Monitor", year: 2006, size: "24\"", resolution: "1920x1200", panel: "PVA", refreshRate: "60Hz", responseTime: "6ms", msrp: 900, notes: "24\" 1920x1200" },
        "dell_3007wfp": { name: "Dell 3007WFP", type: "Monitor", year: 2006, size: "30\"", resolution: "2560x1600", panel: "IPS", refreshRate: "60Hz", msrp: 2000, notes: "First 30\" consumer" },
        "samsung_244t": { name: "Samsung 244T", type: "Monitor", year: 2005, size: "24\"", resolution: "1920x1200", panel: "PVA", refreshRate: "60Hz", responseTime: "8ms", msrp: 1200, notes: "Premium Samsung" },
        "samsung_225bw": { name: "Samsung 225BW", type: "Monitor", year: 2006, size: "22\"", resolution: "1680x1050", panel: "TN", refreshRate: "60Hz", responseTime: "5ms", msrp: 400, notes: "Popular budget" },
        "nec_2090uxi": { name: "NEC LCD2090UXi", type: "Monitor", year: 2006, size: "20\"", resolution: "1600x1200", panel: "IPS", refreshRate: "60Hz", msrp: 1000, notes: "Color accurate" },
        "nec_2490wuxi": { name: "NEC LCD2490WUXi", type: "Monitor", year: 2007, size: "24\"", resolution: "1920x1200", panel: "IPS", refreshRate: "60Hz", msrp: 1200, notes: "Professional" },
        "apple_cinema_23": { name: "Apple Cinema Display 23\"", type: "Monitor", year: 2004, size: "23\"", resolution: "1920x1200", panel: "IPS", refreshRate: "60Hz", msrp: 1300, notes: "Aluminum design" },
        "apple_cinema_30": { name: "Apple Cinema Display 30\"", type: "Monitor", year: 2004, size: "30\"", resolution: "2560x1600", panel: "IPS", refreshRate: "60Hz", msrp: 3000, notes: "Premium Apple" },
        "eizo_s2431w": { name: "Eizo FlexScan S2431W", type: "Monitor", year: 2007, size: "24\"", resolution: "1920x1200", panel: "VA", refreshRate: "60Hz", msrp: 1000, notes: "Eizo quality" },
        "hp_lp3065": { name: "HP LP3065", type: "Monitor", year: 2007, size: "30\"", resolution: "2560x1600", panel: "IPS", refreshRate: "60Hz", msrp: 1800, notes: "Pro 30\" IPS" },
        "lg_l227wtg": { name: "LG L227WTG", type: "Monitor", year: 2007, size: "22\"", resolution: "1680x1050", panel: "TN", refreshRate: "60Hz", responseTime: "2ms", msrp: 300, notes: "Fast TN" },
        "viewsonic_vx2835wm": { name: "ViewSonic VX2835wm", type: "Monitor", year: 2008, size: "28\"", resolution: "1920x1200", panel: "TN", refreshRate: "60Hz", msrp: 600, notes: "Large budget" },
        "samsung_t260": { name: "Samsung T260", type: "Monitor", year: 2009, size: "25.5\"", resolution: "1920x1200", panel: "TN", refreshRate: "60Hz", responseTime: "2ms", msrp: 450, notes: "Gaming focus" },
    },
    "2010-2014": {
        // Gaming 120Hz Era
        "benq_xl2420t": { name: "BenQ XL2420T", type: "Monitor", year: 2012, size: "24\"", resolution: "1920x1080", panel: "TN", refreshRate: "120Hz", responseTime: "2ms", hdr: "No", msrp: 450, notes: "First mainstream 120Hz" },
        "asus_vg278h": { name: "ASUS VG278H", type: "Monitor", year: 2012, size: "27\"", resolution: "1920x1080", panel: "TN", refreshRate: "120Hz", responseTime: "2ms", "3d": true, msrp: 600, notes: "3D Vision ready" },
        "benq_xl2411z": { name: "BenQ XL2411Z", type: "Monitor", year: 2014, size: "24\"", resolution: "1920x1080", panel: "TN", refreshRate: "144Hz", responseTime: "1ms", msrp: 350, notes: "Popular esports" },
        // First 144Hz
        "asus_vg248qe": { name: "ASUS VG248QE", type: "Monitor", year: 2013, size: "24\"", resolution: "1920x1080", panel: "TN", refreshRate: "144Hz", responseTime: "1ms", msrp: 280, notes: "Legendary 144Hz" },
        "benq_xl2720z": { name: "BenQ XL2720Z", type: "Monitor", year: 2014, size: "27\"", resolution: "1920x1080", panel: "TN", refreshRate: "144Hz", responseTime: "1ms", msrp: 500, notes: "27\" 144Hz" },
        "aoc_g2460pqu": { name: "AOC G2460PQU", type: "Monitor", year: 2014, size: "24\"", resolution: "1920x1080", panel: "TN", refreshRate: "144Hz", responseTime: "1ms", msrp: 300, notes: "Budget 144Hz" },
        // 1440p IPS
        "dell_u2711": { name: "Dell UltraSharp U2711", type: "Monitor", year: 2010, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "60Hz", responseTime: "6ms", msrp: 1100, notes: "First affordable 1440p" },
        "dell_u2713hm": { name: "Dell UltraSharp U2713HM", type: "Monitor", year: 2012, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "60Hz", responseTime: "8ms", msrp: 700, notes: "Popular 1440p" },
        "dell_u2715h": { name: "Dell UltraSharp U2715H", type: "Monitor", year: 2014, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "60Hz", responseTime: "8ms", msrp: 550, notes: "Affordable 1440p" },
        "asus_pb278q": { name: "ASUS PB278Q", type: "Monitor", year: 2013, size: "27\"", resolution: "2560x1440", panel: "PLS", refreshRate: "60Hz", responseTime: "5ms", msrp: 600, notes: "Value 1440p" },
        "asus_pa248q": { name: "ASUS PA248Q", type: "Monitor", year: 2012, size: "24\"", resolution: "1920x1200", panel: "IPS", refreshRate: "60Hz", responseTime: "6ms", msrp: 400, notes: "ProArt 24\"" },
        // Korean 1440p Overclockable
        "catleap_q270": { name: "Yamasaki Catleap Q270", type: "Monitor", year: 2012, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "60Hz (96Hz OC)", msrp: 350, notes: "Overclockable 1440p" },
        "qnix_qx2710": { name: "QNIX QX2710", type: "Monitor", year: 2013, size: "27\"", resolution: "2560x1440", panel: "PLS", refreshRate: "60Hz (120Hz OC)", msrp: 300, notes: "Legendary OC monitor" },
        "crossover_27q": { name: "Crossover 27Q", type: "Monitor", year: 2013, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "60Hz (100Hz OC)", msrp: 320, notes: "Korean import" },
        // First 4K
        "sharp_pn_k321": { name: "Sharp PN-K321", type: "Monitor", year: 2013, size: "32\"", resolution: "3840x2160", panel: "IGZO", refreshRate: "60Hz", msrp: 5500, notes: "First 4K monitor" },
        "asus_pq321q": { name: "ASUS PQ321Q", type: "Monitor", year: 2013, size: "31.5\"", resolution: "3840x2160", panel: "IGZO", refreshRate: "60Hz", msrp: 3500, notes: "Early 4K" },
        "dell_up2414q": { name: "Dell UP2414Q", type: "Monitor", year: 2014, size: "24\"", resolution: "3840x2160", panel: "IPS", refreshRate: "60Hz", msrp: 1100, notes: "First 24\" 4K" },
        "samsung_u28d590d": { name: "Samsung U28D590D", type: "Monitor", year: 2014, size: "28\"", resolution: "3840x2160", panel: "TN", refreshRate: "60Hz", responseTime: "1ms", msrp: 600, notes: "Budget 4K gaming" },
        "dell_p2815q": { name: "Dell P2815Q", type: "Monitor", year: 2014, size: "28\"", resolution: "3840x2160", panel: "TN", refreshRate: "30Hz (60Hz DP)", msrp: 550, notes: "Affordable 4K" },
        // Pro
        "nec_pa272w": { name: "NEC PA272W", type: "Monitor", year: 2014, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "60Hz", msrp: 1100, notes: "Color critical" },
        "eizo_cg277": { name: "Eizo ColorEdge CG277", type: "Monitor", year: 2014, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "60Hz", msrp: 2000, notes: "Reference grade" },
    },
    "2015-2019": {
        // G-Sync Era
        "asus_pg278q": { name: "ASUS ROG Swift PG278Q", type: "Monitor", year: 2014, size: "27\"", resolution: "2560x1440", panel: "TN", refreshRate: "144Hz", responseTime: "1ms", gsync: true, msrp: 800, notes: "First G-Sync 1440p" },
        "acer_xb270hu": { name: "Acer XB270HU", type: "Monitor", year: 2015, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "144Hz", gsync: true, msrp: 750, notes: "First 1440p IPS G-Sync" },
        "asus_pg279q": { name: "ASUS ROG Swift PG279Q", type: "Monitor", year: 2015, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "165Hz", gsync: true, hdr: "No", msrp: 800, notes: "Popular 1440p gaming" },
        "viewsonic_xg2703gs": { name: "ViewSonic XG2703-GS", type: "Monitor", year: 2017, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "165Hz", gsync: true, msrp: 700, notes: "Value G-Sync" },
        "dell_s2716dg": { name: "Dell S2716DG", type: "Monitor", year: 2015, size: "27\"", resolution: "2560x1440", panel: "TN", refreshRate: "144Hz", gsync: true, msrp: 550, notes: "Budget G-Sync" },
        "dell_s2417dg": { name: "Dell S2417DG", type: "Monitor", year: 2016, size: "24\"", resolution: "2560x1440", panel: "TN", refreshRate: "165Hz", gsync: true, msrp: 400, notes: "24\" 1440p G-Sync" },
        // 1440p IPS Mainstream
        "lg_27gl850": { name: "LG 27GL850-B", type: "Monitor", year: 2019, size: "27\"", resolution: "2560x1440", panel: "Nano IPS", refreshRate: "144Hz", responseTime: "1ms", hdr: "HDR10", msrp: 500, notes: "Best 1440p IPS 2019" },
        "lg_27gl83a": { name: "LG 27GL83A-B", type: "Monitor", year: 2019, size: "27\"", resolution: "2560x1440", panel: "Nano IPS", refreshRate: "144Hz", responseTime: "1ms", msrp: 380, notes: "Value 27GL850" },
        // Ultrawide
        "lg_34uc97": { name: "LG 34UC97", type: "Monitor", year: 2014, size: "34\"", resolution: "3440x1440", panel: "IPS", refreshRate: "60Hz", curved: true, msrp: 1000, notes: "First curved ultrawide" },
        "acer_x34": { name: "Acer Predator X34", type: "Monitor", year: 2015, size: "34\"", resolution: "3440x1440", panel: "IPS", refreshRate: "100Hz", gsync: true, curved: true, msrp: 1200, notes: "Gaming ultrawide" },
        "asus_pg348q": { name: "ASUS ROG Swift PG348Q", type: "Monitor", year: 2016, size: "34\"", resolution: "3440x1440", panel: "IPS", refreshRate: "100Hz", gsync: true, curved: true, msrp: 1100, notes: "ROG ultrawide" },
        "alienware_aw3418dw": { name: "Alienware AW3418DW", type: "Monitor", year: 2017, size: "34\"", resolution: "3440x1440", panel: "IPS", refreshRate: "120Hz", gsync: true, curved: true, hdr: "No", msrp: 1000, notes: "Popular UW" },
        "lg_34gk950f": { name: "LG 34GK950F", type: "Monitor", year: 2018, size: "34\"", resolution: "3440x1440", panel: "Nano IPS", refreshRate: "144Hz", freesync: true, hdr: "HDR400", msrp: 1000, notes: "Fast ultrawide" },
        // First 240Hz
        "benq_xl2540": { name: "BenQ XL2540", type: "Monitor", year: 2017, size: "24.5\"", resolution: "1920x1080", panel: "TN", refreshRate: "240Hz", responseTime: "1ms", msrp: 500, notes: "First 240Hz" },
        "benq_xl2546": { name: "BenQ XL2546", type: "Monitor", year: 2017, size: "24.5\"", resolution: "1920x1080", panel: "TN", refreshRate: "240Hz", dyac: true, msrp: 550, notes: "DyAc blur reduction" },
        "asus_pg258q": { name: "ASUS ROG Swift PG258Q", type: "Monitor", year: 2017, size: "24.5\"", resolution: "1920x1080", panel: "TN", refreshRate: "240Hz", gsync: true, msrp: 530, notes: "G-Sync 240Hz" },
        "alienware_aw2518h": { name: "Alienware AW2518H", type: "Monitor", year: 2017, size: "25\"", resolution: "1920x1080", panel: "TN", refreshRate: "240Hz", gsync: true, msrp: 500, notes: "Alienware esports" },
        // First HDR
        "asus_pg27uq": { name: "ASUS ROG Swift PG27UQ", type: "Monitor", year: 2018, size: "27\"", resolution: "3840x2160", panel: "IPS + FALD", refreshRate: "144Hz", gsync: true, hdr: "HDR1000", msrp: 2000, notes: "First HDR1000 144Hz" },
        "acer_x27": { name: "Acer Predator X27", type: "Monitor", year: 2018, size: "27\"", resolution: "3840x2160", panel: "IPS + FALD", refreshRate: "144Hz", gsync: true, hdr: "HDR1000", msrp: 2000, notes: "4K HDR flagship" },
        "asus_pg35vq": { name: "ASUS ROG Swift PG35VQ", type: "Monitor", year: 2019, size: "35\"", resolution: "3440x1440", panel: "VA + FALD", refreshRate: "200Hz", gsync: true, hdr: "HDR1000", msrp: 2500, notes: "UW HDR flagship" },
        // 4K 60Hz 
        "lg_27ud88": { name: "LG 27UD88-W", type: "Monitor", year: 2016, size: "27\"", resolution: "3840x2160", panel: "IPS", refreshRate: "60Hz", msrp: 650, notes: "USB-C 4K" },
        "dell_up2718q": { name: "Dell UP2718Q", type: "Monitor", year: 2017, size: "27\"", resolution: "3840x2160", panel: "IPS", refreshRate: "60Hz", hdr: "HDR1000", msrp: 2000, notes: "HDR creator" },
        "samsung_u32j590": { name: "Samsung U32J590", type: "Monitor", year: 2018, size: "32\"", resolution: "3840x2160", panel: "VA", refreshRate: "60Hz", msrp: 350, notes: "Budget 4K" },
    },
    "2020-2024": {
        // OLED Era
        "lg_48cx": { name: "LG 48CX OLED", type: "Monitor", year: 2020, size: "48\"", resolution: "3840x2160", panel: "OLED", refreshRate: "120Hz", responseTime: "1ms", hdr: "HDR10/DV", msrp: 1500, notes: "First OLED for gaming" },
        "lg_48c1": { name: "LG 48C1 OLED", type: "Monitor", year: 2021, size: "48\"", resolution: "3840x2160", panel: "OLED", refreshRate: "120Hz", responseTime: "1ms", hdr: "HDR10/DV", msrp: 1300, notes: "Improved C1" },
        "lg_c2_42": { name: "LG C2 42\" OLED", type: "Monitor", year: 2022, size: "42\"", resolution: "3840x2160", panel: "OLED (Evo)", refreshRate: "120Hz", responseTime: "0.1ms", hdr: "HDR10/DV", msrp: 1100, notes: "First 42\" OLED" },
        "lg_c3_42": { name: "LG C3 42\" OLED", type: "Monitor", year: 2023, size: "42\"", resolution: "3840x2160", panel: "OLED (Evo)", refreshRate: "120Hz", responseTime: "0.1ms", hdr: "HDR10/DV", msrp: 1000, notes: "Updated C2" },
        "asus_pg42uq": { name: "ASUS ROG Swift PG42UQ", type: "Monitor", year: 2022, size: "42\"", resolution: "3840x2160", panel: "OLED", refreshRate: "138Hz", responseTime: "0.1ms", hdr: "HDR True Black", msrp: 1400, notes: "Gaming OLED panel" },
        "alienware_aw3423dw": { name: "Alienware AW3423DW", type: "Monitor", year: 2022, size: "34\"", resolution: "3440x1440", panel: "QD-OLED", refreshRate: "175Hz", responseTime: "0.1ms", hdr: "HDR True Black 400", msrp: 1300, notes: "First QD-OLED monitor" },
        "alienware_aw3423dwf": { name: "Alienware AW3423DWF", type: "Monitor", year: 2023, size: "34\"", resolution: "3440x1440", panel: "QD-OLED", refreshRate: "165Hz", hdr: "HDR True Black 400", freesync: true, msrp: 1100, notes: "FreeSync QD-OLED" },
        "lg_27gr95qe": { name: "LG UltraGear 27GR95QE", type: "Monitor", year: 2023, size: "27\"", resolution: "2560x1440", panel: "WOLED", refreshRate: "240Hz", responseTime: "0.03ms", hdr: "HDR True Black 400", msrp: 1000, notes: "27\" OLED gaming" },
        "asus_pg27aqdm": { name: "ASUS ROG Swift PG27AQDM", type: "Monitor", year: 2023, size: "27\"", resolution: "2560x1440", panel: "WOLED", refreshRate: "240Hz", responseTime: "0.03ms", hdr: "HDR True Black 400", msrp: 1000, notes: "Popular 27\" OLED" },
        "msi_pg321urv": { name: "MSI MPG 321URX", type: "Monitor", year: 2024, size: "32\"", resolution: "3840x2160", panel: "QD-OLED", refreshRate: "240Hz", responseTime: "0.03ms", hdr: "HDR True Black 400", msrp: 1100, notes: "4K QD-OLED" },
        // High-Refresh 1440p
        "lg_27gp850": { name: "LG 27GP850-B", type: "Monitor", year: 2021, size: "27\"", resolution: "2560x1440", panel: "Nano IPS", refreshRate: "180Hz", responseTime: "1ms", hdr: "HDR400", msrp: 450, notes: "Fast Nano IPS" },
        "lg_27gn800": { name: "LG 27GN800-B", type: "Monitor", year: 2020, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "144Hz", responseTime: "1ms", hdr: "HDR10", msrp: 350, notes: "Value 1440p" },
        "dell_s2722dgm": { name: "Dell S2722DGM", type: "Monitor", year: 2021, size: "27\"", resolution: "2560x1440", panel: "VA", refreshRate: "165Hz", responseTime: "1ms", curved: true, msrp: 250, notes: "Budget curved" },
        "asus_vg27aq1a": { name: "ASUS TUF VG27AQ1A", type: "Monitor", year: 2021, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "170Hz", responseTime: "1ms", hdr: "HDR10", msrp: 310, notes: "Popular 1440p" },
        "msi_g274qrf": { name: "MSI Optix G274QPF", type: "Monitor", year: 2022, size: "27\"", resolution: "2560x1440", panel: "Rapid IPS", refreshRate: "170Hz", responseTime: "1ms", msrp: 350, notes: "Flat gaming" },
        "gigabyte_m27q": { name: "Gigabyte M27Q", type: "Monitor", year: 2020, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "170Hz", responseTime: "0.5ms", msrp: 330, notes: "KVM switch built-in" },
        // Ultrawide Current
        "samsung_g9": { name: "Samsung Odyssey G9", type: "Monitor", year: 2020, size: "49\"", resolution: "5120x1440", panel: "VA", refreshRate: "240Hz", responseTime: "1ms", curved: "1000R", hdr: "HDR1000", msrp: 1400, notes: "Super ultrawide" },
        "samsung_neo_g9": { name: "Samsung Odyssey Neo G9", type: "Monitor", year: 2021, size: "49\"", resolution: "5120x1440", panel: "VA + Mini LED", refreshRate: "240Hz", hdr: "HDR2000", curved: "1000R", msrp: 2000, notes: "Mini LED beast" },
        "lg_38gn950": { name: "LG 38GN950-B", type: "Monitor", year: 2020, size: "38\"", resolution: "3840x1600", panel: "Nano IPS", refreshRate: "160Hz", hdr: "HDR600", msrp: 1500, notes: "21:9 ultrawide" },
        "alienware_aw3821dw": { name: "Alienware AW3821DW", type: "Monitor", year: 2020, size: "38\"", resolution: "3840x1600", panel: "IPS", refreshRate: "144Hz", hdr: "HDR600", gsync: true, msrp: 1500, notes: "38\" gaming UW" },
        // 4K 144Hz
        "asus_pg32uqx": { name: "ASUS ROG Swift PG32UQX", type: "Monitor", year: 2021, size: "32\"", resolution: "3840x2160", panel: "IPS + Mini LED", refreshRate: "144Hz", hdr: "HDR1400", msrp: 3000, notes: "Mini LED 4K" },
        "gigabyte_m32u": { name: "Gigabyte M32U", type: "Monitor", year: 2021, size: "32\"", resolution: "3840x2160", panel: "IPS", refreshRate: "144Hz", hdr: "HDR400", msrp: 700, notes: "Value 4K 144Hz" },
        "lg_32gq950": { name: "LG 32GQ950-B", type: "Monitor", year: 2022, size: "32\"", resolution: "3840x2160", panel: "Nano IPS", refreshRate: "144Hz", hdr: "HDR1000", msrp: 1000, notes: "Nano IPS 4K" },
        "msi_mag321urx": { name: "MSI MAG 321UPX", type: "Monitor", year: 2023, size: "32\"", resolution: "3840x2160", panel: "IPS", refreshRate: "240Hz", hdr: "HDR600", msrp: 900, notes: "First 4K 240Hz" },
        // Esports 360Hz
        "asus_pg259qn": { name: "ASUS ROG Swift PG259QN", type: "Monitor", year: 2020, size: "24.5\"", resolution: "1920x1080", panel: "IPS", refreshRate: "360Hz", gsync: true, responseTime: "1ms", msrp: 700, notes: "First 360Hz" },
        "benq_xl2566k": { name: "BenQ Zowie XL2566K", type: "Monitor", year: 2022, size: "24.5\"", resolution: "1920x1080", panel: "TN", refreshRate: "360Hz", dyac: true, msrp: 700, notes: "DyAc+ esports" },
        "asus_pg27aqn": { name: "ASUS ROG Swift PG27AQN", type: "Monitor", year: 2023, size: "27\"", resolution: "2560x1440", panel: "IPS", refreshRate: "360Hz", msrp: 1000, notes: "1440p 360Hz!" },
        // Budget Popular
        "aoc_24g2": { name: "AOC 24G2", type: "Monitor", year: 2020, size: "24\"", resolution: "1920x1080", panel: "IPS", refreshRate: "144Hz", responseTime: "1ms", msrp: 180, notes: "Budget king" },
        "dell_s2421hgf": { name: "Dell S2421HGF", type: "Monitor", year: 2020, size: "24\"", resolution: "1920x1080", panel: "TN", refreshRate: "144Hz", msrp: 150, notes: "Budget Dell" },
        "viewsonic_xg2431": { name: "ViewSonic XG2431", type: "Monitor", year: 2022, size: "24\"", resolution: "1920x1080", panel: "IPS", refreshRate: "240Hz", msrp: 350, notes: "Blur Busters approved" },
        "asus_vg249q1a": { name: "ASUS TUF VG249Q1A", type: "Monitor", year: 2021, size: "24\"", resolution: "1920x1080", panel: "IPS", refreshRate: "165Hz", msrp: 200, notes: "Budget 1080p" },
    }
};

export const MONITOR_CUSTOM_PARTS = {};

export const MONITOR_PARTS = {
    ...MONITOR_BY_ERA['2000-2009'],
    ...MONITOR_BY_ERA['2010-2014'],
    ...MONITOR_BY_ERA['2015-2019'],
    ...MONITOR_BY_ERA['2020-2024'],
    ...MONITOR_BY_ERA['2025'],
    ...MONITOR_CUSTOM_PARTS,
};

export default {
    MONITOR_BY_ERA,
    MONITOR_PARTS,
};
