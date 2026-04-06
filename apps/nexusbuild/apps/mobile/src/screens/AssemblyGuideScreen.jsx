import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';

// ============================================
// ASSEMBLY STEPS DATA
// ============================================
const ASSEMBLY_STEPS = [
    {
        id: 1,
        title: 'Install the CPU',
        difficulty: 'Medium',
        time: '5 min',
        icon: 'hardware-chip',
        instructions: [
            'Open the CPU socket by lifting the retention lever.',
            'Locate the golden triangle on the CPU corner - it aligns with the triangle on the socket.',
            'Gently place the CPU into the socket - DO NOT force it.',
            'Close the metal bracket and push the lever down firmly.',
        ],
        proTip: 'Never touch the gold contacts on the bottom of the CPU.',
        commonMistake: 'Forcing the CPU in the wrong orientation.',
    },
    {
        id: 2,
        title: 'Apply Thermal Paste',
        difficulty: 'Easy',
        time: '2 min',
        icon: 'water',
        instructions: [
            'Skip if your cooler has pre-applied thermal paste.',
            'Apply a pea-sized dot to the center of the CPU.',
            'Don\'t spread it manually - the cooler pressure will do this.',
        ],
        proTip: 'Less is more - too much paste can spill over.',
        commonMistake: 'Applying too much thermal paste.',
    },
    {
        id: 3,
        title: 'Install CPU Cooler',
        difficulty: 'Medium',
        time: '10 min',
        icon: 'snow',
        instructions: [
            'Align the cooler mounting bracket with the motherboard holes.',
            'Apply even pressure when securing the cooler.',
            'Connect the CPU fan header to the motherboard.',
        ],
        proTip: 'Tighten screws in a cross pattern for even pressure.',
        commonMistake: 'Forgetting to remove the plastic cover.',
    },
    {
        id: 4,
        title: 'Install RAM',
        difficulty: 'Easy',
        time: '3 min',
        icon: 'cellular',
        instructions: [
            'Open the RAM slot clips on both sides.',
            'Align the RAM notch with the slot key.',
            'Press down firmly until you hear a click on both sides.',
        ],
        proTip: 'Check your motherboard manual for optimal slot placement.',
        commonMistake: 'Not pushing RAM in firmly enough.',
    },
    {
        id: 5,
        title: 'Install M.2 SSD',
        difficulty: 'Easy',
        time: '3 min',
        icon: 'speedometer',
        instructions: [
            'Locate the M.2 slot on your motherboard.',
            'Insert the SSD at a 30-degree angle.',
            'Press down and secure with the mounting screw.',
        ],
        proTip: 'Remove any heatsink covers before installing.',
        commonMistake: 'Forgetting to install the standoff screw first.',
    },
    {
        id: 6,
        title: 'Prepare the Case & Install PSU',
        difficulty: 'Easy',
        time: '5 min',
        icon: 'flash',
        instructions: [
            'Lay the case flat on its side for easier access.',
            'Remove both side panels.',
            'Mount PSU with fan facing DOWN (toward vent) or UP (if no vent).',
            'Secure PSU with four screws.',
            'Route main cables (24-pin, CPU, GPU) through the back panel.',
        ],
        proTip: 'Installing PSU first makes cable routing easier before the motherboard blocks access.',
        commonMistake: 'Installing PSU after motherboard makes cable routing harder.',
    },
    {
        id: 7,
        title: 'Install Motherboard in Case',
        difficulty: 'Medium',
        time: '10 min',
        icon: 'grid',
        instructions: [
            'Install I/O shield in the case first - snap it in from inside.',
            'Ensure standoffs are installed for your motherboard size (ATX/mATX/ITX).',
            'Lower motherboard at an angle, fitting I/O ports through the shield first.',
            'Align all screw holes with standoffs.',
            'Hand-tighten all screws, then snug them - don\'t overtighten!',
        ],
        proTip: 'A magnetic screwdriver helps avoid dropping screws on the motherboard.',
        commonMistake: 'Forgetting to install the I/O shield before the motherboard.',
    },
    {
        id: 8,
        title: 'Install GPU',
        difficulty: 'Easy',
        time: '5 min',
        icon: 'videocam',
        instructions: [
            'Remove the necessary PCIe slot covers from the case.',
            'Align GPU with the PCIe x16 slot.',
            'Press down firmly until the clip locks.',
            'Secure with screws to the case.',
        ],
        proTip: 'Support heavy GPUs with a brace to prevent sag.',
        commonMistake: 'Forgetting to connect power cables.',
    },
    {
        id: 9,
        title: 'Connect Power Cables',
        difficulty: 'Medium',
        time: '10 min',
        icon: 'git-branch',
        instructions: [
            'Connect 24-pin ATX power to motherboard.',
            'Connect CPU power (4+4 pin or 8 pin).',
            'Connect GPU power cables if required.',
            'Connect SATA power to drives.',
        ],
        proTip: 'Route cables neatly for better airflow.',
        commonMistake: 'Forgetting the CPU power connector.',
    },
    {
        id: 10,
        title: 'Connect Front Panel',
        difficulty: 'Hard',
        time: '10 min',
        icon: 'toggle',
        instructions: [
            'Connect power switch, reset switch.',
            'Connect HDD LED and Power LED.',
            'Connect front USB headers.',
            'Connect front audio header.',
        ],
        proTip: 'Refer to your motherboard manual for pin layout.',
        commonMistake: 'Reversing the LED polarity.',
    },
    {
        id: 11,
        title: 'Cable Management',
        difficulty: 'Easy',
        time: '15 min',
        icon: 'git-merge',
        instructions: [
            'Route cables behind the motherboard tray.',
            'Use zip ties to bundle cables together.',
            'Ensure no cables block fans or airflow.',
        ],
        proTip: 'Good cable management improves airflow and looks.',
        commonMistake: 'Blocking fan intake with cables.',
    },
    {
        id: 12,
        title: 'First Boot Test',
        difficulty: 'Easy',
        time: '5 min',
        icon: 'power',
        instructions: [
            'Double-check all connections.',
            'Connect monitor, keyboard, and mouse.',
            'Turn on the power supply.',
            'Press the power button and watch for POST.',
        ],
        proTip: 'If no display, check RAM and GPU seating first.',
        commonMistake: 'Forgetting to flip the PSU power switch.',
    },
];

const PRE_BUILD_CHECKLIST = [
    { id: 'tools', label: 'Phillips head screwdriver' },
    { id: 'workspace', label: 'Clear, clean workspace' },
    { id: 'antistatic', label: 'Anti-static wrist strap (optional but recommended)' },
    { id: 'manuals', label: 'Component manuals nearby' },
    { id: 'patience', label: 'Patience and time (2-4 hours)' },
];

// ============================================
// STEP CARD COMPONENT
// ============================================
function StepCard({ step, isExpanded, isCompleted, onToggle, onComplete, theme }) {
    const difficultyColor = step.difficulty === 'Easy' ? theme.colors.success :
        step.difficulty === 'Medium' ? theme.colors.warning : theme.colors.error;

    return (
        <GlassCard style={styles.stepCard}>
            <TouchableOpacity onPress={onToggle} style={styles.stepHeader}>
                <View style={styles.stepNumberContainer}>
                    <View style={[
                        styles.stepNumber,
                        { backgroundColor: isCompleted ? theme.colors.success : theme.colors.accentPrimary }
                    ]}>
                        {isCompleted ? (
                            <Ionicons name="checkmark" size={18} color="#FFF" />
                        ) : (
                            <Text style={styles.stepNumberText}>{step.id}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.stepTitleArea}>
                    <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                        {step.title}
                    </Text>
                    <View style={styles.stepMeta}>
                        <View style={[styles.badge, { borderColor: difficultyColor }]}>
                            <Text style={[styles.badgeText, { color: difficultyColor }]}>{step.difficulty}</Text>
                        </View>
                        <View style={styles.timeBadge}>
                            <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                            <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>{step.time}</Text>
                        </View>
                    </View>
                </View>

                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={theme.colors.textMuted}
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.stepContent}>
                    <View style={styles.instructionsList}>
                        {step.instructions.map((instruction, idx) => (
                            <View key={idx} style={styles.instructionItem}>
                                <Text style={[styles.instructionNumber, { color: theme.colors.accentPrimary }]}>
                                    {idx + 1}.
                                </Text>
                                <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
                                    {instruction}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Pro Tip */}
                    <View style={[styles.tipBox, { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success }]}>
                        <View style={styles.tipHeader}>
                            <Ionicons name="bulb" size={18} color={theme.colors.success} />
                            <Text style={[styles.tipTitle, { color: theme.colors.success }]}>Pro Tip</Text>
                        </View>
                        <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{step.proTip}</Text>
                    </View>

                    {/* Common Mistake */}
                    <View style={[styles.tipBox, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error }]}>
                        <View style={styles.tipHeader}>
                            <Ionicons name="warning" size={18} color={theme.colors.error} />
                            <Text style={[styles.tipTitle, { color: theme.colors.error }]}>Avoid This</Text>
                        </View>
                        <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{step.commonMistake}</Text>
                    </View>

                    {!isCompleted && (
                        <TouchableOpacity
                            style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
                            onPress={onComplete}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                            <Text style={styles.completeButtonText}>Mark as Complete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </GlassCard>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AssemblyGuideScreen({ navigation }) {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();

    const [expandedStep, setExpandedStep] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [checkedItems, setCheckedItems] = useState([]);
    const [showChecklist, setShowChecklist] = useState(false);

    const toggleStep = (stepId) => {
        setExpandedStep(expandedStep === stepId ? null : stepId);
    };

    const completeStep = (stepId) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
            if (stepId < ASSEMBLY_STEPS.length) {
                setExpandedStep(stepId + 1);
            }
        }
    };

    const toggleCheckItem = (itemId) => {
        if (checkedItems.includes(itemId)) {
            setCheckedItems(checkedItems.filter(id => id !== itemId));
        } else {
            setCheckedItems([...checkedItems, itemId]);
        }
    };

    const totalTime = ASSEMBLY_STEPS.reduce((sum, step) => sum + parseInt(step.time), 0);
    const completedTime = completedSteps.reduce((sum, stepId) => {
        const step = ASSEMBLY_STEPS.find(s => s.id === stepId);
        return sum + (step ? parseInt(step.time) : 0);
    }, 0);

    return (
        <Layout>
            <Header navigation={navigation} />

            <View style={[styles.content, { paddingHorizontal: width < 768 ? 16 : 40 }]}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroEmoji}>🔧</Text>
                    <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
                        PC Assembly Guide
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                        Step-by-step instructions to build your PC
                    </Text>
                </View>

                {/* Progress Card */}
                <GlassCard style={styles.progressCard}>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressTrack, { backgroundColor: theme.colors.glassBorder }]}>
                            <View style={[
                                styles.progressFill,
                                {
                                    backgroundColor: theme.colors.success,
                                    width: `${(completedSteps.length / ASSEMBLY_STEPS.length) * 100}%`
                                }
                            ]} />
                        </View>
                        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                            {completedSteps.length} of {ASSEMBLY_STEPS.length} steps completed
                        </Text>
                    </View>
                    <View style={styles.timeStats}>
                        <Text style={[styles.timeStat, { color: theme.colors.textMuted }]}>
                            ⏱️ {completedTime} / {totalTime} min
                        </Text>
                    </View>
                </GlassCard>

                {/* Pre-Build Checklist */}
                <GlassCard style={styles.checklistCard}>
                    <TouchableOpacity onPress={() => setShowChecklist(!showChecklist)} style={styles.checklistHeader}>
                        <View style={styles.checklistTitleRow}>
                            <Ionicons name="clipboard-outline" size={24} color={theme.colors.warning} />
                            <Text style={[styles.checklistTitle, { color: theme.colors.textPrimary }]}>
                                Pre-Build Checklist
                            </Text>
                        </View>
                        <View style={styles.checklistProgress}>
                            <Text style={[styles.checklistCount, { color: theme.colors.textMuted }]}>
                                {checkedItems.length}/{PRE_BUILD_CHECKLIST.length}
                            </Text>
                            <Ionicons
                                name={showChecklist ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={theme.colors.textMuted}
                            />
                        </View>
                    </TouchableOpacity>

                    {showChecklist && (
                        <View style={styles.checklistItems}>
                            {PRE_BUILD_CHECKLIST.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.checkItem}
                                    onPress={() => toggleCheckItem(item.id)}
                                >
                                    <Ionicons
                                        name={checkedItems.includes(item.id) ? 'checkbox' : 'square-outline'}
                                        size={24}
                                        color={checkedItems.includes(item.id) ? theme.colors.success : theme.colors.textMuted}
                                    />
                                    <Text style={[
                                        styles.checkText,
                                        {
                                            color: theme.colors.textSecondary,
                                            textDecorationLine: checkedItems.includes(item.id) ? 'line-through' : 'none'
                                        }
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </GlassCard>

                {/* Steps Section */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    Assembly Steps
                </Text>

                {ASSEMBLY_STEPS.map((step) => (
                    <StepCard
                        key={step.id}
                        step={step}
                        isExpanded={expandedStep === step.id}
                        isCompleted={completedSteps.includes(step.id)}
                        onToggle={() => toggleStep(step.id)}
                        onComplete={() => completeStep(step.id)}
                        theme={theme}
                    />
                ))}

                {/* Completion Card */}
                {completedSteps.length === ASSEMBLY_STEPS.length && (
                    <GlassCard style={styles.completionCard}>
                        <Text style={styles.completionEmoji}>🎉</Text>
                        <Text style={[styles.completionTitle, { color: theme.colors.textPrimary }]}>
                            Congratulations!
                        </Text>
                        <Text style={[styles.completionText, { color: theme.colors.textSecondary }]}>
                            You've completed your PC build! Time to install your OS and start gaming.
                        </Text>
                        <TouchableOpacity
                            style={[styles.ctaButton, { backgroundColor: theme.colors.accentPrimary }]}
                            onPress={() => navigation.navigate('ChatTab', { screen: 'ChatMain', params: { mode: 'assistant' } })}
                        >
                            <Text style={styles.ctaButtonText}>Ask Nexus for Help</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </GlassCard>
                )}

                <View style={{ height: 40 }} />
            </View>
        </Layout>
    );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    content: {
        paddingTop: 20,
        paddingBottom: 40,
    },
    heroSection: { alignItems: 'center', marginBottom: 24 },
    heroEmoji: { fontSize: 48, marginBottom: 10 },
    heroTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    heroSubtitle: { fontSize: 15, textAlign: 'center' },
    progressCard: { padding: 20, marginBottom: 16 },
    progressContainer: { marginBottom: 12 },
    progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressText: { textAlign: 'center', marginTop: 8, fontSize: 14 },
    timeStats: { flexDirection: 'row', justifyContent: 'center' },
    timeStat: { fontSize: 13 },
    checklistCard: { padding: 16, marginBottom: 20 },
    checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    checklistTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    checklistTitle: { fontSize: 18, fontWeight: '600' },
    checklistProgress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checklistCount: { fontSize: 14 },
    checklistItems: { marginTop: 16, gap: 12 },
    checkItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkText: { fontSize: 15, flex: 1 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    stepCard: { marginBottom: 12, padding: 0, overflow: 'hidden' },
    stepHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    stepNumberContainer: { width: 40, alignItems: 'center' },
    stepNumber: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    stepNumberText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    stepTitleArea: { flex: 1 },
    stepTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    stepMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 12 },
    stepContent: { padding: 16, paddingTop: 0, gap: 16 },
    instructionsList: { gap: 10 },
    instructionItem: { flexDirection: 'row', gap: 8 },
    instructionNumber: { fontWeight: 'bold', fontSize: 14, width: 20 },
    instructionText: { flex: 1, fontSize: 14, lineHeight: 20 },
    tipBox: { padding: 14, borderRadius: 12, borderWidth: 1 },
    tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    tipTitle: { fontWeight: '700', fontSize: 14 },
    tipText: { fontSize: 13, lineHeight: 19 },
    completeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
    completeButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
    completionCard: { padding: 32, alignItems: 'center', marginTop: 20 },
    completionEmoji: { fontSize: 64, marginBottom: 16 },
    completionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    completionText: { fontSize: 15, textAlign: 'center', marginBottom: 20, maxWidth: 300 },
    ctaButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, gap: 8 },
    ctaButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
