/**
 * Router Test Wrapper
 *
 * Provides TanStack Router context for component testing.
 */

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  type RenderOptions,
  type RenderResult,
  render,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

interface RouterWrapperProps {
  children: ReactNode;
  initialPath?: string;
}

/**
 * Render a component within TanStack Router context.
 *
 * @example
 * ```tsx
 * const { container } = renderWithRouter(<DemoCard {...props} />);
 * ```
 */
export function renderWithRouter(
  ui: ReactElement,
  initialPath = "/",
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  // Create root route that renders the UI
  const rootRoute = createRootRoute({
    component: () => ui,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => null,
  });

  // Create catch-all route for any path
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => null,
  });

  const routeTree = rootRoute.addChildren([indexRoute, catchAllRoute]);

  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
  });

  return render(<RouterProvider router={router as never} />, options);
}

/**
 * Wrapper component that provides router context for tests.
 * Note: This approach may not work well with TanStack Router.
 * Consider using renderWithRouter instead.
 */
export function RouterWrapper({
  children,
  initialPath = "/",
}: RouterWrapperProps) {
  // Create root route that renders children
  const rootRoute = createRootRoute({
    component: () => <>{children}</>,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => null,
  });

  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => null,
  });

  const routeTree = rootRoute.addChildren([indexRoute, catchAllRoute]);

  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
  });

  return <RouterProvider router={router as never} />;
}

/**
 * Higher-order function to create a render wrapper with router context.
 */
export function createRouterWrapper(initialPath = "/") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <RouterWrapper initialPath={initialPath}>{children}</RouterWrapper>;
  };
}
