-- LinkChain Supabase Migration
-- Tables prefixed with linkinbio_

-- Users table
CREATE TABLE IF NOT EXISTS linkinbio_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  wallet_address TEXT DEFAULT '',
  buttons JSONB DEFAULT '[]'::jsonb,
  style JSONB DEFAULT '{
    "template": "centered",
    "colorScheme": "purple",
    "theme": "light",
    "font": "inter",
    "background": "#ffffff"
  }'::jsonb,
  settings JSONB DEFAULT '{
    "emailNotifications": true,
    "showEarnings": false,
    "requireMessage": false
  }'::jsonb,
  stats JSONB DEFAULT '{
    "totalVisits": 0,
    "totalClicks": 0,
    "totalTips": 0
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tips table
CREATE TABLE IF NOT EXISTS linkinbio_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_username TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  message TEXT,
  anonymous BOOLEAN DEFAULT false,
  tx_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS linkinbio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'click', 'tip')),
  button_id TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON linkinbio_users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON linkinbio_users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON linkinbio_users(wallet_address);

CREATE INDEX IF NOT EXISTS idx_tips_creator ON linkinbio_tips(creator_username);
CREATE INDEX IF NOT EXISTS idx_tips_created ON linkinbio_tips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tips_creator_created ON linkinbio_tips(creator_username, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_username ON linkinbio_analytics(username);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON linkinbio_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_username_type ON linkinbio_analytics(username, event_type, timestamp DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_linkinbio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_linkinbio_users_updated_at
  BEFORE UPDATE ON linkinbio_users
  FOR EACH ROW
  EXECUTE FUNCTION update_linkinbio_updated_at();
