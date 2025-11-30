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

import type {
  ExecutionEvent,
  FeatureEvent,
  MutationEvent,
} from "@/analysis/types/events";
import type { ResearchSession } from "@/analysis/types/metrics-session";

// Re-export types for backward compatibility
export type { ExecutionEvent, FeatureEvent, MutationEvent, ResearchSession };

/**
 * Research metrics configuration options
 *
 * Controls data collection behavior including whether tracking is enabled,
 * storage limits, and auto-save frequency.
 */
export interface ResearchMetricsOptions {
  /** Whether to enable automatic session tracking (default: false) */
  enabled: boolean;
  /** Maximum number of sessions to store locally (default: 100) */
  maxSessions: number;
  /** Auto-save interval in milliseconds (default: 60000 = 1 minute) */
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
      enabled: false, // Disabled by default (opt-in)
      maxSessions: 100, // Store up to 100 sessions
      autoSaveInterval: 30000, // Auto-save every 30 seconds
      ...options,
    };

    // Load existing data if enabled
    if (this.options.enabled) {
      this.startSession();
    }
  }

  /**
   * Enable research metrics collection.
   * User must explicitly opt-in.
   */
  enable(): void {
    this.options.enabled = true;
    this.startSession();
  }

  /**
   * Disable research metrics collection.
   * Stops current session but preserves historical data.
   */
  disable(): void {
    this.options.enabled = false;
    this.endSession();
  }

  /**
   * Check if metrics collection is currently enabled.
   */
  isEnabled(): boolean {
    return this.options.enabled && this.currentSession !== null;
  }

  /**
   * Start a new research session.
   */
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
      renderModeUsage: { visual: 0, audio: 0, both: 0 },
      features: {
        diffViewer: 0,
        timeline: 0,
        evolution: 0,
        assessment: 0,
        export: 0,
      },
      timeToFirstArtifact: null,
      errors: [],
      mutationTypes: {
        silent: 0,
        missense: 0,
        nonsense: 0,
        frameshift: 0,
        point: 0,
        insertion: 0,
        deletion: 0,
      },
    };

    // Start auto-save timer
    this.startAutoSave();
  }

  /**
   * End the current research session.
   */
  endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration =
      this.currentSession.endTime - this.currentSession.startTime;

    // Save final session
    this.saveSession();

    // Stop auto-save timer
    this.stopAutoSave();

    this.currentSession = null;
  }

  /**
   * Track genome creation event.
   */
  trackGenomeCreated(_genomeLength: number): void {
    if (!this.currentSession) return;

    this.currentSession.genomesCreated++;
  }

  /**
   * Track genome execution event.
   */
  trackGenomeExecuted(event: ExecutionEvent): void {
    if (!this.currentSession) return;

    this.currentSession.genomesExecuted++;
    this.currentSession.renderModeUsage[event.renderMode]++;

    // Track time to first artifact
    if (event.success && this.currentSession.timeToFirstArtifact === null) {
      this.currentSession.timeToFirstArtifact =
        Date.now() - this.currentSession.startTime;
    }

    // Track errors
    if (!event.success && event.errorMessage) {
      this.currentSession.errors.push({
        timestamp: Date.now(),
        type: "execution",
        message: event.errorMessage,
      });
    }
  }

  /**
   * Track mutation application event.
   */
  trackMutation(event: MutationEvent): void {
    if (!this.currentSession) return;

    this.currentSession.mutationsApplied++;
    this.currentSession.mutationTypes[event.type]++;
  }

  /**
   * Track feature usage event.
   */
  trackFeatureUsage(event: FeatureEvent): void {
    if (!this.currentSession) return;

    if (event.action === "open" || event.action === "interact") {
      this.currentSession.features[event.feature]++;
    }
  }

  /**
   * Track error event.
   */
  trackError(type: string, message: string): void {
    if (!this.isEnabled()) return;

    this.currentSession?.errors.push({
      timestamp: Date.now(),
      type,
      message,
    });
  }

  /**
   * Get current session statistics.
   */
  getCurrentSession(): ResearchSession | null {
    return this.currentSession;
  }

  /**
   * Get all stored sessions.
   */
  getAllSessions(): ResearchSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Export all sessions as JSON.
   */
  exportData(): string {
    const sessions = this.getAllSessions();

    // Add current session if active
    if (this.currentSession) {
      const currentSnapshot = {
        ...this.currentSession,
        duration: Date.now() - this.currentSession.startTime,
      };
      sessions.push(currentSnapshot);
    }

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
   * Export sessions as CSV.
   */
  exportCSV(): string {
    const sessions = this.getAllSessions();

    if (this.currentSession) {
      const currentSnapshot = {
        ...this.currentSession,
        duration: Date.now() - this.currentSession.startTime,
      };
      sessions.push(currentSnapshot);
    }

    // CSV header
    const headers = [
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
    ];

    // CSV rows
    const rows = sessions.map((s) => [
      s.sessionId,
      new Date(s.startTime).toISOString(),
      s.duration !== null ? s.duration.toString() : "",
      s.genomesCreated,
      s.genomesExecuted,
      s.mutationsApplied,
      s.timeToFirstArtifact !== null ? s.timeToFirstArtifact.toString() : "",
      s.renderModeUsage.visual,
      s.renderModeUsage.audio,
      s.renderModeUsage.both,
      s.mutationTypes.silent,
      s.mutationTypes.missense,
      s.mutationTypes.nonsense,
      s.mutationTypes.frameshift,
      s.mutationTypes.point,
      s.mutationTypes.insertion,
      s.mutationTypes.deletion,
      s.features.diffViewer,
      s.features.timeline,
      s.features.evolution,
      s.features.assessment,
      s.features.export,
      s.errors.length,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  /**
   * Get aggregate statistics across all sessions.
   */
  getAggregateStats(): {
    totalSessions: number;
    totalDuration: number;
    avgDuration: number;
    totalGenomesCreated: number;
    totalGenomesExecuted: number;
    totalMutations: number;
    avgTimeToFirstArtifact: number;
    mutationTypeDistribution: {
      silent: number;
      missense: number;
      nonsense: number;
      frameshift: number;
      point: number;
      insertion: number;
      deletion: number;
    };
    renderModePreferences: {
      visual: number;
      audio: number;
      both: number;
    };
    featureUsage: {
      diffViewer: number;
      timeline: number;
      evolution: number;
      assessment: number;
      export: number;
    };
    totalErrors: number;
  } {
    const sessions = this.getAllSessions();

    const totalDuration = sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0,
    );
    const timeToFirstArtifacts = sessions
      .map((s) => s.timeToFirstArtifact)
      .filter((t): t is number => t !== null);

    const mutationTypeDistribution = {
      silent: 0,
      missense: 0,
      nonsense: 0,
      frameshift: 0,
      point: 0,
      insertion: 0,
      deletion: 0,
    };

    const renderModePreferences = { visual: 0, audio: 0, both: 0 };
    const featureUsage = {
      diffViewer: 0,
      timeline: 0,
      evolution: 0,
      assessment: 0,
      export: 0,
    };

    for (const s of sessions) {
      mutationTypeDistribution.silent += s.mutationTypes.silent;
      mutationTypeDistribution.missense += s.mutationTypes.missense;
      mutationTypeDistribution.nonsense += s.mutationTypes.nonsense;
      mutationTypeDistribution.frameshift += s.mutationTypes.frameshift;
      mutationTypeDistribution.point += s.mutationTypes.point;
      mutationTypeDistribution.insertion += s.mutationTypes.insertion;
      mutationTypeDistribution.deletion += s.mutationTypes.deletion;

      renderModePreferences.visual += s.renderModeUsage.visual;
      renderModePreferences.audio += s.renderModeUsage.audio;
      renderModePreferences.both += s.renderModeUsage.both;

      featureUsage.diffViewer += s.features.diffViewer;
      featureUsage.timeline += s.features.timeline;
      featureUsage.evolution += s.features.evolution;
      featureUsage.assessment += s.features.assessment;
      featureUsage.export += s.features.export;
    }

    return {
      totalSessions: sessions.length,
      totalDuration,
      avgDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
      totalGenomesCreated: sessions.reduce(
        (sum, s) => sum + s.genomesCreated,
        0,
      ),
      totalGenomesExecuted: sessions.reduce(
        (sum, s) => sum + s.genomesExecuted,
        0,
      ),
      totalMutations: sessions.reduce((sum, s) => sum + s.mutationsApplied, 0),
      avgTimeToFirstArtifact:
        timeToFirstArtifacts.length > 0
          ? timeToFirstArtifacts.reduce((sum, t) => sum + t, 0) /
            timeToFirstArtifacts.length
          : 0,
      mutationTypeDistribution,
      renderModePreferences,
      featureUsage,
      totalErrors: sessions.reduce((sum, s) => sum + s.errors.length, 0),
    };
  }

  /**
   * Clear all stored research data.
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentSession = null;
  }

  /**
   * Save current session to localStorage.
   */
  private saveSession(): void {
    if (!this.currentSession) return;

    try {
      const sessions = this.getAllSessions();

      // Add or update current session
      const existingIndex = sessions.findIndex(
        (s) => s.sessionId === this.currentSession?.sessionId,
      );
      if (existingIndex >= 0) {
        sessions[existingIndex] = this.currentSession;
      } else {
        sessions.push(this.currentSession);
      }

      // Enforce max sessions limit
      if (sessions.length > this.options.maxSessions) {
        sessions.splice(0, sessions.length - this.options.maxSessions);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (_error) {
      // Save failed - fail silently
    }
  }

  /**
   * Start auto-save timer.
   */
  private startAutoSave(): void {
    this.stopAutoSave(); // Clear any existing timer

    this.autoSaveTimer = window.setInterval(() => {
      this.saveSession();
    }, this.options.autoSaveInterval);
  }

  /**
   * Stop auto-save timer.
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Generate unique session ID.
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
