import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, LogIn, UserPlus, LogOut, Trophy, Target, TrendingUp } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { useMyProfile } from '../hooks/useMyProfile';
import { useMyStats } from '../hooks/useUserStats';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, isInitializing } = useSession();
  const { data: profile, isLoading: profileLoading, isFetched } = useMyProfile();
  const { data: userStats, isLoading: isLoadingStats } = useMyStats();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/' });
  };

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - prompt to sign in
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You need to sign in to access your profile.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/login' })} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated but no profile - prompt to register
  if (isFetched && profile === null) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>Create your profile to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You need to set up your profile before you can use all features.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate({ to: '/register' })} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated with profile - show profile and stats
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile && (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-lg font-semibold">{profile.username}</p>
              </div>
              {profile.email && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg">{profile.email}</p>
                </div>
              )}
            </div>
          )}
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* User Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            My Statistics
          </CardTitle>
          <CardDescription>Your overall performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Games Played</p>
                <p className="text-2xl font-bold">{Number(userStats.gamesPlayed)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Wins</p>
                <p className="text-2xl font-bold">{Number(userStats.wins)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{(userStats.winRate * 100).toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg (3-dart)</p>
                <p className="text-2xl font-bold">{userStats.avg3dartOverall.toFixed(1)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total 180s</p>
                <p className="text-2xl font-bold">{Number(userStats.total180s)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Busts</p>
                <p className="text-2xl font-bold">{Number(userStats.totalBusts)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Checkout Rate</p>
                <p className="text-2xl font-bold">{(userStats.checkoutRate * 100).toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Checkouts</p>
                <p className="text-2xl font-bold">
                  {Number(userStats.checkoutSuccess)}/{Number(userStats.checkoutAttempts)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No statistics available yet.</p>
              <p className="text-sm">Play some games to see your stats!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Game History
          </CardTitle>
          <CardDescription>View your past games and detailed statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: '/history' })} className="w-full">
            <Trophy className="mr-2 h-4 w-4" />
            View Game History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
