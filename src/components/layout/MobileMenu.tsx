/**
 * MobileMenu - Slide-out drawer navigation for mobile devices
 *
 * Hamburger menu button that reveals a full-screen navigation drawer.
 * Includes all navigation links and dropdown sections.
 */

import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { MenuIcon, XIcon } from "@/ui/icons";

interface NavLink {
  path: string;
  label: string;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const NAV_LINKS: NavLink[] = [
  { path: "/", label: "Playground" },
  { path: "/gallery", label: "Gallery" },
  { path: "/tutorial", label: "Tutorial" },
  { path: "/demos", label: "Demos" },
];

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
 * Mobile navigation menu with hamburger toggle and slide-out drawer.
 * Hidden on desktop (md:hidden), visible on mobile.
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { location } = useRouterState();
  const pathname = location.pathname;
  const prevPathRef = useRef(pathname);

  // Close menu on route change
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setIsOpen(false);
      prevPathRef.current = pathname;
    }
  });

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-md text-text hover:bg-bg-light"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {isOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        aria-label="Mobile navigation"
        className={`fixed inset-y-0 right-0 z-50 w-72 transform bg-surface shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-lg font-semibold text-primary">Menu</span>
          <button
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-md text-text hover:bg-bg-light"
            onClick={close}
            type="button"
          >
            <XIcon />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="overflow-y-auto p-4">
          {/* Primary links */}
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link
                  className={`block rounded-md px-4 py-3 text-base font-medium transition-colors ${
                    pathname === link.path
                      ? "bg-primary text-white"
                      : "text-text hover:bg-bg-light"
                  }`}
                  onClick={close}
                  to={link.path}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Sections */}
          {MORE_SECTIONS.map((section) => (
            <div className="mt-6" key={section.title}>
              <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {section.title}
              </h3>
              <ul className="mt-2 space-y-1">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      className={`block rounded-md px-4 py-3 text-base transition-colors ${
                        pathname === link.path
                          ? "bg-primary/10 text-primary"
                          : "text-text hover:bg-bg-light"
                      }`}
                      onClick={close}
                      to={link.path}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
