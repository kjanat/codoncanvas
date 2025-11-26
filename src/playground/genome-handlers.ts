/**
 * Genome File Handlers Module
 * Handles loading and saving genome files
 */

import { readGenomeFile } from "../genome-io";
import { editor, genomeFileInput } from "./dom-manager";
import { setStatus, updateStats } from "./ui-utils";
import { runLinter } from "./linter-handlers";

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
    const info = genomeFile.title +
      (genomeFile.author ? ` by ${genomeFile.author}` : "");
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
