import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

const KEY_ALIAS = 'provly_encryption_key';
let cachedKey: string | null = null;

async function getEncryptionKey(): Promise<string> {
    if (cachedKey) return cachedKey;

    try {
        // 1. Try to fetch existing key
        let key = await SecureStore.getItemAsync(KEY_ALIAS);

        // 2. If no key, generate one
        if (!key) {
            console.log('Generating new encryption key...');
            // Generate a 256-bit key (32 bytes)
            const randomWord = CryptoJS.lib.WordArray.random(32);
            key = randomWord.toString(CryptoJS.enc.Base64);

            await SecureStore.setItemAsync(KEY_ALIAS, key);
        }

        cachedKey = key;
        return key;
    } catch (error) {
        console.error('Failed to manage encryption key:', error);
        // Fallback or throw? For MVP, we throw to ensure security.
        throw new Error('Encryption System Failure: Could not access secure storage.');
    }
}

export const crypto = {
    // Encrypt data using AES-256
    async encrypt(data: any): Promise<string> {
        try {
            const key = await getEncryptionKey();
            const json = JSON.stringify(data);

            // AES Encrypt
            const ciphertext = CryptoJS.AES.encrypt(json, key).toString();
            return ciphertext;
        } catch (e) {
            console.error('Encryption Failed:', e);
            throw e;
        }
    },

    // Decrypt data using AES-256
    async decrypt(ciphertext: string): Promise<any> {
        try {
            const key = await getEncryptionKey();

            // AES Decrypt
            const bytes = CryptoJS.AES.decrypt(ciphertext, key);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedData) {
                console.error('Decryption failed to produce UTF-8 string. Key mismatch or corrupted data.');
                return null;
            }

            return JSON.parse(decryptedData);
        } catch (e) {
            console.error('Decryption Failed:', e);
            throw e;
        }
    }
};
