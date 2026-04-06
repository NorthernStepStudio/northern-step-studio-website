import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Dimensions, useWindowDimensions, Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { formatPrice } from '../utils/chartSimulator';
import { isProUser, getCompletedScenarios, markScenarioCompleted } from '../storage/subscription';
import { ProPaywall } from '../components/ProPaywall';
import { unlockMedal } from '../storage/achievements';

const { width } = Dimensions.get('window');

type SimulationState = 'INPUT' | 'SCENARIO_SELECT' | 'CRISIS' | 'RESULT';
type Path = 'PANIC' | 'HODL' | 'BUY';

interface Scenario {
    id: string;
    name: string;
    description: string;
    drop: number; // e.g. 0.4 for -40%
    subtext: string;
    icon: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: 'noob',
        name: 'The Flash Crash',
        description: 'A sharp, sudden 40% drop over 3 weeks. Modern volatility.',
        drop: 0.40,
        subtext: 'Algorithmic selling cascades. Panic on social media.',
        icon: 'lightning-bolt'
    },
    {
        id: '2008',
        name: '2008 Financial Crisis',
        description: 'The Great Recession. Housing market collapse.',
        drop: 0.51,
        subtext: 'Banks failing. 18 months of relentless red. -51% total.',
        icon: 'home-variant'
    },
    {
        id: '2000',
        name: 'The Dot-com Bubble',
        description: 'Tech stocks were the "future" until they werent.',
        drop: 0.78,
        subtext: 'Nasdaq drops 78%. Many companies vanish forever.',
        icon: 'web'
    },
    {
        id: '1929',
        name: '1929 Great Depression',
        description: 'The worst collapse in human history.',
        drop: 0.89,
        subtext: 'The entire system breaks. 89% of wealth erased.',
        icon: 'alert-decagram'
    }
];

export default function LossSimulator() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Inputs (Pre-filled from URL if redirected from Plan)
    const [principal, setPrincipal] = useState(params.principal ? String(params.principal) : "10000");
    const [monthly, setMonthly] = useState(params.monthly ? String(params.monthly) : "500");
    const [hourlyWage, setHourlyWage] = useState("20");
    const [years, setYears] = useState("10");

    // UI State
    const [step, setStep] = useState<SimulationState>(params.locked === 'true' ? 'SCENARIO_SELECT' : 'INPUT');
    const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
    const [selectedPath, setSelectedPath] = useState<Path | null>(null);
    const [isPro, setIsPro] = useState(true); // Default to true while loading
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        (async () => {
            const pro = await isProUser();
            const completed = await getCompletedScenarios();
            setIsPro(pro);
            setCompletedIds(completed);
        })();
    }, []);

    // Animation values
    const shakeOffset = useSharedValue(0);
    const flashOpacity = useSharedValue(0);
    const chartHeightVal = useSharedValue(1); // 1 to 0.1 for bleeding effect

    const triggerCrisis = (scenario: Scenario) => {
        // Redirect from Plan ALWAYS works (educational trap)
        const isTrap = params.locked === 'true';

        if (!isPro && completedIds.includes(scenario.id) && !isTrap) {
            setShowPaywall(true);
            return;
        }

        setSelectedScenario(scenario);
        setStep('CRISIS');

        // Visceral Shake
        shakeOffset.value = withRepeat(
            withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 })),
            15,
            true
        );

        // Flash Red
        flashOpacity.value = withRepeat(
            withSequence(withTiming(0.4, { duration: 200 }), withTiming(0, { duration: 200 })),
            4,
            true
        );

        // Bleed the Chart
        chartHeightVal.value = 1;
        chartHeightVal.value = withTiming(1 - scenario.drop, { duration: 2500 });

        setTimeout(() => {
            setStep('RESULT');
        }, 3000);
    };

    const handleSelectPath = async (path: Path) => {
        setSelectedPath(path);
        // Mark as completed so free users can't spam it
        await markScenarioCompleted(selectedScenario.id);

        if (path !== 'PANIC') {
            await unlockMedal('BATTLE_TESTED');
        }

        const newCompleted = await getCompletedScenarios();
        setCompletedIds(newCompleted);
    };

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeOffset.value }]
    }));

    const flashStyle = useAnimatedStyle(() => ({
        opacity: flashOpacity.value
    }));

    const bleedingChartStyle = useAnimatedStyle(() => ({
        height: 100 * chartHeightVal.value,
        opacity: 0.5 + (0.5 * chartHeightVal.value)
    }));

    // Math Logic
    const stats = useMemo(() => {
        const p = parseFloat(principal) || 0;
        const m = parseFloat(monthly) || 0;
        const wage = parseFloat(hourlyWage) || 15;
        const y = parseFloat(years) || 10;
        const rate = 0.08 / 12; // 8% annual
        const months = y * 12;

        const calculateFV = (startP: number, contrib: number, durMonths: number) => {
            if (rate === 0) return startP + (contrib * durMonths);
            const fvP = startP * Math.pow(1 + rate, durMonths);
            const fvC = contrib * ((Math.pow(1 + rate, durMonths) - 1) / rate);
            return fvP + fvC;
        };

        const crashValue = p * (1 - selectedScenario.drop);
        const paperLoss = p * selectedScenario.drop;

        // Path Outcomes
        const panicWealth = crashValue;
        const taxDrag = paperLoss * 0.15;
        const actualPanicPocket = crashValue - (crashValue * 0.05);

        const hodlWealth = calculateFV(crashValue, m, months);
        const buyWealth = calculateFV(crashValue + 5000, m, months);

        // Life Recovery: Labor hours (using custom wage)
        const totalLaborCost = paperLoss / wage;
        const laborYears = (paperLoss / (m * 12)).toFixed(1);

        return {
            p, m, y,
            crashValue,
            paperLoss,
            panicWealth,
            actualPanicPocket,
            hodlWealth,
            buyWealth,
            laborYears,
            totalLaborCost: Math.round(totalLaborCost),
            taxDrag: crashValue * 0.15,
            wage
        };
    }, [principal, monthly, years, selectedScenario]);

    const renderInput = () => (
        <Animated.View entering={FadeInDown} style={styles.card}>
            <Text style={styles.cardHeader}>PERSONALIZE THE STRESS</Text>
            <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>STARTING NEST EGG</Text>
                    <TextInput
                        style={styles.input}
                        value={principal}
                        onChangeText={setPrincipal}
                        keyboardType="numeric"
                        placeholder="10000"
                        placeholderTextColor={theme.colors.faint}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>HOURLY WAGE (NET)</Text>
                    <TextInput
                        style={styles.input}
                        value={hourlyWage}
                        onChangeText={setHourlyWage}
                        keyboardType="numeric"
                        placeholder="20"
                        placeholderTextColor={theme.colors.faint}
                    />
                </View>
            </View>
            <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>MONTHLY CONTRIBUTION</Text>
                    <TextInput
                        style={styles.input}
                        value={monthly}
                        onChangeText={setMonthly}
                        keyboardType="numeric"
                        placeholder="500"
                        placeholderTextColor={theme.colors.faint}
                    />
                </View>
            </View>
            <Pressable
                onPress={() => setStep('SCENARIO_SELECT')}
                style={styles.primaryBtn}
            >
                <Text style={styles.primaryBtnText}>ENTER THE ARENA</Text>
            </Pressable>
        </Animated.View>
    );

    const renderScenarioSelect = () => (
        <Animated.View entering={FadeInDown} style={{ gap: 16 }}>
            <View style={{ marginBottom: 8 }}>
                <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 13, textTransform: 'uppercase' }}>CHOOSE YOUR CRISIS</Text>
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', marginTop: 4 }}>
                    Free users get 1 trial per scenario. {isPro ? 'Unlimited for you.' : 'Choose wisely.'}
                </Text>
            </View>
            {SCENARIOS.map((s) => {
                const isUsed = !isPro && completedIds.includes(s.id);
                const isTrap = params.locked === 'true';

                return (
                    <Pressable
                        key={s.id}
                        onPress={() => triggerCrisis(s)}
                        style={({ pressed }) => ({
                            backgroundColor: theme.colors.card,
                            padding: 20,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 16,
                            opacity: (pressed || (isUsed && !isTrap)) ? 0.8 : 1
                        })}
                    >
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons
                                name={(isUsed && !isTrap) ? "lock" : s.icon as any}
                                size={24}
                                color={(isUsed && !isTrap) ? theme.colors.faint : theme.colors.accent}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: (isUsed && !isTrap) ? theme.colors.muted : theme.colors.text, fontSize: 18, fontWeight: '900' }}>{s.name}</Text>
                                {(isUsed && !isTrap) && (
                                    <View style={{ backgroundColor: theme.colors.accent + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ color: theme.colors.accent, fontSize: 9, fontWeight: '900' }}>USED</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '600' }}>{s.description}</Text>
                        </View>
                        <Text style={{ color: (isUsed && !isTrap) ? theme.colors.faint : theme.colors.danger, fontWeight: '900' }}>-{(s.drop * 100)}%</Text>
                    </Pressable>
                );
            })}
        </Animated.View>
    );

    const renderCrisis = () => (
        <View style={styles.crisisContainer}>
            <View style={styles.bleedingChartBox}>
                <Animated.View style={[styles.chartBar, bleedingChartStyle]} />
            </View>
            <MaterialCommunityIcons name="alert-decagram" size={80} color={theme.colors.danger} />
            <Text style={styles.crisisTitle}>{selectedScenario.name.toUpperCase()}</Text>
            <Text style={styles.crisisSubtitle}>-{selectedScenario.drop * 100}% CRASH</Text>
            <View style={styles.shockNumbers}>
                <Text style={styles.shockLabel}>Your {formatPrice(stats.p)} is now</Text>
                <Text style={styles.shockValue}>{formatPrice(stats.crashValue)}</Text>
                <Text style={[styles.shockLabel, { color: theme.colors.danger, fontWeight: '900', marginTop: 8 }]}>-{formatPrice(stats.paperLoss)} ERASED</Text>
            </View>
        </View>
    );

    const renderResult = () => {
        if (!selectedPath) {
            return (
                <Animated.View entering={FadeInDown} style={styles.card}>
                    <Text style={styles.choiceHeader}>THE WORLD IS SCREAMING. WHAT DO YOU DO?</Text>
                    <View style={styles.debtBox}>
                        <Text style={styles.debtTitle}>LABOR LOST (LIFE DEBT)</Text>
                        <Text style={styles.debtValue}>{stats.totalLaborCost.toLocaleString()} HOURS</Text>
                        <Text style={styles.debtSub}>At ${stats.wage}/hr, you just lost {stats.totalLaborCost.toLocaleString()} hours of your life's labor. Panic selling finalizes this theft.</Text>
                    </View>

                    <View style={styles.choiceList}>
                        <Pressable onPress={() => handleSelectPath('PANIC')} style={[styles.choiceBtn, { borderColor: theme.colors.danger + '40' }]}>
                            <MaterialCommunityIcons name="run" size={24} color={theme.colors.danger} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.choiceBtnLabel, { color: theme.colors.danger }]}>PANIC SELL (FINAL LOSS)</Text>
                                <Text style={styles.choiceBtnSub}>Secure the wreckage. Lose {stats.laborYears} years.</Text>
                            </View>
                        </Pressable>

                        <Pressable onPress={() => handleSelectPath('HODL')} style={[styles.choiceBtn, { borderColor: theme.colors.accent + '40' }]}>
                            <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.accent} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.choiceBtnLabel, { color: theme.colors.accent }]}>HODL (THE LONG GAME)</Text>
                                <Text style={styles.choiceBtnSub}>Ignore the noise. Keep contributing.</Text>
                            </View>
                        </Pressable>

                        <Pressable onPress={() => handleSelectPath('BUY')} style={[styles.choiceBtn, { borderColor: theme.colors.success + '40' }]}>
                            <MaterialCommunityIcons name="plus-circle" size={24} color={theme.colors.success} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.choiceBtnLabel, { color: theme.colors.success }]}>BUY THE BLOOD</Text>
                                <Text style={styles.choiceBtnSub}>Use the discount. Retire earlier.</Text>
                            </View>
                        </Pressable>
                    </View>
                </Animated.View>
            );
        }

        const pathData = {
            PANIC: {
                title: "THE FAILURE PATH",
                wealth: stats.panicWealth,
                desc: `You locked in a loss of ${formatPrice(stats.paperLoss)}. Worse, the IRS and exit friction took another ${formatPrice(stats.taxDrag)}. You traded your future for a temporary sense of safety.`,
                color: theme.colors.danger,
                icon: 'skull-outline'
            },
            HODL: {
                title: "THE DISCIPLINED",
                wealth: stats.hodlWealth,
                desc: `By doing nothing, you allowed the market to recover. Your portfolio reached ${formatPrice(stats.hodlWealth)} after 10 years because you didn't let emotions drive the car.`,
                color: theme.colors.accent,
                icon: 'medal-outline'
            },
            BUY: {
                title: "THE OPPORTUNIST",
                wealth: stats.buyWealth,
                desc: `You saw a fire sale while others saw a fire. Your wealth reached ${formatPrice(stats.buyWealth)}, proving that a crisis is just growth in disguise for the brave.`,
                color: theme.colors.success,
                icon: 'crown-outline'
            }
        }[selectedPath];

        return (
            <Animated.View entering={FadeInUp} style={styles.resultView}>
                <View style={[styles.resultCard, { borderColor: pathData.color + '40' }]}>
                    <Text style={[styles.resultTag, { color: pathData.color }]}>{pathData.title}</Text>
                    <Text style={styles.resultWealth}>{formatPrice(pathData.wealth)}</Text>
                    <Text style={styles.resultLabel}>Actual Value in 10 Years</Text>

                    <View style={styles.divider} />

                    <Text style={styles.resultDesc}>{pathData.desc}</Text>

                    {selectedPath === 'PANIC' ? (
                        <View style={styles.lossGap}>
                            <Text style={styles.gapLabel}>MISTAKE PRICE</Text>
                            <Text style={styles.gapValue}>{formatPrice(stats.hodlWealth - stats.panicWealth)}</Text>
                            <Text style={styles.gapSub}>This is what your panic cost you in real wealth. It's equivalent to working for free for {stats.laborYears} years.</Text>
                        </View>
                    ) : (
                        <View style={{ backgroundColor: theme.colors.success + '10', padding: 20, borderRadius: 20, width: '100%', marginBottom: 24, borderWidth: 1, borderColor: theme.colors.success + '30' }}>
                            <Text style={{ color: theme.colors.success, fontWeight: '900', textAlign: 'center' }}> RESOLVE REWARDED: {formatPrice(pathData.wealth - stats.panicWealth)} </Text>
                        </View>
                    )}

                    <Pressable
                        onPress={() => {
                            setStep('SCENARIO_SELECT');
                            setSelectedPath(null);
                            chartHeightVal.value = 1;
                        }}
                        style={styles.retryBtn}
                    >
                        <Text style={styles.retryText}>CHOOSE A DIFFERENT CRISIS</Text>
                    </Pressable>
                </View>
            </Animated.View>
        );
    }

    return (
        <Screen safeTop={true}>
            <Animated.View style={[{ flex: 1, padding: 24 }, shakeStyle]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="close" size={28} color={theme.colors.muted} />
                    </Pressable>
                    <Text style={styles.title}>Truth<Text style={{ color: theme.colors.accent }}> Stress-Test</Text></Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {step === 'INPUT' && renderInput()}
                    {step === 'SCENARIO_SELECT' && renderScenarioSelect()}
                    {step === 'CRISIS' && renderCrisis()}
                    {step === 'RESULT' && renderResult()}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </Animated.View>

            {/* Visceral Red Flash Overlay */}
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: theme.colors.danger },
                    flashStyle
                ]}
            />

            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => setIsPro(true)}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
    },
    backBtn: {
        marginBottom: 8,
        marginLeft: -4,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: theme.colors.text,
        letterSpacing: -1,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 20,
    },
    cardHeader: {
        color: theme.colors.accent,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    inputRow: {
        gap: 8,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: theme.colors.muted,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: theme.colors.bg,
        borderRadius: 16,
        padding: 16,
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    primaryBtn: {
        backgroundColor: theme.colors.accent,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: theme.colors.buttonText,
        fontWeight: '900',
        fontSize: 16,
    },
    crisisContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 40,
        gap: 16,
    },
    bleedingChartBox: {
        width: '100%',
        height: 100,
        backgroundColor: theme.colors.bg,
        borderRadius: 20,
        marginBottom: 20,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chartBar: {
        width: '100%',
        backgroundColor: theme.colors.danger,
    },
    crisisTitle: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
    },
    crisisSubtitle: {
        color: theme.colors.danger,
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
    },
    shockNumbers: {
        marginTop: 32,
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 24,
        borderRadius: 24,
        width: '100%',
    },
    shockLabel: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: '600',
    },
    shockValue: {
        color: theme.colors.text,
        fontSize: 48,
        fontWeight: '900',
    },
    choiceHeader: {
        fontSize: 16,
        fontWeight: '900',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    debtBox: {
        backgroundColor: theme.colors.danger + '10',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.danger + '30',
        alignItems: 'center',
    },
    debtTitle: {
        color: theme.colors.danger,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    debtValue: {
        color: theme.colors.text,
        fontSize: 32,
        fontWeight: '900',
        marginVertical: 4,
    },
    debtSub: {
        color: theme.colors.muted,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '600',
    },
    choiceList: {
        gap: 12,
    },
    choiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        backgroundColor: theme.colors.bg,
        borderRadius: 16,
        borderWidth: 1,
    },
    choiceBtnLabel: {
        fontSize: 14,
        fontWeight: '900',
    },
    choiceBtnSub: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '600',
    },
    resultView: {
        gap: 24,
    },
    resultCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 32,
        padding: 32,
        borderWidth: 2,
        alignItems: 'center',
    },
    resultTag: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    resultWealth: {
        color: theme.colors.text,
        fontSize: 44,
        fontWeight: '900',
    },
    resultLabel: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        width: '100%',
        marginVertical: 24,
    },
    resultDesc: {
        color: theme.colors.text,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 20,
    },
    lossGap: {
        backgroundColor: theme.colors.danger + '10',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.danger + '30',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    gapLabel: {
        color: theme.colors.danger,
        fontSize: 11,
        fontWeight: '900',
    },
    gapValue: {
        color: theme.colors.text,
        fontSize: 32,
        fontWeight: '900',
    },
    gapSub: {
        color: theme.colors.muted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
    },
    retryBtn: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.accent,
    },
    retryText: {
        color: theme.colors.buttonText,
        fontWeight: '900',
        fontSize: 13,
    },
});
