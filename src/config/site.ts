/**
 * Site Configuration
 *
 * Centralized configuration for site metadata, author info, and external links.
 * Import from here to ensure consistency across the application.
 */

type UserName = string | undefined;

/** Tagline type - can be a string or object with short/long variants */
export type Tagline =
  | string
  | {
      /** Short tagline for mobile */
      short: string;
      /** Long tagline for desktop */
      long: string;
    };

/** Author username type
 *
 * Can be a string or an object with optional GitHub, Twitter, and Discord usernames.
 *
 * @example
 * ```ts
 * const username: AuthorUsername = "kjanat";
 * const username: AuthorUsername = { github: "kjanat" };
 * ```
 */
type AuthorUsername =
  | UserName
  | {
      /** GitHub username */
      github?: UserName;
      /** Twitter username */
      twitter?: UserName;
      /** Discord username */
      discord?: UserName;
    };

export const siteConfig = {
  /** Site name displayed in header and metadata */
  name: "CodonCanvas",

  /** Tagline/description */
  tagline: {
    /** Short tagline for use in mobile */
    short: "DNA Programming",
    /** Long tagline for use in desktop */
    long: "DNA-Inspired Visual Programming Language",
  },

  /** Full description for SEO/metadata */
  description:
    "An educational genetic programming platform that uses DNA-like triplets called codons to create visual programs.",

  /** Author information */
  author: {
    /** Author name */
    name: "Kaj Kowalski",
    /** Author username */
    username: {
      github: "kjanat",
    } as AuthorUsername,
  },

  /** Repository links */
  repo: {
    url: "https://github.com/kjanat/codoncanvas",
    issues: "https://github.com/kjanat/codoncanvas/issues",
  },

  /** Version badge text (shown next to logo) */
  badge: "DNA",
} as const;

export function getAuthorSocialUrl(
  author: typeof siteConfig.author,
  platform: "github" | "twitter" | "discord",
): string | undefined {
  const { username } = author;
  if (!username) return undefined;

  const handle = typeof username === "string" ? username : username[platform];

  if (!handle) return undefined;

  switch (platform) {
    case "github":
      return `https://github.com/${handle}`;
    case "twitter":
      return `https://twitter.com/${handle}`;
    case "discord":
      // Discord doesn't have a standard profile URL structure like the others
      return handle;
  }
}

export type SiteConfig = typeof siteConfig;

/**
 * Get tagline string from tagline config.
 * Handles both string and object forms.
 *
 * @param tagline - Tagline config (string or { short, long })
 * @param variant - Which variant to return ("short" | "long"), defaults to "long"
 * @returns The tagline string
 */
export function getTagline(
  tagline: Tagline,
  variant: "short" | "long" = "long",
): string {
  if (typeof tagline === "string") {
    return tagline;
  }
  return tagline[variant];
}
