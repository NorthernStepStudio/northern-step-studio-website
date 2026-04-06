import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Wifi, Save, X, Zap } from 'lucide-react-native';
import { Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { GlassCard } from './GlassUI';
import { getBackendUrlResource, saveBackendUrl } from '@/utils/storage';
import { apiService } from '@/utils/api';
import { updateStudioConfig } from '@/utils/state';

// Shared state for in-memory session (initialized from storage on mount)
export let CURRENT_BACKEND_URL = "http://192.168.1.166:8888";

export const NetworkConfig = ({ visible, onClose, onSave }: { visible: boolean, onClose: () => void, onSave: (url: string) => void }) => {
    const [url, setUrl] = useState(CURRENT_BACKEND_URL);
    const [testStatus, setTestStatus] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        if (visible) {
            loadPersistedUrl();
        }
    }, [visible]);

    const loadPersistedUrl = async () => {
        const saved = await getBackendUrlResource();
        if (saved) {
            setUrl(saved);
        }
    };

    const checkConnection = async () => {
        setTesting(true);
        setTestStatus("Pinging API...");

        const result = await apiService.getVoices(url);

        if (result.success) {
            setTestStatus("✅ Connected! Library is reachable.");
        } else {
            setTestStatus(`❌ ${result.error}`);
        }
        setTesting(false);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                <GlassCard style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Network Settings</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color="rgba(255,255,255,0.5)" size={24} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Studio Backend URL</Text>
                    <View style={styles.inputRow}>
                        <Wifi color="#00C6FF" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={url}
                            onChangeText={setUrl}
                            placeholder="http://192.168.x.x:8888"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.hint}>
                        Ensure your phone and PC are on the same Wi-Fi.
                    </Text>

                    <TouchableOpacity
                        style={styles.easyUrlBtn}
                        onPress={() => setUrl("https://neural-studio.loca.lt")}
                    >
                        <Zap color="#00C6FF" size={16} />
                        <Text style={styles.easyUrlText}>Use stable tunnel: neural-studio.loca.lt</Text>
                    </TouchableOpacity>

                    {testStatus && (
                        <View style={styles.statusBox}>
                            <Text style={styles.statusText}>{testStatus}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.testBtn, testing && styles.disabled]}
                        onPress={checkConnection}
                        disabled={testing}
                    >
                        <Text style={styles.testBtnText}>{testing ? "Testing..." : "Test Connection"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={async () => {
                            if (url.includes('127.0.0.1') || url.includes('localhost')) {
                                Alert.alert(
                                    "Common Mistake",
                                    "Mobile devices cannot reach 'localhost' or '127.0.0.1' on your PC. Use your PC's Wi-Fi IP (e.g. 192.168.x.x) or use the Neural Tunnel.",
                                    [{ text: "I understand" }]
                                );
                                return;
                            }
                            const normalized = apiService.normalizeUrl(url);
                            CURRENT_BACKEND_URL = normalized;
                            updateStudioConfig({ backendUrl: normalized });
                            await saveBackendUrl(normalized);
                            onSave(normalized);
                            onClose();
                        }}
                    >
                        <Save color="#fff" size={20} />
                        <Text style={styles.saveText}>Apply & Restart Sync</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        padding: 25,
        backgroundColor: 'rgba(15, 15, 30, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
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
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#fff',
        fontSize: 16,
    },
    hint: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginTop: 10,
        lineHeight: 16,
    },
    easyUrlBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 198, 255, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 198, 255, 0.2)',
    },
    easyUrlText: {
        color: '#00C6FF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
        gap: 10,
    },
    testBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    testBtnText: {
        color: '#00C6FF',
        fontWeight: '600',
    },
    statusBox: {
        marginTop: 15,
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
