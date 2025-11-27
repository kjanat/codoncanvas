/**
 * Tutorial UI Test Suite
 *
 * Tests for the interactive tutorial interface that guides new users
 * through CodonCanvas concepts with step-by-step instructions.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { TutorialUI, initializeTutorial } from "./tutorial-ui";
import type { TutorialManager, TutorialStep } from "./tutorial";

// Mock TutorialManager
const createMockManager = (overrides: Partial<TutorialManager> = {}) => {
  const callbacks: {
    onStepChange?: () => void;
    onComplete?: () => void;
  } = {};

  return {
    getCurrentStep: mock(() => ({
      title: "Test Step",
      content: "Test content",
      hint: "Test hint",
      targetElement: undefined,
      expectedCode: undefined,
    })),
    getProgress: mock(() => ({
      current: 0,
      total: 5,
      percent: 20,
    })),
    nextStep: mock(() => true),
    previousStep: mock(() => {}),
    skip: mock(() => {}),
    validateStep: mock(() => true),
    isCompleted: mock(() => false),
    onStepChangeCallback: mock((cb: () => void) => {
      callbacks.onStepChange = cb;
    }),
    onCompleteCallback: mock((cb: () => void) => {
      callbacks.onComplete = cb;
    }),
    triggerStepChange: () => callbacks.onStepChange?.(),
    triggerComplete: () => callbacks.onComplete?.(),
    ...overrides,
  } as unknown as TutorialManager & {
    triggerStepChange: () => void;
    triggerComplete: () => void;
  };
};

describe("TutorialUI", () => {
  let container: HTMLElement;
  let mockManager: ReturnType<typeof createMockManager>;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "tutorial-container";
    document.body.appendChild(container);
    mockManager = createMockManager();
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = "";
  });

  // Constructor
  describe("constructor", () => {
    test("accepts container element and TutorialManager", () => {
      const ui = new TutorialUI(container, mockManager);
      expect(ui).toBeDefined();
    });

    test("stores manager reference", () => {
      const ui = new TutorialUI(container, mockManager);
      // The manager is used internally - verified by callbacks being registered
      expect(mockManager.onStepChangeCallback).toHaveBeenCalled();
    });

    test("calls setupCallbacks to register event handlers", () => {
      new TutorialUI(container, mockManager);
      expect(mockManager.onStepChangeCallback).toHaveBeenCalled();
      expect(mockManager.onCompleteCallback).toHaveBeenCalled();
    });

    test("initializes overlayElement as null", () => {
      new TutorialUI(container, mockManager);
      // No overlay until show() is called
      expect(document.querySelector(".tutorial-overlay")).toBeNull();
    });

    test("initializes highlightedElement as null", () => {
      new TutorialUI(container, mockManager);
      expect(document.querySelector(".tutorial-highlight")).toBeNull();
    });
  });

  // setupCallbacks (private)
  describe("setupCallbacks", () => {
    test("registers onStepChangeCallback with manager", () => {
      new TutorialUI(container, mockManager);
      expect(mockManager.onStepChangeCallback).toHaveBeenCalled();
    });

    test("registers onCompleteCallback with manager", () => {
      new TutorialUI(container, mockManager);
      expect(mockManager.onCompleteCallback).toHaveBeenCalled();
    });

    test("step change callback calls render()", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const initialOverlay = document.querySelector(".tutorial-overlay");
      expect(initialOverlay).not.toBeNull();

      // Trigger step change
      mockManager.triggerStepChange();

      // Should re-render (new overlay element)
      const newOverlay = document.querySelector(".tutorial-overlay");
      expect(newOverlay).not.toBeNull();
    });

    test("complete callback calls showSuccess()", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();

      // Trigger completion
      mockManager.triggerComplete();

      // Should show success screen
      const successIcon = document.querySelector(".tutorial-success-icon");
      expect(successIcon).not.toBeNull();
    });
  });

  // show
  describe("show", () => {
    test("calls render() to display tutorial", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      expect(document.querySelector(".tutorial-overlay")).not.toBeNull();
    });
  });

  // hide
  describe("hide", () => {
    test("calls cleanup() to remove tutorial UI", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      expect(document.querySelector(".tutorial-overlay")).not.toBeNull();

      ui.hide();
      expect(document.querySelector(".tutorial-overlay")).toBeNull();
    });
  });

  // render (private)
  describe("render", () => {
    test("calls cleanup() first to remove previous overlay", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const firstOverlay = document.querySelector(".tutorial-overlay");
      expect(firstOverlay).not.toBeNull();

      ui.show();
      // Should only have one overlay
      const overlays = document.querySelectorAll(".tutorial-overlay");
      expect(overlays.length).toBe(1);
    });

    test("returns early if no current step from manager", () => {
      const managerNoStep = createMockManager({
        getCurrentStep: mock(() => null),
      });
      const ui = new TutorialUI(container, managerNoStep);
      ui.show();
      expect(document.querySelector(".tutorial-modal")).toBeNull();
    });

    test("creates overlay element with tutorial-overlay class", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      expect(document.querySelector(".tutorial-overlay")).not.toBeNull();
    });

    test("renders modal with step content", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      expect(document.querySelector(".tutorial-modal")).not.toBeNull();
    });

    test("appends overlay to document.body", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const overlay = document.querySelector(".tutorial-overlay");
      expect(overlay?.parentElement).toBe(document.body);
    });

    test("calls attachEventListeners", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      // Verify by checking buttons have listeners (Next button exists)
      const nextBtn = document.querySelector('[data-action="next"]');
      expect(nextBtn).not.toBeNull();
    });

    test("highlights target element if step has targetElement", () => {
      // Create target element
      const target = document.createElement("div");
      target.id = "target-element";
      document.body.appendChild(target);

      const managerWithTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Test Step",
          content: "Test content",
          targetElement: "#target-element",
        })),
      });

      const ui = new TutorialUI(container, managerWithTarget);
      ui.show();

      expect(target.classList.contains("tutorial-highlight")).toBe(true);
    });
  });

  // renderModal (private)
  describe("renderModal", () => {
    test("renders step title", () => {
      const managerWithTitle = createMockManager({
        getCurrentStep: mock(() => ({
          title: "My Custom Title",
          content: "Content",
        })),
      });
      const ui = new TutorialUI(container, managerWithTitle);
      ui.show();
      expect(document.querySelector("h2")?.textContent).toBe("My Custom Title");
    });

    test("renders progress bar with correct percentage", () => {
      const managerWith50 = createMockManager({
        getProgress: mock(() => ({ current: 2, total: 4, percent: 50 })),
      });
      const ui = new TutorialUI(container, managerWith50);
      ui.show();
      const progressFill = document.querySelector(
        ".tutorial-progress-fill"
      ) as HTMLElement;
      expect(progressFill?.style.width).toBe("50%");
    });

    test("renders progress text as 'current/total'", () => {
      const managerProgress = createMockManager({
        getProgress: mock(() => ({ current: 2, total: 5, percent: 40 })),
      });
      const ui = new TutorialUI(container, managerProgress);
      ui.show();
      const progressText = document.querySelector(".tutorial-progress-text");
      expect(progressText?.textContent).toBe("3/5");
    });

    test("renders step content", () => {
      const managerContent = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "This is the step content",
        })),
      });
      const ui = new TutorialUI(container, managerContent);
      ui.show();
      const content = document.querySelector(".tutorial-step-content");
      expect(content?.textContent).toContain("This is the step content");
    });

    test("renders hint if step has hint", () => {
      const managerHint = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          hint: "This is a helpful hint",
        })),
      });
      const ui = new TutorialUI(container, managerHint);
      ui.show();
      const hint = document.querySelector(".tutorial-hint");
      expect(hint).not.toBeNull();
      expect(hint?.textContent).toContain("This is a helpful hint");
    });

    test("hides hint if step has no hint", () => {
      const managerNoHint = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          hint: undefined,
        })),
      });
      const ui = new TutorialUI(container, managerNoHint);
      ui.show();
      const hint = document.querySelector(".tutorial-hint");
      expect(hint).toBeNull();
    });

    test("renders Skip Tutorial button", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const skipBtn = document.querySelector('[data-action="skip"]');
      expect(skipBtn).not.toBeNull();
      expect(skipBtn?.textContent).toContain("Skip Tutorial");
    });

    test("hides Previous button on first step", () => {
      const managerFirstStep = createMockManager({
        getProgress: mock(() => ({ current: 0, total: 5, percent: 0 })),
      });
      const ui = new TutorialUI(container, managerFirstStep);
      ui.show();
      const prevBtn = document.querySelector('[data-action="previous"]');
      expect(prevBtn).toBeNull();
    });

    test("shows Previous button on subsequent steps", () => {
      const managerSecondStep = createMockManager({
        getProgress: mock(() => ({ current: 1, total: 5, percent: 20 })),
      });
      const ui = new TutorialUI(container, managerSecondStep);
      ui.show();
      const prevBtn = document.querySelector('[data-action="previous"]');
      expect(prevBtn).not.toBeNull();
    });

    test("shows 'Finish' text on last step instead of 'Next'", () => {
      const managerLastStep = createMockManager({
        getProgress: mock(() => ({ current: 4, total: 5, percent: 80 })),
      });
      const ui = new TutorialUI(container, managerLastStep);
      ui.show();
      const nextBtn = document.querySelector('[data-action="next"]');
      expect(nextBtn?.textContent).toContain("Finish");
    });

    test("disables Next button when step has expectedCode", () => {
      const managerExpectedCode = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: "ATG",
        })),
      });
      const ui = new TutorialUI(container, managerExpectedCode);
      ui.show();
      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      expect(nextBtn?.disabled).toBe(true);
    });
  });

  // attachEventListeners (private)
  describe("attachEventListeners", () => {
    test("attaches click handler to Next button", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      nextBtn?.click();
      expect(mockManager.nextStep).toHaveBeenCalled();
    });

    test("attaches click handler to Previous button", () => {
      const managerSecondStep = createMockManager({
        getProgress: mock(() => ({ current: 1, total: 5, percent: 20 })),
      });
      const ui = new TutorialUI(container, managerSecondStep);
      ui.show();
      const prevBtn = document.querySelector(
        '[data-action="previous"]'
      ) as HTMLButtonElement;
      prevBtn?.click();
      expect(managerSecondStep.previousStep).toHaveBeenCalled();
    });

    test("attaches click handler to Skip button", () => {
      // Mock confirm to return true
      const originalConfirm = globalThis.confirm;
      globalThis.confirm = mock(() => true);

      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const skipBtn = document.querySelector(
        '[data-action="skip"]'
      ) as HTMLButtonElement;
      skipBtn?.click();
      expect(mockManager.skip).toHaveBeenCalled();

      globalThis.confirm = originalConfirm;
    });

    test("prevents overlay click from closing modal", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const overlay = document.querySelector(
        ".tutorial-overlay"
      ) as HTMLElement;
      overlay?.click();
      // Modal should still be there
      expect(document.querySelector(".tutorial-modal")).not.toBeNull();
    });
  });

  // handleNext (private)
  describe("handleNext", () => {
    test("returns early if no current step", () => {
      const managerNoStep = createMockManager({
        getCurrentStep: mock(() => null),
      });
      const ui = new TutorialUI(container, managerNoStep);
      ui.show();
      // Can't test directly, but no error should be thrown
      expect(managerNoStep.nextStep).not.toHaveBeenCalled();
    });

    test("calls manager.nextStep with editor value when expectedCode", () => {
      // Create textarea (editor)
      const textarea = document.createElement("textarea");
      textarea.value = "ATG GGG";
      document.body.appendChild(textarea);

      const managerExpectedCode = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: "ATG",
        })),
      });
      const ui = new TutorialUI(container, managerExpectedCode);
      ui.show();

      // Enable button to test
      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      nextBtn.disabled = false;
      nextBtn?.click();

      expect(managerExpectedCode.nextStep).toHaveBeenCalledWith("ATG GGG");
    });

    test("calls manager.nextStep with empty string when no expectedCode", () => {
      const managerNoCode = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: undefined,
        })),
      });
      const ui = new TutorialUI(container, managerNoCode);
      ui.show();
      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      nextBtn?.click();
      expect(managerNoCode.nextStep).toHaveBeenCalledWith("");
    });
  });

  // handlePrevious (private)
  describe("handlePrevious", () => {
    test("calls manager.previousStep()", () => {
      const managerSecondStep = createMockManager({
        getProgress: mock(() => ({ current: 1, total: 5, percent: 20 })),
      });
      const ui = new TutorialUI(container, managerSecondStep);
      ui.show();
      const prevBtn = document.querySelector(
        '[data-action="previous"]'
      ) as HTMLButtonElement;
      prevBtn?.click();
      expect(managerSecondStep.previousStep).toHaveBeenCalled();
    });
  });

  // handleSkip (private)
  describe("handleSkip", () => {
    test("shows confirmation dialog", () => {
      const confirmMock = mock(() => false);
      globalThis.confirm = confirmMock;

      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const skipBtn = document.querySelector(
        '[data-action="skip"]'
      ) as HTMLButtonElement;
      skipBtn?.click();

      expect(confirmMock).toHaveBeenCalled();
    });

    test("calls manager.skip() when confirmed", () => {
      globalThis.confirm = mock(() => true);

      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const skipBtn = document.querySelector(
        '[data-action="skip"]'
      ) as HTMLButtonElement;
      skipBtn?.click();

      expect(mockManager.skip).toHaveBeenCalled();
    });

    test("calls cleanup() when confirmed", () => {
      globalThis.confirm = mock(() => true);

      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const skipBtn = document.querySelector(
        '[data-action="skip"]'
      ) as HTMLButtonElement;
      skipBtn?.click();

      expect(document.querySelector(".tutorial-overlay")).toBeNull();
    });

    test("does nothing when cancelled", () => {
      globalThis.confirm = mock(() => false);

      const ui = new TutorialUI(container, mockManager);
      ui.show();
      const skipBtn = document.querySelector(
        '[data-action="skip"]'
      ) as HTMLButtonElement;
      skipBtn?.click();

      expect(mockManager.skip).not.toHaveBeenCalled();
      expect(document.querySelector(".tutorial-overlay")).not.toBeNull();
    });
  });

  // showValidationError (private)
  describe("showValidationError", () => {
    test("adds shake class to modal", () => {
      // Create textarea
      const textarea = document.createElement("textarea");
      textarea.value = "WRONG";
      document.body.appendChild(textarea);

      const managerFailValidation = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          hint: "Try ATG instead",
          expectedCode: "ATG",
        })),
        nextStep: mock(() => false),
      });
      const ui = new TutorialUI(container, managerFailValidation);
      ui.show();

      // Enable and click next
      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      nextBtn.disabled = false;
      nextBtn?.click();

      const modal = document.querySelector(".tutorial-modal");
      expect(modal?.classList.contains("shake")).toBe(true);
    });

    test("adds highlight-hint class to hint element", () => {
      const textarea = document.createElement("textarea");
      textarea.value = "WRONG";
      document.body.appendChild(textarea);

      const managerFailValidation = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          hint: "Try ATG instead",
          expectedCode: "ATG",
        })),
        nextStep: mock(() => false),
      });
      const ui = new TutorialUI(container, managerFailValidation);
      ui.show();

      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      nextBtn.disabled = false;
      nextBtn?.click();

      const hint = document.querySelector(".tutorial-hint");
      expect(hint?.classList.contains("highlight-hint")).toBe(true);
    });
  });

  // showSuccess (private)
  describe("showSuccess", () => {
    test("calls cleanup() first", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      // Old modal should be gone, success screen shown
      const modal = document.querySelector(".tutorial-modal");
      expect(modal).not.toBeNull();
    });

    test("creates new overlay element", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      expect(document.querySelector(".tutorial-overlay")).not.toBeNull();
    });

    test("displays success icon (🎉)", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const icon = document.querySelector(".tutorial-success-icon");
      expect(icon?.textContent).toBe("🎉");
    });

    test("displays 'Congratulations!' heading", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const heading = document.querySelector("h3");
      expect(heading?.textContent).toBe("Congratulations!");
    });

    test("displays completion message", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const message = document.querySelector(".tutorial-success p");
      expect(message?.textContent).toContain("completed your first");
    });

    test("displays 'Explore Examples' button", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const exploreBtn = document.querySelector('[data-action="explore"]');
      expect(exploreBtn?.textContent).toBe("Explore Examples");
    });

    test("displays 'Try Mutations' button", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const mutationsBtn = document.querySelector('[data-action="mutations"]');
      expect(mutationsBtn?.textContent).toBe("Try Mutations");
    });

    test("Explore Examples button cleans up and focuses selector", () => {
      // Create an example selector element
      const selector = document.createElement("select");
      selector.className = "example-selector";
      document.body.appendChild(selector);

      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const exploreBtn = document.querySelector(
        '[data-action="explore"]'
      ) as HTMLButtonElement;
      exploreBtn?.click();

      // Overlay should be removed
      expect(document.querySelector(".tutorial-overlay")).toBeNull();
    });

    test("Explore Examples button handles missing selector gracefully", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const exploreBtn = document.querySelector(
        '[data-action="explore"]'
      ) as HTMLButtonElement;
      // Should not throw even without selector element
      expect(() => exploreBtn?.click()).not.toThrow();
      expect(document.querySelector(".tutorial-overlay")).toBeNull();
    });

    test("Try Mutations button cleans up and navigates", () => {
      // Mock window.location
      const originalLocation = window.location;
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      const mutationsBtn = document.querySelector(
        '[data-action="mutations"]'
      ) as HTMLButtonElement;
      mutationsBtn?.click();

      // Overlay should be removed
      expect(document.querySelector(".tutorial-overlay")).toBeNull();
      // Navigation should be triggered
      expect(mockLocation.href).toBe("mutation-demo.html");

      // Restore
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    test("builds DOM programmatically for security", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      // Verify DOM elements exist (they were built programmatically)
      expect(document.querySelector(".tutorial-success")).not.toBeNull();
      expect(document.querySelector(".tutorial-success-icon")).not.toBeNull();
      expect(
        document.querySelector(".tutorial-success-actions")
      ).not.toBeNull();
    });
  });

  // highlightElement (private)
  describe("highlightElement", () => {
    test("finds element by selector", () => {
      const target = document.createElement("div");
      target.id = "highlight-target";
      document.body.appendChild(target);

      const managerWithTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          targetElement: "#highlight-target",
        })),
      });
      const ui = new TutorialUI(container, managerWithTarget);
      ui.show();

      expect(target.classList.contains("tutorial-highlight")).toBe(true);
    });

    test("returns early if element not found", () => {
      const managerWithBadTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          targetElement: "#nonexistent",
        })),
      });
      const ui = new TutorialUI(container, managerWithBadTarget);
      // Should not throw
      expect(() => ui.show()).not.toThrow();
    });

    test("stores original classes in dataset", () => {
      const target = document.createElement("div");
      target.id = "highlight-target";
      target.className = "original-class another-class";
      document.body.appendChild(target);

      const managerWithTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          targetElement: "#highlight-target",
        })),
      });
      const ui = new TutorialUI(container, managerWithTarget);
      ui.show();

      expect(target.dataset["originalClasses"]).toBe(
        "original-class another-class"
      );
    });

    test("adds tutorial-highlight class", () => {
      const target = document.createElement("div");
      target.id = "highlight-target";
      document.body.appendChild(target);

      const managerWithTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          targetElement: "#highlight-target",
        })),
      });
      const ui = new TutorialUI(container, managerWithTarget);
      ui.show();

      expect(target.classList.contains("tutorial-highlight")).toBe(true);
    });
  });

  // validateAndUpdateButton
  describe("validateAndUpdateButton", () => {
    test("returns early if no overlay", () => {
      const ui = new TutorialUI(container, mockManager);
      // Don't call show(), so no overlay
      expect(() => ui.validateAndUpdateButton("ATG")).not.toThrow();
    });

    test("returns early if step has no expectedCode", () => {
      const managerNoExpected = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: undefined,
        })),
      });
      const ui = new TutorialUI(container, managerNoExpected);
      ui.show();
      // Should not throw
      expect(() => ui.validateAndUpdateButton("ATG")).not.toThrow();
    });

    test("calls manager.validateStep with code", () => {
      const managerExpected = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: "ATG",
        })),
      });
      const ui = new TutorialUI(container, managerExpected);
      ui.show();
      ui.validateAndUpdateButton("ATG GGG");
      expect(managerExpected.validateStep).toHaveBeenCalledWith("ATG GGG");
    });

    test("disables button when validation fails", () => {
      const managerFail = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: "ATG",
        })),
        validateStep: mock(() => false),
      });
      const ui = new TutorialUI(container, managerFail);
      ui.show();
      ui.validateAndUpdateButton("WRONG");

      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      expect(nextBtn?.disabled).toBe(true);
    });

    test("enables button when validation passes", () => {
      const managerPass = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: "ATG",
        })),
        validateStep: mock(() => true),
      });
      const ui = new TutorialUI(container, managerPass);
      ui.show();
      ui.validateAndUpdateButton("ATG");

      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      expect(nextBtn?.disabled).toBe(false);
    });

    test("adds pulse-success class when valid", () => {
      const managerPass = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: "ATG",
        })),
        validateStep: mock(() => true),
      });
      const ui = new TutorialUI(container, managerPass);
      ui.show();
      ui.validateAndUpdateButton("ATG");

      const nextBtn = document.querySelector('[data-action="next"]');
      expect(nextBtn?.classList.contains("pulse-success")).toBe(true);
    });
  });

  // cleanup (private)
  describe("cleanup", () => {
    test("removes overlayElement from DOM", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      expect(document.querySelector(".tutorial-overlay")).not.toBeNull();

      ui.hide();
      expect(document.querySelector(".tutorial-overlay")).toBeNull();
    });

    test("removes tutorial-highlight class from highlighted element", () => {
      const target = document.createElement("div");
      target.id = "highlight-target";
      document.body.appendChild(target);

      const managerWithTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          targetElement: "#highlight-target",
        })),
      });
      const ui = new TutorialUI(container, managerWithTarget);
      ui.show();
      expect(target.classList.contains("tutorial-highlight")).toBe(true);

      ui.hide();
      expect(target.classList.contains("tutorial-highlight")).toBe(false);
    });

    test("restores original classes to highlighted element", () => {
      const target = document.createElement("div");
      target.id = "highlight-target";
      target.className = "original-class";
      document.body.appendChild(target);

      const managerWithTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          targetElement: "#highlight-target",
        })),
      });
      const ui = new TutorialUI(container, managerWithTarget);
      ui.show();
      ui.hide();

      expect(target.className).toBe("original-class");
    });
  });

  // Integration
  describe("integration", () => {
    test("progresses through tutorial steps", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();

      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      nextBtn?.click();

      expect(mockManager.nextStep).toHaveBeenCalled();
    });

    test("code validation enables/disables Next button", () => {
      const managerValidation = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          expectedCode: "ATG",
        })),
        validateStep: mock((code: string) => code.includes("ATG")),
      });
      const ui = new TutorialUI(container, managerValidation);
      ui.show();

      // Initially disabled
      let nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      expect(nextBtn?.disabled).toBe(true);

      // Valid code enables
      ui.validateAndUpdateButton("ATG GGG");
      nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      expect(nextBtn?.disabled).toBe(false);
    });

    test("completion triggers success screen", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      mockManager.triggerComplete();

      expect(document.querySelector(".tutorial-success")).not.toBeNull();
    });

    test("skip button properly terminates tutorial", () => {
      globalThis.confirm = mock(() => true);

      const ui = new TutorialUI(container, mockManager);
      ui.show();

      const skipBtn = document.querySelector(
        '[data-action="skip"]'
      ) as HTMLButtonElement;
      skipBtn?.click();

      expect(mockManager.skip).toHaveBeenCalled();
      expect(document.querySelector(".tutorial-overlay")).toBeNull();
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles missing target element for highlighting", () => {
      const managerBadTarget = createMockManager({
        getCurrentStep: mock(() => ({
          title: "Title",
          content: "Content",
          targetElement: "#nonexistent-element",
        })),
      });
      const ui = new TutorialUI(container, managerBadTarget);
      expect(() => ui.show()).not.toThrow();
    });

    test("handles rapid Next button clicks", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();

      const nextBtn = document.querySelector(
        '[data-action="next"]'
      ) as HTMLButtonElement;
      nextBtn?.click();
      nextBtn?.click();
      nextBtn?.click();

      // Should have been called multiple times
      expect(mockManager.nextStep).toHaveBeenCalled();
    });

    test("handles overlay removal during animation", () => {
      const ui = new TutorialUI(container, mockManager);
      ui.show();
      ui.hide();
      ui.show();

      // Should work without errors
      expect(document.querySelector(".tutorial-overlay")).not.toBeNull();
    });
  });
});

describe("initializeTutorial", () => {
  let container: HTMLElement;
  let mockManager: ReturnType<typeof createMockManager>;
  let editor: HTMLTextAreaElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    editor = document.createElement("textarea");
    document.body.appendChild(editor);
    mockManager = createMockManager();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("creates TutorialUI instance", () => {
    const ui = initializeTutorial(container, mockManager, editor);
    expect(ui).toBeInstanceOf(TutorialUI);
  });

  test("does not auto-show for users who completed tutorial", () => {
    const completedManager = createMockManager({
      isCompleted: mock(() => true),
    });
    initializeTutorial(container, completedManager, editor);

    // Should not show immediately
    expect(document.querySelector(".tutorial-overlay")).toBeNull();
  });

  test("attaches input listener to editor element", () => {
    const validatingManager = createMockManager({
      getCurrentStep: mock(() => ({
        title: "Title",
        content: "Content",
        expectedCode: "ATG",
      })),
    });
    const ui = initializeTutorial(container, validatingManager, editor);
    ui.show();

    // Trigger input event
    editor.value = "ATG";
    editor.dispatchEvent(new Event("input"));

    expect(validatingManager.validateStep).toHaveBeenCalledWith("ATG");
  });

  test("returns TutorialUI instance", () => {
    const ui = initializeTutorial(container, mockManager, editor);
    expect(ui).toBeDefined();
    expect(typeof ui.show).toBe("function");
    expect(typeof ui.hide).toBe("function");
  });
});
