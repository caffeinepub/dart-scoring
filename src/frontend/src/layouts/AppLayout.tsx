import { useEffect } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { Target, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AppLayout() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Register service worker for PWA offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Only register once
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) {
          navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
              console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
        }
      });
    }
  }, []);

  const handleProfileClick = () => {
    navigate({ to: '/profile' });
  };

  const handleSignInClick = () => {
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Target className="h-7 w-7 text-primary" strokeWidth={2.5} />
            <h1 className="text-2xl font-bold tracking-tight">Dart Scoring</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isInitializing && (
              <>
                {isAuthenticated ? (
                  <Button variant="ghost" size="sm" onClick={handleProfileClick}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={handleSignInClick}>
                    Sign in
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <p>
          © 2026. Built with <span className="text-destructive">♥</span> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
