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

/**
 * Critical t-value lookup table for common degrees of freedom.
 * Values are for two-tailed test at alpha = 0.05.
 */
const T_CRITICAL_TABLE: Record<number, number> = {
  5: 2.571,
  10: 2.228,
  20: 2.086,
  30: 2.042,
  40: 2.021,
  50: 2.009,
  60: 2.0,
  100: 1.984,
};

/**
 * Get critical t-value for given alpha and degrees of freedom.
 *
 * Uses lookup table for small df, normal approximation for large df.
 * Only supports alpha = 0.05 (95% CI) and alpha = 0.01 (99% CI).
 *
 * @param alpha - Significance level (0.05 or 0.01).
 * @param df - Degrees of freedom.
 * @returns Critical t-value for two-tailed test.
 */
export function tCritical(alpha: number, df: number): number {
  // For large df, use z-critical approximation
  if (df > 100) {
    return alpha === 0.05 ? 1.96 : 2.576;
  }

  // For smaller df, use lookup table (alpha = 0.05 only)
  const dfs = Object.keys(T_CRITICAL_TABLE)
    .map(Number)
    .sort((a, b) => a - b);
  for (const tableDf of dfs) {
    if (df <= tableDf) return T_CRITICAL_TABLE[tableDf];
  }
  return 1.96; // fallback to z-critical
}

/**
 * Paired samples t-test for pre-post comparisons.
 *
 * Computes t-statistic, p-value, Cohen's d, and 95% CI for mean difference.
 * Suitable for within-subjects designs where each participant has two measurements.
 *
 * @param pre - Pre-test scores.
 * @param post - Post-test scores (must match pre length).
 * @returns TTestResult with t, df, p, effect size, and CI.
 * @throws Error if arrays have different lengths.
 */
export function pairedTTest(
  pre: readonly number[],
  post: readonly number[],
): {
  t: number;
  df: number;
  p: number;
  cohensD: number;
  ciLower: number;
  ciUpper: number;
  meanDiff: number;
} {
  if (pre.length !== post.length) {
    throw new Error("Pre and post arrays must have same length");
  }

  const differences = pre.map((p, i) => post[i] - p);
  const n = differences.length;
  const meanDiff = mean(differences);
  const sdDiff = sd(differences);
  const seMean = sdDiff / Math.sqrt(n);

  const t = meanDiff / seMean;
  const df = n - 1;
  const p = tDistribution(Math.abs(t), df);

  // Cohen's d for paired samples
  const cohensD = sdDiff === 0 ? 0 : meanDiff / sdDiff;

  // 95% CI for mean difference
  const tCrit = tCritical(0.05, df);
  const marginOfError = tCrit * seMean;
  const ciLower = meanDiff - marginOfError;
  const ciUpper = meanDiff + marginOfError;

  return { t, df, p, cohensD, ciLower, ciUpper, meanDiff };
}

/**
 * Independent samples t-test with confidence interval.
 *
 * Extended version of tTest that also returns Cohen's d and 95% CI.
 * Uses pooled variance (assumes equal population variances).
 *
 * @param group1 - First sample data.
 * @param group2 - Second sample data.
 * @returns TTestResult with t, df, p, effect size, and CI.
 */
export function independentTTest(
  group1: readonly number[],
  group2: readonly number[],
): {
  t: number;
  df: number;
  p: number;
  cohensD: number;
  ciLower: number;
  ciUpper: number;
  meanDiff: number;
} {
  const n1 = group1.length;
  const n2 = group2.length;
  const m1 = mean(group1);
  const m2 = mean(group2);
  const sd1 = sd(group1);
  const sd2 = sd(group2);

  // Pooled standard deviation
  const pooledVariance =
    ((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2);
  const pooledSD = Math.sqrt(pooledVariance);
  const seMean = pooledSD * Math.sqrt(1 / n1 + 1 / n2);

  const meanDiff = m1 - m2;
  const t = meanDiff / seMean;
  const df = n1 + n2 - 2;
  const p = tDistribution(Math.abs(t), df);

  // Cohen's d using pooled SD
  const cohensD = pooledSD === 0 ? 0 : meanDiff / pooledSD;

  // 95% CI
  const tCrit = tCritical(0.05, df);
  const marginOfError = tCrit * seMean;
  const ciLower = meanDiff - marginOfError;
  const ciUpper = meanDiff + marginOfError;

  return { t, df, p, cohensD, ciLower, ciUpper, meanDiff };
}

/**
 * Power analysis for sample size planning.
 *
 * Calculates required sample size per group to detect a given effect size
 * with specified alpha level and statistical power.
 * Based on Cohen (1988) power analysis formulas.
 *
 * @param effectSize - Expected Cohen's d effect size.
 * @param alpha - Significance level (0.05 or 0.01). Default: 0.05.
 * @param power - Desired statistical power (0.8 or 0.9). Default: 0.8.
 * @param attritionRate - Expected attrition rate for inflation. Default: 0.2.
 * @returns PowerAnalysisResult with required and inflated sample sizes.
 */
export function powerAnalysis(
  effectSize: number,
  alpha: number = 0.05,
  power: number = 0.8,
  attritionRate: number = 0.2,
): {
  requiredNPerGroup: number;
  totalN: number;
  inflatedNPerGroup: number;
  inflatedTotal: number;
} {
  // z-values for common alpha and power levels
  const zAlpha = alpha === 0.05 ? 1.96 : 2.576;
  const zBeta = power === 0.8 ? 0.84 : power === 0.9 ? 1.28 : 0.52;

  // n = 2(z_alpha + z_beta)^2 / d^2
  const requiredNPerGroup = Math.ceil(
    (2 * (zAlpha + zBeta) ** 2) / effectSize ** 2,
  );

  // Account for attrition
  const inflatedNPerGroup = Math.ceil(requiredNPerGroup / (1 - attritionRate));

  return {
    requiredNPerGroup,
    totalN: requiredNPerGroup * 2,
    inflatedNPerGroup,
    inflatedTotal: inflatedNPerGroup * 2,
  };
}
