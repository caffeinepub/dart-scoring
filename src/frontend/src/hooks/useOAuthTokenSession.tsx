import React, { createContext, useContext, useState, useCallback } from 'react';

interface OAuthTokenSessionContextValue {
  googleAccessToken: string | null;
  setGoogleAccessToken: (token: string) => void;
  clearGoogleAccessToken: () => void;
}

const OAuthTokenSessionContext = createContext<OAuthTokenSessionContextValue | undefined>(undefined);

/**
 * In-memory-only OAuth token session provider.
 * Tokens are never persisted to localStorage or sessionStorage.
 * Token is cleared when the SPA is closed or refreshed.
 */
export function OAuthTokenSessionProvider({ children }: { children: React.ReactNode }) {
  const [googleAccessToken, setGoogleAccessTokenState] = useState<string | null>(null);

  const setGoogleAccessToken = useCallback((token: string) => {
    setGoogleAccessTokenState(token);
  }, []);

  const clearGoogleAccessToken = useCallback(() => {
    setGoogleAccessTokenState(null);
  }, []);

  return (
    <OAuthTokenSessionContext.Provider
      value={{
        googleAccessToken,
        setGoogleAccessToken,
        clearGoogleAccessToken,
      }}
    >
      {children}
    </OAuthTokenSessionContext.Provider>
  );
}

/**
 * Hook to access OAuth token session.
 * Returns a safe fallback if provider is not present (unauthenticated state).
 * This prevents crashes when the provider is accidentally removed or misplaced.
 */
export function useOAuthTokenSession() {
  const context = useContext(OAuthTokenSessionContext);
  
  // Safe fallback: return unauthenticated state instead of throwing
  if (!context) {
    return {
      googleAccessToken: null,
      setGoogleAccessToken: () => {
        console.warn('OAuthTokenSessionProvider not found. Token will not be stored.');
      },
      clearGoogleAccessToken: () => {
        // No-op when provider is missing
      },
    };
  }
  
  return context;
}
