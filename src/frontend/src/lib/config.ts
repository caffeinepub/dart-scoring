/**
 * Centralized configuration for backend base URL resolution.
 * All backend endpoints are now served under same-origin /api prefix.
 */

/**
 * Resolves the backend base URL for same-origin /api endpoints.
 * In this architecture, all backend endpoints are accessible at /api/* on the same origin.
 * 
 * @returns {string} The resolved backend base URL (always same-origin /api)
 */
export function getBackendBaseUrl(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side or build-time: return /api prefix
    return "/api";
  }

  // Same-origin /api (for all environments)
  // This assumes the backend is accessible at the same origin with /api prefix
  return "/api";
}

/**
 * Safely joins a base URL with a path, avoiding double slashes.
 * 
 * @param baseUrl - The base URL (may or may not have trailing slash)
 * @param path - The path to append (should start with /)
 * @returns {string} The joined URL
 */
export function joinUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return cleanBase + cleanPath;
}
