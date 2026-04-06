import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    useWindowDimensions,
    Modal,
    Image,
    RefreshControl,
    Linking,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { checkCompatibility } from '../domain/builds';
import GlassCard from '../components/GlassCard';
import { useTranslation } from '../core/i18n';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { partsAPI } from '../services/api';
import { haptics } from '../services/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useBuild } from '../contexts/BuildContext';
import { usePriceTracking } from '../contexts/PriceTrackingContext';
import { useNotifications } from '../contexts/NotificationContext';
import { FEATURES } from '../core/config';
import { getPrimaryAffiliateUrl, getAmazonCategoryHub } from '../services/affiliateLinks';

import { MOCK_PARTS } from '../services/mockData';
import Tooltip from '../components/Tooltip';
import { searchEbay } from '../lib/ebayClient';

// Category definitions for picker
const PART_CATEGORIES = [
    { key: 'cpu', name: 'CPU', icon: 'hardware-chip' },
    { key: 'gpu', name: 'GPU', icon: 'game-controller' },
    { key: 'motherboard', name: 'Motherboard', icon: 'grid' },
    { key: 'ram', name: 'RAM', icon: 'flash' },
    { key: 'storage', name: 'Storage', icon: 'save' },
    { key: 'psu', name: 'Power Supply', icon: 'battery-charging' },
    { key: 'case', name: 'Case', icon: 'cube' },
    { key: 'cooler', name: 'Cooler', icon: 'snow' },
    // Peripherals
    { key: 'monitor', name: 'Monitor', icon: 'tv-outline' },
    { key: 'keyboard', name: 'Keyboard', icon: 'keypad-outline' },
    { key: 'mouse', name: 'Mouse', icon: 'navigate-outline' },
    { key: 'headset', name: 'Headset', icon: 'headset-outline' },
    { key: 'fan', name: 'Case Fans', icon: 'aperture-outline' },
];

export default function PartSelectionScreen({ route, navigation }) {
    const { category: initialCategory, categoryName: initialCategoryName, mode, referencePart, searchQuery: initialSearchQuery, targetBudget = 0 } = route.params || {};

    const [category, setCategory] = useState(initialCategory || null);
    const [categoryName, setCategoryName] = useState(initialCategoryName || null);

    const { theme: appTheme } = useTheme();
    const { t } = useTranslation();
    const { addPart, currentBuild } = useBuild();
    const { toggleTracking, isTracked } = usePriceTracking();
    const { addPartTrackedNotification, addPartUntrackedNotification } = useNotifications();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
    const [filteredParts, setFilteredParts] = useState([]);
    const [ebayParts, setEbayParts] = useState([]);
    const [ebayLoading, setEbayLoading] = useState(false);
    const [usingMockData, setUsingMockData] = useState(false);
    const [compatibilityFilter, setCompatibilityFilter] = useState(true);
    const [priceSort, setPriceSort] = useState(null); // null = default, 'asc' = low to high, 'desc' = high to low

    // --- Comparison State (Same-Category) ---
    const [benchmarkPanelVisible, setBenchmarkPanelVisible] = useState(false);
    const [compareSlot1, setCompareSlot1] = useState(null);
    const [compareSlot2, setCompareSlot2] = useState(null);
    const [nextSlot, setNextSlot] = useState(1);

    // Load parts when category changes & reset comparison
    useEffect(() => {
        if (category) {
            loadParts();
            setCompareSlot1(null);
            setCompareSlot2(null);
            setNextSlot(1);
        }
    }, [category]);

    useEffect(() => {
        let result = parts;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(part =>
                part.name.toLowerCase().includes(query) ||
                part.manufacturer?.toLowerCase().includes(query)
            );
        }
        if (mode !== 'compare' && compatibilityFilter) {
            result = result.filter(part => {
                const compat = checkCompatibility(part, currentBuild);
                return compat === true || compat.compatible === true;
            });
        }

        // Sort by price if priceSort is set
        if (priceSort === 'asc') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (priceSort === 'desc') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (targetBudget > 0 && !searchQuery.trim()) {
            // Auto-sort by budget proximity if targetBudget is set and no search query
            result.sort((a, b) => {
                const diffA = Math.abs((a.price || 0) - targetBudget);
                const diffB = Math.abs((b.price || 0) - targetBudget);
                return diffA - diffB;
            });
        }

        setFilteredParts(result);
    }, [searchQuery, parts, currentBuild, mode, compatibilityFilter, targetBudget, priceSort]);

    // Fetch eBay results when search query changes (debounced)
    useEffect(() => {
        const fetchEbay = async () => {
            if (!searchQuery.trim() || searchQuery.length < 3) {
                setEbayParts([]);
                return;
            }
            setEbayLoading(true);
            try {
                const results = await searchEbay(searchQuery.trim(), {
                    limit: 10,
                    category: category
                });
                // Transform eBay items to match our part format
                const transformed = (results.items || []).map(item => ({
                    id: `ebay-${item.itemId}`,
                    name: item.title,
                    price: parseFloat(item.price?.value) || 0,
                    manufacturer: item.seller?.username || 'eBay Seller',
                    image_url: item.image,
                    specs: { condition: item.condition || 'Used', location: item.itemLocation || 'US' },
                    category: category,
                    isEbay: true,
                    ebayUrl: item.itemWebUrl,
                    shippingCost: item.shippingOptions?.cost || '0.00'
                }));
                setEbayParts(transformed);
            } catch (err) {
                console.log('[eBay] Search error:', err.message);
                setEbayParts([]);
            } finally {
                setEbayLoading(false);
            }
        };

        const timer = setTimeout(fetchEbay, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery, category]);

    const loadParts = async () => {
        const mockData = MOCK_PARTS[category] || [];
        const cleanData = mockData.map(part => {
            if (typeof part.specs === 'string') {
                try { return { ...part, specs: JSON.parse(part.specs) }; } catch (e) { return part; }
            }
            return part;
        });
        setParts(cleanData);
        setUsingMockData(true);
        setLoading(false);

        // FEATURE: Live Trending / Budget Match by Default
        if (categoryName) {
            setEbayLoading(true);
            try {
                // If we have a target budget, filter by price range (+/- 20%)
                // Otherwise, just search broadly
                const searchOptions = {
                    limit: 10,
                    category: category
                };

                if (targetBudget > 0) {
                    searchOptions.minPrice = Math.floor(targetBudget * 0.8);
                    searchOptions.maxPrice = Math.ceil(targetBudget * 1.2);
                    console.log(`[eBay] Auto-fetching budget match: $${searchOptions.minPrice}-$${searchOptions.maxPrice}`);
                }

                // Use category name for broad search
                const results = await searchEbay(categoryName, searchOptions);

                const transformed = (results.items || []).map(item => ({
                    id: `ebay-${item.itemId}`,
                    name: item.title,
                    price: parseFloat(item.price?.value) || 0,
                    manufacturer: item.seller?.username || 'eBay Seller',
                    image_url: item.image,
                    specs: { condition: item.condition || 'Used', location: item.itemLocation || 'US' },
                    category: category,
                    isEbay: true,
                    ebayUrl: item.itemWebUrl,
                    shippingCost: item.shippingOptions?.cost || '0.00'
                }));
                // Only set if we got results
                if (transformed.length > 0) {
                    setEbayParts(transformed);
                }
            } catch (ignore) {
                // Silent fail for auto-fetch
            } finally {
                setEbayLoading(false);
            }
        }

        try {
            const apiData = await partsAPI.getAll(category);
            if (apiData && apiData.length > 0) {
                const cleanApiData = apiData.map(part => {
                    if (typeof part.specs === 'string') {
                        try { return { ...part, specs: JSON.parse(part.specs) }; } catch (e) { return part; }
                    }
                    return part;
                });
                setParts(cleanApiData);
                setUsingMockData(false);
            }
        } catch (apiError) {
            // console.log('API unavailable, using offline data');
        }
    };

    const handleAddPart = (part) => {
        console.log('[PartSelection] Adding part:', part?.name);
        haptics.success();
        try {
            addPart(category, part);
            navigation.goBack();
        } catch (e) {
            console.error('Add Part Error:', e);
            Alert.alert('Error', 'Failed to add part.');
        }
    };

    const showPartDetails = (part) => {
        haptics.selection(); // Haptic feedback on part selection
        if (mode === 'compare') {
            navigation.navigate('Comparison', { part1: referencePart, part2: part });
        } else {
            // Navigate to part details screen
            navigation.navigate('PartDetails', { part, category, categoryName });
        }
    };

    const addToComparison = (part) => {
        haptics.selection(); // Haptic feedback on comparison toggle
        // If already selected in slot 1, deselect it
        if (compareSlot1?.id === part.id) {
            setCompareSlot1(null);
            return;
        }
        // If already selected in slot 2, deselect it
        if (compareSlot2?.id === part.id) {
            setCompareSlot2(null);
            return;
        }

        // Add to next available slot
        if (nextSlot === 1 || !compareSlot1) {
            setCompareSlot1(part);
            setNextSlot(2);
        } else {
            setCompareSlot2(part);
            setNextSlot(1);
        }
        // Don't auto-open modal - let user tap FAB when ready
    };

    const clearSlot = (slotNumber) => {
        if (slotNumber === 1) setCompareSlot1(null);
        else setCompareSlot2(null);
    };

    // Track failed images
    const [failedImages, setFailedImages] = React.useState({});

    const renderPartItem = ({ item }) => {
        const compat = checkCompatibility(item, currentBuild);
        const isCompatible = item.isEbay ? true : (compat === true || compat.compatible === true);
        const isSelected = compareSlot1?.id === item.id || compareSlot2?.id === item.id;
        const imageUrl = item.image_url;
        const imageFailed = failedImages[item.id];
        const isEbay = item.isEbay === true;

        // Check for budget fit (within 15%)
        const price = item.price || 0;
        const isBestFit = targetBudget > 0 && Math.abs(price - targetBudget) <= (targetBudget * 0.15);

        return (
            <GlassCard style={[
                styles.partCard,
                !isCompatible && { borderColor: appTheme.colors.error, borderWidth: 1 },
                isSelected && { borderColor: appTheme.colors.accentSecondary, borderWidth: 2 },
                isEbay && { borderColor: '#E53238', borderWidth: 1 },
                isBestFit && { borderColor: appTheme.colors.success, borderWidth: 2, shadowColor: appTheme.colors.success, shadowRadius: 10, shadowOpacity: 0.5 }
            ]}>
                {/* eBay Badge - Moved to LEFT to avoid overlapping price */}
                {isEbay && (
                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#E53238', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, zIndex: 10 }}>
                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold', fontStyle: 'italic' }}>eBay</Text>
                    </View>
                )}
                {/* Best Fit Badge */}
                {isBestFit && !isEbay && (
                    <View style={{ position: 'absolute', top: -10, left: 10, backgroundColor: appTheme.colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, zIndex: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="thumbs-up" size={12} color="white" />
                            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>BEST VALUE FIT</Text>
                        </View>
                    </View>
                )}
                <TouchableOpacity onPress={() => isEbay ? Linking.openURL(item.ebayUrl) : handleAddPart(item)} style={styles.partCardContent}>
                    {/* Product Image */}
                    <View style={styles.partImageContainer}>
                        {imageUrl && !imageFailed ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.partImage}
                                resizeMode="contain"
                                onError={() => {
                                    console.log('[PartImage] Failed to load:', imageUrl);
                                    setFailedImages(prev => ({ ...prev, [item.id]: true }));
                                }}
                            />
                        ) : (
                            <View style={[styles.partImagePlaceholder, { backgroundColor: appTheme.colors.glassBg }]}>
                                <Ionicons
                                    name={PART_CATEGORIES.find(c => c.key === category)?.icon || 'cube-outline'}
                                    size={32}
                                    color={appTheme.colors.textMuted}
                                />
                            </View>
                        )}
                    </View>
                    {/* Part Details */}
                    <View style={styles.partDetails}>
                        <View style={styles.partHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.partName, { color: appTheme.colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
                                {!isCompatible && <Text style={{ color: appTheme.colors.error, fontSize: 11, marginTop: 2 }}>⚠️ {compat.reason}</Text>}
                            </View>
                            <Text style={[styles.partPrice, { color: appTheme.colors.success }]}>${item.price}</Text>
                        </View>
                        <View style={styles.specsContainer}>
                            {Object.entries(item.specs || {}).slice(0, 3).map(([key, value]) => (
                                <View key={key} style={[styles.specBadge, { backgroundColor: appTheme.colors.glassBg }]}>
                                    <Text style={[styles.specText, { color: appTheme.colors.textSecondary }]}>{key}: {value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.cardFooter}>
                    <Text style={[styles.retailer, { color: appTheme.colors.textMuted }]}>{item.manufacturer || 'Generic'}</Text>
                    <View style={styles.actions}>
                        {FEATURES.PRICE_TRACKING && (
                            <Tooltip text={isTracked(item.id) ? "Stop tracking price" : "Track price drops"}>
                                <TouchableOpacity
                                    onPress={() => {
                                        haptics.selection();
                                        const nowTracked = toggleTracking({ ...item, category });
                                        if (nowTracked) {
                                            addPartTrackedNotification(item.name);
                                        } else {
                                            addPartUntrackedNotification(item.name);
                                        }
                                    }}
                                    style={[
                                        styles.iconButton,
                                        {
                                            backgroundColor: isTracked(item.id) ? '#F59E0B25' : 'transparent',
                                            borderRadius: 20,
                                            padding: 4,
                                        }
                                    ]}
                                    accessibilityLabel={isTracked(item.id) ? "Stop tracking price" : "Track price drops"}
                                >
                                    <Ionicons
                                        name={isTracked(item.id) ? "notifications" : "notifications-outline"}
                                        size={20}
                                        color={isTracked(item.id) ? '#F59E0B' : appTheme.colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </Tooltip>
                        )}
                        <Tooltip text="View details">
                            <TouchableOpacity
                                onPress={() => showPartDetails(item)}
                                style={styles.iconButton}
                                accessibilityLabel="View details"
                            >
                                <Ionicons name="information-circle-outline" size={22} color={appTheme.colors.textPrimary} />
                            </TouchableOpacity>
                        </Tooltip>
                        {/* Only show compare button for CPU and GPU (categories with benchmarks) */}
                        {(category === 'cpu' || category === 'gpu') && (
                            <Tooltip text={isSelected ? "Remove from comparison" : "Add to comparison"}>
                                <TouchableOpacity
                                    onPress={() => addToComparison(item)}
                                    style={[
                                        styles.iconButton,
                                        {
                                            backgroundColor: isSelected ? appTheme.colors.accentSecondary : appTheme.colors.accentSecondary + '25',
                                            borderRadius: 20,
                                            padding: 6,
                                        }
                                    ]}
                                    accessibilityLabel={isSelected ? "Remove from comparison" : "Add to comparison"}
                                >
                                    <Ionicons
                                        name={isSelected ? "checkmark" : "swap-horizontal"}
                                        size={18}
                                        color={isSelected ? 'white' : appTheme.colors.accentSecondary}
                                    />
                                </TouchableOpacity>
                            </Tooltip>
                        )}
                        <Tooltip text={isEbay ? 'View on eBay' : t('parts.details.buyNow')}>
                            <TouchableOpacity
                                onPress={() => {
                                    haptics.notification();
                                    const url = isEbay ? item.ebayUrl : getPrimaryAffiliateUrl(item);
                                    if (url) Linking.openURL(url);
                                }}
                                style={[styles.addBtn, { backgroundColor: isEbay ? '#E5323820' : appTheme.colors.success + '20', marginRight: 4 }]}
                                accessibilityLabel={isEbay ? 'View on eBay' : t('parts.details.buyNow')}
                            >
                                <Text style={{ color: isEbay ? '#E53238' : appTheme.colors.success, fontWeight: 'bold', fontSize: 12 }}>{isEbay ? 'eBay' : t('parts.actions.buy')}</Text>
                                <Ionicons name={isEbay ? 'open-outline' : 'cart-outline'} size={14} color={isEbay ? '#E53238' : appTheme.colors.success} />
                            </TouchableOpacity>
                        </Tooltip>
                        {/* Add to Build button - show for ALL items, including eBay */}
                        <Tooltip text={t('parts.card.addToBuild')}>
                            <TouchableOpacity
                                onPress={() => handleAddPart(item)}
                                style={[styles.addBtn, { backgroundColor: appTheme.colors.accentPrimary + '20' }]}
                                accessibilityLabel={t('parts.card.addToBuild')}
                            >
                                <Text style={{ color: appTheme.colors.accentPrimary, fontWeight: 'bold', fontSize: 12 }}>{t('parts.actions.add')}</Text>
                                <Ionicons name="add-circle-outline" size={14} color={appTheme.colors.accentPrimary} />
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                </View>
            </GlassCard>
        );
    };

    const renderCategoryPicker = () => (
        <Layout
            scrollable={true}
            showChatButton={true}
            stickyHeader={<Header navigation={navigation} />}
        >
            <View style={styles.categoryGrid}>
                <Text style={[styles.categoryPickerTitle, { color: appTheme.colors.textPrimary }]}>
                    {t('parts.categoryPrompt')}
                </Text>
                <View style={styles.categoryRow}>
                    {PART_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat.key} style={styles.categoryCard} onPress={() => { setCategory(cat.key); setCategoryName(cat.name); }}>
                            <GlassCard style={[styles.categoryCardInner, { backgroundColor: appTheme.colors.glassBg }]}>
                                <Ionicons name={cat.icon} size={32} color={appTheme.colors.accentPrimary} />
                                <Text style={[styles.categoryCardText, { color: appTheme.colors.textPrimary }]}>{cat.name}</Text>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Layout>
    );

    if (!category) return renderCategoryPicker();

    const renderComparisonContent = () => {
        const hasBothParts = compareSlot1 && compareSlot2;
        return (
            <View style={{ gap: 15, backgroundColor: '#1a1a2e', padding: 15, borderRadius: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="git-compare" size={20} color={appTheme.colors.accentSecondary} />
                    <Text style={{ color: appTheme.colors.textPrimary, fontWeight: 'bold', fontSize: 18 }}>
                        {t('parts.compareCategory', { category: categoryName })}
                    </Text>
                </View>
                {/* Slot 1 */}
                <View style={[styles.compareSlot, {
                    backgroundColor: '#252540',
                    borderColor: hasBothParts
                        ? ((compareSlot1.score || 0) >= (compareSlot2.score || 0) ? appTheme.colors.success : appTheme.colors.error)
                        : (nextSlot === 1 ? appTheme.colors.info : '#3a3a5c'),
                    borderWidth: hasBothParts ? 2 : 2
                }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: appTheme.colors.textSecondary, fontSize: 10 }}>
                            {t('parts.compare.slotLabel', { index: 1 })}
                        </Text>
                        {compareSlot1 && <TouchableOpacity onPress={() => clearSlot(1)}><Ionicons name="close-circle" size={18} color={appTheme.colors.error} /></TouchableOpacity>}
                    </View>
                    <Text style={{ color: compareSlot1 ? ((compareSlot1.score || 0) >= (compareSlot2?.score || 0) ? appTheme.colors.success : appTheme.colors.textPrimary) : appTheme.colors.textMuted, fontWeight: 'bold', marginTop: 4 }} numberOfLines={1}>
                        {compareSlot1 ? compareSlot1.name : t('parts.selectPart')}
                    </Text>
                    {compareSlot1 && <Text style={{ color: appTheme.colors.success, fontSize: 14 }}>${compareSlot1.price}</Text>}
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: appTheme.colors.textMuted, fontWeight: 'bold', fontSize: 16 }}>
                        {t('parts.compare.vs')}
                    </Text>
                </View>
                {/* Slot 2 */}
                <View style={[styles.compareSlot, {
                    backgroundColor: '#252540',
                    borderColor: hasBothParts
                        ? ((compareSlot2.score || 0) >= (compareSlot1.score || 0) ? appTheme.colors.success : appTheme.colors.error)
                        : (nextSlot === 2 ? appTheme.colors.info : '#3a3a5c'),
                    borderWidth: hasBothParts ? 2 : 2
                }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: appTheme.colors.textSecondary, fontSize: 10 }}>
                            {t('parts.compare.slotLabel', { index: 2 })}
                        </Text>
                        {compareSlot2 && <TouchableOpacity onPress={() => clearSlot(2)}><Ionicons name="close-circle" size={18} color={appTheme.colors.error} /></TouchableOpacity>}
                    </View>
                    <Text style={{ color: compareSlot2 ? ((compareSlot2.score || 0) >= (compareSlot1?.score || 0) ? appTheme.colors.success : appTheme.colors.textPrimary) : appTheme.colors.textMuted, fontWeight: 'bold', marginTop: 4 }} numberOfLines={1}>
                        {compareSlot2 ? compareSlot2.name : t('parts.selectPart')}
                    </Text>
                    {compareSlot2 && <Text style={{ color: appTheme.colors.success, fontSize: 14 }}>${compareSlot2.price}</Text>}
                </View>
                {/* Comparison */}
                {hasBothParts && (
                    <ScrollView style={{ marginTop: 10, maxHeight: 250 }} nestedScrollEnabled={true}>
                        <View style={{ gap: 10 }}>
                            <Text style={{ color: appTheme.colors.textPrimary, fontWeight: 'bold' }}>
                                {t('parts.compare.title')}
                            </Text>
                            <View style={[styles.comparisonRow, { backgroundColor: '#252540' }]}>
                                <Text style={{ color: appTheme.colors.textSecondary, flex: 1 }}>{t('parts.compare.price')}</Text>
                                <Text style={{ color: compareSlot1.price <= compareSlot2.price ? appTheme.colors.success : appTheme.colors.textPrimary, fontWeight: 'bold' }}>${compareSlot1.price}</Text>
                                <Text style={{ color: appTheme.colors.textSecondary, marginHorizontal: 10 }}>{t('parts.compare.vs')}</Text>
                                <Text style={{ color: compareSlot2.price <= compareSlot1.price ? appTheme.colors.success : appTheme.colors.textPrimary, fontWeight: 'bold' }}>${compareSlot2.price}</Text>
                            </View>
                            {(compareSlot1.score || compareSlot2.score) && (
                                <View style={[styles.comparisonRow, { backgroundColor: '#252540' }]}>
                                    <Text style={{ color: appTheme.colors.textSecondary, flex: 1 }}>{t('parts.compare.benchmark')}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        {(compareSlot1.score || 0) >= (compareSlot2.score || 0) && <Ionicons name="trophy" size={12} color={appTheme.colors.success} />}
                                        <Text style={{ color: (compareSlot1.score || 0) >= (compareSlot2.score || 0) ? appTheme.colors.success : appTheme.colors.error, fontWeight: 'bold' }}>
                                            {compareSlot1.score?.toLocaleString() || 'N/A'}
                                        </Text>
                                    </View>
                                    <Text style={{ color: appTheme.colors.textSecondary, marginHorizontal: 10 }}>{t('parts.compare.vs')}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={{ color: (compareSlot2.score || 0) >= (compareSlot1.score || 0) ? appTheme.colors.success : appTheme.colors.error, fontWeight: 'bold' }}>
                                            {compareSlot2.score?.toLocaleString() || 'N/A'}
                                        </Text>
                                        {(compareSlot2.score || 0) >= (compareSlot1.score || 0) && <Ionicons name="trophy" size={12} color={appTheme.colors.success} />}
                                    </View>
                                </View>
                            )}


                            {/* Detailed Specs Comparison */}
                            <Text style={{ color: appTheme.colors.textPrimary, fontWeight: 'bold', marginTop: 15 }}>
                                {t('parts.compare.specifications')}
                            </Text>
                            {(() => {
                                // Get all unique spec keys from both parts
                                const specs1 = compareSlot1.specs || {};
                                const specs2 = compareSlot2.specs || {};
                                const allSpecKeys = [...new Set([...Object.keys(specs1), ...Object.keys(specs2)])];

                                return allSpecKeys.map((specKey) => {
                                    const val1 = specs1[specKey];
                                    const val2 = specs2[specKey];
                                    const displayVal1 = val1 !== undefined ? String(val1) : '—';
                                    const displayVal2 = val2 !== undefined ? String(val2) : '—';

                                    return (
                                        <View key={specKey} style={[styles.comparisonRow, { backgroundColor: '#252540', alignItems: 'flex-start', paddingVertical: 8 }]}>
                                            <Text style={{ color: appTheme.colors.textSecondary, flex: 1, fontSize: 12, marginTop: 2 }} numberOfLines={2}>{specKey}</Text>

                                            {/* Value 1 & Name */}
                                            <View style={{ alignItems: 'flex-end', maxWidth: 80 }}>
                                                <Text style={{ color: appTheme.colors.textPrimary, fontWeight: '500', fontSize: 12, textAlign: 'right' }} numberOfLines={1}>{displayVal1}</Text>
                                                <Text style={{ color: appTheme.colors.textMuted, fontSize: 8, textAlign: 'right' }} numberOfLines={1}>
                                                    {compareSlot1.name?.split(' ').slice(0, 2).join(' ')}
                                                </Text>
                                            </View>

                                            <Text style={{ color: appTheme.colors.textMuted, marginHorizontal: 6, fontSize: 10, alignSelf: 'center' }}>
                                                {t('parts.compare.vs')}
                                            </Text>

                                            {/* Value 2 & Name */}
                                            <View style={{ alignItems: 'flex-start', maxWidth: 80 }}>
                                                <Text style={{ color: appTheme.colors.textPrimary, fontWeight: '500', fontSize: 12, textAlign: 'left' }} numberOfLines={1}>{displayVal2}</Text>
                                                <Text style={{ color: appTheme.colors.textMuted, fontSize: 8, textAlign: 'left' }} numberOfLines={1}>
                                                    {compareSlot2.name?.split(' ').slice(0, 2).join(' ')}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                });
                            })()}
                        </View>
                    </ScrollView>
                )}
                <Text style={{ color: appTheme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10 }}>
                    {t('parts.compare.prompt')}
                </Text>
            </View>
        );
    };

    return (
        <Layout
            scrollable={false}
            showChatButton={true}
            stickyHeader={<Header navigation={navigation} />}
        >
            {/* Subtitle/Context Bar */}
            <View style={[styles.subtitleBar, { borderBottomColor: appTheme.colors.glassBorder, backgroundColor: appTheme.colors.glassBg }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => {
                            if (!initialCategory) {
                                setCategory(null);
                                setCategoryName(null);
                            } else {
                                navigation.goBack();
                            }
                        }}
                        style={{ padding: 10, marginLeft: -10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name="arrow-back" size={24} color={appTheme.colors.accentPrimary} />
                    </TouchableOpacity>
                    <Text style={{ color: appTheme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' }}>
                        {mode === 'compare'
                            ? t('parts.compareCategory', { category: categoryName })
                            : t('parts.title', { category: categoryName })}
                    </Text>
                    {usingMockData && (
                        <View style={styles.offlineBadge}>
                            <Ionicons name="cloud-offline" size={10} color={appTheme.colors.warning} />
                            <Text style={{ color: appTheme.colors.warning, fontSize: 10 }}>{t('common.offline')}</Text>
                        </View>
                    )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {/* Price Sort Toggle */}
                    <TouchableOpacity
                        onPress={() => {
                            // Cycle: null -> asc -> desc -> null
                            if (priceSort === null) setPriceSort('asc');
                            else if (priceSort === 'asc') setPriceSort('desc');
                            else setPriceSort(null);
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: priceSort ? appTheme.colors.accentPrimary + '20' : 'transparent', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}
                    >
                        <Ionicons
                            name={priceSort === 'asc' ? 'arrow-up' : priceSort === 'desc' ? 'arrow-down' : 'swap-vertical'}
                            size={16}
                            color={priceSort ? appTheme.colors.accentPrimary : appTheme.colors.textMuted}
                        />
                        <Text style={{ fontSize: 11, color: priceSort ? appTheme.colors.accentPrimary : appTheme.colors.textSecondary }}>
                            {priceSort === 'asc' ? 'Low→High' : priceSort === 'desc' ? 'High→Low' : 'Price'}
                        </Text>
                    </TouchableOpacity>

                    {/* Compatibility Filter */}
                    <TouchableOpacity onPress={() => setCompatibilityFilter(!compatibilityFilter)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name={compatibilityFilter ? "shield-checkmark" : "shield-outline"} size={20} color={compatibilityFilter ? appTheme.colors.success : appTheme.colors.textMuted} />
                        <Text style={{ fontSize: 11, color: appTheme.colors.textSecondary }}>{t('common.filter')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
                <View style={{ flex: 2, borderRightWidth: isDesktop ? 1 : 0, borderRightColor: appTheme.colors.glassBorder }}>
                    <View style={styles.searchContainer}>
                        <GlassCard style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={appTheme.colors.textMuted} />
                            <TextInput
                                style={[styles.searchInput, { color: appTheme.colors.textPrimary }]}
                                placeholder={t('parts.searchCategory', { category: categoryName })}
                                placeholderTextColor={appTheme.colors.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={appTheme.colors.textMuted} /></TouchableOpacity>}
                        </GlassCard>

                    </View>
                    {loading ? <View style={styles.centerContainer}><ActivityIndicator size="large" color={appTheme.colors.accentPrimary} /></View> :
                        (filteredParts.length > 0 || ebayParts.length > 0) ? <FlatList
                            data={(() => {
                                // When price sorting, combine ALL parts (mock + eBay) and sort together
                                if (priceSort) {
                                    const allParts = [...filteredParts, ...ebayParts];
                                    if (priceSort === 'asc') {
                                        allParts.sort((a, b) => (a.price || 0) - (b.price || 0));
                                    } else if (priceSort === 'desc') {
                                        allParts.sort((a, b) => (b.price || 0) - (a.price || 0));
                                    }
                                    return allParts;
                                }
                                // Default: show mock parts first, then eBay section
                                return [...filteredParts, ...(ebayParts.length > 0 ? [{ id: 'ebay-header', isHeader: true }] : []), ...ebayParts];
                            })()}
                            renderItem={({ item }) => {
                                // Render eBay section header
                                if (item.isHeader) {
                                    return (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 8, marginTop: 8 }}>
                                            <View style={{ backgroundColor: '#E53238', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontStyle: 'italic', fontSize: 12 }}>eBay</Text>
                                            </View>
                                            <Text style={{ color: appTheme.colors.textSecondary, fontSize: 14 }}>Marketplace Results</Text>
                                            {ebayLoading && <ActivityIndicator size="small" color="#E53238" />}
                                        </View>
                                    );
                                }
                                return renderPartItem({ item });
                            }}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={loading}
                                    onRefresh={() => {
                                        // Simulate refresh - in real app would fetch new data
                                        setLoading(true);
                                        setTimeout(() => setLoading(false), 1000);
                                    }}
                                    tintColor={appTheme.colors.accentPrimary}
                                    colors={[appTheme.colors.accentPrimary]}
                                />
                            }
                        /> :
                            <View style={styles.centerContainer}>
                                <Ionicons name="search-outline" size={48} color={appTheme.colors.textMuted} />
                                <Text style={[styles.emptyText, { color: appTheme.colors.textMuted }]}>{t('parts.empty')}</Text>
                            </View>}
                </View>
                {/* Only show comparison panel on desktop for CPU/GPU */}
                {isDesktop && (category === 'cpu' || category === 'gpu') && <View style={{ flex: 1, padding: 20, maxWidth: 400 }}><GlassCard style={{ padding: 20 }}>{renderComparisonContent()}</GlassCard></View>}
            </View>

            {/* Only show FAB and modal for CPU/GPU (categories with benchmarks) */}
            {!isDesktop && (category === 'cpu' || category === 'gpu') && (
                <>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: appTheme.colors.accentSecondary }]} onPress={() => setBenchmarkPanelVisible(true)}>
                        <Ionicons name="git-compare" size={24} color="white" />
                        {(compareSlot1 || compareSlot2) && <View style={styles.fabBadge}><Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{(compareSlot1 ? 1 : 0) + (compareSlot2 ? 1 : 0)}</Text></View>}
                    </TouchableOpacity>
                    <Modal visible={benchmarkPanelVisible} transparent animationType="slide" onRequestClose={() => setBenchmarkPanelVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: appTheme.colors.surface }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}><TouchableOpacity onPress={() => setBenchmarkPanelVisible(false)} style={{ padding: 10 }}><Ionicons name="close" size={24} color={appTheme.colors.textPrimary} /></TouchableOpacity></View>
                                {renderComparisonContent()}
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    subtitleBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 4 },
    searchContainer: { padding: 15, paddingBottom: 5 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
    searchInput: { flex: 1, fontSize: 16 },
    shopAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, marginTop: 10 },
    listContent: { padding: 15, paddingBottom: 80 },
    partCard: { padding: 15, marginBottom: 10 },
    partHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    partName: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
    partPrice: { fontSize: 16, fontWeight: 'bold' },
    specsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    specBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    specText: { fontSize: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    retailer: { fontSize: 12 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    emptyText: { fontSize: 16, fontWeight: 'bold' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconButton: { padding: 4 },
    addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 },
    compareBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 16, gap: 4 },
    offlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: 'rgba(255, 159, 67, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 159, 67, 0.3)' },
    categoryGrid: { padding: 20, paddingTop: 30 },
    categoryPickerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    categoryCard: { width: '45%', minWidth: 140, maxWidth: 180 },
    categoryCardInner: { padding: 20, alignItems: 'center', gap: 10, borderRadius: 16 },
    categoryCardText: { fontSize: 14, fontWeight: '600' },
    compareSlot: { padding: 12, borderRadius: 10 },
    comparisonRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8 },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: 'black', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
    fabBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ff4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 50, minHeight: 350, maxHeight: '70%', backgroundColor: '#1a1a2e' },
    // Part card with image styles
    partCardContent: { flexDirection: 'row', flex: 1 },
    partImageContainer: { width: 80, height: 80, marginRight: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
    partImage: { width: '100%', height: '100%', borderRadius: 8 },
    partImagePlaceholder: { width: '100%', height: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    partDetails: { flex: 1, justifyContent: 'center' },
});
