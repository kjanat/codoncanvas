/**
 * Statistical type definitions for metrics analysis
 */

/**
 * Descriptive statistics summary (mean, SD, quartiles, min/max)
 *
 * Standard statistical measures computed from a distribution of values.
 * Enables comparison of learning metrics across different student populations.
 */
export interface DescriptiveStats {
  /** Sample size (number of observations) */
  n: number;
  /** Arithmetic mean */
  mean: number;
  /** Standard deviation */
  sd: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Median (50th percentile) */
  median: number;
  /** First quartile (25th percentile) */
  q1: number;
  /** Third quartile (75th percentile) */
  q3: number;
}

/**
 * Result from a paired or independent t-test
 *
 * Contains the t-statistic, degrees of freedom, p-value,
 * effect size (Cohen's d), and confidence interval for mean difference.
 */
export interface TTestResult {
  /** T-statistic value */
  t: number;
  /** Degrees of freedom */
  df: number;
  /** Two-tailed p-value */
  p: number;
  /** Cohen's d effect size */
  cohensD: number;
  /** Lower bound of 95% CI for mean difference */
  ciLower: number;
  /** Upper bound of 95% CI for mean difference */
  ciUpper: number;
  /** Mean difference between groups */
  meanDiff: number;
}

/**
 * Power analysis result for sample size planning
 *
 * Calculates required sample sizes for detecting a given effect size
 * with specified alpha and power levels.
 */
export interface PowerAnalysisResult {
  /** Required n per group (without attrition) */
  requiredNPerGroup: number;
  /** Total n required (both groups) */
  totalN: number;
  /** Inflated n per group (accounting for attrition) */
  inflatedNPerGroup: number;
  /** Inflated total n */
  inflatedTotal: number;
}

/**
 * Statistical comparison result between two groups
 *
 * T-test result comparing a metric between two student groups.
 * Includes effect size (Cohen's d) and statistical interpretation.
 */
export interface ComparisonResult {
  /** Label for first group */
  group1: string;
  /** Label for second group */
  group2: string;
  /** Which metric was compared */
  metric: string;
  /** Mean value for group 1 */
  group1Mean: number;
  /** Mean value for group 2 */
  group2Mean: number;
  /** Absolute difference between means */
  diff: number;
  /** Percentage change from group1 to group2 */
  percentChange: number;
  /** T-test statistic */
  t: number;
  /** P-value (significance level) */
  p: number;
  /** Cohen's d effect size */
  cohensD: number;
  /** Human-readable interpretation */
  interpretation: string;
}
