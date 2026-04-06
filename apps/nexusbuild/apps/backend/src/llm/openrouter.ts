/**
 * OpenRouter LLM Provider
 * Implements chat completions using OpenRouter API (Kimi K2 free tier)
 */

import {
  ChatMessage,
  CompletionOptions,
  LLMProvider,
  ToolDefinition,
} from "./types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-2-9b-it:free";
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TIMEOUT_MS = 90000;

interface OpenRouterChoice {
  message: {
    role: "assistant";
    content: string | null;
    tool_calls?: {
      id: string;
      type: "function";
      function: {
        name: string;
        arguments: string;
      };
    }[];
  };
  finish_reason: string;
}

interface OpenRouterResponse {
  id: string;
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterProvider implements LLMProvider {
  private apiKey: string;
  private appName: string;
  private appUrl: string;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn(
        "[OpenRouter] OPENROUTER_API_KEY not set - LLM calls will fail",
      );
    }
    this.apiKey = apiKey || "";
    this.appName = process.env.APP_NAME || "NexusBuild";
    this.appUrl = process.env.APP_BASE_URL || "https://nexusbuild.app";
  }

  getName(): string {
    return "OpenRouter (Kimi K2)";
  }

  async chat(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<ChatMessage> {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const model = options?.model || DEFAULT_MODEL;
    const maxTokens = options?.maxTokens || DEFAULT_MAX_TOKENS;

    const requestBody: Record<string, unknown> = {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
        ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
        ...(m.tool_calls && { tool_calls: m.tool_calls }),
      })),
      max_tokens: maxTokens,
      temperature: options?.temperature ?? 0.7,
    };

    // Add tools if provided
    if (options?.tools && options.tools.length > 0) {
      requestBody.tools = options.tools;
      requestBody.tool_choice = "auto";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.appUrl,
          "X-OpenRouter-Title": this.appName,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[OpenRouter] API Error:", response.status, errorText);
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorText}`,
        );
      }

      const data = (await response.json()) as OpenRouterResponse;

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices from OpenRouter");
      }

      const choice = data.choices[0];
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: choice.message.content,
      };

      // If the model wants to call tools, include them
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        assistantMessage.tool_calls = choice.message.tool_calls;
      }

      // Log usage for monitoring
      if (data.usage) {
        console.log(
          `[OpenRouter] Tokens used: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`,
        );
      }

      return assistantMessage;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("OpenRouter request timed out");
      }
      throw error;
    }
  }
}

// Singleton instance
let providerInstance: OpenRouterProvider | null = null;

export function getOpenRouterProvider(): OpenRouterProvider {
  if (!providerInstance) {
    providerInstance = new OpenRouterProvider();
  }
  return providerInstance;
}
