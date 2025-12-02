/**
 * Statistics module exports
 */

export {
  descriptiveStats,
  max,
  mean,
  median,
  min,
  quartile,
  sd,
  sum,
} from "./descriptive";

export {
  cohensD,
  independentTTest,
  interpretEffectSize,
  interpretPValue,
  normalCDF,
  pairedTTest,
  powerAnalysis,
  tCritical,
  tDistribution,
  tTest,
} from "./inferential";

// Re-export Stats class for backward compatibility
export { Stats } from "./stats-class";
