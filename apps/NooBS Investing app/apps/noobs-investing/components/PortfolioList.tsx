import React from "react";
import { View, Text, Pressable } from "react-native";
import { TransactionRow, TxKind } from "../storage/types";
import { APPROVED_ASSETS } from "../storage/assets";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GuideTip } from "./GuideTip";
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { AutoTranslate } from "./AutoTranslate";

export function PortfolioList({ items, kind, total = 0, roiMultiplier = 1 }: { items: TransactionRow[], kind?: TxKind, total?: number, roiMultiplier?: number }) {
    const router = useRouter();

    if (!items.length) return null;

    const roiPercent = (roiMultiplier - 1) * 100;
    const isGain = roiMultiplier > 1;
    const isLoss = roiMultiplier < 1;

    return (
        <AutoTranslate>
        <View style={{ gap: 16 }}>
            {items.map((tx, idx) => {
                const isCash = tx.asset_name === "CASH";

                const assetData = APPROVED_ASSETS[tx.asset_name.split(' ')[0]] || APPROVED_ASSETS[tx.asset_name];
                const feePercentage = assetData?.expenseRatio || 0;
                const annualFee = tx.amount * (feePercentage / 100);

                const weight = (total > 0 && !isCash) ? (tx.amount / total) * 100 : 0;
                const isOverConcentrated = weight > 10;

                return (
                    <Animated.View
                        key={tx.id}
                        entering={FadeInUp.delay(idx * 50)}
                        layout={LinearTransition}
                        style={{
                            padding: 24,
                            borderRadius: theme.radius.card,
                            backgroundColor: isCash ? theme.colors.accent + '08' : theme.colors.card,
                            borderWidth: 1,
                            borderColor: isOverConcentrated ? theme.colors.danger + '40' : (isCash ? theme.colors.accent + '20' : theme.colors.border)
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18, flex: 1 }}
                                    >
                                        {tx.asset_name}
                                    </Text>
                                    {isCash && (
                                        <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: theme.colors.accent + '20' }}>
                                            <Text style={{ color: theme.colors.accent, fontSize: 10, fontWeight: '900' }}>LIQUID</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <Text style={{ color: theme.colors.accent, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }}>
                                        {tx.asset_type}
                                    </Text>
                                    {!isCash && (
                                        <>
                                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.border }} />
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Text style={{ color: isOverConcentrated ? theme.colors.danger : theme.colors.muted, fontWeight: '700', fontSize: 12 }}>
                                                    {weight.toFixed(1)}% {isOverConcentrated ? '⚠️ TOO HIGH' : 'OF TOTAL'}
                                                </Text>
                                                {isOverConcentrated && (
                                                    <GuideTip
                                                        title="Concentration Risk"
                                                        content={
                                                            <Text>
                                                                This one asset is more than <Text style={{ fontWeight: '900', color: theme.colors.text }}>10%</Text> of your entire portfolio.{"\n\n"}
                                                                If this single company or fund crashes, your whole plan dies. The NooBS rule is: <Text style={{ fontWeight: '900', color: theme.colors.text }}>Diversify or get rect.</Text> Don't put all your eggs in one basket unless you want to eat dirt.
                                                            </Text>
                                                        }
                                                    />
                                                )}
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 20 }}>
                                    ${tx.amount.toFixed(2)}
                                </Text>
                                {!isCash && feePercentage > 0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        <Text style={{ color: theme.colors.muted, fontWeight: '800', fontSize: 10 }}>
                                            ${annualFee.toFixed(2)}/yr friction
                                        </Text>
                                        <GuideTip
                                            title="Friction (Fees)"
                                            content={
                                                <Text>
                                                    This fund takes <Text style={{ fontWeight: '900', color: theme.colors.text }}>{feePercentage}%</Text> of your money every single year just for existing.{"\n\n"}
                                                    It sounds small, but over 30 years, high fees can steal <Text style={{ fontWeight: '900', color: theme.colors.text }}>30-50%</Text> of your total wealth. Low friction is the secret to winning.
                                                </Text>
                                            }
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 16 }} />

                        {isCash ? (
                            tx.amount < 0 ? (
                                // NEGATIVE CASH WARNING
                                <View style={{ borderRadius: 12, backgroundColor: theme.colors.danger + '15', borderWidth: 1, borderColor: theme.colors.danger + '40', padding: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.danger} />
                                        <Text style={{ color: theme.colors.danger, fontWeight: '900', fontSize: 14 }}>NEGATIVE CASH BALANCE</Text>
                                        <GuideTip
                                            title="Why Is My Cash Negative?"
                                            content={
                                                <Text>
                                                    <Text style={{ fontWeight: '900', color: theme.colors.text }}>What Happened:{"\n"}</Text>
                                                    You've invested more money than you had in your 'Cash' account. In real life, this would be a problem—brokers don't let you buy without funds!{"\n\n"}
                                                    <Text style={{ fontWeight: '900', color: theme.colors.text }}>How This Simulates Reality:{"\n"}</Text>
                                                    When you BUY an investment, the app subtracts from cash. When you SELL, it adds to cash. This is called 'double-entry accounting'.{"\n\n"}
                                                    <Text style={{ fontWeight: '900', color: theme.colors.text }}>How To Fix It:{"\n"}</Text>
                                                    <Text style={{ color: theme.colors.accent }}>1. Deposit more cash</Text> - Go to Invest → Search 'CASH' → Buy (simulates adding funds){"\n"}
                                                    <Text style={{ color: theme.colors.accent }}>2. Sell an investment</Text> - This converts shares back to cash
                                                </Text>
                                            }
                                        />
                                    </View>
                                    <Text style={{ color: theme.colors.text, fontSize: 12, lineHeight: 18 }}>
                                        You've bought more than you deposited. <Text style={{ fontWeight: '700' }}>Deposit cash or sell an investment</Text> to fix this.
                                    </Text>
                                    <Pressable
                                        onPress={() => router.push({
                                            pathname: "/add-entry",
                                            params: { kind, preset_name: "CASH", preset_type: "Other", preset_side: "buy" }

                                        })}
                                        style={{ padding: 10, borderRadius: 10, backgroundColor: theme.colors.success, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 }}
                                    >
                                        <MaterialCommunityIcons name="cash-plus" size={16} color={theme.colors.buttonText} />
                                        <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 12 }}>DEPOSIT CASH</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                // POSITIVE CASH - Normal button
                                <Pressable
                                    onPress={() => router.push({ pathname: "/invest", params: { kind } })}
                                    style={{ padding: 12, borderRadius: 12, backgroundColor: theme.colors.accent, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                                >
                                    <MaterialCommunityIcons name="lightning-bolt" size={16} color={theme.colors.buttonText} />
                                    <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 12 }}>USE CASH TO INVEST</Text>
                                </Pressable>
                            )
                        ) : (
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Pressable
                                    onPress={() => router.push({
                                        pathname: "/add-entry",
                                        params: {
                                            kind,
                                            preset_symbol: tx.asset_name.split(' ')[0],
                                            preset_name: tx.asset_name,
                                            preset_type: tx.asset_type
                                        }
                                    })}
                                    style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: theme.colors.accent + '20', borderWidth: 1, borderColor: theme.colors.accent, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                                >
                                    <MaterialCommunityIcons name="plus-circle-outline" size={16} color={theme.colors.accent} />
                                    <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 12 }}>BUY MORE</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => router.push({
                                        pathname: "/add-entry",
                                        params: {
                                            kind,
                                            preset_side: "sell",
                                            preset_symbol: tx.asset_name.split(' ')[0],
                                            preset_name: tx.asset_name,
                                            preset_type: tx.asset_type,
                                            preset_amount: tx.amount.toFixed(2)
                                        }
                                    })}
                                    style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: theme.colors.danger + '10', borderWidth: 1, borderColor: theme.colors.danger + '40', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                                >
                                    <MaterialCommunityIcons name="minus-circle-outline" size={16} color={theme.colors.danger} />
                                    <Text style={{ color: theme.colors.danger, fontWeight: '900', fontSize: 12 }}>SELL / EXIT</Text>
                                </Pressable>
                            </View>
                        )}

                        {!!tx.notes && (
                            <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.colors.bg, borderRadius: 12 }}>
                                <Text style={{ color: theme.colors.muted, fontStyle: "italic", fontSize: 14 }}>
                                    “{tx.notes}”
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                );
            })}
        </View>
        </AutoTranslate>
    );
}
