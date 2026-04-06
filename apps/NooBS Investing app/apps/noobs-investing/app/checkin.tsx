import React, { useState } from "react";
import { Text, Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { run } from "../storage/db";
import { Screen } from "../components/Screen";
import { theme } from "../constants/theme";

import { getWeekStartISO } from "../utils/dates";

import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WeeklyCheckIn() {
    const router = useRouter();
    const [followed, setFollowed] = useState(true);
    const [emotional, setEmotional] = useState(false);
    const [note, setNote] = useState("");

    return (
        <Screen safeTop={true}>
            <View style={{ marginBottom: 32 }}>
                <Pressable onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.muted} />
                    <Text style={{ color: theme.colors.muted, fontWeight: '700' }}>Back</Text>
                </Pressable>
                <Text style={{ fontSize: 40, fontWeight: "900", color: theme.colors.text, letterSpacing: -1 }}>Check-in</Text>
                <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '800', marginTop: -4 }}>
                    Did you follow the plan... or did emotions win?
                </Text>
            </View>

            <View style={{ gap: 24 }}>
                <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Did you stick to the plan?</Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <Pressable
                            onPress={() => setFollowed(true)}
                            style={{
                                padding: 16,
                                borderRadius: 16,
                                backgroundColor: followed ? theme.colors.accent : theme.colors.card,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                flex: 1,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ fontWeight: "900", color: followed ? theme.colors.buttonText : theme.colors.text, textTransform: 'uppercase', fontSize: 13 }}>Followed ✅</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setFollowed(false)}
                            style={{
                                padding: 16,
                                borderRadius: 16,
                                backgroundColor: !followed ? theme.colors.danger : theme.colors.card,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                flex: 1,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ fontWeight: "900", color: !followed ? theme.colors.buttonText : theme.colors.text, textTransform: 'uppercase', fontSize: 13 }}>Didn’t ❌</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Emotional state</Text>
                    <Pressable
                        onPress={() => setEmotional((v) => !v)}
                        style={{
                            padding: 20,
                            borderRadius: 20,
                            backgroundColor: emotional ? "#FBBF24" : theme.colors.card,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <MaterialCommunityIcons
                            name={emotional ? "emoticon-sad-outline" : "emoticon-neutral-outline"}
                            size={24}
                            color={emotional ? theme.colors.buttonText : theme.colors.text}
                        />
                        <Text style={{ fontWeight: "900", color: emotional ? theme.colors.buttonText : theme.colors.text, fontSize: 16 }}>
                            {emotional ? "EMOTIONS INVOLVED" : "TOTAL CONTROL"}
                        </Text>
                    </Pressable>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Weekly Notes</Text>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="Be honest. Nobody is watching."
                        placeholderTextColor={theme.colors.faint}
                        multiline
                        style={{
                            padding: 20,
                            borderRadius: 24,
                            backgroundColor: theme.colors.card,
                            color: theme.colors.text,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            minHeight: 120,
                            textAlignVertical: "top",
                            fontSize: 16,
                            fontWeight: '500'
                        }}
                    />
                </View>

                <Pressable
                    onPress={async () => {
                        const week = getWeekStartISO();
                        await run(
                            `INSERT INTO weekly_checkins (week_start_iso, followed_plan, emotional, note)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(week_start_iso) DO UPDATE SET
                   followed_plan=excluded.followed_plan,
                   emotional=excluded.emotional,
                   note=excluded.note;`,
                            [week, followed ? 1 : 0, emotional ? 1 : 0, note]
                        );
                        router.replace("/(tabs)");
                    }}
                    style={({ pressed }) => ({
                        padding: 20,
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.colors.accent,
                        opacity: pressed ? 0.9 : 1,
                        marginTop: 16
                    })}
                >
                    <Text style={{ color: theme.colors.buttonText, fontWeight: "900", textAlign: "center", fontSize: 18, textTransform: 'uppercase' }}>
                        SAVE CHECK-IN
                    </Text>
                </Pressable>

                {!followed ? (
                    <Text style={{ color: theme.colors.faint, textAlign: "center", fontStyle: 'italic', fontSize: 14 }}>
                        Cool. At least you’re honest. Now go fix it.
                    </Text>
                ) : null}
            </View>
            <View style={{ height: 40 }} />
        </Screen>
    );
}
