
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert, Pressable, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { clearSave } from '../game/storage';
import { HoloBackground } from '../components/future/HoloBackground';
import { TechCard } from '../components/future/TechCard';
import { GlitchText } from '../components/future/GlitchText';
import { NotificationSettings } from '../game/notificationSettings';
import { logger, LogEntry } from '../game/logger';

type SettingsScreenProps = {
    visible: boolean;
    onClose: () => void;
    onRestart?: () => void | Promise<void>; // Optional restart entire app flow
    timeScale: "FOUR_DAYS" | "ONE_WEEK" | "ONE_MONTH";
    onTimeScaleChange: (timeScale: "FOUR_DAYS" | "ONE_WEEK" | "ONE_MONTH") => void;
    notificationSettings: NotificationSettings;
    onNotificationSettingsChange: (settings: NotificationSettings) => void;
};

const TIME_SCALE_LABELS: Record<SettingsScreenProps["timeScale"], string> = {
    FOUR_DAYS: "4 DAYS",
    ONE_WEEK: "1 WEEK",
    ONE_MONTH: "1 MONTH",
};

export function SettingsScreen({
    visible,
    onClose,
    onRestart,
    timeScale,
    onTimeScaleChange,
    notificationSettings,
    onNotificationSettingsChange
}: SettingsScreenProps) {
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [showMetricsGuide, setShowMetricsGuide] = useState(false);

    const handleClearData = async () => {
        Alert.alert(
            "PURGE ARCHIVES",
            "CONFIRMATION REQUIRED: Irreversible deletion of all user protocols. Proceed?",
            [
                { text: "ABORT", style: "cancel" },
                {
                    text: "EXECUTE PURGE",
                    style: "destructive",
                    onPress: async () => {
                        await clearSave();
                        if (onRestart) onRestart();
                        onClose();
                    }
                }
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="fade" presentationStyle="fullScreen">
            <HoloBackground>
                <View style={styles.container}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <GlitchText text="SYSTEM DIAGNOSTICS" style={styles.headerText} speed={20} duration={1000} />
                        <Pressable onPress={onClose} style={styles.closeButtonContainer}>
                            {({ pressed }) => (
                                <View style={[styles.closeButton, pressed && { opacity: 0.5 }]}>
                                    <Text style={styles.closeText}>[ X ]</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
                        {/* SIMULATION SPEED */}
                        <TechCard delay={100}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>SIMULATION TIME SCALE</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{TIME_SCALE_LABELS[timeScale]}</Text>
                                </View>
                            </View>

                            <View style={styles.controls}>
                                {(Object.keys(TIME_SCALE_LABELS) as SettingsScreenProps["timeScale"][]).map(option => {
                                    const isActive = option === timeScale;
                                    return (
                                        <Pressable
                                            key={option}
                                            onPress={() => onTimeScaleChange(option)}
                                            style={({ pressed }) => [
                                                styles.controlBtn,
                                                pressed && styles.pressedBtn,
                                                isActive && styles.activeBtn
                                            ]}
                                        >
                                            <Text style={[styles.btnText, isActive && styles.activeBtnText]}>
                                                {TIME_SCALE_LABELS[option]}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                            <Text style={styles.warningText}>
                                Faster scales advance months more quickly. Slower scales give you more time between events.
                            </Text>
                        </TechCard>

                        {/* NOTIFICATION SETTINGS */}
                        <TechCard delay={200}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>NOTIFICATION PROTOCOLS</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{notificationSettings.enabled ? "ENABLED" : "DISABLED"}</Text>
                                </View>
                            </View>

                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>MASTER</Text>
                                <Pressable
                                    onPress={() => onNotificationSettingsChange({
                                        ...notificationSettings,
                                        enabled: !notificationSettings.enabled
                                    })}
                                    style={({ pressed }) => [
                                        styles.toggleButton,
                                        notificationSettings.enabled && styles.toggleButtonActive,
                                        pressed && styles.pressedBtn
                                    ]}
                                >
                                    <Text style={[styles.toggleButtonText, notificationSettings.enabled && styles.toggleButtonTextActive]}>
                                        {notificationSettings.enabled ? "ON" : "OFF"}
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>PAYDAY ALERTS</Text>
                                <Pressable
                                    disabled={!notificationSettings.enabled}
                                    onPress={() => onNotificationSettingsChange({
                                        ...notificationSettings,
                                        payday: !notificationSettings.payday
                                    })}
                                    style={({ pressed }) => [
                                        styles.toggleButton,
                                        notificationSettings.payday && notificationSettings.enabled && styles.toggleButtonActive,
                                        !notificationSettings.enabled && styles.disabledButton,
                                        pressed && styles.pressedBtn
                                    ]}
                                >
                                    <Text style={[styles.toggleButtonText, notificationSettings.payday && notificationSettings.enabled && styles.toggleButtonTextActive]}>
                                        {notificationSettings.payday ? "ON" : "OFF"}
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>NEWS ALERTS</Text>
                                <Pressable
                                    disabled={!notificationSettings.enabled}
                                    onPress={() => onNotificationSettingsChange({
                                        ...notificationSettings,
                                        breakingNews: !notificationSettings.breakingNews
                                    })}
                                    style={({ pressed }) => [
                                        styles.toggleButton,
                                        notificationSettings.breakingNews && notificationSettings.enabled && styles.toggleButtonActive,
                                        !notificationSettings.enabled && styles.disabledButton,
                                        pressed && styles.pressedBtn
                                    ]}
                                >
                                    <Text style={[styles.toggleButtonText, notificationSettings.breakingNews && notificationSettings.enabled && styles.toggleButtonTextActive]}>
                                        {notificationSettings.breakingNews ? "ON" : "OFF"}
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>ALERT DENSITY</Text>
                            </View>
                            <View style={styles.controls}>
                                {(["LOW", "STANDARD", "HIGH"] as NotificationSettings["frequency"][]).map(option => {
                                    const isActive = notificationSettings.frequency === option;
                                    return (
                                        <Pressable
                                            key={option}
                                            disabled={!notificationSettings.enabled}
                                            onPress={() => onNotificationSettingsChange({
                                                ...notificationSettings,
                                                frequency: option
                                            })}
                                            style={({ pressed }) => [
                                                styles.controlBtn,
                                                pressed && styles.pressedBtn,
                                                isActive && styles.activeBtn,
                                                !notificationSettings.enabled && styles.disabledButton
                                            ]}
                                        >
                                            <Text style={[styles.btnText, isActive && styles.activeBtnText]}>
                                                {option}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                            <Text style={styles.warningText}>
                                Lower density reduces non-essential alerts. Payday alerts are still limited to once per month.
                            </Text>
                        </TechCard>

                        {/* AUDIO SECTION */}
                        <TechCard delay={400}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>AUDIO OUTPUT PROTOCOL</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={[styles.statusText, { color: isMuted ? theme.colors.danger : theme.colors.success }]}>
                                        {isMuted ? "MUTED" : "ACTIVE"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.controls}>
                                <Pressable
                                    onPress={() => setIsMuted(!isMuted)}
                                    style={({ pressed }) => [styles.controlBtn, pressed && styles.pressedBtn, isMuted && styles.activeBtn]}
                                >
                                    <Text style={[styles.btnText, isMuted && styles.activeBtnText]}>MUTE</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => setVolume(v => Math.max(0, v - 10))}
                                    style={({ pressed }) => [styles.controlBtn, styles.smallBtn, pressed && styles.pressedBtn]}
                                >
                                    <Text style={styles.btnText}>-</Text>
                                </Pressable>

                                {/* VOLUME VISUALIZER */}
                                <View style={styles.volumeTrack}>
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const isActive = !isMuted && (i + 1) * 10 <= volume;
                                        return (
                                            <View
                                                key={i}
                                                style={[
                                                    styles.volBlock,
                                                    isActive ? { backgroundColor: theme.colors.accent, opacity: 1 } : { backgroundColor: theme.colors.border, opacity: 0.3 }
                                                ]}
                                            />
                                        );
                                    })}
                                </View>

                                <Pressable
                                    onPress={() => setVolume(v => Math.min(100, v + 10))}
                                    style={({ pressed }) => [styles.controlBtn, styles.smallBtn, pressed && styles.pressedBtn]}
                                >
                                    <Text style={styles.btnText}>+</Text>
                                </Pressable>
                            </View>
                        </TechCard>

                        {/* METRICS GUIDE */}
                        <TechCard delay={500}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>PERFORMANCE METRICS GUIDE</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>INFO</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => setShowMetricsGuide(true)}
                                style={({ pressed }) => [styles.metricsButton, pressed && styles.pressedBtn]}
                            >
                                <Text style={styles.metricsButtonText}>OPEN GUIDE</Text>
                            </Pressable>
                            <Text style={styles.warningText}>
                                Learn how Compliance, Restraint, Discipline, and Conviction are evaluated.
                            </Text>
                        </TechCard>

                        {/* DATA MANAGEMENT */}
                        <TechCard delay={650} style={{ borderColor: theme.colors.danger }}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.danger }]}>DATA MANAGEMENT PROTOCOL</Text>
                                <View style={[styles.statusBadge, { borderColor: theme.colors.danger }]}>
                                    <Text style={[styles.statusText, { color: theme.colors.danger }]}>WARNING</Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={handleClearData}
                                style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.7 }]}
                            >
                                <Text style={styles.dangerButtonText}>INITIATE SYSTEM PURGE</Text>
                            </Pressable>
                            <Text style={styles.warningText}>
                                CAUTION: THIS ACTION WILL PERMANENTLY ERASE ALL LOCALLY STORED PROFILES AND SIMULATION DATA.
                            </Text>
                        </TechCard>

                        {/* DIAGNOSTICS LOG */}
                        <TechCard delay={800}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>REAL-TIME DIAGNOSTIC LOG</Text>
                                <Pressable onPress={() => logger.info("Diagnostic Ping")}>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>PING</Text>
                                    </View>
                                </Pressable>
                            </View>
                            <View style={styles.logContainer}>
                                <ScrollView nestedScrollEnabled style={styles.logScroll}>
                                    {logger.getLogs().reverse().map((log, i) => (
                                        <View key={i} style={styles.logEntry}>
                                            <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                                            <Text numberOfLines={1} style={[styles.logMsg, { color: getLogColor(log.level) }]}>
                                                [{log.level}] {log.message}
                                            </Text>
                                        </View>
                                    ))}
                                    {logger.getLogs().length === 0 && (
                                        <Text style={styles.logEmpty}>NO ACTIVE LOG ENTRIES</Text>
                                    )}
                                </ScrollView>
                            </View>
                        </TechCard>
                    </ScrollView>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <GlitchText text="NooBS SYSTEM V5.0 // AETHER" style={styles.footerText} speed={5} duration={2000} />
                    </View>
                </View>

                <Modal visible={showMetricsGuide} animationType="fade" presentationStyle="fullScreen">
                    <HoloBackground>
                        <View style={styles.metricsContainer}>
                            <View style={styles.metricsHeader}>
                                <View style={styles.metricsHeaderTitles}>
                                    <GlitchText text="METRICS" style={styles.headerText} speed={18} duration={800} />
                                    <GlitchText text="GUIDE" style={styles.headerText} speed={22} duration={1000} />
                                </View>
                                <Pressable onPress={() => setShowMetricsGuide(false)} style={styles.closeButtonContainer}>
                                    {({ pressed }) => (
                                        <View style={[styles.closeButton, pressed && { opacity: 0.5 }]}>
                                            <Text style={styles.closeText}>[ X ]</Text>
                                        </View>
                                    )}
                                </Pressable>
                            </View>

                            <ScrollView style={styles.metricsScroll} contentContainerStyle={styles.metricsContent} showsVerticalScrollIndicator={false}>
                                <TechCard style={styles.metricsCard} delay={120}>
                                    <Text style={styles.metricsTitle}>COMPLIANCE INDEX (0-100)</Text>
                                    <Text style={styles.metricsBody}>
                                        Measures how closely you follow your selected protocols. Selling during restricted
                                        events or breaking rules reduces this score. Higher is better.
                                    </Text>
                                </TechCard>

                                <TechCard style={styles.metricsCard} delay={200}>
                                    <Text style={styles.metricsTitle}>RESTRAINT LEVEL</Text>
                                    <Text style={styles.metricsBody}>
                                        Represents patience under volatility. Holding through drawdowns improves restraint.
                                        Panic selling or impulsive moves will lower it.
                                    </Text>
                                </TechCard>

                                <TechCard style={styles.metricsCard} delay={280}>
                                    <Text style={styles.metricsTitle}>DISCIPLINE LEVEL</Text>
                                    <Text style={styles.metricsBody}>
                                        Tracks adherence to planned behavior. Rebalancing responsibly or sticking to rules
                                        raises discipline. Breaking protocols reduces it.
                                    </Text>
                                </TechCard>

                                <TechCard style={styles.metricsCard} delay={360}>
                                    <Text style={styles.metricsTitle}>CONVICTION LEVEL</Text>
                                    <Text style={styles.metricsBody}>
                                        Reflects confidence in the plan during uncertainty. Buying with intention and
                                        holding through fear increases conviction. Exiting at the worst time lowers it.
                                    </Text>
                                </TechCard>
                            </ScrollView>
                        </View>
                    </HoloBackground>
                </Modal>
            </HoloBackground>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 80, // Matches Dashboard spacing
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerText: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -1,
    },
    closeButtonContainer: {
        padding: 8,
    },
    closeButton: {
        borderWidth: 1,
        borderColor: theme.colors.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 2,
    },
    closeText: {
        color: theme.colors.accent,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        padding: 24,
        gap: 24,
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    statusBadge: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        height: 40,
    },
    controlBtn: {
        height: '100%',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    smallBtn: {
        paddingHorizontal: 12,
        minWidth: 40,
    },
    pressedBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        transform: [{ scale: 0.98 }]
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    toggleLabel: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 11,
        letterSpacing: 1,
    },
    toggleButton: {
        minWidth: 72,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    toggleButtonActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    toggleButtonText: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 10,
        letterSpacing: 1,
    },
    toggleButtonTextActive: {
        color: '#000',
    },
    disabledButton: {
        opacity: 0.5,
    },
    metricsButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    metricsButtonText: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 11,
        letterSpacing: 1,
    },
    activeBtn: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    btnText: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 12,
    },
    activeBtnText: {
        color: '#000',
    },
    volumeTrack: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        gap: 2,
    },
    volBlock: {
        flex: 1,
        height: '60%',
        borderRadius: 1,
    },
    dangerButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)', // theme.colors.danger with opacity
        borderWidth: 1,
        borderColor: theme.colors.danger,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    dangerButtonText: {
        color: theme.colors.danger,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    },
    warningText: {
        color: theme.colors.faint,
        fontSize: 10,
        fontFamily: 'monospace',
        textAlign: 'center',
        lineHeight: 14,
    },
    footer: {
        marginTop: 'auto',
        padding: 24,
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.faint,
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: '700',
        letterSpacing: 2,
        opacity: 0.9
    },
    metricsContainer: {
        flex: 1,
        paddingTop: 80,
    },
    metricsHeader: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    metricsHeaderTitles: {
        gap: 4,
    },
    metricsContent: {
        padding: 24,
        gap: 18,
    },
    metricsScroll: {
        flex: 1,
    },
    metricsCard: {
        padding: 16,
    },
    metricsTitle: {
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    metricsBody: {
        color: theme.colors.muted,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '600',
    },
    logContainer: {
        height: 150,
        backgroundColor: '#000',
        padding: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    logScroll: {
        flex: 1,
    },
    logEntry: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    logTime: {
        color: theme.colors.faint,
        fontFamily: 'monospace',
        fontSize: 9,
    },
    logMsg: {
        fontFamily: 'monospace',
        fontSize: 9,
        flex: 1,
    },
    logEmpty: {
        color: theme.colors.faint,
        fontFamily: 'monospace',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 60,
    }
});

function getLogColor(level: string) {
    switch (level) {
        case "ERROR": return theme.colors.danger;
        case "WARN": return theme.colors.input;
        case "SUCCESS": return theme.colors.success;
        default: return theme.colors.text;
    }
}
