import React from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GameState } from "../game/types";
import { theme } from "../constants/theme";
import { HoloBackground } from "../components/future/HoloBackground";
import { GlitchText } from "../components/future/GlitchText";
import { TechCard } from "../components/future/TechCard";

export function GraduationScreen({
    state,
    onRestart,
    onExit
}: {
    state: GameState;
    onRestart: () => void;
    onExit: () => void;
}) {
    const { ruleIntegrity, stats, violations } = state;
    const isPerfect = ruleIntegrity === 100 && violations.length === 0;

    return (
        <HoloBackground>
            <StatusBar style="light" />
            <View style={styles.container}>
                <Pressable onPress={onExit} style={styles.exitButton}>
                    <Text style={styles.exitButtonText}>[ MAIN MENU ]</Text>
                </Pressable>

                <View style={styles.header}>
                    <GlitchText text="SIMULATION" style={styles.headerTitle} speed={18} duration={900} />
                    <GlitchText text="SUMMARY" style={styles.headerTitle} speed={22} duration={1100} />
                    <Text style={styles.headerSub}>SESSION END // ARCHIVE SEQUENCE</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TechCard style={styles.dossierCard} delay={100}>
                        <Text style={styles.dossierLabel}>BIOMETRIC PERFORMANCE SUMMARY</Text>

                        <StatRow label="COMPLIANCE INDEX" value={`${ruleIntegrity}/100`} highlight={ruleIntegrity < 80} />
                        <StatRow label="RESTRAINT LEVEL" value={Math.floor(stats.patience).toString()} />
                        <StatRow label="DISCIPLINE LEVEL" value={Math.floor(stats.discipline).toString()} />
                        <StatRow label="CONVICTION LEVEL" value={Math.floor(stats.conviction).toString()} />

                        <View style={styles.divider} />

                        <Text style={styles.verdictBody}>
                            ANALYSIS: {isPerfect
                                ? "SUBJECT ADHERENCE IS ABSOLUTE. NEURAL STABILITY OBSERVED UNDER EXTREME VOLATILITY. ELIGIBLE FOR ADVANCED RESIDENCY."
                                : "SUBJECT SURVIVED, BUT EXHIBITED PERFORMANCE SLIPPAGE. EMOTIONAL SCARRING DETECTED IN VIOLATION LOGS. REMEDIATION RECOMMENDED."
                            }
                        </Text>
                    </TechCard>

                    <TechCard style={styles.nextCard} delay={180}>
                        <Text style={styles.nextLabel}>EVOLUTION PROTOCOL</Text>
                        <Text style={styles.nextText}>
                            VOLUME 01 TAUGHT SURVIVAL.{"\n"}
                            VOLUME 02 REQUIRES GROWTH.
                        </Text>
                    </TechCard>

                    <Pressable onPress={onRestart} style={{ width: "100%" }}>
                        {({ pressed }) => (
                            <TechCard style={[styles.primaryBtn, pressed && { opacity: 0.85 }]} delay={250}>
                                <Text style={styles.primaryBtnText}>RE-INITIALIZE SIMULATION</Text>
                            </TechCard>
                        )}
                    </Pressable>
                </ScrollView>

                <View style={styles.bottomBar}>
                    <GlitchText text="TERMINAL SESSION V1.4 // STATUS: ARCHIVED" style={styles.bottomText} speed={8} duration={1600} />
                </View>
            </View>
        </HoloBackground>
    );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, highlight && { color: theme.colors.danger }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 20,
    },
    scrollContent: {
        gap: 18,
        paddingBottom: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
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
        textAlign: "center",
    },
    exitButton: { position: "absolute", top: 6, right: 0, padding: 8 },
    exitButtonText: { color: theme.colors.faint, fontSize: 10, fontWeight: "900", fontFamily: "monospace", letterSpacing: 1 },
    dossierCard: {
        padding: 18,
    },
    dossierLabel: {
        color: theme.colors.faint,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 24,
        fontFamily: "monospace"
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16
    },
    statLabel: {
        color: theme.colors.muted,
        fontWeight: "800",
        fontSize: 12,
        fontFamily: "monospace"
    },
    statValue: {
        color: theme.colors.text,
        fontWeight: "900",
        fontSize: 18,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 24
    },
    verdictBody: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 22,
    },
    nextCard: {
        padding: 18,
    },
    nextLabel: {
        color: theme.colors.faint,
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 12,
        fontFamily: "monospace"
    },
    nextText: {
        color: theme.colors.muted,
        fontSize: 16,
        fontWeight: "800",
        lineHeight: 26,
    },
    primaryBtn: { paddingVertical: 16, alignItems: "center" },
    primaryBtnText: {
        color: theme.colors.text,
        fontWeight: "900",
        fontSize: 14,
        letterSpacing: 2,
    },
    bottomBar: {
        marginTop: "auto",
        alignItems: "center",
        paddingTop: 12,
    },
    bottomText: {
        color: theme.colors.faint,
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 1,
        fontFamily: "monospace"
    }
});
