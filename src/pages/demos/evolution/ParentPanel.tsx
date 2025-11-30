import { Card } from "@/components/Card";
import { useRenderGenome } from "@/hooks/useRenderGenome";

interface ParentPanelProps {
  genome: string;
  onGenomeChange: (genome: string) => void;
  onGenerateCandidates: () => void;
}

export function ParentPanel({
  genome,
  onGenomeChange,
  onGenerateCandidates,
}: ParentPanelProps) {
  const { render } = useRenderGenome();

  // Render parent genome when canvas is available
  const handleCanvasRef = (el: HTMLCanvasElement | null) => {
    if (el) {
      render(genome, el);
    }
  };

  return (
    <Card className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Current Parent</h2>
        <button
          className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
          onClick={onGenerateCandidates}
          type="button"
        >
          Generate Offspring
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <textarea
            className="w-full rounded-lg border border-border bg-dark-bg p-3 font-mono text-sm text-dark-text"
            onChange={(e) => onGenomeChange(e.target.value)}
            rows={4}
            spellCheck={false}
            value={genome}
          />
        </div>

        <div className="flex justify-center">
          <canvas
            className="rounded-lg border border-border bg-white"
            height={200}
            ref={handleCanvasRef}
            width={200}
          />
        </div>
      </div>
    </Card>
  );
}
