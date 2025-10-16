/**
 * API utilities for backend communication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Make an authenticated API request
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
}

/**
 * API helper functions
 */
export const api = {
  // User endpoints
  user: {
    getProfile: async () => {
      const res = await apiRequest('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    updateProfile: async (data: any) => {
      const res = await apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    updateSettings: async (data: any) => {
      const res = await apiRequest('/api/user/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
  },

  // Profile endpoints
  profile: {
    getByUsername: async (username: string) => {
      const res = await apiRequest(`/api/profile/${username}`);
      if (!res.ok) throw new Error('Profile not found');
      return res.json();
    },
    update: async (data: any) => {
      const res = await apiRequest('/api/profile/update', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    checkUsername: async (username: string) => {
      const res = await apiRequest(`/api/profile/check/${username}`);
      if (!res.ok) throw new Error('Failed to check username');
      return res.json();
    },
  },

  // Tips endpoints
  tips: {
    getRecent: async () => {
      const res = await apiRequest('/api/tips/recent');
      if (!res.ok) throw new Error('Failed to fetch tips');
      return res.json();
    },
    getByUsername: async (username: string) => {
      const res = await apiRequest(`/api/tips/user/${username}`);
      if (!res.ok) throw new Error('Failed to fetch tips');
      return res.json();
    },
    record: async (data: any) => {
      const res = await apiRequest('/api/tips/record', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to record tip');
      return res.json();
    },
    getStats: async () => {
      const res = await apiRequest('/api/tips/stats');
      if (!res.ok) throw new Error('Failed to fetch tip stats');
      return res.json();
    },
  },

  // Analytics endpoints
  analytics: {
    trackVisit: async (username: string) => {
      await apiRequest('/api/analytics/visit', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
    },
    trackClick: async (username: string, buttonId: string) => {
      await apiRequest('/api/analytics/click', {
        method: 'POST',
        body: JSON.stringify({ username, buttonId }),
      });
    },
    getDashboard: async (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await apiRequest(`/api/analytics/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  },

  // Auth endpoints
  auth: {
    signup: async (data: any) => {
      const res = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Signup failed');
      }
      return res.json();
    },
    login: async (email: string, password: string) => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      return res.json();
    },
    walletLogin: async (walletAddress: string, username?: string, displayName?: string) => {
      const res = await apiRequest('/api/auth/wallet-login', {
        method: 'POST',
        body: JSON.stringify({ walletAddress, username, displayName }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Wallet login failed');
      }
      return res.json();
    },
  },
};
