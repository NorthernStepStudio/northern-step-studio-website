import * as React from 'react';
import { StyleSheet, FlatList, Text, TouchableOpacity, View, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '@/components/GlassUI';
import { User, Check, Settings, RefreshCw, Trash2, Edit2, Mic } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { NetworkConfig } from '@/components/NetworkConfig';
import { getBackendUrlResource } from '@/utils/storage';
import { apiService, Voice } from '@/utils/api';
import { STUDIO_CONFIG, updateStudioConfig } from '@/utils/state';

export default function TabTwoScreen() {
  const router = useRouter();
  const [voices, setVoices] = React.useState<Voice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [backendUrl, setBackendUrl] = React.useState('');
  const [selectedVoice, setSelectedVoice] = React.useState(STUDIO_CONFIG.selectedVoice);
  const [showNetworkConfig, setShowNetworkConfig] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedVoice(STUDIO_CONFIG.selectedVoice);
    }, [])
  );

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const url = await getBackendUrlResource();
    if (url) {
      setBackendUrl(url);
      fetchVoices(url);
    } else {
      setLoading(false);
    }
  };

  const fetchVoices = async (targetUrl = backendUrl) => {
    if (!targetUrl) return;
    setError(null);
    setLoading(true);

    const result = await apiService.getVoices(targetUrl);

    if (result.success) {
      setVoices(result.voices || []);
      if (!result.voices?.length) {
        setError("Voice library is empty.");
      }
    } else {
      setError(result.error || "Connection Failed");
    }
    setLoading(false);
  };

  const handleDelete = async (voiceId: string) => {
    Alert.alert(
      "Delete Voice",
      "Are you sure you want to remove this neural identity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await apiService.deleteVoice(backendUrl, voiceId);
            fetchVoices();
          }
        }
      ]
    );
  };

  const handleEdit = (voiceId: string) => {
    router.push({
      pathname: '/edit-voice-page' as any,
      params: { id: voiceId }
    });
  };

  const handleUse = (voice: Voice) => {
    updateStudioConfig({
      selectedVoice: voice.id,
      valence: voice.valence,
      arousal: voice.arousal,
      baseValence: voice.valence,
      baseArousal: voice.arousal,
      pitch: 1.0
    });
    router.push('/');
  };

  const renderItem = ({ item }: { item: Voice }) => {
    const isSelected = selectedVoice === item.id;
    const isProtected = item.parent_id === 'seed';

    return (
      <TouchableOpacity onPress={() => {
        setSelectedVoice(item.id);
        updateStudioConfig({
          selectedVoice: item.id,
          baseValence: item.valence,
          baseArousal: item.arousal
        });
      }} activeOpacity={0.7}>
        <GlassCard style={[styles.voiceCard, isSelected && styles.selectedBorder]}>
          <View style={styles.voiceInfo}>
            <View style={[styles.iconContainer, isSelected && styles.iconActive]}>
              <User color={isSelected ? "#fff" : "rgba(255,255,255,0.7)"} size={22} />
            </View>
            <View>
              <Text style={[styles.voiceName, isSelected && styles.textActive]}>
                {item.name}
              </Text>
              <Text style={styles.voiceType}>
                {isProtected ? "Seed Voice" : `Nuevo (from ${item.parent_id})`}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>VAL:</Text>
                  <Text style={styles.miniStatVal}>{(item.valence ?? 0).toFixed(2)}</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>ARO:</Text>
                  <Text style={styles.miniStatVal}>{(item.arousal ?? 0).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleUse(item)} style={styles.cardActionBtn}>
              <Mic color="#00C6FF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.cardActionBtn}>
              <Edit2 color="rgba(255,255,255,0.7)" size={18} />
            </TouchableOpacity>
            {!isProtected && (
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.cardActionBtn}>
                <Trash2 color="#FF4B4B" size={18} />
              </TouchableOpacity>
            )}
            {isSelected && <Check color="#00C6FF" size={20} />}
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#050510', '#0a0a20', '#151540']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Voice Library</Text>
              <Text style={styles.headerSubtitle}>Select a neural identity</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => fetchVoices()} style={styles.actionBtn}>
                <RefreshCw color="rgba(255,255,255,0.8)" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowNetworkConfig(true)} style={styles.actionBtn}>
                <Settings color="rgba(255,255,255,0.8)" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <NetworkConfig
          visible={showNetworkConfig}
          onClose={() => setShowNetworkConfig(false)}
          onSave={(url) => {
            setBackendUrl(url);
            fetchVoices(url);
          }}
        />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#00C6FF" />
            <Text style={styles.loadingText}>Connecting to Studio...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchVoices()}>
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>Target: {backendUrl}</Text>
          </View>
        ) : (
          <FlatList
            data={voices}
            renderItem={renderItem}
            keyExtractor={(item, index) => item?.id || index.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  list: {
    gap: 10,
    paddingBottom: 150,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  selectedBorder: {
    borderColor: 'rgba(0, 198, 255, 0.4)',
    backgroundColor: 'rgba(0, 198, 255, 0.05)',
  },
  voiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: 'rgba(0, 198, 255, 0.2)',
  },
  voiceName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '700',
  },
  textActive: {
    color: '#fff',
  },
  voiceType: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: 'bold',
  },
  miniStatVal: {
    color: '#00C6FF',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardActionBtn: {
    padding: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 15,
    fontSize: 14,
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 20,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
