# Supabase Free Setup Checklist

## 1. Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `provly-mvp`
3. Region: closest to you
4. Save the password!

## 2. Run Migrations
Go to **SQL Editor** → New Query → Paste contents of:
```
supabase/migrations/001_initial_schema.sql
```
Click **Run**.

## 3. Create Storage Buckets
Go to **Storage** → Create bucket:

| Bucket | Public |
|--------|--------|
| `documents` | ❌ No |
| `exports` | ❌ No |

### Storage Policies (for each bucket)
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 4. Get API Keys
Go to **Settings → API**:
- `SUPABASE_URL` → Project URL
- `SUPABASE_ANON_KEY` → anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role key (keep secret!)

## 5. Create .env
```bash
# apps/backend/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
PORT=4000
```

## 6. Run Backend
```powershell
cd apps/backend
npm install
npm run dev
```

## 7. Test Endpoints
```bash
# Health check
curl http://localhost:4000/health

# Create user via Supabase Auth, then test with token
```

---

## Folder Structure
```
apps/
  backend/src/
    routes/       # homes, rooms, items, documents, exports, account
    middleware/   # auth.ts
    services/     # exportService.ts
    utils/        # supabase.ts
  mobile/         # (you're handling)
packages/shared/  # Zod schemas + types
supabase/
  migrations/     # 001_initial_schema.sql
```

## API Endpoints (10 core)
1. `GET /v1/homes`
2. `POST /v1/homes`
3. `GET /v1/rooms?homeId=`
4. `POST /v1/rooms`
5. `GET /v1/items?roomId=`
6. `POST /v1/items`
7. `POST /v1/documents`
8. `POST /v1/exports/trigger`
9. `GET /v1/exports/:id/download`
10. `DELETE /v1/account`
