import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { theme } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COPY } from '../constants/copy';
import { useI18n } from '../i18n';

interface GuardrailChecklistProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function GuardrailChecklist({ visible, onClose, onConfirm }: GuardrailChecklistProps) {
    const { tr } = useI18n();
    const [checks, setChecks] = useState({
        notFomo: false,
        hasEf: false,
        longTerm: false
    });

    const allChecked = checks.notFomo && checks.hasEf && checks.longTerm;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' }}>
                <View style={{ backgroundColor: theme.colors.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 48, borderWidth: 1, borderColor: theme.colors.border }}>
                    <Text style={{ color: theme.colors.accent, fontWeight: '900', textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>{tr("Decision Support")}</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', marginBottom: 12 }}>{tr("Check your discipline.")}</Text>
                    <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 24, marginBottom: 32 }}>
                        {tr("We're not stopping you, we're just making sure you're not being impulsive. Answer honestly.")}
                    </Text>

                    <View style={{ gap: 16, marginBottom: 32 }}>
                        <CheckItem
                            label={tr("This is NOT FOMO or hype.")}
                            checked={checks.notFomo}
                            onValueChange={(v) => setChecks(s => ({ ...s, notFomo: v }))}
                            subtitle={COPY.GUARDRAIL_FOMO}
                        />
                        <CheckItem
                            label={tr("I have an emergency fund.")}
                            checked={checks.hasEf}
                            onValueChange={(v) => setChecks(s => ({ ...s, hasEf: v }))}
                            subtitle={COPY.GUARDRAIL_EMERGENCY}
                        />
                        <CheckItem
                            label={tr("I plan to hold this for 1Y+.")}
                            checked={checks.longTerm}
                            onValueChange={(v) => setChecks(s => ({ ...s, longTerm: v }))}
                            subtitle={tr("Investing is slow. If you want fast, go to a casino.")}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Pressable
                            onPress={onClose}
                            style={{ flex: 1, padding: 20, borderRadius: 24, backgroundColor: theme.colors.bg, alignItems: 'center' }}
                        >
                            <Text style={{ color: theme.colors.muted, fontWeight: '900' }}>{tr("WAIT, NEVER MIND")}</Text>
                        </Pressable>
                        <Pressable
                            onPress={allChecked ? onConfirm : undefined}
                            style={{
                                flex: 2,
                                padding: 20,
                                borderRadius: 24,
                                backgroundColor: allChecked ? theme.colors.accent : theme.colors.softCard,
                                alignItems: 'center',
                                opacity: allChecked ? 1 : 0.5
                            }}
                        >
                            <Text style={{ color: allChecked ? theme.colors.buttonText : theme.colors.muted, fontWeight: '900' }}>{tr("SAVE ENTRY")}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function CheckItem({ label, subtitle, checked, onValueChange }: { label: string, subtitle: string, checked: boolean, onValueChange: (v: boolean) => void }) {
    return (
        <Pressable
            onPress={() => onValueChange(!checked)}
            style={{
                flexDirection: 'row',
                gap: 16,
                padding: 16,
                borderRadius: 20,
                backgroundColor: checked ? theme.colors.accent + '10' : theme.colors.bg,
                borderWidth: 1,
                borderColor: checked ? theme.colors.accent : theme.colors.border
            }}
        >
            <View style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: checked ? theme.colors.accent : theme.colors.muted,
                backgroundColor: checked ? theme.colors.accent : 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {checked && <MaterialCommunityIcons name="check" size={16} color={theme.colors.buttonText} />}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 16 }}>{label}</Text>
                <Text style={{ color: theme.colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>{subtitle}</Text>
            </View>
        </Pressable>
    );
}
