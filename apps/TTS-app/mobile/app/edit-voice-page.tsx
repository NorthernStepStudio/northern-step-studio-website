import * as React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { GlassCard, PrimaryButton } from '@/components/GlassUI';
import { EmotionPad } from '@/components/EmotionPad';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Save } from 'lucide-react-native';
import { apiService, Voice } from '@/utils/api';
import { getBackendUrlResource } from '@/utils/storage';
import { STUDIO_CONFIG } from '@/utils/state';

export default function EditVoiceScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [voice, setVoice] = React.useState<Voice | null>(null);
    const [valence, setValence] = React.useState(0);
    const [arousal, setArousal] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [scrollingEnabled, setScrollingEnabled] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [backendUrl, setBackendUrl] = React.useState('');

    React.useEffect(() => {
        const init = async () => {
            const url = await getBackendUrlResource();
            if (url) {
                setBackendUrl(url);
                try {
                    const result = await apiService.getVoices(url);
                    if (result.success && result.voices) {
                        const currentVoice = result.voices.find((v: Voice) => v.id === id);
                        if (currentVoice) {
                            setVoice(currentVoice);
                            setValence(currentVoice.valence || 0);
                            setArousal(currentVoice.arousal || 0);
                        } else {
                            Alert.alert("Error", "Voice not found in library.");
                            router.back();
                        }
                    } else {
                        Alert.alert("Error", "Could not fetch voices.");
                        router.back();
                    }
                } catch (e) {
                    console.error("Failed to fetch voice", e);
                }
            }
            setLoading(false);
        };
        init();
    }, [id]);

    const handleSave = async () => {
        if (!voice) return;
        setSaving(true);
        const result = await apiService.updateVoice(backendUrl, {
            name: voice.name,
            parent_id: voice.parent_id,
            valence,
            arousal,
            pitch: 1.0
        });

        if (result.success) {
            Alert.alert("Success", "Neural Identity updated!");
            router.back();
        } else {
            Alert.alert("Error", result.error || "Update failed.");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#00C6FF" size="large" />
                <Text style={styles.loadingText}>Loading Identity...</Text>
            </View>
        );
    }

    if (!voice) return null;

    return (
        <View style={styles.flex}>
            <LinearGradient
                colors={['#050510', '#0a0a20', '#151540']}
                style={StyleSheet.absoluteFill}
            />
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <Stack.Screen options={{
                headerShown: false
            }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Identity</Text>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.content} scrollEnabled={scrollingEnabled} keyboardShouldPersistTaps="handled">
                    <GlassCard>
                        <View style={styles.voiceHeader}>
                            <Text style={styles.voiceName}>{voice.name}</Text>
                            <Text style={styles.voiceSub}>Derived from: {voice.parent_id}</Text>
                        </View>

                        <View style={styles.padRow}>
                            <View style={styles.flex}>
                                <Text style={styles.padLabel}>EMOTION MAP</Text>
                                <EmotionPad
                                    initialValence={valence}
                                    initialArousal={arousal}
                                    onGestureStart={() => setScrollingEnabled(false)}
                                    onGestureEnd={() => setScrollingEnabled(true)}
                                    onUpdate={(v, a) => {
                                        setValence(v);
                                        setArousal(a);
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.stats}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>VALENCE</Text>
                                <Text style={styles.statVal}>{valence}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>AROUSAL</Text>
                                <Text style={styles.statVal}>{arousal}</Text>
                            </View>
                        </View>

                        <PrimaryButton
                            title="Save Changes"
                            onPress={handleSave}
                            loading={saving}
                        />
                    </GlassCard>
                </ScrollView>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050510' },
    loadingText: { color: 'rgba(255,255,255,0.7)', marginTop: 15 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 60,
    },
    voiceHeader: {
        marginBottom: 20,
    },
    voiceName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    voiceSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
    padRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    padLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 10,
        textAlign: 'center',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        marginTop: 10,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    statVal: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'monospace',
        marginTop: 4,
    },
});
