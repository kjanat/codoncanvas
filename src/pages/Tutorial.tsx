import { ProgressBar } from "@/components/ProgressBar";
import {
  LessonContent,
  ModuleSidebar,
  useTutorialProgress,
} from "@/components/tutorial";

export default function Tutorial() {
  const {
    progress,
    currentLesson,
    progressPercent,
    totalLessons,
    selectLesson,
    completeLesson,
    recordHintUsed,
    getHintsUsed,
  } = useTutorialProgress();

  const handleNextLesson = () => {
    if (currentLesson.nextLesson) {
      selectLesson(currentLesson.nextLesson);
    }
  };

  return (
    <div className="flex h-full bg-bg">
      <ModuleSidebar
        completedLessons={progress.completedLessons}
        currentLessonId={progress.currentLesson}
        onSelectLesson={selectLesson}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-text-muted">
            <span>Overall Progress</span>
            <span>
              {progress.completedLessons.length}/{totalLessons} lessons (
              {progressPercent}%)
            </span>
          </div>
          <ProgressBar value={progressPercent} variant="gradient" />
        </div>

        {/* Key-based reset: changing lesson.id remounts LessonContent */}
        <LessonContent
          initialHintsRevealed={getHintsUsed(currentLesson.id)}
          key={currentLesson.id}
          lesson={currentLesson}
          onComplete={() => completeLesson(currentLesson.id)}
          onHintUsed={(count) => recordHintUsed(currentLesson.id, count)}
          onNextLesson={handleNextLesson}
        />
      </div>
    </div>
  );
}
