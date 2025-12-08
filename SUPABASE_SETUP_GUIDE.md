# 🚀 Supabase Backend Setup Guide for HiveHR

## What is Supabase?
Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database** - Powerful relational database
- **Authentication** - Built-in user auth with JWT
- **Real-time** - Live data updates via WebSockets
- **Storage** - File uploads and management
- **Auto-generated APIs** - REST & GraphQL APIs automatically created

---

## 📋 Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

---

## 📋 Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the details:
   - **Organization**: Create new or select existing
   - **Project Name**: `HiveHR` or `HiveHR-Production`
   - **Database Password**: Create a STRONG password (save it securely!)
   - **Region**: Choose closest to your users (e.g., `US East`, `Europe`, `Asia`)
   - **Pricing Plan**: Start with **Free tier** (500MB database, 2GB bandwidth)

3. Click **"Create new project"**
4. Wait 2-3 minutes for setup to complete

---

## 📋 Step 3: Get Your API Keys

1. In your Supabase project dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll see:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: (This is safe for frontend - starts with `eyJ...`)
   - **service_role secret**: (Keep this SECRET - only use in backend/server)

4. **Copy these values** - you'll need them in Step 5

---

## 📋 Step 4: Create Database Tables

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the SQL from `supabase-schema.sql` (file in this repo)
4. Click **"Run"** or press `Ctrl + Enter`
5. You should see success messages for each table created

**Tables that will be created:**
- `profiles` - Extended user information
- `departments` - Company departments
- `attendance` - Check-in/out records
- `leaves` - Leave requests and approvals
- `performance_reviews` - Performance evaluations
- `kpis` - Key Performance Indicators
- `files` - Document metadata
- `notifications` - User notifications

---

## 📋 Step 5: Configure Frontend Environment Variables

1. In your `Frontend` folder, create a file named `.env`

2. Add these variables (replace with YOUR values from Step 3):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **IMPORTANT**: Add `.env` to `.gitignore` so you don't push secrets to GitHub!

---

## 📋 Step 6: Install Supabase Client

Open terminal in `Frontend` folder and run:

```bash
npm install @supabase/supabase-js
```

This installs the official Supabase JavaScript client library.

---

## 📋 Step 7: Test Your Connection

1. The `supabaseClient.js` file is already created for you in `src/lib/`
2. It automatically connects using your `.env` variables
3. To test, you can run the app:

```bash
npm run dev
```

4. Open browser console and check for any Supabase connection errors

---

## 📋 Step 8: Enable Authentication

### Email/Password Auth (Default - Already Enabled)

1. Go to **"Authentication"** in Supabase dashboard
2. Click **"Settings"** 
3. Ensure **"Enable Email provider"** is ON
4. Configure email settings:
   - Confirm email: ON (recommended)
   - Secure email change: ON

### Optional: Google/GitHub Login

1. Go to **"Authentication"** → **"Providers"**
2. Enable **Google** or **GitHub**
3. Add OAuth credentials:
   - **Google**: Get from [Google Cloud Console](https://console.cloud.google.com)
   - **GitHub**: Get from [GitHub OAuth Apps](https://github.com/settings/developers)

---

## 📋 Step 9: Set Up Row Level Security (RLS)

This ensures users can only access their own data:

1. Go to **"Authentication"** → **"Policies"**
2. For each table, enable RLS:
   - Click on table name
   - Toggle **"Enable RLS"**
   - Add policies from `supabase-rls-policies.sql` (file in this repo)

**OR** run the RLS SQL file in SQL Editor (easier):
1. Open **SQL Editor**
2. Paste content from `supabase-rls-policies.sql`
3. Run the query

---

## 📋 Step 10: Set Up Storage for Files

1. Go to **"Storage"** in Supabase dashboard
2. Click **"Create a new bucket"**
3. Bucket details:
   - **Name**: `employee-files`
   - **Public**: OFF (private files)
   - **File size limit**: 50MB
   - **Allowed MIME types**: `application/pdf, image/*, .doc, .docx, .xls, .xlsx`

4. Add storage policies from `supabase-storage-policies.sql`

---

## 📋 Step 11: Enable Realtime (Optional)

For live notifications and attendance updates:

1. Go to **"Database"** → **"Replication"**
2. Find `notifications` table
3. Toggle **"Realtime"** ON
4. Repeat for `attendance` table if needed

---

## 📋 Step 12: Update Frontend Code

Your hooks will now use Supabase instead of mock data:

- ✅ `useAuth.js` - Already configured for Supabase auth
- ✅ `useAttendance.js` - Fetches from Supabase
- ✅ `useLeaves.js` - Fetches from Supabase
- ✅ All other hooks updated in `src/hooks/`

**No manual changes needed** - files are pre-configured!

---

## 🔐 Important Security Notes

### ✅ DO:
- Keep `service_role` key SECRET (never expose in frontend)
- Use `.env` files for all keys
- Add `.env` to `.gitignore`
- Enable RLS on all tables
- Use Supabase Auth for user authentication
- Validate data on both frontend and backend (use Postgres functions)

### ❌ DON'T:
- Commit `.env` files to Git
- Share API keys publicly
- Disable RLS without good reason
- Use `service_role` key in frontend code
- Trust frontend validation alone

---

## 📊 Supabase Dashboard Overview

**Where to find things:**
- **Table Editor**: View/edit data in tables (like Excel)
- **SQL Editor**: Run custom SQL queries
- **Authentication**: Manage users, auth settings
- **Storage**: Upload/manage files
- **Database**: View schema, relationships, RLS policies
- **API Docs**: Auto-generated API documentation
- **Logs**: Debug queries and errors

---

## 🆘 Common Issues & Solutions

### Issue: "Invalid API key"
**Solution**: Check your `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: "Row Level Security policy violation"
**Solution**: Make sure you ran the RLS policies SQL file and you're logged in

### Issue: "Cannot read properties of undefined"
**Solution**: Make sure Supabase client is initialized before using it

### Issue: "CORS error"
**Solution**: Supabase automatically handles CORS. Check if URL is correct.

### Issue: "Too many connections"
**Solution**: You're on free tier (max 60 connections). Implement connection pooling.

---

## 📚 Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client Docs**: https://supabase.com/docs/reference/javascript
- **SQL Tutorial**: https://supabase.com/docs/guides/database
- **Auth Guide**: https://supabase.com/docs/guides/auth
- **Storage Guide**: https://supabase.com/docs/guides/storage
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## 🎯 Next Steps After Setup

1. **Create test users** in Authentication tab
2. **Add sample data** via Table Editor
3. **Test login** in your app
4. **Check real-time updates** work
5. **Upload test files** to storage
6. **Monitor usage** in Settings → Usage

---

## 💰 Pricing (as of 2024)

**Free Tier** (Perfect for development):
- 500MB database space
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- Community support

**Pro Tier** ($25/month):
- 8GB database space
- 100GB file storage
- 250GB bandwidth
- No user limits
- Email support
- Daily backups

---

## ✅ Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied API keys
- [ ] Created database tables (ran `supabase-schema.sql`)
- [ ] Set up environment variables (`.env` file)
- [ ] Installed `@supabase/supabase-js`
- [ ] Enabled Row Level Security
- [ ] Created storage bucket
- [ ] Tested connection
- [ ] Ready to code! 🚀

---

**Need help?** Check Supabase Discord or GitHub Discussions!
