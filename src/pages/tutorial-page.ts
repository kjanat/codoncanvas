/**
 * @fileoverview Tutorial Page (LEGACY)
 *
 * @deprecated This is a legacy vanilla JS page for pages/tutorial.html.
 * Use the React component instead: src/pages/Tutorial.tsx
 */

import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import { escapeHtml, getElementUnsafe as getElement } from "@/utils/dom";

// Types
interface TutorialLesson {
  id: string;
  module: number;
  lessonNumber: number;
  title: string;
  description: string;
  instructions: string[];
  starterCode: string;
  hints: string[];
  validation: {
    type: string;
    requiredCodons?: string[];
    minInstructions?: number;
    customValidator?: (code: string, canvas?: HTMLCanvasElement) => boolean;
  };
  learningObjectives: string[];
  nextLesson?: string;
}

interface TutorialProgress {
  completedLessons: string[];
  currentLesson: string;
  hintsUsed: Record<string, number>;
  attempts: Record<string, number>;
  startedAt: number;
  lastActivity: number;
}

interface ValidationResult {
  passed: boolean;
  errors: string[];
  hints: string[];
}

// Tutorial Engine implementation
class TutorialEngine {
  private lessons: Map<string, TutorialLesson> = new Map();
  private progress: TutorialProgress;

  constructor() {
    this.progress = this.loadProgress();
    this.initializeLessons();
  }

  private initializeLessons(): void {
    const lessons: TutorialLesson[] = [
      // MODULE 1: FIRST STEPS
      {
        id: "basics-1",
        module: 1,
        lessonNumber: 1,
        title: "Hello Circle - Your First Program",
        description:
          "Learn the basic structure of a CodonCanvas program by drawing a simple circle.",
        instructions: [
          "Every program starts with ATG (START codon)",
          "Use GAA to PUSH a number onto the stack",
          "The next codon after PUSH is read as a number (0-63)",
          "Use GGA to draw a CIRCLE with the radius from the stack",
          "End with TAA (STOP codon)",
        ],
        starterCode: "ATG\n\n\nTAA",
        hints: [
          "Try: ATG GAA CCC GGA TAA",
          "CCC encodes the number 21 (C=1, C=1, C=1 → 1×16 + 1×4 + 1 = 21)",
          "The circle will appear at the center with radius proportional to the number",
        ],
        validation: {
          type: "both",
          requiredCodons: ["ATG", "GAA", "GGA", "TAA"],
          minInstructions: 4,
        },
        learningObjectives: [
          "Understand START (ATG) and STOP (TAA) codons",
          "Learn to PUSH numeric values",
          "Draw basic shapes with CIRCLE",
        ],
        nextLesson: "basics-2",
      },
      {
        id: "basics-2",
        module: 1,
        lessonNumber: 2,
        title: "Moving Around - TRANSLATE",
        description:
          "Learn to move the drawing position to create compositions.",
        instructions: [
          "ACA is the TRANSLATE codon - it moves the drawing position",
          "TRANSLATE needs TWO numbers: dx (horizontal) and dy (vertical)",
          "Push two numbers, then use ACA to move",
          "Draw multiple shapes at different positions",
        ],
        starterCode: "ATG\nGAA AAT GGA\n\n\nTAA",
        hints: [
          "Add: GAA CCC GAA AAA ACA before the final TAA",
          "This pushes 21 for dx, 0 for dy, then translates",
          "Now add another PUSH and CIRCLE to draw at the new position",
        ],
        validation: {
          type: "both",
          requiredCodons: ["ATG", "ACA", "TAA"],
          minInstructions: 8,
        },
        learningObjectives: [
          "Use TRANSLATE to move drawing position",
          "Understand stack order (dy on top, dx below)",
          "Create multi-shape compositions",
        ],
        nextLesson: "basics-3",
      },
      {
        id: "basics-3",
        module: 1,
        lessonNumber: 3,
        title: "Adding Color - HSL Values",
        description: "Make your drawings colorful with the COLOR opcode.",
        instructions: [
          "TTA is the COLOR codon",
          "COLOR needs THREE numbers: Hue (0-360), Saturation (0-100), Lightness (0-100)",
          "For CodonCanvas, values are 0-63, scaled automatically",
          "Push three values, then use TTA to set color",
        ],
        starterCode: "ATG\nGAA AAT GGA\nTAA",
        hints: [
          "Insert before GGA: GAA TCC GAA CCC GAA CCC TTA",
          "This sets color: H≈53, S≈21, L≈21 (dark reddish)",
          "Try different values to explore the color space",
        ],
        validation: {
          type: "code",
          requiredCodons: ["TTA"],
          minInstructions: 7,
        },
        learningObjectives: [
          "Understand HSL color model",
          "Use COLOR opcode with three stack values",
          "Experiment with color values",
        ],
        nextLesson: "mutations-1",
      },

      // MODULE 2: MUTATIONS
      {
        id: "mutations-1",
        module: 2,
        lessonNumber: 1,
        title: "Silent Mutations - Same Output",
        description:
          "Discover synonymous codons that produce identical results.",
        instructions: [
          "Many codons map to the SAME opcode (like real genetic code)",
          "GGA, GGC, GGG, GGT all produce CIRCLE",
          "Change one of these to another - the output stays the same",
          "This demonstrates genetic redundancy",
        ],
        starterCode: "ATG\nGAA AAT GGA\nTAA",
        hints: [
          "Try changing GGA to GGC",
          "Or change it to GGG or GGT",
          "All four are synonymous - they all mean CIRCLE",
        ],
        validation: {
          type: "code",
          requiredCodons: ["ATG", "TAA"],
          customValidator: (code: string): boolean => {
            const circleCount = (code.match(/GG[ACGT]/g) || []).length;
            return circleCount >= 1;
          },
        },
        learningObjectives: [
          "Understand codon redundancy",
          "Identify synonymous codons",
          "See that mutations can be neutral",
        ],
        nextLesson: "mutations-2",
      },
      {
        id: "mutations-2",
        module: 2,
        lessonNumber: 2,
        title: "Missense Mutations - Different Shape",
        description:
          "Change the function by switching to a different opcode family.",
        instructions: [
          "Changing to a DIFFERENT codon family creates a missense mutation",
          "GGA (CIRCLE) → CCA (RECT) changes the shape",
          "RECT needs TWO values (width, height), so add another PUSH",
          "Observe how the phenotype changes dramatically",
        ],
        starterCode: "ATG\nGAA AAT GGA\nTAA",
        hints: [
          "Change GGA to CCA (CIRCLE → RECT)",
          "Add another GAA AAT before CCA for the second dimension",
          "Now you have: GAA AAT GAA AAT CCA",
        ],
        validation: {
          type: "code",
          requiredCodons: ["CCA", "CCG", "CCC", "CCT"],
          minInstructions: 6,
        },
        learningObjectives: [
          "Understand missense mutations",
          "See how changing opcode changes phenotype",
          "Adapt code to new opcode requirements",
        ],
        nextLesson: "mutations-3",
      },
      {
        id: "mutations-3",
        module: 2,
        lessonNumber: 3,
        title: "Nonsense Mutations - Early Stop",
        description: "Insert a STOP codon early to truncate the program.",
        instructions: [
          "TAA, TAG, TGA are all STOP codons",
          "Inserting STOP early creates a nonsense mutation",
          "The program terminates before drawing everything",
          "This mimics premature termination in protein synthesis",
        ],
        starterCode: "ATG\nGAA AAT GGA\nGAA CCC GAA AAA ACA\nGAA AGG GGA\nTAA",
        hints: [
          "Insert TAA or TAG after the first GGA",
          "The second circle will disappear",
          "Try removing the early STOP to restore full output",
        ],
        validation: {
          type: "code",
          customValidator: (code: string): boolean => {
            const stops = (code.match(/TAA|TAG|TGA/g) || []).length;
            return stops >= 2;
          },
        },
        learningObjectives: [
          "Understand nonsense mutations",
          "See truncation effects",
          "Recognize all three STOP codons",
        ],
        nextLesson: "mutations-4",
      },
      {
        id: "mutations-4",
        module: 2,
        lessonNumber: 4,
        title: "Frameshift - Reading Frame Chaos",
        description:
          "Insert or delete bases to shift the reading frame downstream.",
        instructions: [
          "Inserting/deleting 1-2 bases shifts the reading frame",
          "All downstream codons are reinterpreted",
          "GAA AGG → GA AAG G... (if you delete one A)",
          "This creates dramatic, unpredictable changes",
        ],
        starterCode: "ATG\nGAA AAT GGA\nGAA CCC GAA AAA ACA\nGAA AGG GGA\nTAA",
        hints: [
          "Delete one A from GAA to make GA",
          "Or insert an extra C anywhere in the middle",
          "Watch the whole downstream sequence scramble",
        ],
        validation: {
          type: "code",
          customValidator: (code: string): boolean => {
            const cleaned = code.replace(/\s+/g, "");
            return cleaned.length % 3 !== 0;
          },
        },
        learningObjectives: [
          "Understand frameshift mutations",
          "See global effects of local changes",
          "Appreciate reading frame importance",
        ],
        nextLesson: "advanced-1",
      },

      // MODULE 3: ADVANCED TECHNIQUES
      {
        id: "advanced-1",
        module: 3,
        lessonNumber: 1,
        title: "Stack Magic - DUP and SWAP",
        description: "Use stack operations to reuse values efficiently.",
        instructions: [
          "ATA is DUP - duplicates the top stack value",
          "TGG is SWAP - swaps the top two values",
          "Use DUP to draw multiple shapes with the same size",
          "Use SWAP to reorder values without pushing again",
        ],
        starterCode: "ATG\nGAA AGG\n\nTAA",
        hints: [
          "Add ATA after GAA AGG to duplicate the value",
          "Now you have [10, 10] on the stack",
          "Add GGA to draw a circle with radius 10",
          "The duplicate is still there - add another GGA",
        ],
        validation: {
          type: "code",
          requiredCodons: ["ATA", "ATC", "ATT"],
        },
        learningObjectives: [
          "Master stack manipulation",
          "Use DUP for efficiency",
          "Understand stack-based programming",
        ],
        nextLesson: "advanced-2",
      },
      {
        id: "advanced-2",
        module: 3,
        lessonNumber: 2,
        title: "Rotation and Scale",
        description: "Transform your drawings with rotation and scaling.",
        instructions: [
          "AGA is ROTATE - rotates drawing direction in degrees",
          "CGA is SCALE - scales subsequent drawing operations",
          "Combine with TRANSLATE for complex compositions",
          "Create patterns with repeated transformations",
        ],
        starterCode: "ATG\nGAA AAT GGA\nTAA",
        hints: [
          "Add: GAA GCC AGA (rotate by 37 degrees)",
          "Add: GAA CCC GAA AAA ACA (translate)",
          "Add: GAA AAT GGA (draw another circle)",
        ],
        validation: {
          type: "code",
          requiredCodons: ["AGA", "AGC", "AGG", "AGT"],
          minInstructions: 8,
        },
        learningObjectives: [
          "Use ROTATE to change drawing direction",
          "Apply SCALE for size transformations",
          "Combine transforms for complex effects",
        ],
        nextLesson: "advanced-3",
      },
      {
        id: "advanced-3",
        module: 3,
        lessonNumber: 3,
        title: "Creative Challenge - Make Art!",
        description:
          "Apply everything you have learned to create your own design.",
        instructions: [
          "Use any combination of opcodes you have learned",
          "Create a design with at least 3 different shapes",
          "Use at least 2 colors",
          "Use transforms (TRANSLATE, ROTATE, or SCALE)",
          "Be creative - there are no wrong answers!",
        ],
        starterCode: "ATG\n\n\n\n\nTAA",
        hints: [
          "Start with a plan: what shapes and where?",
          "Use comments (;) to organize your code sections",
          "Try creating: a flower, a face, a pattern, or abstract art",
        ],
        validation: {
          type: "code",
          minInstructions: 15,
          customValidator: (code: string): boolean => {
            const hasMultipleShapes =
              (code.match(/GG[ACGT]|CC[ACGT]|AA[ACGT]|GC[ACGT]/g) || [])
                .length >= 3;
            const hasColor = /TT[ACGT]/.test(code);
            const hasTransform = /AC[ACGT]|AG[ACGT]|CG[ACGT]/.test(code);
            return hasMultipleShapes && hasColor && hasTransform;
          },
        },
        learningObjectives: [
          "Apply all learned concepts creatively",
          "Plan and structure complex programs",
          "Express creativity through code",
        ],
        nextLesson: undefined,
      },
    ];

    for (const lesson of lessons) {
      this.lessons.set(lesson.id, lesson);
    }
  }

  private loadProgress(): TutorialProgress {
    const saved = localStorage.getItem("codoncanvas-tutorial-progress");
    if (saved) {
      return JSON.parse(saved) as TutorialProgress;
    }
    return {
      completedLessons: [],
      currentLesson: "basics-1",
      hintsUsed: {},
      attempts: {},
      startedAt: Date.now(),
      lastActivity: Date.now(),
    };
  }

  saveProgress(): void {
    this.progress.lastActivity = Date.now();
    localStorage.setItem(
      "codoncanvas-tutorial-progress",
      JSON.stringify(this.progress),
    );
  }

  getLesson(id: string): TutorialLesson | undefined {
    return this.lessons.get(id);
  }

  getCurrentLesson(): TutorialLesson {
    const lesson = this.lessons.get(this.progress.currentLesson);
    if (lesson) return lesson;
    const fallback = this.lessons.get("basics-1");
    if (!fallback) {
      throw new Error("Tutorial lesson 'basics-1' not found");
    }
    return fallback;
  }

  getAllLessons(): TutorialLesson[] {
    return Array.from(this.lessons.values()).sort((a, b) => {
      if (a.module !== b.module) return a.module - b.module;
      return a.lessonNumber - b.lessonNumber;
    });
  }

  getLessonsByModule(module: number): TutorialLesson[] {
    return this.getAllLessons().filter((l) => l.module === module);
  }

  setCurrentLesson(id: string): void {
    if (this.lessons.has(id)) {
      this.progress.currentLesson = id;
      this.saveProgress();
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: validation logic requires multiple condition checks
  validateLesson(
    lessonId: string,
    code: string,
    canvas?: HTMLCanvasElement,
  ): ValidationResult {
    const lesson = this.lessons.get(lessonId);
    if (!lesson) {
      return { passed: false, errors: ["Lesson not found"], hints: [] };
    }

    const errors: string[] = [];
    const hints: string[] = [];

    this.progress.attempts[lessonId] =
      (this.progress.attempts[lessonId] || 0) + 1;

    try {
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize(code);

      if (lesson.validation.requiredCodons) {
        const codeUpper = code.toUpperCase().replace(/\s+/g, " ");
        for (const required of lesson.validation.requiredCodons) {
          if (!codeUpper.includes(required)) {
            errors.push(`Missing required codon: ${required}`);
          }
        }
      }

      if (
        lesson.validation.minInstructions &&
        tokens.length < lesson.validation.minInstructions
      ) {
        errors.push(
          `Too few instructions (need at least ${lesson.validation.minInstructions})`,
        );
        hints.push("Try adding more operations to complete the task");
      }

      if (lesson.validation.customValidator) {
        if (!lesson.validation.customValidator(code, canvas)) {
          errors.push("Custom validation failed - check the requirements");
        }
      }
    } catch (error) {
      errors.push(
        `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const passed = errors.length === 0;

    if (passed && !this.progress.completedLessons.includes(lessonId)) {
      this.markComplete(lessonId);
    }

    return { passed, errors, hints };
  }

  markComplete(lessonId: string): void {
    if (!this.progress.completedLessons.includes(lessonId)) {
      this.progress.completedLessons.push(lessonId);

      const lesson = this.lessons.get(lessonId);
      if (lesson?.nextLesson) {
        this.progress.currentLesson = lesson.nextLesson;
      }

      this.saveProgress();
    }
  }

  recordHintUsage(lessonId: string): void {
    this.progress.hintsUsed[lessonId] =
      (this.progress.hintsUsed[lessonId] || 0) + 1;
    this.saveProgress();
  }

  getProgress(): TutorialProgress {
    return { ...this.progress };
  }

  getCompletionPercentage(): number {
    return Math.round(
      (this.progress.completedLessons.length / this.lessons.size) * 100,
    );
  }
}

// Initialize
const tutorial = new TutorialEngine();
const lexer = new CodonLexer();
let currentLesson: TutorialLesson = tutorial.getCurrentLesson();

// DOM Elements
const codeEditor = document.getElementById(
  "code-editor",
) as HTMLTextAreaElement;
const canvas = document.getElementById("output-canvas") as HTMLCanvasElement;
const moduleBadge = getElement("module-badge");
const lessonTitle = getElement("lesson-title");
const lessonDescription = getElement("lesson-description");
const instructionList = getElement("instruction-list");
const starterCodeSection = getElement("starter-code-section");
const starterCode = getElement("starter-code");
const hintToggle = getElement("hint-toggle");
const hintContent = getElement("hint-content");
const hintArrow = getElement("hint-arrow");
const objectivesList = getElement("objectives-list");
const validationMessage = getElement("validation-message");
const progressFill = getElement("progress-fill");
const progressText = getElement("progress-text");
const prevBtn = document.getElementById("prev-btn") as HTMLButtonElement;
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;
const validateBtn = document.getElementById(
  "validate-btn",
) as HTMLButtonElement;
const moduleSelector = getElement("module-selector");
const modulesGrid = getElement("modules-grid");
const completionBadge = getElement("completion-badge");
const completionMessage = getElement("completion-message");

// Initialize renderer
const renderer = new Canvas2DRenderer(canvas);
const vm = new CodonVM(renderer);

// Load lesson
function loadLesson(lesson: TutorialLesson): void {
  currentLesson = lesson;

  // Update header
  moduleBadge.textContent = `MODULE ${lesson.module}`;
  lessonTitle.textContent = lesson.title;
  lessonDescription.textContent = lesson.description;

  // Instructions
  instructionList.innerHTML = "";
  for (const instruction of lesson.instructions) {
    const li = document.createElement("li");
    li.textContent = instruction;
    instructionList.appendChild(li);
  }

  // Starter code
  if (lesson.starterCode) {
    starterCodeSection.style.display = "block";
    starterCode.textContent = lesson.starterCode;
    codeEditor.value = lesson.starterCode;
  } else {
    starterCodeSection.style.display = "none";
    codeEditor.value = "";
  }

  // Hints
  hintContent.innerHTML = "";
  for (const hint of lesson.hints) {
    const div = document.createElement("div");
    div.className = "hint-item";
    div.textContent = hint;
    hintContent.appendChild(div);
  }

  // Objectives
  objectivesList.innerHTML = "";
  for (const obj of lesson.learningObjectives) {
    const li = document.createElement("li");
    li.textContent = obj;
    objectivesList.appendChild(li);
  }

  // Reset hints
  hintContent.classList.remove("show");
  hintArrow.textContent = "▼";

  // Clear validation
  validationMessage.classList.remove("show", "success", "error");

  // Update progress
  updateProgress();

  // Run initial code
  runCode();

  // Update navigation
  updateNavigation();
}

// Run code
function runCode(): void {
  const code = codeEditor.value;

  try {
    const tokens = lexer.tokenize(code);
    vm.reset();
    renderer.clear();
    vm.run(tokens);
  } catch (error) {
    console.warn("Execution error:", error);
  }
}

// Validate lesson
function validateLesson(): void {
  const code = codeEditor.value;
  const result = tutorial.validateLesson(currentLesson.id, code, canvas);

  validationMessage.classList.add("show");

  if (result.passed) {
    validationMessage.className = "validation-message show success";
    validationMessage.innerHTML = `
      <div><strong>✓ Excellent work!</strong> You've completed this lesson.</div>
    `;

    // Show completion badge
    const progress = tutorial.getProgress();
    const completedCount = progress.completedLessons.length;
    const totalLessons = tutorial.getAllLessons().length;

    if (completedCount === totalLessons) {
      completionMessage.textContent = `You've completed all ${totalLessons} lessons! You're now a CodonCanvas expert! 🎉`;
    } else {
      completionMessage.textContent = `Great job! You've completed ${completedCount} of ${totalLessons} lessons. Keep going!`;
    }

    completionBadge.classList.add("show");

    updateProgress();
    updateNavigation();
  } else {
    validationMessage.className = "validation-message show error";
    let errorsHTML =
      "<div><strong>✗ Not quite right.</strong> Here's what needs attention:</div>";

    if (result.errors.length > 0) {
      errorsHTML += '<ul class="validation-errors">';
      for (const error of result.errors) {
        errorsHTML += `<li>${escapeHtml(error)}</li>`;
      }
      errorsHTML += "</ul>";
    }

    if (result.hints.length > 0) {
      errorsHTML +=
        '<div style="margin-top: 8px;"><em>Hint: ' +
        escapeHtml(result.hints[0]) +
        "</em></div>";
    }

    validationMessage.innerHTML = errorsHTML;
  }
}

// Navigation
function nextLessonNav(): void {
  const lesson = currentLesson;
  if (lesson.nextLesson) {
    const next = tutorial.getLesson(lesson.nextLesson);
    if (next) {
      tutorial.setCurrentLesson(next.id);
      loadLesson(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } else {
    // Module complete - show selector
    showModuleSelector();
  }
}

function previousLesson(): void {
  const allLessons = tutorial.getAllLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);

  if (currentIndex > 0) {
    const prev = allLessons[currentIndex - 1];
    tutorial.setCurrentLesson(prev.id);
    loadLesson(prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function updateNavigation(): void {
  const allLessons = tutorial.getAllLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const progress = tutorial.getProgress();
  const isCompleted = progress.completedLessons.includes(currentLesson.id);

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = !isCompleted && !currentLesson.nextLesson;

  if (!currentLesson.nextLesson) {
    nextBtn.innerHTML = "<span>🏠</span><span>Choose Module</span>";
  } else {
    nextBtn.innerHTML = "<span>Next</span><span>→</span>";
  }
}

// Progress
function updateProgress(): void {
  const percent = tutorial.getCompletionPercentage();
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
}

// Module Selector
function showModuleSelector(): void {
  const modules = [
    {
      number: 1,
      title: "First Steps",
      description: "Learn the basics of CodonCanvas",
      lessons: 3,
    },
    {
      number: 2,
      title: "Mutations",
      description: "Explore genetic mutation types",
      lessons: 4,
    },
    {
      number: 3,
      title: "Advanced Techniques",
      description: "Master complex compositions",
      lessons: 3,
    },
  ];

  modulesGrid.innerHTML = "";
  const progress = tutorial.getProgress();

  for (const module of modules) {
    const moduleLessons = tutorial.getLessonsByModule(module.number);
    const completedInModule = moduleLessons.filter((l) =>
      progress.completedLessons.includes(l.id),
    ).length;
    const isCompleted = completedInModule === moduleLessons.length;

    const card = document.createElement("div");
    card.className = `module-card${isCompleted ? " completed" : ""}`;
    card.innerHTML = `
      <div class="module-number">Module ${module.number}</div>
      <div class="module-title">${module.title}</div>
      <div class="module-description">${module.description}</div>
      <div class="module-lessons">${completedInModule}/${module.lessons} lessons completed</div>
    `;

    card.onclick = () => {
      const firstLesson = moduleLessons[0];
      tutorial.setCurrentLesson(firstLesson.id);
      loadLesson(firstLesson);
      moduleSelector.classList.add("hidden");
    };

    modulesGrid.appendChild(card);
  }

  moduleSelector.classList.remove("hidden");
}

function hideCompletionBadge(): void {
  completionBadge.classList.remove("show");
}

// Bind event listeners for buttons
document.getElementById("exit-tutorial-btn")?.addEventListener("click", () => {
  window.location.href = "index.html";
});
document
  .getElementById("completion-continue-btn")
  ?.addEventListener("click", hideCompletionBadge);

// Event listeners
codeEditor.addEventListener("input", () => {
  setTimeout(runCode, 300);
});

hintToggle.addEventListener("click", () => {
  const isShown = hintContent.classList.toggle("show");
  hintArrow.textContent = isShown ? "▲" : "▼";

  if (isShown) {
    tutorial.recordHintUsage(currentLesson.id);
  }
});

validateBtn.addEventListener("click", validateLesson);
prevBtn.addEventListener("click", previousLesson);
nextBtn.addEventListener("click", nextLessonNav);

// Initialize - show module selector first
updateProgress();
showModuleSelector();

// If there's a current lesson loaded, hide selector
if (
  tutorial.getProgress().completedLessons.length > 0 ||
  (tutorial.getProgress().attempts &&
    Object.keys(tutorial.getProgress().attempts).length > 0)
) {
  loadLesson(currentLesson);
  moduleSelector.classList.add("hidden");
}
