import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    FlatList,
    Animated,
    Easing,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../contexts/ThemeContext';
import api, { partsAPI } from '../services/api';
import { MOCK_PARTS } from '../services/mockData';
import { useTranslation } from '../core/i18n';
import { resolveBenchmarkScore } from '../core/performanceScore';

// --- Components ---

// Animated Power Meter Bar
const PowerMeter = ({ score, maxScore = 45000, theme, isBottleneck, t }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    // Determine Tier (Cyberpunk Lite style)
    let tierColor = theme.colors.textSecondary; // Office Drone
    let tierName = t('benchmarks.tiers.office');

    if (score > 10000) { tierColor = '#3B82F6'; tierName = t('benchmarks.tiers.console'); } // Blue
    if (score > 20000) { tierColor = '#A855F7'; tierName = t('benchmarks.tiers.highEnd'); } // Purple
    if (score > 30000) { tierColor = '#F43F5E'; tierName = t('benchmarks.tiers.nexus'); } // Neon Red/Orange

    useEffect(() => {
        // Calculate percentage based on 45,000 max
        const percent = Math.min((score / maxScore), 1);

        Animated.timing(animatedValue, {
            toValue: percent,
            duration: 900, // Slightly longer for dramatic effect
            useNativeDriver: false,
            easing: Easing.out(Easing.exp),
        }).start();
    }, [score]);

    const widthInterpolation = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <View style={styles.meterContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: tierColor, fontWeight: 'bold', fontSize: 16 }}>{tierName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ color: tierColor, fontWeight: 'bold', fontSize: 24 }}>{score}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>/ {maxScore}</Text>
                </View>
            </View>

            {/* Bar Background */}
            <View style={[styles.barBackground, { backgroundColor: theme.colors.bgSecondary, borderColor: tierColor + '40', borderWidth: 1 }]}>
                {/* Fill */}
                <Animated.View style={[styles.barFill, {
                    width: widthInterpolation,
                    backgroundColor: tierColor,
                    shadowColor: tierColor,
                    shadowRadius: 10,
                    shadowOpacity: 0.8,
                    elevation: 5
                }]} />

                {/* Bottleneck Marker (Visual only) */}
                {isBottleneck && (
                    <View style={styles.bottleneckMarker}>
                        <Ionicons name="warning" size={12} color="#fff" />
                    </View>
                )}
            </View>
        </View>
    );
};

export default function BenchmarksScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Data
    const [cpus, setCpus] = useState([]);
    const [gpus, setGpus] = useState([]);

    // Selection State
    const [selectedCpu, setSelectedCpu] = useState(null);
    const [selectedGpu, setSelectedGpu] = useState(null);

    // Simulation State
    const [nexusScore, setNexusScore] = useState(null);
    const [simulating, setSimulating] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null); // 'CPU' or 'GPU'

    useEffect(() => {
        loadParts();
    }, []);

    const loadParts = async () => {
        try {
            // Parallel fetch for speed
            const [cpuData, gpuData] = await Promise.all([
                partsAPI.getAll('CPU'),
                partsAPI.getAll('GPU')
            ]);
            const usableCpus = (cpuData || []).some(part => part?.score) ? cpuData : (MOCK_PARTS.cpu || []);
            const usableGpus = (gpuData || []).some(part => part?.score) ? gpuData : (MOCK_PARTS.gpu || []);
            setCpus(usableCpus);
            setGpus(usableGpus);
        } catch (error) {
            console.error("Failed to load parts", error);
            setCpus(MOCK_PARTS.cpu || []);
            setGpus(MOCK_PARTS.gpu || []);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const handleSelectPart = (part) => {
        if (modalType === 'CPU') setSelectedCpu(part);
        if (modalType === 'GPU') setSelectedGpu(part);
        setModalVisible(false);
        setNexusScore(null); // Reset score on change
    };

    const calculateScore = async () => {
        if (!selectedCpu || !selectedGpu) return;

        setSimulating(true);
        setNexusScore(null);

        // Artificial "Crunching" delay for effect (short)
        setTimeout(async () => {
            try {
                // Use default scores if missing in DB (fallback logic)
                // In production, we'd ensure DB has scores.
                // Here we trust the part object or fetch if needed.
                // The part object should have 'score'.

                const cpuScore = resolveBenchmarkScore(selectedCpu);
                const gpuScore = resolveBenchmarkScore(selectedGpu);

                const response = await api.post('/builds/calculate-score', {
                    cpu_score: cpuScore,
                    gpu_score: gpuScore
                });
                setNexusScore(response.data);
            } catch (error) {
                console.error('Score API failed, falling back to local calculation:', error?.message || error);
                // Fallback: calculate locally using same algorithm as backend
                try {
                    const cpuScore = resolveBenchmarkScore(selectedCpu);
                    const gpuScore = resolveBenchmarkScore(selectedGpu);
                    const nexusPowerScore = Math.round((gpuScore * 0.7) + (cpuScore * 0.3));
                    const bottleneckDetected =
                        cpuScore > 0 &&
                        gpuScore > 0 &&
                        Math.abs(cpuScore - gpuScore) / Math.max(cpuScore, gpuScore) > 0.4;

                    setNexusScore({
                        nexus_power_score: nexusPowerScore,
                        cpu_score: cpuScore,
                        gpu_score: gpuScore,
                        bottleneck_detected: bottleneckDetected,
                    });
                } catch (e) {
                    console.error('Local fallback calculation failed:', e);
                }
            } finally {
                setSimulating(false);
            }
        }, 600);
    };

    const renderPartButton = (type, selectedPart) => {
        const typeLabel = type === 'CPU' ? t('benchmarks.types.cpu') : t('benchmarks.types.gpu');
        return (
            <TouchableOpacity
                onPress={() => openModal(type)}
                style={[styles.partButton, {
                    backgroundColor: theme.colors.glassBg,
                    borderColor: selectedPart ? theme.colors.accentPrimary : theme.colors.border,
                }]}
            >
                <View style={[styles.iconBox, { backgroundColor: type === 'CPU' ? '#3B82F620' : '#10B98120' }]}>
                    <Ionicons
                        name={type === 'CPU' ? 'hardware-chip-outline' : 'desktop-outline'}
                        size={24}
                        color={type === 'CPU' ? '#3B82F6' : '#10B981'}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                        {type === 'CPU' ? t('benchmarks.part.cpuLabel') : t('benchmarks.part.gpuLabel')}
                    </Text>
                    <Text style={{ color: theme.colors.textPrimary, fontWeight: selectedPart ? 'bold' : 'normal', fontSize: 15 }} numberOfLines={1}>
                        {selectedPart ? selectedPart.name : t('benchmarks.selectPart', { type: typeLabel })}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        );
    };

    return (
        <Layout>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                        {t('benchmarks.titlePrefix')} <Text style={{ color: theme.colors.accentPrimary }}>{t('benchmarks.titleAccent')}</Text>
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, marginTop: 5 }}>
                        {t('benchmarks.subtitle')}
                    </Text>
                </View>

                {/* Selection Area */}
                <View style={{ gap: 15, marginBottom: 25 }}>
                    {renderPartButton('CPU', selectedCpu)}
                    {renderPartButton('GPU', selectedGpu)}
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                    onPress={calculateScore}
                    disabled={simulating || !selectedCpu || !selectedGpu}
                    style={[styles.calcButton, {
                        backgroundColor: (selectedCpu && selectedGpu) ? theme.colors.accentPrimary : theme.colors.surface,
                        opacity: (selectedCpu && selectedGpu) ? 1 : 0.6
                    }]}
                >
                    {simulating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="flash" size={20} color="white" />
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                {t('benchmarks.runSimulation')}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Results Area */}
                {(nexusScore || simulating) && (
                    <GlassCard style={{ marginTop: 30, padding: 20, minHeight: 200, justifyContent: 'center' }}>
                        {simulating ? (
                            <View style={{ alignItems: 'center', gap: 10 }}>
                                <Text style={{ color: theme.colors.accentPrimary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                                    {t('benchmarks.analyzing')}
                                </Text>
                            </View>
                        ) : (
                            <View style={{ gap: 20 }}>
                                <View>
                                    <Text style={{ color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>
                                        {t('benchmarks.powerScore')}
                                    </Text>
                                    <PowerMeter
                                        score={nexusScore.nexus_power_score}
                                        theme={theme}
                                        isBottleneck={nexusScore.bottleneck_detected}
                                        t={t}
                                    />
                                </View>

                                {/* Stats Grid */}
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                    <View style={[styles.statBox, { backgroundColor: theme.colors.bgSecondary }]}>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{t('benchmarks.avg1080p')}</Text>
                                        <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold' }}>
                                            {~~(nexusScore.nexus_power_score / 45)} FPS
                                        </Text>
                                    </View>
                                    <View style={[styles.statBox, { backgroundColor: theme.colors.bgSecondary }]}>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{t('benchmarks.avg1440p')}</Text>
                                        <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold' }}>
                                            {~~(nexusScore.nexus_power_score / 75)} FPS
                                        </Text>
                                    </View>
                                </View>

                                {nexusScore.bottleneck_detected && (
                                    <View style={[styles.alertBox, { backgroundColor: '#F43F5E15', borderColor: '#F43F5E' }]}>
                                        <Ionicons name="alert-circle" size={24} color="#F43F5E" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: "#F43F5E", fontWeight: 'bold' }}>{t('benchmarks.bottleneck.title')}</Text>
                                            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                                                {t('benchmarks.bottleneck.body')}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </GlassCard>
                )}
            </ScrollView>

            {/* Part Selection Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgPrimary + 'F0' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                                {t('benchmarks.modalTitle', { type: modalType === 'CPU' ? t('benchmarks.types.cpu') : t('benchmarks.types.gpu') })}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
                                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={modalType === 'CPU' ? cpus : gpus}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={{ padding: 10 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.partItem, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => handleSelectPart(item)}
                                >
                                    <View>
                                        <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold' }}>{item.name}</Text>
                                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{t('benchmarks.price', { price: item.price })}</Text>
                                    </View>
                                    {item.score ? (
                                        <View style={{ backgroundColor: theme.colors.bgSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                                            <Text style={{ color: theme.colors.accentPrimary, fontWeight: 'bold', fontSize: 12 }}>
                                                {t('benchmarks.points', { score: item.score })}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('benchmarks.noScore')}</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </Layout>
    );
}

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    partButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        gap: 15,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calcButton: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    // Power Meter
    meterContainer: {
        marginBottom: 10,
    },
    barBackground: {
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    barFill: {
        height: '100%',
        borderRadius: 12,
    },
    bottleneckMarker: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 30,
        backgroundColor: 'rgba(255,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderColor: 'red',
    },
    // Stats
    statBox: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    alertBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    partItem: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    }
});
