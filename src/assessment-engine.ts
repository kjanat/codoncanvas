/**
 * @fileoverview Assessment engine for mutation identification challenges.
 * Provides automated grading system for educators to test student understanding.
 *
 * Features:
 * - Mutation type identification (silent, missense, nonsense, frameshift)
 * - Challenge generation with difficulty levels
 * - Automated scoring and feedback
 * - Progress tracking and analytics
 *
 * Educational Use Cases:
 * - Classroom quizzes on mutation types
 * - Self-paced learning with immediate feedback
 * - Educator dashboards showing class performance
 */

import {
  applyDeletion,
  applyFrameshiftMutation,
  applyInsertion,
  applyMissenseMutation,
  applyNonsenseMutation,
  applyPointMutation,
  applySilentMutation,
  type MutationResult,
} from "./mutations";
import { CODON_MAP, type Codon, type MutationType, Opcode } from "./types";

/**
 * Difficulty level for generated assessment challenges.
 * Different from ExampleDifficulty which uses beginner/intermediate/advanced scale.
 * - easy: Clear examples with obvious changes
 * - medium: Subtle differences requiring analysis
 * - hard: Complex scenarios with multiple mutations
 */
export type AssessmentDifficulty = "easy" | "medium" | "hard";

/**
 * A mutation identification challenge for students.
 */
export interface Challenge {
  /** Unique challenge identifier */
  id: string;
  /** Original genome string */
  original: string;
  /** Mutated genome string */
  mutated: string;
  /** Correct answer (mutation type) */
  correctAnswer: MutationType;
  /** Difficulty level of challenge */
  difficulty: AssessmentDifficulty;
  /** Optional hint for students */
  hint?: string;
  /** Position where mutation occurred (character offset) */
  mutationPosition: number;
}

/**
 * Result of student's answer to a challenge.
 */
export interface AssessmentResult {
  /** Challenge that was answered */
  challenge: Challenge;
  /** Student's answer */
  studentAnswer: MutationType;
  /** Whether answer was correct */
  correct: boolean;
  /** Detailed feedback explaining why answer is right/wrong */
  feedback: string;
  /** Timestamp when answer was submitted */
  timestamp: Date;
}

/**
 * Student progress tracking for assessment challenges.
 * Different from TeacherStudentProgress which includes full session/tutorial data.
 */
export interface AssessmentProgress {
  /** Number of challenges attempted */
  totalAttempts: number;
  /** Number of correct answers */
  correctAnswers: number;
  /** Accuracy percentage (0-100) */
  accuracy: number;
  /** Performance by mutation type */
  byType: Record<MutationType, { correct: number; total: number }>;
  /** Performance by difficulty */
  byDifficulty: Record<
    AssessmentDifficulty,
    { correct: number; total: number }
  >;
}

/**
 * Assessment engine for mutation identification challenges.
 * Generates challenges, scores responses, and tracks progress.
 */
export class AssessmentEngine {
  private challengeCounter = 0;

  /**
   * Identify mutation type between two genomes.
   * Compares original and mutated sequences to classify mutation.
   *
   * Algorithm:
   * 1. Compare lengths → detect insertion/deletion
   * 2. If length change not divisible by 3 → frameshift
   * 3. If same length → point mutation (silent/missense/nonsense)
   *
   * @param original - Original genome string
   * @param mutated - Mutated genome string
   * @returns Classified mutation type
   */
  identifyMutation(original: string, mutated: string): MutationType {
    const origClean = this.cleanGenome(original);
    const mutClean = this.cleanGenome(mutated);

    const lengthDiff = Math.abs(mutClean.length - origClean.length);

    // Frameshift: length change not divisible by 3
    if (lengthDiff > 0 && lengthDiff % 3 !== 0) {
      return "frameshift";
    }

    // Insertion: added bases (divisible by 3)
    if (mutClean.length > origClean.length && lengthDiff % 3 === 0) {
      return "insertion";
    }

    // Deletion: removed bases (divisible by 3)
    if (mutClean.length < origClean.length && lengthDiff % 3 === 0) {
      return "deletion";
    }

    // Point mutation: same length, identify type
    return this.identifyPointMutation(origClean, mutClean);
  }

  /**
   * Generate a random challenge at specified difficulty.
   * Creates realistic mutation scenarios for testing.
   *
   * @param difficulty - Challenge difficulty level
   * @returns Generated challenge with correct answer
   */
  generateChallenge(difficulty: AssessmentDifficulty): Challenge {
    const id = `challenge-${++this.challengeCounter}`;

    // Generate base genome based on difficulty
    const original = this.generateBaseGenome(difficulty);

    // Select mutation type based on difficulty
    const mutationType = this.selectMutationType(difficulty);

    // Apply mutation using appropriate function
    const mutationResult = this.applyMutationByType(original, mutationType);

    // Generate hint based on difficulty
    const hint =
      difficulty === "hard"
        ? undefined
        : this.generateHint(mutationType, difficulty);

    return {
      id,
      original,
      mutated: mutationResult.mutated,
      correctAnswer: mutationType,
      difficulty,
      hint,
      mutationPosition: mutationResult.position,
    };
  }

  /**
   * Score a student's response to a challenge.
   * Provides detailed feedback for learning.
   *
   * @param challenge - Challenge being answered
   * @param response - Student's answer (mutation type)
   * @returns Assessment result with feedback
   */
  scoreResponse(
    challenge: Challenge,
    response: MutationType,
  ): AssessmentResult {
    const correct = response === challenge.correctAnswer;

    const feedback = correct
      ? this.generatePositiveFeedback(challenge)
      : this.generateCorrectiveFeedback(challenge, response);

    return {
      challenge,
      studentAnswer: response,
      correct,
      feedback,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate student progress from assessment results.
   * Aggregates performance metrics for analytics.
   *
   * @param results - Array of assessment results
   * @returns Student progress summary
   */
  calculateProgress(results: AssessmentResult[]): AssessmentProgress {
    const totalAttempts = results.length;
    const correctAnswers = results.filter((r) => r.correct).length;
    const accuracy =
      totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

    // Initialize tracking structures
    const byType: Record<MutationType, { correct: number; total: number }> = {
      silent: { correct: 0, total: 0 },
      missense: { correct: 0, total: 0 },
      nonsense: { correct: 0, total: 0 },
      point: { correct: 0, total: 0 },
      insertion: { correct: 0, total: 0 },
      deletion: { correct: 0, total: 0 },
      frameshift: { correct: 0, total: 0 },
    };

    const byDifficulty: Record<
      AssessmentDifficulty,
      { correct: number; total: number }
    > = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    // Aggregate results
    for (const result of results) {
      const type = result.challenge.correctAnswer;
      const difficulty = result.challenge.difficulty;

      byType[type].total++;
      byDifficulty[difficulty].total++;

      if (result.correct) {
        byType[type].correct++;
        byDifficulty[difficulty].correct++;
      }
    }

    return {
      totalAttempts,
      correctAnswers,
      accuracy,
      byType,
      byDifficulty,
    };
  }

  /**
   * Apply mutation by type (dispatch to specific mutation functions).
   * @internal
   */
  private applyMutationByType(
    genome: string,
    type: MutationType,
  ): MutationResult {
    switch (type) {
      case "silent":
        return applySilentMutation(genome);
      case "missense":
        return applyMissenseMutation(genome);
      case "nonsense":
        return applyNonsenseMutation(genome);
      case "point":
        return applyPointMutation(genome);
      case "insertion":
        return applyInsertion(genome, undefined, 3); // Insert 3 bases (no frameshift)
      case "deletion":
        return applyDeletion(genome, undefined, 3); // Delete 3 bases (no frameshift)
      case "frameshift":
        return applyFrameshiftMutation(genome); // Will insert/delete 1-2 bases
      default:
        throw new Error(`Unknown mutation type: ${type}`);
    }
  }

  /**
   * Clean genome string (remove whitespace and comments).
   * @internal
   */
  private cleanGenome(genome: string): string {
    return genome
      .split("\n")
      .map((line) => line.split(";")[0])
      .join("")
      .replace(/\s+/g, "")
      .toUpperCase();
  }

  /**
   * Identify point mutation type (silent/missense/nonsense).
   * Assumes genomes have same length.
   * @internal
   */
  private identifyPointMutation(
    original: string,
    mutated: string,
  ): MutationType {
    // Find changed codon
    for (let i = 0; i < original.length; i += 3) {
      const origCodon = original.slice(i, i + 3) as Codon;
      const mutCodon = mutated.slice(i, i + 3) as Codon;

      if (origCodon !== mutCodon) {
        // Check if mutation introduces STOP codon
        if (this.isStopCodon(mutCodon) && !this.isStopCodon(origCodon)) {
          return "nonsense";
        }

        // Check if codons map to same opcode
        const origOpcode = CODON_MAP[origCodon];
        const mutOpcode = CODON_MAP[mutCodon];

        if (origOpcode === mutOpcode) {
          return "silent";
        } else {
          return "missense";
        }
      }
    }

    // No differences found (shouldn't happen in valid challenge)
    return "silent";
  }

  /**
   * Check if codon is a STOP codon.
   * @internal
   */
  private isStopCodon(codon: Codon): boolean {
    const opcode = CODON_MAP[codon];
    return opcode === Opcode.STOP;
  }

  /**
   * Generate base genome for challenge based on difficulty.
   * @internal
   */
  private generateBaseGenome(difficulty: AssessmentDifficulty): string {
    const lengths = {
      easy: 5, // 5 codons = 15 bases
      medium: 8, // 8 codons = 24 bases
      hard: 12, // 12 codons = 36 bases
    };

    const codonCount = lengths[difficulty];
    const codons: string[] = ["ATG"]; // Always start with START

    // Generate random valid codons
    const validCodons = Object.keys(CODON_MAP).filter(
      (c) => c !== "ATG" && !this.isStopCodon(c as Codon),
    );

    for (let i = 1; i < codonCount - 1; i++) {
      const randomCodon =
        validCodons[Math.floor(Math.random() * validCodons.length)];
      codons.push(randomCodon);
    }

    codons.push("TAA"); // End with STOP

    return codons.join(" ");
  }

  /**
   * Select mutation type based on difficulty.
   * Easy: Silent/missense only
   * Medium: Add nonsense
   * Hard: Add frameshift/insertion/deletion
   * @internal
   */
  private selectMutationType(difficulty: AssessmentDifficulty): MutationType {
    const types: Record<AssessmentDifficulty, MutationType[]> = {
      easy: ["silent", "missense"],
      medium: ["silent", "missense", "nonsense"],
      hard: [
        "silent",
        "missense",
        "nonsense",
        "frameshift",
        "insertion",
        "deletion",
      ],
    };

    const available = types[difficulty];
    return available[Math.floor(Math.random() * available.length)];
  }

  /**
   * Generate hint for challenge.
   * @internal
   */
  private generateHint(
    mutationType: MutationType,
    difficulty: AssessmentDifficulty,
  ): string {
    if (difficulty === "easy") {
      const hints: Record<MutationType, string> = {
        silent:
          "The output should look identical. Check if the opcodes are the same.",
        missense: "The output changed. Check if a different shape appeared.",
        nonsense:
          "The output is incomplete. Check if a STOP codon appeared early.",
        point: "Look for a single base change.",
        insertion: "Bases were added. Count the genome length.",
        deletion: "Bases were removed. Count the genome length.",
        frameshift:
          "The reading frame shifted. Count the bases added or removed.",
      };
      return hints[mutationType];
    } else {
      // Medium difficulty: less specific hints
      const hints: Record<MutationType, string> = {
        silent: "Compare the visual outputs carefully.",
        missense: "Check if the functionality changed.",
        nonsense: "Does the program terminate early?",
        point: "Look for base substitutions.",
        insertion: "Did the genome get longer?",
        deletion: "Did the genome get shorter?",
        frameshift: "Is the length change divisible by 3?",
      };
      return hints[mutationType];
    }
  }

  /**
   * Generate positive feedback for correct answer.
   * @internal
   */
  private generatePositiveFeedback(challenge: Challenge): string {
    const explanations: Record<MutationType, string> = {
      silent:
        "Correct! This is a silent mutation. The codon changed, but it still codes for the same opcode, so the output is identical.",
      missense:
        "Correct! This is a missense mutation. The codon changed to a different opcode, altering the visual output.",
      nonsense:
        "Correct! This is a nonsense mutation. A STOP codon was introduced, causing premature termination.",
      point:
        "Correct! This is a point mutation. A single base was substituted.",
      insertion:
        "Correct! This is an insertion. Bases were added (divisible by 3, so no frameshift).",
      deletion:
        "Correct! This is a deletion. Bases were removed (divisible by 3, so no frameshift).",
      frameshift:
        "Correct! This is a frameshift mutation. Bases were added or removed (not divisible by 3), scrambling the reading frame.",
    };

    return explanations[challenge.correctAnswer];
  }

  /**
   * Generate corrective feedback for incorrect answer.
   * @internal
   */
  private generateCorrectiveFeedback(
    challenge: Challenge,
    studentAnswer: MutationType,
  ): string {
    const correct = challenge.correctAnswer;

    const feedback = `Not quite. You answered "${studentAnswer}" but the correct answer is "${correct}". `;

    const explanations: Record<MutationType, string> = {
      silent:
        "Silent mutations change the codon but not the opcode (same output).",
      missense:
        "Missense mutations change the codon to a different opcode (different output).",
      nonsense:
        "Nonsense mutations introduce a STOP codon, causing premature termination.",
      point: "Point mutations are single base substitutions.",
      insertion:
        "Insertions add bases. If divisible by 3, no frameshift occurs.",
      deletion:
        "Deletions remove bases. If divisible by 3, no frameshift occurs.",
      frameshift:
        "Frameshifts occur when bases added/removed are NOT divisible by 3, scrambling downstream codons.",
    };

    return feedback + explanations[correct];
  }
}
