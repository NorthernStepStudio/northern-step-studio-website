import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import PriceHistory from '../components/PriceHistory';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../core/i18n';

export default function ComparisonScreen({ navigation, route }) {
    const { part1, part2 } = route.params || {};
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'price'

    // Mock data if strictly testing without nav params
    const item1 = part1 || { name: 'Part A', price: 299.99, type: 'CPU', specs: { cores: 8, threads: 16, speed: '3.8GHz' } };
    const item2 = part2 || { name: 'Part B', price: 349.99, type: 'CPU', specs: { cores: 10, threads: 20, speed: '4.0GHz' } };

    const SpecRow = ({ label, val1, val2 }) => (
        <View style={[styles.row, { borderBottomColor: theme.colors.glassBorder }]}>
            <Text style={[styles.cell, styles.labelCell, { color: theme.colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.cell, { color: theme.colors.textPrimary, fontWeight: val1 === val2 ? 'normal' : 'bold' }]}>
                {val1}
            </Text>
            <Text style={[styles.cell, { color: theme.colors.textPrimary, fontWeight: val1 === val2 ? 'normal' : 'bold' }]}>
                {val2}
            </Text>
        </View>
    );

    return (
        <Layout>
            <Header navigation={navigation} title={t('comparison.title')} />

            <View style={styles.headerContainer}>
                <GlassCard style={styles.headerCard}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerItem}>
                            <View style={[styles.placeholderImg, { backgroundColor: theme.colors.glassBg }]}>
                                <Ionicons name="cube-outline" size={32} color={theme.colors.accentPrimary} />
                            </View>
                            <Text style={[styles.itemName, { color: theme.colors.textPrimary }]} numberOfLines={2}>{item1.name}</Text>
                            <Text style={[styles.itemPrice, { color: theme.colors.success }]}>${item1.price}</Text>
                            {/* Best Price Badge */}
                            {parseFloat(item1.price) < parseFloat(item2.price) && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.success + '20' }]}>
                                    <Ionicons name="pricetag" size={10} color={theme.colors.success} />
                                    <Text style={[styles.badgeText, { color: theme.colors.success }]}>{t('comparison.bestPrice') || 'BEST PRICE'}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.vsContainer}>
                            <Text style={[styles.vsText, { color: theme.colors.textMuted }]}>{t('comparison.vs')}</Text>
                        </View>
                        <View style={styles.headerItem}>
                            <View style={[styles.placeholderImg, { backgroundColor: theme.colors.glassBg }]}>
                                <Ionicons name="cube-outline" size={32} color={theme.colors.accentSecondary} />
                            </View>
                            <Text style={[styles.itemName, { color: theme.colors.textPrimary }]} numberOfLines={2}>{item2.name}</Text>
                            <Text style={[styles.itemPrice, { color: theme.colors.success }]}>${item2.price}</Text>
                            {/* Best Price Badge */}
                            {parseFloat(item2.price) < parseFloat(item1.price) && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.success + '20' }]}>
                                    <Ionicons name="pricetag" size={10} color={theme.colors.success} />
                                    <Text style={[styles.badgeText, { color: theme.colors.success }]}>{t('comparison.bestPrice') || 'BEST PRICE'}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </GlassCard>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'specs' && styles.activeTab, { borderBottomColor: activeTab === 'specs' ? theme.colors.accentPrimary : 'transparent' }]}
                    onPress={() => setActiveTab('specs')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'specs' ? theme.colors.accentPrimary : theme.colors.textSecondary }]}>{t('comparison.tabs.specs')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'price' && styles.activeTab, { borderBottomColor: activeTab === 'price' ? theme.colors.accentPrimary : 'transparent' }]}
                    onPress={() => setActiveTab('price')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'price' ? theme.colors.accentPrimary : theme.colors.textSecondary }]}>{t('comparison.tabs.price')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'specs' ? (
                    <View>
                        {/* Performance Score Section - Only for CPUs/GPUs */}
                        {(item1.score || item2.score) && (
                            <GlassCard style={[styles.specsCard, { marginBottom: 16 }]}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 12 }]}>
                                    {t('comparison.performanceScore')}
                                </Text>
                                <View style={styles.scoreContainer}>
                                    <View style={styles.scoreItem}>
                                        <Text style={[styles.scoreValue, { color: (item1.score || 0) >= (item2.score || 0) ? theme.colors.success : theme.colors.error }]}>
                                            {item1.score?.toLocaleString() || '-'}
                                        </Text>
                                        <View style={[styles.scoreBar, { backgroundColor: theme.colors.glassBorder }]}>
                                            <View style={[styles.scoreBarFill, {
                                                width: `${Math.min(100, ((item1.score || 0) / Math.max(item1.score || 1, item2.score || 1)) * 100)}%`,
                                                backgroundColor: (item1.score || 0) >= (item2.score || 0) ? theme.colors.success : theme.colors.error
                                            }]} />
                                        </View>
                                        {(item1.score || 0) > (item2.score || 0) && (
                                            <View style={[styles.badge, { backgroundColor: theme.colors.success + '20', marginTop: 8 }]}>
                                                <Ionicons name="trophy" size={10} color={theme.colors.success} />
                                                <Text style={[styles.badgeText, { color: theme.colors.success }]}>WINNER</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.scoreItem}>
                                        <Text style={[styles.scoreValue, { color: (item2.score || 0) >= (item1.score || 0) ? theme.colors.success : theme.colors.error }]}>
                                            {item2.score?.toLocaleString() || '-'}
                                        </Text>
                                        <View style={[styles.scoreBar, { backgroundColor: theme.colors.glassBorder }]}>
                                            <View style={[styles.scoreBarFill, {
                                                width: `${Math.min(100, ((item2.score || 0) / Math.max(item1.score || 1, item2.score || 1)) * 100)}%`,
                                                backgroundColor: (item2.score || 0) >= (item1.score || 0) ? theme.colors.success : theme.colors.error
                                            }]} />
                                        </View>
                                        {(item2.score || 0) > (item1.score || 0) && (
                                            <View style={[styles.badge, { backgroundColor: theme.colors.success + '20', marginTop: 8 }]}>
                                                <Ionicons name="trophy" size={10} color={theme.colors.success} />
                                                <Text style={[styles.badgeText, { color: theme.colors.success }]}>WINNER</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <Text style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
                                    {item1.category === 'cpu' ? t('comparison.benchmark.cpu') : t('comparison.benchmark.gpu')}
                                </Text>
                            </GlassCard>
                        )}

                        {/* Detailed Specs Table */}
                        <GlassCard style={styles.specsCard}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, padding: 16, paddingBottom: 8 }]}>
                                {t('comparison.specsTitle')}
                            </Text>
                            <SpecRow label={t('comparison.specs.type')} val1={item1.type || item1.category} val2={item2.type || item2.category} />
                            <SpecRow label={t('comparison.specs.manufacturer')} val1={item1.manufacturer || '-'} val2={item2.manufacturer || '-'} />
                            <SpecRow label={t('comparison.specs.price')} val1={`$${item1.price}`} val2={`$${item2.price}`} highlight={parseFloat(item1.price) < parseFloat(item2.price) ? 1 : parseFloat(item2.price) < parseFloat(item1.price) ? 2 : 0} />

                            {/* Dynamic Spec Rendering based on common keys in specs object */}
                            {Object.keys({ ...item1.specs, ...item2.specs }).map(key => {
                                const val1 = item1.specs?.[key] || '-';
                                const val2 = item2.specs?.[key] || '-';
                                // Format key nicely
                                const label = key
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, l => l.toUpperCase());
                                return (
                                    <SpecRow
                                        key={key}
                                        label={label}
                                        val1={val1}
                                        val2={val2}
                                    />
                                );
                            })}
                        </GlassCard>

                        {/* Value Analysis */}
                        <GlassCard style={[styles.specsCard, { marginTop: 16, padding: 16 }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 12 }]}>
                                {t('comparison.valueAnalysis')}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{t('comparison.pricePerformance')}</Text>
                                    <Text style={{ color: theme.colors.accentPrimary, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>
                                        {item1.score ? (item1.price / item1.score * 1000).toFixed(2) : '-'}
                                    </Text>
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>{t('comparison.pricePerScore')}</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{t('comparison.pricePerformance')}</Text>
                                    <Text style={{ color: theme.colors.accentSecondary, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>
                                        {item2.score ? (item2.price / item2.score * 1000).toFixed(2) : '-'}
                                    </Text>
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>{t('comparison.pricePerScore')}</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </View>
                ) : (
                    <View>
                        <PriceHistory data={null} />
                        <Text style={{ textAlign: 'center', color: theme.colors.textMuted, marginTop: 10 }}>
                            {t('comparison.priceHistoryNote')}
                        </Text>
                    </View>
                )
                }
            </ScrollView >
        </Layout >
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        marginTop: 10,
    },
    headerCard: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerItem: {
        flex: 1,
        alignItems: 'center',
    },
    vsContainer: {
        width: 40,
        alignItems: 'center',
    },
    vsText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    placeholderImg: {
        width: 60,
        height: 60,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
        height: 40,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        marginTop: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ffffff20',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    specsCard: {
        padding: 0,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },
    labelCell: {
        textAlign: 'left',
        fontWeight: '600',
        flex: 0.8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 20,
        paddingHorizontal: 16,
    },
    scoreItem: {
        flex: 1,
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreBar: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 4,
        marginTop: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
