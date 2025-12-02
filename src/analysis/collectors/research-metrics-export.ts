/**
 * Research Metrics Export Utilities
 *
 * Pure functions for serializing research session data.
 * Separates export concerns from collection/tracking logic.
 */

import type { ResearchSession } from "@/analysis/types/metrics-session";

/** CSV column headers for session export */
const CSV_HEADERS = [
  "sessionId",
  "startTime",
  "duration",
  "genomesCreated",
  "genomesExecuted",
  "mutationsApplied",
  "timeToFirstArtifact",
  "visualMode",
  "audioMode",
  "bothMode",
  "silentMutations",
  "missenseMutations",
  "nonsenseMutations",
  "frameshiftMutations",
  "pointMutations",
  "insertions",
  "deletions",
  "diffViewerUsage",
  "timelineUsage",
  "evolutionUsage",
  "assessmentUsage",
  "exportUsage",
  "errorCount",
] as const;

/**
 * Merges stored sessions with current active session (if any).
 * Calculates duration for ongoing sessions.
 */
export function prepareSessionsForExport(
  storedSessions: ResearchSession[],
  currentSession: ResearchSession | null,
): ResearchSession[] {
  if (!currentSession) {
    return storedSessions;
  }

  return [
    ...storedSessions,
    {
      ...currentSession,
      duration: Date.now() - currentSession.startTime,
    },
  ];
}

/**
 * Exports sessions as formatted JSON string.
 */
export function formatSessionsAsJSON(sessions: ResearchSession[]): string {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      version: "1.0",
      totalSessions: sessions.length,
      sessions,
    },
    null,
    2,
  );
}

/**
 * Converts a single session to CSV row values.
 */
function sessionToCSVRow(session: ResearchSession): (string | number)[] {
  return [
    session.sessionId,
    new Date(session.startTime).toISOString(),
    session.duration !== null ? session.duration.toString() : "",
    session.genomesCreated,
    session.genomesExecuted,
    session.mutationsApplied,
    session.timeToFirstArtifact !== null
      ? session.timeToFirstArtifact.toString()
      : "",
    session.renderModeUsage.visual,
    session.renderModeUsage.audio,
    session.renderModeUsage.both,
    session.mutationTypes.silent,
    session.mutationTypes.missense,
    session.mutationTypes.nonsense,
    session.mutationTypes.frameshift,
    session.mutationTypes.point,
    session.mutationTypes.insertion,
    session.mutationTypes.deletion,
    session.features.diffViewer,
    session.features.timeline,
    session.features.evolution,
    session.features.assessment,
    session.features.export,
    session.errors.length,
  ];
}

/**
 * Exports sessions as CSV string.
 */
export function formatSessionsAsCSV(sessions: ResearchSession[]): string {
  const rows = sessions.map(sessionToCSVRow);
  return [CSV_HEADERS.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
