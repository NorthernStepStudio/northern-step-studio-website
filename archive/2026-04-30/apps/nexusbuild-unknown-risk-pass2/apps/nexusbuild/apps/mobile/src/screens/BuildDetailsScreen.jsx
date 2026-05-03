import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../core/i18n';
import { formatCurrency } from '../utils/currency';
import { useBuild } from '../contexts/BuildContext';
import UniversalShareButton from '../components/shared/UniversalShareButton';
import { haptics } from '../services/haptics';

export default function BuildDetailsScreen({ route, navigation }) {
    const { build } = route.params || {};
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { loadBuild } = useBuild();

    if (!build) {
        return (
            <Layout>
                <Header navigation={navigation} title="Build Details" />
                <View style={styles.centerContainer}>
                    <Text style={{ color: theme.colors.textPrimary }}>Build data not found.</Text>
                </View>
            </Layout>
        );
    }

    const username =
        typeof build?.username === 'string' && build.username.trim().length > 0
            ? build.username.trim()
            : 'Anonymous';
    const avatarInitial = username[0] ? username[0].toUpperCase() : 'A';

    const parts = useMemo(() => {
        if (!build.parts) return [];
        return Object.entries(build.parts)
            .filter(([_, part]) => part !== null)
            .map(([category, part]) => ({
                ...part,
                categoryKey: category,
            }));
    }, [build]);

    const handleClone = useCallback(() => {
        haptics.medium();
        Alert.alert(
            t('community.actions.clone'),
            'Do you want to copy this build to your builder? This will replace your current build.',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('community.actions.clone'),
                    onPress: () => {
                        loadBuild(build);
                        navigation.navigate('BuilderTab', { screen: 'BuilderMain' });
                    },
                },
            ]
        );
    }, [build, loadBuild, navigation, t]);

    const renderPartItem = (part) => {
        const iconName = getCategoryIcon(part.categoryKey);
        return (
            <GlassCard key={part.id || part.name} style={styles.partCard}>
                <View style={styles.partIconContainer}>
                    <Ionicons name={iconName} size={24} color={theme.colors.accentPrimary} />
                </View>
                <View style={styles.partDetails}>
                    <Text style={[styles.partCategory, { color: theme.colors.textMuted }]}>
                        {part.categoryKey.toUpperCase()}
                    </Text>
                    <Text style={[styles.partName, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                        {part.name}
                    </Text>
                    <Text style={[styles.partPrice, { color: theme.colors.success }]}>
                        {formatCurrency(part.price)}
                    </Text>
                </View>
            </GlassCard>
        );
    };

    return (
        <Layout>
            <Header navigation={navigation} title={build.name || 'Build Details'} />
            
            <ScrollView contentContainerStyle={styles.container}>
                {/* Build Header */}
                <GlassCard style={styles.headerCard}>
                    <View style={styles.userSection}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.accentSecondary }]}>
                            <Text style={styles.avatarText}>{avatarInitial}</Text>
                        </View>
                        <View>
                            <Text style={[styles.buildTitle, { color: theme.colors.textPrimary }]}>
                                {build.name}
                            </Text>
                            <Text style={[styles.authorName, { color: theme.colors.textSecondary }]}>
                                {t('community.buildCard.by')} {username}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.accentPrimary }]}>
                                {formatCurrency(build.total_price)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                Total Price
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.colors.accentPrimary }]}>
                                {parts.length}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                                Components
                            </Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.cloneButton, { backgroundColor: theme.colors.accentPrimary }]} 
                        onPress={handleClone}
                    >
                        <Ionicons name="copy-outline" size={20} color="white" />
                        <Text style={styles.cloneButtonText}>{t('community.actions.clone')}</Text>
                    </TouchableOpacity>
                    
                    <UniversalShareButton
                        type="build"
                        id={build.id}
                        title={build.name}
                        message={`Check out this build on NexusBuild: ${build.name}`}
                        style={[styles.shareButton, { backgroundColor: theme.colors.glassBg, borderColor: theme.colors.glassBorder }]}
                        color={theme.colors.textPrimary}
                    />
                </View>

                {/* Components List */}
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    Build Components
                </Text>
                
                <View style={styles.partsList}>
                    {parts.map(renderPartItem)}
                </View>
            </ScrollView>
        </Layout>
    );
}

const getCategoryIcon = (category) => {
    const icons = {
        cpu: 'hardware-chip-outline',
        gpu: 'game-controller-outline',
        motherboard: 'grid-outline',
        ram: 'flash-outline',
        storage: 'save-outline',
        psu: 'battery-charging-outline',
        case: 'cube-outline',
        cooler: 'snow-outline',
        fan: 'aperture-outline',
        monitor: 'desktop-outline',
        keyboard: 'keypad-outline',
        mouse: 'hand-left-outline',
        headset: 'headset-outline',
        os: 'disc-outline',
        accessory: 'briefcase-outline',
    };
    return icons[category] || 'cube-outline';
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        padding: 20,
        marginBottom: 20,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    buildTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    authorName: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    cloneButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cloneButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    shareButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 4,
    },
    partsList: {
        gap: 12,
    },
    partCard: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    partIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    partDetails: {
        flex: 1,
    },
    partCategory: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    partName: {
        fontSize: 14,
        fontWeight: '500',
        marginVertical: 1,
    },
    partPrice: {
        fontSize: 13,
        fontWeight: '600',
    },
});
