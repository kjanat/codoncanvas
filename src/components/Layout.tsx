import { type ReactNode, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePreferences } from "@/hooks";

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

// Theme icons
function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="5" strokeWidth={2} />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2" strokeWidth={2} width="20" x="2" y="3" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" strokeWidth={2} />
    </svg>
  );
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { preferences, setPreference } = usePreferences();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const theme = preferences.theme;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
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
      <header className="border-b border-border bg-white shadow-sm">
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
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>

              <div className="invisible absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
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
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  fillRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-6">
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
