import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    Modal,
    FlatList,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useInventoryStore } from '../stores/inventoryStore';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RoomIcon } from '../lib/roomIcons';
import { useTheme } from '../stores/themeStore';
import { useTranslation } from 'react-i18next';

export default function AddItemScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { rooms, items, addItem, updateItem, activeHomeId, capturedPhotos, getAllPhotos, applyAutopilot } = useInventoryStore();

    // Check if we're editing an existing item
    const editItemId = route.params?.itemId;
    const existingItem = editItemId ? items.find(i => i.id === editItemId) : null;
    const isEditMode = !!existingItem;

    // Target Home ID
    const targetHomeId = existingItem?.homeId || route.params?.homeId || activeHomeId || 'default-home';

    // Filtered rooms for this home
    const homeRooms = rooms.filter(r => r.homeId === targetHomeId);

    // Initialize state with existing item data if editing
    const [name, setName] = useState(existingItem?.name || route.params?.initialData?.name || '');
    const [description, setDescription] = useState(existingItem?.description || route.params?.initialData?.description || '');
    const [category, setCategory] = useState(existingItem?.category || route.params?.initialData?.category || '');
    const [selectedRoomId, setSelectedRoomId] = useState(
        existingItem?.roomId || route.params?.roomId || homeRooms[0]?.id || ''
    );
    const [purchasePrice, setPurchasePrice] = useState(
        existingItem?.purchasePrice ? String(existingItem.purchasePrice) :
            route.params?.initialData?.price ? String(route.params.initialData.price) : ''
    );
    const [purchaseDate, setPurchaseDate] = useState(existingItem?.purchaseDate || '');
    const [warrantyExpiry, setWarrantyExpiry] = useState(existingItem?.warrantyExpiry || '');
    const [serialNumber, setSerialNumber] = useState(existingItem?.serialNumber || '');
    const [modelNumber, setModelNumber] = useState(existingItem?.modelNumber || '');
    const [photos, setPhotos] = useState<string[]>(
        existingItem?.photos || (route.params?.imageUri ? [route.params.imageUri] : [])
    );

    // Common category presets
    const CATEGORIES = [
        'Electronics', 'Furniture', 'Appliances', 'Clothing',
        'Jewelry', 'Tools', 'Sports', 'Art', 'Other'
    ];

    const getSmartHint = () => {
        if (!category) return null;
        switch (category) {
            case 'Appliances':
                return t('hints.appliances', 'Hint: Look inside the door, on the back, or near the kickplate.');
            case 'Electronics':
                return t('hints.electronics', 'Hint: Check the bottom or back panel of the device.');
            case 'Tools':
                return t('hints.tools', 'Hint: Serial numbers are often engraved or on a sticker near the handle.');
            case 'Sports':
                return t('hints.sports', 'Hint: Look for a serial number on the frame or near the manufacturer label.');
            default:
                return null;
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, ...result.assets.map((a) => a.uri)]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('errors.permissionNeeded'), t('errors.cameraPermissionDesc'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const [loading, setLoading] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    const toggleGalleryPhoto = (uri: string) => {
        if (photos.includes(uri)) {
            setPhotos(photos.filter(p => p !== uri));
        } else {
            setPhotos([...photos, uri]);
        }
    };

    const handleSave = async () => {
        // Validate required fields
        if (!name.trim()) {
            Alert.alert(t('scan.required'), t('scan.nameRequired'));
            return;
        }
        if (!selectedRoomId) {
            Alert.alert(t('scan.required'), t('scan.roomRequired'));
            return;
        }
        if (!category) {
            Alert.alert(t('scan.required'), t('scan.categoryRequired'));
            return;
        }

        setLoading(true);
        try {
            if (isEditMode && editItemId) {
                // Update existing item
                await updateItem(editItemId, {
                    name: name.trim(),
                    description: description.trim(),
                    category,
                    roomId: selectedRoomId,
                    purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
                    purchaseDate: purchaseDate.trim() || undefined,
                    warrantyExpiry: warrantyExpiry.trim() || undefined,
                    serialNumber: serialNumber.trim() || undefined,
                    modelNumber: modelNumber.trim() || undefined,
                    photos,
                });

                // Navigate back to item detail
                navigation.goBack();
            } else {
                // Create new item
                const newItem = await addItem({
                    name: name.trim(),
                    description: description.trim(),
                    category,
                    roomId: selectedRoomId,
                    homeId: targetHomeId,
                    purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
                    purchaseDate: purchaseDate.trim() || undefined,
                    warrantyExpiry: warrantyExpiry.trim() || undefined,
                    serialNumber: serialNumber.trim() || undefined,
                    modelNumber: modelNumber.trim() || undefined,
                    photos,
                    quantity: 1,
                });

                // Trigger Maintenance Autopilot
                await applyAutopilot(newItem.id);

                // Navigate to item detail after successful save
                if (route.params?.fromScan) {
                    // Reset stack to Home and then push ItemDetail to clear CameraScan
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: 'MainTabs' },
                            { name: 'ItemDetail', params: { itemId: newItem.id } }
                        ],
                    });
                } else {
                    navigation.replace('ItemDetail', { itemId: newItem.id });
                }
            }
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert(t('common.error'), `${t('errors.unknownError')} (${isEditMode ? 'update' : 'save'})`);
        } finally {
            setLoading(false);
        }
    };

    const setDateOffset = (years: number) => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + years);
        setWarrantyExpiry(date.toISOString().split('T')[0]);
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
                <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading} style={styles.headerButton}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {isEditMode ? t('itemDetail.editItem', 'Edit Item') : t('inventory.addItem', 'Add Item')}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerButton}>
                    <Text style={[styles.saveButton, { color: colors.primary }, loading && { opacity: 0.5 }]}>
                        {loading ? '...' : t('common.save', 'Save')}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                {/* Photos Section */}
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('itemDetail.photos', 'Item Photos')}</Text>
                <View style={styles.photosContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity style={[styles.addPhotoButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={takePhoto}>
                            <MaterialCommunityIcons name="camera-outline" size={32} color={colors.primary} />
                            <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>{t('scan.takePhoto')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.addPhotoButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickImage}>
                            <MaterialCommunityIcons name="image-outline" size={32} color={colors.primary} />
                            <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>{t('itemDetail.photos')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.addPhotoButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setShowGallery(true)}>
                            <MaterialCommunityIcons name="grid-large" size={32} color={colors.primary} />
                            <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>{t('itemDetail.appGallery')}</Text>
                        </TouchableOpacity>
                        {photos.map((uri, index) => (
                            <View key={index} style={styles.photoWrapper}>
                                <Image source={{ uri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhoto}
                                    onPress={() => removePhoto(index)}
                                >
                                    <MaterialCommunityIcons name="close" size={14} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Main Details */}
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        {t('itemDetail.nameLabel', { defaultValue: 'Item Name *' })}
                    </Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder={t('itemDetail.namePlaceholder', { defaultValue: 'e.g., Samsung TV 55 inch' })}
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        {t('itemDetail.descLabel', { defaultValue: 'Description' })}
                    </Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t('itemDetail.descPlaceholder', { defaultValue: 'Add any notes or details...' })}
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Category Selection */}
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('itemDetail.categoryLabel', 'Category *')}</Text>
                <View style={styles.roomGrid}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.roomOption,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                category === cat && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                            ]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text
                                style={[
                                    styles.roomOptionName,
                                    { color: colors.textSecondary },
                                    category === cat && { color: colors.primary, fontWeight: '700' },
                                ]}
                            >
                                {t(`categories.${cat.toLowerCase()}`, cat)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Purchase Price */}
                <View style={[styles.inputGroup, { marginTop: 20 }]}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        {t('itemDetail.valueLabel', { defaultValue: 'Estimated Value (optional)' })}
                    </Text>
                    <View style={[styles.priceInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                        <TextInput
                            style={[styles.priceTextInput, { color: colors.text }]}
                            value={purchasePrice}
                            onChangeText={setPurchasePrice}
                            placeholder={t('itemDetail.valuePlaceholder', { defaultValue: '0.00' })}
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Dates Section */}
                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('itemDetail.purchaseDate', { defaultValue: 'Purchase Date' })}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            value={purchaseDate}
                            onChangeText={setPurchaseDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('itemDetail.warrantyExpiry', { defaultValue: 'Warranty Expiry' })}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            value={warrantyExpiry}
                            onChangeText={setWarrantyExpiry}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                            {[1, 2, 5].map(y => (
                                <TouchableOpacity
                                    key={`y-${y}`}
                                    onPress={() => setDateOffset(y)}
                                    style={{
                                        backgroundColor: colors.primary + '10',
                                        borderWidth: 1,
                                        borderColor: colors.primary + '30',
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 10,
                                        flex: 1,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>+{y} Year{y > 1 ? 's' : ''}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Serial & Model Numbers */}
                <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('itemDetail.modelLabel', { defaultValue: 'Model #' })}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            value={modelNumber}
                            onChangeText={setModelNumber}
                            placeholder="e.g. UN55RU7100"
                            placeholderTextColor={colors.textSecondary}
                            autoCapitalize="characters"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('itemDetail.serialLabel', { defaultValue: 'Serial #' })}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                            value={serialNumber}
                            onChangeText={setSerialNumber}
                            placeholder="e.g. ZA12-3456"
                            placeholderTextColor={colors.textSecondary}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>

                {/* Smart Hint */}
                {getSmartHint() && (
                    <View style={[styles.hintContainer, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="information-outline" size={16} color={colors.primary} />
                        <Text style={[styles.hintText, { color: colors.textSecondary }]}>{getSmartHint()}</Text>
                    </View>
                )}

                {/* Room Selection */}
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('itemDetail.roomLabel', 'Location / Room *')}</Text>
                <View style={styles.roomGrid}>
                    {homeRooms.map((room) => (
                        <TouchableOpacity
                            key={room.id}
                            style={[
                                styles.roomOption,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                selectedRoomId === room.id && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                            ]}
                            onPress={() => setSelectedRoomId(room.id)}
                        >
                            <RoomIcon icon={room.icon} size={18} containerSize={32} />
                            <Text
                                style={[
                                    styles.roomOptionName,
                                    { color: colors.textSecondary },
                                    selectedRoomId === room.id && { color: colors.primary, fontWeight: '700' },
                                ]}
                            >
                                {room.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    {homeRooms.length === 0 && (
                        <TouchableOpacity
                            style={[styles.roomOption, { borderStyle: 'dashed' }]}
                            onPress={() => navigation.navigate('AddRoom', { homeId: targetHomeId })}
                        >
                            <MaterialCommunityIcons name="plus" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Add Room</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <Modal
                visible={showGallery}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowGallery(false)}
            >
                <SafeAreaView style={[styles.galleryModalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.galleryHeader, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => setShowGallery(false)} style={styles.galleryBackButton}>
                            <MaterialCommunityIcons name="chevron-left" size={32} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.galleryTitle, { color: colors.text }]}>{t('itemDetail.selectPhotos')}</Text>
                        <TouchableOpacity onPress={() => setShowGallery(false)} style={styles.galleryDoneButton}>
                            <Text style={[styles.galleryDoneText, { color: colors.primary }]}>{t('common.done')}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.galleryScrollContent}>
                        {capturedPhotos.length > 0 && (
                            <View style={styles.gallerySection}>
                                <Text style={[styles.gallerySectionTitle, { color: colors.textSecondary }]}>{t('itemDetail.recentScans')}</Text>
                                <View style={styles.galleryGrid}>
                                    {capturedPhotos.map((uri, index) => (
                                        <TouchableOpacity
                                            key={`captured-${index}`}
                                            style={styles.galleryPhotoContainer}
                                            onPress={() => toggleGalleryPhoto(uri)}
                                        >
                                            <Image source={{ uri }} style={styles.galleryPhoto} />
                                            {photos.includes(uri) && (
                                                <View style={styles.photoSelectionOverlay}>
                                                    <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.gallerySection}>
                            <Text style={[styles.gallerySectionTitle, { color: colors.textSecondary }]}>{t('itemDetail.fromInventory')}</Text>
                            <View style={styles.galleryGrid}>
                                {getAllPhotos().map((itemPhoto, index) => (
                                    <TouchableOpacity
                                        key={`inventory-${index}`}
                                        style={styles.galleryPhotoContainer}
                                        onPress={() => toggleGalleryPhoto(itemPhoto.uri)}
                                    >
                                        <Image source={{ uri: itemPhoto.uri }} style={styles.galleryPhoto} />
                                        {photos.includes(itemPhoto.uri) && (
                                            <View style={styles.photoSelectionOverlay}>
                                                <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
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
        fontWeight: '700',
    },
    form: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    photosContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    photoWrapper: {
        marginRight: 10,
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 14,
    },
    removePhoto: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    addPhotoButton: {
        width: 100,
        height: 100,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#FFFFFF',
    },
    addPhotoText: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '600',
    },
    roomGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 4,
    },
    roomOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    roomOptionSelected: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
    },
    roomOptionIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    roomOptionName: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    roomOptionNameSelected: {
        color: '#059669',
        fontWeight: '700',
    },
    priceInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 18,
        color: '#64748B',
        marginRight: 4,
        fontWeight: '600',
    },
    priceTextInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 18,
        color: '#1E293B',
        fontWeight: 'bold',
    },
    bottomSpacer: {
        height: 60,
    },
    // App Gallery Modal Styles
    galleryModalContainer: {
        flex: 1,
    },
    galleryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    galleryBackButton: {
        padding: 4,
    },
    galleryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    galleryDoneButton: {
        padding: 4,
    },
    galleryDoneText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    galleryScrollContent: {
        paddingBottom: 40,
    },
    gallerySection: {
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    gallerySectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    galleryPhotoContainer: {
        width: (Dimensions.get('window').width - 32) / 3,
        aspectRatio: 1,
        padding: 4,
        position: 'relative',
    },
    galleryPhoto: {
        flex: 1,
        borderRadius: 8,
    },
    photoSelectionOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        padding: 2,
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 20,
        gap: 8,
    },
    hintText: {
        fontSize: 12,
        flex: 1,
        lineHeight: 18,
    },
});
