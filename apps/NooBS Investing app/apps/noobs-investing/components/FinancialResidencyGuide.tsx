import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../storage/db';
import ConfettiCannon from 'react-native-confetti-cannon';
import { AutoTranslate } from './AutoTranslate';

export function FinancialResidencyGuide({ onNavigate }: { onNavigate?: (path: string, params?: any) => void }) {
    const router = useRouter();
    const [stats, setStats] = useState({
        hasPlan: false,
        paperCount: 0,
        hasReal: false,
        hasCompletedSimulator: false
    });

    const handleStepPress = (action: string) => {
        if (onNavigate) {
            onNavigate(action);
        } else {
            router.push(action as any);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const paperRes = db.getFirstSync<{ count: number }>(
                `SELECT COUNT(*) as count FROM transactions WHERE kind = 'paper'`
            );
            const realRes = db.getFirstSync<{ count: number }>(
                `SELECT COUNT(*) as count FROM transactions WHERE kind = 'real'`
            );
            const planRes = db.getFirstSync<{ contribution_amount: number }>(
                `SELECT contribution_amount FROM plan WHERE id = 1`
            );

            const medalsRes = db.getAllSync<{ id: string }>(
                `SELECT id FROM achievements WHERE id = 'BATTLE_TESTED'`
            );
            const hasMedal = (medalsRes?.length || 0) > 0;

            setStats({
                hasPlan: (planRes?.contribution_amount || 0) > 0,
                paperCount: paperRes?.count || 0,
                hasReal: (realRes?.count || 0) > 0,
                hasCompletedSimulator: hasMedal
            });
        }, [])
    );

    const steps = [
        {
            icon: "shield-check",
            title: "Finalize Your Strategy",
            description: "Go to the [Plan] tab and lock in your Risk Level and Allocation. This is your unbreakable foundation.",
            action: "/(tabs)/plan",
            label: "VERIFY PLAN",
            isDone: stats.hasPlan
        },
        {
            icon: "chart-ppf",
            title: "Simulate 3 Transactions",
            description: `Add 3 paper entries (fake money) to your portfolio. Watch how the market 'drifts' and learn the rhythm. (${stats.paperCount}/3)`,
            action: "/add-entry?kind=paper",
            label: "PRACTICE TRADING",
            isDone: stats.paperCount >= 3
        },
        {
            icon: "lightning-bolt",
            title: "The Battle Test",
            description: "Survive a simulated market collapse. You need the mental armor before you risk real dollars.",
            action: "/loss-simulator",
            label: "ENTER ARENA",
            isDone: stats.hasCompletedSimulator
        },
        {
            icon: "finance",
            title: "The Real Deal",
            description: "Once you're comfortable, switch to 'Real' mode. This is where the training wheels come off.",
            action: "/(tabs)/portfolio",
            label: "GO TO PORTFOLIO",
            isDone: stats.hasReal
        }
    ];

    const allFinished = steps.every(s => s.isDone);

    // Confetti state
    const confettiRef = useRef<any>(null);
    const [didFireConfetti, setDidFireConfetti] = useState(false);

    useEffect(() => {
        if (allFinished && !didFireConfetti && confettiRef.current) {
            confettiRef.current.start();
            setDidFireConfetti(true);
        }
    }, [allFinished, didFireConfetti]);

    return (
        <AutoTranslate>
        <>
            {allFinished && (
                <ConfettiCannon
                    ref={confettiRef}
                    count={80}
                    origin={{ x: Dimensions.get('window').width / 2, y: -20 }}
                    fadeOut={true}
                    fallSpeed={2500}
                    explosionSpeed={400}
                    colors={[theme.colors.accent, theme.colors.success, '#FFD700', '#FF69B4']}
                    autoStart={false}
                />
            )}
            <View style={{
                padding: 32,
                borderRadius: 32,
                backgroundColor: theme.colors.card,
                borderWidth: 2,
                borderColor: allFinished ? theme.colors.accent + '60' : theme.colors.success + '40',
                marginTop: 32,
                gap: 24,
                shadowColor: allFinished ? theme.colors.accent : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 5
            }}>
                <View style={{ alignItems: 'center', gap: 8 }}>
                    <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: allFinished ? theme.colors.accent + '20' : theme.colors.success + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: allFinished ? theme.colors.accent : 'transparent'
                    }}>
                        <MaterialCommunityIcons
                            name={allFinished ? "crown" : "medal"}
                            size={32}
                            color={allFinished ? theme.colors.accent : theme.colors.success}
                        />
                    </View>
                    <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center' }}>
                        {allFinished ? "NooBS Verified" : "Financial Residency"}
                    </Text>
                    <Text style={{ color: allFinished ? theme.colors.accent : theme.colors.success, fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {allFinished ? "YOU ARE THE OWNER NOW." : "Complete Your Training."}
                    </Text>
                </View>

                <View style={{ height: 1, backgroundColor: theme.colors.border }} />

                <View style={{ gap: 32 }}>
                    {steps.map((s, idx) => (
                        <View key={idx} style={{ gap: 12, opacity: s.isDone ? 0.6 : 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: s.isDone ? theme.colors.success + '20' : theme.colors.bg,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: s.isDone ? theme.colors.success : theme.colors.border
                                }}>
                                    {s.isDone ? (
                                        <MaterialCommunityIcons name="check" size={20} color={theme.colors.success} />
                                    ) : (
                                        <Text style={{ color: theme.colors.accent, fontWeight: '900' }}>{idx + 1}</Text>
                                    )}
                                </View>
                                <Text style={{
                                    color: theme.colors.text,
                                    fontSize: 18,
                                    fontWeight: '900',
                                    textDecorationLine: s.isDone ? 'line-through' : 'none'
                                }}>{s.title}</Text>
                            </View>
                            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22 }}>{s.description}</Text>

                            {!s.isDone && (
                                <Pressable
                                    onPress={() => handleStepPress(s.action)}
                                    style={{
                                        alignSelf: 'flex-start',
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                        borderRadius: 12,
                                        backgroundColor: theme.colors.accent + '15',
                                        borderWidth: 1,
                                        borderColor: theme.colors.accent + '30'
                                    }}
                                >
                                    <Text style={{ color: theme.colors.accent, fontWeight: '900', fontSize: 12 }}>{s.label} →</Text>
                                </Pressable>
                            )}
                        </View>
                    ))}
                </View>

                {allFinished && (
                    <>
                        <View style={{ height: 1, backgroundColor: theme.colors.border, marginTop: 16 }} />
                        <View style={{ gap: 12 }}>
                            <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 12 }}>Next Level: The Long Game</Text>
                            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
                                Training isn't the end—it's the beginning of your discipline. The market will test you with every tick.
                                Keep your simulated portfolio running to experience the cycles, crashes, and recoveries that make a true investor.
                            </Text>
                            <Text style={{ color: theme.colors.muted, fontSize: 12, fontStyle: 'italic' }}>
                                Strategy is 10%. Psychology is 90%. Use this simulator to build the mental armor you need to win.
                            </Text>
                        </View>
                    </>
                )}

                <View style={{
                    marginTop: 16,
                    padding: 20,
                    borderRadius: 20,
                    backgroundColor: theme.colors.bg,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderStyle: 'dashed'
                }}>
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '800', fontStyle: 'italic', textAlign: 'center' }}>
                        {allFinished
                            ? "The resident has become the master. Keep your discipline."
                            : "\"Theory is over. Don't just stare at the screen. Complete your residency.\""}
                    </Text>
                </View>
            </View>
        </>
        </AutoTranslate>
    );
}
