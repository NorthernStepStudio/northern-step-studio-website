import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, ScrollView, Dimensions, Modal, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onScrollToTop } from '../../utils/scrollEvents';
import { theme } from '../../constants/theme';
import { Screen } from '../../components/Screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDiscoveryFeed, getSentiment, voteSentiment, DiscoveryItem, SentimentData } from '../../storage/discovery';
import { getUserResidency, ResidencyInfo } from '../../storage/residency';
import Animated, { FadeInDown, FadeInUp, FadeInRight, useAnimatedStyle, withRepeat, withTiming, useSharedValue, withSequence, useAnimatedScrollHandler, interpolate, Extrapolation } from 'react-native-reanimated';
import { useI18n } from '../../i18n';

const { width } = Dimensions.get('window');

function PulseRing({ delay = 0, duration = 2000, scale = 1.5 }: { delay?: number, duration?: number, scale?: number }) {
    const ring = useSharedValue(0);
    const opacity = useSharedValue(1);

    React.useEffect(() => {
        ring.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 0 }),
                withTiming(1, { duration: delay }), // Wait
                withTiming(1, { duration: duration }) // Expand
            ),
            -1,
            false
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 0 }),
                withTiming(1, { duration: delay }), // Wait
                withTiming(0, { duration: duration }) // Fade out
            ),
            -1,
            false
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + ring.value * scale }],
        opacity: opacity.value * 0.5
    }));

    return <Animated.View style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.danger }, style]} />;
}

function LiveIndicator() {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.danger }} />
                <PulseRing delay={0} scale={2} />
                <PulseRing delay={600} scale={3} />
            </View>
            <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 }}>LIVE SONAR</Text>
        </View>
    );
}

const GLOBAL_STAGES = [
    {
        id: 'NOOB_GROUND',
        name: "NooB Ground",
        icon: "sprout",
        count: 1245,
        color: theme.colors.danger,
        headline: "The Survival Camp",
        desc: "Entry level. Prove your discipline before the market eats you alive.",
        rules: [
            "Avoid expensive 'NooB Tax' mutual funds",
            "Commit to a monthly contribution goal",
            "Learn the basics of the Boglehead philosophy"
        ],
        perks: [
            "Access to Basic Learning Path",
            "Global Mood Voting rights",
            "Daily 'Truth Nudges'"
        ],
        occupants: ['Paper_Hands_Bob', 'Learn2Earn', 'Steady_Eddy', 'ChartReader', 'NooB_Max']
    },
    {
        id: 'CORE_RESIDENCY',
        name: "Core Residency",
        icon: "shield-star",
        count: 742,
        color: theme.colors.accent,
        headline: "The Foundation Fortress",
        desc: "Building the baseline. Master of the 'ONE Thing' strategy.",
        rules: [
            "Maintain >90% adherence to Strategic Mix",
            "Complete all 20 Core Learning lessons",
            "Pass the Truth Stress-Test once"
        ],
        perks: [
            "Unlock Advanced Analytics",
            "Real Mode Trade Thesis broadcasting",
            "Drift/Rebalancing autopilot alerts"
        ],
        occupants: ['Index_King', 'VTI_Viking', 'NoNooBTax', 'SteadyState', 'Compounder']
    },
    {
        id: 'INCOME_HARVESTING',
        name: "Income Harvesting",
        icon: "bank",
        count: 89,
        color: theme.colors.success,
        headline: "The Golden Hall",
        desc: "Elite status. Reaping the rewards of lifelong preservation.",
        rules: [
            "Simulated Yield must cover basic lifestyle",
            "Zero panic sells during 'Black Swan' events",
            "Active Northern Step Elite Membership"
        ],
        perks: [
            "Infinite Market Simulation shifts",
            "Priority Hall of Fame listing",
            "Strategic Income Lab access"
        ],
        occupants: ['CryptoWiz_99', 'Dividend_Queen', 'HarvestMaster', 'YieldLord', 'FireFly']
    },
];

const HALL_OF_FAME = [
    { name: 'CryptoWiz_99', stage: 'Income Harvesting', achievement: '3 Year HODL', icon: 'crown' },
    { name: 'VTI_Viking', stage: 'Income Harvesting', achievement: 'Max Diversification', icon: 'shield-check' },
    { name: 'Dividend_Queen', stage: 'Income Harvesting', achievement: '$10k/year Simulated Yield', icon: 'cash-multiple' },
    { name: 'NoNooBTax', stage: 'Core Residency', achievement: '0% Panic Sell Ratio', icon: 'fire' },
];

function HallDetailModal({ hall, visible, onClose }: { hall: any, visible: boolean, onClose: () => void }) {
    if (!hall) return null;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 16 }}>
                <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} />

                <Animated.View
                    entering={FadeInUp.springify().damping(12)}
                    style={{
                        backgroundColor: theme.colors.card,
                        borderRadius: 4,
                        maxHeight: '85%',
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: hall.color + '60'
                    }}
                >
                    {/* DOSSIER HEADER */}
                    <View style={{ backgroundColor: hall.color + '10', padding: 24, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: hall.color + '30' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.7 }}>
                                <MaterialCommunityIcons name="folder-account" size={16} color={hall.color} />
                                <Text style={{ color: hall.color, fontSize: 10, fontWeight: '900', letterSpacing: 2 }}>CLASSIFIED DOSSIER</Text>
                            </View>
                            <Pressable onPress={onClose} style={{ padding: 4, backgroundColor: theme.colors.bg, borderRadius: 12 }}>
                                <MaterialCommunityIcons name="close" size={20} color={theme.colors.muted} />
                            </Pressable>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: hall.color, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: hall.color, shadowOpacity: 0.4, shadowRadius: 10 }}>
                                <MaterialCommunityIcons name={hall.icon} size={48} color={theme.colors.bg} />
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={{ color: theme.colors.faint, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>SECURITY CLEARANCE</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: '900', lineHeight: 32 }}>{hall.name}</Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', lineHeight: 26, marginBottom: 32, fontStyle: 'italic' }}>
                            "{hall.desc}"
                        </Text>

                        {/* PROTOCOLS (Rules) */}
                        <View style={{ marginBottom: 32 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <View style={{ width: 4, height: 16, backgroundColor: hall.color }} />
                                <Text style={{ color: theme.colors.text, fontWeight: "900", textTransform: 'uppercase', fontSize: 14, letterSpacing: 1 }}>Required Protocols</Text>
                            </View>

                            <View style={{ backgroundColor: theme.colors.bg, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
                                {hall.rules.map((rule: string, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', gap: 14, padding: 16, borderBottomWidth: i === hall.rules.length - 1 ? 0 : 1, borderBottomColor: theme.colors.border }}>
                                        <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={hall.color} />
                                        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 }}>{rule}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* CLEARANCE PERKS */}
                        <View style={{ marginBottom: 32 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <View style={{ width: 4, height: 16, backgroundColor: hall.color }} />
                                <Text style={{ color: theme.colors.text, fontWeight: "900", textTransform: 'uppercase', fontSize: 14, letterSpacing: 1 }}>Clearance Perks</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {hall.perks.map((perk: string, i: number) => (
                                    <View key={i} style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: hall.color + '15', borderRadius: 8, borderWidth: 1, borderColor: hall.color + '30' }}>
                                        <Text style={{ color: hall.color, fontSize: 12, fontWeight: '800' }}>{perk}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* ACTIVE AGENTS */}
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <View style={{ width: 4, height: 16, backgroundColor: hall.color }} />
                                <Text style={{ color: theme.colors.text, fontWeight: "900", textTransform: 'uppercase', fontSize: 14, letterSpacing: 1 }}>Active Agents</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {hall.occupants.map((user: string, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.bg, padding: 8, paddingRight: 12, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border }}>
                                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: hall.color + '40', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: hall.color, fontSize: 11, fontWeight: '900' }}>{user[0]}</Text>
                                        </View>
                                        <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '700' }}>{user}</Text>
                                    </View>
                                ))}
                                <View style={{ padding: 10 }}>
                                    <Text style={{ color: theme.colors.faint, fontSize: 11, fontWeight: '800' }}>+ {hall.count - 5} OTHERS</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

export default function Discovery() {
    const { tr } = useI18n();
    const [feed, setFeed] = useState<DiscoveryItem[]>([]);
    const [sentiment, setSentiment] = useState<SentimentData | null>(null);
    const [residency, setResidency] = useState<ResidencyInfo | null>(null);
    const [selectedHall, setSelectedHall] = useState<any>(null);

    const load = useCallback(async () => {
        const [f, s, r] = await Promise.all([getDiscoveryFeed(), getSentiment(), getUserResidency()]);
        setFeed(f);
        setSentiment(s);
        setResidency(r);
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const handleVote = async (vote: 'BULL' | 'BEAR' | 'NEUTRAL') => {
        await voteSentiment(vote);
        load();
    };

    const handleReaction = (itemId: string, reactionType: string) => {
        setFeed(current => current.map(item => {
            if (item.id !== itemId) return item;
            const updatedReactions = item.reactions ? [...item.reactions] : [];
            const existing = updatedReactions.find(r => r.type === reactionType);

            if (existing) {
                if (existing.userReacted) return item; // limit 1 per type
                existing.count++;
                existing.userReacted = true;
            } else {
                updatedReactions.push({ type: reactionType as any, count: 1, userReacted: true });
            }
            return { ...item, reactions: updatedReactions };
        }));
    };

    const sentimentMetrics = useMemo(() => {
        if (!sentiment) return { bull: 33, neutral: 33, bear: 34 };
        const total = sentiment.bullish + sentiment.bearish + sentiment.neutral;
        return {
            bull: Math.round((sentiment.bullish / total) * 100),
            neutral: Math.round((sentiment.neutral / total) * 100),
            bear: Math.round((sentiment.bearish / total) * 100),
        };
    }, [sentiment]);

    const renderFeedItem = ({ item, index }: { item: DiscoveryItem, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100)}
            style={{
                backgroundColor: theme.colors.card,
                padding: 18,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.accent + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.accent + '40' }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 14 }}>{item.userName[0].toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '900' }}>{item.userName}</Text>
                        <Text style={{ color: theme.colors.faint, fontSize: 10, fontWeight: '800' }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - WORLD NODE</Text>
                    </View>
                </View>
                <View style={{ backgroundColor: item.type === 'ACHIEVEMENT' ? theme.colors.accent + '20' : theme.colors.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: item.type === 'ACHIEVEMENT' ? theme.colors.accent + '40' : theme.colors.border }}>
                    <MaterialCommunityIcons
                        name={item.type === 'ACHIEVEMENT' ? "trophy-outline" : "broadcast"}
                        size={14}
                        color={item.type === 'ACHIEVEMENT' ? theme.colors.accent : theme.colors.faint}
                    />
                </View>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800', lineHeight: 22 }}>{item.headline}</Text>
            {item.thesis && (
                <View style={{ marginTop: 12, padding: 14, backgroundColor: theme.colors.bg, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.accent }}>
                    <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '600', fontStyle: 'italic', lineHeight: 18 }}>"{item.thesis}"</Text>
                </View>
            )}

            {/* Reactions Row */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {(item.reactions || []).map((r, i) => (
                    <Pressable
                        key={i}
                        onPress={() => handleReaction(item.id, r.type)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 12,
                            backgroundColor: r.userReacted ? theme.colors.accent + '20' : theme.colors.bg,
                            borderWidth: 1,
                            borderColor: r.userReacted ? theme.colors.accent : theme.colors.border
                        }}
                    >
                        <MaterialCommunityIcons
                            name={
                                r.type === 'FIRE'
                                    ? 'fire'
                                    : r.type === 'ROCKET'
                                        ? 'rocket-launch'
                                        : r.type === 'CLOWN'
                                            ? 'emoticon-poop-outline'
                                            : 'trending-down'
                            }
                            size={14}
                            color={r.userReacted ? theme.colors.accent : theme.colors.muted}
                        />
                        <Text style={{ color: r.userReacted ? theme.colors.accent : theme.colors.muted, fontSize: 11, fontWeight: '700' }}>{r.count}</Text>
                    </Pressable>
                ))}

                {/* Add Reaction Button (Simplified) */}
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' }}>
                    <MaterialCommunityIcons name="plus" size={14} color={theme.colors.muted} />
                </View>
            </View>
        </Animated.View>
    );

    return (
        <Screen safeTop={true}>
            <HallDetailModal
                hall={selectedHall}
                visible={!!selectedHall}
                onClose={() => setSelectedHall(null)}
            />

            {/* Live Indicator Header */}
            <View style={{ marginBottom: 24 }}>
                <LiveIndicator />
                <Text style={{ color: theme.colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1.5 }}>Discovery Hub</Text>
            </View>

            {/* Residency Hall (The 3 Groups) */}
            <View style={{ marginBottom: 32 }}>
                <Text style={{ color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', fontSize: 13, letterSpacing: 1, marginBottom: 16 }}>The Residency Hall</Text>
                <View style={{ gap: 12 }}>
                    {GLOBAL_STAGES.map((stage, idx) => {
                        const isUserStage = residency?.stage === stage.id;
                        const progress = residency?.progressToNext || 0;
                        const showProgress = isUserStage && residency.nextStageThreshold;

                        // Simple lock logic
                        let isLocked = false;
                        if (stage.id === 'CORE_RESIDENCY' && residency?.stage === 'NOOB_GROUND') isLocked = true;
                        if (stage.id === 'INCOME_HARVESTING' && residency?.stage !== 'INCOME_HARVESTING') isLocked = true;

                        return (
                            <Pressable
                                key={stage.id}
                                onPress={() => {
                                    if (isLocked) {
                                        Alert.alert(
                                            tr("Hall Locked"),
                                            `${tr("You haven't earned entry to")} ${tr(stage.name)} ${tr("yet. Meet the requirements to unlock.")}`
                                        );
                                    } else {
                                        setSelectedHall(stage);
                                    }
                                }}
                                style={{ opacity: isLocked ? 0.6 : 1 }}
                            >
                                <Animated.View
                                    entering={FadeInRight.delay(idx * 150)}
                                    style={{
                                        backgroundColor: isUserStage ? stage.color + '15' : theme.colors.card,
                                        borderRadius: 24,
                                        padding: 20,
                                        borderWidth: 1.5,
                                        borderColor: isUserStage ? stage.color : isLocked ? 'transparent' : theme.colors.border,
                                        gap: 16,
                                        shadowColor: isUserStage ? stage.color : '#000',
                                        shadowOffset: { width: 0, height: isUserStage ? 4 : 2 },
                                        shadowOpacity: isUserStage ? 0.2 : 0.05,
                                        shadowRadius: isUserStage ? 12 : 4,
                                        elevation: isUserStage ? 5 : 1
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        <View style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 16,
                                            backgroundColor: isLocked ? theme.colors.bg : stage.color + '20',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <MaterialCommunityIcons
                                                name={isLocked ? "lock-outline" : stage.icon as any}
                                                size={isLocked ? 24 : 32}
                                                color={isLocked ? theme.colors.faint : stage.color}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={{ color: isLocked ? theme.colors.faint : stage.color, fontSize: 18, fontWeight: '900' }}>{stage.name}</Text>
                                                {isUserStage && (
                                                    <View style={{ backgroundColor: stage.color, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                        <Text style={{ color: theme.colors.bg, fontSize: 9, fontWeight: '900' }}>YOU</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={{ color: isLocked ? theme.colors.faint : theme.colors.text, fontSize: 13, fontWeight: '700', marginTop: 2 }}>{stage.headline}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                                <MaterialCommunityIcons name="account-group" size={12} color={theme.colors.faint} />
                                                <Text style={{ color: theme.colors.faint, fontSize: 11, fontWeight: '800' }}>{stage.count.toLocaleString()} SURVIVORS</Text>
                                            </View>
                                        </View>
                                        <MaterialCommunityIcons
                                            name={isLocked ? "lock" : "chevron-right"}
                                            size={isLocked ? 16 : 20}
                                            color={theme.colors.faint}
                                        />
                                    </View>

                                    {/* Progress Bar for Current Stage */}
                                    {showProgress && (
                                        <View style={{ marginTop: 8 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ color: stage.color, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Progress to Next Hall</Text>
                                                <Text style={{ color: stage.color, fontSize: 10, fontWeight: '900' }}>{Math.floor(progress * 100)}%</Text>
                                            </View>
                                            <View style={{ height: 6, backgroundColor: stage.color + '20', borderRadius: 3, overflow: 'hidden' }}>
                                                <View style={{ width: `${Math.min(100, progress * 100)}%`, height: '100%', backgroundColor: stage.color }} />
                                            </View>
                                        </View>
                                    )}
                                </Animated.View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Market Mood Heatmap */}
            <View style={{ backgroundColor: theme.colors.card, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 32 }}>
                <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, marginBottom: 20 }}>Global Sentiment Heatmap</Text>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    {(['BULL', 'NEUTRAL', 'BEAR'] as const).map(v => {
                        const active = sentiment?.userVote === v;
                        const color = v === 'BULL' ? theme.colors.success : v === 'BEAR' ? theme.colors.danger : theme.colors.muted;
                        return (
                            <Pressable
                                key={v}
                                onPress={() => handleVote(v)}
                                style={{
                                    flex: 1,
                                    backgroundColor: active ? color : theme.colors.bg,
                                    paddingVertical: 14,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    borderWidth: 1.5,
                                    borderColor: active ? color : theme.colors.border,
                                    shadowColor: active ? color : 'transparent',
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8
                                }}
                            >
                                <Text style={{ color: active ? theme.colors.bg : theme.colors.faint, fontSize: 11, fontWeight: '900' }}>{v}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={{ gap: 12 }}>
                    <View style={{ height: 12, borderRadius: 6, backgroundColor: theme.colors.bg, overflow: 'hidden', flexDirection: 'row' }}>
                        <View style={{ flex: sentimentMetrics.bull, backgroundColor: theme.colors.success }} />
                        <View style={{ flex: sentimentMetrics.neutral, backgroundColor: theme.colors.muted }} />
                        <View style={{ flex: sentimentMetrics.bear, backgroundColor: theme.colors.danger }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ color: theme.colors.success, fontSize: 18, fontWeight: '900' }}>{sentimentMetrics.bull}%</Text>
                            <Text style={{ color: theme.colors.faint, fontSize: 9, fontWeight: '800' }}>OPTIMISM</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: theme.colors.danger, fontSize: 18, fontWeight: '900' }}>{sentimentMetrics.bear}%</Text>
                            <Text style={{ color: theme.colors.faint, fontSize: 9, fontWeight: '800' }}>FEAR INDEX</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Hall of Fame Carousel */}
            <View style={{ marginBottom: 32 }}>
                <Text style={{ color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', fontSize: 13, letterSpacing: 1, marginBottom: 16 }}>Hall of Fame</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
                    {HALL_OF_FAME.map((peer, idx) => (
                        <View key={idx} style={{ width: 180, backgroundColor: theme.colors.card, borderRadius: 24, padding: 20, marginRight: 12, borderWidth: 1, borderColor: theme.colors.border }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accent + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <MaterialCommunityIcons name={peer.icon as any} size={22} color={theme.colors.accent} />
                            </View>
                            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '900' }}>{peer.name}</Text>
                            <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: '800', marginTop: 2 }}>{peer.stage}</Text>
                            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                                <Text style={{ color: theme.colors.faint, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>TOP FEAT</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{peer.achievement}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Global Feed */}
            <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900' }}>Global Signal</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="antenna" size={14} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: '900' }}>SYNCED</Text>
                </View>
            </View>
            <FlatList
                data={feed}
                renderItem={renderFeedItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                ListEmptyComponent={<Text style={{ color: theme.colors.faint, textAlign: 'center', paddingVertical: 40 }}>Searching for the signal...</Text>}
            />

            <View style={{ marginTop: 20, alignItems: 'center', opacity: 0.3 }}>
                <Text style={{ color: theme.colors.text, fontSize: 10, fontWeight: '800', letterSpacing: 2 }}>NORTHERN STEP STUDIO</Text>
            </View>
            <View style={{ height: 60 }} />
        </Screen>
    );
}

