/**
 * Random Number Generator utilities for deterministic testing
 *
 * Provides seedable RNG for reproducible randomness in tests while
 * maintaining standard Math.random() behavior in production.
 */

/**
 * RNG interface for dependency injection
 */
export interface RNG {
  /** Generate random number in [0, 1) */
  next(): number;
  /** Generate random integer in [0, max) */
  nextInt(max: number): number;
}

/**
 * Seedable PRNG using SplitMix32 algorithm
 *
 * Fast, simple, and provides good distribution for testing purposes.
 * Unlike Mulberry32, SplitMix32 doesn't skip any 32-bit values.
 * @see {@link https://github.com/bryc/code/blob/master/jshash/PRNGs.md}
 */
export class SeededRandom implements RNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0; // Ensure unsigned 32-bit
  }

  /**
   * Generate next random number in [0, 1)
   */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x9e3779b9) | 0;
    let t = this.state ^ (this.state >>> 15);
    t = Math.imul(t, 0x85ebca6b);
    t = t ^ (t >>> 13);
    t = Math.imul(t, 0xc2b2ae35);
    return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer in [0, max)
   */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * Default RNG using Math.random() for production use
 */
export const defaultRNG: RNG = {
  next: () => Math.random(),
  nextInt: (max: number) => Math.floor(Math.random() * max),
};
