/**
 * usePlayground - Main orchestration hook for the Playground component
 */

import { useEffect, useRef, useState } from "react";

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
  const [showModeInfo, setShowModeInfo] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Derived state
  const displayedGenome = transformForDisplay(genome);

  // --- Handlers ---

  function handleToggleNucleotideMode(): void {
    setNucleotideMode(toggleNucleotideDisplayMode());
  }

  function handleGenomeChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const newGenome = transformFromDisplay(e.target.value);
    setGenome(newGenome);
    setHistoryState(newGenome);
    setDraftGenome(newGenome);
  }

  function handleUndo(): void {
    if (canUndo) {
      const newState = undo();
      setGenome(newState);
    }
  }

  function handleRedo(): void {
    if (canRedo) {
      const newState = redo();
      setGenome(newState);
    }
  }

  function handleShare(): void {
    copyShareUrl(genome);
  }

  function handleCopyCode(): void {
    copy(genome);
  }

  function runGenome(): void {
    if (!isReady || !renderer) {
      return;
    }
    clear();
    if (validation.isValid && validation.tokens.length > 0) {
      try {
        const vm = new CodonVM(renderer);
        const snapshots = vm.run(validation.tokens);
        setStats({
          codons: validation.tokens.length,
          instructions: snapshots.length,
        });
      } catch (err) {
        console.warn("Execution error:", err);
      }
    }
  }

  function handleExampleChange(key: string): void {
    const example = getExample(key);
    if (example) {
      selectExample(key);
      setGenome(example.genome);
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
      setGenome(genomeFile.genome);
      selectExample(null);
      deleteSearchParam("example");
    } catch (err) {
      console.error("Failed to load genome:", err);
    }
  }

  function handleExportPNG(): void {
    exportPNG("codoncanvas-output.png");
  }

  function handleInsertCodon(codon: string): void {
    const editor = editorRef.current;
    if (!editor) {
      setGenome(`${genome} ${codon}`);
      return;
    }
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const before = genome.slice(0, start);
    const after = genome.slice(end);
    const needsSpace =
      before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
    const insert = (needsSpace ? " " : "") + codon;
    setGenome(before + insert + after);
    requestAnimationFrame(() => {
      editor.setSelectionRange(start + insert.length, start + insert.length);
      editor.focus();
    });
  }

  // --- Effects ---

  // Stable reference to validation for effect dependency
  const tokensLength = validation.tokens.length;
  const tokensRef = useRef(validation.tokens);
  tokensRef.current = validation.tokens;

  // Run genome when canvas ready or validation changes
  useEffect(() => {
    if (!isReady || !renderer) {
      return;
    }
    clear();
    if (validation.isValid && tokensLength > 0) {
      try {
        const vm = new CodonVM(renderer);
        const snapshots = vm.run(tokensRef.current);
        setStats({
          codons: tokensLength,
          instructions: snapshots.length,
        });
      } catch (err) {
        console.warn("Execution error:", err);
      }
    }
  }, [isReady, renderer, validation.isValid, tokensLength, clear]);

  // Load example from URL param
  useEffect(() => {
    if (exampleFromUrl) {
      const example = getExample(exampleFromUrl);
      if (example) {
        selectExample(exampleFromUrl);
        setGenome(example.genome);
      }
    }
  }, [exampleFromUrl, getExample, selectExample, setGenome]);

  // --- Keyboard Shortcuts ---

  const shortcuts: KeyboardShortcut[] = [
    { key: "s", ctrl: true, handler: handleSave, description: "Save genome" },
    {
      key: "Enter",
      ctrl: true,
      handler: runGenome,
      description: "Run genome",
    },
    { key: "z", ctrl: true, handler: handleUndo, description: "Undo" },
    {
      key: "z",
      ctrl: true,
      shift: true,
      handler: handleRedo,
      description: "Redo",
    },
    { key: "y", ctrl: true, handler: handleRedo, description: "Redo" },
    {
      key: "e",
      ctrl: true,
      handler: handleExportPNG,
      description: "Export PNG",
    },
    {
      key: "l",
      ctrl: true,
      handler: handleShare,
      description: "Copy share link",
    },
    {
      key: "r",
      ctrl: true,
      shift: true,
      handler: () => setShowReference((s) => !s),
      description: "Toggle reference",
    },
    {
      key: "m",
      ctrl: true,
      handler: handleToggleNucleotideMode,
      description: "Toggle display mode",
    },
    {
      key: "Escape",
      handler: () => {
        setShowReference(false);
        setShowShortcutsHelp(false);
        setShowModeInfo(false);
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
      showModeInfo,
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
      setShowModeInfo,
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
