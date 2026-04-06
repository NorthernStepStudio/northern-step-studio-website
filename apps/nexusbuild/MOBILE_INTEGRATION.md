# Mobile App Integration Guide

## Overview

This guide explains how to integrate the mobile app with the new Node.js/TypeScript backend.

## Current Configuration

The mobile app is already configured to use the production backend:

**File:** `apps/mobile/src/core/config.js`
```javascript
export const apiBaseUrl = 'https://api.nexusbuild.app/api';
```

## Testing Checklist

### ✅ Phase 1: Bug Report Submission

**Steps:**
1. Open the NexusBuild app on your phone (iOS or Android)
2. Navigate to: **Settings → Report Bug**
3. Fill out the form:
   - Email: Your email address
   - Description: "Testing bug report from mobile app"
   - Category: Bug
   - Attach a screenshot/image (optional)
4. Tap "Submit"

**Expected Result:**
- Success message appears
- Report is saved to database
- Can be viewed in the production database dashboard

**Verification:**
```bash
# Check production logs for POST /api/reports
# Or query database directly
```

---

### ✅ Phase 2: User Authentication

#### Test Registration

**Steps:**
1. Open app → Tap **Sign Up**
2. Fill form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
3. Tap **Register**

**Expected Result:**
- Account created successfully
- JWT tokens received and stored
- Automatically logged in

#### Test Login

**Steps:**
1. Log out (if logged in)
2. Tap **Log In**
3. Enter credentials
4. Tap **Log In**

**Expected Result:**
- Successfully logged in
- JWT token stored in async storage
- Redirected to home screen

---

### ✅ Phase 3: Build Management

#### Create a Build

**Steps:**
1. Navigate to **Builder** screen
2. Tap **New Build** or **+**
3. Fill form:
   - Name: "My Gaming PC"
   - Description: "High-end gaming build"
4. Save build

**Expected Result:**
- Build created on server
- Appears in your builds list

#### Add Parts to Build

**Steps:**
1. Open the build you created
2. Tap **Add Part**
3. Select category: GPU
4. Fill details:
   - Name: "NVIDIA RTX 4080"
   - Price: 1199.99
5. Save part

**Expected Result:**
- Part added to build
- Total price updated automatically (shown in build summary)

#### Edit/Delete

**Steps:**
1. Edit the part (change price to 1099.99)
2. Verify total price recalculates
3. Delete the part
4. Verify total price updates again

---

## API Endpoints Used by Mobile App

| Feature | Endpoint | Method | Auth Required |
|---------|----------|--------|---------------|
| Register | `/api/auth/register` | POST | No |
| Login | `/api/auth/login` | POST | No |
| Get Profile | `/api/auth/me` | GET | Yes |
| Update Profile | `/api/auth/me` | PUT | Yes |
| Submit Bug Report | `/api/reports` | POST | No* |
| List Builds | `/api/builds` | GET | Yes |
| Create Build | `/api/builds` | POST | Yes |
| Get Build | `/api/builds/:id` | GET | Yes |
| Update Build | `/api/builds/:id` | PUT | Yes |
| Delete Build | `/api/builds/:id` | DELETE | Yes |
| List Parts | `/api/parts?buildId=X` | GET | Yes |
| Add Part | `/api/parts` | POST | Yes |
| Update Part | `/api/parts/:id` | PUT | Yes |
| Delete Part | `/api/parts/:id` | DELETE | Yes |
| Get AI Usage | `/api/ai/usage` | GET | Yes |
| Record AI Use | `/api/ai/usage` | POST | Yes |

\* Bug reports can be submitted anonymously, but authenticated users get their userId attached

---

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Possible Causes:**
1. Backend is down (check deployment dashboard)
2. CORS issue (check if mobile origin is in ALLOWED_ORIGINS)
3. Network connectivity on phone

**Solution:**
```javascript
// Check CORS configuration in backend:
// apps/backend/src/index.ts
const ALLOWED_ORIGINS = [
  // ... should include mobile dev URLs
  'http://localhost:8081',
  'http://localhost:19006',
  // etc.
];
```

### Issue: "401 Unauthorized"

**Possible Causes:**
1. JWT token expired (24h expiration)
2. Token not being sent in Authorization header
3. Invalid JWT_SECRET mismatch

**Solution:**
- Check token storage in app
- Verify header format: `Authorization: Bearer <token>`
- Use refresh token to get new access token

### Issue: "Database connection failed"

**Solution:**
- Check database service is running
- Verify DATABASE_URL environment variable
- Restart backend service

---

## Database Verification

After testing, verify data persisted correctly:

### Via Database Dashboard

1. Go to your hosting provider dashboard
2. Select your project → Postgres service
3. Click **Data** tab
4. Query tables:
   ```sql
   SELECT * FROM users;
   SELECT * FROM builds;
   SELECT * FROM parts;
   SELECT * FROM bug_reports;
   ```

### Via Prisma Studio

```bash
cd apps/backend
npx prisma studio
```

Open browser to `http://localhost:5555` and browse tables visually.

---

## Migration Checklist

- [x] Backend deployed to production
- [x] Database connected
- [x] Mobile app config points to production URL
- [ ] Test bug report submission from phone
- [ ] Test user registration from phone
- [ ] Test user login from phone
- [ ] Test build creation from phone
- [ ] Test part management from phone
- [ ] Verify all data persists in database

---

## Next Steps

Once all tests pass:

1. **Monitor Production**
   - Watch production logs for errors
   - Check database growth
   - Monitor API response times

2. **Cleanup**
   - Decommission old Python backend (if desired)
   - Archive old code
   - Update main project README

3. **Enhancements**
   - Add more endpoints as needed
   - Implement real-time features (WebSockets)
   - Add analytics and monitoring

---

## Support

**Issues?** Submit a bug report through the app or check:
- Deployment logs: https://dashboard.nexusbuild.app
- Backend README: `apps/backend/README.md`
- API documentation (inline comments in route files)
