const oauthService = require('../oauth-service');

/**
 * Spotify Integration Connector
 * Fetches artist data, top tracks, albums, playlists
 */
class SpotifyConnector {
  constructor() {
    this.baseUrl = 'https://api.spotify.com/v1';
  }
  
  /**
   * Get user's Spotify profile
   * @param {string} accessToken - Access token
   * @returns {Promise<object>} User profile
   */
  async getUserProfile(accessToken) {
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Spotify profile');
    }
    
    return await response.json();
  }
  
  /**
   * Get user's top tracks
   * @param {string} accessToken - Access token
   * @param {number} limit - Number of tracks (default 10)
   * @returns {Promise<array>} Top tracks
   */
  async getTopTracks(accessToken, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/me/top/tracks?limit=${limit}&time_range=short_term`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch top tracks');
    }
    
    const data = await response.json();
    return data.items;
  }
  
  /**
   * Get user's playlists
   * @param {string} accessToken - Access token
   * @param {number} limit - Number of playlists (default 10)
   * @returns {Promise<array>} Playlists
   */
  async getUserPlaylists(accessToken, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/me/playlists?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    const data = await response.json();
    return data.items;
  }
  
  /**
   * Sync Spotify data to content items
   * @param {string} accessToken - Access token
   * @param {string} userId - User ID
   * @param {string} integrationId - Integration ID
   * @returns {Promise<array>} Content items to sync
   */
  async syncContent(accessToken, userId, integrationId) {
    try {
      const contentItems = [];
      
      // Get top tracks
      const tracks = await this.getTopTracks(accessToken, 10);
      
      for (const track of tracks) {
        contentItems.push({
          user_id: userId,
          integration_id: integrationId,
          type: 'music',
          source: 'spotify',
          external_id: track.id,
          title: track.name,
          description: track.artists.map(a => a.name).join(', '),
          url: track.external_urls.spotify,
          image_url: track.album.images[0]?.url || null,
          thumbnail_url: track.album.images[2]?.url || null,
          metadata: {
            album: track.album.name,
            artists: track.artists.map(a => a.name),
            duration_ms: track.duration_ms,
            preview_url: track.preview_url,
            popularity: track.popularity,
          },
          auto_generated: true,
          external_created_at: track.album.release_date,
        });
      }
      
      // Get playlists
      const playlists = await this.getUserPlaylists(accessToken, 5);
      
      for (const playlist of playlists) {
        contentItems.push({
          user_id: userId,
          integration_id: integrationId,
          type: 'music',
          source: 'spotify',
          external_id: playlist.id,
          title: playlist.name,
          description: playlist.description || `${playlist.tracks.total} tracks`,
          url: playlist.external_urls.spotify,
          image_url: playlist.images[0]?.url || null,
          thumbnail_url: playlist.images[playlist.images.length - 1]?.url || null,
          metadata: {
            track_count: playlist.tracks.total,
            is_public: playlist.public,
            owner: playlist.owner.display_name,
          },
          auto_generated: true,
        });
      }
      
      return contentItems;
    } catch (error) {
      console.error('Spotify sync error:', error);
      throw error;
    }
  }
  
  /**
   * Test connection with access token
   * @param {string} accessToken - Access token
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection(accessToken) {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new SpotifyConnector();
