import React from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { Decision, MarketEvent } from "../game/types";
import { theme } from "../constants/theme";

export function EventModal({
  visible,
  event,
  onChoose
}: {
  visible: boolean;
  event: MarketEvent | null;
  onChoose: (d: Decision) => void;
}) {
  if (!event) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerCode}>URGENT COMMUNIQUE: V1.4</Text>
            <Text style={styles.headerTitle}>{event.title.toUpperCase()}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.body}>{event.body}</Text>

          <View style={styles.impactLegend}>
            <Text style={styles.legendText}>POTENTIAL IMPACT:</Text>
            <View style={styles.dotsRow}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: theme.colors.accent,
                      opacity: i <= event.impactMagnitude ? 1 : 0.2
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.actionContainer}>
            <DecisionButton label="HOLD" onPress={() => onChoose("HOLD")} variant="neutral" />
            <DecisionButton label="REBALANCE" onPress={() => onChoose("REBALANCE")} variant="accent" />
            <View style={styles.secondaryActions}>
              <DecisionButton label="BUY DIP" onPress={() => onChoose("BUY_DIP")} variant="info" small />
              <DecisionButton label="TRIM 10%" onPress={() => onChoose("TACTICAL_TRIM")} variant="neutral" small />
            </View>
            <DecisionButton label="SELL ALL" onPress={() => onChoose("SELL")} variant="danger" />
          </View>

          <Text style={styles.footerNote}>ALL DECISIONS ARE RECORDED IN PERMANENT FILE.</Text>
        </View>
      </View>
    </Modal>
  );
}

function DecisionButton({
  label,
  onPress,
  variant,
  small
}: {
  label: string;
  onPress: () => void;
  variant: "neutral" | "accent" | "danger" | "info";
  small?: boolean;
}) {
  const stylesByVariant = {
    neutral: { bg: theme.colors.card, border: theme.colors.border, fg: theme.colors.faint },
    accent: { bg: theme.colors.bg, border: theme.colors.accent, fg: theme.colors.accent },
    danger: { bg: theme.colors.bg, border: theme.colors.danger, fg: theme.colors.danger },
    info: { bg: theme.colors.bg, border: theme.colors.paper, fg: theme.colors.paper }
  } as const;

  const s = stylesByVariant[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && { flex: 1, paddingVertical: 14 },
        {
          backgroundColor: s.bg,
          borderColor: s.border,
          opacity: pressed ? 0.7 : 1
        }
      ]}
    >
      <Text style={[styles.btnText, { color: s.fg, fontSize: small ? 11 : 13 }]}>{label.replace('_', ' ')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    padding: 24
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12
  },
  headerTitle: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2
  },
  headerCode: {
    color: theme.colors.faint,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace"
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: -1
  },
  body: {
    color: theme.colors.faint,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "700"
  },
  impactLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 8
  },
  legendText: {
    color: theme.colors.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1
  },
  dotsRow: {
    flexDirection: "row",
    gap: 4
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  actionContainer: {
    gap: 12
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: "center"
  },
  btnText: {
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 2
  },
  footerNote: {
    color: theme.colors.faint,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 32,
    textAlign: "center",
    letterSpacing: 1,
    opacity: 0.5
  }
});
