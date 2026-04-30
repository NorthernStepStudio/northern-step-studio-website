import React, { useState, useCallback } from "react";
import { Text, Pressable, Alert, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { resetDb } from "../storage/db";
import { Screen } from "../components/Screen";
import { theme } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVelocityNavigate } from "../hooks/useVelocityNavigate";

import { getMedalsWithStatus, Medal } from "../storage/achievements";
import { useFocusEffect } from "expo-router";
import { restorePurchase, checkProStatus } from "../storage/subscription";
import { getBlackSwanEvents, BlackSwanEvent, clearBlackSwanEvents } from "../storage/events";
import { getUserResidency, ResidencyInfo } from "../storage/residency";
import { ProPaywall } from "../components/ProPaywall";
import { useI18n } from "../i18n";


export default function Settings() {
    const router = useRouter();
    const { screenRef, navigate } = useVelocityNavigate();
    const { language, setLanguage, t, tr } = useI18n();
    const [medals, setMedals] = useState<Medal[]>([]);
    const [isPro, setIsPro] = useState(false);
    const [events, setEvents] = useState<BlackSwanEvent[]>([]);
    const [residency, setResidency] = useState<ResidencyInfo | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);


    useFocusEffect(
        useCallback(() => {
            getMedalsWithStatus().then(setMedals);
            checkProStatus().then(s => setIsPro(s.isPro));
            getBlackSwanEvents().then(setEvents);
            getUserResidency().then(setResidency);
        }, [])
    );

    const handleRestorePurchase = async () => {
        const success = await restorePurchase();
        if (success) {
            setIsPro(true);
            Alert.alert(tr('Success'), tr('Your Pro status has been restored.'));
        } else {
            Alert.alert(
                tr('No Purchase Found'),
                tr('We couldn\'t find any previous Pro purchases for this account.')
            );
        }
    };

    const openLegalLink = (title: string, url: string) => {
        Alert.alert(tr(title), `${tr('Link to: ')}${url}${tr('\n\n(In production, this would open the browser)')}`);
    };

    return (
        <Screen ref={screenRef} safeTop={true} hideHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>{t("settings.accountTitle")}</Text>
            </View>

            {/* Path Identity Section */}
            <View style={{ marginBottom: 32 }}>
                <Text style={{ fontWeight: "900", color: theme.colors.accent, fontSize: 13, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 }}>{t("settings.currentPathStatus")}</Text>
                {residency && (
                    <View style={{ padding: 24, borderRadius: 24, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: residency.color + '30', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: residency.color + '20', justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons
                                name={residency.icon}
                                size={32}
                                color={residency.color}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900' }}>
                                {residency.name}
                            </Text>
                            <Text style={{ color: theme.colors.muted, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                                {residency.description.split('.')[0]}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Truth Medals Section */}
            <View style={{ marginBottom: 32 }}>
                <Text style={{ fontWeight: "900", color: theme.colors.accent, fontSize: 13, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 }}>{t("settings.truthMedals")}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {medals.map((medal) => (
                        <Pressable
                            key={medal.id}
                            onPress={() => Alert.alert(tr(medal.name), tr(medal.description))}
                            style={{
                                width: '31%',
                                aspectRatio: 1,
                                backgroundColor: theme.colors.card,
                                borderRadius: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: medal.unlocked ? theme.colors.accent : theme.colors.border,
                                opacity: medal.unlocked ? 1 : 0.4,
                                padding: 8
                            }}
                        >
                            <Text style={{ fontSize: 32, marginBottom: 4 }}>{medal.icon}</Text>
                            <Text style={{ color: theme.colors.text, fontSize: 10, fontWeight: '900', textAlign: 'center', opacity: medal.unlocked ? 1 : 0.6 }}>
                                {medal.name.toUpperCase()}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Psychology Simulator CTA (Relocated) */}
            <Pressable
                onPress={() => {
                    if (!isPro) {
                        setShowPaywall(true);
                    } else {
                        navigate('/loss-simulator');
                    }
                }}

                style={({ pressed }) => ({
                    padding: 24,
                    borderRadius: 24,
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: isPro ? theme.colors.accent + '40' : theme.colors.border,
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    opacity: pressed ? 0.9 : 1
                })}
            >
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isPro ? theme.colors.accent + '20' : theme.colors.accent + '10', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="brain" size={32} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>{t("settings.decisionTest")}</Text>
                        {!isPro && <MaterialCommunityIcons name="crown" size={16} color={theme.colors.accent} />}
                    </View>
                    <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                        {t("settings.decisionTestSubtitle")}
                    </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.faint} />
            </Pressable>

            <View style={{ gap: 16 }}>
                <View style={{ padding: 24, borderRadius: 24, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.accent, fontSize: 13, textTransform: 'uppercase', marginBottom: 12 }}>{t("settings.languageSection")}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable
                            onPress={() => setLanguage("en")}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 14,
                                backgroundColor: language === "en" ? theme.colors.accent : theme.colors.bg,
                                borderWidth: 1,
                                borderColor: language === "en" ? theme.colors.accent : theme.colors.border,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: language === "en" ? theme.colors.buttonText : theme.colors.text, fontWeight: '800' }}>{t("common.english")}</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setLanguage("es")}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 14,
                                backgroundColor: language === "es" ? theme.colors.accent : theme.colors.bg,
                                borderWidth: 1,
                                borderColor: language === "es" ? theme.colors.accent : theme.colors.border,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: language === "es" ? theme.colors.buttonText : theme.colors.text, fontWeight: '800' }}>{t("common.spanish")}</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ padding: 24, borderRadius: 24, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ fontWeight: "900", color: theme.colors.accent, fontSize: 13, textTransform: 'uppercase', marginBottom: 8 }}>{t("settings.legalDisclosure")}</Text>
                    <Text style={{ opacity: 0.85, lineHeight: 22, color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>
                        NooBS Investing is an <Text style={{ color: theme.colors.accent }}>{tr("educational simulation")}</Text>. All assets, prices, and portfolios are for training and entertainment purposes only. No real money or securities are traded within this app. This is not professional financial, tax, or legal advice. Invest at your own risk.
                    </Text>
                </View>

                {/* Black Swan Log (Pro) */}
                {isPro && (
                    <View style={{ padding: 24, borderRadius: 24, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontWeight: "900", color: theme.colors.accent, fontSize: 13, textTransform: 'uppercase' }}>{t("settings.blackSwanLog")}</Text>
                            <Pressable onPress={async () => {
                                await clearBlackSwanEvents();
                                setEvents([]);
                            }}>
                                <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: '800' }}>{t("settings.clearLog")}</Text>
                            </Pressable>
                        </View>

                        {events.length === 0 ? (
                            <Text style={{ color: theme.colors.muted, fontSize: 14, fontStyle: 'italic' }}>{tr("No major shocks recorded yet. The market is eerily calm...")}</Text>
                        ) : (
                            <View style={{ gap: 12 }}>
                                {events.slice(0, 5).map((ev) => (
                                    <View key={ev.id} style={{ borderLeftWidth: 2, borderLeftColor: ev.type === 'MOON' ? theme.colors.success : theme.colors.danger, paddingLeft: 12, paddingVertical: 4 }}>
                                        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '800' }}>{ev.headline}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                                            <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '600' }}>
                                                {new Date(ev.timestamp).toLocaleDateString()}
                                            </Text>
                                            <Text style={{ color: ev.type === 'MOON' ? theme.colors.success : theme.colors.danger, fontSize: 11, fontWeight: '900' }}>
                                                {ev.magnitude > 0 ? '+' : ''}{ev.magnitude.toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Pro Access / Restore */}
                <View style={{ gap: 12, marginBottom: 32 }}>
                    {!isPro && (
                        <Pressable
                            onPress={() => setShowPaywall(true)}
                            style={({ pressed }) => ({
                                padding: 24,
                                borderRadius: 24,
                                backgroundColor: theme.colors.accent,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 12,
                                opacity: pressed ? 0.9 : 1,
                                shadowColor: theme.colors.accent,
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 8
                            })}
                        >
                            <MaterialCommunityIcons name="crown" size={24} color={theme.colors.buttonText} />
                            <Text style={{ color: theme.colors.buttonText, fontWeight: "900", fontSize: 18 }}>
                                {t("settings.unlockPro")}
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={handleRestorePurchase}
                        style={({ pressed }) => ({
                            padding: 16,
                            borderRadius: 20,
                            backgroundColor: theme.colors.card,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            alignItems: 'center',
                            opacity: pressed ? 0.9 : 1
                        })}
                    >
                        <Text style={{ color: theme.colors.accent, fontWeight: "800", fontSize: 14 }}>
                            {t("settings.restorePurchases")}
                        </Text>
                    </Pressable>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 8 }}>
                        <Pressable onPress={() => openLegalLink(t("settings.privacyPolicy"), 'https://northernstep.studio/noobs/privacy')}>
                            <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }}>{t("settings.privacyPolicy")}</Text>
                        </Pressable>
                        <Pressable onPress={() => openLegalLink(t("settings.termsOfService"), 'https://northernstep.studio/noobs/terms')}>
                            <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }}>{t("settings.termsOfService")}</Text>
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    onPress={() => navigate("/philosophy")}
                    style={({ pressed }) => ({
                        padding: 24,
                        borderRadius: 24,
                        backgroundColor: theme.colors.card,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: pressed ? 0.9 : 1
                    })}
                >
                    <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 18 }}>
                        {t("settings.readRules")}
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.faint} />
                </Pressable>

                <Pressable
                    onPress={() => {
                        Alert.alert(
                            tr("Reset all data?"),
                            tr("This deletes everything. Yes, even your fake money glory."),
                            [
                                { text: tr("Cancel"), style: "cancel" },
                                {
                                    text: tr("Reset"),
                                    style: "destructive",
                                    onPress: async () => {
                                        await resetDb();
                                        router.replace("/onboarding" as any);
                                    },
                                },
                            ]
                        );
                    }}
                    style={({ pressed }) => ({
                        padding: 20,
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.colors.danger,
                        opacity: pressed ? 0.9 : 1,
                        marginTop: 16
                    })}
                >
                    <Text style={{ color: theme.colors.text, fontWeight: "900", textAlign: "center", fontSize: 18 }}>
                        {t("settings.resetAllData")}
                    </Text>
                </Pressable>
            </View>
            <View style={{ marginTop: 40, alignItems: 'center', opacity: 0.6 }}>
                <Image
                    source={require('../assets/branding/logo_horizontal.png')}
                    style={{ width: 140, height: 40, resizeMode: 'contain', marginBottom: 8 }}
                />
                <Text style={{ color: theme.colors.faint, fontSize: 10, fontWeight: '700' }}>{t("settings.versionLabel")}</Text>
            </View>
            <View style={{ height: 60 }} />

            <ProPaywall
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                onUnlock={() => {
                    setIsPro(true);
                    setShowPaywall(false);
                    Alert.alert(tr("Welcome to the Elite"), tr("You now have full access to all Pro features."));
                }}
            />
        </Screen>

    );
}
