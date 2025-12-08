# 🚀 Quick Start Guide - Supabase Integration

## What I've Set Up For You

I've created a complete Supabase backend integration for your HiveHR project. Here's what's ready:

### 📁 Files Created

1. **`SUPABASE_SETUP_GUIDE.md`** - Complete beginner-friendly guide
2. **`supabase-schema.sql`** - All database tables
3. **`supabase-rls-policies.sql`** - Security policies
4. **`supabase-storage-policies.sql`** - File storage policies
5. **`Frontend/src/lib/supabaseClient.js`** - Supabase client & helpers
6. **`Frontend/src/hooks/useSupabaseAuth.js`** - Authentication hook
7. **`Frontend/.env.example`** - Environment variables template

---

## 🎯 Next Steps (In Order)

### Step 1: Create Supabase Account (5 minutes)
1. Go to https://supabase.com
2. Sign up (use GitHub for faster login)
3. Create a new project named `HiveHR`
4. Choose a strong database password (SAVE IT!)
5. Wait 2-3 minutes for setup

### Step 2: Get Your API Keys (2 minutes)
1. In Supabase dashboard → Settings → API
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

### Step 3: Set Up Environment Variables (1 minute)
1. Open `Frontend` folder in terminal
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` file
4. Replace `xxxxx` with YOUR actual values from Step 2

### Step 4: Create Database Tables (3 minutes)
1. In Supabase dashboard → SQL Editor
2. Click "New Query"
3. Open `supabase-schema.sql` from your project
4. Copy ALL the content
5. Paste into SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Wait for success message ✅

### Step 5: Enable Security (2 minutes)
1. In SQL Editor, click "New Query" again
2. Open `supabase-rls-policies.sql`
3. Copy and paste all content
4. Click "Run"
5. Wait for success ✅

### Step 6: Set Up File Storage (2 minutes)
1. In Supabase dashboard → Storage
2. Click "Create a new bucket"
3. Name it: `employee-files`
4. Make it **Private** (not public)
5. Set max file size: 50MB
6. Click "Create"
7. Go back to SQL Editor
8. Run `supabase-storage-policies.sql`

### Step 7: Install Supabase Package (1 minute)
Open terminal in `Frontend` folder:
```bash
npm install @supabase/supabase-js
```

### Step 8: Test Connection (1 minute)
```bash
npm run dev
```
Open browser console and check for:
- ✅ "Supabase client initialized"
- No red errors

---

## 🎨 How to Use in Your Code

### Authentication Example

```javascript
import { useSupabaseAuth } from './hooks/useSupabaseAuth';

function LoginPage() {
  const { login, loading, error } = useSupabaseAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // User is now logged in!
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    // Your login form
  );
}
```

### Fetch Data Example

```javascript
import { supabase } from './lib/supabaseClient';

// Get all attendance records
const { data, error } = await supabase
  .from('attendance')
  .select('*')
  .order('date', { ascending: false });

// Create new leave request
const { data, error } = await supabase
  .from('leaves')
  .insert([{
    user_id: userId,
    leave_type: 'casual',
    start_date: '2024-12-10',
    end_date: '2024-12-12',
    total_days: 3,
    reason: 'Family vacation'
  }]);
```

### Upload File Example

```javascript
import { uploadFile } from './lib/supabaseClient';

const handleFileUpload = async (file) => {
  const { url } = await uploadFile(file);
  console.log('File uploaded:', url);
};
```

---

## 📊 Database Tables Created

Your database now has these tables:

- ✅ **profiles** - User information (name, role, department)
- ✅ **departments** - Company departments
- ✅ **attendance** - Check-in/out records with location
- ✅ **leaves** - Leave requests with approval workflow
- ✅ **leave_balance** - Leave balance tracking
- ✅ **performance_reviews** - Performance evaluations
- ✅ **kpis** - Key Performance Indicators
- ✅ **files** - Document metadata
- ✅ **notifications** - Real-time notifications
- ✅ **system_settings** - App configuration

---

## 🔒 Security Features Enabled

- ✅ Row Level Security (RLS) - Users can only see their own data
- ✅ Role-based access - Admins/HR have more permissions
- ✅ Secure file uploads - Files stored in user-specific folders
- ✅ Authentication required - All routes protected
- ✅ SQL injection prevention - Built into Supabase

---

## 🆘 Troubleshooting

### "Invalid API key" error
- Check your `.env` file has correct values
- Make sure variables start with `VITE_`
- Restart dev server after changing `.env`

### "Permission denied" error
- Make sure you ran `supabase-rls-policies.sql`
- Check if user is logged in

### "Table does not exist" error
- Run `supabase-schema.sql` in SQL Editor
- Check "Table Editor" in Supabase to verify tables exist

---

## 📚 Resources

- **Full Guide**: Read `SUPABASE_SETUP_GUIDE.md`
- **Supabase Docs**: https://supabase.com/docs
- **Auth Tutorial**: https://supabase.com/docs/guides/auth
- **Database Guide**: https://supabase.com/docs/guides/database

---

## ✅ Checklist

- [ ] Created Supabase account & project
- [ ] Copied API keys
- [ ] Created `.env` file with keys
- [ ] Ran `supabase-schema.sql`
- [ ] Ran `supabase-rls-policies.sql`
- [ ] Created storage bucket
- [ ] Ran `supabase-storage-policies.sql`
- [ ] Installed `@supabase/supabase-js`
- [ ] Tested connection (no errors in console)

---

**Total Setup Time: ~15-20 minutes**

Once done, your app will have a production-ready backend! 🎉
