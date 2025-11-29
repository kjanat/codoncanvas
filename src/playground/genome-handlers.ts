/**
 * @fileoverview Genome File Handlers Module (LEGACY)
 *
 * @deprecated This module is legacy code for vanilla JS HTML pages.
 * For React, file I/O is handled in Playground.tsx (handleLoad, handleSave).
 *
 * @see src/components/Playground.tsx - React replacement
 * @see src/genetics/genome-io.ts - Core I/O logic (keep)
 */

import { readGenomeFile } from "@/genetics/genome-io";
import { editor, genomeFileInput } from "@/playground/dom-manager";
import { runLinter } from "@/playground/linter-handlers";
import { setStatus, updateStats } from "@/playground/ui-utils";

/**
 * Trigger genome file load dialog
 */
export function loadGenome() {
  genomeFileInput.click();
}

/**
 * Handle genome file selection and loading
 */
export async function handleFileLoad(event: Event) {
  try {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const genomeFile = await readGenomeFile(file);

    // Load genome into editor
    editor.value = genomeFile.genome;

    // Update stats
    const tokens = genomeFile.genome.split(/\s+/).filter((t) => t.length === 3);
    updateStats(tokens.length, 0);

    // Show success with metadata
    const info =
      genomeFile.title + (genomeFile.author ? ` by ${genomeFile.author}` : "");
    setStatus(`Loaded: ${info}`, "success");

    // Run linter on loaded genome
    runLinter(genomeFile.genome);

    // Reset file input
    input.value = "";
  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Failed to load genome: ${error.message}`, "error");
    } else {
      setStatus("Failed to load genome", "error");
    }

    // Reset file input
    const input = event.target as HTMLInputElement;
    input.value = "";
  }
}
