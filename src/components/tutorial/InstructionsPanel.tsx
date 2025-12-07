import type { ReactElement } from "react";
import type { TutorialLesson } from "@/data/tutorial-lessons";

interface InstructionsPanelProps {
  lesson: TutorialLesson;
}

export function InstructionsPanel({
  lesson,
}: InstructionsPanelProps): ReactElement {
  return (
    <div className="rounded-lg border border-border bg-bg-light p-3 md:p-4">
      <h3 className="mb-2 font-semibold text-text md:mb-3">Instructions</h3>
      <ol className="list-inside list-decimal space-y-2 text-sm text-text-light">
        {lesson.instructions.map((instruction) => (
          <li key={instruction}>{instruction}</li>
        ))}
      </ol>
    </div>
  );
}
