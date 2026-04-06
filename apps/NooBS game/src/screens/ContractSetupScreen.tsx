
import React, { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { GameState } from "../game/types";
import { theme } from "../constants/theme";

export function ContractSetupScreen({
    state,
    onLock,
    onExit
}: {
    state: GameState;
    onLock: () => void;
    onExit: () => void;
}) {
    const [showLockModal, setShowLockModal] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>RESIDENCY{"\n"}CONTRACT</Text>
                    <Text style={styles.headerCode}>INITIALIZATION PROTOCOL V5.0 // AETHER</Text>
                    <Pressable onPress={onExit} style={styles.exitButton}>
                        <Text style={styles.exitButtonText}>[ MAIN MENU ]</Text>
                    </Pressable>
                </View>

                <View style={styles.dossierSection}>
                    <View style={styles.dossierItem}>
                        <Text style={styles.dossierLabel}>OPERATIVE ROLE</Text>
                        <Text style={styles.dossierValue}>{state.job?.title.replace(/_/g, ' ').toUpperCase()}</Text>
                        <Text style={styles.dossierSub}>${((state.job?.hourlyWage || 0) * 160).toLocaleString()} PER MONTH PROJECTED INFLOW</Text>
                    </View>
                </View>

                <View style={styles.commitmentHeader}>
                    <View style={styles.dot} />
                    <Text style={styles.subtext}>SELECTED PROTOCOLS</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {state.selectedRules.map((rule, idx) => (
                        <ProtocolRule
                            key={rule.id}
                            title={`ARTICLE ${(idx + 1).toString().padStart(2, '0')}`}
                            ruleName={rule.title.replace(/_/g, ' ')}
                            body={rule.description}
                        />
                    ))}
                    {state.selectedRules.length === 0 && (
                        <Text style={styles.errorText}>NO PROTOCOLS SELECTED</Text>
                    )}
                </ScrollView>
            </View>

            <View style={styles.footer}>
                <Pressable
                    onPress={() => setShowLockModal(true)}
                    style={({ pressed }) => [
                        styles.primaryBtn,
                        { opacity: pressed ? 0.9 : 1 }
                    ]}
                >
                    <Text style={styles.primaryBtnText}>LOCK PROTOCOLS</Text>
                </Pressable>
            </View>

            <Modal visible={showLockModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>IRREVERSIBLE ACTION</Text>
                        <Text style={styles.modalBody}>
                            PROTOCOL REVISIONS ARE PROHIBITED ONCE SIMULATION COMMENCES.{"\n\n"}
                            CONFIRM SUBJECT ADHERENCE?
                        </Text>

                        <Pressable
                            onPress={onLock}
                            style={({ pressed }) => [
                                styles.modalPrimaryBtn,
                                { opacity: pressed ? 0.9 : 1 }
                            ]}
                        >
                            <Text style={styles.modalPrimaryBtnText}>CONFIRM LOCK</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setShowLockModal(false)}
                            style={styles.modalSecondaryBtn}
                        >
                            <Text style={styles.modalSecondaryBtnText}>ABORT LOCK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function ProtocolRule({ title, ruleName, body }: { title: string; ruleName: string; body: string }) {
    return (
        <View style={styles.ruleBox}>
            <View style={styles.ruleHeader}>
                <Text style={styles.ruleLabel}>{title}</Text>
                <Text style={styles.ruleName}>{ruleName}</Text>
            </View>
            <Text style={styles.ruleBody}>{body}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bg,
        paddingHorizontal: 24,
        paddingTop: 60
    },
    content: {
        flex: 1,
        paddingTop: 20
    },
    header: {
        marginBottom: 32,
    },
    headerTitle: {
        color: theme.colors.text,
        fontSize: 32,
        fontWeight: "900",
        letterSpacing: -1.5,
        lineHeight: 32,
    },
    headerCode: {
        color: theme.colors.accent,
        fontSize: 10,
        fontWeight: "900",
        fontFamily: "monospace",
        letterSpacing: 2,
        opacity: 0.8
    },
    exitButton: { position: 'absolute', top: 0, right: 0, padding: 8 },
    exitButtonText: { color: theme.colors.faint, fontSize: 10, fontWeight: '900', fontFamily: 'monospace', letterSpacing: 1 },
    dossierSection: {
        marginBottom: 32,
        backgroundColor: theme.colors.card,
        padding: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    dossierItem: {
        gap: 4
    },
    dossierLabel: {
        color: theme.colors.faint,
        fontSize: 10,
        fontWeight: "900",
        fontFamily: "monospace",
        letterSpacing: 1
    },
    dossierValue: {
        color: theme.colors.accent,
        fontSize: 20,
        fontWeight: "900",
        letterSpacing: -0.5
    },
    dossierSub: {
        color: theme.colors.faint,
        fontSize: 11,
        fontWeight: "700",
        fontFamily: "monospace",
        opacity: 0.6
    },
    commitmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        opacity: 0.8
    },
    dot: {
        width: 6,
        height: 6,
        backgroundColor: theme.colors.accent
    },
    subtext: {
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 1,
        fontFamily: 'monospace'
    },
    errorText: {
        color: theme.colors.danger,
        fontFamily: 'monospace',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20
    },
    footer: {
        paddingVertical: 24
    },
    primaryBtn: {
        backgroundColor: theme.colors.text,
        paddingVertical: 22,
        alignItems: "center",
        borderRadius: 4
    },
    primaryBtnText: {
        color: theme.colors.bg,
        fontWeight: "900",
        fontSize: 16,
        letterSpacing: 1,
    },
    ruleBox: {
        marginBottom: 16,
        padding: 24,
        backgroundColor: theme.colors.card,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    ruleHeader: {
        marginBottom: 12,
        gap: 2
    },
    ruleLabel: {
        color: theme.colors.accent,
        fontSize: 9,
        fontWeight: "900",
        fontFamily: "monospace",
        letterSpacing: 1
    },
    ruleName: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: -0.5,
    },
    ruleBody: {
        color: theme.colors.faint,
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 22,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        padding: 32
    },
    modalCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 32
    },
    modalTitle: {
        color: theme.colors.accent,
        fontSize: 12,
        fontWeight: "900",
        marginBottom: 24,
        fontFamily: "monospace",
        letterSpacing: 2
    },
    modalBody: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: "700",
        lineHeight: 24,
        marginBottom: 40,
    },
    modalPrimaryBtn: {
        backgroundColor: theme.colors.text,
        paddingVertical: 20,
        alignItems: "center",
        borderRadius: 4
    },
    modalPrimaryBtnText: {
        color: theme.colors.bg,
        fontWeight: "900",
        fontSize: 15,
        letterSpacing: 1,
    },
    modalSecondaryBtn: {
        marginTop: 20,
        alignItems: "center",
        paddingVertical: 12
    },
    modalSecondaryBtnText: {
        color: theme.colors.faint,
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 1,
        fontFamily: "monospace",
        textDecorationLine: 'underline'
    }
});
