import { useCallback, useEffect, useRef, useState } from "react";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import { examples } from "@/data/examples";
import { GifExporter } from "@/exporters/gif-exporter";
import type { VMState } from "@/types";

export default function TimelineDemo() {
  const [genome, setGenome] = useState(
    examples.spiralPattern?.genome || "ATG GAA AAT GGA TAA",
  );
  const [snapshots, setSnapshots] = useState<VMState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Run genome and capture all state snapshots
  const runAndCapture = useCallback(() => {
    if (!canvasRef.current) return;

    try {
      setError(null);
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize(genome);
      const renderer = new Canvas2DRenderer(canvasRef.current);
      const vm = new CodonVM(renderer);
      const states = vm.run(tokens);
      setSnapshots(states);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
      setSnapshots([]);
    }
  }, [genome]);

  // Render up to current step
  const renderToStep = useCallback(
    (step: number) => {
      if (!canvasRef.current || snapshots.length === 0) return;

      try {
        const lexer = new CodonLexer();
        const tokens = lexer.tokenize(genome);
        // Only take tokens up to current step
        const tokensToRun = tokens.slice(0, step + 1);

        const renderer = new Canvas2DRenderer(canvasRef.current);
        const vm = new CodonVM(renderer);
        vm.run(tokensToRun);
      } catch {
        // Ignore render errors during stepping
      }
    },
    [genome, snapshots.length],
  );

  // Re-render when step changes
  useEffect(() => {
    renderToStep(currentStep);
  }, [currentStep, renderToStep]);

  // Playback control
  useEffect(() => {
    if (isPlaying && currentStep < snapshots.length - 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep((s) => {
          if (s >= snapshots.length - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, playbackSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, snapshots.length, playbackSpeed, currentStep]);

  // Stop playing when reaching the end
  useEffect(() => {
    if (currentStep >= snapshots.length - 1 && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, snapshots.length, isPlaying]);

  const currentSnapshot = snapshots[currentStep];

  const handlePlayPause = () => {
    if (currentStep >= snapshots.length - 1) {
      // Reset to beginning if at end
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Export timeline as GIF
  const handleExportGif = useCallback(async () => {
    if (!canvasRef.current || snapshots.length === 0) return;

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

      // Capture frames by rendering each step
      const frames: HTMLCanvasElement[] = [];
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize(genome);

      for (let i = 0; i < snapshots.length; i++) {
        // Re-render canvas at this step
        const canvas = document.createElement("canvas");
        canvas.width = canvasRef.current.width;
        canvas.height = canvasRef.current.height;
        const renderer = new Canvas2DRenderer(canvas);
        const vm = new CodonVM(renderer);
        vm.run(tokens.slice(0, i + 1));
        frames.push(canvas);
      }

      const blob = await exporter.exportFrames(frames, (progress) => {
        setExportProgress(progress.percent);
      });

      exporter.downloadGif(blob, "codoncanvas-timeline.gif");
    } catch (err) {
      setError(err instanceof Error ? err.message : "GIF export failed");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [genome, snapshots]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">Timeline Scrubber</h1>
        <p className="text-text-muted">
          Step through execution like a ribosome translating mRNA
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Genome</h2>
          <textarea
            className="mb-4 w-full rounded-lg border border-border bg-dark-bg p-3 font-mono text-sm text-dark-text"
            onChange={(e) => setGenome(e.target.value)}
            rows={6}
            spellCheck={false}
            value={genome}
          />
          <button
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            onClick={runAndCapture}
            type="button"
          >
            Run & Capture Timeline
          </button>

          {error && (
            <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">Output</h2>
          <div className="flex justify-center">
            <canvas
              className="rounded-lg border border-border bg-white"
              height={300}
              ref={canvasRef}
              width={300}
            />
          </div>
          {snapshots.length > 0 && (
            <div className="mt-4 text-center text-sm text-text-muted">
              Step {currentStep + 1} of {snapshots.length}
            </div>
          )}
        </div>

        {/* State Panel */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">VM State</h2>
          {currentSnapshot ? (
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Position</span>
                <span className="text-text">
                  ({currentSnapshot.position.x.toFixed(1)},{" "}
                  {currentSnapshot.position.y.toFixed(1)})
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Rotation</span>
                <span className="text-text">
                  {currentSnapshot.rotation.toFixed(1)}deg
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Scale</span>
                <span className="text-text">
                  {currentSnapshot.scale.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Color (HSL)</span>
                <span className="text-text">
                  {currentSnapshot.color.h.toFixed(0)},{" "}
                  {currentSnapshot.color.s.toFixed(0)}%,{" "}
                  {currentSnapshot.color.l.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-text-muted">Instructions</span>
                <span className="text-text">
                  {currentSnapshot.instructionCount}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Stack</span>
                <div className="mt-1 rounded bg-dark-bg p-2 text-dark-text">
                  {currentSnapshot.stack.length > 0
                    ? `[${currentSnapshot.stack.join(", ")}]`
                    : "(empty)"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-text-muted">
              Run genome to see state snapshots
            </div>
          )}
        </div>
      </div>

      {/* Timeline controls */}
      {snapshots.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Reset button */}
            <button
              className="rounded-md p-2 hover:bg-bg-light"
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              title="Reset to start"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>

            {/* Step back */}
            <button
              className="rounded-md p-2 hover:bg-bg-light disabled:opacity-50"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              title="Previous step"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
              onClick={handlePlayPause}
              type="button"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            {/* Step forward */}
            <button
              className="rounded-md p-2 hover:bg-bg-light disabled:opacity-50"
              disabled={currentStep >= snapshots.length - 1}
              onClick={() =>
                setCurrentStep((s) => Math.min(snapshots.length - 1, s + 1))
              }
              title="Next step"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>

            {/* Timeline slider */}
            <input
              className="flex-1"
              max={snapshots.length - 1}
              min={0}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentStep(Number(e.target.value));
              }}
              type="range"
              value={currentStep}
            />

            {/* Speed selector */}
            <select
              className="rounded-md border border-border px-3 py-2 text-sm"
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              value={playbackSpeed}
            >
              <option value={1000}>0.5x</option>
              <option value={500}>1x</option>
              <option value={250}>2x</option>
              <option value={100}>5x</option>
            </select>

            {/* Export GIF button */}
            <button
              className="ml-auto rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-bg-light disabled:opacity-50"
              disabled={isExporting || snapshots.length === 0}
              onClick={handleExportGif}
              title="Export animation as GIF"
              type="button"
            >
              {isExporting ? `Exporting ${exportProgress}%` : "Export GIF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
