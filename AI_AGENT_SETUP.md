# 🤖 AI Agent Setup & Usage Guide

## ✅ What Was Built

Your link-in-bio platform now has a **fully autonomous AI agent** that can:

- 💬 Chat with users in natural language
- 🔧 Execute profile modifications automatically
- 📊 Analyze analytics and provide insights
- 🎨 Update styling and themes
- 🔗 Manage buttons and social links
- 💡 Suggest optimizations proactively

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Execute the SQL migration to create AI agent tables:

```bash
# Navigate to backend directory
cd backend

# Run the migration on your Supabase database
# Copy contents of scripts/add-ai-agent-tables.sql
# Paste into Supabase SQL Editor and execute
```

**Tables Created:**
- `linkinbio_ai_conversations` - Chat sessions
- `linkinbio_ai_messages` - Individual messages
- Functions for conversation management

### Step 2: Verify OpenRouter API Key

Make sure your `.env.local` file has the OpenRouter key:

```env
OPENROUTER_API_KEY=your_api_key_here
```

If you don't have one:
1. Sign up at https://openrouter.ai
2. Get your API key from the dashboard
3. Add it to `.env.local`

### Step 3: Restart Backend Server

```bash
# Stop current server (Ctrl+C)
# Restart
cd backend
node server.js
```

You should see:
```
✅ Supabase client initialized
Server running on port 5000
```

### Step 4: Test the Chatbot

1. **Login** to your dashboard
2. Look for the **floating purple chat button** (bottom-right corner)
3. Click it to open the AI assistant
4. Try asking: *"Add a $10 tip button"*

---

## 💬 How to Use the AI Agent

### Opening the Chat

**Floating Button:**
- Located at bottom-right of screen
- Available on: Dashboard, Editor, Analytics, Settings
- Not shown on: Public profiles, Login/Register pages

**Click to open** → Chat window appears

### Chatting with the AI

**Natural Language Examples:**
```
"Add a tip button for $5"
"Update my bio to: I'm a creator and artist"
"Add my Instagram link: instagram.com/myusername"
"Change to dark theme"
"How's my profile performing?"
"What can I do to get more tips?"
```

**Quick Actions (First Time):**
- 📊 Analyze my profile
- ➕ Add a button
- 🔗 Add social links
- 💡 Suggest improvements

### Understanding Responses

**✅ Success Messages:**
```
✅ Added tip button: "Support me - $5"
✅ Updated profile information
✅ Added Instagram link
```

**❌ Error Messages:**
```
❌ Error: Maximum 10 buttons allowed
❌ Error: Instagram link already exists
```

**📊 Analytics Responses:**
```
📊 You have 45 visits this week, 12 clicks, and $25 in tips.
Your conversion rate is 26.7%!
```

---

## 🛠️ AI Agent Capabilities

### Button Management

```
"Add a tip button for $10"
"Add a link button to my shop: myshop.com"
"Update my tip button to $15"
"Delete my shop link"
"Reorder my buttons"
```

### Social Links

```
"Add my Instagram: instagram.com/username"
"Add all my social links: IG, Twitter, TikTok"
"Remove my Facebook link"
"Hide my LinkedIn link"
```

### Profile Info

```
"Update my bio to: Digital artist & creator"
"Change my display name to John Doe"
"Update my avatar: https://..."
```

### Styling

```
"Switch to dark theme"
"Make my profile purple"
"Change background to black"
```

### Analytics

```
"How am I doing?"
"Show my stats for the last 30 days"
"Which button gets the most clicks?"
"How much have I earned?"
```

### Optimization

```
"How can I improve my profile?"
"What should I change to get more tips?"
"Analyze my performance"
"Give me suggestions"
```

---

## 🔍 Under the Hood

### Architecture

```
User types message
    ↓
Frontend (AIChat.tsx)
    ↓
POST /api/ai-agent/chat
    ↓
Backend (ai-agent.js)
    ↓
OpenRouter API (DeepSeek model)
    ↓
AI decides action (function calling)
    ↓
Execute action (ai-actions.js)
    ↓
Update database (Supabase)
    ↓
Return success message
    ↓
Display in chat
```

### AI Tools (Functions)

The AI can call these functions:

1. **add_button** - Add new button
2. **update_button** - Modify button
3. **delete_button** - Remove button
4. **reorder_buttons** - Change order
5. **add_social_link** - Add social platform
6. **update_social_link** - Modify social link
7. **delete_social_link** - Remove social link
8. **update_profile** - Change bio/name/avatar
9. **update_style** - Modify theme/colors
10. **get_analytics** - Fetch performance data

### Conversation Persistence

- Conversations auto-save to database
- History persists across sessions
- Conversations expire after 24 hours (auto-creates new one)
- Last 20 messages sent to AI for context

---

## 🎨 UI Features

### Floating Widget

- **Minimized:** Shows button only
- **Expanded:** Full chat interface
- **Animated:** Smooth transitions
- **Responsive:** Works on all screen sizes

### Chat Window

- **Message History:** Scrollable past messages
- **Quick Actions:** One-click common tasks
- **Typing Indicators:** Shows when AI is thinking
- **Timestamps:** Each message has time
- **Action Badges:** Shows when actions were performed

### Message Types

1. **User Messages** (purple, right-aligned)
2. **AI Responses** (white, left-aligned)
3. **System Notifications** (centered, gray)
4. **Loading State** (animated spinner)

---

## 🔒 Safety Features

### Validation Rules

1. **Button Limits:** Max 10 buttons per profile
2. **Content Filtering:** Validates URLs and text
3. **Character Limits:** Bio max 500 chars
4. **Duplicate Prevention:** Can't add same social link twice

### Error Handling

- Graceful error messages
- No crashes on API failures
- Fallback to manual editing if AI fails
- Clear user guidance

### Privacy

- Conversations stored securely in Supabase
- Only user can see their own chat history
- Auto-deletion after 30 days (cleanup function)

---

## 🐛 Troubleshooting

### Chatbot Doesn't Appear

**Check:**
1. Are you logged in? (Chat only shows for authenticated users)
2. Are you on the right page? (Not on public profile or login page)
3. Is there a console error? (Open DevTools)

**Fix:**
- Refresh the page
- Clear browser cache
- Check browser console for errors

### AI Not Responding

**Check:**
1. Is OpenRouter API key set in `.env.local`?
2. Is backend server running?
3. Is Supabase connected?

**Fix:**
```bash
# Restart backend
cd backend
node server.js

# Check logs for errors
```

### Actions Not Working

**Check:**
1. Did the AI return an error message?
2. Are you hitting a limit (max buttons)?
3. Is the Supabase migration complete?

**Fix:**
- Read the error message carefully
- Try manual editing to verify it works
- Re-run database migration

### Chat History Lost

This is normal:
- Conversations expire after 24 hours
- This prevents clutter and saves tokens
- New conversation auto-creates

---

## 💡 Tips for Best Results

### Be Specific

❌ "Add a button"
✅ "Add a tip button for $20"

❌ "Update my profile"
✅ "Update my bio to: I'm a digital artist"

### One Action at a Time

✅ Good:
```
"Add my Instagram link"
[waits for confirmation]
"Now add my Twitter"
```

❌ Confusing:
```
"Add Instagram, Twitter, TikTok, Facebook all at once with these URLs: ..."
```

### Ask for Help

✅ "What can you help me with?"
✅ "How do I improve my conversion rate?"
✅ "Show me my analytics"

### Provide Context

✅ "My tip button isn't getting clicks. What should I do?"
✅ "I want to focus on Instagram growth. Help me optimize."

---

## 📊 Example Conversations

### Conversation 1: Quick Setup

```
User: Add a $5 tip button

AI: ✅ Added tip button: "Support me - $5"
    
    Your tip button is now live! Want me to add more 
    ways for people to support you?

User: Yes, add my Instagram

AI: What's your Instagram URL?

User: instagram.com/johndoe

AI: ✅ Added Instagram link
    
    Great! Your Instagram icon will now appear on your 
    profile. Should I analyze which platform drives the 
    most engagement?
```

### Conversation 2: Optimization

```
User: How can I get more tips?

AI: Let me analyze your profile...

    📊 Current Stats:
    • 120 visits this week
    • 15 clicks (12.5% conversion)
    • $42 in tips
    
    💡 Recommendations:
    
    1. Move your tip button to the top - currently buried
    2. Add social proof (mention your follower count)
    3. Create multiple tip tiers ($5, $10, $20)
    
    Want me to implement any of these?

User: Move tip button to top

AI: ✅ Reordered buttons
    
    Your tip button is now at the top! Profiles with 
    tip-first layouts see 30% higher conversions.
```

### Conversation 3: Styling

```
User: Make my profile look better

AI: I can help! What vibe are you going for?
    
    [🌙 Dark & Sleek]
    [🌈 Colorful & Fun]
    [✨ Minimal & Clean]
    [🎨 Custom Colors]

User: Dark and sleek

AI: ✅ Updated profile style
    
    Changes made:
    • Theme: Light → Dark
    • Background: #1a1a1a
    • Text: Auto-adjusted for readability
    
    Your profile now has a modern, dark aesthetic!
```

---

## 🚀 Next Steps

### Test Everything

1. ✅ Add buttons via AI
2. ✅ Manage social links
3. ✅ Update profile info
4. ✅ Change styling
5. ✅ Query analytics
6. ✅ Get recommendations

### Monitor Performance

- Check analytics to see if AI-suggested changes help
- Track which AI actions users use most
- Gather feedback on AI accuracy

### Future Enhancements

Planned features:
- Voice input
- Scheduled actions
- A/B testing automation
- Multi-language support
- Proactive notifications
- Smart suggestions based on similar profiles

---

## 📞 Support

If you encounter issues:

1. **Check this guide** for troubleshooting steps
2. **Review console logs** in browser DevTools
3. **Check backend logs** for server errors
4. **Verify database migration** ran successfully
5. **Test with simple commands** first

---

**Congratulations! Your AI agent is ready to help users optimize their link-in-bio profiles! 🎉**
