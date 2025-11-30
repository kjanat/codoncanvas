/**
 * Footer - Application footer
 *
 * Static footer with copyright and creator attribution.
 */

import { siteConfig } from "@/config";

/**
 * Application footer component.
 * Contains copyright notice and creator link.
 */
export interface FooterProps {
  authorName: string;
  githubUrl?: string;
}

/**
 * Application footer component.
 * Contains copyright notice and creator link.
 */
export function Footer({ authorName, githubUrl }: FooterProps) {
  return (
    <footer className="border-t border-border bg-surface py-6">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-muted">
        <p>
          {siteConfig.name} — {siteConfig.tagline}
        </p>
        <p className="mt-1">
          Created by{" "}
          {githubUrl ? (
            <a
              className="text-primary hover:underline"
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              {authorName}
            </a>
          ) : (
            authorName
          )}
        </p>
      </div>
    </footer>
  );
}
