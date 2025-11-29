/**
 * Code analysis and metrics module
 */

export type { CodonAnalysis } from "./codon-analyzer";
export { analyzeCodonUsage, compareAnalyses } from "./codon-analyzer";
export type {
  AnalysisReport,
  ComparisonResult,
  DescriptiveStats,
  EngagementMetrics,
  LearningVelocity,
  MetricsSession,
  MutationPatterns,
  RenderModePreferences,
  ToolAdoption,
} from "./metrics-analyzer-core";
export {
  formatDuration,
  formatNumber,
  formatPercentage,
  MetricsAnalyzer,
  parseCSVContent,
  Stats,
} from "./metrics-analyzer-core";
export type {
  ExecutionEvent,
  FeatureEvent,
  MutationEvent,
  ResearchMetricsOptions,
  ResearchSession,
} from "./research-metrics";
export { ResearchMetrics } from "./research-metrics";
