import { useEffect, useRef, useState } from "react";
import { getMutationTypesByDifficulty } from "@/data/mutation-types";
import {
  type AssessmentDifficulty,
  AssessmentEngine,
  type AssessmentProgress,
  type AssessmentResult,
  type Challenge,
} from "@/education/assessments/assessment-engine";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import type { MutationType } from "@/types";

export function useAssessmentChallenge() {
  const [engine] = useState(() => new AssessmentEngine());
  const [difficulty, setDifficulty] = useState<AssessmentDifficulty>("easy");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<MutationType | null>(
    null,
  );
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [showHint, setShowHint] = useState(false);

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const mutatedCanvasRef = useRef<HTMLCanvasElement>(null);
  const { render, isDark: _isDark } = useRenderGenome();

  const generateNewChallenge = () => {
    const newChallenge = engine.generateChallenge(difficulty);
    setChallenge(newChallenge);
    setSelectedAnswer(null);
    setResult(null);
    setShowHint(false);
  };

  // Render canvases when challenge or theme changes
  useEffect(() => {
    if (!challenge) return;
    render(challenge.original, originalCanvasRef.current);
    render(challenge.mutated, mutatedCanvasRef.current);
  }, [challenge, render]);

  // Update progress when results change
  useEffect(() => {
    if (results.length > 0) {
      setProgress(engine.calculateProgress(results));
    }
  }, [engine, results]);

  const submitAnswer = () => {
    if (!challenge || !selectedAnswer) return;
    const assessmentResult = engine.scoreResponse(challenge, selectedAnswer);
    setResult(assessmentResult);
    setResults((prev) => [...prev, assessmentResult]);
  };

  const resetProgress = () => {
    setResults([]);
    setProgress(null);
    setChallenge(null);
    setResult(null);
  };

  const toggleHint = () => setShowHint((prev) => !prev);

  const availableTypes = getMutationTypesByDifficulty(difficulty);

  return {
    // State
    difficulty,
    challenge,
    selectedAnswer,
    result,
    progress,
    showHint,
    availableTypes,

    // Refs
    originalCanvasRef,
    mutatedCanvasRef,

    // Actions
    setDifficulty,
    setSelectedAnswer,
    generateNewChallenge,
    submitAnswer,
    resetProgress,
    toggleHint,
  };
}
