# SignaTempu

Field-worker time tracking for construction and contractor teams.

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in Supabase plus Resend values.

3. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Setup

Run `supabase/schema.sql` in your Supabase SQL editor. It creates the tables, indexes, triggers, grants, and RLS policies used by the app.

The first owner account needs to be created manually in Supabase Auth, then paired with a `companies` row and a matching `profiles` row. After that, owners and managers can add team members from the Team screen.

For newer Supabase projects, prefer:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The app also supports the legacy names from the original scaffold:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
