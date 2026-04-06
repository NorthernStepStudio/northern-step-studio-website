import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { listLessons, getCompletedLessonIds } from '../../storage/lessons';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FinancialResidencyGuide } from '../../components/FinancialResidencyGuide';
import { ProPaywall } from '../../components/ProPaywall';
import { checkProStatus } from '../../storage/subscription';
import { LESSONS, isLessonPro } from '../../data/lessons';
import { useVelocityNavigate } from '../../hooks/useVelocityNavigate';

export default function Learn() {
    const { screenRef, navigate } = useVelocityNavigate();

    const [lessons, setLessons] = useState(() => listLessons());
    const [completed, setCompleted] = useState<string[]>([]);
    const [isPro, setIsPro] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);

    useFocusEffect(
        useCallback(() => {
            getCompletedLessonIds().then(setCompleted).catch(console.error);
            setLessons(listLessons());
            checkProStatus().then(status => setIsPro(status.isPro));
        }, [])
    );

    const groupedLessons = useMemo(() => {
        const groups: Record<string, typeof lessons> = {};
        lessons.forEach(l => {
            if (!groups[l.phase]) groups[l.phase] = [];
            groups[l.phase].push(l);
        });
        return groups;
    }, [lessons]);


    const sections = [
        {
            title: "CORE RESIDENCY",
            subtitle: "The non-negotiable foundations of wealth.",
            phases: ['Stability', 'Math', 'Practice'],
            isProSection: false
        },
        {
            title: "ELITE SPECIALIZATION",
            subtitle: "Advanced execution and cash-flow harvesting.",
            phases: ['Practice', 'Execution', 'Advanced', 'Income'],
            isProSection: true
        }
    ];

    return (
        <Screen ref={screenRef} safeTop={true}>
            <View style={{ marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                    <Text style={{ color: theme.colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1 }}>Learn</Text>
                    <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '800', marginTop: -4 }}>
                        Residency Progress
                    </Text>
                </View>
                <View>
                    <Pressable
                        onPress={() => navigate('/glossary')}
                        style={{
                            padding: 12,
                            borderRadius: 16,
                            backgroundColor: theme.colors.accent + '20',
                            borderWidth: 1,
                            borderColor: theme.colors.accent + '30',
                        }}
                    >
                        <MaterialCommunityIcons name="book-alphabet" size={24} color={theme.colors.accent} />
                    </Pressable>
                </View>
            </View>

            <View style={{
                padding: 24,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: 24
            }}>
                <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>
                    Knowledge Progress
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 22 }}>
                    Finished <Text style={{ fontWeight: '900' }}>{completed.length} of {lessons.length}</Text> lessons. {completed.length === lessons.length ? "You're a NooBS Master." : "Keep stacking knowledge."}
                </Text>
            </View>


            {/* Income Machine Philosophy Warning */}
            <View style={{
                padding: 20,
                borderRadius: 24,
                backgroundColor: theme.colors.warningBg + '10',
                borderWidth: 1,
                borderColor: theme.colors.accent + '30',
                marginBottom: 32,
                gap: 12
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="alert-decagram" size={20} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 14, textTransform: 'uppercase' }}>Advanced: The Income Machine</Text>
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>
                    <Text style={{ fontWeight: '900' }}>Harvesting vs. Growing:</Text> Making money <Text style={{ fontStyle: 'italic' }}>now</Text> (Yield) usually means trading away your money <Text style={{ fontStyle: 'italic' }}>tomorrow</Text> (Growth).
                    {"\n\n"}
                    The **Harvesting Phase** lessons (starting at <Text style={{ color: theme.colors.accent, fontWeight: '900' }}>Lesson 21</Text>) are for those who have reached their **Freedom Number** (25x annual expenses).
                    {"\n\n"}
                    If you are still in your building years, stay focused on **Core Growth** (Lessons 1-20). Yield is your reward at the finish line, not a shortcut.
                </Text>
            </View>

            {sections.map((section) => (
                <View key={section.title} style={{ marginBottom: 48 }}>
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: section.isProSection ? theme.colors.accent : theme.colors.text, fontSize: 24, fontWeight: '900' }}>{section.title}</Text>
                        <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600' }}>{section.subtitle}</Text>
                    </View>

                    {section.phases.map((phase) => {
                        const phaseLessons = groupedLessons[phase]?.filter(l => {
                            const isPro = isLessonPro(l.id);
                            return section.isProSection ? isPro : !isPro;
                        });

                        if (!phaseLessons || phaseLessons.length === 0) return null;

                        return (
                            <View key={phase} style={{ marginBottom: 32 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <View style={{ height: 1, flex: 1, backgroundColor: theme.colors.border }} />
                                    <Text style={{ color: theme.colors.muted, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {phase}
                                    </Text>
                                    <View style={{ height: 1, flex: 1, backgroundColor: theme.colors.border }} />
                                </View>

                                <View style={{ gap: 12 }}>
                                    {phaseLessons.map((l) => {
                                        const isDone = completed.includes(l.id) || l.completed;
                                        const needsPro = isLessonPro(l.id) && !isPro;

                                        return (
                                            <Pressable
                                                key={l.id}
                                                onPress={() => {
                                                    if (needsPro) {
                                                        setShowPaywall(true);
                                                    } else {
                                                        navigate(`/lesson/${l.id}`);
                                                    }
                                                }}
                                                style={({ pressed }) => ({
                                                    padding: 24,
                                                    borderRadius: theme.radius.card,
                                                    borderWidth: 1,
                                                    borderColor: needsPro ? theme.colors.accent + '50' : theme.colors.border,
                                                    backgroundColor: needsPro ? theme.colors.accent + '08' : (isDone ? theme.colors.softCard : theme.colors.card),
                                                    opacity: pressed ? 0.9 : 1,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 16
                                                })}
                                            >
                                                <View style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 22,
                                                    backgroundColor: needsPro ? theme.colors.accent + '20' : (isDone ? theme.colors.success + '20' : theme.colors.softCard),
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderWidth: 1,
                                                    borderColor: needsPro ? theme.colors.accent : (isDone ? theme.colors.success + '40' : theme.colors.border)
                                                }}>
                                                    {needsPro ? (
                                                        <MaterialCommunityIcons name="lock" size={24} color={theme.colors.accent} />
                                                    ) : isDone ? (
                                                        <MaterialCommunityIcons name="check" size={24} color={theme.colors.success} />
                                                    ) : (
                                                        <Text style={{ color: theme.colors.muted, fontWeight: '900', fontSize: 18 }}>{l.sort_order}</Text>
                                                    )}
                                                </View>

                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        color: needsPro ? theme.colors.accent : (isDone ? theme.colors.muted : theme.colors.text),
                                                        fontSize: 18,
                                                        fontWeight: '800',
                                                        textDecorationLine: isDone && !needsPro ? 'line-through' : 'none'
                                                    }}>
                                                        {l.title}
                                                    </Text>
                                                    <Text style={{ color: needsPro ? theme.colors.accent : (isDone ? theme.colors.success : theme.colors.faint), fontSize: 14, fontWeight: '700', marginTop: 2 }}>
                                                        {needsPro ? '🔒 UNLOCK WITH PRO' : (isDone ? 'MASTERED' : 'READY TO START')}
                                                    </Text>
                                                </View>

                                                {needsPro ? (
                                                    <MaterialCommunityIcons name="crown" size={24} color={theme.colors.accent} />
                                                ) : !isDone && (
                                                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.faint} />
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </View>
            ))}

            <FinancialResidencyGuide onNavigate={navigate} />

            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => setIsPro(true)}
            />

            <View style={{ height: 40 }} />
        </Screen>
    );
}
