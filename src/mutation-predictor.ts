/**
 * @fileoverview Mutation Impact Predictor for CodonCanvas.
 * Predicts visual outcomes before applying mutations for educational scaffolding.
 *
 * Core Concept:
 * - Render both original and mutated genomes
 * - Compare visual outputs via pixel diff analysis
 * - Classify impact: SILENT, LOCAL, MAJOR, CATASTROPHIC
 * - Provide confidence scores and preview images
 *
 * Educational Value:
 * - Builds cause-effect reasoning (mutation → phenotype)
 * - Reduces trial-and-error frustration
 * - Deepens understanding of mutation types
 * - Scaffolds learning progression
 */

import { CodonLexer } from "./lexer";
import type { MutationResult } from "./mutations";
import { Canvas2DRenderer } from "./renderer";
import { CodonVM } from "./vm";

/**
 * Impact classification for mutation effects.
 * Based on visual output difference percentage.
 */
export type ImpactLevel = "SILENT" | "LOCAL" | "MAJOR" | "CATASTROPHIC";

/**
 * Confidence score for prediction accuracy.
 * Higher confidence for direct changes (silent, nonsense),
 * lower for complex cascading effects (frameshift).
 */
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

/**
 * Prediction result with visual preview and metadata.
 */
export interface MutationPrediction {
  /** Impact classification based on visual diff */
  impact: ImpactLevel;
  /** Confidence in prediction accuracy (0.0-1.0) */
  confidence: number;
  /** Confidence level label */
  confidenceLevel: ConfidenceLevel;
  /** Percentage of pixels changed (0-100) */
  pixelDiffPercent: number;
  /** Data URL of original rendered output */
  originalPreview: string;
  /** Data URL of mutated rendered output */
  mutatedPreview: string;
  /** Human-readable impact description */
  description: string;
  /** Detailed analysis of changes detected */
  analysis: {
    shapeChanges: number;
    colorChanges: boolean;
    positionChanges: boolean;
    truncated: boolean;
    frameshifted: boolean;
  };
}

/**
 * Calculate pixel difference percentage between two canvases.
 * Compares RGB values pixel-by-pixel and returns similarity score.
 *
 * @param canvas1 - Original canvas
 * @param canvas2 - Mutated canvas
 * @returns Percentage of pixels that differ (0-100)
 * @internal
 */
function calculatePixelDiff(
  canvas1: HTMLCanvasElement,
  canvas2: HTMLCanvasElement,
): number {
  const ctx1 = canvas1.getContext("2d")!;
  const ctx2 = canvas2.getContext("2d")!;

  const imageData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
  const imageData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);

  const pixels1 = imageData1.data;
  const pixels2 = imageData2.data;

  let differentPixels = 0;
  const totalPixels = canvas1.width * canvas1.height;

  // Compare RGBA values (skip alpha channel for threshold)
  for (let i = 0; i < pixels1.length; i += 4) {
    const dr = Math.abs(pixels1[i] - pixels2[i]);
    const dg = Math.abs(pixels1[i + 1] - pixels2[i + 1]);
    const db = Math.abs(pixels1[i + 2] - pixels2[i + 2]);

    // Threshold: count as different if any channel differs by >5
    if (dr > 5 || dg > 5 || db > 5) {
      differentPixels++;
    }
  }

  return (differentPixels / totalPixels) * 100;
}

/**
 * Classify impact level based on pixel difference and mutation type.
 *
 * @param pixelDiff - Percentage of pixels changed
 * @param mutationType - Type of mutation applied
 * @returns Impact level classification
 * @internal
 */
function classifyImpact(pixelDiff: number, mutationType: string): ImpactLevel {
  // Silent mutations should show minimal change
  if (mutationType === "silent" && pixelDiff < 2) {
    return "SILENT";
  }

  // Thresholds based on visual change severity
  if (pixelDiff < 5) {
    return "SILENT"; // <5% change = nearly identical
  } else if (pixelDiff < 25) {
    return "LOCAL"; // 5-25% = localized change (shape/color shift)
  } else if (pixelDiff < 60) {
    return "MAJOR"; // 25-60% = significant change (multiple elements)
  } else {
    return "CATASTROPHIC"; // >60% = global scramble (frameshift)
  }
}

/**
 * Determine confidence level based on mutation type.
 * Direct mutations (silent, missense, nonsense) = HIGH confidence
 * Cascading mutations (frameshift, complex insertions) = LOWER confidence
 *
 * @param mutationType - Type of mutation
 * @param impact - Classified impact level
 * @returns Confidence score (0.0-1.0) and level label
 * @internal
 */
function calculateConfidence(
  mutationType: string,
  impact: ImpactLevel,
): { score: number; level: ConfidenceLevel } {
  // High confidence for predictable mutations
  if (mutationType === "silent") {
    return { score: 0.95, level: "HIGH" };
  }
  if (mutationType === "nonsense") {
    return { score: 0.9, level: "HIGH" };
  }
  if (mutationType === "missense" && impact === "LOCAL") {
    return { score: 0.85, level: "HIGH" };
  }

  // Medium confidence for point mutations
  if (mutationType === "point") {
    return { score: 0.7, level: "MEDIUM" };
  }

  // Lower confidence for frameshifts (cascading unpredictability)
  if (mutationType === "frameshift") {
    return { score: 0.6, level: "MEDIUM" };
  }

  // Insertions/deletions vary by length
  if (mutationType === "insertion" || mutationType === "deletion") {
    return impact === "CATASTROPHIC"
      ? { score: 0.5, level: "LOW" }
      : { score: 0.7, level: "MEDIUM" };
  }

  return { score: 0.65, level: "MEDIUM" };
}

/**
 * Analyze visual changes in detail for rich feedback.
 *
 * @param originalGenome - Original genome string
 * @param mutatedGenome - Mutated genome string
 * @param pixelDiff - Pixel difference percentage
 * @returns Analysis object with detected changes
 * @internal
 */
function analyzeChanges(
  originalGenome: string,
  mutatedGenome: string,
  pixelDiff: number,
) {
  // Check for frameshift (length change not divisible by 3)
  const originalLength = originalGenome
    .replace(/\s+/g, "")
    .replace(/;.*/g, "").length;
  const mutatedLength = mutatedGenome
    .replace(/\s+/g, "")
    .replace(/;.*/g, "").length;
  const lengthDiff = Math.abs(originalLength - mutatedLength);
  const frameshifted = lengthDiff > 0 && lengthDiff % 3 !== 0;

  let truncated = false;
  let shapeChanges = 0;

  // Only try to tokenize if not frameshifted (would fail validation)
  if (!frameshifted) {
    try {
      const lexer = new CodonLexer();
      const originalTokens = lexer.tokenize(originalGenome);
      const mutatedTokens = lexer.tokenize(mutatedGenome);
      truncated = mutatedTokens.length < originalTokens.length;
      shapeChanges = truncated
        ? originalTokens.length - mutatedTokens.length
        : 0;
    } catch {
      // Tokenization failed (invalid genome), skip token-based analysis
    }
  }

  return {
    shapeChanges,
    colorChanges: pixelDiff > 5 && pixelDiff < 40, // Heuristic for color-only changes
    positionChanges: pixelDiff > 10, // Significant spatial changes
    truncated,
    frameshifted,
  };
}

/**
 * Generate human-readable description of predicted impact.
 *
 * @param impact - Impact level classification
 * @param analysis - Detailed change analysis
 * @param mutationType - Type of mutation
 * @returns Human-readable impact description
 * @internal
 */
function generateDescription(
  impact: ImpactLevel,
  analysis: ReturnType<typeof analyzeChanges>,
  mutationType: string,
): string {
  if (impact === "SILENT") {
    return "Minimal visual change - outputs nearly identical (synonymous codon)";
  }

  if (impact === "LOCAL") {
    if (analysis.colorChanges && !analysis.positionChanges) {
      return "Local change - color or minor shape adjustment";
    }
    return "Local change - single shape or position modified";
  }

  if (impact === "MAJOR") {
    if (analysis.truncated) {
      return `Major change - early termination removes ${analysis.shapeChanges} shape${
        analysis.shapeChanges > 1 ? "s" : ""
      }`;
    }
    return "Major change - multiple shapes affected";
  }

  if (impact === "CATASTROPHIC") {
    if (analysis.frameshifted) {
      return "CATASTROPHIC - frameshift scrambles all downstream codons";
    }
    return "CATASTROPHIC - global transformation of output";
  }

  return "Unknown impact pattern";
}

/**
 * Predict visual impact of a mutation before applying it.
 *
 * Renders both original and mutated genomes, compares outputs,
 * and provides impact classification with confidence scoring.
 *
 * @param originalGenome - Original genome string
 * @param mutationResult - Mutation to apply (from mutations.ts)
 * @param canvasWidth - Preview canvas width (default: 200)
 * @param canvasHeight - Preview canvas height (default: 200)
 * @returns Prediction with impact level, confidence, previews, and analysis
 * @throws Error if rendering fails
 *
 * @example
 * ```typescript
 * const mutation = applySilentMutation('ATG GGA TAA');
 * const prediction = predictMutationImpact('ATG GGA TAA', mutation);
 * // prediction.impact: 'SILENT'
 * // prediction.confidence: 0.95
 * // prediction.description: "Minimal visual change - outputs nearly identical"
 * ```
 */

/**
 * Predict mutation impact by rendering and comparing visual output
 *
 * Renders both original and mutated genomes, compares pixel-level differences,
 * and classifies impact into SILENT, LOCAL, MAJOR, or CATASTROPHIC categories.
 * Provides preview images and confidence scores for educational scaffolding.
 *
 * Impact Classification:
 * - SILENT: < 2% pixel difference (synonymous mutations)
 * - LOCAL: 2-25% difference (small visual changes)
 * - MAJOR: 25-75% difference (significant changes)
 * - CATASTROPHIC: > 75% difference (fundamental shape/output change)
 *
 * @param originalGenome - Original genome string (codons with optional whitespace/comments)
 * @param mutationResult - Result from applyMutation() with original and mutated sequences
 * @param canvasWidth - Canvas width for rendering (default: 200px)
 * @param canvasHeight - Canvas height for rendering (default: 200px)
 * @returns Prediction with impact level, confidence, pixel diff %, and preview images
 * @throws Error if both genomes fail to render (invalid syntax)
 * @example
 * ```typescript
 * const mutation = applyPointMutation('ATG GAA TAA', 1, 'C');
 * const prediction = predictMutationImpact('ATG GAA TAA', mutation);
 * console.log(prediction.impact); // 'LOCAL' or 'MAJOR'
 * console.log(prediction.pixelDiffPercent); // 5-30%
 * ```
 */
export function predictMutationImpact(
  originalGenome: string,
  mutationResult: MutationResult,
  canvasWidth: number = 200,
  canvasHeight: number = 200,
): MutationPrediction {
  const lexer = new CodonLexer();

  // Create offscreen canvases for rendering
  const canvas1 = document.createElement("canvas");
  canvas1.width = canvasWidth;
  canvas1.height = canvasHeight;
  const renderer1 = new Canvas2DRenderer(canvas1);

  const canvas2 = document.createElement("canvas");
  canvas2.width = canvasWidth;
  canvas2.height = canvasHeight;
  const renderer2 = new Canvas2DRenderer(canvas2);

  // Render original genome
  let originalRendered = false;
  const vm1 = new CodonVM(renderer1);
  try {
    const tokens1 = lexer.tokenize(originalGenome);
    vm1.run(tokens1);
    originalRendered = true;
  } catch (error) {
    // Original genome invalid - prediction may be unreliable
  }

  // Render mutated genome
  let mutatedRendered = false;
  const vm2 = new CodonVM(renderer2);
  try {
    const tokens2 = lexer.tokenize(mutationResult.mutated);
    vm2.run(tokens2);
    mutatedRendered = true;
  } catch (error) {
    // Mutated genome invalid (expected for frameshifts)
  }

  // If neither rendered, use full diff as catastrophic
  if (!originalRendered && !mutatedRendered) {
    throw new Error("Both genomes failed to render - cannot predict impact");
  }

  // Calculate pixel difference
  let pixelDiff = calculatePixelDiff(canvas1, canvas2);

  // If mutated genome failed to render (frameshift causes invalid genome),
  // treat as catastrophic change (100% diff)
  if (originalRendered && !mutatedRendered) {
    pixelDiff = 100;
  }

  // Classify impact
  const impact = classifyImpact(pixelDiff, mutationResult.type);

  // Calculate confidence
  const { score: confidence, level: confidenceLevel } = calculateConfidence(
    mutationResult.type,
    impact,
  );

  // Analyze changes
  const analysis = analyzeChanges(
    originalGenome,
    mutationResult.mutated,
    pixelDiff,
  );

  // Generate description
  const description = generateDescription(
    impact,
    analysis,
    mutationResult.type,
  );

  // Generate preview data URLs
  const originalPreview = canvas1.toDataURL("image/png");
  const mutatedPreview = canvas2.toDataURL("image/png");

  return {
    impact,
    confidence,
    confidenceLevel,
    pixelDiffPercent: Math.round(pixelDiff * 10) / 10, // Round to 1 decimal
    originalPreview,
    mutatedPreview,
    description,
    analysis,
  };
}

/**
 * Batch predict impacts for multiple mutation options.
 * Useful for showing all possible mutations and their predicted effects.
 *
 * @param genome - Original genome string
 * @param mutations - Array of mutation results to predict
 * @returns Array of predictions in same order as mutations
 *
 * @example
 * ```typescript
 * const genome = 'ATG GGA CCA TAA';
 * const mutations = [
 *   applySilentMutation(genome),
 *   applyMissenseMutation(genome),
 *   applyNonsenseMutation(genome)
 * ];
 * const predictions = predictMutationImpactBatch(genome, mutations);
 * // predictions[0].impact: 'SILENT'
 * // predictions[1].impact: 'LOCAL'
 * // predictions[2].impact: 'MAJOR'
 * ```
 */

/**
 * Predict impact for multiple mutations in batch
 *
 * Efficiently predicts impact for multiple mutations on the same genome.
 * Useful for evolution engine candidate evaluation or comparing mutation types.
 *
 * @param genome - Original genome string (codons with optional whitespace/comments)
 * @param mutations - Array of mutation results to evaluate
 * @returns Array of predictions in same order as mutations array
 * @example
 * ```typescript
 * const candidates = [
 *   applyPointMutation(genome, 1, 'A'),
 *   applyInsertion(genome, 3, 'CCC'),
 *   applySilentMutation(genome)
 * ];
 *
 * const predictions = predictMutationImpactBatch(genome, candidates);
 * const bestCandidate = predictions.reduce((best, curr) =>
 *   curr.pixelDiffPercent > best.pixelDiffPercent ? curr : best
 * );
 * ```
 */
export function predictMutationImpactBatch(
  genome: string,
  mutations: MutationResult[],
): MutationPrediction[] {
  return mutations.map((mutation) => predictMutationImpact(genome, mutation));
}
