import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform,
    Image,
    Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../stores/themeStore';
import { useTranslation } from 'react-i18next';
import { useProofScore } from '../hooks/useProofScore';
import { useThemeStore } from '../stores/themeStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import LegalFooter from '../components/LegalFooter';

export default function HomeScreen() {
    const { colors, isDark } = useTheme();
    const { session } = useAuthStore();
    const {
        homes,
        items,
        fetchInventory,
        loading,
        error,
        activeHomeId,
        setActiveHome,
        initialized,
        activities,
        maintenanceTasks
    } = useInventoryStore();

    const { theme, setTheme } = useThemeStore();
    const { isPro } = useSubscriptionStore();

    const navigation = useNavigation<any>();
    const { aggregateScore, missingDocsBreakdown, totalItems } = useProofScore();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, isDark);

    const [refreshing, setRefreshing] = useState(false);
    const [showHomePicker, setShowHomePicker] = useState(false);

    // Filter by active home
    const homeItems = useMemo(() => items.filter(i => i.homeId === activeHomeId), [items, activeHomeId]);
    const activeHome = useMemo(() => homes.find(h => h.id === activeHomeId), [homes, activeHomeId]);

    const totalValue = useMemo(() =>
        homeItems.reduce((sum, item) => sum + (Number(item.purchasePrice) || 0), 0),
        [homeItems]);

    const upcomingWarrantiesCount = useMemo(() => {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        return homeItems.filter(item => {
            if (!item.warrantyExpiry) return false;
            const expiry = new Date(item.warrantyExpiry);
            return expiry > now && expiry <= thirtyDaysFromNow;
        }).length;
    }, [homeItems]);

    const activeTasksCount = useMemo(() =>
        maintenanceTasks.filter(t => !t.isCompleted && (t.homeId === activeHomeId || !t.homeId)).length,
        [maintenanceTasks, activeHomeId]);

    const careHealthScore = useMemo(() => {
        const homeTasks = maintenanceTasks.filter(t => t.homeId === activeHomeId || !t.homeId);
        if (homeTasks.length === 0) return 100;
        const completed = homeTasks.filter(t => t.isCompleted).length;
        return Math.round((completed / homeTasks.length) * 100);
    }, [maintenanceTasks, activeHomeId]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchInventory();
        setRefreshing(false);
    }, [fetchInventory]);

    // Format activity timestamp
    const formatActivityTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('home.justNow', 'Just now');
        if (diffInSeconds < 3600) {
            const mins = Math.floor(diffInSeconds / 60);
            return `${mins} ${mins === 1 ? t('common.min', 'min') : t('common.mins', 'mins')} ${t('common.ago', 'ago')}`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? t('common.hour', 'hour') : t('common.hours', 'hours')} ${t('common.ago', 'ago')}`;
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'item_added': return 'plus-circle-outline';
            case 'item_deleted': return 'minus-circle-outline';
            case 'room_added': return 'home-plus-outline';
            case 'room_deleted': return 'home-remove-outline';
            case 'item_updated': return 'pencil-outline';
            default: return 'bell-outline';
        }
    };


    // Initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            fetchInventory();
        }
    }, [initialized, fetchInventory]);


    if (!initialized || (loading && items.length === 0 && !refreshing)) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Waking up your vault...</Text>
            </View>
        );
    }

    const renderEmptyState = () => {
        const noHomes = homes.length === 0;
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons
                        name={noHomes ? "home-plus-outline" : "shield-check-outline"}
                        size={60}
                        color={colors.primary}
                    />
                </View>

                <Text style={styles.emptyTitle}>
                    {noHomes ? t('home.noHomesTitle', "Where is your property?") : t('home.noItemsTitle', "Build your inventory in minutes")}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {noHomes
                        ? t('home.noHomesSubtitle', "To start organizing your valuables, first create a property to put them in.")
                        : t('home.noItemsSubtitle', "Start with your most valuable items first. Let's make your home claim-ready.")
                    }
                </Text>

                {noHomes ? (
                    <TouchableOpacity
                        style={styles.bigButtonPrimary}
                        onPress={() => navigation.navigate('RoomsTab', { openAddHome: true })}
                    >
                        <MaterialCommunityIcons name="home-plus" size={24} color="#FFF" />
                        <Text style={styles.bigButtonText}>{t('home.createHome', 'Create Your First Home')}</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.bigButtonPrimary}
                            onPress={() => navigation.navigate('CameraScan')}
                        >
                            <MaterialCommunityIcons name="camera-outline" size={24} color="#FFF" />
                            <Text style={styles.bigButtonText}>{t('home.scanFirst', 'Scan your first item')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bigButtonOutline}
                            onPress={() => navigation.navigate('AddItem')}
                        >
                            <MaterialCommunityIcons name="plus" size={24} color={colors.text} />
                            <Text style={styles.bigButtonOutlineText}>{t('home.addManual', 'Add item manually')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
            }]}>
                <View style={styles.logoSection}>
                    <View>
                        <Text style={styles.logoText}>ProvLy</Text>
                        <Text style={styles.logoSubtext}>{t('home.logoSubtext', 'Your home inventory, organized.')}</Text>

                        {homes.length > 0 && (
                            <TouchableOpacity
                                style={styles.homeSwitcher}
                                onPress={() => setShowHomePicker(!showHomePicker)}
                            >
                                <Text style={styles.homeSwitcherText}>
                                    {activeHome?.name || t('home.primaryHome', 'Primary Home')}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Search')}
                        style={{ padding: 4 }}
                    >
                        <MaterialCommunityIcons name="magnify" size={28} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('SettingsTab', { screen: 'Profile' })}>
                        {session?.user?.user_metadata?.avatar_url ? (
                            <Image
                                source={{ uri: session.user.user_metadata.avatar_url }}
                                style={styles.headerAvatar}
                            />
                        ) : (
                            <MaterialCommunityIcons name="cog-outline" size={28} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Home Picker Popover */}
            {showHomePicker && (
                <View style={styles.homePicker}>
                    {homes.map(home => (
                        <TouchableOpacity
                            key={home.id}
                            style={styles.homePickerItem}
                            onPress={() => {
                                setActiveHome(home.id);
                                setShowHomePicker(false);
                            }}
                        >
                            <Text style={[
                                styles.homePickerText,
                                { color: activeHomeId === home.id ? colors.primary : colors.text }
                            ]}>
                                {home.name}
                            </Text>
                            {activeHomeId === home.id && <MaterialCommunityIcons name="check" size={16} color={colors.primary} />}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.homePickerItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
                        onPress={() => {
                            setShowHomePicker(false);
                            navigation.navigate('RoomsTab');
                        }}
                    >
                        <Text style={[styles.homePickerText, { color: colors.textSecondary }]}>{t('home.manageHomes', 'Manage Homes')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {homes.length === 0 || totalItems === 0 ? (
                renderEmptyState()
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {/* Primary Actions */}
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('CameraScan')}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                                <MaterialCommunityIcons name="camera-outline" size={32} color={colors.primary} />
                            </View>
                            <Text style={styles.actionTitle}>{t('home.scanItem', 'Scan Item')}</Text>
                            <Text style={styles.actionDesc}>{t('home.scanDesc', 'Photo & save fast.')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('AddItem')}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                                <MaterialCommunityIcons name="plus" size={32} color={colors.primary} />
                            </View>
                            <Text style={styles.actionTitle}>{t('home.addItem', 'Add Item')}</Text>
                            <Text style={styles.actionDesc}>{t('home.addItemDesc', 'Manual entry.')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Secondary Actions */}
                    <View style={styles.secondaryActionRow}>
                        <TouchableOpacity
                            style={styles.rowItem}
                            onPress={() => navigation.navigate('ClaimCenter')}
                        >
                            <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.textSecondary} />
                            <Text style={styles.rowItemText}>{t('home.export', 'Export')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rowItem}
                            onPress={() => navigation.navigate('RoomsTab')}
                        >
                            <MaterialCommunityIcons name="home-outline" size={24} color={colors.textSecondary} />
                            <Text style={styles.rowItemText}>{t('home.manageRooms', 'Manage Rooms')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Inventory Snapshot */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{t('home.inventorySnapshot', 'Inventory Snapshot')}</Text>
                        <View style={styles.statRow}>
                            <View style={styles.statSubItem}>
                                <Text style={styles.statValue}>{totalItems}</Text>
                                <Text style={styles.statLabel}>{t('inventory.items', 'Items')}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statSubItem}>
                                <Text style={styles.statValue}>${totalValue.toLocaleString()}</Text>
                                <Text style={styles.statLabel}>{t('home.knownValue', 'Known Value')}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statSubItem}>
                                <Text style={styles.statValue}>{missingDocsBreakdown.all}</Text>
                                <Text style={styles.statLabel}>{t('home.missingInfo', 'Missing Info')}</Text>
                            </View>
                        </View>
                        <View style={styles.tipRow}>
                            <MaterialCommunityIcons name="lightbulb-outline" size={16} color={colors.primary} />
                            <Text style={styles.tipText}>
                                {t('home.tipTitle', 'Tip: Add photos and prices for faster claims.')}
                            </Text>
                        </View>
                    </View>

                    {/* Maintenance & Care Overview */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderWithAction}>
                            <Text style={styles.cardTitle}>{t('maintenance.homeCare', 'Home Care')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Maintenance')}>
                                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.statRow}>
                            <View style={styles.statSubItem}>
                                <Text style={[styles.statValue, { color: activeTasksCount > 0 ? colors.primary : colors.textSecondary }]}>
                                    {activeTasksCount}
                                </Text>
                                <Text style={styles.statLabel}>{t('maintenance.tasksDue', 'Tasks Due')}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statSubItem}>
                                <Text style={[styles.statValue, { color: upcomingWarrantiesCount > 0 ? '#EF4444' : colors.textSecondary }]}>
                                    {upcomingWarrantiesCount}
                                </Text>
                                <Text style={styles.statLabel}>{t('maintenance.warrantyAlerts', 'Warranty Alerts')}</Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={[styles.statLabel, { fontSize: 11 }]}>HOME HEALTH</Text>
                                <Text style={[styles.statLabel, { fontSize: 11, fontWeight: '700', color: colors.primary }]}>{careHealthScore}%</Text>
                            </View>
                            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
                                <View style={{ height: '100%', width: `${careHealthScore}%`, backgroundColor: colors.primary }} />
                            </View>
                        </View>

                        {activeTasksCount === 0 && upcomingWarrantiesCount === 0 && (
                            <View style={[styles.tipRow, { marginTop: 12 }]}>
                                <MaterialCommunityIcons name="check-circle-outline" size={16} color="#10B981" />
                                <Text style={[styles.tipText, { color: '#10B981' }]}>
                                    {t('maintenance.allGood', 'Your home care is up to date.')}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Claim Readiness (Proof Health) */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderWithAction}>
                            <Text style={styles.cardTitle}>{t('home.claimReadiness', 'Claim Readiness')}</Text>
                            <View style={[styles.badge, { backgroundColor: `${colors.primary}20` }]}>
                                <Text style={[styles.badgeText, { color: colors.primary }]}>{aggregateScore}%</Text>
                            </View>
                        </View>

                        <View style={styles.healthItem}>
                            <MaterialCommunityIcons name="camera-off-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.healthText}>{t('home.photosMissing', 'Photos missing:')}</Text>
                            <Text style={styles.healthValue}>{missingDocsBreakdown.photos}</Text>
                        </View>

                        <View style={styles.healthItem}>
                            <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.healthText}>{t('home.receiptsMissing', 'Prices missing:')}</Text>
                            <Text style={styles.healthValue}>{missingDocsBreakdown.receipts}</Text>
                        </View>

                        <View style={styles.healthItem}>
                            <MaterialCommunityIcons name="numeric" size={20} color={colors.textSecondary} />
                            <Text style={styles.healthText}>{t('home.serialMissing', 'Serial/model missing:')}</Text>
                            <Text style={styles.healthValue}>{missingDocsBreakdown.serial}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.fixButton}
                            onPress={() => navigation.navigate('ClaimCenter')}
                        >
                            <Text style={styles.fixButtonText}>{t('home.fixMissing', 'Fix Missing Info')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Shortcuts */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('home.quickShortcuts', 'Quick Shortcuts')}</Text>
                    </View>
                    <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
                        <TouchableOpacity
                            style={[styles.shortcutItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                            onPress={() => navigation.navigate('ClaimCenter')}
                        >
                            <Text style={styles.shortcutText}>{t('home.itemsMissingValue', 'Items missing value')}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.shortcutItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                            onPress={() => navigation.navigate('ClaimCenter')}
                        >
                            <Text style={styles.shortcutText}>{t('claims.title', 'Claim Center')}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
                        </TouchableOpacity>

                        <View style={[styles.shortcutItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                            <Text style={styles.shortcutText}>{t('settings.darkMode', 'Dark Mode')}</Text>
                            <Switch
                                value={isDark}
                                onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                            />
                        </View>

                        {!isPro && (
                            <TouchableOpacity
                                style={styles.shortcutItem}
                                onPress={() => navigation.navigate('Upgrade')}
                            >
                                <Text style={[styles.shortcutText, { color: colors.primary, fontWeight: 'bold' }]}>
                                    {t('common.upgrade', 'Upgrade to Pro')}
                                </Text>
                                <MaterialCommunityIcons name="star-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Recent Activity */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('home.recentActivity', 'Recent Activity')}</Text>
                    </View>
                    <View style={styles.card}>
                        {activities.length > 0 ? (
                            activities.map((activity, index) => (
                                <View key={activity.id} style={[
                                    styles.activityItem,
                                    index !== activities.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                                ]}>
                                    <View style={[styles.activityIcon, { backgroundColor: `${colors.primary}15` }]}>
                                        <MaterialCommunityIcons
                                            name={getActivityIcon(activity.type) as any}
                                            size={18}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{activity.title}</Text>
                                        <Text style={styles.activitySub}>{activity.subtitle || t('home.systemUpdate', 'System update')}</Text>
                                    </View>
                                    <Text style={styles.activityTime}>{formatActivityTime(activity.timestamp)}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyActivity}>{t('home.noRecentActivity', 'No recent activity — start by scanning your first item.')}</Text>
                        )}
                    </View>

                    <LegalFooter />
                </ScrollView>
            )}
        </View>
    );
}

function getStyles(colors: any, isDark: boolean) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        logoSection: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        logoText: {
            fontSize: 26,
            fontWeight: '900',
            letterSpacing: -1,
            color: colors.text,
        },
        logoSubtext: {
            fontSize: 13,
            fontWeight: '500',
            marginTop: -2,
            color: colors.textSecondary,
        },
        homeSwitcher: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 6,
        },
        homeSwitcherText: {
            fontSize: 15,
            fontWeight: '700',
            marginRight: 4,
            color: colors.primary,
        },
        homePicker: {
            position: 'absolute',
            top: 110,
            left: 20,
            right: 20,
            zIndex: 100,
            borderRadius: 16,
            padding: 8,
            borderWidth: 1,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            ...Platform.select({
                web: {
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                },
                default: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 10,
                },
            }),
        },
        homePickerItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            alignItems: 'center',
        },
        homePickerText: {
            fontSize: 16,
            fontWeight: '600',
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingTop: 16,
        },
        actionGrid: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
        },
        actionButton: {
            flex: 1,
            padding: 20,
            borderRadius: 24,
            borderWidth: 1,
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
        },
        actionIconContainer: {
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        actionTitle: {
            fontSize: 17,
            fontWeight: '700',
            color: colors.text,
        },
        actionDesc: {
            fontSize: 12,
            marginTop: 2,
            color: colors.textSecondary,
        },
        secondaryActionRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24,
        },
        rowItem: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 16,
            borderWidth: 1,
            gap: 10,
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
        },
        rowItemText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        card: {
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            marginBottom: 24,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            ...Platform.select({
                web: {
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                },
                default: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 2,
                },
            }),
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 20,
            color: colors.text,
        },
        statRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        statSubItem: {
            alignItems: 'center',
            flex: 1,
        },
        statValue: {
            fontSize: 20,
            fontWeight: '800',
            color: colors.text,
        },
        statLabel: {
            fontSize: 12,
            marginTop: 4,
            color: colors.textSecondary,
        },
        statDivider: {
            width: 1,
            height: 30,
            backgroundColor: colors.border,
        },
        tipRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 24,
            gap: 8,
        },
        tipText: {
            fontSize: 12,
            fontWeight: '500',
            color: colors.textSecondary,
        },
        cardHeaderWithAction: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        badge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
        },
        badgeText: {
            fontSize: 13,
            fontWeight: '800',
        },
        healthItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            gap: 12,
        },
        healthText: {
            flex: 1,
            fontSize: 14,
            fontWeight: '500',
            color: colors.textSecondary,
        },
        healthValue: {
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
        },
        fixButton: {
            marginTop: 12,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: 'center',
            backgroundColor: colors.primary,
        },
        fixButtonText: {
            color: '#FFF',
            fontWeight: '700',
            fontSize: 15,
        },
        sectionHeader: {
            marginBottom: 12,
            paddingHorizontal: 8,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
        },
        shortcutItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 18,
        },
        shortcutText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            gap: 14,
        },
        activityIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
        },
        activityInfo: {
            flex: 1,
        },
        activityTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        activitySub: {
            fontSize: 12,
            marginTop: 2,
            color: colors.textSecondary,
        },
        activityTime: {
            fontSize: 11,
            color: colors.textSecondary,
        },
        emptyActivity: {
            fontSize: 13,
            fontStyle: 'italic',
            textAlign: 'center',
            color: colors.textSecondary,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
        },
        emptyIconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 32,
            backgroundColor: colors.surfaceVariant,
        },
        emptyTitle: {
            fontSize: 24,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 12,
            color: colors.text,
        },
        emptySubtitle: {
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 40,
            color: colors.textSecondary,
        },
        bigButtonPrimary: {
            flexDirection: 'row',
            width: '100%',
            padding: 18,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 16,
            backgroundColor: colors.primary,
        },
        bigButtonText: {
            color: '#FFF',
            fontSize: 17,
            fontWeight: '700',
        },
        bigButtonOutline: {
            flexDirection: 'row',
            width: '100%',
            padding: 18,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            gap: 12,
            marginBottom: 32,
            borderColor: colors.border,
        },
        bigButtonOutlineText: {
            fontSize: 17,
            fontWeight: '700',
            color: colors.text,
        },
        seedLink: {
            flexDirection: 'row',
        },
        seedLinkText: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        bottomSpacer: {
            height: 40,
        },
        centerContent: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerAvatar: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.05)',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 15,
            fontWeight: '600',
            color: colors.textSecondary,
        },
    });
}
