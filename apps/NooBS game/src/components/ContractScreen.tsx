import React from "react";
import { FlatList, Modal, Pressable, SafeAreaView, Text, View } from "react-native";

export function ContractScreen({
    visible,
    onClose,
    violations,
}: {
    visible: boolean;
    onClose: () => void;
    violations: string[];
}) {
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
                        The Guilt Engine
                    </Text>
                    <Pressable onPress={onClose} style={{ padding: 8 }}>
                        <Text style={{ color: "#888", fontSize: 16, fontWeight: "900" }}>CLOSE</Text>
                    </Pressable>
                </View>

                <View style={{ padding: 24, flex: 1 }}>
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
                        Your Promised Plan
                    </Text>
                    <Text style={{ color: "#666", fontSize: 16, fontWeight: "700", lineHeight: 24, marginBottom: 40 }}>
                        "I will not be moved by the noise. My strategy is defined. My conviction is absolute."
                    </Text>

                    <Text style={{ color: "#FF3B30", fontSize: 13, fontWeight: "900", letterSpacing: 2, marginBottom: 20 }}>
                        CONTRACT VIOLATIONS ({violations.length})
                    </Text>

                    {violations.length === 0 ? (
                        <View style={{ padding: 32, backgroundColor: "#080808", borderRadius: 24, alignItems: "center", borderStyle: "dashed", borderWidth: 1, borderColor: "#333" }}>
                            <Text style={{ color: "#444", fontSize: 16, fontWeight: "800", textAlign: "center" }}>
                                Perfect adherence detected.{"\n"}The plan holds.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={violations}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={{
                                    marginBottom: 16,
                                    padding: 24,
                                    backgroundColor: "#080000",
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: "#300"
                                }}>
                                    <Text style={{ color: "#FF3B30", fontSize: 15, fontWeight: "800", lineHeight: 22 }}>
                                        {item}
                                    </Text>
                                    <Text style={{ color: "#600", fontSize: 12, fontWeight: "800", marginTop: 8 }}>
                                        VIOLATION RECORDED BY THE RESIDENCY
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
}
