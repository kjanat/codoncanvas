/**
 * PlaygroundToolbar - Toolbar controls for the Playground editor
 *
 * Contains example selector, file I/O, undo/redo, nucleotide mode toggle,
 * and reference panel toggle.
 */

import { memo } from "react";
import type { ExampleWithKey } from "@/hooks/useExamples";
import {
  getModeButtonLabel,
  getModeButtonTooltip,
  getNucleotideModeInfo,
  type NucleotideDisplayMode,
} from "@/utils/nucleotide-display";

interface NucleotideModeToggleProps {
  mode: NucleotideDisplayMode;
  onToggle: () => void;
}

function NucleotideModeToggle({ mode, onToggle }: NucleotideModeToggleProps) {
  const info = getNucleotideModeInfo();

  return (
    <div className="group relative">
      <button
        aria-label={`Switch to ${mode === "DNA" ? "RNA" : "DNA"} display mode`}
        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
          mode === "RNA"
            ? "bg-accent/10 text-accent"
            : "text-text hover:bg-bg-light"
        }`}
        onClick={onToggle}
        title={getModeButtonTooltip(mode)}
        type="button"
      >
        {getModeButtonLabel(mode)}
      </button>

      <div className="invisible absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-surface p-3 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="mb-2 font-medium text-text">
          {info.nucleicAcid} Mode
        </div>
        <p className="text-xs text-text-muted">{info.description}</p>
        <p className="mt-2 text-xs text-text-muted">{info.biologicalContext}</p>
      </div>
    </div>
  );
}

export interface PlaygroundToolbarProps {
  /** All available examples */
  examples: ExampleWithKey[];
  /** Currently selected example key */
  selectedExampleKey: string | null;
  /** Callback when example is selected */
  onExampleChange: (key: string) => void;
  /** Callback to load genome from file */
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Callback to save genome to file */
  onSave: () => void;
  /** Callback to copy genome code */
  onCopy: () => void;
  /** Whether copy was recently triggered */
  copied: boolean;
  /** Callback to share genome URL */
  onShare: () => void;
  /** Callback to undo */
  onUndo: () => void;
  /** Callback to redo */
  onRedo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Current nucleotide display mode */
  nucleotideMode: NucleotideDisplayMode;
  /** Callback to toggle nucleotide mode */
  onToggleNucleotideMode: () => void;
  /** Whether reference panel is shown */
  showReference: boolean;
  /** Callback to toggle reference panel */
  onToggleReference: () => void;
  /** Callback to run genome */
  onRun: () => void;
  /** Whether genome is valid for running */
  canRun: boolean;
}

export const PlaygroundToolbar = memo(function PlaygroundToolbar({
  examples,
  selectedExampleKey,
  onExampleChange,
  onLoad,
  onSave,
  onCopy,
  copied,
  onShare,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  nucleotideMode,
  onToggleNucleotideMode,
  showReference,
  onToggleReference,
  onRun,
  canRun,
}: PlaygroundToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
      {/* Example selector */}
      <select
        aria-label="Select example genome"
        className="rounded-md border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        onChange={(e) => onExampleChange(e.target.value)}
        value={selectedExampleKey ?? ""}
      >
        <option value="">Select example...</option>
        {examples.map((ex) => (
          <option key={ex.key} value={ex.key}>
            {ex.title}
          </option>
        ))}
      </select>

      {/* File I/O buttons */}
      <div className="flex items-center gap-1">
        <label className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-text hover:bg-bg-light">
          <span>Load</span>
          <input
            accept=".genome,.txt"
            aria-label="Load genome file"
            className="hidden"
            onChange={onLoad}
            type="file"
          />
        </label>
        <button
          aria-label="Save genome file"
          className="rounded-md px-3 py-1.5 text-sm text-text hover:bg-bg-light"
          onClick={onSave}
          title="Save (Ctrl+S)"
          type="button"
        >
          Save
        </button>
        <button
          aria-label={copied ? "Copied to clipboard" : "Copy genome code"}
          className="rounded-md px-3 py-1.5 text-sm text-text hover:bg-bg-light"
          onClick={onCopy}
          title="Copy genome code"
          type="button"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          aria-label="Copy shareable link"
          className="rounded-md px-3 py-1.5 text-sm text-text hover:bg-bg-light"
          onClick={onShare}
          title="Copy shareable link"
          type="button"
        >
          Share
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          aria-label="Undo last change"
          className="rounded-md px-2 py-1.5 text-sm text-text hover:bg-bg-light disabled:opacity-40"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          type="button"
        >
          Undo
        </button>
        <button
          aria-label="Redo last change"
          className="rounded-md px-2 py-1.5 text-sm text-text hover:bg-bg-light disabled:opacity-40"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Shift+Z)"
          type="button"
        >
          Redo
        </button>
      </div>

      {/* Nucleotide mode toggle */}
      <NucleotideModeToggle
        mode={nucleotideMode}
        onToggle={onToggleNucleotideMode}
      />

      {/* Reference toggle */}
      <button
        aria-label={
          showReference ? "Hide codon reference" : "Show codon reference"
        }
        aria-pressed={showReference}
        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
          showReference
            ? "bg-primary/10 text-primary"
            : "text-text hover:bg-bg-light"
        }`}
        onClick={onToggleReference}
        title="Toggle codon reference"
        type="button"
      >
        Reference
      </button>

      {/* Run button */}
      <button
        aria-label="Run genome"
        className="ml-auto rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        disabled={!canRun}
        onClick={onRun}
        type="button"
      >
        Run
      </button>
    </div>
  );
});

export default PlaygroundToolbar;
