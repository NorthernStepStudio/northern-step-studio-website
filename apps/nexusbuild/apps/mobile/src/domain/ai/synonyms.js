import { logSynonymMatch } from './analytics.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildTermRegex = (term) => {
    const escaped = escapeRegex(term)
        .replace(/\\\s+/g, '\\s+')
        .replace(/\\-/g, '[-\\s]');
    return new RegExp(`\\b${escaped}\\b`, 'gi');
};

export const SYNONYM_DICTIONARY = {
    gpu: ['gpu', 'graphics card', 'gfx card', 'video card', 'video-card', 'graphics adapter', 'vga', 'chip'],
    cpu: ['cpu', 'processor', 'central processing unit', 'proc', 'chip'],
    motherboard: ['motherboard', 'mobo', 'mainboard'],
    psu: ['psu', 'power supply', 'power-supply', 'power unit'],
    ram: ['ram', 'memory', 'system memory', 'mem'],
    storage: ['storage', 'drive', 'disk', 'ssd', 'hdd', 'hard drive', 'solid state', 'memory'],
    cooler: ['cooler', 'cpu cooler', 'heatsink', 'aio', 'liquid cooler'],
    case: ['case', 'chassis', 'tower', 'pc case'],
    build: ['build', 'rig', 'setup', 'pc', 'computer', 'system'],
    upgrade: ['upgrade', 'improve', 'replace', 'swap', 'better'],
    budget: ['budget', 'spend', 'cost', 'price'],
    gaming: ['gaming', 'games', 'play', 'esports', 'fps'],
    streaming: ['streaming', 'twitch', 'obs', 'broadcast'],
    work: ['work', 'productivity', 'office', 'editing', 'rendering', 'coding'],
    compare: ['compare', 'vs', 'versus', 'difference']
};

const buildTermMap = () => {
    const map = new Map();
    Object.entries(SYNONYM_DICTIONARY).forEach(([canonical, terms]) => {
        terms.forEach((term) => {
            const normalizedTerm = term.toLowerCase();
            if (!map.has(normalizedTerm)) {
                map.set(normalizedTerm, []);
            }
            map.get(normalizedTerm).push(canonical);
        });
    });
    return map;
};

const TERM_MAP = buildTermMap();
const SORTED_TERMS = Array.from(TERM_MAP.keys()).sort((a, b) => b.length - a.length);

const resolveAmbiguousTerm = (term, candidates, messageLower) => {
    if (term === 'chip') {
        if (/(gpu|graphics|video|vga|frame|render)/i.test(messageLower)) return 'gpu';
        if (/(cpu|processor|core|ryzen|intel|threadripper)/i.test(messageLower)) return 'cpu';
    }

    if (term === 'memory') {
        if (/(ram|ddr|memory kit|gb\s*ram)/i.test(messageLower)) return 'ram';
        if (/(storage|ssd|hdd|drive|disk|nvme)/i.test(messageLower)) return 'storage';
    }

    return candidates.length === 1 ? candidates[0] : null;
};

const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Check if any word in the text fuzzily matches the target.
 * Returns the matched word if found, or null.
 * @param {string} text - User text to search
 * @param {string} target - Target word to find
 * @param {number} tolerance - Max distance (default 2)
 */
export const getFuzzyMatch = (text, target, tolerance = 2) => {
    if (!text || !target) return null;
    const targetLower = target.toLowerCase().trim();
    const words = text.toLowerCase().split(/[\s,.?!]+/).filter(Boolean);

    // Direct match (fast path)
    if (words.includes(targetLower)) return targetLower;

    // Only apply fuzzy matching to single-word component terms.
    if (targetLower.includes(' ') || targetLower.length < 4) return null;

    // Short hardware terms become too noisy with edit distance 2.
    const effectiveTolerance = targetLower.length < 6 ? Math.min(tolerance, 1) : tolerance;

    for (const word of words) {
        if (word.length < 4) continue;
        if (word[0] !== targetLower[0]) continue;
        if (Math.abs(word.length - targetLower.length) > effectiveTolerance) continue;
        const dist = levenshtein(word, targetLower);
        if (dist <= effectiveTolerance) {
            return word;
        }
    }
    return null;
};

export const normalizeUserMessage = (message, { logMatches = true } = {}) => {
    if (!message) {
        return { normalized: message, matches: [], ambiguities: [] };
    }

    let normalized = message;
    const messageLower = message.toLowerCase();
    const matches = [];
    const ambiguities = [];

    // First pass: Direct fuzzy matching for known dictionary terms
    Object.entries(SYNONYM_DICTIONARY).forEach(([canonical, variations]) => {
        variations.forEach(variant => {
            const fuzzyMatch = getFuzzyMatch(message, variant, 2);
            if (fuzzyMatch && fuzzyMatch !== variant) {
                // Found a typo! Replace it in normalized string
                // Only replace checking word boundaries to avoid false positives inside other words
                const regex = new RegExp(`\\b${fuzzyMatch}\\b`, 'gi');
                normalized = normalized.replace(regex, variant);
            }
        });
    });

    SORTED_TERMS.forEach((term) => {
        const regex = buildTermRegex(term);
        const occurrences = normalized.match(regex);

        if (!occurrences) return;

        const candidates = TERM_MAP.get(term) || [];
        const resolved = candidates.length > 1
            ? resolveAmbiguousTerm(term, candidates, normalized.toLowerCase())
            : candidates[0];

        if (!resolved) {
            ambiguities.push({ term, candidates });
            if (logMatches) {
                logSynonymMatch(term, null, message, { ambiguous: true, candidates });
            }
            return;
        }

        const shouldReplace = term !== resolved;
        if (shouldReplace) {
            normalized = normalized.replace(regex, resolved);
        }

        occurrences.forEach(() => {
            const isSynonymMatch = term !== resolved || candidates.length > 1;
            if (!isSynonymMatch) {
                return;
            }

            const entry = { term, canonical: resolved, ambiguous: candidates.length > 1 };
            matches.push(entry);
            if (logMatches) {
                logSynonymMatch(term, resolved, message, { ambiguous: candidates.length > 1 });
            }
        });
    });

    return { normalized, matches, ambiguities };
};

export default {
    SYNONYM_DICTIONARY,
    normalizeUserMessage,
    getFuzzyMatch
};

