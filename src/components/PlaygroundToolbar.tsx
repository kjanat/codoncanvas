/**
 * PlaygroundToolbar - Toolbar controls for the Playground editor
 *
 * Contains example selector, file I/O, undo/redo, nucleotide mode toggle,
 * and reference panel toggle. Responsive design with icon-only on mobile.
 */

import { type ChangeEvent, memo, useState } from "react";

import type { ExampleWithKey } from "@/hooks/useExamples";
import {
  BookIcon,
  CheckIcon,
  CopyIcon,
  DotsVerticalIcon,
  PlayIcon,
  RedoIcon,
  SaveIcon,
  ShareIcon,
  UndoIcon,
  UploadIcon,
} from "@/ui/icons";
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
  const info = getNucleotideModeInfo(mode);

  return (
    <div className="group relative">
      <button
        aria-label="Toggle RNA display mode"
        aria-pressed={mode === "RNA"}
        className={`flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-sm transition-colors ${
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

/** Overflow menu for mobile */
function OverflowMenu({
  io,
  history,
}: {
  io: ToolbarIOProps;
  history: ToolbarHistoryProps;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="More actions"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-text hover:bg-bg-light"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <DotsVerticalIcon />
      </button>

      {isOpen && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
            <label className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light">
              <UploadIcon className="h-4 w-4" />
              Load file
              <input
                accept=".genome,.txt"
                className="hidden"
                onChange={(e) => {
                  io.onLoad(e);
                  setIsOpen(false);
                }}
                type="file"
              />
            </label>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              onClick={() => {
                io.onSave();
                setIsOpen(false);
              }}
              type="button"
            >
              <SaveIcon className="h-4 w-4" />
              Save
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              onClick={() => {
                io.onCopy();
                setIsOpen(false);
              }}
              type="button"
            >
              {io.copied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              {io.copied ? "Copied!" : "Copy"}
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light"
              onClick={() => {
                io.onShare();
                setIsOpen(false);
              }}
              type="button"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
            <hr className="my-1 border-border" />
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light disabled:opacity-40"
              disabled={!history.canUndo}
              onClick={() => {
                history.onUndo();
                setIsOpen(false);
              }}
              type="button"
            >
              <UndoIcon className="h-4 w-4" />
              Undo
            </button>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-text hover:bg-bg-light disabled:opacity-40"
              disabled={!history.canRedo}
              onClick={() => {
                history.onRedo();
                setIsOpen(false);
              }}
              type="button"
            >
              <RedoIcon className="h-4 w-4" />
              Redo
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** File I/O operations (load, save, copy, share) */
export interface ToolbarIOProps {
  onLoad: (event: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCopy: () => void;
  copied: boolean;
  onShare: () => void;
}

/** Undo/redo history controls */
export interface ToolbarHistoryProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/** Display mode and reference panel toggles */
export interface ToolbarDisplayProps {
  nucleotideMode: NucleotideDisplayMode;
  onToggleNucleotideMode: () => void;
  showReference: boolean;
  onToggleReference: () => void;
}

/** Genome execution controls */
export interface ToolbarExecutionProps {
  onRun: () => void;
  canRun: boolean;
}

export interface PlaygroundToolbarProps {
  /** All available examples */
  examples: ExampleWithKey[];
  /** Currently selected example key */
  selectedExampleKey: string | null;
  /** Callback when example is selected */
  onExampleChange: (key: string) => void;
  /** File I/O operations */
  io: ToolbarIOProps;
  /** Undo/redo history controls */
  history: ToolbarHistoryProps;
  /** Display mode and panel toggles */
  display: ToolbarDisplayProps;
  /** Genome execution controls */
  execution: ToolbarExecutionProps;
}

export const PlaygroundToolbar = memo(function PlaygroundToolbar({
  examples,
  selectedExampleKey,
  onExampleChange,
  io,
  history,
  display,
  execution,
}: PlaygroundToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-2 sm:gap-2 sm:px-4">
      {/* Example selector */}
      <select
        aria-label="Select example genome"
        className="min-h-[44px] flex-1 rounded-md border border-border px-2 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:flex-none sm:px-3"
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onExampleChange(event.target.value)
        }
        value={selectedExampleKey ?? ""}
      >
        <option value="">Select example...</option>
        {examples.map((ex) => (
          <option key={ex.key} value={ex.key}>
            {ex.title}
          </option>
        ))}
      </select>

      {/* Desktop: File I/O buttons */}
      <div className="hidden items-center gap-1 md:flex">
        <label className="flex min-h-[44px] cursor-pointer items-center rounded-md px-3 py-2 text-sm text-text hover:bg-bg-light">
          <UploadIcon className="mr-1.5 h-4 w-4" />
          <span>Load</span>
          <input
            accept=".genome,.txt"
            aria-label="Load genome file"
            className="hidden"
            onChange={io.onLoad}
            type="file"
          />
        </label>
        <button
          aria-label="Save genome file"
          className="flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm text-text hover:bg-bg-light"
          onClick={io.onSave}
          title="Save (Ctrl+S)"
          type="button"
        >
          <SaveIcon className="mr-1.5 h-4 w-4" />
          Save
        </button>
        <button
          aria-label={io.copied ? "Copied to clipboard" : "Copy genome code"}
          className="flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm text-text hover:bg-bg-light"
          onClick={io.onCopy}
          title="Copy genome code"
          type="button"
        >
          {io.copied ? (
            <CheckIcon className="mr-1.5 h-4 w-4" />
          ) : (
            <CopyIcon className="mr-1.5 h-4 w-4" />
          )}
          {io.copied ? "Copied!" : "Copy"}
        </button>
        <button
          aria-label="Copy shareable link"
          className="flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm text-text hover:bg-bg-light"
          onClick={io.onShare}
          title="Copy shareable link"
          type="button"
        >
          <ShareIcon className="mr-1.5 h-4 w-4" />
          Share
        </button>
      </div>

      {/* Desktop: Undo/Redo */}
      <div className="hidden items-center gap-1 md:flex">
        <button
          aria-label="Undo last change"
          className="flex min-h-[44px] items-center rounded-md px-2 py-2 text-sm text-text hover:bg-bg-light disabled:opacity-40"
          disabled={!history.canUndo}
          onClick={history.onUndo}
          title="Undo (Ctrl+Z)"
          type="button"
        >
          <UndoIcon className="mr-1 h-4 w-4" />
          Undo
        </button>
        <button
          aria-label="Redo last change"
          className="flex min-h-[44px] items-center rounded-md px-2 py-2 text-sm text-text hover:bg-bg-light disabled:opacity-40"
          disabled={!history.canRedo}
          onClick={history.onRedo}
          title="Redo (Ctrl+Shift+Z)"
          type="button"
        >
          <RedoIcon className="mr-1 h-4 w-4" />
          Redo
        </button>
      </div>

      {/* Mobile: Overflow menu */}
      <OverflowMenu history={history} io={io} />

      {/* Nucleotide mode toggle - always visible */}
      <NucleotideModeToggle
        mode={display.nucleotideMode}
        onToggle={display.onToggleNucleotideMode}
      />

      {/* Reference toggle */}
      <button
        aria-label={
          display.showReference
            ? "Hide codon reference"
            : "Show codon reference"
        }
        aria-pressed={display.showReference}
        className={`flex min-h-[44px] items-center justify-center rounded-md px-2 py-2 text-sm transition-colors sm:px-3 ${
          display.showReference
            ? "bg-primary/10 text-primary"
            : "text-text hover:bg-bg-light"
        }`}
        onClick={display.onToggleReference}
        title="Toggle codon reference"
        type="button"
      >
        <BookIcon className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Reference</span>
      </button>

      {/* Run button */}
      <button
        aria-label="Run genome"
        className="ml-auto flex min-h-[44px] items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50 sm:px-4"
        disabled={!execution.canRun}
        onClick={execution.onRun}
        type="button"
      >
        <PlayIcon className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Run</span>
      </button>
    </div>
  );
});

export default PlaygroundToolbar;
