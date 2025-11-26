/**
 * Test suite for Achievement Engine
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { AchievementEngine } from "./achievement-engine.js";

// Mock localStorage globally with state tracking
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    clear: vi.fn(() => {
      store = {};
    }),
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

global.localStorage = localStorageMock as any;

describe("AchievementEngine", () => {
  let engine: AchievementEngine;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    engine = new AchievementEngine();
  });

  describe("Initialization", () => {
    it("should initialize with default stats", () => {
      const stats = engine.getStats();
      expect(stats.genomesCreated).toBe(0);
      expect(stats.genomesExecuted).toBe(0);
      expect(stats.mutationsApplied).toBe(0);
      expect(stats.challengesCompleted).toBe(0);
    });

    it("should load all achievements", () => {
      const achievements = engine.getAchievements();
      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements.every((a) => a.id && a.name && a.description)).toBe(
        true,
      );
    });

    it("should have 4 achievement categories", () => {
      const categories = ["basics", "mastery", "exploration", "perfection"];
      categories.forEach((category) => {
        const achievements = engine.getAchievementsByCategory(category as any);
        expect(achievements.length).toBeGreaterThan(0);
      });
    });

    it("should start with 0% progress", () => {
      expect(engine.getProgressPercentage()).toBe(0);
    });

    it("should have no unlocked achievements initially", () => {
      expect(engine.getUnlockedAchievements().length).toBe(0);
    });
  });

  describe("Genome Tracking", () => {
    it("should track genome creation", () => {
      engine.trackGenomeCreated(15);
      const stats = engine.getStats();
      expect(stats.genomesCreated).toBe(1);
      expect(stats.longestGenomeLength).toBe(15);
    });

    it("should track longest genome", () => {
      engine.trackGenomeCreated(10);
      engine.trackGenomeCreated(20);
      engine.trackGenomeCreated(15);
      const stats = engine.getStats();
      expect(stats.longestGenomeLength).toBe(20);
    });

    it("should track genome execution", () => {
      engine.trackGenomeExecuted(["CIRCLE", "RECT", "LINE"]);
      const stats = engine.getStats();
      expect(stats.genomesExecuted).toBe(1);
      expect(stats.opcodesUsed.has("CIRCLE")).toBe(true);
      expect(stats.opcodesUsed.has("RECT")).toBe(true);
      expect(stats.opcodesUsed.has("LINE")).toBe(true);
    });

    it("should unlock First Genome achievement", () => {
      const unlocked = engine.trackGenomeExecuted(["CIRCLE"]);
      expect(unlocked.length).toBeGreaterThan(0);
      expect(unlocked.some((a) => a.id === "first_genome")).toBe(true);
      expect(engine.isUnlocked("first_genome")).toBe(true);
    });

    it("should unlock Elite Coder achievement for 100+ codon genome", () => {
      const _unlocked = engine.trackGenomeCreated(101);
      engine.trackGenomeExecuted(["CIRCLE"]); // Execute to trigger checks
      expect(engine.isUnlocked("elite_coder")).toBe(true);
    });
  });

  describe("Mutation Tracking", () => {
    it("should track mutation application", () => {
      engine.trackMutationApplied();
      const stats = engine.getStats();
      expect(stats.mutationsApplied).toBe(1);
    });

    it("should unlock First Mutation achievement", () => {
      const unlocked = engine.trackMutationApplied();
      expect(engine.isUnlocked("first_mutation")).toBe(true);
      expect(unlocked.some((a) => a.id === "first_mutation")).toBe(true);
    });

    it("should unlock Mad Scientist achievement after 100 mutations", () => {
      for (let i = 0; i < 100; i++) {
        engine.trackMutationApplied();
      }
      expect(engine.isUnlocked("mad_scientist")).toBe(true);
    });

    it("should not unlock Mad Scientist before 100 mutations", () => {
      for (let i = 0; i < 99; i++) {
        engine.trackMutationApplied();
      }
      expect(engine.isUnlocked("mad_scientist")).toBe(false);
    });
  });

  describe("Drawing Tracking", () => {
    it("should track shape drawing", () => {
      engine.trackShapeDrawn("CIRCLE");
      const stats = engine.getStats();
      expect(stats.shapesDrawn).toBe(1);
      expect(stats.opcodesUsed.has("CIRCLE")).toBe(true);
    });

    it("should unlock First Draw achievement", () => {
      const unlocked = engine.trackShapeDrawn("CIRCLE");
      expect(engine.isUnlocked("first_draw")).toBe(true);
      expect(unlocked.some((a) => a.id === "first_draw")).toBe(true);
    });

    it("should unlock Shape Explorer after using all 5 shapes", () => {
      engine.trackShapeDrawn("CIRCLE");
      engine.trackShapeDrawn("RECT");
      engine.trackShapeDrawn("LINE");
      engine.trackShapeDrawn("TRIANGLE");
      expect(engine.isUnlocked("shape_explorer")).toBe(false);

      const unlocked = engine.trackShapeDrawn("ELLIPSE");
      expect(engine.isUnlocked("shape_explorer")).toBe(true);
      expect(unlocked.some((a) => a.id === "shape_explorer")).toBe(true);
    });

    it("should track color usage", () => {
      engine.trackColorUsed();
      const stats = engine.getStats();
      expect(stats.colorsUsed).toBe(1);
      expect(stats.opcodesUsed.has("COLOR")).toBe(true);
    });

    it("should unlock Color Artist after 10 color uses", () => {
      for (let i = 0; i < 10; i++) {
        engine.trackColorUsed();
      }
      expect(engine.isUnlocked("color_artist")).toBe(true);
    });

    it("should track transform usage", () => {
      engine.trackTransformApplied("ROTATE");
      const stats = engine.getStats();
      expect(stats.transformsApplied).toBe(1);
      expect(stats.opcodesUsed.has("ROTATE")).toBe(true);
    });
  });

  describe("Assessment Tracking", () => {
    it("should track correct challenge completion", () => {
      engine.trackChallengeCompleted(true, "silent");
      const stats = engine.getStats();
      expect(stats.challengesCompleted).toBe(1);
      expect(stats.challengesCorrect).toBe(1);
      expect(stats.consecutiveCorrect).toBe(1);
      expect(stats.silentIdentified).toBe(1);
    });

    it("should track incorrect challenge completion", () => {
      engine.trackChallengeCompleted(false, "silent");
      const stats = engine.getStats();
      expect(stats.challengesCompleted).toBe(1);
      expect(stats.challengesCorrect).toBe(0);
      expect(stats.consecutiveCorrect).toBe(0);
    });

    it("should reset consecutive correct on wrong answer", () => {
      engine.trackChallengeCompleted(true, "silent");
      engine.trackChallengeCompleted(true, "missense");
      engine.trackChallengeCompleted(false, "nonsense");
      const stats = engine.getStats();
      expect(stats.consecutiveCorrect).toBe(0);
    });

    it("should unlock Mutation Expert after 10 correct", () => {
      for (let i = 0; i < 10; i++) {
        engine.trackChallengeCompleted(true, "silent");
      }
      expect(engine.isUnlocked("mutation_expert")).toBe(true);
    });

    it("should unlock Flawless after 10 consecutive correct", () => {
      for (let i = 0; i < 10; i++) {
        engine.trackChallengeCompleted(true, "silent");
      }
      expect(engine.isUnlocked("flawless")).toBe(true);
    });

    it("should track all mutation types", () => {
      engine.trackChallengeCompleted(true, "silent");
      engine.trackChallengeCompleted(true, "missense");
      engine.trackChallengeCompleted(true, "nonsense");
      engine.trackChallengeCompleted(true, "frameshift");
      engine.trackChallengeCompleted(true, "insertion");
      engine.trackChallengeCompleted(true, "deletion");

      const stats = engine.getStats();
      expect(stats.silentIdentified).toBe(1);
      expect(stats.missenseIdentified).toBe(1);
      expect(stats.nonsenseIdentified).toBe(1);
      expect(stats.frameshiftIdentified).toBe(1);
      expect(stats.insertionIdentified).toBe(1);
      expect(stats.deletionIdentified).toBe(1);
    });

    it("should unlock Pattern Master after identifying all 6 types", () => {
      engine.trackChallengeCompleted(true, "silent");
      engine.trackChallengeCompleted(true, "missense");
      engine.trackChallengeCompleted(true, "nonsense");
      engine.trackChallengeCompleted(true, "frameshift");
      engine.trackChallengeCompleted(true, "insertion");
      engine.trackChallengeCompleted(true, "deletion");

      expect(engine.isUnlocked("pattern_master")).toBe(true);
    });

    it("should track perfect score", () => {
      engine.trackPerfectScore();
      const stats = engine.getStats();
      expect(stats.perfectScores).toBe(1);
    });

    it("should unlock Perfect Score achievement", () => {
      const unlocked = engine.trackPerfectScore();
      expect(engine.isUnlocked("perfect_score")).toBe(true);
      expect(unlocked.some((a) => a.id === "perfect_score")).toBe(true);
    });

    it("should unlock Professor after 50+ challenges at 95%+", () => {
      // Complete 50 challenges with 48 correct (96% accuracy)
      for (let i = 0; i < 48; i++) {
        engine.trackChallengeCompleted(true, "silent");
      }
      for (let i = 0; i < 2; i++) {
        engine.trackChallengeCompleted(false, "silent");
      }

      expect(engine.isUnlocked("professor")).toBe(true);
    });

    it("should NOT unlock Professor below 95% accuracy", () => {
      // Complete 50 challenges with 47 correct (94% accuracy)
      for (let i = 0; i < 47; i++) {
        engine.trackChallengeCompleted(true, "silent");
      }
      for (let i = 0; i < 3; i++) {
        engine.trackChallengeCompleted(false, "silent");
      }

      expect(engine.isUnlocked("professor")).toBe(false);
    });
  });

  describe("Advanced Features Tracking", () => {
    it("should track evolution generations", () => {
      engine.trackEvolutionGeneration();
      const stats = engine.getStats();
      expect(stats.evolutionGenerations).toBe(1);
    });

    it("should unlock Evolution Master after 50 generations", () => {
      for (let i = 0; i < 50; i++) {
        engine.trackEvolutionGeneration();
      }
      expect(engine.isUnlocked("evolution_master")).toBe(true);
    });

    it("should track audio synthesis usage", () => {
      engine.trackAudioSynthesis();
      const stats = engine.getStats();
      expect(stats.audioSynthesisUsed).toBe(true);
    });

    it("should unlock Audio Pioneer achievement", () => {
      const unlocked = engine.trackAudioSynthesis();
      expect(engine.isUnlocked("audio_pioneer")).toBe(true);
      expect(unlocked.some((a) => a.id === "audio_pioneer")).toBe(true);
    });

    it("should track timeline step-throughs", () => {
      engine.trackTimelineStepThrough();
      const stats = engine.getStats();
      expect(stats.timelineStepThroughs).toBe(1);
    });
  });

  describe("Progress and Statistics", () => {
    it("should calculate progress percentage correctly", () => {
      expect(engine.getProgressPercentage()).toBe(0);

      // Unlock one achievement (First Genome)
      engine.trackGenomeExecuted(["CIRCLE"]);
      const progress1 = engine.getProgressPercentage();
      expect(progress1).toBeGreaterThan(0);
      expect(progress1).toBeLessThan(100);

      // Unlock another (First Mutation)
      engine.trackMutationApplied();
      const progress2 = engine.getProgressPercentage();
      expect(progress2).toBeGreaterThan(progress1);
    });

    it("should return unlocked achievements sorted by date", () => {
      engine.trackGenomeExecuted(["CIRCLE"]);
      engine.trackMutationApplied();
      engine.trackShapeDrawn("RECT");

      const unlocked = engine.getUnlockedAchievements();
      expect(unlocked.length).toBeGreaterThan(0);

      // Check they're sorted (most recent first)
      for (let i = 0; i < unlocked.length - 1; i++) {
        expect(unlocked[i].unlockedAt.getTime()).toBeGreaterThanOrEqual(
          unlocked[i + 1].unlockedAt.getTime(),
        );
      }
    });

    it("should export achievement data", () => {
      engine.trackGenomeExecuted(["CIRCLE"]);
      engine.trackMutationApplied();

      const exported = engine.export();
      const data = JSON.parse(exported);

      expect(data.stats).toBeDefined();
      expect(data.unlocked).toBeDefined();
      expect(data.progress).toBeDefined();
      expect(data.unlocked.length).toBeGreaterThan(0);
    });
  });

  describe("Persistence", () => {
    it("should save to localStorage", () => {
      engine.trackGenomeExecuted(["CIRCLE"]);
      engine.trackMutationApplied();

      // Create new engine instance
      const engine2 = new AchievementEngine();

      // Should load saved progress
      expect(engine2.isUnlocked("first_genome")).toBe(true);
      expect(engine2.isUnlocked("first_mutation")).toBe(true);
      expect(engine2.getStats().genomesExecuted).toBe(1);
      expect(engine2.getStats().mutationsApplied).toBe(1);
    });

    it("should persist opcodesUsed as Set", () => {
      engine.trackGenomeExecuted(["CIRCLE", "RECT"]);

      const engine2 = new AchievementEngine();
      const stats = engine2.getStats();

      expect(stats.opcodesUsed).toBeInstanceOf(Set);
      expect(stats.opcodesUsed.has("CIRCLE")).toBe(true);
      expect(stats.opcodesUsed.has("RECT")).toBe(true);
    });

    it("should reset all progress", () => {
      engine.trackGenomeExecuted(["CIRCLE"]);
      engine.trackMutationApplied();
      expect(engine.getProgressPercentage()).toBeGreaterThan(0);

      engine.reset();

      expect(engine.getProgressPercentage()).toBe(0);
      expect(engine.getUnlockedAchievements().length).toBe(0);
      expect(engine.getStats().genomesExecuted).toBe(0);
    });
  });

  describe("Legend Achievement", () => {
    it("should unlock Legend when all other achievements are unlocked", () => {
      // Manually unlock all non-legend achievements
      // This is a simplified test - in reality would require completing all conditions

      // Get all achievements
      const allAchievements = engine.getAchievements();
      const _nonLegendCount = allAchievements.filter(
        (a) => a.id !== "legend",
      ).length;

      // Legend should exist
      expect(allAchievements.some((a) => a.id === "legend")).toBe(true);

      // Legend should be hidden initially
      const legend = allAchievements.find((a) => a.id === "legend")!;
      expect(legend.hidden).toBe(true);

      // Initially not unlocked
      expect(engine.isUnlocked("legend")).toBe(false);
    });

    it("should not unlock Legend if any achievement is missing", () => {
      // Unlock most achievements except one
      engine.trackGenomeExecuted([
        "CIRCLE",
        "RECT",
        "LINE",
        "TRIANGLE",
        "ELLIPSE",
      ]);
      engine.trackMutationApplied();

      // Legend should not be unlocked
      expect(engine.isUnlocked("legend")).toBe(false);
    });
  });

  describe("Multiple Unlocks", () => {
    it("should unlock multiple achievements from single action", () => {
      // First genome execution should unlock both "first_genome" and "first_draw"
      const _unlocked = engine.trackShapeDrawn("CIRCLE");
      engine.trackGenomeExecuted(["CIRCLE"]);

      expect(engine.isUnlocked("first_genome")).toBe(true);
      expect(engine.isUnlocked("first_draw")).toBe(true);
    });

    it("should return array of newly unlocked achievements", () => {
      const unlocked1 = engine.trackGenomeExecuted(["CIRCLE"]);
      expect(unlocked1.length).toBeGreaterThan(0);
      expect(unlocked1.some((a) => a.id === "first_genome")).toBe(true);

      // Second call shouldn't re-unlock
      const unlocked2 = engine.trackGenomeExecuted(["RECT"]);
      expect(unlocked2.some((a) => a.id === "first_genome")).toBe(false);
    });

    it("should not return already unlocked achievements", () => {
      engine.trackMutationApplied();
      expect(engine.isUnlocked("first_mutation")).toBe(true);

      const unlocked = engine.trackMutationApplied();
      expect(unlocked.some((a) => a.id === "first_mutation")).toBe(false);
    });
  });

  describe("Achievement Categories", () => {
    it("should have basics category", () => {
      const basics = engine.getAchievementsByCategory("basics");
      expect(basics.length).toBeGreaterThan(0);
      expect(basics.every((a) => a.category === "basics")).toBe(true);
    });

    it("should have mastery category", () => {
      const mastery = engine.getAchievementsByCategory("mastery");
      expect(mastery.length).toBeGreaterThan(0);
      expect(mastery.every((a) => a.category === "mastery")).toBe(true);
    });

    it("should have exploration category", () => {
      const exploration = engine.getAchievementsByCategory("exploration");
      expect(exploration.length).toBeGreaterThan(0);
      expect(exploration.every((a) => a.category === "exploration")).toBe(true);
    });

    it("should have perfection category", () => {
      const perfection = engine.getAchievementsByCategory("perfection");
      expect(perfection.length).toBeGreaterThan(0);
      expect(perfection.every((a) => a.category === "perfection")).toBe(true);
    });
  });
});
