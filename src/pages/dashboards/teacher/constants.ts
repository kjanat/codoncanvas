/**
 * Constants and demo data generators for Teacher Dashboard
 */

import type { DemoSession, EngagementLevel, TutorialProgress } from "./types";

export const TUTORIAL_IDS = [
  "helloCircle",
  "mutations",
  "timeline",
  "evolution",
] as const;

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function downloadFile(
  content: string,
  filename: string,
  type: string,
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateDemoSession(
  studentId: string,
  sessionIndex: number,
  isHighEngagement: boolean,
): DemoSession {
  return {
    sessionId: `demo_${studentId}_${sessionIndex}`,
    startTime: Date.now() - (5 - sessionIndex) * 24 * 60 * 60 * 1000,
    endTime: Date.now() - (5 - sessionIndex) * 24 * 60 * 60 * 1000 + 1800000,
    duration: 1800000,
    genomesCreated: isHighEngagement ? 10 : 5,
    genomesExecuted: isHighEngagement ? 15 : 8,
    mutationsApplied: isHighEngagement ? 25 : 12,
    renderModeUsage: { visual: 10, audio: 3, both: 2 },
    features: {
      diffViewer: 5,
      timeline: 3,
      evolution: 2,
      assessment: 1,
      export: 2,
    },
    timeToFirstArtifact:
      sessionIndex === 0 ? (isHighEngagement ? 180000 : 300000) : null,
    errors: [],
    mutationTypes: {
      silent: 5,
      missense: 8,
      nonsense: 3,
      frameshift: 4,
      point: 10,
      insertion: 3,
      deletion: 2,
    },
  };
}

export function generateDemoTutorials(
  engagementLevel: EngagementLevel,
  tutorialIds: readonly string[],
): Record<string, TutorialProgress> {
  const tutorials: Record<string, TutorialProgress> = {};

  for (const [idx, tutorialId] of tutorialIds.entries()) {
    if (engagementLevel === "low") {
      tutorials[tutorialId] = {
        completed: false,
        currentStep: 0,
        totalSteps: 6,
        startedAt: null,
        completedAt: null,
      };
    } else {
      const completed = engagementLevel === "high" || idx < 2;
      tutorials[tutorialId] = {
        completed,
        currentStep: completed ? 6 : idx + 2,
        totalSteps: 6,
        startedAt: Date.now() - (4 - idx) * 24 * 60 * 60 * 1000,
        completedAt: completed
          ? Date.now() - (3 - idx) * 24 * 60 * 60 * 1000
          : null,
      };
    }
  }

  return tutorials;
}
