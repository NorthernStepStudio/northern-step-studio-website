import React, { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { Text, View, Pressable, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { listHoldings, getPortfolioSummary, PortfolioSummary, calculateProjectedAnnualYield, syncInitialCash, clearTransactions, depositCash, getTotalDeposits } from "../../storage/transactions";
import { TxKind, AssetType, TransactionRow } from "../../storage/types";
import { APPROVED_ASSETS } from "../../storage/assets";
import { getPlan, PlanRow } from "../../storage/plan";
import { calculateDrift, getRebalancingAdvice, PortfolioDrift, RebalanceAdvice } from "../../storage/rebalancing";
import { isProUser } from "../../storage/subscription";
import { logBlackSwanEvent } from "../../storage/events";
import { getPendingOrders, checkOrdersForFill, fillOrder } from "../../storage/pendingOrders";
import { isMarketOpen } from "../../utils/chartSimulator";
import { addTransaction } from "../../storage/transactions";
import { PortfolioList } from "../../components/PortfolioList";
import { SimulateShiftModal } from "../../components/SimulateShiftModal";
import { WarningText } from "../../components/WarningText";
import { Screen } from "../../components/Screen";
import { theme } from "../../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PortfolioGrowthChart } from "../../components/PortfolioGrowthChart";
import { PerformanceChart } from "../../components/PerformanceChart";
import { AdvancedAnalytics } from "../../components/AdvancedAnalytics";
import { GuideTip } from "../../components/GuideTip";
import { ProPaywall } from "../../components/ProPaywall";
import { TruthToast, ToastType } from "../../components/TruthToast";
import { unlockMedal } from "../../storage/achievements";
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useVelocityNavigate } from '../../hooks/useVelocityNavigate';
import { useNotifications } from "../../components/NotificationContext";

const HEADLINES = {
    CRASH: [
        "PANIC SELLING: The Fed loses control of inflation narratives.",
        "BLACK SWAN EVENT: Global supply chains paralyzed by new rift.",
        "FLASH CRASH: AI algorithms trigger mass liquidation.",
        "BUBBLE BURSTS: Investors realize tech isn't magical after all.",
        "SYSTEMIC RISK: A major bank has quietly stopped withdrawals."
    ],
    CORRECTION: [
        "MARKET CORRECTION: Profit taking in major tech leaders.",
        "FEAR INDEX RISES: Volatility returns as uncertainty peaks.",
        "EARNINGS MISS: Corporate giants show signs of slowing growth.",
        "BOND YIELD SPIKE: Stocks lose appeal relative to 'safe' debt.",
        "GEOPOLITICAL TENSIONS: Crude oil jitters spook the indices."
    ],
    POSITIVE: [
        "BULL RUN: Optimism grows as rate cuts are hinted.",
        "GOLDEN CROSS: Technicals suggest a multi-year breakout.",
        "SOFT LANDING: Economy proves more resilient than expected."
    ],
    MOON: [
        "MOON MISSION: Retail frenzy sends prices into orbit.",
        "SHORT SQUEEZE: Institutional bears forced to buy back at any price.",
        "PARABOLIC MOVE: The chart has gone vertical. Everyone is a genius."
    ]
};

// Helper to extract symbol from asset_name
const getSymbol = (name: string) => name.split(' ')[0].toUpperCase();

export default function Portfolio() {
    const router = useRouter();
    const { screenRef, navigate } = useVelocityNavigate();
    const [kind, setKind] = useState<TxKind>("paper");
    const [items, setItems] = useState<TransactionRow[]>([]);
    const [headline, setHeadline] = useState<{ text: string, type: 'CRASH' | 'CORRECTION' | 'POSITIVE' } | null>(null);
    const [summary, setSummary] = useState<PortfolioSummary>({ total: 0, allocation: [] });
    const [plan, setPlan] = useState<PlanRow | null>(null);
    const [yieldAmount, setYieldAmount] = useState(0);
    const [advice, setAdvice] = useState<RebalanceAdvice[]>([]);
    const [isPro, setIsPro] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [totalContributed, setTotalContributed] = useState(0);
    const [totalDeposits, setTotalDeposits] = useState(0);
    const [drifts, setDrifts] = useState<PortfolioDrift[]>([]);

    // Toast State
    const [toast, setToast] = useState<{ visible: boolean, message: string, type: ToastType }>({
        visible: false,
        message: '',
        type: 'TRUTH'
    });

    const showTruth = (message: string, type: ToastType = 'TRUTH') => {
        setToast({ visible: true, message, type });
    };

    // Track crash survival for Diamond Hands medal
    const crashSurvivalRef = useRef({ inCrash: false, tickCount: 0 });

    // Shake animation for crashes
    const shakeValue = useSharedValue(0);

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeValue.value }]
    }));

    const triggerShake = () => {
        shakeValue.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-5, { duration: 50 }),
            withTiming(5, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const refresh = useCallback(async (k: TxKind) => {
        await syncInitialCash(k);
        const rows = await listHoldings(k);
        const summ = await getPortfolioSummary(k);
        const p = await getPlan();
        const y = await calculateProjectedAnnualYield(k);
        const adv = await getRebalancingAdvice(k);
        const pro = await isProUser();
        const deposits = await getTotalDeposits(k);

        // Calculate total cost basis of CURRENTLY HELD assets
        const contributions = rows
            .filter(r => r.asset_name !== 'CASH')
            .reduce((sum, r) => sum + r.amount, 0);


        const drifters = await calculateDrift(k);

        setItems(rows);
        setSummary(summ);
        setPlan(p);
        setYieldAmount(y);
        setAdvice(adv);
        setIsPro(pro);
        setTotalContributed(contributions);
        setTotalDeposits(deposits);
        setDrifts(drifters);
    }, []);

    const [simMultiplier, setSimMultiplier] = useState(1);
    const { showNudge, history } = useNotifications();
    const [isSimModalVisible, setIsSimModalVisible] = useState(false);

    const simulatedSummary = useMemo(() => {
        let simTotal = 0;
        const simAllocation = summary.allocation.map(a => {
            // Cash shouldn't drift with the market. Only ETFs, Stocks, and Funds.
            const isCash = a.type === 'Other';
            const mult = isCash ? 1 : simMultiplier;
            const simAmt = a.amount * mult;
            simTotal += simAmt;
            return { ...a, amount: simAmt };
        });

        return {
            total: simTotal,
            allocation: simAllocation.map(a => ({
                ...a,
                percentage: simTotal > 0 ? (a.amount / simTotal) * 100 : 0
            }))
        };
    }, [summary, simMultiplier]);

    // Phase BQ: Asset Type Metrics & Insights
    const assetMetrics = useMemo(() => {
        let etfCount = 0;
        let stockCount = 0;
        let fundCount = 0;
        let reitCount = 0;
        let totalPositions = 0;

        items.forEach(item => {
            const symbol = getSymbol(item.asset_name);
            if (!symbol || symbol === 'CASH') return;

            totalPositions++;
            switch (item.asset_type) {
                case 'ETF': etfCount++; break;
                case 'Stock': stockCount++; break;
                case 'Fund': fundCount++; break;
                case 'REIT': reitCount++; break;
            }
        });

        const diversificationScore = Math.min(100, Math.round((etfCount * 20) + (stockCount * 10) + (fundCount * 15) + (reitCount * 15)));
        const yieldRate = simulatedSummary.total > 0 ? (yieldAmount / simulatedSummary.total) * 100 : 0;
        const concentrationRisk = totalPositions <= 2 ? 'HIGH' : totalPositions <= 5 ? 'MEDIUM' : 'LOW';

        return { etfCount, stockCount, fundCount, reitCount, totalPositions, diversificationScore, yieldRate, concentrationRisk };
    }, [items, simulatedSummary, yieldAmount]);

    const simulatedItems = useMemo(() => {
        return items.map(t => {
            const isCash = t.asset_name === "CASH";
            return {
                ...t,
                amount: isCash ? t.amount : t.amount * simMultiplier
            };
        });
    }, [items, simMultiplier]);


    useFocusEffect(
        useCallback(() => {
            refresh(kind).catch(console.error);
        }, [kind, refresh])
    );

    // Phase Z: Autonomous Psychology Shocks (Auto-Sim Heartbeat)
    useEffect(() => {
        const interval = setInterval(() => {
            setSimMultiplier(prev => {
                const roll = Math.random();
                let change = (Math.random() - 0.5) * 0.002;

                if (roll < 0.02) {
                    change += (Math.random() > 0.5 ? 0.015 : -0.015);
                }

                const isShock = roll < 0.008;
                if (isShock) {
                    const isPositive = roll < 0.002;
                    const magnitude = isPositive ? 0.05 : (Math.random() > 0.7 ? -0.15 : -0.05);
                    change += magnitude;

                    const type = isPositive ? 'MOON' : (magnitude <= -0.10 ? 'CRASH' : 'CORRECTION');
                    const list = (type === 'MOON') ? HEADLINES.MOON : HEADLINES[type as 'CRASH' | 'CORRECTION'];
                    const chosenHeadline = list[Math.floor(Math.random() * list.length)];
                    setHeadline({ text: chosenHeadline, type: type === 'MOON' ? 'POSITIVE' : (type as any) });

                    logBlackSwanEvent({
                        type: type as any,
                        headline: chosenHeadline,
                        magnitude: magnitude * 100
                    });

                    if (type === 'CRASH') {
                        showTruth("MARKET CRASH: Nerves of steel required. Don't look at the exit.", 'WARNING');
                        crashSurvivalRef.current = { inCrash: true, tickCount: 0 };
                        triggerShake();
                    } else if (type === 'MOON') {
                        showTruth("MOON MISSION: Chill out. It's a fluke. Don't buy a Lambo yet.", 'TRUTH');
                    }
                }

                if (crashSurvivalRef.current.inCrash) {
                    crashSurvivalRef.current.tickCount++;
                    if (crashSurvivalRef.current.tickCount >= 3) {
                        unlockMedal('DIAMOND_HANDS');
                        showTruth("DIAMOND HANDS UNLOCKED: You survived the crash. Legend.", 'TRUTH');
                        crashSurvivalRef.current = { inCrash: false, tickCount: 0 };
                    }
                }

                const reversionStrength = 0.0005;
                if (prev < 1.0) change += reversionStrength;
                if (prev > 1.0) change -= reversionStrength;

                const nextMultiplier = Math.max(0.5, Math.min(1.5, prev + change));

                (async () => {
                    const orders = await getPendingOrders();
                    const pendingForKind = orders.filter(o => o.kind === kind && o.status === 'pending');
                    if (pendingForKind.length > 0) {
                        const currentPrices: Record<string, number> = {};
                        Object.keys(APPROVED_ASSETS).forEach(sym => {
                            currentPrices[sym] = APPROVED_ASSETS[sym].price * nextMultiplier;
                        });
                        const toFill = checkOrdersForFill(pendingForKind, currentPrices);
                        for (const order of toFill) {
                            const filledPrice = currentPrices[order.symbol];
                            await fillOrder(order.id, filledPrice);
                            await addTransaction({
                                kind: order.kind,
                                asset_name: order.assetName,
                                asset_type: order.assetType,
                                amount: order.side === 'buy' ? order.totalAmount : -order.totalAmount,
                                notes: `Limit Order Filled at $${filledPrice.toFixed(2)}`,
                                date_iso: new Date().toISOString()
                            });
                            showTruth(`ORDER FILLED: ${order.side === 'buy' ? 'Bought' : 'Sold'} ${order.symbol} at $${filledPrice.toFixed(2)}`, 'TRUTH');
                            refresh(kind);
                        }
                    }
                })().catch(console.error);

                return nextMultiplier;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [kind]);

    return (
        <Screen ref={screenRef} safeTop={true}>
            <Animated.View style={[{ flex: 1 }, shakeStyle]}>
                {headline && (
                    <Pressable
                        onPress={() => setHeadline(null)}
                        style={{
                            backgroundColor: headline.type === 'POSITIVE' ? theme.colors.success : theme.colors.danger,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            marginHorizontal: -24,
                            marginBottom: 20
                        }}
                    >
                        <MaterialCommunityIcons
                            name={headline.type === 'POSITIVE' ? 'trending-up' : 'flash'}
                            size={16}
                            color={theme.colors.buttonText}
                        />
                        <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 13, flex: 1 }} numberOfLines={1}>
                            {headline.text}
                        </Text>
                        <Text style={{ color: theme.colors.buttonText, fontWeight: '700', fontSize: 10 }}>[TAP TO DISMISS]</Text>
                    </Pressable>
                )}

                <View style={{ marginBottom: 32 }}>
                    <View>
                        <Text style={{ color: theme.colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1 }}>
                            Portfolio
                        </Text>
                        <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '800', marginTop: -4 }}>Reality vs Training Wheels.</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                    {(["paper", "real"] as const).map(k => (
                        <Pressable
                            key={k}
                            onPress={() => {
                                setKind(k);
                                setSimMultiplier(1);
                            }}
                            style={{
                                flex: 1,
                                padding: 16,
                                borderRadius: 20,
                                backgroundColor: kind === k ? (k === 'paper' ? theme.colors.paper : theme.colors.real) : theme.colors.card,
                                borderWidth: 1,
                                borderColor: kind === k ? (k === 'paper' ? theme.colors.paper : theme.colors.real) : theme.colors.border,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 8
                            }}
                        >
                            <MaterialCommunityIcons name={k === 'paper' ? 'flask-outline' : 'bank-outline'} size={18} color={kind === k ? theme.colors.buttonText : theme.colors.muted} />
                            <Text style={{ color: kind === k ? theme.colors.buttonText : theme.colors.text, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>{k}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={{ marginBottom: 24, padding: 16, backgroundColor: theme.colors.accent + '15', borderRadius: 16, borderWidth: 1, borderColor: theme.colors.accent + '30' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <MaterialCommunityIcons name={kind === 'paper' ? "flask-outline" : "shield-check-outline"} size={20} color={kind === 'paper' ? theme.colors.paper : theme.colors.real} />
                        <Text style={{ color: kind === 'paper' ? theme.colors.paper : theme.colors.real, fontWeight: '900', fontSize: 13, textTransform: 'uppercase' }}>
                            {kind === 'paper' ? 'NOOBS SANDBOX' : 'REALITY CHECK'}
                        </Text>
                    </View>
                    <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
                        {kind === 'paper' ? 'This is your sandbox. Use fake money to practice.' : 'This is your actual capital. We choose boring growth to keep you alive.'}
                    </Text>
                </View>

                {/* TERMINAL UI CARD */}
                <View style={{
                    padding: 32,
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.colors.card,
                    borderWidth: 2,
                    borderColor: kind === 'paper' ? theme.colors.paper + '50' : theme.colors.real + '50',
                    marginBottom: 24,
                    overflow: 'hidden',
                    shadowColor: kind === 'paper' ? theme.colors.paper : theme.colors.real,
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    elevation: 10
                }}>
                    <View style={{ backgroundColor: kind === 'paper' ? theme.colors.paper : theme.colors.real, marginHorizontal: -32, marginTop: -32, marginBottom: 32, paddingVertical: 6, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.buttonText }} />
                            <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>{kind === 'paper' ? 'PAPER TERMINAL' : 'REAL TERMINAL'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isMarketOpen() ? theme.colors.buttonText : theme.colors.buttonText + '80' }} />
                            <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 9 }}>{isMarketOpen() ? 'HEARTBEAT: ACTIVE' : 'HEARTBEAT: SLEEP'}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>Net Worth</Text>
                                <GuideTip title="Net Worth" content="CASH + ASSETS. Market drift affects assets, but cash stays solid." />
                            </View>
                            <Text style={{ color: theme.colors.text, fontSize: 44, fontWeight: '900', letterSpacing: -2, fontFamily: 'Courier' }}>
                                ${simulatedSummary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                            {totalDeposits > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <MaterialCommunityIcons name={simulatedSummary.total >= totalDeposits ? "arrow-up" : "arrow-down"} size={14} color={simulatedSummary.total >= totalDeposits ? theme.colors.success : theme.colors.danger} />
                                    <Text style={{ color: simulatedSummary.total >= totalDeposits ? theme.colors.success : theme.colors.danger, fontWeight: '900', fontSize: 16, fontFamily: 'Courier' }}>
                                        ${Math.abs(simulatedSummary.total - totalDeposits).toFixed(2)} ({((simulatedSummary.total / totalDeposits - 1) * 100).toFixed(2)}%)
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: simMultiplier >= 1 ? theme.colors.success : theme.colors.danger, fontSize: 18, fontWeight: '900', fontFamily: 'Courier' }}>{simMultiplier >= 1 ? '▲' : '▼'} {((simMultiplier - 1) * 100).toFixed(2)}%</Text>
                            <Text style={{ color: theme.colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Session Shift</Text>
                        </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: theme.colors.border, marginBottom: 24 }} />

                    <View style={{ flexDirection: 'row', gap: 24, marginBottom: 24 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 }}>Annual Yield</Text>
                            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', fontFamily: 'Courier' }}>${(yieldAmount * simMultiplier).toFixed(2)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 }}>Yield Rate</Text>
                            <Text style={{ color: theme.colors.success, fontSize: 18, fontWeight: '800', fontFamily: 'Courier' }}>{(simulatedSummary.total > 0 ? ((yieldAmount * simMultiplier) / simulatedSummary.total) * 100 : 0).toFixed(2)}%</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable
                            onPress={() => {
                                Alert.prompt("Deposit Cash", "How much?", [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Deposit", onPress: async (v: string | undefined) => { const a = Number(v); if (!isNaN(a) && a > 0) { await depositCash(kind, a); refresh(kind); } } }
                                ], "plain-text", "", "numeric");
                            }}
                            style={{ flex: 1, backgroundColor: theme.colors.accent + '20', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.accent, alignItems: 'center' }}
                        >
                            <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 12 }}>DEPOSIT</Text>
                        </Pressable>
                        <Pressable onPress={() => navigate("/invest", { kind })} style={{ flex: 1, backgroundColor: kind === 'paper' ? theme.colors.paper : theme.colors.real, padding: 12, borderRadius: 12, alignItems: 'center' }}>
                            <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 12 }}>INVEST</Text>
                        </Pressable>
                    </View>
                </View>

                {items.length > 0 && <PortfolioGrowthChart currentValue={simulatedSummary.total} />}

                {/* ANALYTICS SECTION */}
                {items.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            {!isPro && <MaterialCommunityIcons name="lock" size={14} color={theme.colors.accent} />}
                            <View style={{ backgroundColor: theme.colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                <Text style={{ color: theme.colors.bg, fontSize: 10, fontWeight: '900' }}>PRO</Text>
                            </View>
                            <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>Performance Analytics</Text>
                        </View>

                        {!isPro ? (
                            <Pressable
                                onPress={() => setShowPaywall(true)}
                                style={{
                                    backgroundColor: theme.colors.card,
                                    borderRadius: 24,
                                    padding: 24,
                                    borderWidth: 1,
                                    borderColor: theme.colors.accent + '30',
                                    alignItems: 'center',
                                    gap: 12
                                }}
                            >
                                <MaterialCommunityIcons name="chart-areaspline" size={40} color={theme.colors.accent + '60'} />
                                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900', textAlign: 'center' }}>Unlock Advanced Analytics</Text>
                                <Text style={{ color: theme.colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                                    See your Time-Weighted Return, volatility (Beta), and detailed sector composition.
                                </Text>
                                <View style={{ backgroundColor: theme.colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 8 }}>
                                    <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 13 }}>VIEW PRO STATS</Text>
                                </View>
                            </Pressable>
                        ) : (
                            <>
                                <PerformanceChart
                                    portfolioHistory={(() => {
                                        // Generate 365 days of simulated portfolio history
                                        const history: { date: string; value: number }[] = [];
                                        const startValue = totalContributed * 0.85; // Start 15% lower
                                        const endValue = simulatedSummary.total;

                                        for (let i = 365; i >= 0; i--) {
                                            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                                            const progress = (365 - i) / 365;
                                            // Non-linear growth with market-like noise
                                            const baseValue = startValue + (endValue - startValue) * progress;
                                            const noise = 1 + (Math.sin(i * 0.1) * 0.03) + (Math.random() - 0.5) * 0.008;
                                            history.push({
                                                date: date.toISOString().split('T')[0],
                                                value: baseValue * noise
                                            });
                                        }
                                        return history;
                                    })()}
                                    currentValue={simulatedSummary.total}
                                    totalContributed={totalContributed}
                                    isPro={isPro}
                                />
                                <AdvancedAnalytics
                                    summary={simulatedSummary}
                                    items={simulatedItems}
                                    yieldAmount={yieldAmount}
                                    isPro={isPro}
                                    hasDrift={drifts.some(d => d.drift > 5)}
                                />
                            </>
                        )}
                    </View>
                )}

                {/* STRATEGIC MIX */}
                <View style={{ marginTop: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>Strategic Mix</Text>
                        <Pressable onPress={() => setIsSimModalVisible(true)}>
                            <MaterialCommunityIcons name="earth" size={20} color={theme.colors.accent} />
                        </Pressable>
                    </View>

                    {drifts.length > 0 && (
                        <View style={{ gap: 20 }}>
                            {/* Current vs Target Comparison */}
                            <View style={{ gap: 12 }}>
                                <View style={{ gap: 4 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '700' }}>CURRENT HOLDINGS</Text>
                                        <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: '900' }}>Actual</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: theme.colors.bg, borderWidth: 1, borderColor: theme.colors.border }}>
                                        {simulatedSummary.allocation.map((a, i) => (
                                            <View key={a.type} style={{ width: `${a.percentage}%`, backgroundColor: theme.colors.assets[a.type as keyof typeof theme.colors.assets] || theme.colors.assets.Other }} />
                                        ))}
                                    </View>
                                </View>

                                <View style={{ gap: 4 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '700' }}>STRATEGIC PLAN: {plan?.allocation_template?.toUpperCase()}</Text>
                                        <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: '900' }}>Target</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: theme.colors.bg, borderWidth: 1, borderColor: theme.colors.border }}>
                                        {drifts.filter(d => d.target > 0).map((d, i) => (
                                            <View key={d.type} style={{ width: `${d.target}%`, backgroundColor: theme.colors.assets[d.type as keyof typeof theme.colors.assets] || theme.colors.assets.Other }} />
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                                {drifts.filter(d => d.target > 0 || d.current > 0).map((d, i) => (
                                    <View key={d.type} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.assets[d.type as keyof typeof theme.colors.assets] || theme.colors.assets.Other }} />
                                        <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 13 }}>
                                            {d.type}: {d.current.toFixed(0)}% <Text style={{ color: theme.colors.muted, fontWeight: '500' }}>(Target {d.target.toFixed(0)}%)</Text>
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Asset Type Counts Row */}
                            <View style={{ flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'space-around' }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>{assetMetrics.etfCount}</Text>
                                    <Text style={{ color: theme.colors.muted, fontSize: 9, fontWeight: '700' }}>ETFs</Text>
                                </View>
                                <View style={{ width: 1, backgroundColor: theme.colors.border }} />
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>{assetMetrics.stockCount}</Text>
                                    <Text style={{ color: theme.colors.muted, fontSize: 9, fontWeight: '700' }}>STOCKS</Text>
                                </View>
                                <View style={{ width: 1, backgroundColor: theme.colors.border }} />
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>{assetMetrics.fundCount}</Text>
                                    <Text style={{ color: theme.colors.muted, fontSize: 9, fontWeight: '700' }}>FUNDS</Text>
                                </View>
                                <View style={{ width: 1, backgroundColor: theme.colors.border }} />
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>{assetMetrics.reitCount}</Text>
                                    <Text style={{ color: theme.colors.muted, fontSize: 9, fontWeight: '700' }}>REITs</Text>
                                </View>
                            </View>

                            {(drifts.some(d => d.drift > 5) || assetMetrics.diversificationScore < 40) && (
                                <View style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.accent + '10', borderLeftWidth: 4, borderLeftColor: theme.colors.accent, gap: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <MaterialCommunityIcons name="lightbulb-on" size={16} color={theme.colors.accent} />
                                        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '900' }}>NooBS Insight</Text>
                                    </View>
                                    <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '600', marginTop: 4 }}>
                                        {drifts.some(d => d.drift > 5)
                                            ? "Strategic Drift Detected! Use the rebalancing steps below to fix your risk profile."
                                            : assetMetrics.diversificationScore < 40
                                                ? "Your portfolio needs more variety. Add broad ETFs like VTI to shield against single-stock crashes."
                                                : "Stay the course. Your discipline is your greatest asset."
                                        }
                                    </Text>
                                </View>
                            )}

                            {/* Rebalancing Advice Cards */}
                            {advice.length > 0 && (
                                <View style={{ gap: 10 }}>
                                    {advice.map((adv, idx) => (
                                        <View key={`${adv.symbol}-${idx}`} style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: adv.action === 'buy' ? theme.colors.success : theme.colors.danger }} />
                                                    <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 14 }}>
                                                        {adv.action.toUpperCase()} ${adv.amount.toFixed(0)} OF {adv.symbol}
                                                    </Text>
                                                </View>
                                                <Pressable
                                                    onPress={() => router.push({
                                                        pathname: "/invest",
                                                        params: { kind, search: adv.symbol }
                                                    })}
                                                    style={{ backgroundColor: theme.colors.accent + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                                                >
                                                    <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 10 }}>REBALANCE NOW</Text>
                                                </Pressable>
                                            </View>
                                            <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }}>
                                                {adv.rationale}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* ACTIVITY */}
                <View style={{ marginTop: 32, marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>Activity</Text>
                </View>
                <PortfolioList items={simulatedItems} kind={kind} total={simulatedSummary.total} roiMultiplier={simMultiplier} />

                {/* NOOBS TRUTH: FEE FRICTION */}
                <View style={{ marginTop: 32 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <MaterialCommunityIcons name="alert-decagram" size={20} color={theme.colors.danger} />
                        <Text style={{ color: theme.colors.danger, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>NooBS Truth: Fees</Text>
                    </View>
                    <Pressable
                        onPress={() => router.push("/friction-tool")}
                        style={({ pressed }) => ({
                            backgroundColor: theme.colors.card,
                            borderRadius: 24,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: theme.colors.danger + '40',
                            opacity: pressed ? 0.9 : 1
                        })}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.danger + '20', alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialCommunityIcons name="calculator" size={28} color={theme.colors.danger} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 4 }}>Fee Friction Tool</Text>
                                <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '600' }}>
                                    Fees are silent killers. See how a "small" 1.5% fee steals 30 years of your life.
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.muted} />
                        </View>
                    </Pressable>
                </View>

                <View style={{ marginTop: 24, padding: 20, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Educational Disclaimer</Text>
                    <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '600' }}>
                        NooBS Investing is an educational simulation. No real money is involved. This is not professional financial advice.
                    </Text>
                </View>

                <View style={{ height: 40 }} />

            </Animated.View>

            <SimulateShiftModal visible={isSimModalVisible} onClose={() => setIsSimModalVisible(false)} onSimulate={setSimMultiplier} />
            <TruthToast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(p => ({ ...p, visible: false }))} />
            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => setIsPro(true)}
            />
        </Screen >
    );
}
