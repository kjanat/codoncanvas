/**
 * Interactive Tutorial System
 * Guides first-time users through creating their first CodonCanvas program
 */

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string; // CSS selector for highlight
  expectedCode?: string; // For validation
  hint?: string;
  validationFn?: (code: string) => boolean;
}

export interface TutorialConfig {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
}

export class TutorialManager {
  private currentStep: number = 0;
  private config: TutorialConfig | null = null;
  private onStepChange?: (step: number) => void;
  private onComplete?: () => void;

  constructor(
    private storageKey: string = 'codoncanvas_tutorial_completed'
  ) {}

  /**
   * Check if user has completed tutorial
   */
  isCompleted(): boolean {
    return localStorage.getItem(this.storageKey) === 'true';
  }

  /**
   * Mark tutorial as completed
   */
  markCompleted(): void {
    localStorage.setItem(this.storageKey, 'true');
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Reset tutorial progress
   */
  reset(): void {
    localStorage.removeItem(this.storageKey);
    this.currentStep = 0;
  }

  /**
   * Start tutorial with given configuration
   */
  start(config: TutorialConfig): void {
    this.config = config;
    this.currentStep = 0;
    this.notifyStepChange();
  }

  /**
   * Get current step
   */
  getCurrentStep(): TutorialStep | null {
    if (!this.config || this.currentStep >= this.config.steps.length) {
      return null;
    }
    return this.config.steps[this.currentStep];
  }

  /**
   * Get step progress
   */
  getProgress(): { current: number; total: number; percent: number } {
    const total = this.config?.steps.length || 0;
    const percent = total > 0 ? Math.round((this.currentStep / total) * 100) : 0;
    return { current: this.currentStep, total, percent };
  }

  /**
   * Validate current step
   */
  validateStep(code: string): boolean {
    const step = this.getCurrentStep();
    if (!step) return false;

    if (step.validationFn) {
      return step.validationFn(code);
    }

    if (step.expectedCode) {
      const normalized = (s: string) => s.replace(/\s+/g, ' ').trim().toUpperCase();
      return normalized(code).includes(normalized(step.expectedCode));
    }

    return true;
  }

  /**
   * Move to next step if validation passes
   */
  nextStep(code: string): boolean {
    if (!this.validateStep(code)) {
      return false;
    }

    this.currentStep++;

    if (!this.getCurrentStep()) {
      // Tutorial complete
      this.markCompleted();
    } else {
      this.notifyStepChange();
    }

    return true;
  }

  /**
   * Move to previous step
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.notifyStepChange();
    }
  }

  /**
   * Skip tutorial entirely
   */
  skip(): void {
    this.markCompleted();
  }

  /**
   * Register step change callback
   */
  onStepChangeCallback(fn: (step: number) => void): void {
    this.onStepChange = fn;
  }

  /**
   * Register completion callback
   */
  onCompleteCallback(fn: () => void): void {
    this.onComplete = fn;
  }

  private notifyStepChange(): void {
    if (this.onStepChange) {
      this.onStepChange(this.currentStep);
    }
  }
}

/**
 * Default tutorial: Create "Hello Circle"
 */
export const helloCircleTutorial: TutorialConfig = {
  id: 'hello-circle',
  title: 'Create Your First CodonCanvas Program',
  description: 'Learn the basics by drawing a simple circle',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to CodonCanvas! 🧬',
      content: `CodonCanvas is a visual programming language that uses DNA-like triplets called <strong>codons</strong>.

Each codon is 3 letters from {A, C, G, T} and represents an instruction.

Let's create your first program: a simple circle!`,
      targetElement: '.editor-container',
    },
    {
      id: 'start-codon',
      title: 'Step 1: Begin with START',
      content: `Every CodonCanvas program begins with the <code>ATG</code> codon (START).

<strong>Type this in the editor:</strong>
<code>ATG</code>

This is like the "start codon" in real DNA - it marks where translation begins!`,
      targetElement: 'textarea',
      expectedCode: 'ATG',
      hint: 'Type: ATG',
    },
    {
      id: 'push-value',
      title: 'Step 2: Push a Number',
      content: `To draw a circle, we need to tell it how big to be. We'll push the number 10 onto the stack.

<strong>Add this after ATG:</strong>
<code>GAA AGG</code>

• <code>GAA</code> means PUSH (put a number on the stack)
• <code>AGG</code> encodes the number 10

Your code should now be:
<code>ATG GAA AGG</code>`,
      targetElement: 'textarea',
      expectedCode: 'ATG GAA AGG',
      hint: 'Type: GAA AGG (after ATG)',
    },
    {
      id: 'draw-circle',
      title: 'Step 3: Draw the Circle',
      content: `Now we'll draw the circle using the <code>GGA</code> codon.

<strong>Add this:</strong>
<code>GGA</code>

The GGA codon means CIRCLE - it takes the radius from the stack (our 10) and draws!

Your code:
<code>ATG GAA AGG GGA</code>

Look at the canvas - you should see a circle appear! 🎨`,
      targetElement: 'canvas',
      expectedCode: 'ATG GAA AGG GGA',
      hint: 'Type: GGA',
    },
    {
      id: 'stop-codon',
      title: 'Step 4: End with STOP',
      content: `Every program needs to end properly. Add a STOP codon.

<strong>Add this:</strong>
<code>TAA</code>

TAA is a "stop codon" (just like in real DNA!). It ends the program.

<strong>Final code:</strong>
<code>ATG GAA AGG GGA TAA</code>

Congratulations! You've written your first CodonCanvas program! 🎉`,
      targetElement: 'textarea',
      expectedCode: 'ATG GAA AGG GGA TAA',
      hint: 'Type: TAA',
    },
    {
      id: 'explore',
      title: 'What\'s Next?',
      content: `Great work! You've learned:
• How to start a program (ATG)
• How to push numbers (GAA + value)
• How to draw shapes (GGA for circles)
• How to stop a program (TAA)

<strong>Next steps:</strong>
• Try changing AGG to other codons to resize the circle
• Click the "Mutation Lab" button to see what happens when you mutate the code
• Explore the 20 example programs to learn more patterns

Ready to explore on your own?`,
      targetElement: '.example-selector',
    },
  ],
};
