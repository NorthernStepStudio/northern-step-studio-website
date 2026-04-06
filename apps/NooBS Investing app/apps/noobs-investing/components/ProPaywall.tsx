import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Linking, Alert } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { unlockPro, restorePurchase } from '../storage/subscription';
import { AutoTranslate } from './AutoTranslate';
import { useI18n } from '../i18n';

interface ProPaywallProps {
    visible: boolean;
    onClose: () => void;
    onUnlock: () => void;
}

export function ProPaywall({ visible, onClose, onUnlock }: ProPaywallProps) {
    const { tr } = useI18n();
    const [loading, setLoading] = useState(false);

    const handlePurchase = async (pkgId: 'monthly' | 'lifetime') => {
        setLoading(true);
        try {
            const success = await unlockPro(pkgId);
            if (success) {
                onUnlock();
                onClose();
            } else {
                Alert.alert(
                    tr('Purchase Unavailable'),
                    tr('Live billing is not configured yet for this build. Please try again later.')
                );
            }
        } catch (e) {
            console.error('Purchase component error:', e);
        } finally {
            setLoading(false);
        }
    };


    const benefits = [
        { icon: 'chart-line', text: 'Live Price Charts with Real-Time Updates' },
        { icon: 'swap-horizontal-circle', text: 'Limit Orders & Advanced Order Types' },
        { icon: 'school', text: '10 Advanced Lessons (DCA, Taxes, Crypto)' },
        { icon: 'calculator', text: 'Interactive Fee Friction Calculator' },
        { icon: 'chart-timeline-variant', text: 'Portfolio Performance Analytics' },
        { icon: 'medal', text: 'Exclusive "Wealth Strategist" Medal' },
        { icon: 'heart', text: 'Support Independent Development' },
    ];

    return (
        <AutoTranslate>
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="crown" size={40} color={theme.colors.accent} />
                        </View>
                        <Text style={styles.title}>Unlock NooBS Pro</Text>
                        <Text style={styles.subtitle}>Level up your investing brain.</Text>
                    </View>

                    {/* Benefits */}
                    <View style={styles.benefits}>
                        {benefits.map((b, idx) => (
                            <View key={idx} style={styles.benefitRow}>
                                <MaterialCommunityIcons name={b.icon as any} size={20} color={theme.colors.accent} />
                                <Text style={styles.benefitText}>{b.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Pricing */}
                    <View style={styles.pricing}>
                        <Pressable
                            onPress={() => handlePurchase('monthly')}
                            disabled={loading}
                            style={({ pressed }) => [
                                styles.priceButton,
                                styles.monthlyButton,
                                { opacity: pressed || loading ? 0.8 : 1 }
                            ]}
                        >
                            <Text style={styles.priceAmount}>$4.99</Text>
                            <Text style={styles.pricePeriod}>per month</Text>
                        </Pressable>

                        <Pressable
                            onPress={() => handlePurchase('lifetime')}
                            disabled={loading}
                            style={({ pressed }) => [
                                styles.priceButton,
                                styles.lifetimeButton,
                                { opacity: pressed || loading ? 0.8 : 1 }
                            ]}
                        >
                            <View style={styles.bestValue}>
                                <Text style={styles.bestValueText}>BEST VALUE</Text>
                            </View>
                            <Text style={styles.priceAmount}>$29.99</Text>
                            <Text style={styles.pricePeriod}>lifetime access</Text>
                        </Pressable>
                    </View>

                    {/* Restore */}
                    <Pressable
                        onPress={async () => {
                            setLoading(true);
                            const success = await restorePurchase();
                            if (success) {
                                onUnlock();
                                onClose();
                            } else {
                                Alert.alert(
                                    tr('Restore Failed'),
                                    tr('We couldn\'t find any active Pro subscriptions on this account.')
                                );
                            }
                            setLoading(false);

                        }}
                        style={styles.restore}
                    >
                        <Text style={styles.restoreText}>Restore Purchase</Text>
                    </Pressable>

                    {/* Close */}
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>Maybe Later</Text>
                    </Pressable>

                    {/* Legal */}
                    <Text style={styles.legal}>
                        Payment will be charged to your Google Play account. Subscription auto-renews unless cancelled 24 hours before end of period.
                    </Text>
                </View>
            </View>
        </Modal>
        </AutoTranslate>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: 32,
        padding: 32,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.accent + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: theme.colors.accent,
    },
    title: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    subtitle: {
        color: theme.colors.muted,
        fontSize: 16,
        fontWeight: '600',
    },
    benefits: {
        gap: 12,
        marginBottom: 24,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    benefitText: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    pricing: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    priceButton: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 2,
    },
    monthlyButton: {
        backgroundColor: theme.colors.bg,
        borderColor: theme.colors.border,
    },
    lifetimeButton: {
        backgroundColor: theme.colors.accent + '15',
        borderColor: theme.colors.accent,
    },
    bestValue: {
        position: 'absolute',
        top: -10,
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    bestValueText: {
        color: theme.colors.bg,
        fontSize: 10,
        fontWeight: '900',
    },
    priceAmount: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: '900',
    },
    pricePeriod: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '600',
    },
    restore: {
        alignItems: 'center',
        marginBottom: 16,
    },
    restoreText: {
        color: theme.colors.accent,
        fontSize: 14,
        fontWeight: '700',
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    closeText: {
        color: theme.colors.muted,
        fontSize: 16,
        fontWeight: '600',
    },
    legal: {
        color: theme.colors.faint,
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 14,
        marginTop: 12,
    },
});
