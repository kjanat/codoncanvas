/**
 * TutorialMatrix - Visual grid showing tutorial completion per student
 */

import type {
  ClassroomStats,
  TeacherStudentProgress,
} from "@/education/teacher-dashboard";

interface TutorialMatrixProps {
  students: TeacherStudentProgress[];
  stats: ClassroomStats;
}

export function TutorialMatrix({ students, stats }: TutorialMatrixProps) {
  const tutorials = Object.keys(stats.tutorialCompletion);

  if (tutorials.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-4xl">B</p>
        <h3 className="mt-2 font-semibold text-text">No tutorial data</h3>
        <p className="text-sm text-text-muted">
          Students haven&apos;t started any tutorials yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-xl border border-border bg-surface shadow-sm">
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
                          +
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
