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

export function useOAuthTokenSession() {
  const context = useContext(OAuthTokenSessionContext);
  if (!context) {
    throw new Error('useOAuthTokenSession must be used within OAuthTokenSessionProvider');
  }
  return context;
}
