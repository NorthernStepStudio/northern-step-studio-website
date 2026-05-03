import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../stores/themeStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useTranslation } from 'react-i18next';

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { items, rooms, activeHomeId } = useInventoryStore();

    const [query, setQuery] = useState('');
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Focus search input on mount
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const filteredItems = useMemo(() => {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        return items.filter(item => {
            // Filter by active home and query
            if (activeHomeId && item.homeId !== activeHomeId) return false;

            return (
                item.name.toLowerCase().includes(lowerQuery) ||
                (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
                (item.category && item.category.toLowerCase().includes(lowerQuery)) ||
                (item.modelNumber && item.modelNumber.toLowerCase().includes(lowerQuery)) ||
                (item.serialNumber && item.serialNumber.toLowerCase().includes(lowerQuery))
            );
        });
    }, [items, query, activeHomeId]);

    const getRoomName = (roomId: string) => {
        return rooms.find(r => r.id === roomId)?.name || t('common.unknownRoom', 'Unknown Room');
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
        >
            <View style={styles.itemImageContainer}>
                {item.photos && item.photos.length > 0 ? (
                    <Image source={{ uri: item.photos[0] }} style={styles.itemImage} />
                ) : (
                    <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                        <MaterialCommunityIcons name="package-variant" size={24} color={colors.textSecondary} />
                    </View>
                )}
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.itemMeta}>
                    <MaterialCommunityIcons name="door-open" size={12} color={colors.textSecondary} />
                    <Text style={[styles.itemRoom, { color: colors.textSecondary }]}>{getRoomName(item.roomId)}</Text>
                    {item.purchasePrice > 0 && (
                        <>
                            <Text style={[styles.dot, { color: colors.textSecondary }]}>•</Text>
                            <Text style={[styles.itemPrice, { color: colors.primary }]}>${item.purchasePrice.toLocaleString()}</Text>
                        </>
                    )}
                </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header / Search Bar */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                    <TextInput
                        ref={inputRef}
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder={t('search.placeholder', 'Search items in your home...')}
                        placeholderTextColor={colors.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>

            {query.trim().length > 0 ? (
                <FlatList
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="magnify-close" size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {t('search.noResults', 'No items found matching "{{query}}"', { query })}
                            </Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.initialContainer}>
                    <MaterialCommunityIcons name="text-search" size={64} color={colors.surfaceVariant} />
                    <Text style={[styles.initialTitle, { color: colors.textSecondary }]}>
                        {t('search.startTyping', 'Type to search everything')}
                    </Text>
                    <Text style={[styles.initialSubtitle, { color: colors.textSecondary }]}>
                        {t('search.hints', 'Find items by name, category, or serial number.')}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        paddingVertical: 8,
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    itemImageContainer: {
        width: 50,
        height: 50,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 12,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemRoom: {
        fontSize: 12,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: '700',
    },
    dot: {
        fontSize: 10,
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
    },
    initialContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    initialTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    initialSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.8,
    },
});
