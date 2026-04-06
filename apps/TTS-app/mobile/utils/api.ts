import axios from 'axios';

/**
 * Robust API Client for Studio Backend
 * Centralizes bypass headers, timeouts, and error normalization.
 */

export interface Voice {
    id: string;
    name: string;
    parent_id: string;
    valence: number;
    arousal: number;
    pitch: number;
}

export const BYPASS_HEADERS = {
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': 'true',
    'X-Bypass-Tunnel': 'true'
};

const apiClient = axios.create({
    timeout: 60000,
    headers: {
        ...BYPASS_HEADERS,
        'Content-Type': 'application/json',
    }
});

export const apiService = {
    /**
     * Normalize URL (ensure http/https, no trailing slash)
     */
    normalizeUrl(url: string) {
        let clean = url.trim().toLowerCase();
        if (!clean) return '';

        // 1. Auto-fix common typo: .it -> .lt
        if (clean.includes('.loca.it')) {
            clean = clean.replace('.loca.it', '.loca.lt');
        }

        // 2. Identify type: Local vs Tunnel
        const isLocal = clean.includes('127.0.0.1') || clean.includes('localhost') || clean.match(/^192\.168\./);
        const isTunnel = clean.includes('loca.lt');

        // 3. Force correct protocol
        if (isLocal) {
            clean = clean.replace(/^https?:\/\//, '');
            clean = 'http://' + clean;
        } else if (isTunnel || clean.includes('http')) {
            if (!clean.startsWith('http')) {
                clean = 'https://' + clean;
            }
        }

        // 4. Force HTTPS for LocalTunnel
        if (isTunnel && clean.startsWith('http:')) {
            clean = clean.replace('http:', 'https:');
        }

        // 5. Strip trailing slash
        if (clean.endsWith('/')) {
            clean = clean.slice(0, -1);
        }

        // 6. Aggressive Path Stripping: Strip anything starting with /v1
        // We only want the base URL (protocol + host + port)
        const v1Index = clean.indexOf('/v1');
        if (v1Index !== -1) {
            clean = clean.substring(0, v1Index);
        }

        return clean;
    },

    /**
     * Fetch list of neural identities (objects)
     */
    async getVoices(baseUrl: string) {
        const url = this.normalizeUrl(baseUrl);
        console.log(`[API] Fetching voices from: ${url}/v1/voices`);
        try {
            const response = await apiClient.get(`${url}/v1/voices`);
            if (response.data && Array.isArray(response.data.voices)) {
                return { success: true, voices: response.data.voices as Voice[] };
            }

            const rawData = typeof response.data === 'string'
                ? response.data.substring(0, 100)
                : JSON.stringify(response.data).substring(0, 100);

            console.error(`[API] Invalid Format:`, rawData);
            return {
                success: false,
                error: `Invalid JSON format. Check URL: ${url}`
            };
        } catch (err: any) {
            let errorMsg = err.message || "Network Timeout";
            if (errorMsg.includes('Network Error')) {
                errorMsg = "Neural Studio is offline. Please start your tunnel!";
            }
            return { success: false, error: errorMsg };
        }
    },

    /**
     * Trigger Synthesis with Emotion + Pitch
     */
    async synthesize(baseUrl: string, payload: {
        text: string,
        valence: number,
        arousal: number,
        pitch: number,
        voice_id: string
    }) {
        const url = this.normalizeUrl(baseUrl);
        try {
            const response = await apiClient.post(`${url}/v1/synthesis`, {
                ...payload,
                engine: 'xtts'
            });
            console.log(`[API] Synthesis Result:`, response.data);
            if (response.data && response.data.url) {
                return { success: true, audioUrl: response.data.url, ...response.data };
            }
            return { success: false, error: "Studio returned an invalid response." };
        } catch (err: any) {
            let errorMsg = err.message || "Synthesis Failed";
            if (errorMsg.includes('403')) errorMsg = "Tunnel access denied. Check your bypass headers.";
            if (errorMsg.includes('404')) errorMsg = "Synthesis endpoint not found. Port 8888 mismatch?";
            return { success: false, error: errorMsg };
        }
    },

    /**
     * Persist a New Neural Identity
     */
    async saveVoice(baseUrl: string, data: {
        name: string,
        parent_id: string,
        valence: number,
        arousal: number,
        pitch: number
    }) {
        const url = this.normalizeUrl(baseUrl);
        try {
            const resp = await apiClient.post(`${url}/v1/voices/save`, data);
            return resp.data;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    /**
     * Update an Existing Identity
     */
    async updateVoice(baseUrl: string, data: {
        name: string,
        parent_id: string,
        valence: number,
        arousal: number,
        pitch: number
    }) {
        const url = this.normalizeUrl(baseUrl);
        try {
            const resp = await apiClient.post(`${url}/v1/voices/update`, data);
            return resp.data;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    /**
     * Remove an Identity
     */
    async deleteVoice(baseUrl: string, voiceId: string) {
        const url = this.normalizeUrl(baseUrl);
        try {
            const resp = await apiClient.post(`${url}/v1/voices/delete/${voiceId}`);
            return resp.data;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    /**
     * Generate a new random voice
     */
    async generateRandomVoice(baseUrl: string, currentVoiceId: string) {
        const url = this.normalizeUrl(baseUrl);
        try {
            const resp = await apiClient.post(`${url}/v1/voices/random`, {
                current_voice_id: currentVoiceId
            });
            return resp.data;
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
};
