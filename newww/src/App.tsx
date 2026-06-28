import { QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router';
import { queryClient } from './lib/queryClient';
import IndexGate from './routes/IndexGate';
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
import PublisherDetail from './routes/PublisherDetail';
import Teams from './routes/Teams';
import LandingPage from './routes/LandingPage';
import { Layout } from './components/Layout';
import { isAuthenticated } from './lib/auth';
import './index.css';

function requireAuth() {
  if (!isAuthenticated()) {
    throw redirect({ to: '/' });
  }
}

function redirectIfAuthed() {
  if (isAuthenticated()) {
    throw redirect({ to: '/' });
  }
}

function RootShell() {
  const { pathname } = useLocation();
  const authed = isAuthenticated();
  const isLogin = pathname.startsWith('/auth');
  const isHome = pathname === '/';

  if (isLogin || (isHome && !authed)) {
    return <Outlet />;
  }

  if (!authed) {
    return <LandingPage variant="not-found" />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: RootShell,
  notFoundComponent: () => <LandingPage variant="not-found" />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexGate,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  beforeLoad: redirectIfAuthed,
  component: Login,
});

const submitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit',
  beforeLoad: requireAuth,
  component: Submit,
});

const contentListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content',
  beforeLoad: requireAuth,
  component: ContentList,
});

const contentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content/$id',
  beforeLoad: requireAuth,
  component: ContentDetail,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: requireAuth,
  component: Settings,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  beforeLoad: requireAuth,
  component: Events,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  beforeLoad: requireAuth,
  component: Users,
});

const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  beforeLoad: requireAuth,
  component: Chats,
});

const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspace',
  beforeLoad: requireAuth,
  component: Workspace,
});

const proofreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/proofread',
  beforeLoad: requireAuth,
  component: ProofReadRoom,
});

const rankingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rankings',
  beforeLoad: requireAuth,
  component: Rankings,
});

const publishPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publish-preview',
  beforeLoad: requireAuth,
  component: PublishPreview,
});

const publishersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publishers',
  beforeLoad: requireAuth,
  component: Publishers,
});

const publisherDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publishers/$pid',
  beforeLoad: requireAuth,
  component: PublisherDetail,
});

const teamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teams',
  beforeLoad: requireAuth,
  component: Teams,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
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
  publisherDetailRoute,
  teamsRoute,
  settingsRoute,
]);

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <LandingPage variant="not-found" />,
});

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
