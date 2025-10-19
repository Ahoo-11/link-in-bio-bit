const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Middleware to capture visitor context
 * Attaches visitor data to req.visitorContext for adaptive content
 */
function captureVisitorContext(req, res, next) {
  try {
    // Extract IP address
    const ip = 
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      '127.0.0.1';
    
    // Remove IPv6 prefix if present
    const cleanIp = ip.replace('::ffff:', '');
    
    // Get geolocation from IP
    const geo = geoip.lookup(cleanIp) || {};
    
    // Parse user agent
    const uaParser = new UAParser(req.headers['user-agent']);
    const ua = uaParser.getResult();
    
    // Extract referrer info
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';
    let referrerDomain = '';
    
    if (referrer) {
      try {
        referrerDomain = new URL(referrer).hostname;
      } catch (e) {
        referrerDomain = '';
      }
    }
    
    // Extract UTM parameters
    const utmParams = {
      utm_source: req.query.utm_source || null,
      utm_medium: req.query.utm_medium || null,
      utm_campaign: req.query.utm_campaign || null,
      utm_term: req.query.utm_term || null,
      utm_content: req.query.utm_content || null,
    };
    
    // Build visitor context object
    req.visitorContext = {
      // Geographic data
      ip_address: cleanIp,
      country_code: geo.country || null,
      country_name: getCountryName(geo.country) || null,
      city: geo.city || null,
      region: geo.region || null,
      timezone: geo.timezone || null,
      latitude: geo.ll?.[0] || null,
      longitude: geo.ll?.[1] || null,
      
      // Device & browser info
      device_type: getDeviceType(ua),
      browser: ua.browser.name || null,
      browser_version: ua.browser.version || null,
      os: ua.os.name || null,
      os_version: ua.os.version || null,
      user_agent: req.headers['user-agent'] || null,
      
      // Referral tracking
      referrer: referrer,
      referrer_domain: referrerDomain,
      
      // UTM parameters
      ...utmParams,
    };
    
    next();
  } catch (error) {
    console.error('Error capturing visitor context:', error);
    // Continue without context rather than breaking the request
    req.visitorContext = {
      ip_address: null,
      country_code: null,
      device_type: 'desktop',
      browser: null,
      os: null,
    };
    next();
  }
}

/**
 * Determine device type from user agent
 */
function getDeviceType(ua) {
  if (!ua || !ua.device) return 'desktop';
  
  const deviceType = ua.device.type;
  if (deviceType === 'mobile') return 'mobile';
  if (deviceType === 'tablet') return 'tablet';
  return 'desktop';
}

/**
 * Get full country name from code
 * Can be expanded with a full country code mapping
 */
function getCountryName(code) {
  if (!code) return null;
  
  const countries = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'IN': 'India',
    'CN': 'China',
    'JP': 'Japan',
    'KR': 'South Korea',
    'RU': 'Russia',
    'PK': 'Pakistan',
    'NG': 'Nigeria',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'AR': 'Argentina',
    'CO': 'Colombia',
    'PL': 'Poland',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'BE': 'Belgium',
    'AT': 'Austria',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PT': 'Portugal',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'HK': 'Hong Kong',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'IL': 'Israel',
    'TR': 'Turkey',
    'GR': 'Greece',
    'CZ': 'Czech Republic',
    'RO': 'Romania',
    'HU': 'Hungary',
  };
  
  return countries[code] || code;
}

module.exports = { captureVisitorContext };
