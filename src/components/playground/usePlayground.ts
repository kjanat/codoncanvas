/**
 * usePlayground - Main orchestration hook for the Playground component
 *
 * Composes focused sub-hooks for URL handling, execution, file I/O,
 * and display mode management.
 */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts";
import {
  useCanvas,
  useClipboard,
  useExamples,
  useGenome,
  useGenomeExecution,
  useGenomeFileIO,
  useHistory,
  useKeyboardShortcuts,
  useLocalStorage,
  useNucleotideDisplay,
  usePlaygroundSearch,
} from "@/hooks";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import type { PlaygroundStats, UsePlaygroundResult } from "./types";

const DRAFT_STORAGE_KEY = "codoncanvas-draft-genome";
const DEFAULT_GENOME = "ATG GAA AAT GGA TAA";

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
  const [showReference, setShowReference] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
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
    exportPNG("codoncanvas-output.png");
  }

  function handleInsertCodon(codon: string): void {
    const editor = editorRef.current;
    if (!editor) {
      applyGenome(genome ? `${genome} ${codon}` : codon);
      return;
    }
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const before = genome.slice(0, start);
    const after = genome.slice(end);
    const needsSpace =
      before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
    const insert = (needsSpace ? " " : "") + codon;
    const nextGenome = before + insert + after;
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

  // --- Effects ---

  // Load example from URL param (only if no shared genome takes priority)
  useEffect(() => {
    if (exampleFromUrl && !sharedGenome) {
      const example = getExample(exampleFromUrl);
      if (example) {
        selectExample(exampleFromUrl);
        setGenome(example.genome);
      }
    }
  }, [exampleFromUrl, sharedGenome, getExample, selectExample, setGenome]);

  // --- Keyboard Shortcuts ---

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "s",
      ctrl: true,
      handler: handleSave,
      description: "Save genome",
      preventDefault: true,
    },
    {
      key: "Enter",
      ctrl: true,
      handler: runGenome,
      description: "Run genome",
      preventDefault: true,
    },
    {
      key: "z",
      ctrl: true,
      handler: handleUndo,
      description: "Undo",
      preventDefault: true,
    },
    {
      key: "z",
      ctrl: true,
      shift: true,
      handler: handleRedo,
      description: "Redo",
      preventDefault: true,
    },
    {
      key: "y",
      ctrl: true,
      handler: handleRedo,
      description: "Redo",
      preventDefault: true,
    },
    {
      key: "e",
      ctrl: true,
      handler: handleExportPNG,
      description: "Export PNG",
      preventDefault: true,
    },
    {
      key: "l",
      ctrl: true,
      handler: handleShare,
      description: "Copy share link",
      preventDefault: true,
    },
    {
      key: "r",
      ctrl: true,
      shift: true,
      handler: () => setShowReference((s) => !s),
      description: "Toggle reference",
      preventDefault: true,
    },
    {
      key: "m",
      ctrl: true,
      handler: handleToggleNucleotideMode,
      description: "Toggle display mode",
      preventDefault: true,
    },
    {
      key: "Escape",
      handler: () => {
        setShowReference(false);
        setShowShortcutsHelp(false);
      },
      description: "Close panels",
    },
    {
      key: "?",
      handler: () => setShowShortcutsHelp((s) => !s),
      description: "Show shortcuts",
      preventDefault: true,
    },
  ];

  useKeyboardShortcuts(shortcuts);

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
