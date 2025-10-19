/**
 * YouTube Integration Connector
 * Uses public RSS feeds - NO OAUTH NEEDED!
 */
class YouTubeConnector {
  constructor() {
    // YouTube RSS feed endpoint
    this.rssUrl = 'https://www.youtube.com/feeds/videos.xml';
  }
  
  /**
   * Extract channel ID from various YouTube URL formats
   * @param {string} input - Channel URL or ID
   * @returns {string} Channel ID
   */
  extractChannelId(input) {
    if (!input) throw new Error('Channel URL or ID required');
    
    // Already a channel ID (starts with UC)
    if (input.startsWith('UC') && input.length === 24) {
      return input;
    }
    
    // Extract from URL patterns
    const patterns = [
      /youtube\.com\/channel\/(UC[\w-]{22})/,
      /youtube\.com\/c\/([\w-]+)/,
      /youtube\.com\/@([\w-]+)/,
      /youtube\.com\/user\/([\w-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        // For /c/, /@, /user/, we'll need to resolve to channel ID
        // For now, return the matched part
        return match[1];
      }
    }
    
    // Assume it's a username or custom URL
    return input;
  }
  
  /**
   * Parse YouTube RSS feed XML
   * @param {string} xml - RSS XML
   * @returns {array} Parsed videos
   */
  parseRSS(xml) {
    const videos = [];
    
    // Simple regex parsing (we could use xml2js but keeping it simple)
    const entryRegex = /<entry>(.*?)<\/entry>/gs;
    const entries = xml.match(entryRegex) || [];
    
    for (const entry of entries) {
      const videoId = this.extractTag(entry, 'yt:videoId');
      const title = this.extractTag(entry, 'title');
      const published = this.extractTag(entry, 'published');
      const thumbnail = entry.match(/<media:thumbnail url="([^"]+)"/)?.[1];
      const description = this.extractTag(entry, 'media:description');
      const author = this.extractTag(entry, 'name');
      
      if (videoId) {
        videos.push({
          id: videoId,
          title: title || 'Untitled',
          description: description || '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          published: published,
          author: author,
        });
      }
    }
    
    return videos;
  }
  
  /**
   * Extract text from XML tag
   * @param {string} xml - XML string
   * @param {string} tag - Tag name
   * @returns {string} Tag content
   */
  extractTag(xml, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }
  
  /**
   * Fetch videos from a YouTube channel
   * @param {string} channelId - YouTube channel ID
   * @param {number} limit - Max videos to fetch
   * @returns {Promise<array>} Videos
   */
  async getChannelVideos(channelId, limit = 15) {
    try {
      const url = `${this.rssUrl}?channel_id=${channelId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch YouTube feed: ${response.statusText}`);
      }
      
      const xml = await response.text();
      const videos = this.parseRSS(xml);
      
      return videos.slice(0, limit);
    } catch (error) {
      console.error('YouTube fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Get channel info from RSS feed
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<object>} Channel info
   */
  async getChannelInfo(channelId) {
    try {
      const url = `${this.rssUrl}?channel_id=${channelId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Channel not found or invalid');
      }
      
      const xml = await response.text();
      
      // Extract channel info from RSS
      const channelTitle = this.extractTag(xml, 'title');
      const channelLink = this.extractTag(xml, 'link');
      
      return {
        id: channelId,
        title: channelTitle || 'Unknown Channel',
        url: channelLink || `https://www.youtube.com/channel/${channelId}`,
      };
    } catch (error) {
      throw new Error('Invalid YouTube channel');
    }
  }
  
  /**
   * Sync YouTube content to content items
   * @param {string} channelId - YouTube channel ID
   * @param {string} userId - User ID
   * @param {string} integrationId - Integration ID
   * @returns {Promise<array>} Content items
   */
  async syncContent(channelId, userId, integrationId) {
    try {
      const videos = await this.getChannelVideos(channelId, 10);
      const contentItems = [];
      
      for (const video of videos) {
        contentItems.push({
          user_id: userId,
          integration_id: integrationId,
          type: 'video',
          source: 'youtube',
          external_id: video.id,
          title: video.title,
          description: video.description?.slice(0, 200) || '',
          url: video.url,
          image_url: video.thumbnail,
          thumbnail_url: video.thumbnail,
          metadata: {
            author: video.author,
            platform: 'youtube',
          },
          auto_generated: true,
          external_created_at: video.published,
        });
      }
      
      return contentItems;
    } catch (error) {
      console.error('YouTube sync error:', error);
      throw error;
    }
  }
  
  /**
   * Test if channel exists and is accessible
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<boolean>} Valid channel
   */
  async testConnection(channelId) {
    try {
      await this.getChannelInfo(channelId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new YouTubeConnector();
