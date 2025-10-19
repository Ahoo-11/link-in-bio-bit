# 🤖 AI Agent Transformation Plan

## Current State
✅ **What We Have:**
- Read-only AI insights system
- Analytics-based recommendations
- OpenRouter API integration (DeepSeek model)
- Daily cached insights in Supabase

❌ **What's Missing:**
- Ability to execute actions
- Conversational interface
- Profile modification capabilities
- Real-time chat interaction

---

## 🎯 Goal: Transform AI into an Autonomous Agent

### **Core Capabilities:**
1. **Conversational Interface** - Chat with AI to discuss profile improvements
2. **Action Execution** - AI can update buttons, social links, bio, style, etc.
3. **Context Awareness** - AI understands current profile state
4. **Multi-turn Conversations** - Chat history and context retention
5. **Proactive Suggestions** - AI suggests improvements based on analytics

---

## 🏗️ Architecture Design

### **1. AI Agent System Components**

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │   Dashboard  │         │  Editor Sidebar │          │
│  │   Chatbot    │────────▶│     Chatbot     │          │
│  │   Widget     │         │     Panel       │          │
│  └──────────────┘         └─────────────────┘          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               FRONTEND API LAYER                         │
│  /api/ai/chat      - Send message, get response         │
│  /api/ai/history   - Get conversation history           │
│  /api/ai/clear     - Clear conversation                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND AI AGENT ENGINE                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │   AI Agent Router (routes/ai-agent.js)         │    │
│  │   • Process user messages                      │    │
│  │   • Maintain conversation context              │    │
│  │   • Call OpenRouter with function calling      │    │
│  │   • Execute approved actions                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │   AI Action Executor (services/ai-actions.js)  │    │
│  │   • Add/update/delete buttons                  │    │
│  │   • Add/update social links                    │    │
│  │   • Update profile info                        │    │
│  │   • Modify styling                             │    │
│  │   • Reorder elements                           │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE                       │
│  • linkinbio_ai_conversations                           │
│  • linkinbio_ai_messages                                │
│  • linkinbio_users (updated by AI)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### **New Tables:**

#### **`linkinbio_ai_conversations`**
```sql
CREATE TABLE linkinbio_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES linkinbio_users(id) ON DELETE CASCADE,
  title TEXT, -- Auto-generated from first message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Conversation metadata
  context JSONB, -- Current profile snapshot
  message_count INTEGER DEFAULT 0
);
```

#### **`linkinbio_ai_messages`**
```sql
CREATE TABLE linkinbio_ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES linkinbio_ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  
  -- Action metadata (for assistant messages)
  actions_executed JSONB, -- Array of actions taken
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_messages_conversation (conversation_id, created_at)
);
```

---

## 🔧 AI Agent Tools (Function Calling)

### **Available Actions:**

```typescript
// 1. Button Management
{
  name: "add_button",
  description: "Add a new button to the profile",
  parameters: {
    type: "tip" | "link",
    title: string,
    url?: string,
    amount?: number,
    bgColor?: string,
    textColor?: string
  }
}

{
  name: "update_button",
  description: "Update an existing button",
  parameters: {
    buttonId: string,
    updates: { title?, url?, amount?, style? }
  }
}

{
  name: "delete_button",
  description: "Remove a button from profile",
  parameters: {
    buttonId: string
  }
}

{
  name: "reorder_buttons",
  description: "Change button order",
  parameters: {
    buttonIds: string[] // New order
  }
}

// 2. Social Links Management
{
  name: "add_social_link",
  description: "Add a social media link",
  parameters: {
    platform: "instagram" | "facebook" | "twitter" | "tiktok" | "linkedin" | "snapchat",
    url: string
  }
}

{
  name: "update_social_link",
  description: "Update a social link",
  parameters: {
    linkId: string,
    platform?: string,
    url?: string,
    visible?: boolean
  }
}

{
  name: "delete_social_link",
  description: "Remove a social link",
  parameters: {
    linkId: string
  }
}

// 3. Profile Info
{
  name: "update_profile",
  description: "Update profile information",
  parameters: {
    displayName?: string,
    bio?: string,
    avatar?: string
  }
}

// 4. Styling
{
  name: "update_style",
  description: "Update profile styling",
  parameters: {
    theme?: "light" | "dark",
    colorScheme?: string,
    background?: string
  }
}

// 5. Analytics Query
{
  name: "get_analytics",
  description: "Fetch analytics data for insights",
  parameters: {
    timeframe?: "7d" | "30d" | "all"
  }
}
```

---

## 💬 Chatbot UI Design

### **Location Options:**

#### **Option 1: Floating Widget (Recommended)**
```
┌────────────────────────────────────┐
│   Dashboard / Editor               │
│                                    │
│   [Content here]                   │
│                                    │
│                           ┌────────┤
│                           │ 🤖 AI  │◄─ Floating button
│                           └────────┘
└────────────────────────────────────┘

When clicked:
┌────────────────────────────────────┐
│   Dashboard / Editor               │
│  ┌─────────────────────────┐      │
│  │ 💬 AI Assistant         │      │
│  │ ─────────────────────── │      │
│  │ [Message history]       │      │
│  │                         │      │
│  │ Bot: How can I help?    │      │
│  │ ─────────────────────── │      │
│  │ [Type a message...]  [→]│      │
│  └─────────────────────────┘      │
└────────────────────────────────────┘
```

#### **Option 2: Editor Sidebar Tab**
```
[ Buttons ]  [ Style ]  [ Social ]  [ 🤖 AI Assistant ]  [ Profile ]
```

#### **Option 3: Dashboard Card**
```
Dashboard:
┌─────────────────────────────────────────────────┐
│ Stats Cards...                                   │
├─────────────────────────────────────────────────┤
│ 🤖 AI Assistant                                 │
│ ─────────────────────────────────────────────── │
│ Chat with AI to optimize your profile...        │
│ [Open Chat] or [Quick Actions ▼]                │
└─────────────────────────────────────────────────┘
```

### **Chatbot Features:**

1. **Message Types:**
   - User messages
   - AI responses
   - System notifications (e.g., "✅ Button added successfully")
   - Action previews (before execution)

2. **Quick Actions:**
   - "Analyze my profile"
   - "Suggest improvements"
   - "Add a tip button"
   - "Update my bio"
   - "Change color scheme"

3. **Action Confirmation:**
   ```
   AI: I can add an Instagram link for you. Should I proceed?
   [✓ Yes, add it] [✗ No, cancel]
   ```

4. **Context Display:**
   ```
   📊 Current Profile:
   • 3 buttons, 2 social links
   • 45 visits this week
   • $12 in tips
   ```

---

## 🔄 Conversation Flow Examples

### **Example 1: Adding a Button**

```
User: Add a tip button for $5

AI: I'll create a tip button for you!

Action Preview:
• Title: "Support me - $5"
• Amount: $5
• Type: Tip
• Color: Purple

Should I add this button?
[✓ Add Button] [✗ Cancel]

[User clicks Add Button]

System: ✅ Tip button added successfully!

AI: Done! Your new tip button is live. Want me to analyze 
    which position works best based on your analytics?
```

### **Example 2: Profile Optimization**

```
User: How can I improve my profile?

AI: Let me analyze your current setup...

📊 Analysis:
• You have 3 buttons but no social links
• Your bio is empty
• Conversion rate: 8% (below average)

💡 Recommendations:
1. Add social links (Instagram, Twitter)
2. Write a compelling bio
3. Move your tip button to the top

Which would you like me to help with first?
[+ Add Social] [✏️ Update Bio] [↕️ Reorder Buttons]
```

### **Example 3: Style Change**

```
User: Make my profile dark themed

AI: I'll switch your profile to dark theme.

Changes:
• Theme: Light → Dark
• Background: #ffffff → #1a1a1a
• Text colors will auto-adjust

[✓ Apply Changes] [✗ Keep Current]

[User approves]

System: ✅ Theme updated to dark mode!

AI: Your profile now has a sleek dark theme! 
    Want to customize the accent colors too?
```

---

## 🚀 Implementation Phases

### **Phase 1: Backend Foundation (Week 1)**
- [x] Create database tables for conversations and messages
- [ ] Build AI agent router with function calling
- [ ] Implement action executor service
- [ ] Create chat API endpoints

### **Phase 2: AI Integration (Week 2)**
- [ ] Configure OpenRouter with function calling
- [ ] Build system prompt for AI agent
- [ ] Implement tool definitions
- [ ] Add action validation and safety checks

### **Phase 3: Frontend UI (Week 3)**
- [ ] Build chatbot component
- [ ] Implement message rendering
- [ ] Add action preview and confirmation
- [ ] Create floating widget or sidebar integration

### **Phase 4: Testing & Polish (Week 4)**
- [ ] Test all AI actions
- [ ] Add error handling
- [ ] Implement rate limiting
- [ ] Add conversation history management
- [ ] UI/UX improvements

---

## 🔒 Safety & Validation

### **Action Validation Rules:**

1. **Button Limits:**
   - Max 10 buttons per profile
   - Validate URLs before adding
   - Check for duplicate buttons

2. **Content Safety:**
   - Filter inappropriate content
   - Validate URLs for security
   - Limit text lengths (bio: 500 chars)

3. **Rate Limiting:**
   - Max 20 AI messages per hour
   - Max 50 actions per day
   - Prevent spam/abuse

4. **User Confirmation:**
   - Always confirm destructive actions (delete, replace)
   - Show preview before execution
   - Allow undo for recent changes

---

## 📈 Success Metrics

- ✅ AI successfully executes 90%+ of user requests
- ✅ Average conversation leads to 2+ profile improvements
- ✅ Users prefer AI agent over manual editing (survey)
- ✅ Reduced time to optimize profile by 60%
- ✅ Increased user engagement with AI features

---

## 🎯 Quick Start Recommendations

### **Minimal Viable Product (MVP):**

**Week 1 Focus:**
1. Implement basic chat API (send message, get response)
2. Add 3 core actions:
   - Add button
   - Update bio
   - Add social link
3. Simple chatbot UI (floating widget)
4. No conversation history (start simple)

**Week 2 Expansion:**
1. Add conversation history
2. Implement remaining actions
3. Add action previews and confirmations
4. Improve UI/UX

---

## 💡 Future Enhancements

- **Voice Input:** "Hey AI, add my Instagram link"
- **Scheduled Actions:** "Update my tip amount every Monday"
- **A/B Testing:** "Test 2 button variations and tell me which performs better"
- **Automated Optimization:** "Auto-optimize my profile based on analytics"
- **Multi-language Support:** Chat in any language
- **Smart Suggestions:** Proactive tips based on similar successful profiles

---

## 🎨 UI/UX Mockups

### Chatbot Widget States:

```
1. Closed (Small):
   ┌────────┐
   │ 🤖 AI  │  ← Pulsing when new suggestion available
   └────────┘

2. Open (Minimized):
   ┌─────────────────────┐
   │ 💬 AI Assistant  [−]│
   │ ─────────────────── │
   │ [Last message...]    │
   │ [Type message...] [→]│
   └─────────────────────┘

3. Open (Full):
   ┌─────────────────────┐
   │ 💬 AI Assistant  [−]│
   │ ─────────────────── │
   │ [Message 1]          │
   │ [Message 2]          │
   │ [Message 3]          │
   │ ...                  │
   │ [Type message...] [→]│
   └─────────────────────┘
```

---

## 🔗 Integration Points

### **Where to Add Chatbot:**

1. ✅ **Dashboard** - Main location for AI assistance
2. ✅ **Editor** - Contextual help while editing
3. ❌ **Public Profile** - Not needed (user-facing only)
4. ⚠️ **Analytics Page** - Optional, for data queries

### **Recommended Primary Location:**
**Dashboard** with floating widget that persists across pages

---

This plan provides a comprehensive roadmap for transforming your AI from a read-only analytics tool into a fully autonomous agent capable of managing link-in-bio profiles through conversational interaction!
