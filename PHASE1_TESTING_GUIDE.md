# 🧪 Phase 1 Testing Guide

## Complete End-to-End Testing for Nexus Visitor Tracking

---

## ✅ Pre-Testing Checklist

Before starting, ensure:
- [ ] Database migration completed successfully (7 tables created)
- [ ] `npm install` ran without errors
- [ ] Backend server running (`npm run server`)
- [ ] Frontend running (`npm run dev`)
- [ ] Both accessible at localhost:3000 and localhost:5000

---

## 🎯 Test 1: API Endpoint Test

**Purpose:** Verify the visitor tracking API works

### Steps:
```powershell
# Test the tracking endpoint
Invoke-WebRequest -Uri "http://localhost:5000/api/visitor/track" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"YOUR_USERNAME","visitorId":"test-visitor-123","screen":{"width":1920,"height":1080}}'
```

### Expected Result:
- ✅ Status: 200 OK
- ✅ Response contains: `success: true`, `session` object with `id`, `visitor_id`, `username`
- ✅ Console shows: `📊 Visitor session started`

### Verify in Database:
```sql
SELECT * FROM linkinbio_visitor_sessions 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🎯 Test 2: Profile Page Visitor Tracking

**Purpose:** Verify automatic visitor tracking on profile visits

### Steps:
1. Open browser to your profile: `http://localhost:3000/YOUR_USERNAME`
2. Open browser DevTools (F12) → Console tab
3. Look for: `📊 Visitor session started: { sessionId: "...", isFirstVisit: true, visitCount: 1 }`

### Expected Result:
- ✅ Profile loads successfully
- ✅ Console shows session tracking message
- ✅ No errors in console

### Verify in Database:
```sql
SELECT 
  username,
  visitor_id,
  device_type,
  browser,
  is_first_visit,
  visit_count,
  created_at
FROM linkinbio_visitor_sessions 
WHERE username = 'YOUR_USERNAME'
ORDER BY created_at DESC 
LIMIT 3;
```

---

## 🎯 Test 3: Button Click Tracking

**Purpose:** Verify button clicks are tracked

### Steps:
1. On your profile page (`http://localhost:3000/YOUR_USERNAME`)
2. Click any button (link or social icon)
3. Check browser Console (F12)
4. Look for network request to `/api/visitor/click`

### Expected Result:
- ✅ Button opens the link correctly
- ✅ Network tab shows POST to `/api/visitor/click`
- ✅ Response: `{ success: true }`

### Verify in Database:
```sql
SELECT 
  visitor_id,
  clicked_buttons,
  session_start,
  created_at
FROM linkinbio_visitor_sessions 
WHERE username = 'YOUR_USERNAME'
  AND clicked_buttons IS NOT NULL
ORDER BY created_at DESC;
```

Should show button IDs in `clicked_buttons` array.

---

## 🎯 Test 4: Return Visitor Detection

**Purpose:** Verify returning visitors are tracked correctly

### Steps:
1. Visit your profile: `http://localhost:3000/YOUR_USERNAME`
2. Note the console message about `isFirstVisit` and `visitCount`
3. Close the tab
4. Open a new tab and visit the same profile again
5. Check the console message

### Expected Result:
- ✅ First visit: `isFirstVisit: true, visitCount: 1`
- ✅ Second visit: `isFirstVisit: false, visitCount: 2`

### Verify in Database:
```sql
SELECT 
  visitor_id,
  is_first_visit,
  visit_count,
  created_at
FROM linkinbio_visitor_sessions 
WHERE username = 'YOUR_USERNAME'
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🎯 Test 5: Session Duration Tracking

**Purpose:** Verify session duration is recorded

### Steps:
1. Visit your profile: `http://localhost:3000/YOUR_USERNAME`
2. Stay on the page for ~30 seconds
3. Navigate away or close the tab
4. Check database

### Expected Result:
- ✅ Session has `session_end` timestamp
- ✅ `session_duration` is approximately 30 seconds

### Verify in Database:
```sql
SELECT 
  username,
  session_start,
  session_end,
  session_duration,
  created_at
FROM linkinbio_visitor_sessions 
WHERE session_duration > 0
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🎯 Test 6: Analytics Dashboard

**Purpose:** Verify visitor analytics appear in dashboard

### Steps:
1. Log in to your account
2. Navigate to Analytics: `http://localhost:3000/analytics`
3. Scroll down to "Visitor Insights" section
4. Check all stats and charts

### Expected Result:
- ✅ **Total Visits** shows correct count
- ✅ **Unique Visitors** shows correct count
- ✅ **Avg. Session** shows duration
- ✅ **Returning %** shows percentage
- ✅ **Device Breakdown** pie chart renders
- ✅ **Geographic Distribution** bar chart shows countries
- ✅ **Visitor Types** shows first-time vs returning

### Screenshots to Verify:
- [ ] Quick stats cards populated
- [ ] Device breakdown chart visible
- [ ] Geographic chart shows data
- [ ] Referrer list populated (if any)

---

## 🎯 Test 7: Different Devices

**Purpose:** Verify device detection works

### Steps:
1. Visit profile on desktop browser
2. Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
3. Switch to mobile view (iPhone, Pixel, etc.)
4. Refresh the page
5. Check database

### Expected Result:
- ✅ Desktop visit: `device_type: 'desktop'`
- ✅ Mobile emulation: `device_type: 'mobile'`

### Verify in Database:
```sql
SELECT 
  device_type,
  browser,
  os,
  COUNT(*) as count
FROM linkinbio_visitor_sessions 
WHERE username = 'YOUR_USERNAME'
GROUP BY device_type, browser, os;
```

---

## 🎯 Test 8: UTM Parameters

**Purpose:** Verify UTM tracking works

### Steps:
1. Visit with UTM params:
   ```
   http://localhost:3000/YOUR_USERNAME?utm_source=twitter&utm_medium=social&utm_campaign=launch
   ```
2. Check database

### Expected Result:
- ✅ `utm_source: 'twitter'`
- ✅ `utm_medium: 'social'`
- ✅ `utm_campaign: 'launch'`

### Verify in Database:
```sql
SELECT 
  utm_source,
  utm_medium,
  utm_campaign,
  referrer_domain,
  created_at
FROM linkinbio_visitor_sessions 
WHERE username = 'YOUR_USERNAME'
  AND utm_source IS NOT NULL
ORDER BY created_at DESC;
```

---

## 🎯 Test 9: Multiple Visitors Simulation

**Purpose:** Test with multiple visitor IDs

### Steps:
1. Open 3 different browsers (Chrome, Firefox, Edge)
2. Visit your profile from each
3. Click different buttons in each
4. Check analytics dashboard

### Expected Result:
- ✅ **Unique Visitors**: 3
- ✅ **Total Visits**: 3 or more
- ✅ Each browser tracked separately

### Verify in Database:
```sql
SELECT 
  visitor_id,
  browser,
  COUNT(*) as visits
FROM linkinbio_visitor_sessions 
WHERE username = 'YOUR_USERNAME'
GROUP BY visitor_id, browser;
```

---

## 🎯 Test 10: Analytics Time Filters

**Purpose:** Verify time range filtering works

### Steps:
1. Go to Analytics page
2. Click different time range buttons:
   - 24 Hours
   - 7 Days
   - 30 Days
   - 90 Days
3. Observe data updates

### Expected Result:
- ✅ Stats update when changing time range
- ✅ Charts re-render with filtered data
- ✅ No errors in console

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module 'visitor-tracking'"
**Fix:** Check import path is correct:
```typescript
import { visitorTracker } from "@/lib/visitor-tracking";
```

### Issue: Network error connecting to API
**Fix:** Verify `NEXT_PUBLIC_API_URL` in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Issue: No data in analytics
**Fix:** 
1. Check tables exist in Supabase
2. Verify backend server is running
3. Check browser console for errors
4. Ensure visitor tracking code executes

### Issue: Visitor ID not persisting
**Fix:** Check browser cookies are enabled and not blocked

---

## 📊 Success Criteria

Phase 1 is fully functional if ALL of these work:

### Database
- ✅ 7 new tables exist
- ✅ Visitor sessions are stored
- ✅ Click tracking data saved
- ✅ Geographic data populated (when available)
- ✅ Device info captured correctly

### Frontend
- ✅ Profile page tracks visitors automatically
- ✅ Button clicks tracked
- ✅ Session cleanup on page leave
- ✅ No console errors

### Analytics Dashboard
- ✅ Total visits displayed
- ✅ Unique visitors count accurate
- ✅ Device breakdown chart renders
- ✅ Geographic chart shows countries
- ✅ Returning visitor % calculated
- ✅ Time filters work

### API
- ✅ POST /api/visitor/track returns session
- ✅ POST /api/visitor/click records clicks
- ✅ GET /api/visitor/analytics/:username returns data
- ✅ All endpoints respond in < 500ms

---

## 🎉 Phase 1 Complete!

If all tests pass, Phase 1 is production-ready!

**Next Steps:**
- Deploy to production
- Start Phase 2 (External Integrations)
- Start Phase 3 (Adaptive Rules Engine)
- Start Phase 4 (Spaces & Concierge AI)

---

## 📝 Test Results Template

Copy this to track your testing:

```
## My Test Results

Date: ___________
Tester: ___________

| Test | Status | Notes |
|------|--------|-------|
| 1. API Endpoint | ⬜ | |
| 2. Profile Tracking | ⬜ | |
| 3. Button Clicks | ⬜ | |
| 4. Return Visitors | ⬜ | |
| 5. Session Duration | ⬜ | |
| 6. Analytics Dashboard | ⬜ | |
| 7. Device Detection | ⬜ | |
| 8. UTM Parameters | ⬜ | |
| 9. Multiple Visitors | ⬜ | |
| 10. Time Filters | ⬜ | |

Overall Status: ⬜ PASS / ⬜ FAIL
```

---

**Happy Testing! 🚀**
