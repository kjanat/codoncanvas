/**
 * Tests for metrics-analyzer.ts script
 *
 * Tests validation, formatting, and argument parsing
 * Note: CSV parsing is handled by csv42 library (tested separately)
 */

import { describe, expect, test } from "bun:test";
import {
  formatMutationRow,
  formatToolRow,
  parseArguments,
  validateSession,
} from "@/scripts/metrics-analyzer";

describe("metrics-analyzer script", () => {
  describe("validateSession", () => {
    const validSession = {
      sessionId: "test-123",
      startTime: 1000,
      endTime: 2000,
      duration: 1000,
      genomesCreated: 5,
      genomesExecuted: 3,
      mutationsApplied: 10,
      errorCount: 0,
      errorTypes: "",
    };

    test("passes for valid session with all required fields", () => {
      expect(() => validateSession(validSession, 1)).not.toThrow();
    });

    const missingFieldCases = [
      ["sessionId", { ...validSession, sessionId: undefined }],
      ["duration", { ...validSession, duration: undefined }],
      ["startTime", { ...validSession, startTime: undefined }],
      ["errorCount", { ...validSession, errorCount: undefined }],
    ] as const;

    test.each(
      missingFieldCases.map(([field, session]) => {
        const { [field]: _, ...rest } = session;
        return [field, rest] as const;
      }),
    )("throws for missing %s", (field, invalidSession) => {
      expect(() =>
        validateSession(
          invalidSession as Record<string, string | number | null>,
          1,
        ),
      ).toThrow(new RegExp(`missing required fields.*${field}`));
    });

    test("throws for missing multiple fields", () => {
      const { sessionId: _1, duration: _2, ...invalid } = validSession;
      expect(() => validateSession(invalid, 10)).toThrow(
        /missing required fields/,
      );
    });

    test("includes line number in error message", () => {
      const { sessionId: _, ...invalid } = validSession;
      expect(() => validateSession(invalid, 42)).toThrow(/line 42/);
    });
  });

  describe("formatToolRow", () => {
    const toolRowCases = [
      [
        "correct adoption percentage",
        "Diff Viewer",
        { users: 50, avgUsage: 3.5 },
        100,
        ["Diff Viewer", "50.0%", "3.5"],
      ],
      ["zero users", "Tool", { users: 0, avgUsage: 0 }, 100, ["0.0%"]],
      ["pads tool name", "Short", { users: 10, avgUsage: 1 }, 100, ["Short"]],
    ] as const;

    test.each(
      toolRowCases,
    )("formats tool row with %s", (_desc, name, data, total, expectedContents) => {
      const result = formatToolRow(name, data, total);
      for (const expected of expectedContents) {
        expect(result).toContain(expected);
      }
    });
  });

  describe("formatMutationRow", () => {
    const baseStats = {
      mean: 5,
      sd: 2,
      n: 10,
      min: 1,
      max: 10,
      median: 5,
      q1: 3,
      q3: 7,
    };

    const zeroStats = {
      mean: 0,
      sd: 0,
      n: 0,
      min: 0,
      max: 0,
      median: 0,
      q1: 0,
      q3: 0,
    };

    const mutationRowCases = [
      [
        "correct percentage",
        "Silent",
        baseStats,
        100,
        ["Silent", "M=5.0", "SD=2.0"],
      ],
      ["zero total mutations", "Silent", zeroStats, 0, ["0.0%"]],
      [
        "pads mutation name",
        "X",
        { ...baseStats, mean: 1, sd: 0.5, n: 5 },
        10,
        ["  X"],
      ],
    ] as const;

    test.each(
      mutationRowCases,
    )("formats mutation row with %s", (_desc, name, stats, total, expectedContents) => {
      const result = formatMutationRow(name, stats, total);
      for (const expected of expectedContents) {
        expect(result).toContain(expected);
      }
    });
  });

  describe("parseArguments", () => {
    const singleFlagCases = [
      ["--data", "dataFile", "metrics.csv"],
      ["--group", "groupName", "visual"],
      ["--baseline", "baselineFile", "baseline.csv"],
      ["--report", "reportType", "basic"],
      ["--output", "outputDir", "./results"],
    ] as const;

    test.each(singleFlagCases)("parses %s flag", (flag, property, value) => {
      const args =
        flag === "--data" ? [flag, value] : ["--data", "test.csv", flag, value];
      const result = parseArguments(args);
      expect(result[property]).toBe(value);
    });

    test("parses --help flag", () => {
      const result = parseArguments(["--help"]);
      expect(result.help).toBe(true);
    });

    test("parses -h short flag", () => {
      const result = parseArguments(["-h"]);
      expect(result.help).toBe(true);
    });

    test("uses defaults for missing options", () => {
      const result = parseArguments(["--data", "test.csv"]);
      expect(result.groupName).toBe("Group 1");
      expect(result.baselineFile).toBe("");
      expect(result.reportType).toBe("full");
      expect(result.outputDir).toBe(".");
      expect(result.help).toBe(false);
    });

    test("parses all options together", () => {
      const result = parseArguments([
        "--data",
        "study.csv",
        "--group",
        "treatment",
        "--baseline",
        "control.csv",
        "--report",
        "full",
        "--output",
        "/tmp/results",
      ]);
      expect(result.dataFile).toBe("study.csv");
      expect(result.groupName).toBe("treatment");
      expect(result.baselineFile).toBe("control.csv");
      expect(result.reportType).toBe("full");
      expect(result.outputDir).toBe("/tmp/results");
    });

    test("handles empty args", () => {
      const result = parseArguments([]);
      expect(result.dataFile).toBe("");
    });
  });
});
