import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import { Job } from "../game/types";
import { HoloBackground } from "../components/future/HoloBackground";
import { GlitchText } from "../components/future/GlitchText";
import { TechCard } from "../components/future/TechCard";

const JOBS: Job[] = [
    {
        id: "barista",
        title: "ESPRESSO TECHNICIAN",
        hourlyWage: 16.5,
        payFrequency: "WEEKLY",
        description: "High caffeine tolerance required. Tips are volatile.",
        stressLevel: "HIGH",
    },
    {
        id: "warehouse",
        title: "LOGISTICS OPERATIVE",
        hourlyWage: 21.0,
        payFrequency: "BI_WEEKLY",
        description: "Heavy lifting. Zero customer interaction. Pure efficiency.",
        stressLevel: "MEDIUM",
    },
    {
        id: "data_entry",
        title: "DATA CLERK",
        hourlyWage: 18.25,
        payFrequency: "BI_WEEKLY",
        description: "Repetitive inputs. Eye strain imminent. Stable environment.",
        stressLevel: "LOW",
    },
    {
        id: "driver",
        title: "GIG MOBILITY UNIT",
        hourlyWage: 24.0,
        payFrequency: "WEEKLY",
        description: "Your car is your office. Income fluctuates with demand.",
        stressLevel: "HIGH",
    },
    {
        id: "line_cook",
        title: "LINE CHEF IV",
        hourlyWage: 19.5,
        payFrequency: "MONTHLY",
        description: "Heat, noise, and pressure. The kitchen does not forgive.",
        stressLevel: "HIGH",
    },
];

type JobSelectionScreenProps = {
    onSelectJob: (job: Job, startingCash: number, expenses: number, emergencyFund: "NONE" | "PARTIAL" | "FULL") => void;
    onExit: () => void;
    onBack: () => void;
};

export function JobSelectionScreen({ onSelectJob, onExit, onBack }: JobSelectionScreenProps) {
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [monthlyExpenses, setMonthlyExpenses] = useState("3000");
    const [emergencyFund, setEmergencyFund] = useState<"NONE" | "PARTIAL" | "FULL">("NONE");

    const handleAccept = () => {
        const job = JOBS.find(j => j.id === selectedJobId);
        const expenses = Number(monthlyExpenses) || 3000;
        if (job) {
            // Calculate starting cash: 6-8 months of savings (assuming 15% save rate)
            const monthlyGross = job.hourlyWage * 160;
            const savingsMonths = 6 + Math.floor(Math.random() * 3);

            // Adjust save rate based on expenses
            const netMonthly = monthlyGross - expenses;
            const effectiveStartingCash = Math.max(0, netMonthly * savingsMonths);

            // Further adjust based on Emergency Fund status
            let startingCash = effectiveStartingCash;
            if (emergencyFund === "NONE") startingCash *= 0.5;
            if (emergencyFund === "PARTIAL") startingCash *= 0.8;

            onSelectJob(job, Math.floor(startingCash), expenses, emergencyFund);
        }
    };

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
                    <GlitchText text="CAREER" style={styles.headerTitle} speed={20} duration={900} />
                    <GlitchText text="INITIALIZATION" style={styles.headerTitle} speed={24} duration={1100} />
                    <View style={styles.headerMeta}>
                        <Text style={styles.headerSub}>SELECT YOUR INCOME SOURCE</Text>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepText}>STEP 1 / 3</Text>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                    <TechCard style={styles.onboardingCard} delay={50}>
                        <Text style={styles.onboardingTitle}>FINANCIAL PROFILE</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>MONTHLY EXPENSES ($)</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    value={monthlyExpenses}
                                    onChangeText={setMonthlyExpenses}
                                    keyboardType="numeric"
                                    style={styles.textInput}
                                    placeholder="3000"
                                    placeholderTextColor={theme.colors.faint}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>EMERGENCY FUND STATUS</Text>
                            <View style={styles.toggleGroup}>
                                {(["NONE", "PARTIAL", "FULL"] as const).map((status) => (
                                    <Pressable
                                        key={status}
                                        onPress={() => setEmergencyFund(status)}
                                        style={[
                                            styles.toggleBtn,
                                            emergencyFund === status && styles.toggleBtnActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.toggleBtnText,
                                            emergencyFund === status && styles.toggleBtnTextActive
                                        ]}>{status}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </TechCard>

                    {JOBS.map(job => {
                        const isSelected = selectedJobId === job.id;
                        const monthly = job.hourlyWage * 160;

                        return (
                            <Pressable
                                key={job.id}
                                onPress={() => setSelectedJobId(job.id)}
                                style={({ pressed }) => [
                                    styles.card,
                                    isSelected && styles.cardSelected,
                                    pressed && styles.cardPressed,
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.jobTitle, isSelected && styles.textSelected]}>{job.title}</Text>
                                    <View style={[styles.badge, isSelected ? styles.badgeSelected : styles.badgeNormal]}>
                                        <Text style={[styles.badgeText, isSelected && styles.textSelected]}>
                                            ${job.hourlyWage.toFixed(2)}/HR
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.description}>{job.description}</Text>

                                <View style={styles.statsRow}>
                                    <Text style={styles.statLabel}>PAY: {job.payFrequency.replace("_", " ")}</Text>
                                    <Text style={styles.statLabel}>EST. MO: ${monthly.toFixed(0)}</Text>
                                    <Text style={[styles.statLabel, { color: getStressColor(job.stressLevel) }]}>STRESS: {job.stressLevel}</Text>
                                </View>

                                {isSelected && (
                                    <Text style={styles.selectedText}>SELECTED</Text>
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <View style={styles.footer}>
                    <TechCard style={styles.infoCard} delay={100}>
                        <Text style={styles.infoText}>
                            Starting capital is calculated from 6-8 months of savings in this role.
                        </Text>
                    </TechCard>

                    <Pressable onPress={handleAccept} disabled={!selectedJobId} style={{ width: "100%" }}>
                        {({ pressed }) => (
                            <TechCard
                                style={[
                                    styles.buttonCard,
                                    !selectedJobId && styles.buttonCardDisabled,
                                    pressed && selectedJobId && { opacity: 0.85 },
                                ]}
                                delay={250}
                            >
                                <Text style={[styles.buttonText, !selectedJobId && styles.textDisabled]}>
                                    {selectedJobId ? "CONFIRM CAREER" : "AWAITING SELECTION"}
                                </Text>
                            </TechCard>
                        )}
                    </Pressable>
                </View>
            </View>
        </HoloBackground>
    );
}

function getStressColor(level: string) {
    if (level === "HIGH") return theme.colors.danger;
    if (level === "MEDIUM") return theme.colors.input;
    return theme.colors.success;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
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
    list: {
        gap: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 20,
        borderRadius: 2,
    },
    cardSelected: {
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.accent + "12",
    },
    cardPressed: {
        opacity: 0.9,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    jobTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: "900",
        flex: 1,
        letterSpacing: -0.5,
    },
    textSelected: {
        color: theme.colors.accent,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
        borderWidth: 1,
    },
    badgeNormal: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.bg,
    },
    badgeSelected: {
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.bg,
    },
    badgeText: {
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: "900",
    },
    description: {
        color: theme.colors.muted,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "500",
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: 12,
    },
    statLabel: {
        color: theme.colors.faint,
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "700",
    },
    selectedText: {
        marginTop: 10,
        color: theme.colors.accent,
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 1.5,
        fontFamily: "monospace",
    },
    footer: {
        gap: 16,
        paddingBottom: 12,
    },
    infoCard: {
        padding: 8,
    },
    infoText: {
        color: theme.colors.muted,
        fontSize: 10,
        fontFamily: "monospace",
    },
    buttonCard: {
        paddingVertical: 16,
        alignItems: "center",
    },
    buttonCardDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: theme.colors.text,
        fontWeight: "900",
        fontSize: 14,
        letterSpacing: 1,
    },
    textDisabled: {
        color: theme.colors.faint,
    },
    onboardingCard: {
        padding: 20,
        marginBottom: 8,
    },
    onboardingTitle: {
        color: theme.colors.accent,
        fontFamily: "monospace",
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: theme.colors.faint,
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "700",
        marginBottom: 8,
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    textInput: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "monospace",
    },
    toggleGroup: {
        flexDirection: "row",
        gap: 8,
    },
    toggleBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 8,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    toggleBtnActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    toggleBtnText: {
        color: theme.colors.muted,
        fontSize: 10,
        fontWeight: "900",
        fontFamily: "monospace",
    },
    toggleBtnTextActive: {
        color: theme.colors.bg,
    },
});
