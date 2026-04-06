import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminReports({ reports, setSelectedReport, onSync }) {
    const { theme } = useTheme();
    const [filterStatus, setFilterStatus] = useState('all');

    // Ensure reports is always an array and filter safely
    const safeReports = Array.isArray(reports) ? reports : [];
    const filteredReports = safeReports.filter(r => filterStatus === 'all' || r.status === filterStatus);

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return '#4ECDC4';
            case 'in_progress': return '#F59E0B';
            default: return '#FFE66D';
        }
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            {/* Sync Button */}
            {onSync && (
                <TouchableOpacity onPress={onSync} style={styles.syncButton}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#4ECDC4" />
                    <Text style={styles.syncButtonText}>Sync All Local Reports</Text>
                </TouchableOpacity>
            )}

            {/* Stats Header */}
            <View style={styles.statsRow}>
                <GlassCard style={styles.statChip}>
                    <Text style={[styles.statValue, { color: '#FFE66D' }]}>
                        {safeReports.filter(r => r.status === 'pending').length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Pending</Text>
                </GlassCard>
                <GlassCard style={styles.statChip}>
                    <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                        {safeReports.filter(r => r.status === 'in_progress').length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>In Progress</Text>
                </GlassCard>
                <GlassCard style={styles.statChip}>
                    <Text style={[styles.statValue, { color: '#4ECDC4' }]}>
                        {safeReports.filter(r => r.status === 'resolved').length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Resolved</Text>
                </GlassCard>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
                {['all', 'pending', 'in_progress', 'resolved'].map(status => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => setFilterStatus(status)}
                        style={[
                            styles.filterTab,
                            filterStatus === status && { backgroundColor: theme.colors.accentPrimary + '20', borderColor: theme.colors.accentPrimary }
                        ]}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: filterStatus === status ? theme.colors.accentPrimary : theme.colors.textSecondary }
                        ]}>
                            {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.textMuted} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No reports found</Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {filteredReports.map((item, index) => {
                        const statusColor = getStatusColor(item.status);
                        return (
                            <TouchableOpacity
                                key={item.id || index}
                                onPress={() => setSelectedReport(item)}
                            >
                                <GlassCard style={styles.reportCard}>
                                    <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.idBadge}>
                                                <Text style={[styles.idText, { color: theme.colors.textSecondary }]}>#{item.id?.toString().slice(-4) || index + 1}</Text>
                                            </View>
                                            <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}
                                            </Text>
                                        </View>

                                        <Text style={[styles.descText, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                                            {item.description}
                                        </Text>

                                        <View style={styles.cardFooter}>
                                            <View style={styles.metaRow}>
                                                {(item.image_url || (item.images && item.images.length > 0) || (item.screenshots && item.screenshots.length > 0)) && (
                                                    <View style={styles.badge}>
                                                        <Ionicons name="image" size={12} color={theme.colors.textPrimary} />
                                                    </View>
                                                )}
                                                {item.priority === 'high' && (
                                                    <View style={[styles.badge, { backgroundColor: '#EF444420' }]}>
                                                        <Ionicons name="alert" size={12} color="#EF4444" />
                                                        <Text style={{ fontSize: 10, color: '#EF4444', marginLeft: 4 }}>High</Text>
                                                    </View>
                                                )}
                                            </View>

                                            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                                <Text style={[styles.statusText, { color: statusColor }]}>
                                                    {item.status === 'in_progress' ? 'In Progress' : (item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </GlassCard>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    statChip: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 10,
    },
    filterTabs: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        gap: 12,
    },
    reportCard: {
        padding: 0,
        overflow: 'hidden',
        flexDirection: 'row',
        borderRadius: 12,
    },
    statusStrip: {
        width: 6,
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    idText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 11,
    },
    descText: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#4ECDC4',
        gap: 8,
    },
    syncButtonText: {
        color: '#4ECDC4',
        fontSize: 14,
        fontWeight: '600',
    },
});
