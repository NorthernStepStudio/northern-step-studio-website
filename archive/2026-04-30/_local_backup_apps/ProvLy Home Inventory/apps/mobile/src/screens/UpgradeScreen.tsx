import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useTheme } from '../stores/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function UpgradeScreen() {
    const { colors, isDark } = useTheme();
    const { offerings, purchasePackage, restorePurchases, isPro, loading: storeLoading } = useSubscriptionStore();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [buying, setBuying] = useState(false);
    const monthlyPkg = offerings?.monthly;
    const annualPkg = offerings?.annual;
    // Default to monthly if annual not available
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(annualPkg ? 'annual' : 'monthly');

    // Calculate savings if both exist
    const savingsPercent = monthlyPkg && annualPkg
        ? Math.round((1 - (annualPkg.product.price / (monthlyPkg.product.price * 12))) * 100)
        : 0;

    // Select active package
    const selectedPkg = billingPeriod === 'annual' && annualPkg ? annualPkg : monthlyPkg;

    const handlePurchase = async () => {
        console.log('[Upgrade] Tapped Buy. State:', { offerings: !!offerings, isPro, loading: storeLoading });
        if (buying) return;
        setBuying(true);

        const monthlyPkg = offerings?.monthly;
        const annualPkg = offerings?.annual;

        if (!monthlyPkg && !annualPkg) {
            console.error('[Upgrade] No packages available at purchase time');
            Alert.alert(t('common.error', 'Not Available'), t('upgrade.notAvailable', 'Subscription configuration is missing or offline.'));
            setBuying(false);
            return;
        }

        // Use selected package. If selected is null (e.g. annual selected but missing), fall back to whatever is available.
        const pkgToBuy = selectedPkg || monthlyPkg || annualPkg;
        console.log('[Upgrade] Attempting purchase of:', pkgToBuy?.product?.identifier);

        try {
            const success = await purchasePackage(pkgToBuy);
            console.log('[Upgrade] purchasePackage result:', success);
            setBuying(false);

            if (success) {
                Alert.alert(t('common.success', 'Success'), t('upgrade.welcomeToPro', 'Welcome to Pro!'), [
                    { text: t('common.ok', 'OK'), onPress: () => navigation.goBack() }
                ]);
            } else {
                // If not success, and not cancelled, show error
                // The store handles logging the error, but we should clear the buying state (done above)
                // If we want to show a specific error here, we'd need it returned from the store.
            }
        } catch (err: any) {
            console.error('[Upgrade] handlePurchase fatal error:', err);
            Alert.alert(t('common.error', 'Error'), err.message || 'Purchase failed');
            setBuying(false);
        }
    };

    const handleRestore = async () => {
        setBuying(true);
        const success = await restorePurchases();
        setBuying(false);
        if (success) {
            Alert.alert(t('subscription.restoreSuccess', 'Restored'), t('subscription.restoredDesc', 'Your Pro subscription has been restored.'));
            navigation.goBack();
        } else {
            Alert.alert(t('common.notice', 'Notice'), t('subscription.restoreNone', 'No active subscription found to restore.'));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="crown" size={64} color="#F59E0B" />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>{t('upgrade.title', 'Upgrade to Pro')}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t('upgrade.subtitle', 'Unlock the full power of your home inventory.')}
                </Text>

                <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <FeatureRow text={t('upgrade.feature1', 'Unlimited Exports')} colors={colors} />
                    <FeatureRow text={t('upgrade.feature2', 'Cloud Sync & Backup')} colors={colors} />
                    <FeatureRow text={t('upgrade.feature3', 'ZIP Claim Packs (Photos included)')} colors={colors} />
                    <FeatureRow text={t('upgrade.feature4', 'Priority Support')} colors={colors} />
                </View>

                {/* Billing Toggle */}
                {annualPkg && (
                    <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceVariant }]}>
                        <TouchableOpacity
                            style={[
                                styles.toggleOption,
                                billingPeriod === 'monthly' && { backgroundColor: colors.surface }
                            ]}
                            onPress={() => setBillingPeriod('monthly')}
                        >
                            <Text style={[
                                styles.toggleText,
                                { color: billingPeriod === 'monthly' ? colors.text : colors.textSecondary }
                            ]}>{t('upgrade.monthly', 'Monthly')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleOption,
                                billingPeriod === 'annual' && { backgroundColor: colors.surface }
                            ]}
                            onPress={() => setBillingPeriod('annual')}
                        >
                            <Text style={[
                                styles.toggleText,
                                { color: billingPeriod === 'annual' ? colors.text : colors.textSecondary }
                            ]}>{t('upgrade.yearly', 'Yearly')}</Text>
                            {savingsPercent > 0 && (
                                <View style={[styles.saveBadge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.saveText}>{t('upgrade.save', { percent: savingsPercent, defaultValue: `SAVE ${savingsPercent}%` })}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.pricingContainer}>
                    {storeLoading ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <TouchableOpacity
                            style={[styles.buyButton, { backgroundColor: colors.primary }]}
                            onPress={handlePurchase}
                            disabled={buying}
                        >
                            {buying ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buyButtonText}>
                                        {selectedPkg
                                            ? t('upgrade.subscribe', { price: selectedPkg.product.priceString, period: billingPeriod === 'annual' ? t('upgrade.perYear', 'yr') : t('upgrade.perMonth', 'mo'), defaultValue: `Subscribe for ${selectedPkg.product.priceString}/${billingPeriod === 'annual' ? 'yr' : 'mo'}` })
                                            : t('upgrade.subscribeDefault', 'Subscribe for $6.99/mo')
                                        }
                                    </Text>
                                    <Text style={styles.trialText}>
                                        {billingPeriod === 'annual' && selectedPkg
                                            ? t('upgrade.justPerMonth', { price: (selectedPkg.product.price / 12).toFixed(2), defaultValue: `Just ${(selectedPkg.product.price / 12).toFixed(2)}/mo` })
                                            : t('upgrade.cancelAnytime', 'Cancel anytime.')
                                        }
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.footerLinks}>
                    <TouchableOpacity onPress={handleRestore}>
                        <Text style={[styles.linkText, { color: colors.textSecondary }]}>{t('upgrade.restorePurchases', 'Restore Purchases')}</Text>
                    </TouchableOpacity>

                    <View style={styles.linkRow}>
                        <TouchableOpacity onPress={() => navigation.navigate('Legal', { type: 'privacy' })}>
                            <Text style={[styles.linkTextMini, { color: colors.textSecondary }]}>{t('upgrade.privacy', 'Privacy')}</Text>
                        </TouchableOpacity>
                        <Text style={{ color: colors.textSecondary }}>•</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Legal', { type: 'terms' })}>
                            <Text style={[styles.linkTextMini, { color: colors.textSecondary }]}>{t('upgrade.terms', 'Terms')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

function FeatureRow({ text, colors }: { text: string, colors: any }) {
    return (
        <View style={styles.featureRow}>
            <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, alignItems: 'flex-end', paddingTop: 50 },
    closeBtn: { padding: 8 },
    content: { padding: 24, alignItems: 'center' },
    iconContainer: { marginBottom: 24 },
    title: { fontSize: 32, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center', maxWidth: 260 },
    featuresCard: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, marginBottom: 40 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
    featureText: { fontSize: 16, fontWeight: '600' },
    pricingContainer: { width: '100%', marginBottom: 32 },
    buyButton: { width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    buyButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    trialText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
    footerLinks: { alignItems: 'center', gap: 16 },
    linkText: { fontSize: 14, fontWeight: '600' },
    linkRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    linkTextMini: { fontSize: 12 },
    toggleContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        marginBottom: 24,
        width: '100%',
        maxWidth: 300,
    },
    toggleOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        gap: 6
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    saveText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
