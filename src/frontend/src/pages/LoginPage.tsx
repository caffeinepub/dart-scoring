import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Loader2, User } from 'lucide-react';
import { useSession } from '../hooks/useSession';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn, loginStatus, isLoggingIn, isInitializing } = useSession();

  // Redirect to profile if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      navigate({ to: '/profile' });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Already Signed In
            </CardTitle>
            <CardDescription>You are already authenticated</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/profile' })} className="w-full">
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign In
          </CardTitle>
          <CardDescription>Sign in with Internet Identity to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginStatus === 'loginError' && (
            <Alert variant="destructive">
              <AlertDescription>
                Sign in failed. Please try again.
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
