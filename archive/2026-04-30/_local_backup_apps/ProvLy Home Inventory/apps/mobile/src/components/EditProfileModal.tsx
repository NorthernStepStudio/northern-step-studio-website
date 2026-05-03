import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../stores/themeStore';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
    const { colors, isDark } = useTheme();
    const { session, updateProfile } = useAuthStore();
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setFullName(session?.user?.user_metadata?.full_name || '');
            setAvatarUrl(session?.user?.user_metadata?.avatar_url || '');
        }
    }, [session, visible]);

    const pickImage = async () => {
        // Request Permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Needed', 'Please allow access to your photo library to pick a profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4, // Reduced for faster processing
            base64: true,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                const asset = result.assets[0];

                // Compress and resize the image to a very small thumbnail
                const manipResult = await ImageManipulator.manipulateAsync(
                    asset.uri,
                    [{ resize: { width: 120, height: 120 } }], // Slightly larger for better quality on high-dpi screens
                    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
                );

                if (manipResult.base64) {
                    const dataUri = `data:image/jpeg;base64,${manipResult.base64}`;
                    setAvatarUrl(dataUri);
                }
            } catch (err) {
                console.error('Image processing error:', err);
                Alert.alert('Error', 'Failed to process image. Try a different one.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const updates: any = { avatar_url: avatarUrl };
            const currentName = session?.user?.user_metadata?.full_name;

            if (fullName.trim() !== currentName) {
                updates.full_name = fullName.trim();
            }

            await updateProfile(updates);
            Alert.alert('Success', 'Profile updated successfully');
            onClose();
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            let errorMessage = error.message || 'Failed to update profile';

            // Friendly error for the JSON parse / payload too large issue
            if (errorMessage.includes('JSON Parse error') || errorMessage.includes('Unexpected character')) {
                errorMessage = 'Profile picture is too large. We tried to compress it but it still failed. Please use a simpler image.';
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Avatar Picker */}
                        <View style={{ alignItems: 'center', marginBottom: 10 }}>
                            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                                {avatarUrl ? (
                                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                                ) : (
                                    <View style={[styles.avatarImage, { backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' }]}>
                                        <Text style={{ fontSize: 24, color: colors.textSecondary }}>
                                            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.editIconBadge, { backgroundColor: colors.surface }]}>
                                    <Text style={{ fontSize: 12 }}>✏️</Text>
                                </View>
                            </TouchableOpacity>
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>Tap to change photo</Text>
                        </View>

                        {/* Name Field */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your full name"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Email Field (Read Only) */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
                            <TextInput
                                style={[styles.input, styles.readOnlyInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.textSecondary }]}
                                value={session?.user?.email || ''}
                                editable={false}
                                placeholder="Email"
                                placeholderTextColor={colors.textSecondary}
                            />
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>Email cannot be changed.</Text>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        paddingHorizontal: 20,
        paddingTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 8,
        marginRight: -8,
    },
    closeIcon: {
        fontSize: 28,
        lineHeight: 28,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    readOnlyInput: {
        opacity: 0.6,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
        height: 56,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#94A3B8',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
});
