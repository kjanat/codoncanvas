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
