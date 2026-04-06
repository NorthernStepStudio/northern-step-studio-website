import React from "react";
import { StyleSheet, View, useWindowDimensions, Text } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from "react-native-svg";
import { theme } from "../constants/theme";

interface PortfolioChartProps {
  data: number[];
  isPro?: boolean;
}

const CHART_HEIGHT = 220;
const CHART_WIDTH_BASE = 100;

type ChartPoint = { x: number; y: number };

const getChartPoints = (values: number[], height: number) => {
  if (values.length <= 1) return { points: [] as ChartPoint[], min: 0, max: 0 };
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const paddedMin = min - range * 0.1;
  const paddedRange = range * 1.2;

  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * CHART_WIDTH_BASE;
    const y = height - ((value - paddedMin) / paddedRange) * height;
    return { x, y };
  });

  return { points, min, max };
};

const getPathFromPoints = (points: ChartPoint[], height: number, isArea: boolean = false) => {
  if (points.length <= 1) return "";
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  if (isArea) return `${linePath} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;
  return linePath;
};

// Generates a mock benchmark 7% annual growth line
const getBenchmarkData = (count: number, baseValue: number) => {
  const bench = [baseValue];
  const monthlyRate = 0.07 / 12;
  for (let i = 1; i < Math.max(count, 13); i++) {
    bench.push(Math.round(bench[i - 1] * (1 + monthlyRate)));
  }
  return bench;
};

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data, isPro = true }) => {
  const { width } = useWindowDimensions();
  const effectiveWidth = width - 48;

  const { points } = getChartPoints(data, CHART_HEIGHT);
  const linePath = getPathFromPoints(points, CHART_HEIGHT, false);
  const areaPath = getPathFromPoints(points, CHART_HEIGHT, true);
  const lastPoint = points[points.length - 1];

  const benchBase = data.length > 0 ? data[0] : 10000;
  const benchData = getBenchmarkData(data.length, benchBase);
  const { points: benchPoints } = getChartPoints(benchData, CHART_HEIGHT);
  const benchPath = getPathFromPoints(benchPoints, CHART_HEIGHT, false);

  const isUp = data.length > 1 ? data[data.length - 1] >= data[data.length - 2] : true;
  const primaryColor = isUp ? theme.colors.paper : theme.colors.danger;
  const gridLines = [0.25, 0.5, 0.75];

  return (
    <View style={styles.container}>
      <View style={styles.chartLegendOverlay}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: primaryColor }]} />
          <Text style={styles.legendText}>TOTAL EQUITY</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
          <Text style={styles.legendText}>7% BENCHMARK</Text>
        </View>
      </View>

      <Svg width={effectiveWidth} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH_BASE} ${CHART_HEIGHT}`}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={primaryColor} stopOpacity="0.15" />
            <Stop offset="1" stopColor={primaryColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* GRID */}
        {gridLines.map((line, index) => (
          <Line
            key={`grid-${index}`}
            x1="0"
            x2={CHART_WIDTH_BASE}
            y1={CHART_HEIGHT * line}
            y2={CHART_HEIGHT * line}
            stroke={theme.colors.border}
            strokeOpacity={0.25}
            strokeDasharray="3,6"
          />
        ))}

        {/* BENCHMARK LINE */}
        <Path d={benchPath} fill="none" stroke={theme.colors.border} strokeWidth={1} strokeDasharray="2,4" opacity={0.5} />

        {/* AREA FILL */}
        <Path d={areaPath} fill="url(#areaGradient)" />

        {/* PRIMARY LINE */}
        <Path d={linePath} fill="none" stroke={primaryColor} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        {lastPoint && (
          <Circle cx={lastPoint.x} cy={lastPoint.y} r={2.8} fill={primaryColor} stroke={theme.colors.bg} strokeWidth={1} />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden"
  },
  chartLegendOverlay: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 12, zIndex: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: theme.colors.faint, fontSize: 8, fontWeight: '900', letterSpacing: 1, fontFamily: "monospace" }
});
