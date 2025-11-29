import { escapeHtml, getElement } from "../dom-utils";
import { examples } from "../examples";
import { injectShareStyles, ShareSystem } from "../share-system";
import { injectTimelineStyles, TimelineScrubber } from "../timeline-scrubber";
import { TutorialManager, timelineTutorial } from "../tutorial";
import { TutorialUI } from "../tutorial-ui";
import "../tutorial-ui.css";

// Inject styles
injectTimelineStyles();
injectShareStyles();

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const timelineContainer = getElement("timeline-container");
const statusContainer = getElement("status-container");
const shareContainer = getElement("share-container");

// Initialize share system
new ShareSystem({
  containerElement: shareContainer,
  getGenome: () => editor.value.trim(),
  appTitle: "CodonCanvas Timeline Demo",
  showQRCode: true,
  socialPlatforms: ["twitter", "reddit", "email"],
});

let timeline: TimelineScrubber | null = null;

function showStatus(message: string, type = "success"): void {
  statusContainer.innerHTML = `<div class="status ${escapeHtml(type)}">${escapeHtml(message)}</div>`;
  setTimeout(() => {
    statusContainer.innerHTML = "";
  }, 5000);
}

function loadExample(key: string): void {
  const example = examples[key as keyof typeof examples];
  if (example) {
    editor.value = example.genome;
    showStatus(`Loaded: ${example.title}`, "success");
  }
}

function loadAndExecute(): void {
  try {
    const genome = editor.value;

    // Destroy existing timeline if any
    if (timeline) {
      timeline.destroy();
    }

    // Create new timeline
    timeline = new TimelineScrubber({
      containerElement: timelineContainer,
      canvasElement: canvas,
      playbackSpeed: 500,
    });

    // Load genome
    timeline.loadGenome(genome);

    showStatus(
      "Genome loaded! Use timeline controls to step through execution.",
      "success",
    );
  } catch (error) {
    console.error("Load error:", error);
    showStatus(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
  }
}

function clearCanvas(): void {
  if (timeline) {
    timeline.destroy();
    timeline = null;
  }
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  timelineContainer.innerHTML = "";
  showStatus("Canvas and timeline cleared", "success");
}

async function exportGif(): Promise<void> {
  if (!timeline) {
    showStatus("Please load a genome first", "error");
    return;
  }

  try {
    const fpsSelect = document.getElementById("gif-fps") as HTMLSelectElement;
    const qualitySelect = document.getElementById(
      "gif-quality",
    ) as HTMLSelectElement;
    const progressContainer = document.getElementById("gif-progress");
    const progressBar = document.getElementById("gif-progress-bar");
    const progressText = document.getElementById("gif-progress-text");

    const fps = parseInt(fpsSelect.value, 10);
    const quality = parseInt(qualitySelect.value, 10);
    const genomeName = "timeline-animation";

    // Show progress
    if (progressContainer) progressContainer.style.display = "block";
    if (progressBar) progressBar.style.width = "0%";
    if (progressText) progressText.textContent = "0%";

    await timeline.exportToGif(
      { fps, quality, genomeName },
      (progress: {
        percent: number;
        currentFrame: number;
        totalFrames: number;
      }) => {
        if (progressBar) progressBar.style.width = `${progress.percent}%`;
        if (progressText) {
          progressText.textContent = `${progress.percent}% (Frame ${progress.currentFrame}/${progress.totalFrames})`;
        }
      },
    );

    // Hide progress and show success
    setTimeout(() => {
      if (progressContainer) progressContainer.style.display = "none";
      showStatus("GIF exported successfully! 📹", "success");
    }, 500);
  } catch (error) {
    console.error("GIF export error:", error);
    showStatus(
      `GIF export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
    const progressContainer = document.getElementById("gif-progress");
    if (progressContainer) progressContainer.style.display = "none";
  }
}

// Bind event listeners for example buttons
for (const btn of document.querySelectorAll<HTMLButtonElement>(
  "[data-example]",
)) {
  btn.addEventListener("click", () => {
    const key = btn.dataset.example;
    if (key) loadExample(key);
  });
}

// Bind main action buttons
document
  .getElementById("load-execute-btn")
  ?.addEventListener("click", loadAndExecute);
document
  .getElementById("clear-canvas-btn")
  ?.addEventListener("click", clearCanvas);
document.getElementById("export-gif-btn")?.addEventListener("click", exportGif);

// Expose for debugging only
declare global {
  interface Window {
    resetTimelineTutorial: () => void;
  }
}

// Load genome from URL if present, otherwise auto-load default
const urlGenome = ShareSystem.loadFromURL();
if (urlGenome) {
  editor.value = urlGenome;
  showStatus("Loaded genome from share link", "success");
  setTimeout(() => {
    loadAndExecute();
  }, 100);
} else {
  // Auto-load on start
  loadAndExecute();
}

// Initialize tutorial system
const tutorialManager = new TutorialManager(
  "codoncanvas_timeline_tutorial_completed",
);
const tutorialUI = new TutorialUI(document.body, tutorialManager);

// Show tutorial on first visit
if (!tutorialManager.isCompleted()) {
  setTimeout(() => {
    tutorialManager.start(timelineTutorial);
    tutorialUI.show();
  }, 2000); // 2 second delay for page to settle
}

// Tutorial callbacks
tutorialManager.onCompleteCallback(() => {
  console.log("Timeline tutorial completed! 🏆");
});

// Global function to reset tutorial (for testing)
window.resetTimelineTutorial = () => {
  tutorialManager.reset();
  console.log("Timeline tutorial reset. Reload page to see it again.");
};
