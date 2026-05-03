import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env from backend directory, then fallback to project root.
dotenv.config();
dotenv.config({ path: '../../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const strictSupabaseKeys =
    process.env.SUPABASE_STRICT_KEYS === '1' || process.env.NODE_ENV === 'production';

function getProjectRefFromUrl(url: string | undefined): string | null {
    if (!url) return null;
    try {
        const host = new URL(url).hostname;
        return host.split('.')[0] || null;
    } catch {
        return null;
    }
}

function getProjectRefFromJwt(jwt: string | undefined): string | null {
    if (!jwt || !jwt.includes('.')) return null;
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { ref?: string };
        return payload.ref || null;
    } catch {
        return null;
    }
}

if (!supabaseUrl || !supabaseAnonKey || (!supabaseServiceKey && strictSupabaseKeys)) {
    console.error('Missing required environment variables:');
    if (!supabaseUrl) console.error(' - SUPABASE_URL');
    if (!supabaseAnonKey) console.error(' - SUPABASE_ANON_KEY');
    if (!supabaseServiceKey && strictSupabaseKeys) console.error(' - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nCopy .env.example to .env and fill in your Supabase credentials.');
    console.error('Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api\n');
    process.exit(1);
}

const urlProjectRef = getProjectRefFromUrl(supabaseUrl);
const serviceKeyProjectRef = getProjectRefFromJwt(supabaseServiceKey);
const hasMismatchedServiceKey =
    !!supabaseServiceKey &&
    !!urlProjectRef &&
    !!serviceKeyProjectRef &&
    urlProjectRef !== serviceKeyProjectRef;

if (hasMismatchedServiceKey) {
    const msg =
        `SUPABASE_SERVICE_ROLE_KEY does not match SUPABASE_URL project (url=${urlProjectRef}, key=${serviceKeyProjectRef}).`;
    if (strictSupabaseKeys) {
        console.error(msg);
        process.exit(1);
    }
    console.warn(msg);
    console.warn(
        'Falling back to SUPABASE_ANON_KEY for local runtime. Admin-only routes may fail until key is corrected.'
    );
}

const adminKey =
    !hasMismatchedServiceKey && supabaseServiceKey ? supabaseServiceKey : supabaseAnonKey!;

// Service role client for backend operations (or anon fallback in local/non-strict mode).
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl!, adminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Create a client scoped to a user's JWT for RLS.
export const createUserClient = (accessToken: string): SupabaseClient => {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
};
