import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../constants/theme';
import { AutoTranslate } from './AutoTranslate';

interface GrowthChartProps {
    contributionAmount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    template: 'conservative' | 'balanced' | 'aggressive';
}

export function GrowthChart({ contributionAmount, frequency, template }: GrowthChartProps) {
    const annualContribution = frequency === 'weekly'
        ? contributionAmount * 52
        : frequency === 'biweekly'
            ? contributionAmount * 26
            : contributionAmount * 12;

    const rates = {
        conservative: 0.04,
        balanced: 0.07,
        aggressive: 0.10,
    };

    const rate = rates[template];

    const calculateFutureValue = (years: number) => {
        let totalVal = 0;
        let totalContributed = 0;

        for (let i = 0; i < years; i++) {
            totalContributed += annualContribution;
            totalVal = (totalVal + annualContribution) * (1 + rate);
        }

        return { totalVal, totalContributed };
    };

    // Shortened horizons for immediate "wins"
    const projections = [
        { label: '1Y', ...calculateFutureValue(1) },
        { label: '3Y', ...calculateFutureValue(3) },
        { label: '5Y', ...calculateFutureValue(5) },
    ];

    const maxVal = projections[2].totalVal;
    const chartHeight = 120; // Reduced height to prevent overshadowing

    return (
        <AutoTranslate>
            <View style={{
                padding: 20,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginTop: 12
            }}>
                <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 11, marginBottom: 16 }}>
                    Growth: The Early Wins
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: chartHeight + 20, marginBottom: 16 }}>
                    {projections.map((p) => {
                        // Min height of 4px so 1Y isn't invisible
                        const growthHeight = Math.max(4, (p.totalVal / maxVal) * chartHeight);
                        const contribHeight = Math.max(2, (p.totalContributed / maxVal) * chartHeight);
                        const growthOnlyHeight = Math.max(0, growthHeight - contribHeight);

                        return (
                            <View key={p.label} style={{ alignItems: 'center', width: 60 }}>
                                <View style={{ width: 24, height: chartHeight, justifyContent: 'flex-end', backgroundColor: theme.colors.bg, borderRadius: 6, overflow: 'hidden' }}>
                                    {/* Growth Segment */}
                                    <View style={{ height: growthOnlyHeight, backgroundColor: theme.colors.accent, opacity: 0.6 }} />
                                    {/* Contribution Segment */}
                                    <View style={{ height: contribHeight, backgroundColor: theme.colors.accent }} />
                                </View>
                                <Text style={{ color: theme.colors.text, fontWeight: '900', marginTop: 8, fontSize: 12 }}>{p.label}</Text>
                                <Text style={{ color: theme.colors.accent, fontWeight: '800', fontSize: 10 }}>${(p.totalVal).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.accent }} />
                        <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: '600' }}>Your Cash</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.accent, opacity: 0.6 }} />
                        <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: '600' }}>Market Bonus</Text>
                    </View>
                </View>

                <View style={{ marginTop: 12, padding: 10, backgroundColor: theme.colors.bg, borderRadius: 12 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontStyle: 'italic', lineHeight: 18 }}>
                        "Every dollar you put in now is a soldier working for you later. Even after 1 year, you're ahead of where you started."
                    </Text>
                </View>
            </View>
        </AutoTranslate>
    );
}
