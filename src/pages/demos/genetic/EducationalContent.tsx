import { Card } from "@/components/Card";

export function EducationalContent() {
  return (
    <Card className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-text">
        About Genetic Algorithms
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="mb-2 font-medium text-text">Selection</h3>
          <p className="text-sm text-text-muted">
            Tournament selection picks two random individuals and chooses the
            fitter one as a parent. This creates selection pressure toward
            better solutions.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-medium text-text">Mutation</h3>
          <p className="text-sm text-text-muted">
            Random point mutations introduce variation. Higher rates explore
            more but may lose good solutions. Lower rates refine existing
            solutions.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-medium text-text">Elitism</h3>
          <p className="text-sm text-text-muted">
            The top 2 individuals (marked "E") pass unchanged to the next
            generation. This prevents losing the best solutions found so far.
          </p>
        </div>
      </div>
    </Card>
  );
}
