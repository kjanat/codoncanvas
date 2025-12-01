/**
 * EngagementTable - Student engagement overview table
 */

import type { TeacherStudentProgress } from "@/education/teacher-dashboard";
import { formatDuration } from "./constants";

interface EngagementTableProps {
  students: TeacherStudentProgress[];
}

export function EngagementTable({ students }: EngagementTableProps) {
  if (students.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 rounded-xl border border-border bg-surface shadow-sm">
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
