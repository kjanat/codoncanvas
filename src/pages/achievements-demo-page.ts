import type { Achievement } from "../achievement-engine";
import { AchievementEngine } from "../achievement-engine";
import { AchievementUI } from "../achievement-ui";

// Initialize achievement system
const engine = new AchievementEngine();
const ui = new AchievementUI(engine, "achievements-container");

// Simulation functions
function simulateGenomeCreation(): void {
  const unlocked = engine.trackGenomeCreated(15);
  ui.handleUnlocks(unlocked);
  console.log("Created genome with 15 codons");
}

function simulateGenomeExecution(): void {
  const unlocked = engine.trackGenomeExecuted(["CIRCLE", "RECT", "LINE"]);
  ui.handleUnlocks(unlocked);
  console.log("Executed genome with 3 opcodes");
}

function simulateLongGenome(): void {
  const unlocked = engine.trackGenomeCreated(101);
  engine.trackGenomeExecuted(["CIRCLE"]);
  ui.handleUnlocks(unlocked);
  console.log("Created and executed long genome (101 codons)");
}

function simulateMutation(): void {
  const unlocked = engine.trackMutationApplied();
  ui.handleUnlocks(unlocked);
  console.log("Applied mutation");
}

function simulateAllShapes(): void {
  const shapes = ["CIRCLE", "RECT", "LINE", "TRIANGLE", "ELLIPSE"];
  const allUnlocked: Achievement[] = [];
  for (const shape of shapes) {
    const unlocked = engine.trackShapeDrawn(shape);
    allUnlocked.push(...unlocked);
  }
  ui.handleUnlocks(allUnlocked);
  console.log("Used all 5 shape opcodes");
}

function simulateColorUsage(): void {
  const allUnlocked: Achievement[] = [];
  for (let i = 0; i < 10; i++) {
    const unlocked = engine.trackColorUsed();
    allUnlocked.push(...unlocked);
  }
  ui.handleUnlocks(allUnlocked);
  console.log("Used COLOR opcode 10 times");
}

function simulateTransforms(): void {
  const unlocked = engine.trackTransformApplied("ROTATE");
  ui.handleUnlocks(unlocked);
  console.log("Applied transform");
}

function simulateMadScientist(): void {
  const allUnlocked: Achievement[] = [];
  for (let i = 0; i < 100; i++) {
    const unlocked = engine.trackMutationApplied();
    allUnlocked.push(...unlocked);
  }
  ui.handleUnlocks(allUnlocked);
  console.log("Applied 100 mutations!");
}

function simulateCorrectChallenge(): void {
  const types = [
    "silent",
    "missense",
    "nonsense",
    "frameshift",
    "insertion",
    "deletion",
  ];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const unlocked = engine.trackChallengeCompleted(true, randomType);
  ui.handleUnlocks(unlocked);
  console.log(`Completed challenge (${randomType}) correctly`);
}

function simulateAllMutationTypes(): void {
  const types = [
    "silent",
    "missense",
    "nonsense",
    "frameshift",
    "insertion",
    "deletion",
  ];
  const allUnlocked: Achievement[] = [];
  for (const type of types) {
    const unlocked = engine.trackChallengeCompleted(true, type);
    allUnlocked.push(...unlocked);
  }
  ui.handleUnlocks(allUnlocked);
  console.log("Identified all 6 mutation types");
}

function simulateFlawless(): void {
  const allUnlocked: Achievement[] = [];
  for (let i = 0; i < 10; i++) {
    const unlocked = engine.trackChallengeCompleted(true, "silent");
    allUnlocked.push(...unlocked);
  }
  ui.handleUnlocks(allUnlocked);
  console.log("10 consecutive correct challenges");
}

function simulatePerfectScore(): void {
  const unlocked = engine.trackPerfectScore();
  ui.handleUnlocks(unlocked);
  console.log("Perfect score achieved!");
}

function simulateEvolution(): void {
  const allUnlocked: Achievement[] = [];
  for (let i = 0; i < 50; i++) {
    const unlocked = engine.trackEvolutionGeneration();
    allUnlocked.push(...unlocked);
  }
  ui.handleUnlocks(allUnlocked);
  console.log("Ran 50 evolution generations");
}

function simulateAudioSynthesis(): void {
  const unlocked = engine.trackAudioSynthesis();
  ui.handleUnlocks(unlocked);
  console.log("Used audio synthesis mode");
}

function simulateTimeline(): void {
  const unlocked = engine.trackTimelineStepThrough();
  ui.handleUnlocks(unlocked);
  console.log("Used timeline step-through");
}

function simulateProfessor(): void {
  const allUnlocked: Achievement[] = [];
  // Complete 50 challenges with 48 correct (96% accuracy)
  for (let i = 0; i < 48; i++) {
    const unlocked = engine.trackChallengeCompleted(true, "silent");
    allUnlocked.push(...unlocked);
  }
  for (let i = 0; i < 2; i++) {
    const unlocked = engine.trackChallengeCompleted(false, "silent");
    allUnlocked.push(...unlocked);
  }
  ui.handleUnlocks(allUnlocked);
  console.log("Achieved Professor status (50+ challenges at 95%+)");
}

function resetProgress(): void {
  if (confirm("Are you sure you want to reset all achievement progress?")) {
    engine.reset();
    ui.render();
    console.log("Achievement progress reset");
    alert("All progress has been reset!");
  }
}

// Action handlers map for data-action buttons
const actionHandlers: Record<string, () => void> = {
  simulateGenomeCreation,
  simulateGenomeExecution,
  simulateLongGenome,
  simulateMutation,
  simulateAllShapes,
  simulateColorUsage,
  simulateTransforms,
  simulateMadScientist,
  simulateCorrectChallenge,
  simulateAllMutationTypes,
  simulateFlawless,
  simulatePerfectScore,
  simulateEvolution,
  simulateAudioSynthesis,
  simulateTimeline,
  simulateProfessor,
};

// Bind event listeners for action buttons
for (const btn of document.querySelectorAll<HTMLButtonElement>(
  "[data-action]",
)) {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action && action in actionHandlers) {
      actionHandlers[action]();
    }
  });
}

// Bind reset progress button
document
  .getElementById("reset-progress-btn")
  ?.addEventListener("click", resetProgress);

// Expose for debugging only
declare global {
  interface Window {
    achievementEngine: AchievementEngine;
    achievementUI: AchievementUI;
  }
}
window.achievementEngine = engine;
window.achievementUI = ui;

console.log("🎮 Achievement Demo Ready!");
console.log("Try the buttons above to unlock achievements.");
console.log("Check localStorage to see persistence working!");
