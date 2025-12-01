/**
 * useShareUrl - React hook for shareable genome URLs
 *
 * Encodes/decodes genome strings to/from URL parameters for sharing.
 * Uses base64 encoding for compact representation.
 */

import { useEffect, useState } from "react";

/** URL parameter key for encoded genome */
const GENOME_PARAM = "g";

/** Encode genome string to URL-safe base64 */
function encodeGenome(genome: string): string {
  try {
    // Use btoa for base64, then make URL-safe
    return btoa(encodeURIComponent(genome))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return "";
  }
}

/** Decode URL-safe base64 to genome string */
function decodeGenome(encoded: string): string | null {
  try {
    // Restore standard base64 characters
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    return decodeURIComponent(atob(base64));
  } catch {
    return null;
  }
}

/** Options for useShareUrl hook */
export interface UseShareUrlOptions {
  /** Auto-load genome from URL on mount (default: true) */
  autoLoad?: boolean;
}

/** Return type of useShareUrl hook */
export interface UseShareUrlReturn {
  /** Genome loaded from URL (null if none) */
  sharedGenome: string | null;
  /** Generate shareable URL for a genome */
  getShareUrl: (genome: string) => string;
  /** Update URL with genome (adds to browser history) */
  shareGenome: (genome: string) => void;
  /** Copy share URL to clipboard */
  copyShareUrl: (genome: string) => Promise<boolean>;
  /** Clear genome from URL */
  clearShareUrl: () => void;
  /** Whether a shared genome was found in URL */
  hasSharedGenome: boolean;
}

/**
 * React hook for shareable genome URLs.
 *
 * @example
 * ```tsx
 * function Playground() {
 *   const { sharedGenome, shareGenome, copyShareUrl } = useShareUrl();
 *   const [genome, setGenome] = useState(sharedGenome ?? "ATG TAA");
 *
 *   return (
 *     <div>
 *       <textarea value={genome} onChange={(e) => setGenome(e.target.value)} />
 *       <button onClick={() => copyShareUrl(genome)}>Copy Share Link</button>
 *       <button onClick={() => shareGenome(genome)}>Update URL</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useShareUrl(
  options: UseShareUrlOptions = {},
): UseShareUrlReturn {
  const { autoLoad = true } = options;
  const [sharedGenome, setSharedGenome] = useState<string | null>(null);

  // Load genome from URL on mount
  useEffect(() => {
    if (!autoLoad) return;

    const url = new URL(window.location.href);
    const encoded = url.searchParams.get(GENOME_PARAM);
    if (encoded) {
      const decoded = decodeGenome(encoded);
      if (decoded) {
        setSharedGenome(decoded);
      }
    }
  }, [autoLoad]);

  // Generate shareable URL for a genome
  const getShareUrl = (genome: string): string => {
    const encoded = encodeGenome(genome);
    if (!encoded) return window.location.href;

    const url = new URL(window.location.href);
    url.searchParams.set(GENOME_PARAM, encoded);
    return url.toString();
  };

  // Update URL with genome
  const shareGenome = (genome: string) => {
    const encoded = encodeGenome(genome);
    if (encoded) {
      const url = new URL(window.location.href);
      url.searchParams.set(GENOME_PARAM, encoded);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Copy share URL to clipboard
  const copyShareUrl = async (genome: string): Promise<boolean> => {
    const url = getShareUrl(genome);
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };

  // Clear genome from URL
  const clearShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete(GENOME_PARAM);
    window.history.pushState({}, "", url.toString());
    setSharedGenome(null);
  };

  return {
    sharedGenome,
    getShareUrl,
    shareGenome,
    copyShareUrl,
    clearShareUrl,
    hasSharedGenome: sharedGenome !== null,
  };
}

export default useShareUrl;
