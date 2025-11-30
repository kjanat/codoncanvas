import { Card } from "@/components/Card";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import {
  EducationalContent,
  FitnessChart,
  ParameterControls,
  PopulationGrid,
  SelectedGenome,
  useGeneticAlgorithm,
} from "./genetic";

export default function GeneticDemo() {
  const ga = useGeneticAlgorithm();

  return (
    <PageContainer>
      <PageHeader
        subtitle="Automated evolution with fitness functions"
        title="Genetic Algorithm"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <ParameterControls
          fitnessType={ga.fitnessType}
          isRunning={ga.isRunning}
          mutationRate={ga.mutationRate}
          onFitnessTypeChange={ga.setFitnessType}
          onMutationRateChange={ga.setMutationRate}
          onPopulationSizeChange={ga.setPopulationSize}
          onReset={ga.reset}
          onStep={ga.step}
          onToggle={ga.toggle}
          populationSize={ga.populationSize}
          state={ga.state}
        />

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-text">Population</h2>
          <PopulationGrid
            onSelect={ga.setSelectedIndividual}
            population={ga.state.population}
            selectedId={ga.selectedIndividual?.id ?? null}
          />
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-text">
              Fitness Over Time
            </h2>
            <FitnessChart history={ga.state.history} />
          </Card>

          {ga.selectedIndividual && (
            <SelectedGenome individual={ga.selectedIndividual} />
          )}
        </div>
      </div>

      <EducationalContent />
    </PageContainer>
  );
}
