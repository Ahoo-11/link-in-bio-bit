const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

// OpenRouter AI configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Generate AI insights based on user analytics
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    // Check if we have valid insights from today
    const { data: existingInsights } = await supabase
      .from('linkinbio_ai_insights')
      .select('*')
      .eq('user_id', req.userId)
      .gt('valid_until', new Date().toISOString())
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    // If we have valid insights, return them
    if (existingInsights) {
      return res.json({
        insights: existingInsights.insights,
        score: existingInsights.score,
        recommendations: existingInsights.recommendations || [],
        generatedAt: existingInsights.generated_at,
        cached: true
      });
    }

    // No valid insights, generate new ones
    if (!OPENROUTER_API_KEY) {
      return res.json({
        insights: [
          "🎯 AI insights are disabled. Add your OpenRouter API key to enable smart recommendations.",
          "📊 Your analytics are being tracked successfully!",
          "💡 Tip: More data = better insights. Keep sharing your profile!"
        ],
        score: null,
        recommendations: []
      });
    }

    // Get user data
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('username, display_name, buttons')
      .eq('id', req.userId)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get analytics data for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: analyticsEvents } = await supabase
      .from('linkinbio_analytics')
      .select('*')
      .eq('username', user.username)
      .gte('timestamp', thirtyDaysAgo);

    // Get tips data
    const { data: tips } = await supabase
      .from('linkinbio_tips')
      .select('*')
      .eq('creator_username', user.username)
      .eq('status', 'confirmed');

    // Calculate metrics
    const visits = (analyticsEvents || []).filter(e => e.event_type === 'visit').length;
    const clicks = (analyticsEvents || []).filter(e => e.event_type === 'click').length;
    const totalEarnings = (tips || []).reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
    const conversionRate = visits > 0 ? ((clicks / visits) * 100).toFixed(2) : 0;

    // Get button click breakdown
    const buttonClicks = {};
    (analyticsEvents || []).filter(e => e.event_type === 'click').forEach(event => {
      buttonClicks[event.button_id] = (buttonClicks[event.button_id] || 0) + 1;
    });

    // Prepare data for AI
    const analyticsData = {
      profile: {
        username: user.username,
        displayName: user.display_name,
        totalButtons: user.buttons?.length || 0,
        visibleButtons: user.buttons?.filter(b => b.visible)?.length || 0
      },
      metrics: {
        visits,
        clicks,
        conversionRate: parseFloat(conversionRate),
        totalEarnings,
        tipCount: tips?.length || 0
      },
      buttonPerformance: Object.entries(buttonClicks)
        .map(([id, clicks]) => {
          const button = user.buttons?.find(b => b.id === id);
          return { 
            title: button?.title || id, 
            type: button?.type || 'unknown',
            clicks 
          };
        })
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
      timeframe: "Last 30 days"
    };

    // Call OpenRouter AI
    const aiResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'LinkChain Analytics'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert analytics advisor for LinkChain, a link-in-bio platform built on Stacks blockchain. Analyze creator analytics and provide actionable insights to help them maximize engagement and earnings.

Your response MUST be a valid JSON object with this exact structure:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "score": 75,
  "recommendations": [
    {"action": "action text", "impact": "high|medium|low", "reason": "why this helps"}
  ]
}

Guidelines:
- Provide 3-5 specific insights based on the data
- Score is 0-100 (profile optimization score)
- Give 2-4 actionable recommendations
- Be specific and data-driven
- Focus on increasing conversions and earnings
- Consider button placement, timing, and messaging`
          },
          {
            role: 'user',
            content: `Analyze this creator's profile and provide insights:\n\n${JSON.stringify(analyticsData, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response (remove markdown if present)
    let parsedResponse;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      parsedResponse = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);
    } catch (parseError) {
      // Fallback if AI doesn't return valid JSON
      parsedResponse = {
        insights: [
          `Based on ${visits} visits and ${clicks} clicks, your conversion rate is ${conversionRate}%`,
          tips?.length > 0 
            ? `You've earned ${totalEarnings.toFixed(2)} STX from ${tips.length} tips!`
            : "Add tip buttons to start earning from your supporters",
          "Keep sharing your profile to get more actionable insights"
        ],
        score: conversionRate > 10 ? 75 : 50,
        recommendations: [
          {
            action: "Optimize your most clicked button",
            impact: "high",
            reason: "Focus on what's already working"
          }
        ]
      };
    }

    // Save insights to Supabase (valid for 24 hours)
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 24);

    const { data: savedInsight, error: saveError } = await supabase
      .from('linkinbio_ai_insights')
      .insert({
        user_id: req.userId,
        insights: parsedResponse.insights,
        score: parsedResponse.score,
        recommendations: parsedResponse.recommendations || [],
        valid_until: validUntil.toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving AI insights:', saveError);
    }

    res.json({
      ...parsedResponse,
      generatedAt: savedInsight?.generated_at || new Date().toISOString(),
      cached: false
    });

  } catch (error) {
    console.error('AI insights error:', error);
    
    // Fallback response on error
    res.json({
      insights: [
        "📊 Analytics are being tracked successfully",
        "💡 Keep sharing your profile to unlock AI insights",
        "🚀 More data will enable personalized recommendations"
      ],
      score: null,
      recommendations: []
    });
  }
});

module.exports = router;
