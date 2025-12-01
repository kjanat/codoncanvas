import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/Card";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import {
  AnswerSelection,
  DifficultySelector,
  GenomeCanvas,
  MutationReference,
  ProgressPanel,
  ResultFeedback,
  useAssessmentChallenge,
} from "@/pages/demos/assessment";

function AssessmentDemoPage() {
  const assessment = useAssessmentChallenge();

  return (
    <PageContainer>
      <PageHeader
        subtitle="Test your understanding with mutation identification challenges"
        title="Assessment Mode"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-text">Settings</h2>
            <div className="space-y-4">
              <DifficultySelector
                difficulty={assessment.difficulty}
                onSelect={assessment.setDifficulty}
              />
              <button
                className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
                onClick={assessment.generateNewChallenge}
                type="button"
              >
                {assessment.challenge ? "New Challenge" : "Start Challenge"}
              </button>
            </div>
          </Card>

          {assessment.progress && (
            <ProgressPanel
              onReset={assessment.resetProgress}
              progress={assessment.progress}
            />
          )}
        </div>

        <div className="space-y-6 lg:col-span-3">
          {!assessment.challenge ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
              <div className="text-center">
                <p className="text-lg text-text-muted">
                  Click "Start Challenge" to begin
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Identify mutation types by comparing genome outputs
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <GenomeCanvas
                  canvasRef={assessment.originalCanvasRef}
                  genome={assessment.challenge.original}
                  title="Original"
                />
                <GenomeCanvas
                  canvasRef={assessment.mutatedCanvasRef}
                  genome={assessment.challenge.mutated}
                  title="Mutated"
                />
              </div>

              <Card>
                <h3 className="mb-4 font-semibold text-text">
                  What type of mutation occurred?
                </h3>
                {!assessment.result ? (
                  <AnswerSelection
                    availableTypes={assessment.availableTypes}
                    hint={assessment.challenge.hint}
                    onSelect={assessment.setSelectedAnswer}
                    onSubmit={assessment.submitAnswer}
                    onToggleHint={assessment.toggleHint}
                    selectedAnswer={assessment.selectedAnswer}
                    showHint={assessment.showHint}
                  />
                ) : (
                  <ResultFeedback
                    onNext={assessment.generateNewChallenge}
                    result={assessment.result}
                  />
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      <MutationReference />
    </PageContainer>
  );
}

export const Route = createFileRoute("/demos/assessment")({
  component: AssessmentDemoPage,
});
