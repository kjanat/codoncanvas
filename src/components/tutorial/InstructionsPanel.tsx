import type { TutorialLesson } from "@/data/tutorial-lessons";

interface InstructionsPanelProps {
  lesson: TutorialLesson;
}

export function InstructionsPanel({ lesson }: InstructionsPanelProps) {
  return (
    <div className="mb-6 rounded-lg border border-border bg-bg-light p-4">
      <h3 className="mb-3 font-semibold text-text">Instructions</h3>
      <ol className="list-inside list-decimal space-y-2 text-sm text-text-light">
        {lesson.instructions.map((instruction) => (
          <li key={instruction}>{instruction}</li>
        ))}
      </ol>
    </div>
  );
}
