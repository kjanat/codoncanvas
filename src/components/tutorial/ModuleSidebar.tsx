import { getLessonsByModule, moduleNames } from "@/data/tutorial-lessons";

interface ModuleSidebarProps {
  currentLessonId: string;
  completedLessons: string[];
  onSelectLesson: (id: string) => void;
}

export function ModuleSidebar({
  currentLessonId,
  completedLessons,
  onSelectLesson,
}: ModuleSidebarProps) {
  const modules = [1, 2, 3];

  return (
    <div className="w-64 shrink-0 overflow-auto border-r border-border bg-surface p-4">
      <h2 className="mb-4 text-lg font-bold text-text">Lessons</h2>
      {modules.map((moduleNum) => (
        <div className="mb-4" key={moduleNum}>
          <h3 className="mb-2 text-sm font-semibold text-text-muted">
            Module {moduleNum}: {moduleNames[moduleNum]}
          </h3>
          <div className="space-y-1">
            {getLessonsByModule(moduleNum).map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isCurrent = lesson.id === currentLessonId;
              return (
                <button
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isCurrent
                      ? "bg-primary text-white"
                      : isCompleted
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "text-text hover:bg-bg-light"
                  }`}
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson.id)}
                  type="button"
                >
                  <span className="mr-2">
                    {isCompleted ? "\u2713" : `${lesson.lessonNumber}.`}
                  </span>
                  {lesson.title}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
