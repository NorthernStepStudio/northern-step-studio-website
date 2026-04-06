import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { theme } from '../constants/theme';
import { DICTIONARY, DictionaryEntry } from '../data/dictionary';
import { isProUser } from '../storage/subscription';

export default function Glossary() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isPro, setIsPro] = useState(false);
    const flatListRef = useRef<FlatList<DictionaryEntry>>(null);

    useEffect(() => {
        isProUser().then(setIsPro);
    }, []);

    const filtered = useMemo(() => {
        const results = DICTIONARY.filter(entry => {
            const matchesSearch = entry.term.toLowerCase().includes(search.toLowerCase()) ||
                entry.noobsTruth.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory ? entry.category === selectedCategory : true;
            return matchesSearch && matchesCategory;
        });

        // Sort: Free entries first, Pro entries second
        return results.sort((a, b) => {
            const aIsPro = a.isPro ? 1 : 0;
            const bIsPro = b.isPro ? 1 : 0;

            // For "All" view: Free first across all categories, then Pro across all categories
            // For specific category: Free first, then Pro (already filtered to one category)
            if (aIsPro !== bIsPro) {
                return aIsPro - bIsPro; // Free (0) before Pro (1)
            }

            // Within same free/pro group, sort by category
            return a.category.localeCompare(b.category);
        });
    }, [search, selectedCategory]);

    const categories = ['All', 'Brand', 'Asset', 'Strategy', 'Psychology', 'Market', 'Acronym'];

    // Count free vs pro
    const freeCount = filtered.filter(e => !e.isPro).length;
    const proCount = filtered.filter(e => e.isPro).length;

    const renderEntry = ({ item }: { item: DictionaryEntry }) => {
        const isLocked = item.isPro && !isPro;

        return (
            <View style={[styles.card, isLocked && { opacity: 0.7 }]}>
                <View style={styles.header}>
                    <View style={styles.termContainer}>
                        <Text style={styles.term}>{item.term}</Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                            {item.isPro && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.accent + '30' }]}>
                                    <Text style={[styles.badgeText, { color: theme.colors.accent }]}>
                                        PRO
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.badge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                                <Text style={[styles.badgeText, { color: getCategoryColor(item.category) }]}>
                                    {item.category}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {item.straightTalk && (
                    <View style={{ marginBottom: 16 }}>
                        <Text style={styles.straightTalkText}>
                            Straight Talk: <Text style={{ fontWeight: '900', color: theme.colors.text }}>{item.straightTalk}</Text>
                        </Text>
                    </View>
                )}

                {isLocked ? (
                    <View style={styles.lockedContent}>
                        <MaterialCommunityIcons name="lock" size={24} color={theme.colors.accent} />
                        <Text style={styles.lockedText}>Upgrade to Pro for the NooBS Truth</Text>
                        <Text style={styles.lockedSubtext}>The slick version is free. The real talk is Pro.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>THE SLICK VERSION</Text>
                            <Text style={styles.slickText}>{item.slickVersion}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <View style={styles.labelWithIcon}>
                                <MaterialCommunityIcons name="lightning-bolt" size={14} color={theme.colors.accent} />
                                <Text style={[styles.sectionLabel, { color: theme.colors.accent }]}>THE NooBS TRUTH</Text>
                            </View>
                            <Text style={styles.truthText}>{item.noobsTruth}</Text>
                        </View>
                    </>
                )}
            </View>
        );
    };

    return (
        <Screen safeTop={true} scroll={false}>
            <View style={styles.topNav}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.title}>NooBS Dictionary</Text>
            </View>

            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.muted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search jargon..."
                    placeholderTextColor={theme.colors.muted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={{ marginBottom: 16 }}>
                <FlatList
                    horizontal
                    data={categories}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingHorizontal: 0 }}
                    keyExtractor={item => item}
                    renderItem={({ item }) => {
                        const isSelected = item === 'All' ? selectedCategory === null : selectedCategory === item;
                        return (
                            <Pressable
                                onPress={() => {
                                    setSelectedCategory(item === 'All' ? null : item);
                                    // Scroll to top when changing category
                                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                                }}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: isSelected ? theme.colors.text : theme.colors.card,
                                    borderWidth: 1,
                                    borderColor: isSelected ? theme.colors.text : theme.colors.border
                                }}
                            >
                                <Text style={{
                                    color: isSelected ? theme.colors.bg : theme.colors.text,
                                    fontWeight: '700',
                                    fontSize: 13
                                }}>
                                    {item}
                                </Text>
                            </Pressable>
                        );
                    }}
                />
            </View>

            <FlatList
                ref={flatListRef}
                data={filtered}
                renderItem={renderEntry}
                keyExtractor={item => item.term}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                style={{ flex: 1 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="robot-confused-outline" size={48} color={theme.colors.muted} />
                        <Text style={styles.emptyText}>No jargon found. Maybe we haven't debunked it yet.</Text>
                    </View>
                }
            />
        </Screen>
    );
}

function getCategoryColor(category: string) {
    switch (category) {
        case 'Asset': return '#4ADE80';
        case 'Strategy': return '#60A5FA';
        case 'Psychology': return '#F472B6';
        case 'Market': return '#FB923C';
        case 'Acronym': return '#A78BFA';
        case 'Brand': return '#FACC15'; // Vibrant Gold for Brand Identity
        default: return theme.colors.muted;
    }
}

const styles = StyleSheet.create({
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: theme.colors.text,
        letterSpacing: -0.5
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 24
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600'
    },
    listContent: {
        paddingBottom: 40
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    header: {
        marginBottom: 20
    },
    termContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12
    },
    term: {
        fontSize: 20,
        fontWeight: '900',
        color: theme.colors.text,
        flex: 1
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    section: {
        gap: 8
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: theme.colors.muted,
        letterSpacing: 0.5
    },
    labelWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    slickText: {
        fontSize: 15,
        color: theme.colors.muted,
        lineHeight: 22,
        fontWeight: '500'
    },
    truthText: {
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 24,
        fontWeight: '700'
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 16,
        opacity: 0.5
    },
    straightTalkText: {
        fontSize: 14,
        color: theme.colors.muted,
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 20
    },
    empty: {
        padding: 40,
        alignItems: 'center',
        gap: 12
    },
    emptyText: {
        color: theme.colors.muted,
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16
    },
    lockedContent: {
        alignItems: 'center',
        padding: 24,
        gap: 8
    },
    lockedText: {
        color: theme.colors.accent,
        fontSize: 15,
        fontWeight: '800',
        textAlign: 'center'
    },
    lockedSubtext: {
        color: theme.colors.muted,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center'
    }
});
