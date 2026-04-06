/**
 * Tools Index
 * Exports all tools and their definitions for the LLM
 */

import { ToolDefinition } from '../llm/types';
import { searchParts, getPart, suggestAlternatives, PartFilters } from './partsTools';
import { checkCompatibility, estimateWattage, BuildInput } from './buildTools';

// Re-export tool functions
export { searchParts, getPart, suggestAlternatives, checkCompatibility, estimateWattage };
export type { PartFilters, BuildInput };

// Tool definitions for the LLM
export const TOOL_DEFINITIONS: ToolDefinition[] = [
    {
        type: 'function',
        function: {
            name: 'search_parts',
            description: 'Search for PC parts by name or category. Use this to find CPUs, GPUs, RAM, motherboards, etc. Always use this before recommending specific parts.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search term (e.g., "RTX 4070", "Ryzen 7", "DDR5 RAM")',
                    },
                    category: {
                        type: 'string',
                        description: 'Filter by category',
                        enum: ['CPU', 'GPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Case', 'Cooling'],
                    },
                    max_price: {
                        type: 'number',
                        description: 'Maximum price in USD',
                    },
                    min_price: {
                        type: 'number',
                        description: 'Minimum price in USD',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_part',
            description: 'Get detailed specifications for a specific part by ID. Use after search_parts to get full details.',
            parameters: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: 'The part ID from search results',
                    },
                },
                required: ['id'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'check_compatibility',
            description: 'Check if a set of PC components are compatible with each other. Always use this before finalizing a build recommendation.',
            parameters: {
                type: 'object',
                properties: {
                    cpu: {
                        type: 'string',
                        description: 'CPU name (e.g., "AMD Ryzen 7 7800X3D")',
                    },
                    motherboard: {
                        type: 'string',
                        description: 'Motherboard name (e.g., "ASUS ROG Strix B650E-F")',
                    },
                    ram: {
                        type: 'string',
                        description: 'RAM name including DDR type (e.g., "Corsair Vengeance DDR5 32GB")',
                    },
                    gpu: {
                        type: 'string',
                        description: 'GPU name (e.g., "NVIDIA GeForce RTX 4070 Super")',
                    },
                    psu: {
                        type: 'string',
                        description: 'PSU name with wattage (e.g., "Corsair RM850x 850W")',
                    },
                },
                required: ['cpu', 'motherboard'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'estimate_wattage',
            description: 'Estimate the total power consumption and recommended PSU wattage for a build.',
            parameters: {
                type: 'object',
                properties: {
                    cpu: {
                        type: 'string',
                        description: 'CPU name',
                    },
                    gpu: {
                        type: 'string',
                        description: 'GPU name',
                    },
                },
                required: ['cpu'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'suggest_alternatives',
            description: 'Suggest alternative parts similar to a given part, optionally within a price limit.',
            parameters: {
                type: 'object',
                properties: {
                    part_id: {
                        type: 'number',
                        description: 'The ID of the part to find alternatives for',
                    },
                    max_price: {
                        type: 'number',
                        description: 'Maximum price for alternatives',
                    },
                },
                required: ['part_id'],
            },
        },
    },
];

// Tool execution dispatcher
export async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
        case 'search_parts':
            return searchParts(
                args.query as string,
                {
                    category: args.category as string | undefined,
                    maxPrice: args.max_price as number | undefined,
                    minPrice: args.min_price as number | undefined,
                }
            );

        case 'get_part':
            return getPart(args.id as number);

        case 'check_compatibility':
            return checkCompatibility({
                cpu: args.cpu as string | undefined,
                motherboard: args.motherboard as string | undefined,
                ram: args.ram as string | undefined,
                gpu: args.gpu as string | undefined,
                psu: args.psu as string | undefined,
            });

        case 'estimate_wattage':
            return estimateWattage({
                cpu: args.cpu as string | undefined,
                gpu: args.gpu as string | undefined,
            });

        case 'suggest_alternatives':
            return suggestAlternatives(
                args.part_id as number,
                args.max_price as number | undefined
            );

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
