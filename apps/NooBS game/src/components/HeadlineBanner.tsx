import React from "react";
import { Pressable, Text, View } from "react-native";
import { Headline } from "../game/types";
import { theme } from "../constants/theme";

export function HeadlineBanner({
    headline,
    onDismiss
}: {
    headline: Headline | null;
    onDismiss: () => void;
}) {
    if (!headline) return null;

    const isPositive = headline.type === "POSITIVE" || headline.type === "MOON";
    const bg = isPositive ? theme.colors.accent : (headline.type === "CRASH" ? theme.colors.danger : theme.colors.real);
    const fg = theme.colors.bg;

    return (
        <Pressable
            onPress={onDismiss}
            style={{
                backgroundColor: bg,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 2,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: 'rgba(0,0,0,0.1)'
            }}
        >
            <View style={{ width: 8, height: 8, borderRadius: 0, backgroundColor: fg }} />
            <Text style={{ color: fg, fontWeight: "900", fontSize: 13, flex: 1, letterSpacing: 0.2 }} numberOfLines={1}>
                {headline.text.toUpperCase()}
            </Text>
            <Text style={{ color: fg, fontWeight: "900", fontSize: 10, opacity: 0.5 }}>[ACK]</Text>
        </Pressable>
    );
}
