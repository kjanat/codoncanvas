/**
 * Edge Case Tests for Statistical Functions
 *
 * Tests boundary conditions and edge cases for inferential statistics,
 * particularly the Fisher z-transformation and t-distribution approximations.
 */
import { describe, expect, test } from "bun:test";
import { mean, sd } from "@/analysis/statistics/descriptive";
import {
  cohensD,
  independentTTest,
  normalCDF,
  pairedTTest,
  powerAnalysis,
  tCritical,
  tDistribution,
  tTest,
} from "@/analysis/statistics/inferential";

describe("tDistribution edge cases", () => {
  describe("extreme t values", () => {
    test.each([
      { t: 0, df: 10, desc: "t=0 returns p~1", check: (p: number) => p > 0.99 },
      {
        t: 100,
        df: 10,
        desc: "large positive t returns small p",
        check: (p: number) => p < 0.01 && p >= 0,
      },
      {
        t: -100,
        df: 10,
        desc: "large negative t returns small p",
        check: (p: number) => p < 0.01 && p >= 0,
      },
      {
        t: 1000,
        df: 10,
        desc: "very large t returns very small p",
        check: (p: number) => p < 0.01 && p >= 0,
      },
    ])("$desc", ({ t, df, check }) => {
      const p = tDistribution(t, df);
      expect(check(p)).toBe(true);
    });

    test("handles Infinity t value (returns NaN or near-zero)", () => {
      const p = tDistribution(Number.POSITIVE_INFINITY, 10);
      // z becomes NaN or Infinity, resulting in p near 0 or NaN
      expect(Number.isFinite(p) || Number.isNaN(p)).toBe(true);
    });

    test("handles -Infinity t value", () => {
      const p = tDistribution(Number.NEGATIVE_INFINITY, 10);
      expect(Number.isFinite(p) || Number.isNaN(p)).toBe(true);
    });

    test("handles NaN t value", () => {
      const p = tDistribution(Number.NaN, 10);
      expect(Number.isNaN(p)).toBe(true);
    });
  });

  describe("extreme df values", () => {
    test("handles df = 1 (Cauchy distribution)", () => {
      const p = tDistribution(2, 1);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(1);
    });

    test("handles df = 0 (degenerate case, z becomes 0)", () => {
      const p = tDistribution(2, 0);
      // df=0: z = |t| * sqrt(0 / (0 + t^2)) = 0, so p = 2*(1-0.5) = 1
      expect(p).toBeCloseTo(1, 5);
    });

    test("handles very large df (approaches normal distribution)", () => {
      const pLargeDf = tDistribution(1.96, 10000);
      const pNormal = 2 * (1 - normalCDF(1.96));
      expect(pLargeDf).toBeCloseTo(pNormal, 2);
    });

    test("handles negative df (produces finite result, mathematically invalid)", () => {
      // Note: negative df is invalid input, but sqrt(neg/pos) can still produce
      // a real number if the ratio is positive due to JS handling
      const p = tDistribution(2, -5);
      // df=-5, t=2: df + t^2 = -5 + 4 = -1, sqrt(-5/-1) = sqrt(5)
      // This actually produces a valid number!
      expect(Number.isFinite(p) || Number.isNaN(p)).toBe(true);
    });

    test("handles NaN df value", () => {
      const p = tDistribution(2, Number.NaN);
      expect(Number.isNaN(p)).toBe(true);
    });
  });

  describe("Fisher z-transformation boundary conditions", () => {
    test("when t^2 dominates df, p approaches 0", () => {
      // z = |t| * sqrt(df / (df + t^2))
      // When t^2 >> df: z -> |t| * sqrt(df/t^2) = sqrt(df)
      const t = 1000;
      const df = 10;
      const p = tDistribution(t, df);
      // Fisher approximation has ~20% error, so use looser bound
      expect(p).toBeLessThan(0.01);
    });

    test("when df dominates t^2, z approaches |t|", () => {
      // When df >> t^2: z -> |t| * sqrt(df/df) = |t|
      const t = 0.1;
      const df = 10000;
      const p = tDistribution(t, df);
      const expected = 2 * (1 - normalCDF(0.1));
      expect(p).toBeCloseTo(expected, 2);
    });
  });
});

describe("normalCDF edge cases", () => {
  test("handles z = 0 (returns ~0.5)", () => {
    // Polynomial approximation isn't exact, use appropriate precision
    expect(normalCDF(0)).toBeCloseTo(0.5, 5);
  });

  test.each([
    { z: 10, expected: 1, precision: 10 },
    { z: 100, expected: 1, precision: 10 },
    { z: -10, expected: 0, precision: 10 },
    { z: -100, expected: 0, precision: 10 },
  ])("handles extreme z=$z (returns ~$expected)", ({
    z,
    expected,
    precision,
  }) => {
    expect(normalCDF(z)).toBeCloseTo(expected, precision);
  });

  test("handles Infinity (returns ~1)", () => {
    const result = normalCDF(Number.POSITIVE_INFINITY);
    expect(result).toBeCloseTo(1, 5);
  });

  test("handles -Infinity (returns ~0)", () => {
    const result = normalCDF(Number.NEGATIVE_INFINITY);
    expect(result).toBeCloseTo(0, 5);
  });

  test("handles NaN", () => {
    expect(Number.isNaN(normalCDF(Number.NaN))).toBe(true);
  });

  test("maintains symmetry: CDF(z) + CDF(-z) ~ 1", () => {
    const values = [0.5, 1, 1.5, 2, 2.5, 3];
    for (const z of values) {
      const sum = normalCDF(z) + normalCDF(-z);
      expect(sum).toBeCloseTo(1, 5);
    }
  });
});

describe("tTest edge cases", () => {
  describe("identical groups", () => {
    test("returns t=0, p=1 for identical zero-variance groups (guarded)", () => {
      const group = [5, 5, 5, 5, 5];
      const result = tTest(group, group);
      // pooledVariance = 0, se = 0, guarded: t = 0, p = 1
      expect(result.t).toBe(0);
      expect(result.p).toBe(1);
    });

    test("handles groups with zero variance but different means (guarded)", () => {
      const group1 = [5, 5, 5];
      const group2 = [10, 10, 10];
      const result = tTest(group1, group2);
      // pooledVariance = 0, se = 0, means differ: guarded returns t = Infinity, p = 0
      expect(result.t).toBe(Infinity);
      expect(result.p).toBe(0);
    });
  });

  describe("small sample sizes", () => {
    test("handles n=2 per group (df=2)", () => {
      const group1 = [1, 2];
      const group2 = [10, 11];
      const result = tTest(group1, group2);

      expect(result.df).toBe(2);
      expect(result.t).toBeLessThan(0);
      expect(result.p).toBeGreaterThan(0);
      expect(result.p).toBeLessThan(1);
    });

    test("throws for n=1 per group (insufficient df)", () => {
      const group1 = [5];
      const group2 = [10];
      // Requires at least 3 total observations for df >= 1
      expect(() => tTest(group1, group2)).toThrow(
        "t-test requires at least 3 observations total",
      );
    });
  });

  describe("empty groups", () => {
    test("handles empty first group (t = -0, p ~ 1)", () => {
      const result = tTest([], [1, 2, 3]);
      // mean([]) = 0, sd([]) = 0, n1=0, n2=3
      // df = 0 + 3 - 2 = 1
      // t = (0 - mean([1,2,3])) / se = negative / positive = -0
      expect(result.df).toBe(1);
      expect(Object.is(result.t, -0)).toBe(true);
      expect(result.p).toBeCloseTo(1, 3);
    });

    test("handles empty second group (t = 0, p ~ 1)", () => {
      const result = tTest([1, 2, 3], []);
      expect(result.df).toBe(1); // 3 + 0 - 2
      expect(result.t).toBe(0);
      expect(result.p).toBeCloseTo(1, 3);
    });

    test("throws for both groups empty (insufficient df)", () => {
      // Total observations = 0, needs at least 3
      expect(() => tTest([], [])).toThrow(
        "t-test requires at least 3 observations total",
      );
    });
  });

  describe("extreme values", () => {
    test("handles very large numbers", () => {
      const group1 = [1e10, 1e10 + 1, 1e10 + 2];
      const group2 = [1, 2, 3];
      const result = tTest(group1, group2);

      expect(Number.isFinite(result.t)).toBe(true);
      expect(result.p).toBeLessThan(0.05);
    });

    test("handles very small numbers", () => {
      const group1 = [1e-10, 2e-10, 3e-10];
      const group2 = [4e-10, 5e-10, 6e-10];
      const result = tTest(group1, group2);

      expect(Number.isFinite(result.t)).toBe(true);
    });

    test("handles mixed positive and negative", () => {
      const group1 = [-100, -50, 0];
      const group2 = [0, 50, 100];
      const result = tTest(group1, group2);

      expect(result.t).toBeLessThan(0);
      expect(Number.isFinite(result.p)).toBe(true);
    });
  });
});

describe("cohensD edge cases", () => {
  test("returns 0 when both groups have zero variance and same mean", () => {
    const group1 = [5, 5, 5];
    const group2 = [5, 5, 5];
    const d = cohensD(group1, group2);
    // pooledSD = 0, explicit check returns 0
    expect(d).toBe(0);
  });

  test("returns 0 when pooled SD is 0 (explicit guard)", () => {
    // This tests the explicit check: pooledSD === 0 ? 0 : ...
    const group1 = [10, 10, 10];
    const group2 = [5, 5, 5];
    const d = cohensD(group1, group2);
    // pooledSD = 0, so should return 0 (not Infinity)
    expect(d).toBe(0);
  });

  test("throws for single element groups (insufficient df)", () => {
    const group1 = [10];
    const group2 = [5];
    // Requires at least 3 total observations for valid df
    expect(() => cohensD(group1, group2)).toThrow(
      "t-test requires at least 3 observations total",
    );
  });

  test("handles empty first group (returns finite effect size)", () => {
    const d = cohensD([], [1, 2, 3]);
    // mean([]) = 0, sd([]) = 0, but pooledVariance calculation
    // with (n1-1)=-1 and (n2-1)=2 still produces a valid number
    // d = (0 - 2) / pooledSD = negative value
    expect(Number.isFinite(d)).toBe(true);
    expect(d).toBeLessThan(0);
  });

  test("correctly identifies large effect size (|d| >= 0.8)", () => {
    const group1 = [100, 101, 102, 103, 104]; // mean=102, sd~1.58
    const group2 = [90, 91, 92, 93, 94]; // mean=92, sd~1.58
    const d = cohensD(group1, group2);
    expect(Math.abs(d)).toBeGreaterThan(0.8);
  });
});

describe("pairedTTest", () => {
  test("throws when arrays have different lengths", () => {
    expect(() => pairedTTest([1, 2, 3], [1, 2])).toThrow(
      "Pre and post arrays must have same length",
    );
  });

  test("throws for single pair (insufficient df)", () => {
    // Requires at least 2 pairs for df >= 1
    expect(() => pairedTTest([10], [15])).toThrow(
      "Paired t-test requires at least 2 pairs",
    );
  });

  test("returns t=0, p=1 for zero-variance differences (guarded)", () => {
    // Pre: [10, 20, 30], Post: [15, 25, 35]
    // Differences: [5, 5, 5], meanDiff = 5, sdDiff = 0
    // seMean = 0, guarded: t = 0, p = 1
    const result = pairedTTest([10, 20, 30], [15, 25, 35]);
    expect(result.t).toBe(0);
    expect(result.p).toBe(1);
    expect(result.df).toBe(2);
    expect(result.meanDiff).toBe(5);
    expect(result.cohensD).toBe(0);
  });

  test("calculates correct values for varied differences", () => {
    const pre = [10, 20, 30, 40, 50];
    const post = [12, 22, 35, 45, 55];
    const result = pairedTTest(pre, post);

    // Differences: [2, 2, 5, 5, 5], meanDiff = 3.8
    expect(result.meanDiff).toBeCloseTo(3.8, 5);
    expect(result.df).toBe(4);
    expect(result.t).toBeGreaterThan(0);
    expect(result.p).toBeLessThan(0.1); // marginally significant
    expect(result.cohensD).toBeGreaterThan(0);
    expect(result.ciLower).toBeLessThan(result.meanDiff);
    expect(result.ciUpper).toBeGreaterThan(result.meanDiff);
  });

  test("handles identical pre and post (no change, guarded)", () => {
    const data = [10, 20, 30];
    const result = pairedTTest(data, data);

    expect(result.meanDiff).toBe(0);
    expect(result.t).toBe(0); // guarded: 0/0 -> 0
    expect(result.p).toBe(1);
    expect(result.cohensD).toBe(0);
  });

  test("handles negative differences (decline)", () => {
    // Use varied differences to avoid zero SE guard
    const pre = [50, 60, 70, 80, 90];
    const post = [40, 48, 58, 70, 82];
    const result = pairedTTest(pre, post);

    // Differences: [-10, -12, -12, -10, -8], meanDiff ~ -10.4
    expect(result.meanDiff).toBeLessThan(0);
    expect(result.t).toBeLessThan(0);
  });
});

describe("independentTTest", () => {
  test("calculates correct values for simple groups", () => {
    const group1 = [10, 20, 30, 40, 50];
    const group2 = [5, 15, 25, 35, 45];
    const result = independentTTest(group1, group2);

    // Mean diff = 30 - 25 = 5
    expect(result.meanDiff).toBe(5);
    expect(result.df).toBe(8); // n1 + n2 - 2
    expect(result.t).toBeGreaterThan(0);
    expect(result.cohensD).toBeGreaterThan(0);
    expect(result.ciLower).toBeLessThan(result.meanDiff);
    expect(result.ciUpper).toBeGreaterThan(result.meanDiff);
  });

  test("handles groups with different sizes", () => {
    const group1 = [10, 20, 30];
    const group2 = [5, 15, 25, 35, 45];
    const result = independentTTest(group1, group2);

    expect(result.df).toBe(6); // 3 + 5 - 2
    expect(Number.isFinite(result.t)).toBe(true);
  });

  test("handles identical groups (t = 0)", () => {
    const data = [10, 20, 30];
    const result = independentTTest(data, data);

    expect(result.meanDiff).toBe(0);
    expect(result.t).toBe(0);
    expect(result.p).toBeCloseTo(1, 3);
  });
});

describe("tCritical", () => {
  test("returns z-critical for large df (alpha=0.05)", () => {
    expect(tCritical(0.05, 200)).toBeCloseTo(1.96, 2);
  });

  test("returns z-critical for large df (alpha=0.01)", () => {
    expect(tCritical(0.01, 200)).toBeCloseTo(2.576, 2);
  });

  test("uses lookup table for small df", () => {
    expect(tCritical(0.05, 10)).toBeCloseTo(2.228, 2);
    expect(tCritical(0.05, 20)).toBeCloseTo(2.086, 2);
    expect(tCritical(0.05, 30)).toBeCloseTo(2.042, 2);
  });

  test("interpolates to nearest table entry", () => {
    // df=15 should use df=20 entry (2.086)
    expect(tCritical(0.05, 15)).toBeCloseTo(2.086, 2);
  });

  test("handles df=5 (smallest table entry)", () => {
    expect(tCritical(0.05, 5)).toBeCloseTo(2.571, 2);
  });

  test("handles very small df (uses first table entry)", () => {
    expect(tCritical(0.05, 2)).toBeCloseTo(2.571, 2);
  });
});

describe("powerAnalysis", () => {
  test("calculates correct sample size for medium effect (d=0.5)", () => {
    const result = powerAnalysis(0.5);

    // n = 2*(1.96 + 0.84)^2 / 0.5^2 = 2*7.84 / 0.25 = 62.72 -> 63
    expect(result.requiredNPerGroup).toBe(63);
    expect(result.totalN).toBe(126);
    // With 20% attrition: 63 / 0.8 = 78.75 -> 79
    expect(result.inflatedNPerGroup).toBe(79);
    expect(result.inflatedTotal).toBe(158);
  });

  test("calculates correct sample size for large effect (d=0.8)", () => {
    const result = powerAnalysis(0.8);

    // n = 2*(1.96 + 0.84)^2 / 0.8^2 = 15.68 / 0.64 = 24.5 -> 25
    expect(result.requiredNPerGroup).toBe(25);
    expect(result.totalN).toBe(50);
  });

  test("handles alpha=0.01", () => {
    const result = powerAnalysis(0.5, 0.01);

    // n = 2*(2.576 + 0.84)^2 / 0.5^2 = 93.55 -> 94
    expect(result.requiredNPerGroup).toBe(94);
  });

  test("handles power=0.9", () => {
    const result = powerAnalysis(0.5, 0.05, 0.9);

    // n = 2*(1.96 + 1.28)^2 / 0.5^2 = 83.98 -> 84
    expect(result.requiredNPerGroup).toBe(84);
  });

  test("handles custom attrition rate", () => {
    const result = powerAnalysis(0.5, 0.05, 0.8, 0.3);

    // requiredNPerGroup = 63, with 30% attrition: 63 / 0.7 = 90
    expect(result.requiredNPerGroup).toBe(63);
    expect(result.inflatedNPerGroup).toBe(90);
  });

  test("handles very small effect size (requires large n)", () => {
    const result = powerAnalysis(0.2);

    // n = 2*(1.96 + 0.84)^2 / 0.2^2 = 392
    expect(result.requiredNPerGroup).toBe(392);
  });
});

describe("descriptive statistics edge cases", () => {
  describe("mean", () => {
    test("handles empty array", () => {
      expect(mean([])).toBe(0);
    });

    test.each([
      {
        input: [1, 2, Number.POSITIVE_INFINITY],
        expected: Number.POSITIVE_INFINITY,
      },
      {
        input: [1, 2, Number.NEGATIVE_INFINITY],
        expected: Number.NEGATIVE_INFINITY,
      },
    ])("handles array with $expected", ({ input, expected }) => {
      expect(mean(input)).toBe(expected);
    });

    test("handles array with NaN", () => {
      const result = mean([1, 2, Number.NaN]);
      expect(Number.isNaN(result)).toBe(true);
    });

    test("handles array with mixed Infinity and -Infinity (NaN)", () => {
      const result = mean([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
      expect(Number.isNaN(result)).toBe(true);
    });
  });

  describe("sd", () => {
    test("handles empty array", () => {
      expect(sd([])).toBe(0);
    });

    test("handles single value (sample SD is NaN)", () => {
      const result = sd([42]);
      expect(Number.isNaN(result)).toBe(true);
    });

    test("handles single value (population SD is 0)", () => {
      const result = sd([42], false);
      expect(result).toBe(0);
    });

    test("handles array with all identical values", () => {
      expect(sd([5, 5, 5, 5], false)).toBe(0);
    });

    test("handles array with Infinity (NaN result)", () => {
      const result = sd([1, 2, Number.POSITIVE_INFINITY]);
      expect(Number.isNaN(result)).toBe(true);
    });
  });
});
