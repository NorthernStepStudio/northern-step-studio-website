import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RoomIcon } from '../lib/roomIcons';
import { useTheme } from '../stores/themeStore';

const ROOM_OPTIONS = [
    { icon: 'bed-outline', name: 'Bedroom' },
    { icon: 'shower-outline', name: 'Bathroom' },
    { icon: 'stove', name: 'Kitchen' },
    { icon: 'sofa-outline', name: 'Living Room' },
    { icon: 'garage-variant', name: 'Garage' },
    { icon: 'briefcase-outline', name: 'Office' },
    { icon: 'package-variant-closed', name: 'Storage' },
    { icon: 'washing-machine', name: 'Laundry' },
    { icon: 'tree-outline', name: 'Outside' },
    { icon: 'stairs', name: 'Basement' },
    { icon: 'tools', name: 'Workshop' },
    { icon: 'baby-face-outline', name: 'Kids Room' },
];

export default function AddRoomScreen() {
    const navigation = useNavigation<any>();
    const route = useNavigation<any>().getState().routes.find((r: any) => r.name === 'AddRoom');
    const routeHomeId = route?.params?.homeId;

    const { colors, isDark } = useTheme();
    const { addRoom, rooms, getParentRooms, activeHomeId } = useInventoryStore();

    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('package-variant-closed');
    const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);

    // Final homeId to use
    const targetHomeId = routeHomeId || activeHomeId || 'default-home';

    // Get rooms that can be parents (rooms without a parentId themselves)
    const parentRooms = getParentRooms();

    const handleSave = () => {
        if (!name.trim()) return;

        // Check for duplicate name in the same home
        if (rooms.filter(r => r.homeId === targetHomeId).some((r) => r.name.toLowerCase() === name.trim().toLowerCase())) {
            Alert.alert('Duplicate Room', 'A room with this name already exists in this home.');
            return;
        }

        addRoom(name.trim(), selectedIcon, selectedParentId, targetHomeId);
        navigation.goBack();
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
                backgroundColor: colors.surface,
                borderBottomColor: colors.border
            }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Add Room</Text>
                <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                    <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Room Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Room Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Master Suite, Game Room"
                            placeholderTextColor={colors.textSecondary}
                            autoFocus
                        />
                    </View>

                    {/* Icon Selection */}
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Choose Style</Text>
                    <View style={styles.iconGrid}>
                        {ROOM_OPTIONS.map((item) => (
                            <TouchableOpacity
                                key={item.icon}
                                style={[
                                    styles.iconOption,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                    selectedIcon === item.icon && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                                ]}
                                onPress={() => setSelectedIcon(item.icon)}
                            >
                                <MaterialCommunityIcons
                                    name={item.icon as any}
                                    size={28}
                                    color={selectedIcon === item.icon ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.iconName,
                                    { color: colors.textSecondary },
                                    selectedIcon === item.icon && { color: colors.primary }
                                ]}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Parent Room Selection */}
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Hierarchy (Optional)</Text>
                    <Text style={[styles.hint, { color: colors.textSecondary }]}>Attach this to a parent space (e.g. Master Bath → Master Bedroom)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parentScroll}>
                        <TouchableOpacity
                            style={[
                                styles.parentOption,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                selectedParentId === undefined && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                            ]}
                            onPress={() => setSelectedParentId(undefined)}
                        >
                            <MaterialCommunityIcons name="home-outline" size={20} color={selectedParentId === undefined ? colors.primary : colors.textSecondary} />
                            <Text style={[styles.parentName, { color: colors.textSecondary }, selectedParentId === undefined && { color: colors.primary }]}>Standalone</Text>
                        </TouchableOpacity>
                        {parentRooms.map((room) => (
                            <TouchableOpacity
                                key={room.id}
                                style={[
                                    styles.parentOption,
                                    { backgroundColor: colors.surface, borderColor: colors.border },
                                    selectedParentId === room.id && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                                ]}
                                onPress={() => setSelectedParentId(room.id)}
                            >
                                <RoomIcon icon={room.icon} size={16} showBackground={false} />
                                <Text style={[styles.parentName, { color: colors.textSecondary }, selectedParentId === room.id && { color: colors.primary }]} numberOfLines={1}>{room.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerButton: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    saveButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10B981',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    hint: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 12,
        marginTop: -6,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    iconOption: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    iconOptionSelected: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
    },
    iconName: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 6,
        fontWeight: '600',
        textAlign: 'center',
    },
    iconNameSelected: {
        color: '#059669',
    },
    parentScroll: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    parentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 10,
    },
    parentOptionSelected: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
    },
    parentEmoji: {
        fontSize: 18,
        marginRight: 8,
    },
    parentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    parentNameSelected: {
        color: '#059669',
    },
    bottomSpacer: {
        height: 60,
    },
});
