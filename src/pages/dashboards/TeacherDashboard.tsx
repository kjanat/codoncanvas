/**
 * Teacher Dashboard - Classroom analytics and student progress tracking
 *
 * Enables educators to monitor student progress, identify at-risk students,
 * and export grading summaries. All data is processed client-side for privacy.
 */

import { StatCard } from "@/components/StatCard";
import {
  AtRiskPanel,
  EngagementTable,
  formatDuration,
  TutorialMatrix,
  useTeacherDashboard,
} from "./teacher";

export default function TeacherDashboard() {
  const {
    students,
    stats,
    atRiskStudents,
    importError,
    handleFileImport,
    handleLoadDemoData,
    handleExportCSV,
    handleExportJSON,
    handleClearData,
  } = useTeacherDashboard();

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
          <label className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-light">
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
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-light"
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
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm">
          <p className="text-5xl">X</p>
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
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
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
