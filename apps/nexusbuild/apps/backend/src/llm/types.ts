/**
 * LLM Provider Types
 * Defines interfaces for chat messages, tools, and provider abstraction
 */

// Chat message format (OpenAI-compatible)
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    name?: string;           // For tool messages
    tool_call_id?: string;   // For tool result messages
    tool_calls?: ToolCall[]; // For assistant messages requesting tools
}

// Tool call request from the model
export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

// Tool definition for the model
export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, {
                type: string;
                description?: string;
                enum?: string[];
            }>;
            required?: string[];
        };
    };
}

// User context passed with chat requests
export interface UserContext {
    budget?: number;
    country?: string;
    useCase?: 'gaming' | 'workstation' | 'streaming' | 'general';
    existingParts?: Record<string, string>;
}

// Chat request from the frontend
export interface ChatRequest {
    messages: ChatMessage[];
    userContext?: UserContext;
}

// Structured build recommendation
export interface BuildRecommendation {
    name: string;
    totalPrice: number;
    parts: {
        category: string;
        name: string;
        price: number;
        id?: string;
    }[];
    notes?: string;
}

// Chat response to the frontend
export interface ChatResponse {
    message: string;
    build?: BuildRecommendation;
    toolsUsed?: string[];
}

// LLM completion options
export interface CompletionOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    tools?: ToolDefinition[];
}

// LLM Provider interface - allows swapping between OpenRouter, Moonshot, etc.
export interface LLMProvider {
    /**
     * Send a chat completion request
     * @param messages - Conversation history
     * @param options - Model, tokens, tools config
     * @returns The assistant's response message
     */
    chat(messages: ChatMessage[], options?: CompletionOptions): Promise<ChatMessage>;

    /**
     * Get the provider name for logging
     */
    getName(): string;
}
