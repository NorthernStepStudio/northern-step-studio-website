-- Migration: 001_initial_schema.sql
-- HomeVault AI Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'pro')),
    ai_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Homes
CREATE TABLE IF NOT EXISTS homes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_id UUID REFERENCES homes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    room_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Items
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(12, 2),
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discarded', 'sold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
    file_type TEXT NOT NULL,
    doc_type TEXT NOT NULL CHECK (
        doc_type IN (
            'receipt',
            'warranty',
            'manual',
            'photo',
            'other'
        )
    ),
    storage_path TEXT NOT NULL,
    original_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Export Jobs
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    home_id UUID REFERENCES homes(id) ON DELETE
    SET NULL,
        status TEXT DEFAULT 'pending' CHECK (
            status IN (
                'pending',
                'processing',
                'completed',
                'failed',
                'expired'
            )
        ),
        format TEXT NOT NULL DEFAULT 'full',
        storage_path TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- Homes: users can only access their own homes
CREATE POLICY "Users can manage own homes" ON homes FOR ALL USING (auth.uid() = user_id);
-- Rooms: users can access rooms in their homes
CREATE POLICY "Users can manage rooms in own homes" ON rooms FOR ALL USING (
    home_id IN (
        SELECT id
        FROM homes
        WHERE user_id = auth.uid()
    )
);
-- Items: users can access items in their rooms
CREATE POLICY "Users can manage items in own rooms" ON items FOR ALL USING (
    room_id IN (
        SELECT r.id
        FROM rooms r
            JOIN homes h ON r.home_id = h.id
        WHERE h.user_id = auth.uid()
    )
);
-- Documents: users can access documents attached to their items
CREATE POLICY "Users can manage own documents" ON documents FOR ALL USING (
    item_id IN (
        SELECT i.id
        FROM items i
            JOIN rooms r ON i.room_id = r.id
            JOIN homes h ON r.home_id = h.id
        WHERE h.user_id = auth.uid()
    )
);
-- Export Jobs: users can only access their own exports
CREATE POLICY "Users can manage own exports" ON export_jobs FOR ALL USING (auth.uid() = user_id);
-- Audit Logs: users can only view their own logs
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR
SELECT USING (auth.uid() = user_id);
-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (id, full_name)
VALUES (new.id, new.raw_user_meta_data->>'full_name');
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();