import React, { useMemo, useState } from "react";
import { Text, Pressable, View, Modal, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { Linking } from "react-native";
import { upsertProfile } from "../storage/profile";
import { Screen } from "../components/Screen";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function Pill({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: selected ? theme.colors.accent : theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.9 : 1
            })}
        >
            <Text style={{ color: selected ? theme.colors.buttonText : theme.colors.text, fontWeight: "900", textTransform: 'uppercase', fontSize: 13 }}>
                {label}
            </Text>
        </Pressable>
    );
}

import { COPY } from "../constants/copy";
import { useI18n } from "../i18n";

import { NoobsLogo } from "../components/NoobsLogo";

export default function Onboarding() {
    const router = useRouter();
    const { tr } = useI18n();

    const [ageRange, setAgeRange] = useState("18–24");
    const [incomeRange, setIncomeRange] = useState("<$2k/mo");
    const [expenseRange, setExpenseRange] = useState("<$2k/mo");
    const [emergencyFund, setEmergencyFund] = useState("none");
    const [debt, setDebt] = useState("credit cards");
    const [goal, setGoal] = useState("learn");
    const [risk, setRisk] = useState(5);
    const [showFreedomNumberIntro, setShowFreedomNumberIntro] = useState(false);
    const [showPathOrientation, setShowPathOrientation] = useState(false);
    const [showProPreview, setShowProPreview] = useState(false);
    const [hasConsented, setHasConsented] = useState(false);

    const openLegalLink = (title: string, url: string) => {
        Linking.openURL(url).catch(() => {
            Alert.alert(tr(title), `${tr("This would open your web browser to: ")}${url}`);
        });
    };

    const handleComplete = async () => {
        if (!hasConsented) {
            Alert.alert(
                tr("Truth Check Required"),
                tr("You must acknowledge that this is a simulation before entering.")
            );
            return;
        }
        setShowFreedomNumberIntro(true);
    };

    const finishOnboarding = async () => {
        await upsertProfile({
            age_range: ageRange,
            income_range: incomeRange,
            expense_range: expenseRange,
            emergency_fund_status: emergencyFund,
            debt_status: debt,
            goal_type: goal,
            risk_level: risk,
        });
        setShowProPreview(false);
        router.replace("/(tabs)");
    };

    const stageHint = useMemo(() => {
        if (emergencyFund === "none" || debt === "credit cards") return "Survival Mode";
        return "Growth (Finally) Mode";
    }, [emergencyFund, debt]);

    return (
        <Screen
            safeTop={true}
            headerLeft={
                <View style={{ width: 250, marginLeft: -10, marginTop: -6 }}>
                    <Image
                        source={require('../assets/branding/noobs_logo_provided.png')}
                        style={{ width: 250, height: 105, resizeMode: 'cover' }}
                    />
                    <View style={{ width: 250, flexDirection: 'row', justifyContent: 'space-between', marginTop: -20 }}>
                        {['INVESTING', 'FOR', 'REAL', 'PEOPLE.'].map((word, i) => (
                            <Text key={i} style={{ color: theme.colors.accent, fontSize: 15, fontWeight: '900' }}>{word}</Text>
                        ))}
                    </View>
                </View>
            }
        >
            <View style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.6 }}>
                <Text style={{ color: theme.colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>POWERED BY</Text>
                <Image
                    source={require('../assets/branding/logo_horizontal.png')}
                    style={{ width: 80, height: 20, resizeMode: 'contain' }}
                />
            </View>

            <View style={{
                padding: 24,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: 32
            }}>
                <Text style={{ color: theme.colors.accent, fontWeight: "900", textTransform: 'uppercase', fontSize: 13, marginBottom: 4 }}>Reality Check</Text>
                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>
                    {stageHint}
                </Text>
                <Text style={{ marginTop: 8, color: theme.colors.muted, lineHeight: 22, fontSize: 15 }}>
                    {COPY.ONBOARDING_INTRO}
                </Text>
            </View>

            <View style={{ gap: 24 }}>
                <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Age range</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["18–24", "25–34", "35–44", "45–54", "55+"].map((v) => (
                            <Pill key={v} label={v} selected={ageRange === v} onPress={() => setAgeRange(v)} />
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Monthly income</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["<$2k/mo", "$2–4k/mo", "$4–7k/mo", "$7k+/mo"].map((v) => (
                            <Pill key={v} label={v} selected={incomeRange === v} onPress={() => setIncomeRange(v)} />
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Monthly expenses</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["<$2k/mo", "$2–4k/mo", "$4–7k/mo", "$7k+/mo"].map((v) => (
                            <Pill key={v} label={v} selected={expenseRange === v} onPress={() => setExpenseRange(v)} />
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Emergency fund</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["none", "<1 month", "1–3 months", "3–6 months", "6+ months"].map((v) => (
                            <Pill key={v} label={v} selected={emergencyFund === v} onPress={() => setEmergencyFund(v)} />
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Debt</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["none", "credit cards", "loans", "mixed"].map((v) => (
                            <Pill key={v} label={v} selected={debt === v} onPress={() => setDebt(v)} />
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Goal</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["learn", "long-term", "retirement", "idk"].map((v) => (
                            <Pill key={v} label={v} selected={goal === v} onPress={() => setGoal(v)} />
                        ))}
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Risk appetite: {risk}/10</Text>
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <Pill key={n} label={String(n)} selected={risk === n} onPress={() => setRisk(n)} />
                        ))}
                    </View>
                </View>

                <Pressable
                    onPress={() => setHasConsented(!hasConsented)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 16,
                        backgroundColor: theme.colors.card,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: hasConsented ? theme.colors.accent : theme.colors.border,
                        marginTop: 16
                    }}
                >
                    <MaterialCommunityIcons
                        name={hasConsented ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color={hasConsented ? theme.colors.accent : theme.colors.muted}
                    />
                    <Text style={{ flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>
                        I understand this is an <Text style={{ color: theme.colors.accent }}>educational simulation</Text>. I have read the <Pressable onPress={() => openLegalLink('Privacy Policy', 'https://northernstep.studio/noobs/privacy')}><Text style={{ color: theme.colors.accent, textDecorationLine: 'underline', top: 3 }}>Privacy Policy</Text></Pressable> and understand no real money is being invested.
                    </Text>

                </Pressable>

                <Pressable
                    onPress={() => {
                        handleComplete();
                    }}
                    style={({ pressed }) => ({
                        padding: 20,
                        borderRadius: theme.radius.pill,
                        backgroundColor: hasConsented ? theme.colors.accent : theme.colors.card,
                        opacity: pressed ? 0.9 : 1,
                        marginTop: 16,
                        borderWidth: 1,
                        borderColor: hasConsented ? theme.colors.accent : theme.colors.border
                    })}
                >
                    <Text style={{ color: hasConsented ? theme.colors.buttonText : theme.colors.muted, fontWeight: "900", textAlign: "center", fontSize: 18 }}>
                        {tr("DISCOVER THE PATH")}
                    </Text>
                </Pressable>

                <Text style={{ color: theme.colors.faint, textAlign: 'center', fontSize: 13, marginBottom: 20 }}>
                    {tr("Stored locally. No accounts. Just progress.")}
                </Text>
            </View>

            <Modal
                visible={showFreedomNumberIntro}
                animationType="slide"
                transparent={true}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: theme.colors.card, borderRadius: 32, padding: 32, width: '100%', maxWidth: 450, borderWidth: 1, borderColor: theme.colors.border }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>The Mission</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 16, letterSpacing: -1 }}>Your Freedom Number</Text>

                        <View style={{ backgroundColor: theme.colors.softCard, padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.colors.border }}>
                            <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24, fontWeight: '600', textAlign: 'center' }}>
                                This is the portfolio size where money stops stressing you out. It's when your savings work harder than you do.
                            </Text>
                        </View>

                        <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>Common Archetypes</Text>

                        <View style={{ gap: 12, marginBottom: 32 }}>
                            {[
                                { title: "COAST", desc: "Enough to never save again, but still working.", color: '#60A5FA' },
                                { title: "COMFORT", desc: "All expenses covered + some fun money.", color: '#4ADE80' },
                                { title: "FINANCIAL INDEPENDENCE", desc: "The ultimate goal. You're done with labor.", color: theme.colors.accent }
                            ].map((a, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: theme.colors.bg, borderRadius: 16 }}>
                                    <View style={{ width: 4, height: 24, backgroundColor: a.color, borderRadius: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: a.color, fontWeight: '900', fontSize: 12 }}>{a.title}</Text>
                                        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>{a.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <Pressable
                            onPress={() => {
                                setShowFreedomNumberIntro(false);
                                setShowPathOrientation(true);
                            }}
                            style={({ pressed }) => ({
                                padding: 20,
                                borderRadius: theme.radius.pill,
                                backgroundColor: theme.colors.accent,
                                opacity: pressed ? 0.9 : 1,
                            })}
                        >
                            <Text style={{ color: theme.colors.buttonText, fontWeight: "900", textAlign: "center", fontSize: 18 }}>
                                UNDERSTOOD
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showPathOrientation}
                animationType="fade"
                transparent={true}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: theme.colors.card, borderRadius: 32, padding: 32, width: '100%', maxWidth: 450, borderWidth: 1, borderColor: theme.colors.border }}>
                        <Text style={{ color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>The Path</Text>
                        <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 24, letterSpacing: -1 }}>Your Step-By-Step Path</Text>

                        <View style={{ gap: 20, marginBottom: 32 }}>
                            <View style={{ flexDirection: 'row', gap: 16, padding: 16, backgroundColor: theme.colors.softCard, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border }}>
                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.accent + '20', justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>1. Guided Program</Text>
                                    <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600', marginTop: 4 }}>You start here. Master the boring basics of wealth building. Growth is your only mission.</Text>
                                </View>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <MaterialCommunityIcons name="arrow-down" size={24} color={theme.colors.faint} />
                            </View>

                            <View style={{ flexDirection: 'row', gap: 16, padding: 16, backgroundColor: theme.colors.softCard, borderRadius: 20, borderStyle: 'dotted', borderWidth: 2, borderColor: theme.colors.accent + '30' }}>
                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="crown" size={24} color={theme.colors.buttonText} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '900' }}>2. Advanced Income</Text>
                                    <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600', marginTop: 4 }}>The Finish Line. Once your Freedom Number is hit, enter the advanced path to harvest cash-flow.</Text>
                                </View>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => {
                                setShowPathOrientation(false);
                                setShowProPreview(true);
                            }}
                            style={({ pressed }) => ({
                                padding: 20,
                                borderRadius: theme.radius.pill,
                                backgroundColor: theme.colors.accent,
                                opacity: pressed ? 0.9 : 1,
                            })}
                        >
                            <Text style={{ color: theme.colors.buttonText, fontWeight: "900", textAlign: "center", fontSize: 18 }}>
                                EMBARK ON THE PATH
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showProPreview}
                animationType="slide"
                transparent={true}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: theme.colors.card, borderRadius: 32, padding: 32, width: '100%', maxWidth: 400 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.accent + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 24, alignSelf: 'center', borderWidth: 2, borderColor: theme.colors.accent }}>
                            <MaterialCommunityIcons name="star-face" size={40} color={theme.colors.accent} />
                        </View>

                        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>The Elite Key</Text>
                        <Text style={{ color: theme.colors.muted, fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 32 }}>Unlock the second half of the journey and professional specialty tools.</Text>

                        <View style={{ gap: 16, marginBottom: 32 }}>
                            {[
                                { icon: 'chart-line', text: 'Live Market Ticker (Tick-by-Tick)' },
                                { icon: 'bank', text: 'Elite Specialty Content (11-25)' },
                                { icon: 'clipboard-pulse', text: 'Daily Portfolio Health Scans' },
                                { icon: 'calculator', text: 'Limit Orders & Friction Tools' }
                            ].map((item, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <MaterialCommunityIcons name={item.icon as any} size={20} color={theme.colors.accent} />
                                    <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700' }}>{item.text}</Text>
                                </View>
                            ))}
                        </View>

                        <Pressable
                            onPress={finishOnboarding}
                            style={({ pressed }) => ({
                                padding: 20,
                                borderRadius: theme.radius.pill,
                                backgroundColor: theme.colors.accent,
                                opacity: pressed ? 0.9 : 1,
                                marginBottom: 12
                            })}
                        >
                            <Text style={{ color: theme.colors.buttonText, fontWeight: "900", textAlign: "center", fontSize: 16 }}>
                                START THE JOURNEY
                            </Text>
                        </Pressable>
                        <Text style={{ color: theme.colors.faint, fontSize: 12, textAlign: 'center', fontWeight: '600' }}>Upgrade any time to Master the Path.</Text>
                    </View>
                </View>
            </Modal>

            <View style={{ height: 40 }} />
        </Screen >
    );
}
