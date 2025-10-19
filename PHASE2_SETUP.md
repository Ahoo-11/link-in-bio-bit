# 🚀 Phase 2 Setup - External Integrations

## Overview
Phase 2 adds external integrations (Spotify, Shopify, Calendly, YouTube) with OAuth authentication and auto-sync.

---

## ✅ What Was Built

### Backend Services
1. **OAuth Service** (`backend/services/oauth-service.js`)
   - Token encryption/decryption
   - OAuth flow management
   - State verification (CSRF protection)
   - Token refresh handling

2. **Spotify Connector** (`backend/services/integrations/spotify-connector.js`)
   - Fetch user profile
   - Get top tracks
   - Get playlists
   - Sync content

3. **Integration Manager** (`backend/services/integration-manager.js`)
   - Manage all integrations
   - Handle sync operations
   - Token refresh automation

4. **Integration API Routes** (`backend/routes/integrations.js`)
   - Connect/disconnect integrations
   - Manual/auto sync
   - Get synced content

---

## 🔧 Environment Variables Required

Add these to `.env.local`:

```env
# App URLs
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Encryption (REQUIRED for production)
INTEGRATION_ENCRYPTION_KEY=your_64_character_hex_key_here

# Spotify Integration (Optional - only if using Spotify)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Google/YouTube Integration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Calendly Integration (Optional)
CALENDLY_CLIENT_ID=your_calendly_client_id
CALENDLY_CLIENT_SECRET=your_calendly_client_secret
```

---

## 🔐 Generate Encryption Key

Run this in Node.js or terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it as `INTEGRATION_ENCRYPTION_KEY` in `.env.local`

---

## 🎵 Set Up Spotify Integration

### Step 1: Create Spotify App

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in:
   - **App name**: Your App Name
   - **App description**: Link-in-bio integrations
   - **Redirect URI**: `http://localhost:5000/api/integrations/callback/spotify`
   - **Website**: `http://localhost:3000`
   - Check **Web API** checkbox
5. Click **Save**

### Step 2: Get Credentials

1. In your new app, click **Settings**
2. Copy **Client ID**
3. Click **View client secret** and copy it
4. Add to `.env.local`:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

### Step 3: Add Production Redirect URI (Later)

When deploying, add: `https://yourdomain.com/api/integrations/callback/spotify`

---

## 📺 Set Up YouTube Integration (Optional)

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable **YouTube Data API v3**

### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add redirect URI: `http://localhost:5000/api/integrations/callback/youtube`
5. Copy Client ID and Secret

### Step 3: Add to Environment

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## 📅 Set Up Calendly Integration (Optional)

### Step 1: Create Calendly App

1. Go to https://developer.calendly.com
2. Register for developer access
3. Create a new OAuth application
4. Redirect URI: `http://localhost:5000/api/integrations/callback/calendly`

### Step 2: Add Credentials

```env
CALENDLY_CLIENT_ID=your_client_id
CALENDLY_CLIENT_SECRET=your_client_secret
```

---

## 🚀 Quick Start (Spotify Only)

### 1. Add Environment Variables

```env
# .env.local
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
INTEGRATION_ENCRYPTION_KEY=<your_generated_key>
SPOTIFY_CLIENT_ID=<your_spotify_client_id>
SPOTIFY_CLIENT_SECRET=<your_spotify_client_secret>
```

### 2. Restart Backend

```bash
# Stop current server (Ctrl+C)
npm run dev:all
```

### 3. Test API Endpoints

```powershell
# Get user's integrations (requires auth token)
Invoke-WebRequest -Uri "http://localhost:5000/api/integrations" -Headers @{"Authorization"="Bearer YOUR_TOKEN"}

# Start Spotify OAuth flow
Invoke-WebRequest -Uri "http://localhost:5000/api/integrations/connect/spotify" -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

---

## 📊 API Endpoints

### Get All Integrations
```
GET /api/integrations
Authorization: Bearer <token>
```

### Connect Integration
```
GET /api/integrations/connect/:service
Authorization: Bearer <token>

Services: spotify, youtube, calendly
```

### OAuth Callback
```
GET /api/integrations/callback/:service?code=xxx&state=xxx
```

### Sync Integration
```
POST /api/integrations/:id/sync
Authorization: Bearer <token>
```

### Sync All Integrations
```
POST /api/integrations/sync-all
Authorization: Bearer <token>
```

### Delete Integration
```
DELETE /api/integrations/:id
Authorization: Bearer <token>
```

### Get Synced Content
```
GET /api/integrations/content
Authorization: Bearer <token>
```

---

## 🧪 Testing

### Test Spotify Connection

1. **Get auth URL**:
```javascript
const response = await fetch('/api/integrations/connect/spotify', {
  headers: { Authorization: `Bearer ${token}` }
});
const { authUrl } = await response.json();
// Visit authUrl in browser
```

2. **After OAuth callback**, check integration was saved:
```javascript
const response = await fetch('/api/integrations');
const { integrations } = await response.json();
console.log(integrations); // Should show Spotify
```

3. **Sync content**:
```javascript
const integration = integrations[0];
await fetch(`/api/integrations/${integration.id}/sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
```

4. **View synced content**:
```javascript
const response = await fetch('/api/integrations/content');
const { content } = await response.json();
console.log(content); // Should show Spotify tracks/playlists
```

---

## 🛠️ Next Steps

Now that the backend is ready, we need to build:

1. **Frontend UI** - Integration dashboard page
2. **Connect buttons** - UI to trigger OAuth flow
3. **Content display** - Show synced items
4. **Auto-sync** - Background job scheduler

---

## ⚠️ Important Security Notes

- ✅ **Never commit** API keys to git
- ✅ **Always encrypt** access tokens in database
- ✅ **Use HTTPS** in production
- ✅ **Validate** OAuth state tokens
- ✅ **Set proper** CORS origins

---

## 📁 Files Created

```
backend/
├── services/
│   ├── oauth-service.js                    ← OAuth & encryption
│   ├── integration-manager.js              ← Integration management
│   └── integrations/
│       └── spotify-connector.js            ← Spotify API
└── routes/
    └── integrations.js                     ← API endpoints

backend/server.js                           ← Updated (registered routes)
```

---

## ✅ Phase 2 Progress

- [x] OAuth service created
- [x] Spotify connector built
- [x] Integration manager service
- [x] API routes implemented
- [x] Server routes registered
- [ ] Frontend integration UI
- [ ] Auto-sync scheduler
- [ ] More connectors (Shopify, YouTube, Calendly)

**Status: Backend 80% Complete** 🎉

---

**Ready to test? Set up your Spotify app and let's connect it!** 🎵
