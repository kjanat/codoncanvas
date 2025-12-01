/**
 * NavDropdown - Reusable navigation dropdown menu
 *
 * Hover-triggered dropdown with support for grouped link sections.
 */

import { Link } from "@tanstack/react-router";
import { type ReactElement, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
      // Return focus to trigger button for keyboard users
      containerRef.current?.querySelector("button")?.focus();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Close dropdown when focus leaves the container entirely
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div
      className="group relative"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
      role="none"
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-bg-light focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {label}
        <ChevronDownIcon />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-surface p-2 shadow-lg transition-all ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
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
