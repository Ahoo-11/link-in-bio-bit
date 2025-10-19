const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const oauthService = require('../services/oauth-service');
const integrationManager = require('../services/integration-manager');
const spotifyConnector = require('../services/integrations/spotify-connector');

/**
 * Get all integrations for authenticated user
 * GET /api/integrations
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const integrations = await integrationManager.getUserIntegrations(req.userId);
    
    // Remove sensitive data before sending to client
    const safeIntegrations = integrations.map(integration => ({
      id: integration.id,
      service: integration.service,
      service_user_id: integration.service_user_id,
      service_username: integration.service_username,
      metadata: integration.metadata,
      auto_sync: integration.auto_sync,
      sync_frequency: integration.sync_frequency,
      last_sync_at: integration.last_sync_at,
      sync_status: integration.sync_status,
      sync_error: integration.sync_error,
      created_at: integration.created_at,
    }));
    
    res.json({ integrations: safeIntegrations });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to get integrations' });
  }
});

/**
 * Start OAuth flow
 * GET /api/integrations/connect/:service
 */
router.get('/connect/:service', authenticateToken, async (req, res) => {
  try {
    const { service } = req.params;
    
    // Generate state token
    const state = oauthService.generateState(req.userId, service);
    
    // Get authorization URL
    const authUrl = oauthService.getAuthorizationUrl(service, state);
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Connect integration error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * OAuth callback handler for Spotify
 * GET /api/integrations/callback/spotify
 */
router.get('/callback/spotify', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?error=${error}`);
    }
    
    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?error=missing_params`);
    }
    
    // Verify state
    const stateData = oauthService.verifyState(state);
    
    // Exchange code for token
    const tokenData = await oauthService.exchangeCodeForToken('spotify', code);
    
    // Get Spotify user profile
    const profile = await spotifyConnector.getUserProfile(tokenData.access_token);
    
    // Save integration
    await integrationManager.saveIntegration(
      stateData.userId,
      'spotify',
      tokenData,
      {
        artist_id: profile.id,
        artist_name: profile.display_name,
        email: profile.email,
        profile_url: profile.external_urls.spotify,
      }
    );
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?success=spotify`);
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?error=auth_failed`);
  }
});

/**
 * Manually sync an integration
 * POST /api/integrations/:id/sync
 */
router.post('/:id/sync', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await integrationManager.syncIntegration(id, req.userId);
    
    res.json(result);
  } catch (error) {
    console.error('Sync integration error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Sync all integrations
 * POST /api/integrations/sync-all
 */
router.post('/sync-all', authenticateToken, async (req, res) => {
  try {
    const results = await integrationManager.syncAllIntegrations(req.userId);
    
    res.json({ results });
  } catch (error) {
    console.error('Sync all error:', error);
    res.status(500).json({ error: 'Failed to sync integrations' });
  }
});

/**
 * Delete an integration
 * DELETE /api/integrations/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await integrationManager.deleteIntegration(id, req.userId);
    
    res.json({ success: true, message: 'Integration deleted' });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

/**
 * Update integration settings
 * PUT /api/integrations/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { auto_sync, sync_frequency } = req.body;
    
    const supabase = require('../db');
    
    const updates = {};
    if (auto_sync !== undefined) updates.auto_sync = auto_sync;
    if (sync_frequency !== undefined) updates.sync_frequency = sync_frequency;
    
    const { data, error } = await supabase
      .from('linkinbio_integrations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, integration: data });
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

/**
 * Get synced content from integrations
 * GET /api/integrations/content
 */
router.get('/content', authenticateToken, async (req, res) => {
  try {
    const supabase = require('../db');
    
    const { data: contentItems, error } = await supabase
      .from('linkinbio_content_items')
      .select(`
        *,
        integration:linkinbio_integrations(service, service_username)
      `)
      .eq('user_id', req.userId)
      .eq('auto_generated', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ content: contentItems });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
});

/**
 * Add manual integration (YouTube, etc.)
 * POST /api/integrations/manual
 */
router.post('/manual', authenticateToken, async (req, res) => {
  try {
    const { service, config } = req.body;
    
    if (!service || !config) {
      return res.status(400).json({ error: 'Service and config required' });
    }
    
    const integration = await integrationManager.addManualIntegration(
      req.userId,
      service,
      config
    );
    
    // Auto-sync after adding
    try {
      await integrationManager.syncIntegration(integration.id, req.userId);
    } catch (syncError) {
      console.error('Initial sync failed:', syncError);
    }
    
    res.json({ success: true, integration });
  } catch (error) {
    console.error('Add manual integration error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
