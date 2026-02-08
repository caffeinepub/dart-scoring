import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Centralized session/auth abstraction for the application.
 * 
 * Wraps Internet Identity authentication for the app.
 * All authenticated backend calls use the II identity/principal.
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

  return {
    isAuthenticated,
    identity,
    signIn,
    signOut,
    loginStatus,
    isInitializing,
    isLoggingIn: loginStatus === 'logging-in',
    isLoginError: loginStatus === 'loginError',
  };
}
