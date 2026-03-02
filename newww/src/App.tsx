import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { queryClient } from './lib/queryClient';
import Dashboard from './routes/Dashboard';
import Submit from './routes/Submit';
import ContentList from './routes/ContentList';
import ContentDetail from './routes/ContentDetail';
import Settings from './routes/Settings';
import Events from './routes/Events';
import Users from './routes/Users';
import Chats from './routes/Chats';
import Workspace from './routes/Workspace';
import { Layout } from './components/Layout';
import './index.css';

// Create root route
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Create routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const submitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit',
  component: Submit,
});

const contentListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content',
  component: ContentList,
});

const contentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content/$id',
  component: ContentDetail,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: Events,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: Users,
});

const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: Chats,
});

const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspace',
  component: Workspace,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  submitRoute,
  contentListRoute,
  contentDetailRoute,
  eventsRoute,
  usersRoute,
  chatsRoute,
  workspaceRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
