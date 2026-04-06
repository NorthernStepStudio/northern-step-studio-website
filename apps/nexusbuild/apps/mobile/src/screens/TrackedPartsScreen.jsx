import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { usePriceTracking } from '../contexts/PriceTrackingContext';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { FEATURES } from '../core/config';

export default function TrackedPartsScreen({ navigation }) {
    const { theme } = useTheme();
    const {
        trackedParts,
        removeTrackedPart,
        getPriceChange,
        getTotalSavings,
        simulatePriceUpdate,
        priceDrops,
        clearPriceDrops,
    } = usePriceTracking();

    const handleRemove = (part) => {
        Alert.alert(
            'Remove from Watchlist',
            `Stop tracking "${part.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => removeTrackedPart(part.id) },
            ]
        );
    };

    const renderPriceBadge = (change) => {
        if (change === 0) return null;
        const isDown = change < 0;
        return (
            <View style={[styles.priceBadge, { backgroundColor: isDown ? '#48bb7822' : '#e53e3e22' }]}>
                <Ionicons
                    name={isDown ? 'arrow-down' : 'arrow-up'}
                    size={12}
                    color={isDown ? '#48bb78' : '#e53e3e'}
                />
                <Text style={[styles.priceChangeText, { color: isDown ? '#48bb78' : '#e53e3e' }]}>
                    {Math.abs(change)}%
                </Text>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        const priceChange = getPriceChange(item.id);
        return (
            <View style={[styles.partCard, { backgroundColor: theme.colors.bgSecondary }]}>
                {item.image_url && (
                    <Image source={{ uri: item.image_url }} style={styles.partImage} />
                )}
                <View style={styles.partInfo}>
                    <Text style={[styles.partName, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={[styles.partCategory, { color: theme.colors.textSecondary }]}>
                        {item.category?.toUpperCase()}
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={[styles.currentPrice, { color: theme.colors.accentPrimary }]}>
                            ${item.currentPrice?.toFixed(2)}
                        </Text>
                        {item.originalPrice !== item.currentPrice && (
                            <Text style={styles.originalPrice}>
                                ${item.originalPrice?.toFixed(2)}
                            </Text>
                        )}
                        {renderPriceBadge(priceChange)}
                    </View>
                    {item.targetPrice && (
                        <Text style={[styles.targetPrice, { color: theme.colors.textSecondary }]}>
                            🎯 Target: ${item.targetPrice.toFixed(2)}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item)}
                >
                    <Ionicons name="close-circle" size={24} color="#e53e3e" />
                </TouchableOpacity>
            </View>
        );
    };

    const totalSavings = getTotalSavings();

    if (!FEATURES.PRICE_TRACKING) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]} edges={['top']}>
                <Header navigation={navigation} />
                <View style={styles.emptyState}>
                    <Ionicons name="construct-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                        Price Tracking Is Unavailable
                    </Text>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        This build of NexusBuild does not have live price tracking data yet. Browse parts to get started.
                    </Text>
                    <TouchableOpacity
                        style={[styles.browseBtn, { backgroundColor: theme.colors.accentPrimary }]}
                        onPress={() => navigation.navigate('PartSelection', { category: 'cpu', categoryName: 'CPU' })}
                    >
                        <Text style={styles.browseBtnText}>Browse Parts</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]} edges={['top']}>
            <Header navigation={navigation} />
            {/* Header Stats */}
            <View style={[styles.statsRow, { backgroundColor: theme.colors.bgSecondary }]}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: theme.colors.accentPrimary }]}>
                        {trackedParts.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Tracked
                    </Text>
                </View>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: '#48bb78' }]}>
                        ${totalSavings.toFixed(2)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Potential Savings
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.refreshBtn, { backgroundColor: theme.colors.accentPrimary + '22' }]}
                    onPress={simulatePriceUpdate}
                >
                    <Ionicons name="refresh" size={20} color={theme.colors.accentPrimary} />
                    <Text style={[styles.refreshText, { color: theme.colors.accentPrimary }]}>
                        Check Prices
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Price Drops Alert */}
            {priceDrops.length > 0 && (
                <View style={styles.alertBanner}>
                    <View style={styles.alertContent}>
                        <Ionicons name="notifications" size={20} color="#48bb78" />
                        <Text style={styles.alertText}>
                            {priceDrops.length} price drop{priceDrops.length > 1 ? 's' : ''} detected!
                        </Text>
                    </View>
                    <TouchableOpacity onPress={clearPriceDrops}>
                        <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Parts List */}
            {trackedParts.length > 0 ? (
                <FlatList
                    data={trackedParts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id?.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="eye-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                        No Parts Tracked
                    </Text>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                        Start tracking parts to get notified when prices drop!
                    </Text>
                    <TouchableOpacity
                        style={[styles.browseBtn, { backgroundColor: theme.colors.accentPrimary }]}
                        onPress={() => navigation.navigate('PartSelection', { category: 'cpu' })}
                    >
                        <Text style={styles.browseBtnText}>Browse Parts</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    refreshText: {
        fontSize: 12,
        fontWeight: '600',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#48bb7822',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#48bb78',
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    alertText: {
        color: '#48bb78',
        fontWeight: '600',
    },
    dismissText: {
        color: '#48bb78',
        fontSize: 12,
    },
    list: {
        padding: 16,
    },
    partCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    partImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    partInfo: {
        flex: 1,
        marginLeft: 12,
    },
    partName: {
        fontSize: 14,
        fontWeight: '600',
    },
    partCategory: {
        fontSize: 10,
        marginTop: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    originalPrice: {
        fontSize: 12,
        textDecorationLine: 'line-through',
        color: '#888',
    },
    priceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 2,
    },
    priceChangeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    targetPrice: {
        fontSize: 11,
        marginTop: 4,
    },
    removeBtn: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    browseBtn: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    browseBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
