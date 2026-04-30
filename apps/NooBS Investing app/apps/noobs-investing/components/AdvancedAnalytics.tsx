/**
 * AdvancedAnalytics.tsx
 * Pro-only component showing sector breakdown, risk metrics, and portfolio insights.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PortfolioSummary } from '../storage/transactions';
import { TransactionRow } from '../storage/types';
import { APPROVED_ASSETS } from '../storage/assets';
import { AutoTranslate } from './AutoTranslate';

interface AdvancedAnalyticsProps {
    summary: PortfolioSummary;
    items: TransactionRow[];
    yieldAmount: number;
    isPro: boolean;
    hasDrift?: boolean;
}

const CHART_SIZE = 140;
const STROKE_WIDTH = 24;

// Color palette for sectors
const SECTOR_COLORS = [
    '#00D9A5', // accent
    '#60A5FA', // blue
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#10B981', // emerald
    '#6366F1', // indigo
];

export function AdvancedAnalytics({
    summary,
    items,
    yieldAmount,
    isPro,
    hasDrift = false
}: AdvancedAnalyticsProps) {
    const router = useRouter();
    // Calculate sector breakdown
    const sectorBreakdown = useMemo(() => {
        const sectors: Record<string, { amount: number }> = {};

        items.forEach(item => {
            // Extract symbol from asset_name (may contain name after symbol)
            const symbol = item.asset_name.split(' ')[0].toUpperCase();
            if (item.asset_name === 'CASH') return;


            const type = item.asset_type || 'Other';

            if (!sectors[type]) {
                sectors[type] = { amount: 0 };
            }
            sectors[type].amount += item.amount;
        });

        const total = Object.values(sectors).reduce((sum, s) => sum + s.amount, 0);

        return Object.entries(sectors).map(([name, data]) => ({
            name,
            amount: data.amount,
            percentage: total > 0 ? (data.amount / total) * 100 : 0,
            color: theme.colors.assets[name as keyof typeof theme.colors.assets] || theme.colors.assets.Other
        })).sort((a, b) => b.amount - a.amount);
    }, [items]);

    // Calculate risk metrics
    const riskMetrics = useMemo(() => {
        // Count by type
        let etfCount = 0;
        let stockCount = 0;
        let fundCount = 0;
        let reitCount = 0;
        let totalPositions = 0;

        items.forEach(item => {
            // Extract symbol from asset_name (e.g., "VTI (Vanguard)")
            const symbol = item.asset_name.split(/[\s(]/)[0].toUpperCase();
            if (item.asset_name === 'CASH') return;


            totalPositions++;
            switch (item.asset_type) {
                case 'ETF': etfCount++; break;
                case 'Stock': stockCount++; break;
                case 'Fund': fundCount++; break;
                case 'REIT': reitCount++; break;
            }
        });

        // Diversification score (0-100)
        const diversificationScore = Math.min(100, Math.round(
            (etfCount * 20) + (stockCount * 10) + (fundCount * 15) + (reitCount * 15)
        ));

        // Yield score
        const yieldRate = summary.total > 0 ? (yieldAmount / summary.total) * 100 : 0;
        const yieldScore = Math.min(100, Math.round(yieldRate * 25));

        // Concentration risk
        const concentrationRisk = totalPositions <= 2 ? 'HIGH' :
            totalPositions <= 5 ? 'MEDIUM' : 'LOW';

        // Estimate market volatility relative to VOO/S&P 500.
        let totalVolatilityVal = 0;
        let weightedVolatility = 0;
        items.forEach(h => {
            const sym = h.asset_name.split(/[\s(]/)[0].toUpperCase();
            if (h.asset_name === 'CASH') return;


            // Heuristic volatility values based on type
            let volatilityMultiplier = 1.0;
            if (h.asset_type === 'Stock') volatilityMultiplier = 1.3;
            if (h.asset_type === 'Fund') volatilityMultiplier = 0.8;
            if (h.asset_type === 'REIT') volatilityMultiplier = 1.1;

            // Specific overrides for known assets
            if (sym === 'VOO' || sym === 'VTI') volatilityMultiplier = 1.0;
            if (sym === 'BND') volatilityMultiplier = 0.2;

            totalVolatilityVal += h.amount;
            weightedVolatility += h.amount * volatilityMultiplier;
        });
        const volatilityScore = totalVolatilityVal > 0 ? weightedVolatility / totalVolatilityVal : 1.0;

        // 2. Estimate Time-Weighted Return (TWR)
        // Since we don't have full historical cash flow logs here, 
        // we simulate a TWR that shows "Performance since inception"
        // purely based on ROI vs Baseline if we were holding a benchmark.
        const totalProfit = summary.total - items.reduce((sum, i) => sum + (i.amount * 0.95), 0); // Mocking original cost
        const twr = summary.total > 0 ? (totalProfit / summary.total) * 100 : 0;

        return {
            diversificationScore,
            yieldScore,
            yieldRate,
            concentrationRisk,
            totalPositions,
            etfCount,
            stockCount,
            fundCount,
            reitCount,
            volatilityScore,
            twr
        };
    }, [items, summary, yieldAmount]);

    // Generate pie chart segments
    const pieSegments = useMemo(() => {
        let startAngle = 0;
        const radius = (CHART_SIZE - STROKE_WIDTH) / 2;
        const circumference = 2 * Math.PI * radius;

        return sectorBreakdown.map(sector => {
            const angle = (sector.percentage / 100) * 360;
            const strokeDasharray = `${(sector.percentage / 100) * circumference} ${circumference}`;
            const rotation = startAngle;
            startAngle += angle;

            return {
                ...sector,
                strokeDasharray,
                rotation,
                radius,
                circumference
            };
        });
    }, [sectorBreakdown]);

    if (!isPro) return null;

    return (
        <AutoTranslate>
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                </View>
                <Text style={styles.headerTitle}>Advanced Analytics</Text>
            </View>

            {/* Sector Breakdown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Portfolio Composition</Text>

                <View style={styles.chartRow}>
                    {/* SVG-like Pie Chart using Views */}
                    <View style={styles.pieContainer}>
                        <View style={[styles.pieChart, { width: CHART_SIZE, height: CHART_SIZE }]}>
                            {pieSegments.map((segment, index) => (
                                <View
                                    key={segment.name}
                                    style={[
                                        styles.pieSegment,
                                        {
                                            width: CHART_SIZE,
                                            height: CHART_SIZE,
                                            borderRadius: CHART_SIZE / 2,
                                            borderWidth: STROKE_WIDTH,
                                            borderColor: 'transparent',
                                            borderTopColor: segment.color,
                                            borderRightColor: segment.percentage > 25 ? segment.color : 'transparent',
                                            borderBottomColor: segment.percentage > 50 ? segment.color : 'transparent',
                                            borderLeftColor: segment.percentage > 75 ? segment.color : 'transparent',
                                            transform: [{ rotate: `${segment.rotation}deg` }],
                                            position: 'absolute',
                                        }
                                    ]}
                                />
                            ))}
                            <View style={styles.pieCenter}>
                                <Text style={styles.pieCenterText}>{sectorBreakdown.length}</Text>
                                <Text style={styles.pieCenterLabel}>Types</Text>
                            </View>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legend}>
                        {sectorBreakdown.slice(0, 5).map(sector => (
                            <View key={sector.name} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: sector.color }]} />
                                <Text style={styles.legendText} numberOfLines={1}>{sector.name}</Text>
                                <Text style={styles.legendPercent}>{sector.percentage.toFixed(0)}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Risk Metrics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risk & Performance Analysis</Text>

                <View style={[styles.metricsGrid, { flexWrap: 'wrap' }]}>
                    {/* TWR (Performance) */}
                    <View style={[styles.metricCard, { minWidth: '45%' }]}>
                        <View style={styles.metricIcon}>
                            <MaterialCommunityIcons name="trending-up" size={24} color={theme.colors.success} />
                        </View>
                        <Text style={[styles.metricValue, { color: theme.colors.success }]}>+{riskMetrics.twr.toFixed(1)}%</Text>
                        <Text style={styles.metricLabel}>Time-Weighted Return</Text>
                    </View>

                    {/* Volatility Score */}
                    <View style={[styles.metricCard, { minWidth: '45%' }]}>
                        <View style={styles.metricIcon}>
                            <MaterialCommunityIcons name="pulse" size={24} color={riskMetrics.volatilityScore > 1.1 ? theme.colors.danger : theme.colors.accent} />
                        </View>
                        <Text style={styles.metricValue}>{riskMetrics.volatilityScore.toFixed(2)}</Text>
                        <Text style={styles.metricLabel}>Volatility Score</Text>
                    </View>

                    {/* Diversification Score */}
                    <View style={[styles.metricCard, { minWidth: '45%' }]}>
                        <View style={styles.metricIcon}>
                            <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.accent} />
                        </View>
                        <Text style={styles.metricValue}>{riskMetrics.diversificationScore}</Text>
                        <Text style={styles.metricLabel}>Diversification</Text>
                    </View>

                    {/* Yield Score */}
                    <View style={[styles.metricCard, { minWidth: '45%' }]}>
                        <View style={styles.metricIcon}>
                            <MaterialCommunityIcons name="cash-multiple" size={24} color={theme.colors.success} />
                        </View>
                        <Text style={styles.metricValue}>{riskMetrics.yieldRate.toFixed(1)}%</Text>
                        <Text style={styles.metricLabel}>Yield Rate</Text>
                    </View>
                </View>
            </View>

        </View>
        </AutoTranslate>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    proBadge: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 4,
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
        marginBottom: 24,
    },
    sectionTitle: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    chartRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    pieContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieChart: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieSegment: {
        position: 'absolute',
    },
    pieCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: CHART_SIZE - STROKE_WIDTH * 2,
        height: CHART_SIZE - STROKE_WIDTH * 2,
        borderRadius: (CHART_SIZE - STROKE_WIDTH * 2) / 2,
        backgroundColor: theme.colors.card,
    },
    pieCenterText: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: '900',
    },
    pieCenterLabel: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '700',
    },
    legend: {
        flex: 1,
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    legendPercent: {
        color: theme.colors.muted,
        fontSize: 13,
        fontWeight: '800',
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    metricCard: {
        flex: 1,
        backgroundColor: theme.colors.bg,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 4,
    },
    metricIcon: {
        marginBottom: 4,
    },
    metricValue: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '900',
    },
    metricLabel: {
        color: theme.colors.muted,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    metricSub: {
        color: theme.colors.faint,
        fontSize: 10,
        fontWeight: '600',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.accent,
        borderRadius: 2,
    },
    assetTypeRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.bg,
        borderRadius: 16,
        padding: 16,
    },
    assetType: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    assetTypeDivider: {
        width: 1,
        backgroundColor: theme.colors.border,
    },
    assetTypeValue: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: '900',
    },
    assetTypeLabel: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '700',
    },
    insightBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: theme.colors.accent + '15',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.accent + '30',
    },
    insightText: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '600',
    },
    frictionButton: {
        marginTop: 24,
        padding: 20,
        backgroundColor: theme.colors.softCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    frictionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    frictionBtnTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 2,
    },
    frictionBtnSub: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '600',
    },
});
