/**
 * @fileoverview Teacher Dashboard Page (LEGACY)
 *
 * @deprecated This is a legacy vanilla JS page for pages/dashboards/teacher.html.
 * Use the React component instead: src/pages/dashboards/TeacherDashboard.tsx
 */

import {
  generateStudentExport,
  TeacherDashboard,
} from "@/education/teacher-dashboard";
import { getElementUnsafe as getElement } from "@/utils/dom";

interface StudentData {
  studentId: string;
  studentName?: string;
  aggregateMetrics: {
    totalSessions: number;
    totalDuration: number;
    totalGenomesCreated: number;
    totalMutationsApplied: number;
    avgTimeToFirstArtifact: number;
    completionRate: number;
  };
  tutorials: Record<
    string,
    {
      completed: boolean;
      currentStep: number;
      totalSteps: number;
      startedAt: number | null;
      completedAt: number | null;
    }
  >;
}

interface AtRiskStudent {
  studentId: string;
  studentName?: string;
  severity: "high" | "medium";
  reasons: string[];
  metrics: {
    sessions: number;
    tutorialsCompleted: number;
    tutorialsStarted: number;
  };
}

interface ClassroomStats {
  studentCount: number;
  avgEngagement: {
    sessionsPerStudent: number;
    durationPerStudent: number;
    tutorialCompletionRate: number;
  };
  distribution: {
    highEngagement: number;
    atRisk: number;
  };
  tutorialCompletion: Record<
    string,
    {
      completed: number;
      started: number;
      avgProgress: number;
    }
  >;
}

const dashboard = new TeacherDashboard();

// DOM Elements
const fileInput = getElement<HTMLInputElement>("file-input");
const dashboardEl = getElement("dashboard");
const statsGrid = getElement("stats-grid");
const atRiskSection = getElement("at-risk-section");
const engagementBody = getElement("engagement-body");
const tutorialMatrix = getElement("tutorial-matrix");

// File input handler
fileInput.addEventListener("change", async (e) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (files.length === 0) return;

  try {
    const imported = await dashboard.importMultipleFiles(files);
    alert(`Successfully imported ${imported} student file(s)`);
    renderDashboard();
  } catch (error) {
    alert(
      `Error importing files: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  // Clear input
  target.value = "";
});

// Render dashboard
function renderDashboard(): void {
  const students = dashboard.getStudents() as StudentData[];

  if (students.length === 0) {
    dashboardEl.classList.remove("visible");
    return;
  }

  dashboardEl.classList.add("visible");

  renderStats();
  renderAtRiskStudents();
  renderEngagementTable();
  renderTutorialMatrix();
}

// Render stats cards
function renderStats(): void {
  const stats = dashboard.getClassroomStats() as ClassroomStats;

  statsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-label">Total Students</div>
          <div class="stat-value">${stats.studentCount}</div>
          <div class="stat-subtitle">Imported data files</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average Sessions</div>
          <div class="stat-value">${stats.avgEngagement.sessionsPerStudent.toFixed(1)}</div>
          <div class="stat-subtitle">per student</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average Duration</div>
          <div class="stat-value">${Math.round(stats.avgEngagement.durationPerStudent / 60000)}</div>
          <div class="stat-subtitle">minutes per student</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Tutorial Completion</div>
          <div class="stat-value">${Math.round(stats.avgEngagement.tutorialCompletionRate * 100)}%</div>
          <div class="stat-subtitle">average completion rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">High Engagement</div>
          <div class="stat-value">${stats.distribution.highEngagement}</div>
          <div class="stat-subtitle">3+ sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">At Risk</div>
          <div class="stat-value">${stats.distribution.atRisk}</div>
          <div class="stat-subtitle">need intervention</div>
        </div>
      `;
}

// Render at-risk students
function renderAtRiskStudents(): void {
  const atRisk = dashboard.getAtRiskStudents() as AtRiskStudent[];

  if (atRisk.length === 0) {
    atRiskSection.innerHTML =
      '<div class="alert alert-info"><span class="alert-icon">✓</span><div><strong>No at-risk students identified</strong><br>All students are showing adequate engagement.</div></div>';
    return;
  }

  const alertsHTML = atRisk
    .map((student) => {
      const alertClass =
        student.severity === "high" ? "alert-danger" : "alert-warning";
      const icon = student.severity === "high" ? "⚠️" : "⚡";
      const name = student.studentName || student.studentId;

      return `
          <div class="alert ${alertClass}">
            <span class="alert-icon">${icon}</span>
            <div>
              <strong>${name}</strong> - ${student.severity.toUpperCase()} priority
              <ul style="margin-top: 8px; padding-left: 20px;">
                ${student.reasons.map((r) => `<li>${r}</li>`).join("")}
              </ul>
              <div style="margin-top: 8px; font-size: 12px;">
                Sessions: ${student.metrics.sessions} |
                Tutorials: ${student.metrics.tutorialsCompleted}/${student.metrics.tutorialsStarted}
              </div>
            </div>
          </div>
        `;
    })
    .join("");

  atRiskSection.innerHTML = `<h2>At-Risk Students (${atRisk.length})</h2>${alertsHTML}`;
}

// Render engagement table
function renderEngagementTable(): void {
  const students = dashboard.getStudents() as StudentData[];

  engagementBody.innerHTML = students
    .map((student) => {
      const name = student.studentName || "N/A";
      const duration = Math.round(
        student.aggregateMetrics.totalDuration / 60000,
      );
      const ttfa =
        student.aggregateMetrics.avgTimeToFirstArtifact > 0
          ? `${Math.round(student.aggregateMetrics.avgTimeToFirstArtifact / 60000)} min`
          : "Not achieved";
      const completion = Math.round(
        student.aggregateMetrics.completionRate * 100,
      );

      const isAtRisk =
        student.aggregateMetrics.totalSessions < 1 ||
        student.aggregateMetrics.avgTimeToFirstArtifact === 0;
      const statusBadge = isAtRisk
        ? '<span class="badge badge-danger">At Risk</span>'
        : student.aggregateMetrics.totalSessions >= 3
          ? '<span class="badge badge-success">Engaged</span>'
          : '<span class="badge badge-secondary">Active</span>';

      return `
          <tr>
            <td>${student.studentId}</td>
            <td>${name}</td>
            <td>${student.aggregateMetrics.totalSessions}</td>
            <td>${duration} min</td>
            <td>${student.aggregateMetrics.totalGenomesCreated}</td>
            <td>${student.aggregateMetrics.totalMutationsApplied}</td>
            <td>${ttfa}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${completion}%">${completion}%</div>
              </div>
            </td>
            <td>${statusBadge}</td>
          </tr>
        `;
    })
    .join("");
}

// Render tutorial completion matrix
function renderTutorialMatrix(): void {
  const students = dashboard.getStudents() as StudentData[];
  const stats = dashboard.getClassroomStats() as ClassroomStats;

  const tutorials = Object.keys(stats.tutorialCompletion);

  if (tutorials.length === 0) {
    tutorialMatrix.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">📚</div><h3>No tutorial data</h3><p>Students haven\'t started any tutorials yet.</p></div>';
    return;
  }

  const matrixHTML = tutorials
    .map((tutorialId) => {
      const tutorialName = tutorialId.replace(/([A-Z])/g, " $1").trim();
      const tutorialStats = stats.tutorialCompletion[tutorialId];

      const cellsHTML = students
        .map((student) => {
          const progress = student.tutorials[tutorialId];
          if (!progress || progress.startedAt === null) {
            return `<div class="student-cell cell-not-started" title="${student.studentId}: Not started">-</div>`;
          }

          if (progress.completed) {
            return `<div class="student-cell cell-completed" title="${student.studentId}: Completed">✓</div>`;
          }

          const percent = Math.round(
            (progress.currentStep / progress.totalSteps) * 100,
          );
          return `<div class="student-cell cell-in-progress" title="${student.studentId}: ${percent}% complete">${percent}</div>`;
        })
        .join("");

      return `
          <div class="tutorial-row">
            <div class="tutorial-name">
              ${tutorialName}
              <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">
                ${tutorialStats.completed}/${tutorialStats.started} completed (${Math.round(tutorialStats.avgProgress)}% avg)
              </div>
            </div>
            <div class="student-cells">${cellsHTML}</div>
          </div>
        `;
    })
    .join("");

  tutorialMatrix.innerHTML = `<div class="tutorial-matrix">${matrixHTML}</div>`;
}

// Export functions
function exportGradingSummary(): void {
  const csv = dashboard.exportGradingSummary();
  downloadFile(csv, "codoncanvas-grading-summary.csv", "text/csv");
}

function exportClassroomData(): void {
  const json = dashboard.exportClassroomData();
  downloadFile(json, "codoncanvas-classroom-data.json", "application/json");
}

function clearData(): void {
  if (confirm("Are you sure you want to clear all imported student data?")) {
    dashboard.clearAll();
    renderDashboard();
  }
}

// Download helper
function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Demo data loader
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: demo data generator requires nested loops
function loadDemoData(): void {
  // Generate 12 demo students with varying engagement levels
  const tutorialIds = ["helloCircle", "mutations", "timeline", "evolution"];

  for (let i = 1; i <= 12; i++) {
    const studentId = `DEMO${String(i).padStart(3, "0")}`;
    const studentName = `Demo Student ${i}`;

    // Vary engagement levels
    const engagementLevel = i <= 3 ? "high" : i <= 8 ? "medium" : "low";
    const sessionCount =
      engagementLevel === "high" ? 5 : engagementLevel === "medium" ? 2 : 0;

    const sessions = [];
    const tutorials: Record<
      string,
      {
        completed: boolean;
        currentStep: number;
        totalSteps: number;
        startedAt: number | null;
        completedAt: number | null;
      }
    > = {};

    // Generate sessions
    for (let s = 0; s < sessionCount; s++) {
      const session = {
        sessionId: `demo_${studentId}_${s}`,
        startTime: Date.now() - (5 - s) * 24 * 60 * 60 * 1000,
        endTime: Date.now() - (5 - s) * 24 * 60 * 60 * 1000 + 1800000,
        duration: 1800000,
        genomesCreated: engagementLevel === "high" ? 10 : 5,
        genomesExecuted: engagementLevel === "high" ? 15 : 8,
        mutationsApplied: engagementLevel === "high" ? 25 : 12,
        renderModeUsage: { visual: 10, audio: 3, both: 2 },
        features: {
          diffViewer: 5,
          timeline: 3,
          evolution: 2,
          assessment: 1,
          export: 2,
        },
        timeToFirstArtifact:
          s === 0 ? (engagementLevel === "high" ? 180000 : 300000) : null,
        errors: [] as Array<{
          timestamp: number;
          type: string;
          message: string;
        }>,
        mutationTypes: {
          silent: 5,
          missense: 8,
          nonsense: 3,
          frameshift: 4,
          point: 10,
          insertion: 3,
          deletion: 2,
        },
      };
      sessions.push(session);
    }

    // Generate tutorial progress
    tutorialIds.forEach((tutorialId, idx) => {
      if (engagementLevel === "low") {
        tutorials[tutorialId] = {
          completed: false,
          currentStep: 0,
          totalSteps: 6,
          startedAt: null,
          completedAt: null,
        };
      } else {
        const completed = engagementLevel === "high" || idx < 2;
        tutorials[tutorialId] = {
          completed,
          currentStep: completed ? 6 : idx + 2,
          totalSteps: 6,
          startedAt: Date.now() - (4 - idx) * 24 * 60 * 60 * 1000,
          completedAt: completed
            ? Date.now() - (3 - idx) * 24 * 60 * 60 * 1000
            : null,
        };
      }
    });

    const exportData = generateStudentExport(
      studentId,
      studentName,
      tutorials,
      sessions,
    );
    dashboard.importStudentData(exportData);
  }

  renderDashboard();
  alert("Loaded 12 demo students with varying engagement levels");
}

// Bind event listeners for action buttons
document
  .getElementById("load-demo-data-btn")
  ?.addEventListener("click", loadDemoData);
document
  .getElementById("export-grading-btn")
  ?.addEventListener("click", exportGradingSummary);
document
  .getElementById("export-classroom-btn")
  ?.addEventListener("click", exportClassroomData);
document.getElementById("clear-data-btn")?.addEventListener("click", clearData);

// Expose for debugging only
declare global {
  interface Window {
    teacherDashboard: TeacherDashboard;
  }
}
window.teacherDashboard = dashboard;
