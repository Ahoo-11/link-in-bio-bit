-- Make email optional for wallet-only users
-- Run this in Supabase SQL Editor to fix the schema

-- 1. Make email nullable
ALTER TABLE linkinbio_users 
ALTER COLUMN email DROP NOT NULL;

-- 2. Update the unique constraint to handle nulls properly
-- Drop existing unique constraint on email if it exists
ALTER TABLE linkinbio_users 
DROP CONSTRAINT IF EXISTS linkinbio_users_email_key;

-- 3. Create a unique index that allows multiple NULLs but enforces uniqueness for non-NULL values
CREATE UNIQUE INDEX linkinbio_users_email_unique 
ON linkinbio_users (email) 
WHERE email IS NOT NULL;

-- 4. Clean up any fake wallet emails from the workaround
UPDATE linkinbio_users 
SET email = NULL 
WHERE email LIKE '%@wallet.linkchain.app';

-- Verify the changes
SELECT username, email, wallet_address 
FROM linkinbio_users 
ORDER BY created_at DESC 
LIMIT 5;
