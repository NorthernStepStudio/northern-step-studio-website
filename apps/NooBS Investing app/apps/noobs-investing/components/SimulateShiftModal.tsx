import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AutoTranslate } from './AutoTranslate';

interface SimulateShiftModalProps {
    visible: boolean;
    onClose: () => void;
    onSimulate: (change: number) => void;
}

export function SimulateShiftModal({ visible, onClose, onSimulate }: SimulateShiftModalProps) {
    return (
        <AutoTranslate>
        <Modal visible={visible} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 }}>
                <View style={{ backgroundColor: theme.colors.card, borderRadius: 32, padding: 32, borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>Psychology Check</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', marginBottom: 12 }}>Simulate Market Move</Text>
                    <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 24, marginBottom: 32 }}>
                        "How would you feel if the market moved like this today? Test your gut before you test your wallet."
                    </Text>

                    <View style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => { onSimulate(1.05); onClose(); }}
                            style={{ padding: 20, borderRadius: 20, backgroundColor: theme.colors.success + '20', borderWidth: 1, borderColor: theme.colors.success, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Text style={{ color: theme.colors.success, fontWeight: '900', fontSize: 18 }}>+5% Bull Run</Text>
                            <MaterialCommunityIcons name="trending-up" size={24} color={theme.colors.success} />
                        </Pressable>

                        <Pressable
                            onPress={() => { onSimulate(0.95); onClose(); }}
                            style={{ padding: 20, borderRadius: 20, backgroundColor: theme.colors.danger + '20', borderWidth: 1, borderColor: theme.colors.danger, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Text style={{ color: theme.colors.danger, fontWeight: '900', fontSize: 18 }}>-5% Market Correction</Text>
                            <MaterialCommunityIcons name="trending-down" size={24} color={theme.colors.danger} />
                        </Pressable>

                        <Pressable
                            onPress={() => { onSimulate(0.85); onClose(); }}
                            style={{ padding: 20, borderRadius: 20, backgroundColor: theme.colors.danger, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Text style={{ color: theme.colors.buttonText, fontWeight: '900', fontSize: 18 }}>-15% Flash Crash</Text>
                            <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.buttonText} />
                        </Pressable>
                    </View>

                    <View style={{ marginTop: 24, padding: 16, backgroundColor: theme.colors.bg, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.border }}>
                        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '800', fontStyle: 'italic', textAlign: 'center' }}>
                            "Investing isn't about math—it's about staying calm when everyone else is puking. Test your gut now so you don't panic later."
                        </Text>
                    </View>

                    <Pressable onPress={onClose} style={{ marginTop: 24, alignItems: 'center' }}>
                        <Text style={{ color: theme.colors.muted, fontWeight: '800' }}>NEVER MIND</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
        </AutoTranslate>
    );
}
