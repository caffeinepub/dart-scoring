import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import StartGamePage from './pages/StartGamePage';
import GamePage from './pages/GamePage';
import StatsPage from './pages/StatsPage';
import RoomHostScorerPage from './pages/RoomHostScorerPage';
import RoomDisplayTvPage from './pages/RoomDisplayTvPage';
import MyAccountPage from './pages/MyAccountPage';
import GameHistoryPage from './pages/GameHistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import GameDetailsPage from './pages/GameDetailsPage';
import GoogleOAuthRedirectPage from './pages/GoogleOAuthRedirectPage';
import AppLayout from './layouts/AppLayout';

// Create root route with layout
const rootRoute = createRootRoute({
  component: AppLayout,
});

// Create index route (Start Game)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StartGamePage,
});

// Create game route with optional game_id search param
const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: GamePage,
  validateSearch: (search: Record<string, unknown>): { game_id?: string } => {
    return {
      game_id: typeof search.game_id === 'string' ? search.game_id : undefined,
    };
  },
});

// Create stats route
const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: StatsPage,
});

// Create room host/scorer route with room code param
const roomHostScorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$roomCode/host',
  component: RoomHostScorerPage,
});

// Create room display/TV route with room code param
const roomDisplayTvRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$roomCode/display',
  component: RoomDisplayTvPage,
});

// Create account route (backward compatible)
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: MyAccountPage,
});

// Create game history route
const gameHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: GameHistoryPage,
});

// Create login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Create register route
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

// Create profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

// Create game details route with game ID param
const gameDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/games/$id',
  component: GameDetailsPage,
});

// Create Google OAuth redirect route
const googleOAuthRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/google/oauth-redirect',
  component: GoogleOAuthRedirectPage,
  validateSearch: (search: Record<string, unknown>): { token?: string; error?: string } => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
      error: typeof search.error === 'string' ? search.error : undefined,
    };
  },
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  gameRoute,
  statsRoute,
  roomHostScorerRoute,
  roomDisplayTvRoute,
  accountRoute,
  gameHistoryRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  gameDetailsRoute,
  googleOAuthRedirectRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
