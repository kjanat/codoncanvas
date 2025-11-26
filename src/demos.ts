/**
 * Mutation Demonstrations
 *
 * Renders side-by-side comparisons of mutation effects for educational purposes.
 * Shows before/after visualizations of silent, missense, nonsense, and frameshift mutations.
 */

import { CodonLexer } from "./lexer";
import {
  applyFrameshiftMutation,
  applyMissenseMutation,
  applyNonsenseMutation,
  applySilentMutation,
} from "./mutations";
import { Canvas2DRenderer } from "./renderer";
import { injectShareStyles, ShareSystem } from "./share-system";
import { CodonVM } from "./vm";

// Demo genome examples
const DEMO_GENOMES = {
  // Simple enough to see clear effects, complex enough to be interesting
  silent: "ATG GAA AGG GGA GAA CCC GAA AAA ACA GAA AGG GGA TAA",
  missense: "ATG GAA AGG GGA GAA CCC GAA AAA ACA GAA AGG CCA TAA",
  nonsense: "ATG GAA AGG GGA GAA CCC GAA AAA ACA GAA AGG GGA GAA AGG CCA TAA",
  frameshift: "ATG GAA AGG GGA GAA CCC ACA GAA AGG CCA TAA",
};

/**
 * Highlight specific codons in the genome display
 */
function highlightGenome(
  genome: string,
  mutatedIndices: number[],
  affectedIndices: number[] = [],
): DocumentFragment {
  const codons = genome.split(/\s+/).filter((c) => c.length > 0);
  const fragment = document.createDocumentFragment();

  codons.forEach((codon, idx) => {
    let className = "codon";

    // Special highlighting for START/STOP
    if (codon === "ATG") {
      className += " start";
    } else if (codon === "TAA" || codon === "TAG" || codon === "TGA") {
      className += " stop";
    }

    // Mutation highlighting
    if (mutatedIndices.includes(idx)) {
      className += " mutated";
    } else if (affectedIndices.includes(idx)) {
      className += " affected";
    }

    const span = document.createElement("span");
    span.className = className;
    span.textContent = codon; // SAFE: textContent auto-escapes
    fragment.appendChild(span);

    if (idx < codons.length - 1) {
      fragment.appendChild(document.createTextNode(" "));
    }
  });

  return fragment;
}

/**
 * Render a genome to a canvas
 */
function renderGenome(genome: string, canvasId: string): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  const lexer = new CodonLexer();
  const renderer = new Canvas2DRenderer(canvas);
  const vm = new CodonVM(renderer);

  try {
    const tokens = lexer.tokenize(genome);
    vm.reset();
    vm.run(tokens);
  } catch (error) {
    // Draw error indicator on canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f48771";
      ctx.font = "12px monospace";
      ctx.fillText("Render Error", 10, 100);
    }
  }
}

/**
 * Setup Silent Mutation Demo
 */
function setupSilentDemo(): void {
  const original = DEMO_GENOMES.silent;

  // Apply silent mutation (should change codon but not effect)
  const result = applySilentMutation(original);
  const mutated = result.mutated;

  // Find which codon changed
  const originalCodons = original.split(/\s+/).filter((c) => c.length > 0);
  const mutatedCodons = mutated.split(/\s+/).filter((c) => c.length > 0);
  const mutatedIndex = originalCodons.findIndex(
    (c, i) => c !== mutatedCodons[i],
  );

  // Display code with highlighting
  const originalDisplay = document.getElementById("silent-original");
  const mutatedDisplay = document.getElementById("silent-mutated");

  if (originalDisplay) {
    originalDisplay.textContent = ""; // Clear safely
    originalDisplay.appendChild(highlightGenome(original, []));
  }

  if (mutatedDisplay) {
    mutatedDisplay.textContent = ""; // Clear safely
    mutatedDisplay.appendChild(highlightGenome(mutated, [mutatedIndex]));
  }

  // Render canvases
  renderGenome(original, "canvas-silent-original");
  renderGenome(mutated, "canvas-silent-mutated");
}

/**
 * Setup Missense Mutation Demo
 */
function setupMissenseDemo(): void {
  const original = DEMO_GENOMES.missense;

  // Apply missense mutation (should change shape)
  const result = applyMissenseMutation(original);
  const mutated = result.mutated;

  // Find which codon changed
  const originalCodons = original.split(/\s+/).filter((c) => c.length > 0);
  const mutatedCodons = mutated.split(/\s+/).filter((c) => c.length > 0);
  const mutatedIndex = originalCodons.findIndex(
    (c, i) => c !== mutatedCodons[i],
  );

  // Display code with highlighting
  const originalDisplay = document.getElementById("missense-original");
  const mutatedDisplay = document.getElementById("missense-mutated");

  if (originalDisplay) {
    originalDisplay.textContent = ""; // Clear safely
    originalDisplay.appendChild(highlightGenome(original, []));
  }

  if (mutatedDisplay) {
    mutatedDisplay.textContent = ""; // Clear safely
    mutatedDisplay.appendChild(highlightGenome(mutated, [mutatedIndex]));
  }

  // Render canvases
  renderGenome(original, "canvas-missense-original");
  renderGenome(mutated, "canvas-missense-mutated");
}

/**
 * Setup Nonsense Mutation Demo
 */
function setupNonsenseDemo(): void {
  const original = DEMO_GENOMES.nonsense;

  // Apply nonsense mutation (should introduce early STOP)
  const result = applyNonsenseMutation(original);
  const mutated = result.mutated;

  // Find which codon changed to STOP
  const originalCodons = original.split(/\s+/).filter((c) => c.length > 0);
  const mutatedCodons = mutated.split(/\s+/).filter((c) => c.length > 0);
  const mutatedIndex = originalCodons.findIndex(
    (c, i) => c !== mutatedCodons[i],
  );

  // All codons after the STOP are affected (never executed)
  const affectedIndices = Array.from(
    { length: mutatedCodons.length - mutatedIndex - 1 },
    (_, i) => mutatedIndex + i + 1,
  );

  // Display code with highlighting
  const originalDisplay = document.getElementById("nonsense-original");
  const mutatedDisplay = document.getElementById("nonsense-mutated");

  if (originalDisplay) {
    originalDisplay.textContent = ""; // Clear safely
    originalDisplay.appendChild(highlightGenome(original, []));
  }

  if (mutatedDisplay) {
    mutatedDisplay.textContent = ""; // Clear safely
    mutatedDisplay.appendChild(highlightGenome(
      mutated,
      [mutatedIndex],
      affectedIndices,
    ));
  }

  // Render canvases
  renderGenome(original, "canvas-nonsense-original");
  renderGenome(mutated, "canvas-nonsense-mutated");
}

/**
 * Setup Frameshift Mutation Demo
 */
function setupFrameshiftDemo(): void {
  const original = DEMO_GENOMES.frameshift;

  // Apply frameshift mutation (should scramble everything downstream)
  const result = applyFrameshiftMutation(original);
  const mutated = result.mutated;

  // Find where the frameshift occurred by comparing sequences
  const originalBases = original.replace(/\s/g, "");
  const mutatedBases = mutated.replace(/\s/g, "");

  // Find first difference in base sequence
  let frameshiftPosition = 0;
  for (
    let i = 0;
    i < Math.min(originalBases.length, mutatedBases.length);
    i++
  ) {
    if (originalBases[i] !== mutatedBases[i]) {
      frameshiftPosition = i;
      break;
    }
  }

  // Convert base position to codon index
  const frameshiftCodonIndex = Math.floor(frameshiftPosition / 3);

  // All codons from frameshift onwards are affected
  const originalCodons = original.split(/\s+/).filter((c) => c.length > 0);
  const mutatedCodons = mutated.split(/\s+/).filter((c) => c.length > 0);

  const affectedIndices = Array.from(
    { length: mutatedCodons.length - frameshiftCodonIndex },
    (_, i) => frameshiftCodonIndex + i,
  );

  // Display code with highlighting
  const originalDisplay = document.getElementById("frameshift-original");
  const mutatedDisplay = document.getElementById("frameshift-mutated");

  if (originalDisplay) {
    originalDisplay.textContent = ""; // Clear safely
    originalDisplay.appendChild(highlightGenome(original, []));
  }

  if (mutatedDisplay) {
    mutatedDisplay.textContent = ""; // Clear safely
    mutatedDisplay.appendChild(highlightGenome(mutated, [], affectedIndices));
  }

  // Render canvases
  renderGenome(original, "canvas-frameshift-original");
  renderGenome(mutated, "canvas-frameshift-mutated");
}

/**
 * Initialize all demos
 */
function initializeDemos(): void {
  try {
    setupSilentDemo();
    setupMissenseDemo();
    setupNonsenseDemo();
    setupFrameshiftDemo();

    // Initialize share system
    initializeShareSystem();
  } catch (error) {
    // Initialization error - fail silently
  }
}

/**
 * Initialize share system for demos page
 */
function initializeShareSystem(): void {
  const shareContainer = document.getElementById("shareContainer");
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
