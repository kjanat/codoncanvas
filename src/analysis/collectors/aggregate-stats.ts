/**
 * Aggregate Statistics Calculator
 *
 * Pure functions for computing aggregate metrics across sessions.
 * Separates analytics from collection/tracking logic.
 */

import {
  createFeatureCounts,
  createMutationCounts,
  createRenderModeCounts,
} from "@/analysis/constants";
import type {
  AggregateStats,
  ResearchSession,
} from "@/analysis/types/metrics-session";

/**
 * Accumulates mutation counts from a session into totals.
 */
function accumulateMutationCounts(
  totals: ReturnType<typeof createMutationCounts>,
  session: ResearchSession,
): void {
  totals.silent += session.mutationTypes.silent;
  totals.missense += session.mutationTypes.missense;
  totals.nonsense += session.mutationTypes.nonsense;
  totals.frameshift += session.mutationTypes.frameshift;
  totals.point += session.mutationTypes.point;
  totals.insertion += session.mutationTypes.insertion;
  totals.deletion += session.mutationTypes.deletion;
}

/**
 * Accumulates render mode counts from a session into totals.
 */
function accumulateRenderModeCounts(
  totals: ReturnType<typeof createRenderModeCounts>,
  session: ResearchSession,
): void {
  totals.visual += session.renderModeUsage.visual;
  totals.audio += session.renderModeUsage.audio;
  totals.both += session.renderModeUsage.both;
}

/**
 * Accumulates feature counts from a session into totals.
 */
function accumulateFeatureCounts(
  totals: ReturnType<typeof createFeatureCounts>,
  session: ResearchSession,
): void {
  totals.diffViewer += session.features.diffViewer;
  totals.timeline += session.features.timeline;
  totals.evolution += session.features.evolution;
  totals.assessment += session.features.assessment;
  totals.export += session.features.export;
}

/**
 * Computes aggregate statistics across all sessions.
 */
export function computeAggregateStats(
  sessions: ResearchSession[],
): AggregateStats {
  const mutationTypeDistribution = createMutationCounts();
  const renderModePreferences = createRenderModeCounts();
  const featureUsage = createFeatureCounts();

  let totalDuration = 0;
  let totalGenomesCreated = 0;
  let totalGenomesExecuted = 0;
  let totalMutations = 0;
  let totalErrors = 0;
  const timeToFirstArtifacts: number[] = [];

  for (const session of sessions) {
    totalDuration += session.duration ?? 0;
    totalGenomesCreated += session.genomesCreated;
    totalGenomesExecuted += session.genomesExecuted;
    totalMutations += session.mutationsApplied;
    totalErrors += session.errors.length;

    if (session.timeToFirstArtifact !== null) {
      timeToFirstArtifacts.push(session.timeToFirstArtifact);
    }

    accumulateMutationCounts(mutationTypeDistribution, session);
    accumulateRenderModeCounts(renderModePreferences, session);
    accumulateFeatureCounts(featureUsage, session);
  }

  const sessionCount = sessions.length;

  return {
    totalSessions: sessionCount,
    totalDuration,
    avgDuration: sessionCount > 0 ? totalDuration / sessionCount : 0,
    totalGenomesCreated,
    totalGenomesExecuted,
    totalMutations,
    avgTimeToFirstArtifact: computeAverage(timeToFirstArtifacts),
    mutationTypeDistribution,
    renderModePreferences,
    featureUsage,
    totalErrors,
  };
}

/**
 * Computes average of numeric array, returns 0 for empty arrays.
 */
function computeAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
