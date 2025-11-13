# Supabase Setup Guide

**Purpose:** Database, storage, and real-time features for Forma  
**Features:** PostgreSQL, Storage, Row Level Security

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Sign In
Visit: https://supabase.com/

Click "Start your project" → Sign in with GitHub (recommended)

### 1.2 Create New Project
```
1. Click "New project"
2. Organization: Create new or select existing
3. Project name: "Forma Production"
4. Database Password: Generate a strong password (SAVE THIS!)
5. Region: Choose closest to your users
   - US East (recommended for USA)
   - Europe (recommended for EU)
   - Singapore (recommended for Asia)
6. Pricing Plan: Free (upgrade later if needed)
7. Click "Create new project"
8. Wait 2-3 minutes for provisioning
```

### 1.3 Save Your Credentials

Once created, you'll see:
```
Project URL: https://xxxxx.supabase.co
API Keys:
  - anon/public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save these!** You'll need them for configuration.

---

## Step 2: Run Database Migration

### 2.1 Open SQL Editor
```
Left sidebar → SQL Editor
```

### 2.2 Create New Query
```
Click "+ New query"
Name it: "Initial Migration"
```

### 2.3 Copy Migration SQL

Open your local file: `backend/database/migration.sql`

Or copy from the Day 3 schema documentation.

### 2.4 Execute Migration

```
1. Paste the entire migration SQL into the editor
2. Click "Run" (or press Cmd/Ctrl + Enter)
3. Wait for completion (should take 5-10 seconds)
4. Check for "Success" message
```

### 2.5 Verify Tables Created

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
```
✅ users
✅ meals
✅ food_items
✅ foods_database
✅ daily_summaries
✅ weight_entries
```

### 2.6 Verify Seed Data

```sql
SELECT COUNT(*) as food_count FROM foods_database;
```

Should return: `20` foods

---

## Step 3: Set Up Storage

### 3.1 Navigate to Storage
```
Left sidebar → Storage
```

### 3.2 Create Meal Photos Bucket
```
Click "New bucket"
Name: meal-photos
Public: ☑️ Yes (photos need to be viewable)
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, image/webp
Create bucket
```

### 3.3 Create Progress Photos Bucket
```
Click "New bucket"
Name: progress-photos
Public: ☑️ Yes
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, image/webp
Create bucket
```

### 3.4 Set Storage Policies

#### For meal-photos bucket:

Click on `meal-photos` → Policies → New policy

**Policy 1: Allow authenticated uploads**
```sql
CREATE POLICY "Users can upload own meal photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: Allow public reads**
```sql
CREATE POLICY "Anyone can view meal photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meal-photos');
```

**Policy 3: Allow users to delete own photos**
```sql
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meal-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

Repeat similar policies for `progress-photos` bucket.

---

## Step 4: Configure Row Level Security

### 4.1 Verify RLS is Enabled

The migration script should have enabled RLS automatically. Verify:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`

### 4.2 Test RLS Policies

Create a test user in Firebase, then test:

```sql
-- This should work (returns user's own data)
SELECT * FROM users WHERE id = auth.uid();

-- This should return empty (can't see other users)
SELECT * FROM users WHERE id != auth.uid();
```

---

## Step 5: Configure Backend

### 5.1 Get API Credentials

Go to: Settings → API

Copy:
```
Project URL: https://xxxxx.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 Update .env File

```bash
# backend/.env

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ...
```

**Important:** 
- `SUPABASE_ANON_KEY` - Use in mobile app (safe to expose)
- `SUPABASE_SERVICE_KEY` - Backend only (bypasses RLS, keep secret!)

### 5.3 Install Supabase Client

```bash
cd backend
npm install @supabase/supabase-js
```

### 5.4 Create Supabase Configuration

Create/update `backend/src/config/supabase.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required');
}

// Admin client (bypasses RLS) - use for server operations
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create client with user token (respects RLS)
export function createUserClient(userToken: string): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    }
  );
}

export default supabaseAdmin;
```

---

## Step 6: Configure Mobile App

### 6.1 Install Supabase Client

```bash
cd mobile
npm install @supabase/supabase-js
```

### 6.2 Create Supabase Configuration

Create `mobile/src/config/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://xxxxx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**Note:** It's safe to expose `supabaseAnonKey` in mobile app - RLS protects data.

---

## Step 7: Test Database Connection

### 7.1 Test Backend Connection

Create `backend/test-supabase.ts`:

```typescript
import supabaseAdmin from './src/config/supabase.js';

async function testConnection() {
  try {
    // Test 1: Query foods database
    const { data: foods, error: foodsError } = await supabaseAdmin
      .from('foods_database')
      .select('*')
      .limit(5);

    if (foodsError) throw foodsError;
    console.log('✅ Foods query successful:', foods.length, 'foods');

    // Test 2: Check if tables exist
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) throw tablesError;
    console.log('✅ Tables found:', tables?.length);

    // Test 3: Test function
    const { data: calorieTarget, error: funcError } = await supabaseAdmin
      .rpc('calculate_calorie_target', {
        p_gender: 'male',
        p_age: 30,
        p_height_cm: 180,
        p_weight_kg: 80,
        p_activity_level: 'moderate',
        p_goal_type: 'lose_weight'
      });

    if (funcError) throw funcError;
    console.log('✅ Function test successful. Calorie target:', calorieTarget);

    console.log('\n✅ All tests passed! Supabase is configured correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
```

Run:
```bash
npx tsx backend/test-supabase.ts
```

### 7.2 Test Storage Upload

Create `backend/test-storage.ts`:

```typescript
import supabaseAdmin from './src/config/supabase.js';
import fs from 'fs';

async function testStorage() {
  try {
    // Read a test image (create a small test.jpg file first)
    const fileBuffer = fs.readFileSync('./test.jpg');

    // Upload to meal-photos
    const { data, error } = await supabaseAdmin.storage
      .from('meal-photos')
      .upload('test/test-image.jpg', fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    console.log('✅ Upload successful:', data.path);

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('meal-photos')
      .getPublicUrl('test/test-image.jpg');

    console.log('✅ Public URL:', urlData.publicUrl);

    // Clean up
    await supabaseAdmin.storage
      .from('meal-photos')
      .remove(['test/test-image.jpg']);

    console.log('✅ Cleanup successful');
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

testStorage();
```

---

## Step 8: Database Monitoring

### 8.1 Enable Real-time (Optional)

If you want real-time updates:

```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE meals;
ALTER PUBLICATION supabase_realtime ADD TABLE food_items;
```

### 8.2 Set Up Backups

Supabase Free tier includes:
- Daily backups (last 7 days)
- Point-in-time recovery (PITR) on paid plans

To enable:
```
Settings → Database → Backups
```

### 8.3 Monitor Database Size

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

Free tier limit: 500 MB

---

## Step 9: Performance Optimization

### 9.1 Enable pg_stat_statements

```sql
-- Already enabled in Supabase, but verify:
SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements';
```

### 9.2 Add Additional Indexes (if needed)

```sql
-- If queries are slow, add more indexes:
CREATE INDEX idx_food_items_name_search ON food_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_meals_created_at ON meals(created_at DESC);
```

### 9.3 Connection Pooling

Supabase automatically provides connection pooling:
- Transaction mode (default): 60s timeout
- Session mode: Longer connections

Use transaction mode for API requests (default is fine).

---

## Step 10: Security Checklist

### 10.1 RLS Verification

Test that users can only see their own data:

```sql
-- As authenticated user, should only see own data
SELECT * FROM users WHERE id = auth.uid();  -- ✅ Works
SELECT * FROM users WHERE id != auth.uid(); -- ❌ Empty

SELECT * FROM meals WHERE user_id = auth.uid();  -- ✅ Works
SELECT * FROM meals WHERE user_id != auth.uid(); -- ❌ Empty
```

### 10.2 API Key Security

- ✅ `SUPABASE_ANON_KEY` - Safe to expose in mobile app
- ❌ `SUPABASE_SERVICE_KEY` - Never expose, backend only
- ❌ Database password - Never share

### 10.3 Storage Security

```
meal-photos bucket:
  ✅ Users can upload to their folder
  ✅ Anyone can view (public photos)
  ✅ Users can delete own photos
  ❌ Users cannot modify others' photos
```

---

## Step 11: Production Checklist

- [ ] Database migration completed successfully
- [ ] All 6 tables created
- [ ] 20+ foods seeded
- [ ] Storage buckets created (meal-photos, progress-photos)
- [ ] Storage policies configured
- [ ] RLS enabled on all tables
- [ ] Backend .env configured
- [ ] Mobile app configured
- [ ] Connection tests passed
- [ ] API keys secured (not in git)
- [ ] Backups enabled

---

## Troubleshooting

### "relation does not exist" Error
```sql
❌ ERROR: relation "users" does not exist
```
**Solution:** Run the migration SQL again

### "permission denied for table" Error
```sql
❌ ERROR: permission denied for table users
```
**Solution:** Check RLS policies are configured correctly

### "Failed to fetch" Error
```
❌ TypeError: Failed to fetch
```
**Solution:** 
- Check SUPABASE_URL is correct
- Verify network connection
- Check CORS settings (should be automatic)

### Storage Upload Fails
```
❌ Error: new row violates row-level security policy
```
**Solution:** 
- Check storage policies are set
- Verify user is authenticated
- Ensure folder structure matches policy

### "Invalid JWT" Error
```
❌ Error: Invalid JWT token
```
**Solution:**
- Check SUPABASE_SERVICE_KEY is correct
- Verify no extra spaces in .env
- Restart backend server after .env changes

---

## Cost Information

### Free Tier (Hobby Plan)
- Database: 500 MB ✅
- Storage: 1 GB ✅
- Bandwidth: 2 GB/month ✅
- API Requests: Unlimited ✅
- Authentication: 50,000 MAU ✅

### Paid Tier (Pro Plan - $25/month)
Needed when you exceed:
- Database > 8 GB
- Storage > 100 GB
- Bandwidth > 250 GB/month

**For Forma MVP:** Free tier is sufficient for first 1,000-5,000 users

---

## Next Steps

1. ✅ Supabase project created
2. ✅ Database migrated
3. ✅ Storage configured
4. ✅ Backend connected
5. ✅ Mobile app configured
6. ✅ Ready to build features

**Continue to:** Connecting Firebase Auth with Supabase Database

---

## Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Tutorial: https://supabase.com/docs/guides/database
- Storage Guide: https://supabase.com/docs/guides/storage
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

**Setup Time:** ~30 minutes  
**Difficulty:** Medium  
**Status:** Production-ready ✅

