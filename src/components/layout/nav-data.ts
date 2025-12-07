/**
 * Navigation Data - Shared navigation links and sections
 *
 * Single source of truth for navigation structure used by
 * both desktop Navigation and MobileMenu components.
 */

import type { NavLink, NavSection } from "./NavDropdown";

/** Primary navigation links shown in main nav bar */
export const NAV_LINKS: readonly NavLink[] = [
  { path: "/", label: "Playground" },
  { path: "/gallery", label: "Gallery" },
  { path: "/tutorial", label: "Tutorial" },
  { path: "/demos", label: "Demos" },
] as const;

/** Dropdown sections for "More" menu */
export const MORE_SECTIONS: readonly NavSection[] = [
  {
    title: "Demos",
    links: [
      { path: "/demos/mutation", label: "Mutation Lab" },
      { path: "/demos/timeline", label: "Timeline" },
      { path: "/demos/evolution", label: "Evolution" },
      { path: "/demos/population", label: "Population" },
      { path: "/demos/genetic", label: "Genetic Algorithm" },
    ],
  },
  {
    title: "Dashboards",
    links: [
      { path: "/dashboards/learning", label: "Learning Paths" },
      { path: "/dashboards/teacher", label: "Teacher Dashboard" },
      { path: "/dashboards/research", label: "Research" },
    ],
  },
] as const;
