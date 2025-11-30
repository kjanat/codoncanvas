import type React from "react";
import { useMemo } from "react";
import { Card } from "@/components/Card";
import { Label } from "@/components/Label";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { RangeSlider } from "@/components/RangeSlider";
import { SimulationControls } from "@/components/SimulationControls";
import { useLineChart } from "@/hooks/useLineChart";
import {
  AlleleFrequencies,
  EducationalContent,
  FixationAlert,
  usePopulationSimulation,
} from "./population";

export default function PopulationDemo(): React.JSX.Element {
  const sim = usePopulationSimulation();

  const chartSeries = useMemo(
    () =>
      sim.population.alleles.map((allele, idx) => ({
        data: sim.population.history.map((h) => h.frequencies[idx]),
        color: allele.color,
      })),
    [sim.population],
  );

  const chartRef = useLineChart({ series: chartSeries });

  return (
    <PageContainer>
      <PageHeader
        subtitle="Observe genetic drift - random changes in allele frequencies over generations"
        title="Population Genetics"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text">Parameters</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="population-size">
                Population Size: {sim.populationSize}
              </Label>
              <RangeSlider
                disabled={sim.isRunning}
                id="population-size"
                max={500}
                min={10}
                onChange={sim.setPopulationSize}
                step={10}
                value={sim.populationSize}
              />
              <p className="mt-1 text-xs text-text-muted">
                Smaller populations = faster drift
              </p>
            </div>

            <div>
              <Label htmlFor="num-alleles">
                Number of Alleles: {sim.numAlleles}
              </Label>
              <RangeSlider
                disabled={sim.isRunning}
                id="num-alleles"
                max={5}
                min={2}
                onChange={sim.handleAllelesChange}
                value={sim.numAlleles}
              />
            </div>

            <div>
              <Label htmlFor="simulation-speed">Speed: {sim.speed}ms</Label>
              <RangeSlider
                id="simulation-speed"
                max={500}
                min={50}
                onChange={sim.setSpeed}
                step={50}
                value={sim.speed}
              />
            </div>

            <SimulationControls
              isRunning={sim.isRunning}
              onReset={sim.reset}
              onStep={sim.step}
              onToggle={sim.toggle}
            />
          </div>

          <AlleleFrequencies
            alleles={sim.population.alleles}
            generation={sim.population.generation}
          />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Allele Frequency Over Time
          </h2>

          <div className="relative">
            <canvas
              className="w-full rounded-lg border border-border bg-surface"
              height={300}
              ref={chartRef}
              width={600}
            />
            <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-2 text-xs text-text-muted">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
          </div>

          <FixationAlert
            fixedAllele={sim.fixedAllele}
            generation={sim.population.generation}
            lostAlleles={sim.lostAlleles}
          />
        </Card>
      </div>

      <EducationalContent />
    </PageContainer>
  );
}
