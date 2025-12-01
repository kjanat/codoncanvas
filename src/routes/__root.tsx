import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout";
import { ToastProvider } from "@/contexts";

function LoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-text-muted">Loading...</p>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <ToastProvider>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Layout>
      <TanStackRouterDevtools position="bottom-right" />
    </ToastProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
