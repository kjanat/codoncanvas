/**
 * Demo Core Module
 * Shared constants and pure functions for mutation demonstrations.
 * This module is DOM-free to allow easy testing.
 */

import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import { isStopCodon } from "@/data/amino-acids";

// Demo genome examples
export const DEMO_GENOMES = {
  // Simple enough to see clear effects, complex enough to be interesting
  silent: "ATG GAA AGG GGA GAA CCC GAA AAA ACA GAA AGG GGA TAA",
  missense: "ATG GAA AGG GGA GAA CCC GAA AAA ACA GAA AGG CCA TAA",
  nonsense: "ATG GAA AGG GGA GAA CCC GAA AAA ACA GAA AGG GGA GAA AGG CCA TAA",
  frameshift: "ATG GAA AGG GGA GAA CCC ACA GAA AGG CCA TAA",
};

/**
 * Highlight specific codons in the genome display
 */
export function highlightGenome(
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
    } else if (isStopCodon(codon)) {
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
 * Render a genome to a canvas element
 * @returns true if rendering succeeded, false on error
 */
export function renderGenomeToCanvas(
  genome: string,
  canvas: HTMLCanvasElement,
): boolean {
  const lexer = new CodonLexer();
  const renderer = new Canvas2DRenderer(canvas);
  const vm = new CodonVM(renderer);

  try {
    const tokens = lexer.tokenize(genome);
    vm.reset();
    vm.run(tokens);
    return true;
  } catch (_error) {
    // Draw error indicator on canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f48771";
      ctx.font = "12px monospace";
      ctx.fillText("Render Error", 10, 100);
    }
    return false;
  }
}
