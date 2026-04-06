import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../core/i18n';

export default function BuildComparisonScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { buildA } = route.params || {};

    const [buildB, setBuildB] = useState(null);
    const [availableBuilds, setAvailableBuilds] = useState([]);
    const [showPicker, setShowPicker] = useState(true);

    useEffect(() => {
        loadAvailableBuilds();
    }, []);

    const loadAvailableBuilds = async () => {
        try {
            const buildsData = await AsyncStorage.getItem('nexusbuild_saved_builds');
            const builds = buildsData ? JSON.parse(buildsData) : [];
            // Filter out the current build
            const otherBuilds = builds.filter(b => b.id !== buildA?.id);
            setAvailableBuilds(otherBuilds);
        } catch (error) {
            console.error('Failed to load builds:', error);
        }
    };

    const selectBuildB = (build) => {
        setBuildB(build);
        setShowPicker(false);
    };

    const getComponentPrice = (build, componentType) => {
        if (!build || !build.components) return null;
        const component = build.components.find(c =>
            c.category?.toLowerCase() === componentType.toLowerCase()
        );
        return component?.price || null;
    };

    const getComponentName = (build, componentType) => {
        if (!build || !build.components) return t('buildComparison.notSelected');
        const component = build.components.find(c =>
            c.category?.toLowerCase() === componentType.toLowerCase()
        );
        return component?.name || t('buildComparison.notSelected');
    };

    const componentTypes = [
        { type: 'GPU', label: t('buildComparison.componentTypes.gpu') },
        { type: 'CPU', label: t('buildComparison.componentTypes.cpu') },
        { type: 'RAM', label: t('buildComparison.componentTypes.ram') },
        { type: 'Motherboard', label: t('buildComparison.componentTypes.motherboard') },
        { type: 'PSU', label: t('buildComparison.componentTypes.psu') },
        { type: 'Storage', label: t('buildComparison.componentTypes.storage') },
        { type: 'Case', label: t('buildComparison.componentTypes.case') },
    ];

    const styles = StyleSheet.create({
        container: {
            padding: theme.spacing.lg,
        },
        title: {
            fontSize: theme.fontSize.xxl,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.lg,
            textAlign: 'center',
        },
        vsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.lg,
        },
        buildColumn: {
            flex: 1,
            padding: theme.spacing.sm,
        },
        buildTitle: {
            fontSize: theme.fontSize.lg,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: theme.spacing.sm,
        },
        buildPrice: {
            fontSize: theme.fontSize.xl,
            fontWeight: 'bold',
            color: theme.colors.success,
            textAlign: 'center',
        },
        vsText: {
            fontSize: theme.fontSize.xl,
            fontWeight: 'bold',
            color: theme.colors.accentPrimary,
            alignSelf: 'center',
            paddingHorizontal: theme.spacing.md,
        },
        comparisonRow: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.glassBorder,
            paddingVertical: theme.spacing.md,
        },
        componentLabel: {
            width: 80,
            fontSize: theme.fontSize.sm,
            fontWeight: 'bold',
            color: theme.colors.accentPrimary,
            alignSelf: 'center',
        },
        componentCell: {
            flex: 1,
            paddingHorizontal: theme.spacing.xs,
        },
        componentName: {
            fontSize: theme.fontSize.sm,
            color: theme.colors.textPrimary,
        },
        componentPrice: {
            fontSize: theme.fontSize.xs,
            color: theme.colors.textSecondary,
        },
        winner: {
            backgroundColor: theme.colors.success + '20',
            borderRadius: theme.borderRadius.sm,
            padding: theme.spacing.xs,
        },
        winnerBadge: {
            fontSize: theme.fontSize.xs,
            color: theme.colors.success,
            fontWeight: 'bold',
        },
        pickerOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            padding: theme.spacing.lg,
        },
        pickerTitle: {
            fontSize: theme.fontSize.xl,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
        },
        pickerItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
        },
        pickerItemName: {
            fontSize: theme.fontSize.md,
            color: theme.colors.textPrimary,
        },
        pickerItemPrice: {
            fontSize: theme.fontSize.md,
            color: theme.colors.success,
        },
        summaryCard: {
            marginTop: theme.spacing.lg,
            padding: theme.spacing.lg,
        },
        summaryTitle: {
            fontSize: theme.fontSize.lg,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.md,
        },
        summaryText: {
            fontSize: theme.fontSize.md,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
        },
    });

    const renderComparison = () => {
        if (!buildA || !buildB) return null;

        const totalA = buildA.total_price || 0;
        const totalB = buildB.total_price || 0;
        const priceDiff = Math.abs(totalA - totalB);
        const winner = totalA < totalB ? 'A' : (totalB < totalA ? 'B' : 'Tie');

        return (
            <>
                <View style={styles.vsContainer}>
                    <View style={styles.buildColumn}>
                        <Text style={styles.buildTitle}>{buildA.name || t('buildComparison.buildAName')}</Text>
                        <Text style={styles.buildPrice}>${totalA.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.vsText}>{t('buildComparison.vs')}</Text>
                    <View style={styles.buildColumn}>
                        <Text style={styles.buildTitle}>{buildB.name || t('buildComparison.buildBName')}</Text>
                        <Text style={styles.buildPrice}>${totalB.toFixed(2)}</Text>
                    </View>
                </View>

                <GlassCard>
                    {componentTypes.map(({ type, label }) => {
                        const priceA = getComponentPrice(buildA, type);
                        const priceB = getComponentPrice(buildB, type);
                        const nameA = getComponentName(buildA, type);
                        const nameB = getComponentName(buildB, type);
                        const isWinnerA = priceA && priceB && priceA < priceB;
                        const isWinnerB = priceA && priceB && priceB < priceA;

                        return (
                            <View key={type} style={styles.comparisonRow}>
                                <Text style={styles.componentLabel}>{label}</Text>
                                <View style={[styles.componentCell, isWinnerA && styles.winner]}>
                                    <Text style={styles.componentName} numberOfLines={1}>{nameA}</Text>
                                    {priceA && <Text style={styles.componentPrice}>${priceA.toFixed(2)}</Text>}
                                    {isWinnerA && <Text style={styles.winnerBadge}>{t('buildComparison.betterValue')}</Text>}
                                </View>
                                <View style={[styles.componentCell, isWinnerB && styles.winner]}>
                                    <Text style={styles.componentName} numberOfLines={1}>{nameB}</Text>
                                    {priceB && <Text style={styles.componentPrice}>${priceB.toFixed(2)}</Text>}
                                    {isWinnerB && <Text style={styles.winnerBadge}>{t('buildComparison.betterValue')}</Text>}
                                </View>
                            </View>
                        );
                    })}
                </GlassCard>

                <GlassCard style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>{t('buildComparison.summary.title')}</Text>
                    <Text style={styles.summaryText}>
                        {t('buildComparison.summary.priceDifference', { amount: priceDiff.toFixed(2) })}
                    </Text>
                    <Text style={styles.summaryText}>
                        {winner === 'Tie'
                            ? t('buildComparison.summary.tie')
                            : t('buildComparison.summary.cheaper', {
                                name: winner === 'A' ? (buildA.name || t('buildComparison.buildAName')) : (buildB.name || t('buildComparison.buildBName')),
                                amount: priceDiff.toFixed(2),
                            })
                        }
                    </Text>
                </GlassCard>
            </>
        );
    };

    return (
        <Layout>
            <Header navigation={navigation} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>
                    <Ionicons name="git-compare-outline" size={24} color={theme.colors.accentPrimary} />
                    {' '}{t('buildComparison.title')}
                </Text>

                {buildB ? (
                    renderComparison()
                ) : (
                    <GlassCard>
                        <Text style={styles.pickerTitle}>{t('buildComparison.selectPrompt', { name: buildA?.name || t('buildComparison.buildAName') })}</Text>
                        {availableBuilds.length === 0 ? (
                            <Text style={styles.summaryText}>{t('buildComparison.noOtherBuilds')}</Text>
                        ) : (
                            availableBuilds.map((build) => (
                                <TouchableOpacity key={build.id} onPress={() => selectBuildB(build)}>
                                    <GlassCard style={styles.pickerItem}>
                                        <Text style={styles.pickerItemName}>{build.name || t('buildComparison.untitled')}</Text>
                                        <Text style={styles.pickerItemPrice}>${build.total_price?.toFixed(2)}</Text>
                                    </GlassCard>
                                </TouchableOpacity>
                            ))
                        )}
                    </GlassCard>
                )}

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: theme.spacing.xl, alignSelf: 'center' }}
                >
                    <Text style={{ color: theme.colors.accentPrimary }}>{t('common.goBack')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </Layout>
    );
}
