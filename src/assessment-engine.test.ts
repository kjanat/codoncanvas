/**
 * @fileoverview Tests for assessment engine.
 * Validates mutation identification, challenge generation, and scoring logic.
 */

import { beforeEach, describe, expect, test } from "bun:test";
import type {
  AssessmentResult,
  Challenge,
  MutationType,
} from "./assessment-engine";
import { AssessmentEngine } from "./assessment-engine";

describe("AssessmentEngine", () => {
  let engine: AssessmentEngine;

  beforeEach(() => {
    engine = new AssessmentEngine();
  });

  describe("identifyMutation", () => {
    test("should identify silent mutations (same opcode)", () => {
      const original = "ATG GGA TAA"; // START CIRCLE STOP
      const mutated = "ATG GGC TAA"; // START CIRCLE(synonym) STOP

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("silent");
    });

    test("should identify missense mutations (different opcode)", () => {
      const original = "ATG GGA TAA"; // START CIRCLE STOP
      const mutated = "ATG GCA TAA"; // START TRIANGLE STOP

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("missense");
    });

    test("should identify nonsense mutations (introduces STOP)", () => {
      const original = "ATG GGA CCA TAA"; // START CIRCLE RECT STOP
      const mutated = "ATG GGA TAG TAA"; // START CIRCLE STOP(early) STOP

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("nonsense");
    });

    test("should identify frameshift mutations (length not divisible by 3)", () => {
      const original = "ATGGGATAAA"; // 9 bases
      const mutated = "ATGGGTAAA"; // 8 bases (deleted one A → frameshift)

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("frameshift");
    });

    test("should identify insertion mutations (length +3)", () => {
      const original = "ATG GGA TAA"; // START CIRCLE STOP
      const mutated = "ATG GGA CCA TAA"; // START CIRCLE RECT STOP

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("insertion");
    });

    test("should identify deletion mutations (length -3)", () => {
      const original = "ATG GGA CCA TAA"; // START CIRCLE RECT STOP
      const mutated = "ATG GGA TAA"; // START CIRCLE STOP

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("deletion");
    });

    test("should handle genomes with whitespace and comments", () => {
      const original = `
        ATG     ; Start codon
        GGA     ; Draw circle
        TAA     ; Stop
      `;
      const mutated = `
        ATG     ; Start codon
        GGC     ; Draw circle (synonymous)
        TAA     ; Stop
      `;

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("silent");
    });

    test("should handle case-insensitive genomes", () => {
      const original = "atg gga taa";
      const mutated = "atg ggc taa";

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("silent");
    });

    test("should identify frameshift with +1 base", () => {
      const original = "ATGGGATAAA"; // 9 bases
      const mutated = "ATGGGATAAA C"; // 10 bases (not divisible by 3)

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("frameshift");
    });

    test("should identify frameshift with -2 bases", () => {
      const original = "ATGGGATAAA"; // 9 bases
      const mutated = "ATGGATAA"; // 7 bases (not divisible by 3)

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("frameshift");
    });

    test("should identify insertion with +6 bases", () => {
      const original = "ATG GGA TAA"; // 9 bases
      const mutated = "ATG GGA CCA CCA TAA"; // 15 bases (+6, divisible by 3)

      const result = engine.identifyMutation(original, mutated);

      expect(result).toBe("insertion");
    });
  });

  describe("generateChallenge", () => {
    test("should generate easy challenges", () => {
      const challenge = engine.generateChallenge("easy");

      expect(challenge.id).toContain("challenge-");
      expect(challenge.original).toBeTruthy();
      expect(challenge.mutated).toBeTruthy();
      expect(challenge.difficulty).toBe("easy");
      expect(["silent", "missense"]).toContain(challenge.correctAnswer);
      expect(challenge.hint).toBeTruthy(); // Easy challenges have hints
    });

    test("should generate medium challenges", () => {
      const challenge = engine.generateChallenge("medium");

      expect(challenge.difficulty).toBe("medium");
      expect(["silent", "missense", "nonsense"]).toContain(
        challenge.correctAnswer,
      );
      expect(challenge.hint).toBeTruthy(); // Medium challenges have hints
    });

    test("should generate hard challenges", () => {
      const challenge = engine.generateChallenge("hard");

      expect(challenge.difficulty).toBe("hard");
      expect([
        "silent",
        "missense",
        "nonsense",
        "frameshift",
        "insertion",
        "deletion",
      ]).toContain(challenge.correctAnswer);
      expect(challenge.hint).toBeUndefined(); // Hard challenges have no hints
    });

    test("should generate unique challenge IDs", () => {
      const challenge1 = engine.generateChallenge("easy");
      const challenge2 = engine.generateChallenge("easy");

      expect(challenge1.id).not.toBe(challenge2.id);
    });

    test("should generate valid genomes (start with ATG, end with STOP)", () => {
      const challenge = engine.generateChallenge("medium");

      expect(challenge.original).toMatch(/^ATG/);
      expect(challenge.original).toMatch(/(TAA|TAG|TGA)$/);
    });

    test("should generate challenges where identifyMutation matches correctAnswer", () => {
      for (let i = 0; i < 20; i++) {
        const difficulty = ["easy", "medium", "hard"][i % 3] as
          | "easy"
          | "medium"
          | "hard";
        const challenge = engine.generateChallenge(difficulty);

        const identified = engine.identifyMutation(
          challenge.original,
          challenge.mutated,
        );

        expect(identified).toBe(challenge.correctAnswer);
      }
    });

    test("should include mutation position", () => {
      const challenge = engine.generateChallenge("easy");

      expect(challenge.mutationPosition).toBeGreaterThanOrEqual(0);
    });
  });

  describe("scoreResponse", () => {
    let challenge: Challenge;

    beforeEach(() => {
      challenge = {
        id: "test-1",
        original: "ATG GGA TAA",
        mutated: "ATG GGC TAA",
        correctAnswer: "silent",
        difficulty: "easy",
        hint: "Test hint",
        mutationPosition: 4,
      };
    });

    test("should score correct answers as correct", () => {
      const result = engine.scoreResponse(challenge, "silent");

      expect(result.correct).toBe(true);
      expect(result.studentAnswer).toBe("silent");
      expect(result.challenge).toBe(challenge);
      expect(result.feedback).toContain("Correct");
    });

    test("should score incorrect answers as incorrect", () => {
      const result = engine.scoreResponse(challenge, "missense");

      expect(result.correct).toBe(false);
      expect(result.studentAnswer).toBe("missense");
      expect(result.feedback).toContain("Not quite");
      expect(result.feedback).toContain("silent");
    });

    test("should include timestamp", () => {
      const result = engine.scoreResponse(challenge, "silent");

      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test("should provide detailed feedback for correct answers", () => {
      const result = engine.scoreResponse(challenge, "silent");

      expect(result.feedback).toContain("silent mutation");
      expect(result.feedback).toContain("same opcode");
    });

    test("should provide corrective feedback for incorrect answers", () => {
      const result = engine.scoreResponse(challenge, "missense");

      expect(result.feedback).toContain('correct answer is "silent"');
      expect(result.feedback).toContain("Silent mutations");
    });

    test("should handle all mutation types correctly", () => {
      const types: MutationType[] = [
        "silent",
        "missense",
        "nonsense",
        "point",
        "insertion",
        "deletion",
        "frameshift",
      ];

      types.forEach((type) => {
        challenge.correctAnswer = type;
        const result = engine.scoreResponse(challenge, type);

        expect(result.correct).toBe(true);
        expect(result.feedback).toBeTruthy();
      });
    });
  });

  describe("calculateProgress", () => {
    let results: AssessmentResult[];

    beforeEach(() => {
      const challenge1: Challenge = {
        id: "c1",
        original: "ATG GGA TAA",
        mutated: "ATG GGC TAA",
        correctAnswer: "silent",
        difficulty: "easy",
        mutationPosition: 4,
      };

      const challenge2: Challenge = {
        id: "c2",
        original: "ATG GGA TAA",
        mutated: "ATG GCA TAA",
        correctAnswer: "missense",
        difficulty: "medium",
        mutationPosition: 4,
      };

      const challenge3: Challenge = {
        id: "c3",
        original: "ATG GGA TAA",
        mutated: "ATG TAG TAA",
        correctAnswer: "nonsense",
        difficulty: "hard",
        mutationPosition: 4,
      };

      results = [
        {
          challenge: challenge1,
          studentAnswer: "silent",
          correct: true,
          feedback: "Correct!",
          timestamp: new Date(),
        },
        {
          challenge: challenge2,
          studentAnswer: "silent", // Wrong answer
          correct: false,
          feedback: "Not quite",
          timestamp: new Date(),
        },
        {
          challenge: challenge3,
          studentAnswer: "nonsense",
          correct: true,
          feedback: "Correct!",
          timestamp: new Date(),
        },
      ];
    });

    test("should calculate total attempts and correct answers", () => {
      const progress = engine.calculateProgress(results);

      expect(progress.totalAttempts).toBe(3);
      expect(progress.correctAnswers).toBe(2);
    });

    test("should calculate accuracy percentage", () => {
      const progress = engine.calculateProgress(results);

      expect(progress.accuracy).toBeCloseTo(66.67, 1);
    });

    test("should track performance by mutation type", () => {
      const progress = engine.calculateProgress(results);

      expect(progress.byType.silent.total).toBe(1);
      expect(progress.byType.silent.correct).toBe(1);
      expect(progress.byType.missense.total).toBe(1);
      expect(progress.byType.missense.correct).toBe(0);
      expect(progress.byType.nonsense.total).toBe(1);
      expect(progress.byType.nonsense.correct).toBe(1);
    });

    test("should track performance by difficulty", () => {
      const progress = engine.calculateProgress(results);

      expect(progress.byDifficulty.easy.total).toBe(1);
      expect(progress.byDifficulty.easy.correct).toBe(1);
      expect(progress.byDifficulty.medium.total).toBe(1);
      expect(progress.byDifficulty.medium.correct).toBe(0);
      expect(progress.byDifficulty.hard.total).toBe(1);
      expect(progress.byDifficulty.hard.correct).toBe(1);
    });

    test("should handle empty results", () => {
      const progress = engine.calculateProgress([]);

      expect(progress.totalAttempts).toBe(0);
      expect(progress.correctAnswers).toBe(0);
      expect(progress.accuracy).toBe(0);
    });

    test("should handle 100% accuracy", () => {
      const perfectResults = results.map((r) => ({ ...r, correct: true }));
      const progress = engine.calculateProgress(perfectResults);

      expect(progress.accuracy).toBe(100);
    });

    test("should handle 0% accuracy", () => {
      const failedResults = results.map((r) => ({ ...r, correct: false }));
      const progress = engine.calculateProgress(failedResults);

      expect(progress.accuracy).toBe(0);
    });
  });

  describe("Integration tests", () => {
    test("should complete a full assessment workflow", () => {
      // Generate challenge
      const challenge = engine.generateChallenge("medium");

      // Student identifies mutation
      const identifiedType = engine.identifyMutation(
        challenge.original,
        challenge.mutated,
      );

      // Student submits answer (correct in this case)
      const result = engine.scoreResponse(challenge, identifiedType);

      expect(result.correct).toBe(true);
      expect(result.feedback).toContain("Correct");
    });

    test("should handle multiple challenges and calculate progress", () => {
      const results: AssessmentResult[] = [];

      // Generate and answer 10 challenges
      for (let i = 0; i < 10; i++) {
        const difficulty = ["easy", "medium", "hard"][i % 3] as
          | "easy"
          | "medium"
          | "hard";
        const challenge = engine.generateChallenge(difficulty);

        // Simulate correct answer 70% of the time
        const studentAnswer =
          Math.random() < 0.7
            ? challenge.correctAnswer
            : (["silent", "missense"] as MutationType[])[
                Math.floor(Math.random() * 2)
              ];

        const result = engine.scoreResponse(challenge, studentAnswer);
        results.push(result);
      }

      // Calculate progress
      const progress = engine.calculateProgress(results);

      expect(progress.totalAttempts).toBe(10);
      expect(progress.accuracy).toBeGreaterThan(0);
      expect(progress.accuracy).toBeLessThanOrEqual(100);
    });
  });
});
