const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');
const AIActionExecutor = require('../services/ai-actions');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// AI function definitions (tools the AI can use)
const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'add_button',
      description: 'Add a new button to the user profile (tip button or custom link)',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['tip', 'link'],
            description: 'Type of button',
          },
          title: {
            type: 'string',
            description: 'Button title/text',
          },
          url: {
            type: 'string',
            description: 'URL for link buttons',
          },
          amount: {
            type: 'number',
            description: 'Tip amount in USD for tip buttons',
          },
          bgColor: {
            type: 'string',
            description: 'Background color (hex code)',
          },
          textColor: {
            type: 'string',
            description: 'Text color (hex code)',
          },
        },
        required: ['type', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_button',
      description: 'Update an existing button',
      parameters: {
        type: 'object',
        properties: {
          buttonId: {
            type: 'string',
            description: 'ID of the button to update',
          },
          updates: {
            type: 'object',
            description: 'Fields to update (title, url, amount, style)',
          },
        },
        required: ['buttonId', 'updates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_button',
      description: 'Delete a button from the profile',
      parameters: {
        type: 'object',
        properties: {
          buttonId: {
            type: 'string',
            description: 'ID of the button to delete',
          },
        },
        required: ['buttonId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_social_link',
      description: 'Add a social media link to the profile',
      parameters: {
        type: 'object',
        properties: {
          platform: {
            type: 'string',
            enum: ['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin', 'snapchat'],
            description: 'Social media platform',
          },
          url: {
            type: 'string',
            description: 'Full URL to the social profile',
          },
        },
        required: ['platform', 'url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_social_link',
      description: 'Update a social media link',
      parameters: {
        type: 'object',
        properties: {
          linkId: {
            type: 'string',
            description: 'ID of the social link to update',
          },
          platform: { type: 'string' },
          url: { type: 'string' },
          visible: { type: 'boolean' },
        },
        required: ['linkId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_social_link',
      description: 'Delete a social media link',
      parameters: {
        type: 'object',
        properties: {
          linkId: {
            type: 'string',
            description: 'ID of the social link to delete',
          },
        },
        required: ['linkId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_profile',
      description: 'Update profile information (bio, display name, avatar)',
      parameters: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            description: 'User display name',
          },
          bio: {
            type: 'string',
            description: 'User bio (max 500 characters)',
          },
          avatar: {
            type: 'string',
            description: 'Avatar image URL',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_style',
      description: 'Update profile styling and theme',
      parameters: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            enum: ['light', 'dark'],
            description: 'Color theme',
          },
          colorScheme: {
            type: 'string',
            description: 'Color scheme name',
          },
          background: {
            type: 'string',
            description: 'Background color (hex code)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_analytics',
      description: 'Get analytics data for the profile',
      parameters: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            enum: ['7d', '30d', 'all'],
            description: 'Time period for analytics',
          },
        },
      },
    },
  },
];

// System prompt for AI agent
const SYSTEM_PROMPT = `You are an intelligent AI assistant for LinkChain, a link-in-bio platform built on Stacks blockchain. Your role is to help users optimize and manage their profiles through natural conversation.

**Your Capabilities:**
- Add, update, delete, and reorder buttons (tip buttons and custom links)
- Manage social media links (Instagram, Facebook, Twitter, TikTok, LinkedIn, Snapchat)
- Update profile information (bio, display name, avatar)
- Modify styling and themes
- Analyze analytics and provide insights
- Give optimization recommendations

**Personality:**
- Be friendly, helpful, and proactive
- Provide clear confirmations after actions
- Suggest improvements based on best practices
- Keep responses concise but informative
- Use emojis appropriately for better UX

**Important Rules:**
1. Always confirm destructive actions (delete, replace)
2. Provide previews before executing significant changes
3. Be proactive in suggesting optimizations
4. Reference user's current profile state when relevant
5. Celebrate user successes (earnings, engagement)

When users ask you to perform actions, use your available functions. When providing information or advice, respond conversationally without using functions.`;

/**
 * Send a message to the AI agent
 * POST /api/ai-agent/chat
 */
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!OPENROUTER_API_KEY) {
      return res.json({
        response: '🤖 AI agent is currently disabled. Please add your OpenRouter API key to enable me!',
        conversationId: null,
      });
    }

    // Get or create conversation
    let activeConversationId = conversationId;
    
    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('linkinbio_ai_conversations')
        .insert({
          user_id: req.userId,
          title: 'New Conversation',
        })
        .select()
        .single();

      if (convError) throw convError;
      activeConversationId = newConv.id;
    }

    // Save user message
    await supabase
      .from('linkinbio_ai_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: message,
      });

    // Get conversation history (last 20 messages for context)
    const { data: history } = await supabase
      .from('linkinbio_ai_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Get current profile state for context
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('username, display_name, bio, buttons, style')
      .eq('id', req.userId)
      .single();

    const profileContext = {
      username: user.username,
      displayName: user.display_name,
      bio: user.bio || '(empty)',
      totalButtons: user.buttons?.length || 0,
      visibleButtons: user.buttons?.filter(b => b.visible)?.length || 0,
      buttons: user.buttons?.map(b => ({
        id: b.id,
        type: b.type,
        title: b.title,
        visible: b.visible,
      })) || [],
      socialLinks: user.buttons?.filter(b => b.type === 'social').map(b => ({
        id: b.id,
        platform: b.platform,
      })) || [],
      theme: user.style?.theme || 'light',
    };

    // Build messages for OpenRouter
    const messages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\n**Current Profile State:**\n${JSON.stringify(profileContext, null, 2)}`,
      },
      ...history.map(h => ({ role: h.role, content: h.content })),
    ];

    // Call OpenRouter with function calling
    const aiResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'LinkChain AI Agent',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages,
        tools: AI_TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices[0];

    let responseContent = choice.message.content || '';
    let actionsExecuted = [];

    // Handle function calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const executor = new AIActionExecutor(req.userId);

      for (const toolCall of choice.message.tool_calls) {
        const functionName = toolCall.function.name;
        const parameters = JSON.parse(toolCall.function.arguments);

        try {
          const result = await executor.executeAction(functionName, parameters);
          actionsExecuted.push({
            function: functionName,
            params: parameters,
            result: result.message,
          });

          // Add result to response
          responseContent += `\n\n${result.message}`;
        } catch (error) {
          actionsExecuted.push({
            function: functionName,
            params: parameters,
            error: error.message,
          });
          responseContent += `\n\n❌ Error: ${error.message}`;
        }
      }
    }

    // Save assistant response
    await supabase
      .from('linkinbio_ai_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: responseContent,
        actions_executed: actionsExecuted.length > 0 ? actionsExecuted : null,
      });

    res.json({
      response: responseContent,
      conversationId: activeConversationId,
      actionsExecuted,
    });

  } catch (error) {
    console.error('AI agent chat error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message,
    });
  }
});

/**
 * Get conversation history
 * GET /api/ai-agent/history/:conversationId
 */
router.get('/history/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data: messages, error } = await supabase
      .from('linkinbio_ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ messages });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

/**
 * Get user's conversations
 * GET /api/ai-agent/conversations
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('linkinbio_ai_conversations')
      .select('id, title, message_count, created_at, updated_at')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

/**
 * Clear/delete a conversation
 * DELETE /api/ai-agent/conversations/:conversationId
 */
router.delete('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { error } = await supabase
      .from('linkinbio_ai_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', req.userId);

    if (error) throw error;

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;
