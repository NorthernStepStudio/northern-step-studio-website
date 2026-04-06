import React, { useMemo, useState, useEffect } from "react";
import { Text, TextInput, Pressable, View, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addTransaction, getAssetHolding, listTaxLots } from "../storage/transactions";
import { TransactionRow, AssetType, TxKind } from "../storage/types";
import { unlockMedal } from "../storage/achievements";
import { WarningText } from "../components/WarningText";
import { Screen } from "../components/Screen";
import { GuardrailChecklist } from "../components/GuardrailChecklist";
import { APPROVED_ASSETS } from "../storage/assets";
import { GuideTip } from "../components/GuideTip";

import { OrderConfirmationModal, OrderType } from "../components/OrderConfirmationModal";
import { TutorialOverlay } from "../components/TutorialOverlay";
import { useTutorial, ORDER_FLOW_TUTORIAL } from "../components/TutorialContext";
import { addPendingOrder } from "../storage/pendingOrders";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isProUser } from "../storage/subscription";
import { ProPaywall } from "../components/ProPaywall";

export default function AddEntry() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        kind?: TxKind,
        preset_symbol?: string,
        preset_name?: string,
        preset_type?: AssetType,
        preset_price?: string,
        preset_side?: "buy" | "sell",
        preset_amount?: string,
        pro_mode?: string
    }>();
    const kind: TxKind = params.kind === "real" ? "real" : "paper";
    const isProMode = params.pro_mode === 'true';

    const [assetName, setAssetName] = useState(params.preset_name || (params.preset_symbol ? `${params.preset_symbol}` : ""));
    const [assetType, setAssetType] = useState<AssetType>(params.preset_type || "ETF");
    const [amount, setAmount] = useState(params.preset_amount || "100");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [side, setSide] = useState<"buy" | "sell">(params.preset_side || "buy");

    const [orderType, setOrderType] = useState<OrderType>('market');
    const [limitPrice, setLimitPrice] = useState(params.preset_price || "");
    const [currentHolding, setCurrentHolding] = useState<number | null>(null);
    const [taxLots, setTaxLots] = useState<TransactionRow[]>([]);
    const [tradeThesis, setTradeThesis] = useState<string>("");
    const [isPro, setIsPro] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);

    const THESES = [
        { id: "CORE", label: "Core Long-Term Portfolio", color: theme.colors.success },
        { id: "HEDGE", label: "Diversification Hedge", color: theme.colors.accent },
        { id: "FUN", label: "Speculative 'Fun' Money (Max 5%)", color: theme.colors.danger },
        { id: "INCOME", label: "Elite Strategic Income Bridge", color: "#FFD700" }
    ];

    // Tutorial hook
    const { showTutorial, currentStep, steps, startTutorial, nextStep, skipTutorial, completeTutorial } = useTutorial();

    // Check Pro status on mount
    useEffect(() => {
        isProUser().then(setIsPro);
    }, []);

    // Sync state if params change (handles navigation within the same component)
    useEffect(() => {
        if (params.preset_side) setSide(params.preset_side);
        if (params.preset_amount) setAmount(params.preset_amount);
        if (params.preset_name) setAssetName(params.preset_name);
        if (params.preset_price) setLimitPrice(params.preset_price);
    }, [params.preset_side, params.preset_amount, params.preset_name, params.preset_price]);

    useEffect(() => {
        if (isProMode && params.preset_symbol) {
            startTutorial('order_flow', ORDER_FLOW_TUTORIAL);
        }
    }, [isProMode, params.preset_symbol]);

    // Fetch current holding
    useEffect(() => {
        const name = assetName.trim();
        if (name) {
            getAssetHolding(kind, name).then(setCurrentHolding);
            if (side === 'sell') {
                listTaxLots(kind, name).then(setTaxLots);
            }
        } else {
            setCurrentHolding(null);
            setTaxLots([]);
        }
    }, [assetName, kind, side]);


    const header = useMemo(
        () => (side === "buy" ? (kind === "paper" ? "Add Paper Entry" : "Add Real Entry") : "Exit Position"),
        [kind, side]
    );

    const warning = useMemo(() => {
        if (currentHolding !== null && currentHolding < -0.01) {
            return `You are currently 'Short' this asset (${currentHolding.toFixed(2)}). Selling further will increase your debt. To exit this position, you need to BUY.`;
        }
        return side === "buy"
            ? (kind === "paper" ? "Paper money is training wheels. Use it to build discipline, not ego." : "Real money hurts. If you're guessing, stop and go learn first.")
            : "Selling? Is it part of the plan or are you just scared? Emotional selling is the #1 way to stay broke.";
    }, [side, kind, currentHolding]);

    const [isGuardrailVisible, setIsGuardrailVisible] = useState(false);
    const [isOrderConfirmVisible, setIsOrderConfirmVisible] = useState(false);

    const currentPrice = Number(params.preset_price) || 0;
    const amountValue = Number(amount) || 0;
    const limitPriceValue = Number(limitPrice) || currentPrice;
    const quantity = currentPrice > 0 ? amountValue / (orderType === 'limit' ? limitPriceValue : currentPrice) : 0;

    async function onSave() {
        setError(null);

        const name = assetName.trim();
        const amt = Number(amount);

        if (!name) {
            setError("Asset name is required. We're not mind readers.");
            return;
        }
        if (!Number.isFinite(amt) || amt <= 0) {
            setError("Amount must be > 0. You can't invest hypothetical vibes.");
            return;
        }

        if (side === 'sell' && currentHolding !== null) {
            if (amt > currentHolding + 0.001) { // 0.001 buffer for float precision
                setError(`You only own $${currentHolding.toFixed(2)} of this asset. Selling more would be 'Shorting', which is restricted for beginners.`);
                return;
            }
        }

        if (kind === 'real' && !tradeThesis) {
            setError("THESIS REQUIRED: You are handling actual capital. State your reason for this trade above.");
            return;
        }

        if (orderType === 'limit' && !isPro) {
            setShowPaywall(true);
            return;
        }

        // Pro mode with preset triggers order confirmation
        if (isProMode && params.preset_symbol && isPro) {
            setIsOrderConfirmVisible(true);
        } else {
            // Standard flow: guardrail first
            setIsGuardrailVisible(true);
        }
    }

    async function handleOrderConfirm() {
        const name = assetName.trim();
        const amt = Number(amount);

        try {
            if (orderType === 'limit') {
                const currentPriceValue = Number(params.preset_price);
                const symbol = params.preset_symbol || name.split(' ')[0];
                const baselinePrice = APPROVED_ASSETS[symbol]?.price || currentPriceValue;

                // For limit orders, we also de-rate the amount being SOLD
                // to keep the cost-basis ledger accurate.
                let recordedAmount = amt;
                if (side === 'sell' && currentPriceValue > 0) {
                    const multiplier = currentPriceValue / baselinePrice;
                    recordedAmount = amt / multiplier;
                }

                // Create a pending limit order
                await addPendingOrder({
                    kind,
                    symbol: params.preset_symbol || name,
                    assetName: name,
                    assetType,
                    side,
                    quantity: quantity,
                    limitPrice: limitPriceValue,
                    totalAmount: recordedAmount // We store the de-rated amount in the order
                });

                // When the order fills, the extra profit logic is handled in the fill engine (portfolio.tsx heartbeat)
            } else {

                // Market order - execute immediately
                const fullNotes = tradeThesis ? `[THESIS: ${tradeThesis}] ${notes.trim()}` : notes.trim();
                await addTransaction({
                    kind,
                    asset_name: name,
                    asset_type: assetType,
                    amount: side === "buy" ? amt : -amt,
                    notes: fullNotes ? fullNotes : null,
                    date_iso: new Date().toISOString(),
                });
            }

            await unlockMedal('EARLY_ADOPTER');
            setIsOrderConfirmVisible(false);
            router.back();
        } catch (err) {
            console.error(err);
            setError("Failed to place order. Try again.");
            setIsOrderConfirmVisible(false);
        }
    }

    async function finalSave() {
        const name = assetName.trim();
        const amt = Number(amount);

        try {
            const fullNotes = tradeThesis ? `[THESIS: ${tradeThesis}] ${notes.trim()}` : notes.trim();
            const currentPriceValue = Number(params.preset_price);
            const symbol = params.preset_symbol || name.split(' ')[0];
            const baselinePrice = APPROVED_ASSETS[symbol]?.price || currentPriceValue;

            // Phase BA: De-rated Sell Logic
            // We record the transaction in "Baseline Dollars" (multiplier 1.0)
            // so that selling doesn't create negative artifacts when the market is up.
            let recordedAmount = amt;
            if (side === 'sell' && currentPriceValue > 0) {
                const multiplier = currentPriceValue / baselinePrice;
                recordedAmount = amt / multiplier;
            }

            await addTransaction({
                kind,
                asset_name: name,
                asset_type: assetType,
                amount: side === "buy" ? amt : -recordedAmount,
                notes: fullNotes ? fullNotes : null,
                date_iso: new Date().toISOString(),
                // If it's a sell, we need to add the EXTRA profit to CASH manually because
                // addTransaction only does a 1:1 offset for the recorded amount.
                // Wait, addTransaction subtracts 'recordedAmount' from CASH.
                // If I sell $110 (current value) of VTI (cost $100), recordedAmount is $100.
                // addTransaction will subtract -$100 (which is +$100) from CASH.
                // But I should get $110 CASH.
                // So we need to add the $10 profit to CASH.
            });

            if (side === 'sell' && amt > recordedAmount) {
                await addTransaction({
                    kind,
                    asset_name: "CASH",
                    asset_type: "Other",
                    amount: amt - recordedAmount,
                    notes: `Realized Gain from ${name}`,
                    date_iso: new Date().toISOString()
                });
            } else if (side === 'sell' && amt < recordedAmount) {
                // Realized loss
                await addTransaction({
                    kind,
                    asset_name: "CASH",
                    asset_type: "Other",
                    amount: amt - recordedAmount, // this will be negative
                    notes: `Realized Loss from ${name}`,
                    date_iso: new Date().toISOString()
                });
            }


            await unlockMedal('EARLY_ADOPTER');
            setIsGuardrailVisible(false);
            router.back();
        } catch (err) {
            console.error(err);
            setError("Failed to save transaction. Try again.");
            setIsGuardrailVisible(false);
        }
    }

    return (
        <Screen safeTop={true}>
            <View style={{ marginBottom: 32 }}>
                <Pressable onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.muted} />
                    <Text style={{ color: theme.colors.muted, fontWeight: '700' }}>Back</Text>
                </Pressable>
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontSize: 32, fontWeight: "900", color: theme.colors.text, flex: 1 }}
                >
                    {header}
                </Text>
                <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '800', marginTop: -4 }}>
                    {kind === "paper"
                        ? "Emotionally boring practice."
                        : "Real money. Be less confident."}
                </Text>
            </View>

            <WarningText text={warning} />

            {currentHolding !== null && (
                <View style={{
                    marginBottom: 24,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: currentHolding < -0.01 ? theme.colors.danger + '10' : theme.colors.accent + '10',
                    borderWidth: 1,
                    borderColor: currentHolding < -0.01 ? theme.colors.danger + '40' : theme.colors.accent + '40'
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: currentHolding < -0.01 ? theme.colors.danger : theme.colors.accent, fontWeight: '900', fontSize: 13 }}>CURRENT HOLDING</Text>
                        <Text style={{ color: currentHolding < -0.01 ? theme.colors.danger : theme.colors.accent, fontWeight: '900', fontSize: 16 }}>${currentHolding.toFixed(2)}</Text>
                    </View>
                    {currentHolding < -0.01 && (
                        <View style={{ marginTop: 12, gap: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.danger} />
                                <Text style={{ color: theme.colors.danger, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }}>Negative Balance Detected</Text>
                            </View>
                            <Text style={{ color: theme.colors.text, fontSize: 13, lineHeight: 18 }}>
                                You have a <Text style={{ fontWeight: '900' }}>Short Position</Text>. This happens if you sell more shares than you own. In NooBS terms, you've borrowed shares to bet against the market.
                            </Text>
                            <Text style={{ color: theme.colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700' }}>
                                To get back up to $0, you must BUY shares, not Sell.
                            </Text>
                        </View>
                    )}
                </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                {(["buy", "sell"] as const).map(s => (
                    <Pressable
                        key={s}
                        onPress={() => setSide(s)}
                        style={{
                            flex: 1,
                            padding: 16,
                            borderRadius: 16,
                            backgroundColor: side === s ? (s === "buy" ? theme.colors.accent : theme.colors.danger) : theme.colors.card,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{
                            color: side === s ? theme.colors.buttonText : theme.colors.text,
                            fontWeight: "900",
                            textTransform: 'uppercase',
                            fontSize: 13
                        }}>{s}</Text>
                    </Pressable>
                ))}
            </View>

            <View style={{ gap: 24 }}>
                <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>
                        {params.preset_symbol ? "Buying Asset" : "Asset name"}
                    </Text>
                    <TextInput
                        value={assetName}
                        onChangeText={setAssetName}
                        placeholder="VTI, SPY, Apple..."
                        placeholderTextColor={theme.colors.faint}
                        autoCapitalize="none"
                        editable={!params.preset_symbol}
                        style={{
                            padding: 20,
                            borderRadius: 20,
                            backgroundColor: theme.colors.card,
                            color: params.preset_symbol ? theme.colors.muted : theme.colors.text,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            fontSize: 18,
                            fontWeight: '700'
                        }}
                    />
                </View>

                {params.preset_price && (
                    <View style={{ marginBottom: 8 }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: '800', marginBottom: 8 }}>
                            Current Market Price: ${params.preset_price}
                        </Text>

                        {/* Pro Mode: Order Type Selector */}
                        {isProMode && (
                            <View style={{ gap: 12 }}>
                                {!isPro && (
                                    <Pressable
                                        onPress={() => setShowPaywall(true)}
                                        style={{
                                            backgroundColor: theme.colors.accent + '15',
                                            padding: 12,
                                            borderRadius: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 8,
                                            borderWidth: 1,
                                            borderColor: theme.colors.accent + '30'
                                        }}
                                    >
                                        <MaterialCommunityIcons name="lock" size={16} color={theme.colors.accent} />
                                        <Text style={{ color: theme.colors.accent, fontWeight: '700', fontSize: 12 }}>Unlock Limit Orders with Pro</Text>
                                    </Pressable>
                                )}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: isPro ? 1 : 0.5 }}>
                                    <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 16 }}>Order Type</Text>
                                    <GuideTip
                                        title="Market vs Limit"
                                        content={
                                            <Text>
                                                <Text style={{ fontWeight: '900' }}>Market</Text> orders prioritize <Text style={{ fontWeight: '900' }}>speed</Text>. You execute NOW at the best available price.{"\n\n"}
                                                <Text style={{ fontWeight: '900' }}>Limit</Text> orders prioritize <Text style={{ fontWeight: '900' }}>price</Text>. You set your maximum entry, and wait for the market to come to you.
                                            </Text>
                                        }
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <Pressable
                                        onPress={() => setOrderType('market')}
                                        style={{
                                            flex: 1,
                                            padding: 16,
                                            borderRadius: 16,
                                            backgroundColor: orderType === 'market' ? theme.colors.accent : theme.colors.card,
                                            borderWidth: 1,
                                            borderColor: theme.colors.border,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name="lightning-bolt"
                                            size={20}
                                            color={orderType === 'market' ? theme.colors.bg : theme.colors.muted}
                                        />
                                        <Text style={{
                                            color: orderType === 'market' ? theme.colors.bg : theme.colors.text,
                                            fontWeight: "900",
                                            fontSize: 13,
                                            marginTop: 4
                                        }}>MARKET</Text>
                                        <Text style={{
                                            color: orderType === 'market' ? theme.colors.bg : theme.colors.muted,
                                            fontSize: 10,
                                            fontWeight: '600'
                                        }}>Execute now</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setOrderType('limit')}
                                        style={{
                                            flex: 1,
                                            padding: 16,
                                            borderRadius: 16,
                                            backgroundColor: orderType === 'limit' ? theme.colors.accent : theme.colors.card,
                                            borderWidth: 1,
                                            borderColor: theme.colors.border,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name="timer-outline"
                                            size={20}
                                            color={orderType === 'limit' ? theme.colors.bg : theme.colors.muted}
                                        />
                                        <Text style={{
                                            color: orderType === 'limit' ? theme.colors.bg : theme.colors.text,
                                            fontWeight: "900",
                                            fontSize: 13,
                                            marginTop: 4
                                        }}>LIMIT</Text>
                                        <Text style={{
                                            color: orderType === 'limit' ? theme.colors.bg : theme.colors.muted,
                                            fontSize: 10,
                                            fontWeight: '600'
                                        }}>Set your price</Text>
                                    </Pressable>
                                </View>

                                {orderType === 'limit' && (
                                    <View style={{ gap: 8 }}>
                                        <Text style={{ fontWeight: "800", color: theme.colors.text, fontSize: 14 }}>
                                            Limit Price (USD)
                                        </Text>
                                        <TextInput
                                            value={limitPrice}
                                            onChangeText={setLimitPrice}
                                            keyboardType="numeric"
                                            placeholder={params.preset_price}
                                            placeholderTextColor={theme.colors.faint}
                                            style={{
                                                padding: 16,
                                                borderRadius: 16,
                                                backgroundColor: theme.colors.card,
                                                color: theme.colors.text,
                                                borderWidth: 1,
                                                borderColor: theme.colors.border,
                                                fontSize: 16,
                                                fontWeight: '700'
                                            }}
                                        />
                                        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                                            Your order will execute when {params.preset_symbol} reaches this price or better.
                                        </Text>
                                    </View>
                                )}

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.muted} />
                                    <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '700' }}>
                                        Simulated Slippage: 0.05%
                                    </Text>
                                    <GuideTip
                                        title="Execution Friction"
                                        content={
                                            <Text>
                                                In the real world, you rarely get the "Exact" price. The gap between the price you see and the price you get is called <Text style={{ fontWeight: '900', color: theme.colors.text }}>Slippage</Text>.{"\n\n"}
                                                For big institutional ETFs, it's tiny. For small stocks, it's a tax on the impatient.
                                            </Text>
                                        }
                                    />
                                </View>
                            </View>
                        )}

                        {!isProMode && (
                            <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: '600' }}>
                                Order Type: Market Order (You get what you get).
                            </Text>
                        )}
                    </View>
                )}

                <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Asset type</Text>
                            <GuideTip
                                title="ETF vs Stock"
                                content={
                                    <Text>
                                        An <Text style={{ fontWeight: '900', color: theme.colors.text }}>ETF</Text> is a basket of many companies. A <Text style={{ fontWeight: '900', color: theme.colors.text }}>Stock</Text> is just one.{"\n\n"}
                                        A <Text style={{ fontWeight: '900', color: theme.colors.text }}>REIT</Text> (Real Estate Investment Trust) is a company that owns and operates income-producing real estate. They pay out most of their profits as dividends.{"\n\n"}
                                        For NooBS, ETFs are almost always better because they spread your risk.
                                    </Text>
                                }
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                        {(["ETF", "Stock", "Fund", "REIT", "Other"] as const).map((t) => (
                            <Pressable
                                key={t}
                                onPress={() => setAssetType(t)}
                                style={{
                                    flex: 1,
                                    minWidth: '22%',
                                    padding: 14,
                                    borderRadius: 16,
                                    backgroundColor: assetType === t ? theme.colors.accent : theme.colors.card,
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{
                                    color: assetType === t ? theme.colors.buttonText : theme.colors.text,
                                    fontWeight: "900",
                                    fontSize: 13,
                                    textTransform: 'uppercase'
                                }}>
                                    {t}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Amount (USD)</Text>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="25"
                        placeholderTextColor={theme.colors.faint}
                        style={{
                            padding: 20,
                            borderRadius: 20,
                            backgroundColor: theme.colors.card,
                            color: theme.colors.text,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            fontSize: 18,
                            fontWeight: '700'
                        }}
                    />
                </View>

                {kind === 'real' && (
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>The Trade Thesis</Text>
                            <GuideTip
                                title="Why explain?"
                                content={
                                    <Text>
                                        Discipline is the only hack.{"\n\n"}
                                        By forced writing, you slow down your <Text style={{ fontWeight: '900' }}>Amygdala</Text> (panic/greed center) and engage your <Text style={{ fontWeight: '900' }}>Prefrontal Cortex</Text> (strategy center).{"\n\n"}
                                        If you can't pick a thesis, don't press Save.
                                    </Text>
                                }
                            />
                        </View>
                        <View style={{ gap: 8 }}>
                            {THESES.map(t => (
                                <Pressable
                                    key={t.id}
                                    onPress={() => {
                                        if (t.id === 'INCOME' && !isPro) {
                                            setShowPaywall(true);
                                            return;
                                        }
                                        setTradeThesis(t.label);
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: 16,
                                        borderRadius: 16,
                                        backgroundColor: tradeThesis === t.label ? t.color + '20' : theme.colors.card,
                                        borderWidth: 1,
                                        borderColor: tradeThesis === t.label ? t.color : theme.colors.border,
                                        opacity: (t.id === 'INCOME' && !isPro) ? 0.6 : 1
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={tradeThesis === t.label ? "radiobox-marked" : "radiobox-blank"}
                                        size={20}
                                        color={tradeThesis === t.label ? t.color : theme.colors.muted}
                                    />
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: tradeThesis === t.label ? theme.colors.text : theme.colors.muted, fontWeight: '700' }}>{t.label}</Text>
                                        {(t.id === 'INCOME' && !isPro) && <MaterialCommunityIcons name="lock" size={14} color={theme.colors.accent} />}
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Notes (optional)</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Additional context..."
                        placeholderTextColor={theme.colors.faint}
                        style={{
                            padding: 20,
                            borderRadius: 20,
                            backgroundColor: theme.colors.card,
                            color: theme.colors.text,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            fontSize: 16,
                            fontWeight: '500'
                        }}
                    />
                </View>

                {error && (
                    <Text style={{ color: theme.colors.danger, fontWeight: "900", textAlign: 'center' }}>
                        {error}
                    </Text>
                )}

                {side === "sell" && (
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Portfolio Tax Lots (FIFO)</Text>
                            <GuideTip
                                title="What are lots?"
                                content={
                                    <Text>
                                        When you sell, you are usually disposing of the <Text style={{ fontWeight: '900' }}>First</Text> shares you bought.{"\n\n"}
                                        This is called <Text style={{ fontWeight: '900' }}>FIFO (First-In, First-Out)</Text>. It determines which purchase price is used to calculate your profit and tax.
                                    </Text>
                                }
                            />
                        </View>
                        <View style={{ gap: 8 }}>
                            {taxLots.length > 0 ? (
                                taxLots.map((lot, idx) => (
                                    <View key={lot.id} style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        padding: 12,
                                        backgroundColor: theme.colors.bg,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: theme.colors.border
                                    }}>
                                        <View>
                                            <Text style={{ color: theme.colors.muted, fontSize: 10, fontWeight: '900' }}>LOT #{idx + 1} — {new Date(lot.date_iso).toLocaleDateString()}</Text>
                                            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{lot.notes || "Standard Purchase"}</Text>
                                        </View>
                                        <Text style={{ color: theme.colors.accent, fontWeight: '900' }}>${Math.abs(lot.amount).toFixed(2)}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: theme.colors.muted, fontStyle: 'italic', fontSize: 12 }}>No historical lots found for this asset.</Text>
                            )}
                        </View>
                    </View>
                )}

                {side === "sell" && (
                    <View style={{
                        padding: 16,
                        borderRadius: 16,
                        backgroundColor: theme.colors.danger + '10',
                        borderWidth: 1,
                        borderColor: theme.colors.danger + '40',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <MaterialCommunityIcons name="gavel" size={20} color={theme.colors.danger} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.danger, fontWeight: '900', fontSize: 13, textTransform: 'uppercase' }}>The Taxman Warning</Text>
                            <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600', lineHeight: 18 }}>
                                If you've held this for less than 1 year, your profit is <Text style={{ fontWeight: '900' }}>"Short-term Capital Gains."</Text> The government will take 10-37% of it. Are you sure?
                            </Text>
                        </View>
                        <GuideTip
                            title="Capital Gains Tax"
                            content={
                                <Text>
                                    Buying and selling quickly isn't just risky—it's expensive.{"\n\n"}
                                    <Text style={{ fontWeight: '900', color: theme.colors.text }}>Short-term:</Text> (Held &lt; 1yr) Taxed as normal income. High pain.{"\n"}
                                    <Text style={{ fontWeight: '900', color: theme.colors.text }}>Long-term:</Text> (Held &gt; 1yr) Taxed at 0%, 15%, or 20%. Much lower pain.{"\n\n"}
                                    The "Taxman" loves it when you panic sell. Don't make him richer.
                                </Text>
                            }
                        />
                    </View>
                )}

                <Pressable
                    onPress={onSave}
                    style={({ pressed }) => ({
                        padding: 20,
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.colors.accent,
                        opacity: pressed ? 0.9 : 1
                    })}
                >
                    <Text style={{ color: theme.colors.buttonText, fontWeight: "900", textAlign: "center", fontSize: 18 }}>
                        SAVE ENTRY
                    </Text>
                </Pressable>

                {/* Teachable Moment Card */}
                <View style={{
                    marginTop: 12,
                    padding: 24,
                    borderRadius: 24,
                    backgroundColor: theme.colors.card,
                    borderWidth: 2,
                    borderColor: theme.colors.accent + '30',
                    gap: 16
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.accent + '20', alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="school" size={24} color={theme.colors.accent} />
                        </View>
                        <View>
                            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Teachable Moment</Text>
                            <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>Strategy: One Egg vs The Whole Basket</Text>
                        </View>
                    </View>

                    <View style={{ height: 120, backgroundColor: theme.colors.bg, borderRadius: 16, overflow: 'hidden' }}>
                        <Image
                            source={require('../assets/images/etf_basket.jpg')}
                            style={{ width: '100%', height: '100%', opacity: 0.8 }}
                            resizeMode="cover"
                        />
                    </View>

                    <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 22, fontWeight: '600' }}>
                        When you buy an <Text style={{ color: theme.colors.text }}>ETF</Text> (Exchange Traded Fund), you're buying a tiny piece of hundreds or thousands of companies at once.
                        If one company fails, you barely notice. When you buy a <Text style={{ color: theme.colors.text }}>Stock</Text>, you're betting on one egg.
                        {"\n\n"}
                        NooBS recommends ETFs for 95% of your portfolio.
                    </Text>
                </View>

                <Text style={{ color: theme.colors.faint, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 20 }}>
                    "If you can’t explain why you bought it, you probably shouldn’t."
                </Text>
            </View>
            <View style={{ height: 40 }} />

            <GuardrailChecklist
                visible={isGuardrailVisible}
                onClose={() => setIsGuardrailVisible(false)}
                onConfirm={finalSave}
            />

            {/* Pro Mode: Order Confirmation Modal */}
            {isProMode && params.preset_symbol && (
                <OrderConfirmationModal
                    visible={isOrderConfirmVisible}
                    onClose={() => setIsOrderConfirmVisible(false)}
                    onConfirm={handleOrderConfirm}
                    orderType={orderType}
                    side={side}
                    symbol={params.preset_symbol}
                    assetName={assetName}
                    quantity={quantity}
                    pricePerShare={currentPrice}
                    limitPrice={orderType === 'limit' ? limitPriceValue : undefined}
                    totalAmount={amountValue}
                />
            )}

            {/* Order Flow Tutorial */}
            <TutorialOverlay
                visible={showTutorial}
                steps={steps}
                currentStep={currentStep}
                onNext={nextStep}
                onSkip={skipTutorial}
                onComplete={completeTutorial}
            />

            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => setIsPro(true)}
            />
        </Screen>
    );
}
