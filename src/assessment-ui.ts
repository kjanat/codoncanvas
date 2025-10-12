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

import { AssessmentEngine, Challenge, AssessmentResult, DifficultyLevel } from './assessment-engine';
import { MutationType } from './mutations';

/**
 * UI manager for assessment mode.
 * Handles challenge display, answer submission, and progress tracking.
 */
export class AssessmentUI {
  private engine: AssessmentEngine;
  private container: HTMLElement;
  private currentChallenge: Challenge | null = null;
  private results: AssessmentResult[] = [];
  private difficulty: DifficultyLevel = 'easy';

  // UI Elements (created dynamically)
  private challengeSection!: HTMLDivElement;
  private originalGenome!: HTMLDivElement;
  private mutatedGenome!: HTMLDivElement;
  private hintDisplay!: HTMLDivElement;
  private answerButtons!: Map<MutationType, HTMLButtonElement>;
  private feedbackDisplay!: HTMLDivElement;
  private progressDisplay!: HTMLDivElement;
  private nextChallengeBtn!: HTMLButtonElement;
  private difficultySelect!: HTMLSelectElement;

  constructor(engine: AssessmentEngine, container: HTMLElement) {
    this.engine = engine;
    this.container = container;
    this.answerButtons = new Map();
    this.createUI();
  }

  /**
   * Show assessment mode UI.
   */
  show(): void {
    this.container.style.display = 'block';
    this.startNewChallenge();
  }

  /**
   * Hide assessment mode UI.
   */
  hide(): void {
    this.container.style.display = 'none';
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
    return JSON.stringify({
      results: this.results,
      progress,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  // ============= Private Methods =============

  /**
   * Create UI structure.
   * @internal
   */
  private createUI(): void {
    this.container.innerHTML = `
      <div class="assessment-container">
        <div class="assessment-header">
          <h2>🎓 Mutation Assessment Challenge</h2>
          <div class="assessment-controls">
            <label for="difficulty-select">Difficulty:</label>
            <select id="difficulty-select" class="difficulty-select">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div class="challenge-section">
          <div class="challenge-question">
            <h3>What type of mutation occurred?</h3>
            <p class="challenge-instructions">
              Compare the two genomes below and identify the mutation type.
            </p>
          </div>

          <div class="genome-comparison">
            <div class="genome-box">
              <h4>Original Genome:</h4>
              <div id="original-genome" class="genome-display"></div>
            </div>
            <div class="genome-box">
              <h4>Mutated Genome:</h4>
              <div id="mutated-genome" class="genome-display"></div>
            </div>
          </div>

          <div id="hint-display" class="hint-display"></div>

          <div class="answer-section">
            <h4>Select your answer:</h4>
            <div class="answer-buttons">
              <button class="answer-btn" data-type="silent">Silent</button>
              <button class="answer-btn" data-type="missense">Missense</button>
              <button class="answer-btn" data-type="nonsense">Nonsense</button>
              <button class="answer-btn" data-type="frameshift">Frameshift</button>
              <button class="answer-btn" data-type="insertion">Insertion</button>
              <button class="answer-btn" data-type="deletion">Deletion</button>
            </div>
          </div>

          <div id="feedback-display" class="feedback-display"></div>

          <div class="challenge-actions">
            <button id="next-challenge-btn" class="next-challenge-btn">
              Next Challenge →
            </button>
          </div>
        </div>

        <div id="progress-display" class="progress-display"></div>
      </div>
    `;

    // Cache element references
    this.challengeSection = this.container.querySelector('.challenge-section')!;
    this.originalGenome = document.getElementById('original-genome')! as HTMLDivElement;
    this.mutatedGenome = document.getElementById('mutated-genome')! as HTMLDivElement;
    this.hintDisplay = document.getElementById('hint-display')! as HTMLDivElement;
    this.feedbackDisplay = document.getElementById('feedback-display')! as HTMLDivElement;
    this.progressDisplay = document.getElementById('progress-display')! as HTMLDivElement;
    this.nextChallengeBtn = document.getElementById('next-challenge-btn')! as HTMLButtonElement;
    this.difficultySelect = document.getElementById('difficulty-select')! as HTMLSelectElement;

    // Setup answer buttons
    const buttons = this.container.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
      const type = (btn as HTMLButtonElement).dataset.type as MutationType;
      this.answerButtons.set(type, btn as HTMLButtonElement);

      btn.addEventListener('click', () => this.submitAnswer(type));
    });

    // Setup difficulty selector
    this.difficultySelect.addEventListener('change', () => {
      this.difficulty = this.difficultySelect.value as DifficultyLevel;
      this.startNewChallenge();
    });

    // Setup next challenge button
    this.nextChallengeBtn.addEventListener('click', () => this.startNewChallenge());

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
      this.hintDisplay.innerHTML = `<p>💡 <strong>Hint:</strong> ${this.currentChallenge.hint}</p>`;
      this.hintDisplay.style.display = 'block';
    } else {
      this.hintDisplay.style.display = 'none';
    }

    // Reset UI
    this.feedbackDisplay.innerHTML = '';
    this.feedbackDisplay.style.display = 'none';
    this.nextChallengeBtn.style.display = 'none';

    // Enable answer buttons
    this.answerButtons.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('correct', 'incorrect');
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

    // Display feedback
    this.displayFeedback(result);

    // Disable answer buttons
    this.answerButtons.forEach((btn, type) => {
      btn.disabled = true;
      if (type === this.currentChallenge!.correctAnswer) {
        btn.classList.add('correct');
      } else if (type === answer) {
        btn.classList.add('incorrect');
      }
    });

    // Show next challenge button
    this.nextChallengeBtn.style.display = 'inline-block';

    // Update progress
    this.updateProgress();
  }

  /**
   * Display feedback for answer.
   * @internal
   */
  private displayFeedback(result: AssessmentResult): void {
    const icon = result.correct ? '✅' : '❌';
    const className = result.correct ? 'feedback-correct' : 'feedback-incorrect';

    this.feedbackDisplay.innerHTML = `
      <div class="${className}">
        <p><strong>${icon} ${result.correct ? 'Correct!' : 'Incorrect'}</strong></p>
        <p>${result.feedback}</p>
      </div>
    `;
    this.feedbackDisplay.style.display = 'block';
  }

  /**
   * Update progress display.
   * @internal
   */
  private updateProgress(): void {
    const progress = this.engine.calculateProgress(this.results);

    const accuracyColor = progress.accuracy >= 80 ? '#28a745' :
                         progress.accuracy >= 60 ? '#ffc107' : '#dc3545';

    this.progressDisplay.innerHTML = `
      <div class="progress-summary">
        <h3>📊 Your Progress</h3>
        <div class="progress-stats">
          <div class="stat-item">
            <div class="stat-value">${progress.totalAttempts}</div>
            <div class="stat-label">Challenges</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${progress.correctAnswers}</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" style="color: ${accuracyColor}">
              ${progress.accuracy.toFixed(1)}%
            </div>
            <div class="stat-label">Accuracy</div>
          </div>
        </div>
      </div>
    `;
    this.progressDisplay.style.display = 'block';
  }

  /**
   * Inject CSS styles into document.
   * @internal
   */
  private injectStyles(): void {
    if (document.getElementById('assessment-ui-styles')) return;

    const style = document.createElement('style');
    style.id = 'assessment-ui-styles';
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
