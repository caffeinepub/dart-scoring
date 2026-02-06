import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import StartGamePage from './pages/StartGamePage';
import GamePage from './pages/GamePage';
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

// Create game route
const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: GamePage,
});

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, gameRoute]);

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
