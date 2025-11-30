/**
 * Inferential statistics functions (t-tests, effect sizes)
 */

import { mean, sd } from "./descriptive";

/**
 * Compute group statistics for two-sample comparisons
 */
function groupStats(
  group1: readonly number[],
  group2: readonly number[],
): {
  n1: number;
  n2: number;
  m1: number;
  m2: number;
  v1: number;
  v2: number;
  pooledVariance: number;
} {
  const n1 = group1.length;
  const n2 = group2.length;
  const m1 = mean(group1);
  const m2 = mean(group2);
  const v1 = sd(group1) ** 2;
  const v2 = sd(group2) ** 2;
  const pooledVariance = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);

  return { n1, n2, m1, m2, v1, v2, pooledVariance };
}

/**
 * Standard normal CDF (Abramowitz and Stegun approximation)
 */
export function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/**
 * Approximate two-tailed p-value from t-distribution
 */
export function tDistribution(t: number, df: number): number {
  if (df > 30) {
    return 2 * (1 - normalCDF(t));
  }

  const x = df / (df + t * t);
  const p = 1 - 0.5 * x ** (df / 2);
  return 2 * Math.min(p, 1 - p);
}

/**
 * Independent samples t-test
 */
export function tTest(
  group1: readonly number[],
  group2: readonly number[],
): { t: number; df: number; p: number } {
  const { n1, n2, m1, m2, pooledVariance } = groupStats(group1, group2);

  const se = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2));
  const t = (m1 - m2) / se;
  const df = n1 + n2 - 2;
  const p = tDistribution(Math.abs(t), df);

  return { t, df, p };
}

/**
 * Cohen's d effect size
 */
export function cohensD(
  group1: readonly number[],
  group2: readonly number[],
): number {
  const { m1, m2, pooledVariance } = groupStats(group1, group2);
  const pooledSD = Math.sqrt(pooledVariance);
  return pooledSD === 0 ? 0 : (m1 - m2) / pooledSD;
}

/**
 * Interpret effect size magnitude
 */
export function interpretEffectSize(d: number): string {
  const abs = Math.abs(d);
  if (abs < 0.2) return "negligible";
  if (abs < 0.5) return "small";
  if (abs < 0.8) return "medium";
  return "large";
}

/**
 * Interpret p-value significance
 */
export function interpretPValue(p: number): string {
  if (p < 0.001) return "highly significant (p < .001)";
  if (p < 0.01) return "very significant (p < .01)";
  if (p < 0.05) return "significant (p < .05)";
  if (p < 0.1) return "marginally significant (p < .10)";
  return "not significant (p >= .10)";
}
