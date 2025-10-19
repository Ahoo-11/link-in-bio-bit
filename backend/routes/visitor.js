const express = require('express');
const router = express.Router();
const { captureVisitorContext } = require('../middleware/visitor-context');
const VisitorSessionService = require('../services/visitor-session');
const { authenticateToken } = require('../middleware/auth');

/**
 * Track visitor session
 * POST /api/visitor/track
 * Public endpoint - no auth required
 */
router.post('/track', captureVisitorContext, async (req, res) => {
  try {
    const { username, visitorId, screen } = req.body;
    
    if (!username || !visitorId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['username', 'visitorId']
      });
    }
    
    // Merge screen dimensions with context
    const contextData = {
      ...req.visitorContext,
      screen_width: screen?.width || null,
      screen_height: screen?.height || null,
    };
    
    const result = await VisitorSessionService.trackVisit(
      username,
      visitorId,
      contextData
    );
    
    res.json(result);
  } catch (error) {
    console.error('Track visitor error:', error);
    res.status(500).json({ 
      error: 'Failed to track visitor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Update session data
 * PUT /api/visitor/session/:sessionId
 * Public endpoint - used to update engagement during visit
 */
router.put('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;
    
    // Validate sessionId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }
    
    const session = await VisitorSessionService.updateSession(sessionId, updates);
    res.json({ success: true, session });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ 
      error: 'Failed to update session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Track button click
 * POST /api/visitor/click
 * Public endpoint - tracks engagement
 */
router.post('/click', async (req, res) => {
  try {
    const { sessionId, buttonId } = req.body;
    
    if (!sessionId || !buttonId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['sessionId', 'buttonId']
      });
    }
    
    const result = await VisitorSessionService.trackButtonClick(sessionId, buttonId);
    res.json(result);
  } catch (error) {
    console.error('Track click error:', error);
    // Don't fail the request - tracking is non-critical
    res.json({ success: false, error: 'Failed to track click' });
  }
});

/**
 * Track space view
 * POST /api/visitor/space-view
 * Public endpoint - tracks space engagement
 */
router.post('/space-view', async (req, res) => {
  try {
    const { sessionId, spaceId } = req.body;
    
    if (!sessionId || !spaceId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['sessionId', 'spaceId']
      });
    }
    
    const result = await VisitorSessionService.trackSpaceView(sessionId, spaceId);
    res.json(result);
  } catch (error) {
    console.error('Track space view error:', error);
    res.json({ success: false, error: 'Failed to track space view' });
  }
});

/**
 * End session
 * POST /api/visitor/end-session
 * Public endpoint - finalizes session data
 */
router.post('/end-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const result = await VisitorSessionService.endSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error('End session error:', error);
    res.json({ success: false, error: 'Failed to end session' });
  }
});

/**
 * Get visitor analytics (authenticated)
 * GET /api/visitor/analytics/:username
 * Requires authentication - creator viewing their own analytics
 */
router.get('/analytics/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { timeframe = '7d' } = req.query;
    
    // Verify user owns this profile
    const { data: user, error: userError } = await require('../db')
      .from('linkinbio_users')
      .select('id')
      .eq('username', username)
      .eq('id', req.userId)
      .single();
    
    if (userError || !user) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const analytics = await VisitorSessionService.getVisitorAnalytics(
      username,
      timeframe
    );
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get visitor context for adaptive rules (authenticated)
 * GET /api/visitor/context/:sessionId
 * Used by rules engine to evaluate conditions
 */
router.get('/context/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const context = await VisitorSessionService.getVisitorContext(sessionId);
    res.json({ context });
  } catch (error) {
    console.error('Get context error:', error);
    res.status(500).json({ 
      error: 'Failed to get context',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get visitor sessions for a profile (authenticated)
 * GET /api/visitor/sessions/:username
 * Returns recent visitor sessions for analytics
 */
router.get('/sessions/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify user owns this profile
    const { data: user, error: userError } = await require('../db')
      .from('linkinbio_users')
      .select('id')
      .eq('username', username)
      .eq('id', req.userId)
      .single();
    
    if (userError || !user) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { data: sessions, error } = await require('../db')
      .from('linkinbio_visitor_sessions')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      error: 'Failed to get sessions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
