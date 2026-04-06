import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Animated Power Meter Bar
const PowerMeter = ({ score, maxScore = 45000, theme, isBottleneck }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    // Determine Tier (Cyberpunk Lite style)
    let tierColor = theme.colors.textSecondary; // Office Drone
    let tierName = "Office Drone";

    if (score > 10000) { tierColor = '#3B82F6'; tierName = "Console Crusher"; } // Blue
    if (score > 20000) { tierColor = '#A855F7'; tierName = "High-End Warrior"; } // Purple
    if (score > 30000) { tierColor = '#F43F5E'; tierName = "Nexus God (Ultra)"; } // Neon Red/Orange

    useEffect(() => {
        // Calculate percentage based on maxScore
        const percent = Math.min((score / maxScore), 1);

        Animated.timing(animatedValue, {
            toValue: percent,
            duration: 900,
            useNativeDriver: false,
            easing: Easing.out(Easing.exp),
        }).start();
    }, [score, maxScore]);

    const widthInterpolation = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <View style={styles.meterContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: tierColor, fontWeight: 'bold', fontSize: 16 }}>{tierName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ color: tierColor, fontWeight: 'bold', fontSize: 24 }}>{score}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>/ {maxScore}</Text>
                </View>
            </View>

            {/* Bar Background */}
            <View style={[styles.barBackground, { backgroundColor: theme.colors.bgSecondary, borderColor: tierColor + '40', borderWidth: 1 }]}>
                {/* Fill */}
                <Animated.View style={[styles.barFill, {
                    width: widthInterpolation,
                    backgroundColor: tierColor,
                    shadowColor: tierColor,
                    shadowRadius: 10,
                    shadowOpacity: 0.8,
                    elevation: 5
                }]} />

                {/* Bottleneck Marker (Visual only) */}
                {isBottleneck && (
                    <View style={styles.bottleneckMarker}>
                        <Ionicons name="warning" size={12} color="#fff" />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    meterContainer: {
        marginBottom: 10,
    },
    barBackground: {
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    barFill: {
        height: '100%',
        borderRadius: 12,
    },
    bottleneckMarker: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 30,
        backgroundColor: 'rgba(255,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderColor: 'red',
    },
});

export default PowerMeter;
