/**
 * NavDropdown - Reusable navigation dropdown menu
 *
 * Hover-triggered dropdown with support for grouped link sections.
 */

import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";

import { ChevronDownIcon } from "@/ui/icons";

export interface NavLink {
  path: string;
  label: string;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export interface NavDropdownProps {
  /** Button label */
  label: string;
  /** Grouped sections of links */
  sections: NavSection[];
}

/**
 * Hover-activated dropdown menu for navigation.
 *
 * @example
 * ```tsx
 * <NavDropdown
 *   label="More"
 *   sections={[
 *     { title: "Demos", links: [{ path: "/demos/mutation", label: "Mutation Lab" }] },
 *     { title: "Dashboards", links: [{ path: "/dashboards/teacher", label: "Teacher" }] },
 *   ]}
 * />
 * ```
 */
export function NavDropdown({
  label,
  sections,
}: NavDropdownProps): ReactElement {
  return (
    <div className="group relative">
      <button
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-bg-light"
        type="button"
      >
        {label}
        <ChevronDownIcon />
      </button>

      <div
        className="invisible absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-surface p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
        role="menu"
      >
        {sections.map((section, index) => (
          <div
            className={index > 0 ? "mt-2 border-t border-border pt-2" : ""}
            key={section.title}
          >
            <p className="px-3 py-1 text-xs font-semibold uppercase text-text-muted">
              {section.title}
            </p>
            {section.links.map((link) => (
              <Link
                className="block rounded-md px-3 py-2 text-sm text-text hover:bg-bg-light"
                key={link.path}
                role="menuitem"
                to={link.path}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
