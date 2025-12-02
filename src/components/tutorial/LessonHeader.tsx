import type { TutorialLesson } from "@/data/tutorial-lessons";

interface LessonHeaderProps {
  lesson: TutorialLesson;
}

export function LessonHeader({ lesson }: LessonHeaderProps) {
  return (
    <div className="mb-4 border-b border-border pb-4 md:mb-6">
      <div className="mb-1 text-xs text-text-muted md:text-sm">
        Module {lesson.module} - Lesson {lesson.lessonNumber}
      </div>
      <h1 className="mb-2 text-xl font-bold text-text md:text-2xl">
        {lesson.title}
      </h1>
      <p className="text-sm text-text-light md:text-base">
        {lesson.description}
      </p>
    </div>
  );
}
