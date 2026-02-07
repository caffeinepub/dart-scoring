import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Loader2, LogIn } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { useMyProfile } from '../hooks/useMyProfile';
import { useActor } from '../hooks/useActor';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useSession();
  const { data: profile, isLoading: profileLoading, isFetched } = useMyProfile();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  const registerMutation = useMutation({
    mutationFn: async ({ email, username }: { email: string; username: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.register(email, username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myStats'] });
      navigate({ to: '/profile' });
    },
    onError: (error: Error) => {
      setValidationError(error.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim()) {
      setValidationError('Username is required.');
      return;
    }

    registerMutation.mutate({ email: email.trim(), username: username.trim() });
  };

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - prompt to sign in first
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create Profile
            </CardTitle>
            <CardDescription>Sign in first to create your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You need to sign in with Internet Identity before creating a profile.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/login' })} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already has profile - redirect to profile page
  if (isFetched && profile !== null) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Already Exists</CardTitle>
            <CardDescription>You already have a profile set up</CardDescription>
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

  // Show registration form
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Your Profile
          </CardTitle>
          <CardDescription>Set up your username to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <Alert variant="destructive">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={registerMutation.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={registerMutation.isPending}
              />
            </div>
            <Button type="submit" disabled={registerMutation.isPending} className="w-full">
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
