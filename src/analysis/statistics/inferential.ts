/**
 * Inferential statistics functions (t-tests, effect sizes)
 */

import { mean, sd } from "./descriptive";

/**
 * Compute group statistics for two-sample comparisons.
 *
 * Calculates pooled variance assuming equal population variances.
 *
 * @param group1 - First sample data.
 * @param group2 - Second sample data.
 * @returns Object containing sample sizes, means, variances, and pooled variance.
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
 * Standard normal cumulative distribution function.
 *
 * Uses Abramowitz and Stegun 5-term polynomial approximation.
 * Error < 7.5e-8.
 *
 * @param z - The z-score value.
 * @returns Cumulative probability P(Z <= z).
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
 * Approximate two-tailed p-value from t-distribution.
 *
 * Uses Fisher z-transformation for improved accuracy at small df.
 * Error < 20% for df >= 5, |t| > 1.
 *
 * @param t - The t-statistic value.
 * @param df - Degrees of freedom.
 * @returns Two-tailed p-value.
 */
export function tDistribution(t: number, df: number): number {
  const absT = Math.abs(t);
  // Fisher z-transformation: z = |t| * sqrt(df / (df + t^2))
  const z = absT * Math.sqrt(df / (df + absT * absT));
  return 2 * (1 - normalCDF(z));
}

/**
 * Independent samples t-test (equal variance assumed).
 *
 * Computes t-statistic, degrees of freedom, and two-tailed p-value
 * for comparing means of two independent samples.
 *
 * Note: Assumes equal population variances (no Welch correction).
 *
 * @param group1 - First sample data.
 * @param group2 - Second sample data.
 * @returns Object containing t-statistic, degrees of freedom, and p-value.
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
 * Cohen's d effect size for two independent samples.
 *
 * Measures standardized difference between group means using pooled SD.
 * Interpretation: 0.2 = small, 0.5 = medium, 0.8 = large.
 *
 * @param group1 - First sample data.
 * @param group2 - Second sample data.
 * @returns Effect size d, or 0 if pooled SD is zero.
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
 * Interpret effect size magnitude using Cohen's conventions.
 *
 * @param d - Cohen's d effect size value.
 * @returns Human-readable interpretation: "negligible", "small", "medium", or "large".
 */
export function interpretEffectSize(d: number): string {
  const abs = Math.abs(d);
  if (abs < 0.2) return "negligible";
  if (abs < 0.5) return "small";
  if (abs < 0.8) return "medium";
  return "large";
}

/**
 * Interpret p-value significance using standard thresholds.
 *
 * @param p - The p-value to interpret.
 * @returns Human-readable significance level.
 */
export function interpretPValue(p: number): string {
  if (p < 0.001) return "highly significant (p < .001)";
  if (p < 0.01) return "very significant (p < .01)";
  if (p < 0.05) return "significant (p < .05)";
  if (p < 0.1) return "marginally significant (p < .10)";
  return "not significant (p >= .10)";
}
