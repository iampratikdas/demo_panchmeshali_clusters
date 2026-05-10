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
import ProofReadRoom from './routes/ProofReadRoom';
import Rankings from './routes/Rankings';
import PublishPreview from './routes/PublishPreview';
import Login from './routes/Login';
import Publishers from './routes/Publishers';
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

const proofreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/proofread',
  component: ProofReadRoom,
});

const rankingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rankings',
  component: Rankings,
});

const publishPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publish-preview',
  component: PublishPreview,
});

const publishersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publishers',
  component: Publishers,
});
const rootRoutelogin = createRootRoute();

const authRootRoute = createRoute({
  getParentRoute: () => rootRoutelogin,
  path: 'auth',
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => authRootRoute,
  path: 'login',
  component: Login,
});
// Create router
const authTree = authRootRoute.addChildren([loginRoute]);
const mainRoutes = [
  indexRoute,
  submitRoute,
  contentListRoute,
  contentDetailRoute,
  eventsRoute,
  usersRoute,
  chatsRoute,
  workspaceRoute,
  proofreadRoute,
  rankingsRoute,
  publishPreviewRoute,
  publishersRoute,
  settingsRoute,
];

const routeTree = localStorage.getItem('token')
  ? rootRoute.addChildren([...mainRoutes, authTree])
  : rootRoutelogin.addChildren([authTree]);


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
