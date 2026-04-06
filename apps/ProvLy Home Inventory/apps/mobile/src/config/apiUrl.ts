import { Platform } from 'react-native';
import * as Device from 'expo-device';

const LAN_HOST = process.env.EXPO_PUBLIC_LAN_HOST || '192.168.1.152';
const EMULATOR_HOST = '10.0.2.2';
const PORT = Number(process.env.EXPO_PUBLIC_API_PORT || 4000);

const DEFAULT_API_URL = Platform.select({
  android: Device.isDevice ? `http://${LAN_HOST}:${PORT}/v1` : `http://${EMULATOR_HOST}:${PORT}/v1`,
  ios: Device.isDevice ? `http://${LAN_HOST}:${PORT}/v1` : `http://localhost:${PORT}/v1`,
  default: `http://localhost:${PORT}/v1`,
});

function resolveAndroidUrl(url: string): string {
  if (!url) return url;
  if (!Device.isDevice) return url;
  return url.replace('localhost', LAN_HOST).replace(EMULATOR_HOST, LAN_HOST);
}

const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const rawUrl = envUrl || DEFAULT_API_URL || `http://${LAN_HOST}:${PORT}/v1`;
export const API_URL = Platform.OS === 'android' ? resolveAndroidUrl(rawUrl) : rawUrl;
