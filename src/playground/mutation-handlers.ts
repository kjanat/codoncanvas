/**
 * Mutation Handlers Module
 * Handles genome mutation operations and preview functionality
 */

import { predictMutationImpact } from "@/genetics/mutation-predictor";
import { getMutationByType } from "@/genetics/mutations";
import {
  diffViewerContainer,
  diffViewerPanel,
  editor,
} from "@/playground/dom-manager";
import { achievementEngine, achievementUI } from "@/playground/ui-state";
import { setStatus } from "@/playground/ui-utils";
import type { MutationType } from "@/types";
import type { DiffViewer } from "@/ui/diff-viewer";

let originalGenomeBeforeMutation = "";
let diffViewerInstance: DiffViewer | null = null; // Cached DiffViewer instance

/**
 * Initialize or get DiffViewer instance (lazy loaded)
 */
async function getDiffViewer(): Promise<DiffViewer> {
  if (!diffViewerInstance) {
    // Lazy import to avoid circular dependencies
    const { DiffViewer } = await import("@/ui/diff-viewer");
    diffViewerInstance = new DiffViewer({
      containerElement: diffViewerContainer,
    });
  }
  return diffViewerInstance;
}

/**
 * Apply mutation to current genome
 */
export async function applyMutation(type: MutationType): Promise<void> {
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

    const diffViewer = await getDiffViewer();
    diffViewer.renderMutation(result);
    diffViewerPanel.style.display = "block";

    diffViewerPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });

    setStatus(`${result.description}`, "success");
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
