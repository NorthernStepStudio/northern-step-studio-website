import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../GlassCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard({ stats, setActiveTab, apiStatus }) {
    const { theme } = useTheme();
    const { user } = useAuth();

    // Custom Bar Chart Implementation
    const renderActivityChart = () => {
        const data = [35, 60, 45, 80, 55, 70, 90]; // Mock activity data
        const max = Math.max(...data);
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

        return (
            <View style={styles.chartContainer}>
                {data.map((value, index) => (
                    <View key={index} style={styles.chartColumn}>
                        <View style={styles.barContainer}>
                            <LinearGradient
                                colors={['#A855F7', '#6366F1']}
                                style={[styles.bar, { height: `${(value / max) * 100}%` }]}
                                start={{ x: 0, y: 1 }}
                                end={{ x: 0, y: 0 }}
                            />
                        </View>
                        <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]}>{days[index]}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const StatusIndicator = ({ status, label }) => {
        const getColor = () => {
            if (status === 'healthy') return theme.colors.success;
            if (status === 'offline') return theme.colors.error;
            return theme.colors.warning;
        };

        return (
            <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: getColor() }]} />
                <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.statusValue, { color: getColor() }]}>
                    {status === 'healthy' ? 'Operational' : status === 'offline' ? 'Offline' : 'Checking...'}
                </Text>
            </View>
        );
    };

    const StatCard = ({ title, value, icon, color, trend }) => (
        <GlassCard style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
            <View style={styles.statHeader}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                {trend && (
                    <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10B98120' : '#EF444420' }]}>
                        <Ionicons name={trend > 0 ? "trending-up" : "trending-down"} size={12} color={trend > 0 ? '#10B981' : '#EF4444'} />
                        <Text style={[styles.trendText, { color: trend > 0 ? '#10B981' : '#EF4444' }]}>{Math.abs(trend)}%</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{title}</Text>
        </GlassCard>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <View>
                    <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>Welcome back,</Text>
                    <Text style={[styles.adminName, { color: theme.colors.textPrimary }]}>{user?.displayName || 'Administrator'}</Text>
                </View>
                <View style={styles.dateBadge}>
                    <Text style={[styles.dateText, { color: theme.colors.accentPrimary }]}>
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                </View>
            </View>

            {/* System Status Cards */}
            <GlassCard style={styles.systemStatusCard}>
                <Text style={[styles.sectionTitleSmall, { color: theme.colors.textPrimary }]}>System Status</Text>
                <View style={styles.statusGrid}>
                    <StatusIndicator status={apiStatus.backend} label="Backend API" />
                    <View style={[styles.dividerVertical, { backgroundColor: theme.colors.glassBorder }]} />
                    <StatusIndicator status={apiStatus.aiService} label="AI Engine" />
                </View>
            </GlassCard>

            {/* Key Metrics Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon="people"
                    color="#4ECDC4"
                    trend={12}
                />
                <StatCard
                    title="Total Builds"
                    value={stats.totalBuilds}
                    icon="construct"
                    color="#FF6B6B"
                    trend={5}
                />
            </View>
            <View style={styles.statsGrid}>
                <StatCard
                    title="Active Today"
                    value={stats.activeToday}
                    icon="flash"
                    color="#FFE66D"
                    trend={-2}
                />
                <StatCard
                    title="Revenue"
                    value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
                    icon="cash"
                    color="#A855F7"
                    trend={8}
                />
            </View>

            {/* Activity Chart Section */}
            <GlassCard style={styles.chartSection}>
                <View style={styles.chartHeader}>
                    <Text style={[styles.sectionTitleSmall, { color: theme.colors.textPrimary }]}>Build Activity</Text>
                    <TouchableOpacity>
                        <Text style={{ color: theme.colors.accentPrimary, fontSize: 12 }}>Last 7 Days</Text>
                    </TouchableOpacity>
                </View>
                {renderActivityChart()}
            </GlassCard>

            {/* Quick Actions Grid */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTab('reports')}>
                    <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.actionGradient}>
                        <Ionicons name="bug" size={24} color="white" />
                        <Text style={styles.actionBtnText}>Reports</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTab('users')}>
                    <LinearGradient colors={['#4ECDC4', '#45B7AA']} style={styles.actionGradient}>
                        <Ionicons name="people" size={24} color="white" />
                        <Text style={styles.actionBtnText}>Users</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTab('content')}>
                    <LinearGradient colors={['#A855F7', '#9333EA']} style={styles.actionGradient}>
                        <Ionicons name="images" size={24} color="white" />
                        <Text style={styles.actionBtnText}>Content</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTab('settings')}>
                    <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.actionGradient}>
                        <Ionicons name="settings-sharp" size={24} color="white" />
                        <Text style={styles.actionBtnText}>Settings</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 14,
    },
    adminName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    dateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.2)',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    systemStatusCard: {
        padding: 16,
        marginBottom: 20,
    },
    statusGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    statusRow: {
        flex: 1,
        alignItems: 'center',
    },
    dividerVertical: {
        width: 1,
        height: 40,
        backgroundColor: '#ccc',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    statusValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    statCard: {
        flex: 1,
        padding: 15,
        borderRadius: 16,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    iconBox: {
        padding: 8,
        borderRadius: 10,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    trendText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    chartSection: {
        padding: 20,
        marginBottom: 24,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
    },
    chartColumn: {
        alignItems: 'center',
        flex: 1,
    },
    barContainer: {
        height: '100%',
        width: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: 4,
    },
    chartLabel: {
        marginTop: 8,
        fontSize: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    sectionTitleSmall: {
        fontSize: 16,
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    actionBtn: {
        width: '47%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionGradient: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    actionBtnText: {
        color: 'white',
        marginTop: 8,
        fontWeight: '600',
    },
});
