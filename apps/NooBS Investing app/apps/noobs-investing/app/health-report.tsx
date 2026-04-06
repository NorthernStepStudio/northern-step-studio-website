import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { listHoldings } from '../storage/transactions';
import { calculateHealthReport, HealthReport } from '../utils/healthScanner';
import { unlockMedal } from '../storage/achievements';
import { Screen } from '../components/Screen';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProPaywall } from '../components/ProPaywall';
import { isProUser } from '../storage/subscription';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

function ScoreMeter({ label, score, max, color }: { label: string, score: number, max: number, color: string }) {
    const percentage = score / max;
    return (
        <View style={styles.meterContainer}>
            <View style={styles.meterHeader}>
                <Text style={styles.meterLabel}>{label}</Text>
                <Text style={[styles.meterValue, { color }]}>{score}/{max}</Text>
            </View>
            <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${percentage * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

export default function HealthReportScreen() {
    const router = useRouter();
    const [report, setReport] = useState<HealthReport | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);

    const load = useCallback(async () => {
        const holdings = await listHoldings('real'); // Analyze real portfolio by default
        const res = calculateHealthReport(holdings.map(h => ({
            asset_name: h.asset_name.split(' ')[0],
            amount: h.amount
        })));
        setReport(res);

        if (res.score >= 90) {
            unlockMedal('WEALTH_STRATEGIST');
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            isProUser().then(setIsPro);
            load();
        }, [load])
    );

    if (!report) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return theme.colors.success;
        if (score >= 50) return theme.colors.accent;
        return theme.colors.danger;
    };

    return (
        <Screen safeTop={true}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.muted} />
                </Pressable>
                <Text style={styles.title}>AI Health Scan</Text>
                <Text style={styles.subtitle}>Brutally honest portfolio analysis.</Text>
            </View>

            <Animated.View entering={FadeInDown.duration(600)} style={styles.scoreCard}>
                <View style={[styles.scoreCircle, { borderColor: getScoreColor(report.score) }]}>
                    <Text style={[styles.scoreNumber, { color: getScoreColor(report.score) }]}>{report.score}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                </View>
                <Text style={styles.verdictText}>{report.verdict}</Text>
            </Animated.View>

            <View style={styles.breakdownCard}>
                <ScoreMeter label="Diversity" score={report.diversityScore} max={40} color={getScoreColor(report.diversityScore * 2.5)} />
                <ScoreMeter label="Concentration" score={report.concentrationScore} max={30} color={getScoreColor(report.concentrationScore * 3.33)} />
                <ScoreMeter label="Efficiency (Fees)" score={report.efficiencyScore} max={30} color={getScoreColor(report.efficiencyScore * 3.33)} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>THE RAW TRUTH</Text>
                <View style={styles.truthList}>
                    {report.recommendations.map((rec, i) => (
                        <Animated.View key={i} entering={FadeInUp.delay(i * 100)} style={styles.truthItem}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.colors.accent} />
                            <Text style={styles.truthText}>{rec}</Text>
                        </Animated.View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>SECTOR EXPOSURE</Text>
                {!isPro ? (
                    <View style={styles.lockedCard}>
                        <MaterialCommunityIcons name="crown" size={32} color={theme.colors.accent} />
                        <Text style={styles.lockedTitle}>PRO ANALYSIS LOCKED</Text>
                        <Text style={styles.lockedText}>Upgrade to Pro to see your detailed sector exposure and AI-driven efficiency metrics.</Text>
                        <Pressable onPress={() => setShowPaywall(true)} style={styles.upgradeBtn}>
                            <Text style={styles.upgradeBtnText}>UNLOCK HEALTH SCAN ↗</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.sectorList}>
                        {report.sectorExposure.map((item, i) => (
                            <View key={i} style={styles.sectorRow}>
                                <Text style={styles.sectorName}>{item.sector}</Text>
                                <View style={styles.sectorTrack}>
                                    <View style={[styles.sectorFill, { width: `${item.percentage * 100}%` }]} />
                                </View>
                                <Text style={styles.sectorPct}>{Math.round(item.percentage * 100)}%</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {isPro && (
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Avg Expense Ratio</Text>
                        <Text style={styles.statValue}>{(report.avgMer * 100).toFixed(2)}%</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Max Position</Text>
                        <Text style={styles.statValue}>{Math.round(report.maxHoldingPercentage * 100)}%</Text>
                    </View>
                </View>
            )}

            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => setIsPro(true)}
            />

            <View style={{ height: 40 }} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
    },
    backBtn: {
        marginBottom: 16,
    },
    title: {
        color: theme.colors.text,
        fontSize: 32,
        fontWeight: '900',
    },
    subtitle: {
        color: theme.colors.muted,
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
    scoreCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 24,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        flexDirection: 'row',
    },
    scoreNumber: {
        fontSize: 48,
        fontWeight: '900',
    },
    scoreMax: {
        color: theme.colors.muted,
        fontSize: 18,
        fontWeight: '900',
        marginTop: 12,
    },
    verdictText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 24,
    },
    breakdownCard: {
        backgroundColor: theme.colors.softCard,
        borderRadius: 24,
        padding: 24,
        gap: 20,
        marginBottom: 32,
    },
    meterContainer: {
        gap: 8,
    },
    meterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    meterLabel: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '800',
    },
    meterValue: {
        fontSize: 14,
        fontWeight: '900',
    },
    meterTrack: {
        height: 8,
        backgroundColor: theme.colors.bg,
        borderRadius: 4,
        overflow: 'hidden',
    },
    meterFill: {
        height: '100%',
        borderRadius: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: theme.colors.accent,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 16,
    },
    truthList: {
        gap: 12,
    },
    truthItem: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    truthText: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    sectorList: {
        gap: 12,
    },
    sectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sectorName: {
        width: 80,
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '700',
    },
    sectorTrack: {
        flex: 1,
        height: 6,
        backgroundColor: theme.colors.card,
        borderRadius: 3,
        overflow: 'hidden',
    },
    sectorFill: {
        height: '100%',
        backgroundColor: theme.colors.accent,
        borderRadius: 3,
    },
    sectorPct: {
        width: 40,
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: '900',
        textAlign: 'right',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    statLabel: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '900',
    },
    lockedCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.accent + '30',
        gap: 12,
    },
    lockedTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
    },
    lockedText: {
        color: theme.colors.muted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 8,
    },
    upgradeBtn: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: theme.radius.pill,
    },
    upgradeBtnText: {
        color: theme.colors.buttonText,
        fontWeight: '900',
        fontSize: 14,
    },
});
