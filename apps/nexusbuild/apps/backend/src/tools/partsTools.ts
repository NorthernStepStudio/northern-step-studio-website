/**
 * PC Parts Tools
 * Tools for searching, retrieving, and suggesting PC parts
 * Uses the comprehensive 500+ parts database with Prisma fallback
 */

import { PrismaClient } from '@prisma/client';
import { ALL_PARTS, searchParts as searchPartsDB, getPartById, PartSpec } from '../data';

const prisma = new PrismaClient();

// Use the comprehensive parts database (500+ parts)
const USE_PARTS_DATABASE = true;

// Part search result shape
export interface PartSearchResult {
    id: number;
    name: string;
    category: string;
    price: number;
    brand?: string;
    score?: number;
    specs?: Record<string, unknown>;
}

// Full part details
export interface PartDetails {
    id: number;
    name: string;
    category: string;
    price: number;
    brand?: string;
    url?: string;
    imageUrl?: string;
    specifications?: Record<string, unknown>;
    releaseYear?: number;
    rating?: number;
}

// Search filters
export interface PartFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    limit?: number;
}

/**
 * Search for parts matching a query
 * @param query - Search term (name, category, etc.)
 * @param filters - Optional price/category filters
 */
export async function searchParts(query: string, filters?: PartFilters): Promise<PartSearchResult[]> {
    // Use comprehensive 500+ parts database
    if (USE_PARTS_DATABASE) {
        const results = searchPartsDB(query, {
            category: filters?.category,
            minPrice: filters?.minPrice,
            maxPrice: filters?.maxPrice,
            brand: filters?.brand,
            limit: filters?.limit || 10,
        });

        return results.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            brand: p.brand,
            score: p.popularity,
            specs: p.specs,
        }));
    }

    // Prisma database fallback
    try {
        const parts = await prisma.part.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: query, mode: 'insensitive' } },
                            { category: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    filters?.category ? { category: { equals: filters.category, mode: 'insensitive' } } : {},
                    filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
                    filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
                ],
            },
            select: {
                id: true,
                name: true,
                category: true,
                price: true,
            },
            take: filters?.limit || 10,
            orderBy: { price: 'asc' },
        });

        return parts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
        }));
    } catch (error) {
        console.error('[Tools] searchParts error:', error);
        return [];
    }
}

/**
 * Get detailed information about a specific part
 * @param id - Part ID
 */
export async function getPart(id: number): Promise<PartDetails | null> {
    // Use comprehensive parts database
    if (USE_PARTS_DATABASE) {
        const part = getPartById(id);
        if (!part) return null;

        return {
            id: part.id,
            name: part.name,
            category: part.category,
            price: part.price,
            brand: part.brand,
            specifications: part.specs,
            releaseYear: part.releaseYear,
            rating: part.rating,
        };
    }

    // Prisma database fallback
    try {
        const part = await prisma.part.findUnique({
            where: { id },
        });

        if (!part) return null;

        return {
            id: part.id,
            name: part.name,
            category: part.category,
            price: part.price,
            url: part.url || undefined,
            imageUrl: part.imageUrl || undefined,
            specifications: part.specifications as Record<string, unknown> || undefined,
        };
    } catch (error) {
        console.error('[Tools] getPart error:', error);
        return null;
    }
}

/**
 * Suggest alternative parts based on constraints
 * @param partId - Original part ID to find alternatives for
 * @param maxPrice - Maximum price for alternatives
 */
export async function suggestAlternatives(partId: number, maxPrice?: number): Promise<PartSearchResult[]> {
    // Use comprehensive parts database
    if (USE_PARTS_DATABASE) {
        const originalPart = getPartById(partId);
        if (!originalPart) return [];

        // Find parts in same category with similar or lower price
        let alternatives = ALL_PARTS.filter(p =>
            p.category === originalPart.category &&
            p.id !== partId &&
            (!maxPrice || p.price <= maxPrice)
        );

        // Sort by popularity
        alternatives.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

        return alternatives.slice(0, 5).map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            brand: p.brand,
            score: p.popularity,
        }));
    }

    // Prisma database fallback
    try {
        const originalPart = await prisma.part.findUnique({ where: { id: partId } });
        if (!originalPart) return [];

        const alternatives = await prisma.part.findMany({
            where: {
                category: originalPart.category,
                id: { not: partId },
                ...(maxPrice ? { price: { lte: maxPrice } } : {}),
            },
            select: {
                id: true,
                name: true,
                category: true,
                price: true,
            },
            take: 5,
            orderBy: { price: 'asc' },
        });

        return alternatives;
    } catch (error) {
        console.error('[Tools] suggestAlternatives error:', error);
        return [];
    }
}
