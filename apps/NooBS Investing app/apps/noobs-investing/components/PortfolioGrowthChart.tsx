import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AutoTranslate } from './AutoTranslate';

export function PortfolioGrowthChart({ currentValue }: { currentValue: number }) {
    const [history, setHistory] = useState<number[]>([]);
    const [displayValue, setDisplayValue] = useState(currentValue);
    const [percentChange, setPercentChange] = useState(0);

    // Initialize history once based on the current value to create a realistic starting curve
    useEffect(() => {
        if (history.length > 0) return; // Don't reset if we already have a history

        const base = currentValue > 0 ? currentValue : 1000;
        const initialPoints = Array.from({ length: 20 }, (_, i) => {
            const randomVar = (Math.random() - 0.5) * (base * 0.05);
            return base + randomVar;
        });
        initialPoints[initialPoints.length - 1] = currentValue;
        setHistory(initialPoints);
        setDisplayValue(currentValue);
    }, [currentValue]);

    // Track the target value for the drift effect
    const targetValueRef = useRef(currentValue);
    useEffect(() => {
        targetValueRef.current = currentValue;
    }, [currentValue]);

    // The "Time Accelerator" Engine
    useEffect(() => {
        const interval = setInterval(() => {
            setHistory(prev => {
                if (prev.length === 0) return prev;

                // Create a "Live" effect by shifting the array
                // We drop the oldest point and add a new "future" point that becomes "now"
                const lastVal = prev[prev.length - 1];
                const target = targetValueRef.current || lastVal;

                // Drift towards target (10% closure per tick) + random noise
                const drift = (target - lastVal) * 0.1;
                const volatility = lastVal * 0.001;
                const movement = ((Math.random() - 0.5) * volatility) + drift;

                let newVal = lastVal + movement;
                const newHistory = [...prev.slice(1), newVal];

                // Update display stats live
                // Calculate "Daily" change (first vs last point in our window)
                const start = newHistory[0];
                const end = newHistory[newHistory.length - 1];
                const pct = ((end - start) / start) * 100;

                setPercentChange(pct);
                setDisplayValue(end);

                return newHistory;
            });
        }, 1000); // Increased to 1s

        return () => clearInterval(interval);
    }, []);

    const chartWidth = Dimensions.get('window').width - 80;
    const chartHeight = 80;

    if (history.length === 0) return null;

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1; // Avoid divide by zero

    // Create path string
    const step = chartWidth / (history.length - 1);
    const pathData = history.reduce((acc, p, i) => {
        const x = i * step;
        // Normalize to height (adding some padding so it doesn't touch edges)
        const normalizedY = ((p - min) / range);
        const y = chartHeight - (normalizedY * (chartHeight - 10)) - 5;
        return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, "");

    const areaData = pathData + ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
    const isPositive = percentChange >= 0;
    const color = isPositive ? theme.colors.success : theme.colors.danger;

    return (
        <AutoTranslate>
            <View style={{
                height: 200,
                backgroundColor: theme.colors.card,
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: 24,
                overflow: 'hidden',
                justifyContent: 'space-between'
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ color: theme.colors.muted, fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Live Market Sim {currentValue === 0 ? '(Demo)' : ''}
                        </Text>
                        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                            ${displayValue.toFixed(2)}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: color, fontWeight: '900', fontSize: 14, fontVariant: ['tabular-nums'] }}>
                            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                        </Text>
                        <Text style={{ color: theme.colors.muted, fontWeight: '700', fontSize: 10 }}>TODAY (ACCELERATED)</Text>
                    </View>
                </View>

                <View style={{ height: chartHeight + 10, marginTop: 12 }}>
                    <Svg height={chartHeight + 10} width={chartWidth}>
                        <Defs>
                            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                                <Stop offset="1" stopColor={color} stopOpacity="0" />
                            </LinearGradient>
                        </Defs>
                        <Path d={areaData} fill="url(#grad)" />
                        <Path d={pathData} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.border + '40', paddingTop: 12 }}>
                    {['9:30 AM', '11:00 AM', '1:00 PM', '3:00 PM', 'NOW'].map(m => (
                        <Text key={m} style={{ color: theme.colors.faint, fontSize: 10, fontWeight: '900' }}>{m}</Text>
                    ))}
                </View>
            </View>
        </AutoTranslate>
    );
}
