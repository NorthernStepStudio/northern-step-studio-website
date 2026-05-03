import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { biometricAuth, BiometricStatus } from '../lib/biometricAuth';

interface AppLockScreenProps {
    onUnlock: () => void;
}

export default function AppLockScreen({ onUnlock }: AppLockScreenProps) {
    const insets = useSafeAreaInsets();
    const [status, setStatus] = useState<BiometricStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        loadStatus();
    }, []);

    useEffect(() => {
        // Auto-trigger authentication on mount if available
        if (status?.isEnrolled) {
            handleAuthenticate();
        }
    }, [status]);

    const loadStatus = async () => {
        const biometricStatus = await biometricAuth.getStatus();
        setStatus(biometricStatus);
    };

    const handleAuthenticate = async () => {
        if (isAuthenticating) return;

        setIsAuthenticating(true);
        setError(null);

        const result = await biometricAuth.authenticate({
            promptMessage: 'Unlock ProvLy',
            fallbackLabel: 'Use Passcode',
        });

        setIsAuthenticating(false);

        if (result.success) {
            Vibration.vibrate(50);
            onUnlock();
        } else if (result.error && result.error !== 'user_cancel') {
            setError(result.error);
        }
    };

    const getIcon = (): keyof typeof MaterialCommunityIcons.glyphMap => {
        if (!status) return 'lock';
        switch (status.authenticationType) {
            case 'facial':
                return Platform.OS === 'ios' ? 'face-recognition' : 'face-recognition';
            case 'fingerprint':
                return 'fingerprint';
            case 'iris':
                return 'eye-outline';
            default:
                return 'lock';
        }
    };

    const getAuthLabel = (): string => {
        if (!status) return 'Unlock';
        return biometricAuth.getAuthLabel(status.authenticationType);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
            {/* App Logo / Icon */}
            <View style={styles.logoContainer}>
                <MaterialCommunityIcons name="home-variant" size={80} color="#4A90D9" />
                <Text style={styles.appName}>ProvLy</Text>
                <Text style={styles.appSubtitle}>Home Inventory</Text>
            </View>

            {/* Lock Icon */}
            <View style={styles.lockContainer}>
                <TouchableOpacity
                    style={[styles.lockButton, isAuthenticating && styles.lockButtonActive]}
                    onPress={handleAuthenticate}
                    disabled={isAuthenticating}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={getIcon()}
                        size={64}
                        color={isAuthenticating ? '#666' : '#fff'}
                    />
                </TouchableOpacity>
                <Text style={styles.tapToUnlock}>
                    {isAuthenticating ? 'Authenticating...' : `Tap to use ${getAuthLabel()}`}
                </Text>
            </View>

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Privacy Notice */}
            <View style={styles.privacyContainer}>
                <MaterialCommunityIcons name="shield-check-outline" size={16} color="#666" />
                <Text style={styles.privacyText}>
                    Your data never leaves this device
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 60,
    },
    logoContainer: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginTop: 12,
        letterSpacing: 1,
    },
    appSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    lockContainer: {
        alignItems: 'center',
    },
    lockButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(74, 144, 217, 0.2)',
        borderWidth: 2,
        borderColor: '#4A90D9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    lockButtonActive: {
        backgroundColor: 'rgba(74, 144, 217, 0.1)',
        borderColor: '#666',
    },
    tapToUnlock: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
    },
    privacyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    privacyText: {
        color: '#666',
        fontSize: 12,
    },
});
