import { useEffect, useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import { initPopulation, sampleWithReplacement } from "./simulation";
import type { PopulationState } from "./types";

interface UsePopulationSimulationOptions {
  initialPopulationSize?: number;
  initialNumAlleles?: number;
  initialSpeed?: number;
}

export function usePopulationSimulation(
  options: UsePopulationSimulationOptions = {},
) {
  const {
    initialPopulationSize = 100,
    initialNumAlleles = 3,
    initialSpeed = 200,
  } = options;

  const [populationSize, setPopulationSize] = useState(initialPopulationSize);
  const [numAlleles, setNumAlleles] = useState(initialNumAlleles);
  const [speed, setSpeed] = useState(initialSpeed);
  const [population, setPopulation] = useState<PopulationState>(() =>
    initPopulation(initialNumAlleles),
  );

  const advanceGeneration = () => {
    setPopulation((prev) => {
      const activeAlleles = prev.alleles.filter((a) => a.frequency > 0);
      if (activeAlleles.length <= 1) {
        return prev;
      }

      const newAlleles = sampleWithReplacement(prev.alleles, populationSize);
      const newGen = prev.generation + 1;

      return {
        generation: newGen,
        alleles: newAlleles,
        history: [
          ...prev.history,
          {
            generation: newGen,
            frequencies: newAlleles.map((a) => a.frequency),
          },
        ],
      };
    });
  };

  const shouldStop = () => {
    const activeAlleles = population.alleles.filter((a) => a.frequency > 0);
    return activeAlleles.length <= 1;
  };

  const simulation = useSimulation({
    initialSpeed: speed,
    onStep: advanceGeneration,
    shouldStop,
  });

  // Sync speed with simulation
  useEffect(() => {
    simulation.setSpeed(speed);
  }, [speed, simulation.setSpeed]);

  const reset = () => {
    simulation.reset();
    setPopulation(initPopulation(numAlleles));
  };

  const handleAllelesChange = (n: number) => {
    setNumAlleles(n);
    simulation.pause();
    setPopulation(initPopulation(n));
  };

  // Check for fixation
  const fixedAllele = population.alleles.find((a) => a.frequency >= 0.999);
  const lostAlleles = population.alleles.filter((a) => a.frequency < 0.001);

  return {
    // State
    population,
    populationSize,
    numAlleles,
    speed,
    isRunning: simulation.state.isRunning,
    fixedAllele,
    lostAlleles,

    // Actions
    setPopulationSize,
    setSpeed,
    handleAllelesChange,
    step: simulation.step,
    toggle: simulation.toggle,
    reset,
  };
}
