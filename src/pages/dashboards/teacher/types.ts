/**
 * Types for Teacher Dashboard
 */

export interface DemoSession {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  genomesCreated: number;
  genomesExecuted: number;
  mutationsApplied: number;
  renderModeUsage: { visual: number; audio: number; both: number };
  features: {
    diffViewer: number;
    timeline: number;
    evolution: number;
    assessment: number;
    export: number;
  };
  timeToFirstArtifact: number | null;
  errors: Array<{ timestamp: number; type: string; message: string }>;
  mutationTypes: {
    silent: number;
    missense: number;
    nonsense: number;
    frameshift: number;
    point: number;
    insertion: number;
    deletion: number;
  };
}

export interface TutorialProgress {
  completed: boolean;
  currentStep: number;
  totalSteps: number;
  startedAt: number | null;
  completedAt: number | null;
}

export type EngagementLevel = "high" | "medium" | "low";
