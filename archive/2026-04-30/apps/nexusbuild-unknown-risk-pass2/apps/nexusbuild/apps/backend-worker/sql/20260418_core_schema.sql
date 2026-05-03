-- NexusBuild Core Schema (v2.0.0)
-- Based on Prisma schema for production Supabase Synchronization

-- 1. Tables

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_image TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_moderator BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    avatar_frame VARCHAR(50) DEFAULT 'basic',
    showcase_build_id INTEGER,
    is_public_profile BOOLEAN DEFAULT true,
    tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builds Table
CREATE TABLE IF NOT EXISTS public.builds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    total_price DOUBLE PRECISION DEFAULT 0,
    image_url TEXT,
    performance_score DOUBLE PRECISION,
    is_public BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parts Table
CREATE TABLE IF NOT EXISTS public.parts (
    id SERIAL PRIMARY KEY,
    build_id INTEGER NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DOUBLE PRECISION DEFAULT 0,
    url TEXT,
    image_url TEXT,
    specifications JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bug Reports Table
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id),
    email VARCHAR(255),
    description TEXT NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(500),
    images JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Entitlements Table (Billing)
CREATE TABLE IF NOT EXISTS public.user_entitlements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily AI Usage Table
CREATE TABLE IF NOT EXISTS public.daily_ai_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 2. Indices
CREATE INDEX IF NOT EXISTS builds_user_id_idx ON public.builds(user_id);
CREATE INDEX IF NOT EXISTS builds_visibility_idx ON public.builds(is_public, is_featured);
CREATE INDEX IF NOT EXISTS parts_build_id_idx ON public.parts(build_id);
CREATE INDEX IF NOT EXISTS parts_category_idx ON public.parts(category);
CREATE INDEX IF NOT EXISTS bug_reports_status_idx ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- 3. Security (Enable RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_ai_usage ENABLE ROW LEVEL SECURITY;

-- 4. Basic RLS Policies (Minimum set for Worker functionality)
-- Note: These should be further refined in 20260408_security_rls_hardening.sql

-- Public access to builds marked public
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public builds are viewable by everyone') THEN
        CREATE POLICY "Public builds are viewable by everyone" ON public.builds FOR SELECT USING (is_public = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own private builds') THEN
        CREATE POLICY "Users can view their own private builds" ON public.builds FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
END $$;
