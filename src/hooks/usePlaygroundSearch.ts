/**
 * usePlaygroundSearch - TanStack Router integration for Playground URL search params
 *
 * Replaces manual window.location manipulation with type-safe router hooks.
 * Handles example selection and genome sharing via URL parameters.
 */

import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

/** URL parameter key for encoded genome */
const GENOME_PARAM = "g";

/** Encode genome string to URL-safe base64 */
function encodeGenome(genome: string): string {
  try {
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
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return decodeURIComponent(atob(base64));
  } catch {
    return null;
  }
}

export interface UsePlaygroundSearchReturn {
  /** Example key from URL (e.g., "spiral") */
  exampleFromUrl: string | undefined;
  /** Decoded genome from URL share param */
  sharedGenome: string | null;
  /** Whether a shared genome exists in URL */
  hasSharedGenome: boolean;
  /** Set example param in URL */
  setExampleParam: (key: string) => void;
  /** Clear example param from URL */
  clearExampleParam: () => void;
  /** Copy shareable URL with encoded genome to clipboard */
  copyShareUrl: (genome: string) => Promise<boolean>;
  /** Get shareable URL for a genome (without copying) */
  getShareUrl: (genome: string) => string;
}

/**
 * Hook for managing Playground URL search parameters via TanStack Router.
 *
 * @example
 * ```tsx
 * const { exampleFromUrl, sharedGenome, setExampleParam, copyShareUrl } = usePlaygroundSearch();
 *
 * // Load initial genome based on URL
 * const initialGenome = sharedGenome ?? exampleGenome ?? defaultGenome;
 *
 * // Update URL when example changes
 * const handleExampleChange = (key: string) => {
 *   setExampleParam(key);
 * };
 * ```
 */
export function usePlaygroundSearch(): UsePlaygroundSearchReturn {
  // Read search params from router (type-safe via route's validateSearch)
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  // Decode shared genome from URL param
  const sharedGenome = useMemo(() => {
    if (!search.g) return null;
    return decodeGenome(search.g);
  }, [search.g]);

  // Set example param in URL
  const setExampleParam = useCallback(
    (key: string) => {
      navigate({
        search: (prev) => ({
          ...prev,
          example: key,
          // Clear genome param when selecting an example
          g: undefined,
        }),
      });
    },
    [navigate],
  );

  // Clear example param from URL
  const clearExampleParam = useCallback(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        example: undefined,
      }),
    });
  }, [navigate]);

  // Get shareable URL for a genome
  const getShareUrl = useCallback((genome: string): string => {
    const encoded = encodeGenome(genome);
    if (!encoded) return window.location.href;

    const url = new URL(window.location.href);
    url.searchParams.set(GENOME_PARAM, encoded);
    // Clear example param when sharing a genome
    url.searchParams.delete("example");
    return url.toString();
  }, []);

  // Copy shareable URL to clipboard
  const copyShareUrl = useCallback(
    async (genome: string): Promise<boolean> => {
      const url = getShareUrl(genome);
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        return false;
      }
    },
    [getShareUrl],
  );

  return {
    exampleFromUrl: search.example,
    sharedGenome,
    hasSharedGenome: sharedGenome !== null,
    setExampleParam,
    clearExampleParam,
    copyShareUrl,
    getShareUrl,
  };
}

export default usePlaygroundSearch;
