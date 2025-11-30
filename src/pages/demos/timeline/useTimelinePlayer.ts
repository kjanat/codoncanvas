import { useEffect, useRef, useState } from "react";
import { Canvas2DRenderer } from "@/core";
import { CodonLexer } from "@/core/lexer";
import { CodonVM } from "@/core/vm";
import type { VMState } from "@/types";

interface UseTimelinePlayerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useTimelinePlayer({ canvasRef }: UseTimelinePlayerOptions) {
  const [genome, setGenome] = useState("ATG GAA AAT GGA TAA");
  const [snapshots, setSnapshots] = useState<VMState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  // Store genome in ref for render function to avoid stale closures
  const genomeRef = useRef(genome);
  genomeRef.current = genome;

  const runAndCapture = () => {
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
  };

  // Re-render when step changes
  useEffect(() => {
    if (!canvasRef.current || snapshots.length === 0) return;

    try {
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize(genomeRef.current);
      const tokensToRun = tokens.slice(0, currentStep + 1);
      const renderer = new Canvas2DRenderer(canvasRef.current);
      const vm = new CodonVM(renderer);
      vm.run(tokensToRun);
    } catch {
      console.warn(`Failed to render at step ${currentStep}`);
    }
  }, [currentStep, snapshots, canvasRef]);

  // Playback control
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentStep((s) => {
        if (s >= snapshots.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, playbackSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, snapshots.length, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentStep >= snapshots.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const stepBack = () => setCurrentStep((s) => Math.max(0, s - 1));
  const stepForward = () =>
    setCurrentStep((s) => Math.min(snapshots.length - 1, s + 1));

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return {
    // State
    genome,
    snapshots,
    currentStep,
    isPlaying,
    playbackSpeed,
    error,
    currentSnapshot: snapshots[currentStep] ?? null,

    // Actions
    setGenome,
    setCurrentStep,
    setPlaybackSpeed,
    runAndCapture,
    handlePlayPause,
    stepBack,
    stepForward,
    reset,
  };
}
