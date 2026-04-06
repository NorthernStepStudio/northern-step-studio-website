import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';

// Guide images
const GUIDE_IMAGES = {
    cpu: require('../../assets/images/guides/cpu_installation.png'),
    thermal: require('../../assets/images/guides/thermal_paste.png'),
    ram: require('../../assets/images/guides/ram_installation.png'),
    cables: require('../../assets/images/guides/cable_management.png'),
};

const GUIDE_SECTIONS = [
    {
        id: 'beginner',
        title: '🎓 Beginner\'s Guide',
        subtitle: 'First time builder? Start here!',
        icon: 'school-outline',
        color: '#4ECDC4',
        topics: [
            {
                title: 'Understanding PC Components',
                content: `**Every PC needs these core components:**

• **CPU (Processor)** - The brain of your computer. Intel and AMD are the main manufacturers. Higher core counts = better multitasking.

• **GPU (Graphics Card)** - Renders images and video. Essential for gaming. NVIDIA and AMD make consumer cards.

• **RAM (Memory)** - Short-term memory for active tasks. 16GB is the sweet spot for most users, 32GB for power users.

• **Storage** - NVMe SSDs are fastest (3-7GB/s), SATA SSDs are good (500MB/s), HDDs are cheapest but slowest.

• **Motherboard** - Connects everything together. Must match your CPU socket type (LGA1700 for Intel 12th-14th gen, AM5 for AMD Ryzen 7000).

• **Power Supply (PSU)** - Delivers power to all components. 650W is good for mid-range, 850W+ for high-end builds.

• **Case** - Houses everything. Make sure it fits your motherboard size (ATX, Micro-ATX, Mini-ITX).`,
            },
            {
                title: 'Setting a Budget',
                content: `**Budget allocation guide:**

**$500-700 (Entry Level)**
• CPU: 25% (~$150)
• GPU: 35% (~$200)  
• RAM: 8% (~$50)
• Storage: 10% (~$60)
• Motherboard: 12% (~$80)
• PSU + Case: 10% (~$70)

**$1000-1500 (Mid Range)**
• CPU: 20% (~$250)
• GPU: 40% (~$500)
• RAM: 6% (~$80)
• Storage: 8% (~$100)
• Motherboard: 12% (~$150)
• PSU + Case: 14% (~$180)

**$2000+ (High End)**
• GPU should be your biggest investment for gaming
• Don't skimp on the PSU - cheap PSUs can damage components
• Leave ~10% buffer for peripherals and extras`,
            },
            {
                title: 'Compatibility Basics',
                content: `**Key compatibility rules:**

**CPU + Motherboard:**
• Intel LGA1700 socket → Z790/B760 motherboards
• AMD AM5 socket → X670/B650 motherboards
• AMD AM4 socket → X570/B550 motherboards (older but still great)

**RAM + Motherboard:**
• DDR5 motherboards only work with DDR5 RAM
• DDR4 motherboards only work with DDR4 RAM
• Check your motherboard's max supported speed

**GPU + Case:**
• Measure GPU length - modern cards are LONG (300-350mm)
• Check case GPU clearance in specs
• Some cases don't fit 3-slot cards

**Cooler + Case:**
• Tower coolers: check max CPU cooler height
• AIOs: check radiator mount support (240mm, 360mm)

**PSU Wattage:**
• Use a PSU calculator (PCPartPicker has one)
• Add 100-150W headroom above calculated need`,
            },
            {
                title: 'Tools You\'ll Need',
                content: `**Essential tools:**

✅ **Phillips head screwdriver (#2)** - 90% of PC assembly uses this
✅ **Anti-static wrist strap** - Prevents static damage ($5-10, worth it!)
✅ **Good lighting** - You need to see what you're doing
✅ **Clean, flat workspace** - A table or desk, not carpet
✅ **Zip ties or velcro straps** - For cable management

**Nice to have:**

• Magnetic screwdriver - Helps with tiny screws
• Flashlight or headlamp - For seeing dark corners
• Tweezers - For dropped screws
• Isopropyl alcohol (90%+) - For cleaning thermal paste
• Microfiber cloth - For cleaning

**Time needed:**

• First build: 3-4 hours (take your time!)
• Experienced: 1-2 hours
• Don't rush - it's not a race`,
            },
        ],
    },
    {
        id: 'gaming',
        title: '🎮 Gaming PC Guide',
        subtitle: 'Build the ultimate gaming rig',
        icon: 'game-controller-outline',
        color: '#FF6B6B',
        topics: [
            {
                title: 'GPU Priority',
                content: `**For gaming, the GPU is king!**

**Why GPU matters most:**
• Games are GPU-bound 80%+ of the time
• A better GPU = higher FPS and better visuals
• Resolution increases GPU demand exponentially

**GPU tiers for 2024:**

**1080p Gaming (Budget: $200-350)**
• RTX 4060 / RX 7600 - 60+ FPS high settings
• Great for esports and older AAA games

**1440p Gaming (Sweet Spot: $400-600)**
• RTX 4070 / RX 7800 XT - 60+ FPS ultra settings
• Best value for most gamers

**4K Gaming (High-End: $700-1200)**
• RTX 4080 / RX 7900 XTX - 60+ FPS at 4K
• RTX 4090 - Overkill for most, but if you want the best...

**VRAM matters:**
• 8GB minimum for 1080p
• 12GB+ recommended for 1440p
• 16GB+ for 4K with ray tracing`,
            },
            {
                title: 'CPU & GPU Balance',
                content: `**Avoid bottlenecks!**

A "bottleneck" happens when one component limits another. Here's how to balance:

**Budget pairings ($500-800 builds):**
• Intel i3-12100F or Ryzen 5 5600 
• Pair with: RTX 4060 or RX 7600

**Mid-range pairings ($1000-1500 builds):**
• Intel i5-13400F/14400F or Ryzen 5 7600
• Pair with: RTX 4070 or RX 7800 XT

**High-end pairings ($2000+ builds):**
• Intel i7-14700K or Ryzen 7 7800X3D
• Pair with: RTX 4080/4090 or RX 7900 XTX

**Signs of CPU bottleneck:**
• CPU usage at 100%, GPU at 50-70%
• FPS doesn't improve with lower graphics settings

**Signs of GPU bottleneck (this is normal!):**
• GPU usage at 95-100%
• FPS improves when you lower resolution/settings`,
            },
            {
                title: 'RAM for Gaming',
                content: `**How much RAM do you actually need?**

**16GB (2x8GB) - The Standard**
• Enough for 95% of games
• Allows browser tabs while gaming
• Best value for money

**32GB (2x16GB) - Future-Proof**
• Some new games recommend 32GB
• Great for streaming while gaming
• Required for heavy multitasking

**64GB - Overkill for Gaming**
• Only needed for video editing, 3D rendering
• Games won't use this much

**RAM Speed matters for AMD:**
• Ryzen loves fast RAM (DDR5-6000, DDR4-3600)
• Intel is less sensitive but still benefits

**Dual Channel is important:**
• Always use 2 or 4 sticks (not 1 or 3)
• Slots: A2 + B2 typically (check manual)
• Dual channel = 2x the bandwidth`,
                image: 'ram',
            },
            {
                title: 'Storage Considerations',
                content: `**Modern storage hierarchy:**

**Primary Drive (OS + Main Games) - NVMe SSD**
• Get at least 1TB
• PCIe 4.0 is the sweet spot (5000+ MB/s)
• PCIe 5.0 is expensive with minimal gaming benefit

**Recommended NVMe drives:**
• Budget: WD SN770, Kingston NV2
• Mid: Samsung 980 Pro, SK Hynix P41
• High: Samsung 990 Pro, WD SN850X

**Secondary Storage - SATA SSD or HDD**
• SATA SSD: For more games ($60-80/TB)
• HDD: For media, backups ($20-30/TB)

**DirectStorage (coming soon):**
• New tech that loads game assets directly to GPU
• Requires NVMe SSD
• Only a few games support it currently

**Pro tip:**
Keep your OS drive under 80% full for optimal performance`,
            },
        ],
    },
    {
        id: 'workstation',
        title: '💼 Workstation Guide',
        subtitle: 'For creators and professionals',
        icon: 'briefcase-outline',
        color: '#8B5CF6',
        topics: [
            {
                title: 'Multi-Core Performance',
                content: `**Why core count matters for productivity:**

**Video Editing (Premiere, DaVinci):**
• 8+ cores recommended
• Timeline scrubbing uses all cores
• Export times scale with core count

**3D Rendering (Blender, Cinema4D):**
• More cores = faster CPU renders
• 16+ cores ideal for serious work
• Consider Ryzen 9 or Intel i9

**Software Development:**
• Compilation is heavily multi-threaded
• 8-12 cores is the sweet spot
• Fast single-core also matters for IDEs

**Recommended CPUs for workstations:**

**Mid-Range:**
• Intel i7-14700K (20 cores)
• AMD Ryzen 9 7900X (12 cores)

**High-End:**
• Intel i9-14900K (24 cores)
• AMD Ryzen 9 7950X (16 cores)

**Professional:**
• AMD Threadripper (up to 96 cores!)
• Intel Xeon (server-grade reliability)`,
            },
            {
                title: 'ECC Memory',
                content: `**Error-Correcting Code (ECC) Memory:**

**What is ECC?**
• Detects and corrects single-bit memory errors
• Prevents crashes and data corruption
• Standard in servers, available for workstations

**When you need ECC:**
✅ Financial/scientific calculations
✅ Long-running simulations
✅ Mission-critical applications
✅ Large datasets in memory
✅ When data integrity is paramount

**When you DON'T need ECC:**
• Gaming
• General office work
• Casual video editing
• If cost is a major concern

**ECC Requirements:**
• AMD Ryzen supports ECC (non-registered)
• Intel requires Xeon for full ECC support
• Motherboard must support ECC
• ECC RAM costs ~20% more than non-ECC`,
            },
            {
                title: 'Professional GPUs',
                content: `**NVIDIA RTX (Gaming) vs Quadro/A-series (Pro):**

**Gaming GPUs (RTX 4000 series):**
✅ Great for most creative work
✅ Much cheaper
✅ Excellent for GPU rendering (Blender, Octane)
✅ Good driver support

**Professional GPUs (RTX A-series, Quadro):**
✅ Certified drivers for CAD/DCC software
✅ Better viewport performance in CAD
✅ More VRAM options (up to 48GB)
✅ ECC memory option
✅ ISV certifications (important for some employers)

**Recommendations by use case:**

**3D Rendering / VFX:**
• RTX 4090 (best value for CUDA/OptiX)
• RTX A6000 (48GB VRAM for massive scenes)

**CAD / Engineering:**
• RTX A4000/A5000 (certified drivers)
• Still works fine with RTX 4070+

**Machine Learning:**
• RTX 4090 (24GB, great tensor cores)
• Multiple cheaper cards can beat one expensive one`,
            },
            {
                title: 'Reliability Focus',
                content: `**Building for 24/7 uptime:**

**Power Supply:**
• Get 80+ Gold or better efficiency
• Tier A PSUs from Cultist tier list
• Consider redundant PSU for critical work

**Cooling:**
• Oversize your cooling solution
• Lower temps = longer component life
• Consider Noctua fans (quiet + reliable)

**Storage Redundancy:**
• RAID 1 for mirroring critical data
• Separate backup drives
• Cloud backup for offsite protection

**UPS (Uninterruptible Power Supply):**
• Protects against power surges
• Gives time to save work during outage
• 1000VA+ for workstations

**Maintenance:**
• Clean dust every 3-6 months
• Monitor temps with HWiNFO
• Replace thermal paste every 3-5 years
• Keep firmware/drivers updated

**Component choices:**
• Samsung/SK Hynix SSDs (enterprise tier)
• Avoid bottom-tier brands
• Keep receipts for warranty`,
            },
        ],
    },
    {
        id: 'assembly',
        title: '🔧 Step-by-Step Assembly',
        subtitle: 'Interactive build tutorial with images',
        icon: 'construct-outline',
        color: '#F59E0B',
        isInteractive: true,
        topics: [
            {
                title: 'Complete 12-Step Guide',
                content: `**Our interactive assembly guide covers:**

1. ✅ CPU Installation (with alignment guide)
2. ✅ Thermal Paste Application  
3. ✅ CPU Cooler Mounting
4. ✅ RAM Installation
5. ✅ M.2 SSD Installation
6. ✅ Motherboard Installation
7. ✅ Power Supply Installation
8. ✅ GPU Installation
9. ✅ Power Cable Connections
10. ✅ Front Panel Connections
11. ✅ Cable Management
12. ✅ First Boot Test

**Each step includes:**
• Detailed instructions
• Pro tips from experienced builders
• Common mistakes to avoid
• Intel vs AMD specific notes
• Progress tracking`,
                image: 'cpu',
            },
        ],
    },
    {
        id: 'troubleshoot',
        title: '🔍 Troubleshooting',
        subtitle: 'Common problems and solutions',
        icon: 'bug-outline',
        color: '#EF4444',
        topics: [
            {
                title: 'No Display Output',
                content: `**PC turns on but no picture? Try these fixes:**

**Check the basics first:**
1. Is the monitor plugged in and turned on?
2. Is the display cable connected to the GPU (not motherboard)?
3. Is the GPU fully seated in the PCIe slot?
4. Are GPU power cables connected?

**RAM issues (most common cause!):**
• Remove all RAM sticks
• Install ONE stick in slot A2
• Try booting
• If it works, add sticks one by one
• If not, try a different stick

**GPU issues:**
• Reseat the GPU (remove and reinstall)
• Try a different PCIe slot if available
• Test with a different cable (HDMI vs DP)
• Try integrated graphics (if your CPU has it)

**Debug LEDs:**
• Check motherboard for debug LEDs
• CPU/DRAM/VGA/BOOT lights indicate the problem
• Consult your motherboard manual

**Clear CMOS:**
• Turn off PSU, remove power cable
• Remove CMOS battery for 5 minutes
• Or use the CMOS jumper pins`,
            },
            {
                title: 'Boot Loops & Crashes',
                content: `**PC keeps restarting? Here's what to check:**

**Symptoms & causes:**
• Instant restart = power or motherboard issue
• Restart after a few seconds = RAM or CPU issue
• Restart during Windows load = software/driver issue

**Hardware fixes:**
1. **Test with minimal hardware**
   • Only CPU, 1 RAM stick, GPU
   • Disconnect all drives
   • If it boots, add components back one by one

2. **RAM stability**
   • Run MemTest86 (free bootable tool)
   • Disable XMP/EXPO profile temporarily
   • Try lower RAM speeds

3. **Power delivery**
   • Check all power connections
   • Ensure PSU wattage is sufficient
   • Test with a different PSU if possible

**Software fixes (if you can get to Windows):**
• Boot into Safe Mode
• Update/rollback GPU drivers
• Check Event Viewer for errors
• Run "sfc /scannow" in admin CMD`,
            },
            {
                title: 'Overheating Issues',
                content: `**High temps can cause throttling and shutdowns:**

**Healthy temperature ranges:**
• CPU idle: 30-45°C
• CPU gaming load: 60-80°C
• CPU max safe: 90-100°C (throttles here)
• GPU gaming: 65-85°C

**If CPU is overheating:**

1. **Check cooler mounting**
   • Is the cooler making full contact?
   • Are all mounting screws tight?
   • Did you remove the plastic cover?

2. **Thermal paste**
   • Too little = poor heat transfer
   • Too much = also bad (can overflow)
   • Pea-sized dot in center is ideal
   • Replace if dried out (3+ years old)

3. **Case airflow**
   • Need intake AND exhaust fans
   • Front intake, rear/top exhaust
   • Remove dust filters and clean

**If GPU is overheating:**
• Clean dust from heatsink fins
• Ensure good case airflow
• Consider undervolting (free perf!)
• Add a GPU support bracket`,
                image: 'thermal',
            },
            {
                title: 'Blue Screens (BSOD)',
                content: `**Blue Screen of Death troubleshooting:**

**Common BSOD codes:**

**WHEA_UNCORRECTABLE_ERROR**
• Usually hardware-related
• Check RAM stability (disable XMP)
• Could be CPU overclock instability
• May indicate failing hardware

**DRIVER_IRQL_NOT_LESS_OR_EQUAL**
• Driver conflict or corruption
• Update or rollback GPU drivers
• Update Windows and all drivers

**PAGE_FAULT_IN_NONPAGED_AREA**
• Often RAM-related
• Run MemTest86
• Try different RAM slots/sticks

**KERNEL_SECURITY_CHECK_FAILURE**
• Driver issues
• Corrupted system files
• Run "sfc /scannow"

**Debugging tools:**
• **BlueScreenView** - Analyzes crash dumps
• **WhoCrashed** - User-friendly crash analysis
• **Event Viewer** - Check System logs

**General fixes:**
1. Update ALL drivers (use manufacturer sites)
2. Run Windows Memory Diagnostic
3. Check for Windows updates
4. Disable XMP if enabled
5. Reset BIOS to defaults`,
            },
        ],
    },
];

function TopicCard({ topic, theme, image }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={styles.topicCard}>
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                style={styles.topicHeader}
            >
                <Text style={[styles.topicTitle, { color: theme.colors.textPrimary }]}>
                    {topic.title}
                </Text>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.textMuted}
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.topicContent}>
                    {image && GUIDE_IMAGES[image] && (
                        <Image
                            source={GUIDE_IMAGES[image]}
                            style={styles.guideImage}
                            contentFit="contain"
                        />
                    )}
                    <Text style={[styles.topicText, { color: theme.colors.textSecondary }]}>
                        {topic.content}
                    </Text>
                </View>
            )}
        </View>
    );
}

function GuideCard({ section, isExpanded, onPress, theme, navigation }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <GlassCard style={[styles.guideCard, { borderLeftColor: section.color, borderLeftWidth: 4 }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBadge, { backgroundColor: section.color + '20' }]}>
                        <Ionicons name={section.icon} size={28} color={section.color} />
                    </View>
                    <View style={styles.cardTitleArea}>
                        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                            {section.title}
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                            {section.subtitle}
                        </Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color={theme.colors.textMuted}
                    />
                </View>

                {isExpanded && (
                    <View style={styles.topicsContainer}>
                        {section.topics.map((topic, index) => (
                            <TopicCard
                                key={index}
                                topic={topic}
                                theme={theme}
                                image={topic.image}
                            />
                        ))}

                        {section.isInteractive && navigation && (
                            <TouchableOpacity
                                style={[styles.interactiveButton, { backgroundColor: section.color }]}
                                onPress={() => navigation.navigate('AssemblyGuide')}
                            >
                                <Ionicons name="play-circle" size={22} color="#FFF" />
                                <Text style={styles.interactiveButtonText}>Start Interactive Guide</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </GlassCard>
        </TouchableOpacity>
    );
}

export default function BuildGuideScreen({ navigation }) {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [expandedId, setExpandedId] = useState(null);

    const toggleSection = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const totalTopics = GUIDE_SECTIONS.reduce((sum, s) => sum + s.topics.length, 0);

    return (
        <Layout>
            <Header navigation={navigation} />

            <View style={[styles.content, { paddingHorizontal: isMobile ? 16 : 40 }]}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroEmoji}>📚</Text>
                    <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
                        NexusBuild Guides
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                        Expert guides to help you build the perfect PC
                    </Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <GlassCard style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: theme.colors.accentPrimary }]}>
                            {GUIDE_SECTIONS.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Guides</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: theme.colors.success }]}>{totalTopics}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Topics</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: theme.colors.warning }]}>∞</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Free</Text>
                    </GlassCard>
                </View>

                {/* Guide Sections */}
                <View style={styles.guidesContainer}>
                    {GUIDE_SECTIONS.map((section) => (
                        <GuideCard
                            key={section.id}
                            section={section}
                            isExpanded={expandedId === section.id}
                            onPress={() => toggleSection(section.id)}
                            theme={theme}
                            navigation={navigation}
                        />
                    ))}
                </View>

                {/* CTA */}
                <GlassCard style={styles.ctaCard}>
                    <Ionicons name="chatbubble-ellipses-outline" size={32} color={theme.colors.accentPrimary} />
                    <Text style={[styles.ctaTitle, { color: theme.colors.textPrimary }]}>
                        Need More Help?
                    </Text>
                    <Text style={[styles.ctaText, { color: theme.colors.textSecondary }]}>
                        Chat with Nexus AI for personalized build advice
                    </Text>
                    <TouchableOpacity
                        style={[styles.ctaButton, { backgroundColor: theme.colors.accentPrimary }]}
                        onPress={() => navigation.navigate('ChatTab', { screen: 'ChatMain', params: { mode: 'assistant' } })}
                    >
                        <Text style={styles.ctaButtonText}>Ask Nexus AI</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>
                </GlassCard>

                <View style={{ height: 40 }} />
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 20,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    heroEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 30,
    },
    statCard: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    guidesContainer: {
        gap: 12,
        marginBottom: 30,
    },
    guideCard: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBadge: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitleArea: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
    },
    topicsContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        gap: 8,
    },
    topicCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    topicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    topicTitle: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    topicContent: {
        padding: 12,
        paddingTop: 0,
    },
    topicText: {
        fontSize: 13,
        lineHeight: 22,
    },
    guideImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 12,
    },
    interactiveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
    },
    interactiveButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
    ctaCard: {
        alignItems: 'center',
        padding: 30,
        gap: 12,
    },
    ctaTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    ctaText: {
        fontSize: 14,
        textAlign: 'center',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
        marginTop: 8,
    },
    ctaButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
