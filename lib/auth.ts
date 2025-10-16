/**
 * Authentication utilities
 */

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/**
 * Get current auth token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Set auth token
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/**
 * Clear auth token (logout)
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

/**
 * Logout and redirect to login page
 */
export function logoutAndRedirect(): void {
  logout();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
