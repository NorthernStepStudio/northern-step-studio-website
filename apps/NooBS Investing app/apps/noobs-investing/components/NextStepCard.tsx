import React from "react";
import { Pressable, Text, View } from "react-native";
import type { NextStep } from "../utils/nextStepEngine";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AutoTranslate } from "./AutoTranslate";


export function NextStepCard({
    step,
    onPress,
}: {
    step: NextStep;
    onPress: () => void;
}) {
    return (
        <AutoTranslate>
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                borderRadius: 24,
                padding: 24,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.9 : 1,
                gap: 12,
                overflow: 'hidden'
            })}
        >
            <View style={{ position: 'absolute', top: 0, right: 0, padding: 12 }}>
                <MaterialCommunityIcons name="console" size={14} color={theme.colors.accent + '40'} />
            </View>


            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.accent }} />
                        <Text style={{ color: theme.colors.accent, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 }}>
                            NEXT STEP
                        </Text>
                    </View>
                    <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.5 }}>
                        {step.title}
                    </Text>
                </View>
                <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: theme.colors.accent,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: theme.colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                }}>
                    <MaterialCommunityIcons name="arrow-right" size={24} color={theme.colors.buttonText} />
                </View>
            </View>

            <View style={{ height: 1, backgroundColor: theme.colors.border + '50', marginVertical: 4 }} />

            <Text
                style={{
                    color: theme.colors.muted,
                    fontSize: 15,
                    lineHeight: 22,
                    fontWeight: '600'
                }}
            >
                {step.subtitle}
            </Text>
        </Pressable>
        </AutoTranslate>

    );
}
