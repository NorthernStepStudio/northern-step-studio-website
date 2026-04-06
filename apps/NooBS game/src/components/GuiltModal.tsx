import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type GuiltModalProps = {
    visible: boolean;
    violations: string[];
    onAcknowledge: () => void;
};

export function GuiltModal({ visible, violations, onAcknowledge }: GuiltModalProps) {
    if (violations.length === 0) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="alert-decagram" size={32} color={theme.colors.danger} />
                        <Text style={styles.title}>PROTOCOL BREACH DETECTED</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.intro}>
                            You have compromised your investment constitution. The following protocols were violated:
                        </Text>

                        {violations.map((v, i) => (
                            <View key={i} style={styles.errorBox}>
                                <Text style={styles.errorText}>{v.replace(/_/g, ' ')}</Text>
                            </View>
                        ))}

                        <View style={styles.impactBox}>
                            <Text style={styles.impactTitle}>PSYCHOMETRIC DEGRADATION</Text>
                            <View style={styles.impactRow}>
                                <Text style={styles.impactLabel}>PATIENCE</Text>
                                <Text style={styles.impactValue}>-30%</Text>
                            </View>
                            <View style={styles.impactRow}>
                                <Text style={styles.impactLabel}>DISCIPLINE</Text>
                                <Text style={styles.impactValue}>-40%</Text>
                            </View>
                            <View style={styles.impactRow}>
                                <Text style={styles.impactLabel}>CONVICTION</Text>
                                <Text style={styles.impactValue}>-20%</Text>
                            </View>
                        </View>

                        <Text style={styles.philosophy}>
                            "The investor's chief problem – and even his worst enemy – is likely to be himself."
                        </Text>
                    </View>

                    <Pressable
                        onPress={onAcknowledge}
                        style={({ pressed }) => [
                            styles.button,
                            { opacity: pressed ? 0.8 : 1 }
                        ]}
                    >
                        <Text style={styles.buttonText}>ACKNOWLEDGE FAILURE</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.danger,
        borderRadius: 4,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.danger + '30',
        paddingBottom: 16,
    },
    title: {
        color: theme.colors.danger,
        fontFamily: 'monospace',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    content: {
        gap: 20,
    },
    intro: {
        color: theme.colors.text,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600'
    },
    errorBox: {
        backgroundColor: theme.colors.danger + '10',
        padding: 16,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.danger,
        borderRadius: 2
    },
    errorText: {
        color: theme.colors.danger,
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: '700',
    },
    impactBox: {
        backgroundColor: theme.colors.bg,
        padding: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    impactTitle: {
        color: theme.colors.faint,
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 16,
    },
    impactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    impactLabel: {
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'monospace'
    },
    impactValue: {
        color: theme.colors.danger,
        fontSize: 12,
        fontWeight: '900',
        fontFamily: 'monospace'
    },
    philosophy: {
        color: theme.colors.faint,
        fontSize: 13,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
        lineHeight: 18
    },
    button: {
        backgroundColor: theme.colors.danger,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 32,
        borderRadius: 4,
    },
    buttonText: {
        color: theme.colors.bg,
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    },
});
