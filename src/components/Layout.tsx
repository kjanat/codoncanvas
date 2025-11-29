/**
 * Layout - Main application layout with navigation
 *
 * Provides header with navigation, theme toggle, and footer.
 */

import { type ReactNode, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePreferences } from "@/hooks";
import {
  ChevronDownIcon,
  GitHubIcon,
  MoonIcon,
  SunIcon,
  SystemIcon,
} from "@/ui";

interface LayoutProps {
  children: ReactNode;
}

const navLinks = [
  { path: "/", label: "Playground" },
  { path: "/gallery", label: "Gallery" },
  { path: "/tutorial", label: "Tutorial" },
  { path: "/demos", label: "Demos" },
];

const demoLinks = [
  { path: "/demos/mutation", label: "Mutation Lab" },
  { path: "/demos/timeline", label: "Timeline" },
  { path: "/demos/evolution", label: "Evolution" },
  { path: "/demos/population", label: "Population" },
  { path: "/demos/genetic", label: "Genetic Algorithm" },
];

const dashboardLinks = [
  { path: "/dashboards/learning", label: "Learning Paths" },
  { path: "/dashboards/teacher", label: "Teacher Dashboard" },
  { path: "/dashboards/research", label: "Research" },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { preferences, setPreference } = usePreferences();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const theme = preferences.theme;

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark"); // Keep for backward compatibility if needed, but data-theme is primary
    } else if (theme === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        root.setAttribute("data-theme", "dark");
        root.classList.add("dark");
      } else {
        root.setAttribute("data-theme", "light");
        root.classList.remove("dark");
      }
    }
  }, [preferences.theme]);

  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(preferences.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setPreference("theme", themes[nextIndex]);
  };

  const ThemeIcon =
    preferences.theme === "dark"
      ? MoonIcon
      : preferences.theme === "light"
        ? SunIcon
        : SystemIcon;

  return (
    <div className="flex min-h-screen flex-col bg-bg-light">
      {/* Header */}
      <header className="border-b border-border bg-surface shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link className="flex items-center gap-2" to="/">
            <span className="text-xl font-bold text-primary">CodonCanvas</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
              DNA
            </span>
          </Link>

          {/* Main Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
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

            {/* Demos dropdown */}
            <div className="group relative">
              <button
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-bg-light"
                type="button"
              >
                More
                <ChevronDownIcon />
              </button>

              <div className="invisible absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-surface p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                <div className="mb-2 border-b border-border pb-2">
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-text-muted">
                    Demos
                  </p>
                  {demoLinks.map((link) => (
                    <Link
                      className="block rounded-md px-3 py-2 text-sm text-text hover:bg-bg-light"
                      key={link.path}
                      to={link.path}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div>
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-text-muted">
                    Dashboards
                  </p>
                  {dashboardLinks.map((link) => (
                    <Link
                      className="block rounded-md px-3 py-2 text-sm text-text hover:bg-bg-light"
                      key={link.path}
                      to={link.path}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Theme toggle and GitHub */}
          <div className="flex items-center gap-1">
            <button
              className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg-light hover:text-text"
              onClick={cycleTheme}
              title={`Theme: ${preferences.theme}`}
              type="button"
            >
              <span className="sr-only">Toggle theme</span>
              <ThemeIcon />
            </button>
            <a
              className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg-light hover:text-text"
              href="https://github.com/kjanat/codoncanvas"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="sr-only">View on GitHub</span>
              <GitHubIcon />
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-muted">
          <p>CodonCanvas - DNA-Inspired Visual Programming Language</p>
          <p className="mt-1">
            Created by{" "}
            <a
              className="text-primary hover:underline"
              href="https://github.com/kjanat"
            >
              Kaj Kowalski
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
