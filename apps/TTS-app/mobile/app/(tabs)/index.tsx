import * as React from 'react';
import { StyleSheet, ScrollView, TextInput, View, Text, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { GlassCard, PrimaryButton } from '@/components/GlassUI';
import { EmotionPad } from '@/components/EmotionPad';
import { SaveVoiceModal } from '@/components/SaveVoiceModal';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Save, Dices } from 'lucide-react-native';
import { NetworkConfig } from '@/components/NetworkConfig';
import { getBackendUrlResource, saveBackendUrl } from '@/utils/storage';
import { apiService, BYPASS_HEADERS } from '@/utils/api';
import { STUDIO_CONFIG, updateStudioConfig } from '@/utils/state';
import { useFocusEffect } from '@react-navigation/native';

export default function TabOneScreen() {
  const [backendUrl, setBackendUrl] = React.useState('');
  const [showNetworkConfig, setShowNetworkConfig] = React.useState(false);
  const [text, setText] = React.useState('');
  const [selectedVoice, setSelectedVoice] = React.useState(STUDIO_CONFIG.selectedVoice);
  const [valence, setValence] = React.useState(STUDIO_CONFIG.valence);
  const [arousal, setArousal] = React.useState(STUDIO_CONFIG.arousal);
  const [baseValence, setBaseValence] = React.useState(STUDIO_CONFIG.baseValence);
  const [baseArousal, setBaseArousal] = React.useState(STUDIO_CONFIG.baseArousal);
  const [loading, setLoading] = React.useState(false);
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [scrollingEnabled, setScrollingEnabled] = React.useState(true);
  const [showSaveModal, setShowSaveModal] = React.useState(false);

  React.useEffect(() => {
    const loadUrl = async () => {
      const savedUrl = await getBackendUrlResource();
      if (savedUrl) setBackendUrl(savedUrl);
    };
    loadUrl();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setValence(STUDIO_CONFIG.valence);
      setArousal(STUDIO_CONFIG.arousal);
      setBaseValence(STUDIO_CONFIG.baseValence);
      setBaseArousal(STUDIO_CONFIG.baseArousal);
      setSelectedVoice(STUDIO_CONFIG.selectedVoice);
    }, [])
  );

  async function playSound(urlSuffix: string) {
    if (!backendUrl) return;
    const fullUrl = `${apiService.normalizeUrl(backendUrl)}${urlSuffix}`;
    try {
      const { sound } = await Audio.Sound.createAsync(
        {
          uri: fullUrl,
          headers: BYPASS_HEADERS
        }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (e) {
      console.error("Playback failed", e);
      Alert.alert("Playback Error", "Failed to stream audio from studio.");
    }
  }

  const handleRandomize = async () => {
    if (!backendUrl) return setShowNetworkConfig(true);
    setLoading(true);

    // Call API
    const res = await apiService.generateRandomVoice(backendUrl, selectedVoice);

    if (res.success && res.voice_id) {
      // Update State
      const newId = res.voice_id;
      setSelectedVoice(newId);

      // Reset Stats to Neutral (Library logic sets them to 0.0)
      setValence(0.0);
      setArousal(0.0);
      setBaseValence(0.0);
      setBaseArousal(0.0);

      updateStudioConfig({
        selectedVoice: newId,
        valence: 0.0,
        arousal: 0.0,
        baseValence: 0.0,
        baseArousal: 0.0
      });

      Alert.alert("New Identity Created", `Active Voice: ${newId.replace('random_', 'Subject ')}`);
    } else {
      Alert.alert("Randomize Failed", res.error || "Unknown error");
    }
    setLoading(false);
  };

  const handleSynthesize = async () => {
    if (!text.trim()) return Alert.alert("Error", "Please enter some text");
    if (!backendUrl) return setShowNetworkConfig(true);

    setLoading(true);
    const result = await apiService.synthesize(backendUrl, {
      text,
      valence,
      arousal,
      pitch: 1.0,
      voice_id: STUDIO_CONFIG.selectedVoice
    });

    if (result.success && result.audioUrl) {
      await playSound(result.audioUrl);
    } else {
      const isLocal = backendUrl.includes('127.0.0.1') || backendUrl.includes('localhost');
      if (isLocal && (result.error?.includes('Network Error') || result.error?.includes('offline'))) {
        Alert.alert(
          "Connection Blocked",
          "You are trying to connect to 'localhost' which your phone cannot see. Switch to the Neural Tunnel?",
          [
            { text: "No", style: "cancel" },
            {
              text: "Yes, Use Tunnel",
              onPress: async () => {
                const tunnelUrl = "https://neural-studio.loca.lt";
                updateStudioConfig({ backendUrl: tunnelUrl });
                setBackendUrl(tunnelUrl);
                await saveBackendUrl(tunnelUrl);
                Alert.alert("URL Updated", "Trying synthesis again...");
                handleSynthesize();
              }
            }
          ]
        );
      } else {
        Alert.alert("Synthesis Failed", result.error || "Unknown error");
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#050510', '#0a0a20', '#151540']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 64}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            scrollEnabled={scrollingEnabled}
          >
            <NetworkConfig
              visible={showNetworkConfig}
              onClose={() => setShowNetworkConfig(false)}
              onSave={(url) => setBackendUrl(url)}
            />
            <GlassCard>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Emotion Pad</Text>
                  <Text style={styles.subtitle}>
                    Active Identity: <Text style={styles.highlight}>{selectedVoice}</Text>
                  </Text>
                </View>
                <View style={styles.rightIcons}>
                  <TouchableOpacity onPress={handleRandomize} style={styles.mr} disabled={loading}>
                    <Dices color={loading ? "rgba(255,255,255,0.3)" : "#00C6FF"} size={22} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowNetworkConfig(true)} style={styles.mr}>
                    <Settings color="rgba(255,255,255,0.8)" size={22} />
                  </TouchableOpacity>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>NEURAL</Text>
                  </View>
                </View>
              </View>

              <View style={styles.padRow}>
                <View style={styles.flex}>
                  <EmotionPad
                    key={`emotion-${STUDIO_CONFIG.selectedVoice}`}
                    initialValence={valence}
                    initialArousal={arousal}
                    onGestureStart={() => setScrollingEnabled(false)}
                    onGestureEnd={() => setScrollingEnabled(true)}
                    onUpdate={(v, a) => {
                      setValence(v);
                      setArousal(a);
                      updateStudioConfig({ valence: v, arousal: a });
                    }}
                  />
                </View>
              </View>

              <View style={styles.stats}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>VALENCE</Text>
                  <Text style={styles.statVal}>{valence.toFixed(2)}</Text>
                  {baseValence !== 0 && <Text style={styles.baseRef}>Base: {baseValence.toFixed(2)}</Text>}
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>AROUSAL</Text>
                  <Text style={styles.statVal}>{arousal.toFixed(2)}</Text>
                  {baseArousal !== 0 && <Text style={styles.baseRef}>Base: {baseArousal.toFixed(2)}</Text>}
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => setShowSaveModal(true)}
              >
                <Save color="#00C6FF" size={18} />
                <Text style={styles.saveBtnText}>Save Identity</Text>
              </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.inputCard}>
              <Text style={styles.title}>Voice Synthesis</Text>
              <TextInput
                style={styles.input}
                placeholder="What should the AI say?"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={text}
                onChangeText={setText}
                multiline
              />
              <PrimaryButton title="Generate Speech" onPress={handleSynthesize} loading={loading} />
            </GlassCard>

            <SaveVoiceModal
              visible={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              backendUrl={backendUrl}
              currentSettings={{
                parentId: STUDIO_CONFIG.selectedVoice,
                valence,
                arousal,
                pitch: 1.0
              }}
              onSaveSuccess={(id) => {
                // update local state
                setSelectedVoice(id);
                setBaseValence(valence);
                setBaseArousal(arousal);

                // update global config so navigating away keeps it
                updateStudioConfig({
                  selectedVoice: id,
                  baseValence: valence,
                  baseArousal: arousal
                });

                Alert.alert("Success", "Neural Identity saved and activated!");
              }}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 150,
    gap: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mr: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  highlight: {
    color: '#00C6FF',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'rgba(0, 198, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 198, 255, 0.3)',
  },
  badgeText: {
    color: '#00C6FF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputCard: {
    marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 18,
    color: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
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
    fontSize: 16,
    marginTop: 4,
  },
  baseRef: {
    color: 'rgba(0, 198, 255, 0.7)',
    fontSize: 9,
    marginTop: 2,
    fontWeight: 'bold',
  },
  padRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  saveBtnText: {
    color: '#00C6FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
