/**
 * Mutation Handlers Module
 * Handles genome mutation operations and preview functionality
 */

import {
  applyDeletion,
  applyFrameshiftMutation,
  applyInsertion,
  applyMissenseMutation,
  applyNonsenseMutation,
  applyPointMutation,
  applySilentMutation,
  type MutationType,
} from "../mutations";
import {
  predictMutationImpact,
  type ImpactLevel,
} from "../mutation-predictor";
import { editor, diffViewerPanel, diffViewerContainer } from "./dom-manager";
import { setStatus } from "./ui-utils";
import { achievementEngine, achievementUI } from "./ui-state";

let originalGenomeBeforeMutation = "";
let diffViewerInstance: any = null; // Cached DiffViewer instance

/**
 * Initialize or get DiffViewer instance
 */
function getDiffViewer() {
  if (!diffViewerInstance) {
    // Lazy import to avoid circular dependencies
    const { DiffViewer } = require("../diff-viewer");
    diffViewerInstance = new DiffViewer({
      containerElement: diffViewerContainer,
    });
  }
  return diffViewerInstance;
}

/**
 * Apply mutation to current genome
 */
export function applyMutation(type: MutationType) {
  try {
    const genome = editor.value.trim();

    if (!genome) {
      setStatus("No genome to mutate", "error");
      return;
    }

    originalGenomeBeforeMutation = genome;

    let result;

    switch (type) {
      case "silent":
        result = applySilentMutation(genome);
        break;
      case "missense":
        result = applyMissenseMutation(genome);
        break;
      case "nonsense":
        result = applyNonsenseMutation(genome);
        break;
      case "point":
        result = applyPointMutation(genome);
        break;
      case "insertion":
        result = applyInsertion(genome);
        break;
      case "deletion":
        result = applyDeletion(genome);
        break;
      case "frameshift":
        result = applyFrameshiftMutation(genome);
        break;
      default:
        throw new Error(`Unknown mutation type: ${type}`);
    }

    editor.value = result.mutated;

    const unlocked = achievementEngine.trackMutationApplied();
    achievementUI.handleUnlocks(unlocked);

    const diffViewer = getDiffViewer();
    diffViewer.renderMutation(result);
    diffViewerPanel.style.display = "block";

    diffViewerPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });

    setStatus(`🧬 ${result.description}`, "success");
  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Mutation failed: ${error.message}`, "error");
    } else {
      setStatus("Mutation failed", "error");
    }
  }
}

/**
 * Preview mutation before applying
 */
export function previewMutation(type: MutationType) {
  try {
    const genome = editor.value.trim();

    if (!genome) {
      setStatus("No genome to preview", "error");
      return;
    }

    const prediction = predictMutationImpact(genome, type);
    setStatus(
      `Mutation preview: ${prediction.description}`,
      "info",
    );
  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Preview failed: ${error.message}`, "error");
    } else {
      setStatus("Preview failed", "error");
    }
  }
}

/**
 * Get original genome before mutation
 */
export function getOriginalGenomeBeforeMutation(): string {
  return originalGenomeBeforeMutation;
}

/**
 * Reset mutation state
 */
export function resetMutationState() {
  originalGenomeBeforeMutation = "";
}
