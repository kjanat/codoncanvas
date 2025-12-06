import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Card } from "@/components/Card";
import { ErrorAlert } from "@/components/ErrorAlert";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { useTheme } from "@/contexts";
import { Canvas2DRenderer } from "@/core";
import { CodonLexer } from "@/core/lexer";
import { CodonVM } from "@/core/vm";
import { examples } from "@/data/examples";
import { GifExporter } from "@/exporters/gif-exporter";
import {
  TimelineControls,
  useTimelinePlayer,
  VMStatePanel,
} from "@/pages/demos/timeline";
import type { CodonToken } from "@/types/genetics";
import { CODON_MAP } from "@/types/genetics";
import { Opcode } from "@/types/vm";

/**
 * Calculate the safe slice end index that doesn't cut PUSH+literal pairs.
 * PUSH is a 2-token instruction (opcode + numeric literal).
 * See: https://github.com/kjanat/codoncanvas/issues/5
 */
function getSafeSliceEnd(tokens: CodonToken[], stepIndex: number): number {
  let sliceEnd = stepIndex + 1;
  if (sliceEnd <= tokens.length) {
    const lastToken = tokens[sliceEnd - 1];
    const opcode = CODON_MAP[lastToken.text];
    if (opcode === Opcode.PUSH && sliceEnd < tokens.length) {
      sliceEnd++;
    }
  }
  return sliceEnd;
}

/**
 * Render a single frame for GIF export at the given step.
 */
function renderFrame(
  tokens: CodonToken[],
  stepIndex: number,
  width: number,
  height: number,
  isDark: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const renderer = new Canvas2DRenderer(canvas);
  renderer.setColor(0, 0, isDark ? 100 : 0);
  const vm = new CodonVM(renderer);

  const sliceEnd = getSafeSliceEnd(tokens, stepIndex);

  try {
    vm.run(tokens.slice(0, sliceEnd));
  } catch (err) {
    throw new Error(
      `GIF export failed at step ${stepIndex}: ${(err as Error).message}`,
    );
  }

  return canvas;
}

function TimelineDemoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const player = useTimelinePlayer({ canvasRef });

  if (
    player.genome === "ATG GAA AAT GGA TAA" &&
    examples.spiralPattern?.genome
  ) {
    player.setGenome(examples.spiralPattern.genome);
  }

  const handleExportGif = async () => {
    if (!canvasRef.current || player.snapshots.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const exporter = new GifExporter({
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        fps: 4,
        quality: 10,
        repeat: 0,
      });

      const lexer = new CodonLexer();
      const tokens = lexer.tokenize(player.genome);
      const { width, height } = canvasRef.current;

      const frames = player.snapshots.map((_, i) =>
        renderFrame(tokens, i, width, height, isDark),
      );

      const blob = await exporter.exportFrames(frames, (progress) => {
        setExportProgress(progress.percent);
      });

      exporter.downloadGif(blob, "codoncanvas-timeline.gif");
    } catch (err) {
      console.error("GIF export failed:", err);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        subtitle="Step through execution like a ribosome translating mRNA"
        title="Timeline Scrubber"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text">Genome</h2>
          <textarea
            className="mb-4 w-full rounded-lg border border-border bg-surface-alt p-3 font-mono text-sm text-dark-text"
            onChange={(e) => player.setGenome(e.target.value)}
            rows={6}
            spellCheck={false}
            value={player.genome}
          />
          <button
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            onClick={player.runAndCapture}
            type="button"
          >
            Run & Capture Timeline
          </button>
          {player.error && (
            <ErrorAlert className="mt-4">{player.error}</ErrorAlert>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text">Output</h2>
          <div className="flex justify-center rounded-lg bg-surface-alt p-4">
            <canvas
              className="rounded-lg border border-dark-border"
              height={300}
              ref={canvasRef}
              width={300}
            />
          </div>
          {player.snapshots.length > 0 && (
            <div className="mt-4 text-center text-sm text-text-muted">
              Step {player.currentStep + 1} of {player.snapshots.length}
            </div>
          )}
        </Card>

        <VMStatePanel snapshot={player.currentSnapshot} />
      </div>

      {player.snapshots.length > 0 && (
        <TimelineControls
          currentStep={player.currentStep}
          exportProgress={exportProgress}
          isExporting={isExporting}
          isPlaying={player.isPlaying}
          onExportGif={handleExportGif}
          onPlayPause={player.handlePlayPause}
          onReset={player.reset}
          onSpeedChange={player.setPlaybackSpeed}
          onStepBack={player.stepBack}
          onStepChange={(step) => {
            player.setCurrentStep(step);
          }}
          onStepForward={player.stepForward}
          playbackSpeed={player.playbackSpeed}
          totalSteps={player.snapshots.length}
        />
      )}
    </PageContainer>
  );
}

export const Route = createFileRoute("/demos/timeline")({
  component: TimelineDemoPage,
});
