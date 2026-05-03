import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Modal,
    Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useInventoryStore } from '../stores/inventoryStore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../stores/themeStore';
import { useTranslation } from 'react-i18next';
import { Dimensions } from 'react-native';

export default function ItemDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { itemId } = route.params;
    const { items, rooms, deleteItem, updateItem } = useInventoryStore();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(colors, isDark);
    const insets = useSafeAreaInsets();

    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [tempPhotos, setTempPhotos] = useState<string[]>([]);

    const item = items.find((i) => i.id === itemId);
    const room = rooms.find((r) => r.id === item?.roomId);

    if (!item) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{t('itemDetail.itemNotFound', 'Item not found')}</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
                        <Text style={styles.errorButtonText}>{t('itemDetail.goBack', 'Go Back')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            t('itemDetail.deleteItem', 'Delete Item'),
            t('itemDetail.deleteConfirmDesc', 'Are you sure you want to permanently delete this item from your vault?'),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('itemDetail.deletePermanently', 'Delete Permanently'),
                    style: 'destructive',
                    onPress: () => {
                        deleteItem(itemId);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        navigation.navigate('AddItem', { itemId: item.id });
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('errors.permissionNeeded', 'Permission needed'), t('errors.cameraPermissionDesc', 'Camera permission is required to take photos.'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!result.canceled) {
            const newPhotos = [...item.photos, result.assets[0].uri];
            await updateItem(item.id, { photos: newPhotos });
            setShowPhotoMenu(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('errors.permissionNeeded', 'Permission needed'), t('errors.libraryPermissionDesc', 'Library permission is required to choose photos.'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newPhotos = [...item.photos, result.assets[0].uri];
            await updateItem(item.id, { photos: newPhotos });
            setShowPhotoMenu(false);
        }
    };

    const handleAddPhoto = () => {
        setShowPhotoMenu(true);
    };

    const handleOpenGallery = () => {
        setTempPhotos([...item.photos]);
        setShowPhotoMenu(false);
        setShowGallery(true);
    };

    const toggleGalleryPhoto = (uri: string) => {
        if (tempPhotos.includes(uri)) {
            setTempPhotos(tempPhotos.filter(p => p !== uri));
        } else {
            setTempPhotos([...tempPhotos, uri]);
        }
    };

    const saveGallerySelection = async () => {
        await updateItem(item.id, { photos: tempPhotos });
        setShowGallery(false);
    };

    const isVerified = item.photos.length > 0 && (item.purchasePrice || 0) > 0 && (item.serialNumber || item.modelNumber);

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color={isDark ? colors.text : '#FFF'} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={{ width: 34, height: 34, marginRight: 8, borderRadius: 8 }}
                            resizeMode="contain"
                        />
                        <Text style={[styles.headerTitle, { color: isDark ? colors.text : '#FFF' }]}>ProvLy</Text>
                    </View>
                    <TouchableOpacity onPress={handleDelete} style={styles.backButton}>
                        <MaterialCommunityIcons name="delete-outline" size={24} color={isDark ? colors.error : '#FF9999'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.itemTitle, { color: isDark ? colors.text : '#FFF' }]}>{item.name}</Text>
                    </View>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, isVerified ? styles.verifiedBadge : styles.partialBadge]}>
                            <MaterialCommunityIcons
                                name={isVerified ? "check-circle" : "alert-circle"}
                                size={12}
                                color={isVerified ? '#10B981' : '#F59E0B'}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.statusText, isVerified ? styles.verifiedText : styles.partialText]}>
                                {isVerified ? t('itemDetail.fullyVerified', 'Fully Verified') : t('itemDetail.partialDocumentation', 'Partial Documentation')}
                            </Text>
                        </View>
                        <Text style={[styles.headerSubtitle, { color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.6)' }]}>
                            {t('itemDetail.addedOn', { date: new Date(item.createdAt).toLocaleDateString(), defaultValue: `Added on ${new Date(item.createdAt).toLocaleDateString()}` })}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.maxWidthContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>{t('itemDetail.evidencePhotos', 'Evidence & Photos')}</Text>
                        <Text style={styles.photoCount}>{t('itemDetail.captured', { count: item.photos.length, defaultValue: `${item.photos.length} Captured` })}</Text>
                    </View>

                    {item.photos.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow} contentContainerStyle={styles.photosPadding}>
                            {item.photos.map((uri, index) => (
                                <View key={index} style={styles.photoContainer}>
                                    <Image source={{ uri }} style={styles.photo} />
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyPhotoCard}>
                            <View style={styles.emptyPhotoIconContainer}>
                                <MaterialCommunityIcons name="camera-outline" size={32} color={colors.primary} />
                            </View>
                            <Text style={styles.emptyPhotoText}>{t('itemDetail.noPhotos', 'No photos attached')}</Text>
                            <TouchableOpacity
                                style={styles.addPhotoButton}
                                onPress={handleAddPhoto}
                            >
                                <MaterialCommunityIcons name="plus" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                <Text style={styles.addPhotoText}>{t('itemDetail.addPhoto', 'Add Photo')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text style={styles.sectionLabel}>{t('itemDetail.financialDetails', 'Financial Details')}</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailItem}>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>{t('itemDetail.estimatedValue', 'Estimated Value')}</Text>
                                <Text style={styles.detailValue}>
                                    {item.purchasePrice ? `$${item.purchasePrice.toLocaleString()}` : t('itemDetail.notSpecified', 'Not specified')}
                                </Text>
                            </View>
                            <View style={[styles.detailIcon, { backgroundColor: '#10B98115' }]}>
                                <MaterialCommunityIcons name="cash" size={20} color="#10B981" />
                            </View>
                        </View>

                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>{t('itemDetail.purchaseDate', 'Purchase Date')}</Text>
                                <Text style={styles.detailValue}>{item.purchaseDate || t('itemDetail.notSpecified', 'Not specified')}</Text>
                            </View>
                            <View style={[styles.detailIcon, { backgroundColor: '#F59E0B15' }]}>
                                <MaterialCommunityIcons name="calendar-import" size={20} color="#F59E0B" />
                            </View>
                        </View>

                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>{t('itemDetail.warrantyExpiry', 'Warranty Expiry')}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.detailValue, { marginRight: 8 }]}>
                                        {item.warrantyExpiry || t('itemDetail.notSpecified', 'Not specified')}
                                    </Text>
                                    {item.warrantyExpiry && (
                                        <View style={{
                                            backgroundColor: (new Date(item.warrantyExpiry) < new Date()) ? '#EF444420' : '#10B98120',
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                            borderRadius: 12
                                        }}>
                                            <Text style={{
                                                fontSize: 10,
                                                fontWeight: '700',
                                                color: (new Date(item.warrantyExpiry) < new Date()) ? '#EF4444' : '#10B981'
                                            }}>
                                                {(new Date(item.warrantyExpiry) < new Date()) ? 'EXPIRED' : 'ACTIVE'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={[styles.detailIcon, { backgroundColor: '#EF444415' }]}>
                                <MaterialCommunityIcons name="shield-check-outline" size={20} color="#EF4444" />
                            </View>
                        </View>

                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailLabel}>{t('itemDetail.location', 'Location')}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {room?.icon && (
                                        <MaterialCommunityIcons
                                            name={room.icon as any}
                                            size={16}
                                            color={colors.textSecondary}
                                            style={{ marginRight: 6 }}
                                        />
                                    )}
                                    <Text style={styles.detailValue}>{room?.name || 'Vault'}</Text>
                                </View>
                            </View>
                            <View style={[styles.detailIcon, { backgroundColor: '#3B82F615' }]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#3B82F6" />
                            </View>
                        </View>

                        {(item.serialNumber || item.modelNumber) && (
                            <>
                                <View style={styles.detailDivider} />
                                <View style={styles.detailItem}>
                                    <View style={styles.detailInfo}>
                                        <Text style={styles.detailLabel}>{t('itemDetail.identification', 'Identification')}</Text>
                                        <Text style={styles.detailValue}>
                                            {[item.modelNumber && `M/N: ${item.modelNumber}`, item.serialNumber && `S/N: ${item.serialNumber}`].filter(Boolean).join('  •  ')}
                                        </Text>
                                    </View>
                                    <View style={[styles.detailIcon, { backgroundColor: '#8B5CF615' }]}>
                                        <MaterialCommunityIcons name="barcode-scan" size={20} color="#8B5CF6" />
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {item.description && (
                        <>
                            <Text style={styles.sectionLabel}>{t('itemDetail.notesDescription', 'Notes & Description')}</Text>
                            <View style={styles.descriptionCard}>
                                <Text style={styles.descriptionText}>{item.description}</Text>
                            </View>
                        </>
                    )}

                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerEditButton} onPress={handleEdit}>
                    <MaterialCommunityIcons name="pencil-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.footerButtonText}>{t('itemDetail.editDetails', 'Edit Details')}</Text>
                </TouchableOpacity>
            </View>

            {/* Dark Action Menu for Photos */}
            <Modal
                visible={showPhotoMenu}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPhotoMenu(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowPhotoMenu(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('itemDetail.attachEvidence', 'Attach Evidence')}</Text>
                            <Text style={styles.modalSubtitle}>{t('itemDetail.attachEvidenceDesc', 'Proof is everything. Choose how to add your photo.')}</Text>
                        </View>

                        <View style={styles.modalOptionsContainer}>
                            <TouchableOpacity
                                style={[styles.modalOption, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                                onPress={takePhoto}
                            >
                                <View style={[styles.modalOptionIcon, { backgroundColor: '#10B98115' }]}>
                                    <MaterialCommunityIcons name="camera" size={24} color="#10B981" />
                                </View>
                                <View style={styles.modalOptionTextContainer}>
                                    <Text style={styles.modalOptionTitle}>{t('itemDetail.addPhoto', 'Add Photo')}</Text>
                                    <Text style={styles.modalOptionSubtitle}>{t('itemDetail.takePhotoDesc', 'Use your camera to capture it now')}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalOption, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                                onPress={handleOpenGallery}
                            >
                                <View style={[styles.modalOptionIcon, { backgroundColor: '#8B5CF615' }]}>
                                    <MaterialCommunityIcons name="grid-large" size={24} color="#8B5CF6" />
                                </View>
                                <View style={styles.modalOptionTextContainer}>
                                    <Text style={styles.modalOptionTitle}>{t('itemDetail.appGallery', 'App Gallery')}</Text>
                                    <Text style={styles.modalOptionSubtitle}>{t('itemDetail.appGalleryDesc', 'Pick from recent scans or your vault')}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={pickImage}
                            >
                                <View style={[styles.modalOptionIcon, { backgroundColor: '#3B82F615' }]}>
                                    <MaterialCommunityIcons name="image-multiple" size={24} color="#3B82F6" />
                                </View>
                                <View style={styles.modalOptionTextContainer}>
                                    <Text style={styles.modalOptionTitle}>{t('itemDetail.chooseLibrary', 'Choose from Library')}</Text>
                                    <Text style={styles.modalOptionSubtitle}>{t('itemDetail.chooseLibraryDesc', 'Pick an existing photo or price proof')}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowPhotoMenu(false)}
                        >
                            <Text style={styles.modalCancelButtonText}>{t('common.cancel', 'Cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* App Gallery Modal */}
            <Modal
                visible={showGallery}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowGallery(false)}
            >
                <SafeAreaView style={styles.galleryModalContainer}>
                    <View style={styles.galleryHeader}>
                        <TouchableOpacity onPress={() => setShowGallery(false)} style={styles.galleryBackButton}>
                            <MaterialCommunityIcons name="chevron-left" size={32} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.galleryTitle}>{t('itemDetail.selectPhotos', 'Select Photos')}</Text>
                        <TouchableOpacity onPress={saveGallerySelection} style={styles.galleryDoneButton}>
                            <Text style={styles.galleryDoneText}>{t('common.done', 'Done')}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.galleryScrollContent}>
                        {useInventoryStore().capturedPhotos.length > 0 && (
                            <View style={styles.gallerySection}>
                                <Text style={styles.gallerySectionTitle}>{t('itemDetail.recentScans', 'Recent Scans')}</Text>
                                <View style={styles.galleryGrid}>
                                    {useInventoryStore().capturedPhotos.map((uri, index) => (
                                        <TouchableOpacity
                                            key={`captured-${index}`}
                                            style={styles.galleryPhotoContainer}
                                            onPress={() => toggleGalleryPhoto(uri)}
                                        >
                                            <Image source={{ uri }} style={styles.galleryPhoto} />
                                            {tempPhotos.includes(uri) && (
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
                            <Text style={styles.gallerySectionTitle}>{t('itemDetail.fromInventory', 'From Inventory')}</Text>
                            <View style={styles.galleryGrid}>
                                {useInventoryStore().getAllPhotos().map((itemPhoto, index) => (
                                    <TouchableOpacity
                                        key={`inventory-${index}`}
                                        style={styles.galleryPhotoContainer}
                                        onPress={() => toggleGalleryPhoto(itemPhoto.uri)}
                                    >
                                        <Image source={{ uri: itemPhoto.uri }} style={styles.galleryPhoto} />
                                        {tempPhotos.includes(itemPhoto.uri) && (
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

function getStyles(colors: any, isDark: boolean) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            backgroundColor: isDark ? colors.surface : '#0B1220',
            paddingBottom: 32,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            borderBottomColor: colors.border,
            borderBottomWidth: isDark ? 1 : 0,
        },
        headerTop: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 10,
        },
        backButton: {
            padding: 8,
            backgroundColor: isDark ? colors.surfaceVariant : 'rgba(255,255,255,0.1)',
            borderRadius: 12,
        },
        headerContent: {
            paddingHorizontal: 24,
            marginTop: 16,
        },
        titleRow: {
            marginBottom: 8,
        },
        titleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: 1,
            fontFamily: 'Courier',
        },
        itemTitle: {
            fontSize: 26,
            fontWeight: '700',
            color: colors.text,
        },
        statusRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
        },
        verifiedBadge: {
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
        },
        partialBadge: {
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
        },
        statusText: {
            fontSize: 11,
            fontWeight: '700',
        },
        verifiedText: {
            color: '#10B981',
        },
        partialText: {
            color: '#F59E0B',
        },
        headerSubtitle: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '500',
        },
        content: {
            flex: 1,
        },
        maxWidthContainer: {
            maxWidth: 600,
            width: '100%',
            alignSelf: 'center',
            padding: 20,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionLabel: {
            fontSize: 13,
            fontWeight: '700',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginTop: 24,
            marginBottom: 12,
        },
        photoCount: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '600',
        },
        photosRow: {
            marginHorizontal: -20,
        },
        photosPadding: {
            paddingHorizontal: 20,
        },
        photoContainer: {
            marginRight: 12,
            borderRadius: 20,
            backgroundColor: colors.surface,
            padding: 4,
        },
        photo: {
            width: 260,
            height: 180,
            borderRadius: 16,
        },
        emptyPhotoCard: {
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 40,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: 'dashed',
        },
        emptyPhotoIconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: `${colors.primary}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        emptyPhotoText: {
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 16,
        },
        addPhotoButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
        },
        addPhotoText: {
            fontSize: 13,
            fontWeight: '700',
            color: '#FFF',
        },
        detailsCard: {
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
        },
        detailItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        detailInfo: {
            flex: 1,
        },
        detailLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: '600',
            marginBottom: 4,
        },
        detailValue: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
        },
        detailIcon: {
            width: 44,
            height: 44,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 16,
        },
        detailDivider: {
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 16,
        },
        descriptionCard: {
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
        },
        descriptionText: {
            fontSize: 15,
            color: colors.text,
            lineHeight: 24,
        },
        footer: {
            flexDirection: 'row',
            padding: 20,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: 12,
        },
        footerEditButton: {
            flex: 1,
            backgroundColor: colors.primary,
            height: 56,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
        },
        footerButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '700',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
        },
        errorText: {
            fontSize: 18,
            color: colors.textSecondary,
            marginBottom: 20,
        },
        errorButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
        },
        errorButtonText: {
            color: '#FFFFFF',
            fontWeight: '700',
        },
        bottomSpacer: {
            height: 40,
        },
        // Modal Styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: 40,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        modalHandle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
        },
        modalHeader: {
            marginBottom: 24,
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 4,
        },
        modalSubtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
        },
        modalOptionsContainer: {
            backgroundColor: colors.background,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
        },
        modalOption: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
        },
        modalOptionIcon: {
            width: 44,
            height: 44,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        modalOptionTextContainer: {
            flex: 1,
        },
        modalOptionTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 2,
        },
        modalOptionSubtitle: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        modalCancelButton: {
            width: '100%',
            height: 56,
            borderRadius: 16,
            backgroundColor: colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalCancelButtonText: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
        },
        // App Gallery Modal Styles
        galleryModalContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        galleryHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        galleryBackButton: {
            padding: 4,
        },
        galleryTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        galleryDoneButton: {
            padding: 4,
        },
        galleryDoneText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.primary,
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
            color: colors.textSecondary,
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
            backgroundColor: colors.surface,
        },
        photoSelectionOverlay: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 12,
            padding: 2,
        },
    });
}
