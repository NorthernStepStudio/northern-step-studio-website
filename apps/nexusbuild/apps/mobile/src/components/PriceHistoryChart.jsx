import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';

const PriceHistoryChart = ({ price, history = [] }) => {
    const { theme } = useTheme();

    // Generate mock history if none provided
    // 6 months of data
    const data = history.length > 0 ? history : [
        { month: 'Jul', price: price * 1.1 },
        { month: 'Aug', price: price * 1.05 },
        { month: 'Sep', price: price * 1.02 },
        { month: 'Oct', price: price * 0.98 },
        { month: 'Nov', price: price * 1.05 },
        { month: 'Dec', price: price },
    ];

    const maxPrice = Math.max(...data.map(d => d.price)) * 1.1;
    const minPrice = Math.min(...data.map(d => d.price)) * 0.9;
    const range = maxPrice - minPrice;

    return (
        <GlassCard style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Price History (6 Months)</Text>

            <View style={styles.chartArea}>
                {/* Y-Axis Labels (Simplified) */}
                <View style={styles.yAxis}>
                    <Text style={[styles.axisLabel, { color: theme.colors.textMuted }]}>${Math.round(maxPrice)}</Text>
                    <Text style={[styles.axisLabel, { color: theme.colors.textMuted }]}>${Math.round(minPrice)}</Text>
                </View>

                {/* Bars */}
                <View style={styles.barsContainer}>
                    {data.map((item, index) => {
                        const heightPercent = ((item.price - minPrice) / range) * 100;
                        return (
                            <View key={index} style={styles.barWrapper}>
                                <View style={styles.barTrack}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${Math.max(heightPercent, 5)}%`, // Min height 5%
                                                backgroundColor: index === data.length - 1 ? theme.colors.success : theme.colors.accentPrimary
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.axisLabel, { color: theme.colors.textSecondary }]}>{item.month}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <Text style={[styles.insight, { color: theme.colors.textMuted }]}>
                Current price is {data[5].price < data[0].price ? 'lower' : 'higher'} than 6 months ago.
            </Text>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        marginVertical: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    chartArea: {
        flexDirection: 'row',
        height: 150,
        alignItems: 'flex-end',
    },
    yAxis: {
        justifyContent: 'space-between',
        height: '100%',
        paddingRight: 10,
        paddingBottom: 20, // Align with bars base
    },
    axisLabel: {
        fontSize: 10,
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '100%',
        alignItems: 'flex-end',
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    barTrack: {
        height: '85%', // Reserve space for x-axis labels
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 5,
    },
    bar: {
        width: 12,
        borderRadius: 6,
        opacity: 0.8,
    },
    insight: {
        fontSize: 12,
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    }
});

export default PriceHistoryChart;
