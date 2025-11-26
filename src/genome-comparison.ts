/**
 * @fileoverview Genome comparison tools for educational analysis.
 * Provides detailed metrics for comparing two arbitrary genomes.
 *
 * Use Cases:
 * - Compare student solutions to reference implementations
 * - Measure genetic distance between genomes
 * - Find minimal mutation paths
 * - Analyze solution diversity in research studies
 */

import { CodonLexer } from "./lexer";
import { compareGenomes } from "./mutations";
import { Canvas2DRenderer } from "./renderer";
import { CodonVM } from "./vm";

/**
 * Detailed comparison result with educational metrics
 */
export interface GenomeComparisonResult {
  /** Codon-level comparison (from mutations.ts) */
  codons: {
    original: string[];
    mutated: string[];
    differences: Array<{ position: number; original: string; mutated: string }>;
  };

  /** Sequence similarity metrics */
  metrics: {
    /** Percentage of codons that differ (0-100) */
    codonDifferencePercent: number;
    /** Hamming distance (number of differing positions) */
    hammingDistance: number;
    /** Length difference (positive = second longer, negative = first longer) */
    lengthDifference: number;
    /** Percentage of visual output that differs (0-100) */
    pixelDifferencePercent: number;
    /** Total codons in longer sequence */
    maxLength: number;
  };

  /** Visual rendering comparison */
  visual: {
    /** Data URL for first genome's output */
    originalCanvas: string;
    /** Data URL for second genome's output */
    mutatedCanvas: string;
    /** Were both genomes valid and renderable? */
    bothValid: boolean;
  };

  /** Human-readable analysis */
  analysis: {
    /** Overall similarity classification */
    similarity:
      | "identical"
      | "very-similar"
      | "similar"
      | "different"
      | "very-different";
    /** Key differences summary */
    description: string;
    /** Educational insights */
    insights: string[];
  };
}

/**
 * Calculate Hamming distance between two codon arrays.
 * Hamming distance = number of positions at which codons differ.
 *
 * @param codons1 - First codon array
 * @param codons2 - Second codon array
 * @returns Number of differing positions
 */
function calculateHammingDistance(
  codons1: string[],
  codons2: string[],
): number {
  const maxLength = Math.max(codons1.length, codons2.length);
  let distance = 0;

  for (let i = 0; i < maxLength; i++) {
    if (codons1[i] !== codons2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Calculate pixel-level difference between two rendered genomes.
 * Uses same algorithm as mutation-predictor.ts for consistency.
 *
 * @param genome1 - First genome string
 * @param genome2 - Second genome string
 * @param width - Canvas width (default 300)
 * @param height - Canvas height (default 300)
 * @returns Percentage of pixels that differ (0-100)
 */
function calculatePixelDifference(
  genome1: string,
  genome2: string,
  width: number = 300,
  height: number = 300,
): number {
  const lexer = new CodonLexer();

  try {
    // Render both genomes
    const tokens1 = lexer.tokenize(genome1);
    const tokens2 = lexer.tokenize(genome2);

    const canvas1 = document.createElement("canvas");
    canvas1.width = width;
    canvas1.height = height;
    const renderer1 = new Canvas2DRenderer(canvas1);
    const vm1 = new CodonVM(renderer1);
    vm1.run(tokens1);

    const canvas2 = document.createElement("canvas");
    canvas2.width = width;
    canvas2.height = height;
    const renderer2 = new Canvas2DRenderer(canvas2);
    const vm2 = new CodonVM(renderer2);
    vm2.run(tokens2);

    // Compare pixels
    const ctx1 = canvas1.getContext("2d")!;
    const ctx2 = canvas2.getContext("2d")!;
    const imageData1 = ctx1.getImageData(0, 0, width, height);
    const imageData2 = ctx2.getImageData(0, 0, width, height);

    let differentPixels = 0;
    const totalPixels = width * height;
    const threshold = 10; // RGB difference threshold

    for (let i = 0; i < imageData1.data.length; i += 4) {
      const r1 = imageData1.data[i];
      const g1 = imageData1.data[i + 1];
      const b1 = imageData1.data[i + 2];
      const r2 = imageData2.data[i];
      const g2 = imageData2.data[i + 1];
      const b2 = imageData2.data[i + 2];

      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      if (diff > threshold) {
        differentPixels++;
      }
    }

    return (differentPixels / totalPixels) * 100;
  } catch (error) {
    // If either genome is invalid, return 100% difference
    return 100;
  }
}

/**
 * Classify similarity level based on codon difference percentage
 */
function classifySimilarity(
  codonDiffPercent: number,
): "identical" | "very-similar" | "similar" | "different" | "very-different" {
  if (codonDiffPercent === 0) return "identical";
  if (codonDiffPercent < 10) return "very-similar";
  if (codonDiffPercent < 30) return "similar";
  if (codonDiffPercent < 60) return "different";
  return "very-different";
}

/**
 * Generate human-readable description of comparison
 */
function generateDescription(
  codonDiff: number,
  pixelDiff: number,
  lengthDiff: number,
  similarity: string,
): string {
  const parts: string[] = [];

  // Similarity level
  if (similarity === "identical") {
    return "The genomes are identical - no differences detected.";
  }

  parts.push(`The genomes are ${similarity.replace("-", " ")}`);

  // Sequence differences
  if (codonDiff > 0) {
    parts.push(`${codonDiff.toFixed(1)}% of codons differ`);
  }

  // Visual differences
  if (pixelDiff === 0) {
    parts.push("producing identical visual output (synonymous changes only)");
  } else if (pixelDiff < 5) {
    parts.push("with minimal visual differences");
  } else if (pixelDiff < 30) {
    parts.push(`with ${pixelDiff.toFixed(1)}% visual change`);
  } else {
    parts.push(
      `producing substantially different output (${pixelDiff.toFixed(
        1,
      )}% pixels differ)`,
    );
  }

  // Length differences
  if (lengthDiff !== 0) {
    const longer = lengthDiff > 0 ? "second" : "first";
    parts.push(
      `The ${longer} genome is ${Math.abs(lengthDiff)} codon${
        Math.abs(lengthDiff) === 1 ? "" : "s"
      } longer`,
    );
  }

  return parts.join(". ") + ".";
}

/**
 * Generate educational insights from comparison
 */
function generateInsights(
  codonDiff: number,
  pixelDiff: number,
  differences: Array<{ position: number; original: string; mutated: string }>,
): string[] {
  const insights: string[] = [];

  // Silent mutations detected
  if (codonDiff > 0 && pixelDiff < 5) {
    insights.push(
      "💡 Silent mutations detected: sequence changes without visual effect (synonymous codons)",
    );
  }

  // Frameshift detection
  const hasFrameshift = differences.some((d) => !d.original || !d.mutated);
  if (hasFrameshift) {
    insights.push(
      "⚠️ Frameshift detected: length mismatch indicates insertion/deletion mutations",
    );
  }

  // Localized changes
  if (differences.length > 0 && differences.length < 5 && pixelDiff < 30) {
    insights.push(
      "🎯 Localized changes: few codon differences with moderate visual impact",
    );
  }

  // Catastrophic differences
  if (pixelDiff > 70) {
    insights.push(
      "🔴 Catastrophic differences: genomes produce very different outputs",
    );
  }

  // High similarity
  if (codonDiff < 10 && pixelDiff < 10) {
    insights.push(
      "✅ High similarity: genomes are very close, possibly minor variations of same design",
    );
  }

  // No insights needed for identical
  if (codonDiff === 0 && pixelDiff === 0) {
    return ["✨ Perfect match: genomes are identical"];
  }

  return insights.length > 0
    ? insights
    : ["📊 Mixed changes: combination of sequence and visual differences"];
}

/**
 * Render both genomes and return data URLs for comparison
 */
function renderBothGenomes(
  genome1: string,
  genome2: string,
  width: number = 300,
  height: number = 300,
): { canvas1: string; canvas2: string; bothValid: boolean } {
  const lexer = new CodonLexer();
  let bothValid = true;

  // Render first genome
  let canvas1DataURL = "";
  try {
    const tokens1 = lexer.tokenize(genome1);
    const canvas1 = document.createElement("canvas");
    canvas1.width = width;
    canvas1.height = height;
    const renderer1 = new Canvas2DRenderer(canvas1);
    const vm1 = new CodonVM(renderer1);
    vm1.run(tokens1);
    canvas1DataURL = canvas1.toDataURL();
  } catch (error) {
    bothValid = false;
    // Create blank canvas for invalid genome
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas1DataURL = canvas.toDataURL();
  }

  // Render second genome
  let canvas2DataURL = "";
  try {
    const tokens2 = lexer.tokenize(genome2);
    const canvas2 = document.createElement("canvas");
    canvas2.width = width;
    canvas2.height = height;
    const renderer2 = new Canvas2DRenderer(canvas2);
    const vm2 = new CodonVM(renderer2);
    vm2.run(tokens2);
    canvas2DataURL = canvas2.toDataURL();
  } catch (error) {
    bothValid = false;
    // Create blank canvas for invalid genome
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas2DataURL = canvas.toDataURL();
  }

  return {
    canvas1: canvas1DataURL,
    canvas2: canvas2DataURL,
    bothValid,
  };
}

/**
 * Compare two genomes with detailed educational metrics.
 *
 * Main entry point for genome comparison functionality.
 * Combines sequence analysis, visual comparison, and educational insights.
 *
 * @param genome1 - First genome string (can include comments/whitespace)
 * @param genome2 - Second genome string (can include comments/whitespace)
 * @param options - Optional configuration
 * @returns Detailed comparison result with metrics and insights
 *
 * @example
 * ```typescript
 * const result = compareGenomesDetailed(studentGenome, referenceGenome);
 * console.log(result.metrics.codonDifferencePercent); // e.g., 12.5
 * console.log(result.analysis.description); // Human-readable summary
 * ```
 */
export function compareGenomesDetailed(
  genome1: string,
  genome2: string,
  options: { canvasWidth?: number; canvasHeight?: number } = {},
): GenomeComparisonResult {
  const { canvasWidth = 300, canvasHeight = 300 } = options;

  // Codon-level comparison
  const codonComparison = compareGenomes(genome1, genome2);
  const { originalCodons, mutatedCodons, differences } = codonComparison;

  // Calculate metrics
  const maxLength = Math.max(originalCodons.length, mutatedCodons.length);
  const hammingDistance = calculateHammingDistance(
    originalCodons,
    mutatedCodons,
  );
  const codonDifferencePercent =
    maxLength > 0 ? (hammingDistance / maxLength) * 100 : 0;
  const lengthDifference = mutatedCodons.length - originalCodons.length;
  const pixelDifferencePercent = calculatePixelDifference(
    genome1,
    genome2,
    canvasWidth,
    canvasHeight,
  );

  // Visual comparison
  const visual = renderBothGenomes(genome1, genome2, canvasWidth, canvasHeight);

  // Analysis
  const similarity = classifySimilarity(codonDifferencePercent);
  const description = generateDescription(
    codonDifferencePercent,
    pixelDifferencePercent,
    lengthDifference,
    similarity,
  );
  const insights = generateInsights(
    codonDifferencePercent,
    pixelDifferencePercent,
    differences,
  );

  return {
    codons: {
      original: originalCodons,
      mutated: mutatedCodons,
      differences,
    },
    metrics: {
      codonDifferencePercent,
      hammingDistance,
      lengthDifference,
      pixelDifferencePercent,
      maxLength,
    },
    visual: {
      originalCanvas: visual.canvas1,
      mutatedCanvas: visual.canvas2,
      bothValid: visual.bothValid,
    },
    analysis: {
      similarity,
      description,
      insights,
    },
  };
}
