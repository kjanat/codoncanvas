import { ExampleCard } from "./ExampleCard";
import type { ExampleWithName } from "./types";

interface ExampleGridProps {
  examples: ExampleWithName[];
  onSelect: (example: ExampleWithName) => void;
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-text-muted">
        No examples found matching your criteria.
      </p>
    </div>
  );
}

export function ExampleGrid({ examples, onSelect }: ExampleGridProps) {
  if (examples.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {examples.map((example) => (
        <ExampleCard
          example={example}
          key={example.name}
          onClick={() => onSelect(example)}
        />
      ))}
    </div>
  );
}
