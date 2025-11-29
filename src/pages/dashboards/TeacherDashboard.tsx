/**
 * Teacher Dashboard - Classroom analytics and student progress tracking
 *
 * Enables educators to monitor student progress, identify at-risk students,
 * and export grading summaries. All data is processed client-side for privacy.
 */

import { useCallback, useState } from "react";

interface StudentData {
  id: string;
  name: string;
  completedTutorials: number;
  totalTutorials: number;
  genomesCreated: number;
  mutationsApplied: number;
  lastActive: string;
  status: "on-track" | "needs-attention" | "at-risk";
}

// Mock data for demonstration
const MOCK_STUDENTS: StudentData[] = [
  {
    id: "1",
    name: "Student A",
    completedTutorials: 5,
    totalTutorials: 6,
    genomesCreated: 12,
    mutationsApplied: 28,
    lastActive: "2 hours ago",
    status: "on-track",
  },
  {
    id: "2",
    name: "Student B",
    completedTutorials: 3,
    totalTutorials: 6,
    genomesCreated: 5,
    mutationsApplied: 8,
    lastActive: "1 day ago",
    status: "needs-attention",
  },
  {
    id: "3",
    name: "Student C",
    completedTutorials: 1,
    totalTutorials: 6,
    genomesCreated: 2,
    mutationsApplied: 3,
    lastActive: "3 days ago",
    status: "at-risk",
  },
];

const statusColors = {
  "on-track": "bg-success/10 text-success",
  "needs-attention": "bg-warning/10 text-warning",
  "at-risk": "bg-danger/10 text-danger",
};

const statusLabels = {
  "on-track": "On Track",
  "needs-attention": "Needs Attention",
  "at-risk": "At Risk",
};

export default function TeacherDashboard() {
  const [students, _setStudents] = useState<StudentData[]>(MOCK_STUDENTS);
  const [importError, setImportError] = useState<string | null>(null);

  // Handle file import (drag & drop or click)
  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      setImportError(null);

      // Process each file
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            // In a real implementation, we'd parse and add student data
            console.info("Imported student data:", data);
          } catch (_err) {
            setImportError(`Failed to parse ${file.name}: Invalid JSON format`);
          }
        };
        reader.readAsText(file);
      });
    },
    [],
  );

  // Export grading summary as CSV
  const exportCSV = useCallback(() => {
    const headers = [
      "Name",
      "Progress",
      "Genomes",
      "Mutations",
      "Last Active",
      "Status",
    ];
    const rows = students.map((s) => [
      s.name,
      `${s.completedTutorials}/${s.totalTutorials}`,
      s.genomesCreated.toString(),
      s.mutationsApplied.toString(),
      s.lastActive,
      statusLabels[s.status],
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codoncanvas-grades-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [students]);

  const atRiskCount = students.filter((s) => s.status === "at-risk").length;
  const avgProgress =
    students.reduce(
      (acc, s) => acc + s.completedTutorials / s.totalTutorials,
      0,
    ) / students.length;

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
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-light">
            Import Student Data
            <input
              accept=".json"
              className="hidden"
              multiple
              onChange={handleFileImport}
              type="file"
            />
          </label>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            onClick={exportCSV}
            type="button"
          >
            Export CSV
          </button>
        </div>
      </div>

      {importError && (
        <div className="mb-6 rounded-lg border border-danger/20 bg-danger/5 p-4 text-danger">
          {importError}
        </div>
      )}

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-text">{students.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">Average Progress</p>
          <p className="mt-2 text-3xl font-bold text-text">
            {(avgProgress * 100).toFixed(0)}%
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">At-Risk Students</p>
          <p className="mt-2 text-3xl font-bold text-danger">{atRiskCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">Total Genomes Created</p>
          <p className="mt-2 text-3xl font-bold text-text">
            {students.reduce((acc, s) => acc + s.genomesCreated, 0)}
          </p>
        </div>
      </div>

      {/* At-Risk Alerts */}
      {atRiskCount > 0 && (
        <div className="mb-8 rounded-xl border border-danger/20 bg-danger/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-danger">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Students Needing Intervention
          </h2>
          <div className="space-y-2">
            {students
              .filter((s) => s.status === "at-risk")
              .map((student) => (
                <div
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                  key={student.id}
                >
                  <span className="font-medium text-text">{student.name}</span>
                  <span className="text-sm text-text-muted">
                    Last active: {student.lastActive}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-text">Student Progress</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg-light">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-muted">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-muted">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-muted">
                  Genomes
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-muted">
                  Mutations
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-muted">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr className="hover:bg-bg-light" key={student.id}>
                  <td className="px-6 py-4 font-medium text-text">
                    {student.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(student.completedTutorials / student.totalTutorials) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-text-muted">
                        {student.completedTutorials}/{student.totalTutorials}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text">
                    {student.genomesCreated}
                  </td>
                  <td className="px-6 py-4 text-text">
                    {student.mutationsApplied}
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[student.status]}`}
                    >
                      {statusLabels[student.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
