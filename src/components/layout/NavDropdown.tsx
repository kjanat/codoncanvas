/**
 * NavDropdown - Reusable navigation dropdown menu
 *
 * Hover-triggered dropdown with support for grouped link sections.
 */

import { Link } from "@tanstack/react-router";
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  useId,
  useRef,
  useState,
} from "react";

import type { NavSection } from "@/types";
import { ChevronDownIcon } from "@/ui/icons";

export interface NavDropdownProps {
  /** Button label */
  label: string;
  /** Grouped sections of links */
  sections: readonly NavSection[];
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
  const triggerId = useId();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
      // Return focus to trigger button for keyboard users
      containerRef.current?.querySelector("button")?.focus();
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>): void => {
    // Close dropdown when focus leaves the container entirely
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const handleMouseEnter = (): void => setIsOpen(true);
  const handleMouseLeave = (): void => setIsOpen(false);

  return (
    <nav
      aria-label={`${label} navigation`}
      className="group relative"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-bg-light focus:outline-none focus:ring-2 focus:ring-primary"
        id={triggerId}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {label}
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      <div
        aria-labelledby={triggerId}
        className={`absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-surface p-2 shadow-lg transition-all ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
        id={menuId}
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
                to={link.path}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
