import React from "react";
import { Text, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { theme } from "../constants/theme";

import { unlockMedal } from "../storage/achievements";

export default function Philosophy() {
    const router = useRouter();

    React.useEffect(() => {
        unlockMedal('PHILOSOPHER');
    }, []);

    return (
        <Screen safeTop={true} scroll={false}>
            {/* Fixed Header */}
            <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
                <Pressable onPress={() => router.back()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.muted} />
                    <Text style={{ color: theme.colors.muted, fontWeight: '700' }}>Back</Text>
                </Pressable>
                <Text style={{ color: theme.colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1 }}>Rules</Text>
                <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '800', marginTop: -4 }}>
                    Live by them or go broke.
                </Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {[
                    { id: 1, title: 'Slow money beats fast regret.', desc: 'If it feels exciting, you’re probably doing it wrong. Real investing feels like watching paint dry on a slow Tuesday.' },
                    { id: 2, title: 'No emergency fund = no investing.', desc: '“Hope” is not a financial plan. If you can’t pay for a broken transmission without selling stocks, you are not an investor; you are fragile.' },
                    { id: 3, title: 'Consistency beats genius.', desc: 'You don’t need high IQ. You need to show up every month for 20 years. A genius who quits loses to an idiot who persists.' },
                    { id: 4, title: 'Debt is an emergency.', desc: 'Paying 20% interest on a credit card while trying to make 8% in the market is worse than stupid—it’s mathematical suicide. Kill the debt first.' },
                    { id: 5, title: 'Fees are invisible thieves.', desc: 'A 2% fee sounds small until you realize it eats 40% of your wealth over 30 years. Fight for every basis point. Low cost is the only "Alpha" you can control.' },
                    { id: 6, title: 'News is noise.', desc: 'Headlines are designed to sell ads, not to help you. If you trade based on what a guy on TV screamed, you are the product, not the client.' },
                    { id: 7, title: 'Forecasting is for liars.', desc: 'Nobody knows what the market will do next week. Anyone who says they do is selling something. Don’t predict—prepare.' },
                    { id: 8, title: 'Time in the market > Timing the market.', desc: 'Missing the 10 best days of the decade cuts your returns in half. You can’t time them. You have to be in the seat when the bus leaves.' },
                    { id: 9, title: 'Risk is real, not a number.', desc: 'Risk isn’t a standard deviation on a chart. Risk is seeing your life savings drop 50% and not vomiting. Know your stomach before you pick your stocks.' },
                    { id: 10, title: 'You are the problem.', desc: 'The market won’t destroy you. Your own panic, greed, and impatience will. Master yourself, and the money is easy.' }
                ].map(r => (
                    <View key={r.id} style={{
                        padding: 24,
                        borderRadius: theme.radius.card,
                        backgroundColor: theme.colors.card,
                        borderWidth: 1,
                        borderColor: theme.colors.border
                    }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>
                            Rule #{r.id}
                        </Text>
                        <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 20, marginBottom: 8 }}>
                            {r.title}
                        </Text>
                        <Text style={{ color: theme.colors.muted, lineHeight: 24, fontSize: 16 }}>
                            {r.desc}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </Screen>
    );
}
