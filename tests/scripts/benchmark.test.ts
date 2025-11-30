/**
 * Tests for benchmark.ts script
 *
 * Tests genome generators and statistics calculations
 */

import { describe, expect, test } from "bun:test";
import {
  type BenchmarkStats,
  calculateStats,
  generateComplexGenome,
  generateSimpleGenome,
} from "../../scripts/benchmark";

describe("benchmark script", () => {
  describe("generateSimpleGenome", () => {
    test("produces valid genome with ATG start and TAA stop", () => {
      const genome = generateSimpleGenome(10);
      expect(genome.startsWith("ATG ")).toBe(true);
      expect(genome.endsWith("TAA")).toBe(true);
    });

    test("produces genome with PUSH and CIRCLE pattern", () => {
      const genome = generateSimpleGenome(20);
      // Pattern is "GAA AAT GGA " (PUSH 10, CIRCLE)
      expect(genome).toContain("GAA");
      expect(genome).toContain("GGA");
    });

    test("scales with requested codon count", () => {
      const small = generateSimpleGenome(10);
      const large = generateSimpleGenome(100);
      expect(large.length).toBeGreaterThan(small.length);
    });

    test("handles minimum codon count", () => {
      const genome = generateSimpleGenome(2);
      // Should at least have ATG and TAA
      expect(genome).toContain("ATG");
      expect(genome).toContain("TAA");
    });
  });

  describe("generateComplexGenome", () => {
    test("produces valid genome with ATG start and TAA stop", () => {
      const genome = generateComplexGenome(20);
      expect(genome.startsWith("ATG ")).toBe(true);
      expect(genome.endsWith("TAA")).toBe(true);
    });

    test("contains mixed opcodes (shapes and transforms)", () => {
      const genome = generateComplexGenome(50);
      // Should contain various patterns
      expect(genome).toContain("GAA"); // PUSH
      expect(genome).toContain("GGA"); // CIRCLE
    });

    test("scales with requested codon count", () => {
      const small = generateComplexGenome(10);
      const large = generateComplexGenome(100);
      expect(large.length).toBeGreaterThan(small.length);
    });
  });

  describe("calculateStats", () => {
    test("calculates correct mean", () => {
      const stats = calculateStats([1, 2, 3, 4, 5]);
      expect(stats.mean).toBe(3);
    });

    test("calculates correct median for odd-length array", () => {
      const stats = calculateStats([1, 2, 3, 4, 5]);
      expect(stats.median).toBe(3);
    });

    test("calculates correct median for even-length array", () => {
      const stats = calculateStats([1, 2, 3, 4]);
      // With floor division, median index is 2, so value is 3
      expect(stats.median).toBe(3);
    });

    test("calculates correct min and max", () => {
      const stats = calculateStats([5, 1, 9, 3, 7]);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(9);
    });

    test("calculates standard deviation", () => {
      // For [1, 2, 3, 4, 5]: mean=3, variance=2, stdDev=sqrt(2)
      const stats = calculateStats([1, 2, 3, 4, 5]);
      expect(stats.stdDev).toBeCloseTo(Math.sqrt(2), 5);
    });

    test("handles single value array", () => {
      const stats = calculateStats([42]);
      expect(stats.mean).toBe(42);
      expect(stats.median).toBe(42);
      expect(stats.min).toBe(42);
      expect(stats.max).toBe(42);
      expect(stats.stdDev).toBe(0);
    });

    test("handles identical values", () => {
      const stats = calculateStats([5, 5, 5, 5]);
      expect(stats.mean).toBe(5);
      expect(stats.median).toBe(5);
      expect(stats.stdDev).toBe(0);
    });

    test("returns correct BenchmarkStats shape", () => {
      const stats: BenchmarkStats = calculateStats([1, 2, 3]);
      expect(stats).toHaveProperty("mean");
      expect(stats).toHaveProperty("median");
      expect(stats).toHaveProperty("stdDev");
      expect(stats).toHaveProperty("min");
      expect(stats).toHaveProperty("max");
    });
  });
});
