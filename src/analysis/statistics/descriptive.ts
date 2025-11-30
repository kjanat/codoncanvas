/**
 * Descriptive statistics functions
 */

import type { DescriptiveStats } from "@/analysis/types/statistics";

/** Sum all values in an array */
export function sum(values: readonly number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

/** Calculate arithmetic mean */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

/** Calculate standard deviation */
export function sd(values: readonly number[], sample = true): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const divisor = sample ? values.length - 1 : values.length;
  const squaredDiffs = values.map((val) => (val - m) ** 2);
  return Math.sqrt(sum(squaredDiffs) / divisor);
}

/** Calculate median (50th percentile) */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Calculate quartile (Q1 or Q3) */
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

/** Calculate minimum value */
export function min(values: readonly number[]): number {
  return values.length > 0 ? Math.min(...values) : 0;
}

/** Calculate maximum value */
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
