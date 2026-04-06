import { Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { AuthenticatedRequest } from './auth.js';
import { supabaseAdmin } from '../utils/supabase.js';

// Simple in-memory cache: userId -> { timestamp, isPro }
const cache = new Map<string, { timestamp: number; isEntitled: boolean }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface RevenueCatResponse {
    subscriber: {
        entitlements: {
            [key: string]: {
                expires_date: string | null;
            };
        };
    };
}

export const requireEntitlement = (entitlementId: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const hasEntitlement = await checkEntitlement(req.userId || '', entitlementId);
        if (hasEntitlement) {
            next();
        } else {
            res.status(403).json({ error: 'Premium subscription required', code: 'upgrade_required' });
        }
    };
};

export const checkEntitlement = async (userId: string, entitlementId: string): Promise<boolean> => {
    if (!userId) return false;

    // 1. DEV BYPASS
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_BYPASS_PRO === 'true') {
        return true;
    }

    // 2. Cache Check
    const cached = cache.get(userId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.isEntitled;
    }

    // 3. RevenueCat API Check
    const apiKey = process.env.REVENUECAT_API_KEY;
    if (!apiKey) {
        console.error('CRITICAL: REVENUECAT_API_KEY missing');
        // Fail closed in production, but open in dev if needed? Spec says fail closed.
        return false;
    }

    try {
        const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return false;

        const data = (await response.json()) as RevenueCatResponse;
        const entitlement = data.subscriber?.entitlements?.[entitlementId];

        let isEntitled = false;
        if (entitlement) {
            // If expires_date is null, it's lifetime. If present, check future.
            if (!entitlement.expires_date || new Date(entitlement.expires_date) > new Date()) {
                isEntitled = true;
            }
        }

        cache.set(userId, { timestamp: Date.now(), isEntitled });
        return isEntitled;

    } catch (error) {
        console.error('RevenueCat check failed', error);
        return false;
    }
};

// Usage Limits Logic
export const checkExportLimit = async (userId: string): Promise<boolean> => {
    const isPro = await checkEntitlement(userId, 'pro');
    if (isPro) return true;

    const today = new Date().toISOString().split('T')[0];

    // Get current usage
    const { data: usage, error } = await supabaseAdmin
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

    // If no record, create one
    if (error || !usage) {
        await supabaseAdmin.from('user_usage').insert({
            user_id: userId,
            exports_count_today: 1,
            exports_day: today
        });
        return true; // First one is free
    }

    // Reset if new day
    if (usage.exports_day !== today) {
        await supabaseAdmin.from('user_usage').update({
            exports_count_today: 1,
            exports_day: today
        }).eq('user_id', userId);
        return true;
    }

    // Check limit
    if (usage.exports_count_today >= 1) {
        return false;
    }

    // Increment
    await supabaseAdmin.rpc('increment_exports', { row_id: userId }); // Or simple update
    // Simple update for speed without RPC:
    await supabaseAdmin.from('user_usage').update({
        exports_count_today: usage.exports_count_today + 1
    }).eq('user_id', userId);

    return true;
};

export const checkAIScanLimit = async (userId: string): Promise<boolean> => {
    const isPro = await checkEntitlement(userId, 'pro');
    if (isPro) return true;

    const { data: usage, error } = await supabaseAdmin
        .from('user_usage')
        .select('ai_scans_total')
        .eq('user_id', userId)
        .single();

    // If no record, allow (will insert on first use)
    if (!usage) {
        await supabaseAdmin.from('user_usage').insert({ user_id: userId, ai_scans_total: 1 });
        return true;
    }

    if (usage.ai_scans_total >= 3) {
        return false;
    }

    await supabaseAdmin.from('user_usage').update({
        ai_scans_total: usage.ai_scans_total + 1
    }).eq('user_id', userId);

    return true;
};
