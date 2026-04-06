import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import { HoloBackground } from "../components/future/HoloBackground";
import { GlitchText } from "../components/future/GlitchText";
import { TechCard } from "../components/future/TechCard";

export function ColdOpenScreen({
    onBegin,
    onWhatIsThis,
    onExit,
    onBack
}: {
    onBegin: () => void;
    onWhatIsThis: () => void;
    onExit: () => void;
    onBack: () => void;
}) {
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
                    <GlitchText text="ENROLLMENT" style={styles.headerTitle} speed={20} duration={900} />
                    <GlitchText text="PROTOCOL" style={styles.headerTitle} speed={24} duration={1100} />
                    <View style={styles.headerMeta}>
                        <Text style={styles.headerSub}>SIMULATION ENTRY // FINAL CHECK</Text>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepText}>STEP 3 / 3</Text>
                        </View>
                    </View>
                </View>

                <TechCard style={styles.statsCard} delay={100}>
                    <View style={styles.statsRow}>
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>STRATEGY WEIGHT</Text>
                            <Text style={styles.statValue}>10%</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>PSYCH WEIGHT</Text>
                            <Text style={[styles.statValue, { color: theme.colors.accent }]}>90%</Text>
                        </View>
                    </View>
                </TechCard>

                <TechCard style={styles.bodyCard} delay={150}>
                    <Text style={styles.bodyText}>
                        YOU ARE ENTERING A HIGH-STRESS PSYCHOLOGICAL SIMULATION.{"\n\n"}
                        THE GOAL IS NOT PROFIT.{"\n"}
                        <Text style={styles.bodyTextStrong}>THE GOAL IS BEHAVIORAL STABILITY.</Text>
                    </Text>
                </TechCard>

                <View style={styles.footer}>
                    <Pressable onPress={onBegin} style={{ width: "100%" }}>
                        {({ pressed }) => (
                            <TechCard style={[styles.primaryButton, pressed && { opacity: 0.85 }]} delay={250}>
                                <Text style={styles.primaryButtonText}>INITIATE SIMULATION</Text>
                            </TechCard>
                        )}
                    </Pressable>

                    <Pressable onPress={onWhatIsThis} style={{ width: "100%" }}>
                        {({ pressed }) => (
                            <TechCard style={[styles.secondaryButton, pressed && { opacity: 0.85 }]} delay={350}>
                                <Text style={styles.secondaryButtonText}>PROGRAM DETAILS</Text>
                            </TechCard>
                        )}
                    </Pressable>

                    <View style={styles.bottomBar}>
                        <Text style={styles.bottomText}>NOOBS SYSTEMS (C) 2026. ALL DATA LOGGED.</Text>
                    </View>
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
    headerMeta: {
        marginTop: 12,
        alignItems: "center",
        gap: 8,
    },
    headerSub: {
        color: theme.colors.accent,
        fontFamily: "monospace",
        fontSize: 11,
        letterSpacing: 2,
        textAlign: "center",
    },
    stepPill: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.card,
    },
    stepText: {
        color: theme.colors.faint,
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 1.5,
        fontFamily: "monospace",
    },
    statsCard: {
        padding: 12,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    statBlock: {
        flex: 1,
        alignItems: "center",
    },
    statLabel: {
        color: theme.colors.faint,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1.5,
        fontFamily: "monospace",
    },
    statValue: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: "900",
        marginTop: 6,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: theme.colors.border,
    },
    bodyCard: {
        padding: 16,
    },
    bodyText: {
        color: theme.colors.faint,
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 22,
        letterSpacing: -0.2,
    },
    bodyTextStrong: {
        color: theme.colors.text,
        fontWeight: "900",
    },
    footer: {
        marginTop: 24,
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
    secondaryButton: {
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: theme.colors.card,
    },
    secondaryButtonText: {
        color: theme.colors.faint,
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 1.5,
        fontFamily: "monospace",
    },
    bottomBar: {
        paddingTop: 16,
        alignItems: "center",
        opacity: 0.8,
    },
    bottomText: {
        color: theme.colors.faint,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1.5,
        fontFamily: "monospace",
        textAlign: "center",
    },
});
