import { useEffect } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { Target, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '../hooks/useSession';

export default function AppLayout() {
  const navigate = useNavigate();
  const { identity, isInitializing, isAuthenticated, signOut } = useSession();

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

  const handleSignInClick = () => {
    navigate({ to: '/login' });
  };

  const handleProfileClick = () => {
    navigate({ to: '/profile' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/' });
  };

  const principalText = identity ? identity.getPrincipal().toString() : '';
  const shortPrincipal = principalText.length > 12 
    ? `${principalText.slice(0, 6)}...${principalText.slice(-4)}`
    : principalText;

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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Account</p>
                          <p className="text-xs leading-none text-muted-foreground font-mono">
                            {shortPrincipal}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleProfileClick}>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
