import React from 'react';
import { StyleSheet, View, Text, Modal, TextInput, TouchableOpacity, Platform } from 'react-native';
import { GlassCard, PrimaryButton } from './GlassUI';
import { X } from 'lucide-react-native';
import { apiService } from '@/utils/api';
import { updateStudioConfig } from '@/utils/state';

interface SaveVoiceModalProps {
    visible: boolean;
    onClose: () => void;
    backendUrl: string;
    currentSettings: {
        parentId: string;
        valence: number;
        arousal: number;
        pitch: number;
    };
    onSaveSuccess: (newId: string) => void;
}

export const SaveVoiceModal = ({ visible, onClose, backendUrl, currentSettings, onSaveSuccess }: SaveVoiceModalProps) => {
    const [name, setName] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const result = await apiService.saveVoice(backendUrl, {
            name: name.trim(),
            parent_id: currentSettings.parentId,
            valence: currentSettings.valence,
            arousal: currentSettings.arousal,
            pitch: currentSettings.pitch
        });

        if (result.success) {
            updateStudioConfig({ selectedVoice: result.voice_id });
            onSaveSuccess(result.voice_id);
            setName('');
            onClose();
        } else {
            console.error("Save failed", result.error);
        }
        setLoading(false);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <GlassCard style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Save Neural Identity</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color="rgba(255,255,255,0.4)" size={20} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Identity Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Deep Hero"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <View style={styles.preview}>
                        <Text style={styles.previewText}>Based on: {currentSettings.parentId}</Text>
                        <Text style={styles.previewText}>P: {currentSettings.pitch} | V: {currentSettings.valence} | A: {currentSettings.arousal}</Text>
                    </View>

                    <PrimaryButton title="Create Nuevo Voice" onPress={handleSave} loading={loading} />
                </GlassCard>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modal: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    preview: {
        backgroundColor: 'rgba(0, 198, 255, 0.05)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    previewText: {
        color: 'rgba(0, 198, 255, 0.8)',
        fontSize: 11,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    }
});
