/**
 * 📊 Nexus AI Analytics Module
 * 
 * Tracks which patterns are matched, fallback rates, and popular questions.
 * Helps identify gaps in Nexus knowledge for improvement.
 */

// Analytics storage (in-memory for now, could be persisted to AsyncStorage)
const analyticsData = {
    // Pattern match counts
    patternMatches: {},

    // Fallback tracking
    fallbackCount: 0,
    fallbackQuestions: [],

    // Session stats
    sessionStart: Date.now(),
    totalQuestions: 0,

    // Popular topics
    topicCounts: {
        gaming: 0,
        streaming: 0,
        components: 0,
        budget: 0,
        compatibility: 0,
        troubleshooting: 0,
        comparison: 0,
        games: 0
    },

    // Synonym normalization
    synonymMatches: {
        total: 0,
        matches: {},
        ambiguous: {}
    }
};

/**
 * Log a pattern match
 * @param {string} pattern - Name of the matched pattern
 * @param {string} question - User's question
 */
export const logPatternMatch = (pattern, question) => {
    analyticsData.totalQuestions++;

    if (!analyticsData.patternMatches[pattern]) {
        analyticsData.patternMatches[pattern] = {
            count: 0,
            examples: []
        };
    }

    analyticsData.patternMatches[pattern].count++;

    // Store up to 5 example questions per pattern
    if (analyticsData.patternMatches[pattern].examples.length < 5) {
        analyticsData.patternMatches[pattern].examples.push(question);
    }

    // Track topics
    const lower = question.toLowerCase();
    if (/gaming|game|fps|play/i.test(lower)) analyticsData.topicCounts.gaming++;
    if (/stream|twitch|obs/i.test(lower)) analyticsData.topicCounts.streaming++;
    if (/cpu|gpu|ram|ssd|psu|cooler/i.test(lower)) analyticsData.topicCounts.components++;
    if (/budget|\$|cost|price/i.test(lower)) analyticsData.topicCounts.budget++;
    if (/compatible|fit|work with/i.test(lower)) analyticsData.topicCounts.compatibility++;
    if (/problem|issue|won't|doesn't|help/i.test(lower)) analyticsData.topicCounts.troubleshooting++;
    if (/vs|compare|better|or/i.test(lower)) analyticsData.topicCounts.comparison++;
    if (/minecraft|fortnite|valorant|warzone|roblox|cyberpunk/i.test(lower)) analyticsData.topicCounts.games++;
};

/**
 * Log a fallback response (when no pattern matched)
 * @param {string} question - User's question that fell through
 */
export const logFallback = (question) => {
    analyticsData.totalQuestions++;
    analyticsData.fallbackCount++;

    // Store up to 20 fallback questions for review
    if (analyticsData.fallbackQuestions.length < 20) {
        analyticsData.fallbackQuestions.push({
            question,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Log a synonym normalization match
 * @param {string} term - Synonym matched in user input
 * @param {string|null} canonical - Canonical term after normalization
 * @param {string} message - User's question
 * @param {object} options - Additional flags
 */
export const logSynonymMatch = (term, canonical, message, options = {}) => {
    analyticsData.synonymMatches.total++;

    const bucket = options.ambiguous && !canonical
        ? analyticsData.synonymMatches.ambiguous
        : analyticsData.synonymMatches.matches;

    const key = canonical ? `${term} → ${canonical}` : `${term}`;

    if (!bucket[key]) {
        bucket[key] = {
            count: 0,
            examples: []
        };
    }

    bucket[key].count++;

    if (bucket[key].examples.length < 5) {
        bucket[key].examples.push(message);
    }
};

/**
 * Get analytics summary
 * @returns {object} Analytics summary
 */
export const getAnalyticsSummary = () => {
    const sessionDuration = Math.round((Date.now() - analyticsData.sessionStart) / 1000 / 60); // minutes

    // Calculate success rate
    const successRate = analyticsData.totalQuestions > 0
        ? Math.round(((analyticsData.totalQuestions - analyticsData.fallbackCount) / analyticsData.totalQuestions) * 100)
        : 100;

    // Get top patterns
    const topPatterns = Object.entries(analyticsData.patternMatches)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([name, data]) => ({ name, count: data.count }));

    // Get top topics
    const topTopics = Object.entries(analyticsData.topicCounts)
        .sort((a, b) => b[1] - a[1])
        .filter(([_, count]) => count > 0)
        .slice(0, 5);

    return {
        sessionDuration: `${sessionDuration} minutes`,
        totalQuestions: analyticsData.totalQuestions,
        successRate: `${successRate}%`,
        fallbackCount: analyticsData.fallbackCount,
        fallbackQuestions: analyticsData.fallbackQuestions,
        topPatterns,
        topTopics,
        synonymMatches: analyticsData.synonymMatches,
        rawData: analyticsData
    };
};

/**
 * Format analytics as a readable report
 * @returns {string} Formatted report
 */
export const getAnalyticsReport = () => {
    const summary = getAnalyticsSummary();

    let report = `## 📊 Nexus AI Analytics\n\n`;
    report += `**Session:** ${summary.sessionDuration}\n`;
    report += `**Total Questions:** ${summary.totalQuestions}\n`;
    report += `**Success Rate:** ${summary.successRate}\n`;
    report += `**Fallbacks:** ${summary.fallbackCount}\n\n`;

    if (summary.topPatterns.length > 0) {
        report += `### Top Matched Patterns\n`;
        summary.topPatterns.forEach((p, i) => {
            report += `${i + 1}. ${p.name}: ${p.count} matches\n`;
        });
        report += `\n`;
    }

    if (summary.topTopics.length > 0) {
        report += `### Popular Topics\n`;
        summary.topTopics.forEach(([topic, count]) => {
            report += `- ${topic}: ${count}\n`;
        });
        report += `\n`;
    }

    if (summary.fallbackQuestions.length > 0) {
        report += `### ⚠️ Unhandled Questions (Needs Improvement)\n`;
        summary.fallbackQuestions.slice(0, 5).forEach(fq => {
            report += `- "${fq.question}"\n`;
        });
    }

    if (summary.synonymMatches.total > 0) {
        const topSynonyms = Object.entries(summary.synonymMatches.matches)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);

        report += `\n### 🔤 Synonym Normalization\n`;
        topSynonyms.forEach(([name, data]) => {
            report += `- ${name}: ${data.count}\n`;
        });
    }

    return report;
};

/**
 * Reset analytics data
 */
export const resetAnalytics = () => {
    analyticsData.patternMatches = {};
    analyticsData.fallbackCount = 0;
    analyticsData.fallbackQuestions = [];
    analyticsData.sessionStart = Date.now();
    analyticsData.totalQuestions = 0;
    analyticsData.topicCounts = {
        gaming: 0,
        streaming: 0,
        components: 0,
        budget: 0,
        compatibility: 0,
        troubleshooting: 0,
        comparison: 0,
        games: 0
    };
    analyticsData.synonymMatches = {
        total: 0,
        matches: {},
        ambiguous: {}
    };
};

export default {
    logPatternMatch,
    logFallback,
    logSynonymMatch,
    getAnalyticsSummary,
    getAnalyticsReport,
    resetAnalytics
};
