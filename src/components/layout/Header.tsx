/**
 * Header - Application header with logo, navigation, and actions
 *
 * Combines logo, main navigation, theme toggle, and external links.
 */

import { Link } from "react-router-dom";

import { siteConfig } from "@/config";
import { GitHubIcon } from "@/ui/icons";

import { Navigation } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Application header component.
 * Contains logo, navigation links, theme toggle, and GitHub link.
 */
export function Header() {
  return (
    <header className="border-b border-border bg-surface shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link className="flex items-center gap-2" to="/">
          <span className="text-xl font-bold text-primary">
            {siteConfig.name}
          </span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {siteConfig.badge}
          </span>
        </Link>

        {/* Main Navigation */}
        <Navigation />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg-light hover:text-text"
            href={siteConfig.repo.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="sr-only">View on GitHub</span>
            <GitHubIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
