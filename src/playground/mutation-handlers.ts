/**
 * Mutation Handlers Module
 * Handles genome mutation operations and preview functionality
 */

import { predictMutationImpact } from "@/mutation-predictor";
import { getMutationByType } from "@/mutations";
import {
  diffViewerContainer,
  diffViewerPanel,
  editor,
} from "@/playground/dom-manager";
import { achievementEngine, achievementUI } from "@/playground/ui-state";
import { setStatus } from "@/playground/ui-utils";
import type { MutationType } from "@/types";

let originalGenomeBeforeMutation = "";
let diffViewerInstance: import("@/diff-viewer").DiffViewer | null = null; // Cached DiffViewer instance

/**
 * Initialize or get DiffViewer instance
 */
function getDiffViewer(): import("@/diff-viewer").DiffViewer {
  if (!diffViewerInstance) {
    // Lazy import to avoid circular dependencies
    const { DiffViewer } = require("@/diff-viewer");
    diffViewerInstance = new DiffViewer({
      containerElement: diffViewerContainer,
    });
  }
  // Instance is guaranteed to exist after the if block above
  return diffViewerInstance as import("@/diff-viewer").DiffViewer;
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

    const result = getMutationByType(type, genome);

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

    const result = getMutationByType(type, genome);
    const prediction = predictMutationImpact(genome, result);
    setStatus(`Mutation preview: ${prediction.description}`, "info");
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
