import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AdvancedAnalyticsProps {
    netWorth: number;
    ruleIntegrity: number;
    stats: {
        patience: number;
        discipline: number;
        conviction: number;
    };
}

export function AdvancedAnalytics({
    netWorth,
    ruleIntegrity,
    stats
}: AdvancedAnalyticsProps) {

    // Heuristic metrics based on simulated residency performance
    const volatilityScore = 1.0 + (100 - ruleIntegrity) / 100; // Lower integrity = higher perceived volatility
    const diversificationScore = Math.round(ruleIntegrity); // Mocked alignment
    const alpha = (ruleIntegrity - 50) / 10; // Positive alpha only for disciplined residents

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>RESIDENCY DATA</Text>
                </View>
                <Text style={styles.headerTitle}>Advanced Statistics</Text>
            </View>

            {/* Risk Metrics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Psychological Risk Profile</Text>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <MaterialCommunityIcons name="pulse" size={24} color={volatilityScore > 1.2 ? theme.colors.danger : theme.colors.accent} />
                        <Text style={styles.metricValue}>{volatilityScore.toFixed(2)}</Text>
                        <Text style={styles.metricLabel}>Volatility Score</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.accent} />
                        <Text style={styles.metricValue}>{diversificationScore}</Text>
                        <Text style={styles.metricLabel}>Plan Adherence</Text>
                    </View>

                    <View style={styles.metricCard}>
                        <MaterialCommunityIcons name="trending-up" size={24} color={alpha >= 0 ? theme.colors.success : theme.colors.danger} />
                        <Text style={[styles.metricValue, { color: alpha >= 0 ? theme.colors.success : theme.colors.danger }]}>
                            {alpha >= 0 ? '+' : ''}{alpha.toFixed(1)}%
                        </Text>
                        <Text style={styles.metricLabel}>Behavioral Alpha</Text>
                    </View>
                </View>
            </View>

            {/* Emotional Breakdown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emotional Capacity</Text>
                <StatBar label="Patience" value={stats.patience} />
                <StatBar label="Discipline" value={stats.discipline} />
                <StatBar label="Conviction" value={stats.conviction} />
            </View>

            <View style={styles.insightBox}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color={theme.colors.accent} />
                <Text style={styles.insightText}>
                    {ruleIntegrity < 80
                        ? "Your instability is causing slippage. The residency detects high emotional noise."
                        : "Your psychological foundation is stable. You are performing at a professional level."}
                </Text>
            </View>
        </View>
    );
}

function StatBar({ label, value }: { label: string, value: number }) {
    return (
        <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#666', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }}>{label}</Text>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>{Math.floor(value)}%</Text>
            </View>
            <View style={{ height: 4, backgroundColor: '#111', borderRadius: 2 }}>
                <View style={{ height: '100%', width: `${value}%`, backgroundColor: theme.colors.accent, borderRadius: 2 }} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    proBadge: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    proBadgeText: {
        color: theme.colors.bg,
        fontSize: 10,
        fontWeight: '900',
    },
    headerTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 20,
        letterSpacing: 1
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    metricCard: {
        flex: 1,
        backgroundColor: theme.colors.softCard,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#111'
    },
    metricValue: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
    },
    metricLabel: {
        color: theme.colors.faint,
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    insightBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: theme.colors.accent + '10',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.accent + '20',
    },
    insightText: {
        flex: 1,
        color: '#AAA',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },
});
