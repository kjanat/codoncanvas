import type { TutorialLesson } from "@/data/tutorial-lessons";

interface LessonHeaderProps {
  lesson: TutorialLesson;
}

export function LessonHeader({ lesson }: LessonHeaderProps) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="mb-1 text-sm text-text-muted">
        Module {lesson.module} - Lesson {lesson.lessonNumber}
      </div>
      <h1 className="mb-2 text-2xl font-bold text-text">{lesson.title}</h1>
      <p className="text-text-light">{lesson.description}</p>
    </div>
  );
}
