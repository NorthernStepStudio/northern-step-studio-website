/**
 * 🧠 NexusBuild Conversation Memory Manager
 * 
 * Handles chat persistence based on user authentication status.
 * Remembers entities (GPU, CPU, budget, etc.) across conversation turns.
 * 
 * Storage Strategy:
 * - Registered users: AsyncStorage (persists until logout)
 * - Guest users: In-memory only (cleared when chat closes)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeUserMessage } from './synonyms';

// Storage keys
const STORAGE_KEYS = {
    HISTORY: '@nexus_chat_history',
    CONTEXT: '@nexus_conversation_context',
};

// === COMPONENT DETECTION PATTERNS ===
const PATTERNS = {
    gpu: /(rtx\s*\d{4}(\s*(ti|super))?|gtx\s*\d{3,4}(\s*ti)?|rx\s*\d{3,4}\s*(xt|x|xtx)?|radeon\s*rx\s*\d{3,4}\s*(xt|xtx)?|geforce\s*rtx\s*\d{4}(\s*(ti|super))?|quadro\s*\w+|firepro\s*\w+|arc\s*a\d{3})/i,
    cpu: /(ryzen\s*[3579]\s*\d{4}x?3?d?|ryzen\s*\d{4}x?3?d?|i[3579]-?\d{4,5}[kf]?|core\s*i[3579]-?\d{4,5}[kf]?|intel\s*core\s*i[3579]-?\d{4,5}[kf]?|fx-?\d{4}|xeon|threadripper\s*\d{3,4}x?)/i,
    ram: /(ddr[345]|(\d{1,3})\s*gb\s*(ram|memory|ddr)?|\d{4}\s*mhz)/i,
    storage: /(ssd|hdd|nvme|(\d+)\s*(tb|gb)\s*(ssd|hdd|storage|drive)?)/i,
    psu: /((\d{3,4})\s*w(att)?|power\s*supply|psu|corsair\s*rm|evga|seasonic)/i,
    motherboard: /([abxz]\d{3}[me]?|motherboard|mobo|lga\s*\d{4}|am[45])/i,
    cooler: /(cooler|aio|noctua|hyper\s*212|stock\s*cooler|liquid\s*cool|air\s*cool)/i,
    case: /(mid\s*tower|full\s*tower|mini\s*itx|atx\s*case|meshify|lian\s*li|nzxt)/i,
    budget: /(?:\$|usd|dollars?|budget)\s*([1-9]\d{2,5})|([1-9]\d{2,5})\s*(usd|dollars?|budget)/i,
    resolution: /(4k|2160p|1440p|2k|qhd|1080p|fhd|full\s*hd)/i,
};

// Game patterns
const GAMES = [
    'cyberpunk', 'fortnite', 'valorant', 'cs2', 'csgo', 'counter-strike',
    'elden ring', 'hogwarts', 'starfield', 'cod', 'warzone', 'apex',
    'minecraft', 'gta', 'rdr2', 'baldur', 'diablo', 'overwatch',
    'league', 'dota', 'pubg', 'rust', 'ark', 'destiny'
];

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
            // What Nexus is waiting for
            awaiting: {
                gpu: false,
                cpu: false,
                budget: false,
                component: false,
            },
            // User intent
            intent: null, // 'upgrade', 'build', 'comparison'
            wantsUpgrade: false,
            wantsBuild: false,
            wantsComparison: false,
        };
    }

    /**
     * Initialize the memory system
     * @param {string} type - 'registered' or 'guest'
     * @param {string} userId - Unique user ID
     */
    async init(type = 'guest', userId = null) {
        this.userType = type;
        this.userId = userId;

        // Load persisted data for registered users
        if (type === 'registered') {
            await this._loadFromStorage();
        }

        console.log(`NexusMemory initialized: ${this.userType}${userId ? ` (${userId})` : ''}`);
    }

    // === MESSAGE HISTORY ===

    /**
     * Add a message to history and extract entities
     */
    addMessage(sender, text) {
        const message = {
            role: sender, // 'user' or 'assistant'
            content: text,
            timestamp: new Date().toISOString(),
        };

        this.history.push(message);

        // Extract entities from user messages
        if (sender === 'user') {
            const { normalized } = normalizeUserMessage(text);
            this._extractEntities(normalized);
        }

        // Auto-save for registered users
        if (this.userType === 'registered') {
            this._saveToStorage();
        }
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Get history formatted for AI context (last N messages)
     */
    getContextForAI(limit = 10) {
        return this.history.slice(-limit);
    }

    // === ENTITY EXTRACTION ===

    /**
     * Extract entities from user message and update context
     */
    _extractEntities(message) {
        const lower = message.toLowerCase();
        this.context.turnCount++;

        const nextIntent = this._detectIntent(lower);
        if (this._shouldResetContext(lower, nextIntent)) {
            this.resetContext();
        }
        if (nextIntent) {
            this.context.intent = nextIntent;
        }

        // Extract components
        for (const [type, pattern] of Object.entries(PATTERNS)) {
            const match = lower.match(pattern);
            if (match) {
                if (type === 'budget') {
                    const budgetMatch = message.match(PATTERNS.budget);
                    const budgetValue = budgetMatch?.[1] || budgetMatch?.[2];
                    if (budgetValue) this.context.budget = parseInt(budgetValue, 10);
                } else if (type === 'resolution') {
                    if (/4k|2160p/i.test(lower)) this.context.resolution = '4K';
                    else if (/1440p|2k|qhd/i.test(lower)) this.context.resolution = '1440p';
                    else if (/1080p|fhd/i.test(lower)) this.context.resolution = '1080p';
                } else if (type in this.context.components) {
                    this.context.components[type] = match[0].trim();
                }
            }
        }

        // Extract games
        for (const game of GAMES) {
            if (lower.includes(game) && !this.context.games.includes(game)) {
                this.context.games.push(game);
            }
        }

        // Detect use case
        if (/(gaming|game|fps|play)/i.test(lower)) this.context.useCase = 'gaming';
        else if (/(streaming|stream|twitch|obs)/i.test(lower)) this.context.useCase = 'streaming';
        else if (/(work|edit|render|code|program|office)/i.test(lower)) this.context.useCase = 'work';
        else if (/(content|youtube|video|photo)/i.test(lower)) this.context.useCase = 'content';

        // Set intent flags based on detected intent
        this.context.wantsUpgrade = (this.context.intent === 'upgrade');
        this.context.wantsBuild = (this.context.intent === 'build');
        this.context.wantsComparison = (this.context.intent === 'comparison');

        // Clear awaiting flags if user provided the info
        if (this.context.awaiting.gpu && this.context.components.gpu) this.context.awaiting.gpu = false;
        if (this.context.awaiting.cpu && this.context.components.cpu) this.context.awaiting.cpu = false;
        if (this.context.awaiting.budget && this.context.budget) this.context.awaiting.budget = false;
        if (this.context.awaiting.component && (this.context.components.gpu || this.context.components.cpu)) {
            this.context.awaiting.component = false;
        }
    }

    /**
     * Merge externally extracted entities into context
     * @param {object} entities - { budget, resolution, useCase, gpu, cpu, games }
     */
    mergeEntities(entities = {}) {
        if (!entities || typeof entities !== 'object') return;

        if (entities.budget) this.context.budget = entities.budget;
        if (entities.resolution) this.context.resolution = entities.resolution;
        if (entities.useCase) this.context.useCase = entities.useCase;

        if (entities.gpu) this.context.components.gpu = entities.gpu;
        if (entities.cpu) this.context.components.cpu = entities.cpu;

        if (Array.isArray(entities.games)) {
            entities.games.forEach(game => {
                if (!this.context.games.includes(game)) {
                    this.context.games.push(game);
                }
            });
        }

        // Clear awaiting flags if external entities provided the info
        if (this.context.awaiting.gpu && this.context.components.gpu) this.context.awaiting.gpu = false;
        if (this.context.awaiting.cpu && this.context.components.cpu) this.context.awaiting.cpu = false;
        if (this.context.awaiting.budget && this.context.budget) this.context.awaiting.budget = false;
        if (this.context.awaiting.component && (this.context.components.gpu || this.context.components.cpu)) {
            this.context.awaiting.component = false;
        }
    }

    // === AWAITING FLAGS ===

    /**
     * Set flag that Nexus is waiting for specific info
     */
    setAwaiting(type) {
        if (type in this.context.awaiting) {
            this.context.awaiting[type] = true;
        }
    }

    /**
     * Check if user is answering a previous question
     */
    isAnsweringQuestion(message) {
        const { normalized } = normalizeUserMessage(message);
        const lower = normalized.toLowerCase();
        const wordCount = message.split(' ').length;

        if (wordCount <= 6) {
            if ((this.context.awaiting.gpu || this.context.awaiting.component) && PATTERNS.gpu.test(lower)) return 'gpu';
            if ((this.context.awaiting.cpu || this.context.awaiting.component) && PATTERNS.cpu.test(lower)) return 'cpu';
            if (this.context.awaiting.budget && PATTERNS.budget.test(message)) return 'budget';
        }

        return null;
    }

    /**
     * Check if message contains a component name
     */
    detectsComponent(message) {
        const { normalized } = normalizeUserMessage(message);
        const lower = normalized.toLowerCase();
        for (const [type, pattern] of Object.entries(PATTERNS)) {
            if (['budget', 'resolution'].includes(type)) continue;
            if (pattern.test(lower)) return type;
        }
        return null;
    }

    _detectIntent(lower) {
        if (/(upgrade|improve|replace|swap|better|slow|old)/i.test(lower)) {
            return 'upgrade';
        }
        if (/(vs|versus|compare|difference)/i.test(lower)) {
            return 'comparison';
        }
        if (/(build|rig|pc|setup|computer)/i.test(lower)) {
            return 'build';
        }
        return null;
    }

    _shouldResetContext(lower, nextIntent) {
        if (/(start over|new build|fresh build|different build|another build|from scratch|clean slate|new pc)/i.test(lower)) {
            return true;
        }

        return Boolean(nextIntent && this.context.intent && nextIntent !== this.context.intent);
    }

    // === GETTERS ===

    getContext() {
        return { ...this.context };
    }

    // Alias for API compatibility
    getStructuredContext() {
        return {
            context: { ...this.context },
            history: this.getContextForAI(5),
            summary: this.getSummary(),
        };
    }

    getSummary() {
        const parts = [];
        if (this.context.intent) parts.push(`Intent: ${this.context.intent}`);
        if (this.context.budget) parts.push(`Budget: $${this.context.budget}`);
        if (this.context.useCase) parts.push(`Use: ${this.context.useCase}`);
        if (this.context.resolution) parts.push(`Target: ${this.context.resolution}`);
        if (this.context.components.gpu) parts.push(`GPU: ${this.context.components.gpu}`);
        if (this.context.components.cpu) parts.push(`CPU: ${this.context.components.cpu}`);
        if (this.context.games.length) parts.push(`Games: ${this.context.games.join(', ')}`);
        return parts.length ? parts.join(' | ') : 'No info yet';
    }

    // === STORAGE (Registered Users Only) ===

    async _loadFromStorage() {
        try {
            const [historyData, contextData] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
                AsyncStorage.getItem(STORAGE_KEYS.CONTEXT),
            ]);

            if (historyData) this.history = JSON.parse(historyData);
            if (contextData) this.context = { ...this.context, ...JSON.parse(contextData) };
        } catch (e) {
            console.warn('Failed to load memory from storage:', e);
        }
    }

    async _saveToStorage() {
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.history)),
                AsyncStorage.setItem(STORAGE_KEYS.CONTEXT, JSON.stringify(this.context)),
            ]);
        } catch (e) {
            console.warn('Failed to save memory to storage:', e);
        }
    }

    // === RESET ===

    /**
     * Clear memory (call on logout or chat close for guests)
     */
    async clearMemory() {
        this.history = [];
        this.context = {
            budget: null,
            useCase: null,
            resolution: null,
            components: {
                gpu: null, cpu: null, ram: null, storage: null,
                psu: null, motherboard: null, cooler: null, case: null,
            },
            games: [],
            turnCount: 0,
            awaiting: { gpu: false, cpu: false, budget: false, component: false },
            wantsUpgrade: false,
            wantsBuild: false,
            wantsComparison: false,
        };

        // Clear storage for registered users
        if (this.userType === 'registered') {
            try {
                await Promise.all([
                    AsyncStorage.removeItem(STORAGE_KEYS.HISTORY),
                    AsyncStorage.removeItem(STORAGE_KEYS.CONTEXT),
                ]);
            } catch (e) {
                console.warn('Failed to clear memory from storage:', e);
            }
        }

        console.log('Nexus memory cleared.');
    }

    /**
     * Reset only context (keep history)
     */
    resetContext() {
        this.context = {
            budget: null,
            useCase: null,
            resolution: null,
            components: {
                gpu: null, cpu: null, ram: null, storage: null,
                psu: null, motherboard: null, cooler: null, case: null,
            },
            games: [],
            turnCount: 0,
            awaiting: { gpu: false, cpu: false, budget: false, component: false },
            wantsUpgrade: false,
            wantsBuild: false,
            wantsComparison: false,
        };
    }
}

// Export singleton instance
const nexusMemory = new ConversationMemory();

// Also export for direct function access (backwards compatibility)
export const resetMemory = () => nexusMemory.clearMemory();
export const processMessage = (msg) => { nexusMemory.addMessage('user', msg); return nexusMemory.getContext(); };
export const setAwaiting = (type) => nexusMemory.setAwaiting(type);
export const isAnsweringQuestion = (msg) => nexusMemory.isAnsweringQuestion(msg);
export const detectsComponent = (msg) => nexusMemory.detectsComponent(msg);
export const getMemory = () => nexusMemory.getContext();
export const getSummary = () => nexusMemory.getSummary();
export const storeExtractedEntities = (entities) => nexusMemory.mergeEntities(entities);

export default nexusMemory;
