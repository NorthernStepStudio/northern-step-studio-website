import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export const GlassCard = ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <View style={[styles.cardContainer, style]}>
        <BlurView intensity={20} tint="dark" style={styles.blur}>
            <View style={styles.innerCard}>
                {children}
            </View>
        </BlurView>
    </View>
);

export const PrimaryButton = ({ title, onPress, loading }: { title: string, onPress: () => void, loading?: boolean }) => (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8}>
        <LinearGradient
            colors={['#00C6FF', '#8E2DE2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{title}</Text>}
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    blur: {
        padding: 20,
    },
    innerCard: {
        gap: 15,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#8E2DE2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
