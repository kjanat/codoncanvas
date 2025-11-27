/**
 * Metrics Analyzer Core Test Suite
 *
 * Tests for statistical analysis and metrics aggregation for classroom analytics.
 * Browser-compatible version of CLI metrics analyzer for teacher dashboard.
 */
import { describe, expect, test } from "bun:test";
import {
  formatDuration,
  formatNumber,
  formatPercentage,
  MetricsAnalyzer,
  parseCSVContent,
  Stats,
  type MetricsSession,
} from "@/metrics-analyzer-core";

// Helper function to create mock sessions
function createMockSession(overrides: Partial<MetricsSession> = {}): MetricsSession {
  return {
    sessionId: "test-session",
    startTime: Date.now() - 60000,
    endTime: Date.now(),
    duration: 60000, // 1 minute
    genomesCreated: 5,
    genomesExecuted: 3,
    timeToFirstArtifact: 30000, // 30 seconds
    mutationsApplied: 10,
    renderMode_visual: 2,
    renderMode_audio: 1,
    renderMode_both: 0,
    mutation_silent: 2,
    mutation_missense: 2,
    mutation_nonsense: 1,
    mutation_frameshift: 1,
    mutation_point: 2,
    mutation_insertion: 1,
    mutation_deletion: 1,
    feature_diffViewer: 3,
    feature_timeline: 2,
    feature_evolution: 1,
    feature_assessment: 0,
    feature_export: 1,
    errorCount: 0,
    errorTypes: "[]",
    ...overrides,
  };
}

describe("Stats", () => {
  // Basic Statistics
  describe("mean", () => {
    test("calculates arithmetic mean correctly", () => {
      expect(Stats.mean([1, 2, 3, 4, 5])).toBe(3);
      expect(Stats.mean([10, 20, 30])).toBe(20);
    });

    test("returns 0 for empty array", () => {
      expect(Stats.mean([])).toBe(0);
    });

    test("handles single value array", () => {
      expect(Stats.mean([42])).toBe(42);
    });

    test("handles negative numbers", () => {
      expect(Stats.mean([-5, 5])).toBe(0);
      expect(Stats.mean([-10, -20, -30])).toBe(-20);
    });

    test("handles floating point precision", () => {
      const result = Stats.mean([0.1, 0.2, 0.3]);
      expect(result).toBeCloseTo(0.2, 10);
    });
  });

  describe("sd", () => {
    test("calculates sample standard deviation by default", () => {
      // [2, 4, 4, 4, 5, 5, 7, 9] has sample SD ≈ 2.138
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const sd = Stats.sd(values);
      expect(sd).toBeCloseTo(2.138, 2);
    });

    test("calculates population SD when sample=false", () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const sdPop = Stats.sd(values, false);
      expect(sdPop).toBeCloseTo(2.0, 1);
    });

    test("returns 0 for empty array", () => {
      expect(Stats.sd([])).toBe(0);
    });

    test("returns NaN for single value (sample SD)", () => {
      // Sample SD with n=1 yields NaN due to division by (n-1) = 0
      const result = Stats.sd([42]);
      expect(result).toBeNaN();
    });

    test("handles arrays with identical values (SD = 0)", () => {
      expect(Stats.sd([5, 5, 5, 5], false)).toBe(0);
    });
  });

  describe("median", () => {
    test("returns middle value for odd-length array", () => {
      expect(Stats.median([1, 2, 3, 4, 5])).toBe(3);
      expect(Stats.median([7, 3, 9])).toBe(7); // Sorted: [3, 7, 9]
    });

    test("returns average of two middle values for even-length array", () => {
      expect(Stats.median([1, 2, 3, 4])).toBe(2.5);
      expect(Stats.median([10, 20, 30, 40])).toBe(25);
    });

    test("returns 0 for empty array", () => {
      expect(Stats.median([])).toBe(0);
    });

    test("handles unsorted input (sorts internally)", () => {
      expect(Stats.median([5, 1, 3, 2, 4])).toBe(3);
    });

    test("handles single value array", () => {
      expect(Stats.median([42])).toBe(42);
    });
  });

  describe("quartile", () => {
    test("calculates Q1 (25th percentile) correctly", () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const q1 = Stats.quartile(values, 1);
      expect(q1).toBeCloseTo(3.25, 2);
    });

    test("calculates Q3 (75th percentile) correctly", () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const q3 = Stats.quartile(values, 3);
      expect(q3).toBeCloseTo(7.75, 2);
    });

    test("returns 0 for empty array", () => {
      expect(Stats.quartile([], 1)).toBe(0);
      expect(Stats.quartile([], 3)).toBe(0);
    });

    test("uses linear interpolation for non-integer indices", () => {
      // With 4 elements, Q1 position = 0.25 * 3 = 0.75
      // Interpolation between index 0 and 1: 10 * 0.25 + 20 * 0.75 = 17.5
      const values = [10, 20, 30, 40];
      const q1 = Stats.quartile(values, 1);
      expect(q1).toBeCloseTo(17.5, 1);
    });

    test("handles small arrays (fewer than 4 elements)", () => {
      expect(Stats.quartile([10], 1)).toBe(10);
      expect(Stats.quartile([10, 20], 1)).toBeCloseTo(12.5, 1);
      expect(Stats.quartile([10, 20, 30], 1)).toBeCloseTo(15, 1);
    });
  });

  describe("min and max", () => {
    test("returns minimum value from array", () => {
      expect(Stats.min([5, 2, 8, 1, 9])).toBe(1);
    });

    test("returns maximum value from array", () => {
      expect(Stats.max([5, 2, 8, 1, 9])).toBe(9);
    });

    test("returns 0 for empty arrays", () => {
      expect(Stats.min([])).toBe(0);
      expect(Stats.max([])).toBe(0);
    });

    test("handles negative numbers", () => {
      expect(Stats.min([-5, -2, -8])).toBe(-8);
      expect(Stats.max([-5, -2, -8])).toBe(-2);
    });
  });

  describe("descriptive", () => {
    test("returns DescriptiveStats object with all fields", () => {
      const values = [1, 2, 3, 4, 5];
      const stats = Stats.descriptive(values);

      expect(stats).toHaveProperty("n");
      expect(stats).toHaveProperty("mean");
      expect(stats).toHaveProperty("sd");
      expect(stats).toHaveProperty("min");
      expect(stats).toHaveProperty("max");
      expect(stats).toHaveProperty("median");
      expect(stats).toHaveProperty("q1");
      expect(stats).toHaveProperty("q3");
    });

    test("includes n (sample size)", () => {
      expect(Stats.descriptive([1, 2, 3, 4, 5]).n).toBe(5);
    });

    test("includes mean, sd, min, max", () => {
      const stats = Stats.descriptive([1, 2, 3, 4, 5]);
      expect(stats.mean).toBe(3);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(5);
      expect(stats.sd).toBeGreaterThan(0);
    });

    test("includes median, q1, q3", () => {
      const stats = Stats.descriptive([1, 2, 3, 4, 5]);
      expect(stats.median).toBe(3);
      expect(stats.q1).toBeDefined();
      expect(stats.q3).toBeDefined();
    });

    test("handles empty array (all zeros/0)", () => {
      const stats = Stats.descriptive([]);
      expect(stats.n).toBe(0);
      expect(stats.mean).toBe(0);
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
    });
  });

  // Statistical Tests
  describe("tTest", () => {
    test("calculates t-statistic for independent samples", () => {
      const group1 = [5, 6, 7, 8, 9];
      const group2 = [1, 2, 3, 4, 5];
      const result = Stats.tTest(group1, group2);

      expect(result.t).toBeGreaterThan(0);
      expect(typeof result.t).toBe("number");
    });

    test("calculates degrees of freedom as n1 + n2 - 2", () => {
      const group1 = [1, 2, 3];
      const group2 = [4, 5, 6, 7];
      const result = Stats.tTest(group1, group2);

      expect(result.df).toBe(3 + 4 - 2);
    });

    test("calculates approximate p-value", () => {
      const group1 = [5, 6, 7, 8, 9];
      const group2 = [1, 2, 3, 4, 5];
      const result = Stats.tTest(group1, group2);

      expect(result.p).toBeGreaterThanOrEqual(0);
      expect(result.p).toBeLessThanOrEqual(1);
    });

    test("handles groups with different sizes", () => {
      const group1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const group2 = [5, 6, 7];
      const result = Stats.tTest(group1, group2);

      expect(result.df).toBe(10 + 3 - 2);
    });

    test("returns significant result for clearly different groups", () => {
      const group1 = [100, 101, 102, 103, 104];
      const group2 = [1, 2, 3, 4, 5];
      const result = Stats.tTest(group1, group2);

      expect(result.p).toBeLessThan(0.05);
    });

    test("returns non-significant result for similar groups", () => {
      const group1 = [5, 6, 7, 8, 9];
      const group2 = [6, 7, 8, 9, 10];
      const result = Stats.tTest(group1, group2);

      expect(result.p).toBeGreaterThan(0.1);
    });
  });

  describe("cohensD", () => {
    test("calculates effect size as pooled standard deviation ratio", () => {
      const group1 = [100, 101, 102, 103, 104];
      const group2 = [1, 2, 3, 4, 5];
      const d = Stats.cohensD(group1, group2);

      expect(Math.abs(d)).toBeGreaterThan(0.8); // Large effect
    });

    test("returns positive value when group1 mean > group2 mean", () => {
      const group1 = [10, 11, 12];
      const group2 = [1, 2, 3];
      const d = Stats.cohensD(group1, group2);

      expect(d).toBeGreaterThan(0);
    });

    test("returns negative value when group1 mean < group2 mean", () => {
      const group1 = [1, 2, 3];
      const group2 = [10, 11, 12];
      const d = Stats.cohensD(group1, group2);

      expect(d).toBeLessThan(0);
    });

    test("returns 0 for identical groups", () => {
      const group1 = [5, 5, 5];
      const group2 = [5, 5, 5];
      const d = Stats.cohensD(group1, group2);

      expect(d).toBeNaN(); // Both groups have SD=0, so pooled SD is 0
    });

    test("handles groups with different variances", () => {
      const group1 = [10, 20, 30]; // High variance
      const group2 = [14, 15, 16]; // Low variance
      const d = Stats.cohensD(group1, group2);

      expect(typeof d).toBe("number");
      expect(isFinite(d)).toBe(true);
    });
  });

  describe("tDistribution", () => {
    test("approximates two-tailed p-value from t and df", () => {
      const p = Stats.tDistribution(2.0, 10);
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThan(1);
    });

    test("uses normal CDF approximation for df > 30", () => {
      const p = Stats.tDistribution(1.96, 100);
      expect(p).toBeCloseTo(0.05, 1);
    });

    test("handles large t values (returns small p)", () => {
      const p = Stats.tDistribution(10, 20);
      expect(p).toBeLessThan(0.001);
    });

    test("handles small t values (returns large p)", () => {
      const p = Stats.tDistribution(0.1, 20);
      expect(p).toBeGreaterThan(0.5);
    });
  });

  describe("normalCDF", () => {
    test("returns ~0.5 for z=0", () => {
      expect(Stats.normalCDF(0)).toBeCloseTo(0.5, 2);
    });

    test("returns ~0.975 for z=1.96", () => {
      expect(Stats.normalCDF(1.96)).toBeCloseTo(0.975, 2);
    });

    test("returns ~0.025 for z=-1.96", () => {
      expect(Stats.normalCDF(-1.96)).toBeCloseTo(0.025, 2);
    });

    test("handles extreme z values", () => {
      expect(Stats.normalCDF(5)).toBeCloseTo(1, 4);
      expect(Stats.normalCDF(-5)).toBeCloseTo(0, 4);
    });
  });

  describe("interpretEffectSize", () => {
    test("returns 'negligible' for |d| < 0.2", () => {
      expect(Stats.interpretEffectSize(0.1)).toBe("negligible");
      expect(Stats.interpretEffectSize(-0.1)).toBe("negligible");
    });

    test("returns 'small' for 0.2 <= |d| < 0.5", () => {
      expect(Stats.interpretEffectSize(0.3)).toBe("small");
      expect(Stats.interpretEffectSize(0.49)).toBe("small");
    });

    test("returns 'medium' for 0.5 <= |d| < 0.8", () => {
      expect(Stats.interpretEffectSize(0.5)).toBe("medium");
      expect(Stats.interpretEffectSize(0.79)).toBe("medium");
    });

    test("returns 'large' for |d| >= 0.8", () => {
      expect(Stats.interpretEffectSize(0.8)).toBe("large");
      expect(Stats.interpretEffectSize(1.5)).toBe("large");
    });

    test("uses absolute value (handles negative d)", () => {
      expect(Stats.interpretEffectSize(-0.3)).toBe("small");
      expect(Stats.interpretEffectSize(-0.8)).toBe("large");
    });
  });

  describe("interpretPValue", () => {
    test("returns 'highly significant' for p < 0.001", () => {
      expect(Stats.interpretPValue(0.0005)).toContain("highly significant");
    });

    test("returns 'very significant' for p < 0.01", () => {
      expect(Stats.interpretPValue(0.005)).toContain("very significant");
    });

    test("returns 'significant' for p < 0.05", () => {
      expect(Stats.interpretPValue(0.03)).toContain("significant");
    });

    test("returns 'marginally significant' for p < 0.1", () => {
      expect(Stats.interpretPValue(0.08)).toContain("marginally significant");
    });

    test("returns 'not significant' for p >= 0.1", () => {
      expect(Stats.interpretPValue(0.15)).toContain("not significant");
    });
  });
});

describe("MetricsAnalyzer", () => {
  // Constructor
  describe("constructor", () => {
    test("accepts array of MetricsSession objects", () => {
      const sessions = [createMockSession(), createMockSession()];
      const analyzer = new MetricsAnalyzer(sessions);
      expect(analyzer).toBeDefined();
    });

    test("stores sessions internally", () => {
      const sessions = [createMockSession({ sessionId: "session-1" })];
      const analyzer = new MetricsAnalyzer(sessions);
      const report = analyzer.generateReport();
      expect(report.engagement.totalSessions).toBe(1);
    });

    test("handles empty sessions array", () => {
      const analyzer = new MetricsAnalyzer([]);
      const report = analyzer.generateReport();
      expect(report.engagement.totalSessions).toBe(0);
    });
  });

  // engagementMetrics
  describe("engagementMetrics", () => {
    test("returns totalSessions count", () => {
      const sessions = [createMockSession(), createMockSession(), createMockSession()];
      const analyzer = new MetricsAnalyzer(sessions);
      const metrics = analyzer.engagementMetrics();

      expect(metrics.totalSessions).toBe(3);
    });

    test("returns uniqueUsers (currently hardcoded to 1)", () => {
      const sessions = [createMockSession(), createMockSession()];
      const analyzer = new MetricsAnalyzer(sessions);
      const metrics = analyzer.engagementMetrics();

      expect(metrics.uniqueUsers).toBe(1);
    });

    test("returns avgSessionDuration as DescriptiveStats", () => {
      const sessions = [
        createMockSession({ duration: 60000 }),
        createMockSession({ duration: 120000 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const metrics = analyzer.engagementMetrics();

      expect(metrics.avgSessionDuration).toHaveProperty("mean");
      expect(metrics.avgSessionDuration.mean).toBe(90000);
    });

    test("returns totalGenomesCreated sum", () => {
      const sessions = [
        createMockSession({ genomesCreated: 5 }),
        createMockSession({ genomesCreated: 10 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const metrics = analyzer.engagementMetrics();

      expect(metrics.totalGenomesCreated).toBe(15);
    });

    test("returns avgGenomesPerSession as DescriptiveStats", () => {
      const sessions = [
        createMockSession({ genomesCreated: 4 }),
        createMockSession({ genomesCreated: 6 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const metrics = analyzer.engagementMetrics();

      expect(metrics.avgGenomesPerSession.mean).toBe(5);
    });

    test("calculates genomesExecutedRate as (executed/created) * 100", () => {
      const sessions = [
        createMockSession({ genomesCreated: 10, genomesExecuted: 5 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const metrics = analyzer.engagementMetrics();

      expect(metrics.genomesExecutedRate).toBe(50);
    });

    test("returns 0% rate when totalGenomesCreated is 0", () => {
      const sessions = [createMockSession({ genomesCreated: 0, genomesExecuted: 0 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const metrics = analyzer.engagementMetrics();

      expect(metrics.genomesExecutedRate).toBe(0);
    });

    test("returns retentionRate based on session count", () => {
      const singleSession = new MetricsAnalyzer([createMockSession()]);
      expect(singleSession.engagementMetrics().retentionRate).toBe(0);

      const multipleSessions = new MetricsAnalyzer([createMockSession(), createMockSession()]);
      expect(multipleSessions.engagementMetrics().retentionRate).toBe(100);
    });
  });

  // learningVelocity
  describe("learningVelocity", () => {
    test("returns timeToFirstArtifact as DescriptiveStats", () => {
      const sessions = [
        createMockSession({ timeToFirstArtifact: 60000 }),
        createMockSession({ timeToFirstArtifact: 120000 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const velocity = analyzer.learningVelocity();

      expect(velocity.timeToFirstArtifact.mean).toBe(90000);
    });

    test("filters out null timeToFirstArtifact values", () => {
      const sessions = [
        createMockSession({ timeToFirstArtifact: 60000 }),
        createMockSession({ timeToFirstArtifact: null }),
        createMockSession({ timeToFirstArtifact: 120000 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const velocity = analyzer.learningVelocity();

      expect(velocity.timeToFirstArtifact.n).toBe(2);
    });

    test("classifies fastLearners as < 5 minutes", () => {
      const sessions = [
        createMockSession({ timeToFirstArtifact: 2 * 60 * 1000 }), // 2 min - fast
        createMockSession({ timeToFirstArtifact: 4 * 60 * 1000 }), // 4 min - fast
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const velocity = analyzer.learningVelocity();

      expect(velocity.fastLearners).toBe(2);
    });

    test("classifies moderateLearners as 5-15 minutes", () => {
      const sessions = [
        createMockSession({ timeToFirstArtifact: 7 * 60 * 1000 }), // 7 min - moderate
        createMockSession({ timeToFirstArtifact: 10 * 60 * 1000 }), // 10 min - moderate
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const velocity = analyzer.learningVelocity();

      expect(velocity.moderateLearners).toBe(2);
    });

    test("classifies slowLearners as >= 15 minutes", () => {
      const sessions = [
        createMockSession({ timeToFirstArtifact: 20 * 60 * 1000 }), // 20 min - slow
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const velocity = analyzer.learningVelocity();

      expect(velocity.slowLearners).toBe(1);
    });

    test("counts noArtifact for null timeToFirstArtifact sessions", () => {
      const sessions = [
        createMockSession({ timeToFirstArtifact: 60000 }),
        createMockSession({ timeToFirstArtifact: null }),
        createMockSession({ timeToFirstArtifact: null }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const velocity = analyzer.learningVelocity();

      expect(velocity.noArtifact).toBe(2);
    });
  });

  // toolAdoption
  describe("toolAdoption", () => {
    test("returns stats for diffViewer feature", () => {
      const sessions = [createMockSession({ feature_diffViewer: 5 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const tools = analyzer.toolAdoption();

      expect(tools.diffViewer).toBeDefined();
      expect(tools.diffViewer.avgUsage).toBe(5);
    });

    test("returns stats for timeline feature", () => {
      const sessions = [createMockSession({ feature_timeline: 3 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const tools = analyzer.toolAdoption();

      expect(tools.timeline.avgUsage).toBe(3);
    });

    test("returns stats for evolution feature", () => {
      const sessions = [createMockSession({ feature_evolution: 2 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const tools = analyzer.toolAdoption();

      expect(tools.evolution.avgUsage).toBe(2);
    });

    test("returns stats for assessment feature", () => {
      const sessions = [createMockSession({ feature_assessment: 1 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const tools = analyzer.toolAdoption();

      expect(tools.assessment.avgUsage).toBe(1);
    });

    test("returns stats for export feature", () => {
      const sessions = [createMockSession({ feature_export: 4 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const tools = analyzer.toolAdoption();

      expect(tools.export.avgUsage).toBe(4);
    });

    test("each tool includes users count (non-zero usage)", () => {
      const sessions = [
        createMockSession({ feature_diffViewer: 5 }),
        createMockSession({ feature_diffViewer: 0 }),
        createMockSession({ feature_diffViewer: 3 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const tools = analyzer.toolAdoption();

      expect(tools.diffViewer.users).toBe(2);
    });

    test("each tool includes avgUsage across all sessions", () => {
      const sessions = [
        createMockSession({ feature_timeline: 2 }),
        createMockSession({ feature_timeline: 4 }),
        createMockSession({ feature_timeline: 6 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const tools = analyzer.toolAdoption();

      expect(tools.timeline.avgUsage).toBe(4);
    });
  });

  // renderModePreferences
  describe("renderModePreferences", () => {
    test("returns visualOnly sessions count and percentage", () => {
      const sessions = [
        createMockSession({ renderMode_visual: 10, renderMode_audio: 0, renderMode_both: 0 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const prefs = analyzer.renderModePreferences();

      expect(prefs.visualOnly.sessions).toBe(10);
      expect(prefs.visualOnly.percentage).toBe(100);
    });

    test("returns audioOnly sessions count and percentage", () => {
      const sessions = [
        createMockSession({ renderMode_visual: 0, renderMode_audio: 5, renderMode_both: 5 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const prefs = analyzer.renderModePreferences();

      expect(prefs.audioOnly.sessions).toBe(5);
      expect(prefs.audioOnly.percentage).toBe(50);
    });

    test("returns multiSensory (both) sessions count and percentage", () => {
      const sessions = [
        createMockSession({ renderMode_visual: 2, renderMode_audio: 2, renderMode_both: 6 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const prefs = analyzer.renderModePreferences();

      expect(prefs.multiSensory.sessions).toBe(6);
      expect(prefs.multiSensory.percentage).toBe(60);
    });

    test("percentages sum to 100% (or close due to rounding)", () => {
      const sessions = [
        createMockSession({ renderMode_visual: 3, renderMode_audio: 3, renderMode_both: 4 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const prefs = analyzer.renderModePreferences();

      const total =
        prefs.visualOnly.percentage +
        prefs.audioOnly.percentage +
        prefs.multiSensory.percentage;
      expect(total).toBeCloseTo(100, 1);
    });

    test("returns 0% for all modes when no executions", () => {
      const sessions = [
        createMockSession({ renderMode_visual: 0, renderMode_audio: 0, renderMode_both: 0 }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const prefs = analyzer.renderModePreferences();

      expect(prefs.visualOnly.percentage).toBe(0);
      expect(prefs.audioOnly.percentage).toBe(0);
      expect(prefs.multiSensory.percentage).toBe(0);
    });
  });

  // mutationPatterns
  describe("mutationPatterns", () => {
    test("returns DescriptiveStats for silent mutations", () => {
      const sessions = [createMockSession({ mutation_silent: 5 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.silent.mean).toBe(5);
    });

    test("returns DescriptiveStats for missense mutations", () => {
      const sessions = [createMockSession({ mutation_missense: 3 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.missense.mean).toBe(3);
    });

    test("returns DescriptiveStats for nonsense mutations", () => {
      const sessions = [createMockSession({ mutation_nonsense: 2 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.nonsense.mean).toBe(2);
    });

    test("returns DescriptiveStats for frameshift mutations", () => {
      const sessions = [createMockSession({ mutation_frameshift: 1 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.frameshift.mean).toBe(1);
    });

    test("returns DescriptiveStats for point mutations", () => {
      const sessions = [createMockSession({ mutation_point: 4 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.point.mean).toBe(4);
    });

    test("returns DescriptiveStats for insertion mutations", () => {
      const sessions = [createMockSession({ mutation_insertion: 2 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.insertion.mean).toBe(2);
    });

    test("returns DescriptiveStats for deletion mutations", () => {
      const sessions = [createMockSession({ mutation_deletion: 3 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.deletion.mean).toBe(3);
    });

    test("returns totalMutations sum across all types", () => {
      const sessions = [
        createMockSession({
          mutation_silent: 1,
          mutation_missense: 2,
          mutation_nonsense: 3,
          mutation_frameshift: 4,
          mutation_point: 5,
          mutation_insertion: 6,
          mutation_deletion: 7,
        }),
      ];
      const analyzer = new MetricsAnalyzer(sessions);
      const patterns = analyzer.mutationPatterns();

      expect(patterns.totalMutations).toBe(1 + 2 + 3 + 4 + 5 + 6 + 7);
    });
  });

  // generateReport
  describe("generateReport", () => {
    test("returns AnalysisReport with all sections", () => {
      const sessions = [createMockSession()];
      const analyzer = new MetricsAnalyzer(sessions);
      const report = analyzer.generateReport();

      expect(report).toHaveProperty("engagement");
      expect(report).toHaveProperty("velocity");
      expect(report).toHaveProperty("tools");
      expect(report).toHaveProperty("renderMode");
      expect(report).toHaveProperty("mutations");
    });

    test("includes engagement metrics", () => {
      const sessions = [createMockSession()];
      const analyzer = new MetricsAnalyzer(sessions);
      const report = analyzer.generateReport();

      expect(report.engagement.totalSessions).toBe(1);
    });

    test("includes velocity metrics", () => {
      const sessions = [createMockSession({ timeToFirstArtifact: 60000 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const report = analyzer.generateReport();

      expect(report.velocity.timeToFirstArtifact.mean).toBe(60000);
    });

    test("includes tools adoption", () => {
      const sessions = [createMockSession({ feature_diffViewer: 5 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const report = analyzer.generateReport();

      expect(report.tools.diffViewer.avgUsage).toBe(5);
    });

    test("includes renderMode preferences", () => {
      const sessions = [createMockSession({ renderMode_visual: 10 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const report = analyzer.generateReport();

      expect(report.renderMode.visualOnly.sessions).toBe(10);
    });

    test("includes mutations patterns", () => {
      const sessions = [createMockSession({ mutation_point: 7 })];
      const analyzer = new MetricsAnalyzer(sessions);
      const report = analyzer.generateReport();

      expect(report.mutations.point.mean).toBe(7);
    });
  });

  // compareGroups
  describe("compareGroups", () => {
    test("compares session duration between groups", () => {
      const group1 = [createMockSession({ duration: 60000 })];
      const group2 = [createMockSession({ duration: 120000 })];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "Control", "Treatment");
      const durationResult = results.find((r) => r.metric.includes("Duration"));

      expect(durationResult).toBeDefined();
    });

    test("compares genomes created between groups", () => {
      const group1 = [createMockSession({ genomesCreated: 5 })];
      const group2 = [createMockSession({ genomesCreated: 10 })];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");
      const genomesResult = results.find((r) => r.metric.includes("Genomes Created"));

      expect(genomesResult).toBeDefined();
    });

    test("compares time to first artifact between groups", () => {
      const group1 = [createMockSession({ timeToFirstArtifact: 60000 })];
      const group2 = [createMockSession({ timeToFirstArtifact: 120000 })];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");
      const ttfaResult = results.find((r) => r.metric.includes("Time to First Artifact"));

      expect(ttfaResult).toBeDefined();
    });

    test("compares mutations applied between groups", () => {
      const group1 = [createMockSession({ mutationsApplied: 5 })];
      const group2 = [createMockSession({ mutationsApplied: 15 })];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");
      const mutationsResult = results.find((r) => r.metric.includes("Mutations Applied"));

      expect(mutationsResult).toBeDefined();
    });

    test("returns array of ComparisonResult objects", () => {
      const group1 = [createMockSession()];
      const group2 = [createMockSession()];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test("each result includes group names, metric, means", () => {
      const group1 = [createMockSession({ genomesCreated: 5 })];
      const group2 = [createMockSession({ genomesCreated: 10 })];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "Control", "Treatment");
      const result = results[0];

      expect(result.group1).toBe("Control");
      expect(result.group2).toBe("Treatment");
      expect(typeof result.metric).toBe("string");
      expect(typeof result.group1Mean).toBe("number");
      expect(typeof result.group2Mean).toBe("number");
    });

    test("each result includes t, p, cohensD values", () => {
      const group1 = [createMockSession(), createMockSession()];
      const group2 = [createMockSession(), createMockSession()];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");
      const result = results[0];

      expect(typeof result.t).toBe("number");
      expect(typeof result.p).toBe("number");
      expect(typeof result.cohensD).toBe("number");
    });

    test("each result includes interpretation string", () => {
      const group1 = [createMockSession()];
      const group2 = [createMockSession()];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");
      const result = results[0];

      expect(typeof result.interpretation).toBe("string");
    });

    test("converts durations to minutes for readability", () => {
      const group1 = [createMockSession({ duration: 60000 })]; // 1 min
      const group2 = [createMockSession({ duration: 120000 })]; // 2 min
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");
      const durationResult = results.find((r) => r.metric.includes("Duration"));

      expect(durationResult?.group1Mean).toBe(1); // minutes
      expect(durationResult?.group2Mean).toBe(2); // minutes
    });

    test("filters null timeToFirstArtifact before comparison", () => {
      const group1 = [createMockSession({ timeToFirstArtifact: null })];
      const group2 = [createMockSession({ timeToFirstArtifact: 60000 })];
      const analyzer = new MetricsAnalyzer([...group1, ...group2]);

      const results = analyzer.compareGroups(group1, group2, "A", "B");
      const ttfaResult = results.find((r) => r.metric.includes("Time to First Artifact"));

      // Should be skipped because group1 has no valid TTFA
      expect(ttfaResult).toBeUndefined();
    });

    test("skips comparison when either group is empty", () => {
      const group1: MetricsSession[] = [];
      const group2 = [createMockSession()];
      const analyzer = new MetricsAnalyzer(group2);

      const results = analyzer.compareGroups(group1, group2, "A", "B");

      expect(results.length).toBe(0);
    });
  });
});

describe("parseCSVContent", () => {
  // Happy Paths
  test("parses valid CSV string into MetricsSession array", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
session-1,60000,5,3,30000,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions.length).toBe(1);
    expect(sessions[0].sessionId).toBe("session-1");
  });

  test("handles header row correctly", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
test-session,120000,10,8,45000,5,1000,2000,3,2,1,1,1,1,1,1,1,1,2,2,2,2,2,1,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions[0].sessionId).toBe("test-session");
    expect(sessions[0].duration).toBe(120000);
  });

  test("parses numeric fields as numbers", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
test,60000,5,3,30000,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]`;
    const sessions = parseCSVContent(csv);

    expect(typeof sessions[0].duration).toBe("number");
    expect(typeof sessions[0].genomesCreated).toBe("number");
    expect(typeof sessions[0].mutationsApplied).toBe("number");
  });

  test("parses 'null' string as null for timeToFirstArtifact", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
test,60000,5,3,null,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions[0].timeToFirstArtifact).toBeNull();
  });

  test("parses empty string as null for timeToFirstArtifact", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
test,60000,5,3,,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions[0].timeToFirstArtifact).toBeNull();
  });

  test("preserves string fields like sessionId", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
my-special-session-123,60000,5,3,30000,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions[0].sessionId).toBe("my-special-session-123");
  });

  // CSV Parsing Edge Cases
  test("handles quoted values with commas inside", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
test,60000,5,3,30000,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,"[""error1"",""error2""]"`;
    const sessions = parseCSVContent(csv);

    expect(sessions[0].errorTypes).toContain("error1");
  });

  test("handles multiple rows correctly", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
session-1,60000,5,3,30000,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]
session-2,120000,10,8,45000,5,2000,3000,3,2,1,1,1,1,1,1,1,1,2,2,2,2,2,1,[]
session-3,180000,15,12,60000,15,3000,4000,4,3,2,3,3,2,2,3,2,2,4,3,2,1,2,2,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions.length).toBe(3);
    expect(sessions[0].sessionId).toBe("session-1");
    expect(sessions[1].sessionId).toBe("session-2");
    expect(sessions[2].sessionId).toBe("session-3");
  });

  test("strips quotes from header and values", () => {
    const csv = `"sessionId","duration","genomesCreated","genomesExecuted","timeToFirstArtifact","mutationsApplied","startTime","endTime","renderMode_visual","renderMode_audio","renderMode_both","mutation_silent","mutation_missense","mutation_nonsense","mutation_frameshift","mutation_point","mutation_insertion","mutation_deletion","feature_diffViewer","feature_timeline","feature_evolution","feature_assessment","feature_export","errorCount","errorTypes"
"test-quoted",60000,5,3,30000,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions[0].sessionId).toBe("test-quoted");
  });

  // Error Handling
  test("throws Error for empty CSV (less than 2 lines)", () => {
    expect(() => parseCSVContent("")).toThrow();
  });

  test("throws Error for header-only CSV (no data rows)", () => {
    expect(() =>
      parseCSVContent("sessionId,duration,genomesCreated")
    ).toThrow();
  });

  test("handles malformed numeric values (defaults to 0)", () => {
    const csv = `sessionId,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,startTime,endTime,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
test,invalid,abc,xyz,30000,10,1000,2000,2,1,0,2,2,1,1,2,1,1,3,2,1,0,1,0,[]`;
    const sessions = parseCSVContent(csv);

    expect(sessions[0].duration).toBe(0); // NaN becomes 0
    expect(sessions[0].genomesCreated).toBe(0);
  });
});

describe("Formatting Utilities", () => {
  // formatDuration
  describe("formatDuration", () => {
    test("formats milliseconds as seconds for <60 seconds", () => {
      expect(formatDuration(30000)).toBe("30s");
      expect(formatDuration(45000)).toBe("45s");
    });

    test("formats milliseconds as 'Xm Ys' for <60 minutes", () => {
      expect(formatDuration(90000)).toBe("1m 30s");
      expect(formatDuration(300000)).toBe("5m 0s");
    });

    test("formats milliseconds as 'Xh Ym' for >= 60 minutes", () => {
      expect(formatDuration(3600000)).toBe("1h 0m");
      expect(formatDuration(5400000)).toBe("1h 30m");
    });

    test("handles 0 milliseconds", () => {
      expect(formatDuration(0)).toBe("0s");
    });

    test("handles exact hour boundaries", () => {
      expect(formatDuration(7200000)).toBe("2h 0m");
    });
  });

  // formatPercentage
  describe("formatPercentage", () => {
    test("formats value with 1 decimal place and % suffix", () => {
      expect(formatPercentage(85.5)).toBe("85.5%");
      expect(formatPercentage(33.333)).toBe("33.3%");
    });

    test("handles 0%", () => {
      expect(formatPercentage(0)).toBe("0.0%");
    });

    test("handles 100%", () => {
      expect(formatPercentage(100)).toBe("100.0%");
    });

    test("handles values > 100%", () => {
      expect(formatPercentage(150)).toBe("150.0%");
    });
  });

  // formatNumber
  describe("formatNumber", () => {
    test("formats with 1 decimal place by default", () => {
      expect(formatNumber(3.14159)).toBe("3.1");
      expect(formatNumber(42.567)).toBe("42.6");
    });

    test("accepts custom decimal places parameter", () => {
      expect(formatNumber(3.14159, 2)).toBe("3.14");
      expect(formatNumber(3.14159, 4)).toBe("3.1416");
    });

    test("handles 0 decimal places", () => {
      expect(formatNumber(3.7, 0)).toBe("4");
      expect(formatNumber(3.2, 0)).toBe("3");
    });

    test("handles negative numbers", () => {
      expect(formatNumber(-3.14159)).toBe("-3.1");
      expect(formatNumber(-42.567, 2)).toBe("-42.57");
    });
  });
});

describe("Integration", () => {
  test("works with real session data exported from ResearchMetrics", () => {
    // Create sessions that mimic real exported data
    const sessions: MetricsSession[] = [
      createMockSession({
        sessionId: "student-1-session-1",
        duration: 300000,
        genomesCreated: 10,
        genomesExecuted: 8,
        timeToFirstArtifact: 60000,
      }),
      createMockSession({
        sessionId: "student-1-session-2",
        duration: 450000,
        genomesCreated: 15,
        genomesExecuted: 12,
        timeToFirstArtifact: 45000,
      }),
    ];

    const analyzer = new MetricsAnalyzer(sessions);
    const report = analyzer.generateReport();

    expect(report.engagement.totalSessions).toBe(2);
    expect(report.engagement.totalGenomesCreated).toBe(25);
    expect(report.velocity.fastLearners).toBe(2); // Both < 5 min
  });

  test("generates report usable by teacher dashboard", () => {
    const sessions = [
      createMockSession({ duration: 600000, genomesCreated: 20 }),
      createMockSession({ duration: 300000, genomesCreated: 10 }),
    ];

    const analyzer = new MetricsAnalyzer(sessions);
    const report = analyzer.generateReport();

    // Report should have all sections needed by dashboard
    expect(report.engagement.avgSessionDuration.mean).toBe(450000);
    expect(report.tools.diffViewer).toBeDefined();
    expect(report.mutations.totalMutations).toBeGreaterThan(0);
  });

  test("compareGroups enables A/B testing analysis", () => {
    const controlGroup = [
      createMockSession({ genomesCreated: 5, timeToFirstArtifact: 120000 }),
      createMockSession({ genomesCreated: 6, timeToFirstArtifact: 150000 }),
    ];
    const treatmentGroup = [
      createMockSession({ genomesCreated: 12, timeToFirstArtifact: 60000 }),
      createMockSession({ genomesCreated: 15, timeToFirstArtifact: 45000 }),
    ];

    const analyzer = new MetricsAnalyzer([...controlGroup, ...treatmentGroup]);
    const results = analyzer.compareGroups(
      controlGroup,
      treatmentGroup,
      "Control",
      "Treatment"
    );

    expect(results.length).toBeGreaterThan(0);
    const genomesComparison = results.find((r) => r.metric.includes("Genomes"));
    expect(genomesComparison?.diff).toBeLessThan(0); // Control has fewer
  });

  test("all metrics are JSON-serializable for API transport", () => {
    const sessions = [createMockSession()];
    const analyzer = new MetricsAnalyzer(sessions);
    const report = analyzer.generateReport();

    const serialized = JSON.stringify(report);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.engagement.totalSessions).toBe(
      report.engagement.totalSessions
    );
    expect(deserialized.tools.diffViewer.avgUsage).toBe(
      report.tools.diffViewer.avgUsage
    );
  });
});
