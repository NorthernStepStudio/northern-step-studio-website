import React, { useCallback, useEffect, useMemo } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import GlassCard from '../components/GlassCard';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../core/i18n';
import { APP_VERSION } from '../core/appInfo';
import { FEATURES } from '../core/config';
import { formatDiagnosticsClipboard, getRuntimeDiagnostics } from '../core/runtimeInfo';
import { eventTracker } from '../state/eventTracker';

export default function AboutScreen({ navigation }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const diagnostics = useMemo(() => getRuntimeDiagnostics(), []);

    useEffect(() => {
        eventTracker.track('about_view');
    }, []);

    const handleCopyDiagnostics = useCallback(async () => {
        try {
            await Clipboard.setStringAsync(formatDiagnosticsClipboard(diagnostics));
            if (Platform.OS === 'web') {
                window.alert('Build diagnostics copied.');
                return;
            }
            Alert.alert('Copied', 'Build diagnostics copied.');
        } catch (error) {
            if (Platform.OS === 'web') {
                window.alert('Unable to copy build diagnostics.');
                return;
            }
            Alert.alert('Copy Failed', 'Unable to copy build diagnostics.');
        }
    }, [diagnostics]);

    return (
        <Layout scrollable={false}>
            <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    About NexusBuild
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{
                    paddingHorizontal: isMobile ? 16 : 40,
                    paddingBottom: 40,
                    gap: 14,
                }}
                showsVerticalScrollIndicator={false}
            >
                <GlassCard style={styles.missionCard}>
                    <Ionicons name="rocket-outline" size={30} color={theme.colors.accentPrimary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Our Mission</Text>
                    <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
                        To make PC building accessible to everyone. Whether you are a first-time builder or a seasoned enthusiast, NexusBuild provides the tools, knowledge, and AI-powered assistance to help you create your perfect machine.
                    </Text>
                </GlassCard>

                <GlassCard style={styles.noteCard}>
                    <Ionicons name="information-circle-outline" size={28} color="#3B82F6" />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>A Note From The Developers</Text>
                    <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
                        NexusBuild is built by a small, independent team focused on bringing you the most advanced PC building tools.
                    </Text>
                    <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
                        We are not a giant corporation. We work hard and pay significant costs to run the powerful AI models that drive this app.
                    </Text>
                    <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
                        To keep this service sustainable and ad-free, we use a token system. We strive to keep prices low while ensuring we can continue inventing and improving NexusBuild for you. Thank you for your support!
                    </Text>
                </GlassCard>

                <GlassCard style={styles.overviewCard}>
                    <Ionicons name="layers-outline" size={28} color={theme.colors.accentPrimary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>What NexusBuild Does</Text>
                    <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
                        NexusBuild combines compatibility checking, build planning, performance guidance, and AI assistance in one focused workflow. The app is designed to reduce guesswork, surface better upgrade paths, and help users make confident hardware decisions.
                    </Text>
                </GlassCard>

                <GlassCard style={styles.overviewCard}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#4ECDC4" />
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Why People Use It</Text>
                    <Text style={[styles.centerText, { color: theme.colors.textSecondary }]}>
                        It gives builders a clear path from idea to finished system, with practical recommendations instead of generic advice. The experience is built to be fast, readable, and reliable on mobile.
                    </Text>
                    <TouchableOpacity
                        style={[styles.contactButton, { backgroundColor: theme.colors.accentPrimary }]}
                        onPress={() => navigation.navigate('Contact')}
                    >
                        <Text style={styles.contactButtonText}>Contact Us</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                    </TouchableOpacity>
                </GlassCard>

                <GlassCard style={styles.diagnosticsCard}>
                    <View style={styles.diagnosticsHeader}>
                        <View style={styles.diagnosticsTitleGroup}>
                            <Ionicons name="analytics-outline" size={22} color={theme.colors.accentPrimary} />
                            <View style={styles.diagnosticsCopy}>
                                <Text style={[styles.diagnosticsTitle, { color: theme.colors.textPrimary }]}>Build Diagnostics</Text>
                                <Text style={[styles.diagnosticsSubtitle, { color: theme.colors.textSecondary }]}>
                                    Use this when checking Expo build mismatches or stale updates.
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.copyButton, { backgroundColor: theme.colors.bgTertiary, borderColor: theme.colors.glassBorder }]}
                            onPress={handleCopyDiagnostics}
                        >
                            <Ionicons name="copy-outline" size={16} color={theme.colors.textPrimary} />
                            <Text style={[styles.copyButtonText, { color: theme.colors.textPrimary }]}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.diagnosticsText, { color: theme.colors.textMuted }]}>
                        {diagnostics.appVersion} {diagnostics.runtimeVersion} {FEATURES.PRICE_TRACKING ? 'price-tracking' : ''}
                    </Text>
                </GlassCard>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSpacer: {
        width: 24,
    },
    backButton: {
        padding: 4,
    },
    content: {
        paddingTop: 18,
        flex: 1,
    },
    missionCard: {
        alignItems: 'center',
        padding: 24,
        gap: 12,
        borderRadius: 18,
    },
    noteCard: {
        alignItems: 'center',
        padding: 24,
        gap: 12,
        borderRadius: 18,
    },
    overviewCard: {
        alignItems: 'center',
        padding: 24,
        gap: 12,
        borderRadius: 18,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        textAlign: 'center',
    },
    centerText: {
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        marginTop: 4,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    diagnosticsCard: {
        alignItems: 'stretch',
        gap: 10,
        borderRadius: 18,
        padding: 20,
    },
    diagnosticsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    diagnosticsTitleGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    diagnosticsCopy: {
        flex: 1,
        gap: 4,
    },
    diagnosticsTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    diagnosticsSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    copyButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    diagnosticsText: {
        fontSize: 12,
        lineHeight: 18,
    },
});
