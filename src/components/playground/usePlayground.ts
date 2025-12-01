/**
 * usePlayground - Main orchestration hook for the Playground component
 *
 * Composes focused sub-hooks for URL handling, execution, file I/O,
 * display mode management, panels, and keyboard shortcuts.
 */

import { useRef } from "react";
import { useTheme } from "@/contexts";
import {
  useCanvas,
  useClipboard,
  useExamples,
  useGenome,
  useGenomeExecution,
  useGenomeFileIO,
  useHistory,
  useLocalStorage,
  useNucleotideDisplay,
  usePlaygroundSearch,
} from "@/hooks";
import type { PlaygroundStats, UsePlaygroundResult } from "./types";
import { usePlaygroundPanels } from "./usePlaygroundPanels";
import { usePlaygroundShortcuts } from "./usePlaygroundShortcuts";

const DRAFT_STORAGE_KEY = "codoncanvas-draft-genome";
const DEFAULT_GENOME = "ATG GAA AAT GGA TAA";
const DEFAULT_EXPORT_FILENAME = "codoncanvas-output.png";

export function usePlayground(): UsePlaygroundResult {
  // --- URL & Router Integration ---
  const {
    exampleFromUrl,
    sharedGenome,
    setExampleParam,
    clearExampleParam,
    copyShareUrl,
  } = usePlaygroundSearch();

  // --- Theme ---
  const { resolvedTheme } = useTheme();

  // --- Draft Persistence ---
  const [draftGenome, setDraftGenome] = useLocalStorage<string | null>(
    DRAFT_STORAGE_KEY,
    null,
  );

  // --- Examples ---
  const { allExamples, selectedExample, selectExample, getExample } =
    useExamples({
      initialSelection: exampleFromUrl ?? undefined,
    });

  // Priority: URL shared genome > URL example > draft > default
  const initialGenome =
    sharedGenome ?? selectedExample?.genome ?? draftGenome ?? DEFAULT_GENOME;

  // --- Genome State ---
  const { genome, setGenome, validation, isPending } = useGenome({
    initialGenome,
  });

  // --- History (Undo/Redo) ---
  const {
    setState: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<string>(genome);

  // --- Canvas ---
  const { canvasRef, renderer, isReady, clear, exportPNG } = useCanvas({
    width: 400,
    height: 400,
  });

  // --- Clipboard ---
  const { copy, copied } = useClipboard({ copiedDuration: 2000 });

  // --- Nucleotide Display Mode ---
  const {
    mode: nucleotideMode,
    toggle: handleToggleNucleotideMode,
    toDisplay,
    fromDisplay,
  } = useNucleotideDisplay();

  // --- VM Execution ---
  const { stats, execute: executeGenome } = useGenomeExecution({
    renderer,
    isReady,
    validation,
    clear,
    theme: resolvedTheme === "dark" ? "dark" : "light",
  });

  // --- UI State ---
  const {
    showReference,
    showShortcutsHelp,
    toggleReference,
    toggleShortcutsHelp,
    closeAllPanels,
    setShowReference,
    setShowShortcutsHelp,
  } = usePlaygroundPanels();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Derived state
  const displayedGenome = toDisplay(genome);

  // --- Canonical genome update helper ---
  function applyGenome(
    next: string,
    options: { recordHistory?: boolean } = {},
  ): void {
    const { recordHistory = true } = options;
    setGenome(next);
    setDraftGenome(next);
    if (recordHistory) {
      setHistoryState(next);
    }
  }

  // --- File I/O ---
  const { handleSave, handleLoad: loadFile } = useGenomeFileIO({
    genome,
    onLoad: (loadedGenome) => {
      applyGenome(loadedGenome);
      selectExample(null);
      clearExampleParam();
    },
    title: selectedExample?.title,
    description: selectedExample?.description,
  });

  // Wrap handleLoad to match expected signature
  async function handleLoad(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    await loadFile(event);
  }

  // --- Handlers ---

  function handleGenomeChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const newGenome = fromDisplay(e.target.value);
    applyGenome(newGenome);
  }

  function handleUndo(): void {
    if (canUndo) {
      const newState = undo();
      applyGenome(newState, { recordHistory: false });
    }
  }

  function handleRedo(): void {
    if (canRedo) {
      const newState = redo();
      applyGenome(newState, { recordHistory: false });
    }
  }

  function handleShare(): void {
    copyShareUrl(genome);
  }

  function handleCopyCode(): void {
    copy(genome);
  }

  function runGenome(): void {
    executeGenome();
  }

  function handleExampleChange(key: string): void {
    const example = getExample(key);
    if (example) {
      selectExample(key);
      applyGenome(example.genome);
      setExampleParam(key);
    }
  }

  function handleExportPNG(): void {
    const filename = selectedExample?.key
      ? `codoncanvas-${selectedExample.key}.png`
      : DEFAULT_EXPORT_FILENAME;
    exportPNG(filename);
  }

  function handleInsertCodon(codon: string): void {
    const editor = editorRef.current;
    if (!editor) {
      applyGenome(genome ? `${genome} ${codon}` : codon);
      return;
    }
    // Operate in display space since selection indices come from the textarea
    // which shows displayedGenome, then normalize back via fromDisplay
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const needsSpace =
      before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
    const insert = (needsSpace ? " " : "") + codon;
    const nextDisplayed = before + insert + after;
    const nextGenome = fromDisplay(nextDisplayed);
    applyGenome(nextGenome);
    requestAnimationFrame(() => {
      const current = editorRef.current;
      if (!current) {
        return;
      }
      const nextPos = start + insert.length;
      current.setSelectionRange(nextPos, nextPos);
      current.focus();
    });
  }

  // --- Keyboard Shortcuts ---

  const shortcuts = usePlaygroundShortcuts({
    handleSave,
    runGenome,
    handleUndo,
    handleRedo,
    handleExportPNG,
    handleShare,
    handleToggleNucleotideMode,
    toggleReference,
    toggleShortcutsHelp,
    closeAllPanels,
  });

  // --- Return ---

  return {
    state: {
      genome,
      displayedGenome,
      validation,
      isPending,
      stats: stats as PlaygroundStats,
      nucleotideMode,
      showReference,
      showShortcutsHelp,
      canUndo,
      canRedo,
      copied,
      isReady,
      selectedExampleKey: selectedExample?.key ?? null,
    },
    actions: {
      handleGenomeChange,
      handleUndo,
      handleRedo,
      handleShare,
      handleCopyCode,
      runGenome,
      handleExampleChange,
      handleSave,
      handleLoad,
      handleExportPNG,
      handleInsertCodon,
      handleToggleNucleotideMode,
      setShowReference,
      setShowShortcutsHelp,
      clear,
    },
    refs: {
      canvasRef,
      editorRef,
    },
    examples: allExamples,
    selectedExample,
    shortcuts,
  };
}
