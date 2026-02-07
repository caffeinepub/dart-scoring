import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Centralized session/auth abstraction for the application.
 * 
 * Currently wraps Internet Identity authentication.
 * 
 * Future enhancement: For non-Internet-Identity token-based authentication,
 * this abstraction could be extended to:
 * - Store refresh tokens in httpOnly cookies (set by backend)
 * - Keep access tokens in memory only (never in localStorage/sessionStorage)
 * - Implement background token refresh before expiration
 * - Handle token rotation and secure credential management
 * 
 * Current implementation keeps all credentials in-memory via Internet Identity
 * delegation and does not persist any access credentials to browser storage.
 */
export function useSession() {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const signIn = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Handle "already authenticated" edge case
      if (error.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
      throw error;
    }
  };

  const signOut = async () => {
    await clear();
    // Clear all cached queries on sign out to prevent data leakage
    queryClient.clear();
  };

  /**
   * Placeholder for future session refresh functionality.
   * In a token-based system, this would refresh the access token
   * using the httpOnly refresh token cookie.
   */
  const refreshSession = async () => {
    // Currently a no-op for Internet Identity
    // Future: Implement token refresh logic here
  };

  return {
    isAuthenticated,
    identity,
    signIn,
    signOut,
    refreshSession,
    loginStatus,
    isInitializing,
    isLoggingIn: loginStatus === 'logging-in',
    isLoginError: loginStatus === 'loginError',
  };
}
