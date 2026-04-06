import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";

export function TerminalCard({
  month,
  netWorth,
  simMultiplier,
  ruleIntegrity,
  heartbeatActive
}: {
  month: number;
  netWorth: number;
  simMultiplier: number;
  ruleIntegrity: number;
  heartbeatActive: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!heartbeatActive) {
      pulseAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [heartbeatActive]);

  const formattedNetWorth = netWorth.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.statGroup}>
          <Text style={styles.valueLarge}>{month}</Text>
          <Text style={styles.labelSmall}>MONTH</Text>
        </View>
        <View style={styles.statGroup}>
          <Text style={styles.valueLarge}>{simMultiplier.toFixed(2)}x</Text>
          <Text style={styles.labelSmall}>MULTIPLIER</Text>
        </View>
        <View style={styles.statGroup}>
          <Text style={[styles.valueLarge, { color: ruleIntegrity < 50 ? theme.colors.danger : theme.colors.success }]}>{ruleIntegrity}%</Text>
          <Text style={[styles.labelSmall, { color: ruleIntegrity < 50 ? theme.colors.danger : theme.colors.muted }]}>INTEGRITY</Text>
        </View>
      </View>

      <View style={styles.mainValueContainer}>
        <Text style={styles.totalValueLarge}>${formattedNetWorth}</Text>
        <Text style={styles.mainLabelSmall}>TOTAL INVESTING EQUITY</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.heartbeatRow}>
          <Animated.View
            style={[
              styles.heartbeat,
              {
                transform: [{ scale: pulseAnim }],
                backgroundColor: heartbeatActive ? theme.colors.accent : theme.colors.border
              }
            ]}
          />
          <Text style={styles.footerText}>SYSTEM {heartbeatActive ? "NOMINAL" : "PAUSED"}</Text>
        </View>
        <Text style={styles.footerText}>V1.4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    padding: 24,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 30
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 16
  },
  statGroup: {
    alignItems: "flex-start",
    gap: 4
  },
  labelSmall: {
    color: theme.colors.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  valueLarge: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: 'monospace',
  },
  mainValueContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4
  },
  totalValueLarge: {
    color: theme.colors.text,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -2,
  },
  mainLabelSmall: {
    color: theme.colors.faint,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  heartbeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  heartbeat: {
    width: 4,
    height: 4,
    borderRadius: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12
  },
  footerText: {
    color: theme.colors.faint,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    fontFamily: "monospace"
  }
});
