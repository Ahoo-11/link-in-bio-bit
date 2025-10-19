const crypto = require('crypto');

/**
 * OAuth Service
 * Handles OAuth flows and token encryption
 */
class OAuthService {
  constructor() {
    // Get encryption key from environment
    this.encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY || this.generateKey();
    
    if (!process.env.INTEGRATION_ENCRYPTION_KEY) {
      console.warn('⚠️  INTEGRATION_ENCRYPTION_KEY not set. Using temporary key. Set this in production!');
    }
  }
  
  /**
   * Generate a random encryption key
   */
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Encrypt sensitive data (access tokens, etc.)
   * @param {string} text - Text to encrypt
   * @returns {string} Encrypted text
   */
  encrypt(text) {
    if (!text) return null;
    
    try {
      const algorithm = 'aes-256-cbc';
      const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex');
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return IV + encrypted data
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * Decrypt sensitive data
   * @param {string} encryptedText - Encrypted text
   * @returns {string} Decrypted text
   */
  decrypt(encryptedText) {
    if (!encryptedText) return null;
    
    try {
      const algorithm = 'aes-256-cbc';
      const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex');
      
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
  
  /**
   * Generate state for OAuth to prevent CSRF
   * @param {string} userId - User ID
   * @param {string} service - Service name
   * @returns {string} State token
   */
  generateState(userId, service) {
    const payload = {
      userId,
      service,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex'),
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
  
  /**
   * Verify state token
   * @param {string} state - State token
   * @returns {object} Decoded state
   */
  verifyState(state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      
      // Check if token is expired (10 minutes)
      const maxAge = 10 * 60 * 1000;
      if (Date.now() - decoded.timestamp > maxAge) {
        throw new Error('State token expired');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid state token');
    }
  }
  
  /**
   * Build authorization URL for OAuth flow
   * @param {string} service - Service name
   * @param {string} state - State token
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(service, state) {
    const configs = {
      spotify: {
        authEndpoint: 'https://accounts.spotify.com/authorize',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        redirectUri: `${process.env.APP_URL}/api/integrations/callback/spotify`,
        scope: 'user-read-email user-read-private user-top-read',
      },
      shopify: {
        // Shopify uses shop-specific URLs, handled separately
        authEndpoint: null,
      },
      calendly: {
        authEndpoint: 'https://auth.calendly.com/oauth/authorize',
        clientId: process.env.CALENDLY_CLIENT_ID,
        redirectUri: `${process.env.APP_URL}/api/integrations/callback/calendly`,
        scope: 'default',
      },
      youtube: {
        authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.GOOGLE_CLIENT_ID,
        redirectUri: `${process.env.APP_URL}/api/integrations/callback/youtube`,
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
      },
    };
    
    const config = configs[service];
    if (!config || !config.authEndpoint) {
      throw new Error(`Unsupported service: ${service}`);
    }
    
    if (!config.clientId) {
      throw new Error(`${service.toUpperCase()}_CLIENT_ID not configured`);
    }
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state: state,
    });
    
    return `${config.authEndpoint}?${params.toString()}`;
  }
  
  /**
   * Exchange authorization code for access token
   * @param {string} service - Service name
   * @param {string} code - Authorization code
   * @returns {Promise<object>} Token data
   */
  async exchangeCodeForToken(service, code) {
    const configs = {
      spotify: {
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: `${process.env.APP_URL}/api/integrations/callback/spotify`,
      },
      calendly: {
        tokenEndpoint: 'https://auth.calendly.com/oauth/token',
        clientId: process.env.CALENDLY_CLIENT_ID,
        clientSecret: process.env.CALENDLY_CLIENT_SECRET,
        redirectUri: `${process.env.APP_URL}/api/integrations/callback/calendly`,
      },
      youtube: {
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${process.env.APP_URL}/api/integrations/callback/youtube`,
      },
    };
    
    const config = configs[service];
    if (!config) {
      throw new Error(`Unsupported service: ${service}`);
    }
    
    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.redirectUri,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }
    
    return await response.json();
  }
  
  /**
   * Refresh an expired access token
   * @param {string} service - Service name
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<object>} New token data
   */
  async refreshAccessToken(service, refreshToken) {
    const configs = {
      spotify: {
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      },
      calendly: {
        tokenEndpoint: 'https://auth.calendly.com/oauth/token',
        clientId: process.env.CALENDLY_CLIENT_ID,
        clientSecret: process.env.CALENDLY_CLIENT_SECRET,
      },
      youtube: {
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    };
    
    const config = configs[service];
    if (!config) {
      throw new Error(`Unsupported service: ${service}`);
    }
    
    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }
    
    return await response.json();
  }
}

module.exports = new OAuthService();
