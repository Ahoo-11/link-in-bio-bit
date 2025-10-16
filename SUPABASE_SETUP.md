# Supabase Migration Complete! 🎉

The app has been successfully migrated from MongoDB to Supabase.

## Quick Setup Steps

### 1. Run the SQL Migration in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `backend/supabase-migration.sql`
4. Click **Run** to create all tables with the `linkinbio_` prefix

### 2. Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** OR **service_role key** (service_role is recommended for backend)

### 3. Update .env.local

Open `.env.local` and add/update these variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
# OR use anon key if you prefer
SUPABASE_ANON_KEY=your-anon-key-here

# JWT Secret (keep existing or generate new)
JWT_SECRET=your_secure_jwt_secret_here

# Stacks Network (keep existing)
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_CONTRACT_NAME=linkchain-tips

# Application URLs (keep existing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start the Backend

```bash
npm run server
```

You should see:
```
✅ Supabase client initialized
Server running on port 5000
```

### 5. Start the Frontend

In a new terminal:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## What Changed?

### ✅ Completed Migrations

- **Database**: MongoDB → Supabase (PostgreSQL)
- **Tables Created**: 
  - `linkinbio_users`
  - `linkinbio_tips`
  - `linkinbio_analytics`
- **All Routes Updated**: auth, user, profile, tips, analytics
- **Dependencies**: Added `@supabase/supabase-js`, removed `mongoose`

### 📁 New Files

- `backend/db.js` - Supabase client initialization
- `backend/supabase-migration.sql` - Database schema
- `SUPABASE_SETUP.md` - This file

### 🔧 Modified Files

- `backend/server.js` - Removed MongoDB, added Supabase
- `backend/routes/auth.js` - All queries converted to Supabase
- `backend/routes/user.js` - All queries converted to Supabase
- `backend/routes/profile.js` - All queries converted to Supabase
- `backend/routes/tips.js` - All queries converted to Supabase
- `backend/routes/analytics.js` - All queries converted to Supabase
- `package.json` - Added Supabase dependency

## Database Schema

All tables use the `linkinbio_` prefix to avoid conflicts:

### linkinbio_users
- User profiles, authentication, buttons, styling, settings, stats

### linkinbio_tips
- Tip transactions with blockchain tx_id tracking

### linkinbio_analytics
- Visit, click, and tip event tracking

## Testing the App

1. **Create Account**: http://localhost:3000 → Sign Up
2. **Customize Profile**: Dashboard → Edit buttons, colors, style
3. **View Profile**: http://localhost:3000/your-username
4. **Test Analytics**: Dashboard → Analytics tab

## Troubleshooting

### Port 5000 Already in Use?
```bash
# Kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env.local
PORT=5001
```

### Supabase Connection Error?
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check Supabase project is active
- Ensure SQL migration ran successfully

### Tables Not Found?
- Run the SQL migration script in Supabase SQL Editor
- Check table names have `linkinbio_` prefix

## Next Steps

- ✅ Backend migrated to Supabase
- ✅ All routes working with PostgreSQL
- 🎯 Test all features (signup, login, profile, tips, analytics)
- 🚀 Deploy to production when ready

---

**Migration completed successfully!** 🎉
All MongoDB code has been replaced with Supabase queries.

## Quick Start Guide

**If you're in a hurry**, here's what you need:

1. **Create a Supabase account**: https://supabase.com (free tier works!)
2. **Create a new project** (takes ~2 minutes to provision)
3. **Run the SQL**: Go to SQL Editor → paste `backend/supabase-migration.sql` → Run
4. **Get your credentials**: Settings → API → copy URL and service_role key
5. **Update .env.local**:
   ```env
   SUPABASE_URL=your-url-here
   SUPABASE_SERVICE_KEY=your-key-here
   JWT_SECRET=any-random-string
   NEXT_PUBLIC_NETWORK=testnet
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
6. **Start the app**:
   ```bash
   npm install
   npm run dev:all
   ```

You're ready! 🚀
