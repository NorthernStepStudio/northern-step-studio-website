import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface IntroScreenProps {
    onFinish: () => void;
}

export default function IntroScreen({ onFinish }: IntroScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        SplashScreen.hideAsync().catch(() => { });

        // Fade in logo + text
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Hold for a moment, then fade out
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }).start(() => {
                    onFinish();
                });
            }, 1400);
        });
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>ProvLy</Text>
                <Text style={styles.appSubtitle}>Home Inventory</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1220',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 28,
        marginBottom: 24,
    },
    appName: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    appSubtitle: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 4,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
