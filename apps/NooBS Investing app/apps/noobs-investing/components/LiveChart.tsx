import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import {
    generateHistoricalPrices,
    formatPrice,
    formatPercent,
    TimeRange,
    ChartData
} from '../utils/chartSimulator';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated';
import { useLivePrice, useLiveTickerHistory } from '../utils/liveTicker';
import { AutoTranslate } from './AutoTranslate';

interface LiveChartProps {
    symbol: string;
    initialPrice: number;
    assetName: string;
    isPro?: boolean;
}

const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
const CHART_WIDTH = Dimensions.get('window').width - 48;
const CHART_HEIGHT = 180;

export function LiveChart({ symbol, initialPrice, assetName, isPro = false }: LiveChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const priceScale = useSharedValue(1);
    const tickerOpacity = useSharedValue(1);

    // Use live ticker history for 1D view if Pro
    const liveHistory = useLiveTickerHistory(initialPrice, 50, 3000);
    const livePrice = useLivePrice(initialPrice, 2000);

    // Generate chart data when range changes
    useEffect(() => {
        const data = generateHistoricalPrices(symbol, initialPrice, timeRange);
        setChartData(data);
    }, [symbol, initialPrice, timeRange]);

    // Calculate chart path
    const chartPath = useMemo(() => {
        if (isPro && timeRange === '1D') {
            // Real-time chart path
            const minPrice = Math.min(...liveHistory);
            const maxPrice = Math.max(...liveHistory);
            const priceRange = maxPrice - minPrice || 1;

            return liveHistory.map((price, index) => ({
                x: (index / (liveHistory.length - 1)) * CHART_WIDTH,
                y: CHART_HEIGHT - ((price - minPrice) / priceRange) * CHART_HEIGHT
            }));
        }

        if (!chartData || chartData.prices.length < 2) return null;

        const prices = chartData.prices.map(p => p.close);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1;

        return prices.map((price, index) => ({
            x: (index / (prices.length - 1)) * CHART_WIDTH,
            y: CHART_HEIGHT - ((price - minPrice) / priceRange) * CHART_HEIGHT
        }));
    }, [chartData, liveHistory, isPro, timeRange]);

    // Effect for ticker flash
    useEffect(() => {
        if (!isPro) return;
        tickerOpacity.value = 0.5;
        tickerOpacity.value = withTiming(1, { duration: 300 });
    }, [livePrice, isPro]);

    const isPositive = chartData ? chartData.priceChangePercent >= 0 : true;
    const lineColor = isPositive ? theme.colors.success : theme.colors.danger;

    const tickerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: tickerOpacity.value,
        transform: [{ scale: priceScale.value }]
    }));

    return (
        <AutoTranslate>
        <View style={styles.container}>
            {/* Price Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.symbolText}>{symbol}</Text>
                    <Text style={styles.nameText}>{assetName}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Animated.Text style={[styles.priceText, tickerAnimatedStyle]}>
                        {formatPrice(livePrice)}
                    </Animated.Text>
                    {chartData && (
                        <View style={[styles.changeContainer, { backgroundColor: lineColor + '20' }]}>
                            <Text style={[styles.changeText, { color: lineColor }]}>
                                {formatPercent(chartData.priceChangePercent)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Chart Area */}
            <View style={styles.chartContainer}>
                {chartPath && chartPath.length > 1 && (
                    <View style={styles.chart}>
                        {/* Simple line chart using Views */}
                        {chartPath.map((point, index) => {
                            if (index === 0) return null;
                            const prevPoint = chartPath[index - 1];

                            // Calculate line segment
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

                        {/* Current price dot */}
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

                        {/* Gradient fill area - simplified */}
                        <View style={[styles.gradientFill, { borderTopColor: lineColor + '30' }]} />
                    </View>
                )}

                {/* Pro badge overlay if not pro */}
                {!isPro && (
                    <View style={styles.proOverlay}>
                        <View style={styles.proBadge}>
                            <Text style={styles.proText}>🔒 PRO</Text>
                            <Text style={styles.proSubtext}>Live updates</Text>
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

            {/* Chart Info */}
            {chartData && (
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Open</Text>
                        <Text style={styles.infoValue}>{formatPrice(chartData.prices[0]?.open || 0)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>High</Text>
                        <Text style={styles.infoValue}>
                            {formatPrice(Math.max(...chartData.prices.map(p => p.high)))}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Low</Text>
                        <Text style={styles.infoValue}>
                            {formatPrice(Math.min(...chartData.prices.map(p => p.low)))}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Change</Text>
                        <Text style={[styles.infoValue, { color: lineColor }]}>
                            {formatPercent(chartData.priceChangePercent)}
                        </Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    symbolText: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: '900',
    },
    nameText: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: '600',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceText: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: '900',
    },
    changeContainer: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    changeText: {
        fontSize: 14,
        fontWeight: '800',
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
        height: 2,
        borderRadius: 1,
    },
    priceDot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: theme.colors.card,
    },
    gradientFill: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        borderTopWidth: 20,
        opacity: 0.2,
    },
    proOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        alignItems: 'center',
    },
    infoLabel: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    infoValue: {
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '700',
    },
});
