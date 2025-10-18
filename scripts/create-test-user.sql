-- Create Test User in Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- NOTE: Run fix-email-optional.sql first to make email optional!

-- Insert test user (wallet-only, no email)
INSERT INTO linkinbio_users (
  username,
  display_name,
  bio,
  avatar,
  wallet_address,
  buttons,
  style,
  stats,
  created_at
) VALUES (
  'testuser',
  'Test User',
  'Welcome to my LinkChain profile! 🎉',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  '[
    {
      "id": "1",
      "type": "link",
      "title": "Visit My Website",
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
      "type": "link",
      "title": "Follow on Twitter",
      "url": "https://twitter.com",
      "visible": true,
      "order": 1,
      "style": {
        "bgColor": "#1da1f2",
        "textColor": "#ffffff"
      }
    },
    {
      "id": "3",
      "type": "tip",
      "title": "Buy me a coffee ☕",
      "amount": 5,
      "visible": true,
      "order": 2,
      "style": {
        "bgColor": "#ec4899",
        "textColor": "#ffffff"
      }
    }
  ]'::jsonb,
  '{
    "theme": "light",
    "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "buttonShape": "rounded",
    "fontFamily": "Inter"
  }'::jsonb,
  '{
    "totalVisits": 0,
    "totalClicks": 0,
    "totalTips": 0,
    "totalEarnings": 0
  }'::jsonb,
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  buttons = EXCLUDED.buttons,
  style = EXCLUDED.style;

-- Verify the user was created
SELECT username, display_name, bio FROM linkinbio_users WHERE username = 'testuser';
