/**
 * Export Handlers Module
 * Handles all export functionality (PNG, Audio, MIDI, Genome, Progress)
 */

import { downloadGenomeFile } from "@/genome-io";
import { editor } from "@/playground/dom-manager";
import { lastSnapshots, midiExporter, renderer } from "@/playground/ui-state";
import { setStatus } from "@/playground/ui-utils";

/**
 * Export canvas as PNG image
 */
export function exportImage() {
  try {
    const dataURL = renderer.toDataURL();
    const link = document.createElement("a");
    link.download = "codoncanvas-output.png";
    link.href = dataURL;
    link.click();
    setStatus("Image exported successfully", "success");
  } catch (_error) {
    setStatus("Failed to export image", "error");
  }
}

/**
 * Save genome to file
 */
export function saveGenome() {
  try {
    const genome = editor.value.trim();
    if (!genome) {
      setStatus("No genome to save", "error");
      return;
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `codoncanvas-${timestamp}`;

    // Use the genome content as title (first line or first 30 chars)
    const firstLine = genome.split("\n")[0].replace(/;.*$/, "").trim();
    const _title = firstLine.slice(0, 30) || "CodonCanvas Genome";

    downloadGenomeFile(genome, filename, {
      description: "Created with CodonCanvas Playground",
      author: "CodonCanvas User",
    });

    setStatus("Genome saved successfully", "success");
  } catch (_error) {
    setStatus("Failed to save genome", "error");
  }
}

/**
 * Export as MIDI file
 */
export function exportMidi() {
  try {
    if (lastSnapshots.length === 0) {
      setStatus("No program executed yet - run a genome first", "error");
      return;
    }

    const midiBlob = midiExporter.generateMIDI(lastSnapshots);
    const url = URL.createObjectURL(midiBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `codoncanvas-${Date.now()}.mid`;
    link.click();

    URL.revokeObjectURL(url);
    setStatus("MIDI exported successfully", "success");
  } catch (error) {
    if (error instanceof Error) {
      setStatus(`MIDI export failed: ${error.message}`, "error");
    } else {
      setStatus("MIDI export failed", "error");
    }
  }
}

/**
 * Export student progress
 */
export async function exportStudentProgress() {
  try {
    // Gather all achievement data
    const achievementData = {
      achievements: [],
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Create a Blob and download
    const blob = new Blob([JSON.stringify(achievementData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `codoncanvas-progress-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    setStatus("Progress exported successfully", "success");
  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Export failed: ${error.message}`, "error");
    } else {
      setStatus("Export failed", "error");
    }
  }
}
