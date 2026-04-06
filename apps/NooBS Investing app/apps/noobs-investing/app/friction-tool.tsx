import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GuideTip } from '../components/GuideTip';
import { formatPrice } from '../utils/chartSimulator';
import { ProPaywall } from '../components/ProPaywall';
import { isProUser } from '../storage/subscription';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function FrictionToolScreen() {
    const [principal, setPrincipal] = useState("10000");
    const [monthly, setMonthly] = useState("500");
    const [years, setYears] = useState("30");
    const [returnRate, setReturnRate] = useState("7");
    const [isPro, setIsPro] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);

    useFocusEffect(
        useCallback(() => {
            isProUser().then(setIsPro);
        }, [])
    );

    const lowFee = 0.03; // NooBS recommended (e.g. VTI)
    const highFee = 1.5; // Typical expensive fund / advisor

    const results = useMemo(() => {
        const p = parseFloat(principal) || 0;
        const m = parseFloat(monthly) || 0;
        const y = parseFloat(years) || 0;
        const r = (parseFloat(returnRate) || 0) / 100;

        const calculateFV = (feePercent: number, annualTaxDragPercent: number = 0) => {
            const netR = r - (feePercent / 100) - (annualTaxDragPercent / 100);
            const monthlyR = netR / 12;
            const months = y * 12;

            if (monthlyR === 0) return p + (m * months);

            const fvPrincipal = p * Math.pow(1 + monthlyR, months);
            const fvContributions = m * ((Math.pow(1 + monthlyR, months) - 1) / monthlyR);
            return fvPrincipal + fvContributions;
        };

        const lowFeeResult = calculateFV(lowFee, 0); // Efficient
        const highFeeResult = calculateFV(highFee, 0); // High fee only
        const highFeeWithTaxResult = calculateFV(highFee, 1.5); // High fee + 1.5% tax drag (frequent trading)

        const lostWealthFees = lowFeeResult - highFeeResult;
        const lostWealthTax = highFeeResult - highFeeWithTaxResult;
        const totalLost = lowFeeResult - highFeeWithTaxResult;
        const lostPercent = (totalLost / lowFeeResult) * 100;

        return {
            lowFeeResult,
            highFeeResult,
            highFeeWithTaxResult,
            lostWealthFees,
            lostWealthTax,
            totalLost,
            lostPercent
        };
    }, [principal, monthly, years, returnRate]);

    return (
        <Screen safeTop={true}>
            <View style={styles.header}>
                <Text style={styles.title}>The Friction Trap</Text>
                <Text style={styles.subtitle}>See how much of your future wealth is being "legally" stolen by fees.</Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputSection}>
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>STARTING AMOUNT</Text>
                        <TextInput
                            style={styles.input}
                            value={principal}
                            onChangeText={setPrincipal}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.colors.faint}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>MONTHLY ADD</Text>
                        <TextInput
                            style={styles.input}
                            value={monthly}
                            onChangeText={setMonthly}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.colors.faint}
                        />
                    </View>
                </View>

                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={styles.inputLabel}>YEARS TO GROW</Text>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                <Pressable
                                    onPress={() => setYears(y => Math.max(0, parseInt(y || "0") - 1).toString())}
                                    style={styles.quickButton}
                                >
                                    <Text style={styles.quickButtonText}>-1</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setYears(y => (parseInt(y || "0") + 1).toString())}
                                    style={styles.quickButton}
                                >
                                    <Text style={styles.quickButtonText}>+1</Text>
                                </Pressable>
                            </View>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={years}
                            onChangeText={setYears}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.colors.faint}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={styles.inputLabel}>EST. RETURN (%)</Text>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                <Pressable
                                    onPress={() => setReturnRate(r => Math.max(0, parseFloat(r || "0") - 0.5).toFixed(1))}
                                    style={styles.quickButton}
                                >
                                    <Text style={styles.quickButtonText}>-0.5</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setReturnRate(r => (parseFloat(r || "0") + 0.5).toFixed(1))}
                                    style={styles.quickButton}
                                >
                                    <Text style={styles.quickButtonText}>+0.5</Text>
                                </Pressable>
                            </View>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={returnRate}
                            onChangeText={setReturnRate}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.colors.faint}
                        />
                    </View>
                </View>
            </View>

            {/* Results Card */}
            <Animated.View
                entering={FadeInDown.duration(600)}
                style={styles.resultsCard}
            >
                <View style={styles.lostHeader}>
                    <MaterialCommunityIcons name="alert-decagram" size={32} color={theme.colors.danger} />
                    <View>
                        <Text style={styles.lostLabel}>TOTAL HIDDEN FRICTION</Text>
                        <Text style={styles.lostValue}>{formatPrice(results.totalLost)}</Text>
                    </View>
                </View>

                {/* Visual Bar Comparison */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '800' }}>WEALTH RETAINED</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: '900' }}>{(100 - results.lostPercent).toFixed(1)}%</Text>
                    </View>
                    <View style={{ height: 12, backgroundColor: theme.colors.bg, borderRadius: 6, overflow: 'hidden', flexDirection: 'row' }}>
                        <View style={{ flex: 100 - results.lostPercent, backgroundColor: theme.colors.success }} />
                        <View style={{ flex: results.lostPercent, backgroundColor: theme.colors.danger }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success }} />
                            <Text style={{ color: theme.colors.muted, fontSize: 10, fontWeight: '700' }}>Your Pocket</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.danger }} />
                            <Text style={{ color: theme.colors.muted, fontSize: 10, fontWeight: '700' }}>The "Friction" (Fees & Taxes)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.comparisonRow}>
                    <View style={styles.comparisonItem}>
                        <Text style={styles.compLabel}>NOOBS WAY (HODL)</Text>
                        <Text style={styles.compValue}>{formatPrice(results.lowFeeResult)}</Text>
                    </View>
                    <View style={[styles.comparisonItem, { alignItems: 'flex-end' }]}>
                        <Text style={styles.compLabel}>INEFFICIENT (FEES + TRADING)</Text>
                        <Text style={[styles.compValue, { color: theme.colors.faint }]}>{formatPrice(results.highFeeWithTaxResult)}</Text>
                    </View>
                </View>

                <View style={{ gap: 8, marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Wealth lost to Fees:</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>{formatPrice(results.lostWealthFees)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: theme.colors.muted, fontSize: 13 }}>Wealth lost to Taxes (Annual Drag):</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>{formatPrice(results.lostWealthTax)}</Text>
                    </View>
                </View>

                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        High fees are like a "Hidden Ransom" on your effort. You lose <Text style={{ fontWeight: '900', color: theme.colors.danger }}>{results.lostPercent.toFixed(1)}%</Text> of your total potential wealth just to pay for someone else's yacht.
                    </Text>
                </View>

                {!isPro && (
                    <Pressable
                        onPress={() => setShowPaywall(true)}
                        style={{
                            marginTop: 20,
                            backgroundColor: theme.colors.accent + '20',
                            padding: 16,
                            borderRadius: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                            borderWidth: 1,
                            borderColor: theme.colors.accent + '40'
                        }}
                    >
                        <MaterialCommunityIcons name="crown" size={20} color={theme.colors.accent} />
                        <Text style={{ color: theme.colors.accent, fontWeight: '800', flex: 1 }}>
                            Upgrade to Pro to unlock advanced fee & tax analysis.
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.accent} />
                    </Pressable>
                )}
            </Animated.View>

            {/* Educational Content */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Why This Matters</Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <MaterialCommunityIcons name="shield-lock" size={24} color={theme.colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.infoCardTitle}>The Compound Effect of Fees</Text>
                        <Text style={styles.infoCardText}>
                            Fees don't just take your money today. They take the <Text style={{ fontWeight: '800' }}>potential growth</Text> of that money for the next 40 years. 1% sounds small, but it's a massive drag on your future.
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <MaterialCommunityIcons name="account-cash" size={24} color={theme.colors.warningBg === "#2C2C2E" ? "#ffcc00" : theme.colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.infoCardTitle}>The Advisor Trap</Text>
                        <Text style={styles.infoCardText}>
                            Financial advisors often charge 1% of your total assets. Combined with high-fee funds, you could be losing 2% or more. NooBS says: <Text style={{ fontWeight: '800' }}>Index funds are cheaper and usually perform better.</Text>
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />

            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => setIsPro(true)}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bg,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.muted,
        lineHeight: 22,
    },
    inputSection: {
        paddingHorizontal: 24,
        gap: 16,
        marginBottom: 32,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        color: theme.colors.accent,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    quickButton: {
        backgroundColor: theme.colors.accent + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.accent + '30',
    },
    quickButtonText: {
        color: theme.colors.accent,
        fontSize: 10,
        fontWeight: '900',
    },
    input: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '700',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    resultsCard: {
        marginHorizontal: 24,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.danger + '40',
        marginBottom: 32,
    },
    lostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    lostLabel: {
        color: theme.colors.danger,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    lostValue: {
        color: theme.colors.text,
        fontSize: 32,
        fontWeight: '900',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: 20,
    },
    comparisonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    comparisonItem: {
        flex: 1,
    },
    compLabel: {
        color: theme.colors.muted,
        fontSize: 9,
        fontWeight: '800',
        marginBottom: 4,
    },
    compValue: {
        color: theme.colors.accent,
        fontSize: 18,
        fontWeight: '900',
    },
    warningBox: {
        backgroundColor: theme.colors.danger + '10',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.danger + '20',
    },
    warningText: {
        color: theme.colors.muted,
        fontSize: 13,
        lineHeight: 18,
    },
    infoSection: {
        paddingHorizontal: 24,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: theme.colors.text,
        marginBottom: 20,
    },
    infoCard: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
        backgroundColor: theme.colors.softCard,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.accent + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoCardTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    infoCardText: {
        color: theme.colors.muted,
        fontSize: 13,
        lineHeight: 19,
    },
});
