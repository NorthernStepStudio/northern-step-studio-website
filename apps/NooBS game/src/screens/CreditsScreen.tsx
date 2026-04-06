
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Pressable, Animated } from 'react-native';
import { theme } from '../constants/theme';
import { HoloBackground } from '../components/future/HoloBackground';
import { TechCard } from '../components/future/TechCard';
import { GlitchText } from '../components/future/GlitchText';

type CreditsScreenProps = {
    visible: boolean;
    onClose: () => void;
};

const TEAM = [
    { role: "SYSTEM ARCHITECT", name: "Northern Step Studio" },
    { role: "UI ENGINEERING", name: "Northern Step Studio & Antigravity" },
    { role: "NARRATIVE DESIGN", name: "Northern Step Studio" },
];

const SYSTEM_MESSAGES = [
    "The most important organ in investing is the stomach, not the brain.",
    "The market is a device for transferring money from the impatient to the patient.",
    "Be fearful when others are greedy and greedy when others are fearful.",
    "Price is what you pay. Value is what you get.",
    "Risk comes from not knowing what you are doing.",
    "In the short run, the market is a voting machine but in the long run, it is a weighing machine.",
    "Opportunities come infrequently. When it rains gold, put out the bucket, not the thimble.",
    "It is far better to buy a wonderful company at a fair price than a fair company at a wonderful price."
];

export function CreditsScreen({ visible, onClose }: CreditsScreenProps) {
    const [msgIndex, setMsgIndex] = React.useState(0);
    const [fadeAnim] = React.useState(new Animated.Value(1));

    React.useEffect(() => {
        if (!visible) return;

        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true
            }).start(() => {
                // Change index (cycle continuously without repeat)
                setMsgIndex(prev => (prev + 1) % SYSTEM_MESSAGES.length);

                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                }).start();
            });
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [visible]);

    return (
        <Modal visible={visible} animationType="fade" presentationStyle="fullScreen">
            <HoloBackground>
                <View style={styles.container}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <GlitchText text="OPERATIVE LOGS // CREDITS" style={styles.headerText} speed={20} duration={1000} />
                        <Pressable onPress={onClose} style={styles.closeButtonContainer}>
                            {({ pressed }) => (
                                <View style={[styles.closeButton, pressed && { opacity: 0.5 }]}>
                                    <Text style={styles.closeText}>[ X ]</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>

                        {/* PROJECT TITLE CARD */}
                        <TechCard delay={200} style={styles.titleCard}>
                            <View style={styles.versionBadge}>
                                <Text style={styles.versionText}>CONFIDENTIAL // EYES ONLY</Text>
                            </View>
                            <GlitchText text="PROJECT: RESIDENCY" style={styles.title} speed={10} duration={1500} />
                        </TechCard>

                        {/* TEAM MANIFEST */}
                        <TechCard delay={400}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>ACTIVE PERSONNEL MANIFEST</Text>
                            </View>

                            <View style={styles.teamList}>
                                {TEAM.map((member, index) => (
                                    <View key={index} style={styles.row}>
                                        <Text style={styles.role}>{member.role}</Text>
                                        <View style={styles.dots} />
                                        <Text style={styles.name}>{member.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </TechCard>

                        {/* QUOTE / FOOTER */}
                        <TechCard delay={600} style={styles.quoteCard}>
                            <Animated.Text style={[styles.quoteText, { opacity: fadeAnim }]}>
                                "{SYSTEM_MESSAGES[msgIndex]}"
                            </Animated.Text>
                            <Text style={styles.author}>— THE RESIDENCY PROTOCOL</Text>
                        </TechCard>

                        <Text style={styles.endText}>END OF FILE</Text>

                    </ScrollView>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <GlitchText text="NooBS SYSTEM V5.0 // AETHER" style={styles.footerText} speed={5} duration={2000} />
                    </View>
                </View>
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
        color: theme.colors.accent, // High contrast
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: -0.5,
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
        padding: 24,
        gap: 24,
    },
    titleCard: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 16,
    },
    versionBadge: {
        borderWidth: 1,
        borderColor: theme.colors.danger,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    versionText: {
        color: theme.colors.danger,
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    title: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -1,
        textAlign: 'center',
    },
    sectionHeader: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        color: theme.colors.text, // White
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    teamList: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    role: {
        color: theme.colors.accent, // Accent color for roles
        fontFamily: 'monospace',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    dots: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        borderStyle: 'dotted',
        opacity: 0.6,
        marginHorizontal: 8,
        height: 1,
        alignSelf: 'center',
    },
    name: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '800',
    },
    quoteCard: {
        padding: 24,
        alignItems: 'center',
        gap: 16,
    },
    quoteText: {
        color: theme.colors.text,
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
        fontFamily: 'monospace',
    },
    author: {
        color: theme.colors.accent,
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    endText: {
        color: theme.colors.faint,
        fontFamily: 'monospace',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 20,
        opacity: 1,
        letterSpacing: 4,
    },
    footer: {
        marginTop: 'auto',
        padding: 24,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    footerText: {
        fontSize: 10,
        fontFamily: 'monospace',
        fontWeight: '700',
        letterSpacing: 2,
        opacity: 1,
        color: theme.colors.accent // High visibility
    }
});
