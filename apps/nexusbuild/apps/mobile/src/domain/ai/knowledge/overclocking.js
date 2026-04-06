/**
 * ⚡ KNOWLEDGE: Overclocking Guide
 * 
 * CPU, GPU, and RAM overclocking guides with safety warnings.
 */

export const OVERCLOCKING_GUIDE = {
    // === SAFETY WARNINGS ===
    warnings: {
        title: '⚠️ Overclocking Warnings',
        points: [
            'Overclocking voids some warranties (check your manufacturer)',
            'Improper overclocking can damage components permanently',
            'Always monitor temperatures during stress testing',
            'Start conservative, increase slowly',
            'Ensure adequate cooling BEFORE overclocking',
            'Use a quality PSU with headroom',
            'Not all chips overclock the same (silicon lottery)',
        ]
    },

    // === CPU OVERCLOCKING ===
    cpu: {
        intel: {
            title: 'Intel CPU Overclocking (K-Series)',
            requirements: [
                'K or KF suffix CPU (i5-14600K, i9-14900K, etc.)',
                'Z-series motherboard (Z790, Z890)',
                'Adequate cooling (240mm+ AIO for i7/i9)',
                'Quality PSU (750W+ for high-end)',
            ],
            steps: [
                {
                    step: 1,
                    title: 'Update BIOS',
                    content: 'Flash to latest BIOS. Manufacturers often improve stability and add features.'
                },
                {
                    step: 2,
                    title: 'Set XMP Profile',
                    content: 'Enable XMP for RAM to run at rated speeds. This alone improves performance.'
                },
                {
                    step: 3,
                    title: 'Run Baseline Stress Test',
                    content: 'Run Cinebench R23 and note: Score, Max temps, Stock voltages. This is your baseline.'
                },
                {
                    step: 4,
                    title: 'Increase All-Core Multiplier',
                    content: 'Start by increasing P-Core ratio by 1x (e.g., 54x to 55x). Run stress test. If stable, continue.'
                },
                {
                    step: 5,
                    title: 'Adjust Voltage if Needed',
                    content: 'If unstable: Add +0.025V to Vcore. If temps too high: Reduce voltage or multiplier. Target: Under 1.35V for daily use.'
                },
                {
                    step: 6,
                    title: 'Long-Term Stability Test',
                    content: 'Run stress test for 30+ minutes. Check for: WHEA errors in Event Viewer, Crashes/reboots, Temps under 95°C.'
                }
            ],
            tempLimits: {
                safe: '< 85°C',
                acceptable: '85-95°C',
                danger: '> 95°C (throttling)',
                shutdown: '> 100°C (thermal shutdown)'
            },
            softwareTools: [
                'Intel XTU (Extreme Tuning Utility)',
                'HWiNFO64 (monitoring)',
                'Cinebench R23 (stress test)',
                'Prime95 (extreme stress test)',
                'OCCT (stability testing)',
            ],
            notes: 'Intel 13th/14th gen runs HOT. Consider undervolting instead of overclocking for better thermals.'
        },

        amd: {
            title: 'AMD Ryzen Overclocking',
            requirements: [
                'X3D CPUs: Cannot traditional OC (locked multiplier)',
                'Regular Ryzen: Any AM4/AM5 CPU works',
                'B-series or X-series motherboard',
                'Adequate cooling',
            ],
            methods: {
                pbo: {
                    name: 'PBO (Precision Boost Overdrive)',
                    description: 'Automatic overclocking. AMD-supported and safe.',
                    steps: [
                        'Enable PBO in BIOS',
                        'Set Limits to "Motherboard" or "Manual"',
                        'Increase PBO Limits: PPT, TDC, EDC (use +15% as starting point)',
                        'Enable Curve Optimizer (CO) for extra performance',
                        'Start with CO: -10 All Cores, test stability',
                        'Reduce per-core if crashes occur'
                    ]
                },
                curveOptimizer: {
                    name: 'Curve Optimizer (Best Method)',
                    description: 'Undervolt for higher boost clocks. FREE performance.',
                    steps: [
                        'Set CO to Per-Core or All-Cores',
                        'Start with -15 All Cores',
                        'Run CoreCycler for 30min per core',
                        'If core fails: Reduce that core by 5 (e.g., -15 to -10)',
                        'Best cores can often do -30, worst cores might only do -5'
                    ]
                },
                manual: {
                    name: 'Manual Overclock',
                    description: 'Fixed frequency. Less efficient but predictable.',
                    steps: [
                        'Set fixed all-core frequency (e.g., 5.0GHz on 7800X3D)',
                        'Set fixed voltage (start at stock ~1.2V)',
                        'Test stability',
                        'NOT recommended for daily use - PBO is better'
                    ]
                }
            },
            tempLimits: {
                zen4_safe: '< 85°C',
                zen4_acceptable: '85-95°C (Tjmax is 95°C)',
                zen3_safe: '< 80°C',
                zen3_acceptable: '80-90°C (Tjmax is 90°C)',
            },
            x3dNotes: 'X3D CPUs (5800X3D, 7800X3D, 9800X3D) have limited OC. Use PBO + Curve Optimizer only. No manual OC.',
            softwareTools: [
                'Ryzen Master',
                'HWiNFO64',
                'CoreCycler (CO testing)',
                'OCCT',
            ]
        }
    },

    // === GPU OVERCLOCKING ===
    gpu: {
        title: 'GPU Overclocking',
        requirements: [
            'Adequate case airflow',
            'PSU with 100W+ headroom',
            'Modern GPU with good cooling',
        ],
        tools: [
            'MSI Afterburner (universal, best choice)',
            'EVGA Precision X1 (EVGA cards)',
            'ASUS GPU Tweak (ASUS cards)',
        ],
        steps: [
            {
                step: 1,
                title: 'Install MSI Afterburner',
                content: 'Works with all GPU brands. Enable voltage control in settings if available.'
            },
            {
                step: 2,
                title: 'Increase Power Limit',
                content: 'Set to maximum. This allows the GPU to boost higher before throttling.'
            },
            {
                step: 3,
                title: 'Increase Core Clock',
                content: 'Add +50MHz. Run 3DMark or game for 10 minutes. If stable, add another +25MHz. Repeat until crash/artifacts.'
            },
            {
                step: 4,
                title: 'Find Crash Point, Back Off',
                content: 'When you crash or see artifacts, reduce by 25-50MHz. This is your stable OC.'
            },
            {
                step: 5,
                title: 'Increase Memory Clock',
                content: 'Add +100MHz. Test. Memory OC is less sensitive. Many GPUs can do +300-500MHz memory.'
            },
            {
                step: 6,
                title: 'Set Fan Curve',
                content: 'Custom fan curve for better thermals. Aim to stay under 80°C during gaming.'
            },
            {
                step: 7,
                title: 'Apply and Save Profile',
                content: 'Save profile in Afterburner. Enable "Start with Windows" and "Apply at startup".'
            }
        ],
        undervolting: {
            title: 'GPU Undervolting (Better than OC for some)',
            description: 'Reduce voltage while maintaining clocks. Lower temps, quieter, same performance.',
            steps: [
                'Open Afterburner, click Ctrl+F for voltage/frequency curve',
                'Find your desired frequency (e.g., 2000MHz)',
                'Drag that point down to a lower voltage (e.g., 950mV instead of 1050mV)',
                'Click Apply. Test for stability.',
                'Adjust curve until stable at lowest voltage'
            ],
            benefits: [
                'Lower temps (5-15°C reduction)',
                'Quieter fans',
                'Same or better performance',
                'Longer GPU lifespan'
            ]
        },
        tempLimits: {
            optimal: '< 75°C',
            safe: '75-80°C',
            acceptable: '80-85°C',
            hot: '85-90°C (consider better cooling)',
            danger: '> 90°C (thermal throttling)'
        }
    },

    // === RAM OVERCLOCKING ===
    ram: {
        title: 'RAM Overclocking',
        xmpExpo: {
            name: 'XMP / EXPO Profiles',
            description: 'One-click RAM overclocking. Just enable in BIOS.',
            steps: [
                'Enter BIOS (Del or F2 on boot)',
                'Find XMP (Intel) or EXPO (AMD) setting',
                'Enable Profile 1 (or highest stable profile)',
                'Save and reboot',
                'Run MemTest86 for 1-2 hours to verify stability'
            ],
            notes: 'This is technically overclocking RAM beyond JEDEC specs, but it\'s supported and safe.'
        },
        manual: {
            name: 'Manual RAM Overclocking',
            description: 'For enthusiasts who want maximum performance.',
            warning: 'Advanced users only. Incorrect settings can prevent boot.',
            steps: [
                'Set primary timings (CL, tRCD, tRP, tRAS) manually',
                'Increase voltage (DDR4: 1.35-1.45V, DDR5: 1.35-1.45V)',
                'Test with MemTest86 or Karhu RAM Test',
                'Tighten secondary timings for more gains',
                'Document all working settings'
            ],
            amdNotes: 'AMD benefits more from fast RAM. 6000MHz is sweet spot for Zen 4/5.',
            intelNotes: 'Intel is less RAM-sensitive, but still benefits from XMP.'
        },
        troubleshooting: [
            'PC won\'t boot after XMP: Clear CMOS, try lower XMP profile',
            'Random crashes: RAM might not be stable. Run MemTest86.',
            'Only one profile works: Try lower speed profiles first',
            'Some kits need more voltage for advertised speeds'
        ]
    },

    // === STABILITY TESTING ===
    stabilityTesting: {
        cpu: [
            { name: 'Cinebench R23', duration: '30 min', type: 'Standard stress test' },
            { name: 'Prime95 (Small FFTs)', duration: '30 min', type: 'Maximum stress (heat)' },
            { name: 'OCCT', duration: '1 hour', type: 'Comprehensive stability' },
            { name: 'Y-Cruncher', duration: '1 hour', type: 'AVX heavy workload' },
        ],
        gpu: [
            { name: '3DMark TimeSpy', duration: 'Loop for 30min', type: 'Graphics stress' },
            { name: 'FurMark', duration: '15 min', type: 'Maximum stress (heat)' },
            { name: 'Unigine Heaven/Superposition', duration: '30 min', type: 'Benchmark loop' },
        ],
        ram: [
            { name: 'MemTest86', duration: '4+ passes', type: 'Bootable memory test' },
            { name: 'Karhu RAM Test', duration: '1000%+ coverage', type: 'Windows memory test' },
            { name: 'TestMem5', duration: '3 cycles', type: 'Quick memory test' },
        ],
        system: [
            { name: 'OCCT', duration: '1 hour each test', type: 'All-in-one' },
            { name: 'Real-world gaming', duration: '2+ hours', type: 'Practical stability' },
        ]
    },

    // === QUICK TIPS ===
    quickTips: [
        'Undervolting is often better than overclocking for thermals',
        'XMP/EXPO is free performance - always enable it',
        'GPU memory OC is usually free performance with minimal risk',
        'Never OC with inadequate cooling',
        'Keep HWiNFO running to monitor temps and voltages',
        'Silicon lottery is real - not all chips OC the same',
        'Stability in benchmarks ≠ stability in all applications',
        'Document your stable settings before experimenting further'
    ]
};

// Helper functions
export const getOCGuideForCPU = (cpuBrand) => {
    return cpuBrand.toLowerCase().includes('intel')
        ? OVERCLOCKING_GUIDE.cpu.intel
        : OVERCLOCKING_GUIDE.cpu.amd;
};

export const getSafeTemp = (component) => {
    if (component === 'gpu') return OVERCLOCKING_GUIDE.gpu.tempLimits;
    if (component === 'intel') return OVERCLOCKING_GUIDE.cpu.intel.tempLimits;
    if (component === 'amd') return OVERCLOCKING_GUIDE.cpu.amd.tempLimits;
    return null;
};

export default OVERCLOCKING_GUIDE;
