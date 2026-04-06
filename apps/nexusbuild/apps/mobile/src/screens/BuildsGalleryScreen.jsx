import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import { buildsAPI } from '../services/api';
import { BuildCardSkeleton } from '../components/Skeleton';
import { haptics } from '../services/haptics';

export default function BuildsGalleryScreen({ navigation }) {
    const { theme: appTheme } = useTheme();
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBuilds = async () => {
        // Show empty state immediately - don't block on API
        setLoading(false);
        setRefreshing(false);

        // Try API in background
        try {
            const data = await buildsAPI.getAll();
            if (data && data.length > 0) {
                setBuilds(data);
            }
        } catch (error) {
            // API failed, keep showing empty state (that's fine)
            // console.log('Builds API unavailable, showing empty state');
        }
    };

    useEffect(() => {
        fetchBuilds();
    }, []);

    const onRefresh = () => {
        haptics.medium();
        setRefreshing(true);
        fetchBuilds();
    };

    const handleViewBuild = (build) => {
        haptics.selection();
        // Navigate to Builder with the selected build data to "view/edit" it
        navigation.navigate('BuilderTab', { screen: 'BuilderMain', params: { initialBuild: build } });
    };

    const renderBuildCard = (build) => (
        <GlassCard key={build.id} style={styles.buildCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userContainer}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={16} color={appTheme.colors.accentPrimary} />
                    </View>
                    <Text style={[styles.username, { color: appTheme.colors.textPrimary }]}>
                        User #{build.user_id}
                    </Text>
                </View>
                <Text style={[styles.timeAgo, { color: appTheme.colors.textMuted }]}>
                    {new Date(build.created_at || Date.now()).toLocaleDateString()}
                </Text>
            </View>

            <Text style={[styles.buildName, { color: appTheme.colors.textPrimary }]}>{build.name}</Text>

            <View style={styles.specsContainer}>
                <View style={[styles.specBadge, { backgroundColor: 'rgba(0, 212, 255, 0.1)' }]}>
                    <Ionicons name="hardware-chip-outline" size={14} color={appTheme.colors.accentPrimary} />
                    <Text style={[styles.specText, { color: appTheme.colors.accentPrimary }]}>
                        {build.cpu_id ? 'CPU Selected' : 'No CPU'}
                    </Text>
                </View>
                <View style={[styles.specBadge, { backgroundColor: 'rgba(74, 158, 255, 0.1)' }]}>
                    <Ionicons name="videocam-outline" size={14} color={appTheme.colors.accentSecondary} />
                    <Text style={[styles.specText, { color: appTheme.colors.accentSecondary }]}>
                        {build.gpu_id ? 'GPU Selected' : 'No GPU'}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: appTheme.colors.glassBorder }]} />

            <View style={styles.cardFooter}>
                <Text style={[styles.price, { color: appTheme.colors.success }]}>
                    ${build.total_price?.toLocaleString() || '0'}
                </Text>
                <View
                    style={[styles.viewBtn, { backgroundColor: appTheme.colors.glassBg }]}
                    onPress={() => handleViewBuild(build)}
                >
                    <Text style={[styles.viewBtnText, { color: appTheme.colors.textPrimary }]}>View Build</Text>
                    <Ionicons name="arrow-forward" size={16} color={appTheme.colors.textPrimary} />
                </View>
            </View>
        </GlassCard>
    );

    return (
        <Layout
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={appTheme.colors.accentPrimary} />
            }
        >
            <Header navigation={navigation} />
            <View style={styles.scrollContent}>
                {loading ? (
                    <View style={{ gap: 10 }}>
                        <BuildCardSkeleton />
                        <BuildCardSkeleton />
                        <BuildCardSkeleton />
                    </View>
                ) : (
                    builds.length > 0 ? (
                        builds.map(renderBuildCard)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="construct-outline" size={64} color={appTheme.colors.glassBorder} />
                            <Text style={[styles.emptyText, { color: appTheme.colors.textMuted }]}>
                                No community builds found yet.
                            </Text>
                            <Text style={[styles.emptySubtext, { color: appTheme.colors.textMuted }]}>
                                Be the first to share your build!
                            </Text>
                        </View>
                    )
                )}
            </View>
        </Layout>
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
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    buildCard: {
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeAgo: {
        fontSize: 12,
    },
    buildName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    specsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    specBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    specText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    viewBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
        gap: 10,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 14,
    }
});
