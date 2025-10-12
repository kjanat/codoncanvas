import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TutorialManager, helloCircleTutorial, mutationTutorial } from './tutorial';

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
    }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('TutorialManager', () => {
  let manager: TutorialManager;

  beforeEach(() => {
    localStorage.clear();
    manager = new TutorialManager('test_tutorial');
  });

  describe('initialization', () => {
    it('should start uncompleted', () => {
      expect(manager.isCompleted()).toBe(false);
    });

    it('should start tutorial with config', () => {
      manager.start(helloCircleTutorial);
      const step = manager.getCurrentStep();
      expect(step).toBeTruthy();
      expect(step?.id).toBe('welcome');
    });
  });

  describe('step progression', () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    it('should get progress correctly', () => {
      const progress = manager.getProgress();
      expect(progress.current).toBe(0);
      expect(progress.total).toBe(6);
      expect(progress.percent).toBe(0);
    });

    it('should move to next step when validation passes', () => {
      // First step has no validation
      const success = manager.nextStep('');
      expect(success).toBe(true);
      expect(manager.getCurrentStep()?.id).toBe('start-codon');
    });

    it('should not advance if validation fails', () => {
      manager.nextStep(''); // Move to step 1
      const currentStep = manager.getCurrentStep();

      // Try with wrong code
      const success = manager.nextStep('GAA');
      expect(success).toBe(false);
      expect(manager.getCurrentStep()).toEqual(currentStep);
    });

    it('should advance when validation passes', () => {
      manager.nextStep(''); // Move to step 1 (start-codon)

      // Correct code for step 1
      const success = manager.nextStep('ATG');
      expect(success).toBe(true);
      expect(manager.getCurrentStep()?.id).toBe('push-value');
    });

    it('should move backwards', () => {
      manager.nextStep('');
      manager.nextStep('ATG');

      manager.previousStep();
      expect(manager.getCurrentStep()?.id).toBe('start-codon');
    });

    it('should not go before first step', () => {
      manager.previousStep();
      expect(manager.getCurrentStep()?.id).toBe('welcome');
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
      manager.nextStep(''); // Move to step 1
    });

    it('should validate case-insensitively', () => {
      expect(manager.validateStep('atg')).toBe(true);
      expect(manager.validateStep('ATG')).toBe(true);
      expect(manager.validateStep('AtG')).toBe(true);
    });

    it('should validate with whitespace', () => {
      expect(manager.validateStep('  ATG  ')).toBe(true);
      expect(manager.validateStep('ATG   ')).toBe(true);
      expect(manager.validateStep('\n\nATG\n')).toBe(true);
    });

    it('should validate partial matches', () => {
      manager.nextStep('ATG'); // Move to push-value step (expects "ATG GAA AGG")

      // Should allow extra content as long as expected is present
      expect(manager.validateStep('ATG GAA AGG')).toBe(true);
      expect(manager.validateStep('ATG GAA AGG GGA TAA')).toBe(true); // More complete code
    });
  });

  describe('completion', () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    it('should mark as completed when all steps finished', () => {
      // Complete all steps
      manager.nextStep(''); // welcome
      manager.nextStep('ATG'); // start-codon
      manager.nextStep('ATG GAA AGG'); // push-value
      manager.nextStep('ATG GAA AGG GGA'); // draw-circle
      manager.nextStep('ATG GAA AGG GGA TAA'); // stop-codon
      manager.nextStep(''); // explore

      expect(manager.isCompleted()).toBe(true);
      expect(manager.getCurrentStep()).toBeNull();
    });

    it('should persist completion in localStorage', () => {
      manager.markCompleted();

      const newManager = new TutorialManager('test_tutorial');
      expect(newManager.isCompleted()).toBe(true);
    });

    it('should allow reset', () => {
      manager.markCompleted();
      manager.reset();

      expect(manager.isCompleted()).toBe(false);
      manager.start(helloCircleTutorial);
      expect(manager.getCurrentStep()?.id).toBe('welcome');
    });
  });

  describe('skip functionality', () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    it('should mark as completed when skipped', () => {
      manager.skip();
      expect(manager.isCompleted()).toBe(true);
    });
  });

  describe('callbacks', () => {
    beforeEach(() => {
      manager.start(helloCircleTutorial);
    });

    it('should call onStepChange callback', () => {
      let called = false;
      let stepNumber = -1;

      manager.onStepChangeCallback((step) => {
        called = true;
        stepNumber = step;
      });

      manager.nextStep('');

      expect(called).toBe(true);
      expect(stepNumber).toBe(1);
    });

    it('should call onComplete callback', () => {
      let called = false;

      manager.onCompleteCallback(() => {
        called = true;
      });

      manager.markCompleted();

      expect(called).toBe(true);
    });
  });
});

describe('helloCircleTutorial', () => {
  it('should have 6 steps', () => {
    expect(helloCircleTutorial.steps).toHaveLength(6);
  });

  it('should have correct step order', () => {
    const stepIds = helloCircleTutorial.steps.map(s => s.id);
    expect(stepIds).toEqual([
      'welcome',
      'start-codon',
      'push-value',
      'draw-circle',
      'stop-codon',
      'explore'
    ]);
  });

  it('should have validation for code steps', () => {
    const codeSteps = helloCircleTutorial.steps.filter(s => s.expectedCode);
    expect(codeSteps.length).toBeGreaterThan(0);

    // Check that code steps have expected codes
    const startStep = helloCircleTutorial.steps.find(s => s.id === 'start-codon');
    expect(startStep?.expectedCode).toBe('ATG');
  });
});

describe('mutationTutorial', () => {
  it('should have 6 steps', () => {
    expect(mutationTutorial.steps).toHaveLength(6);
  });

  it('should have correct step order', () => {
    const stepIds = mutationTutorial.steps.map(s => s.id);
    expect(stepIds).toEqual([
      'welcome',
      'silent-mutation',
      'missense-mutation',
      'nonsense-mutation',
      'frameshift-mutation',
      'complete'
    ]);
  });

  it('should have custom validation functions', () => {
    const stepsWithValidation = mutationTutorial.steps.filter(s => s.validationFn);
    expect(stepsWithValidation.length).toBeGreaterThan(0);
  });

  describe('silent mutation validation', () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager('test_mutation');
      manager.start(mutationTutorial);
      manager.nextStep(''); // Skip welcome
    });

    it('should validate GGC codon', () => {
      const result = manager.validateStep('ATG GAA AGG GGC TAA');
      expect(result).toBe(true);
    });

    it('should reject if missing GGC', () => {
      const result = manager.validateStep('ATG GAA AGG GGA TAA');
      expect(result).toBe(false);
    });
  });

  describe('missense mutation validation', () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager('test_mutation');
      manager.start(mutationTutorial);
      manager.nextStep(''); // Skip welcome
      manager.nextStep('ATG GAA AGG GGC TAA'); // Complete silent
    });

    it('should validate GCA codon', () => {
      const result = manager.validateStep('ATG GAA AGG GCA TAA');
      expect(result).toBe(true);
    });

    it('should reject if has GGC instead', () => {
      const result = manager.validateStep('ATG GAA AGG GGC TAA');
      expect(result).toBe(false);
    });
  });

  describe('nonsense mutation validation', () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager('test_mutation');
      manager.start(mutationTutorial);
      manager.nextStep(''); // welcome
      manager.nextStep('ATG GAA AGG GGC TAA'); // silent
      manager.nextStep('ATG GAA AGG GCA TAA'); // missense
    });

    it('should validate premature TAA', () => {
      const result = manager.validateStep('ATG GAA AGG TAA');
      expect(result).toBe(true);
    });

    it('should reject if still has GCA', () => {
      const result = manager.validateStep('ATG GAA AGG GCA TAA');
      expect(result).toBe(false);
    });
  });

  describe('frameshift mutation validation', () => {
    let manager: TutorialManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new TutorialManager('test_mutation');
      manager.start(mutationTutorial);
      // Navigate to frameshift step
      manager.nextStep(''); // welcome
      manager.nextStep('ATG GAA AGG GGC TAA'); // silent
      manager.nextStep('ATG GAA AGG GCA TAA'); // missense
      manager.nextStep('ATG GAA AGG TAA'); // nonsense
    });

    it('should validate frameshift (length not divisible by 3)', () => {
      const result = manager.validateStep('ATG GA AGG GGA TAA');
      expect(result).toBe(true);
    });

    it('should reject if still in frame', () => {
      const result = manager.validateStep('ATG GAA AGG GGA TAA');
      expect(result).toBe(false);
    });

    it('should accept deletion of one base', () => {
      const result = manager.validateStep('ATG GAA GG GGA TAA');
      expect(result).toBe(true);
    });

    it('should accept insertion of one base', () => {
      const result = manager.validateStep('ATG GAAA AGG GGA TAA');
      expect(result).toBe(true);
    });
  });
});
