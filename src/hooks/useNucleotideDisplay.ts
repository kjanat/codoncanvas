/**
 * useNucleotideDisplay - Nucleotide display mode management
 *
 * Handles toggling between DNA/RNA/Amino Acid display modes
 * and transforming genome strings for display.
 */

import { useCallback, useState } from "react";
import {
  getNucleotideDisplayMode,
  type NucleotideDisplayMode,
  toggleNucleotideDisplayMode,
  transformForDisplay,
  transformFromDisplay,
} from "@/utils/nucleotide-display";

export interface UseNucleotideDisplayReturn {
  /** Current display mode */
  mode: NucleotideDisplayMode;
  /** Toggle to next display mode */
  toggle: () => void;
  /** Transform genome string for display in current mode */
  toDisplay: (genome: string) => string;
  /** Transform displayed string back to canonical genome format */
  fromDisplay: (displayed: string) => string;
}

/**
 * Hook for managing nucleotide display mode.
 *
 * @example
 * ```tsx
 * const { mode, toggle, toDisplay, fromDisplay } = useNucleotideDisplay();
 *
 * // Show genome in current mode
 * const displayedGenome = toDisplay(genome);
 *
 * // Handle input changes
 * const handleChange = (e) => {
 *   const canonical = fromDisplay(e.target.value);
 *   setGenome(canonical);
 * };
 *
 * // Toggle mode button
 * <button onClick={toggle}>{mode}</button>
 * ```
 */
export function useNucleotideDisplay(): UseNucleotideDisplayReturn {
  const [mode, setMode] = useState<NucleotideDisplayMode>(
    getNucleotideDisplayMode,
  );

  const toggle = useCallback(() => {
    setMode(toggleNucleotideDisplayMode());
  }, []);

  const toDisplay = useCallback((genome: string) => {
    return transformForDisplay(genome);
  }, []);

  const fromDisplay = useCallback((displayed: string) => {
    return transformFromDisplay(displayed);
  }, []);

  return {
    mode,
    toggle,
    toDisplay,
    fromDisplay,
  };
}

export default useNucleotideDisplay;
