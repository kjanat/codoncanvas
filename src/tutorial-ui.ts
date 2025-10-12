/**
 * Tutorial UI Component
 * Renders and manages the interactive tutorial interface
 */

import { TutorialManager, TutorialStep } from './tutorial';

export class TutorialUI {
  private manager: TutorialManager;
  private overlayElement: HTMLElement | null = null;
  private highlightedElement: HTMLElement | null = null;

  constructor(
    private container: HTMLElement,
    manager: TutorialManager
  ) {
    this.manager = manager;
    this.setupCallbacks();
  }

  private setupCallbacks(): void {
    this.manager.onStepChangeCallback(() => this.render());
    this.manager.onCompleteCallback(() => this.showSuccess());
  }

  /**
   * Show tutorial UI
   */
  show(): void {
    this.render();
  }

  /**
   * Hide and cleanup tutorial UI
   */
  hide(): void {
    this.cleanup();
  }

  /**
   * Render current tutorial step
   */
  private render(): void {
    this.cleanup();

    const step = this.manager.getCurrentStep();
    if (!step) return;

    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'tutorial-overlay';
    this.overlayElement.innerHTML = this.renderModal(step);

    document.body.appendChild(this.overlayElement);

    // Attach event listeners
    this.attachEventListeners();

    // Highlight target element if specified
    if (step.targetElement) {
      this.highlightElement(step.targetElement);
    }
  }

  private renderModal(step: TutorialStep): string {
    const progress = this.manager.getProgress();
    const isFirstStep = progress.current === 0;
    const isLastStep = progress.current === progress.total - 1;

    return `
      <div class="tutorial-modal">
        <div class="tutorial-header">
          <h2>${step.title}</h2>
          <div class="tutorial-progress">
            <div class="tutorial-progress-bar">
              <div class="tutorial-progress-fill" style="width: ${progress.percent}%"></div>
            </div>
            <span class="tutorial-progress-text">${progress.current + 1}/${progress.total}</span>
          </div>
        </div>

        <div class="tutorial-body">
          <div class="tutorial-step-content">
            ${step.content}
          </div>
          ${step.hint ? `<div class="tutorial-hint">${step.hint}</div>` : ''}
        </div>

        <div class="tutorial-footer">
          <button class="tutorial-button-skip" data-action="skip">
            Skip Tutorial
          </button>
          <div style="display: flex; gap: 12px;">
            ${!isFirstStep ? `
              <button class="tutorial-button tutorial-button-secondary" data-action="previous">
                ← Previous
              </button>
            ` : ''}
            <button
              class="tutorial-button tutorial-button-primary"
              data-action="next"
              ${step.expectedCode ? 'disabled' : ''}
            >
              ${isLastStep ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.overlayElement) return;

    // Next button
    const nextBtn = this.overlayElement.querySelector('[data-action="next"]') as HTMLButtonElement;
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleNext());
    }

    // Previous button
    const prevBtn = this.overlayElement.querySelector('[data-action="previous"]');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.handlePrevious());
    }

    // Skip button
    const skipBtn = this.overlayElement.querySelector('[data-action="skip"]');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.handleSkip());
    }

    // Prevent closing on overlay click (require explicit action)
    this.overlayElement.addEventListener('click', (e) => {
      if (e.target === this.overlayElement) {
        e.stopPropagation();
      }
    });
  }

  private handleNext(): void {
    const step = this.manager.getCurrentStep();
    if (!step) return;

    if (step.expectedCode) {
      // Need code validation
      const editor = document.querySelector('textarea') as HTMLTextAreaElement;
      if (!editor) return;

      const success = this.manager.nextStep(editor.value);
      if (!success) {
        this.showValidationError();
      }
    } else {
      // No validation needed
      this.manager.nextStep('');
    }
  }

  private handlePrevious(): void {
    this.manager.previousStep();
  }

  private handleSkip(): void {
    if (confirm('Are you sure you want to skip the tutorial? You can restart it later from the Help menu.')) {
      this.manager.skip();
      this.cleanup();
    }
  }

  private showValidationError(): void {
    const modal = this.overlayElement?.querySelector('.tutorial-modal');
    if (!modal) return;

    const step = this.manager.getCurrentStep();
    if (!step?.hint) return;

    // Shake animation
    modal.classList.add('shake');
    setTimeout(() => modal.classList.remove('shake'), 500);

    // Show hint prominently
    const hintElement = modal.querySelector('.tutorial-hint');
    if (hintElement) {
      hintElement.classList.add('highlight-hint');
      setTimeout(() => hintElement.classList.remove('highlight-hint'), 2000);
    }
  }

  private showSuccess(): void {
    this.cleanup();

    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'tutorial-overlay';
    this.overlayElement.innerHTML = `
      <div class="tutorial-modal">
        <div class="tutorial-body tutorial-success">
          <div class="tutorial-success-icon">🎉</div>
          <h3>Congratulations!</h3>
          <p>
            You've completed your first CodonCanvas program!<br>
            You now understand the basics of codon-based programming.
          </p>
          <div class="tutorial-success-actions">
            <button class="tutorial-button tutorial-button-primary" data-action="explore">
              Explore Examples
            </button>
            <button class="tutorial-button tutorial-button-secondary" data-action="mutations">
              Try Mutations
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlayElement);

    // Attach success action listeners
    const exploreBtn = this.overlayElement.querySelector('[data-action="explore"]');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        this.cleanup();
        // Trigger example selector focus
        const selector = document.querySelector('.example-selector') as HTMLSelectElement;
        if (selector) selector.focus();
      });
    }

    const mutationsBtn = this.overlayElement.querySelector('[data-action="mutations"]');
    if (mutationsBtn) {
      mutationsBtn.addEventListener('click', () => {
        this.cleanup();
        window.location.href = 'mutation-demo.html';
      });
    }
  }

  /**
   * Highlight a specific element in the UI
   */
  private highlightElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;

    // Store original classes
    const originalClasses = element.className;
    element.classList.add('tutorial-highlight');
    this.highlightedElement = element;

    // Restore on cleanup
    element.dataset.originalClasses = originalClasses;
  }

  /**
   * Enable/disable next button based on code validation
   */
  validateAndUpdateButton(code: string): void {
    if (!this.overlayElement) return;

    const step = this.manager.getCurrentStep();
    if (!step?.expectedCode) return;

    const nextBtn = this.overlayElement.querySelector('[data-action="next"]') as HTMLButtonElement;
    if (!nextBtn) return;

    const isValid = this.manager.validateStep(code);
    nextBtn.disabled = !isValid;

    if (isValid) {
      nextBtn.classList.add('pulse-success');
      setTimeout(() => nextBtn.classList.remove('pulse-success'), 1000);
    }
  }

  /**
   * Cleanup tutorial UI
   */
  private cleanup(): void {
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }

    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      const originalClasses = this.highlightedElement.dataset.originalClasses;
      if (originalClasses) {
        this.highlightedElement.className = originalClasses;
      }
      this.highlightedElement = null;
    }
  }
}

/**
 * Initialize tutorial system for the playground
 */
export function initializeTutorial(
  container: HTMLElement,
  manager: TutorialManager,
  editor: HTMLTextAreaElement
): TutorialUI {
  const ui = new TutorialUI(container, manager);

  // Auto-start tutorial for first-time users
  if (!manager.isCompleted()) {
    // Small delay to let playground load
    setTimeout(() => ui.show(), 1000);
  }

  // Listen to editor changes for validation
  editor.addEventListener('input', () => {
    ui.validateAndUpdateButton(editor.value);
  });

  return ui;
}
