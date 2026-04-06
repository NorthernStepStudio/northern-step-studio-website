import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { theme } from '../constants/theme';

export default function ModalScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: theme.colors.text, textAlign: 'center' }}>
          NooBS
        </Text>
        <View style={{ height: 1, backgroundColor: theme.colors.border, width: '40%', marginVertical: 24 }} />
        <Text style={{ fontSize: 18, color: theme.colors.muted, textAlign: 'center', lineHeight: 24 }}>
          This app is designed for humans. No gambling. No bullshit. Just progress.
        </Text>
      </View>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </Screen>
  );
}
