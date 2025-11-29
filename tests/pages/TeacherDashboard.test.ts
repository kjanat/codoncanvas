/**
 * Tests for TeacherDashboard page
 *
 * Tests the TeacherDashboard engine integration and data processing.
 */

import { describe, expect, test } from "bun:test";
import {
  generateStudentExport,
  TeacherDashboard,
} from "@/education/teacher-dashboard";

describe("TeacherDashboard", () => {
  describe("TeacherDashboard engine", () => {
    test("initializes empty", () => {
      const dashboard = new TeacherDashboard();
      expect(dashboard.getStudents().length).toBe(0);
    });

    test("imports valid student data", () => {
      const dashboard = new TeacherDashboard();
      const exportData = generateStudentExport(
        "test-001",
        "Test Student",
        {},
        [],
      );
      dashboard.importStudentData(exportData);
      expect(dashboard.getStudents().length).toBe(1);
    });

    test("rejects invalid JSON", () => {
      const dashboard = new TeacherDashboard();
      expect(() => dashboard.importStudentData("not json")).toThrow();
    });

    test("rejects missing required fields", () => {
      const dashboard = new TeacherDashboard();
      expect(() => dashboard.importStudentData(JSON.stringify({}))).toThrow();
    });

    test("getStudent returns correct student", () => {
      const dashboard = new TeacherDashboard();
      const exportData = generateStudentExport("student-123", "Alice", {}, []);
      dashboard.importStudentData(exportData);

      const student = dashboard.getStudent("student-123");
      expect(student).toBeDefined();
      expect(student?.studentName).toBe("Alice");
    });

    test("getStudent returns undefined for unknown ID", () => {
      const dashboard = new TeacherDashboard();
      expect(dashboard.getStudent("nonexistent")).toBeUndefined();
    });

    test("removeStudent removes correct student", () => {
      const dashboard = new TeacherDashboard();
      dashboard.importStudentData(
        generateStudentExport("s1", "Student 1", {}, []),
      );
      dashboard.importStudentData(
        generateStudentExport("s2", "Student 2", {}, []),
      );

      expect(dashboard.getStudents().length).toBe(2);
      dashboard.removeStudent("s1");
      expect(dashboard.getStudents().length).toBe(1);
      expect(dashboard.getStudent("s1")).toBeUndefined();
      expect(dashboard.getStudent("s2")).toBeDefined();
    });

    test("clearAll removes all students", () => {
      const dashboard = new TeacherDashboard();
      dashboard.importStudentData(
        generateStudentExport("s1", "Student 1", {}, []),
      );
      dashboard.importStudentData(
        generateStudentExport("s2", "Student 2", {}, []),
      );

      expect(dashboard.getStudents().length).toBe(2);
      dashboard.clearAll();
      expect(dashboard.getStudents().length).toBe(0);
    });
  });

  describe("classroom stats", () => {
    test("returns empty stats for no students", () => {
      const dashboard = new TeacherDashboard();
      const stats = dashboard.getClassroomStats();

      expect(stats.studentCount).toBe(0);
      expect(stats.avgEngagement.sessionsPerStudent).toBe(0);
    });

    test("calculates correct student count", () => {
      const dashboard = new TeacherDashboard();
      dashboard.importStudentData(
        generateStudentExport("s1", "Student 1", {}, []),
      );
      dashboard.importStudentData(
        generateStudentExport("s2", "Student 2", {}, []),
      );
      dashboard.importStudentData(
        generateStudentExport("s3", "Student 3", {}, []),
      );

      const stats = dashboard.getClassroomStats();
      expect(stats.studentCount).toBe(3);
    });
  });

  describe("at-risk students", () => {
    test("returns empty for no students", () => {
      const dashboard = new TeacherDashboard();
      const atRisk = dashboard.getAtRiskStudents();
      expect(atRisk.length).toBe(0);
    });

    test("identifies students with no sessions as at-risk", () => {
      const dashboard = new TeacherDashboard();
      // Student with no sessions
      dashboard.importStudentData(
        generateStudentExport("s1", "No Sessions Student", {}, []),
      );

      const atRisk = dashboard.getAtRiskStudents();
      expect(atRisk.length).toBeGreaterThan(0);
      expect(atRisk.some((s) => s.studentId === "s1")).toBe(true);
    });
  });

  describe("generateStudentExport", () => {
    test("creates valid export JSON", () => {
      const exportData = generateStudentExport("test-id", "Test Name", {}, []);
      const parsed = JSON.parse(exportData);

      expect(parsed.studentId).toBe("test-id");
      expect(parsed.studentName).toBe("Test Name");
      expect(parsed.exportDate).toBeDefined();
      expect(parsed.tutorials).toEqual({});
      expect(parsed.sessions).toEqual([]);
    });

    test("includes tutorial progress", () => {
      const tutorials = {
        lesson1: {
          completed: true,
          currentStep: 5,
          totalSteps: 5,
          startedAt: 1000,
          completedAt: 2000,
        },
      };
      const exportData = generateStudentExport(
        "test-id",
        "Test",
        tutorials,
        [],
      );
      const parsed = JSON.parse(exportData);

      expect(parsed.tutorials.lesson1.completed).toBe(true);
      expect(parsed.tutorials.lesson1.currentStep).toBe(5);
    });

    test("calculates aggregate metrics", () => {
      const sessions = [
        {
          sessionId: "s1",
          startTime: 1000,
          endTime: 2000,
          duration: 1000,
          genomesCreated: 5,
          genomesExecuted: 10,
          mutationsApplied: 3,
          renderModeUsage: { visual: 5, audio: 2, both: 1 },
          features: {
            diffViewer: 0,
            timeline: 0,
            evolution: 0,
            assessment: 0,
            export: 0,
          },
          timeToFirstArtifact: 500,
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
        },
        {
          sessionId: "s2",
          startTime: 3000,
          endTime: 4000,
          duration: 1000,
          genomesCreated: 3,
          genomesExecuted: 6,
          mutationsApplied: 2,
          renderModeUsage: { visual: 3, audio: 1, both: 0 },
          features: {
            diffViewer: 0,
            timeline: 0,
            evolution: 0,
            assessment: 0,
            export: 0,
          },
          timeToFirstArtifact: 300,
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
        },
      ];

      const exportData = generateStudentExport("test-id", "Test", {}, sessions);
      const parsed = JSON.parse(exportData);

      expect(parsed.aggregateMetrics.totalSessions).toBe(2);
      expect(parsed.aggregateMetrics.totalDuration).toBe(2000);
      expect(parsed.aggregateMetrics.totalGenomesCreated).toBe(8);
      expect(parsed.aggregateMetrics.totalMutationsApplied).toBe(5);
    });
  });

  describe("export functions", () => {
    test("exportGradingSummary returns CSV", () => {
      const dashboard = new TeacherDashboard();
      dashboard.importStudentData(generateStudentExport("s1", "Alice", {}, []));

      const csv = dashboard.exportGradingSummary();
      expect(csv).toContain("Student ID");
      expect(csv).toContain("s1");
      expect(csv).toContain("Alice");
    });

    test("exportClassroomData returns JSON", () => {
      const dashboard = new TeacherDashboard();
      dashboard.importStudentData(generateStudentExport("s1", "Alice", {}, []));

      const json = dashboard.exportClassroomData();
      const parsed = JSON.parse(json);
      expect(parsed.students).toBeDefined();
      expect(parsed.classroomStats).toBeDefined();
      expect(parsed.exportDate).toBeDefined();
    });
  });
});
