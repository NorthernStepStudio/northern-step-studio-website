import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    useWindowDimensions,
    Image,
    Platform,
    Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import Layout from '../components/Layout';
import { useBuild } from '../contexts/BuildContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import GlassCard from '../components/GlassCard';
import BudgetControl from '../components/BudgetControl';
import BudgetAllocationCard from '../components/BudgetAllocationCard';
import { chatAPI } from '../services/api';
import { haptics } from '../services/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../core/i18n';
import { resolveBenchmarkScore } from '../core/performanceScore';
import { darkTheme, sharedTheme } from '../theme/themes';
import { eventTracker } from '../state/eventTracker';

// Static theme for StyleSheet.create() - uses dark theme defaults
// Dynamic theme from useTheme() is used in components for runtime values
const theme = { ...darkTheme, ...sharedTheme };

const PART_CATEGORIES = [
    { key: 'cpu', name: 'CPU', icon: 'hardware-chip' },
    { key: 'gpu', name: 'GPU', icon: 'game-controller' },
    { key: 'motherboard', name: 'Motherboard', icon: 'grid' },
    { key: 'ram', name: 'RAM', icon: 'flash' },
    { key: 'storage', name: 'Storage', icon: 'save' },
    { key: 'psu', name: 'Power Supply', icon: 'battery-charging' },
    { key: 'case', name: 'Case', icon: 'cube' },
    { key: 'cooler', name: 'Cooler', icon: 'snow' },
    { key: 'fan', name: 'Case Fans', icon: 'aperture' }, // Ionicons closest match
    { key: 'monitor', name: 'Monitor', icon: 'desktop' },
    { key: 'keyboard', name: 'Keyboard', icon: 'keypad' },
    { key: 'mouse', name: 'Mouse', icon: 'hand-left' }, // Closest to mouse
    { key: 'os', name: 'Operating System', icon: 'disc' },
    { key: 'accessory', name: 'Accessories', icon: 'headset' },
];

import { checkCompatibility } from '../domain/builds';
// from '../services/mockData';

const normalizeRecommendations = (data) => {
    if (!data) return [];

    if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return data.recommendations.map((recommendation) => ({
            component: recommendation.component,
            amount: recommendation.amount ?? data.allocation?.[recommendation.component],
            explanation: recommendation.explanation || recommendation.reason || '',
        }));
    }

    const allocation = data.allocation || data;
    const explanations = data.explanations || {};

    return Object.entries(allocation).map(([component, amount]) => ({
        component,
        amount,
        explanation: explanations[component] || '',
    }));
};

// Compatibility Status Component
const CompatibilityStatus = ({ currentBuild }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const issues = [];

    // Check every part against the rest of the build
    Object.values(currentBuild.parts).forEach(part => {
        if (!part) return;
        const result = checkCompatibility(part, currentBuild);
        if (result && result.compatible === false) {
            // Avoid duplicate messages
            if (!issues.includes(result.reason)) {
                issues.push(result.reason);
            }
        }
    });

    // Also check for missing core components to warn user they can't boot
    const coreParts = ['cpu', 'motherboard', 'ram', 'storage', 'psu'];
    const missingCore = coreParts.filter(key => !currentBuild.parts[key]);
    const isBootable = missingCore.length === 0;
    const partCount = Object.values(currentBuild.parts).filter(p => p).length;

    if (partCount === 0) {
        return (
            <GlassCard style={[styles.compatibilityCard, styles.sectionSpacer]}>
                <View style={styles.compatibilityHeader}>
                    <Ionicons name="construct-outline" size={24} color={theme.colors.accentPrimary} />
                    <Text style={[styles.compatibilityTitle, { color: theme.colors.textPrimary }]}>{t('builder.compatibility.ready_title')}</Text>
                </View>
                <Text style={[styles.compatibilityText, { color: theme.colors.textSecondary }]}>
                    {t('builder.compatibility.ready_text')}
                </Text>
            </GlassCard>
        );
    }

    if (issues.length === 0) {
        return (
            <GlassCard style={[styles.compatibilityCard, styles.sectionSpacer]}>
                <View style={styles.compatibilityHeader}>
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                    <Text style={[styles.compatibilityTitle, { color: theme.colors.textPrimary }]}>{t('builder.compatibility.success_title')}</Text>
                </View>
                <Text style={[styles.compatibilityText, { color: theme.colors.textSecondary }]}>
                    {t('builder.compatibility.success_text')}
                </Text>
                {!isBootable && (
                    <Text style={[styles.compatibilityText, { marginTop: 10, color: theme.colors.textMuted, fontSize: 12 }]}>
                        {t('builder.compatibility.missing_core', { parts: missingCore.map(k => k.toUpperCase()).join(', ') })}
                    </Text>
                )}
            </GlassCard>
        );
    }

    return (
        <GlassCard style={[styles.compatibilityCard, styles.sectionSpacer, { borderColor: theme.colors.error }]}>
            <View style={styles.compatibilityHeader}>
                <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
                <Text style={[styles.compatibilityTitle, { color: theme.colors.error }]}>{t('builder.compatibility.error_title')}</Text>
            </View>
            <View style={{ gap: 8 }}>
                {issues.map((issue, index) => (
                    <View key={index} style={{ flexDirection: 'row', gap: 8 }}>
                        <Ionicons name="warning" size={16} color={theme.colors.error} style={{ marginTop: 2 }} />
                        <Text style={[styles.compatibilityText, { color: theme.colors.textPrimary, flex: 1 }]}>
                            {issue}
                        </Text>
                    </View>
                ))}
            </View>
        </GlassCard>
    );
};

// Build Performance Score Component (shows combined CPU+GPU benchmark)
const MAX_POSSIBLE_SCORE = 45000;
const TIERS = [
    { min: 0, max: 0.25, name: 'Office Drone', color: '#00D4FF', icon: 'desktop-outline' },      // Cyan
    { min: 0.25, max: 0.50, name: 'Console Crusher', color: '#8B5CF6', icon: 'game-controller-outline' }, // Purple
    { min: 0.50, max: 0.75, name: 'High-End Warrior', color: '#D946EF', icon: 'rocket-outline' },  // Magenta/Pink
    { min: 0.75, max: 1.0, name: 'Nexus Enthusiast Guide', color: '#FF2D55', icon: 'flash' },                   // Hot Red/Pink (like logo)
];

const BuildPerformanceScore = ({ currentBuild }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    useEffect(() => {
        if (currentBuild.parts?.cpu && currentBuild.parts?.gpu) {
            eventTracker.track('full_review_view', {
                cpu: currentBuild.parts.cpu.name,
                gpu: currentBuild.parts.gpu.name
            });
        }
    }, []);
    const cpu = currentBuild.parts?.cpu;
    const gpu = currentBuild.parts?.gpu;

    // Calculate score only if both CPU and GPU are selected
    if (!cpu || !gpu) {
        return null; // Don't show if missing CPU or GPU
    }

    const cpuScore = resolveBenchmarkScore(cpu);
    const gpuScore = resolveBenchmarkScore(gpu);
    const combinedScore = cpuScore + gpuScore;
    const percentage = Math.min(combinedScore / MAX_POSSIBLE_SCORE, 1);

    // Detect bottleneck
    let bottleneck = null;
    if (cpuScore > 0 && gpuScore > 0) {
        const ratio = cpuScore / gpuScore;
        if (ratio > 1.5) bottleneck = 'GPU';
        else if (ratio < 0.67) bottleneck = 'CPU';
    }

    // Determine tier
    const tier = TIERS.find(t => percentage >= t.min && percentage < t.max) || TIERS[TIERS.length - 1];

    return (
        <GlassCard style={[styles.compatibilityCard, styles.sectionSpacer]}>
            <View style={styles.compatibilityHeader}>
                <Ionicons name="speedometer" size={24} color={tier.color} />
                <Text style={[styles.compatibilityTitle, { color: theme.colors.textPrimary }]}>Build Performance</Text>
            </View>

            {/* Score Display */}
            <View style={{ alignItems: 'center', marginVertical: 15 }}>
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: tier.color }}>{combinedScore.toLocaleString()}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Nexus Power Score</Text>
            </View>

            {/* Progress Bar */}
            <View style={{ height: 8, backgroundColor: theme.colors.glassBg, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                <View style={{ height: '100%', width: `${percentage * 100}%`, backgroundColor: tier.color, borderRadius: 4 }} />
            </View>

            {/* Tier Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <View style={tier.name === 'Nexus Enthusiast Guide' ? {
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 10
                } : {}}>
                    <Ionicons name={tier.icon} size={20} color={tier.name === 'Nexus Enthusiast Guide' ? '#FFD700' : tier.color} />
                </View>
                <Text style={{
                    color: tier.color,
                    fontWeight: 'bold',
                    fontSize: 16,
                    textShadowColor: '#8B5CF6',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: tier.name === 'Nexus Enthusiast Guide' ? 15 : 0
                }}>{tier.name}</Text>
            </View>

            {/* Bottleneck Warning */}
            {bottleneck && (
                <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 10, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="warning" size={18} color="#F59E0B" />
                        <Text style={{ color: '#F59E0B', fontSize: 13, flex: 1, fontWeight: '500' }}>
                            {bottleneck} bottleneck detected. Consider upgrading your {bottleneck}.
                        </Text>
                    </View>

                    {/* Separator */}
                    <View style={{ height: 1, backgroundColor: 'rgba(245, 158, 11, 0.2)', marginVertical: 10 }} />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ChatTab', { screen: 'ChatMain', params: { mode: 'assistant' } })}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            backgroundColor: 'rgba(139, 92, 246, 0.15)',
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        <Ionicons name="chatbubble-ellipses" size={14} color={theme.colors.accentPrimary} />
                        <Text style={{ color: theme.colors.accentPrimary, fontSize: 12, fontWeight: '600' }}>
                            Need help? Ask our Expert AI Nexus
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={theme.colors.accentPrimary} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Game-Specific FPS Estimates */}
            <View style={{ marginTop: 15 }}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginBottom: 10, textAlign: 'center' }}>Estimated Performance</Text>
                <View style={{ gap: 8 }}>
                    {/* Fortnite - Easy to run */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#9146FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <Ionicons name="game-controller" size={14} color="white" />
                        </View>
                        <Text style={{ color: theme.colors.textSecondary, flex: 1, fontSize: 13 }}>Fortnite (1080p)</Text>
                        <Text style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 14 }}>{Math.round(percentage * 240)} FPS</Text>
                    </View>
                    {/* Warzone - Medium */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#5D8F2E', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <Ionicons name="skull" size={14} color="white" />
                        </View>
                        <Text style={{ color: theme.colors.textSecondary, flex: 1, fontSize: 13 }}>Warzone (1440p)</Text>
                        <Text style={{ color: '#facc15', fontWeight: 'bold', fontSize: 14 }}>{Math.round(percentage * 140)} FPS</Text>
                    </View>
                    {/* Cyberpunk - Hard to run */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#FCEE0A', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <Ionicons name="body" size={14} color="#000" />
                        </View>
                        <Text style={{ color: theme.colors.textSecondary, flex: 1, fontSize: 13 }}>Cyberpunk 2077 (4K)</Text>
                        <Text style={{ color: '#f87171', fontWeight: 'bold', fontSize: 14 }}>{Math.round(percentage * 45)} FPS</Text>
                    </View>
                </View>
            </View>
        </GlassCard>
    );
};

export default function BuilderScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { currentBuild, addPart, removePart, clearBuild, saveBuild, loadBuild, getTotalPrice, getPartCount, setUseCase } = useBuild();
    const { isAuthenticated } = useAuth();
    const { addBuildSavedNotification } = useNotifications();
    const [buildName, setBuildName] = useState(currentBuild.name);
    const mobileScrollRef = useRef(null);
    const smartBuildSectionRef = useRef(null);

    useEffect(() => {
        eventTracker.track('builder_view', { from: route.params?.from || 'direct' });
    }, []);

    // Check for build to load from Gallery
    React.useEffect(() => {
        if (route.params?.initialBuild) {
            loadBuild(route.params.initialBuild);
            setBuildName(route.params.initialBuild.name);
            // Clear params so it doesn't reload on every render/focus if not intended
            navigation.setParams({ initialBuild: null });
        }
    }, [route.params?.initialBuild]);

    // Budget Allocation Logic (Lifted State)
    const [allocationData, setAllocationData] = useState(null);
    const [allocationLoading, setAllocationLoading] = useState(false);

    React.useEffect(() => {
        let isMounted = true;
        const maxBudget = currentBuild.budget?.max || 0;
        const useCase = currentBuild.useCase;

        if (!maxBudget || !useCase) {
            setAllocationData(null);
            setAllocationLoading(false);
            return;
        }

        const fetchAllocation = async () => {
            setAllocationLoading(true);
            try {
                const data = await chatAPI.getBudgetAllocation(maxBudget, useCase);
                if (isMounted) {
                    setAllocationData({
                        raw: data,
                        normalized: normalizeRecommendations(data)
                    });
                }
            } catch (err) {
                console.log('Allocation fetch error', err);
            } finally {
                if (isMounted) setAllocationLoading(false);
            }
        };

        fetchAllocation();
        return () => { isMounted = false; };
    }, [currentBuild.budget?.max, currentBuild.useCase]);

    useEffect(() => {
        if (!currentBuild.budget?.max || !currentBuild.useCase) return;
        const scrollTarget = smartBuildSectionRef.current;
        const scrollView = mobileScrollRef.current;
        if (!scrollTarget || !scrollView?.scrollTo) return;

        const timer = setTimeout(() => {
            scrollTarget.measureLayout(
                scrollView,
                (_x, y) => {
                    scrollView.scrollTo({ y: Math.max(y - 16, 0), animated: true });
                },
                () => {}
            );
        }, 250);

        return () => clearTimeout(timer);
    }, [currentBuild.budget?.max, currentBuild.useCase]);

    const handleSaveBuild = async () => {
        if (!isAuthenticated) {
            haptics.warning();
            if (Platform.OS === 'web') {
                window.alert('Login Required: Please login to save your build');
            } else {
                Alert.alert('Login Required', 'Please login to save your build');
            }
            return;
        }

        const result = await saveBuild();

        if (result.success) {
            haptics.success();
            // Trigger notification
            addBuildSavedNotification(currentBuild.name || 'My Build');
            if (Platform.OS === 'web') {
                window.alert('Success: Build saved successfully!');
            } else {
                Alert.alert('Success', 'Build saved successfully!');
            }
        } else {
            haptics.error();
            if (Platform.OS === 'web') {
                window.alert(`Error: ${result.error}`);
            } else {
                Alert.alert('Error', result.error);
            }
        }
    };

    const handleClearBuild = () => {
        haptics.warning();
        if (Platform.OS === 'web') {
            setTimeout(() => {
                if (window.confirm('Clear Build: Are you sure you want to clear all parts?')) {
                    clearBuild();
                }
            }, 100);
        } else {
            Alert.alert(
                'Clear Build',
                'Are you sure you want to clear all parts?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clearBuild },
                ]
            );
        }
    };

    const handleShareBuild = async () => {
        haptics.medium();
        const parts = currentBuild.parts;
        const partLines = Object.entries(parts)
            .filter(([key, part]) => part)
            .map(([key, part]) => `• ${key.toUpperCase()}: ${part.name} - $${part.price}`)
            .join('\n');

        if (!partLines) {
            if (Platform.OS === 'web') {
                window.alert('Add some parts first to share your build!');
            } else {
                Alert.alert('Empty Build', 'Add some parts first to share your build!');
            }
            return;
        }

        const shareMessage = `🖥️ Check out my NexusBuild PC Build!\n\n${buildName || 'My Gaming PC'}\n\n${partLines}\n\n💰 Total: $${getTotalPrice().toFixed(2)}\n\nBuilt with NexusBuild 🚀`;

        try {
            if (Platform.OS === 'web') {
                // Web: Use clipboard or navigator.share if available
                if (navigator.share) {
                    await navigator.share({
                        title: buildName || 'My NexusBuild PC',
                        text: shareMessage,
                    });
                } else {
                    await navigator.clipboard.writeText(shareMessage);
                    window.alert('Build copied to clipboard!');
                }
            } else {
                await Share.share({
                    message: shareMessage,
                    title: buildName || 'My NexusBuild PC',
                });
            }
        } catch (error) {
            // console.log('Share error:', error);
        }
    };

    const handleBuyParts = () => {
        const missingCore = ['cpu', 'motherboard', 'ram', 'storage', 'psu', 'case'].find((key) => !currentBuild.parts[key]);
        const targetCategory = missingCore || 'cpu';
        eventTracker.track('buy_parts_click', { source: 'builder', category: targetCategory });
        navigation.navigate('PartSelection', {
            category: targetCategory,
            categoryName: PART_CATEGORIES.find((item) => item.key === targetCategory)?.name || targetCategory.toUpperCase(),
            mode: 'buy',
        });
    };

    const { width } = useWindowDimensions();
    const isDesktop = width >= 768; // Breakpoint for side-by-side

    return (
        <Layout stickyHeader={<Header navigation={navigation} />}>

            <View style={[styles.container, isDesktop && styles.containerDesktop]}>

                {/* LEFT COLUMN - Parts Selection */}
                {/* On Mobile: This ScrollView becomes the MAIN wrapper for everything */}
                <ScrollView
                    ref={mobileScrollRef}
                    style={[styles.scrollView, isDesktop && styles.leftColumn]}
                    contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
                    showsVerticalScrollIndicator={false}
                >
                    <TextInput
                        style={[styles.buildNameInput, { color: theme.colors.textPrimary }]}
                        value={buildName}
                        onChangeText={setBuildName}
                        placeholder={t('builder.build_name_placeholder')}
                        placeholderTextColor={theme.colors.textMuted}
                    />

                    {/* MOBILE ONLY: Planning Tools (Budget & Allocation) appear HERE, at the top */}
                    {!isDesktop && (
                        <View style={styles.sectionSpacer}>
                            <View style={{ marginBottom: 16 }}>
                                <Text style={{ color: theme.colors.accentPrimary, fontSize: 13, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' }}>
                                    Step 1: Plan Your Build
                                </Text>
                                <GlassCard style={styles.statsCard}>
                                    <View style={styles.buildStats}>
                                        <View style={styles.stat}>
                                            <Ionicons name="cube" size={20} color={theme.colors.accentPrimary} />
                                            <Text style={[styles.statText, { color: theme.colors.textPrimary }]}>{t('builder.stats.parts_count', { count: getPartCount(), max: 8 })}</Text>
                                        </View>
                                        <View style={styles.stat}>
                                            <Ionicons name="cash" size={20} color={theme.colors.success} />
                                            <Text style={[styles.statText, { color: theme.colors.textPrimary }]}>${getTotalPrice().toFixed(2)}</Text>
                                        </View>
                                    </View>
                                </GlassCard>
                            </View>
                            <BudgetControl />
                            <BudgetAllocationCard
                                recommendations={allocationData?.normalized}
                                loading={allocationLoading}
                                useCase={currentBuild.useCase}
                                setUseCase={setUseCase}
                                maxBudget={currentBuild.budget?.max || 0}
                            />
                            <View ref={smartBuildSectionRef} style={styles.sectionSpacer}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="sparkles" size={20} color={theme.colors.accentPrimary} />
                                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Smart Build AI</Text>
                                </View>
                                <Text style={[styles.smartBuildHint, { color: theme.colors.textSecondary }]}>
                                    Use the Smart Build card below to generate a gaming, streaming, or workstation build, then add selected parts or all parts to your Builder.
                                </Text>
                            </View>
                            <View style={{ marginTop: 24, marginBottom: 8 }}>
                                <Text style={{ color: theme.colors.accentPrimary, fontSize: 13, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' }}>
                                    Step 2: Select Parts
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.partsList}>
                        {PART_CATEGORIES.map((category) => {
                            const part = currentBuild.parts[category.key];
                            return (
                                <GlassCard key={category.key} style={styles.partCard}>
                                    <View style={styles.partHeader}>
                                        <View style={styles.partInfo}>
                                            <Ionicons
                                                name={category.icon}
                                                size={20}
                                                color={theme.colors.accentPrimary}
                                            />
                                            <Text style={[styles.partCategory, { color: theme.colors.textPrimary }]}>{t(`parts.categories.${category.key}`)}</Text>
                                        </View>

                                        {part ? (
                                            <TouchableOpacity
                                                onPress={() => removePart(category.key)}
                                                style={styles.removeBtn}
                                            >
                                                <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>

                                    {part ? (
                                        <View style={styles.partDetails}>
                                            <Text style={[styles.partName, { color: theme.colors.textSecondary }]}>{part.name}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={[styles.partPrice, { color: theme.colors.success }]}>${part.price}</Text>
                                                <TouchableOpacity
                                                    style={styles.compareBtn}
                                                    onPress={() => {
                                                        eventTracker.track('build_compare_open', { category: category.key });
                                                        navigation.navigate('PartSelection', {
                                                            category: category.key,
                                                            categoryName: category.name,
                                                            mode: 'compare',
                                                            referencePart: part
                                                        });
                                                    }}
                                                >
                                                    <Ionicons name="git-compare-outline" size={16} color={theme.colors.textSecondary} />
                                                    <Text style={[styles.compareText, { color: theme.colors.textSecondary }]}>{t('builder.actions.compare')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.addPartBtn}
                                            onPress={() => {
                                                haptics.selection();
                                                navigation.navigate('PartSelection', {
                                                    category: category.key,
                                                    categoryName: category.name,
                                                    targetBudget: allocationData?.raw?.allocation?.[category.key] || 0
                                                });
                                            }}
                                        >
                                            <Ionicons name="add-circle-outline" size={20} color={theme.colors.accentPrimary} />
                                            <Text style={[styles.addPartText, { color: theme.colors.accentPrimary }]}>{t('builder.actions.choose', { category: t(`parts.categories.${category.key}`) })}</Text>
                                        </TouchableOpacity>
                                    )}
                                </GlassCard>
                            );
                        })}
                    </View>

                    {/* MOBILE ONLY: Footer Content (Compatibility, Performance, Actions) */}
                    {!isDesktop && (
                        <View style={{ marginTop: 24 }}>
                            <Text style={{ color: theme.colors.accentPrimary, fontSize: 13, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' }}>
                                Step 3: Review & Save
                            </Text>
                            <CompatibilityStatus currentBuild={currentBuild} />
                            <BuildPerformanceScore currentBuild={currentBuild} />

                            <View style={[styles.actions, styles.sectionSpacer]}>
                                <TouchableOpacity
                                    style={styles.btnSecondary}
                                    onPress={handleClearBuild}
                                >
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                    <Text style={[styles.btnSecondaryText, { color: theme.colors.error }]}>{t('builder.actions.clear')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.btnShare}
                                    onPress={handleShareBuild}
                                >
                                    <Ionicons name="share-social-outline" size={20} color={theme.colors.accentSecondary} />
                                    <Text style={[styles.btnSecondaryText, { color: theme.colors.accentSecondary }]}>Share</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.btnPrimary}
                                    onPress={handleSaveBuild}
                                >
                                    <LinearGradient
                                        colors={theme.gradients.primary}
                                        style={styles.btnGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Ionicons name="save" size={20} color="white" />
                                        <Text style={styles.btnPrimaryText}>{t('builder.actions.save')}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                        </View>
                    )}
                </ScrollView>

                {/* RIGHT COLUMN - DESKTOP ONLY */}
                {/* On mobile, this logic is hidden because isDesktop is false. */}
                {isDesktop && (
                    <View style={[styles.rightPanel, styles.rightColumn]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Stats Header */}
                            <GlassCard style={styles.statsCard}>
                                <View style={styles.buildStats}>
                                    <View style={styles.stat}>
                                        <Ionicons name="cube" size={20} color={theme.colors.accentPrimary} />
                                        <Text style={[styles.statText, { color: theme.colors.textPrimary }]}>{t('builder.stats.parts_count', { count: getPartCount(), max: 8 })}</Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Ionicons name="cash" size={20} color={theme.colors.success} />
                                        <Text style={[styles.statText, { color: theme.colors.textPrimary }]}>${getTotalPrice().toFixed(2)}</Text>
                                    </View>
                                </View>
                            </GlassCard>

                            <View style={styles.sectionSpacer}>
                                <BudgetControl />
                                <BudgetAllocationCard
                                    recommendations={allocationData?.normalized}
                                    loading={allocationLoading}
                                    useCase={currentBuild.useCase}
                                    setUseCase={setUseCase}
                                    maxBudget={currentBuild.budget?.max || 0}
                                />
                            </View>

                            {/* Compatibility Check */}
                            <CompatibilityStatus currentBuild={currentBuild} />

                            {/* Build Performance Score (shows when CPU + GPU selected) */}
                            <BuildPerformanceScore currentBuild={currentBuild} />

                            {/* Action Buttons */}
                            <View style={[styles.actions, styles.sectionSpacer]}>
                                <TouchableOpacity
                                    style={styles.btnSecondary}
                                    onPress={handleClearBuild}
                                >
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                    <Text style={[styles.btnSecondaryText, { color: theme.colors.error }]}>{t('builder.actions.clear')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.btnShare}
                                    onPress={handleShareBuild}
                                >
                                    <Ionicons name="share-social-outline" size={20} color={theme.colors.accentSecondary} />
                                    <Text style={[styles.btnSecondaryText, { color: theme.colors.accentSecondary }]}>Share</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.btnPrimary}
                                    onPress={handleSaveBuild}
                                >
                                    <LinearGradient
                                        colors={theme.gradients.primary}
                                        style={styles.btnGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Ionicons name="save" size={20} color="white" />
                                        <Text style={styles.btnPrimaryText}>{t('builder.actions.save')}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </View>
                )}
            </View>
        </Layout >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    containerDesktop: {
        flexDirection: 'row',
        padding: theme.spacing.lg,
        gap: theme.spacing.xl,
        maxWidth: 1600,
        alignSelf: 'center',
        width: '100%',
    },
    scrollView: {
        flex: 1,
    },
    leftColumn: {
        flex: 2, // Takes up more space
    },
    rightPanel: {
        // Mobile default
    },
    rightColumn: {
        flex: 1,
        minWidth: 350,
        maxWidth: 400,
        // Removed sticky to fix button clickability issues
        alignSelf: 'flex-start',
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxxl,
    },
    scrollContentDesktop: {
        paddingBottom: theme.spacing.lg,
        padding: 0,
    },
    sectionSpacer: {
        marginTop: theme.spacing.lg,
    },
    statsCard: {
        padding: theme.spacing.md,
    },
    buildNameInput: {
        fontSize: theme.fontSize.xxl,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.lg,
        marginTop: theme.spacing.sm, // Added spacing
        padding: theme.spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.accentPrimary,
    },
    buildStats: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Center stats in card
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    statText: {
        fontSize: theme.fontSize.lg, // Increased size
        color: theme.colors.textPrimary, // More visible
        fontWeight: 'bold',
    },
    partsList: {
        gap: 8, // Very compact gap
    },
    partCard: {
        padding: 8, // Ultra compact padding
        paddingVertical: 12,
        transition: '0.2s',
    },
    partCardHover: {
        borderColor: theme.colors.accentPrimary,
        transform: [{ scale: 1.005 }],
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    partHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
    },
    partInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hoverPreview: {
        position: 'absolute',
        right: 40,
        top: -40, // Float above instead of inside to save space? Or to side?
        // Let's keep it inside but absolutely positioned carefully
        top: '50%',
        marginTop: -20, // Center vertical
        backgroundColor: theme.colors.card,
        borderRadius: 4,
        padding: 2,
        zIndex: 100,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    previewImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    partCategory: {
        fontSize: 14, // Smaller font
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    removeBtn: {
        padding: theme.spacing.xs,
    },
    partDetails: {
        marginTop: theme.spacing.sm,
    },
    partName: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    partPrice: {
        fontSize: theme.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.success,
    },
    addPartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
    },
    addPartText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.accentPrimary,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },
    btnPrimary: {
        flexBasis: '48%',
        minWidth: '48%',
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
        ...theme.shadows.button,
    },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
    },
    btnPrimaryText: {
        color: 'white',
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
    btnSecondary: {
        flexBasis: '48%',
        minWidth: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.glassBg,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
    },
    btnSecondaryText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
    btnShare: {
        flexBasis: '48%',
        minWidth: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.accentSecondary,
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
    },
    compatibilityCard: {
        padding: theme.spacing.lg,
    },
    compatibilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    compatibilityTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    compatibilityText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textSecondary,
    },
    compareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: theme.colors.glassBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    compareText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dealsScroll: {
        paddingRight: 16,
        gap: 12,
    },
    miniDealCard: {
        width: 140,
        padding: 10,
    },
    dealBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: theme.colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    dealBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    miniDealImage: {
        width: '100%',
        height: 80,
        marginBottom: 8,
    },
    miniDealTitle: {
        fontSize: 12,
        fontWeight: '600',
        height: 32,
        marginBottom: 4,
    },
    miniDealPrice: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    smartBuildHint: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 19,
    },
});
