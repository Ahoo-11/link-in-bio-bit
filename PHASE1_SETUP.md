# Phase 1 Setup - Quick Start

## ✅ Files Created

**Backend:**
- `backend/scripts/nexus-phase1-schema.sql` - Database migration
- `backend/middleware/visitor-context.js` - Context capture
- `backend/services/visitor-session.js` - Session management
- `backend/routes/visitor.js` - API endpoints
- `backend/server.js` - Updated with visitor routes

**Frontend:**
- `lib/visitor-tracking.ts` - Client-side tracking

**Config:**
- `package.json` - Added geoip-lite & ua-parser-js

---

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `geoip-lite` - IP geolocation
- `ua-parser-js` - User agent parsing

### 2. Run Database Migration

Open your **Supabase SQL Editor** and run:
```bash
backend/scripts/nexus-phase1-schema.sql
```

This creates 7 new tables:
- linkinbio_visitor_sessions
- linkinbio_adaptive_rules
- linkinbio_integrations
- linkinbio_content_items
- linkinbio_spaces
- linkinbio_ab_tests
- linkinbio_ai_insights

### 3. Update Environment Variables

Add to `.env.local`:
```env
# Optional: Encryption key for future OAuth integrations
INTEGRATION_ENCRYPTION_KEY=your_random_32_char_key_here
```

### 4. Restart Backend
```bash
npm run server
```

### 5. Test API Endpoints

Test visitor tracking:
```bash
curl -X POST http://localhost:5000/api/visitor/track \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","visitorId":"123e4567-e89b-12d3-a456-426614174000","screen":{"width":1920,"height":1080}}'
```

---

## 📊 What You Can Do Now

### Backend Features
✅ Track visitor sessions with full context (geo, device, referral)
✅ Record button clicks and engagement
✅ Get visitor analytics by timeframe
✅ Provide context for adaptive rules (Phase 3)

### Analytics Available
- Total visits & unique visitors
- First-time vs returning visitors
- Device breakdown (mobile/tablet/desktop)
- Country/region distribution
- Top referrers
- Average session duration

---

## 🧪 Testing

### 1. Test Visitor Tracking

Create a test file `test-visitor.js`:
```javascript
const fetch = require('node-fetch');

async function testTracking() {
  const res = await fetch('http://localhost:5000/api/visitor/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      visitorId: '123e4567-e89b-12d3-a456-426614174000',
      screen: { width: 1920, height: 1080 }
    })
  });
  
  const data = await res.json();
  console.log('Session created:', data);
}

testTracking();
```

Run: `node test-visitor.js`

### 2. Check Database

In Supabase, query:
```sql
SELECT * FROM linkinbio_visitor_sessions ORDER BY created_at DESC LIMIT 10;
```

---

## 🔜 Next Steps (Phase 2)

Phase 1 is complete! Next up:
- Phase 2: External Integrations (Shopify, Spotify, etc.)
- Phase 3: Adaptive Rules Engine
- Phase 4: Spaces & Concierge AI

---

## 📝 API Reference

### POST /api/visitor/track
Track a new visit
```json
{
  "username": "user123",
  "visitorId": "uuid",
  "screen": { "width": 1920, "height": 1080 }
}
```

### POST /api/visitor/click
Track button click
```json
{
  "sessionId": "uuid",
  "buttonId": "btn_123"
}
```

### GET /api/visitor/analytics/:username
Get analytics (requires auth)
Query params: `?timeframe=7d` (7d, 30d, all)

---

## ✅ Verification Checklist

- [ ] npm install completed
- [ ] Database migration ran successfully
- [ ] Backend starts without errors
- [ ] Test API call returns session data
- [ ] Data appears in Supabase tables
- [ ] New routes registered in server.js

**Phase 1 Complete! 🎉**
