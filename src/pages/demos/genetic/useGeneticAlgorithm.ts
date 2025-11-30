import { useRef, useState } from "react";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import { useSimulation } from "@/hooks/useSimulation";
import { DEFAULT_POPULATION_SIZE } from "./constants";
import { buildNextGeneration, createInitialPopulation } from "./evolution";
import { evaluateFitness } from "./fitness";
import type { FitnessType, GAState, Individual } from "./types";

interface UseGeneticAlgorithmOptions {
  initialPopulationSize?: number;
  initialMutationRate?: number;
  initialFitnessType?: FitnessType;
}

export function useGeneticAlgorithm(options: UseGeneticAlgorithmOptions = {}) {
  const {
    initialPopulationSize = DEFAULT_POPULATION_SIZE,
    initialMutationRate = 0.3,
    initialFitnessType = "coverage",
  } = options;

  const [fitnessType, setFitnessType] =
    useState<FitnessType>(initialFitnessType);
  const [populationSize, setPopulationSize] = useState(initialPopulationSize);
  const [mutationRate, setMutationRate] = useState(initialMutationRate);
  const [state, setState] = useState<GAState>(() => ({
    generation: 0,
    population: createInitialPopulation(initialPopulationSize),
    bestFitness: 0,
    avgFitness: 0,
    history: [],
  }));
  const [selectedIndividual, setSelectedIndividual] =
    useState<Individual | null>(null);

  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);
  const { render } = useRenderGenome();

  const renderGenome = (genome: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    render(genome, canvas);
  };

  const getOffscreenCanvas = (): HTMLCanvasElement => {
    if (!offscreenCanvas.current) {
      offscreenCanvas.current = document.createElement("canvas");
      offscreenCanvas.current.width = 100;
      offscreenCanvas.current.height = 100;
    }
    return offscreenCanvas.current;
  };

  const evolveGeneration = () => {
    setState((prev) => {
      const canvas = getOffscreenCanvas();
      const evaluated = prev.population
        .map((ind) => {
          renderGenome(ind.genome, canvas);
          return {
            ...ind,
            fitness: evaluateFitness(fitnessType, ind.genome, canvas),
          };
        })
        .sort((a, b) => b.fitness - a.fitness);

      const bestFitness = evaluated[0]?.fitness ?? 0;
      const avgFitness =
        evaluated.reduce((s, i) => s + i.fitness, 0) / evaluated.length;

      const nextGen = buildNextGeneration(
        evaluated,
        prev.generation,
        populationSize,
        mutationRate,
      );

      return {
        generation: prev.generation + 1,
        population: nextGen,
        bestFitness,
        avgFitness,
        history: [
          ...prev.history,
          { gen: prev.generation, best: bestFitness, avg: avgFitness },
        ],
      };
    });
  };

  const simulation = useSimulation({
    initialSpeed: 500,
    onStep: evolveGeneration,
  });

  const reset = () => {
    simulation.reset();
    setState({
      generation: 0,
      population: createInitialPopulation(populationSize),
      bestFitness: 0,
      avgFitness: 0,
      history: [],
    });
    setSelectedIndividual(null);
  };

  return {
    // State
    state,
    fitnessType,
    populationSize,
    mutationRate,
    selectedIndividual,
    isRunning: simulation.state.isRunning,

    // Actions
    setFitnessType,
    setPopulationSize,
    setMutationRate,
    setSelectedIndividual,
    step: simulation.step,
    toggle: simulation.toggle,
    reset,
  };
}
