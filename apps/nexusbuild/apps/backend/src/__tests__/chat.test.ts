/**
 * Integration tests for /api/chat endpoint
 * Tests the PC Expert chatbot API
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock OpenRouter response
const mockOpenRouterResponse = {
    choices: [
        {
            message: {
                role: 'assistant',
                content: 'I recommend the AMD Ryzen 5 7600X for your $800 gaming build.',
                tool_calls: [
                    {
                        id: 'call_1',
                        type: 'function',
                        function: {
                            name: 'search_parts',
                            arguments: JSON.stringify({ query: 'Ryzen 5 7600X', category: 'CPU' }),
                        },
                    },
                ],
            },
        },
    ],
};

describe('Chat API Endpoint', () => {
    const API_URL = process.env.API_URL || 'http://localhost:3000';

    describe('POST /api/chat', () => {
        it('should return a response for a simple greeting', async () => {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello!' }],
                }),
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data).toHaveProperty('message');
            expect(typeof data.message).toBe('string');
            expect(data.message.length).toBeGreaterThan(0);
        });

        it('should handle build requests with budget context', async () => {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: 'Build me a $1000 gaming PC' }
                    ],
                    userContext: {
                        budget: 1000,
                        useCase: 'gaming',
                    },
                }),
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data).toHaveProperty('message');
            // The AI should mention parts or the budget
            expect(data.message.toLowerCase()).toMatch(/gaming|build|cpu|gpu|\$/i);
        });

        it('should return 400 for missing messages', async () => {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty('error');
        });

        it('should return 400 for empty messages array', async () => {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [] }),
            });

            expect(response.status).toBe(400);
        });

        it('should handle tool usage for part searches', async () => {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: 'What is the best RTX 4070?' }
                    ],
                }),
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data).toHaveProperty('message');
            // If tools were used, they should be reported
            if (data.toolsUsed) {
                expect(Array.isArray(data.toolsUsed)).toBe(true);
            }
        });

        it('should handle compatibility questions', async () => {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: 'Is the Ryzen 7 7800X3D compatible with B550 motherboards?' }
                    ],
                }),
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data).toHaveProperty('message');
            // Should mention compatibility
            expect(data.message.toLowerCase()).toMatch(/compatible|socket|am5|am4|no|yes/i);
        });

        it('should respect rate limiting', async () => {
            // Make 25 rapid requests (limit is 20/min)
            const requests = Array(25).fill(null).map(() =>
                fetch(`${API_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: 'test' }],
                    }),
                })
            );

            const responses = await Promise.all(requests);
            const statuses = responses.map(r => r.status);

            // At least some should be rate limited (429)
            const rateLimited = statuses.filter(s => s === 429).length;
            expect(rateLimited).toBeGreaterThan(0);
        });
    });

    describe('Chat with existing build context', () => {
        it('should provide upgrade suggestions when build context is provided', async () => {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: 'What GPU should I upgrade to?' }
                    ],
                    userContext: {
                        existingParts: {
                            cpu: 'AMD Ryzen 5 5600X',
                            gpu: 'NVIDIA GeForce GTX 1660 Super',
                            motherboard: 'MSI B550 Tomahawk',
                        },
                    },
                }),
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data).toHaveProperty('message');
            // Should recommend a GPU upgrade
            expect(data.message.toLowerCase()).toMatch(/rtx|radeon|upgrade|gpu|graphics/i);
        });
    });
});

// Run tests with: npx jest apps/backend/src/__tests__/chat.test.ts --runInBand
