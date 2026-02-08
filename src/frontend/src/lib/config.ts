/**
 * Centralized configuration for backend base URL resolution.
 * All backend endpoints now target the external BACKEND_URL.
 */

/**
 * The external backend base URL.
 * All API requests will be made to this URL.
 */
export const BACKEND_URL = "https://dart-scoring-backend-vab.caffeine.xyz";

/**
 * Resolves the backend base URL for all API endpoints.
 * 
 * @returns {string} The external backend base URL
 */
export function getBackendBaseUrl(): string {
  return BACKEND_URL;
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
