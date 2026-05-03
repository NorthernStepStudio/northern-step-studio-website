import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'provly_biometric_enabled';

export type AuthenticationType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricStatus {
    isAvailable: boolean;
    isEnrolled: boolean;
    authenticationType: AuthenticationType;
    securityLevel: 'strong' | 'weak' | 'none';
}

/**
 * Privacy-first biometric authentication service.
 * All checks happen locally on the device - no data leaves the device.
 */
export const biometricAuth = {
    /**
     * Check if biometric authentication is available and enrolled on this device.
     */
    async getStatus(): Promise<BiometricStatus> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

        let authenticationType: AuthenticationType = 'none';
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            authenticationType = 'facial';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            authenticationType = 'fingerprint';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            authenticationType = 'iris';
        }

        // Check security level (Android specific)
        let securityLevel: 'strong' | 'weak' | 'none' = 'none';
        if (hasHardware && isEnrolled) {
            const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
            if (enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
                securityLevel = 'strong';
            } else if (enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK) {
                securityLevel = 'weak';
            }
        }

        return {
            isAvailable: hasHardware,
            isEnrolled: isEnrolled,
            authenticationType,
            securityLevel
        };
    },

    /**
     * Authenticate the user using biometric (Face ID/Touch ID/Fingerprint) or passcode fallback.
     */
    async authenticate(options?: {
        promptMessage?: string;
        fallbackLabel?: string;
        cancelLabel?: string;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: options?.promptMessage || 'Unlock ProvLy',
                fallbackLabel: options?.fallbackLabel || 'Use Passcode',
                cancelLabel: options?.cancelLabel || 'Cancel',
                disableDeviceFallback: false, // Allow passcode fallback
            });

            if (result.success) {
                return { success: true };
            } else {
                return {
                    success: false,
                    error: result.error || 'Authentication failed'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Authentication error'
            };
        }
    },

    /**
     * Check if biometric lock is enabled by the user.
     */
    async isEnabled(): Promise<boolean> {
        if (!(await SecureStore.isAvailableAsync())) {
            return false;
        }

        const result = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        return result === 'true';
    },

    /**
     * Enable or disable biometric lock.
     */
    async setEnabled(enabled: boolean): Promise<void> {
        if (!(await SecureStore.isAvailableAsync())) {
            return;
        }

        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, String(enabled));
    },

    /**
     * Get a human-readable label for the authentication type.
     */
    getAuthLabel(type: AuthenticationType): string {
        switch (type) {
            case 'facial':
                return Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
            case 'fingerprint':
                return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
            case 'iris':
                return 'Iris Scan';
            default:
                return 'Passcode';
        }
    }
};
