import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';

export default function PriceHistory({ data }) {
    const { theme } = useTheme();

    // Placeholder data if none provided
    const historyData = data || [
        { date: 'Jan', price: 299 },
        { date: 'Feb', price: 289 },
        { date: 'Mar', price: 279 },
        { date: 'Apr', price: 310 },
        { date: 'May', price: 299 },
    ];

    const maxPrice = Math.max(...historyData.map(d => d.price));
    const minPrice = Math.min(...historyData.map(d => d.price));
    const range = maxPrice - minPrice || 1;

    return (
        <GlassCard style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Price History (6 Months)</Text>
            <View style={styles.chartContainer}>
                {historyData.map((item, index) => {
                    // Simple logic to determine bar height relative to max price
                    // This is a very basic visual representation
                    const heightPercentage = ((item.price - (minPrice * 0.8)) / (maxPrice - (minPrice * 0.8))) * 100;

                    return (
                        <View key={index} style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: `${Math.max(10, heightPercentage)}%`,
                                        backgroundColor: theme.colors.accentPrimary
                                    }
                                ]}
                            />
                            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{item.date}</Text>
                            <Text style={[styles.price, { color: theme.colors.textPrimary }]}>${item.price}</Text>
                        </View>
                    );
                })}
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginVertical: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 150,
        paddingBottom: 20,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
    },
    price: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4, // Price above or below label? Let's put it on top of label? 
        // Actually, simple bar chart is easier if price is top of visual? 
        // Let's keep it clean.
        position: 'absolute',
        top: -20, // Floating price
    }
});
