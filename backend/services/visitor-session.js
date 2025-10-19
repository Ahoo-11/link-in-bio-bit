const supabase = require('../db');

class VisitorSessionService {
  /**
   * Create or update visitor session
   * @param {string} username - Profile being visited
   * @param {string} visitorId - Unique visitor identifier
   * @param {object} contextData - Visitor context from middleware
   * @returns {Promise<object>} Session data
   */
  async trackVisit(username, visitorId, contextData) {
    try {
      // Check if visitor has visited before
      const { data: existingSessions, error: fetchError } = await supabase
        .from('linkinbio_visitor_sessions')
        .select('*')
        .eq('username', username)
        .eq('visitor_id', visitorId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        console.error('Error fetching existing sessions:', fetchError);
      }
      
      const isFirstVisit = !existingSessions || existingSessions.length === 0;
      const visitCount = isFirstVisit ? 1 : (existingSessions[0].visit_count || 0) + 1;
      
      // Create new session record
      const { data: session, error } = await supabase
        .from('linkinbio_visitor_sessions')
        .insert({
          visitor_id: visitorId,
          username: username,
          ...contextData,
          is_first_visit: isFirstVisit,
          visit_count: visitCount,
          session_start: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }
      
      return {
        success: true,
        session,
        isFirstVisit,
        visitCount,
      };
    } catch (error) {
      console.error('Error tracking visit:', error);
      throw error;
    }
  }
  
  /**
   * Update session with engagement data
   * @param {string} sessionId - Session UUID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated session
   */
  async updateSession(sessionId, updates) {
    try {
      const { data, error } = await supabase
        .from('linkinbio_visitor_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }
  
  /**
   * Track button click
   * @param {string} sessionId - Session UUID
   * @param {string} buttonId - Button ID that was clicked
   */
  async trackButtonClick(sessionId, buttonId) {
    try {
      const { data: session } = await supabase
        .from('linkinbio_visitor_sessions')
        .select('clicked_buttons')
        .eq('id', sessionId)
        .single();
      
      const clickedButtons = session?.clicked_buttons || [];
      clickedButtons.push(buttonId);
      
      await this.updateSession(sessionId, {
        clicked_buttons: clickedButtons,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking button click:', error);
      // Don't throw - tracking errors shouldn't break user experience
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Track space view
   * @param {string} sessionId - Session UUID
   * @param {string} spaceId - Space ID that was viewed
   */
  async trackSpaceView(sessionId, spaceId) {
    try {
      const { data: session } = await supabase
        .from('linkinbio_visitor_sessions')
        .select('viewed_spaces')
        .eq('id', sessionId)
        .single();
      
      const viewedSpaces = session?.viewed_spaces || [];
      if (!viewedSpaces.includes(spaceId)) {
        viewedSpaces.push(spaceId);
        
        await this.updateSession(sessionId, {
          viewed_spaces: viewedSpaces,
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking space view:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * End session and calculate duration
   * @param {string} sessionId - Session UUID
   * @returns {Promise<object>} Final session data
   */
  async endSession(sessionId) {
    try {
      const { data: session } = await supabase
        .from('linkinbio_visitor_sessions')
        .select('session_start')
        .eq('id', sessionId)
        .single();
      
      if (!session) return { success: false };
      
      const sessionStart = new Date(session.session_start);
      const sessionEnd = new Date();
      const duration = Math.floor((sessionEnd - sessionStart) / 1000); // seconds
      
      await this.updateSession(sessionId, {
        session_end: sessionEnd.toISOString(),
        session_duration: duration,
      });
      
      return { success: true, duration };
    } catch (error) {
      console.error('Error ending session:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get visitor analytics for a user
   * @param {string} username - Username to get analytics for
   * @param {string} timeframe - Time period (7d, 30d, all)
   * @returns {Promise<object>} Analytics data
   */
  async getVisitorAnalytics(username, timeframe = '7d') {
    try {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: sessions, error } = await supabase
        .from('linkinbio_visitor_sessions')
        .select('*')
        .eq('username', username)
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      
      if (!sessions || sessions.length === 0) {
        return {
          totalVisits: 0,
          uniqueVisitors: 0,
          firstTimeVisitors: 0,
          returningVisitors: 0,
          avgSessionDuration: 0,
          deviceBreakdown: {},
          countryBreakdown: {},
          topReferrers: [],
        };
      }
      
      // Calculate metrics
      const totalVisits = sessions.length;
      const uniqueVisitors = new Set(sessions.map(s => s.visitor_id)).size;
      const firstTimeVisitors = sessions.filter(s => s.is_first_visit).length;
      const returningVisitors = totalVisits - firstTimeVisitors;
      
      // Average session duration
      const validDurations = sessions
        .map(s => s.session_duration)
        .filter(d => d && d > 0);
      const avgSessionDuration = validDurations.length > 0
        ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length)
        : 0;
      
      // Device breakdown
      const deviceBreakdown = sessions.reduce((acc, s) => {
        const device = s.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});
      
      // Country breakdown
      const countryBreakdown = sessions.reduce((acc, s) => {
        if (s.country_name) {
          acc[s.country_name] = (acc[s.country_name] || 0) + 1;
        }
        return acc;
      }, {});
      
      // Top referrers
      const referrerBreakdown = sessions
        .filter(s => s.referrer_domain)
        .reduce((acc, s) => {
          acc[s.referrer_domain] = (acc[s.referrer_domain] || 0) + 1;
          return acc;
        }, {});
      
      const topReferrers = Object.entries(referrerBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }));
      
      return {
        totalVisits,
        uniqueVisitors,
        firstTimeVisitors,
        returningVisitors,
        avgSessionDuration,
        deviceBreakdown,
        countryBreakdown,
        topReferrers,
      };
    } catch (error) {
      console.error('Error getting visitor analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get visitor context for adaptive rules
   * Used by rules engine to determine which rules apply
   * @param {string} sessionId - Session UUID
   * @returns {Promise<object>} Context for rule evaluation
   */
  async getVisitorContext(sessionId) {
    try {
      const { data: session, error } = await supabase
        .from('linkinbio_visitor_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      
      // Get current time info
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      return {
        // Geographic
        country: session.country_code,
        city: session.city,
        region: session.region,
        timezone: session.timezone,
        
        // Device
        device: session.device_type,
        browser: session.browser,
        os: session.os,
        
        // Referral
        referrer: session.referrer_domain,
        utmSource: session.utm_source,
        utmMedium: session.utm_medium,
        utmCampaign: session.utm_campaign,
        
        // Visit type
        isFirstVisit: session.is_first_visit,
        visitCount: session.visit_count,
        
        // Time
        hour: hour,
        dayOfWeek: dayOfWeek,
        timeOfDay: this.getTimeOfDay(hour),
        
        // Engagement
        clickedButtons: session.clicked_buttons || [],
        viewedSpaces: session.viewed_spaces || [],
      };
    } catch (error) {
      console.error('Error getting visitor context:', error);
      throw error;
    }
  }
  
  /**
   * Helper: Get time of day category
   */
  getTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }
}

module.exports = new VisitorSessionService();
