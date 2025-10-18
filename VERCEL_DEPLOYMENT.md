# Vercel Deployment Guide

## Issue Fixed

The "Application error: a client-side exception has occurred" error was caused by missing environment variables in your Vercel deployment. I've updated the app to connect directly to Supabase instead of requiring a separate backend server.

## Required Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add the following:

### 1. Supabase Configuration (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**Where to find these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

### 2. JWT Secret (REQUIRED)
```
JWT_SECRET=your-random-secure-string-here
```

You can use the one from your `.env.example` or generate a new one:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 3. Stacks Network (REQUIRED for tips)
```
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_CONTRACT_NAME=linkchain-tips
```

### 4. Application URL (REQUIRED)
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Testing Your Deployment

### 1. Create Test User in Supabase

Before testing, you need to create a user in your Supabase database. Run this SQL in your Supabase SQL Editor:

```sql
INSERT INTO linkinbio_users (
  username,
  display_name,
  bio,
  wallet_address,
  buttons,
  style,
  created_at
) VALUES (
  'testuser',
  'Test User',
  'This is a test profile',
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  '[
    {
      "id": "1",
      "type": "link",
      "title": "My Website",
      "url": "https://example.com",
      "visible": true,
      "order": 0,
      "style": {
        "bgColor": "#6366f1",
        "textColor": "#ffffff"
      }
    },
    {
      "id": "2",
      "type": "tip",
      "title": "Buy me a coffee ☕",
      "amount": 5,
      "visible": true,
      "order": 1,
      "style": {
        "bgColor": "#ec4899",
        "textColor": "#ffffff"
      }
    }
  ]'::jsonb,
  '{
    "theme": "light",
    "background": "#ffffff",
    "buttonShape": "rounded"
  }'::jsonb,
  NOW()
);
```

### 2. Test Your Profile

After creating the test user, visit:
```
https://your-app.vercel.app/testuser
```

## Redeploying

After adding the environment variables:

1. Go to your Vercel project
2. Click on **Deployments**
3. Find the latest deployment
4. Click the **•••** menu
5. Select **Redeploy**

Or simply push a new commit to trigger a redeploy:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

## Troubleshooting

### "Profile not found" error
- Verify the username exists in your Supabase `linkinbio_users` table
- Check that the username is lowercase (e.g., use `testuser` not `TestUser`)

### Still seeing "Application error"
1. Check Vercel deployment logs: Project → Deployments → Click deployment → Runtime Logs
2. Verify all environment variables are set correctly
3. Make sure `SUPABASE_SERVICE_KEY` has the correct permissions
4. Ensure your Supabase project is active (not paused)

### "Failed to load profile" error
- Check your Supabase project status
- Verify the service key has permission to read from `linkinbio_users` table
- Check Vercel function logs for detailed error messages

## Database Schema

Make sure your Supabase database has these tables (run the migration):

```sql
-- Users table
CREATE TABLE IF NOT EXISTS linkinbio_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  wallet_address VARCHAR(255),
  buttons JSONB DEFAULT '[]',
  style JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  tx_id VARCHAR(255) UNIQUE NOT NULL,
  message TEXT,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON linkinbio_users(username);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_tips_creator_id ON tips(creator_id);
```

## What Changed

The app now:
- ✅ Connects directly to Supabase (no separate backend needed)
- ✅ All API routes updated to use Supabase client
- ✅ Works seamlessly on Vercel
- ✅ No need for `NEXT_PUBLIC_API_URL` environment variable

## Next Steps

1. Set up environment variables in Vercel
2. Create test data in Supabase
3. Redeploy
4. Test your profile page
5. Create a real user account through the signup flow
