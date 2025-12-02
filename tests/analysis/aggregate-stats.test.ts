/**
 * Aggregate Statistics Tests
 *
 * Tests for pure aggregate computation extracted from ResearchMetrics.
 */
import { describe, expect, test } from "bun:test";
import { computeAggregateStats } from "@/analysis/collectors/aggregate-stats";
import type { ResearchSession } from "@/analysis/types/metrics-session";

// Factory for creating test sessions
function createTestSession(
  overrides: Partial<ResearchSession> = {},
): ResearchSession {
  return {
    sessionId: "session_test-123",
    startTime: 1700000000000,
    endTime: 1700003600000,
    duration: 3600000, // 1 hour
    genomesCreated: 5,
    genomesExecuted: 10,
    mutationsApplied: 3,
    renderModeUsage: { visual: 7, audio: 2, both: 1 },
    features: {
      diffViewer: 2,
      timeline: 1,
      evolution: 0,
      assessment: 1,
      export: 0,
    },
    timeToFirstArtifact: 5000,
    errors: [],
    mutationTypes: {
      silent: 1,
      missense: 1,
      nonsense: 0,
      frameshift: 0,
      point: 1,
      insertion: 0,
      deletion: 0,
    },
    ...overrides,
  };
}

describe("computeAggregateStats", () => {
  describe("session counts", () => {
    test("returns correct totalSessions count", () => {
      const sessions = [createTestSession(), createTestSession()];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalSessions).toBe(2);
    });

    test("returns 0 totalSessions for empty array", () => {
      const stats = computeAggregateStats([]);

      expect(stats.totalSessions).toBe(0);
    });
  });

  describe("duration calculations", () => {
    test("sums totalDuration across sessions", () => {
      const sessions = [
        createTestSession({ duration: 1000 }),
        createTestSession({ duration: 2000 }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalDuration).toBe(3000);
    });

    test("handles null duration as 0", () => {
      const sessions = [
        createTestSession({ duration: 1000 }),
        createTestSession({ duration: null }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalDuration).toBe(1000);
    });

    test("calculates avgDuration correctly", () => {
      const sessions = [
        createTestSession({ duration: 1000 }),
        createTestSession({ duration: 3000 }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.avgDuration).toBe(2000);
    });

    test("returns 0 avgDuration for empty sessions", () => {
      const stats = computeAggregateStats([]);

      expect(stats.avgDuration).toBe(0);
    });
  });

  describe("genome tracking", () => {
    test("sums totalGenomesCreated", () => {
      const sessions = [
        createTestSession({ genomesCreated: 5 }),
        createTestSession({ genomesCreated: 3 }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalGenomesCreated).toBe(8);
    });

    test("sums totalGenomesExecuted", () => {
      const sessions = [
        createTestSession({ genomesExecuted: 10 }),
        createTestSession({ genomesExecuted: 7 }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalGenomesExecuted).toBe(17);
    });
  });

  describe("mutation tracking", () => {
    test("sums totalMutations", () => {
      const sessions = [
        createTestSession({ mutationsApplied: 5 }),
        createTestSession({ mutationsApplied: 8 }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalMutations).toBe(13);
    });

    test("aggregates mutationTypeDistribution across sessions", () => {
      const sessions = [
        createTestSession({
          mutationTypes: {
            silent: 2,
            missense: 1,
            nonsense: 0,
            frameshift: 1,
            point: 0,
            insertion: 1,
            deletion: 0,
          },
        }),
        createTestSession({
          mutationTypes: {
            silent: 3,
            missense: 2,
            nonsense: 1,
            frameshift: 0,
            point: 1,
            insertion: 0,
            deletion: 2,
          },
        }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.mutationTypeDistribution.silent).toBe(5);
      expect(stats.mutationTypeDistribution.missense).toBe(3);
      expect(stats.mutationTypeDistribution.nonsense).toBe(1);
      expect(stats.mutationTypeDistribution.frameshift).toBe(1);
      expect(stats.mutationTypeDistribution.point).toBe(1);
      expect(stats.mutationTypeDistribution.insertion).toBe(1);
      expect(stats.mutationTypeDistribution.deletion).toBe(2);
    });
  });

  describe("time to first artifact", () => {
    test("calculates average excluding null values", () => {
      const sessions = [
        createTestSession({ timeToFirstArtifact: 1000 }),
        createTestSession({ timeToFirstArtifact: null }),
        createTestSession({ timeToFirstArtifact: 3000 }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.avgTimeToFirstArtifact).toBe(2000);
    });

    test("returns 0 when all values are null", () => {
      const sessions = [
        createTestSession({ timeToFirstArtifact: null }),
        createTestSession({ timeToFirstArtifact: null }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.avgTimeToFirstArtifact).toBe(0);
    });

    test("returns 0 for empty sessions", () => {
      const stats = computeAggregateStats([]);

      expect(stats.avgTimeToFirstArtifact).toBe(0);
    });
  });

  describe("render mode preferences", () => {
    test("aggregates visual mode usage", () => {
      const sessions = [
        createTestSession({
          renderModeUsage: { visual: 5, audio: 0, both: 0 },
        }),
        createTestSession({
          renderModeUsage: { visual: 3, audio: 0, both: 0 },
        }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.renderModePreferences.visual).toBe(8);
    });

    test("aggregates audio mode usage", () => {
      const sessions = [
        createTestSession({
          renderModeUsage: { visual: 0, audio: 4, both: 0 },
        }),
        createTestSession({
          renderModeUsage: { visual: 0, audio: 6, both: 0 },
        }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.renderModePreferences.audio).toBe(10);
    });

    test("aggregates both mode usage", () => {
      const sessions = [
        createTestSession({
          renderModeUsage: { visual: 0, audio: 0, both: 2 },
        }),
        createTestSession({
          renderModeUsage: { visual: 0, audio: 0, both: 3 },
        }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.renderModePreferences.both).toBe(5);
    });
  });

  describe("feature usage", () => {
    test("aggregates diffViewer usage", () => {
      const sessions = [
        createTestSession({
          features: {
            diffViewer: 3,
            timeline: 0,
            evolution: 0,
            assessment: 0,
            export: 0,
          },
        }),
        createTestSession({
          features: {
            diffViewer: 2,
            timeline: 0,
            evolution: 0,
            assessment: 0,
            export: 0,
          },
        }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.featureUsage.diffViewer).toBe(5);
    });

    test("aggregates all feature types", () => {
      const sessions = [
        createTestSession({
          features: {
            diffViewer: 1,
            timeline: 2,
            evolution: 3,
            assessment: 4,
            export: 5,
          },
        }),
        createTestSession({
          features: {
            diffViewer: 1,
            timeline: 1,
            evolution: 1,
            assessment: 1,
            export: 1,
          },
        }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.featureUsage.diffViewer).toBe(2);
      expect(stats.featureUsage.timeline).toBe(3);
      expect(stats.featureUsage.evolution).toBe(4);
      expect(stats.featureUsage.assessment).toBe(5);
      expect(stats.featureUsage.export).toBe(6);
    });
  });

  describe("error tracking", () => {
    test("sums totalErrors from all sessions", () => {
      const sessions = [
        createTestSession({
          errors: [
            { timestamp: 1, type: "a", message: "1" },
            { timestamp: 2, type: "b", message: "2" },
          ],
        }),
        createTestSession({
          errors: [{ timestamp: 3, type: "c", message: "3" }],
        }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalErrors).toBe(3);
    });

    test("returns 0 errors for empty sessions", () => {
      const stats = computeAggregateStats([]);

      expect(stats.totalErrors).toBe(0);
    });

    test("handles sessions with no errors", () => {
      const sessions = [
        createTestSession({ errors: [] }),
        createTestSession({ errors: [] }),
      ];
      const stats = computeAggregateStats(sessions);

      expect(stats.totalErrors).toBe(0);
    });
  });

  describe("empty sessions handling", () => {
    test("returns zero-initialized stats for empty array", () => {
      const stats = computeAggregateStats([]);

      expect(stats.totalSessions).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.avgDuration).toBe(0);
      expect(stats.totalGenomesCreated).toBe(0);
      expect(stats.totalGenomesExecuted).toBe(0);
      expect(stats.totalMutations).toBe(0);
      expect(stats.avgTimeToFirstArtifact).toBe(0);
      expect(stats.totalErrors).toBe(0);
    });

    test("returns zero-initialized mutation distribution for empty array", () => {
      const stats = computeAggregateStats([]);

      expect(stats.mutationTypeDistribution.silent).toBe(0);
      expect(stats.mutationTypeDistribution.missense).toBe(0);
      expect(stats.mutationTypeDistribution.nonsense).toBe(0);
      expect(stats.mutationTypeDistribution.frameshift).toBe(0);
      expect(stats.mutationTypeDistribution.point).toBe(0);
      expect(stats.mutationTypeDistribution.insertion).toBe(0);
      expect(stats.mutationTypeDistribution.deletion).toBe(0);
    });

    test("returns zero-initialized render mode preferences for empty array", () => {
      const stats = computeAggregateStats([]);

      expect(stats.renderModePreferences.visual).toBe(0);
      expect(stats.renderModePreferences.audio).toBe(0);
      expect(stats.renderModePreferences.both).toBe(0);
    });

    test("returns zero-initialized feature usage for empty array", () => {
      const stats = computeAggregateStats([]);

      expect(stats.featureUsage.diffViewer).toBe(0);
      expect(stats.featureUsage.timeline).toBe(0);
      expect(stats.featureUsage.evolution).toBe(0);
      expect(stats.featureUsage.assessment).toBe(0);
      expect(stats.featureUsage.export).toBe(0);
    });
  });
});
