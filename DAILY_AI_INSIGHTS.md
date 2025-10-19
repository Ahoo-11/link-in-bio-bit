# 🤖 Daily AI Insights System

## Overview

Your AI insights are now **persistent** and **updated daily**, stored in Supabase instead of browser memory. This ensures:
- ✅ Insights persist across sessions
- ✅ No localStorage usage
- ✅ Daily automatic updates
- ✅ Efficient API usage (1 generation per day)

---

## How It Works

### 🔄 **Daily Update Cycle**

```
Day 1, 10:00 AM - User visits Dashboard
    ↓
Check Supabase: No valid insights found
    ↓
Generate new AI insights via OpenRouter
    ↓
Save to Supabase (valid for 24 hours)
    ↓
Display insights to user

Day 1, 3:00 PM - User visits Dashboard again
    ↓
Check Supabase: Valid insights found (from 10 AM)
    ↓
Return cached insights from database
    ↓
Display with "Today's Insights" badge
    ↓
NO API CALL MADE ✅

Day 2, 11:00 AM - User visits Dashboard
    ↓
Check Supabase: Insights expired (>24 hours old)
    ↓
Generate NEW AI insights
    ↓
Save to Supabase (valid until Day 3, 11 AM)
    ↓
Display fresh insights
```

---

## Database Structure

### **Table: `linkinbio_ai_insights`**

```sql
{
  id: UUID (primary key)
  user_id: UUID (references linkinbio_users)
  insights: JSONB (array of insight strings)
  score: INTEGER (0-100 optimization score)
  recommendations: JSONB (array of action items)
  generated_at: TIMESTAMPTZ (when created)
  valid_until: TIMESTAMPTZ (expires after 24 hours)
  created_at: TIMESTAMPTZ (timestamp)
}
```

### **Example Record:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid-here",
  "insights": [
    "Your conversion rate of 23% is above average!",
    "Tip buttons get 3x more clicks on weekends",
    "Instagram link is your top performer"
  ],
  "score": 82,
  "recommendations": [
    {
      "action": "Move tip button to top position",
      "impact": "high",
      "reason": "Similar profiles saw +28% conversions"
    }
  ],
  "generated_at": "2025-10-19T06:00:00Z",
  "valid_until": "2025-10-20T06:00:00Z",
  "created_at": "2025-10-19T06:00:00Z"
}
```

---

## API Behavior

### **GET `/api/ai/insights`**

**Flow:**
1. Check if valid insights exist in Supabase
2. If found → Return cached insights
3. If not found → Generate new insights → Save to Supabase → Return

**Response (Cached):**
```json
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "score": 82,
  "recommendations": [...],
  "generatedAt": "2025-10-19T06:00:00Z",
  "cached": true
}
```

**Response (Freshly Generated):**
```json
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "score": 82,
  "recommendations": [...],
  "generatedAt": "2025-10-19T06:00:00Z",
  "cached": false
}
```

---

## Dashboard UI

### **AI Insights Card Shows:**

1. **Badge:** "Today's Insights" (when cached)
2. **Timestamp:** "Generated Oct 19, 6:00 AM • Updates daily"
3. **Refresh Button:** Click to check for new insights
4. **Optimization Score:** 0-100 with gradient bar
5. **Key Insights:** 3-5 observations
6. **Recommendations:** Action items with impact ratings

### **User Experience:**

**First Visit of the Day:**
- Insights generate fresh
- Takes 2-3 seconds (OpenRouter API call)
- Shows "Generated [time] • Updates daily"

**Subsequent Visits Same Day:**
- Instant load (from Supabase)
- Shows "Today's Insights" badge
- Same insights throughout the day

**Next Day First Visit:**
- Old insights expired
- Generates fresh insights with latest data
- New 24-hour validity period

---

## Setup Instructions

### **Step 1: Run Database Migration**

Execute this SQL in your Supabase SQL Editor:

```bash
# File location:
backend/scripts/add-ai-insights-table.sql
```

Or manually run:
```sql
CREATE TABLE linkinbio_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  score INTEGER,
  recommendations JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_valid 
ON linkinbio_ai_insights(user_id, valid_until DESC);
```

### **Step 2: Verify .env.local**

Make sure you have:
```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### **Step 3: Restart Backend**

```bash
cd backend
node server.js
```

### **Step 4: Test It**

1. Go to Dashboard
2. First load: Insights generate fresh (2-3 seconds)
3. Refresh page: Instant load (cached from Supabase)
4. Check Supabase table: See your insights stored

---

## Cost Optimization

### **Before (On-Demand):**
- Every dashboard visit = 1 API call
- 100 visits/day = 100 API calls
- Cost: ~$0.02/day = $0.60/month

### **After (Daily Cache):**
- First visit/day = 1 API call
- Remaining visits = 0 API calls
- 100 users, 1 call each = 100 API calls/day
- **Same cost but better UX!**

### **Actual Savings:**
If users visit dashboard multiple times per day:
- User visits 5x/day
- Before: 5 API calls
- After: 1 API call
- **80% reduction in API costs per active user!**

---

## Data Retention

### **Automatic Cleanup:**

Function `cleanup_old_ai_insights()` deletes insights older than 30 days.

You can run manually:
```sql
SELECT cleanup_old_ai_insights();
```

Or set up a cron job in Supabase:
```sql
-- Run daily at midnight
SELECT cron.schedule(
  'cleanup-ai-insights',
  '0 0 * * *',
  $$SELECT cleanup_old_ai_insights()$$
);
```

---

## Manual Refresh

Users can click the refresh button to:
- Check if insights are still valid
- If expired, trigger regeneration
- Get instant feedback

**Note:** Even if they spam refresh, it will return cached results until 24 hours expire!

---

## Troubleshooting

### **"No insights showing"**
- ✅ Run the migration SQL first
- ✅ Check table exists in Supabase
- ✅ Verify OpenRouter API key is set
- ✅ Check backend console for errors

### **"Insights not updating daily"**
- ✅ Check `valid_until` timestamp in database
- ✅ Verify it's set to 24 hours from `generated_at`
- ✅ Try after 24 hours have passed

### **"Database error when saving insights"**
- ✅ Ensure table has all required columns
- ✅ Check user_id exists in linkinbio_users
- ✅ Verify Supabase service key is correct

### **"Cached insights showing for multiple days"**
- ✅ Check `valid_until` timestamp
- ✅ Ensure it's being set correctly (24 hours)
- ✅ Delete old records manually if needed

---

## Querying Insights History

### **Get user's insight history:**
```sql
SELECT 
  generated_at,
  score,
  insights,
  valid_until
FROM linkinbio_ai_insights
WHERE user_id = 'your-user-id'
ORDER BY generated_at DESC
LIMIT 10;
```

### **Get latest valid insights:**
```sql
SELECT * FROM get_latest_ai_insights('your-user-id');
```

### **Check expiration times:**
```sql
SELECT 
  username,
  generated_at,
  valid_until,
  CASE 
    WHEN valid_until > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM linkinbio_ai_insights ai
JOIN linkinbio_users u ON ai.user_id = u.id
ORDER BY generated_at DESC;
```

---

## Future Enhancements

### **Potential Features:**

1. **Weekly Digest Email:**
   - Send AI insights via email once a week
   - Aggregate improvements over time

2. **Trend Analysis:**
   - Compare insights week-over-week
   - Show improvement trajectory
   - "Your score improved by 15 points!"

3. **Custom Refresh Schedule:**
   - Let users choose: daily, weekly, or manual
   - Premium users get hourly updates

4. **Insight Notifications:**
   - Push notification when new insights arrive
   - "Your daily AI insights are ready!"

5. **A/B Testing Automation:**
   - Automatically test AI recommendations
   - Measure actual impact
   - "We tested moving your button - conversions up 22%!"

---

## Summary

### ✅ **What Changed:**

| Feature | Before | After |
|---------|--------|-------|
| **Storage** | React state (lost on refresh) | Supabase (persistent) |
| **Update Frequency** | Every dashboard load | Once per 24 hours |
| **API Calls** | Every visit | First visit per day |
| **Performance** | 2-3 sec load time | Instant (cached) |
| **Cost** | High (repeated calls) | Optimized (1x daily) |

### 🎯 **Benefits:**

- ✅ Insights persist across sessions
- ✅ No localStorage dependency
- ✅ Reduced API costs (80%+ savings)
- ✅ Faster dashboard load times
- ✅ Better user experience
- ✅ Historical insight tracking
- ✅ Data analytics on AI performance

---

**Status:** ✅ FULLY IMPLEMENTED  
**Storage:** Supabase Database  
**Update Cycle:** 24 hours  
**Last Updated:** Oct 19, 2025
