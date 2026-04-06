import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, DimensionValue, LayoutChangeEvent } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { theme } from "../../constants/theme";

type TechCardProps = {
    children: React.ReactNode;
    style?: any;
    delay?: number; // Scan delay
};

export function TechCard({ children, style, delay = 0 }: TechCardProps) {
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            delay: delay,
            useNativeDriver: true,
        }).start();
    }, [delay]);

    const CUT_SIZE = 20;
    const { width, height } = layout;

    // SVG Path for Cut Corner Geometry
    // Top-Left -> Top-Right (Cut) -> Right-Down -> Bottom-Left -> Close
    const pathD = width > 0 ? `
        M 0 0
        L ${width - CUT_SIZE} 0
        L ${width} ${CUT_SIZE}
        L ${width} ${height}
        L 0 ${height}
        Z
    ` : "";

    return (
        <Animated.View
            style={[styles.container, style, { opacity: opacityAnim }]}
            onLayout={onLayout}
        >
            {width > 0 && (
                <View style={[StyleSheet.absoluteFill, styles.svgContainer]}>
                    <Svg width={width} height={height}>
                        <Defs>
                            <LinearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={theme.colors.accent} stopOpacity="0.8" />
                                <Stop offset="1" stopColor={theme.colors.accent} stopOpacity="0.2" />
                            </LinearGradient>
                        </Defs>

                        {/* Background Pane (Glass) */}
                        <Path
                            d={pathD}
                            fill={theme.colors.card}
                            fillOpacity={0.8}
                        />

                        {/* Border Stroke */}
                        <Path
                            d={pathD}
                            stroke="url(#borderGrad)"
                            strokeWidth={1}
                            fill="none"
                        />

                        {/* Decorative Corner Bracket (Bottom Left) */}
                        <Path
                            d={`M 0 ${height - 20} L 0 ${height} L 20 ${height}`}
                            stroke={theme.colors.accent}
                            strokeWidth={2}
                            fill="none"
                        />
                    </Svg>
                </View>
            )}

            <View style={styles.content}>
                {children}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Default container
    },
    svgContainer: {
        zIndex: 0,
    },
    content: {
        zIndex: 1,
        padding: 4, // Inner padding to clear borders
    }
});
