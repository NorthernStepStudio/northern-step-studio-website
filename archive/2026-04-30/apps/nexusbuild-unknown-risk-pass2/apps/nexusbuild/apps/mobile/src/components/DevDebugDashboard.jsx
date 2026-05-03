import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Platform,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useParts } from '../contexts/PartsContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_CONFIG } from '../core/config';
import { betaConfig, isBetaActive } from '../config/betaConfig';

export default function DevDebugDashboard({ visible, onClose }) {
    const { theme } = useTheme();
    const { parts, loading, error, stats } = useParts();
    const [systemInfo, setSystemInfo] = useState({});

    useEffect(() => {
        setSystemInfo({
            platform: Platform.OS,
            version: Platform.Version,
            dimensions: Dimensions.get('window'),
            apiBase: API_CONFIG.baseUrl,
            isBeta: isBetaActive(),
        });
    }, []);

    const MetricRow = ({ label, value, color }) => (
        <View style={[styles.metricRow, { borderBottomColor: theme.colors.glassBorder }]}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.metricValue, { color: color || theme.colors.textPrimary }]}>{value}</Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.glassBorder }]}>
                    <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="bug-outline" size={20} color={theme.colors.accentPrimary} />
                            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Developer Dashboard</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.sectionHeader}>API & NETWORK</Text>
                        <MetricRow label="Base URL" value={systemInfo.apiBase} color={theme.colors.accentPrimary} />
                        <MetricRow label="Beta Mode" value={systemInfo.isBeta ? "Active" : "Inactive"} color={systemInfo.isBeta ? theme.colors.success : theme.colors.error} />
                        <MetricRow label="Token Logic" value={betaConfig.unlockBetaFeaturesForFree ? "Free" : "Gated"} />

                        <Text style={styles.sectionHeader}>INVENTORY STATS</Text>
                        <MetricRow label="Status" value={loading ? "Loading..." : (error ? "Error" : "Ready")} color={error ? theme.colors.error : theme.colors.success} />
                        <MetricRow label="Total Parts" value={parts?.length || 0} />
                        
                        {stats?.byCategory && Object.entries(stats.byCategory).map(([cat, count]) => (
                            <MetricRow key={cat} label={cat} value={count} />
                        ))}

                        <Text style={styles.sectionHeader}>DEVICE INFO</Text>
                        <MetricRow label="Platform" value={`${systemInfo.platform} ${systemInfo.version}`} />
                        <MetricRow label="Screen" value={`${Math.round(systemInfo.dimensions?.width)}x${Math.round(systemInfo.dimensions?.height)}`} />

                        {error && (
                            <View style={[styles.errorBox, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error }]}>
                                <Text style={[styles.errorText, { color: theme.colors.error }]}>Last Error: {error}</Text>
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: theme.colors.glassBorder }]}>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>NexusBuild Debug Tools v0.5.5</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '800',
        color: '#8b5cf6',
        marginTop: 20,
        marginBottom: 8,
        letterSpacing: 1,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    metricLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    errorBox: {
        marginTop: 20,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    errorText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    footer: {
        padding: 12,
        alignItems: 'center',
        borderTopWidth: 1,
    }
});
