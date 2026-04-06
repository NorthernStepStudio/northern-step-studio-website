import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SettingsRow from '../components/SettingsRow';
import { syncSettings } from '../settings/syncSettings';
import { localExport } from '../lib/localExport';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../stores/themeStore';
import ScreenHeader from '../components/ScreenHeader';
import LegalFooter from '../components/LegalFooter';

export default function SettingsScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();
    const { session, signOut } = useAuthStore();
    const { items } = useInventoryStore();

    const [syncEnabled, setSyncEnabled] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

    React.useEffect(() => {
        loadSyncStatus();
    }, []);

    const loadSyncStatus = async () => {
        const enabled = await syncSettings.isSyncEnabled();
        setSyncEnabled(enabled);
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    ];

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setCurrentLang(langCode);
        setShowLanguageModal(false);
    };

    const handleToggleSync = async () => {
        const newState = !syncEnabled;
        await syncSettings.setSyncEnabled(newState);
        setSyncEnabled(newState);
    };

    const handleSignOut = () => {
        Alert.alert(
            t('settings.signOut', 'Sign Out'),
            t('settings.signOutConfirm', 'Are you sure you want to sign out?'),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('settings.signOut', 'Sign Out'),
                    style: 'destructive',
                    onPress: () => signOut()
                },
            ]
        );
    };

    const handleExportData = () => {
        setShowExportModal(true);
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const result = await localExport.exportCSV();
            setShowExportModal(false);
            Alert.alert(
                t('export.exportReady', 'Export Complete ✅'),
                `${t('inventory.totalItems', { count: result.itemCount, defaultValue: `${result.itemCount} items` })} • $${result.totalValue.toLocaleString()}`
            );
        } catch (error: any) {
            Alert.alert(t('export.exportFailed', 'Export Failed'), error.message);
        } finally {
            setExporting(false);
        }
    };

    const handleExportSummary = async () => {
        setExporting(true);
        try {
            const result = await localExport.exportSummary();
            setShowExportModal(false);
            Alert.alert(
                t('export.exportReady', 'Export Complete ✅'),
                t('claims.summaryTitle')
            );
        } catch (error: any) {
            Alert.alert(t('export.exportFailed', 'Export Failed'), error.message);
        } finally {
            setExporting(false);
        }
    };

    const handleSupport = () => {
        Alert.alert(t('settings.support', 'Help & Support'), 'Contact us at support@provly.app');
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: colors.background }
        ]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScreenHeader title={t('settings.title', 'Settings')} showBackButton={false} />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.maxWidthContainer}>
                    {/* Language Modal */}
                    <Modal visible={showLanguageModal} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.language', 'Select Language')}</Text>

                                {languages.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.code}
                                        style={[
                                            styles.modalOption,
                                            { backgroundColor: colors.background, borderColor: colors.border },
                                            currentLang === lang.code && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }
                                        ]}
                                        onPress={() => handleLanguageChange(lang.code)}
                                    >
                                        <Text style={styles.langFlag}>{lang.flag}</Text>
                                        <Text style={[
                                            styles.modalOptionText,
                                            { color: colors.text },
                                            currentLang === lang.code && { color: colors.primary }
                                        ]}>
                                            {lang.name}
                                        </Text>
                                        {currentLang === lang.code && (
                                            <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                <TouchableOpacity
                                    style={[styles.modalCancel, { backgroundColor: colors.surfaceVariant }]}
                                    onPress={() => setShowLanguageModal(false)}
                                >
                                    <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>{t('common.cancel', 'Cancel')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* Profile Card - Navigate to Profile */}
                    <TouchableOpacity
                        style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.profileInfo}>
                            <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceVariant }]}>
                                {session?.user?.user_metadata?.avatar_url ? (
                                    <Image
                                        source={{ uri: session.user.user_metadata.avatar_url }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <MaterialCommunityIcons name="account" size={32} color={colors.primary} />
                                )}
                            </View>
                            <View style={styles.profileTexts}>
                                <Text style={[styles.profileName, { color: colors.text }]}>
                                    {t('settings.profile', 'Profile')}
                                </Text>
                                <Text style={[styles.profileSubtitle, { color: colors.textSecondary }]}>
                                    {session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || t('settings.account', 'Your Account')}
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
                    </TouchableOpacity>

                    {/* Quick Actions */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('home.quickActions', 'Quick Actions')}</Text>
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />}
                            iconColor="#10B981"
                            title={t('claims.title', 'Claim Center')}
                            subtitle={t('claims.heroTitle', 'Check claim readiness')}
                            onPress={() => navigation.navigate('ClaimCenter')}
                            showDivider={true}
                        />
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="line-scan" size={20} color="#3B82F6" />}
                            iconColor="#3B82F6"
                            title={t('scan.title', 'Scan Items')}
                            subtitle={t('scan.takePhoto', 'Quick scan capture')}
                            onPress={() => navigation.navigate('ScanTab')}
                            showDivider={true}
                        />
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="plus-circle-outline" size={20} color="#EC4899" />}
                            iconColor="#EC4899"
                            title={t('inventory.addItem', 'Add Item')}
                            subtitle={t('home.addItemDesc', 'Record a new item')}
                            onPress={() => navigation.navigate('AddItem')}
                            showDivider={false}
                        />
                    </View>

                    {/* Preferences */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.preferences', 'Preferences')}</Text>

                        <SettingsRow
                            icon={<MaterialCommunityIcons name="translate" size={20} color="#3B82F6" />}
                            iconColor="#3B82F6"
                            title={t('settings.language', 'Language')}
                            subtitle={languages.find(l => l.code === currentLang)?.name || 'English'}
                            onPress={() => setShowLanguageModal(true)}
                            showDivider={false}
                        />
                    </View>

                    {/* Data & System */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.data', 'Data & System')}</Text>

                        <SettingsRow
                            icon={<MaterialCommunityIcons name="file-export-outline" size={20} color="#3B82F6" />}
                            iconColor="#3B82F6"
                            title={t('settings.export', 'Export Data')}
                            subtitle={t('settings.csvSummary', 'CSV / Summary Report')}
                            onPress={handleExportData}
                            showDivider={true}
                        />

                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <View style={[styles.toggleIcon, { backgroundColor: `${colors.primary}15` }]}>
                                    <MaterialCommunityIcons name="sync" size={20} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.toggleTitle, { color: colors.text }]}>{t('settings.sync', 'Local Sync')}</Text>
                                    <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>{t('settings.backupToDevice', 'Backup to device')}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.toggle, { backgroundColor: colors.border }, syncEnabled && { backgroundColor: colors.primary }]}
                                onPress={handleToggleSync}
                            >
                                <View style={[styles.toggleCircle, syncEnabled && styles.toggleCircleActive]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Support & Feedback */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.support', 'Support & Feedback')}</Text>
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="headset" size={20} color="#10B981" />}
                            iconColor="#10B981"
                            title={t('settings.support', 'Help & Support')}
                            subtitle={t('settings.helpAssistance', 'Get assistance from our team')}
                            onPress={handleSupport}
                            showDivider={true}
                        />
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="message-text-outline" size={20} color="#10B981" />}
                            iconColor="#10B981"
                            title={t('feedback.title', 'Send Feedback')}
                            subtitle={t('settings.reportBugSuggest', 'Report bugs or suggest features')}
                            onPress={() => navigation.navigate('Feedback')}
                            showDivider={false}
                        />
                    </View>

                    {/* Legal */}
                    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.legal', 'Legal')}</Text>
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="shield-lock-outline" size={20} color="#8B5CF6" />}
                            iconColor="#8B5CF6"
                            title={t('settings.privacyPolicy', 'Privacy Policy')}
                            onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
                            showDivider={true}
                        />
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="file-document-outline" size={20} color="#3B82F6" />}
                            iconColor="#3B82F6"
                            title={t('settings.termsOfService', 'Terms of Service')}
                            onPress={() => navigation.navigate('Legal', { type: 'terms' })}
                            showDivider={true}
                        />
                        <SettingsRow
                            icon={<MaterialCommunityIcons name="code-braces" size={20} color="#06B6D4" />}
                            iconColor="#06B6D4"
                            title={t('settings.openSource', 'Open Source')}
                            onPress={() => navigation.navigate('Legal', { type: 'opensource' })}
                            showDivider={false}
                        />
                    </View>

                    {/* Sign Out */}
                    <TouchableOpacity style={[styles.signOutButton, { backgroundColor: colors.surface, borderColor: `${colors.error}20` }]} onPress={handleSignOut}>
                        <MaterialCommunityIcons name="logout" size={20} color={colors.error} style={{ marginRight: 8 }} />
                        <Text style={[styles.signOutText, { color: colors.error }]}>{t('settings.signOut', 'Sign Out')}</Text>
                    </TouchableOpacity>

                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>{t('settings.version', 'Version')} 1.0.0 (Beta)</Text>
                    <LegalFooter />
                </View>
            </ScrollView>

            {/* Export Modal */}
            <Modal visible={showExportModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.exportModalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.exportModalHeader}>
                            <Text style={[styles.exportModalTitle, { color: colors.text }]}>{t('settings.export', 'Export Inventory')}</Text>
                            <TouchableOpacity onPress={() => setShowExportModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.exportModalSubtitle, { color: colors.textSecondary }]}>
                            {t('settings.exportSubtitle', { count: items.length, defaultValue: `Choose a format to export your ${items.length} items` })}
                        </Text>

                        <TouchableOpacity
                            style={[styles.exportOption, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleExportCSV}
                            disabled={exporting}
                        >
                            <View style={[styles.exportIconBox, { backgroundColor: '#10B98115' }]}>
                                <MaterialCommunityIcons name="file-delimited-outline" size={28} color="#10B981" />
                            </View>
                            <View style={styles.exportOptionInfo}>
                                <Text style={[styles.exportOptionTitle, { color: colors.text }]}>{t('export.generateCsv', 'CSV Spreadsheet')}</Text>
                                <Text style={[styles.exportOptionDesc, { color: colors.textSecondary }]}>
                                    {t('export.csvDesc', 'Full data export for Excel or insurance')}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.exportOption, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={handleExportSummary}
                            disabled={exporting}
                        >
                            <View style={[styles.exportIconBox, { backgroundColor: '#3B82F615' }]}>
                                <MaterialCommunityIcons name="file-document-outline" size={28} color="#3B82F6" />
                            </View>
                            <View style={styles.exportOptionInfo}>
                                <Text style={[styles.exportOptionTitle, { color: colors.text }]}>{t('claims.summaryTitle', 'Summary Report')}</Text>
                                <Text style={[styles.exportOptionDesc, { color: colors.textSecondary }]}>
                                    {t('claims.summaryDesc', 'Quick overview with totals')}
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
                        </TouchableOpacity>

                        {exporting && (
                            <View style={styles.exportingRow}>
                                <Text style={[styles.exportingText, { color: colors.primary }]}>{t('common.loading', 'Exporting...')}</Text>
                            </View>
                        )}
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
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    maxWidthContainer: {
        maxWidth: 560,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
    profileCard: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    profileTexts: {
        flex: 1,
    },
    profileName: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    profileSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    section: {
        marginTop: 20,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    toggleIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    toggleSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
    },
    toggleCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
    },
    toggleCircleActive: {
        transform: [{ translateX: 22 }],
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        marginTop: 24,
        textAlign: 'center',
        fontSize: 12,
    },
    bottomSpacer: {
        height: 60,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 10,
    },
    langFlag: {
        fontSize: 22,
        marginRight: 14,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    modalCancel: {
        marginTop: 10,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    exportModalContent: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 24,
    },
    exportModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    exportModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    exportModalSubtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    exportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    exportIconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    exportOptionInfo: {
        flex: 1,
    },
    exportOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    exportOptionDesc: {
        fontSize: 13,
    },
    exportingRow: {
        padding: 16,
        alignItems: 'center',
    },
    exportingText: {
        fontSize: 16,
    },
});
