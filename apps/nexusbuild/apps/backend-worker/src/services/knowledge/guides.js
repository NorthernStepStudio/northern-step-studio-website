/**
 * 📚 KNOWLEDGE: Build Guides & Assembly Steps
 *
 * Sources:
 * - BuildGuideScreen.jsx (General guides, troubleshooting)
 * - AssemblyGuideScreen.jsx (Step-by-step assembly)
 */

export const GUIDE_KNOWLEDGE = {
    // Troubleshooting common issues
    troubleshooting: [
        {
            title: 'No Display Output',
            triggers: ['no display', 'black screen', 'monitor not working', 'no signal', 'wont turn on'],
            content: `**No Display Output Fixes:**
1. Check monitor power and connection to GPU (not motherboard!)
2. Reseat RAM: Remove sticks, install one in slot A2, listen for click.
3. Reseat GPU: Remove and reinstall cleanly.
4. Check Debug LEDs on motherboard (CPU/DRAM/VGA).
5. Clear CMOS: Remove coin battery for 5 mins.`
        },
        {
            title: 'Boot Loops & Crashes',
            triggers: ['restart', 'boot loop', 'crash', 'keeps restarting', 'shutdown', 'blue screen', 'bsod'],
            content: `**Boot Loop / Crash Fixes:**
1. Test minimal hardware: CPU + 1 RAM stick + GPU only.
2. Check PSU cables: CPU (top left) and 24-pin fully verified.
3. Check Temps: Is CPU cooler mounted correctly? Plastic cover removed?
4. RAM unstable: Disable XMP in BIOS temporarily.`
        },
        {
            title: 'Overheating',
            triggers: ['hot', 'overheating', 'temperature', '90 degrees', 'too hot', 'thermal'],
            content: `**Overheating Solutions:**
1. **CPU:** Check cooler mounting pressure. Did you apply thermal paste? Did you remove the plastic peel?
2. **Airflow:** Ensure front fans pull air IN, rear/top fans push air OUT.
3. **Thermal Paste:** Pea-sized dot in the center. Replace if >3 years old.`
        }
    ],

    // Step-by-step assembly
    assembly: [
        {
            step: 1,
            title: 'Install CPU',
            triggers: ['how to install cpu', 'put cpu in', 'cpu installation', 'install processor'],
            content: `**Step 1: Install CPU**
1. Lift relation lever.
2. Align golden triangle on CPU with triangle on socket.
3. Place gently - DO NOT FORCE.
4. Lower lever to lock.
*Tip: Never touch gold pins!*`
        },
        {
            step: 2,
            title: 'Apply Thermal Paste',
            triggers: ['thermal paste', 'how much paste', 'apply paste'],
            content: `**Step 2: Thermal Paste**
1. Apply pea-sized dot to center of CPU heatspreader.
2. Cooler pressure will spread it.
*Tip: Too much makes a mess, too little causes overheating.*`
        },
        {
            step: 3,
            title: 'Install Cooler',
            triggers: ['install cooler', 'mount cooler', 'fan installation'],
            content: `**Step 3: Install Cooler**
1. Remove plastic peel from cooler base!
2. Align brackets with holes.
3. Tighten screws in X pattern (top-left, bottom-right...).
4. Plug fan into CPU_FAN header.`
        },
        {
            step: 4,
            title: 'Install RAM',
            triggers: ['install ram', 'install memory', 'put ram in'],
            content: `**Step 4: Install RAM**
1. Open clips on slots (usually A2 and B2 for 2 sticks).
2. Align notch on stick with slot.
3. Press DOWN FIRMLY until it CLICKS.
*Common Mistake: Not pushing hard enough.*`
        },
        {
            step: 5,
            title: 'Install GPU',
            triggers: ['install gpu', 'install graphics card', 'put gpu in'],
            content: `**Step 8: Install GPU**
1. Remove metal PCIe covers from case back.
2. Open PCIe slot clip.
3. Push card into top x16 slot until CLICK.
4. Screw bracket to case.
5. Plug in PCIe power cables.`
        },
        {
            step: 6,
            title: 'Case & PSU',
            triggers: ['install psu', 'power supply installation', 'case prep'],
            content: `**Step 6: Prepare Case & Install PSU**
1. Remove side panels.
2. Install PSU (fan usually faces filter/vent).
3. Screw in with 4 screws.
4. Route 24-pin and CPU cables to back.`
        },
        {
            step: 7,
            title: 'Install Motherboard',
            triggers: ['install motherboard', 'mount motherboard', 'standoffs'],
            content: `**Step 7: Install Motherboard**
1. Install I/O Shield (if not pre-installed).
2. Check standoffs match your board size (ATX/mATX).
3. Lower board in at angle.
4. Screw in all screws - hand tight only!`
        },
        {
            step: 9,
            title: 'Connect Power Cables',
            triggers: ['connect power', 'plug in cables', 'psu cables', 'where cables go'],
            content: `**Step 9: Power Connections**
1. **24-pin:** Big one on right side of motherboard.
2. **CPU (4+4/8-pin):** Top-left of motherboard.
3. **GPU (PCIe):** Into your graphics card.
4. **SATA:** For hard drives/SSDs.`
        },
        {
            step: 10,
            title: 'Front Panel Connectors',
            triggers: ['front panel', 'power button', 'reset switch', 'leds', 'fpannel'],
            content: `**Step 10: Front Panel Header**
These are tricky! Check your motherboard manual for the pinout.
Typical Layout:
- Top: P_LED+, P_LED-, PWR_SW
- Bottom: HDD_LED+, HDD_LED-, RST_SW
*Tip: Text usually faces OUT/Down.*`
        },
        {
            step: 11,
            title: 'Cable Management',
            triggers: ['cable management', 'messy cables', 'tidy cables'],
            content: `**Step 11: Cable Management**
1. Use zip ties or velcro.
2. Pull slack to the back of the case.
3. Don't block fans!
*Good airflow = lower temps.*`
        },
        {
            step: 12,
            title: 'First Boot',
            triggers: ['first boot', 'turn it on', 'test boot'],
            content: `**Step 12: First Boot Test**
1. Connect Monitor to GPU (not motherboard).
2. Flip PSU switch to "I" (On).
3. Press Case Power Button.
4. Look for "Post" screen or BIOS.
*No display? Check RAM seating first.*`
        }
    ],

    // General concepts
    concepts: [
        {
            title: 'Tools Needed',
            triggers: ['tools', 'what tools', 'equipment', 'screwdriver'],
            content: `**Essential Tools for Building:**
✅ Phillips Head Screwdriver (#2) - The only mandatory tool.
✅ Clean Workspace (Table, not carpet).
✅ Good Lighting.
*Optional:* Anti-static strap, Zip ties, Magnetic tray.`
        },
        {
            title: 'Compatibility Rules',
            triggers: ['compatibility', 'will it work', 'compatible', 'socket'],
            content: `**Golden Rules of Compatibility:**
1. **CPU + Mobo:** Must share socket (e.g., LGA1700 for Intel 12/13/14th, AM5 for Ryzen 7000).
2. **RAM:** DDR5 boards need DDR5 RAM. DDR4 needs DDR4.
3. **Case:** Must fit Mobo size (ATX, mATX) and GPU length.`
        },
        {
            title: 'Workstation Tips',
            triggers: ['workstation', 'video editing', 'rendering', 'ecc', 'productivity'],
            content: `**Workstation Building Tips:**
- **Video Editing:** Prioritize CPU cores (Intel i7/i9 or Ryzen 9). 32GB+ RAM.
- **Rendering:** Needs strong GPU (NVIDIA usually preferred /w CUDA).
- **ECC Memory:** Only needed for mission-critical math/science servers. Not for editing.`
        },
        {
            title: 'Bottlenecks',
            triggers: ['bottleneck', 'will it bottleneck', 'cpu or gpu bottleneck'],
            content: `**Understanding Bottlenecks:**
A bottleneck is when one part slows down another.
- **CPU Bottleneck:** CPU hits 100%, GPU waits. Happens in 1080p esports games or with weak CPUs.
- **GPU Bottleneck:** GPU hits 100%, CPU waits. **This is GOOD/NORMAL** for gaming PCs.
*Fix:* Pair modern CPUs (i5/R5) with modern GPUs.`
        },
        {
            title: 'Airflow',
            triggers: ['airflow', 'fans', 'cooling setup'],
            content: `**Airflow Basics:**
- **Intake (Front/Bottom):** Pull cool air in. Filtered.
- **Exhaust (Rear/Top):** Push hot air out.
- **Positive Pressure:** More intake than exhaust = less dust build-up.`
        }
    ],

    // Beginner Guides
    beginner: [
        {
            title: 'Understanding PC Components',
            triggers: ['components', 'what parts', 'parts needed', 'beginner guide', 'what do i need'],
            content: `**Every PC needs these core components:**
• **CPU (Processor)** - The brain (Intel/AMD).
• **GPU (Graphics Card)** - Renders games. Essential.
• **RAM (Memory)** - 16GB is standard, 32GB for power users.
• **Storage** - NVMe SSDs are fastest (3-7GB/s).
• **Motherboard** - Connects everything. Must match CPU socket.
• **Power Supply (PSU)** - Delivers power. Don't cheap out!
• **Case** - Houses everything. Check size (ATX/mATX).`
        },
        {
            title: 'Setting a Budget',
            triggers: ['budget', 'how much to spend', 'cost', 'allocation', 'money'],
            content: `**Budget Allocation Guide:**
**$500-700 (Entry):** CPU 25%, GPU 35%, RAM 8%, Storage 10%, Mobo 12%, PSU/Case 10%.
**$1000-1500 (Mid):** CPU 20%, GPU 40%, RAM 6%, Storage 8%, Mobo 12%, PSU/Case 14%.
**$2000+ (High):** Spend big on GPU (40-50% of budget).`
        }
    ],

    // Gaming Guides
    gaming: [
        {
            title: 'Gaming PC Guide',
            triggers: ['gaming pc guide', 'gaming build', 'how to build gaming pc', 'gaming rig'],
            content: `**Building the Ultimate Gaming Rig:**
1. **GPU is King:** Spending 40-50% of budget on GPU gives best FPS.
2. **Resolution Matters:**
   - 1080p: RTX 4060 / RX 7600
   - 1440p: RTX 4070 / RX 7800 XT
   - 4K: RTX 4080 / 4090 / RX 7900 XTX
3. **RAM:** 16GB is minimum, 32GB is recommended for 2024 games.
4. **Storage:** NVMe SSD is a must for fast load times.`
        },
        {
            title: 'GPU Priority',
            triggers: ['gpu priority', 'graphics card importance', 'best part for gaming'],
            content: `**For gaming, the GPU is king!**
• Games are GPU-bound 80%+ of the time.
• Better GPU = Higher FPS.
• VRAM Matters: 8GB min for 1080p, 12GB for 1440p, 16GB+ for 4K.`
        }
    ]
};
