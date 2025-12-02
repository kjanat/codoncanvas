/**
 * Research Metrics Collection System
 *
 * Privacy-respecting telemetry for educational research studies.
 * Enables data collection for effectiveness studies outlined in RESEARCH_FOUNDATION.md.
 *
 * Design Principles:
 * - Opt-in only (disabled by default)
 * - No PII (personally identifiable information)
 * - Local storage only (no automatic server transmission)
 * - Researcher-controlled export
 * - Transparent data collection (user can see what's tracked)
 */

import {
  createFeatureCounts,
  createMutationCounts,
  createRenderModeCounts,
} from "@/analysis/constants";
import type {
  ExecutionEvent,
  FeatureEvent,
  MutationEvent,
} from "@/analysis/types/events";
import type {
  AggregateStats,
  ResearchSession,
} from "@/analysis/types/metrics-session";

import { computeAggregateStats } from "./aggregate-stats";
import {
  formatSessionsAsCSV,
  formatSessionsAsJSON,
  prepareSessionsForExport,
} from "./research-metrics-export";

// Re-export types for backward compatibility
export type { ExecutionEvent, FeatureEvent, MutationEvent, ResearchSession };

/**
 * Research metrics configuration options
 */
export interface ResearchMetricsOptions {
  /** Whether to enable automatic session tracking (default: false) */
  enabled: boolean;
  /** Maximum number of sessions to store locally (default: 100) */
  maxSessions: number;
  /** Auto-save interval in milliseconds (default: 30000) */
  autoSaveInterval: number;
}

/**
 * Research metrics collection engine.
 * Tracks user interactions for educational effectiveness studies.
 */
export class ResearchMetrics {
  private options: ResearchMetricsOptions;
  private currentSession: ResearchSession | null = null;
  private autoSaveTimer: number | null = null;
  private readonly STORAGE_KEY = "codoncanvas_research_sessions";

  constructor(options: Partial<ResearchMetricsOptions> = {}) {
    this.options = {
      enabled: false,
      maxSessions: 100,
      autoSaveInterval: 30000,
      ...options,
    };

    if (this.options.enabled) {
      this.startSession();
    }
  }

  enable(): void {
    this.options.enabled = true;
    this.startSession();
  }

  disable(): void {
    this.options.enabled = false;
    this.endSession();
  }

  isEnabled(): boolean {
    return this.options.enabled && this.currentSession !== null;
  }

  private startSession(): void {
    if (!this.options.enabled) return;

    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      endTime: null,
      duration: null,
      genomesCreated: 0,
      genomesExecuted: 0,
      mutationsApplied: 0,
      renderModeUsage: createRenderModeCounts(),
      features: createFeatureCounts(),
      timeToFirstArtifact: null,
      errors: [],
      mutationTypes: createMutationCounts(),
    };

    this.startAutoSave();
  }

  endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration =
      this.currentSession.endTime - this.currentSession.startTime;

    this.saveSession();
    this.stopAutoSave();
    this.currentSession = null;
  }

  trackGenomeCreated(_genomeLength: number): void {
    if (!this.currentSession) return;
    this.currentSession.genomesCreated++;
  }

  trackGenomeExecuted(event: ExecutionEvent): void {
    if (!this.currentSession) return;

    this.currentSession.genomesExecuted++;
    this.currentSession.renderModeUsage[event.renderMode]++;

    if (event.success && this.currentSession.timeToFirstArtifact === null) {
      this.currentSession.timeToFirstArtifact =
        Date.now() - this.currentSession.startTime;
    }

    if (!event.success && event.errorMessage) {
      this.currentSession.errors.push({
        timestamp: Date.now(),
        type: "execution",
        message: event.errorMessage,
      });
    }
  }

  trackMutation(event: MutationEvent): void {
    if (!this.currentSession) return;
    this.currentSession.mutationsApplied++;
    this.currentSession.mutationTypes[event.type]++;
  }

  trackFeatureUsage(event: FeatureEvent): void {
    if (!this.currentSession) return;
    if (event.action === "open" || event.action === "interact") {
      this.currentSession.features[event.feature]++;
    }
  }

  trackError(type: string, message: string): void {
    if (!this.isEnabled()) return;
    this.currentSession?.errors.push({
      timestamp: Date.now(),
      type,
      message,
    });
  }

  getCurrentSession(): ResearchSession | null {
    return this.currentSession;
  }

  getAllSessions(): ResearchSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to read research metrics from localStorage:", error);
      return [];
    }
  }

  exportData(): string {
    const sessions = prepareSessionsForExport(
      this.getAllSessions(),
      this.currentSession,
    );
    return formatSessionsAsJSON(sessions);
  }

  exportCSV(): string {
    const sessions = prepareSessionsForExport(
      this.getAllSessions(),
      this.currentSession,
    );
    return formatSessionsAsCSV(sessions);
  }

  getAggregateStats(): AggregateStats {
    return computeAggregateStats(this.getAllSessions());
  }

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentSession = null;
  }

  private saveSession(): void {
    if (!this.currentSession) return;

    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(
        (s) => s.sessionId === this.currentSession?.sessionId,
      );

      if (existingIndex >= 0) {
        sessions[existingIndex] = this.currentSession;
      } else {
        sessions.push(this.currentSession);
      }

      if (sessions.length > this.options.maxSessions) {
        sessions.splice(0, sessions.length - this.options.maxSessions);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save research session", error);
    }
  }

  private startAutoSave(): void {
    this.stopAutoSave();
    this.autoSaveTimer = window.setInterval(() => {
      this.saveSession();
    }, this.options.autoSaveInterval);
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private generateSessionId(): string {
    // Use crypto.randomUUID() for cryptographically secure session IDs
    if (typeof crypto !== "undefined") {
      if (crypto.randomUUID) {
        return `session_${crypto.randomUUID()}`;
      }
      // Fallback for older browsers - use crypto.getRandomValues
      const array = new Uint32Array(2);
      crypto.getRandomValues(array);
      return `session_${Date.now()}_${array[0].toString(16)}${array[1].toString(16)}`;
    }
    // Final fallback for non-secure contexts
    return `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
