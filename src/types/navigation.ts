/**
 * Navigation Types
 *
 * Type-safe navigation primitives constrained to valid routes
 * from the generated route tree.
 */

import type { FileRoutesByFullPath } from "@/routeTree.gen";

/** Valid route path from the generated route tree */
export type RoutePath = keyof FileRoutesByFullPath;

/** Navigation link with type-safe path */
export interface NavLink {
  path: RoutePath;
  label: string;
}

/** Grouped section of navigation links */
export interface NavSection {
  title: string;
  links: readonly NavLink[];
}
