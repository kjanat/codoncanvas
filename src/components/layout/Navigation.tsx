/**
 * Navigation - Main navigation component
 *
 * Renders primary nav links with active state highlighting
 * and dropdown menus for additional pages.
 */

import { Link, useLocation } from "react-router-dom";

import { NavDropdown, type NavSection } from "./NavDropdown";

const NAV_LINKS = [
  { path: "/", label: "Playground" },
  { path: "/gallery", label: "Gallery" },
  { path: "/tutorial", label: "Tutorial" },
  { path: "/demos", label: "Demos" },
] as const;

const MORE_SECTIONS: NavSection[] = [
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
];

/**
 * Main navigation bar with links and dropdown menus.
 * Hidden on mobile (md:flex), shows active state for current route.
 */
export function Navigation() {
  const location = useLocation();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((link) => (
        <Link
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            location.pathname === link.path
              ? "bg-primary text-white"
              : "text-text hover:bg-bg-light"
          }`}
          key={link.path}
          to={link.path}
        >
          {link.label}
        </Link>
      ))}

      <NavDropdown label="More" sections={MORE_SECTIONS} />
    </nav>
  );
}
