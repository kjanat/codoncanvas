/**
 * usePlayground - Main orchestration hook for the Playground component
 */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts";
import { CodonVM } from "@/core/vm";
import { downloadGenomeFile, readGenomeFile } from "@/genetics/genome-io";
import {
  useCanvas,
  useClipboard,
  useExamples,
  useGenome,
  useHistory,
  useKeyboardShortcuts,
  useLocalStorage,
  useShareUrl,
} from "@/hooks";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import {
  getNucleotideDisplayMode,
  type NucleotideDisplayMode,
  toggleNucleotideDisplayMode,
  transformForDisplay,
  transformFromDisplay,
} from "@/utils/nucleotide-display";
import type { PlaygroundStats, UsePlaygroundResult } from "./types";

const DRAFT_STORAGE_KEY = "codoncanvas-draft-genome";
const DEFAULT_GENOME = "ATG GAA AAT GGA TAA";

function getSearchParam(key: string): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function setSearchParam(key: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({}, "", url.toString());
}

function deleteSearchParam(key: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.pushState({}, "", url.toString());
}

export function usePlayground(): UsePlaygroundResult {
  const [exampleFromUrl] = useState(() => getSearchParam("example"));

  // --- External Hooks ---

  const { resolvedTheme } = useTheme();

  const [draftGenome, setDraftGenome] = useLocalStorage<string | null>(
    DRAFT_STORAGE_KEY,
    null,
  );

  const { allExamples, selectedExample, selectExample, getExample } =
    useExamples({
      initialSelection: exampleFromUrl ?? undefined,
    });

  const { sharedGenome, copyShareUrl } = useShareUrl();

  // Priority: URL shared genome > URL example > draft > default
  const initialGenome =
    sharedGenome ?? selectedExample?.genome ?? draftGenome ?? DEFAULT_GENOME;

  const { genome, setGenome, validation, isPending } = useGenome({
    initialGenome,
  });

  const {
    setState: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<string>(genome);

  const { canvasRef, renderer, isReady, clear, exportPNG } = useCanvas({
    width: 400,
    height: 400,
  });

  const { copy, copied } = useClipboard({ copiedDuration: 2000 });

  // --- Local State ---

  const [stats, setStats] = useState<PlaygroundStats>({
    codons: 0,
    instructions: 0,
  });
  const [showReference, setShowReference] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [nucleotideMode, setNucleotideMode] = useState<NucleotideDisplayMode>(
    getNucleotideDisplayMode,
  );

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Derived state
  const displayedGenome = transformForDisplay(genome);

  // --- Canonical genome update helper ---
  // Routes all genome mutations through a single path to keep genome/history/draft in sync

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

  // --- Handlers ---

  function handleToggleNucleotideMode(): void {
    setNucleotideMode(toggleNucleotideDisplayMode());
  }

  function handleGenomeChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const newGenome = transformFromDisplay(e.target.value);
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

  // Consolidated VM execution - single source of truth
  function executeGenome(): void {
    if (!isReady || !renderer) {
      return;
    }
    clear();
    const { isValid, tokens } = validation;
    if (!isValid || tokens.length === 0) {
      return;
    }
    try {
      const vm = new CodonVM(renderer);
      // Set default color based on theme
      renderer.setColor(0, 0, resolvedTheme === "dark" ? 100 : 0);
      const snapshots = vm.run(tokens);
      setStats({
        codons: tokens.length,
        instructions: snapshots.length,
      });
    } catch (err) {
      console.warn("Execution error:", err);
    }
  }

  function runGenome(): void {
    executeGenome();
  }

  function handleExampleChange(key: string): void {
    const example = getExample(key);
    if (example) {
      selectExample(key);
      applyGenome(example.genome);
      setSearchParam("example", key);
    }
  }

  function handleSave(): void {
    const title = selectedExample?.title ?? "untitled";
    downloadGenomeFile(genome, title.toLowerCase().replace(/\s+/g, "-"), {
      description: selectedExample?.description,
    });
  }

  async function handleLoad(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const genomeFile = await readGenomeFile(file);
      applyGenome(genomeFile.genome);
      selectExample(null);
      deleteSearchParam("example");
    } catch (err) {
      console.error("Failed to load genome:", err);
    } finally {
      // Reset input value to allow re-selecting the same file
      event.currentTarget.value = "";
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

  // Run genome when canvas ready or validation changes
  useEffect(() => {
    if (!isReady || !renderer) {
      return;
    }
    clear();
    const { isValid, tokens } = validation;
    if (!isValid || tokens.length === 0) {
      return;
    }
    try {
      const vm = new CodonVM(renderer);
      renderer.setColor(0, 0, resolvedTheme === "dark" ? 100 : 0);
      const snapshots = vm.run(tokens);
      setStats({
        codons: tokens.length,
        instructions: snapshots.length,
      });
    } catch (err) {
      console.warn("Execution error:", err);
    }
  }, [isReady, renderer, validation, clear, resolvedTheme]);

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
      stats,
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
