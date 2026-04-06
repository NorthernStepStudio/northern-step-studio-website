
import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { theme } from '../constants/theme';

type OfflineSummaryModalProps = {
    visible: boolean;
    summary: string[];
    onClose: () => void;
};

export function OfflineSummaryModal({ visible, summary, onClose }: OfflineSummaryModalProps) {
    if (summary.length === 0) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>ARCHIVE RECONCILIATION</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.logTitle}>LOG UPDATE DOSSIER:</Text>

                        {summary.map((line, i) => (
                            <Text key={i} style={styles.logLine}>{line}</Text>
                        ))}

                        <View style={styles.divider} />

                        <Text style={styles.statusUpdate}>
                            STATUS: All background protocols processed. Simulation synchronized.
                        </Text>
                    </View>

                    <Pressable style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>RESUME PROTOCOL</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 30,
    },
    container: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 2,
        padding: 24,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 12,
    },
    headerText: {
        color: theme.colors.accent,
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
    content: {
        gap: 8,
    },
    logTitle: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
    },
    logLine: {
        color: theme.colors.muted,
        fontFamily: 'monospace',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 12,
    },
    statusUpdate: {
        color: theme.colors.faint,
        fontSize: 10,
        fontFamily: 'monospace',
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: theme.colors.text,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        borderRadius: 2,
    },
    buttonText: {
        color: theme.colors.bg,
        fontFamily: 'monospace',
        fontWeight: '900',
        fontSize: 14,
    },
});
