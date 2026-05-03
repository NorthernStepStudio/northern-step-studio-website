import { postAgent, AgentResponse } from './aiAgentClient';
import { useAuthStore } from '../stores/authStore';

export interface AiTaskSuggestion {
    title: string;
    description: string;
    frequencyDays: number;
    reasoning: string;
}

export const careAiService = {
    async suggestMaintenanceTasks(itemName: string, category?: string, description?: string): Promise<AiTaskSuggestion[]> {
        const session = useAuthStore.getState().session;
        if (!session?.access_token) return [];

        const prompt = `Based on the following item in a home inventory, suggest 2-3 specific maintenance tasks.
Item Name: ${itemName}
Category: ${category || 'Unknown'}
Description: ${description || 'No description provided'}

Return the suggestions as a JSON array of objects with the following keys:
- title: Short task title
- description: Brief instructions
- frequencyDays: Recommended interval in days (number)
- reasoning: Why this is important for this specific item

Example:
[
  {
    "title": "Clean Condenser Coils",
    "description": "Vacuum the coils behind the fridge to maintain efficiency.",
    "frequencyDays": 180,
    "reasoning": "Dust buildup causes the compressor to work harder."
  }
]
Return ONLY JSON.`;

        try {
            const data = await postAgent({
                prompt,
                access_token: session.access_token,
            });

            // Extract JSON from response if LLM included extra text
            const jsonMatch = data.response.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Care AI Error:', error);
            return [];
        }
    }
};
