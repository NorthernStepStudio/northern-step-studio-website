import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getApiBaseUrl } from '../core/config';
import {
    formatDiagnosticsClipboard,
    getRuntimeDiagnostics,
} from '../core/runtimeInfo';
import { addBugReport, markAsSynced, syncPendingReports } from '../services/bugReportStorage';
import GlassCard from './GlassCard'; // Using GlassCard for pro look
import { useTranslation } from '../core/i18n';

export default function BugReportModal({ visible, onClose }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { addBugReportNotification, addReportConfirmationNotification } = useNotifications();

    // Form state
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('bug'); // bug, feature, ui, performance
    const [platform, setPlatform] = useState(''); // ios, android, web - user selects
    const [screenshots, setScreenshots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const runtimeDiagnostics = useMemo(() => getRuntimeDiagnostics(), []);
    const diagnosticsText = useMemo(
        () => formatDiagnosticsClipboard(runtimeDiagnostics),
        [runtimeDiagnostics]
    );
    const diagnosticsPreview = useMemo(
        () => [
            { label: 'Version', value: runtimeDiagnostics.appVersion },
            { label: 'Runtime', value: runtimeDiagnostics.runtimeVersion },
            { label: 'API', value: runtimeDiagnostics.apiBaseUrl },
        ].filter((item) => item.value),
        [runtimeDiagnostics]
    );

    // Platform options for user to select
    const platformOptions = [
        { id: 'ios', icon: 'logo-apple', label: 'iOS' },
        { id: 'android', icon: 'logo-android', label: 'Android' },
        { id: 'web', icon: 'globe-outline', label: 'Web' },
    ];



    const MAX_IMAGES = 3;

    // Reset form
    const resetForm = () => {
        setEmail('');
        setDescription('');
        setCategory('bug');
        setPlatform('');
        setScreenshots([]);
        setIsSuccess(false);
        setIsSubmitting(false);
    };

    // Close handler
    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    // Image picker
    const selectScreenshots = async () => {
        if (screenshots.length >= MAX_IMAGES) return;

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('bugReport.alerts.permissionTitle'), t('bugReport.alerts.permissionBody'));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsMultipleSelection: true,
                selectionLimit: MAX_IMAGES - screenshots.length,
                quality: 0.5,
            });

            if (!result.canceled && result.assets) {
                setScreenshots(prev => [...prev, ...result.assets].slice(0, MAX_IMAGES));
            }
        } catch (error) {
            console.log('Picker Error', error);
        }
    };

    const submitReport = async () => {
        if (!platform) {
            Alert.alert(t('bugReport.alerts.requiredTitle'), t('bugReport.alerts.platformRequired'));
            return;
        }
        if (!description.trim()) {
            Alert.alert(t('bugReport.alerts.requiredTitle'), t('bugReport.alerts.descriptionRequired'));
            return;
        }

        setIsSubmitting(true);

        // Build platform string
        const platformLabel = platformOptions.find(p => p.id === platform)?.label || platform;
        const reportDescription = `${description.trim()}\n\n---\nBuild diagnostics\n${diagnosticsText}`;
        const systemInfo = `Reported platform: ${platformLabel}\n${diagnosticsText}`;

        try {
            // ALWAYS save locally FIRST - this ensures the report shows in admin console
            const savedReport = await addBugReport({
                description: reportDescription,
                raw_description: description.trim(),
                category,
                platform,
                email: email.trim(),
                screenshots: screenshots.map(s => s.uri),
                system_info: systemInfo,
                diagnostics_text: diagnosticsText,
            });

            console.log('Bug report saved locally:', savedReport?.id);

            // Try to sync to API (in mock mode this will fail, which is fine)
            const baseUrl = getApiBaseUrl();
            try {
                console.log('Syncing to API:', baseUrl + '/reports');
                const formData = new FormData();
                formData.append('description', reportDescription);
                formData.append('category', category);
                formData.append('platform', platform);
                formData.append('system_info', systemInfo);
                if (email) formData.append('email', email.trim());

                screenshots.forEach((img, i) => {
                    const filename = img.uri.split('/').pop() || `image_${i}.jpg`;
                    formData.append('image', {
                        uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
                        name: filename,
                        type: 'image/jpeg'
                    });
                });

                const response = await fetch(`${baseUrl}/reports`, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error(`Report upload failed with status ${response.status}`);
                }
                if (savedReport?.id) {
                    await markAsSynced(savedReport.id);
                }
            } catch (apiError) {
                // API sync failed, but local save was successful - no problem
                console.log('API sync failed (using local storage):', apiError.message);
                await syncPendingReports(baseUrl);
            }

            // Notify Admin
            addBugReportNotification(description);

            // Notify User (Confirmation)
            addReportConfirmationNotification();

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsSuccess(true);

        } catch (error) {
            console.error('Failed to save bug report:', error);
            Alert.alert(t('bugReport.alerts.errorTitle'), t('bugReport.alerts.saveFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <Pressable style={styles.backdrop} onPress={handleClose} />

                <GlassCard style={[
                    styles.modalContainer,
                    { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.glassBorder }
                ]}>

                    {/* Success View */}
                    {isSuccess ? (
                        <View style={styles.successView}>
                            <View style={[styles.successIconBg, { backgroundColor: theme.colors.success + '20' }]}>
                                <Ionicons name="checkmark" size={48} color={theme.colors.success} />
                            </View>
                            <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>{t('bugReport.success.title')}</Text>
                            <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
                                {t('bugReport.success.body')}
                            </Text>
                            <TouchableOpacity style={[styles.doneButton, { backgroundColor: theme.colors.success }]} onPress={handleClose}>
                                <Text style={styles.doneButtonText}>{t('common.done')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Form View
                        <View style={{ width: '100%' }}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('bugReport.title')}</Text>
                                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>

                                {/* Platform Selector - Required */}
                                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                                    {t('bugReport.platformPrompt')} <Text style={{ color: theme.colors.error }}>*</Text>
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                                    {platformOptions.map((plat) => (
                                        <TouchableOpacity
                                            key={plat.id}
                                            onPress={() => setPlatform(plat.id)}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: platform === plat.id ? theme.colors.accentSecondary : theme.colors.glassBg,
                                                    borderColor: platform === plat.id ? theme.colors.accentSecondary : theme.colors.glassBorder
                                                }
                                            ]}
                                        >
                                            <Ionicons name={plat.icon} size={18} color={platform === plat.id ? '#FFF' : theme.colors.textSecondary} />
                                            <Text style={[styles.chipText, { color: platform === plat.id ? '#FFF' : theme.colors.textSecondary }]}>{plat.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Categories */}
                                <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 15 }]}>{t('bugReport.categoryPrompt')}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                                    {[
                                        { id: 'bug', icon: 'bug', label: t('bugReport.categories.bug') },
                                        { id: 'feature', icon: 'bulb', label: t('bugReport.categories.idea') },
                                        { id: 'ui', icon: 'color-palette', label: t('bugReport.categories.visual') },
                                        { id: 'perf', icon: 'flash', label: t('bugReport.categories.lag') },
                                    ].map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => setCategory(cat.id)}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: category === cat.id ? theme.colors.accentPrimary : theme.colors.glassBg,
                                                    borderColor: category === cat.id ? theme.colors.accentPrimary : theme.colors.glassBorder
                                                }
                                            ]}
                                        >
                                            <Ionicons name={`${cat.icon}-outline`} size={16} color={category === cat.id ? '#FFF' : theme.colors.textSecondary} />
                                            <Text style={[styles.chipText, { color: category === cat.id ? '#FFF' : theme.colors.textSecondary }]}>{cat.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Description */}
                                <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 15 }]}>{t('bugReport.detailsLabel')}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.colors.bgPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.glassBorder }]}
                                    placeholder={t('bugReport.detailsPlaceholder')}
                                    placeholderTextColor={theme.colors.textMuted}
                                    multiline
                                    numberOfLines={4}
                                    value={description}
                                    onChangeText={setDescription}
                                    textAlignVertical="top"
                                />

                                {/* Screenshots */}
                                <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 15 }]}>{t('bugReport.screenshotsLabel', { current: screenshots.length, max: MAX_IMAGES })}</Text>
                                <View style={styles.imageRow}>
                                    {screenshots.map((img, i) => (
                                        <View key={i} style={styles.thumb}>
                                            <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                                            <TouchableOpacity
                                                style={styles.removeBtn}
                                                onPress={() => setScreenshots(p => p.filter((_, idx) => idx !== i))}
                                            >
                                                <Ionicons name="close-circle" size={20} color="#FF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {screenshots.length < MAX_IMAGES && (
                                        <TouchableOpacity
                                            onPress={selectScreenshots}
                                            style={[styles.addBtn, { borderColor: theme.colors.glassBorder, backgroundColor: theme.colors.glassBg }]}
                                        >
                                            <Ionicons name="add" size={24} color={theme.colors.textMuted} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View
                                    style={[
                                        styles.diagnosticsCard,
                                        {
                                            backgroundColor: theme.colors.glassBg,
                                            borderColor: theme.colors.glassBorder,
                                        },
                                    ]}
                                >
                                    <View style={styles.diagnosticsHeader}>
                                        <Ionicons
                                            name="analytics-outline"
                                            size={18}
                                            color={theme.colors.accentPrimary}
                                        />
                                        <Text
                                            style={[
                                                styles.diagnosticsTitle,
                                                { color: theme.colors.textPrimary },
                                            ]}
                                        >
                                            Build diagnostics will be attached automatically
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.diagnosticsBody,
                                            { color: theme.colors.textSecondary },
                                        ]}
                                    >
                                        Each bug report includes the current NexusBuild version,
                                        runtime, and backend target so the issue can be reproduced
                                        from your screenshots.
                                    </Text>
                                    <View style={styles.diagnosticsPreview}>
                                        {diagnosticsPreview.map((item) => (
                                            <View
                                                key={item.label}
                                                style={[
                                                    styles.diagnosticsPill,
                                                    {
                                                        backgroundColor: theme.colors.bgPrimary,
                                                        borderColor: theme.colors.glassBorder,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.diagnosticsPillLabel,
                                                        { color: theme.colors.textMuted },
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.diagnosticsPillValue,
                                                        { color: theme.colors.textPrimary },
                                                    ]}
                                                >
                                                    {item.value}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Contact (Optional) */}
                                <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 15 }]}>{t('bugReport.emailLabel')}</Text>
                                <TextInput
                                    style={[styles.emailInput, { backgroundColor: theme.colors.bgPrimary, color: theme.colors.textPrimary, borderColor: theme.colors.glassBorder }]}
                                    placeholder={t('bugReport.emailPlaceholder')}
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                />

                                <View style={{ height: 20 }} />
                            </ScrollView>

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: theme.colors.accentPrimary, opacity: isSubmitting ? 0.7 : 1 }]}
                                onPress={submitReport}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.submitText}>{t('bugReport.submit')}</Text>
                                        <Ionicons name="send" size={16} color="#FFF" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </GlassCard>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 24,
        zIndex: 2,
        // Make sure clicks inside don't close
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
        marginBottom: 20,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 10,
        paddingBottom: 5,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    chipText: {
        fontWeight: '600',
        fontSize: 13,
    },
    input: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        minHeight: 120,
        fontSize: 15,
        lineHeight: 22,
    },
    emailInput: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        fontSize: 15,
    },
    imageRow: {
        flexDirection: 'row',
        gap: 10,
    },
    diagnosticsCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginTop: 16,
        gap: 10,
    },
    diagnosticsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    diagnosticsTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
    },
    diagnosticsBody: {
        fontSize: 12,
        lineHeight: 18,
    },
    diagnosticsPreview: {
        gap: 8,
    },
    diagnosticsPill: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 2,
    },
    diagnosticsPillLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    diagnosticsPillValue: {
        fontSize: 12,
        lineHeight: 16,
    },
    thumb: {
        width: 70,
        height: 70,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbImg: {
        width: '100%',
        height: '100%',
    },
    removeBtn: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    addBtn: {
        width: 70,
        height: 70,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    submitButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Success State
    successView: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    successIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    successSub: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 30,
    },
    doneButton: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    doneButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
