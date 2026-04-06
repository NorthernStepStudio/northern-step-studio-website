import React from "react";
import { Text, View } from "react-native";
import { theme } from "../constants/theme";
import { useI18n } from "../i18n";

export function WarningText({ text }: { text: string }) {
    const { tr } = useI18n();

    return (
        <View
            style={{
                padding: 12,
                borderRadius: 14,
                backgroundColor: theme.colors.warningBg,
                borderWidth: 1,
                borderColor: theme.colors.border,
            }}
        >
            <Text style={{ fontWeight: "900", color: theme.colors.text }}>
                {tr("Reality check")}
            </Text>
            <Text
                style={{
                    marginTop: 6,
                    opacity: 0.85,
                    lineHeight: 20,
                    color: theme.colors.muted,
                }}
            >
                {tr(text)}
            </Text>
        </View>
    );
}