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

/**
 * Tutorial Manager - Guides first-time users through creating their first program
 *
 * Manages interactive tutorial flow including step progression, validation,
 * and progress tracking. Persists completion state to localStorage to
 * prevent repeated tutorials for returning users.
 *
 * Features:
 * - Multi-step guided workflow
 * - Code validation for step completion
 * - Optional UI element highlighting
 * - Progress percentage calculation
 * - Completion persistence across sessions
 *
 * @example
 * ```typescript
 * const manager = new TutorialManager();
 * manager.start({
 *   id: 'getting-started',
 *   title: 'Getting Started',
 *   description: 'Learn CodonCanvas basics',
 *   steps: [
 *     {
 *       id: 'step1',
 *       title: 'Write ATG',
 *       content: 'Start with the ATG codon...',
 *       expectedCode: 'ATG'
 *     }
 *   ]
 * });
 *
 * const progress = manager.getProgress(); // { current: 0, total: 5, percent: 0 }
 * ```
 */
export class TutorialManager {
  private currentStep: number = 0;
  private config: TutorialConfig | null = null;
  private onStepChange?: (step: number) => void;
  private onComplete?: () => void;

  constructor(private storageKey: string = "codoncanvas_tutorial_completed") {}

  /**
   * Check if user has completed tutorial
   */
  isCompleted(): boolean {
    return localStorage.getItem(this.storageKey) === "true";
  }

  /**
   * Mark tutorial as completed
   */
  markCompleted(): void {
    localStorage.setItem(this.storageKey, "true");
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
    const percent = total > 0
      ? Math.round((this.currentStep / total) * 100)
      : 0;
    return { current: this.currentStep, total, percent };
  }

  /**
   * Validate current step
   */
  validateStep(code: string): boolean {
    const step = this.getCurrentStep();
    if (!step) {
      return false;
    }

    if (step.validationFn) {
      return step.validationFn(code);
    }

    if (step.expectedCode) {
      const normalized = (s: string) =>
        s.replace(/\s+/g, " ").trim().toUpperCase();
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
  id: "hello-circle",
  title: "Create Your First CodonCanvas Program",
  description: "Learn the basics by drawing a simple circle",
  steps: [
    {
      id: "welcome",
      title: "Welcome to CodonCanvas! 🧬",
      content:
        `CodonCanvas is a visual programming language that uses DNA-like triplets called <strong>codons</strong>.

Each codon is 3 letters from {A, C, G, T} and represents an instruction.

Let's create your first program: a simple circle!`,
      targetElement: ".editor-container",
    },
    {
      id: "start-codon",
      title: "Step 1: Begin with START",
      content:
        `Every CodonCanvas program begins with the <code>ATG</code> codon (START).

<strong>Type this in the editor:</strong>
<code>ATG</code>

This is like the "start codon" in real DNA - it marks where translation begins!`,
      targetElement: "textarea",
      expectedCode: "ATG",
      hint: "Type: ATG",
    },
    {
      id: "push-value",
      title: "Step 2: Push a Number",
      content:
        `To draw a circle, we need to tell it how big to be. We'll push the number 10 onto the stack.

<strong>Add this after ATG:</strong>
<code>GAA AGG</code>

• <code>GAA</code> means PUSH (put a number on the stack)
• <code>AGG</code> encodes the number 10

Your code should now be:
<code>ATG GAA AGG</code>`,
      targetElement: "textarea",
      expectedCode: "ATG GAA AGG",
      hint: "Type: GAA AGG (after ATG)",
    },
    {
      id: "draw-circle",
      title: "Step 3: Draw the Circle",
      content: `Now we'll draw the circle using the <code>GGA</code> codon.

<strong>Add this:</strong>
<code>GGA</code>

The GGA codon means CIRCLE - it takes the radius from the stack (our 10) and draws!

Your code:
<code>ATG GAA AGG GGA</code>

Look at the canvas - you should see a circle appear! 🎨`,
      targetElement: "canvas",
      expectedCode: "ATG GAA AGG GGA",
      hint: "Type: GGA",
    },
    {
      id: "stop-codon",
      title: "Step 4: End with STOP",
      content: `Every program needs to end properly. Add a STOP codon.

<strong>Add this:</strong>
<code>TAA</code>

TAA is a "stop codon" (just like in real DNA!). It ends the program.

<strong>Final code:</strong>
<code>ATG GAA AGG GGA TAA</code>

Congratulations! You've written your first CodonCanvas program! 🎉`,
      targetElement: "textarea",
      expectedCode: "ATG GAA AGG GGA TAA",
      hint: "Type: TAA",
    },
    {
      id: "explore",
      title: "What's Next?",
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
      targetElement: ".example-selector",
    },
  ],
};

/**
 * Mutation tutorial: Learn genetic mutation concepts
 */
export const mutationTutorial: TutorialConfig = {
  id: "mutation-concepts",
  title: "Understanding Genetic Mutations",
  description: "Learn how different mutation types affect your programs",
  steps: [
    {
      id: "welcome",
      title: "Welcome to Mutation Concepts! 🧬",
      content:
        `In genetics, <strong>mutations</strong> are changes to DNA sequences. Some have no effect, some change function, and some break everything.

CodonCanvas lets you explore these concepts visually!

We'll start with a simple "Hello Circle" program and apply different mutations to see their effects.

<strong>The Base Program:</strong>
<code>ATG GAA AGG GGA TAA</code>

This draws a circle. Let's see what happens when we mutate it!`,
      targetElement: "#editor",
    },
    {
      id: "silent-mutation",
      title: "Silent Mutation: Same Result",
      content:
        `A <strong>silent mutation</strong> changes the codon but keeps the same function (synonymous codons).

<strong>Try this change:</strong>
Change <code>GGA</code> → <code>GGC</code>

Both codons mean CIRCLE, so the output stays identical!

<strong>Edit your code to:</strong>
<code>ATG GAA AGG GGC TAA</code>

This is like changing DNA without changing the protein - the "phenotype" (visual output) is unchanged! ✅`,
      targetElement: "#editor",
      expectedCode: "ATG GAA AGG GGC TAA",
      hint: "Change GGA to GGC",
      validationFn: (code: string) => {
        const normalized = code.replace(/\s+/g, " ").trim().toUpperCase();
        return (
          normalized.includes("GGC") &&
          normalized.includes("ATG") &&
          normalized.includes("TAA")
        );
      },
    },
    {
      id: "missense-mutation",
      title: "Missense Mutation: Changed Function",
      content:
        `A <strong>missense mutation</strong> changes the codon to a different operation (different function).

<strong>Try this change:</strong>
Change <code>GGC</code> → <code>GCA</code>

GCA means TRIANGLE instead of CIRCLE!

<strong>Edit your code to:</strong>
<code>ATG GAA AGG GCA TAA</code>

Watch the output change shape. The "phenotype" is visibly different! 🔺

This is like a mutation that changes the protein's function.`,
      targetElement: "#canvasCurrent",
      expectedCode: "ATG GAA AGG GCA TAA",
      hint: "Change GGC to GCA",
      validationFn: (code: string) => {
        const normalized = code.replace(/\s+/g, " ").trim().toUpperCase();
        return (
          normalized.includes("GCA") &&
          normalized.includes("ATG") &&
          normalized.includes("TAA")
        );
      },
    },
    {
      id: "nonsense-mutation",
      title: "Nonsense Mutation: Early Stop",
      content:
        `A <strong>nonsense mutation</strong> introduces a premature STOP codon, ending the program early.

<strong>Try this change:</strong>
Change <code>GCA</code> → <code>TAA</code>

TAA is a STOP codon!

<strong>Edit your code to:</strong>
<code>ATG GAA AGG TAA TAA</code>

The program stops before drawing anything. The canvas is blank! ⛔

This is like a mutation that creates a truncated, non-functional protein.`,
      targetElement: "#canvasCurrent",
      expectedCode: "ATG GAA AGG TAA",
      hint: "Change GCA to TAA",
      validationFn: (code: string) => {
        const normalized = code.replace(/\s+/g, " ").trim().toUpperCase();
        const parts = normalized.split(/\s+/);
        const taaCount = parts.filter((p) => p === "TAA").length;
        return (
          taaCount >= 1 &&
          !normalized.includes("GCA") &&
          !normalized.includes("GGA")
        );
      },
    },
    {
      id: "frameshift-mutation",
      title: "Frameshift Mutation: Total Scramble",
      content:
        `A <strong>frameshift mutation</strong> inserts or deletes bases (not multiples of 3), shifting how codons are read.

Let's reset to: <code>ATG GAA AGG GGA TAA</code>

<strong>Now try this:</strong>
Delete just the first <code>A</code> from <code>GAA</code>

<strong>Edit your code to:</strong>
<code>ATG GA AGG GGA TAA</code>

The codons now read as: ATG, **G**AA, **GG**G, **GA**T, **AA** (incomplete!)

Everything downstream is scrambled! 💥 This is the most catastrophic mutation type.

<em>Note: This will likely error since the frame is broken.</em>`,
      targetElement: "#editor",
      expectedCode: "ATG GA AGG",
      hint: "Delete one A from GAA",
      validationFn: (code: string) => {
        const raw = code.replace(/\s+/g, "").toUpperCase();
        // Check if total length is NOT divisible by 3 (frameshift)
        return raw.length % 3 !== 0 && raw.startsWith("ATG");
      },
    },
    {
      id: "complete",
      title: "Mutation Master! 🏆",
      content: `Excellent work! You've learned the four main mutation types:

<strong>1. Silent</strong> - No effect (synonymous codons)
<strong>2. Missense</strong> - Changed function (different operation)
<strong>3. Nonsense</strong> - Early stop (truncated program)
<strong>4. Frameshift</strong> - Total scramble (catastrophic)

<strong>Key Insights:</strong>
• Reading frame matters (triplets)
• Redundancy protects against some changes
• Single-base changes can be catastrophic
• Some mutations are neutral, others break everything

<strong>Next Steps:</strong>
• Use the mutation buttons to try random mutations
• Explore more complex genomes
• Try creating your own patterns
• Challenge: Can you predict mutation effects before applying them?

Ready to experiment on your own?`,
      targetElement: ".button-grid",
    },
  ],
};

/**
 * Timeline tutorial: Learn step-by-step execution visualization
 */
export const timelineTutorial: TutorialConfig = {
  id: "timeline-execution",
  title: "Understanding Step-by-Step Execution",
  description: "Learn how your genome executes like a ribosome reading DNA",
  steps: [
    {
      id: "welcome",
      title: "Welcome to the Timeline! 🎬",
      content:
        `The <strong>Timeline Scrubber</strong> lets you watch your genome execute instruction-by-instruction, just like a ribosome reading DNA!

You can see:
• Each codon as it's processed
• The stack changing in real-time
• The canvas updating step-by-step
• VM state (position, rotation, color)

Let's explore how your "Hello Circle" program executes!`,
      targetElement: "#timelineContainer",
    },
    {
      id: "play-pause",
      title: "Play & Pause Controls",
      content: `First, let's learn the basic controls.

<strong>Try clicking the ▶️ Play button</strong> (or press spacebar)

Watch as the timeline advances automatically! The current instruction is highlighted and the canvas updates in real-time.

<strong>Now click ⏸ Pause</strong> to stop playback.

You're in control - you decide the pace of execution!`,
      targetElement: "#timelineContainer",
      hint: "Click the Play button, then Pause",
      validationFn: (code: string) => {
        // For timeline tutorial, we validate user interactions differently
        // This is a manual progression step
        return true;
      },
    },
    {
      id: "step-forward",
      title: "Single-Step Execution",
      content: `Now let's execute one instruction at a time.

<strong>Click the "Step →" button</strong>

Watch carefully:
• The timeline marker advances one codon
• The instruction panel shows what's executing
• The stack updates (if it's a PUSH)
• The canvas draws (if it's a shape command)

<strong>Try stepping through multiple times</strong> to see each instruction's effect.

This is like watching the ribosome move codon-by-codon! 🧬`,
      targetElement: "#timelineContainer",
      hint: "Click \"Step →\" to advance one instruction",
    },
    {
      id: "observe-stack",
      title: "Watch the Stack",
      content:
        `The <strong>stack</strong> is where numbers are stored before being used.

Look at the "Current State" panel while stepping:

<strong>Step to the PUSH instruction (GAA AGG)</strong>

You'll see:
• GAA AGG executes
• The number 10 appears in the stack: <code>[10]</code>
• Nothing draws yet (just storing the value)

<strong>Step to the CIRCLE instruction (GGA)</strong>

You'll see:
• GGA executes
• The stack becomes empty: <code>[]</code>
• The circle draws using radius 10!

The stack is temporary storage for drawing commands. 📦`,
      targetElement: "#timelineContainer",
      hint: "Watch the stack change as you step through",
    },
    {
      id: "state-changes",
      title: "VM State Tracking",
      content: `The VM (Virtual Machine) tracks the "state" of your program:

<strong>Current State shows:</strong>
• <strong>Position:</strong> Where on the canvas (x, y)
• <strong>Rotation:</strong> Current angle (for shapes)
• <strong>Scale:</strong> Size multiplier (default 1.0)
• <strong>Color:</strong> Current HSL color values

<strong>Try the "Reset" button</strong> to go back to the beginning and watch how state changes as you step through!

Each instruction can modify the state (TRANSLATE changes position, ROTATE changes angle, etc.)

This is how complex patterns are built! 🎨`,
      targetElement: "#timelineContainer",
      hint: "Reset and observe state changes",
    },
    {
      id: "complete",
      title: "Timeline Master! 🏆",
      content: `Excellent work! You've mastered timeline execution:

<strong>You learned:</strong>
• ▶️ Play/Pause for automatic playback
• Step → for single-instruction execution
• Stack observation (temporary storage)
• VM state tracking (position, rotation, scale, color)
• Reset to replay from the beginning

<strong>The Ribosome Metaphor:</strong>
Just like a ribosome reads mRNA codon-by-codon to build proteins, the CodonCanvas VM reads your genome triplet-by-triplet to build visuals!

<strong>Next Steps:</strong>
• Try loading "Two Shapes" or "Colorful Pattern" examples
• Step through to see how complex patterns build up
• Use different playback speeds (1x, 2x, 4x)
• Experiment with your own genomes!

<strong>Pro tip:</strong> Timeline is perfect for debugging - step through to find exactly where things go wrong!`,
      targetElement: "#timelineContainer",
    },
  ],
};

/**
 * Evolution Lab Tutorial: Understanding Natural Selection
 */
export const evolutionTutorial: TutorialConfig = {
  id: "evolution-lab",
  title: "Evolution Lab: Natural Selection in Action",
  description:
    "Learn how small mutations accumulate across generations through directed selection",
  steps: [
    {
      id: "welcome",
      title: "Welcome to the Evolution Lab! 🧬",
      content:
        `The <strong>Evolution Lab</strong> demonstrates natural selection through code!

You'll act as the <strong>fitness function</strong> - selecting which genomes survive to reproduce.

<strong>How it works:</strong>
• Generate 6 mutated candidates from a parent genome
• You select the "fittest" based on visual output
• Selected genome becomes the parent for the next generation
• Repeat to evolve toward a target pattern!

Let's evolve a simple circle into something more complex!`,
      targetElement: "#evolutionPanel",
    },
    {
      id: "generate-candidates",
      title: "Step 1: Generate Candidates",
      content: `First, let's create the first generation of mutants.

<strong>Click the "🧬 Generate Candidates" button</strong>

You'll see 6 candidate genomes appear, each with:
• A visual preview (phenotype)
• Mutation information (what changed)
• Unique ID for tracking

Each candidate has 1-2 random mutations from the parent genome.

This is like natural genetic variation in a population! 🎲`,
      targetElement: "#generateBtn",
      hint: "Click \"🧬 Generate Candidates\"",
      validationFn: (code: string) => {
        // Manual progression for evolution tutorial
        return true;
      },
    },
    {
      id: "visual-comparison",
      title: "Step 2: Visual Comparison",
      content: `Now look at all 6 candidates carefully.

<strong>Imagine you want to evolve toward a specific target</strong> (maybe more circles, different colors, or specific shapes).

<strong>For this tutorial, let's aim for:</strong>
"More visual complexity" (more shapes, transformations, or colors)

Look at each candidate:
• Which has the most interesting variation?
• Which moves closer to your imagined goal?
• Which would make a good parent for future generations?

<strong>Remember:</strong> You are the fitness function! Your preference determines which traits survive.

Take your time evaluating the phenotypes. 👁️`,
      targetElement: "#candidatesGrid",
      hint: "Visually compare all 6 candidates",
    },
    {
      id: "selection",
      title: "Step 4: Selection (Survival of the Fittest)",
      content: `Time to apply selection pressure!

<strong>Click on the candidate you think is "fittest"</strong> (most interesting, closest to your goal, or most promising for future generations).

When you click:
• The card gets a green border (selected)
• This genome becomes the parent for Generation 2
• It's the ONLY genome that survives to reproduce!

<strong>Natural Selection in Action:</strong>
In nature, organisms with favorable traits are more likely to reproduce. Here, only your selected genome reproduces - the other 5 "die out"!

This is how evolution creates cumulative change over time. 🏆`,
      targetElement: "#candidatesGrid",
      hint: "Click your favorite candidate",
    },
    {
      id: "multi-generation",
      title: "Step 5: Multi-Generation Evolution",
      content: `Excellent! You've completed Generation 1.

Notice:
• The <strong>Lineage panel</strong> appeared showing your evolutionary path
• Generation counter increased to 2
• Your selected genome is now the parent

<strong>Click "🧬 Generate Candidates" again</strong>

You'll see 6 NEW mutants - all descendants of your Generation 1 selection!

<strong>Key insight:</strong>
Mutations from Generation 1 are now "fixed" (permanent in the lineage). New mutations stack ON TOP of the old ones!

This is cumulative evolution - small changes accumulate into big differences! 🔄

<strong>Keep evolving:</strong> Generate and select 2-3 more times to see the pattern emerge.`,
      targetElement: "#generateBtn",
      hint: "Generate and select 2-3 more generations",
    },
    {
      id: "complete",
      title: "Evolution Master! 🏆",
      content: `Congratulations! You've mastered directed evolution:

<strong>You learned:</strong>
• 🧬 Generation: Creating mutated candidates
• 👁️ Evaluation: Visual phenotype comparison
• ✅ Selection: Choosing fittest for reproduction
• 📜 Lineage: Tracking cumulative mutations
• 🔄 Multi-Generation: Watching traits accumulate

<strong>The Natural Selection Metaphor:</strong>
Just like evolution in nature, favorable variations are selected and passed to offspring. Over many generations, this creates complex adaptations!

<strong>Key Differences from Nature:</strong>
• <strong>Directed:</strong> You choose (vs. environmental fitness)
• <strong>Fast:</strong> Generations in seconds (vs. years/millennia)
• <strong>Visual:</strong> Immediate phenotype feedback

<strong>Try These Challenges:</strong>
• Evolve toward a specific target (draw it first, then evolve to match)
• See how many generations to reach a goal
• Try starting from different base genomes (Mandala, Spiral, etc.)
• Compare different evolutionary paths from the same start

<strong>Pro tip:</strong> Use the Share button to export your evolved genome and challenge friends to match or exceed your result!

Happy evolving! 🚀`,
      targetElement: "#evolutionPanel",
    },
  ],
};
