/**
 * @fileoverview Renderer interface and shared utilities for CodonCanvas
 *
 * Provides the {@link Renderer} interface for graphics output backends
 * (Canvas2D, SVG, etc.) and shared utilities like SeededRandom.
 *
 * @module core/renderer
 */

// Re-export Renderer and TransformState from types/core
export type { Renderer, TransformState } from "@/types/core";

/**
 * Seeded pseudo-random number generator (Linear Congruential Generator).
 * Provides deterministic randomness for NOISE opcode.
 * Returns values in [0, 1) range with reproducible output for same seed.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed % 2147483647;
    if (this.state <= 0) {
      this.state += 2147483646;
    }
  }

  next(): number {
    this.state = (this.state * 48271) % 2147483647;
    return (this.state - 1) / 2147483646;
  }
}
