import React, { useMemo } from 'react';
import {
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GlassCard from '../components/GlassCard';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { APP_VERSION_LABEL } from '../core/appInfo';
import { FEATURES, getWebAdminConsoleUrl } from '../core/config';
import { getRuntimeDiagnostics } from '../core/runtimeInfo';

export default function AdminReportsScreen({ navigation }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const diagnostics = useMemo(() => getRuntimeDiagnostics(), []);
    const adminConsoleUrl = getWebAdminConsoleUrl();
    const isAdminUser =
        user?.role === 'admin' ||
        user?.is_admin === true ||
        user?.is_moderator === true;

    const diagnosticRows = [
        { label: 'App Version', value: diagnostics.appVersion },
        { label: 'Runtime', value: diagnostics.runtimeVersion },
        { label: 'Update ID', value: diagnostics.updateId },
        { label: 'Project ID', value: diagnostics.projectId },
        { label: 'API Base URL', value: diagnostics.apiBaseUrl },
    ].filter((row) => row.value);

    const handleOpenAdmin = async () => {
        try {
            await Linking.openURL(adminConsoleUrl);
        } catch (error) {
            const message = 'Unable to open the NexusBuild web admin console.';

            if (Platform.OS === 'web') {
                window.alert(message);
                return;
            }

            Alert.alert('Open Admin Failed', message);
        }
    };

    return (
        <Layout scrollable={false}>
            <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    Admin Console
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {!isAdminUser ? (
                    <GlassCard style={styles.centerCard}>
                        <Ionicons
                            name="shield-outline"
                            size={36}
                            color={theme.colors.textMuted}
                        />
                        <Text style={[styles.centerTitle, { color: theme.colors.textPrimary }]}>
                            Admin Access Required
                        </Text>
                        <Text style={[styles.centerBody, { color: theme.colors.textSecondary }]}>
                            Only admins and moderators can open the NexusBuild admin console.
                        </Text>
                    </GlassCard>
                ) : (
                    <>
                        <GlassCard style={styles.heroCard}>
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: theme.colors.warning + '20' },
                                ]}
                            >
                                <Ionicons
                                    name="swap-horizontal-outline"
                                    size={16}
                                    color={theme.colors.warning}
                                />
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: theme.colors.warning },
                                    ]}
                                >
                                    Migration Notice
                                </Text>
                            </View>

                            <Text
                                style={[styles.heroTitle, { color: theme.colors.textPrimary }]}
                            >
                                Mobile admin moved to the NSS website
                            </Text>
                            <Text
                                style={[styles.heroBody, { color: theme.colors.textSecondary }]}
                            >
                                NexusBuild no longer runs the full admin console inside the mobile
                                app. Reports, moderation, and platform controls now live in the
                                dedicated NSS web admin for NexusBuild.
                            </Text>

                            <View style={styles.actionGroup}>
                                <TouchableOpacity
                                    style={[
                                        styles.primaryButton,
                                        { backgroundColor: theme.colors.accentPrimary },
                                    ]}
                                    onPress={handleOpenAdmin}
                                >
                                    <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.primaryButtonText}>OPEN WEB ADMIN</Text>
                                </TouchableOpacity>

                                <View
                                    style={[
                                        styles.infoPill,
                                        {
                                            backgroundColor: theme.colors.bgTertiary,
                                            borderColor: theme.colors.glassBorder,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            FEATURES.WEB_ADMIN_CONSOLE
                                                ? 'globe-outline'
                                                : 'alert-circle-outline'
                                        }
                                        size={16}
                                        color={theme.colors.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            styles.infoPillText,
                                            { color: theme.colors.textSecondary },
                                        ]}
                                    >
                                        {FEATURES.WEB_ADMIN_CONSOLE
                                            ? adminConsoleUrl
                                            : 'Web admin console is disabled in this build.'}
                                    </Text>
                                </View>
                            </View>
                        </GlassCard>

                        <GlassCard style={styles.sectionCard}>
                            <Text
                                style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
                            >
                                Why this changed
                            </Text>
                            <Text
                                style={[styles.sectionBody, { color: theme.colors.textSecondary }]}
                            >
                                Keeping the legacy admin console in mobile created stale screens
                                and incomplete workflows. This route now exists only as a safe
                                redirect for older links and builds.
                            </Text>
                        </GlassCard>

                        <GlassCard style={styles.sectionCard}>
                            <Text
                                style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
                            >
                                Build Diagnostics
                            </Text>
                            {diagnosticRows.map((row) => (
                                <View
                                    key={row.label}
                                    style={[
                                        styles.diagnosticRow,
                                        { borderBottomColor: theme.colors.glassBorder },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.diagnosticLabel,
                                            { color: theme.colors.textMuted },
                                        ]}
                                    >
                                        {row.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.diagnosticValue,
                                            { color: theme.colors.textPrimary },
                                        ]}
                                    >
                                        {row.value}
                                    </Text>
                                </View>
                            ))}
                        </GlassCard>

                        <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>
                            {APP_VERSION_LABEL}
                        </Text>
                    </>
                )}
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSpacer: {
        width: 24,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
        gap: 16,
    },
    centerCard: {
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    centerTitle: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    centerBody: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
    },
    heroCard: {
        padding: 20,
        gap: 14,
    },
    badge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 30,
    },
    heroBody: {
        fontSize: 15,
        lineHeight: 24,
    },
    actionGroup: {
        gap: 12,
        marginTop: 6,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 14,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    infoPill: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    infoPillText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    sectionCard: {
        padding: 18,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionBody: {
        fontSize: 14,
        lineHeight: 22,
    },
    diagnosticRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    diagnosticLabel: {
        width: 96,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    diagnosticValue: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'right',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
    },
});
