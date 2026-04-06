import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';

import { useTranslation } from '../../core/i18n';

const isWeb = Platform.OS === 'web';

export default function HomeCTA({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    const handleHoverIn = () => {
        setIsHovered(true);
        if (isWeb) {
            Animated.spring(animatedValue, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 10,
            }).start();
        }
    };

    const handleHoverOut = () => {
        setIsHovered(false);
        if (isWeb) {
            Animated.spring(animatedValue, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 10,
            }).start();
        }
    };

    const translateY = isWeb ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
    }) : 0;

    const scale = isWeb ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02],
    }) : 1;

    const ButtonWrapper = isWeb ? Animated.View : View;

    return (
        <View style={styles.section}>
            <GlassCard style={[styles.ctaCard, { backgroundColor: theme.colors.glassBg }]}>
                <Text style={[styles.ctaTitle, { color: theme.colors.textPrimary }]}>
                    {t('home.cta.title')}
                </Text>
                <Text style={[styles.ctaSubtitle, { color: theme.colors.textSecondary }]}>
                    {t('home.cta.subtitle')}
                </Text>
                <Pressable
                    onPress={() => navigation.navigate('BuilderTab')}
                    onHoverIn={handleHoverIn}
                    onHoverOut={handleHoverOut}
                    onPressIn={handleHoverIn}
                    onPressOut={handleHoverOut}
                >
                    <ButtonWrapper
                        style={[
                            styles.ctaButton,
                            isWeb && isHovered && styles.ctaButtonHovered,
                            isWeb ? { transform: [{ translateY }, { scale }] } : null
                        ]}
                    >
                        <LinearGradient
                            colors={[theme.colors.accentPrimary, theme.colors.accentSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.ctaButtonText}>
                                {t('home.cta.button')}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </ButtonWrapper>
                </Pressable>
            </GlassCard>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        padding: 20,
        paddingTop: 5,
    },
    ctaCard: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        gap: 10,
    },
    ctaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    ctaSubtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 4,
    },
    ctaButton: {
        borderRadius: 50,
        overflow: 'hidden',
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaButtonHovered: {
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.9,
        shadowRadius: 28,
        elevation: 16,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 36,
        paddingVertical: 18,
        gap: 10,
    },
    ctaButtonText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
