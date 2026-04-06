import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useInventoryStore, Room, Home } from '../stores/inventoryStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RoomIcon } from '../lib/roomIcons';
import { useTheme } from '../stores/themeStore';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { FEATURES } from '../config/features';
import LegalFooter from '../components/LegalFooter';

// UI Components
const QuickActionButton = ({ icon, label, onPress, color, colors, t }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.textSecondary }]}>{t(`vault.${label.toLowerCase().replace(' ', '')}`, label)}</Text>
    </TouchableOpacity>
);

const EmptyState = ({ icon, title, description, buttonLabel, onPress, colors }: any) => (
    <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name={icon} size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>{description}</Text>
        {buttonLabel && (
            <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={onPress}>
                <Text style={styles.emptyButtonText}>{buttonLabel}</Text>
            </TouchableOpacity>
        )}
    </View>
);

export default function ManageRoomsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const {
        homes, activeHomeId, setActiveHome, addHome, updateHome, deleteHome,
        rooms, items, updateRoom, deleteRoom, reorderRooms, fetchInventory,
        loading, initialized
    } = useInventoryStore();

    const { isPro } = useSubscriptionStore();

    const [showHomeModal, setShowHomeModal] = useState(false);
    const [editingHome, setEditingHome] = useState<Home | null>(null);
    const [homeName, setHomeName] = useState('');
    const [homeAddress, setHomeAddress] = useState('');
    const [templateType, setTemplateType] = useState<'basic' | 'advanced' | 'empty'>('empty');

    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [editRoomName, setEditRoomName] = useState('');
    const [editRoomIcon, setEditRoomIcon] = useState('');
    const [editRoomParentId, setEditRoomParentId] = useState<string | undefined>(undefined);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'items' | 'order'>('order');

    useEffect(() => {
        fetchInventory();

        // Handle auto-opening the add home modal if requested
        if (route.params?.openAddHome) {
            setShowHomeModal(true);
            setEditingHome(null);
            setHomeName('');
            setHomeAddress('');

            // Clear the param so it doesn't reopen if the screen re-renders
            navigation.setParams({ openAddHome: undefined });
        }
    }, [route.params?.openAddHome]);

    const activeHome = useMemo(() => homes.find(h => h.id === activeHomeId), [homes, activeHomeId]);

    const filteredRooms = useMemo(() => {
        let rs = rooms.filter(r => r.homeId === activeHomeId);

        if (searchQuery) {
            rs = rs.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (sortBy === 'name') {
            rs.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'items') {
            rs.sort((a, b) => b.itemCount - a.itemCount);
        } else {
            rs.sort((a, b) => a.orderIndex - b.orderIndex);
        }

        return rs;
    }, [rooms, activeHomeId, searchQuery, sortBy]);

    const parentRooms = useMemo(() => filteredRooms.filter(r => !r.parentId), [filteredRooms]);
    const getChildren = (parentId: string) => filteredRooms.filter(r => r.parentId === parentId);

    const handleAddHome = async () => {
        if (!homeName.trim()) return;
        try {
            if (editingHome) {
                await updateHome(editingHome.id, { name: homeName, address: homeAddress });
            } else {
                await addHome(homeName, homeAddress, templateType);
            }
            setShowHomeModal(false);
            setHomeName('');
            setHomeAddress('');
            setEditingHome(null);
        } catch (e) {
            Alert.alert(t('common.error'), t('errors.unknownError'));
        }
    };

    const handleHomeOptions = (home: Home) => {
        Alert.alert(
            t('vault.homeOptions', 'Home Options'),
            t('vault.homeOptionsDesc', { name: home.name, defaultValue: `Manage ${home.name}` }),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('vault.editHome', 'Edit Info'),
                    onPress: () => {
                        setEditingHome(home);
                        setHomeName(home.name);
                        setHomeAddress(home.address || '');
                        setShowHomeModal(true);
                    }
                },
                {
                    text: t('common.delete', 'Delete Home'),
                    style: 'destructive',
                    onPress: () => confirmDeleteHome(home)
                }
            ]
        );
    };

    const confirmDeleteHome = (home: Home) => {
        Alert.alert(
            t('vault.deleteHome', 'Delete Home?'),
            t('vault.deleteHomeDesc', { name: home.name, defaultValue: `Are you sure you want to delete "${home.name}"? This will permanently remove all rooms and items within it.` }),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('common.delete', 'Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteHome(home.id);
                        } catch (e) {
                            Alert.alert(t('common.error'), t('errors.unknownError'));
                        }
                    }
                }
            ]
        );
    };

    const handleSaveRoomEdit = async () => {
        if (editingRoom && editRoomName.trim()) {
            try {
                await updateRoom(editingRoom.id, {
                    name: editRoomName.trim(),
                    icon: editRoomIcon,
                    parentId: editRoomParentId,
                });
                setEditingRoom(null);
            } catch (error) {
                Alert.alert(t('common.error'), t('errors.unknownError'));
            }
        }
    };

    const moveRoom = async (room: Room, direction: 'up' | 'down') => {
        // Filter siblings (rooms at the same level)
        const siblings = rooms
            .filter(r => r.homeId === activeHomeId && r.parentId === room.parentId)
            .sort((a, b) => a.orderIndex - b.orderIndex);

        const index = siblings.findIndex(r => r.id === room.id);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= siblings.length) return;

        const newOrder = [...siblings];
        const [moved] = newOrder.splice(index, 1);
        newOrder.splice(newIndex, 0, moved);

        await reorderRooms(activeHomeId!, newOrder.map(r => r.id));
    };

    if (!initialized || (loading && homes.length === 0)) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {navigation.canGoBack() && (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ padding: 4, marginLeft: -8 }}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('vault.title')}</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('vault.subtitle')}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                        style={[styles.iconHeaderBtn, { backgroundColor: colors.surfaceVariant }]}
                        onPress={() => navigation.navigate('Search')}
                    >
                        <MaterialCommunityIcons name="magnify" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.newHomeButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            setEditingHome(null);
                            setHomeName('');
                            setHomeAddress('');
                            setTemplateType('basic');
                            setShowHomeModal(true);
                        }}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                        <Text style={styles.newHomeText}>{t('vault.newHome')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Home Selector */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.homeSelector}
                    contentContainerStyle={styles.homeSelectorContent}
                >
                    {homes.map(home => (
                        <TouchableOpacity
                            key={home.id}
                            style={[
                                styles.homeCard,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                activeHomeId === home.id && { borderColor: colors.primary, borderWidth: 2 }
                            ]}
                            onPress={() => setActiveHome(home.id)}
                            onLongPress={() => {
                                setEditingHome(home);
                                setHomeName(home.name);
                                setHomeAddress(home.address || '');
                                setShowHomeModal(true);
                            }}
                        >
                            <View style={styles.homeCardHeader}>
                                <MaterialCommunityIcons
                                    name={home.id === 'default-home' ? "home" : "office-building"}
                                    size={24}
                                    color={activeHomeId === home.id ? colors.primary : colors.textSecondary}
                                />
                                <TouchableOpacity onPress={() => handleHomeOptions(home)}>
                                    <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.homeCardName, { color: colors.text }]} numberOfLines={1}>{home.name}</Text>
                            <Text style={[styles.homeCardStats, { color: colors.textSecondary }]}>
                                {t('vault.items_rooms', { items: home.itemCount, rooms: home.roomCount, defaultValue: `${home.itemCount} Items • ${home.roomCount} Rooms` })}
                            </Text>
                            <Text style={[styles.homeCardValue, { color: colors.primary }]}>
                                ${(home.totalValue || 0).toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[styles.homeCard, styles.addHomePlaceholder, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}
                        onPress={() => {
                            setEditingHome(null);
                            setHomeName('');
                            setHomeAddress('');
                            setShowHomeModal(true);
                        }}
                    >
                        <View style={{ backgroundColor: `${colors.primary}15`, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
                        </View>
                        <Text style={[styles.addHomeText, { color: colors.textSecondary }]}>{t('vault.newHome')}</Text>
                    </TouchableOpacity>
                </ScrollView>

                {activeHome ? (
                    <View style={styles.activeHomeContent}>
                        {/* Quick Actions Strip */}
                        <View style={[styles.quickActionsStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <QuickActionButton
                                icon="plus-box"
                                label="Add Item"
                                color="#3B82F6"
                                colors={colors}
                                t={t}
                                onPress={() => navigation.navigate('AddItem', { homeId: activeHomeId })}
                            />
                            <QuickActionButton
                                icon="camera"
                                label="Scan"
                                color="#10B981"
                                colors={colors}
                                t={t}
                                onPress={() => navigation.navigate('CameraScan')}
                            />
                            <QuickActionButton
                                icon="door-open"
                                label="Add Room"
                                color="#8B5CF6"
                                colors={colors}
                                t={t}
                                onPress={() => navigation.navigate('AddRoom', { homeId: activeHomeId })}
                            />
                            <QuickActionButton
                                icon="export-variant"
                                label="Export"
                                color="#F59E0B"
                                colors={colors}
                                t={t}
                                onPress={() => navigation.navigate('ClaimCenter')}
                            />
                            <QuickActionButton
                                icon="image-multiple"
                                label="Gallery"
                                color="#EC4899"
                                colors={colors}
                                t={t}
                                onPress={() => navigation.navigate('Gallery')}
                            />
                            {FEATURES.ENABLE_MAINTENANCE && (
                                <QuickActionButton
                                    icon="wrench"
                                    label="Care"
                                    color="#F97316"
                                    colors={colors}
                                    t={t}
                                    onPress={() => navigation.navigate('Maintenance')}
                                />
                            )}
                        </View>

                        {/* Search and Sort */}
                        <View style={styles.listControls}>
                            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
                                <TextInput
                                    placeholder={t('vault.search', 'Search rooms...')}
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.searchInput, { color: colors.text }]}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                            <View style={styles.sortButtons}>
                                <TouchableOpacity
                                    style={[styles.sortButton, sortBy === 'order' && { backgroundColor: `${colors.primary}15` }]}
                                    onPress={() => setSortBy('order')}
                                >
                                    <MaterialCommunityIcons name="sort-variant" size={18} color={sortBy === 'order' ? colors.primary : colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.sortButton, sortBy === 'name' && { backgroundColor: `${colors.primary}15` }]}
                                    onPress={() => setSortBy('name')}
                                >
                                    <MaterialCommunityIcons name="sort-alphabetical-ascending" size={18} color={sortBy === 'name' ? colors.primary : colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.sortButton, sortBy === 'items' && { backgroundColor: `${colors.primary}15` }]}
                                    onPress={() => setSortBy('items')}
                                >
                                    <MaterialCommunityIcons name="numeric-9-plus-box-outline" size={18} color={sortBy === 'items' ? colors.primary : colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Rooms List */}
                        {parentRooms.length > 0 ? (
                            parentRooms.map((room) => {
                                const children = getChildren(room.id);
                                return (
                                    <View key={room.id} style={[styles.roomCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                        <View style={styles.roomMainRow}>
                                            <TouchableOpacity
                                                style={styles.roomInfoArea}
                                                onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })}
                                            >
                                                <RoomIcon icon={room.icon} size={24} containerSize={44} />
                                                <View style={styles.roomTextContainer}>
                                                    <Text style={[styles.roomName, { color: colors.text }]}>{room.name}</Text>
                                                    <Text style={[styles.roomStatText, { color: colors.textSecondary }]}>
                                                        {t('vault.item_count', { count: room.itemCount, defaultValue: `${room.itemCount} Items` })} {children.length > 0 ? `• ${t('vault.subroom_count', { count: children.length, defaultValue: `${children.length} sub-rooms` })}` : ''}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                            <View style={styles.roomActions}>
                                                {sortBy === 'order' && (
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <TouchableOpacity onPress={() => moveRoom(room, 'up')} style={styles.reorderBtn}>
                                                            <MaterialCommunityIcons name="chevron-up" size={20} color={colors.textSecondary} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => moveRoom(room, 'down')} style={styles.reorderBtn}>
                                                            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textSecondary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                <TouchableOpacity onPress={() => {
                                                    setEditingRoom(room);
                                                    setEditRoomName(room.name);
                                                    setEditRoomIcon(room.icon);
                                                    setEditRoomParentId(room.parentId);
                                                }}>
                                                    <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.textSecondary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {children.map(child => (
                                            <TouchableOpacity
                                                key={child.id}
                                                style={[styles.childRoomRow, { borderTopColor: colors.border }]}
                                                onPress={() => navigation.navigate('RoomDetail', { roomId: child.id })}
                                            >
                                                <View style={[styles.childConnector, { borderColor: colors.border }]} />
                                                <RoomIcon icon={child.icon} size={18} containerSize={32} />
                                                <View style={styles.childTextContainer}>
                                                    <Text style={[styles.childRoomName, { color: colors.text }]}>{child.name}</Text>
                                                    <Text style={[styles.childRoomStats, { color: colors.textSecondary }]}>{t('vault.item_count', { count: child.itemCount, defaultValue: `${child.itemCount} Items` })}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {sortBy === 'order' && (
                                                        <>
                                                            <TouchableOpacity onPress={() => moveRoom(child, 'up')} style={styles.reorderBtn}>
                                                                <MaterialCommunityIcons name="chevron-up" size={18} color={colors.textSecondary} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => moveRoom(child, 'down')} style={styles.reorderBtn}>
                                                                <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
                                                            </TouchableOpacity>
                                                        </>
                                                    )}
                                                    <TouchableOpacity onPress={() => {
                                                        setEditingRoom(child);
                                                        setEditRoomName(child.name);
                                                        setEditRoomIcon(child.icon);
                                                        setEditRoomParentId(child.parentId);
                                                    }}>
                                                        <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.textSecondary} />
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                );
                            })
                        ) : (
                            <EmptyState
                                icon="door-open"
                                title={t('vault.noRooms', "No Rooms Yet")}
                                description={t('vault.noRoomsDesc', "Add rooms like 'Kitchen' or 'Garage' to organize your items.")}
                                buttonLabel={t('vault.addRoom', "Add First Room")}
                                colors={colors}
                                onPress={() => navigation.navigate('AddRoom', { homeId: activeHomeId })}
                            />
                        )}
                    </View>
                ) : (
                    <EmptyState
                        icon="home-city-outline"
                        title={t('vault.emptyState')}
                        description={t('vault.emptyStateDesc', "Create your first home to start building your inventory and tracking your assets professionally.")}
                        buttonLabel={t('vault.createHome', "Create My First Home")}
                        colors={colors}
                        onPress={() => setShowHomeModal(true)}
                    />
                )}

                <LegalFooter />
            </ScrollView>

            {/* Home Modal */}
            <Modal visible={showHomeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalKeyboard}>
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>{editingHome ? t('vault.editHome') : t('vault.newHome')}</Text>
                                <TouchableOpacity onPress={() => setShowHomeModal(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('vault.homeName')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                value={homeName}
                                onChangeText={setHomeName}
                                placeholder={t('vault.homeName')}
                                placeholderTextColor={colors.textSecondary}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>{t('vault.address')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                value={homeAddress}
                                onChangeText={setHomeAddress}
                                placeholder=""
                                placeholderTextColor={colors.textSecondary}
                            />

                            {!editingHome && (
                                <>
                                    <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>{t('vault.templates.title')}</Text>
                                    <View style={styles.templateContainer}>
                                        <TouchableOpacity
                                            style={[styles.templateOption, { borderColor: colors.border }, templateType === 'empty' && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }]}
                                            onPress={() => setTemplateType('empty')}
                                        >
                                            <View style={styles.templateTop}>
                                                <Text style={[styles.templateName, { color: colors.text }]}>{t('vault.templates.emptyName')}</Text>
                                                <MaterialCommunityIcons name={templateType === 'empty' ? "check-circle" : "circle-outline"} size={20} color={templateType === 'empty' ? colors.primary : colors.textSecondary} />
                                            </View>
                                            <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>{t('vault.templates.emptyDesc')}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.templateOption, { borderColor: colors.border }, templateType === 'basic' && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }]}
                                            onPress={() => setTemplateType('basic')}
                                        >
                                            <View style={styles.templateTop}>
                                                <Text style={[styles.templateName, { color: colors.text }]}>{t('vault.templates.basicName')}</Text>
                                                <MaterialCommunityIcons name={templateType === 'basic' ? "check-circle" : "circle-outline"} size={20} color={templateType === 'basic' ? colors.primary : colors.textSecondary} />
                                            </View>
                                            <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>{t('vault.templates.basicDesc')}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.templateOption, { borderColor: colors.border }, templateType === 'advanced' && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }, !isPro && styles.disabledOption]}
                                            onPress={() => isPro ? setTemplateType('advanced') : navigation.navigate('Upgrade')}
                                        >
                                            <View style={styles.templateTop}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    <Text style={[styles.templateName, { color: colors.text }]}>{t('vault.templates.advName')}</Text>
                                                    {!isPro && (
                                                        <View style={styles.proBadge}>
                                                            <Text style={styles.proBadgeText}>{t('vault.templates.proOnly')}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <MaterialCommunityIcons name={isPro ? (templateType === 'advanced' ? "check-circle" : "circle-outline") : "lock"} size={20} color={templateType === 'advanced' ? colors.primary : colors.textSecondary} />
                                            </View>
                                            <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>{t('vault.templates.advDesc')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                onPress={handleAddHome}
                            >
                                <Text style={styles.saveBtnText}>{editingHome ? t('vault.editHome') : t('vault.newHome')}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Room Edit Modal */}
            <Modal visible={!!editingRoom} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('vault.editRoom')}</Text>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('scan.name')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                            value={editRoomName}
                            onChangeText={setEditRoomName}
                            placeholder="e.g. Master Bedroom"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>{t('vault.selectIcon', 'SELECT ICON')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconSelection}>
                            {['🏠', '🛋️', '🍳', '🛏️', '🚿', '🚪', '🧺', '🖥️', '🚗', '📦', '🪜', '🪴', '🧸', '🎮'].map((icon) => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[
                                        styles.iconOption,
                                        { backgroundColor: colors.background, borderColor: colors.border },
                                        editRoomIcon === icon && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }
                                    ]}
                                    onPress={() => setEditRoomIcon(icon)}
                                >
                                    <RoomIcon icon={icon} size={24} showBackground={false} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 16 }]}>{t('vault.parentRoom', 'PARENT ROOM (OPTIONAL)')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconSelection}>
                            <TouchableOpacity
                                style={[
                                    styles.iconOption,
                                    { backgroundColor: colors.background, borderColor: colors.border, width: 'auto', paddingHorizontal: 12 },
                                    !editRoomParentId && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }
                                ]}
                                onPress={() => setEditRoomParentId(undefined)}
                            >
                                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{t('common.no_parent', 'No Parent')}</Text>
                            </TouchableOpacity>
                            {parentRooms.filter(pr => pr.id !== editingRoom?.id).map((pr) => (
                                <TouchableOpacity
                                    key={pr.id}
                                    style={[
                                        styles.iconOption,
                                        { backgroundColor: colors.background, borderColor: colors.border, width: 'auto', paddingHorizontal: 12 },
                                        editRoomParentId === pr.id && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }
                                    ]}
                                    onPress={() => setEditRoomParentId(pr.id)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <RoomIcon icon={pr.icon} size={16} showBackground={false} />
                                        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{pr.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingRoom(null)}>
                                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalSave, { backgroundColor: colors.primary }]} onPress={handleSaveRoomEdit}>
                                <Text style={styles.saveText}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteRoomBtn}
                            onPress={() => {
                                Alert.alert(t('vault.deleteRoom'), t('vault.deleteRoomConfirm'), [
                                    { text: t('common.cancel') },
                                    {
                                        text: t('common.delete'), style: 'destructive', onPress: async () => {
                                            await deleteRoom(editingRoom!.id);
                                            setEditingRoom(null);
                                        }
                                    }
                                ]);
                            }}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                            <Text style={styles.deleteRoomText}>{t('vault.deleteRoom')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    newHomeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    newHomeText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    iconHeaderBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingTop: 16,
    },
    homeSelector: {
        maxHeight: 150,
        marginBottom: 20,
    },
    homeSelectorContent: {
        paddingLeft: 20,
        paddingRight: 8,
    },
    homeCard: {
        width: 160,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 12,
        justifyContent: 'space-between',
    },
    homeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    homeCardName: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    homeCardStats: {
        fontSize: 11,
        marginBottom: 8,
    },
    homeCardValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    addHomePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addHomeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeHomeContent: {
        paddingHorizontal: 20,
    },
    quickActionsStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    quickAction: {
        alignItems: 'center',
        flex: 1,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    listControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    sortButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    sortButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roomCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    roomMainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    roomInfoArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    roomTextContainer: {
        flex: 1,
    },
    roomName: {
        fontSize: 16,
        fontWeight: '700',
    },
    roomStatText: {
        fontSize: 12,
        marginTop: 2,
    },
    roomActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reorderBtn: {
        padding: 4,
    },
    childRoomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingRight: 12,
        paddingLeft: 44,
        borderTopWidth: 1,
    },
    childConnector: {
        position: 'absolute',
        top: 0,
        left: 20,
        width: 14,
        height: 24,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderBottomLeftRadius: 8,
    },
    childTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    childRoomName: {
        fontSize: 14,
        fontWeight: '600',
    },
    childRoomStats: {
        fontSize: 11,
        marginTop: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    },
    emptyButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalKeyboard: {
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
    },
    input: {
        height: 54,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveBtn: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
    iconSelection: {
        marginBottom: 12,
    },
    iconOption: {
        width: 50,
        height: 50,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalCancel: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSave: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    deleteRoomBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
        padding: 12,
    },
    deleteRoomText: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 14,
    },
    templateContainer: {
        gap: 10,
        marginTop: 10,
    },
    templateOption: {
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    templateTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    templateName: {
        fontSize: 14,
        fontWeight: '700',
    },
    templateDesc: {
        fontSize: 12,
    },
    disabledOption: {
        opacity: 0.8,
    },
    proBadge: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    proBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '900',
    },
});
