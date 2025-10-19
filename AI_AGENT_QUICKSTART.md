# 🚀 AI Agent - Quick Start Guide

## ⚡ 3-Step Setup

### 1. Run Database Migration

Open Supabase SQL Editor and run:
```bash
backend/scripts/add-ai-agent-tables.sql
```

### 2. Verify Environment Variable

Check `.env.local` has:
```env
OPENROUTER_API_KEY=your_key_here
```

### 3. Restart Backend

```bash
cd backend
node server.js
```

---

## 🎯 Test It Now!

1. **Login** to your dashboard
2. **Click** the floating purple chat button (bottom-right)
3. **Try:** "Add a $10 tip button"

---

## 💬 What Can You Ask?

### Add Buttons
```
"Add a tip button for $5"
"Add a link to my shop: myshop.com"
```

### Social Links
```
"Add my Instagram: instagram.com/username"
"Add Twitter, TikTok, and Facebook"
```

### Profile Updates
```
"Update my bio to: I'm a creator"
"Change to dark theme"
```

### Analytics
```
"How's my profile doing?"
"Show my stats"
"What can I improve?"
```

---

## 🎨 Where Does It Appear?

✅ Dashboard
✅ Editor
✅ Analytics
✅ Settings

❌ Public profiles (user-facing pages)
❌ Login/Register pages

---

## 🔧 Files Created

**Backend:**
- `backend/services/ai-actions.js` - Action executor
- `backend/routes/ai-agent.js` - Chat API endpoint
- `backend/scripts/add-ai-agent-tables.sql` - Database schema

**Frontend:**
- `components/AIChat.tsx` - Chat UI component
- `components/AIChatWrapper.tsx` - Conditional rendering wrapper
- `app/layout.tsx` - Updated with chatbot integration

**Documentation:**
- `AI_AGENT_PLAN.md` - Full architecture
- `AI_AGENT_DECISIONS.md` - Design decisions
- `AI_AGENT_SETUP.md` - Complete guide
- `AI_AGENT_QUICKSTART.md` - This file

---

## ✅ Capabilities

### Button Management
- ✅ Add buttons (tip/link)
- ✅ Update existing buttons
- ✅ Delete buttons
- ✅ Reorder buttons

### Social Links
- ✅ Add social platforms (IG, FB, Twitter, TikTok, LinkedIn, Snapchat)
- ✅ Update social links
- ✅ Delete social links
- ✅ Toggle visibility

### Profile
- ✅ Update bio
- ✅ Update display name
- ✅ Update avatar

### Styling
- ✅ Change theme (light/dark)
- ✅ Update color scheme
- ✅ Change background

### Analytics
- ✅ Get performance stats
- ✅ View top buttons
- ✅ Check earnings
- ✅ Analyze conversion rate

### Intelligence
- ✅ Suggest improvements
- ✅ Provide recommendations
- ✅ Answer questions
- ✅ Give optimization tips

---

## 🐛 Quick Troubleshooting

**Chat button not showing?**
→ Make sure you're logged in

**AI not responding?**
→ Check OpenRouter API key in `.env.local`

**Actions not working?**
→ Run database migration

**Backend errors?**
→ Check `backend/server.js` is running

---

## 📱 UI Features

- **Floating widget** - Bottom-right corner
- **Minimize/Maximize** - Adjustable size
- **Quick actions** - One-click common tasks
- **Message history** - Persists across sessions
- **Loading states** - Visual feedback
- **Error handling** - Graceful failures

---

## 🎯 Example Commands

**Quick Setup:**
```
"Add a $20 tip button and my Instagram link"
```

**Profile Optimization:**
```
"Analyze my profile and suggest improvements"
```

**Batch Operations:**
```
"Add all my social links: 
IG: instagram.com/me
Twitter: twitter.com/me
TikTok: tiktok.com/@me"
```

**Styling:**
```
"Make my profile dark themed with purple accents"
```

---

## 🎉 You're Ready!

The AI agent is fully functional and ready to help users manage their link-in-bio profiles through natural conversation.

**Next:** Test it yourself, then gather user feedback!
