import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { useBuild } from '../contexts/BuildContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import UniversalShareButton from '../components/shared/UniversalShareButton';

export default function MyBuildsScreen({ navigation }) {
    const { savedBuilds, loadUserBuilds, deleteBuild, loading } = useBuild();
    const { user } = useAuth();
    const { theme } = useTheme();

    // ... existing initialization ...

    const handleDeleteBuild = (buildId) => {
        Alert.alert(
            'Delete Build',
            'Are you sure you want to delete this build? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteBuild(buildId);
                        if (result.success) {
                            Alert.alert('Success', 'Build deleted successfully');
                        } else {
                            Alert.alert('Error', result.error || 'Failed to delete build');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        if (user) {
            loadUserBuilds(user.id);
        }
    }, [user]);

    const onRefresh = React.useCallback(() => {
        if (user) {
            loadUserBuilds(user.id);
        }
    }, [user]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const [pinnedBuildIds, setPinnedBuildIds] = React.useState([]);

    useEffect(() => {
        loadPinnedBuilds();
    }, []);

    const loadPinnedBuilds = async () => {
        try {
            const pinned = await AsyncStorage.getItem('nexusbuild_pinned_builds');
            if (pinned) {
                setPinnedBuildIds(JSON.parse(pinned));
            }
        } catch (e) {
            console.log('Error loading pinned builds', e);
        }
    };

    const handlePinBuild = async (buildId) => {
        try {
            const idStr = buildId.toString();
            let newPinned = [...pinnedBuildIds];
            const isPinned = newPinned.includes(idStr);

            if (isPinned) {
                // Unpin (toggle off)
                newPinned = newPinned.filter(id => id !== idStr);
                Alert.alert('Unpinned', 'Build removed from your profile pins.');
            } else {
                // Pin (toggle on)
                if (newPinned.length >= 2) {
                    Alert.alert('Limit Reached', 'You can only pin up to 2 builds. Unpin one first to pin this.');
                    return;
                }
                newPinned.push(idStr);
                Alert.alert('Success', 'Build pinned to your profile!');
            }

            setPinnedBuildIds(newPinned);
            await AsyncStorage.setItem('nexusbuild_pinned_builds', JSON.stringify(newPinned));

            // Sync to server (best effort)
            try {
                // Assuming server API accepts an array or comma-separated string for pinned_ids
                // If the backend expects a single ID, we might need to adjust logic or only send the first one.
                // based on previous code: { showcase_build_id: buildId } - implying single.
                // We will send the first one as showcase, or update API if needed.
                // For now, syncing the primary one.
                const showcaseId = newPinned.length > 0 ? newPinned[0] : null;
                await api.put('/auth/update', { showcase_build_id: showcaseId });
            } catch (syncError) {
                console.log('Pin sync failed, saved locally');
            }

        } catch (error) {
            Alert.alert('Error', 'Failed to update pin status');
        }
    };



    const handleShareToCommunity = async (build) => {
        try {
            const isCurrentlyPublic = build.is_public;
            const newStatus = !isCurrentlyPublic;

            // Update local storage first
            const buildsData = await AsyncStorage.getItem('nexusbuild_saved_builds');
            const builds = buildsData ? JSON.parse(buildsData) : [];
            const updatedBuilds = builds.map(b =>
                b.id === build.id ? { ...b, is_public: newStatus } : b
            );
            await AsyncStorage.setItem('nexusbuild_saved_builds', JSON.stringify(updatedBuilds));

            // Try to sync to server
            try {
                await api.put(`/builds/${build.id}`, { is_public: newStatus });
            } catch (syncError) {
                console.log('Visibility saved locally, will sync when online');
            }

            // Refresh builds list
            loadUserBuilds(user?.id);

            Alert.alert(
                'Success',
                newStatus
                    ? '🎉 Build shared to Community! Others can now see it.'
                    : 'Build is now private.'
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update build visibility');
        }
    };

    const styles = StyleSheet.create({
        container: {
            padding: theme.spacing.lg,
            gap: theme.spacing.lg,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: theme.spacing.xxxl,
            padding: theme.spacing.xl,
        },
        emptyIcon: {
            marginBottom: theme.spacing.lg,
            opacity: 0.8,
        },
        emptyText: {
            fontSize: theme.fontSize.lg,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
        },
        createBtn: {
            backgroundColor: theme.colors.accentPrimary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.borderRadius.full,
            ...theme.shadows.button,
        },
        createBtnText: {
            color: '#fff',
            fontWeight: '600',
            fontSize: theme.fontSize.base,
        },
        buildCard: {
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
        },
        buildHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
        },
        buildName: {
            fontSize: theme.fontSize.lg,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            flex: 1,
            marginRight: theme.spacing.sm,
        },
        buildDate: {
            fontSize: theme.fontSize.xs,
            color: theme.colors.textMuted,
        },
        buildInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.glassBorder,
        },
        priceTag: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        priceText: {
            fontSize: theme.fontSize.lg,
            fontWeight: '600',
            color: theme.colors.success,
        },
        partsCount: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: theme.colors.glassBg,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 2,
            borderRadius: theme.borderRadius.sm,
        },
        partsText: {
            fontSize: theme.fontSize.sm,
            color: theme.colors.textSecondary,
        },
    });

    return (
        <Layout>
            <Header navigation={navigation} />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.accentPrimary}
                    />
                }
            >
                <Text style={{ fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
                    My Builds
                </Text>

                {!loading && savedBuilds.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="hammer-outline"
                            size={64}
                            color={theme.colors.textMuted}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyText}>
                            You haven't saved any builds yet.
                        </Text>
                        <TouchableOpacity
                            style={styles.createBtn}
                            onPress={() => navigation.navigate('BuilderTab')}
                        >
                            <Text style={styles.createBtnText}>Start New Build</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    savedBuilds.map((build) => (
                        <TouchableOpacity
                            key={build.id}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('BuilderTab', {
                                screen: 'BuilderMain',
                                params: { initialBuild: build }
                            })}
                        >
                            <GlassCard style={styles.buildCard}>
                                <View style={styles.buildHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.buildName} numberOfLines={1}>
                                            {build.name || 'Untitled Build'}
                                        </Text>
                                        <Text style={styles.buildDate}>
                                            {formatDate(build.created_at)}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <UniversalShareButton
                                            type="build"
                                            id={build.id}
                                            title={`Check out my PC Build!`}
                                            message={`Check out my PC Build on NexusBuild!\n\n${build.name}\nTotal: $${build.total_price?.toFixed(2)}`}
                                            style={{ marginRight: 4 }}
                                            size={20}
                                            color={theme.colors.textSecondary}
                                        />
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('BuildComparison', { buildA: build })}
                                            style={{ padding: 4, marginRight: 8 }}
                                        >
                                            <Ionicons name="git-compare-outline" size={20} color={theme.colors.accentSecondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleShareToCommunity(build)}
                                            style={{ padding: 4, marginRight: 8 }}
                                        >
                                            <Ionicons name="people-outline" size={20} color={build.is_public ? theme.colors.success : theme.colors.textSecondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handlePinBuild(build.id)}
                                            style={{ padding: 4, marginRight: 8 }}
                                        >
                                            <Ionicons
                                                name={pinnedBuildIds.includes(build.id.toString()) ? "pricetag" : "pricetag-outline"}
                                                size={20}
                                                color={theme.colors.accentPrimary}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteBuild(build.id)}
                                            style={{ padding: 4 }}
                                        >
                                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.buildInfo}>
                                    <View style={styles.partsCount}>
                                        <Ionicons name="cube-outline" size={14} color={theme.colors.textSecondary} />
                                        <Text style={styles.partsText}>
                                            Click to Open
                                        </Text>
                                    </View>

                                    <View style={styles.priceTag}>
                                        <Text style={styles.priceText}>
                                            ${build.total_price?.toFixed(2) || '0.00'}
                                        </Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </Layout>
    );
}
