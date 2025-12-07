/**
 * Navigation - Main navigation component
 *
 * Renders primary nav links with active state highlighting
 * and dropdown menus for additional pages.
 */

import { Link, useRouterState } from "@tanstack/react-router";

import { NavDropdown } from "./NavDropdown";
import { MORE_SECTIONS, NAV_LINKS } from "./nav-data";

/**
 * Main navigation bar with links and dropdown menus.
 * Hidden on mobile (md:flex), shows active state for current route.
 */
export function Navigation() {
  const { location } = useRouterState();

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-1 md:flex"
    >
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
