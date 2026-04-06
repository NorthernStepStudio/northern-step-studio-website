import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    ActivityIndicator, Alert, TouchableOpacity, Platform, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { API_CONFIG } from '../core/config';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import GameDetailModal from '../components/GameDetailModal';

const GAME_GENRES = ['FPS', 'RPG', 'Battle Royale', 'MOBA', 'Sandbox', 'Strategy', 'Racing', 'Sports', 'Simulation'];

const GameLibraryScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [filteredGames, setFilteredGames] = useState([]);
    const [activeGenre, setActiveGenre] = useState(null);
    const [detailGame, setDetailGame] = useState(null); // For detail modal

    useEffect(() => {
        fetchGames();
    }, []);

    useEffect(() => {
        let result = games;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(g => g.title.toLowerCase().includes(lower));
        }
        if (activeGenre) {
            result = result.filter(g => g.genre === activeGenre);
        }
        setFilteredGames(result);
    }, [search, activeGenre, games]);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${API_CONFIG.baseUrl}/library/games`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                setGames(data);
                setFilteredGames(data);
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            const mockGames = [
                { id: 'g1', title: 'Cyberpunk 2077', genre: 'RPG', tags: ['AAA', 'Ray Tracing'], performance: 'GPU Heavy' },
                { id: 'g2', title: 'Valorant', genre: 'FPS', tags: ['Esports'], performance: 'CPU Bound' },
                { id: 'g3', title: 'Elden Ring', genre: 'RPG', tags: ['AAA', 'Open World'], performance: 'Balanced' },
                { id: 'g4', title: 'Minecraft (Modded)', genre: 'Sandbox', tags: ['Modded'], performance: 'RAM Heavy' },
                { id: 'g5', title: 'Counter-Strike 2', genre: 'FPS', tags: ['Esports'], performance: 'CPU Heavy' },
                { id: 'g6', title: 'Fortnite', genre: 'Battle Royale', tags: ['Cross-play'], performance: 'Balanced' },
                { id: 'g7', title: 'League of Legends', genre: 'MOBA', tags: ['Esports'], performance: 'CPU Bound' },
                { id: 'g8', title: 'Flight Simulator', genre: 'Simulation', tags: ['VR'], performance: 'CPU/RAM Heavy' },
            ];
            setGames(mockGames);
            setFilteredGames(mockGames);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = useCallback((item) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(item.id) ? next.delete(item.id) : next.add(item.id);
            return next;
        });
    }, []);

    const savePreferences = async () => {
        try {
            await fetch(`${API_CONFIG.baseUrl}/profile/preferences`, {
                method: 'POST',
                headers: API_CONFIG.headers,
                body: JSON.stringify({ games: Array.from(selectedIds) })
            });
            Alert.alert('Saved', 'Your gaming preferences have been saved!');
        } catch {
            Alert.alert('Error', 'Failed to save preferences.');
        }
    };

    const getPerformanceColor = (perf) => {
        if (perf?.toLowerCase().includes('gpu')) return '#E91E63';
        if (perf?.toLowerCase().includes('cpu')) return '#2196F3';
        if (perf?.toLowerCase().includes('ram')) return '#FF9800';
        return '#4CAF50';
    };

    const renderGame = ({ item }) => {
        const isSelected = selectedIds.has(item.id);
        return (
            <TouchableOpacity onPress={() => setDetailGame(item)} activeOpacity={0.8}>
                <GlassCard style={[styles.gameCard, isSelected && { borderColor: theme.colors.accentPrimary, borderWidth: 2 }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleRow}>
                            <Text style={[styles.gameTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                            <TouchableOpacity onPress={() => toggleSelection(item)} style={[styles.checkBadge, { backgroundColor: isSelected ? theme.colors.accentPrimary : theme.colors.bgTertiary }]}>
                                <Ionicons name={isSelected ? "checkmark" : "add"} size={14} color={isSelected ? '#fff' : theme.colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.gameGenre, { color: theme.colors.textMuted }]}>{item.genre}</Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={[styles.perfBadge, { backgroundColor: getPerformanceColor(item.performance) + '20' }]}>
                            <Ionicons name="speedometer-outline" size={14} color={getPerformanceColor(item.performance)} />
                            <Text style={[styles.perfText, { color: getPerformanceColor(item.performance) }]}>{item.performance}</Text>
                        </View>
                        {item.tags?.slice(0, 2).map((tag, i) => (
                            <View key={i} style={[styles.tagBadge, { backgroundColor: theme.colors.bgTertiary }]}>
                                <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </GlassCard>
            </TouchableOpacity>
        );
    };

    const renderListHeader = () => (
        <View style={styles.listHeader}>
            {/* Hero Section */}
            <LinearGradient colors={['#8B5CF620', 'transparent']} style={styles.heroGlow} />
            <View style={styles.heroSection}>
                <View style={styles.heroIcon}>
                    <Ionicons name="game-controller" size={40} color="#8B5CF6" />
                </View>
                <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>Gaming Library</Text>
                <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                    Select the games you play to optimize your PC build recommendations.
                </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.accentPrimary }]}>{games.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Games</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.glassBorder }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{selectedIds.size}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Selected</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.glassBorder }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{GAME_GENRES.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Genres</Text>
                </View>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.glassBorder }]}>
                <Ionicons name="search" size={20} color={theme.colors.textMuted} />
                <TextInput
                    placeholder="Search games..."
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Genre Chips */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={['All', ...GAME_GENRES]}
                keyExtractor={item => item}
                contentContainerStyle={styles.chipList}
                renderItem={({ item }) => {
                    const isActive = activeGenre === item || (item === 'All' && activeGenre === null);
                    return (
                        <TouchableOpacity
                            onPress={() => setActiveGenre(item === 'All' ? null : item)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isActive ? '#8B5CF6' : theme.colors.bgSecondary,
                                    borderColor: isActive ? '#8B5CF6' : theme.colors.glassBorder
                                }
                            ]}
                        >
                            <Text style={[styles.chipText, { color: isActive ? '#fff' : theme.colors.textSecondary }]}>{item}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
                {filteredGames.length} {filteredGames.length === 1 ? 'GAME' : 'GAMES'} {activeGenre ? `IN ${activeGenre.toUpperCase()}` : 'AVAILABLE'}
            </Text>
        </View>
    );

    if (loading && games.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.bgPrimary }]}>
                <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
                <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading games...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]} edges={['top']}>
            <Header navigation={navigation} />
            <FlatList
                data={filteredGames}
                keyExtractor={item => item.id}
                renderItem={renderGame}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={<View style={{ height: 120 }} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Floating Save Button */}
            {selectedIds.size > 0 && (
                <TouchableOpacity style={styles.floatingButton} onPress={savePreferences}>
                    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.floatingGradient}>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={styles.floatingText}>Save {selectedIds.size} Games</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* Game Detail Modal */}
            <GameDetailModal
                visible={!!detailGame}
                game={detailGame}
                onClose={() => setDetailGame(null)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    listContent: { paddingHorizontal: 16 },
    listHeader: { marginBottom: 16 },

    // Hero
    heroGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, borderRadius: 20 },
    heroSection: { alignItems: 'center', paddingVertical: 24 },
    heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8B5CF620', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    heroTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    heroSubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

    // Stats
    statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20, paddingHorizontal: 24 },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    statLabel: { fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, height: 30 },

    // Search
    searchBar: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },

    // Chips
    chipList: { paddingBottom: 16 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10 },
    chipText: { fontSize: 13, fontWeight: '600' },

    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },

    // Game Card
    gameCard: { marginBottom: 12, padding: 16 },
    cardHeader: { marginBottom: 12 },
    cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    gameTitle: { fontSize: 17, fontWeight: '700', flex: 1 },
    checkBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    gameGenre: { fontSize: 13, marginTop: 4 },
    cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    perfBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 6 },
    perfText: { fontSize: 12, fontWeight: '600' },
    tagBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    tagText: { fontSize: 12 },
    buyBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },

    // Floating Button
    floatingButton: { position: 'absolute', bottom: 30, left: 20, right: 20 },
    floatingGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 10, ...Platform.select({ ios: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 }, android: { elevation: 8 } }) },
    floatingText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default GameLibraryScreen;
