-- Migration 004: User Usage Tracking
-- Create table for tracking feature usage limits (exports, AI scans)
CREATE TABLE IF NOT EXISTS public.user_usage (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    exports_count_today integer DEFAULT 0,
    exports_day date DEFAULT CURRENT_DATE,
    ai_scans_total integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
-- Policies: Users can read their own usage, but only system (service role) can update it?
-- Actually, backend runs as service role usually, but if client needs to read it:
CREATE POLICY "Users can view own usage" ON public.user_usage FOR
SELECT USING (auth.uid() = user_id);
-- Only service role can insert/update logic usually, but let's allow read.
-- Backend middleware will handle the increments.
-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_user_usage_updated BEFORE
UPDATE ON public.user_usage FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();