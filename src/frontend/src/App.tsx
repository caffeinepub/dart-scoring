import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import StartGamePage from './pages/StartGamePage';
import GamePage from './pages/GamePage';
import StatsPage from './pages/StatsPage';
import RoomHostScorerPage from './pages/RoomHostScorerPage';
import RoomDisplayTvPage from './pages/RoomDisplayTvPage';
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

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  gameRoute,
  statsRoute,
  roomHostScorerRoute,
  roomDisplayTvRoute,
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
