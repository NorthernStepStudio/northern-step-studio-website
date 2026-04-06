import React, { useEffect, useState } from "react";
import { Text, TextStyle, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

type GlitchTextProps = {
    text: string;
    style?: TextStyle;
    speed?: number; // ms per frame
    duration?: number; // total duration
    preserveSpace?: boolean;
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";

export function GlitchText({
    text,
    style,
    speed = 50,
    duration = 600,
    preserveSpace = true
}: GlitchTextProps) {
    const [display, setDisplay] = useState(text);

    useEffect(() => {
        let startTime = Date.now();
        let interval: NodeJS.Timeout;

        const scramble = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                setDisplay(text);
                clearInterval(interval);
                return;
            }

            const newText = text.split('').map((char, index) => {
                if (preserveSpace && char === ' ') return ' ';
                // Gradually resolve characters from left to right based on progress
                const progress = elapsed / duration;
                if (index / text.length < progress) {
                    return char;
                }
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join('');

            setDisplay(newText);
        };

        interval = setInterval(scramble, speed);
        return () => clearInterval(interval);
    }, [text, duration, speed]);

    return (
        <Text style={[styles.text, style]}>
            {display}
        </Text>
    );
}

const styles = StyleSheet.create({
    text: {
        color: theme.colors.text,
        fontFamily: 'monospace', // Default to monospace for glitches
    }
});
