import { beforeEach, describe, expect, test } from "bun:test";
import {
  evolutionTutorial,
  helloCircleTutorial,
  mutationTutorial,
  TutorialManager,
  timelineTutorial,
} from "@/tutorial";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("TutorialManager", () => {
  let manager: TutorialManager;

  beforeEach(() => {
    localStorage.clear();
    manager = new TutorialManager("test_tutorial");
  });

  describe("initialization", () => {
    test("should start uncompleted", () => {
      expect(manager.isCompleted()).toBe(false);
    });

    test("should start tutorial with config", () => {
      manager.start(helloCircleTutorial);
      const step = manager.getCurrentStep();
      expect(step).toBeTruthy();
      expect(step?.id).toBe("welcome");
    });
  });

  describe("step progression", () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    test("should get progress correctly", () => {
      const progress = manager.getProgress();
      expect(progress.current).toBe(0);
      expect(progress.total).toBe(6);
      expect(progress.percent).toBe(0);
    });

    test("should move to next step when validation passes", () => {
      // First step has no validation
      const success = manager.nextStep("");
      expect(success).toBe(true);
      expect(manager.getCurrentStep()?.id).toBe("start-codon");
    });

    test("should not advance if validation fails", () => {
      manager.nextStep(""); // Move to step 1
      const currentStep = manager.getCurrentStep();

      // Try with wrong code
      const success = manager.nextStep("GAA");
      expect(success).toBe(false);
      expect(manager.getCurrentStep()).toEqual(currentStep);
    });

    test("should advance when validation passes", () => {
      manager.nextStep(""); // Move to step 1 (start-codon)

      // Correct code for step 1
      const success = manager.nextStep("ATG");
      expect(success).toBe(true);
      expect(manager.getCurrentStep()?.id).toBe("push-value");
    });

    test("should move backwards", () => {
      manager.nextStep("");
      manager.nextStep("ATG");

      manager.previousStep();
      expect(manager.getCurrentStep()?.id).toBe("start-codon");
    });

    test("should not go before first step", () => {
      manager.previousStep();
      expect(manager.getCurrentStep()?.id).toBe("welcome");
    });
  });

  describe("validation", () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
      manager.nextStep(""); // Move to step 1
    });

    test("should validate case-insensitively", () => {
      expect(manager.validateStep("atg")).toBe(true);
      expect(manager.validateStep("ATG")).toBe(true);
      expect(manager.validateStep("AtG")).toBe(true);
    });

    test("should validate with whitespace", () => {
      expect(manager.validateStep("  ATG  ")).toBe(true);
      expect(manager.validateStep("ATG   ")).toBe(true);
      expect(manager.validateStep("\n\nATG\n")).toBe(true);
    });

    test("should validate partial matches", () => {
      manager.nextStep("ATG"); // Move to push-value step (expects "ATG GAA AGG")

      // Should allow extra content as long as expected is present
      expect(manager.validateStep("ATG GAA AGG")).toBe(true);
      expect(manager.validateStep("ATG GAA AGG GGA TAA")).toBe(true); // More complete code
    });
  });

  describe("completion", () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    test("should mark as completed when all steps finished", () => {
      // Complete all steps
      manager.nextStep(""); // welcome
      manager.nextStep("ATG"); // start-codon
      manager.nextStep("ATG GAA AGG"); // push-value
      manager.nextStep("ATG GAA AGG GGA"); // draw-circle
      manager.nextStep("ATG GAA AGG GGA TAA"); // stop-codon
      manager.nextStep(""); // explore

      expect(manager.isCompleted()).toBe(true);
      expect(manager.getCurrentStep()).toBeNull();
    });

    test("should persist completion in localStorage", () => {
      manager.markCompleted();

      const newManager = new TutorialManager("test_tutorial");
      expect(newManager.isCompleted()).toBe(true);
    });

    test("should allow reset", () => {
      manager.markCompleted();
      manager.reset();

      expect(manager.isCompleted()).toBe(false);
      manager.start(helloCircleTutorial);
      expect(manager.getCurrentStep()?.id).toBe("welcome");
    });
  });

  describe("skip functionality", () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    test("should mark as completed when skipped", () => {
      manager.skip();
      expect(manager.isCompleted()).toBe(true);
    });
  });

  describe("callbacks", () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    test("should call onStepChange callback", () => {
      let called = false;
      let stepNumber = -1;

      manager.onStepChangeCallback((step) => {
        called = true;
        stepNumber = step;
      });

      manager.nextStep("");

      expect(called).toBe(true);
      expect(stepNumber).toBe(1);
    });

    test("should call onComplete callback", () => {
      let called = false;

      manager.onCompleteCallback(() => {
        called = true;
      });

      manager.markCompleted();

      expect(called).toBe(true);
    });
  });
});

describe("helloCircleTutorial", () => {
  test("should have 6 steps", () => {
    expect(helloCircleTutorial.steps).toHaveLength(6);
  });

  test("should have correct step order", () => {
    const stepIds = helloCircleTutorial.steps.map((s) => s.id);
    expect(stepIds).toEqual([
      "welcome",
      "start-codon",
      "push-value",
      "draw-circle",
      "stop-codon",
      "explore",
    ]);
  });

  test("should have validation for code steps", () => {
    const codeSteps = helloCircleTutorial.steps.filter((s) => s.expectedCode);
    expect(codeSteps.length).toBeGreaterThan(0);

    // Check that code steps have expected codes
    const startStep = helloCircleTutorial.steps.find(
      (s) => s.id === "start-codon",
    );
    expect(startStep?.expectedCode).toBe("ATG");
  });
});

describe("mutationTutorial", () => {
  test("should have 6 steps", () => {
    expect(mutationTutorial.steps).toHaveLength(6);
  });

  test("should have correct step order", () => {
    const stepIds = mutationTutorial.steps.map((s) => s.id);
    expect(stepIds).toEqual([
      "welcome",
      "silent-mutation",
      "missense-mutation",
      "nonsense-mutation",
      "frameshift-mutation",
      "complete",
    ]);
  });

  test("should have custom validation functions", () => {
    const stepsWithValidation = mutationTutorial.steps.filter(
      (s) => s.validationFn,
    );
    expect(stepsWithValidation.length).toBeGreaterThan(0);
  });

  describe("silent mutation validation", () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager("test_mutation");
      manager.start(mutationTutorial);
      manager.nextStep(""); // Skip welcome
    });

    test("should validate GGC codon", () => {
      const result = manager.validateStep("ATG GAA AGG GGC TAA");
      expect(result).toBe(true);
    });

    test("should reject if missing GGC", () => {
      const result = manager.validateStep("ATG GAA AGG GGA TAA");
      expect(result).toBe(false);
    });
  });

  describe("missense mutation validation", () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager("test_mutation");
      manager.start(mutationTutorial);
      manager.nextStep(""); // Skip welcome
      manager.nextStep("ATG GAA AGG GGC TAA"); // Complete silent
    });

    test("should validate GCA codon", () => {
      const result = manager.validateStep("ATG GAA AGG GCA TAA");
      expect(result).toBe(true);
    });

    test("should reject if has GGC instead", () => {
      const result = manager.validateStep("ATG GAA AGG GGC TAA");
      expect(result).toBe(false);
    });
  });

  describe("nonsense mutation validation", () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager("test_mutation");
      manager.start(mutationTutorial);
      manager.nextStep(""); // welcome
      manager.nextStep("ATG GAA AGG GGC TAA"); // silent
      manager.nextStep("ATG GAA AGG GCA TAA"); // missense
    });

    test("should validate premature TAA", () => {
      const result = manager.validateStep("ATG GAA AGG TAA");
      expect(result).toBe(true);
    });

    test("should reject if still has GCA", () => {
      const result = manager.validateStep("ATG GAA AGG GCA TAA");
      expect(result).toBe(false);
    });
  });

  describe("frameshift mutation validation", () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager("test_mutation");
      manager.start(mutationTutorial);
      // Navigate to frameshift step
      manager.nextStep(""); // welcome
      manager.nextStep("ATG GAA AGG GGC TAA"); // silent
      manager.nextStep("ATG GAA AGG GCA TAA"); // missense
      manager.nextStep("ATG GAA AGG TAA"); // nonsense
    });

    test("should validate frameshift (length not divisible by 3)", () => {
      const result = manager.validateStep("ATG GA AGG GGA TAA");
      expect(result).toBe(true);
    });

    test("should reject if still in frame", () => {
      const result = manager.validateStep("ATG GAA AGG GGA TAA");
      expect(result).toBe(false);
    });

    test("should accept deletion of one base", () => {
      const result = manager.validateStep("ATG GAA GG GGA TAA");
      expect(result).toBe(true);
    });

    test("should accept insertion of one base", () => {
      const result = manager.validateStep("ATG GAAA AGG GGA TAA");
      expect(result).toBe(true);
    });
  });
});

describe("Timeline Tutorial", () => {
  test("should have correct number of steps", () => {
    expect(timelineTutorial.steps).toHaveLength(6);
  });

  test("should have correct step order", () => {
    const stepIds = timelineTutorial.steps.map((s) => s.id);
    expect(stepIds).toEqual([
      "welcome",
      "play-pause",
      "step-forward",
      "observe-stack",
      "state-changes",
      "complete",
    ]);
  });

  test("should have validation functions for interactive steps", () => {
    const playPauseStep = timelineTutorial.steps.find(
      (s) => s.id === "play-pause",
    );
    expect(playPauseStep?.validationFn).toBeDefined();
  });

  describe("play-pause step validation", () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager("test_timeline");
      manager.start(timelineTutorial);
      manager.nextStep(""); // welcome
    });

    test("should allow manual progression (always true)", () => {
      const result = manager.validateStep("ATG GAA AGG GGA TAA");
      expect(result).toBe(true);
    });

    test("should allow empty code for timeline interactions", () => {
      const result = manager.validateStep("");
      expect(result).toBe(true);
    });
  });

  describe("timeline tutorial progression", () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager("test_timeline");
    });

    test("should start at welcome step", () => {
      manager.start(timelineTutorial);
      const step = manager.getCurrentStep();
      expect(step?.id).toBe("welcome");
    });

    test("should progress through all steps", () => {
      manager.start(timelineTutorial);

      expect(manager.nextStep("")).toBe(true); // welcome -> play-pause
      expect(manager.getCurrentStep()?.id).toBe("play-pause");

      expect(manager.nextStep("")).toBe(true); // play-pause -> step-forward
      expect(manager.getCurrentStep()?.id).toBe("step-forward");

      expect(manager.nextStep("")).toBe(true); // step-forward -> observe-stack
      expect(manager.getCurrentStep()?.id).toBe("observe-stack");

      expect(manager.nextStep("")).toBe(true); // observe-stack -> state-changes
      expect(manager.getCurrentStep()?.id).toBe("state-changes");

      expect(manager.nextStep("")).toBe(true); // state-changes -> complete
      expect(manager.getCurrentStep()?.id).toBe("complete");
    });

    test("should mark as completed after final step", () => {
      manager.start(timelineTutorial);

      // Go through all steps
      timelineTutorial.steps.forEach(() => {
        manager.nextStep("");
      });

      expect(manager.isCompleted()).toBe(true);
    });

    test("should use separate storage key from other tutorials", () => {
      const timelineManager = new TutorialManager(
        "codoncanvas_timeline_tutorial_completed",
      );
      const mutationManager = new TutorialManager(
        "codoncanvas_mutation_tutorial_completed",
      );

      timelineManager.markCompleted();

      expect(timelineManager.isCompleted()).toBe(true);
      expect(mutationManager.isCompleted()).toBe(false);
    });
  });

  describe("timeline tutorial content", () => {
    test("should mention ribosome metaphor", () => {
      const welcomeStep = timelineTutorial.steps[0];
      expect(welcomeStep.content.toLowerCase()).toContain("ribosome");
    });

    test("should explain stack concept", () => {
      const stackStep = timelineTutorial.steps.find(
        (s) => s.id === "observe-stack",
      );
      expect(stackStep?.content.toLowerCase()).toContain("stack");
      expect(stackStep?.content.toLowerCase()).toContain("storage");
    });

    test("should explain VM state", () => {
      const stateStep = timelineTutorial.steps.find(
        (s) => s.id === "state-changes",
      );
      expect(stateStep?.content.toLowerCase()).toContain("position");
      expect(stateStep?.content.toLowerCase()).toContain("rotation");
    });

    test("should provide next steps in completion", () => {
      const completeStep = timelineTutorial.steps.find(
        (s) => s.id === "complete",
      );
      expect(completeStep?.content.toLowerCase()).toContain("next steps");
    });
  });
});

describe("evolutionTutorial", () => {
  test("should have correct structure", () => {
    expect(evolutionTutorial.id).toBe("evolution-lab");
    expect(evolutionTutorial.title).toContain("Evolution");
    expect(evolutionTutorial.steps.length).toBeGreaterThan(4);
  });

  test("should start with welcome step", () => {
    const firstStep = evolutionTutorial.steps[0];
    expect(firstStep.id).toBe("welcome");
    expect(firstStep.title.toLowerCase()).toContain("welcome");
  });

  test("should include key evolution concepts", () => {
    const allContent = evolutionTutorial.steps
      .map((s) => s.content)
      .join(" ")
      .toLowerCase();

    // Natural selection concepts
    expect(allContent).toContain("fitness");
    expect(allContent).toContain("generation");
    expect(allContent).toContain("selection");
    expect(allContent).toContain("mutation");
  });

  test("should explain candidate generation", () => {
    const genStep = evolutionTutorial.steps.find(
      (s) => s.id === "generate-candidates",
    );
    expect(genStep).toBeTruthy();
    expect(genStep?.content.toLowerCase()).toContain("candidate");
    expect(genStep?.content.toLowerCase()).toContain("generate");
  });

  test("should explain visual comparison", () => {
    const compareStep = evolutionTutorial.steps.find(
      (s) => s.id === "visual-comparison",
    );
    expect(compareStep).toBeTruthy();
    expect(compareStep?.content.toLowerCase()).toContain("candidate");
    expect(compareStep?.content.toLowerCase()).toContain("look");
    expect(compareStep?.targetElement).toBe("#candidates-grid");
  });

  test("should explain selection process", () => {
    const selectStep = evolutionTutorial.steps.find(
      (s) => s.id === "selection",
    );
    expect(selectStep).toBeTruthy();
    expect(selectStep?.content.toLowerCase()).toContain("fittest");
    expect(selectStep?.content.toLowerCase()).toContain("selection");
  });

  test("should explain multi-generation evolution", () => {
    const multiGenStep = evolutionTutorial.steps.find(
      (s) => s.id === "multi-generation",
    );
    expect(multiGenStep).toBeTruthy();
    expect(multiGenStep?.content.toLowerCase()).toContain("generation");
    expect(multiGenStep?.content.toLowerCase()).toContain("lineage");
  });

  test("should have completion step", () => {
    const completeStep = evolutionTutorial.steps.find(
      (s) => s.id === "complete",
    );
    expect(completeStep).toBeTruthy();
    expect(completeStep?.title.toLowerCase()).toContain("master");
  });

  test("should mention natural selection metaphor", () => {
    const completeStep = evolutionTutorial.steps.find(
      (s) => s.id === "complete",
    );
    expect(completeStep?.content.toLowerCase()).toContain("natural selection");
  });

  test("should provide challenges in completion", () => {
    const completeStep = evolutionTutorial.steps.find(
      (s) => s.id === "complete",
    );
    expect(completeStep?.content.toLowerCase()).toContain("challenge");
  });

  test("should target correct DOM elements", () => {
    expect(evolutionTutorial.steps[0].targetElement).toBe("#evolutionPanel");

    const genStep = evolutionTutorial.steps.find(
      (s) => s.id === "generate-candidates",
    );
    expect(genStep?.targetElement).toBe("#generateBtn");
  });
});

describe("evolution tutorial isolation", () => {
  test("should have separate storage key", () => {
    const evolutionManager = new TutorialManager(
      "codoncanvas_evolution_tutorial_completed",
    );
    const mutationManager = new TutorialManager(
      "codoncanvas_mutation_tutorial_completed",
    );

    evolutionManager.markCompleted();

    expect(evolutionManager.isCompleted()).toBe(true);
    expect(mutationManager.isCompleted()).toBe(false);
  });
});
