import {
  getLessonById,
  type TutorialLesson,
  tutorialLessons,
} from "@/data/tutorial-lessons";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface TutorialProgress {
  completedLessons: string[];
  currentLesson: string;
  hintsUsed: Record<string, number>;
}

const DEFAULT_PROGRESS: TutorialProgress = {
  completedLessons: [],
  currentLesson: "basics-1",
  hintsUsed: {},
};

export interface UseTutorialProgressReturn {
  progress: TutorialProgress;
  /** Current lesson, or null if no lessons are available. Callers must null-check before use. */
  currentLesson: TutorialLesson | null;
  progressPercent: number;
  totalLessons: number;
  selectLesson: (id: string) => void;
  completeLesson: (id: string) => void;
  recordHintUsed: (lessonId: string, count: number) => void;
  getHintsUsed: (lessonId: string) => number;
}

export function useTutorialProgress(): UseTutorialProgressReturn {
  const [progress, setProgress] = useLocalStorage<TutorialProgress>(
    "codoncanvas-tutorial-progress",
    DEFAULT_PROGRESS,
  );

  const currentLesson: TutorialLesson | null =
    tutorialLessons.length === 0
      ? null
      : (getLessonById(progress.currentLesson) ?? tutorialLessons[0]);

  const progressPercent =
    tutorialLessons.length === 0
      ? 0
      : Math.round(
          (progress.completedLessons.length / tutorialLessons.length) * 100,
        );

  const selectLesson = (id: string): void => {
    if (!getLessonById(id)) {
      console.warn(`Invalid lesson ID: ${id}`);
      return;
    }
    setProgress((prev) => ({ ...prev, currentLesson: id }));
  };

  const completeLesson = (id: string): void => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(id)) {
        return prev;
      }
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, id],
      };
    });
  };

  const recordHintUsed = (lessonId: string, count: number): void => {
    setProgress((prev) => ({
      ...prev,
      hintsUsed: { ...prev.hintsUsed, [lessonId]: count },
    }));
  };

  const getHintsUsed = (lessonId: string): number => {
    return progress.hintsUsed[lessonId] ?? 0;
  };

  return {
    progress,
    currentLesson,
    progressPercent,
    totalLessons: tutorialLessons.length,
    selectLesson,
    completeLesson,
    recordHintUsed,
    getHintsUsed,
  };
}
