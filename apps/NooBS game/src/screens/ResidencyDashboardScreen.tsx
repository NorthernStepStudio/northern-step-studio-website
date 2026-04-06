import React, { useEffect, useRef, useState } from "react";
import { logger } from "../game/logger";
import { Animated, Pressable, ScrollView, Text, View, StyleSheet, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { advanceMonth, applyDecision } from "../game/engine";
import { GameState, MarketEvent, Decision, Headline, ToastType } from "../game/types";
import { PortfolioChart } from "../components/PortfolioChart";
import { EventModal } from "../components/EventModal";
import { FeedbackModal } from "../components/FeedbackModal";
import { theme } from "../constants/theme";
import { HeadlineBanner } from "../components/HeadlineBanner";
import { TruthToast } from "../components/TruthToast";
import { PortfolioList } from "../components/PortfolioList";
import { GuiltModal } from "../components/GuiltModal";
import { OfflineSummaryModal } from "../components/OfflineSummaryModal";
import { simulateOfflineTime } from "../game/background";
import { TutorialOverlay } from "../components/TutorialOverlay";
import { HoloBackground } from "../components/future/HoloBackground";
import { PortfolioGrowthChart } from "../components/PortfolioGrowthChart";
import { AdvancedAnalytics } from "../components/AdvancedAnalytics";
import {
    MARKET_TICKERS,
    applyPriceTick,
    applyMarketShock,
    advanceMarketClock,
    formatMarketTime,
    getBidAsk,
    getMinutesPerTick,
    getSlippagePct,
    isMarketOpen,
} from "../game/market";

type Tab = "PORTFOLIO" | "STATS" | "CONTRACT";
type PortfolioPage = "DASHBOARD" | "MARKET" | "STORY" | "COMMAND";

export function ResidencyDashboardScreen({
    state,
    setState,
    onGraduation,
    onExit
}: {
    state: GameState;
    setState: (s: GameState | ((prev: GameState) => GameState)) => void;
    onGraduation: () => void;
    onExit: () => void;
}) {
    const [activeTab, setActiveTab] = useState<Tab>("PORTFOLIO");
    const [portfolioPage, setPortfolioPage] = useState<PortfolioPage>("DASHBOARD");
    const [isAutoPaused, setIsAutoPaused] = useState(false);
    const [event, setEvent] = useState<MarketEvent | null>(null);
    const [eventVisible, setEventVisible] = useState(false);
    const [guiltVisible, setGuiltVisible] = useState(false);
    const [currentBreaches, setCurrentBreaches] = useState<string[]>([]);

    // OFFLINE SIMULATION STATE
    const [offlineSummary, setOfflineSummary] = useState<string[]>([]);
    const [offlineVisible, setOfflineVisible] = useState(false);

    // TUTORIAL STATE
    const [tutorialVisible, setTutorialVisible] = useState(!state.hasSeenTutorial);
    const [headline, setHeadline] = useState<Headline | null>(null);
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
        visible: false, message: "", type: "TRUTH"
    });
    const [feedbackState, setFeedbackState] = useState<{
        visible: boolean; title: string; message: string; stage: 1 | 2; buttonLabel: string;
    }>({
        visible: false, title: "", message: "", stage: 1, buttonLabel: "CONTINUE"
    });
    const [selectedSymbol, setSelectedSymbol] = useState(MARKET_TICKERS[0]?.symbol ?? "VTI");
    const [orderAmount, setOrderAmount] = useState("");
    const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
    const [limitPrice, setLimitPrice] = useState("");
    const [prevPrices, setPrevPrices] = useState(state.marketPrices);
    const timeScaleMs = state.timeScale === "FOUR_DAYS" ? 150000 : state.timeScale === "ONE_MONTH" ? 75000 : 100000;
    const marketTickMs = Math.max(1000, Math.floor(timeScaleMs / 60));
    const minutesPerTick = getMinutesPerTick(state.timeScale);

    const shakeX = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scrollRef = useRef<ScrollView>(null);

    // Pulse animation for status dot
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    useEffect(() => {
        const result = simulateOfflineTime(state);
        if (result.monthsPassed > 0) {
            setState(result.newState);
            setOfflineSummary(result.summary);
            setOfflineVisible(true);
        }
    }, []); // Only run once on mount

    useEffect(() => {
        const timer = setInterval(() => {
            setState(prev => {
                const nextClock = advanceMarketClock(
                    { marketClockMinutes: prev.marketClockMinutes, marketDay: prev.marketDay },
                    minutesPerTick
                );
                const marketOpen = isMarketOpen(nextClock);
                let nextPrices = applyPriceTick(prev.marketPrices, marketOpen, minutesPerTick);
                if (prev.pendingShockPct) {
                    nextPrices = applyMarketShock(nextPrices, prev.pendingShockPct);
                }
                const orderResult = processLimitOrders(prev, nextPrices, marketOpen);
                const nextNetWorth = getHoldingsValue(orderResult.holdings, nextPrices);
                return {
                    ...prev,
                    marketClockMinutes: nextClock.marketClockMinutes,
                    marketDay: nextClock.marketDay,
                    marketPrices: nextPrices,
                    holdings: orderResult.holdings,
                    cash: orderResult.cash,
                    openOrders: orderResult.openOrders,
                    netWorth: Math.round(nextNetWorth + orderResult.cash),
                    pendingShockPct: 0,
                };
            });
        }, marketTickMs);

        return () => clearInterval(timer);
    }, [marketTickMs, minutesPerTick, setState]);

    useEffect(() => {
        setPrevPrices(state.marketPrices);
    }, [state.marketPrices]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [activeTab, portfolioPage]);

    // AUTO-ADVANCE LOGIC (Simplified for Neo-Broker feel - "Live" ticks)
    useEffect(() => {
        if (eventVisible || feedbackState.visible || isAutoPaused) return;

        const timer = setInterval(() => {
            onActionAdvance();
        }, timeScaleMs); // time-scale-adjusted ticks

        return () => clearInterval(timer);
    }, [eventVisible, feedbackState.visible, isAutoPaused, state.month, timeScaleMs]);

    const onActionAdvance = () => {
        if (state.netWorth + state.cash >= state.targetNetWorth) {
            onGraduation();
            return;
        }
        if (state.month >= 13) {
            onGraduation();
            return;
        }

        const effectiveState = (state.month >= 3 && !state.isPaidUser)
            ? { ...state, isPaidUser: true }
            : state;

        const res = advanceMonth(effectiveState);
        setState(res.next);

        if (res.headline) setHeadline(res.headline);
        if (res.toast) setToast({ visible: true, message: res.toast.message, type: res.toast.type });

        if (res.isCrash) {
            Animated.sequence([
                Animated.timing(shakeX, { toValue: -8, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: 8, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
            ]).start();
        }
        if (res.event) {
            setEvent(res.event);
            setEventVisible(true);
            setIsAutoPaused(true);
        }
    };

    const onStartDecisionFlow = (d: Decision) => {
        setEventVisible(false);
        const { next, feedback } = applyDecision(state, event!, d);

        // Find NEW violations
        const newViolations = next.violations.filter(v => !state.violations.includes(v));

        setState(next);

        if (newViolations.length > 0) {
            setCurrentBreaches(newViolations);
            setGuiltVisible(true);
        } else {
            setFeedbackState({
                visible: true,
                title: "Psychology Debrief",
                message: feedback,
                stage: 1,
                buttonLabel: "CONTINUE"
            });
        }
    };

    const onContinueFeedback = () => {
        if (feedbackState.stage === 2) {
            setState(prev => ({ ...prev, phase: "PAYWALL" }));
            return;
        }
        setFeedbackState(prev => ({ ...prev, visible: false }));
        setEvent(null);
        setIsAutoPaused(false);
    };

    // Derived Display Values
    const totalValue = (state.netWorth + state.cash).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const dayChange = formatPercent((state.simMultiplier - 1) * 100, 2);
    const isPositive = state.simMultiplier >= 1;
    const progressPct = Math.min(100, ((state.netWorth + state.cash) / state.targetNetWorth) * 100);
    const monthsRemaining = Math.max(0, 13 - state.month);
    const timeScaleLabel = state.timeScale === "FOUR_DAYS" ? "4 DAYS" : state.timeScale === "ONE_MONTH" ? "1 MONTH" : "1 WEEK";

    const holdingsValue = getHoldingsValue(state.holdings, state.marketPrices);
    const marketClock = { marketClockMinutes: state.marketClockMinutes, marketDay: state.marketDay };
    const marketOpen = isMarketOpen(marketClock);
    const marketTime = formatMarketTime(marketClock);
    const selectedPrice = state.marketPrices[selectedSymbol] ?? 0;
    const bidAsk = selectedPrice ? getBidAsk(selectedSymbol, selectedPrice) : { bid: 0, ask: 0 };
    const isCryptoSymbol = selectedSymbol === "BTC" || selectedSymbol === "ETH";

    const handleTrade = (side: "BUY" | "SELL") => {
        const amount = Number(orderAmount);
        if (!selectedSymbol || !state.marketPrices[selectedSymbol] || isNaN(amount) || amount <= 0) {
            setToast({ visible: true, message: "Invalid order amount.", type: "WARNING" });
            return;
        }
        if (!marketOpen && !isCryptoSymbol && orderType === "MARKET") {
            setToast({ visible: true, message: "Market closed. Use limit orders or trade crypto.", type: "WARNING" });
            return;
        }

        if (orderType === "LIMIT") {
            const limit = Number(limitPrice);
            if (!limit || isNaN(limit) || limit <= 0) {
                setToast({ visible: true, message: "Invalid limit price.", type: "WARNING" });
                return;
            }
            const orderId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            setState(prev => ({
                ...prev,
                openOrders: [
                    ...prev.openOrders,
                    {
                        id: orderId,
                        symbol: selectedSymbol,
                        side,
                        type: "LIMIT",
                        amount,
                        limitPrice: limit,
                        createdAt: Date.now(),
                        status: "OPEN",
                    }
                ]
            }));
            setToast({ visible: true, message: "Limit order placed.", type: "TRUTH" });
            setOrderAmount("");
            setLimitPrice("");
            return;
        }

        setState(prev => {
            const price = prev.marketPrices[selectedSymbol];
            if (!price) return prev;
            const { bid, ask } = getBidAsk(selectedSymbol, price);
            const slippage = getSlippagePct(selectedSymbol, amount);

            if (side === "BUY") {
                if (amount > prev.cash) {
                    setToast({ visible: true, message: "Insufficient cash.", type: "WARNING" });
                    logger.warn("[TRADE ABORTED]: Insufficient cash", { amount, cash: prev.cash });
                    return prev;
                }
                const fillPrice = ask * (1 + slippage);
                const sharesToBuy = amount / fillPrice;
                const existing = prev.holdings[selectedSymbol];
                const updatedHolding = existing
                    ? {
                        ...existing,
                        shares: existing.shares + sharesToBuy,
                        avgCost: (existing.avgCost * existing.shares + fillPrice * sharesToBuy) / (existing.shares + sharesToBuy)
                    }
                    : { symbol: selectedSymbol, shares: sharesToBuy, avgCost: fillPrice };
                const nextHoldings = { ...prev.holdings, [selectedSymbol]: updatedHolding };
                const nextNetWorth = getHoldingsValue(nextHoldings, prev.marketPrices);
                const nextCash = prev.cash - amount;
                logger.success(`[EQUITY FEED]: Asset Purchased: ${selectedSymbol}`, { shares: sharesToBuy, cost: fillPrice });
                return { ...prev, cash: nextCash, holdings: nextHoldings, netWorth: Math.round(nextNetWorth + nextCash) };
            }

            const existing = prev.holdings[selectedSymbol];
            if (!existing) {
                setToast({ visible: true, message: "No holdings to sell.", type: "WARNING" });
                return prev;
            }
            const fillPrice = bid * (1 - slippage);
            const holdingValue = existing.shares * fillPrice;
            const sellValue = Math.min(amount, holdingValue);
            const sharesToSell = sellValue / fillPrice;
            const remaining = existing.shares - sharesToSell;
            const nextHoldings = { ...prev.holdings };
            if (remaining <= 0.0001) {
                delete nextHoldings[selectedSymbol];
            } else {
                nextHoldings[selectedSymbol] = { ...existing, shares: remaining };
            }
            const nextNetWorth = getHoldingsValue(nextHoldings, prev.marketPrices);
            const nextCash = prev.cash + sellValue;
            logger.success(`[EQUITY FEED]: Asset Sold: ${selectedSymbol}`, { shares: sharesToSell, proceed: sellValue });
            return { ...prev, cash: nextCash, holdings: nextHoldings, netWorth: Math.round(nextNetWorth + nextCash) };
        });

        setOrderAmount("");
        setLimitPrice("");
    };

    return (
        <HoloBackground>
            <StatusBar style="light" />
            <View style={{ flex: 1, paddingTop: 32 }}>
                <Animated.View style={{ flex: 1, transform: [{ translateX: shakeX }] }}>

                    {/* HEADER: TOTAL EQUITY */}
                    <View style={styles.header}>
                        <View style={styles.mainTitleContainer}>
                            <Text style={styles.headerTitleLarge}>MARKET SIMULATOR</Text>
                            <Text style={styles.headerCodeSmall}>SESSION ACTIVE // REALTIME FEED</Text>
                        </View>
                        <Pressable onPress={onExit} style={styles.exitButton}>
                            <Text style={styles.exitButtonText}>[ MAIN MENU ]</Text>
                        </Pressable>

                        <View style={styles.hudRow}>
                            <View style={styles.equityHud}>
                                <Text style={styles.equityValue}>${totalValue}</Text>
                                <Text style={styles.equityLabel}>TOTAL EQUITY</Text>
                            </View>
                            <View style={styles.marketStatusHud}>
                                <View style={styles.statusPulse}>
                                    <Animated.View style={[styles.statusDot, { opacity: pulseAnim }]} />
                                    <Text style={styles.statusText}>{marketOpen ? "MARKET OPEN" : "MARKET CLOSED"}</Text>
                                </View>
                                <Text style={[styles.changeText, { color: isPositive ? theme.colors.success : theme.colors.danger }]}>
                                    {isPositive ? '+' : ''}{dayChange}%
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* TAB BAR HEADER */}
                    <View style={styles.tabHeader}>
                        <TabButton title="Portfolio" active={activeTab === "PORTFOLIO"} onPress={() => setActiveTab("PORTFOLIO")} />
                        <TabButton title="Stats" active={activeTab === "STATS"} onPress={() => setActiveTab("STATS")} />
                        <TabButton title="Contract" active={activeTab === "CONTRACT"} onPress={() => setActiveTab("CONTRACT")} />
                    </View>
                    <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {activeTab === "PORTFOLIO" && (
                            <>
                                <View style={styles.subTabRow}>
                                    <PageButton title="Dashboard" active={portfolioPage === "DASHBOARD"} onPress={() => setPortfolioPage("DASHBOARD")} />
                                    <PageButton title="Market" active={portfolioPage === "MARKET"} onPress={() => setPortfolioPage("MARKET")} />
                                    <PageButton title="Story" active={portfolioPage === "STORY"} onPress={() => setPortfolioPage("STORY")} />
                                    <PageButton title="Command" active={portfolioPage === "COMMAND"} onPress={() => setPortfolioPage("COMMAND")} />
                                </View>

                                {portfolioPage === "DASHBOARD" && (
                                    <>
                                        {/* PLAYER STATS BAR (Mini) */}
                                        <View style={styles.vitalsBar}>
                                            <StatHUD label="PATIENCE" value={state.stats.patience} />
                                            <StatHUD label="DISCIPLINE" value={state.stats.discipline} />
                                            <StatHUD label="CONVICTION" value={state.stats.conviction} />
                                        </View>

                                        <HeadlineBanner headline={headline} onDismiss={() => setHeadline(null)} />

                                        <View style={styles.sectionSpacer} />

                                        <GuiltModal
                                            visible={guiltVisible}
                                            violations={currentBreaches}
                                            onAcknowledge={() => {
                                                setGuiltVisible(false);
                                                setIsAutoPaused(false);
                                                setEvent(null);
                                            }}
                                        />

                                        <OfflineSummaryModal
                                            visible={offlineVisible}
                                            summary={offlineSummary}
                                            onClose={() => setOfflineVisible(false)}
                                        />

                                        <TutorialOverlay
                                            visible={tutorialVisible}
                                            onComplete={() => {
                                                setTutorialVisible(false);
                                                setState(prev => ({ ...prev, hasSeenTutorial: true }));
                                            }}
                                        />

                                        <View style={styles.missionHud}>
                                            <View>
                                                <Text style={styles.missionLabel}>MISSION HUD</Text>
                                                <Text style={styles.missionTitle}>FREEDOM TARGET: ${state.targetNetWorth.toLocaleString()}</Text>
                                                <Text style={styles.missionSub}>
                                                    ACT {state.currentAct} // MONTH {state.month} // {monthsRemaining} MONTHS LEFT
                                                </Text>
                                            </View>
                                            <View style={styles.missionMeta}>
                                                <Text style={styles.missionMetaText}>TIME SCALE: {timeScaleLabel}</Text>
                                                <Text style={styles.missionMetaText}>PROGRESS: {formatPercent(progressPct, 1)}%</Text>
                                            </View>
                                            <View style={styles.progressTrack}>
                                                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                                            </View>
                                        </View>

                                        <Text style={styles.sectionTitle}>EQUITY SNAPSHOT</Text>
                                        <PortfolioList cash={state.cash} invested={state.netWorth} />

                                        <View style={styles.marketSection}>
                                            <Text style={styles.sectionTitle}>MARKET TERMINAL</Text>
                                            <View style={styles.marketStatusRow}>
                                                <Text style={[styles.marketStatusText, { color: marketOpen ? theme.colors.success : theme.colors.danger }]}>
                                                    {marketOpen ? "MARKET OPEN" : "MARKET CLOSED"} // {marketTime}
                                                </Text>
                                                <Text style={styles.marketStatusText}>DAY {state.marketDay}</Text>
                                            </View>
                                            <View style={styles.marketSummary}>
                                                <View style={styles.summaryBlock}>
                                                    <Text style={styles.summaryLabel}>CASH</Text>
                                                    <Text style={styles.summaryValue}>${state.cash.toLocaleString()}</Text>
                                                </View>
                                                <View style={styles.summaryBlock}>
                                                    <Text style={styles.summaryLabel}>INVESTED</Text>
                                                    <Text style={styles.summaryValue}>${Math.round(holdingsValue).toLocaleString()}</Text>
                                                </View>
                                                <View style={styles.summaryBlock}>
                                                    <Text style={styles.summaryLabel}>TOTAL EQUITY</Text>
                                                    <Text style={styles.summaryValue}>${Math.round(holdingsValue + state.cash).toLocaleString()}</Text>
                                                </View>
                                            </View>

                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerRow}>
                                                {MARKET_TICKERS.map(ticker => {
                                                    const isSelected = selectedSymbol === ticker.symbol;
                                                    return (
                                                        <Pressable
                                                            key={ticker.symbol}
                                                            onPress={() => setSelectedSymbol(ticker.symbol)}
                                                            style={[styles.tickerPill, isSelected && styles.tickerPillActive]}
                                                        >
                                                            <Text style={[styles.tickerText, isSelected && styles.tickerTextActive]}>{ticker.symbol}</Text>
                                                        </Pressable>
                                                    );
                                                })}
                                            </ScrollView>

                                            <View style={styles.tradePanel}>
                                                <View style={styles.tradeRow}>
                                                    <Text style={styles.tradeLabel}>SYMBOL</Text>
                                                    <Text style={styles.tradeValue}>{selectedSymbol}</Text>
                                                </View>
                                                <View style={styles.tradeRow}>
                                                    <Text style={styles.tradeLabel}>PRICE</Text>
                                                    <Text style={styles.tradeValue}>${formatMoney(state.marketPrices[selectedSymbol] ?? 0)}</Text>
                                                </View>
                                                <View style={styles.tradeRow}>
                                                    <Text style={styles.tradeLabel}>BID / ASK</Text>
                                                    <Text style={styles.tradeValue}>
                                                        ${formatMoney(bidAsk.bid)} / ${formatMoney(bidAsk.ask)}
                                                    </Text>
                                                </View>
                                                <View style={styles.tradeRow}>
                                                    <Text style={styles.tradeLabel}>ORDER TYPE</Text>
                                                    <View style={styles.orderTypeRow}>
                                                        <Pressable
                                                            onPress={() => setOrderType("MARKET")}
                                                            style={[styles.orderTypeButton, orderType === "MARKET" && styles.orderTypeActive]}
                                                        >
                                                            <Text style={[styles.orderTypeText, orderType === "MARKET" && styles.orderTypeTextActive]}>MARKET</Text>
                                                        </Pressable>
                                                        <Pressable
                                                            onPress={() => setOrderType("LIMIT")}
                                                            style={[styles.orderTypeButton, orderType === "LIMIT" && styles.orderTypeActive]}
                                                        >
                                                            <Text style={[styles.orderTypeText, orderType === "LIMIT" && styles.orderTypeTextActive]}>LIMIT</Text>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                                {orderType === "LIMIT" && (
                                                    <View style={styles.tradeRow}>
                                                        <Text style={styles.tradeLabel}>LIMIT</Text>
                                                        <TextInput
                                                            value={limitPrice}
                                                            onChangeText={setLimitPrice}
                                                            keyboardType="numeric"
                                                            placeholder="$0.00"
                                                            placeholderTextColor={theme.colors.faint}
                                                            style={styles.tradeInput}
                                                        />
                                                    </View>
                                                )}
                                                <View style={styles.tradeRow}>
                                                    <Text style={styles.tradeLabel}>AMOUNT</Text>
                                                    <TextInput
                                                        value={orderAmount}
                                                        onChangeText={setOrderAmount}
                                                        keyboardType="numeric"
                                                        placeholder="$0.00"
                                                        placeholderTextColor={theme.colors.faint}
                                                        style={styles.tradeInput}
                                                    />
                                                </View>
                                                <View style={styles.tradeButtons}>
                                                    <Pressable onPress={() => handleTrade("BUY")} style={[styles.tradeButton, styles.buyButton]}>
                                                        <Text style={styles.tradeButtonText}>BUY</Text>
                                                    </Pressable>
                                                    <Pressable onPress={() => handleTrade("SELL")} style={[styles.tradeButton, styles.sellButton]}>
                                                        <Text style={styles.tradeButtonText}>SELL</Text>
                                                    </Pressable>
                                                </View>
                                            </View>

                                            <View style={styles.watchlist}>
                                                <Text style={styles.sectionTitle}>WATCHLIST</Text>
                                                {MARKET_TICKERS.map(ticker => {
                                                    const price = state.marketPrices[ticker.symbol] ?? 0;
                                                    const prev = prevPrices[ticker.symbol] ?? price;
                                                    const diff = price - prev;
                                                    const diffPct = prev ? (diff / prev) * 100 : 0;
                                                    const changeColor = getChangeColor(diffPct);
                                                    return (
                                                        <View key={ticker.symbol} style={styles.watchRow}>
                                                            <View>
                                                                <Text style={styles.watchSymbol}>{ticker.symbol}</Text>
                                                                <Text style={styles.watchName}>{ticker.name}</Text>
                                                            </View>
                                                            <View style={styles.watchValues}>
                                                                <Text style={styles.watchPrice}>${formatMoney(price)}</Text>
                                                                <Text style={[styles.watchChange, { color: changeColor }]}>
                                                                    {formatSignedMoney(diff)} ({formatSignedPercent(diffPct, 2)}%)
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </View>

                                            <View style={styles.holdings}>
                                                <Text style={styles.sectionTitle}>HOLDINGS</Text>
                                                {Object.values(state.holdings).length === 0 && (
                                                    <Text style={styles.emptyState}>[ SYSTEMS DORMANT // NO HOLDINGS ]</Text>
                                                )}
                                                {Object.values(state.holdings).map(holding => {
                                                    const price = state.marketPrices[holding.symbol] ?? 0;
                                                    const value = holding.shares * price;
                                                    const pnl = (price - holding.avgCost) * holding.shares;
                                                    const pnlPct = holding.avgCost ? (price / holding.avgCost - 1) * 100 : 0;
                                                    const pnlColor = getChangeColor(pnlPct);
                                                    return (
                                                        <View key={holding.symbol} style={styles.holdingRow}>
                                                            <View>
                                                                <Text style={styles.watchSymbol}>{holding.symbol}</Text>
                                                                <Text style={styles.watchName}>{formatShares(holding.shares)} SHARES</Text>
                                                            </View>
                                                            <View style={styles.watchValues}>
                                                                <Text style={styles.watchPrice}>${formatMoney(value)}</Text>
                                                                <Text style={[styles.watchChange, { color: pnlColor }]}>
                                                                    {formatSignedMoney(pnl)} ({formatSignedPercent(pnlPct, 2)}%)
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </View>

                                            <View style={styles.openOrders}>
                                                <Text style={styles.sectionTitle}>OPEN ORDERS</Text>
                                                {state.openOrders.filter(o => o.status === "OPEN").length === 0 && (
                                                    <Text style={styles.emptyState}>[ NO ACTIVE ORDERS ]</Text>
                                                )}
                                                {state.openOrders.filter(o => o.status === "OPEN").map(order => (
                                                    <View key={order.id} style={styles.orderRow}>
                                                        <View>
                                                            <Text style={styles.watchSymbol}>{order.symbol} {order.side}</Text>
                                                            <Text style={styles.watchName}>
                                                                {order.type} • ${formatMoney(order.amount)} {order.limitPrice ? `@ ${formatMoney(order.limitPrice)}` : ""}
                                                            </Text>
                                                        </View>
                                                        <Pressable
                                                            onPress={() => {
                                                                setState(prev => ({
                                                                    ...prev,
                                                                    openOrders: prev.openOrders.map(o => o.id === order.id ? { ...o, status: "CANCELLED" } : o)
                                                                }));
                                                            }}
                                                            style={styles.cancelButton}
                                                        >
                                                            <Text style={styles.cancelButtonText}>CANCEL</Text>
                                                        </Pressable>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </>
                                )}

                                {portfolioPage === "MARKET" && (
                                    <>
                                        <View style={styles.chartContainer}>
                                            <PortfolioGrowthChart currentValue={state.netWorth + state.cash} title="LIVE MARKET FEED" tickMs={marketTickMs} />
                                        </View>
                                        <View style={styles.chartContainer}>
                                            <PortfolioChart data={state.history} />
                                        </View>
                                    </>
                                )}

                                {portfolioPage === "STORY" && (
                                    <View style={styles.storyPanel}>
                                        <Text style={styles.sectionTitle}>SIMULATION CONSOLE</Text>
                                        <Text style={styles.storyText}>MONTH {state.month} // ACT {state.currentAct}</Text>
                                        <Text style={styles.storyText}>MARKET STATUS: {state.statusText}</Text>
                                        {headline && (
                                            <View style={styles.storyCard}>
                                                <Text style={styles.storyTitle}>LATEST HEADLINE</Text>
                                                <Text style={styles.storyBody}>{headline.text}</Text>
                                            </View>
                                        )}
                                        {event && (
                                            <View style={styles.storyCard}>
                                                <Text style={styles.storyTitle}>ACTIVE EVENT</Text>
                                                <Text style={styles.storyBody}>{event.body}</Text>
                                            </View>
                                        )}
                                        <View style={styles.storyCard}>
                                            <Text style={styles.storyTitle}>OBJECTIVE</Text>
                                            <Text style={styles.storyBody}>
                                                Reach ${state.targetNetWorth.toLocaleString()} within 12 months. Current equity: ${totalValue}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {portfolioPage === "COMMAND" && (
                                    <View style={styles.commandPanel}>
                                        <Text style={styles.sectionTitle}>EQUITY CONSOLE</Text>
                                        <View style={styles.commandCard}>
                                            <Text style={styles.commandTitle}>PRIMARY OBJECTIVE</Text>
                                            <Text style={styles.commandBody}>
                                                Build disciplined habits and reach freedom target. Avoid protocol breaches during volatility events.
                                            </Text>
                                        </View>
                                        <View style={styles.commandCard}>
                                            <Text style={styles.commandTitle}>PROTOCOL STATUS</Text>
                                            <Text style={styles.commandBody}>Rule Integrity: {state.ruleIntegrity}%</Text>
                                            <Text style={styles.commandBody}>Violations: {state.violations.length}</Text>
                                        </View>
                                        <View style={styles.commandCard}>
                                            <Text style={styles.commandTitle}>MARKET READINESS</Text>
                                            <Text style={styles.commandBody}>Market: {marketOpen ? "OPEN" : "CLOSED"} at {marketTime}</Text>
                                            <Text style={styles.commandBody}>Cash: ${state.cash.toLocaleString()}</Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}

                        {activeTab === "STATS" && (
                            <View style={styles.statsContainer}>
                                <Text style={styles.sectionTitle}>PSYCHOMETRIC PROFILE</Text>
                                <StatRow label="Patience" value={state.stats.patience} description="Resistance to boredom." />
                                <StatRow label="Discipline" value={state.stats.discipline} description="Adherence to rules." />
                                <StatRow label="Conviction" value={state.stats.conviction} description="Confidence in strategy." />

                                <View style={styles.divider} />

                                <Text style={styles.sectionTitle}>CAREER METRICS</Text>
                                <InfoRow label="ROLE" value={state.job?.title.replace(/_/g, ' ') || "UNEMPLOYED"} />
                                <InfoRow label="INCOME" value={`$${((state.job?.hourlyWage || 0) * 160).toFixed(0)} PER MONTH`} />
                                <InfoRow label="TOTAL EQUITY" value={`$${(state.netWorth + state.cash).toLocaleString()}`} />

                                <AdvancedAnalytics
                                    netWorth={state.netWorth + state.cash}
                                    ruleIntegrity={state.ruleIntegrity}
                                    stats={state.stats}
                                />
                            </View>
                        )}

                        {activeTab === "CONTRACT" && (
                            <View style={styles.statsContainer}>
                                <Text style={styles.sectionTitle}>RULE INTEGRITY</Text>
                                <Text style={[styles.integrityScore, { color: state.ruleIntegrity > 80 ? theme.colors.success : theme.colors.danger }]}>
                                    {state.ruleIntegrity}%
                                </Text>
                                <Text style={styles.integrityDesc}>
                                    Current adherence to selected protocols. Drops significantly upon violation.
                                </Text>

                                <View style={styles.divider} />

                                <Text style={styles.sectionTitle}>ACTIVE PROTOCOLS</Text>
                                {state.selectedRules.length === 0 ? (
                                    <Text style={styles.emptyState}>NO PROTOCOLS SELECTED</Text>
                                ) : (
                                    <View style={styles.protocolList}>
                                        {state.selectedRules.map(rule => (
                                            <View key={rule.id} style={styles.protocolCard}>
                                                <Text style={styles.protocolTitle}>{rule.title}</Text>
                                                <Text style={styles.protocolBody}>{rule.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={styles.divider} />

                                <Text style={styles.sectionTitle}>VIOLATION LOG</Text>
                                {state.violations.length === 0 ? (
                                    <Text style={styles.emptyState}>[ NO BREACHES DETECTED ]</Text>
                                ) : (
                                    state.violations.map((v, i) => (
                                        <Text key={i} style={styles.violationText}>• {v.replace(/_/g, ' ')}</Text>
                                    ))
                                )}
                            </View>
                        )}
                    </ScrollView>

                    <EventModal visible={eventVisible} event={event} onChoose={onStartDecisionFlow} />
                    <FeedbackModal visible={feedbackState.visible} title={feedbackState.title} message={feedbackState.message} buttonLabel={feedbackState.buttonLabel} onContinue={onContinueFeedback} />
                    <TruthToast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(prev => ({ ...prev, visible: false }))} />

                </Animated.View>
            </View>
        </HoloBackground>
    );
}

function formatNumber(value: number, decimals: number) {
    if (!Number.isFinite(value)) return "0";
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(value * factor) / factor;
    return rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}

function formatMoney(value: number) {
    return formatNumber(value, 2);
}

function formatPercent(value: number, decimals: number) {
    return formatNumber(value, decimals);
}

function formatShares(value: number) {
    return formatNumber(value, 4);
}

function getChangeColor(value: number) {
    if (!Number.isFinite(value)) return theme.colors.faint;
    if (Math.abs(value) < 0.01) return theme.colors.faint;
    return value >= 0 ? theme.colors.success : theme.colors.danger;
}

function formatSignedMoney(value: number) {
    if (!Number.isFinite(value) || Math.abs(value) < 0.005) return "0.00";
    return `${value >= 0 ? "+" : "-"}${formatMoney(Math.abs(value))}`;
}

function formatSignedPercent(value: number, decimals: number) {
    const threshold = 0.5 * Math.pow(10, -decimals);
    if (!Number.isFinite(value) || Math.abs(value) < threshold) return formatNumber(0, decimals);
    return `${value >= 0 ? "+" : "-"}${formatPercent(Math.abs(value), decimals)}`;
}

function getHoldingsValue(holdings: GameState["holdings"], prices: GameState["marketPrices"]) {
    return Object.values(holdings).reduce((sum, holding) => {
        const price = prices[holding.symbol] ?? 0;
        return sum + holding.shares * price;
    }, 0);
}

function addHolding(holdings: GameState["holdings"], symbol: string, shares: number, price: number) {
    const existing = holdings[symbol];
    if (!existing) {
        return { ...holdings, [symbol]: { symbol, shares, avgCost: price } };
    }
    const newShares = existing.shares + shares;
    const newCost = (existing.avgCost * existing.shares + price * shares) / newShares;
    return { ...holdings, [symbol]: { ...existing, shares: newShares, avgCost: newCost } };
}

function processLimitOrders(
    state: GameState,
    prices: GameState["marketPrices"],
    marketOpen: boolean
) {
    let cash = state.cash;
    let holdings = { ...state.holdings };
    const nextOrders: GameState["openOrders"] = [];

    state.openOrders.forEach(order => {
        let updated = { ...order };
        if (order.status !== "OPEN") {
            nextOrders.push(updated);
            return;
        }
        if (order.type !== "LIMIT") {
            nextOrders.push(updated);
            return;
        }
        const price = prices[order.symbol];
        if (!price || !order.limitPrice) {
            nextOrders.push(updated);
            return;
        }
        const isCrypto = order.symbol === "BTC" || order.symbol === "ETH";
        if (!marketOpen && !isCrypto) {
            nextOrders.push(updated);
            return;
        }
        const { bid, ask } = getBidAsk(order.symbol, price);

        if (order.side === "BUY" && ask <= order.limitPrice) {
            const amount = Math.min(order.amount, cash);
            if (amount > 0) {
                const shares = amount / ask;
                holdings = addHolding(holdings, order.symbol, shares, ask);
                cash -= amount;
                updated = { ...updated, status: "FILLED", filledAt: Date.now(), filledPrice: ask };
            }
        } else if (order.side === "SELL" && bid >= order.limitPrice) {
            const holding = holdings[order.symbol];
            if (holding) {
                const holdingValue = holding.shares * bid;
                const sellValue = Math.min(order.amount, holdingValue);
                const sharesToSell = sellValue / bid;
                const remaining = holding.shares - sharesToSell;
                if (remaining <= 0.0001) {
                    const { [order.symbol]: _, ...rest } = holdings;
                    holdings = rest;
                } else {
                    holdings = { ...holdings, [order.symbol]: { ...holding, shares: remaining } };
                }
                cash += sellValue;
                updated = { ...updated, status: "FILLED", filledAt: Date.now(), filledPrice: bid };
            }
        }

        nextOrders.push(updated);
    });

    return { cash, holdings, openOrders: nextOrders };
}

function TabButton({ title, active, onPress }: { title: string, active: boolean, onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            accessibilityRole="button"
            style={[styles.tabButton, active && styles.tabActive]}
        >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
        </Pressable>
    );
}

function PageButton({ title, active, onPress }: { title: string, active: boolean, onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            hitSlop={6}
            accessibilityRole="button"
            style={[styles.pageButton, active && styles.pageButtonActive]}
        >
            <Text style={[styles.pageButtonText, active && styles.pageButtonTextActive]}>{title}</Text>
        </Pressable>
    );
}

function StatHUD({ label, value }: { label: string, value: number }) {
    const color = value < 40 ? theme.colors.danger : value < 70 ? theme.colors.real : theme.colors.success;
    return (
        <View style={styles.statHudBox}>
            <Text style={styles.statHudLabel}>{label}</Text>
            <Text style={[styles.statHudValue, { color }]}>{value}%</Text>
            <View style={styles.statHudTrack}>
                <View style={[styles.statHudFill, { width: `${value}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

function StatRow({ label, value, description }: { label: string, value: number, description: string }) {
    const color = value < 40 ? theme.colors.danger : value < 70 ? theme.colors.real : theme.colors.success;
    return (
        <View style={styles.statRow}>
            <View style={styles.statHeader}>
                <Text style={styles.statValueLarge}>{value}%</Text>
                <Text style={[styles.statLabelLarge, { color }]}>{label.toUpperCase()}</Text>
            </View>
            <View style={styles.statBarBgLarge}>
                <View style={[styles.statBarFill, { width: `${value}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.statDesc}>{description}</Text>
        </View>
    )
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{value.toUpperCase()}</Text>
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    chartContainer: { marginBottom: 24, paddingHorizontal: 12 },
    tabHeader: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.bg },
    tabButton: { marginRight: 24, paddingVertical: 16 },
    tabActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.accent },
    tabText: { color: theme.colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
    tabTextActive: { color: theme.colors.text },
    subTabRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    pageButton: { borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 2, backgroundColor: theme.colors.card },
    pageButtonActive: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accent + '20' },
    pageButtonText: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
    pageButtonTextActive: { color: theme.colors.accent },
    scrollContent: { padding: 24 },
    mainTitleContainer: { width: '100%', paddingHorizontal: 24, marginBottom: 16, marginTop: 8, alignItems: 'center' },
    headerMenuRow: { width: '100%', paddingHorizontal: 24, alignItems: 'flex-end', marginBottom: 8 },
    exitButton: { position: 'absolute', top: -4, right: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card, zIndex: 2 },
    exitButtonText: { color: theme.colors.faint, fontSize: 10, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 1 },
    headerTitleLarge: { color: theme.colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1.5, lineHeight: 32, marginTop: 8 },
    headerCodeSmall: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 2, opacity: 0.8 },
    header: { alignItems: 'center', paddingTop: 0 },
    hudRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    equityHud: { gap: 4 },
    equityLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    equityValue: { color: theme.colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -1 },
    marketStatusHud: { alignItems: 'flex-end', gap: 4 },
    statusPulse: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.accent },
    statusText: { color: theme.colors.faint, fontSize: 8, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
    changeText: { fontSize: 14, fontWeight: '700' },
    vitalsBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, padding: 16, backgroundColor: theme.colors.card, borderBlockColor: theme.colors.border, borderWidth: 1, borderRadius: 2 },
    statHudBox: { width: '30%', gap: 4 },
    statHudLabel: { color: theme.colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
    statHudValue: { fontSize: 14, fontWeight: '900', fontFamily: 'monospace' },
    statHudTrack: { height: 2, backgroundColor: theme.colors.bg, width: '100%' },
    statHudFill: { height: '100%' },
    sectionSpacer: { height: 8 },
    statsContainer: { gap: 24 },
    sectionTitle: { color: theme.colors.faint, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' },
    statRow: { marginBottom: 16 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statLabelLarge: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    statValueLarge: { color: theme.colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    statBarBgLarge: { height: 8, backgroundColor: theme.colors.card, borderRadius: 4, marginBottom: 8 },
    statBarFill: { height: '100%', borderRadius: 2 },
    statDesc: { color: theme.colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '500' },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
    infoRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 4 },
    infoLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
    infoValue: { color: theme.colors.text, fontSize: 16, fontWeight: '900', fontFamily: 'monospace', letterSpacing: -0.5 },
    integrityScore: { fontSize: 48, fontWeight: '900', textAlign: 'center', marginVertical: 12 },
    integrityDesc: { color: theme.colors.muted, textAlign: 'center', fontSize: 12, paddingHorizontal: 20 },
    emptyState: { color: theme.colors.faint, textAlign: 'center', fontStyle: 'italic', marginTop: 20 },
    violationText: { color: theme.colors.faint, fontSize: 11, fontWeight: '700', lineHeight: 16 },
    protocolList: { gap: 12 },
    protocolCard: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, padding: 12, borderRadius: 2 },
    protocolTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
    protocolBody: { color: theme.colors.faint, fontSize: 11, lineHeight: 16, fontWeight: '600' },
    marketSection: { marginTop: 32, gap: 16 },
    missionHud: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 2, padding: 16, gap: 8, marginBottom: 16 },
    missionLabel: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1.5, fontFamily: 'monospace' },
    missionTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
    missionSub: { color: theme.colors.muted, fontSize: 10, fontWeight: '700', fontFamily: 'monospace' },
    missionMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    missionMetaText: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
    progressTrack: { height: 6, backgroundColor: theme.colors.bg, borderRadius: 2, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
    progressFill: { height: '100%', backgroundColor: theme.colors.accent },
    storyPanel: { gap: 12 },
    storyCard: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 2, padding: 12 },
    storyTitle: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace', marginBottom: 6 },
    storyBody: { color: theme.colors.text, fontSize: 12, lineHeight: 18, fontWeight: '600' },
    storyText: { color: theme.colors.muted, fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
    commandPanel: { gap: 12 },
    commandCard: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 2, padding: 12 },
    commandTitle: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace', marginBottom: 6 },
    commandBody: { color: theme.colors.text, fontSize: 12, lineHeight: 18, fontWeight: '600' },
    marketStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    marketStatusText: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, fontFamily: 'monospace' },
    marketSummary: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 2,
        padding: 12,
        justifyContent: 'space-between'
    },
    summaryBlock: { flex: 1, alignItems: 'center', gap: 4 },
    summaryLabel: { color: theme.colors.faint, fontSize: 8, fontWeight: '900', letterSpacing: 1.5, fontFamily: 'monospace' },
    summaryValue: { color: theme.colors.text, fontSize: 14, fontWeight: '900', fontFamily: 'monospace' },
    tickerRow: { gap: 8, paddingVertical: 4 },
    tickerPill: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 2 },
    tickerPillActive: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accent + '20' },
    tickerText: { color: theme.colors.faint, fontSize: 10, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
    tickerTextActive: { color: theme.colors.accent },
    tradePanel: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 2,
        padding: 12,
        gap: 10
    },
    tradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tradeLabel: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 1.2 },
    tradeValue: { color: theme.colors.text, fontSize: 12, fontWeight: '900', fontFamily: 'monospace' },
    tradeInput: {
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 2,
        minWidth: 120,
        textAlign: 'right'
    },
    orderTypeRow: { flexDirection: 'row', gap: 6 },
    orderTypeButton: { borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
    orderTypeActive: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accent + '20' },
    orderTypeText: { color: theme.colors.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
    orderTypeTextActive: { color: theme.colors.accent },
    tradeButtons: { flexDirection: 'row', gap: 8 },
    tradeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 2 },
    buyButton: { backgroundColor: theme.colors.success },
    sellButton: { backgroundColor: theme.colors.danger },
    tradeButtonText: { color: theme.colors.buttonText, fontSize: 11, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
    watchlist: { gap: 12 },
    watchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, padding: 12, borderRadius: 2 },
    watchSymbol: { color: theme.colors.text, fontSize: 12, fontWeight: '900', fontFamily: 'monospace' },
    watchName: { color: theme.colors.faint, fontSize: 9, fontWeight: '700' },
    watchValues: { alignItems: 'flex-end' },
    watchPrice: { color: theme.colors.text, fontSize: 12, fontWeight: '900', fontFamily: 'monospace' },
    watchChange: { fontSize: 9, fontWeight: '900', fontFamily: 'monospace' },
    holdings: { gap: 12 },
    holdingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, padding: 12, borderRadius: 2 },
    openOrders: { gap: 12 },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, padding: 12, borderRadius: 2 },
    cancelButton: { borderWidth: 1, borderColor: theme.colors.danger, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
    cancelButtonText: { color: theme.colors.danger, fontSize: 9, fontWeight: '900', letterSpacing: 1, fontFamily: 'monospace' },
});
