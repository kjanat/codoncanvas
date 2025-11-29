/**
 * Mutation Demonstrations
 *
 * Renders side-by-side comparisons of mutation effects for educational purposes.
 * Shows before/after visualizations of silent, missense, nonsense, and frameshift mutations.
 */

import {
  DEMO_GENOMES,
  highlightGenome,
  renderGenomeToCanvas,
} from "@/demos/demos-core";
import { getMutationByType } from "@/genetics/mutations";
import type { MutationType } from "@/types";
import { injectShareStyles, ShareSystem } from "@/ui/share-system";

/**
 * Render a genome to a canvas by ID
 */
function renderGenome(genome: string, canvasId: string): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  renderGenomeToCanvas(genome, canvas);
}

/**
 * Parse genome into codons array
 */
function parseCodons(genome: string): string[] {
  return genome.split(/\s+/).filter((c) => c.length > 0);
}

/**
 * Find the first codon index where original and mutated differ
 */
function findMutatedIndex(
  originalCodons: string[],
  mutatedCodons: string[],
): number {
  return originalCodons.findIndex((c, i) => c !== mutatedCodons[i]);
}

/**
 * Update display elements with genome highlighting
 */
function updateDisplayElements(
  prefix: string,
  original: string,
  mutated: string,
  mutatedIndices: number[],
  affectedIndices: number[] = [],
): void {
  const originalDisplay = document.getElementById(`${prefix}-original`);
  const mutatedDisplay = document.getElementById(`${prefix}-mutated`);

  if (originalDisplay) {
    originalDisplay.textContent = "";
    originalDisplay.appendChild(highlightGenome(original, []));
  }

  if (mutatedDisplay) {
    mutatedDisplay.textContent = "";
    mutatedDisplay.appendChild(
      highlightGenome(mutated, mutatedIndices, affectedIndices),
    );
  }
}

/**
 * Setup a basic mutation demo (silent or missense)
 */
function setupBasicMutationDemo(
  mutationType: MutationType,
  genomeKey: keyof typeof DEMO_GENOMES,
  prefix: string,
): void {
  const original = DEMO_GENOMES[genomeKey];
  const result = getMutationByType(mutationType, original);
  const mutated = result.mutated;

  const originalCodons = parseCodons(original);
  const mutatedCodons = parseCodons(mutated);
  const mutatedIndex = findMutatedIndex(originalCodons, mutatedCodons);

  updateDisplayElements(prefix, original, mutated, [mutatedIndex]);
  renderGenome(original, `canvas-${prefix}-original`);
  renderGenome(mutated, `canvas-${prefix}-mutated`);
}

/**
 * Setup nonsense mutation demo (with downstream affected codons)
 */
function setupNonsenseDemo(): void {
  const original = DEMO_GENOMES.nonsense;
  const result = getMutationByType("nonsense", original);
  const mutated = result.mutated;

  const originalCodons = parseCodons(original);
  const mutatedCodons = parseCodons(mutated);
  const mutatedIndex = findMutatedIndex(originalCodons, mutatedCodons);

  // All codons after the STOP are affected (never executed)
  const affectedIndices = Array.from(
    { length: mutatedCodons.length - mutatedIndex - 1 },
    (_, i) => mutatedIndex + i + 1,
  );

  updateDisplayElements(
    "nonsense",
    original,
    mutated,
    [mutatedIndex],
    affectedIndices,
  );
  renderGenome(original, "canvas-nonsense-original");
  renderGenome(mutated, "canvas-nonsense-mutated");
}

/**
 * Setup frameshift mutation demo (with all downstream affected)
 */
function setupFrameshiftDemo(): void {
  const original = DEMO_GENOMES.frameshift;
  const result = getMutationByType("frameshift", original);
  const mutated = result.mutated;

  // Find where the frameshift occurred by comparing base sequences
  const originalBases = original.replace(/\s/g, "");
  const mutatedBases = mutated.replace(/\s/g, "");

  let frameshiftPosition = 0;
  const minLen = Math.min(originalBases.length, mutatedBases.length);
  for (let i = 0; i < minLen; i++) {
    if (originalBases[i] !== mutatedBases[i]) {
      frameshiftPosition = i;
      break;
    }
  }

  const frameshiftCodonIndex = Math.floor(frameshiftPosition / 3);
  const mutatedCodons = parseCodons(mutated);

  const affectedIndices = Array.from(
    { length: mutatedCodons.length - frameshiftCodonIndex },
    (_, i) => frameshiftCodonIndex + i,
  );

  updateDisplayElements("frameshift", original, mutated, [], affectedIndices);
  renderGenome(original, "canvas-frameshift-original");
  renderGenome(mutated, "canvas-frameshift-mutated");
}

/**
 * Initialize all demos
 */
function initializeDemos(): void {
  try {
    setupBasicMutationDemo("silent", "silent", "silent");
    setupBasicMutationDemo("missense", "missense", "missense");
    setupNonsenseDemo();
    setupFrameshiftDemo();

    // Initialize share system
    initializeShareSystem();
  } catch (_error) {
    // Initialization error - fail silently
  }
}

/**
 * Initialize share system for demos page
 */
function initializeShareSystem(): void {
  const shareContainer = document.getElementById("share-container");
  if (!shareContainer) {
    return;
  }

  injectShareStyles();

  // Create a simple genome getter that returns all demo genomes as a formatted string
  const getAllDemoGenomes = (): string => {
    return `; CodonCanvas Mutation Demonstrations
; Four mutation types with visual examples

; 1. Silent Mutation (synonymous codon change)
${DEMO_GENOMES.silent}

; 2. Missense Mutation (different opcode)
${DEMO_GENOMES.missense}

; 3. Nonsense Mutation (early STOP)
${DEMO_GENOMES.nonsense}

; 4. Frameshift Mutation (reading frame shift)
${DEMO_GENOMES.frameshift}`;
  };

  new ShareSystem({
    containerElement: shareContainer,
    getGenome: getAllDemoGenomes,
    appTitle: "CodonCanvas Mutation Demos",
    showQRCode: true,
    socialPlatforms: ["twitter", "reddit", "email"],
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDemos);
} else {
  initializeDemos();
}
