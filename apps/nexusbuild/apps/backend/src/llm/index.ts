/**
 * LLM Provider Factory
 * Exports the configured LLM provider based on environment
 */

import { LLMProvider } from './types';
import { getOpenRouterProvider } from './openrouter';

// Export types for external use
export * from './types';

// Provider selection based on environment
// Currently only OpenRouter is implemented, but this allows easy extension
export function getLLMProvider(): LLMProvider {
    // Future: Check for MOONSHOT_API_KEY and use Moonshot directly
    // Future: Check for OPENAI_API_KEY and use OpenAI

    // Default to OpenRouter (Kimi K2 free)
    return getOpenRouterProvider();
}

// Convenience export for the default provider
export const llmProvider = getLLMProvider();
