import CryptoJS from 'crypto-js';

export const crypto = {
    // Decrypt data using AES-256
    decrypt(ciphertext: string, key: string): any {
        try {
            if (!key) throw new Error('No key provided');

            // AES Decrypt
            const bytes = CryptoJS.AES.decrypt(ciphertext, key);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedData) {
                console.error('Decryption failed to produce UTF-8 string.');
                return null;
            }

            return JSON.parse(decryptedData);
        } catch (e) {
            console.error('Decryption Failed:', e);
            throw e;
        }
    }
};
