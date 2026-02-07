import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSession } from '../hooks/useSession';

export default function GoogleOAuthRedirectPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { token?: string; error?: string };
  const { setOAuthToken } = useSession();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = () => {
      const { token, error } = search;

      // Handle error cases
      if (error) {
        setStatus('error');
        if (error === 'access_denied' || error.toLowerCase().includes('denied')) {
          setErrorMessage('Google sign-in was cancelled. You did not grant permission.');
        } else if (error === 'invalid_token') {
          setErrorMessage('Invalid authentication token received. Please try signing in again.');
        } else {
          setErrorMessage(`Sign-in error: ${error}. Please try again.`);
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Handle missing token
      if (!token) {
        setStatus('error');
        setErrorMessage('No authentication token received. Please try signing in again.');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Store token and redirect
      try {
        setOAuthToken(token);
        setStatus('success');

        // Remove sensitive token from URL immediately
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to profile
        setTimeout(() => {
          navigate({ to: '/profile' });
        }, 800);
      } catch (err) {
        console.error('Failed to process OAuth token:', err);
        setStatus('error');
        setErrorMessage('Failed to complete sign-in. Please try again.');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, [search, setOAuthToken, navigate]);

  const handleBackToLogin = () => {
    navigate({ to: '/login' });
  };

  if (status === 'processing') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Completing Sign In
            </CardTitle>
            <CardDescription>Please wait while we complete your Google sign-in...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Sign In Successful
            </CardTitle>
            <CardDescription>Redirecting to your profile...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Sign In Failed
          </CardTitle>
          <CardDescription>There was a problem signing in with Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Button onClick={handleBackToLogin} className="w-full">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
