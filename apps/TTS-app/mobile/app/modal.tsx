import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassCard } from '@/components/GlassUI';
import { LinearGradient } from 'expo-linear-gradient';

export default function ModalScreen() {
  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['#050510', '#0a0a20']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>System Info</Text>
        <View style={styles.separator} />

        <GlassCard>
          <Text style={styles.cardTitle}>Antigravity Neural Studio</Text>
          <Text style={styles.content}>
            This mobile controller connects to your private offline TTS ecosystem.
            {"\n\n"}
            - Engine: Coqui XTTS v2
            {"\n"}- Realism: 5D Emotion Mapping
            {"\n"}- Privacy: 100% Local Inference
          </Text>
        </GlassCard>

        <GlassCard style={styles.mt}>
          <Text style={styles.cardTitle}>Voice Identity</Text>
          <Text style={styles.content}>
            The "Blended Hybrid" voice is a custom-engineered identity unique to your workspace.
          </Text>
        </GlassCard>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C6FF',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  mt: {
    marginTop: 20,
  }
});
