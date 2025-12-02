import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

interface SimulationPanelProps {
  onGenomeExecution: () => void;
  onShapeDraw: () => void;
  onMutation: () => void;
  onChallengeCorrect: () => void;
  onChallengeIncorrect: () => void;
  onEvolution: () => void;
  onReset: () => void;
}

export function SimulationPanel({
  onGenomeExecution,
  onShapeDraw,
  onMutation,
  onChallengeCorrect,
  onChallengeIncorrect,
  onEvolution,
  onReset,
}: SimulationPanelProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-text">Simulate Actions</h2>
      <p className="mb-4 text-sm text-text-muted">
        Test the achievement system by simulating user actions:
      </p>

      <div className="space-y-2">
        <Button
          className="justify-start text-left"
          fullWidth
          onClick={onGenomeExecution}
          variant="secondary"
        >
          Execute Genome
        </Button>
        <Button
          className="justify-start text-left"
          fullWidth
          onClick={onShapeDraw}
          variant="secondary"
        >
          Draw Shape
        </Button>
        <Button
          className="justify-start text-left"
          fullWidth
          onClick={onMutation}
          variant="secondary"
        >
          Apply Mutation
        </Button>
        <Button
          className="justify-start text-left"
          fullWidth
          onClick={onChallengeCorrect}
          variant="secondary"
        >
          Correct Challenge
        </Button>
        <Button
          className="justify-start text-left"
          fullWidth
          onClick={onChallengeIncorrect}
          variant="secondary"
        >
          Incorrect Challenge
        </Button>
        <Button
          className="justify-start text-left"
          fullWidth
          onClick={onEvolution}
          variant="secondary"
        >
          Evolution Generation
        </Button>
      </div>

      <hr className="my-4 border-border" />

      <Button fullWidth onClick={onReset} variant="danger">
        Reset All Progress
      </Button>
    </Card>
  );
}
