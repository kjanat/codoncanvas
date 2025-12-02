/**
 * Descriptive statistics functions
 */

import type { DescriptiveStats } from "@/analysis/types/statistics";

/**
 * Sum all values in an array.
 *
 * @param values - The array of values to sum.
 * @returns The sum of all values, or 0 if the array is empty.
 */
export function sum(values: readonly number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate arithmetic mean.
 *
 * @param values - The array of values to calculate the mean for.
 * @returns The arithmetic mean, or 0 if the array is empty.
 */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

/**
 * Calculate standard deviation.
 *
 * Uses Bessel's correction `(n-1)` for sample SD by default.
 *
 * @param values - The array of values to calculate the standard deviation for.
 * @param sample - Whether to use Bessel's correction (n-1) for sample SD.
 * @returns The standard deviation value, or 0 if the array is empty.
 */
export function sd(values: readonly number[], sample = true): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const divisor = sample ? values.length - 1 : values.length;
  const squaredDiffs = values.map((val) => (val - m) ** 2);
  return Math.sqrt(sum(squaredDiffs) / divisor);
}

/**
 * Calculate median (50th percentile).
 *
 * Averages two middle values for even-length arrays.
 *
 * @param values - The array of values to calculate the median for.
 * @returns The median value, or 0 if the array is empty.
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate quartile using linear interpolation.
 *
 * @param values - The array of values to calculate the quartile for.
 * @param q - The quartile to calculate (1 for Q1, 3 for Q3).
 * @returns The quartile value, or 0 if the array is empty.
 */
export function quartile(values: readonly number[], q: 1 | 3): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = q === 1 ? 0.25 : 0.75;
  const index = pos * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate minimum value.
 *
 * @returns The minimum value in the array, or 0 if the array is empty.
 */
export function min(values: readonly number[]): number {
  return values.length > 0 ? Math.min(...values) : 0;
}

/**
 * Calculate maximum value.
 *
 * @returns The maximum value in the array, or 0 if the array is empty.
 */
export function max(values: readonly number[]): number {
  return values.length > 0 ? Math.max(...values) : 0;
}

/** Calculate all descriptive statistics for a dataset */
export function descriptiveStats(values: readonly number[]): DescriptiveStats {
  return {
    n: values.length,
    mean: mean(values),
    sd: sd(values),
    min: min(values),
    max: max(values),
    median: median(values),
    q1: quartile(values, 1),
    q3: quartile(values, 3),
  };
}
