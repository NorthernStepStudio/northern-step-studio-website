import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../stores/themeStore';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 3;
const ITEM_SIZE = SCREEN_WIDTH / COLUMN_COUNT;

const EmptyState = ({ icon, title, description, colors }: any) => (
    <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name={icon} size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>{description}</Text>
    </View>
);

export default function GalleryScreen() {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { getAllPhotos, bulkDeleteItems, bulkMarkItemsAsClean } = useInventoryStore();
    const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = React.useState(false);

    const photos = getAllPhotos();

    const toggleSelection = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleBulkDelete = () => {
        if (selectedItemIds.length === 0) return;
        Alert.alert(
            t('common.confirm', 'Confirm'),
            `Delete ${selectedItemIds.length} items?`,
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('common.delete', 'Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await bulkDeleteItems(selectedItemIds);
                        setSelectedItemIds([]);
                        setIsSelectionMode(false);
                    }
                }
            ]
        );
    };

    const handleBulkClean = async () => {
        if (selectedItemIds.length === 0) return;
        await bulkMarkItemsAsClean(selectedItemIds);
        setSelectedItemIds([]);
        setIsSelectionMode(false);
        Alert.alert('Success', 'Items marked as clean');
    };

    const renderPhoto = ({ item }: { item: { uri: string, itemId: string, itemName: string } }) => {
        const isSelected = selectedItemIds.includes(item.itemId);

        return (
            <TouchableOpacity
                style={styles.photoContainer}
                onPress={() => isSelectionMode ? toggleSelection(item.itemId) : navigation.navigate('ItemDetail', { itemId: item.itemId })}
                onLongPress={() => {
                    if (!isSelectionMode) {
                        setIsSelectionMode(true);
                        toggleSelection(item.itemId);
                    }
                }}
            >
                <Image source={{ uri: item.uri }} style={[styles.photo, isSelected && { opacity: 0.7 }]} />
                {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                    </View>
                )}
                <View style={styles.photoOverlay}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {isSelectionMode ? (
                    <>
                        <TouchableOpacity onPress={() => { setIsSelectionMode(false); setSelectedItemIds([]); }} style={styles.backButton}>
                            <MaterialCommunityIcons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>{selectedItemIds.length} Selected</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={handleBulkClean}>
                                <MaterialCommunityIcons name="sync" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleBulkDelete}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="chevron-left" size={32} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>{t('gallery.title', 'Photo Gallery')}</Text>
                        <TouchableOpacity onPress={() => setIsSelectionMode(true)}>
                            <MaterialCommunityIcons name="select-multiple" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {photos.length > 0 ? (
                <FlatList
                    data={photos}
                    renderItem={renderPhoto}
                    keyExtractor={(item, index) => `${item.itemId}-${index}`}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState icon="image-off-outline" title={t('gallery.noPhotos', 'No Photos Yet')} description={t('gallery.emptyDesc', 'Photos you capture during scans will appear here.')} colors={colors} />
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
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 40,
    },
    photoContainer: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        padding: 1,
    },
    photo: {
        flex: 1,
        borderRadius: 4,
    },
    photoOverlay: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    itemName: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        elevation: 5,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
});
