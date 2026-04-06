import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    ActivityIndicator, Alert, TouchableOpacity, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { API_CONFIG } from '../core/config';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import SoftwareDetailModal from '../components/SoftwareDetailModal';

const WORKSTATION_CATEGORIES = ['Video Editing', '3D Modeling', 'Programming', 'AI/ML', 'Streaming', 'Audio', 'CAD'];

const WorkstationLibraryScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [filteredTools, setFilteredTools] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [detailSoftware, setDetailSoftware] = useState(null); // For detail modal

    useEffect(() => {
        fetchTools();
    }, []);

    useEffect(() => {
        let result = tools;
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(t => t.name.toLowerCase().includes(lower));
        }
        if (activeCategory) {
            result = result.filter(t => t.category === activeCategory);
        }
        setFilteredTools(result);
    }, [search, activeCategory, tools]);

    const fetchTools = async () => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${API_CONFIG.baseUrl}/library/tools`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                setTools(data);
                setFilteredTools(data);
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            const mockTools = [
                { id: 't1', name: 'Adobe Premiere Pro', category: 'Video Editing', focus: 'CPU + RAM', notes: 'NVENC helpful for exports' },
                { id: 't2', name: 'DaVinci Resolve', category: 'Video Editing', focus: 'GPU VRAM', notes: 'Heavy GPU reliance' },
                { id: 't3', name: 'Blender', category: '3D Modeling', focus: 'GPU Compute', notes: 'CUDA/OptiX preferred' },
                { id: 't4', name: 'Visual Studio Code', category: 'Programming', focus: 'RAM + CPU', notes: 'Lightweight, scalable' },
                { id: 't5', name: 'Stable Diffusion', category: 'AI/ML', focus: 'High VRAM', notes: 'NVIDIA GPU recommended' },
                { id: 't6', name: 'OBS Studio', category: 'Streaming', focus: 'Encoder', notes: 'NVENC/AV1 support crucial' },
                { id: 't7', name: 'Unreal Engine 5', category: '3D Modeling', focus: 'GPU + RAM', notes: 'Compile times love cores' },
                { id: 't8', name: 'AutoCAD', category: 'CAD', focus: 'Single-core CPU', notes: 'High frequency needed' },
            ];
            setTools(mockTools);
            setFilteredTools(mockTools);
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
                body: JSON.stringify({ tools: Array.from(selectedIds) })
            });
            Alert.alert('Saved', 'Your workstation preferences have been saved!');
        } catch {
            Alert.alert('Error', 'Failed to save preferences.');
        }
    };

    const getFocusColor = (focus) => {
        if (focus?.toLowerCase().includes('gpu')) return '#9C27B0';
        if (focus?.toLowerCase().includes('vram')) return '#E91E63';
        if (focus?.toLowerCase().includes('cpu')) return '#2196F3';
        if (focus?.toLowerCase().includes('ram')) return '#FF9800';
        return '#10B981';
    };

    const getFocusIcon = (focus) => {
        if (focus?.toLowerCase().includes('gpu') || focus?.toLowerCase().includes('vram')) return 'hardware-chip';
        if (focus?.toLowerCase().includes('cpu')) return 'speedometer';
        if (focus?.toLowerCase().includes('ram')) return 'albums';
        return 'options';
    };

    const renderTool = ({ item }) => {
        const isSelected = selectedIds.has(item.id);
        return (
            <TouchableOpacity onPress={() => setDetailSoftware(item)} activeOpacity={0.8}>
                <GlassCard style={[styles.toolCard, isSelected && { borderColor: theme.colors.accentPrimary, borderWidth: 2 }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.toolIcon, { backgroundColor: getFocusColor(item.focus) + '20' }]}>
                            <Ionicons name={getFocusIcon(item.focus)} size={24} color={getFocusColor(item.focus)} />
                        </View>
                        <View style={styles.toolInfo}>
                            <View style={styles.cardTitleRow}>
                                <Text style={[styles.toolName, { color: theme.colors.textPrimary }]}>{item.name}</Text>
                                <TouchableOpacity onPress={() => toggleSelection(item)} style={[styles.checkBadge, { backgroundColor: isSelected ? theme.colors.accentPrimary : theme.colors.bgTertiary }]}>
                                    <Ionicons name={isSelected ? "checkmark" : "add"} size={14} color={isSelected ? '#fff' : theme.colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.toolCategory, { color: theme.colors.textMuted }]}>{item.category}</Text>
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={[styles.focusBadge, { backgroundColor: getFocusColor(item.focus) + '20' }]}>
                            <Ionicons name="flash" size={12} color={getFocusColor(item.focus)} />
                            <Text style={[styles.focusText, { color: getFocusColor(item.focus) }]}>{item.focus}</Text>
                        </View>
                    </View>

                    {item.notes && (
                        <View style={[styles.notesContainer, { backgroundColor: theme.colors.bgTertiary + '40' }]}>
                            <Ionicons name="information-circle-outline" size={14} color={theme.colors.textMuted} />
                            <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>{item.notes}</Text>
                        </View>
                    )}
                </GlassCard>
            </TouchableOpacity>
        );
    };

    const renderListHeader = () => (
        <View style={styles.listHeader}>
            {/* Hero Section */}
            <LinearGradient colors={['#10B98120', 'transparent']} style={styles.heroGlow} />
            <View style={styles.heroSection}>
                <View style={styles.heroIcon}>
                    <Ionicons name="desktop" size={40} color="#10B981" />
                </View>
                <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>Workstation Tools</Text>
                <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                    Select your professional software stack to get hardware recommendations tailored to your workflow.
                </Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.accentPrimary }]}>{tools.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Tools</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.glassBorder }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{selectedIds.size}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Selected</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.glassBorder }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#9C27B0' }]}>{WORKSTATION_CATEGORIES.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Categories</Text>
                </View>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.glassBorder }]}>
                <Ionicons name="search" size={20} color={theme.colors.textMuted} />
                <TextInput
                    placeholder="Search tools (e.g. Blender)..."
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

            {/* Category Chips */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={['All', ...WORKSTATION_CATEGORIES]}
                keyExtractor={item => item}
                contentContainerStyle={styles.chipList}
                renderItem={({ item }) => {
                    const isActive = activeCategory === item || (item === 'All' && activeCategory === null);
                    return (
                        <TouchableOpacity
                            onPress={() => setActiveCategory(item === 'All' ? null : item)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isActive ? '#10B981' : theme.colors.bgSecondary,
                                    borderColor: isActive ? '#10B981' : theme.colors.glassBorder
                                }
                            ]}
                        >
                            <Text style={[styles.chipText, { color: isActive ? '#fff' : theme.colors.textSecondary }]}>{item}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
                {filteredTools.length} {filteredTools.length === 1 ? 'TOOL' : 'TOOLS'} {activeCategory ? `IN ${activeCategory.toUpperCase()}` : 'AVAILABLE'}
            </Text>
        </View>
    );

    if (loading && tools.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.bgPrimary }]}>
                <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
                <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading tools...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]} edges={['top']}>
            <Header navigation={navigation} />
            <FlatList
                data={filteredTools}
                keyExtractor={item => item.id}
                renderItem={renderTool}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={<View style={{ height: 120 }} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Floating Save Button */}
            {selectedIds.size > 0 && (
                <TouchableOpacity style={styles.floatingButton} onPress={savePreferences}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.floatingGradient}>
                        <Ionicons name="save-outline" size={20} color="#fff" />
                        <Text style={styles.floatingText}>Save {selectedIds.size} Tools</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            {/* Software Detail Modal */}
            <SoftwareDetailModal
                visible={!!detailSoftware}
                software={detailSoftware}
                onClose={() => setDetailSoftware(null)}
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
    heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B98120', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    heroTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    heroSubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },

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

    // Tool Card
    toolCard: { marginBottom: 12, padding: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    toolIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    toolInfo: { flex: 1 },
    cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    toolName: { fontSize: 17, fontWeight: '700', flex: 1 },
    checkBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    toolCategory: { fontSize: 13, marginTop: 2 },
    cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    focusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 6 },
    focusText: { fontSize: 12, fontWeight: '600' },
    notesContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, gap: 8 },
    notesText: { fontSize: 12, flex: 1 },

    // Floating Button
    floatingButton: { position: 'absolute', bottom: 30, left: 20, right: 20 },
    floatingGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 10, ...Platform.select({ ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 }, android: { elevation: 8 } }) },
    floatingText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default WorkstationLibraryScreen;
