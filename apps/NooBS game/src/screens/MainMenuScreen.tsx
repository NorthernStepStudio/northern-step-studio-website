import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme } from "../constants/theme";
import { StatusBar } from "expo-status-bar";
import { SettingsScreen } from "./SettingsScreen";
import { CreditsScreen } from "./CreditsScreen";
import { HoloBackground } from "../components/future/HoloBackground";
import { GlitchText } from "../components/future/GlitchText";
import { TechCard } from "../components/future/TechCard";
import { NotificationSettings } from "../game/notificationSettings";

interface MainMenuScreenProps {
    onStart: () => void | Promise<void>;
    onContinue: () => void | Promise<void>;
    canContinue: boolean;
    timeScale: "FOUR_DAYS" | "ONE_WEEK" | "ONE_MONTH";
    onTimeScaleChange: (timeScale: "FOUR_DAYS" | "ONE_WEEK" | "ONE_MONTH") => void;
    notificationSettings: NotificationSettings;
    onNotificationSettingsChange: (settings: NotificationSettings) => void;
}

export function MainMenuScreen({
    onStart,
    onContinue,
    canContinue,
    timeScale,
    onTimeScaleChange,
    notificationSettings,
    onNotificationSettingsChange,
}: MainMenuScreenProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [showCredits, setShowCredits] = useState(false);

    return (
        <HoloBackground>
            <StatusBar style="light" />

            <View style={styles.contentContainer}>
                {/* HERO TITLE SECTION */}
                <View style={styles.titleSection}>
                    <GlitchText text="MARKET" style={styles.gameTitle} speed={30} duration={800} />
                    <GlitchText text="RESIDENCY" style={styles.gameTitle} speed={30} duration={1200} />
                    <View style={styles.versionTagContainer}>
                        <GlitchText text="NooBS SYSTEM V5.0 // AETHER" style={styles.versionTag} speed={10} duration={2000} />
                    </View>
                </View>

                {/* PRIMARY ACTION - "PRESS START" STYLE */}
                <Pressable
                    onPress={canContinue ? onContinue : onStart}
                    style={{ width: '100%' }}
                >
                    {({ pressed }) => (
                        <TechCard style={[styles.heroButtonCard, pressed && { opacity: 0.8 }]} delay={500}>
                            <View style={styles.heroContent}>
                                <GlitchText
                                    text={canContinue ? "RESUME SESSION" : "INITIATE PROTOCOL"}
                                    style={styles.heroButtonText}
                                    speed={20}
                                    duration={600}
                                />
                                <Text style={styles.heroButtonSub}>
                                    [ {canContinue ? "CONTINUE SIMULATION" : "START NEW GAME"} ]
                                </Text>
                            </View>
                        </TechCard>
                    )}
                </Pressable>

                {/* SECONDARY MENU */}
                <View style={styles.secondaryMenu}>
                    {canContinue && (
                        <SecondaryButton label="RESTART SESSION" onPress={onStart} delay={700} />
                    )}
                    <SecondaryButton label="SYSTEM DIAGNOSTICS" onPress={() => setShowSettings(true)} delay={900} />
                    <SecondaryButton label="OPERATIVE LOGS" onPress={() => setShowCredits(true)} delay={1100} />
                </View>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>SECURE TERMINAL ACCESS // AUTHORIZED</Text>
            </View>

            <SettingsScreen
                visible={showSettings}
                onClose={() => setShowSettings(false)}
                onRestart={() => {
                    setShowSettings(false);
                    onStart();
                }}
                timeScale={timeScale}
                onTimeScaleChange={onTimeScaleChange}
                notificationSettings={notificationSettings}
                onNotificationSettingsChange={onNotificationSettingsChange}
            />
            <CreditsScreen
                visible={showCredits}
                onClose={() => setShowCredits(false)}
            />
        </HoloBackground>
    );
}

function SecondaryButton({ label, onPress, delay }: { label: string, onPress: () => void, delay?: number }) {
    return (
        <Pressable onPress={onPress} style={{ width: '80%' }}>
            {({ pressed }) => (
                <TechCard style={[styles.secButton, pressed && { opacity: 0.7 }]} delay={delay}>
                    <Text style={styles.secButtonText}>[ {label} ]</Text>
                </TechCard>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanline: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        zIndex: 10,
        opacity: 0.03,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
    },
    contentContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 24,
        gap: 60,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    gameTitle: {
        color: theme.colors.text,
        fontSize: 48,
        fontWeight: "900",
        textAlign: 'center',
        letterSpacing: -2,
        lineHeight: 48,
        marginBottom: 16,
    },
    versionTagContainer: {
        borderWidth: 1,
        borderColor: theme.colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 2,
    },
    versionTag: {
        color: theme.colors.accent,
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 2,
    },
    heroButtonCard: {
        width: '100%',
    },
    heroContent: {
        alignItems: 'center',
        paddingVertical: 20
    },
    heroButtonText: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 8,
        textAlign: 'center'
    },
    heroButtonSub: {
        color: theme.colors.accent,
        fontSize: 10,
        fontWeight: "700",
        fontFamily: "monospace",
        letterSpacing: 3,
        opacity: 0.8,
    },
    secondaryMenu: {
        gap: 16,
        alignItems: 'center',
        width: '100%',
    },
    secButton: {
        width: '100%',
        paddingVertical: 12,
    },
    secButtonText: {
        color: theme.colors.muted,
        fontSize: 14,
        fontWeight: "900",
        fontFamily: "monospace",
        letterSpacing: 1,
        textAlign: 'center'
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        opacity: 0.9,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.faint,
        fontSize: 10,
        fontFamily: "monospace",
        fontWeight: "700",
        letterSpacing: 2,
        textAlign: 'center',
    },
});
