import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight } from 'lucide-react';
import { useSession } from '../hooks/useSession';

/**
 * Backward-compatible /account route.
 * Redirects users to the new /profile page.
 */
export default function MyAccountPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useSession();

  useEffect(() => {
    if (!isInitializing) {
      // Redirect to profile after a brief moment
      const timer = setTimeout(() => {
        navigate({ to: '/profile' });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, navigate]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Redirecting...</CardTitle>
          <CardDescription>Taking you to your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              The account page has moved. You'll be redirected to your profile automatically.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/profile' })} className="w-full">
            <ArrowRight className="mr-2 h-4 w-4" />
            Go to Profile Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
