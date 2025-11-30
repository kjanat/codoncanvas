/**
 * Code analysis and metrics module
 *
 * Modular structure:
 * - analyzers/    - Codon analysis, metrics aggregation
 * - collectors/   - Research metrics collection (localStorage)
 * - formatters/   - Duration, number, percentage formatting
 * - parsers/      - CSV parsing with schema validation
 * - statistics/   - Descriptive and inferential stats
 * - types/        - TypeScript interfaces and types
 */

// Analyzers
export {
  analyzeCodonUsage,
  analyzeComplexity,
  type CodonAnalysis,
  compareAnalyses,
  formatAnalysis,
  type GenomeComplexity,
} from "./analyzers/codon-analyzer";
export { MetricsAnalyzer } from "./analyzers/metrics-analyzer";

// Collectors
export {
  ResearchMetrics,
  type ResearchMetricsOptions,
} from "./collectors/research-metrics";

// Constants
export {
  LEARNING_VELOCITY,
  MS_PER_MINUTE,
  MS_PER_SECOND,
  MUTATION_TYPES,
  type MutationType,
  TOOL_FEATURES,
  type ToolFeature,
} from "./constants";

// Formatters
export { formatDuration } from "./formatters/duration";
export { formatNumber, formatPercentage } from "./formatters/number";

// Parsers
export {
  type ParseCSVResult,
  parseCSVContent,
  parseCSVContentWithErrors,
} from "./parsers/csv-parser";
export { type SchemaField, SESSION_SCHEMA } from "./parsers/schema";

// Statistics
export {
  descriptiveStats,
  max,
  mean,
  median,
  min,
  quartile,
  sd,
  sum,
} from "./statistics/descriptive";
export {
  cohensD,
  interpretEffectSize,
  interpretPValue,
  normalCDF,
  tDistribution,
  tTest,
} from "./statistics/inferential";
export { Stats } from "./statistics/stats-class";

// Types (re-exported from types/)
export type {
  AnalysisReport,
  ComparisonResult,
  DescriptiveStats,
  EngagementMetrics,
  ExecutionEvent,
  FeatureEvent,
  LearningVelocity,
  MetricsSession,
  MutationEvent,
  MutationPatterns,
  RenderModePreferences,
  ResearchSession,
  ToolAdoption,
} from "./types";
