/**
 * Visitor Tracking Client
 * Handles visitor identification, session tracking, and engagement analytics
 */

const VISITOR_ID_COOKIE = 'nexus_visitor_id';
const SESSION_ID_COOKIE = 'nexus_session_id';
const COOKIE_EXPIRY_DAYS = 365;

export interface VisitorSession {
  sessionId: string;
  isFirstVisit: boolean;
  visitCount: number;
}

export interface TrackingOptions {
  apiUrl?: string;
}

class VisitorTracker {
  private visitorId: string;
  private sessionId: string | null = null;
  private sessionStart: number;
  private apiUrl: string;
  private isTracking: boolean = false;
  
  constructor(options: TrackingOptions = {}) {
    this.apiUrl = options.apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionStart = Date.now();
    
    // Set up beforeunload handler to end session
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.sessionId) {
          // Use sendBeacon for reliability on page unload
          this.endSessionBeacon();
        }
      });
    }
  }
  
  /**
   * Get or create visitor ID from cookie
   */
  private getOrCreateVisitorId(): string {
    if (typeof document === 'undefined') return '';
    
    const existing = this.getCookie(VISITOR_ID_COOKIE);
    if (existing) return existing;
    
    const newId = this.generateUUID();
    this.setCookie(VISITOR_ID_COOKIE, newId, COOKIE_EXPIRY_DAYS);
    return newId;
  }
  
  /**
   * Generate UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Set cookie
   */
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
  
  /**
   * Get cookie
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  
  /**
   * Track a visit to a profile
   * @param username - Username of the profile being visited
   * @returns Session data
   */
  async trackVisit(username: string): Promise<VisitorSession> {
    if (this.isTracking) {
      console.warn('Tracking already in progress');
      return {
        sessionId: this.sessionId || '',
        isFirstVisit: false,
        visitCount: 1,
      };
    }
    
    this.isTracking = true;
    
    try {
      const response = await fetch(`${this.apiUrl}/api/visitor/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          visitorId: this.visitorId,
          screen: {
            width: typeof window !== 'undefined' ? window.screen.width : 0,
            height: typeof window !== 'undefined' ? window.screen.height : 0,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to track visit');
      }
      
      const data = await response.json();
      this.sessionId = data.session.id;
      
      // Store session ID in cookie (expires in 1 day)
      if (this.sessionId) {
        this.setCookie(SESSION_ID_COOKIE, this.sessionId, 1);
      }
      
      return {
        sessionId: this.sessionId || '',
        isFirstVisit: data.isFirstVisit,
        visitCount: data.visitCount,
      };
    } catch (error) {
      console.error('Failed to track visit:', error);
      return {
        sessionId: '',
        isFirstVisit: true,
        visitCount: 1,
      };
    } finally {
      this.isTracking = false;
    }
  }
  
  /**
   * Track button click
   * @param buttonId - ID of the button that was clicked
   */
  async trackButtonClick(buttonId: string): Promise<void> {
    if (!this.sessionId) {
      console.warn('No active session to track click');
      return;
    }
    
    try {
      await fetch(`${this.apiUrl}/api/visitor/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          buttonId,
        }),
      });
    } catch (error) {
      console.error('Failed to track button click:', error);
      // Non-critical, don't throw
    }
  }
  
  /**
   * Track space view
   * @param spaceId - ID of the space that was viewed
   */
  async trackSpaceView(spaceId: string): Promise<void> {
    if (!this.sessionId) {
      console.warn('No active session to track space view');
      return;
    }
    
    try {
      await fetch(`${this.apiUrl}/api/visitor/space-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          spaceId,
        }),
      });
    } catch (error) {
      console.error('Failed to track space view:', error);
      // Non-critical, don't throw
    }
  }
  
  /**
   * End session and calculate duration
   */
  async endSession(): Promise<void> {
    if (!this.sessionId) return;
    
    const duration = Math.floor((Date.now() - this.sessionStart) / 1000);
    
    try {
      await fetch(`${this.apiUrl}/api/visitor/end-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          duration,
        }),
      });
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }
  
  /**
   * End session using navigator.sendBeacon (more reliable on page unload)
   */
  private endSessionBeacon(): void {
    if (!this.sessionId || typeof navigator === 'undefined') return;
    
    const duration = Math.floor((Date.now() - this.sessionStart) / 1000);
    const data = JSON.stringify({
      sessionId: this.sessionId,
      duration,
    });
    
    try {
      navigator.sendBeacon(`${this.apiUrl}/api/visitor/end-session`, data);
    } catch (error) {
      console.error('Failed to send beacon:', error);
    }
  }
  
  /**
   * Get current visitor ID
   */
  getVisitorId(): string {
    return this.visitorId;
  }
  
  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }
  
  /**
   * Check if this is a first-time visitor (no previous cookie)
   */
  isNewVisitor(): boolean {
    return this.getCookie(VISITOR_ID_COOKIE) === null;
  }
}

// Export singleton instance
export const visitorTracker = new VisitorTracker();

// Export class for custom instances
export { VisitorTracker };
