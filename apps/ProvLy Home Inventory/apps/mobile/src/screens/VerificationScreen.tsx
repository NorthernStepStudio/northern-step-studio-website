import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../stores/themeStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useTranslation } from 'react-i18next';
import { useProofScore } from '../hooks/useProofScore';

export default function VerificationScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { items, rooms, activeHomeId } = useInventoryStore();
    const { missingDocs } = useProofScore();

    const getRoomName = (roomId: string) => {
        return rooms.find(r => r.id === roomId)?.name || t('common.unknownRoom', 'Unknown Room');
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
        >
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemRoom, { color: colors.textSecondary }]}>
                    <MaterialCommunityIcons name="door-open" size={12} /> {getRoomName(items.find(i => i.id === item.id)?.roomId || '')}
                </Text>
                <View style={styles.missingBadges}>
                    {item.missing.photos && (
                        <View style={[styles.badge, { backgroundColor: `${colors.error}15` }]}>
                            <MaterialCommunityIcons name="camera-off" size={12} color={colors.error} />
                            <Text style={[styles.badgeText, { color: colors.error }]}>{t('claims.missingPhoto', 'Missing Photo')}</Text>
                        </View>
                    )}
                    {item.missing.price && (
                        <View style={[styles.badge, { backgroundColor: `${colors.error}15` }]}>
                            <MaterialCommunityIcons name="cash-off" size={12} color={colors.error} />
                            <Text style={[styles.badgeText, { color: colors.error }]}>{t('claims.missingPrice', 'Missing Price')}</Text>
                        </View>
                    )}
                    {item.missing.date && (
                        <View style={[styles.badge, { backgroundColor: `${colors.warning}15` }]}>
                            <MaterialCommunityIcons name="calendar-blank" size={12} color={colors.warning} />
                            <Text style={[styles.badgeText, { color: colors.warning }]}>{t('claims.missingDate', 'No Date')}</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: colors.primary }]}>{item.score}%</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{t('verification.title', 'Verification Hub')}</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {t('verification.subtitle', 'Items needing documentation')}
                    </Text>
                </View>
            </View>

            <FlatList
                data={missingDocs}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="shield-check" size={80} color="#10B981" />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            {t('verification.perfect', 'Perfect Score!')}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            {t('verification.perfectDesc', 'All items in this home are fully documented for insurance claims.')}
                        </Text>
                    </View>
                }
            />
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'space-between',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    itemRoom: {
        fontSize: 12,
        marginBottom: 10,
    },
    missingBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scoreValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 100,
        gap: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});
