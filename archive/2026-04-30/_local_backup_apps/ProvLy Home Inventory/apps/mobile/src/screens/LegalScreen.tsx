import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../stores/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config/brand';

type LegalScreenType = 'privacy' | 'terms' | 'opensource';

export default function LegalScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();

    const type = ((route.params as any)?.type || 'privacy') as LegalScreenType;

    const getTitle = () => {
        switch (type) {
            case 'privacy':
                return 'Privacy and Liability';
            case 'terms':
                return 'Terms of Service';
            case 'opensource':
                return 'Open Source';
            default:
                return 'Legal';
        }
    };

    const renderPrivacy = () => (
        <>
            <View
                style={[
                    styles.alertBox,
                    { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` },
                ]}
            >
                <MaterialCommunityIcons
                    name="shield-check"
                    size={24}
                    color={colors.primary}
                    style={{ marginBottom: 8 }}
                />
                <Text style={[styles.alertTitle, { color: colors.primary }]}>Local-First Privacy</Text>
                <Text style={[styles.alertText, { color: colors.text }]}>
                    {BRAND.appName} is developed by {BRAND.companyName} with a local-first model: by default, your
                    inventory stays on your device.
                </Text>
            </View>

            <Text style={[styles.heading, { color: colors.text }]}>1. What We Store</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                Item details, room structure, and media attachments are stored locally on your device. If you enable
                account login and cloud sync, selected account and sync metadata are processed to deliver those
                features.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>2. Optional Cloud Services</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                If you choose to use cloud features, third-party processors such as Supabase (auth/storage) and
                RevenueCat (subscriptions) are used only to support those features. These services do not become owners
                of your inventory data.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>3. No Sale of Personal Data</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                {BRAND.companyName} does not sell your personal information. We do not monetize your inventory details
                through ad targeting or data brokerage.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>4. Your Controls</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                You can export your data and delete account-linked data from within the app. You remain responsible for
                retaining your own backups when using local-only mode.
            </Text>
        </>
    );

    const renderTerms = () => (
        <>
            <Text style={[styles.heading, { color: colors.text }]}>1. Service Provider</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                {BRAND.appName} is provided by {BRAND.companyName}. By using the app, you agree to these terms.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>2. Intended Use</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                {BRAND.appName} is an inventory documentation and organization tool. It is not an insurance provider,
                legal service, or financial advisory service.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>3. User Responsibility</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                You are responsible for accuracy of item records, valuation inputs, and backups. Insurance outcomes
                depend on your carrier and policy terms, not solely on app usage.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>4. Data Loss and Backup</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                In local-only mode, loss of device access may result in permanent data loss. Use exports and cloud
                backup features if you require recovery paths.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>5. Subscription Billing</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                Paid features may require an active subscription managed through Apple App Store or Google Play and
                processed by RevenueCat. Store terms govern billing, renewals, and refunds.
            </Text>

            <Text style={[styles.heading, { color: colors.text }]}>6. Warranty Disclaimer</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                The app is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, to the maximum extent
                permitted by law.
            </Text>
        </>
    );

    const renderOpenSource = () => (
        <>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                {BRAND.appName} includes open source software from the community. Primary components include:
            </Text>

            <View style={styles.licenseList}>
                {[
                    { name: 'React Native', lic: 'MIT' },
                    { name: 'Expo', lic: 'MIT' },
                    { name: 'Supabase JS', lic: 'MIT' },
                    { name: 'Zustand', lic: 'MIT' },
                    { name: 'React Navigation', lic: 'MIT' },
                    { name: 'Crypto JS', lic: 'MIT' },
                    { name: 'Lucide Icons', lic: 'ISC' },
                ].map((lib) => (
                    <View key={lib.name} style={[styles.licenseItem, { borderColor: colors.border }]}>
                        <Text style={[styles.libName, { color: colors.text }]}>{lib.name}</Text>
                        <View style={[styles.badge, { backgroundColor: `${colors.primary}20` }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>{lib.lic}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </>
    );

    const getContent = () => {
        if (type === 'privacy') return renderPrivacy();
        if (type === 'terms') return renderTerms();
        if (type === 'opensource') return renderOpenSource();
        return null;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{getTitle()}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {getContent()}
                <View style={{ height: 24 }} />

                <View style={[styles.metaBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
                        Provider: {BRAND.companyName}
                    </Text>
                    <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
                        Legal Contact: {BRAND.legalContactEmail}
                    </Text>
                    <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
                        Website: {BRAND.website}
                    </Text>
                    <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
                        Last Updated: {BRAND.legalLastUpdated}
                    </Text>
                </View>
                <View style={{ height: 24 }} />
            </ScrollView>

            <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => navigation.goBack()}
            >
                <Text style={[styles.closeText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
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
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
    },
    alertBox: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    alertText: {
        textAlign: 'center',
        lineHeight: 22,
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 18,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 8,
    },
    licenseList: {
        gap: 12,
        marginTop: 8,
    },
    licenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
    },
    libName: {
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    metaBox: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        gap: 6,
    },
    metaLine: {
        fontSize: 13,
    },
    closeButton: {
        marginHorizontal: 24,
        marginBottom: 32,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    closeText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

