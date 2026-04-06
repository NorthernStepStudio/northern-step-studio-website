import React, { useEffect } from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import { ToastType } from "../game/types";
import { theme } from "../constants/theme";

export function TruthToast({
    visible,
    message,
    type,
    onHide
}: {
    visible: boolean;
    message: string;
    type: ToastType;
    onHide: () => void;
}) {
    const opacity = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(10)).current;

    useEffect(() => {
        if (!visible) return;

        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true })
        ]).start();

        const t = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 10, duration: 180, useNativeDriver: true })
            ]).start(() => onHide());
        }, 2800);

        return () => clearTimeout(t);
    }, [visible]);

    if (!visible) return null;

    const bg = type === "WARNING" ? theme.colors.danger : theme.colors.real;
    const fg = theme.colors.bg;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }]
                }
            ]}
        >
            <View style={[styles.content, { backgroundColor: bg }]}>
                <Text style={[styles.text, { color: fg }]}>
                    {message.toUpperCase()}
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    content: {
        borderRadius: 2,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderLeftWidth: 4,
        borderLeftColor: 'rgba(0,0,0,0.1)'
    },
    text: {
        fontWeight: "900",
        fontSize: 12,
        letterSpacing: 0.5
    }
});
