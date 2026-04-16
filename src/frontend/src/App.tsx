import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { type ComponentType, Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";

// Lazy page imports
const LessonListPage = () =>
  import("./pages/LessonListPage").then((m) => ({ default: m.LessonListPage }));
const LessonDetailPage = () =>
  import("./pages/LessonDetailPage").then((m) => ({
    default: m.LessonDetailPage,
  }));
const SettingsPage = () =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage }));
const OAuthCallbackPage = () =>
  import("./pages/OAuthCallbackPage").then((m) => ({
    default: m.OAuthCallbackPage,
  }));

// Dynamic page loader
function DynamicPage({
  loader,
}: {
  loader: () => Promise<{ default: ComponentType }>;
}) {
  const Page = lazy(loader);
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground text-sm animate-pulse font-body">
            Loading…
          </div>
        </div>
      }
    >
      <Page />
    </Suspense>
  );
}

// Auth guard for protected routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground text-sm animate-pulse font-body">
          Initializing…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

// Root route with layout and providers
const rootRoute = createRootRoute({
  component: function Root() {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Layout>
          <Outlet />
        </Layout>
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    );
  },
});

// Route tree
const lessonListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function LessonListRoute() {
    return (
      <AuthGuard>
        <DynamicPage loader={LessonListPage} />
      </AuthGuard>
    );
  },
});

const lessonDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lessons/$lessonId",
  component: function LessonDetailRoute() {
    return (
      <AuthGuard>
        <DynamicPage loader={LessonDetailPage} />
      </AuthGuard>
    );
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: function SettingsRoute() {
    return (
      <AuthGuard>
        <DynamicPage loader={SettingsPage} />
      </AuthGuard>
    );
  },
});

const oauthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/oauth/callback",
  component: function OAuthCallbackRoute() {
    return <DynamicPage loader={OAuthCallbackPage} />;
  },
});

const routeTree = rootRoute.addChildren([
  lessonListRoute,
  lessonDetailRoute,
  settingsRoute,
  oauthCallbackRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
