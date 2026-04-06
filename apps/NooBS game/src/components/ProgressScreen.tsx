import React from "react";
import { Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

export function ProgressScreen({
    visible,
    onClose,
    act,
    freedomNumber,
    ruleIntegrity,
    isIntegrityVisible
}: {
    visible: boolean;
    onClose: () => void;
    act: string;
    freedomNumber: number;
    ruleIntegrity: number;
    isIntegrityVisible: boolean;
}) {
    const freedomPercent = Math.min(100, Math.floor(freedomNumber * 100));

    return (
        <Modal visible={visible} transparent animationType="slide">
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 24,
                    paddingVertical: 24,
                    borderBottomWidth: 1,
                    borderBottomColor: "#111"
                }}>
                    <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: -1 }}>
                        Residency Data
                    </Text>
                    <Pressable onPress={onClose} style={{ padding: 8 }}>
                        <Text style={{ color: "#888", fontSize: 16, fontWeight: "900" }}>CLOSE</Text>
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <StatBox
                        label="CURRENT ACT"
                        value={act}
                        subtitle="The Residency Phase"
                    />
                    <StatBox
                        label="FREEDOM PROGRESS"
                        value={`${freedomPercent}%`}
                        subtitle="Of $500,000 target"
                        progress={freedomNumber}
                    />

                    {isIntegrityVisible ? (
                        <StatBox
                            label="RULE INTEGRITY"
                            value={`${ruleIntegrity}/100`}
                            subtitle={ruleIntegrity < 100 ? "Contract Violations Detected" : "Perfect Adherence"}
                            highlight={ruleIntegrity < 80 ? "#FF3B30" : "#FFF"}
                        />
                    ) : (
                        <View style={{
                            marginBottom: 20,
                            padding: 32,
                            backgroundColor: "#050505",
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: "#111",
                            borderStyle: "dashed"
                        }}>
                            <Text style={{ color: "#333", fontSize: 14, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" }}>
                                [ DATA LOCKED UNTIL ACT III ]
                            </Text>
                        </View>
                    )}

                    <View style={{ marginTop: 24, padding: 24, backgroundColor: "#080808", borderRadius: 24, borderWidth: 1, borderColor: "#111" }}>
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900", marginBottom: 12 }}>
                            Residency Note
                        </Text>
                        <Text style={{ color: "#666", fontSize: 15, lineHeight: 24, fontWeight: "700" }}>
                            The Residency monitors your capacity to stick to the plan. Breaking your contract creates psychological debt that makes future events mathematically harder.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

function StatBox({ label, value, subtitle, progress, highlight = "#fff" }: { label: string; value: string; subtitle: string; progress?: number; highlight?: string }) {
    return (
        <View style={{
            marginBottom: 20,
            padding: 24,
            backgroundColor: "#080808",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "#161616"
        }}>
            <Text style={{ color: "#444", fontSize: 13, fontWeight: "900", letterSpacing: 1.5, marginBottom: 12 }}>
                {label}
            </Text>
            <Text style={{ color: highlight, fontSize: 48, fontWeight: "900", letterSpacing: -2 }}>
                {value}
            </Text>
            <Text style={{ color: "#666", fontSize: 15, fontWeight: "700", marginTop: 4 }}>
                {subtitle}
            </Text>
            {progress !== undefined && (
                <View style={{ height: 6, backgroundColor: "#111", borderRadius: 3, marginTop: 20, overflow: "hidden" }}>
                    <View style={{ height: "100%", width: `${Math.min(100, progress * 100)}%`, backgroundColor: "#555" }} />
                </View>
            )}
        </View>
    );
}
