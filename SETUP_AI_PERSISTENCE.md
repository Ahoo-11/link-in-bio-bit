# 🚀 Quick Setup: AI Insights Persistence

## TL;DR - 3 Steps to Enable Daily AI Insights

### ⚡ **Step 1: Run Database Migration (1 minute)**

**Option A - Supabase Dashboard (Recommended):**

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy & paste this entire SQL:

```sql
-- AI Insights table for storing daily AI-generated insights
CREATE TABLE IF NOT EXISTS linkinbio_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  score INTEGER,
  recommendations JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON linkinbio_ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_generated_at ON linkinbio_ai_insights(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_valid_until ON linkinbio_ai_insights(valid_until);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_valid ON linkinbio_ai_insights(user_id, valid_until DESC);
```

5. Click **"Run"** (or press F5)
6. You should see: "Success. No rows returned"

**Option B - From File:**
```bash
# The SQL file is already created at:
backend/scripts/add-ai-insights-table.sql

# Copy its contents to Supabase SQL Editor and run
```

---

### ⚡ **Step 2: Verify Table Created**

In Supabase:
1. Go to **Table Editor** (left sidebar)
2. Look for table: `linkinbio_ai_insights`
3. You should see columns:
   - id
   - user_id
   - insights
   - score
   - recommendations
   - generated_at
   - valid_until
   - created_at

---

### ⚡ **Step 3: Restart Backend & Test**

```bash
# Stop your servers (Ctrl+C)

# Restart
npm run dev:all
```

**Then test:**
1. Go to Dashboard: http://localhost:3000/dashboard
2. AI insights should load
3. Check Supabase table - you'll see your insights saved!
4. Refresh dashboard - insights load instantly (cached)

---

## ✅ Verification Checklist

- [ ] Table `linkinbio_ai_insights` exists in Supabase
- [ ] Dashboard shows AI Insights card
- [ ] First load takes 2-3 seconds (generating)
- [ ] Subsequent loads are instant (cached)
- [ ] Badge shows "Today's Insights" on cached loads
- [ ] Timestamp shows when generated
- [ ] Clicking refresh button works
- [ ] Insights persist after browser refresh
- [ ] Check Supabase table - insights are stored

---

## 🎯 How to Confirm It's Working

### **Test 1: First Generation**
```bash
1. Clear Supabase table (if testing):
   DELETE FROM linkinbio_ai_insights WHERE user_id = 'your-user-id';

2. Go to Dashboard
3. Watch AI Insights load (2-3 seconds)
4. Check Supabase table:
   SELECT * FROM linkinbio_ai_insights ORDER BY generated_at DESC LIMIT 1;
5. Should see your insights saved!
```

### **Test 2: Cached Load**
```bash
1. Refresh browser (F5)
2. AI Insights load INSTANTLY
3. Badge shows "Today's Insights"
4. Timestamp shows earlier time
5. No new row in Supabase table
```

### **Test 3: Daily Refresh**
```bash
1. Manually expire insights:
   UPDATE linkinbio_ai_insights 
   SET valid_until = NOW() - INTERVAL '1 hour'
   WHERE user_id = 'your-user-id';

2. Refresh Dashboard
3. New insights generate
4. New row added to Supabase table
5. New timestamp shown
```

---

## 🔍 Troubleshooting

### **"Table already exists" error**
✅ Good! Table is already created. Just proceed to testing.

### **"Foreign key constraint" error**
❌ Make sure `linkinbio_users` table exists first
✅ Run your main migration first

### **"No AI insights showing"**
1. Check browser console for errors
2. Check backend console for errors
3. Verify OpenRouter API key in `.env.local`
4. Check Supabase credentials

### **"Insights not saving to database"**
1. Check backend logs for save errors
2. Verify Supabase service key is correct
3. Check table permissions in Supabase
4. Try inserting manually:
```sql
INSERT INTO linkinbio_ai_insights (user_id, insights, score, valid_until)
VALUES (
  'your-user-id',
  '["test insight"]'::jsonb,
  75,
  NOW() + INTERVAL '24 hours'
);
```

---

## 📊 Check Your Data

### **See all your AI insights:**
```sql
SELECT 
  u.username,
  ai.score,
  ai.insights,
  ai.generated_at,
  ai.valid_until,
  CASE WHEN ai.valid_until > NOW() THEN '✅ Valid' ELSE '❌ Expired' END as status
FROM linkinbio_ai_insights ai
JOIN linkinbio_users u ON ai.user_id = u.id
ORDER BY ai.generated_at DESC;
```

### **Count insights by user:**
```sql
SELECT 
  u.username,
  COUNT(*) as total_insights,
  MAX(ai.generated_at) as latest
FROM linkinbio_ai_insights ai
JOIN linkinbio_users u ON ai.user_id = u.id
GROUP BY u.username
ORDER BY latest DESC;
```

---

## 🎉 You're Done!

Your AI insights are now:
- ✅ Saved to Supabase (not localStorage)
- ✅ Updated once per day (not every visit)
- ✅ Cached for 24 hours (faster loads)
- ✅ Persistent across sessions
- ✅ Tracked historically

**Next time you visit Dashboard:**
- Insights load instantly from Supabase
- No OpenRouter API call needed
- Same insights all day long
- Fresh insights tomorrow

---

## 📖 Full Documentation

For complete details, see: `DAILY_AI_INSIGHTS.md`

**Questions?** Check the troubleshooting section or review backend logs!
