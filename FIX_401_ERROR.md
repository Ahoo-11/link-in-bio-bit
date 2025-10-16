# 🔧 Fix 401 Unauthorized Error - Quick Guide

## ⚠️ THE PROBLEM

You logged in with your wallet **BEFORE** I fixed the authentication code. Your browser has a **stale/invalid session** with no proper authentication token.

**Result:** Backend returns "401 Unauthorized" because it can't verify who you are.

---

## ✅ THE SOLUTION (2 minutes)

### Option 1: Use the Debug Tool (EASIEST)

1. **Go to:** http://localhost:3000/test-auth
2. **Click "Clear Token"** button
3. **Click "Run Tests"** to verify backend is working
4. **Go to:** http://localhost:3000/login
5. **Click "Connect Wallet"**
6. **Approve in your wallet**
7. **Done!** Dashboard will work now

### Option 2: Manual Fix

1. **Open Browser DevTools** (Press F12)
2. **Go to Console tab**
3. **Type:** `localStorage.clear()`
4. **Press Enter**
5. **Refresh page** (F5)
6. **Go to:** http://localhost:3000/login
7. **Click "Connect Wallet"**
8. **Approve connection**
9. **Done!**

### Option 3: Incognito/Private Window

1. **Open Incognito/Private window** (Ctrl+Shift+N in Chrome)
2. **Go to:** http://localhost:3000
3. **Click "Get Started"** or **"Sign In"**
4. **Click "Connect Wallet"**
5. **Approve connection**
6. **Done!**

---

## 🧪 TEST IT WORKS

After logging in again:

1. Go to: http://localhost:3000/test-auth
2. Click "Run Tests"
3. You should see:
   - ✅ Backend is running
   - ✅ Token exists
   - ✅ Profile loaded: [your-username]

If you see all ✅, you're good to go!

---

## 📋 WHAT CHANGED IN THE FIX

### Before (Broken):
```
Wallet Login → ❌ No backend call → ❌ No token → ❌ Dashboard fails
```

### After (Fixed):
```
Wallet Login → ✅ Backend /api/auth/wallet-login → ✅ Token stored → ✅ Dashboard works
```

---

## 🔍 TECHNICAL DETAILS

### What the 401 error means:
- Your browser tries to call `/api/user/profile`
- But doesn't send a valid authentication token
- Backend says "I don't know who you are" → 401 Unauthorized

### What the fix does:
1. **Clears old session** (no token)
2. **Wallet login now calls backend** to:
   - Create/find your account in Supabase
   - Generate JWT authentication token
   - Store token in localStorage
3. **All future API calls** include the token
4. **Backend verifies token** and returns your data

---

## 🚨 IF STILL NOT WORKING

### Check Backend is Running:
```bash
npm run dev:all
```

Should show:
```
✅ Supabase client initialized
Server running on port 5000
```

### Check Supabase Credentials:
Open `.env.local` and verify:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...your-key
```

### Test Backend Directly:
1. Go to: http://localhost:5000/health
2. Should return: `{"status":"ok","timestamp":"..."}`

---

## 🎯 REMEMBER

**Every time you see 401 errors:**
1. It means your session expired or is invalid
2. Clear token: Go to http://localhost:3000/test-auth
3. Log in again
4. That's it!

---

## 📞 NEED MORE HELP?

Check these files:
- `HOW_TO_USE.md` - How to use the app
- `SUPABASE_SETUP.md` - Database setup
- `QUICK_SUPABASE_SETUP.txt` - Fast setup guide

The fix is working - you just need to **log in again with the NEW code**! 🚀
