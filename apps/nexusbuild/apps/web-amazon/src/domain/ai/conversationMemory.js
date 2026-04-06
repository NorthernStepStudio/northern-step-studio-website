/**
 * 🧠 NexusBuild Conversation Memory Manager (Web Version)
 * 
 * Handles chat persistence based on user authentication status.
 * Remembers entities (GPU, CPU, budget, etc.) across conversation turns.
 * 
 * Storage Strategy:
 * - Registered users: localStorage (persists until logout)
 * - Guest users: In-memory only (cleared when chat closes/refreshes, unless using sessionStorage)
 */

import { GAMES, PATTERNS } from '../../../../../packages/shared/ai/entityExtractors';

// Storage keys
const STORAGE_KEYS = {
    HISTORY: 'nexus_chat_history',
    CONTEXT: 'nexus_conversation_context',
};

class ConversationMemory {
    constructor() {
        this.userType = 'guest'; // 'registered' or 'guest'
        this.userId = null;

        // Message history
        this.history = [];

        // Extracted context (what we know about the user)
        this.context = {
            budget: null,
            useCase: null,         // 'gaming', 'work', 'streaming', 'content'
            resolution: null,      // '1080p', '1440p', '4K'
            components: {
                gpu: null,
                cpu: null,
                ram: null,
                storage: null,
                psu: null,
                motherboard: null,
                cooler: null,
                case: null,
            },
            games: [],
            turnCount: 0,
        };
    }

    /**
     * Initialize memory for a specific user
     * @param {string} userType 'registered' or 'guest'
     * @param {string|null} userId 
     */
    init(userType = 'guest', userId = null) {
        this.userId = userId;
        this.userType = userType;

        if (this.userType === 'registered') {
            this.loadFromStorage();
        } else {
            // Optional: Load from sessionStorage for guests to persist across reloads
            // For now, keeping as requested: In-memory only for guests
            this.clearMemory(); // Reset if switching to guest
        }
    }

    /**
     * Load history and context from storage
     */
    loadFromStorage() {
        if (!this.userId) return;

        try {
            const history = localStorage.getItem(`${STORAGE_KEYS.HISTORY}_${this.userId}`);
            const context = localStorage.getItem(`${STORAGE_KEYS.CONTEXT}_${this.userId}`);

            if (history) this.history = JSON.parse(history);
            if (context) this.context = JSON.parse(context);
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
    }

    /**
     * Save current state to storage
     */
    saveToStorage() {
        if (this.userType !== 'registered' || !this.userId) return;

        try {
            localStorage.setItem(`${STORAGE_KEYS.HISTORY}_${this.userId}`, JSON.stringify(this.history));
            localStorage.setItem(`${STORAGE_KEYS.CONTEXT}_${this.userId}`, JSON.stringify(this.context));
        } catch (error) {
            console.error('Failed to save chat history', error);
        }
    }

    /**
     * Add a message to history and process it for context
     * @param {string} role 'user' or 'assistant'
     * @param {string} content 
     */
    addMessage(role, content) {
        this.history.push({
            role,
            content,
            timestamp: Date.now()
        });

        this.context.turnCount++;

        if (role === 'user') {
            this.extractEntities(content);
        }

        this.saveToStorage();
    }

    /**
     * Extract relevant PC building entities from user text
     * @param {string} text 
     */
    extractEntities(text) {
        const lower = text.toLowerCase();
        let updated = false;

        // 1. Check Budget
        const budgetMatch = text.match(PATTERNS.budget);
        if (budgetMatch) {
            const amount = parseInt(budgetMatch[1] || budgetMatch[2]);
            if (amount > 100 && amount < 20000) { // Sanity check
                this.context.budget = amount;
                updated = true;
            }
        }

        // 2. Check Use Case
        if (lower.includes('gaming') || lower.includes('play')) {
            this.context.useCase = 'gaming';
            updated = true;
        } else if (lower.includes('work') || lower.includes('productivity') || lower.includes('office')) {
            this.context.useCase = 'workstation';
            updated = true;
        } else if (lower.includes('stream') || lower.includes('broadcasting')) {
            this.context.useCase = 'streaming';
            updated = true;
        }

        // 3. Check Resolution
        const resMatch = text.match(PATTERNS.resolution);
        if (resMatch) {
            const val = resMatch[0].toLowerCase();
            if (val.includes('4k') || val.includes('2160')) this.context.resolution = '4K';
            else if (val.includes('1440') || val.includes('2k') || val.includes('qhd')) this.context.resolution = '1440p';
            else if (val.includes('1080') || val.includes('fhd')) this.context.resolution = '1080p';
            updated = true;
        }

        // 4. Check Components
        for (const [key, pattern] of Object.entries(PATTERNS)) {
            if (['budget', 'resolution'].includes(key)) continue;

            const match = text.match(pattern);
            if (match) {
                this.context.components[key] = match[0];
                updated = true;
            }
        }

        // 5. Check Games
        const foundGames = GAMES.filter(g => lower.includes(g));
        if (foundGames.length > 0) {
            const newGames = [...new Set([...this.context.games, ...foundGames])];
            if (newGames.length !== this.context.games.length) {
                this.context.games = newGames;
                updated = true;
            }
        }

        if (updated) {
            // Save immediately if context updated
            this.saveToStorage();
        }
    }

    /**
     * Get extracted context
     */
    getContext() {
        return this.context;
    }

    /**
     * Alias for getContext to match UI request
     */
    getContextForAI() {
        return this.context;
    }

    /**
     * Get message history
     */
    getHistory() {
        return this.history;
    }

    /**
     * Clear memory
     */
    clearMemory() {
        this.history = [];
        this.context = {
            budget: null,
            useCase: null,
            resolution: null,
            components: {
                gpu: null, cpu: null, ram: null, storage: null,
                psu: null, motherboard: null, cooler: null, case: null
            },
            games: [],
            turnCount: 0,
        };

        if (this.userType === 'registered' && this.userId) {
            localStorage.removeItem(`${STORAGE_KEYS.HISTORY}_${this.userId}`);
            localStorage.removeItem(`${STORAGE_KEYS.CONTEXT}_${this.userId}`);
        }
    }
}

// Export singleton instance
const nexusMemory = new ConversationMemory();
export default nexusMemory;
