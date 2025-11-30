import { Card } from "@/components/Card";
import { MUTATION_TYPES } from "@/data/mutation-types";

export function MutationReference() {
  return (
    <Card className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-text">
        Mutation Types Reference
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MUTATION_TYPES.map((typeInfo) => (
          <div className="rounded-lg bg-surface p-4" key={typeInfo.type}>
            <h3 className="font-medium text-text">{typeInfo.label}</h3>
            <p className="mt-1 text-sm text-text-muted">
              {typeInfo.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
