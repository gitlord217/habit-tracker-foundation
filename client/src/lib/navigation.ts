/**
 * Navigation utility to handle reliable redirects
 * Bypasses wouter to avoid SPA routing issues
 */

/**
 * Navigate directly to a route using full URL approach
 * More reliable than router-based navigation in some situations
 */
export function navigateTo(path: string): void {
  // Use the most direct approach possible
  window.location.href = window.location.origin + path;
}

/**
 * Redirects to auth page when user is not authenticated
 */
export function redirectToAuth(): void {
  navigateTo('/auth');
}

/**
 * Redirects to dashboard after successful authentication
 */
export function redirectToDashboard(): void {
  navigateTo('/dashboard');
}

/**
 * Redirects to landing page
 */
export function redirectToLanding(): void {
  navigateTo('/landing');
}