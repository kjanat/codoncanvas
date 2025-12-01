/**
 * Edge Case Tests for Renderer Utility Functions
 *
 * Tests boundary conditions for clamp, safeNum, and noise generation
 * functions that prevent NaN/Infinity from breaking rendering.
 */
import { describe, expect, test } from "bun:test";
import {
  clamp,
  computeNoiseParams,
  generateNoisePoints,
  MAX_NOISE_INTENSITY,
  SeededRandom,
  safeNum,
} from "@/core/renderer";

const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

describe("safeNum", () => {
  describe("finite values pass through", () => {
    test("returns positive numbers unchanged", () => {
      expect(safeNum(42)).toBe(42);
      expect(safeNum(Math.PI)).toBe(Math.PI);
    });

    test("returns negative numbers unchanged", () => {
      expect(safeNum(-42)).toBe(-42);
      expect(safeNum(-Math.PI)).toBe(-Math.PI);
    });

    test("returns zero unchanged", () => {
      expect(safeNum(0)).toBe(0);
      // Note: -0 is preserved as -0 (Object.is distinguishes them)
      expect(Object.is(safeNum(-0), -0)).toBe(true);
    });

    test("returns very small numbers unchanged", () => {
      expect(safeNum(1e-100)).toBe(1e-100);
      expect(safeNum(-1e-100)).toBe(-1e-100);
    });

    test("returns very large numbers unchanged", () => {
      expect(safeNum(1e100)).toBe(1e100);
      expect(safeNum(-1e100)).toBe(-1e100);
    });

    test("returns safe integer boundaries unchanged", () => {
      expect(safeNum(MAX_SAFE_INTEGER)).toBe(MAX_SAFE_INTEGER);
      expect(safeNum(MIN_SAFE_INTEGER)).toBe(MIN_SAFE_INTEGER);
    });
  });

  describe("non-finite values become 0", () => {
    test("converts NaN to 0", () => {
      expect(safeNum(Number.NaN)).toBe(0);
    });

    test("converts Infinity to 0", () => {
      expect(safeNum(Number.POSITIVE_INFINITY)).toBe(0);
    });

    test("converts -Infinity to 0", () => {
      expect(safeNum(Number.NEGATIVE_INFINITY)).toBe(0);
    });
  });

  describe("edge cases from arithmetic operations", () => {
    test("handles 0/0 (NaN)", () => {
      expect(safeNum(0 / 0)).toBe(0);
    });

    test("handles 1/0 (Infinity)", () => {
      expect(safeNum(1 / 0)).toBe(0);
    });

    test("handles -1/0 (-Infinity)", () => {
      expect(safeNum(-1 / 0)).toBe(0);
    });

    test("handles Math.sqrt(-1) (NaN)", () => {
      expect(safeNum(Math.sqrt(-1))).toBe(0);
    });

    test("handles Math.log(0) (-Infinity)", () => {
      expect(safeNum(Math.log(0))).toBe(0);
    });

    test("handles Math.log(-1) (NaN)", () => {
      expect(safeNum(Math.log(-1))).toBe(0);
    });
  });
});

describe("clamp", () => {
  describe("values within range pass through", () => {
    test("returns value when within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    test("handles negative ranges", () => {
      expect(clamp(-5, -10, 0)).toBe(-5);
      expect(clamp(-10, -10, 0)).toBe(-10);
      expect(clamp(0, -10, 0)).toBe(0);
    });

    test("handles floating point values", () => {
      expect(clamp(0.5, 0, 1)).toBe(0.5);
      expect(clamp(3.14, 0, 10)).toBe(3.14);
    });
  });

  describe("values outside range are clamped", () => {
    test("clamps values below min to min", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
    });

    test("clamps values above max to max", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });
  });

  describe("edge cases", () => {
    test("handles min === max (single valid value)", () => {
      expect(clamp(5, 5, 5)).toBe(5);
      expect(clamp(0, 5, 5)).toBe(5);
      expect(clamp(10, 5, 5)).toBe(5);
    });

    test("handles inverted range (min > max) - returns min", () => {
      // Math.max(10, Math.min(0, 5)) = Math.max(10, 0) = 10
      expect(clamp(5, 10, 0)).toBe(10);
    });

    test("handles NaN value (returns NaN)", () => {
      const result = clamp(Number.NaN, 0, 10);
      expect(Number.isNaN(result)).toBe(true);
    });

    test("handles NaN min (returns NaN)", () => {
      const result = clamp(5, Number.NaN, 10);
      expect(Number.isNaN(result)).toBe(true);
    });

    test("handles NaN max (returns NaN)", () => {
      const result = clamp(5, 0, Number.NaN);
      expect(Number.isNaN(result)).toBe(true);
    });

    test("handles Infinity value (clamps correctly)", () => {
      expect(clamp(Number.POSITIVE_INFINITY, 0, 10)).toBe(10);
      expect(clamp(Number.NEGATIVE_INFINITY, 0, 10)).toBe(0);
    });

    test("handles Infinity bounds", () => {
      expect(clamp(5, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(
        5,
      );
      expect(clamp(5, 0, Number.POSITIVE_INFINITY)).toBe(5);
      expect(clamp(5, Number.NEGATIVE_INFINITY, 10)).toBe(5);
    });
  });
});

describe("computeNoiseParams", () => {
  const canvasWidth = 400;

  describe("intensity clamping", () => {
    test("clamps negative intensity to 0", () => {
      const { radius, dotCount } = computeNoiseParams(-10, canvasWidth);
      expect(radius).toBe(0);
      expect(dotCount).toBe(10); // MIN_NOISE_DOTS
    });

    test("clamps intensity above MAX_NOISE_INTENSITY", () => {
      const { radius, dotCount } = computeNoiseParams(100, canvasWidth);
      const maxParams = computeNoiseParams(MAX_NOISE_INTENSITY, canvasWidth);
      expect(radius).toBe(maxParams.radius);
      expect(dotCount).toBe(maxParams.dotCount);
    });

    test("handles intensity = 0", () => {
      const { radius, dotCount } = computeNoiseParams(0, canvasWidth);
      expect(radius).toBe(0);
      expect(dotCount).toBe(10); // MIN_NOISE_DOTS
    });

    test("handles intensity = MAX_NOISE_INTENSITY", () => {
      const { radius, dotCount } = computeNoiseParams(
        MAX_NOISE_INTENSITY,
        canvasWidth,
      );
      expect(radius).toBe(canvasWidth); // 64/64 * 400
      expect(dotCount).toBe(64 * 5 + 10); // MAX * DOTS_PER_INTENSITY + MIN
    });
  });

  describe("NaN/Infinity handling", () => {
    test("handles NaN intensity (safeNum converts to 0)", () => {
      const { radius, dotCount } = computeNoiseParams(Number.NaN, canvasWidth);
      expect(radius).toBe(0);
      expect(dotCount).toBe(10);
    });

    test("handles Infinity intensity (clamped to MAX)", () => {
      const { radius, dotCount } = computeNoiseParams(
        Number.POSITIVE_INFINITY,
        canvasWidth,
      );
      // safeNum(Infinity) = 0, so should be same as intensity=0
      expect(radius).toBe(0);
      expect(dotCount).toBe(10);
    });

    test("handles -Infinity intensity", () => {
      const { radius, dotCount } = computeNoiseParams(
        Number.NEGATIVE_INFINITY,
        canvasWidth,
      );
      expect(radius).toBe(0);
      expect(dotCount).toBe(10);
    });
  });

  describe("canvas width scaling", () => {
    test("radius scales linearly with canvas width", () => {
      const intensity = 32; // Half of MAX
      const { radius: r1 } = computeNoiseParams(intensity, 400);
      const { radius: r2 } = computeNoiseParams(intensity, 800);

      expect(r2).toBe(r1 * 2);
    });

    test("dotCount is independent of canvas width", () => {
      const intensity = 32;
      const { dotCount: d1 } = computeNoiseParams(intensity, 400);
      const { dotCount: d2 } = computeNoiseParams(intensity, 800);

      expect(d1).toBe(d2);
    });
  });
});

describe("generateNoisePoints", () => {
  describe("deterministic output", () => {
    test("same seed produces identical points", () => {
      const points1 = generateNoisePoints(42, 20, 400);
      const points2 = generateNoisePoints(42, 20, 400);

      expect(points1).toEqual(points2);
    });

    test("different seeds produce different points", () => {
      const points1 = generateNoisePoints(42, 20, 400);
      const points2 = generateNoisePoints(999, 20, 400);

      expect(points1).not.toEqual(points2);
    });
  });

  describe("point bounds", () => {
    test("all points are within noise radius", () => {
      const intensity = 30;
      const canvasWidth = 400;
      const { radius } = computeNoiseParams(intensity, canvasWidth);
      const points = generateNoisePoints(42, intensity, canvasWidth);

      for (const { x, y } of points) {
        const distance = Math.sqrt(x * x + y * y);
        expect(distance).toBeLessThanOrEqual(radius + 0.001); // Small tolerance
      }
    });

    test("intensity 0 produces points at origin (radius 0)", () => {
      const points = generateNoisePoints(42, 0, 400);

      // With radius=0, rejection sampling produces (0,0) or (-0,-0)
      // Use Object.is to handle -0 case
      for (const { x, y } of points) {
        expect(Object.is(x, 0) || Object.is(x, -0)).toBe(true);
        expect(Object.is(y, 0) || Object.is(y, -0)).toBe(true);
      }
    });
  });

  describe("NaN/Infinity seed handling", () => {
    test("handles NaN seed (safeNum converts to 0)", () => {
      const points = generateNoisePoints(Number.NaN, 20, 400);
      // Should not throw, seed becomes 0
      expect(Array.isArray(points)).toBe(true);
      expect(points.length).toBeGreaterThan(0);
    });

    test("handles Infinity seed", () => {
      const points = generateNoisePoints(Number.POSITIVE_INFINITY, 20, 400);
      expect(Array.isArray(points)).toBe(true);
    });

    test("handles negative seed", () => {
      const points = generateNoisePoints(-42, 20, 400);
      expect(Array.isArray(points)).toBe(true);
      expect(points.length).toBeGreaterThan(0);
    });
  });

  describe("point count", () => {
    test("generates expected number of points", () => {
      const intensity = 20;
      const { dotCount } = computeNoiseParams(intensity, 400);
      const points = generateNoisePoints(42, intensity, 400);

      expect(points.length).toBe(dotCount);
    });
  });
});

describe("SeededRandom", () => {
  describe("deterministic sequence", () => {
    test("same seed produces same sequence", () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      for (let i = 0; i < 10; i++) {
        expect(rng1.next()).toBe(rng2.next());
      }
    });

    test("different seeds produce different sequences", () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(54321);

      // Very unlikely to match even once
      let matches = 0;
      for (let i = 0; i < 10; i++) {
        if (rng1.next() === rng2.next()) matches++;
      }
      expect(matches).toBeLessThan(3);
    });
  });

  describe("output range", () => {
    test("all values are in [0, 1)", () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 1000; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe("edge case seeds", () => {
    test("handles seed = 0", () => {
      // Constructor adds 2147483646 when state <= 0
      const rng = new SeededRandom(0);
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    test("handles negative seed", () => {
      const rng = new SeededRandom(-100);
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    test("handles very large seed", () => {
      const rng = new SeededRandom(MAX_SAFE_INTEGER);
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });

    test("handles seed = 2147483647 (modulo boundary)", () => {
      const rng = new SeededRandom(2147483647);
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });
  });
});
