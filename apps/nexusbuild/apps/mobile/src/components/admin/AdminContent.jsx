import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminContent() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isAdmin = user?.role === 'admin' || user?.is_admin === true;

    const loadBuilds = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getBuilds();
            setBuilds(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load builds for review', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadBuilds();
    }, [loadBuilds]);

    const handleDeleteBuild = async (buildId) => {
        if (!isAdmin) return;
        try {
            await adminAPI.deleteBuild(buildId);
            setBuilds(prev => prev.filter(b => b.id !== buildId));
        } catch (error) {
            console.error('Failed to delete build', error);
            Alert.alert('Error', 'Failed to delete build.');
        }
    };

    const renderBuildItem = ({ item }) => {
        const username = item?.user?.username || 'Unknown';
        return (
            <GlassCard style={styles.buildCard}>
                <View style={styles.buildInfo}>
                    <Text style={[styles.buildName, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                        {item.name || 'Untitled Build'}
                    </Text>
                    <Text style={[styles.buildMeta, { color: theme.colors.textSecondary }]}>
                        @{username}
                    </Text>
                    <Text style={[styles.buildPrice, { color: theme.colors.accentPrimary }]}>
                        ${Number(item.total_price || 0).toFixed(0)}
                    </Text>
                </View>
                <View style={styles.actions}>
                    {isAdmin ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.colors.error }]}
                            onPress={() => handleDeleteBuild(item.id)}
                        >
                            <Ionicons name="trash-outline" size={16} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <Text style={[styles.readOnlyText, { color: theme.colors.textMuted }]}>Read-only</Text>
                    )}
                </View>
            </GlassCard>
        );
    };

    return (
        <View style={styles.container}>
            {/* ... Header ... */}
            <GlassCard style={styles.headerCard}>
                <Ionicons name="images-outline" size={24} color={theme.colors.textPrimary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Content Review</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                        {loading ? 'Loading...' : `Reviewing ${builds.length} recent public builds`}
                    </Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: theme.colors.accentPrimary }]}>
                    <Text style={styles.countText}>{builds.length}</Text>
                </View>
                <TouchableOpacity onPress={loadBuilds} style={{ marginLeft: 10 }}>
                    <Ionicons name="refresh" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
            </GlassCard>

            {loading && builds.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
                </View>
            ) : (
                <FlatList
                    data={builds}
                    renderItem={renderBuildItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={loadBuilds}
                    ListEmptyComponent={
                        <View style={{ padding: 40, alignItems: 'center', gap: 20 }}>
                            <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.textMuted} />
                            <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
                                No pending content to review.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 20,
        borderRadius: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 12,
    },
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    countText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    buildCard: {
        width: '48%',
        minHeight: 140,
        borderRadius: 16,
        padding: 10,
    },
    buildInfo: {
        flex: 1,
    },
    buildName: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    buildMeta: {
        fontSize: 11,
        marginBottom: 6,
    },
    buildPrice: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    actions: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
    actionBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    readOnlyText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
