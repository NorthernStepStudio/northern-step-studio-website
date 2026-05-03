import React from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import { ROAST_LOGIC } from '../domain/ai/knowledge/roastMyBuild';

const { height } = Dimensions.get('window');

const AIReviewModal = ({ visible, onClose, currentBuild }) => {
    const { theme } = useTheme();

    const parts = currentBuild?.parts || {};
    const cpu = parts.cpu;
    const gpu = parts.gpu;

    // Need at least CPU + GPU to show review
    const hasBase = cpu && gpu;

    const calculateReview = () => {
        if (!hasBase) return null;

        const cpuPrice = cpu.price || 0;
        const gpuPrice = gpu.price || 0;

        const pros = [];
        const cons = [];
        const bottlenecks = [];
        let score = 75;

        // Bottleneck checks
        if (ROAST_LOGIC.bottlenecks.cpu_bottleneck.check({ price: cpuPrice }, { price: gpuPrice })) {
            bottlenecks.push(ROAST_LOGIC.bottlenecks.cpu_bottleneck.roast.replace('${gpu}', gpu.name).replace('${cpu}', cpu.name));
            score -= 20;
        } else if (ROAST_LOGIC.bottlenecks.gpu_bottleneck.check({ price: cpuPrice }, { price: gpuPrice })) {
            bottlenecks.push(ROAST_LOGIC.bottlenecks.gpu_bottleneck.roast.replace('${gpu}', gpu.name).replace('${cpu}', cpu.name));
            score -= 15;
        } else {
            pros.push(`Excellent balance between your ${cpu.name} and ${gpu.name}.`);
            score += 10;
        }

        // RAM check
        if (parts.ram) {
            const ramName = (parts.ram.name || '').toLowerCase();
            const ramMatch = ramName.match(/(\d+)\s*gb/);
            const ramSize = ramMatch ? parseInt(ramMatch[1]) : 16;
            if (ramSize < 16) {
                cons.push('8GB of RAM is tight for 2024. 16GB is the minimum for gaming.');
                score -= 10;
            } else if (ramSize >= 32) {
                pros.push('32GB+ of RAM provides massive headroom for multitasking.');
                score += 5;
            }
        }

        // PSU check
        if (parts.psu) {
            const totalCost = Object.values(parts).reduce((sum, p) => sum + (p?.price || 0), 0);
            if (totalCost > 2000 && (parts.psu.price || 0) < 80) {
                cons.push(ROAST_LOGIC.badValue.cheap_psu.roast);
                score -= 15;
            }
        }

        // Part count bonus
        const partCount = Object.values(parts).filter(Boolean).length;
        if (partCount >= 7) {
            pros.push('Complete build with all essential components selected.');
            score += 5;
        } else if (partCount < 5) {
            cons.push(`Only ${partCount} parts selected. Consider adding more components for a full review.`);
        }

        score = Math.min(100, Math.max(0, score));

        const scoreColor = score >= 85 ? '#4ade80' : score >= 70 ? '#facc15' : '#f87171';
        const summaryText = score >= 85
            ? "Stunning build! Premium, balanced components."
            : score >= 70
                ? "Solid mid-range build with good foundations."
                : "This build needs optimization. Check the issues below.";

        return { score, scoreColor, summaryText, pros, cons, bottlenecks };
    };

    const review = calculateReview();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} />

                <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgSecondary }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>AI Full Build Review</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {!hasBase ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="construct-outline" size={64} color={theme.colors.textMuted} />
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    Add at least a CPU and GPU to see a full AI review of your build.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.content}>
                                {/* Score Display */}
                                <GlassCard style={styles.scoreCard}>
                                    <View style={[styles.scoreCircle, { borderColor: review.scoreColor, backgroundColor: review.scoreColor + '15' }]}>
                                        <Text style={[styles.scoreNumber, { color: review.scoreColor }]}>{review.score}</Text>
                                        <Text style={{ fontSize: 10, color: theme.colors.textMuted }}>/100</Text>
                                    </View>
                                    <Text style={[styles.summaryText, { color: theme.colors.textPrimary }]}>{review.summaryText}</Text>
                                </GlassCard>

                                {/* Review Sections */}
                                <View style={styles.sections}>
                                    {review.pros.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: '#4ade80' }]}>✅ Pros</Text>
                                            {review.pros.map((pro, i) => (
                                                <View key={i} style={styles.bulletItem}>
                                                    <Text style={[styles.bullet, { color: theme.colors.textSecondary }]}>• {pro}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {review.cons.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: '#facc15' }]}>⚠️ Potential Issues</Text>
                                            {review.cons.map((con, i) => (
                                                <View key={i} style={styles.bulletItem}>
                                                    <Text style={[styles.bullet, { color: theme.colors.textSecondary }]}>• {con}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {review.bottlenecks.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={[styles.sectionTitle, { color: '#f87171' }]}>🔥 Bottlenecks</Text>
                                            {review.bottlenecks.map((bn, i) => (
                                                <View key={i} style={styles.bulletItem}>
                                                    <Text style={[styles.bullet, { color: theme.colors.textSecondary }]}>• {bn}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {/* Recommendations Info */}
                                <GlassCard style={styles.infoCard}>
                                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.accentPrimary} />
                                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                                        This review is generated based on hardware specifications, price ratios, and known performance data. Always verify compatibility with manufacturer documentation.
                                    </Text>
                                </GlassCard>
                            </View>
                        )}
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: theme.colors.glassBorder }]}>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={theme.gradients.primary}
                                style={styles.doneButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.doneButtonText}>Got it!</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: height * 0.75,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
    scoreCard: {
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
    scoreCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreNumber: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    sections: {
        gap: 24,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bulletItem: {
        flexDirection: 'row',
        paddingLeft: 4,
    },
    bullet: {
        fontSize: 14,
        lineHeight: 22,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    doneButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    doneButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AIReviewModal;
