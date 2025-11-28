interface LearningPathStep {
  title: string;
  concept: string;
  narrative: string;
  keyTakeaway: string;
  tryIt: string;
  genome: string;
}

interface LearningPath {
  id: string;
  title: string;
  difficulty: string;
  duration: string;
  description: string;
  learningObjectives: string[];
  steps: LearningPathStep[];
}

interface PathsData {
  paths: LearningPath[];
}

let pathsData: PathsData | null = null;
let currentPath: LearningPath | null = null;
let currentStepIndex = 0;

async function loadPaths() {
  try {
    const response = await fetch("examples/learning-paths.json");
    pathsData = (await response.json()) as PathsData;
    renderPathSelector();
  } catch (error) {
    console.error("Failed to load paths:", error);
  }
}

function renderPathSelector() {
  const container = document.getElementById("pathSelector");
  if (!container || !pathsData) return;

  container.innerHTML = pathsData.paths
    .map(
      (path) => `
    <div class="path-card" data-path-id="${path.id}">
      <div class="path-title">${path.title}</div>
      <div class="path-meta">
        <span class="difficulty ${path.difficulty}">${path.difficulty.replace(
          /-/g,
          " ",
        )}</span>
        <span>⏱ ${path.duration}</span>
      </div>
      <div class="path-description">${path.description}</div>
      <div class="objectives">
        <div class="objectives-title">Learning Objectives:</div>
        <ul>
          ${path.learningObjectives.map((obj) => `<li>${obj}</li>`).join("")}
        </ul>
      </div>
    </div>
  `,
    )
    .join("");

  // Add click handlers
  document.querySelectorAll(".path-card").forEach((card) => {
    card.addEventListener("click", () => {
      const pathId = (card as HTMLElement).dataset.pathId;
      if (pathId) {
        startPath(pathId);
      }
    });
  });
}

function startPath(pathId: string) {
  if (!pathsData) return;
  currentPath = pathsData.paths.find((p) => p.id === pathId) || null;
  if (!currentPath) return;

  currentStepIndex = 0;

  // Hide selector, show viewer
  const selector = document.getElementById("pathSelector");
  const viewer = document.getElementById("pathViewer");
  if (selector) selector.style.display = "none";
  if (viewer) viewer.classList.add("active");

  // Set total steps
  const totalSteps = document.getElementById("totalSteps");
  if (totalSteps) totalSteps.textContent = currentPath.steps.length.toString();

  // Render first step
  renderStep();
}

function renderStep() {
  if (!currentPath) return;
  const step = currentPath.steps[currentStepIndex];
  const stepContent = document.getElementById("stepContent");

  if (stepContent) {
    stepContent.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">${step.title}</h2>
      <div class="step-concept">${step.concept}</div>
    </div>

    <div class="narrative">
      ${step.narrative}
    </div>

    <div class="key-takeaway">
      <strong>💡 Key Takeaway:</strong> ${step.keyTakeaway}
    </div>

    <div class="try-it">
      <strong>🧪 Try It:</strong> ${step.tryIt}
    </div>

    <a href="index.html?example=${step.genome.replace(
      ".genome",
      "",
    )}" class="genome-link" target="_blank">
      🧬 Open ${step.genome} in Playground →
    </a>
  `;
  }

  // Update progress
  const progress = ((currentStepIndex + 1) / currentPath.steps.length) * 100;
  const progressFill = document.getElementById("progressFill");
  const currentStep = document.getElementById("currentStep");

  if (progressFill) progressFill.style.width = `${progress}%`;
  if (currentStep) currentStep.textContent = (currentStepIndex + 1).toString();

  // Update navigation buttons
  const prevButton = document.getElementById(
    "prevButton",
  ) as HTMLButtonElement | null;
  const nextButton = document.getElementById(
    "nextButton",
  ) as HTMLButtonElement | null;

  if (prevButton) prevButton.disabled = currentStepIndex === 0;
  if (nextButton) {
    nextButton.disabled = currentStepIndex === currentPath.steps.length - 1;

    // Change "Next" to "Complete" on last step
    if (currentStepIndex === currentPath.steps.length - 1) {
      nextButton.textContent = "✓ Complete Path";
    } else {
      nextButton.textContent = "Next →";
    }
  }
}

function nextStep() {
  if (!currentPath) return;
  if (currentStepIndex < currentPath.steps.length - 1) {
    currentStepIndex++;
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Path completed
    alert(
      `🎉 Congratulations! You've completed the "${
        currentPath.title
      }" learning path!\n\nYou've learned:\n${currentPath.learningObjectives
        .map((obj, i) => `${i + 1}. ${obj}`)
        .join(
          "\n",
        )}\n\nExplore another path or start creating your own genomes!`,
    );
    backToSelector();
  }
}

function prevStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function backToSelector() {
  const viewer = document.getElementById("pathViewer");
  const selector = document.getElementById("pathSelector");

  if (viewer) viewer.classList.remove("active");
  if (selector) selector.style.display = "grid";

  currentPath = null;
  currentStepIndex = 0;
}

// Event listeners
const nextButton = document.getElementById("nextButton");
if (nextButton) nextButton.addEventListener("click", nextStep);

const prevButton = document.getElementById("prevButton");
if (prevButton) prevButton.addEventListener("click", prevStep);

const backButton = document.getElementById("backButton");
if (backButton) {
  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (
      confirm(
        "Are you sure you want to exit this learning path? Your progress will not be saved.",
      )
    ) {
      backToSelector();
    }
  });
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (currentPath) {
    if (
      e.key === "ArrowRight" &&
      currentStepIndex < currentPath.steps.length - 1
    ) {
      nextStep();
    } else if (e.key === "ArrowLeft" && currentStepIndex > 0) {
      prevStep();
    }
  }
});

// Initialize
loadPaths();
