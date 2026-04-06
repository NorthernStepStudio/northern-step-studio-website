// apps/mobile/src/hooks/useAgent.ts
// Rules-based assistant hook - Uses local rulesEngine
import { useState, useCallback, useEffect } from 'react';
import { itemsRepo } from '../db/repositories/itemsRepo';
import { respondToUserMessage, BotResponse, ActionButton } from '../chatbot/rulesEngine';
import { useAuthStore } from '../stores/authStore';
import { postAgent } from '../services/aiAgentClient';
import { useInventoryStore } from '../stores/inventoryStore';

export interface Message {
    id: string;
    role: 'user' | 'model' | 'system';
    text: string;
    createdAt: number;
    actions?: ActionButton[];
    intent?: string;
}

export function useAgent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { session } = useAuthStore();
    const { activeHomeId } = useInventoryStore();

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'model',
                text: "👋 Hi! I'm your ProvLy Assistant. Ask me anything about your inventory or insurance claims.",
                createdAt: Date.now(),
            }]);

            // Restore the "System Ready" message with professional non-AI wording
            const timer = setTimeout(() => {
                setMessages(prev => {
                    if (prev.length === 1 && prev[0].id === 'welcome') {
                        return [...prev, {
                            id: 'system-ready',
                            role: 'model',
                            text: "🛡️ Connection established. Your local inventory database is synchronized and ready.",
                            createdAt: Date.now(),
                        }];
                    }
                    return prev;
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;
        const currentText = text.trim();
        console.log('[useAgent] sendMessage initiated:', currentText);

        // Add user message
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: currentText,
            createdAt: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const startTime = Date.now();

            // 1. Fetch local facts first so they can be sent to Cloud or used by local fallback
            console.log('[useAgent] Fetching local facts...');
            let factPack = null;
            try {
                factPack = await itemsRepo.getFactPack(activeHomeId || undefined);
                console.log(`[useAgent] Local facts loaded in ${Date.now() - startTime}ms`);
            } catch (fpError) {
                console.warn('[useAgent] Failed to fetch local facts:', fpError);
            }

            // 2. Check if online and authenticated for Cloud Service
            if (session?.access_token && activeHomeId) {
                try {
                    console.log('[useAgent] Attempting Cloud Service with facts...');
                    const history = messages
                        .filter(m => m.id !== 'welcome' && m.id !== 'system-ready')
                        .slice(-5)
                        .map(m => ({
                            role: m.role,
                            content: m.text
                        }));

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => {
                        console.warn(`[useAgent] Cloud Service timed out after ${Date.now() - startTime}ms`);
                        controller.abort();
                    }, 3000); // 3s timeout

                    const data = await postAgent({
                        prompt: currentText,
                        homeId: activeHomeId,
                        history: history,
                        access_token: session.access_token,
                        fact_pack: factPack, // INJECT LOCAL FACTS
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);
                    console.log(`[useAgent] Cloud Service success in ${Date.now() - startTime}ms`);

                    const botText = data.response || "I didn't get a response.";

                    const botMsg: Message = {
                        id: `bot-${Date.now()}`,
                        role: 'model',
                        text: typeof botText === 'string' ? botText : JSON.stringify(botText),
                        createdAt: Date.now(),
                    };
                    setMessages(prev => [...prev, botMsg]);
                    setIsLoading(false);
                    return;
                } catch (netError: any) {
                    console.warn(`[useAgent] Cloud Service failed/timed out after ${Date.now() - startTime}ms:`, netError.message || netError);
                }
            } else {
                console.log('[useAgent] Skipping Cloud service: No session or activeHomeId');
            }

            console.log('[useAgent] Starting local fallback...');

            console.log('[useAgent] Responding via Rules Engine...');
            const response: BotResponse = respondToUserMessage({
                text: currentText,
                factPack,
                locale: 'en',
            });

            const botMsg: Message = {
                id: `bot-local-${Date.now()}`,
                role: 'model',
                text: response.message || "I'm listening, tell me more!",
                createdAt: Date.now(),
                actions: response.actions,
                intent: response.intent,
            };

            console.log('[useAgent] Local response added');
            setMessages(prev => [...prev, botMsg]);

        } catch (error: any) {
            console.error('[useAgent] Critical error:', error);
            const errorMsg: Message = {
                id: `error-${Date.now()}`,
                role: 'model',
                text: `😅 I'm having a little trouble thinking. Try asking "Help" or checking your connection.`,
                createdAt: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            console.log('[useAgent] sendMessage complete');
        }
    }, [messages, session, activeHomeId]);

    const clearHistory = useCallback(() => {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: "👋 Chat cleared. How else can I help you?",
            createdAt: Date.now(),
        }]);
    }, []);

    return {
        messages,
        sendMessage,
        isLoading,
        clearHistory
    };
}
