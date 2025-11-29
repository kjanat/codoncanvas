/**
 * Nucleotide Display Mode Module
 *
 * Provides educational toggle between DNA (T) and RNA (U) notation.
 * This is a display-only transformation - internal execution always uses DNA.
 *
 * @module
 */

// Note: dnaCodonToRna/rnaCodonToDna available in @/types/genetics for codon-level operations

// ============ TYPES ============

/**
 * Nucleotide display mode.
 * - "DNA": Show thymine (T) - default
 * - "RNA": Show uracil (U) - for transcription teaching
 */
export type NucleotideDisplayMode = "DNA" | "RNA";

// ============ STATE ============

/** Current display mode */
let currentMode: NucleotideDisplayMode = "DNA";

/** Registered listeners for mode changes */
const listeners: Set<(mode: NucleotideDisplayMode) => void> = new Set();

// ============ CORE FUNCTIONS ============

/**
 * Get the current nucleotide display mode.
 *
 * @returns Current mode ("DNA" or "RNA")
 */
export function getNucleotideDisplayMode(): NucleotideDisplayMode {
  return currentMode;
}

/**
 * Set the nucleotide display mode.
 *
 * @param mode - New display mode
 */
export function setNucleotideDisplayMode(mode: NucleotideDisplayMode): void {
  if (currentMode !== mode) {
    currentMode = mode;
    notifyListeners();
  }
}

/**
 * Toggle between DNA and RNA display modes.
 *
 * @returns New mode after toggle
 */
export function toggleNucleotideDisplayMode(): NucleotideDisplayMode {
  currentMode = currentMode === "DNA" ? "RNA" : "DNA";
  notifyListeners();
  return currentMode;
}

// ============ TEXT TRANSFORMATION ============

/**
 * Transform genome text for display based on current mode.
 *
 * @param text - Genome text (internally stored as DNA)
 * @returns Transformed text for display
 *
 * @example
 * ```typescript
 * // In DNA mode
 * transformForDisplay("ATG GGA TAA") // => "ATG GGA TAA"
 *
 * // In RNA mode
 * transformForDisplay("ATG GGA TAA") // => "AUG GGA UAA"
 * ```
 */
export function transformForDisplay(text: string): string {
  if (currentMode === "RNA") {
    return text.replace(/T/g, "U");
  }
  return text;
}

/**
 * Transform display text back to internal DNA format.
 *
 * @param text - Display text (may contain U if in RNA mode)
 * @returns Normalized DNA text
 *
 * @example
 * ```typescript
 * transformFromDisplay("AUG GGA UAA") // => "ATG GGA TAA"
 * transformFromDisplay("ATG GGA TAA") // => "ATG GGA TAA"
 * ```
 */
export function transformFromDisplay(text: string): string {
  // Always normalize U to T for internal storage
  return text.replace(/U/g, "T");
}

/**
 * Transform a single codon for display.
 *
 * @param codon - DNA codon
 * @returns Codon in current display mode
 */
export function transformCodonForDisplay(codon: string): string {
  if (currentMode === "RNA" && codon.length === 3) {
    return codon.replace(/T/g, "U");
  }
  return codon;
}

// ============ LISTENER MANAGEMENT ============

/**
 * Register a callback to be notified when display mode changes.
 *
 * @param listener - Callback function
 * @returns Unsubscribe function
 *
 * @example
 * ```typescript
 * const unsubscribe = onNucleotideDisplayModeChange((mode) => {
 *   console.log(`Switched to ${mode} mode`);
 *   updateUI();
 * });
 *
 * // Later, to stop listening:
 * unsubscribe();
 * ```
 */
export function onNucleotideDisplayModeChange(
  listener: (mode: NucleotideDisplayMode) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners of mode change.
 */
function notifyListeners(): void {
  for (const listener of listeners) {
    listener(currentMode);
  }
}

// ============ UI HELPERS ============

/**
 * Get display text for the mode toggle button.
 *
 * @param mode - Current mode
 * @returns Button label text
 */
export function getModeButtonLabel(mode: NucleotideDisplayMode): string {
  return mode === "DNA" ? "🧬 DNA" : "🔬 RNA";
}

/**
 * Get tooltip text for the mode toggle button.
 *
 * @param mode - Current mode
 * @returns Button tooltip
 */
export function getModeButtonTooltip(mode: NucleotideDisplayMode): string {
  return mode === "DNA"
    ? "Click to switch to RNA notation (T becomes U)"
    : "Click to switch to DNA notation (U becomes T)";
}

/**
 * Get status message for mode change.
 *
 * @param mode - New mode
 * @returns Status message
 */
export function getModeStatusMessage(mode: NucleotideDisplayMode): string {
  return mode === "DNA"
    ? "Switched to DNA notation (thymine = T)"
    : "Switched to RNA notation (uracil = U)";
}

// ============ EDUCATIONAL HELPERS ============

/**
 * Get educational context for current mode.
 */
export interface NucleotideModeInfo {
  /** Current mode */
  mode: NucleotideDisplayMode;
  /** Base letter used (T or U) */
  baseLetter: "T" | "U";
  /** Full base name */
  baseName: "Thymine" | "Uracil";
  /** Nucleic acid type */
  nucleicAcid: "DNA" | "RNA";
  /** Educational description */
  description: string;
  /** Real biology context */
  biologicalContext: string;
}

/**
 * Get educational information about current display mode.
 *
 * @returns Educational context for UI display
 */
export function getNucleotideModeInfo(): NucleotideModeInfo {
  if (currentMode === "DNA") {
    return {
      mode: "DNA",
      baseLetter: "T",
      baseName: "Thymine",
      nucleicAcid: "DNA",
      description: "DNA uses Thymine (T) as one of its four bases.",
      biologicalContext:
        "DNA is the storage molecule in the cell nucleus. It contains the genetic instructions.",
    };
  }
  return {
    mode: "RNA",
    baseLetter: "U",
    baseName: "Uracil",
    nucleicAcid: "RNA",
    description: "RNA uses Uracil (U) instead of Thymine.",
    biologicalContext:
      "In cells, DNA is transcribed to mRNA. During transcription, T becomes U.",
  };
}
