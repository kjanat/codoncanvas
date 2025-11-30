import { Card } from "@/components/Card";

export function EducationalContent() {
  return (
    <Card className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-text">
        About Genetic Drift
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-medium text-text">What is Genetic Drift?</h3>
          <p className="text-sm text-text-muted">
            Genetic drift is the random change in allele frequencies that occurs
            in every population due to chance sampling. Each generation, alleles
            are randomly "sampled" to form the next generation, leading to
            random fluctuations in frequency.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-medium text-text">Key Observations</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-text-muted">
            <li>Smaller populations drift faster</li>
            <li>Eventually one allele "fixes" at 100%</li>
            <li>Other alleles are lost (reach 0%)</li>
            <li>Drift is random - outcomes vary each run</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
