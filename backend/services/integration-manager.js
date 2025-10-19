const supabase = require('../db');
const oauthService = require('./oauth-service');
const spotifyConnector = require('./integrations/spotify-connector');
const youtubeConnector = require('./integrations/youtube-connector');

/**
 * Integration Manager
 * Manages all external integrations
 */
class IntegrationManager {
  constructor() {
    this.connectors = {
      spotify: spotifyConnector,
      youtube: youtubeConnector,
      // Add more connectors as we build them
    };
  }
  
  /**
   * Get all integrations for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} Integrations
   */
  async getUserIntegrations(userId) {
    const { data, error } = await supabase
      .from('linkinbio_integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Decrypt tokens for internal use (don't send to client!)
    return data.map(integration => ({
      ...integration,
      access_token: integration.access_token ? oauthService.decrypt(integration.access_token) : null,
      refresh_token: integration.refresh_token ? oauthService.decrypt(integration.refresh_token) : null,
    }));
  }
  
  /**
   * Get a specific integration
   * @param {string} integrationId - Integration ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Integration
   */
  async getIntegration(integrationId, userId) {
    const { data, error } = await supabase
      .from('linkinbio_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    // Decrypt tokens
    return {
      ...data,
      access_token: data.access_token ? oauthService.decrypt(data.access_token) : null,
      refresh_token: data.refresh_token ? oauthService.decrypt(data.refresh_token) : null,
    };
  }
  
  /**
   * Create or update an integration
   * @param {string} userId - User ID
   * @param {string} service - Service name
   * @param {object} tokenData - Token data from OAuth
   * @param {object} metadata - Service-specific metadata
   * @returns {Promise<object>} Integration
   */
  async saveIntegration(userId, service, tokenData, metadata = {}) {
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;
    
    // Check if integration exists
    const { data: existing } = await supabase
      .from('linkinbio_integrations')
      .select('id')
      .eq('user_id', userId)
      .eq('service', service)
      .single();
    
    const integrationData = {
      user_id: userId,
      service: service,
      access_token: oauthService.encrypt(tokenData.access_token),
      refresh_token: tokenData.refresh_token ? oauthService.encrypt(tokenData.refresh_token) : null,
      token_expires_at: expiresAt,
      scopes: tokenData.scope ? tokenData.scope.split(' ') : [],
      metadata: metadata,
      sync_status: 'active',
      last_sync_at: new Date().toISOString(),
    };
    
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('linkinbio_integrations')
        .update(integrationData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('linkinbio_integrations')
        .insert(integrationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
  
  /**
   * Delete an integration
   * @param {string} integrationId - Integration ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteIntegration(integrationId, userId) {
    // First delete all content items from this integration
    await supabase
      .from('linkinbio_content_items')
      .delete()
      .eq('integration_id', integrationId)
      .eq('user_id', userId);
    
    // Then delete the integration
    const { error } = await supabase
      .from('linkinbio_integrations')
      .delete()
      .eq('id', integrationId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
  
  /**
   * Sync content from an integration
   * @param {string} integrationId - Integration ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Sync results
   */
  async syncIntegration(integrationId, userId) {
    try {
      const integration = await this.getIntegration(integrationId, userId);
      
      if (!integration) {
        throw new Error('Integration not found');
      }
      
      const connector = this.connectors[integration.service];
      if (!connector) {
        throw new Error(`No connector for ${integration.service}`);
      }
      
      let contentItems;
      
      // Handle OAuth-based integrations
      if (integration.service === 'spotify') {
        // Check if token is expired
        if (integration.token_expires_at) {
          const expiresAt = new Date(integration.token_expires_at);
          if (expiresAt < new Date()) {
            // Token expired, refresh it
            if (integration.refresh_token) {
              const newTokens = await oauthService.refreshAccessToken(
                integration.service,
                integration.refresh_token
              );
              
              await this.saveIntegration(userId, integration.service, newTokens, integration.metadata);
              integration.access_token = newTokens.access_token;
            } else {
              throw new Error('Token expired and no refresh token available');
            }
          }
        }
        
        // Fetch content from service
        contentItems = await connector.syncContent(
          integration.access_token,
          userId,
          integrationId
        );
      } else if (integration.service === 'youtube') {
        // YouTube doesn't need access token, uses channel ID
        const channelId = integration.metadata?.channel_id || integration.service_user_id;
        contentItems = await connector.syncContent(
          channelId,
          userId,
          integrationId
        );
      } else {
        throw new Error(`Sync not implemented for ${integration.service}`);
      }
      
      // Delete old auto-generated content from this integration
      await supabase
        .from('linkinbio_content_items')
        .delete()
        .eq('integration_id', integrationId)
        .eq('auto_generated', true);
      
      // Insert new content
      if (contentItems.length > 0) {
        const { error: insertError } = await supabase
          .from('linkinbio_content_items')
          .insert(contentItems);
        
        if (insertError) throw insertError;
      }
      
      // Update integration sync status
      await supabase
        .from('linkinbio_integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'active',
          sync_error: null,
        })
        .eq('id', integrationId);
      
      return {
        success: true,
        itemsSynced: contentItems.length,
        service: integration.service,
      };
    } catch (error) {
      // Update integration with error
      await supabase
        .from('linkinbio_integrations')
        .update({
          sync_status: 'error',
          sync_error: error.message,
        })
        .eq('id', integrationId);
      
      throw error;
    }
  }
  
  /**
   * Sync all active integrations for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} Sync results
   */
  async syncAllIntegrations(userId) {
    const integrations = await this.getUserIntegrations(userId);
    const results = [];
    
    for (const integration of integrations) {
      if (integration.auto_sync && integration.sync_status === 'active') {
        try {
          const result = await this.syncIntegration(integration.id, userId);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            service: integration.service,
            error: error.message,
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Add manual integration (e.g., YouTube channel)
   * No OAuth required
   * @param {string} userId - User ID
   * @param {string} service - Service name
   * @param {object} config - Integration config
   * @returns {Promise<object>} Integration
   */
  async addManualIntegration(userId, service, config) {
    try {
      const connector = this.connectors[service];
      if (!connector) {
        throw new Error(`Unsupported service: ${service}`);
      }
      
      // For YouTube, config should have channelId
      if (service === 'youtube') {
        const channelId = youtubeConnector.extractChannelId(config.channelId || config.channelUrl);
        
        // Verify channel exists
        const channelInfo = await youtubeConnector.getChannelInfo(channelId);
        
        // Check if integration already exists
        const { data: existing } = await supabase
          .from('linkinbio_integrations')
          .select('id')
          .eq('user_id', userId)
          .eq('service', service)
          .single();
        
        const integrationData = {
          user_id: userId,
          service: service,
          service_user_id: channelId,
          service_username: channelInfo.title,
          metadata: {
            channel_id: channelId,
            channel_title: channelInfo.title,
            channel_url: channelInfo.url,
          },
          sync_status: 'active',
          auto_sync: true,
          sync_frequency: 60, // Every hour
        };
        
        if (existing) {
          // Update existing
          const { data, error } = await supabase
            .from('linkinbio_integrations')
            .update(integrationData)
            .eq('id', existing.id)
            .select()
            .single();
          
          if (error) throw error;
          return data;
        } else {
          // Create new
          const { data, error } = await supabase
            .from('linkinbio_integrations')
            .insert(integrationData)
            .select()
            .single();
          
          if (error) throw error;
          return data;
        }
      }
      
      throw new Error(`Manual integration not supported for ${service}`);
    } catch (error) {
      console.error('Add manual integration error:', error);
      throw error;
    }
  }
}

module.exports = new IntegrationManager();
