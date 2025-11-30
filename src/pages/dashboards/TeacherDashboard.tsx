/**
 * Teacher Dashboard - Classroom analytics and student progress tracking
 *
 * Enables educators to monitor student progress, identify at-risk students,
 * and export grading summaries. All data is processed client-side for privacy.
 */

import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { useToast } from "@/contexts";
import {
  type AtRiskStudent,
  type ClassroomStats,
  generateStudentExport,
  TeacherDashboard as TeacherDashboardEngine,
  type TeacherStudentProgress,
} from "@/education/teacher-dashboard";

// --- Helper Functions ---

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generateDemoSession(
  studentId: string,
  sessionIndex: number,
  isHighEngagement: boolean,
) {
  return {
    sessionId: `demo_${studentId}_${sessionIndex}`,
    startTime: Date.now() - (5 - sessionIndex) * 24 * 60 * 60 * 1000,
    endTime: Date.now() - (5 - sessionIndex) * 24 * 60 * 60 * 1000 + 1800000,
    duration: 1800000,
    genomesCreated: isHighEngagement ? 10 : 5,
    genomesExecuted: isHighEngagement ? 15 : 8,
    mutationsApplied: isHighEngagement ? 25 : 12,
    renderModeUsage: { visual: 10, audio: 3, both: 2 },
    features: {
      diffViewer: 5,
      timeline: 3,
      evolution: 2,
      assessment: 1,
      export: 2,
    },
    timeToFirstArtifact:
      sessionIndex === 0 ? (isHighEngagement ? 180000 : 300000) : null,
    errors: [] as Array<{ timestamp: number; type: string; message: string }>,
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
}

function generateDemoTutorials(
  engagementLevel: "high" | "medium" | "low",
  tutorialIds: string[],
) {
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

  for (const [idx, tutorialId] of tutorialIds.entries()) {
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
  }

  return tutorials;
}

function loadDemoDataIntoEngine(dashboard: TeacherDashboardEngine): void {
  const tutorialIds = ["helloCircle", "mutations", "timeline", "evolution"];

  for (let i = 1; i <= 12; i++) {
    const studentId = `DEMO${String(i).padStart(3, "0")}`;
    const studentName = `Demo Student ${i}`;
    const engagementLevel: "high" | "medium" | "low" =
      i <= 3 ? "high" : i <= 8 ? "medium" : "low";
    const sessionCount =
      engagementLevel === "high" ? 5 : engagementLevel === "medium" ? 2 : 0;
    const isHighEngagement = engagementLevel === "high";

    const sessions = Array.from({ length: sessionCount }, (_, s) =>
      generateDemoSession(studentId, s, isHighEngagement),
    );
    const tutorials = generateDemoTutorials(engagementLevel, tutorialIds);

    const exportData = generateStudentExport(
      studentId,
      studentName,
      tutorials,
      sessions,
    );
    dashboard.importStudentData(exportData);
  }
}

// --- Sub-Components ---

function AtRiskPanel({ students }: { students: AtRiskStudent[] }) {
  if (students.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-success/20 bg-success/5 p-6">
        <p className="flex items-center gap-2 text-success">
          <span className="text-xl">✓</span>
          No at-risk students identified. All students showing adequate
          engagement.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-danger/20 bg-danger/5 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-danger">
        <span className="text-xl">⚠</span>
        Students Needing Intervention ({students.length})
      </h2>
      <div className="space-y-3">
        {students.map((student) => (
          <div
            className={`rounded-lg p-4 ${
              student.severity === "high"
                ? "border border-danger/30 bg-white"
                : "border border-warning/30 bg-white"
            }`}
            key={student.studentId}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-text">
                {student.studentName || student.studentId}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  student.severity === "high"
                    ? "bg-danger/10 text-danger"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {student.severity.toUpperCase()}
              </span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-text-muted">
              {student.reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
            <div className="mt-2 text-xs text-text-muted">
              Sessions: {student.metrics.sessions} | Tutorials:{" "}
              {student.metrics.tutorialsCompleted}/
              {student.metrics.tutorialsStarted}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementTable({ students }: { students: TeacherStudentProgress[] }) {
  if (students.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border p-6">
        <h2 className="text-lg font-semibold text-text">Student Engagement</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-bg-light">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                Sessions
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                Genomes
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                Mutations
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                Completion
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => {
              const { aggregateMetrics: m } = student;
              const isAtRisk =
                m.totalSessions < 1 || m.avgTimeToFirstArtifact === 0;
              const isEngaged = m.totalSessions >= 3;
              const completion = Math.round(m.completionRate * 100);

              return (
                <tr className="hover:bg-bg-light" key={student.studentId}>
                  <td className="px-4 py-3 font-mono text-sm text-text-muted">
                    {student.studentId}
                  </td>
                  <td className="px-4 py-3 font-medium text-text">
                    {student.studentName || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-text">{m.totalSessions}</td>
                  <td className="px-4 py-3 text-text">
                    {formatDuration(m.totalDuration)}
                  </td>
                  <td className="px-4 py-3 text-text">
                    {m.totalGenomesCreated}
                  </td>
                  <td className="px-4 py-3 text-text">
                    {m.totalMutationsApplied}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-muted">
                        {completion}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isAtRisk
                          ? "bg-danger/10 text-danger"
                          : isEngaged
                            ? "bg-success/10 text-success"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isAtRisk ? "At Risk" : isEngaged ? "Engaged" : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TutorialMatrix({
  students,
  stats,
}: {
  students: TeacherStudentProgress[];
  stats: ClassroomStats;
}) {
  const tutorials = Object.keys(stats.tutorialCompletion);

  if (tutorials.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">📚</p>
        <h3 className="mt-2 font-semibold text-text">No tutorial data</h3>
        <p className="text-sm text-text-muted">
          Students haven't started any tutorials yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border p-6">
        <h2 className="text-lg font-semibold text-text">
          Tutorial Completion Matrix
        </h2>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="space-y-3">
          {tutorials.map((tutorialId) => {
            const tutorialStats = stats.tutorialCompletion[tutorialId];
            const tutorialName = tutorialId.replace(/([A-Z])/g, " $1").trim();

            return (
              <div className="flex items-center gap-4" key={tutorialId}>
                <div className="w-48 shrink-0">
                  <div className="font-medium text-text">{tutorialName}</div>
                  <div className="text-xs text-text-muted">
                    {tutorialStats.completed}/{tutorialStats.started} completed
                    ({Math.round(tutorialStats.avgProgress)}% avg)
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {students.map((student) => {
                    const progress = student.tutorials[tutorialId];
                    if (!progress || progress.startedAt === null) {
                      return (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-xs text-gray-400"
                          key={student.studentId}
                          title={`${student.studentId}: Not started`}
                        >
                          -
                        </div>
                      );
                    }

                    if (progress.completed) {
                      return (
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded bg-success/20 text-xs text-success"
                          key={student.studentId}
                          title={`${student.studentId}: Completed`}
                        >
                          ✓
                        </div>
                      );
                    }

                    const percent = Math.round(
                      (progress.currentStep / progress.totalSteps) * 100,
                    );
                    return (
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-xs text-primary"
                        key={student.studentId}
                        title={`${student.studentId}: ${percent}% complete`}
                      >
                        {percent}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function TeacherDashboard() {
  const { success } = useToast();
  const [dashboard] = useState(() => new TeacherDashboardEngine());
  const [students, setStudents] = useState<TeacherStudentProgress[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const stats = useMemo(
    () => (students.length > 0 ? dashboard.getClassroomStats() : null),
    [dashboard, students],
  );

  const atRiskStudents = useMemo(
    () => (students.length > 0 ? dashboard.getAtRiskStudents() : []),
    [dashboard, students],
  );

  const refreshData = useCallback(() => {
    setStudents([...dashboard.getStudents()]);
  }, [dashboard]);

  const handleFileImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setImportError(null);

      try {
        const imported = await dashboard.importMultipleFiles(Array.from(files));
        refreshData();
        success(`Successfully imported ${imported} student file(s)`);
      } catch (error) {
        setImportError(
          error instanceof Error ? error.message : "Failed to import files",
        );
      }

      event.target.value = "";
    },
    [dashboard, refreshData, success],
  );

  const handleLoadDemoData = useCallback(() => {
    loadDemoDataIntoEngine(dashboard);
    refreshData();
    success("Loaded 12 demo students with varying engagement levels");
  }, [dashboard, refreshData, success]);

  const handleExportCSV = useCallback(() => {
    const csv = dashboard.exportGradingSummary();
    downloadFile(csv, "codoncanvas-grading-summary.csv", "text/csv");
    success("Grading summary exported as CSV");
  }, [dashboard, success]);

  const handleExportJSON = useCallback(() => {
    const json = dashboard.exportClassroomData();
    downloadFile(json, "codoncanvas-classroom-data.json", "application/json");
    success("Classroom data exported as JSON");
  }, [dashboard, success]);

  const handleClearData = useCallback(() => {
    if (confirm("Are you sure you want to clear all imported student data?")) {
      dashboard.clearAll();
      refreshData();
      success("All student data cleared");
    }
  }, [dashboard, refreshData, success]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-text">
            Teacher Dashboard
          </h1>
          <p className="text-text-muted">
            Monitor student progress and classroom analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-light">
            Import Files
            <input
              accept=".json"
              className="hidden"
              multiple
              onChange={handleFileImport}
              type="file"
            />
          </label>
          <button
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-light"
            onClick={handleLoadDemoData}
            type="button"
          >
            Load Demo Data
          </button>
        </div>
      </div>

      {importError && (
        <div className="mb-6 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          {importError}
        </div>
      )}

      {/* Empty State */}
      {students.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
          <p className="text-5xl">📊</p>
          <h2 className="mt-4 text-xl font-semibold text-text">
            No Student Data Imported
          </h2>
          <p className="mt-2 text-text-muted">
            Import student progress JSON files or load demo data to get started.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <label className="cursor-pointer rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark">
              Import Student Files
              <input
                accept=".json"
                className="hidden"
                multiple
                onChange={handleFileImport}
                type="file"
              />
            </label>
            <button
              className="rounded-lg border border-border px-6 py-3 font-medium text-text transition-colors hover:bg-bg-light"
              onClick={handleLoadDemoData}
              type="button"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {stats && (
        <>
          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="Total Students"
              value={stats.studentCount}
              variant="dashboard"
            />
            <StatCard
              label="Avg Sessions"
              subtitle="per student"
              value={stats.avgEngagement.sessionsPerStudent.toFixed(1)}
              variant="dashboard"
            />
            <StatCard
              label="Avg Duration"
              subtitle="per student"
              value={formatDuration(stats.avgEngagement.durationPerStudent)}
              variant="dashboard"
            />
            <StatCard
              label="Tutorial Completion"
              value={`${Math.round(stats.avgEngagement.tutorialCompletionRate * 100)}%`}
              variant="dashboard"
            />
            <StatCard
              label="High Engagement"
              subtitle="3+ sessions"
              value={stats.distribution.highEngagement}
              variant="dashboard"
            />
            <StatCard
              danger
              label="At Risk"
              subtitle="need intervention"
              value={stats.distribution.atRisk}
              variant="dashboard"
            />
          </div>

          {/* At-Risk Panel */}
          <AtRiskPanel students={atRiskStudents} />

          {/* Engagement Table */}
          <EngagementTable students={students} />

          {/* Tutorial Matrix */}
          <TutorialMatrix stats={stats} students={students} />

          {/* Export Actions */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-text">
              Export Data
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success-dark"
                onClick={handleExportCSV}
                type="button"
              >
                Export Grading Summary (CSV)
              </button>
              <button
                className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success-dark"
                onClick={handleExportJSON}
                type="button"
              >
                Export Full Data (JSON)
              </button>
              <button
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-dark"
                onClick={handleClearData}
                type="button"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
