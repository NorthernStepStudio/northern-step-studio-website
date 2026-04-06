import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLesson, markLessonComplete, getNextLessonId } from '../../storage/lessons';
import { isLessonPro } from '../../data/lessons';
import { checkProStatus } from '../../storage/subscription';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProPaywall } from '../../components/ProPaywall';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function LessonDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const lesson = useMemo(() => (id ? getLesson(String(id)) : null), [id]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);

    useFocusEffect(
        useCallback(() => {
            checkProStatus().then(status => setIsPro(status.isPro));
        }, [])
    );

    const isLocked = useMemo(() => {
        if (!lesson) return false;
        return isLessonPro(lesson.id) && !isPro;
    }, [lesson, isPro]);

    // Randomize options once per lesson load
    const options = useMemo(() => {
        if (!lesson) return [];
        return [lesson.correctAnswer, lesson.wrongAnswer, lesson.wrongAnswer2].filter(Boolean).sort(() => Math.random() - 0.5);
    }, [lesson]);

    const activeRationale = useMemo(() => {
        if (!lesson || !selectedAnswer || isCorrect) return null;
        if (selectedAnswer === lesson.wrongAnswer) return lesson.wrongRationale;
        if (selectedAnswer === lesson.wrongAnswer2) return lesson.wrongRationale2;
        return null;
    }, [lesson, selectedAnswer, isCorrect]);

    if (!lesson) {
        return (
            <Screen>
                <Text style={{ color: theme.colors.text }}>Lesson not found. That’s… impressive.</Text>
            </Screen>
        );
    }

    if (isLocked) {
        return (
            <Screen safeTop={true}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                    <MaterialCommunityIcons name="crown" size={64} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 24 }}>Elite Content Locked</Text>
                    <Text style={{ color: theme.colors.muted, fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 }}>
                        This lesson is part of the Elite Specialization. Upgrade to Pro to unlock the full path.
                    </Text>
                    <Pressable
                        onPress={() => setShowPaywall(true)}
                        style={{
                            backgroundColor: theme.colors.accent,
                            paddingHorizontal: 32,
                            paddingVertical: 16,
                            borderRadius: 30,
                            marginTop: 32
                        }}
                    >
                        <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 16 }}>VIEW UPGRADE OPTIONS</Text>
                    </Pressable>
                    <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <Text style={{ color: theme.colors.muted, fontWeight: '700' }}>Maybe Later</Text>
                    </Pressable>
                </View>
                <ProPaywall
                    visible={showPaywall}
                    onClose={() => setShowPaywall(false)}
                    onUnlock={() => setIsPro(true)}
                />
            </Screen>
        );
    }

    return (
        <Screen safeTop={true} scroll={false}>
            {/* Fixed Header */}
            <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
                <Pressable onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.muted} />
                    <Text style={{ color: theme.colors.muted, fontWeight: '700' }}>Back to Learn</Text>
                </Pressable>
                <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -0.5 }}>{lesson.title}</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Content Section */}
                <View style={{
                    padding: 24,
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    marginBottom: 32
                }}>
                    <Text style={{ color: theme.colors.text, lineHeight: 28, fontSize: 18, fontWeight: '500' }}>
                        {lesson.content.split(/(\[.*?\])/).map((part, i) => {
                            if (part.startsWith('[') && part.endsWith(']')) {
                                return (
                                    <Text key={i} style={{ color: theme.colors.accent, fontWeight: '900' }}>
                                        {part.slice(1, -1)}
                                    </Text>
                                );
                            }
                            return part;
                        })}
                    </Text>
                </View>

                <View style={{
                    padding: 24,
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    marginBottom: 32
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>
                            Vibe Check
                        </Text>
                        {isCorrect && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color={theme.colors.success} />
                                <Text style={{ color: theme.colors.success, fontWeight: '900', fontSize: 12 }}>PASSED</Text>
                            </View>
                        )}
                    </View>

                    <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900', marginBottom: 20, lineHeight: 28 }}>
                        {lesson.question}
                    </Text>

                    <View style={{ gap: 12 }}>
                        {options.map((opt, i) => {
                            const isThisSelected = selectedAnswer === opt;
                            const isThisCorrect = opt === lesson.correctAnswer;
                            const showAsWrong = isThisSelected && !isThisCorrect;
                            const showAsCorrect = isCorrect && isThisCorrect;

                            return (
                                <Pressable
                                    key={i}
                                    disabled={isCorrect}
                                    onPress={() => {
                                        setSelectedAnswer(opt);
                                        if (opt === lesson.correctAnswer) {
                                            setIsCorrect(true);
                                        } else {
                                            setIsCorrect(false);
                                        }
                                    }}
                                    style={({ pressed }) => ({
                                        padding: 20,
                                        borderRadius: 16,
                                        backgroundColor: showAsCorrect ? theme.colors.success + '20' :
                                            showAsWrong ? theme.colors.danger + '10' :
                                                pressed ? theme.colors.bg + '50' : theme.colors.bg,
                                        borderWidth: 1,
                                        borderColor: showAsCorrect ? theme.colors.success :
                                            showAsWrong ? theme.colors.danger :
                                                theme.colors.border,
                                        opacity: isCorrect && !isThisCorrect ? 0.5 : 1
                                    })}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{
                                            color: showAsCorrect ? theme.colors.success :
                                                showAsWrong ? theme.colors.danger :
                                                    theme.colors.text,
                                            fontWeight: '700',
                                            fontSize: 15,
                                            flex: 1
                                        }}>
                                            {opt}
                                        </Text>
                                        {showAsCorrect && <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />}
                                        {showAsWrong && <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.danger} />}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    {activeRationale && (
                        <View style={{
                            marginTop: 20,
                            padding: 16,
                            backgroundColor: theme.colors.danger + '05',
                            borderRadius: 12,
                            borderLeftWidth: 4,
                            borderLeftColor: theme.colors.danger
                        }}>
                            <Text style={{ color: theme.colors.danger, fontWeight: '900', fontSize: 13, marginBottom: 4, textTransform: 'uppercase' }}>
                                Teachable Moment
                            </Text>
                            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>
                                {activeRationale}
                            </Text>
                        </View>
                    )}
                </View>

                {/* The Bottom Line - Locked until PASSED */}
                {isCorrect && (
                    <View style={{
                        padding: 24,
                        borderRadius: theme.radius.card,
                        backgroundColor: theme.colors.accent + '10',
                        borderWidth: 1,
                        borderColor: theme.colors.accent,
                        marginBottom: 32,
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.accent} />
                            <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>
                                THE BOTTOM LINE
                            </Text>
                        </View>
                        <Text style={{ color: theme.colors.text, fontSize: 17, lineHeight: 26, fontWeight: '700', fontStyle: 'italic' }}>
                            {lesson.summary}
                        </Text>
                    </View>
                )}

                <Pressable
                    onPress={() => {
                        if (!isCorrect) return;
                        markLessonComplete(lesson.id);
                        const nextId = getNextLessonId(lesson.id);
                        if (nextId) {
                            router.replace(`/lesson/${nextId}`);
                        } else {
                            router.replace("/(tabs)/learn");
                        }
                    }}
                    disabled={!isCorrect}
                    style={({ pressed }) => ({
                        padding: 20,
                        borderRadius: theme.radius.pill,
                        backgroundColor: isCorrect ? theme.colors.accent : theme.colors.softCard,
                        opacity: pressed ? 0.9 : 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 40
                    })}
                >
                    <Text style={{ color: isCorrect ? theme.colors.buttonText : theme.colors.muted, fontWeight: '900', fontSize: 18, textAlign: 'center' }}>
                        {getNextLessonId(lesson.id) ? 'GOT IT. NEXT LESSON' : 'LESSONS COMPLETE'}
                    </Text>
                    <MaterialCommunityIcons
                        name={isCorrect ? "arrow-right" : "lock-outline"}
                        size={20}
                        color={isCorrect ? theme.colors.buttonText : theme.colors.muted}
                    />
                </Pressable>
            </ScrollView>
        </Screen>
    );
}
