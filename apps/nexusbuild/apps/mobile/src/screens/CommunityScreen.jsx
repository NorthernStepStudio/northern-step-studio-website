import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    RefreshControl,
    Modal,
    Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../core/i18n';
import { buildsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';

export default function CommunityScreen({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('recent'); // recent, popular, price_low, price_high
    const [filterMenuVisible, setFilterMenuVisible] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const loadBuilds = useCallback(async (shouldRefresh = false) => {
        if (shouldRefresh) {
            setPage(0);
            setLoading(true);
        }

        try {
            const currentOffset = shouldRefresh ? 0 : page * 20;
            const data = await buildsAPI.getCommunity({
                sort: filter,
                limit: 20,
                offset: currentOffset
            });

            const responseBuilds = Array.isArray(data)
                ? data
                : Array.isArray(data?.builds)
                    ? data.builds
                    : [];
            if (responseBuilds.length > 0 || shouldRefresh) {
                setBuilds(prev => shouldRefresh ? responseBuilds : [...prev, ...responseBuilds]);
                setHasMore(Array.isArray(data) ? false : Boolean(data?.has_more));
                if (!shouldRefresh && responseBuilds.length > 0) {
                    setPage(p => p + 1);
                }
            }
        } catch (error) {
            console.error('Error loading builds:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter, page]);

    useEffect(() => {
        loadBuilds(true);
    }, [filter]);

    const onRefresh = () => {
        setRefreshing(true);
        loadBuilds(true);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            loadBuilds(false);
        }
    };

    const handleVote = async (id) => {
        // Optimistic update
        setBuilds(prev => prev.map(b => {
            if (b.id === id) {
                return { ...b, likes: (b.likes || 0) + 1, isLiked: true };
            }
            return b;
        }));

        try {
            await buildsAPI.like(id);
        } catch (err) {
            console.error('Error liking build:', err);
        }
    };

    const renderBuildItem = ({ item }) => (
        <GlassCard style={styles.buildCard}>
            <View style={styles.buildHeader}>
                <View style={styles.userContainer}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.accentSecondary }]}>
                        <Text style={styles.avatarText}>
                            {(item.username || 'User')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={[styles.buildName, { color: theme.colors.textPrimary }]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.userName, { color: theme.colors.textSecondary }]}>
                            {t('community.buildCard.by')} {item.username || 'Anonymous'}
                        </Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: theme.colors.accentPrimary }]}>
                        {formatCurrency(item.total_price)}
                    </Text>
                </View>
            </View>

            <View style={styles.specsContainer}>
                <SpecItem icon="hardware-chip" text={item.parts?.cpu?.name} theme={theme} />
                <SpecItem icon="game-controller" text={item.parts?.gpu?.name} theme={theme} />
            </View>

            <View style={styles.divider} />

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleVote(item.id)}
                >
                    <Ionicons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={item.isLiked ? "#EF4444" : theme.colors.textSecondary}
                    />
                    <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
                        {item.likes || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('BuilderTab', { screen: 'BuilderMain', params: { initialBuild: item } })}
                >
                    <Ionicons name="copy-outline" size={20} color={theme.colors.textSecondary} />
                    <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
                        {t('community.actions.clone')}
                    </Text>
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    return (
        <Layout>
            <Header title={t('community.title')} navigation={navigation} />

            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: theme.colors.glassBg,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.glassBorder
            }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Legal', { initialTab: 'conduct' })}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                    <Ionicons name="book-outline" size={16} color={theme.colors.accentPrimary} />
                    <Text style={{ color: theme.colors.accentPrimary, fontSize: 13, fontWeight: 'bold' }}>Community Guidelines</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Menu Bar */}
            <View style={[styles.filterBar, { backgroundColor: theme.colors.glassBg, borderBottomColor: theme.colors.glassBorder }]}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' }}>
                    {t('community.title')}
                </Text>
                <TouchableOpacity
                    onPress={() => setFilterMenuVisible(true)}
                    style={[styles.filterButton, { backgroundColor: theme.colors.accentPrimary + '20', borderColor: theme.colors.accentPrimary }]}
                >
                    <Ionicons name="funnel-outline" size={16} color={theme.colors.accentPrimary} />
                    <Text style={{ color: theme.colors.accentPrimary, fontWeight: '600', fontSize: 13 }}>
                        {filter === 'recent' ? t('community.recent') :
                            filter === 'popular' ? t('community.popular') :
                                filter === 'price_low' ? t('parts.sort.priceLow') :
                                    filter === 'price_high' ? t('parts.sort.priceHigh') : filter}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={theme.colors.accentPrimary} />
                </TouchableOpacity>
            </View>

            {/* Filter Dropdown Modal */}
            <Modal
                visible={filterMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setFilterMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setFilterMenuVisible(false)}
                >
                    <View style={[styles.filterDropdown, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.glassBorder }]}>
                        <View style={[styles.dropdownHeader, { borderBottomColor: theme.colors.glassBorder }]}>
                            <Ionicons name="funnel" size={18} color={theme.colors.accentPrimary} />
                            <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16 }}>{t('parts.sort.title') || 'Sort By'}</Text>
                        </View>
                        {[
                            { key: 'recent', icon: 'time-outline' },
                            { key: 'popular', icon: 'heart-outline' },
                            { key: 'price_low', icon: 'trending-down-outline' },
                            { key: 'price_high', icon: 'trending-up-outline' }
                        ].map(item => (
                            <TouchableOpacity
                                key={item.key}
                                style={[
                                    styles.filterMenuItem,
                                    {
                                        backgroundColor: filter === item.key ? theme.colors.accentPrimary + '15' : 'transparent',
                                        borderBottomColor: theme.colors.glassBorder
                                    }
                                ]}
                                onPress={() => {
                                    setFilter(item.key);
                                    setFilterMenuVisible(false);
                                }}
                            >
                                <Ionicons
                                    name={item.icon}
                                    size={20}
                                    color={filter === item.key ? theme.colors.accentPrimary : theme.colors.textSecondary}
                                />
                                <Text style={{
                                    color: filter === item.key ? theme.colors.accentPrimary : theme.colors.textPrimary,
                                    fontWeight: filter === item.key ? 'bold' : 'normal',
                                    fontSize: 15,
                                    flex: 1
                                }}>
                                    {item.key === 'recent' ? t('community.recent') :
                                        item.key === 'popular' ? t('community.popular') :
                                            item.key === 'price_low' ? t('parts.sort.priceLow') :
                                                item.key === 'price_high' ? t('parts.sort.priceHigh') : item.key}
                                </Text>
                                {filter === item.key && (
                                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.accentPrimary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            <FlatList
                data={builds}
                renderItem={renderBuildItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accentPrimary} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="construct-outline" size={64} color={theme.colors.textMuted} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                {t('community.actions.noBuilds')}
                            </Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    loading && !refreshing && <ActivityIndicator size="small" color={theme.colors.accentPrimary} style={{ margin: 20 }} />
                }
            />
        </Layout>
    );
}

const SpecItem = ({ icon, text, theme }) => {
    if (!text) return null;
    return (
        <View style={styles.specItem}>
            <Ionicons name={icon} size={16} color={theme.colors.textSecondary} />
            <Text numberOfLines={1} style={[styles.specText, { color: theme.colors.textSecondary }]}>
                {text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    filterDropdown: {
        width: '90%',
        maxWidth: 320,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        borderBottomWidth: 1,
    },
    filterMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
    },
    listContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 100,
    },
    buildCard: {
        padding: 16,
        gap: 12,
    },
    buildHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    buildName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 12,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    specsContainer: {
        gap: 4,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    specText: {
        fontSize: 13,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
