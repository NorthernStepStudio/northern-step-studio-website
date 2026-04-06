import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import { formatPercent, formatPrice, TimeRange } from '../utils/chartSimulator';
import { AutoTranslate } from './AutoTranslate';

interface PerformanceChartProps {
    portfolioHistory: { date: string; value: number }[];
    currentValue: number;
    totalContributed: number;
    isPro?: boolean;
}

const TIME_RANGES: TimeRange[] = ['1M', '3M', '1Y', 'ALL'];
const CHART_WIDTH = Dimensions.get('window').width - 64;
const CHART_HEIGHT = 160;

export function PerformanceChart({
    portfolioHistory,
    currentValue,
    totalContributed,
    isPro = false
}: PerformanceChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

    const filteredHistory = useMemo(() => {
        if (portfolioHistory.length === 0) return [];

        const now = new Date();
        let cutoffDate: Date;

        switch (timeRange) {
            case '1M':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case '3M':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '1Y':
                cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            case 'ALL':
            default:
                cutoffDate = new Date(0);
        }

        return portfolioHistory.filter(h => new Date(h.date) >= cutoffDate);
    }, [portfolioHistory, timeRange]);

    const chartPath = useMemo(() => {
        if (filteredHistory.length < 2) return null;

        const values = filteredHistory.map(h => h.value);
        const minValue = Math.min(...values, totalContributed * 0.9);
        const maxValue = Math.max(...values, totalContributed * 1.1);
        const valueRange = maxValue - minValue || 1;

        return values.map((value, index) => {
            const x = (index / (values.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - ((value - minValue) / valueRange) * CHART_HEIGHT;
            return { x, y, value };
        });
    }, [filteredHistory, totalContributed]);

    // Calculate benchmark line (straight line from first to current based on contribution)
    const benchmarkPath = useMemo(() => {
        if (filteredHistory.length < 2 || !chartPath) return null;

        const startValue = totalContributed * 0.95;
        const values = filteredHistory.map(h => h.value);
        const minValue = Math.min(...values, totalContributed * 0.9);
        const maxValue = Math.max(...values, totalContributed * 1.1);
        const valueRange = maxValue - minValue || 1;

        const points: { x: number; y: number }[] = [];
        const growthRate = 0.07 / 252; // 7% annual, daily

        for (let i = 0; i < filteredHistory.length; i++) {
            const x = (i / (filteredHistory.length - 1)) * CHART_WIDTH;
            const benchValue = startValue * Math.pow(1 + growthRate, i);
            const y = CHART_HEIGHT - ((benchValue - minValue) / valueRange) * CHART_HEIGHT;
            points.push({ x, y });
        }

        return points;
    }, [filteredHistory, totalContributed, chartPath]);

    const totalReturn = currentValue - totalContributed;
    const returnPercent = totalContributed > 0 ? (totalReturn / totalContributed) * 100 : 0;
    const isPositive = totalReturn >= 0;
    const lineColor = isPositive ? theme.colors.success : theme.colors.danger;

    if (portfolioHistory.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer]}>
                <Text style={styles.emptyText}>📈</Text>
                <Text style={styles.emptyTitle}>No History Yet</Text>
                <Text style={styles.emptySubtitle}>
                    Add transactions to see your portfolio performance over time.
                </Text>
            </View>
        );
    }

    return (
        <AutoTranslate>
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>PORTFOLIO VALUE</Text>
                    <Text style={styles.value}>{formatPrice(currentValue)}</Text>
                </View>
                <View style={styles.returnContainer}>
                    <Text style={[styles.returnAmount, { color: lineColor }]}>
                        {isPositive ? '+' : ''}{formatPrice(totalReturn)}
                    </Text>
                    <View style={[styles.returnBadge, { backgroundColor: lineColor + '20' }]}>
                        <Text style={[styles.returnPercent, { color: lineColor }]}>
                            {formatPercent(returnPercent)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                {chartPath && chartPath.length > 1 && (
                    <View style={styles.chart}>
                        {/* Benchmark line (dashed) */}
                        {isPro && benchmarkPath && benchmarkPath.map((point, index) => {
                            if (index === 0) return null;
                            const prevPoint = benchmarkPath[index - 1];
                            const dx = point.x - prevPoint.x;
                            const dy = point.y - prevPoint.y;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                            // Make it dashed by only showing every other segment
                            if (index % 2 === 0) return null;

                            return (
                                <View
                                    key={`bench-${index}`}
                                    style={[
                                        styles.lineSegment,
                                        {
                                            width: length,
                                            left: prevPoint.x,
                                            top: prevPoint.y,
                                            backgroundColor: theme.colors.muted,
                                            opacity: 0.3,
                                            transform: [{ rotate: `${angle}deg` }],
                                            transformOrigin: 'left center'
                                        }
                                    ]}
                                />
                            );
                        })}

                        {/* Portfolio line */}
                        {chartPath.map((point, index) => {
                            if (index === 0) return null;
                            const prevPoint = chartPath[index - 1];
                            const dx = point.x - prevPoint.x;
                            const dy = point.y - prevPoint.y;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.lineSegment,
                                        {
                                            width: length,
                                            left: prevPoint.x,
                                            top: prevPoint.y,
                                            backgroundColor: lineColor,
                                            transform: [{ rotate: `${angle}deg` }],
                                            transformOrigin: 'left center'
                                        }
                                    ]}
                                />
                            );
                        })}

                        {/* Current value dot */}
                        {chartPath.length > 0 && (
                            <View
                                style={[
                                    styles.priceDot,
                                    {
                                        left: chartPath[chartPath.length - 1].x - 5,
                                        top: chartPath[chartPath.length - 1].y - 5,
                                        backgroundColor: lineColor
                                    }
                                ]}
                            />
                        )}
                    </View>
                )}

                {!isPro && (
                    <View style={styles.proOverlay}>
                        <View style={styles.proBadge}>
                            <Text style={styles.proText}>🔒 PRO</Text>
                            <Text style={styles.proSubtext}>Advanced analytics</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Time Range Selector */}
            <View style={styles.rangeSelector}>
                {TIME_RANGES.map(range => (
                    <Pressable
                        key={range}
                        onPress={() => setTimeRange(range)}
                        style={[
                            styles.rangeButton,
                            timeRange === range && styles.rangeButtonActive
                        ]}
                    >
                        <Text style={[
                            styles.rangeText,
                            timeRange === range && styles.rangeTextActive
                        ]}>
                            {range}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Contributed</Text>
                    <Text style={styles.statValue}>{formatPrice(totalContributed)}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Current</Text>
                    <Text style={styles.statValue}>{formatPrice(currentValue)}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Gain/Loss</Text>
                    <Text style={[styles.statValue, { color: lineColor }]}>
                        {isPositive ? '+' : ''}{formatPercent(returnPercent)}
                    </Text>
                </View>
            </View>

            {isPro && (
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: lineColor }]} />
                        <Text style={styles.legendText}>Your Portfolio</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.muted }]} />
                        <Text style={styles.legendText}>7% Benchmark</Text>
                    </View>
                </View>
            )}
        </View>
        </AutoTranslate>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    emptySubtitle: {
        color: theme.colors.muted,
        fontSize: 14,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    label: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    value: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: '900',
    },
    returnContainer: {
        alignItems: 'flex-end',
    },
    returnAmount: {
        fontSize: 16,
        fontWeight: '800',
    },
    returnBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginTop: 4,
    },
    returnPercent: {
        fontSize: 13,
        fontWeight: '900',
    },
    chartContainer: {
        height: CHART_HEIGHT,
        position: 'relative',
        marginBottom: 16,
    },
    chart: {
        width: CHART_WIDTH,
        height: CHART_HEIGHT,
        position: 'relative',
    },
    lineSegment: {
        position: 'absolute',
        height: 2.5,
        borderRadius: 1.25,
    },
    priceDot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: theme.colors.card,
    },
    proOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    proBadge: {
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    proText: {
        color: theme.colors.bg,
        fontSize: 16,
        fontWeight: '900',
    },
    proSubtext: {
        color: theme.colors.bg,
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
    },
    rangeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: theme.colors.bg,
        borderRadius: 12,
        padding: 4,
    },
    rangeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    rangeButtonActive: {
        backgroundColor: theme.colors.accent,
    },
    rangeText: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '800',
    },
    rangeTextActive: {
        color: theme.colors.bg,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    statValue: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '800',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '600',
    },
});
