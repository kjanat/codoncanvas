/**
 * AtRiskPanel - Shows students needing intervention
 */

import type { AtRiskStudent } from "@/education/teacher-dashboard";

interface AtRiskPanelProps {
  students: AtRiskStudent[];
}

export function AtRiskPanel({ students }: AtRiskPanelProps) {
  if (students.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-success/20 bg-success/5 p-6">
        <p className="flex items-center gap-2 text-success">
          <span className="text-xl">+</span>
          No at-risk students identified. All students showing adequate
          engagement.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-danger/20 bg-danger/5 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-danger">
        <span className="text-xl">!</span>
        Students Needing Intervention ({students.length})
      </h2>
      <div className="space-y-3">
        {students.map((student) => (
          <div
            className={`rounded-lg p-4 ${
              student.severity === "high"
                ? "border border-danger/30 bg-surface"
                : "border border-warning/30 bg-surface"
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
                <li key={reason}>- {reason}</li>
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
