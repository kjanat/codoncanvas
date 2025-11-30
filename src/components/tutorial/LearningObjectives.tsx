interface LearningObjectivesProps {
  objectives: string[];
}

export function LearningObjectives({ objectives }: LearningObjectivesProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-3 font-semibold text-text">Learning Objectives</h3>
      <ul className="space-y-1 text-sm text-text-light">
        {objectives.map((obj) => (
          <li className="flex gap-2" key={obj}>
            <span className="text-primary">-&gt;</span>
            {obj}
          </li>
        ))}
      </ul>
    </div>
  );
}
