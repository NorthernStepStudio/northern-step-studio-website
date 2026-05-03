// apps/mobile/src/config/features.ts
// Feature flags for ProvLy app

/**
 * Feature Flags
 * 
 * ENABLE_AI_CHAT: Shows AI Chat tab (requires Gemini API key on backend)
 * ENABLE_RULES_CHAT: Shows rules-based assistant tab (NO AI, fully local)
 * ENABLE_SMART_SCAN: Uses Gemini AI to analyze scanned images
 * ENABLE_RULES_HELPER: Shows keyword-based claim/export tips in scan flow
 */
export const FEATURES = {
    /** Enable AI Chat with cloud Gemini (requires API key) */
    ENABLE_AI_CHAT: true,

    /** Enable local rules-based chat assistant (NO AI, NO cloud) */
    ENABLE_RULES_CHAT: false,

    /** Enable Smart Scan with Gemini Vision (requires Gemini API key) */
    ENABLE_SMART_SCAN: false,

    /** Enable rules-based helper for claim/export guidance (no AI) */
    ENABLE_RULES_HELPER: true,

    /** Enable Maintenance Autopilot feature */
    ENABLE_MAINTENANCE: true,
};

// Convenience: Is any chat feature enabled?
export const CHAT_ENABLED = FEATURES.ENABLE_AI_CHAT || FEATURES.ENABLE_RULES_CHAT;
