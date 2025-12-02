/**
 * Research Metrics Export Tests
 *
 * Tests for pure export functions extracted from ResearchMetrics.
 */
import { describe, expect, test } from "bun:test";
import {
  formatSessionsAsCSV,
  formatSessionsAsJSON,
  prepareSessionsForExport,
} from "@/analysis/collectors/research-metrics-export";
import type { ResearchSession } from "@/analysis/types/metrics-session";

// Factory for creating test sessions
function createTestSession(
  overrides: Partial<ResearchSession> = {},
): ResearchSession {
  return {
    sessionId: "session_test-123",
    startTime: 1700000000000,
    endTime: 1700003600000,
    duration: 3600000,
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

describe("prepareSessionsForExport", () => {
  test("returns stored sessions when no current session", () => {
    const stored = [createTestSession({ sessionId: "session_1" })];
    const result = prepareSessionsForExport(stored, null);

    expect(result).toHaveLength(1);
    expect(result[0].sessionId).toBe("session_1");
  });

  test("appends current session with calculated duration", () => {
    const stored = [createTestSession({ sessionId: "session_1" })];
    const current = createTestSession({
      sessionId: "session_current",
      startTime: Date.now() - 1000,
      endTime: null,
      duration: null,
    });

    const result = prepareSessionsForExport(stored, current);

    expect(result).toHaveLength(2);
    expect(result[1].sessionId).toBe("session_current");
    expect(result[1].duration).toBeGreaterThanOrEqual(1000);
  });

  test("returns empty array when no sessions exist", () => {
    const result = prepareSessionsForExport([], null);
    expect(result).toEqual([]);
  });

  test("preserves original stored sessions immutably", () => {
    const stored = [createTestSession()];
    const originalDuration = stored[0].duration;

    prepareSessionsForExport(stored, createTestSession({ duration: 999 }));

    expect(stored[0].duration).toBe(originalDuration);
  });
});

describe("formatSessionsAsJSON", () => {
  test("returns valid JSON string", () => {
    const sessions = [createTestSession()];
    const json = formatSessionsAsJSON(sessions);

    expect(() => JSON.parse(json)).not.toThrow();
  });

  test("includes exportDate in ISO format", () => {
    const sessions = [createTestSession()];
    const parsed = JSON.parse(formatSessionsAsJSON(sessions));

    expect(parsed.exportDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("includes version string", () => {
    const sessions = [createTestSession()];
    const parsed = JSON.parse(formatSessionsAsJSON(sessions));

    expect(parsed.version).toBe("1.0");
  });

  test("includes correct totalSessions count", () => {
    const sessions = [createTestSession(), createTestSession()];
    const parsed = JSON.parse(formatSessionsAsJSON(sessions));

    expect(parsed.totalSessions).toBe(2);
  });

  test("includes all sessions in sessions array", () => {
    const sessions = [
      createTestSession({ sessionId: "session_a" }),
      createTestSession({ sessionId: "session_b" }),
    ];
    const parsed = JSON.parse(formatSessionsAsJSON(sessions));

    expect(parsed.sessions).toHaveLength(2);
    expect(parsed.sessions[0].sessionId).toBe("session_a");
    expect(parsed.sessions[1].sessionId).toBe("session_b");
  });

  test("formats with 2-space indentation", () => {
    const sessions = [createTestSession()];
    const json = formatSessionsAsJSON(sessions);

    expect(json).toContain("\n  ");
  });

  test("handles empty sessions array", () => {
    const parsed = JSON.parse(formatSessionsAsJSON([]));

    expect(parsed.totalSessions).toBe(0);
    expect(parsed.sessions).toEqual([]);
  });
});

describe("formatSessionsAsCSV", () => {
  test("starts with header row", () => {
    const csv = formatSessionsAsCSV([]);

    expect(csv.startsWith("sessionId,")).toBe(true);
  });

  test("includes all expected columns in header", () => {
    const csv = formatSessionsAsCSV([]);
    const headers = csv.split("\n")[0].split(",");

    expect(headers).toContain("sessionId");
    expect(headers).toContain("startTime");
    expect(headers).toContain("duration");
    expect(headers).toContain("genomesCreated");
    expect(headers).toContain("genomesExecuted");
    expect(headers).toContain("mutationsApplied");
    expect(headers).toContain("timeToFirstArtifact");
    expect(headers).toContain("visualMode");
    expect(headers).toContain("audioMode");
    expect(headers).toContain("bothMode");
    expect(headers).toContain("silentMutations");
    expect(headers).toContain("errorCount");
  });

  test("includes data row for each session", () => {
    const sessions = [createTestSession(), createTestSession()];
    const csv = formatSessionsAsCSV(sessions);
    const lines = csv.split("\n");

    expect(lines).toHaveLength(3); // 1 header + 2 data rows
  });

  test("formats startTime as ISO string", () => {
    const session = createTestSession({ startTime: 1700000000000 });
    const csv = formatSessionsAsCSV([session]);
    const dataRow = csv.split("\n")[1];

    expect(dataRow).toContain("2023-11-14T");
  });

  test("handles null duration as empty string", () => {
    const session = createTestSession({ duration: null });
    const csv = formatSessionsAsCSV([session]);
    const dataRow = csv.split("\n")[1];
    const values = dataRow.split(",");

    // Duration is 3rd column (index 2)
    expect(values[2]).toBe("");
  });

  test("handles null timeToFirstArtifact as empty string", () => {
    const session = createTestSession({ timeToFirstArtifact: null });
    const csv = formatSessionsAsCSV([session]);
    const dataRow = csv.split("\n")[1];
    const values = dataRow.split(",");

    // timeToFirstArtifact is 7th column (index 6)
    expect(values[6]).toBe("");
  });

  test("includes error count from errors array length", () => {
    const session = createTestSession({
      errors: [
        { timestamp: 123, type: "test", message: "error1" },
        { timestamp: 456, type: "test", message: "error2" },
      ],
    });
    const csv = formatSessionsAsCSV([session]);
    const dataRow = csv.split("\n")[1];
    const values = dataRow.split(",");

    // errorCount is last column
    expect(values[values.length - 1]).toBe("2");
  });

  test("extracts render mode counts correctly", () => {
    const session = createTestSession({
      renderModeUsage: { visual: 10, audio: 5, both: 3 },
    });
    const csv = formatSessionsAsCSV([session]);
    const headers = csv.split("\n")[0].split(",");
    const values = csv.split("\n")[1].split(",");

    const visualIdx = headers.indexOf("visualMode");
    const audioIdx = headers.indexOf("audioMode");
    const bothIdx = headers.indexOf("bothMode");

    expect(values[visualIdx]).toBe("10");
    expect(values[audioIdx]).toBe("5");
    expect(values[bothIdx]).toBe("3");
  });

  test("extracts mutation type counts correctly", () => {
    const session = createTestSession({
      mutationTypes: {
        silent: 2,
        missense: 3,
        nonsense: 1,
        frameshift: 0,
        point: 4,
        insertion: 1,
        deletion: 2,
      },
    });
    const csv = formatSessionsAsCSV([session]);
    const headers = csv.split("\n")[0].split(",");
    const values = csv.split("\n")[1].split(",");

    expect(values[headers.indexOf("silentMutations")]).toBe("2");
    expect(values[headers.indexOf("missenseMutations")]).toBe("3");
    expect(values[headers.indexOf("pointMutations")]).toBe("4");
  });

  test("extracts feature usage counts correctly", () => {
    const session = createTestSession({
      features: {
        diffViewer: 5,
        timeline: 3,
        evolution: 2,
        assessment: 1,
        export: 4,
      },
    });
    const csv = formatSessionsAsCSV([session]);
    const headers = csv.split("\n")[0].split(",");
    const values = csv.split("\n")[1].split(",");

    expect(values[headers.indexOf("diffViewerUsage")]).toBe("5");
    expect(values[headers.indexOf("timelineUsage")]).toBe("3");
    expect(values[headers.indexOf("exportUsage")]).toBe("4");
  });

  test("handles empty sessions array with header only", () => {
    const csv = formatSessionsAsCSV([]);
    const lines = csv.split("\n");

    expect(lines).toHaveLength(1);
    expect(lines[0].startsWith("sessionId")).toBe(true);
  });
});
