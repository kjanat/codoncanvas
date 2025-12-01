/**
 * NavDropdown - Reusable navigation dropdown menu
 *
 * Hover-triggered dropdown with support for grouped link sections.
 */

import { Link } from "@tanstack/react-router";
import { type ReactElement, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    /* biome-ignore lint/a11y/useKeyWithMouseEvents lint/a11y/noStaticElementInteractions: keyboard handled by button */
    <div
      className="group relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-bg-light"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        type="button"
      >
        {label}
        <ChevronDownIcon />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-surface p-2 shadow-lg transition-all ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
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
