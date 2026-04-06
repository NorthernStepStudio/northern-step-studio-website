import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing, Platform, StatusBar as RNStatusBar } from "react-native";
import Svg, { Line, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { theme } from "../../constants/theme";

const { width, height } = Dimensions.get("window");

export function HoloBackground({ children }: { children?: React.ReactNode }) {
    // Grid animation: Drifts diagonally
    const gridAnimY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(gridAnimY, {
                toValue: 50, // Move one grid cell down
                duration: 14000, // Slow drift
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const statusBarHeight = Platform.OS === "android" ? RNStatusBar.currentHeight ?? 24 : 44;
    const contentPaddingTop = Math.max(80, statusBarHeight + 36);

    return (
        <View style={styles.container}>
            {/* DEEP VOID BACKGROUND */}
            <View style={styles.voidLayer} />

            {/* ANIMATED GRID LAYER */}
            <Animated.View
                style={[
                    styles.gridContainer,
                    { transform: [{ translateY: gridAnimY }] }
                ]}
            >
                <GridPattern />
            </Animated.View>

            {/* VIGNETTE OVERLAY (Darkens corners for cinematic effect) */}
            <View style={styles.vignette} pointerEvents="none">
                <Svg height="100%" width="100%">
                    <Defs>
                        <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0" stopColor="#000" stopOpacity="0.8" />
                            <Stop offset="0.2" stopColor="#000" stopOpacity="0" />
                            <Stop offset="0.8" stopColor="#000" stopOpacity="0" />
                            <Stop offset="1" stopColor="#000" stopOpacity="0.8" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                </Svg>
            </View>

            {/* CONTENT LAYER */}
            <View style={[styles.content, { paddingTop: contentPaddingTop }]}>
                {children}
            </View>
        </View>
    );
}

function GridPattern() {
    // Generate a grid that is larger than the screen to allow for scrolling loop
    // Grid cell size = 50
    const cellSize = 50;
    const cols = Math.ceil(width / cellSize) + 2;
    const rows = Math.ceil(height / cellSize) + 4; // Extra rows for scrolling loop

    // Create array of lines
    const vLines = Array.from({ length: cols }).map((_, i) => (
        <Line
            key={`v-${i}`}
            x1={i * cellSize}
            y1={-100}
            x2={i * cellSize}
            y2={height + 100}
            stroke={theme.colors.accent}
            strokeOpacity="0.08"
            strokeWidth="1"
        />
    ));

    const hLines = Array.from({ length: rows }).map((_, i) => (
        <Line
            key={`h-${i}`}
            x1={0}
            y1={(i * cellSize) - 100} // Start above screen
            x2={width}
            y2={(i * cellSize) - 100}
            stroke={theme.colors.accent}
            strokeOpacity="0.08"
            strokeWidth="1"
        />
    ));

    return (
        <Svg height={height + 200} width={width} style={{ opacity: 0.8 }}>
            {vLines}
            {hLines}
        </Svg>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505', // Deep space black
    },
    voidLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#020202',
    },
    gridContainer: {
        position: 'absolute',
        top: -50, // Start slightly above
        left: 0,
        right: 0,
        bottom: 0,
    },
    vignette: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 5,
    },
    content: {
        flex: 1,
        zIndex: 10,
    }
});
