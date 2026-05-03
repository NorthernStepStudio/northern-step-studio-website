import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useInventoryStore, InventoryItem } from '../stores/inventoryStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RoomIcon } from '../lib/roomIcons';
import { useTheme } from '../stores/themeStore';
import { useTranslation } from 'react-i18next';

export default function RoomDetailScreen() {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const route = useRoute<any>();
    const { roomId, roomName } = route.params;
    const { getItemsByRoom, rooms } = useInventoryStore();
    const { t } = useTranslation();

    const items = getItemsByRoom(roomId);
    const room = rooms.find((r) => r.id === roomId);
    const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);

    const breadcrumb = (() => {
        if (!room) return roomName;
        const parent = rooms.find(r => r.id === room.parentId);
        return parent ? `${parent.name} › ${room.name}` : room.name;
    })();

    const getItemStatus = (item: InventoryItem) => {
        const hasPhoto = item.photos.length > 0;
        const hasPrice = (item.purchasePrice || 0) > 0;

        // Using hasPrice as a proxy for receipt for now
        if (hasPhoto && hasPrice) return { label: t('itemDetail.fullyVerified', 'Verified'), color: '#10B981', bg: '#ECFDF5' };
        if (hasPhoto) return { label: t('itemDetail.partialDocumentation', 'Partial'), color: '#F59E0B', bg: '#FFFBEB' };
        return { label: t('roomDetail.needsPhoto', 'Needs Photo'), color: '#EF4444', bg: '#FEF2F2' };
    };

    const renderItem = ({ item }: { item: InventoryItem }) => {
        const status = getItemStatus(item);
        return (
            <TouchableOpacity
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                activeOpacity={0.7}
            >
                <View style={styles.itemImageContainer}>
                    {item.photos.length > 0 ? (
                        <Image source={{ uri: item.photos[0] }} style={styles.itemImage} />
                    ) : (
                        <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                            <MaterialCommunityIcons name="camera-outline" size={24} color={colors.textSecondary} />
                        </View>
                    )}
                </View>

                <View style={styles.itemInfo}>
                    <View style={styles.itemNameRow}>
                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                        </View>
                    </View>

                    <View style={styles.itemMetadata}>
                        <Text style={styles.itemPrice}>
                            {item.purchasePrice ? `$${item.purchasePrice.toLocaleString()}` : t('itemDetail.notSpecified', 'No Price')}
                        </Text>
                        <Text style={[styles.metadataDot, { color: colors.border }]}>•</Text>
                        <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
            </TouchableOpacity>
        );
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
                backgroundColor: isDark ? colors.surface : '#0B1220'
            }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={[styles.headerLogoContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <Image
                            source={require('../../assets/brand-logo.jpg')}
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('AddItem', { roomId })} style={styles.addButton}>
                        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <RoomIcon icon={room?.icon || '🏠'} size={24} containerSize={48} />
                        <View style={{ width: 16 }} />
                        <View>
                            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>{roomName}</Text>
                            <Text style={[styles.breadcrumbText, { color: 'rgba(255,255,255,0.6)' }]}>{breadcrumb}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Stats Cards (Overlap) */}
            <View style={styles.statsOverlap}>
                <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{items.length}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('roomDetail.totalItems', 'Total Items')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.statValue, { color: colors.text }]}>${totalValue.toLocaleString()}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('roomDetail.estValue', 'Est. Value')}</Text>
                </View>
            </View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.primaryAddButton}
                    onPress={() => navigation.navigate('AddItem', { roomId })}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryAddButtonText}>{t('roomDetail.addItemToRoom', 'Add Item to This Room')}</Text>
                </TouchableOpacity>
            </View>

            {/* Items List */}
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: colors.text }]}>{t('inventory.title', 'Inventory')}</Text>
                    <Text style={[styles.itemCountBadge, { backgroundColor: colors.surfaceVariant, color: colors.textSecondary }]}>{t('inventory.totalItems', { count: items.length, defaultValue: `${items.length} items` })}</Text>
                </View>

                {items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceVariant }]}>
                            <MaterialCommunityIcons name="package-variant" size={40} color={colors.textSecondary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('roomDetail.vaultEmpty', 'Vault is Empty')}</Text>
                        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                            {t('roomDetail.emptyDesc', 'Your inventory in this room will appear here once added.')}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.itemList}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#0B1220',
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
    },
    headerLogoContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerLogo: {
        width: '100%',
        height: '100%',
    },
    addButton: {
        padding: 8,
    },
    headerContent: {
        paddingHorizontal: 24,
        marginTop: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    breadcrumbText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statsOverlap: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: -24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0B1220',
    },
    statLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    actionBar: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 8,
    },
    primaryAddButton: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryAddButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    listContainer: {
        flex: 1,
        paddingTop: 16,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    itemCountBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    itemList: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E6EAF0',
    },
    itemImageContainer: {
        marginRight: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    itemImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    itemMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#10B981',
    },
    metadataDot: {
        marginHorizontal: 6,
        color: '#CBD5E1',
        fontSize: 12,
    },
    itemDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 40,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
});
