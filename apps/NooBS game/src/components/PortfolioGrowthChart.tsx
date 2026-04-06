import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { theme } from "../constants/theme";

export function PortfolioGrowthChart({
  currentValue,
  title = "Live Market Feed",
  tickMs = 2500,
}: {
  currentValue: number;
  title?: string;
  tickMs?: number;
}) {
  const [history, setHistory] = useState<number[]>([]);
  const [displayValue, setDisplayValue] = useState(currentValue);
  const [percentChange, setPercentChange] = useState(0);
  const targetValueRef = useRef(currentValue);

  // Initialize history once based on the current value to create a realistic starting curve.
  useEffect(() => {
    if (history.length > 0) return;

    const base = currentValue > 0 ? currentValue : 1000;
    const initialPoints = Array.from({ length: 20 }, () => {
      const randomVar = (Math.random() - 0.5) * (base * 0.05);
      return base + randomVar;
    });
    initialPoints[initialPoints.length - 1] = currentValue;
    setHistory(initialPoints);
    setDisplayValue(currentValue);
  }, [currentValue, history.length]);

  useEffect(() => {
    targetValueRef.current = currentValue;
  }, [currentValue]);

  // Live drift engine.
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(prev => {
        if (prev.length === 0) return prev;

        const lastVal = prev[prev.length - 1];
        const target = targetValueRef.current || lastVal;
        const drift = (target - lastVal) * 0.06;
        const volatility = lastVal * 0.0006;
        const movement = ((Math.random() - 0.5) * volatility) + drift;

        const newVal = lastVal + movement;
        const newHistory = [...prev.slice(1), newVal];

        const start = newHistory[0];
        const end = newHistory[newHistory.length - 1];
        const pct = ((end - start) / start) * 100;

        setPercentChange(pct);
        setDisplayValue(end);

        return newHistory;
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [tickMs]);

  const chartWidth = Dimensions.get("window").width - 80;
  const chartHeight = 60;

  if (history.length === 0) return null;

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  const step = chartWidth / (history.length - 1);
  const pathData = history.reduce((acc, p, i) => {
    const x = i * step;
    const normalizedY = (p - min) / range;
    const y = chartHeight - (normalizedY * (chartHeight - 10)) - 5;
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, "");

  const areaData = pathData + ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  const isPositive = percentChange >= 0;
  const color = isPositive ? theme.colors.success : theme.colors.danger;

  return (
    <View
      style={{
        height: 170,
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 24,
        overflow: "hidden",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text
            style={{
              color: theme.colors.muted,
              fontWeight: "800",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {title} {currentValue === 0 ? "(Demo)" : ""}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "900" }}>
            ${displayValue.toFixed(2)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color, fontWeight: "900", fontSize: 14 }}>
            {isPositive ? "+" : ""}
            {percentChange.toFixed(2)}%
          </Text>
          <Text style={{ color: theme.colors.muted, fontWeight: "700", fontSize: 10 }}>SESSION (ACCEL)</Text>
        </View>
      </View>

      <View style={{ height: chartHeight + 10, marginTop: 12, alignItems: "center" }}>
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

      <View
        style={{
          width: chartWidth,
          alignSelf: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          borderTopWidth: 1,
          borderTopColor: theme.colors.border + "40",
          paddingTop: 12,
        }}
      >
        {["00", "03", "06", "09", "NOW"].map(m => (
          <Text key={m} style={{ color: theme.colors.faint, fontSize: 10, fontWeight: "900" }}>
            {m}
          </Text>
        ))}
      </View>
    </View>
  );
}
