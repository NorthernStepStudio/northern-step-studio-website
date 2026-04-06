import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import { Rule } from "../game/types";
import { AVAILABLE_RULES } from "../game/rules";
import { HoloBackground } from "../components/future/HoloBackground";
import { GlitchText } from "../components/future/GlitchText";
import { TechCard } from "../components/future/TechCard";


type RuleSelectionScreenProps = {
    onConfirmRules: (selectedRules: Rule[]) => void;
    onExit: () => void;
    onBack: () => void;
    isProtocolLocked?: boolean;
    lockedRules?: Rule[];
};

export function RuleSelectionScreen({
    onConfirmRules,
    onExit,
    onBack,
    isProtocolLocked = false,
    lockedRules = []
}: RuleSelectionScreenProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const lockedIds = lockedRules.map(rule => rule.id);

    const toggleRule = (id: string) => {
        if (isProtocolLocked) return;
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleConfirm = () => {
        if (isProtocolLocked) {
            onConfirmRules(lockedRules);
            return;
        }
        if (selectedIds.length >= 3) {
            const rules = AVAILABLE_RULES.filter(r => selectedIds.includes(r.id));
            onConfirmRules(rules);
        }
    };

    const isMinimumReached = isProtocolLocked ? lockedRules.length >= 3 : selectedIds.length >= 3;

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
                    <GlitchText text="RULE" style={styles.headerTitle} speed={20} duration={900} />
                    <GlitchText text="SELECTION" style={styles.headerTitle} speed={24} duration={1100} />
                    <View style={styles.headerMeta}>
                        <Text style={styles.headerSub}>DEFINE YOUR INVESTMENT PROTOCOL</Text>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepText}>STEP 2 / 3</Text>
                        </View>
                    </View>
                </View>

                <TechCard style={styles.requirementCard} delay={100}>
                    <View style={styles.requirementRow}>
                        <Text style={styles.requirementText}>
                            {isProtocolLocked ? "PROTOCOLS LOCKED FOR CHAPTER 1" : "REQUIREMENT: SELECT MINIMUM 3 PROTOCOLS"}
                        </Text>
                        <Text style={[styles.counter, { color: isMinimumReached ? theme.colors.success : theme.colors.danger }]}>
                            {isProtocolLocked ? lockedRules.length : selectedIds.length} / 3
                        </Text>
                    </View>
                </TechCard>

                <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                    {AVAILABLE_RULES.map(rule => {
                        const isSelected = isProtocolLocked ? lockedIds.includes(rule.id) : selectedIds.includes(rule.id);
                        return (
                            <Pressable
                                key={rule.id}
                                onPress={() => toggleRule(rule.id)}
                                disabled={isProtocolLocked}
                                style={({ pressed }) => [
                                    styles.card,
                                    isSelected && styles.cardSelected,
                                    pressed && !isProtocolLocked && styles.cardPressed,
                                    isProtocolLocked && !isSelected && styles.cardLocked,
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.ruleTitle, isSelected && styles.textSelected]}>{rule.title}</Text>
                                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                        {isSelected && <View style={styles.checkmark} />}
                                    </View>
                                </View>
                                <Text style={styles.description}>{rule.description}</Text>
                                {isSelected && (
                                    <Text style={styles.selectedText}>
                                        {isProtocolLocked ? "LOCKED" : "SELECTED"}
                                    </Text>
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <View style={styles.footer}>
                    <TechCard style={styles.warningCard} delay={150}>
                        <Text style={styles.warningTitle}>BINDING CONTRACT</Text>
                        <Text style={styles.warningText}>
                            Breaching protocols triggers systemic feedback and psychometric penalties.
                        </Text>
                    </TechCard>

                    <Pressable onPress={handleConfirm} disabled={!isMinimumReached} style={{ width: "100%" }}>
                        {({ pressed }) => (
                            <TechCard
                                style={[
                                    styles.buttonCard,
                                    !isMinimumReached && styles.buttonCardDisabled,
                                    pressed && isMinimumReached && { opacity: 0.85 },
                                ]}
                                delay={250}
                            >
                                <Text style={[styles.buttonText, !isMinimumReached && styles.textDisabled]}>
                                    {isProtocolLocked ? "CONTINUE" : "SIGN CONTRACT"}
                                </Text>
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
    requirementCard: {
        marginBottom: 16,
        padding: 8,
    },
    requirementRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    requirementText: {
        color: theme.colors.muted,
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "700",
    },
    counter: {
        fontSize: 14,
        fontWeight: "900",
    },
    list: {
        gap: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 16,
        borderRadius: 2,
    },
    cardSelected: {
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.accent + "12",
    },
    cardLocked: {
        opacity: 0.5,
    },
    cardPressed: {
        opacity: 0.9,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    ruleTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: "800",
        flex: 1,
        letterSpacing: -0.2,
    },
    textSelected: {
        color: theme.colors.accent,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
    },
    checkboxSelected: {
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.accent,
    },
    checkmark: {
        width: 8,
        height: 8,
        backgroundColor: theme.colors.bg,
    },
    description: {
        color: theme.colors.muted,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "500",
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
    warningCard: {
        padding: 8,
    },
    warningTitle: {
        color: theme.colors.danger,
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "900",
        marginBottom: 4,
    },
    warningText: {
        color: theme.colors.muted,
        fontSize: 10,
        fontFamily: "monospace",
        lineHeight: 14,
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
        letterSpacing: 2,
    },
    textDisabled: {
        color: theme.colors.faint,
    },
});
