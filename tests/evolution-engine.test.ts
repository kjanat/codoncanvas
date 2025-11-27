/**
 * Tests for Evolution Engine
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { EvolutionEngine } from "@/evolution-engine";

describe("EvolutionEngine", () => {
  const testGenome = "ATG GAA AAT GGA TAA";
  let engine: EvolutionEngine;

  beforeEach(() => {
    engine = new EvolutionEngine(testGenome);
  });

  describe("Constructor", () => {
    test("creates engine with default options", () => {
      expect(engine.getCurrentGeneration()).toBe(0);
      expect(engine.getCurrentParent()).toBe(testGenome);
      expect(engine.getHistory()).toEqual([]);
    });

    test("accepts custom candidates per generation", () => {
      const customEngine = new EvolutionEngine(testGenome, {
        candidatesPerGeneration: 4,
      });
      const candidates = customEngine.generateGeneration();
      expect(candidates.length).toBe(4);
    });

    test("accepts custom mutation types", () => {
      const customEngine = new EvolutionEngine(testGenome, {
        mutationTypes: ["silent", "missense"],
      });
      const candidates = customEngine.generateGeneration();
      expect(candidates.length).toBe(6); // default count
      // All mutations should be silent or missense
      candidates.forEach((candidate) => {
        if (candidate.mutation) {
          expect(["silent", "missense"]).toContain(candidate.mutation.type);
        }
      });
    });
  });

  describe("generateGeneration", () => {
    test("generates correct number of candidates", () => {
      const candidates = engine.generateGeneration();
      expect(candidates.length).toBe(6);
    });

    test("assigns unique IDs to candidates", () => {
      const candidates = engine.generateGeneration();
      const ids = candidates.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(candidates.length);
    });

    test("sets correct generation number", () => {
      const candidates = engine.generateGeneration();
      candidates.forEach((candidate) => {
        expect(candidate.generation).toBe(1);
      });
    });

    test("sets parent genome correctly", () => {
      const candidates = engine.generateGeneration();
      candidates.forEach((candidate) => {
        expect(candidate.parent).toBe(testGenome);
      });
    });

    test("includes mutation information", () => {
      const candidates = engine.generateGeneration();
      candidates.forEach((candidate) => {
        expect(candidate.mutation).toBeDefined();
        expect(candidate.mutation?.type).toBeDefined();
        expect(candidate.mutation?.description).toBeDefined();
      });
    });

    test("records generation in history", () => {
      engine.generateGeneration();
      const history = engine.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].number).toBe(1);
      expect(history[0].parent).toBe(testGenome);
    });

    test("generates multiple generations sequentially", () => {
      // Generate first generation
      const gen1 = engine.generateGeneration();
      expect(gen1[0].generation).toBe(1);

      // Select a candidate
      engine.selectCandidate(gen1[0].id);

      // Generate second generation
      const gen2 = engine.generateGeneration();
      expect(gen2[0].generation).toBe(2);
      expect(gen2[0].parent).toBe(gen1[0].genome);
    });
  });

  describe("selectCandidate", () => {
    test("selects valid candidate", () => {
      const candidates = engine.generateGeneration();
      const candidateId = candidates[0].id;

      engine.selectCandidate(candidateId);

      const history = engine.getHistory();
      expect(history[0].selected).toBeDefined();
      expect(history[0].selected?.id).toBe(candidateId);
    });

    test("updates current parent after selection", () => {
      const candidates = engine.generateGeneration();
      const selected = candidates[0];

      engine.selectCandidate(selected.id);

      expect(engine.getCurrentParent()).toBe(selected.genome);
    });

    test("increments generation after selection", () => {
      const candidates = engine.generateGeneration();
      expect(engine.getCurrentGeneration()).toBe(0);

      engine.selectCandidate(candidates[0].id);
      expect(engine.getCurrentGeneration()).toBe(1);
    });

    test("throws error for invalid candidate ID", () => {
      engine.generateGeneration();
      expect(() => {
        engine.selectCandidate("invalid-id");
      }).toThrow();
    });

    test("throws error when no generation to select from", () => {
      expect(() => {
        engine.selectCandidate("any-id");
      }).toThrow("No generation to select from");
    });
  });

  describe("getLineage", () => {
    test("returns initial genome for fresh engine", () => {
      const lineage = engine.getLineage();
      expect(lineage).toEqual([testGenome]);
    });

    test("tracks lineage through selections", () => {
      // Gen 1
      const gen1 = engine.generateGeneration();
      engine.selectCandidate(gen1[0].id);

      // Gen 2
      const gen2 = engine.generateGeneration();
      engine.selectCandidate(gen2[1].id);

      const lineage = engine.getLineage();
      expect(lineage.length).toBe(3);
      expect(lineage[0]).toBe(testGenome);
      expect(lineage[1]).toBe(gen1[0].genome);
      expect(lineage[2]).toBe(gen2[1].genome);
    });
  });

  describe("reset", () => {
    test("resets engine to initial state", () => {
      // Make some progress
      const gen1 = engine.generateGeneration();
      engine.selectCandidate(gen1[0].id);
      engine.generateGeneration();

      // Reset
      const newGenome = "ATG GGA TAA";
      engine.reset(newGenome);

      expect(engine.getCurrentGeneration()).toBe(0);
      expect(engine.getCurrentParent()).toBe(newGenome);
      expect(engine.getHistory()).toEqual([]);
    });
  });

  describe("exportSession", () => {
    test("exports complete session data", () => {
      const gen1 = engine.generateGeneration();
      engine.selectCandidate(gen1[0].id);

      const session = engine.exportSession();

      expect(session.initialGenome).toBe(testGenome);
      expect(session.currentGeneration).toBe(1);
      expect(session.history.length).toBe(1);
      expect(session.lineage.length).toBe(2);
    });

    test("exports lineage in correct order", () => {
      const gen1 = engine.generateGeneration();
      engine.selectCandidate(gen1[0].id);
      const gen2 = engine.generateGeneration();
      engine.selectCandidate(gen2[0].id);

      const session = engine.exportSession();

      expect(session.lineage[0]).toBe(testGenome);
      expect(session.lineage[1]).toBe(gen1[0].genome);
      expect(session.lineage[2]).toBe(gen2[0].genome);
    });
  });

  describe("Evolution workflow", () => {
    test("completes full evolution cycle", () => {
      // Generation 1
      const gen1 = engine.generateGeneration();
      expect(gen1.length).toBe(6);
      expect(engine.getCurrentGeneration()).toBe(0);

      // Select fittest from gen 1
      engine.selectCandidate(gen1[2].id);
      expect(engine.getCurrentGeneration()).toBe(1);
      expect(engine.getCurrentParent()).toBe(gen1[2].genome);

      // Generation 2
      const gen2 = engine.generateGeneration();
      expect(gen2.length).toBe(6);
      expect(gen2[0].parent).toBe(gen1[2].genome);

      // Select fittest from gen 2
      engine.selectCandidate(gen2[4].id);
      expect(engine.getCurrentGeneration()).toBe(2);

      // Verify history
      const history = engine.getHistory();
      expect(history.length).toBe(2);
      expect(history[0].selected?.id).toBe(gen1[2].id);
      expect(history[1].selected?.id).toBe(gen2[4].id);

      // Verify lineage
      const lineage = engine.getLineage();
      expect(lineage.length).toBe(3);
      expect(lineage[0]).toBe(testGenome);
      expect(lineage[1]).toBe(gen1[2].genome);
      expect(lineage[2]).toBe(gen2[4].genome);
    });
  });
});
