/**
 * @fileoverview UI components for assessment mode.
 * Provides challenge interface, answer submission, and progress tracking.
 *
 * Usage:
 * ```typescript
 * import { AssessmentUI } from './assessment-ui';
 *
 * const assessmentUI = new AssessmentUI(
 *   assessmentEngine,
 *   document.getElementById('container')!
 * );
 * assessmentUI.show();
 * ```
 */

import type { AchievementEngine } from "@/achievement-engine";
import type { AchievementUI } from "@/achievement-ui";
import type {
  AssessmentDifficulty,
  AssessmentEngine,
  AssessmentResult,
  Challenge,
} from "@/assessment-engine";
import type { MutationType } from "@/types";

/**
 * UI manager for assessment mode.
 * Handles challenge display, answer submission, and progress tracking.
 */
export class AssessmentUI {
  private engine: AssessmentEngine;
  private container: HTMLElement;
  private currentChallenge: Challenge | null = null;
  private results: AssessmentResult[] = [];
  private difficulty: AssessmentDifficulty = "easy";
  private achievementEngine?: AchievementEngine;
  private achievementUI?: AchievementUI;
  private originalGenome!: HTMLDivElement;
  private mutatedGenome!: HTMLDivElement;
  private hintDisplay!: HTMLDivElement;
  private answerButtons!: Map<MutationType, HTMLButtonElement>;
  private feedbackDisplay!: HTMLDivElement;
  private progressDisplay!: HTMLDivElement;
  private nextChallengeBtn!: HTMLButtonElement;
  private difficultySelect!: HTMLSelectElement;

  constructor(
    engine: AssessmentEngine,
    container: HTMLElement,
    achievementEngine?: AchievementEngine,
    achievementUI?: AchievementUI,
  ) {
    this.engine = engine;
    this.container = container;
    this.achievementEngine = achievementEngine;
    this.achievementUI = achievementUI;
    this.answerButtons = new Map();
    this.createUI();
  }

  /**
   * Show assessment mode UI.
   */
  show(): void {
    this.container.style.display = "block";
    this.startNewChallenge();
  }

  /**
   * Hide assessment mode UI.
   */
  hide(): void {
    this.container.style.display = "none";
  }

  /**
   * Get current progress for analytics.
   */
  getProgress() {
    return this.engine.calculateProgress(this.results);
  }

  /**
   * Export results for educator review.
   */
  exportResults(): string {
    const progress = this.getProgress();
    return JSON.stringify(
      {
        results: this.results,
        progress,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  /**
   * Create UI structure.
   * @internal
   */
  private createUI(): void {
    // Build assessment UI structure safely
    const assessmentContainer = document.createElement("div");
    assessmentContainer.className = "assessment-container";

    // Header
    const header = document.createElement("div");
    header.className = "assessment-header";
    const h2 = document.createElement("h2");
    h2.textContent = "🎓 Mutation Assessment Challenge";
    header.appendChild(h2);

    const controls = document.createElement("div");
    controls.className = "assessment-controls";
    const label = document.createElement("label");
    label.setAttribute("for", "difficulty-select");
    label.textContent = "Difficulty:";
    const select = document.createElement("select");
    select.id = "difficulty-select";
    select.className = "difficulty-select";
    ["easy", "medium", "hard"].forEach((level) => {
      const opt = document.createElement("option");
      opt.value = level;
      opt.textContent = level.charAt(0).toUpperCase() + level.slice(1);
      select.appendChild(opt);
    });
    controls.appendChild(label);
    controls.appendChild(select);
    header.appendChild(controls);

    // Challenge section
    const challengeSection = document.createElement("div");
    challengeSection.className = "challenge-section";

    const questionDiv = document.createElement("div");
    questionDiv.className = "challenge-question";
    const h3 = document.createElement("h3");
    h3.textContent = "What type of mutation occurred?";
    const instructions = document.createElement("p");
    instructions.className = "challenge-instructions";
    instructions.textContent =
      "Compare the two genomes below and identify the mutation type.";
    questionDiv.appendChild(h3);
    questionDiv.appendChild(instructions);

    const genomeComparison = document.createElement("div");
    genomeComparison.className = "genome-comparison";

    const origBox = document.createElement("div");
    origBox.className = "genome-box";
    const origH4 = document.createElement("h4");
    origH4.textContent = "Original Genome:";
    const origDisplay = document.createElement("div");
    origDisplay.id = "original-genome";
    origDisplay.className = "genome-display";
    origBox.appendChild(origH4);
    origBox.appendChild(origDisplay);

    const mutBox = document.createElement("div");
    mutBox.className = "genome-box";
    const mutH4 = document.createElement("h4");
    mutH4.textContent = "Mutated Genome:";
    const mutDisplay = document.createElement("div");
    mutDisplay.id = "mutated-genome";
    mutDisplay.className = "genome-display";
    mutBox.appendChild(mutH4);
    mutBox.appendChild(mutDisplay);

    genomeComparison.appendChild(origBox);
    genomeComparison.appendChild(mutBox);

    const hintDisplay = document.createElement("div");
    hintDisplay.id = "hint-display";
    hintDisplay.className = "hint-display";

    const answerSection = document.createElement("div");
    answerSection.className = "answer-section";
    const answerH4 = document.createElement("h4");
    answerH4.textContent = "Select your answer:";
    const answerButtons = document.createElement("div");
    answerButtons.className = "answer-buttons";
    [
      "silent",
      "missense",
      "nonsense",
      "frameshift",
      "insertion",
      "deletion",
    ].forEach((type) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.setAttribute("data-type", type);
      btn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      answerButtons.appendChild(btn);
    });
    answerSection.appendChild(answerH4);
    answerSection.appendChild(answerButtons);

    const feedbackDisplay = document.createElement("div");
    feedbackDisplay.id = "feedback-display";
    feedbackDisplay.className = "feedback-display";

    const challengeActions = document.createElement("div");
    challengeActions.className = "challenge-actions";
    const nextBtn = document.createElement("button");
    nextBtn.id = "next-challenge-btn";
    nextBtn.className = "next-challenge-btn";
    nextBtn.textContent = "Next Challenge →";
    challengeActions.appendChild(nextBtn);

    challengeSection.appendChild(questionDiv);
    challengeSection.appendChild(genomeComparison);
    challengeSection.appendChild(hintDisplay);
    challengeSection.appendChild(answerSection);
    challengeSection.appendChild(feedbackDisplay);
    challengeSection.appendChild(challengeActions);

    const progressDisplay = document.createElement("div");
    progressDisplay.id = "progress-display";
    progressDisplay.className = "progress-display";

    assessmentContainer.appendChild(header);
    assessmentContainer.appendChild(challengeSection);
    assessmentContainer.appendChild(progressDisplay);

    this.container.replaceChildren(assessmentContainer);

    // Cache element references - elements are created above so guaranteed to exist
    // biome-ignore lint/style/noNonNullAssertion: elements just created above
    this.originalGenome = document.getElementById(
      "original-genome",
    )! as HTMLDivElement;
    // biome-ignore lint/style/noNonNullAssertion: elements just created above
    this.mutatedGenome = document.getElementById(
      "mutated-genome",
    )! as HTMLDivElement;
    // biome-ignore lint/style/noNonNullAssertion: elements just created above
    this.hintDisplay = document.getElementById(
      "hint-display",
    )! as HTMLDivElement;
    // biome-ignore lint/style/noNonNullAssertion: elements just created above
    this.feedbackDisplay = document.getElementById(
      "feedback-display",
    )! as HTMLDivElement;
    // biome-ignore lint/style/noNonNullAssertion: elements just created above
    this.progressDisplay = document.getElementById(
      "progress-display",
    )! as HTMLDivElement;
    // biome-ignore lint/style/noNonNullAssertion: elements just created above
    this.nextChallengeBtn = document.getElementById(
      "next-challenge-btn",
    )! as HTMLButtonElement;
    // biome-ignore lint/style/noNonNullAssertion: elements just created above
    this.difficultySelect = document.getElementById(
      "difficulty-select",
    )! as HTMLSelectElement;

    // Setup answer buttons
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      const type = (btn as HTMLButtonElement).dataset.type as MutationType;
      this.answerButtons.set(type, btn as HTMLButtonElement);

      btn.addEventListener("click", () => this.submitAnswer(type));
    });

    // Setup difficulty selector
    this.difficultySelect.addEventListener("change", () => {
      this.difficulty = this.difficultySelect.value as AssessmentDifficulty;
      this.startNewChallenge();
    });

    // Setup next challenge button
    this.nextChallengeBtn.addEventListener("click", () =>
      this.startNewChallenge(),
    );

    // Add CSS styles
    this.injectStyles();
  }

  /**
   * Start a new challenge.
   * @internal
   */
  private startNewChallenge(): void {
    // Generate new challenge
    this.currentChallenge = this.engine.generateChallenge(this.difficulty);

    // Display challenge
    this.originalGenome.textContent = this.currentChallenge.original;
    this.mutatedGenome.textContent = this.currentChallenge.mutated;

    // Display hint if available
    if (this.currentChallenge.hint) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Hint:";
      p.textContent = "💡 ";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(` ${this.currentChallenge.hint}`));
      this.hintDisplay.replaceChildren(p);
      this.hintDisplay.style.display = "block";
    } else {
      this.hintDisplay.style.display = "none";
    }

    // Reset UI
    this.feedbackDisplay.replaceChildren();
    this.feedbackDisplay.style.display = "none";
    this.nextChallengeBtn.style.display = "none";

    // Enable answer buttons
    this.answerButtons.forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("correct", "incorrect");
    });
  }

  /**
   * Submit student's answer.
   * @internal
   */
  private submitAnswer(answer: MutationType): void {
    if (!this.currentChallenge) return;

    // Score the response
    const result = this.engine.scoreResponse(this.currentChallenge, answer);
    this.results.push(result);

    // Track challenge completion for achievements
    if (this.achievementEngine && this.achievementUI) {
      const unlocked = this.achievementEngine.trackChallengeCompleted(
        result.correct,
        this.currentChallenge.correctAnswer,
      );
      this.achievementUI.handleUnlocks(unlocked);
    }

    // Display feedback
    this.displayFeedback(result);

    // Disable answer buttons
    this.answerButtons.forEach((btn, type) => {
      btn.disabled = true;
      if (type === this.currentChallenge?.correctAnswer) {
        btn.classList.add("correct");
      } else if (type === answer) {
        btn.classList.add("incorrect");
      }
    });

    // Show next challenge button
    this.nextChallengeBtn.style.display = "inline-block";

    // Update progress
    this.updateProgress();
  }

  /**
   * Display feedback for answer.
   * @internal
   */
  private displayFeedback(result: AssessmentResult): void {
    const icon = result.correct ? "✅" : "❌";
    const className = result.correct
      ? "feedback-correct"
      : "feedback-incorrect";

    const container = document.createElement("div");
    container.className = className;

    const p1 = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${icon} ${result.correct ? "Correct!" : "Incorrect"}`;
    p1.appendChild(strong);

    const p2 = document.createElement("p");
    p2.textContent = result.feedback;

    container.appendChild(p1);
    container.appendChild(p2);

    this.feedbackDisplay.replaceChildren(container);
    this.feedbackDisplay.style.display = "block";
  }

  /**
   * Update progress display.
   * @internal
   */
  private updateProgress(): void {
    const progress = this.engine.calculateProgress(this.results);

    // Track perfect score achievement
    if (
      this.achievementEngine &&
      this.achievementUI &&
      progress.accuracy === 100
    ) {
      const unlocked = this.achievementEngine.trackPerfectScore();
      this.achievementUI.handleUnlocks(unlocked);
    }

    const accuracyColor =
      progress.accuracy >= 80
        ? "#28a745"
        : progress.accuracy >= 60
          ? "#ffc107"
          : "#dc3545";

    const summary = document.createElement("div");
    summary.className = "progress-summary";

    const h3 = document.createElement("h3");
    h3.textContent = "📊 Your Progress";
    summary.appendChild(h3);

    const stats = document.createElement("div");
    stats.className = "progress-stats";

    const createStatItem = (
      value: string | number,
      label: string,
      color?: string,
    ) => {
      const item = document.createElement("div");
      item.className = "stat-item";
      const valueDiv = document.createElement("div");
      valueDiv.className = "stat-value";
      valueDiv.textContent = String(value);
      if (color) valueDiv.style.color = color;
      const labelDiv = document.createElement("div");
      labelDiv.className = "stat-label";
      labelDiv.textContent = label;
      item.appendChild(valueDiv);
      item.appendChild(labelDiv);
      return item;
    };

    stats.appendChild(createStatItem(progress.totalAttempts, "Challenges"));
    stats.appendChild(createStatItem(progress.correctAnswers, "Correct"));
    stats.appendChild(
      createStatItem(
        `${progress.accuracy.toFixed(1)}%`,
        "Accuracy",
        accuracyColor,
      ),
    );

    summary.appendChild(stats);
    this.progressDisplay.replaceChildren(summary);
    this.progressDisplay.style.display = "block";
  }

  /**
   * Inject CSS styles into document.
   * @internal
   */
  private injectStyles(): void {
    if (document.getElementById("assessment-ui-styles")) return;

    const style = document.createElement("style");
    style.id = "assessment-ui-styles";
    style.textContent = `
      .assessment-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
      }

      .assessment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid #ddd;
      }

      .assessment-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .difficulty-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .challenge-section {
        background: #f9f9f9;
        padding: 25px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .challenge-question {
        margin-bottom: 20px;
      }

      .challenge-instructions {
        color: #666;
        font-size: 14px;
      }

      .genome-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }

      .genome-box {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #ddd;
      }

      .genome-box h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #333;
        font-size: 14px;
      }

      .genome-display {
        font-family: 'Courier New', monospace;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        word-break: break-all;
      }

      .hint-display {
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 20px;
      }

      .hint-display p {
        margin: 0;
        color: #856404;
      }

      .answer-section h4 {
        margin-bottom: 15px;
      }

      .answer-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      }

      .answer-btn {
        padding: 12px 20px;
        border: 2px solid #007bff;
        background: white;
        color: #007bff;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .answer-btn:hover:not(:disabled) {
        background: #007bff;
        color: white;
      }

      .answer-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .answer-btn.correct {
        background: #28a745;
        border-color: #28a745;
        color: white;
      }

      .answer-btn.incorrect {
        background: #dc3545;
        border-color: #dc3545;
        color: white;
      }

      .feedback-display {
        margin-bottom: 20px;
      }

      .feedback-correct {
        background: #d4edda;
        border: 1px solid #28a745;
        border-radius: 6px;
        padding: 15px;
        color: #155724;
      }

      .feedback-incorrect {
        background: #f8d7da;
        border: 1px solid #dc3545;
        border-radius: 6px;
        padding: 15px;
        color: #721c24;
      }

      .feedback-correct p, .feedback-incorrect p {
        margin: 5px 0;
      }

      .challenge-actions {
        text-align: center;
      }

      .next-challenge-btn {
        padding: 12px 30px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .next-challenge-btn:hover {
        background: #0056b3;
      }

      .progress-display {
        background: white;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #ddd;
      }

      .progress-summary h3 {
        margin-top: 0;
        margin-bottom: 15px;
      }

      .progress-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        text-align: center;
      }

      .stat-item {
        padding: 15px;
        background: #f9f9f9;
        border-radius: 6px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #333;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      @media (max-width: 768px) {
        .genome-comparison {
          grid-template-columns: 1fr;
        }

        .answer-buttons {
          grid-template-columns: repeat(2, 1fr);
        }

        .progress-stats {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
