-- 003_add_deleted_at.sql
-- Soft-delete support for profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx ON public.profiles (deleted_at);