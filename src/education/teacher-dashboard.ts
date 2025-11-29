/**
 * Teacher Dashboard System
 *
 * Provides classroom-level analytics for educators.
 * Enables teachers to monitor student progress, identify at-risk learners,
 * and export grading summaries.
 *
 * Architecture:
 * - Students export progress JSON files (ResearchMetrics + Tutorial progress)
 * - Teachers import multiple JSON files into dashboard
 * - Dashboard aggregates and visualizes classroom analytics
 * - Privacy-preserving: No server storage, all client-side
 *
 * Strategic Value:
 * - Critical for classroom adoption (teachers need visibility)
 * - Enables S88 research metrics (RQ2-RQ3 engagement patterns)
 * - Supports formative assessment and early intervention
 */

import type { ResearchSession } from "@/analysis/research-metrics";
import type { RiskLevel } from "@/types";

/**
 * Student progress data exported for teacher dashboard analysis
 *
 * Complete record of a student's learning activity including tutorial progress,
 * execution history, and assessment results. Teachers import these files to
 * analyze classroom-wide patterns and identify at-risk learners.
 *
 * Privacy Design:
 * - No PII (student identifiers are anonymous IDs or teacher-assigned labels)
 * - All data client-side (no server storage)
 * - Teachers maintain full control over data access
 *
 * @example
 * ```typescript
 * const progress: TeacherStudentProgress = {
 *   studentId: 'student_001',
 *   exportDate: new Date().toISOString(),
 *   tutorials: {
 *     'getting-started': {
 *       completed: true,
 *       currentStep: 5,
 *       totalSteps: 5,
 *       startedAt: 1700000000,
 *       completedAt: 1700003600
 *     }
 *   },
 *   sessions: []
 * };
 * ```
 */
export interface TeacherStudentProgress {
  /** Student identifier (anonymous ID, not PII) */
  studentId: string;
  /** Optional student name (teacher-assigned label, not PII) */
  studentName?: string;
  /** ISO timestamp when progress was exported */
  exportDate: string;
  /** Tutorial completion progress by tutorial ID */
  tutorials: {
    [tutorialId: string]: {
      /** Whether tutorial was completed */
      completed: boolean;
      /** Current step number (0-indexed) */
      currentStep: number;
      /** Total number of steps in tutorial */
      totalSteps: number;
      /** Unix timestamp when started (or null if not started) */
      startedAt: number | null;
      /** Unix timestamp when completed (or null if not completed) */
      completedAt: number | null;
    };
  };
  /** Research metrics sessions (execution, feature, and assessment events) */
  sessions: ResearchSession[];
  /** Aggregate engagement metrics */
  aggregateMetrics: {
    totalSessions: number;
    totalDuration: number;
    totalGenomesCreated: number;
    totalGenomesExecuted: number;
    totalMutationsApplied: number;
    avgTimeToFirstArtifact: number;
    completionRate: number; // % of tutorials completed
  };
}

export interface ClassroomStats {
  /** Total students in class */
  studentCount: number;
  /** Average engagement metrics across class */
  avgEngagement: {
    sessionsPerStudent: number;
    durationPerStudent: number;
    genomesPerStudent: number;
    mutationsPerStudent: number;
    timeToFirstArtifact: number;
    tutorialCompletionRate: number;
  };
  /** Distribution statistics */
  distribution: {
    highEngagement: number; // Count of students with >3 sessions
    mediumEngagement: number; // 1-3 sessions
    lowEngagement: number; // <1 session
    atRisk: number; // Students who haven't achieved first artifact
  };
  /** Tutorial-specific completion rates */
  tutorialCompletion: {
    [tutorialId: string]: {
      started: number;
      completed: number;
      avgProgress: number; // Average step completion %
    };
  };
}

export interface AtRiskStudent {
  studentId: string;
  studentName?: string;
  reasons: string[];
  severity: RiskLevel;
  metrics: {
    sessions: number;
    timeToFirstArtifact: number | null;
    tutorialsStarted: number;
    tutorialsCompleted: number;
  };
}

/**
 * Teacher Dashboard Engine
 * Aggregates student progress data and provides classroom analytics
 */
export class TeacherDashboard {
  private students: Map<string, TeacherStudentProgress> = new Map();

  /**
   * Import student progress data from JSON
   */
  importStudentData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData) as TeacherStudentProgress;

      // Validate required fields
      if (!data.studentId || !data.exportDate) {
        throw new Error(
          "Invalid student progress data: missing required fields",
        );
      }

      this.students.set(data.studentId, data);
    } catch (error) {
      throw new Error(`Failed to import student data: ${error}`);
    }
  }

  /**
   * Import multiple student files at once
   */
  importMultipleFiles(files: File[]): Promise<number> {
    return new Promise((resolve, reject) => {
      let imported = 0;
      let errors = 0;

      files.forEach((file, _index) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            this.importStudentData(content);
            imported++;
          } catch (_error) {
            errors++;
          }

          // Resolve when all files processed
          if (imported + errors === files.length) {
            if (imported === 0) {
              reject(new Error("Failed to import any files"));
            } else {
              resolve(imported);
            }
          }
        };

        reader.onerror = () => {
          errors++;
          if (imported + errors === files.length) {
            reject(new Error("File reading failed"));
          }
        };

        reader.readAsText(file);
      });
    });
  }

  /**
   * Get all imported students
   */
  getStudents(): TeacherStudentProgress[] {
    return Array.from(this.students.values());
  }

  /**
   * Get student by ID
   */
  getStudent(studentId: string): TeacherStudentProgress | undefined {
    return this.students.get(studentId);
  }

  /**
   * Remove student from dashboard
   */
  removeStudent(studentId: string): boolean {
    return this.students.delete(studentId);
  }

  /**
   * Clear all imported data
   */
  clearAll(): void {
    this.students.clear();
  }

  /**
   * Calculate classroom-level statistics
   */
  getClassroomStats(): ClassroomStats {
    const students = this.getStudents();

    if (students.length === 0) {
      return this.getEmptyStats();
    }

    // Aggregate metrics
    const totalSessions = students.reduce(
      (sum, s) => sum + s.aggregateMetrics.totalSessions,
      0,
    );
    const totalDuration = students.reduce(
      (sum, s) => sum + s.aggregateMetrics.totalDuration,
      0,
    );
    const totalGenomes = students.reduce(
      (sum, s) => sum + s.aggregateMetrics.totalGenomesCreated,
      0,
    );
    const totalMutations = students.reduce(
      (sum, s) => sum + s.aggregateMetrics.totalMutationsApplied,
      0,
    );

    // Time to first artifact (only students who achieved it)
    const ttfaValues = students
      .map((s) => s.aggregateMetrics.avgTimeToFirstArtifact)
      .filter((t) => t > 0);
    const avgTTFA =
      ttfaValues.length > 0
        ? ttfaValues.reduce((sum, t) => sum + t, 0) / ttfaValues.length
        : 0;

    // Tutorial completion rate
    const tutorialCompletionRate =
      students.reduce((sum, s) => sum + s.aggregateMetrics.completionRate, 0) /
      students.length;

    // Engagement distribution
    let highEngagement = 0;
    let mediumEngagement = 0;
    let lowEngagement = 0;
    let atRisk = 0;

    students.forEach((s) => {
      const sessions = s.aggregateMetrics.totalSessions;
      if (sessions >= 3) highEngagement++;
      else if (sessions >= 1) mediumEngagement++;
      else lowEngagement++;

      if (s.aggregateMetrics.avgTimeToFirstArtifact === 0) {
        atRisk++;
      }
    });

    // Tutorial-specific completion
    const tutorialCompletion: ClassroomStats["tutorialCompletion"] = {};
    students.forEach((s) => {
      Object.entries(s.tutorials).forEach(([tutorialId, progress]) => {
        if (!tutorialCompletion[tutorialId]) {
          tutorialCompletion[tutorialId] = {
            started: 0,
            completed: 0,
            avgProgress: 0,
          };
        }

        if (progress.startedAt !== null) {
          tutorialCompletion[tutorialId].started++;
        }
        if (progress.completed) {
          tutorialCompletion[tutorialId].completed++;
        }
        const progressPercent =
          progress.totalSteps > 0
            ? (progress.currentStep / progress.totalSteps) * 100
            : 0;
        tutorialCompletion[tutorialId].avgProgress += progressPercent;
      });
    });

    // Average tutorial progress
    Object.keys(tutorialCompletion).forEach((tutorialId) => {
      const started = tutorialCompletion[tutorialId].started;
      if (started > 0) {
        tutorialCompletion[tutorialId].avgProgress /= started;
      }
    });

    return {
      studentCount: students.length,
      avgEngagement: {
        sessionsPerStudent: totalSessions / students.length,
        durationPerStudent: totalDuration / students.length,
        genomesPerStudent: totalGenomes / students.length,
        mutationsPerStudent: totalMutations / students.length,
        timeToFirstArtifact: avgTTFA,
        tutorialCompletionRate,
      },
      distribution: {
        highEngagement,
        mediumEngagement,
        lowEngagement,
        atRisk,
      },
      tutorialCompletion,
    };
  }

  /**
   * Identify at-risk students based on engagement metrics
   */
  getAtRiskStudents(): AtRiskStudent[] {
    const students = this.getStudents();
    const atRiskList: AtRiskStudent[] = [];

    students.forEach((student) => {
      const riskAssessment = this.evaluateStudentRisk(student);
      if (riskAssessment) {
        atRiskList.push(riskAssessment);
      }
    });

    // Sort by severity (high first), then by number of reasons
    return atRiskList.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.reasons.length - a.reasons.length;
    });
  }

  /**
   * Export classroom summary as CSV for grading
   */
  exportGradingSummary(): string {
    const students = this.getStudents();

    if (students.length === 0) {
      return "No student data imported";
    }

    // CSV header
    const headers = [
      "Student ID",
      "Student Name",
      "Total Sessions",
      "Total Duration (min)",
      "Genomes Created",
      "Mutations Applied",
      "Time to First Artifact (min)",
      "Tutorials Completed",
      "Completion Rate (%)",
      "At Risk",
    ];

    // CSV rows
    const rows = students.map((s) => {
      const tutorialsCompleted = Object.values(s.tutorials).filter(
        (t) => t.completed,
      ).length;
      const atRisk =
        s.aggregateMetrics.avgTimeToFirstArtifact === 0 ||
        s.aggregateMetrics.totalSessions < 1;

      return [
        s.studentId,
        s.studentName || "N/A",
        s.aggregateMetrics.totalSessions,
        Math.round(s.aggregateMetrics.totalDuration / 60000), // ms to minutes
        s.aggregateMetrics.totalGenomesCreated,
        s.aggregateMetrics.totalMutationsApplied,
        s.aggregateMetrics.avgTimeToFirstArtifact > 0
          ? Math.round(s.aggregateMetrics.avgTimeToFirstArtifact / 60000)
          : "N/A",
        tutorialsCompleted,
        Math.round(s.aggregateMetrics.completionRate * 100),
        atRisk ? "YES" : "NO",
      ];
    });

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  /**
   * Export complete classroom data as JSON
   */
  exportClassroomData(): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        version: "1.0",
        studentCount: this.students.size,
        classroomStats: this.getClassroomStats(),
        atRiskStudents: this.getAtRiskStudents(),
        students: this.getStudents(),
      },
      null,
      2,
    );
  }

  /**
   * Get empty stats for initialization
   */
  private getEmptyStats(): ClassroomStats {
    return {
      studentCount: 0,
      avgEngagement: {
        sessionsPerStudent: 0,
        durationPerStudent: 0,
        genomesPerStudent: 0,
        mutationsPerStudent: 0,
        timeToFirstArtifact: 0,
        tutorialCompletionRate: 0,
      },
      distribution: {
        highEngagement: 0,
        mediumEngagement: 0,
        lowEngagement: 0,
        atRisk: 0,
      },
      tutorialCompletion: {},
    };
  }
  private evaluateStudentRisk(
    student: TeacherStudentProgress,
  ): AtRiskStudent | null {
    const reasons: string[] = [];
    let severity: "high" | "medium" | "low" = "low";

    // Check: No first artifact achieved
    if (student.aggregateMetrics.avgTimeToFirstArtifact === 0) {
      reasons.push("Has not created first successful artifact");
      severity = "high";
    }

    // Check: Very low session count
    if (student.aggregateMetrics.totalSessions < 1) {
      reasons.push("No completed sessions");
      severity = "high";
    } else if (student.aggregateMetrics.totalSessions < 2) {
      reasons.push("Only 1 session completed");
      severity = severity === "high" ? "high" : "medium";
    }

    // Check: No tutorials started
    const tutorialsStarted = Object.values(student.tutorials).filter(
      (t) => t.startedAt !== null,
    ).length;
    if (tutorialsStarted === 0) {
      reasons.push("No tutorials started");
      severity = "high";
    }

    // Check: No genomes created
    if (student.aggregateMetrics.totalGenomesCreated === 0) {
      reasons.push("No genomes created");
      severity = "high";
    }

    // Check: Low tutorial completion rate
    if (
      student.aggregateMetrics.completionRate < 0.25 &&
      tutorialsStarted > 0
    ) {
      reasons.push("Low tutorial completion rate (<25%)");
      severity = severity === "high" ? "high" : "medium";
    }

    // Only include if there are risk factors
    if (reasons.length > 0) {
      return {
        studentId: student.studentId,
        studentName: student.studentName,
        reasons,
        severity,
        metrics: {
          sessions: student.aggregateMetrics.totalSessions,
          timeToFirstArtifact: student.aggregateMetrics.avgTimeToFirstArtifact,
          tutorialsStarted,
          tutorialsCompleted: Object.values(student.tutorials).filter(
            (t) => t.completed,
          ).length,
        },
      };
    }

    return null;
  }
}

/**
 * Generate student progress export data
 * Combines tutorial progress + research metrics for teacher import
 */
export function generateStudentExport(
  studentId: string,
  studentName: string | undefined,
  tutorials: TeacherStudentProgress["tutorials"],
  sessions: ResearchSession[],
): string {
  // Calculate aggregate metrics from sessions
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalGenomesCreated = sessions.reduce(
    (sum, s) => sum + s.genomesCreated,
    0,
  );
  const totalGenomesExecuted = sessions.reduce(
    (sum, s) => sum + s.genomesExecuted,
    0,
  );
  const totalMutationsApplied = sessions.reduce(
    (sum, s) => sum + s.mutationsApplied,
    0,
  );

  const ttfaValues = sessions
    .map((s) => s.timeToFirstArtifact)
    .filter((t): t is number => t !== null);
  const avgTimeToFirstArtifact =
    ttfaValues.length > 0
      ? ttfaValues.reduce((sum, t) => sum + t, 0) / ttfaValues.length
      : 0;

  const tutorialsCompleted = Object.values(tutorials).filter(
    (t) => t.completed,
  ).length;
  const tutorialsTotal = Object.keys(tutorials).length;
  const completionRate =
    tutorialsTotal > 0 ? tutorialsCompleted / tutorialsTotal : 0;

  const studentProgress: TeacherStudentProgress = {
    studentId,
    studentName,
    exportDate: new Date().toISOString(),
    tutorials,
    sessions,
    aggregateMetrics: {
      totalSessions,
      totalDuration,
      totalGenomesCreated,
      totalGenomesExecuted,
      totalMutationsApplied,
      avgTimeToFirstArtifact,
      completionRate,
    },
  };

  return JSON.stringify(studentProgress, null, 2);
}
