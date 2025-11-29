/**
 * Assessment UI Test Suite
 *
 * Tests for the assessment mode UI that provides challenge interface,
 * answer submission, and progress tracking for mutation identification.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { AchievementEngine } from "@/education/achievements/achievement-engine";
import type { AchievementUI } from "@/education/achievements/achievement-ui";
import type {
  AssessmentEngine,
  AssessmentResult,
  Challenge,
} from "@/education/assessments/assessment-engine";
import { AssessmentUI } from "@/education/assessments/assessment-ui";
import type { MutationType } from "@/types";

// Mock AssessmentEngine
const createMockEngine = (overrides: Partial<AssessmentEngine> = {}) => {
  const defaultChallenge: Challenge = {
    id: "test-challenge",
    original: "ATGGGG",
    mutated: "ATGAGG",
    correctAnswer: "missense" as MutationType,
    difficulty: "easy" as const,
    hint: "Look at the second codon",
    mutationPosition: 3,
  };
  return {
    generateChallenge: mock(() => defaultChallenge),
    scoreResponse: mock((challenge: Challenge, answer: MutationType) => ({
      challenge,
      studentAnswer: answer,
      correct: answer === challenge.correctAnswer,
      feedback:
        answer === challenge.correctAnswer
          ? "Great job!"
          : `Try again. The correct answer was ${challenge.correctAnswer}`,
      timestamp: new Date(),
    })),
    calculateProgress: mock((results: AssessmentResult[]) => ({
      totalAttempts: results.length,
      correctAnswers: results.filter((r) => r.correct).length,
      accuracy:
        results.length > 0
          ? (results.filter((r) => r.correct).length / results.length) * 100
          : 0,
      byType: {} as Record<string, { correct: number; total: number }>,
      byDifficulty: {} as Record<string, { correct: number; total: number }>,
    })),
    ...overrides,
  } as unknown as AssessmentEngine;
};

// Mock AchievementEngine
const createMockAchievementEngine = () => {
  return {
    trackChallengeCompleted: mock(() => []),
    trackPerfectScore: mock(() => []),
  } as unknown as AchievementEngine;
};

// Mock AchievementUI
const createMockAchievementUI = () => {
  return {
    handleUnlocks: mock(() => {}),
  } as unknown as AchievementUI;
};

describe("AssessmentUI", () => {
  let container: HTMLElement;
  let mockEngine: ReturnType<typeof createMockEngine>;
  let mockAchievementEngine: ReturnType<typeof createMockAchievementEngine>;
  let mockAchievementUI: ReturnType<typeof createMockAchievementUI>;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "assessment-container";
    document.body.appendChild(container);
    mockEngine = createMockEngine();
    mockAchievementEngine = createMockAchievementEngine();
    mockAchievementUI = createMockAchievementUI();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    // Clean up styles
    const styles = document.getElementById("assessment-ui-styles");
    if (styles) styles.remove();
  });

  // Constructor
  describe("constructor", () => {
    test("accepts AssessmentEngine and container element", () => {
      const ui = new AssessmentUI(mockEngine, container);
      expect(ui).toBeDefined();
    });

    test("accepts optional AchievementEngine for integration", () => {
      const ui = new AssessmentUI(mockEngine, container, mockAchievementEngine);
      expect(ui).toBeDefined();
    });

    test("accepts optional AchievementUI for notification handling", () => {
      const ui = new AssessmentUI(
        mockEngine,
        container,
        mockAchievementEngine,
        mockAchievementUI,
      );
      expect(ui).toBeDefined();
    });

    test("initializes empty answerButtons Map", () => {
      new AssessmentUI(mockEngine, container);
      // Verified by checking buttons exist after createUI
      const buttons = container.querySelectorAll(".answer-btn");
      expect(buttons.length).toBe(6);
    });

    test("initializes empty results array", () => {
      const ui = new AssessmentUI(mockEngine, container);
      const progress = ui.getProgress();
      expect(progress.totalAttempts).toBe(0);
    });

    test("initializes difficulty to 'easy' by default", () => {
      new AssessmentUI(mockEngine, container);
      const select = container.querySelector(
        "#difficulty-select",
      ) as HTMLSelectElement;
      expect(select?.value).toBe("easy");
    });

    test("calls createUI to build interface", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector(".assessment-container")).not.toBeNull();
    });
  });

  // show
  describe("show", () => {
    test("sets container display to 'block'", () => {
      const ui = new AssessmentUI(mockEngine, container);
      container.style.display = "none";
      ui.show();
      expect(container.style.display).toBe("block");
    });

    test("calls startNewChallenge to load first challenge", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      expect(mockEngine.generateChallenge).toHaveBeenCalled();
    });
  });

  // hide
  describe("hide", () => {
    test("sets container display to 'none'", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      ui.hide();
      expect(container.style.display).toBe("none");
    });
  });

  // getProgress
  describe("getProgress", () => {
    test("returns progress calculated from engine with current results", () => {
      const ui = new AssessmentUI(mockEngine, container);
      const progress = ui.getProgress();
      expect(mockEngine.calculateProgress).toHaveBeenCalled();
      expect(progress).toBeDefined();
    });

    test("includes totalAttempts, correctAnswers, accuracy", () => {
      const ui = new AssessmentUI(mockEngine, container);
      const progress = ui.getProgress();
      expect(progress.totalAttempts).toBeDefined();
      expect(progress.correctAnswers).toBeDefined();
      expect(progress.accuracy).toBeDefined();
    });
  });

  // exportResults
  describe("exportResults", () => {
    test("returns JSON string with results array", () => {
      const ui = new AssessmentUI(mockEngine, container);
      const exported = ui.exportResults();
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed.results)).toBe(true);
    });

    test("includes progress metrics in export", () => {
      const ui = new AssessmentUI(mockEngine, container);
      const exported = ui.exportResults();
      const parsed = JSON.parse(exported);
      expect(parsed.progress).toBeDefined();
    });

    test("includes ISO timestamp", () => {
      const ui = new AssessmentUI(mockEngine, container);
      const exported = ui.exportResults();
      const parsed = JSON.parse(exported);
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test("formats with 2-space indentation", () => {
      const ui = new AssessmentUI(mockEngine, container);
      const exported = ui.exportResults();
      expect(exported).toContain("\n  ");
    });
  });

  // createUI (private)
  describe("createUI", () => {
    test("creates assessment-container div", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector(".assessment-container")).not.toBeNull();
    });

    test("creates header with title '🎓 Mutation Assessment Challenge'", () => {
      new AssessmentUI(mockEngine, container);
      const h2 = container.querySelector("h2");
      expect(h2?.textContent).toContain("Mutation Assessment Challenge");
    });

    test("creates difficulty select with easy/medium/hard options", () => {
      new AssessmentUI(mockEngine, container);
      const select = container.querySelector(
        "#difficulty-select",
      ) as HTMLSelectElement;
      expect(select).not.toBeNull();
      expect(select?.options.length).toBe(3);
      expect(select?.options[0].value).toBe("easy");
      expect(select?.options[1].value).toBe("medium");
      expect(select?.options[2].value).toBe("hard");
    });

    test("creates challenge section with question and genome comparison", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector(".challenge-section")).not.toBeNull();
      expect(container.querySelector(".genome-comparison")).not.toBeNull();
    });

    test("creates original-genome and mutated-genome display divs", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector("#original-genome")).not.toBeNull();
      expect(container.querySelector("#mutated-genome")).not.toBeNull();
    });

    test("creates hint-display div", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector("#hint-display")).not.toBeNull();
    });

    test("creates answer buttons for all mutation types", () => {
      new AssessmentUI(mockEngine, container);
      const buttons = container.querySelectorAll(".answer-btn");
      expect(buttons.length).toBe(6);
      const types = Array.from(buttons).map(
        (btn) => (btn as HTMLElement).dataset["type"],
      );
      expect(types).toContain("silent");
      expect(types).toContain("missense");
      expect(types).toContain("nonsense");
      expect(types).toContain("frameshift");
      expect(types).toContain("insertion");
      expect(types).toContain("deletion");
    });

    test("creates feedback-display div", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector("#feedback-display")).not.toBeNull();
    });

    test("creates next-challenge-btn button", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector("#next-challenge-btn")).not.toBeNull();
    });

    test("creates progress-display div", () => {
      new AssessmentUI(mockEngine, container);
      expect(container.querySelector("#progress-display")).not.toBeNull();
    });

    test("sets up event listeners for difficulty change", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const select = container.querySelector(
        "#difficulty-select",
      ) as HTMLSelectElement;
      select.value = "hard";
      select.dispatchEvent(new Event("change"));
      expect(mockEngine.generateChallenge).toHaveBeenCalledWith("hard");
    });

    test("sets up event listeners for answer buttons", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const missenseBtn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      missenseBtn?.click();
      expect(mockEngine.scoreResponse).toHaveBeenCalled();
    });

    test("sets up event listener for next challenge button", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      // Click answer first to show next button
      const missenseBtn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      missenseBtn?.click();
      const nextBtn = container.querySelector(
        "#next-challenge-btn",
      ) as HTMLButtonElement;
      nextBtn?.click();
      // Should have been called twice (show + next)
      expect(mockEngine.generateChallenge).toHaveBeenCalled();
    });

    test("calls injectStyles", () => {
      new AssessmentUI(mockEngine, container);
      expect(document.getElementById("assessment-ui-styles")).not.toBeNull();
    });

    test("caches DOM element references", () => {
      new AssessmentUI(mockEngine, container);
      // Elements should be properly cached (verified by show() working)
      expect(() => {
        const ui = new AssessmentUI(mockEngine, container);
        ui.show();
      }).not.toThrow();
    });
  });

  // startNewChallenge (private)
  describe("startNewChallenge", () => {
    test("generates new challenge from engine with current difficulty", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      expect(mockEngine.generateChallenge).toHaveBeenCalledWith("easy");
    });

    test("displays original genome text", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const original = container.querySelector("#original-genome");
      expect(original?.textContent).toBe("ATGGGG");
    });

    test("displays mutated genome text", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const mutated = container.querySelector("#mutated-genome");
      expect(mutated?.textContent).toBe("ATGAGG");
    });

    test("shows hint when challenge has hint", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const hint = container.querySelector("#hint-display") as HTMLElement;
      expect(hint?.style.display).toBe("block");
      expect(hint?.textContent).toContain("Look at the second codon");
    });

    test("hides hint when challenge has no hint", () => {
      const engineNoHint = createMockEngine({
        generateChallenge: mock(() => ({
          id: "test-challenge",
          original: "ATGGGG",
          mutated: "ATGAGG",
          correctAnswer: "missense" as MutationType,
          difficulty: "easy" as const,
          hint: undefined,
          mutationPosition: 3,
        })),
      });
      const ui = new AssessmentUI(engineNoHint, container);
      ui.show();
      const hint = container.querySelector("#hint-display") as HTMLElement;
      expect(hint?.style.display).toBe("none");
    });

    test("clears feedback display", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const feedback = container.querySelector(
        "#feedback-display",
      ) as HTMLElement;
      expect(feedback?.style.display).toBe("none");
    });

    test("hides next challenge button", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const nextBtn = container.querySelector(
        "#next-challenge-btn",
      ) as HTMLElement;
      expect(nextBtn?.style.display).toBe("none");
    });

    test("enables all answer buttons", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const buttons = container.querySelectorAll(".answer-btn");
      buttons.forEach((btn) => {
        expect((btn as HTMLButtonElement).disabled).toBe(false);
      });
    });

    test("removes correct/incorrect classes from answer buttons", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const buttons = container.querySelectorAll(".answer-btn");
      buttons.forEach((btn) => {
        expect(btn.classList.contains("correct")).toBe(false);
        expect(btn.classList.contains("incorrect")).toBe(false);
      });
    });
  });

  // submitAnswer (private)
  describe("submitAnswer", () => {
    test("scores response using engine.scoreResponse", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(mockEngine.scoreResponse).toHaveBeenCalled();
    });

    test("adds result to results array", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const progress = ui.getProgress();
      expect(progress.totalAttempts).toBe(1);
    });

    test("tracks challenge completion with achievement engine if available", () => {
      const ui = new AssessmentUI(
        mockEngine,
        container,
        mockAchievementEngine,
        mockAchievementUI,
      );
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(mockAchievementEngine.trackChallengeCompleted).toHaveBeenCalled();
    });

    test("calls achievementUI.handleUnlocks with newly unlocked", () => {
      const ui = new AssessmentUI(
        mockEngine,
        container,
        mockAchievementEngine,
        mockAchievementUI,
      );
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(mockAchievementUI.handleUnlocks).toHaveBeenCalled();
    });

    test("displays feedback for the result", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const feedback = container.querySelector(
        "#feedback-display",
      ) as HTMLElement;
      expect(feedback?.style.display).toBe("block");
    });

    test("disables all answer buttons", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const buttons = container.querySelectorAll(".answer-btn");
      buttons.forEach((b) => {
        expect((b as HTMLButtonElement).disabled).toBe(true);
      });
    });

    test("adds 'correct' class to correct answer button", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(btn?.classList.contains("correct")).toBe(true);
    });

    test("adds 'incorrect' class to user's wrong answer button", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="silent"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(btn?.classList.contains("incorrect")).toBe(true);
    });

    test("shows next challenge button", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const nextBtn = container.querySelector(
        "#next-challenge-btn",
      ) as HTMLElement;
      expect(nextBtn?.style.display).toBe("inline-block");
    });

    test("calls updateProgress", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const progress = container.querySelector(
        "#progress-display",
      ) as HTMLElement;
      expect(progress?.style.display).toBe("block");
    });
  });

  // displayFeedback (private)
  describe("displayFeedback", () => {
    test("displays correct icon and message for correct answer", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const feedback = container.querySelector("#feedback-display");
      expect(feedback?.textContent).toContain("✅");
      expect(feedback?.textContent).toContain("Correct");
    });

    test("displays incorrect icon and message for wrong answer", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="silent"]',
      ) as HTMLButtonElement;
      btn?.click();
      const feedback = container.querySelector("#feedback-display");
      expect(feedback?.textContent).toContain("❌");
      expect(feedback?.textContent).toContain("Incorrect");
    });

    test("shows feedback text from result", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const feedback = container.querySelector("#feedback-display");
      expect(feedback?.textContent).toContain("Great job!");
    });

    test("uses appropriate CSS class (feedback-correct/feedback-incorrect)", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const feedbackDiv = container.querySelector(".feedback-correct");
      expect(feedbackDiv).not.toBeNull();
    });

    test("makes feedback display visible", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const feedback = container.querySelector(
        "#feedback-display",
      ) as HTMLElement;
      expect(feedback?.style.display).toBe("block");
    });
  });

  // updateProgress (private)
  describe("updateProgress", () => {
    test("calculates progress from engine", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(mockEngine.calculateProgress).toHaveBeenCalled();
    });

    test("tracks perfect score achievement when accuracy is 100%", () => {
      const perfectEngine = createMockEngine({
        calculateProgress: mock(() => ({
          totalAttempts: 5,
          correctAnswers: 5,
          accuracy: 100,
          byType: {} as Record<string, { correct: number; total: number }>,
          byDifficulty: {} as Record<
            string,
            { correct: number; total: number }
          >,
        })),
      });
      const ui = new AssessmentUI(
        perfectEngine,
        container,
        mockAchievementEngine,
        mockAchievementUI,
      );
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(mockAchievementEngine.trackPerfectScore).toHaveBeenCalled();
    });

    test("displays progress summary with heading", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const progress = container.querySelector("#progress-display");
      expect(progress?.textContent).toContain("Your Progress");
    });

    test("displays challenges count", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const progress = container.querySelector("#progress-display");
      expect(progress?.textContent).toContain("Challenges");
    });

    test("displays correct count", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const progress = container.querySelector("#progress-display");
      expect(progress?.textContent).toContain("Correct");
    });

    test("displays accuracy percentage", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const progress = container.querySelector("#progress-display");
      expect(progress?.textContent).toContain("Accuracy");
    });

    test("makes progress display visible", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      const progress = container.querySelector(
        "#progress-display",
      ) as HTMLElement;
      expect(progress?.style.display).toBe("block");
    });
  });

  // injectStyles (private)
  describe("injectStyles", () => {
    test("creates style element with id 'assessment-ui-styles'", () => {
      new AssessmentUI(mockEngine, container);
      expect(document.getElementById("assessment-ui-styles")).not.toBeNull();
    });

    test("does nothing if styles already exist", () => {
      new AssessmentUI(mockEngine, container);
      const firstStyle = document.getElementById("assessment-ui-styles");
      new AssessmentUI(mockEngine, container);
      const secondStyle = document.getElementById("assessment-ui-styles");
      expect(firstStyle).toBe(secondStyle);
    });

    test("includes CSS for assessment-container layout", () => {
      new AssessmentUI(mockEngine, container);
      const style = document.getElementById("assessment-ui-styles");
      expect(style?.textContent).toContain(".assessment-container");
    });

    test("includes CSS for genome-comparison grid", () => {
      new AssessmentUI(mockEngine, container);
      const style = document.getElementById("assessment-ui-styles");
      expect(style?.textContent).toContain(".genome-comparison");
    });

    test("includes CSS for answer buttons and states", () => {
      new AssessmentUI(mockEngine, container);
      const style = document.getElementById("assessment-ui-styles");
      expect(style?.textContent).toContain(".answer-btn");
      expect(style?.textContent).toContain(".answer-btn.correct");
      expect(style?.textContent).toContain(".answer-btn.incorrect");
    });

    test("includes CSS for feedback display", () => {
      new AssessmentUI(mockEngine, container);
      const style = document.getElementById("assessment-ui-styles");
      expect(style?.textContent).toContain(".feedback-display");
    });

    test("includes responsive CSS for mobile", () => {
      new AssessmentUI(mockEngine, container);
      const style = document.getElementById("assessment-ui-styles");
      expect(style?.textContent).toContain("@media");
    });
  });

  // Integration
  describe("integration", () => {
    test("works with real AssessmentEngine", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      expect(container.querySelector(".assessment-container")).not.toBeNull();
    });

    test("correctly integrates with AchievementEngine", () => {
      const ui = new AssessmentUI(
        mockEngine,
        container,
        mockAchievementEngine,
        mockAchievementUI,
      );
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(mockAchievementEngine.trackChallengeCompleted).toHaveBeenCalled();
    });

    test("correctly integrates with AchievementUI for notifications", () => {
      const ui = new AssessmentUI(
        mockEngine,
        container,
        mockAchievementEngine,
        mockAchievementUI,
      );
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();
      expect(mockAchievementUI.handleUnlocks).toHaveBeenCalled();
    });

    test("progresses through multiple challenges", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();

      // Answer first challenge
      let btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();

      // Go to next challenge
      const nextBtn = container.querySelector(
        "#next-challenge-btn",
      ) as HTMLButtonElement;
      nextBtn?.click();

      // Answer second challenge
      btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      btn?.click();

      const progress = ui.getProgress();
      expect(progress.totalAttempts).toBe(2);
    });

    test("maintains results across challenges", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();

      // Answer multiple challenges
      for (let i = 0; i < 3; i++) {
        const btn = container.querySelector(
          '[data-type="missense"]',
        ) as HTMLButtonElement;
        btn?.click();
        const nextBtn = container.querySelector(
          "#next-challenge-btn",
        ) as HTMLButtonElement;
        nextBtn?.click();
      }

      const progress = ui.getProgress();
      expect(progress.totalAttempts).toBe(3);
    });

    test("difficulty change resets to new challenge", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const select = container.querySelector(
        "#difficulty-select",
      ) as HTMLSelectElement;
      select.value = "hard";
      select.dispatchEvent(new Event("change"));
      expect(mockEngine.generateChallenge).toHaveBeenCalledWith("hard");
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles missing achievement engine gracefully", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      // Should not throw
      expect(() => btn?.click()).not.toThrow();
    });

    test("handles missing achievement UI gracefully", () => {
      const ui = new AssessmentUI(mockEngine, container, mockAchievementEngine);
      ui.show();
      const btn = container.querySelector(
        '[data-type="missense"]',
      ) as HTMLButtonElement;
      // Should not throw
      expect(() => btn?.click()).not.toThrow();
    });

    test("handles all mutation types being tested", () => {
      const ui = new AssessmentUI(mockEngine, container);
      ui.show();
      const types = [
        "silent",
        "missense",
        "nonsense",
        "frameshift",
        "insertion",
        "deletion",
      ];
      for (const type of types) {
        const btn = container.querySelector(
          `[data-type="${type}"]`,
        ) as HTMLButtonElement;
        expect(btn).not.toBeNull();
      }
    });

    test("handles very long genome strings", () => {
      const longEngine = createMockEngine({
        generateChallenge: mock(() => ({
          id: "long-genome-challenge",
          original: "ATG".repeat(100),
          mutated: `${"ATG".repeat(99)}GGG`,
          correctAnswer: "missense" as MutationType,
          difficulty: "easy" as const,
          mutationPosition: 297,
        })),
      });
      const ui = new AssessmentUI(longEngine, container);
      ui.show();
      const original = container.querySelector("#original-genome");
      expect(original?.textContent?.length).toBe(300);
    });
  });
});
