import { describe, expect, test } from "bun:test";
import { defaultRNG, SeededRandom } from "@/utils/rng";

describe("rng", () => {
  describe("SeededRandom", () => {
    test("returns deterministic values for same seed", () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);
      // Call next() multiple times and compare
      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.next()).toBe(rng2.next());
    });

    test("returns values in [0, 1) range", () => {
      const rng = new SeededRandom(42);
      for (let i = 0; i < 100; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    test("different seeds produce different sequences", () => {
      const rng1 = new SeededRandom(111);
      const rng2 = new SeededRandom(222);
      // Very unlikely to be equal
      expect(rng1.next()).not.toBe(rng2.next());
    });

    test("produces good distribution across range", () => {
      const rng = new SeededRandom(54321);
      const buckets = [0, 0, 0, 0, 0];
      const samples = 1000;

      for (let i = 0; i < samples; i++) {
        const val = rng.next();
        const bucket = Math.floor(val * 5);
        buckets[bucket]++;
      }

      // Each bucket should have roughly 20% (200) of samples
      // Allow 10% deviation (100-300 range)
      for (const count of buckets) {
        expect(count).toBeGreaterThan(100);
        expect(count).toBeLessThan(300);
      }
    });
  });

  describe("nextInt", () => {
    test("returns values in [0, max) range", () => {
      const rng = new SeededRandom(999);
      for (let i = 0; i < 100; i++) {
        const val = rng.nextInt(10);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    test("returns deterministic integers for same seed", () => {
      const rng1 = new SeededRandom(777);
      const rng2 = new SeededRandom(777);
      for (let i = 0; i < 10; i++) {
        expect(rng1.nextInt(100)).toBe(rng2.nextInt(100));
      }
    });

    test("handles max of 1", () => {
      const rng = new SeededRandom(123);
      for (let i = 0; i < 10; i++) {
        expect(rng.nextInt(1)).toBe(0);
      }
    });
  });

  describe("defaultRNG", () => {
    test("returns values in [0, 1) range", () => {
      for (let i = 0; i < 10; i++) {
        const val = defaultRNG.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    test("nextInt returns integers in range", () => {
      for (let i = 0; i < 10; i++) {
        const val = defaultRNG.nextInt(100);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(100);
        expect(Number.isInteger(val)).toBe(true);
      }
    });
  });
});
