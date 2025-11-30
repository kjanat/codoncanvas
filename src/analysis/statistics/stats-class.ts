/**
 * Stats class - backward compatible wrapper around statistics functions
 */

import {
  descriptiveStats,
  max,
  mean,
  median,
  min,
  quartile,
  sd,
} from "./descriptive";
import {
  cohensD,
  interpretEffectSize,
  interpretPValue,
  normalCDF,
  tDistribution,
  tTest,
} from "./inferential";

/**
 * Static utility class for statistical calculations
 *
 * @deprecated Prefer using individual function imports for tree-shaking
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Backward compatibility wrapper
export class Stats {
  static mean = mean;
  static sd = sd;
  static median = median;
  static quartile = quartile;
  static min = min;
  static max = max;
  static descriptive = descriptiveStats;
  static tTest = tTest;
  static cohensD = cohensD;
  static tDistribution = tDistribution;
  static normalCDF = normalCDF;
  static interpretEffectSize = interpretEffectSize;
  static interpretPValue = interpretPValue;
}
