import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import { HoloBackground } from "../components/future/HoloBackground";
import { GlitchText } from "../components/future/GlitchText";
import { TechCard } from "../components/future/TechCard";

type ProgramDetailsScreenProps = {
  onBack: () => void;
  onExit: () => void;
};

const SECTIONS = [
  {
    title: "WHAT THIS IS",
    body:
      "Market Simulator is a behavioral investing game. The system is designed to test your decision-making under pressure, not your ability to pick stocks.",
  },
  {
    title: "WIN CONDITION",
    body:
      "Reach your freedom target ($500,000) by surviving volatility, following protocols, and compounding consistently across 12 simulated months.",
  },
  {
    title: "STARTING CAPITAL",
    body:
      "Your opening capital is calculated from your chosen job: 6-8 months of savings based on your wage. That total starts as liquid cash.",
  },
  {
    title: "TIME & PROGRESSION",
    bullets: [
      "Months tick automatically on a short interval.",
      "Each month applies income, market returns, and any penalties.",
      "Time scale can be adjusted in Settings (4 days / 1 week / 1 month).",
      "Major events trigger decision moments that pause the flow.",
    ],
  },
  {
    title: "MARKET EVENTS",
    bullets: [
      "Corrections and crashes are scripted to test discipline.",
      "Events open a decision modal with multiple responses.",
      "Your choices shape stats, violations, and future outcomes.",
    ],
  },
  {
    title: "TRADING HOURS",
    body:
      "Stocks and ETFs trade during market hours. Crypto trades 24/7. Limit orders can wait until your price is hit.",
  },
  {
    title: "STATS & CONSEQUENCES",
    bullets: [
      "Patience, Discipline, and Conviction shift with actions.",
      "Rule Integrity drops when you violate protocols.",
      "Violations are logged and trigger guilt feedback.",
    ],
  },
  {
    title: "RULES",
    bullets: [
      "Pick at least 3 protocols before the simulation begins.",
      "Breaking rules has lasting impact on your profile.",
      "Consistency is rewarded more than short-term gains.",
    ],
  },
  {
    title: "SAVES & RESUME",
    body:
      "Your session auto-saves. You can resume from the main menu at any time.",
  },
];

export function ProgramDetailsScreen({ onBack, onExit }: ProgramDetailsScreenProps) {
  return (
    <HoloBackground>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>[ BACK ]</Text>
        </Pressable>
        <Pressable onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>[ MAIN MENU ]</Text>
        </Pressable>

        <View style={styles.header}>
          <GlitchText text="PROGRAM" style={styles.headerTitle} speed={18} duration={900} />
          <GlitchText text="DETAILS" style={styles.headerTitle} speed={22} duration={1100} />
          <Text style={styles.headerSub}>SIMULATION BRIEFING</Text>
        </View>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {SECTIONS.map(section => (
            <TechCard key={section.title} style={styles.sectionCard} delay={100}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.body && <Text style={styles.sectionBody}>{section.body}</Text>}
              {section.bullets && (
                <View style={styles.bulletList}>
                  {section.bullets.map(bullet => (
                    <View key={bullet} style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>-</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TechCard>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={onBack} style={{ width: "100%" }}>
            {({ pressed }) => (
              <TechCard style={[styles.primaryButton, pressed && { opacity: 0.85 }]} delay={250}>
                <Text style={styles.primaryButtonText}>BACK TO ENROLLMENT</Text>
              </TechCard>
            )}
          </Pressable>
        </View>
      </View>
    </HoloBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    position: "absolute",
    top: 6,
    left: 0,
    padding: 8,
    zIndex: 5,
  },
  backButtonText: {
    color: theme.colors.faint,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  exitButton: {
    position: "absolute",
    top: 6,
    right: 0,
    padding: 8,
    zIndex: 5,
  },
  exitButtonText: {
    color: theme.colors.faint,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 38,
  },
  headerSub: {
    marginTop: 10,
    color: theme.colors.accent,
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2,
  },
  list: {
    gap: 14,
    paddingBottom: 20,
  },
  sectionCard: {
    padding: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontFamily: "monospace",
    marginBottom: 6,
  },
  sectionBody: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  bulletList: {
    marginTop: 6,
    gap: 6,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
  },
  bulletDot: {
    color: theme.colors.accent,
    fontSize: 12,
    lineHeight: 18,
  },
  bulletText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    flex: 1,
  },
  footer: {
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 2,
  },
});
