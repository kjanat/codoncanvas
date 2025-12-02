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

// Constants and shared types
export {
  createFeatureCounts,
  createMutationCounts,
  createRenderModeCounts,
  type FeatureCounts,
  LEARNING_VELOCITY,
  MS_PER_MINUTE,
  MS_PER_SECOND,
  MUTATION_TYPES,
  type MutationCounts,
  type MutationType,
  RENDER_MODES,
  type RenderMode,
  type RenderModeCounts,
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
export {
  REQUIRED_SESSION_FIELDS,
  type RequiredSessionField,
  type SchemaField,
  SESSION_SCHEMA,
} from "./parsers/schema";

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
  independentTTest,
  interpretEffectSize,
  interpretPValue,
  normalCDF,
  pairedTTest,
  powerAnalysis,
  tCritical,
  tDistribution,
  tTest,
} from "./statistics/inferential";

// Types (re-exported from types/)
export type {
  AggregateStats,
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
  SessionError,
  ToolAdoption,
} from "./types";
