/**
 * GameDetailModal - Shows game details with description and purchase links
 */
import React from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';

const { height } = Dimensions.get('window');

const GameDetailModal = ({ visible, game, onClose }) => {
    const { theme } = useTheme();

    if (!game) return null;

    const getPerformanceColor = (perf) => {
        if (perf?.toLowerCase().includes('gpu')) return '#E91E63';
        if (perf?.toLowerCase().includes('cpu')) return '#2196F3';
        if (perf?.toLowerCase().includes('ram')) return '#FF9800';
        return '#4CAF50';
    };

    const handleBuyOnSteam = () => {
        const steamUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`;
        Linking.openURL(steamUrl);
    };

    const handleBuyOnEpic = () => {
        const epicUrl = `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(game.title)}`;
        Linking.openURL(epicUrl);
    };

    const handleBuyOnGOG = () => {
        const gogUrl = `https://www.gog.com/games?query=${encodeURIComponent(game.title)}`;
        Linking.openURL(gogUrl);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />

                <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgSecondary }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.glassBorder }]}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Game Details</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Game Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.glassBg }]}>
                            <Ionicons name="game-controller" size={64} color="#8B5CF6" />
                        </View>

                        {/* Game Info */}
                        <View style={styles.infoSection}>
                            <Text style={[styles.gameTitle, { color: theme.colors.textPrimary }]}>
                                {game.title}
                            </Text>

                            <Text style={[styles.gameGenre, { color: theme.colors.textSecondary }]}>
                                {game.genre}
                            </Text>

                            {/* Performance Badge */}
                            <View style={[styles.perfBadge, { backgroundColor: getPerformanceColor(game.performance) + '20' }]}>
                                <Ionicons name="speedometer-outline" size={18} color={getPerformanceColor(game.performance)} />
                                <Text style={[styles.perfText, { color: getPerformanceColor(game.performance) }]}>
                                    {game.performance}
                                </Text>
                            </View>

                            {/* Tags */}
                            {game.tags && game.tags.length > 0 && (
                                <View style={styles.tagsRow}>
                                    {game.tags.map((tag, i) => (
                                        <View key={i} style={[styles.tagBadge, { backgroundColor: theme.colors.bgTertiary }]}>
                                            <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Description */}
                            <GlassCard style={styles.descCard}>
                                <Text style={[styles.descTitle, { color: theme.colors.textPrimary }]}>About This Game</Text>
                                <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
                                    {game.description || `${game.title} is a popular ${game.genre} game. Check out the stores below to purchase and start playing!`}
                                </Text>
                            </GlassCard>

                            {/* System Requirements Hint */}
                            <GlassCard style={styles.reqCard}>
                                <View style={styles.reqHeader}>
                                    <Ionicons name="hardware-chip-outline" size={20} color={theme.colors.accentPrimary} />
                                    <Text style={[styles.reqTitle, { color: theme.colors.textPrimary }]}>Performance Profile</Text>
                                </View>
                                <Text style={[styles.reqText, { color: theme.colors.textSecondary }]}>
                                    This game is classified as "{game.performance}".
                                    {game.performance?.toLowerCase().includes('gpu') && " A powerful graphics card is recommended."}
                                    {game.performance?.toLowerCase().includes('cpu') && " A fast multi-core CPU is recommended."}
                                    {game.performance?.toLowerCase().includes('ram') && " 32GB+ RAM is recommended for optimal performance."}
                                    {game.performance?.toLowerCase().includes('balanced') && " A well-balanced system will run this game smoothly."}
                                </Text>
                            </GlassCard>

                            {/* Purchase Links */}
                            <View style={styles.purchaseSection}>
                                <Text style={[styles.purchaseTitle, { color: theme.colors.textPrimary }]}>
                                    Where to Buy
                                </Text>

                                {/* Steam */}
                                <TouchableOpacity
                                    style={[styles.storeCard, { backgroundColor: '#171A2120', borderColor: '#171A21' }]}
                                    onPress={handleBuyOnSteam}
                                >
                                    <View style={styles.storeInfo}>
                                        <Ionicons name="logo-steam" size={24} color="#66C0F4" />
                                        <View>
                                            <Text style={[styles.storeName, { color: theme.colors.textPrimary }]}>Steam</Text>
                                            <Text style={[styles.storeSubtext, { color: theme.colors.textMuted }]}>Most popular PC platform</Text>
                                        </View>
                                    </View>
                                    <View style={styles.goButton}>
                                        <Text style={[styles.goText, { color: '#66C0F4' }]}>Visit</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#66C0F4" />
                                    </View>
                                </TouchableOpacity>

                                {/* Epic Games */}
                                <TouchableOpacity
                                    style={[styles.storeCard, { backgroundColor: '#2A2A2A20', borderColor: '#2A2A2A' }]}
                                    onPress={handleBuyOnEpic}
                                >
                                    <View style={styles.storeInfo}>
                                        <Ionicons name="logo-xbox" size={24} color="#fff" />
                                        <View>
                                            <Text style={[styles.storeName, { color: theme.colors.textPrimary }]}>Epic Games</Text>
                                            <Text style={[styles.storeSubtext, { color: theme.colors.textMuted }]}>Often has free games</Text>
                                        </View>
                                    </View>
                                    <View style={styles.goButton}>
                                        <Text style={[styles.goText, { color: theme.colors.accentPrimary }]}>Visit</Text>
                                        <Ionicons name="arrow-forward" size={16} color={theme.colors.accentPrimary} />
                                    </View>
                                </TouchableOpacity>

                                {/* GOG */}
                                <TouchableOpacity
                                    style={[styles.storeCard, { backgroundColor: '#86328A20', borderColor: '#86328A' }]}
                                    onPress={handleBuyOnGOG}
                                >
                                    <View style={styles.storeInfo}>
                                        <Ionicons name="game-controller-outline" size={24} color="#86328A" />
                                        <View>
                                            <Text style={[styles.storeName, { color: theme.colors.textPrimary }]}>GOG</Text>
                                            <Text style={[styles.storeSubtext, { color: theme.colors.textMuted }]}>DRM-free games</Text>
                                        </View>
                                    </View>
                                    <View style={styles.goButton}>
                                        <Text style={[styles.goText, { color: '#86328A' }]}>Visit</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#86328A" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Buy Button */}
                    <View style={[styles.footer, { backgroundColor: theme.colors.bgSecondary, borderTopColor: theme.colors.glassBorder }]}>
                        <TouchableOpacity
                            style={[styles.buyButton, { backgroundColor: '#66C0F4' }]}
                            onPress={handleBuyOnSteam}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-steam" size={20} color="white" />
                            <Text style={styles.buyButtonText}>Buy on Steam</Text>
                            <Ionicons name="open-outline" size={18} color="white" />
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
        height: height * 0.85,
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
    iconContainer: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoSection: {
        padding: 20,
        gap: 16,
    },
    gameTitle: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    gameGenre: {
        fontSize: 16,
    },
    perfBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 8,
    },
    perfText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 13,
    },
    descCard: {
        padding: 16,
        gap: 8,
    },
    descTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    descText: {
        fontSize: 14,
        lineHeight: 22,
    },
    reqCard: {
        padding: 16,
        gap: 10,
    },
    reqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    reqTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    reqText: {
        fontSize: 13,
        lineHeight: 20,
    },
    purchaseSection: {
        marginTop: 8,
        gap: 12,
    },
    purchaseTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    storeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    storeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '600',
    },
    storeSubtext: {
        fontSize: 12,
    },
    goButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    goText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
    },
    buyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
    },
    buyButtonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default GameDetailModal;
