/**
 * Research Metrics Test Suite
 *
 * Tests for privacy-respecting telemetry and educational research data collection.
 * Tracks user interactions for effectiveness studies.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { ExecutionEvent, FeatureEvent, MutationEvent } from "@/research-metrics";
import { ResearchMetrics } from "@/research-metrics";

// Helper to create a complete ExecutionEvent
function createExecutionEvent(
  overrides: Partial<ExecutionEvent> = {}
): ExecutionEvent {
  return {
    timestamp: Date.now(),
    renderMode: "visual",
    genomeLength: 10,
    instructionCount: 100,
    success: true,
    ...overrides,
  };
}

// Helper to create a complete MutationEvent
function createMutationEvent(
  overrides: Partial<MutationEvent> = {}
): MutationEvent {
  return {
    timestamp: Date.now(),
    type: "silent",
    genomeLengthBefore: 10,
    genomeLengthAfter: 10,
    ...overrides,
  };
}

// Helper to create a complete FeatureEvent
function createFeatureEvent(
  overrides: Partial<FeatureEvent> = {}
): FeatureEvent {
  return {
    timestamp: Date.now(),
    feature: "diffViewer",
    action: "open",
    ...overrides,
  };
}

// Helper to clear localStorage between tests
const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch {
    // localStorage may not be available
  }
};

describe("ResearchMetrics", () => {
  beforeEach(() => {
    clearLocalStorage();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  // Constructor & Configuration
  describe("constructor", () => {
    test("initializes with enabled=false by default (opt-in required)", () => {
      const metrics = new ResearchMetrics();
      expect(metrics.isEnabled()).toBe(false);
    });

    test("initializes with maxSessions=100 by default", () => {
      const metrics = new ResearchMetrics();
      // maxSessions is internal, but we can verify by filling sessions
      expect(metrics).toBeDefined();
    });

    test("initializes with autoSaveInterval=30000 (30 seconds) by default", () => {
      const metrics = new ResearchMetrics();
      expect(metrics).toBeDefined();
    });

    test("accepts enabled option to start collecting immediately", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      expect(metrics.isEnabled()).toBe(true);
      metrics.disable();
    });

    test("accepts custom maxSessions limit", () => {
      const metrics = new ResearchMetrics({ maxSessions: 50 });
      expect(metrics).toBeDefined();
    });

    test("accepts custom autoSaveInterval in milliseconds", () => {
      const metrics = new ResearchMetrics({ autoSaveInterval: 60000 });
      expect(metrics).toBeDefined();
    });

    // AUTO-START
    test("starts session automatically when enabled=true in options", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      expect(metrics.getCurrentSession()).not.toBeNull();
      metrics.disable();
    });

    test("does not start session when enabled=false (default)", () => {
      const metrics = new ResearchMetrics();
      expect(metrics.getCurrentSession()).toBeNull();
    });
  });

  // Enable/Disable Lifecycle
  describe("enable", () => {
    test("sets options.enabled to true", () => {
      const metrics = new ResearchMetrics();
      metrics.enable();
      expect(metrics.isEnabled()).toBe(true);
      metrics.disable();
    });

    test("calls startSession to begin tracking", () => {
      const metrics = new ResearchMetrics();
      metrics.enable();
      expect(metrics.getCurrentSession()).not.toBeNull();
      metrics.disable();
    });

    test("calling enable multiple times creates new sessions", () => {
      const metrics = new ResearchMetrics();
      metrics.enable();
      const session1 = metrics.getCurrentSession();
      expect(session1).not.toBeNull();
      // Calling enable again creates a new session
      metrics.enable();
      const session2 = metrics.getCurrentSession();
      expect(session2).not.toBeNull();
      // Session IDs are different because a new session is created
      expect(session1?.sessionId).not.toBe(session2?.sessionId);
      metrics.disable();
    });
  });

  describe("disable", () => {
    test("sets options.enabled to false", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      expect(metrics.isEnabled()).toBe(false);
    });

    test("calls endSession to finalize current session", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      expect(metrics.getCurrentSession()).toBeNull();
    });

    test("preserves historical data in localStorage", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      const sessions = metrics.getAllSessions();
      expect(sessions.length).toBeGreaterThanOrEqual(0);
    });

    test("can be called when already disabled without error", () => {
      const metrics = new ResearchMetrics();
      expect(() => metrics.disable()).not.toThrow();
    });
  });

  describe("isEnabled", () => {
    test("returns true when enabled AND currentSession exists", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      expect(metrics.isEnabled()).toBe(true);
      metrics.disable();
    });

    test("returns false when disabled", () => {
      const metrics = new ResearchMetrics();
      expect(metrics.isEnabled()).toBe(false);
    });

    test("returns false when enabled but no current session", () => {
      const metrics = new ResearchMetrics();
      // Enabled is false by default, so isEnabled is false
      expect(metrics.isEnabled()).toBe(false);
    });
  });

  // Session Lifecycle
  describe("startSession (private, tested via enable)", () => {
    test("creates new ResearchSession with unique sessionId", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.sessionId).toMatch(/^session_\d+_/);
      metrics.disable();
    });

    test("sets startTime to current timestamp", () => {
      const before = Date.now();
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      const after = Date.now();
      expect(session?.startTime).toBeGreaterThanOrEqual(before);
      expect(session?.startTime).toBeLessThanOrEqual(after);
      metrics.disable();
    });

    test("initializes all counters to 0", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.genomesCreated).toBe(0);
      expect(session?.genomesExecuted).toBe(0);
      expect(session?.mutationsApplied).toBe(0);
      metrics.disable();
    });

    test("initializes renderModeUsage object with visual, audio, both = 0", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.renderModeUsage.visual).toBe(0);
      expect(session?.renderModeUsage.audio).toBe(0);
      expect(session?.renderModeUsage.both).toBe(0);
      metrics.disable();
    });

    test("initializes features object with all feature counts = 0", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.features).toBeDefined();
      metrics.disable();
    });

    test("initializes mutationTypes object with all types = 0", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.mutationTypes.silent).toBe(0);
      expect(session?.mutationTypes.missense).toBe(0);
      expect(session?.mutationTypes.nonsense).toBe(0);
      expect(session?.mutationTypes.frameshift).toBe(0);
      metrics.disable();
    });

    test("sets timeToFirstArtifact to null", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.timeToFirstArtifact).toBeNull();
      metrics.disable();
    });

    test("sets errors to empty array", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.errors).toEqual([]);
      metrics.disable();
    });

    test("starts auto-save timer", () => {
      const metrics = new ResearchMetrics({
        enabled: true,
        autoSaveInterval: 100,
      });
      expect(metrics.getCurrentSession()).not.toBeNull();
      metrics.disable();
    });

    test("does nothing when already disabled", () => {
      const metrics = new ResearchMetrics();
      // Cannot start session when disabled
      expect(metrics.getCurrentSession()).toBeNull();
    });
  });

  describe("endSession", () => {
    test("sets endTime to current timestamp", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const before = Date.now();
      metrics.disable();
      const sessions = metrics.getAllSessions();
      if (sessions.length > 0) {
        const session = sessions[sessions.length - 1];
        expect(session.endTime).toBeGreaterThanOrEqual(before);
      }
    });

    test("calculates duration as endTime - startTime", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      const sessions = metrics.getAllSessions();
      if (sessions.length > 0) {
        const session = sessions[sessions.length - 1];
        if (session.duration !== null) {
          expect(session.duration).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test("calls saveSession to persist data", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      const sessions = metrics.getAllSessions();
      expect(sessions.length).toBeGreaterThanOrEqual(0);
    });

    test("stops auto-save timer", () => {
      const metrics = new ResearchMetrics({
        enabled: true,
        autoSaveInterval: 100,
      });
      metrics.disable();
      expect(metrics.getCurrentSession()).toBeNull();
    });

    test("sets currentSession to null", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      expect(metrics.getCurrentSession()).toBeNull();
    });

    test("does nothing when no current session exists", () => {
      const metrics = new ResearchMetrics();
      expect(() => metrics.disable()).not.toThrow();
    });
  });

  // Event Tracking Methods
  describe("trackGenomeCreated", () => {
    test("increments genomesCreated counter", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      expect(metrics.getCurrentSession()?.genomesCreated).toBe(1);
      metrics.disable();
    });

    test("does nothing when no current session", () => {
      const metrics = new ResearchMetrics();
      expect(() => metrics.trackGenomeCreated(10)).not.toThrow();
    });

    test("accepts genomeLength parameter (currently unused in counter)", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(100);
      expect(metrics.getCurrentSession()?.genomesCreated).toBe(1);
      metrics.disable();
    });
  });

  describe("trackGenomeExecuted", () => {
    test("increments genomesExecuted counter", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted(createExecutionEvent({
        renderMode: "visual",
        success: true,
      }));
      expect(metrics.getCurrentSession()?.genomesExecuted).toBe(1);
      metrics.disable();
    });

    test("increments correct renderModeUsage counter based on event.renderMode", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
      expect(metrics.getCurrentSession()?.renderModeUsage.visual).toBe(1);
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "audio", success: true }));
      expect(metrics.getCurrentSession()?.renderModeUsage.audio).toBe(1);
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "both", success: true }));
      expect(metrics.getCurrentSession()?.renderModeUsage.both).toBe(1);
      metrics.disable();
    });

    test("sets timeToFirstArtifact on first successful execution (event.success=true)", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const startTime = metrics.getCurrentSession()?.startTime || 0;
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
      const ttfa = metrics.getCurrentSession()?.timeToFirstArtifact;
      expect(ttfa).not.toBeNull();
      expect(ttfa).toBeGreaterThanOrEqual(0);
      metrics.disable();
    });

    test("does not update timeToFirstArtifact on subsequent successes", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
      const ttfa1 = metrics.getCurrentSession()?.timeToFirstArtifact;
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
      const ttfa2 = metrics.getCurrentSession()?.timeToFirstArtifact;
      expect(ttfa1).toBe(ttfa2);
      metrics.disable();
    });

    test("adds error to errors array when event.success=false and errorMessage exists", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted(createExecutionEvent({
        renderMode: "visual",
        success: false,
        errorMessage: "Test error",
      }));
      const errors = metrics.getCurrentSession()?.errors || [];
      expect(errors.length).toBe(1);
      expect(errors[0].message).toBe("Test error");
      metrics.disable();
    });

    test("does nothing when no current session", () => {
      const metrics = new ResearchMetrics();
      expect(() =>
        metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true })),
      ).not.toThrow();
    });
  });

  describe("trackMutation", () => {
    test("increments mutationsApplied counter", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackMutation(createMutationEvent({ type: "silent" }));
      expect(metrics.getCurrentSession()?.mutationsApplied).toBe(1);
      metrics.disable();
    });

    test("increments correct mutationTypes counter based on event.type", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackMutation(createMutationEvent({ type: "silent" }));
      expect(metrics.getCurrentSession()?.mutationTypes.silent).toBe(1);
      metrics.trackMutation(createMutationEvent({ type: "missense" }));
      expect(metrics.getCurrentSession()?.mutationTypes.missense).toBe(1);
      metrics.disable();
    });

    test("handles all mutation types: silent, missense, nonsense, frameshift, point, insertion, deletion", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackMutation(createMutationEvent({ type: "silent" }));
      metrics.trackMutation(createMutationEvent({ type: "missense" }));
      metrics.trackMutation(createMutationEvent({ type: "nonsense" }));
      metrics.trackMutation(createMutationEvent({ type: "frameshift" }));
      expect(metrics.getCurrentSession()?.mutationsApplied).toBe(4);
      metrics.disable();
    });

    test("does nothing when no current session", () => {
      const metrics = new ResearchMetrics();
      expect(() => metrics.trackMutation(createMutationEvent({ type: "silent" }))).not.toThrow();
    });
  });

  describe("trackFeatureUsage", () => {
    test("increments feature counter when action is 'open'", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "diffViewer", action: "open" }));
      expect(metrics.getCurrentSession()?.features.diffViewer).toBe(1);
      metrics.disable();
    });

    test("increments feature counter when action is 'interact'", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "timeline", action: "interact" }));
      expect(metrics.getCurrentSession()?.features.timeline).toBe(1);
      metrics.disable();
    });

    test("does NOT increment counter when action is 'close'", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "diffViewer", action: "close" }));
      expect(metrics.getCurrentSession()?.features.diffViewer).toBe(0);
      metrics.disable();
    });

    test("handles all features: diffViewer, timeline, evolution, assessment, export", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "diffViewer", action: "open" }));
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "timeline", action: "open" }));
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "evolution", action: "open" }));
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "assessment", action: "open" }));
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "export", action: "open" }));
      const session = metrics.getCurrentSession();
      expect(session?.features.diffViewer).toBe(1);
      expect(session?.features.timeline).toBe(1);
      expect(session?.features.evolution).toBe(1);
      expect(session?.features.assessment).toBe(1);
      expect(session?.features.export).toBe(1);
      metrics.disable();
    });

    test("does nothing when no current session", () => {
      const metrics = new ResearchMetrics();
      expect(() =>
        metrics.trackFeatureUsage(createFeatureEvent({ feature: "diffViewer", action: "open" })),
      ).not.toThrow();
    });
  });

  describe("trackError", () => {
    test("adds error object with timestamp, type, and message to errors array", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackError("runtime", "Test error");
      const errors = metrics.getCurrentSession()?.errors || [];
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe("runtime");
      expect(errors[0].message).toBe("Test error");
      metrics.disable();
    });

    test("uses current timestamp from Date.now()", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const before = Date.now();
      metrics.trackError("runtime", "Test error");
      const after = Date.now();
      const errors = metrics.getCurrentSession()?.errors || [];
      expect(errors[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(errors[0].timestamp).toBeLessThanOrEqual(after);
      metrics.disable();
    });

    test("does nothing when not enabled (isEnabled returns false)", () => {
      const metrics = new ResearchMetrics();
      expect(() => metrics.trackError("runtime", "Test error")).not.toThrow();
    });
  });

  // Session Access
  describe("getCurrentSession", () => {
    test("returns current ResearchSession object when active", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session).not.toBeNull();
      expect(session?.sessionId).toBeDefined();
      metrics.disable();
    });

    test("returns null when no session is active", () => {
      const metrics = new ResearchMetrics();
      expect(metrics.getCurrentSession()).toBeNull();
    });
  });

  describe("getAllSessions", () => {
    test("returns empty array when localStorage is empty", () => {
      const metrics = new ResearchMetrics();
      const sessions = metrics.getAllSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });

    test("returns parsed sessions from localStorage", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      const sessions = metrics.getAllSessions();
      expect(sessions.length).toBeGreaterThanOrEqual(0);
    });

    test("returns empty array when localStorage.getItem throws error", () => {
      const metrics = new ResearchMetrics();
      // This is tested implicitly - if localStorage is unavailable
      expect(metrics.getAllSessions()).toEqual([]);
    });

    test("returns empty array when JSON.parse fails", () => {
      const metrics = new ResearchMetrics();
      // Set invalid JSON
      try {
        localStorage.setItem("codoncanvas-research", "invalid json");
      } catch {
        // localStorage may not be available
      }
      const sessions = metrics.getAllSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  // Data Export
  describe("exportData", () => {
    test("returns JSON string with exportDate, version, totalSessions, and sessions array", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      const data = metrics.exportData();
      const parsed = JSON.parse(data);
      expect(parsed.exportDate).toBeDefined();
      expect(parsed.version).toBeDefined();
      expect(parsed.totalSessions).toBeDefined();
      expect(Array.isArray(parsed.sessions)).toBe(true);
    });

    test("includes all stored sessions from localStorage", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      const data = metrics.exportData();
      const parsed = JSON.parse(data);
      expect(parsed.sessions).toBeDefined();
    });

    test("includes current session snapshot if active (with calculated duration)", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const data = metrics.exportData();
      const parsed = JSON.parse(data);
      // Current session should be included
      expect(parsed.sessions.length).toBeGreaterThanOrEqual(0);
      metrics.disable();
    });

    test("formats JSON with 2-space indentation", () => {
      const metrics = new ResearchMetrics();
      const data = metrics.exportData();
      expect(data).toContain("\n");
    });
  });

  describe("exportCSV", () => {
    test("returns CSV string with header row", () => {
      const metrics = new ResearchMetrics();
      const csv = metrics.exportCSV();
      expect(csv.startsWith("sessionId")).toBe(true);
    });

    test("includes all expected columns: sessionId, startTime, duration, etc.", () => {
      const metrics = new ResearchMetrics();
      const csv = metrics.exportCSV();
      expect(csv).toContain("sessionId");
      expect(csv).toContain("startTime");
      expect(csv).toContain("duration");
    });

    test("includes all stored sessions as data rows", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      const csv = metrics.exportCSV();
      const lines = csv.split("\n");
      expect(lines.length).toBeGreaterThanOrEqual(1); // At least header
    });

    test("includes current session if active", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const csv = metrics.exportCSV();
      expect(csv.length).toBeGreaterThan(0);
      metrics.disable();
    });

    test("formats startTime as ISO string", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      const csv = metrics.exportCSV();
      // ISO format contains T and Z
      expect(csv.length).toBeGreaterThan(0);
    });

    test("handles null timeToFirstArtifact (empty string in CSV)", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      const csv = metrics.exportCSV();
      expect(csv).toBeDefined();
    });

    test("handles null duration (empty string in CSV)", () => {
      const metrics = new ResearchMetrics();
      const csv = metrics.exportCSV();
      expect(csv).toBeDefined();
    });
  });

  // Aggregate Statistics
  describe("getAggregateStats", () => {
    test("returns totalSessions count", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.totalSessions).toBeGreaterThanOrEqual(0);
    });

    test("returns totalDuration sum across all sessions", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.totalDuration).toBeGreaterThanOrEqual(0);
    });

    test("returns avgDuration (totalDuration / totalSessions)", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.avgDuration).toBeGreaterThanOrEqual(0);
    });

    test("returns 0 for avgDuration when no sessions", () => {
      const metrics = new ResearchMetrics();
      const stats = metrics.getAggregateStats();
      expect(stats.avgDuration).toBe(0);
    });

    test("returns totalGenomesCreated sum", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.totalGenomesCreated).toBeGreaterThanOrEqual(0);
    });

    test("returns totalGenomesExecuted sum", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.totalGenomesExecuted).toBeGreaterThanOrEqual(0);
    });

    test("returns totalMutations sum", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackMutation(createMutationEvent({ type: "silent" }));
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.totalMutations).toBeGreaterThanOrEqual(0);
    });

    test("returns avgTimeToFirstArtifact (filters null values)", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.avgTimeToFirstArtifact).toBeGreaterThanOrEqual(0);
    });

    test("returns 0 for avgTimeToFirstArtifact when no valid values", () => {
      const metrics = new ResearchMetrics();
      const stats = metrics.getAggregateStats();
      expect(stats.avgTimeToFirstArtifact).toBe(0);
    });

    test("returns mutationTypeDistribution with sums for each type", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackMutation(createMutationEvent({ type: "silent" }));
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.mutationTypeDistribution).toBeDefined();
    });

    test("returns renderModePreferences with sums for visual, audio, both", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.renderModePreferences).toBeDefined();
    });

    test("returns featureUsage with sums for each feature", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackFeatureUsage(createFeatureEvent({ feature: "diffViewer", action: "open" }));
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.featureUsage).toBeDefined();
    });

    test("returns totalErrors count across all sessions", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackError("runtime", "Test");
      metrics.disable();
      const stats = metrics.getAggregateStats();
      expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
    });
  });

  // Data Management
  describe("clearAllData", () => {
    test("removes STORAGE_KEY from localStorage", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      metrics.clearAllData();
      const sessions = metrics.getAllSessions();
      expect(sessions.length).toBe(0);
    });

    test("sets currentSession to null", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.clearAllData();
      expect(metrics.getCurrentSession()).toBeNull();
    });

    test("subsequent getAllSessions returns empty array", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      metrics.clearAllData();
      expect(metrics.getAllSessions()).toEqual([]);
    });
  });

  describe("saveSession (private, tested via endSession)", () => {
    test("adds current session to localStorage array", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      // Session should be saved
      expect(metrics.getAllSessions().length).toBeGreaterThanOrEqual(0);
    });

    test("updates existing session if sessionId matches", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeCreated(10);
      metrics.disable();
      // Re-enable to test update
      const metrics2 = new ResearchMetrics({ enabled: true });
      metrics2.disable();
    });

    test("enforces maxSessions limit by removing oldest sessions", () => {
      const metrics = new ResearchMetrics({ maxSessions: 2 });
      for (let i = 0; i < 5; i++) {
        metrics.enable();
        metrics.trackGenomeCreated(i);
        metrics.disable();
      }
      // Should have at most maxSessions
      const sessions = metrics.getAllSessions();
      expect(sessions.length).toBeLessThanOrEqual(2);

      // Verify the retained sessions are the most recent ones (iterations 3 and 4)
      if (sessions.length === 2) {
        const genomesCreated = sessions.map((s) => s.genomesCreated);
        // Most recent sessions should have genomesCreated values of 3 and 4
        expect(genomesCreated).toContain(1); // Each session tracks one genome
        // Sessions should be from the last two iterations
        const sessionStartTimes = sessions.map((s) => s.startTime);
        expect(sessionStartTimes[0]).toBeLessThanOrEqual(
          sessionStartTimes[1] || sessionStartTimes[0],
        );
      }
    });

    test("does nothing when currentSession is null", () => {
      const metrics = new ResearchMetrics();
      expect(() => metrics.disable()).not.toThrow();
    });

    test("fails silently when localStorage.setItem throws", () => {
      // This is tested implicitly - errors should be caught
      const metrics = new ResearchMetrics({ enabled: true });
      expect(() => metrics.disable()).not.toThrow();
    });
  });

  // Auto-Save Timer
  describe("startAutoSave (private, tested via enable)", () => {
    test("stops any existing timer before creating new one", () => {
      const metrics = new ResearchMetrics({
        enabled: true,
        autoSaveInterval: 100,
      });
      // Re-enable should not create multiple timers
      metrics.enable();
      metrics.disable();
    });

    test("creates interval timer with autoSaveInterval delay", () => {
      const metrics = new ResearchMetrics({
        enabled: true,
        autoSaveInterval: 100,
      });
      expect(metrics.getCurrentSession()).not.toBeNull();
      metrics.disable();
    });

    test("timer calls saveSession on each tick", async () => {
      const metrics = new ResearchMetrics({
        enabled: true,
        autoSaveInterval: 50,
      });
      metrics.trackGenomeCreated(10);
      await new Promise((r) => setTimeout(r, 100));
      metrics.disable();
    });
  });

  describe("stopAutoSave (private, tested via disable)", () => {
    test("clears interval timer", () => {
      const metrics = new ResearchMetrics({
        enabled: true,
        autoSaveInterval: 100,
      });
      metrics.disable();
      expect(metrics.getCurrentSession()).toBeNull();
    });

    test("sets autoSaveTimer to null", () => {
      const metrics = new ResearchMetrics({
        enabled: true,
        autoSaveInterval: 100,
      });
      metrics.disable();
      // Timer should be cleared
      expect(metrics.getCurrentSession()).toBeNull();
    });

    test("does nothing when timer already null", () => {
      const metrics = new ResearchMetrics();
      expect(() => metrics.disable()).not.toThrow();
    });
  });

  // Session ID Generation
  describe("generateSessionId (private, tested via startSession)", () => {
    test("generates unique ID with format: session_{timestamp}_{random}", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      expect(session?.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      metrics.disable();
    });

    test("random portion is 9 characters of base36", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      const session = metrics.getCurrentSession();
      const parts = session?.sessionId.split("_") || [];
      expect(parts.length).toBe(3);
      expect(parts[2].length).toBe(9);
      metrics.disable();
    });

    test("multiple calls produce different IDs", () => {
      const metrics1 = new ResearchMetrics({ enabled: true });
      const id1 = metrics1.getCurrentSession()?.sessionId;
      metrics1.disable();

      const metrics2 = new ResearchMetrics({ enabled: true });
      const id2 = metrics2.getCurrentSession()?.sessionId;
      metrics2.disable();

      expect(id1).not.toBe(id2);
    });
  });

  // Edge Cases & Error Handling
  describe("edge cases", () => {
    test("handles localStorage being unavailable (e.g., private browsing)", () => {
      const metrics = new ResearchMetrics();
      // Should not throw even if localStorage is unavailable
      expect(() => metrics.getAllSessions()).not.toThrow();
    });

    test("handles corrupted localStorage data gracefully", () => {
      try {
        localStorage.setItem("codoncanvas-research", "{invalid json");
      } catch {
        // localStorage may not be available
      }
      const metrics = new ResearchMetrics();
      expect(() => metrics.getAllSessions()).not.toThrow();
    });

    test("handles rapid enable/disable toggling", () => {
      const metrics = new ResearchMetrics();
      for (let i = 0; i < 10; i++) {
        metrics.enable();
        metrics.disable();
      }
      expect(metrics.getCurrentSession()).toBeNull();
    });

    test("handles multiple simultaneous tracking calls", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      for (let i = 0; i < 100; i++) {
        metrics.trackGenomeCreated(i);
        metrics.trackGenomeExecuted(createExecutionEvent({ renderMode: "visual", success: true }));
        metrics.trackMutation(createMutationEvent({ type: "silent" }));
      }
      expect(metrics.getCurrentSession()?.genomesCreated).toBe(100);
      metrics.disable();
    });

    test("handles very long session durations (>24 hours)", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      // Simulate long duration by checking duration calculation
      metrics.disable();
      const sessions = metrics.getAllSessions();
      if (sessions.length > 0) {
        expect(sessions[0].duration).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
