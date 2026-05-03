import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useProofScore } from '../hooks/useProofScore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../stores/themeStore';
import { localExport } from '../lib/localExport';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useTranslation } from 'react-i18next';

export default function ClaimCenterScreen() {
    const navigation = useNavigation<any>();
    const { activeHomeId } = useInventoryStore();
    const { isPro } = useSubscriptionStore();
    const { aggregateScore, missingDocs: documentationNeeded, totalItems } = useProofScore();
    const [isExporting, setIsExporting] = useState(false);
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const styles = getStyles(colors, isDark);

    const handleExport = async () => {
        if (!isPro) {
            Alert.alert(
                t('upgrade.title', 'Upgrade to Pro'),
                t('upgrade.zip_feature', 'Full Claim Pack ZIP exports are included with Pro.'),
                [
                    { text: t('common.not_now', 'Not now'), style: 'cancel' },
                    { text: t('common.upgrade', 'Upgrade'), onPress: () => navigation.navigate('Upgrade') }
                ]
            );
            return;
        }

        setIsExporting(true);
        try {
            await localExport.exportClaimPack(activeHomeId || undefined);

            Alert.alert(
                t('claims.exportComplete'),
                t('claims.exportCompleteDesc'),
                [{ text: "OK" }]
            );
        } catch (error: any) {
            Alert.alert("Export Error", error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleGenerateSummary = async () => {
        try {
            await localExport.exportSummary(activeHomeId || undefined);
        } catch (error: any) {
            Alert.alert("Export Error", error.message);
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
            }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('claims.title')}</Text>
                <TouchableOpacity style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.maxWidthContainer}>
                    {/* Hero Score Section */}
                    <View style={styles.scoreSection}>
                        <View style={styles.scoreCircle}>
                            <MaterialCommunityIcons name="shield-check-outline" size={32} color="#FFFFFF" />
                            <Text style={styles.scoreValue}>{aggregateScore}%</Text>
                        </View>
                        <View style={styles.scoreInfo}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.scoreTitle}>{t('claims.heroTitle')}</Text>
                                <TouchableOpacity
                                    style={styles.verifyBadge}
                                    onPress={() => navigation.navigate('Verification')}
                                >
                                    <Text style={styles.verifyBadgeText}>{t('claims.verifyAll', 'FIX GAPS')}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={14} color="#10B981" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.scoreDesc}>
                                {t('claims.heroDesc', { percent: aggregateScore })}
                            </Text>
                        </View>
                    </View>

                    {/* Export Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.cardIconContainer, { backgroundColor: '#3B82F615' }]}>
                                <MaterialCommunityIcons name="zip-box" size={32} color="#3B82F6" />
                            </View>
                            <View style={styles.cardHeaderText}>
                                <Text style={styles.cardTitle}>{t('claims.zipTitle')}</Text>
                                <Text style={styles.cardSubtitle}>{t('claims.zipSubtitle')}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.exportButton, { backgroundColor: isPro ? colors.primary : colors.surfaceVariant }]}
                            onPress={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <ActivityIndicator color={isPro ? "#FFF" : colors.text} />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    {!isPro && <MaterialCommunityIcons name="lock" size={16} color={colors.text} />}
                                    <Text style={[styles.exportButtonText, { color: isPro ? '#FFF' : colors.text }]}>{t('claims.generatePack')}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Export Actions */}
                    <Text style={[styles.sectionTitle, { marginTop: 12 }]}>{t('claims.assetReports')}</Text>
                    <TouchableOpacity
                        style={styles.exportCard}
                        onPress={handleGenerateSummary}
                    >
                        <View style={[styles.exportIcon, { backgroundColor: `${colors.primary}15` }]}>
                            <MaterialCommunityIcons name="file-document-outline" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.exportInfo}>
                            <Text style={styles.exportTitle}>{t('claims.summaryTitle')}</Text>
                            <Text style={styles.exportDesc}>{t('claims.summaryDesc')}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Readiness Breakdown */}
                    <Text style={styles.sectionTitle}>{t('claims.gaps')}</Text>
                    {totalItems === 0 ? (
                        <View style={styles.emptyCard}>
                            <MaterialCommunityIcons name="package-variant" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
                            <Text style={styles.emptyTitle}>{t('claims.noItemsYet', 'No Items Yet')}</Text>
                            <Text style={styles.emptyDesc}>{t('claims.noItemsDesc', 'Add items to your vault to track their documentation status.')}</Text>
                            <TouchableOpacity
                                style={styles.addItemButton}
                                onPress={() => navigation.navigate('AddItem')}
                            >
                                <MaterialCommunityIcons name="plus" size={18} color="#FFF" style={{ marginRight: 6 }} />
                                <Text style={styles.addItemButtonText}>{t('claims.addFirstItem', 'Add First Item')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : documentationNeeded.length === 0 ? (
                        <View style={styles.perfectCard}>
                            <MaterialCommunityIcons name="shield-check" size={64} color="#10B981" style={{ marginBottom: 16 }} />
                            <Text style={styles.perfectTitle}>{t('claims.perfectTitle')}</Text>
                            <Text style={styles.perfectDesc}>{t('claims.perfectDesc')}</Text>
                        </View>
                    ) : (
                        <>
                            {documentationNeeded.map((doc: any) => (
                                <TouchableOpacity
                                    key={doc.id}
                                    style={styles.missingItemCard}
                                    onPress={() => navigation.navigate('ItemDetail', { itemId: doc.id })}
                                >
                                    <View style={styles.missingInfo}>
                                        <Text style={styles.itemName}>{doc.name}</Text>
                                        <View style={styles.missingBadges}>
                                            {doc.missing.photos && (
                                                <View style={[styles.badge, { backgroundColor: `${colors.error}15` }]}>
                                                    <MaterialCommunityIcons name="camera-off" size={10} color={colors.error} style={{ marginRight: 4 }} />
                                                    <Text style={[styles.badgeText, { color: colors.error }]}>Photo</Text>
                                                </View>
                                            )}
                                            {doc.missing.price && (
                                                <View style={[styles.badge, { backgroundColor: `${colors.error}15` }]}>
                                                    <MaterialCommunityIcons name="cash" size={10} color={colors.error} style={{ marginRight: 4 }} />
                                                    <Text style={[styles.badgeText, { color: colors.error }]}>Price</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>
        </View>
    );
}

function getStyles(colors: any, isDark: boolean) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            backgroundColor: colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            ...StyleSheet.flatten(isDark ? {} : {
                shadowColor: '#64748B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
                elevation: 4,
            }),
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surfaceVariant,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            letterSpacing: 1,
        },
        placeholder: {
            width: 40,
        },
        content: {
            flex: 1,
        },
        maxWidthContainer: {
            maxWidth: 560,
            width: '100%',
            alignSelf: 'center',
            padding: 20,
        },
        scoreSection: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#10B981',
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
        },
        scoreCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 20,
        },
        scoreValue: {
            fontSize: 22,
            fontWeight: '800',
            color: '#FFFFFF',
        },
        scoreInfo: {
            flex: 1,
        },
        scoreTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: 4,
        },
        scoreDesc: {
            fontSize: 14,
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 20,
        },
        verifyBadge: {
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
        },
        verifyBadgeText: {
            fontSize: 11,
            fontWeight: '800',
            color: '#10B981',
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        cardIconContainer: {
            width: 56,
            height: 56,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        },
        cardHeaderText: {
            flex: 1,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
        },
        cardSubtitle: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        exportButton: {
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
        },
        exportButtonText: {
            fontWeight: '700',
            fontSize: 15,
        },
        sectionTitle: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 16,
        },
        missingItemCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
        },
        missingInfo: {
            flex: 1,
        },
        itemName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 6,
        },
        missingBadges: {
            flexDirection: 'row',
            gap: 6,
        },
        badge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            flexDirection: 'row',
            alignItems: 'center',
        },
        badgeText: {
            fontSize: 10,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        perfectCard: {
            alignItems: 'center',
            padding: 40,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#BBF7D0',
        },
        perfectTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: isDark ? '#10B981' : '#166534',
            marginBottom: 8,
        },
        perfectDesc: {
            fontSize: 14,
            color: isDark ? colors.textSecondary : '#15803d',
            textAlign: 'center',
        },
        exportCard: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
        },
        exportIcon: {
            width: 56,
            height: 56,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        exportInfo: {
            flex: 1,
        },
        exportTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        exportDesc: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        bottomSpacer: {
            height: 40,
        },
        emptyCard: {
            alignItems: 'center',
            padding: 32,
            borderRadius: 20,
            borderWidth: 1,
            backgroundColor: colors.surface,
            borderColor: colors.border,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 8,
        },
        emptyDesc: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 20,
        },
        addItemButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 24,
            backgroundColor: colors.primary,
        },
        addItemButtonText: {
            fontSize: 15,
            fontWeight: '600',
            color: '#FFF',
        },
    });
}
