/**
 * PC Expert Chat Service
 * Handles communication with the AI chat API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same base URL as the main API
const getApiUrl = async () => {
    try {
        const customUrl = await AsyncStorage.getItem('customApiUrl');
        if (customUrl) return customUrl;
    } catch (e) {
        console.log('[ChatService] Error reading custom URL:', e);
    }
    // Default to production or dev
    return __DEV__
        ? 'https://northernstepstudio.com'
        : 'https://nexusbuild-app-production.up.railway.app';
};

/**
 * Send a message to PC Expert
 * @param {Array} messages - Array of {role, content} message objects
 * @param {Object} userContext - Optional context {budget, country, useCase, existingParts}
 * @returns {Promise<Object>} Response with message, build, and toolsUsed
 */
export async function sendChatMessage(messages, userContext) {
    const apiUrl = await getApiUrl();

    try {
        const response = await fetch(`${apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                userContext,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[ChatService] Error:', error);
        return {
            message: 'Sorry, I encountered an error. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Quick prompts for users
 */
export const QUICK_PROMPTS = [
    { label: '💰 $800 Gaming PC', prompt: 'Build me a $800 gaming PC for 1080p gaming' },
    { label: '🎮 $1200 1440p Build', prompt: 'Build me a $1200 PC for 1440p gaming at 144Hz' },
    { label: '🖥️ Workstation', prompt: 'I need a workstation PC for video editing under $1500' },
    { label: '⚡ Budget Build', prompt: 'What\'s the best gaming PC I can build for $500?' },
    { label: '🔧 Upgrade Help', prompt: 'I have an RTX 3060, what CPU should I pair with it?' },
];

/**
 * Format price for display
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
    return `$${price.toLocaleString()}`;
}

/**
 * Extract budget from user message
 * @param {string} message
 * @returns {number|undefined}
 */
export function extractBudget(message) {
    const match = message.match(/\$(\d{1,5})/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return undefined;
}
