import React, { useEffect, useState } from "react";
import { Text, TextInput, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { getProfile } from "../../storage/profile";
import { getPlan, savePlan, PlanRow } from "../../storage/plan";
import { WarningText } from "../../components/WarningText";
import { Screen } from "../../components/Screen";
import { theme } from "../../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { unlockMedal } from "../../storage/achievements";

import { GrowthChart } from "../../components/GrowthChart";
import { GuideTip } from "../../components/GuideTip";
import { useVelocityNavigate } from "../../hooks/useVelocityNavigate";

function computeStage(profileEmergencyFund: string | null): string {
    const ef = (profileEmergencyFund || "").toLowerCase();
    const noEf = ef === "none" || ef === "" || ef.includes("0") || ef.includes("no");
    if (noEf) return "Stability First";
    return "Wealth Mode";
}

export default function Plan() {
    const [plan, setPlan] = useState<PlanRow | null>(null);
    const [savedMsg, setSavedMsg] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const { screenRef, navigate } = useVelocityNavigate();

    useEffect(() => {
        (async () => {
            const profile = await getProfile();
            const p = await getPlan();
            const stage = computeStage(profile?.emergency_fund_status ?? null);
            setPlan({ ...p, stage });
        })().catch(console.error);
    }, []);

    if (!plan) {
        return (
            <Screen>
                <Text style={{ color: theme.colors.text }}>Loading plan…</Text>
            </Screen>
        );
    }

    return (
        <Screen ref={screenRef} safeTop={true}>
            <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 40, fontWeight: "900", color: theme.colors.text, letterSpacing: -1 }}>Plan</Text>
                <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '800', marginTop: -4 }}>
                    Boring is good. Boring makes money.
                </Text>
            </View>

            <View style={{ padding: 24, borderRadius: theme.radius.card, backgroundColor: theme.colors.accent + '10', borderWidth: 1, borderColor: theme.colors.accent + '30', marginBottom: 24 }}>
                <Text style={{ color: theme.colors.accent, fontWeight: "900", marginBottom: 8, textTransform: 'uppercase' }}>Current Objective: {plan.stage === 'Wealth Mode' ? 'Grow Assets' : 'Bridge the Gap'}</Text>
                <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 22 }}>
                    {plan.stage === 'Wealth Mode'
                        ? "You've got your safety net (Emergency Fund) locked. Your job now is to channel every spare dollar into your long-term plan. Let compound interest do the heavy lifting."
                        : "You're building your foundation. Until you have a solid Emergency Fund (3-6 months of expenses), keep your contributions modest and focus on survival. Don't worry about being 'aggressive' yet."
                    }
                </Text>
            </View>

            <View style={{ gap: 24 }}>
                <View style={{ padding: 24, borderRadius: theme.radius.card, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, gap: 4 }}>
                    <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>Current Stage</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>{plan.stage}</Text>
                </View>

                {(plan.contribution_amount || 0) > 0 && (
                    <GrowthChart
                        contributionAmount={plan.contribution_amount}
                        frequency={plan.frequency}
                        template={plan.allocation_template}
                    />
                )}

                <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Contribution (USD)</Text>
                        <GuideTip title="Why this amount?" content="This is the number you can commit to investing *every single time* without fail. Consistency is 10x more important than the amount. Start small if you have to, but don't stop." />
                    </View>
                    <TextInput
                        value={String(plan.contribution_amount || "")}
                        onChangeText={(v) => {
                            const n = v === "" ? 0 : Number(v);
                            if (!isNaN(n)) setPlan({ ...plan, contribution_amount: n });
                        }}
                        keyboardType="numeric"
                        placeholder="e.g. 100"
                        placeholderTextColor={theme.colors.faint}
                        style={{
                            padding: 20,
                            borderRadius: 20,
                            backgroundColor: theme.colors.card,
                            color: theme.colors.text,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            fontSize: 18,
                            fontWeight: '700'
                        }}
                    />
                    <Text style={{ color: theme.colors.faint, fontSize: 13 }}>How much will you put aside each time?</Text>
                </View>

                <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Frequency</Text>
                        <GuideTip title="The Power of Habit" content="This determines how often you buy. This is called 'Dollar Cost Averaging' (DCA). By buying often, you average out the highs and lows of the market automatically." />
                    </View>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {(["weekly", "biweekly", "monthly"] as const).map((f) => (
                            <Pressable
                                key={f}
                                onPress={() => setPlan({ ...plan, frequency: f })}
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    borderRadius: 16,
                                    backgroundColor: plan.frequency === f ? theme.colors.accent : theme.colors.card,
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{
                                    color: plan.frequency === f ? theme.colors.buttonText : theme.colors.text,
                                    fontWeight: "900",
                                    fontSize: 13,
                                    textTransform: 'uppercase'
                                }}>
                                    {f}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontWeight: "900", color: theme.colors.text, fontSize: 18 }}>Template</Text>
                        <GuideTip title="Risk vs Reward" content="How much can you stomach losing? 'Aggressive' means bigger gains but scarier drops. 'Conservative' means slow and steady. 'Balanced' is the sweet spot for most NooBS." />
                    </View>
                    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                        {(["conservative", "balanced", "aggressive"] as const).map((t) => (
                            <Pressable
                                key={t}
                                onPress={() => setPlan({ ...plan, allocation_template: t })}
                                style={{
                                    flex: 1,
                                    minWidth: '30%',
                                    padding: 14,
                                    borderRadius: 16,
                                    backgroundColor: plan.allocation_template === t ? theme.colors.accent : theme.colors.card,
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{
                                    color: plan.allocation_template === t ? theme.colors.buttonText : theme.colors.text,
                                    fontWeight: "900",
                                    fontSize: 13,
                                    textTransform: 'uppercase'
                                }}>
                                    {t}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <Text style={{ marginTop: 4, color: theme.colors.faint, fontSize: 13, lineHeight: 18 }}>
                        {plan.allocation_template === 'conservative' && "High bonds/cash. Lower risk, lower potential gain."}
                        {plan.allocation_template === 'balanced' && "Mix of stocks and bonds. The middle path."}
                        {plan.allocation_template === 'aggressive' && "Mostly stocks. High volatility, high potential gain."}
                    </Text>
                </View>

                <View style={{ paddingVertical: 16 }}>
                    <Pressable
                        onPress={async () => {
                            if (!plan) return;
                            if (plan.contribution_amount <= 0) {
                                setSavedMsg("Contribution must be > 0. Vibes won't buy VTI.");
                                setTimeout(() => setSavedMsg(null), 3000);
                                return;
                            }

                            setIsSaving(true);
                            try {
                                await savePlan(plan);
                                await unlockMedal('STRATEGIST');
                                setSavedMsg("PLAN SAVED. Redirecting to Stress-Test...");

                                // Get current principal for personalization
                                import('../../storage/transactions').then(async ({ getPortfolioTotal }) => {
                                    const total = await getPortfolioTotal('real');

                                    setTimeout(() => {
                                        navigate({
                                            pathname: "/loss-simulator",
                                            params: {
                                                principal: total || 1000,
                                                monthly: plan.contribution_amount,
                                                locked: 'true'
                                            }
                                        });
                                    }, 1500);
                                });
                            } catch (err) {
                                setSavedMsg("FAILED TO SAVE. Try again.");
                                console.error(err);
                            } finally {
                                setIsSaving(false);
                                setTimeout(() => setSavedMsg(null), 3000);
                            }
                        }}
                        disabled={isSaving}
                        style={({ pressed }) => ({
                            padding: 20,
                            borderRadius: theme.radius.pill,
                            backgroundColor: isSaving ? theme.colors.muted : theme.colors.accent,
                            opacity: (pressed || isSaving) ? 0.9 : 1
                        })}
                    >
                        <Text style={{ color: theme.colors.buttonText, fontWeight: "900", textAlign: "center", fontSize: 18 }}>
                            {isSaving ? "SAVING..." : "COMMIT TO PLAN"}
                        </Text>
                    </Pressable>

                    {!!savedMsg && (
                        <Text style={{ color: theme.colors.accent, fontWeight: "800", textAlign: 'center', marginTop: 12 }}>
                            {savedMsg}
                        </Text>
                    )}
                </View>

                <View style={{
                    padding: 24,
                    borderRadius: 32,
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    gap: 12
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="brain" size={24} color={theme.colors.accent} />
                        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Why do I need this?</Text>
                    </View>
                    <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 22, fontWeight: '600' }}>
                        Your <Text style={{ color: theme.colors.text }}>Plan</Text> is your North Star. Without it, you're just reacting to the news.
                        {"\n\n"}
                        <Text style={{ color: theme.colors.text, fontWeight: '900' }}>The Goal:</Text> If your Stocks grow too fast (e.g., 80% of your money instead of 60%), you're taking on <Text style={{ color: theme.colors.danger }}>more risk</Text> than you agreed to.
                        {"\n\n"}
                        The <Text style={{ color: theme.colors.accent }}>Rebalancing Engine</Text> forces you to do the hardest thing in investing: <Text style={{ color: theme.colors.success }}>Sell your winners</Text> (while they're high) and <Text style={{ color: theme.colors.success }}>Buy your losers</Text> (while they're low).
                        {"\n\n"}
                        It removes the "vibes" and replaces them with discipline.
                        {"\n\n"}
                        <Text style={{ fontStyle: 'italic' }}>Intellect doesn't build wealth. Systems do.</Text>
                    </Text>
                </View>
            </View>
            <View style={{ height: 40 }} />
        </Screen>
    );
}
