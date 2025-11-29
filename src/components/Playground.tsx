/**
 * Playground - Main CodonCanvas editor and execution environment
 *
 * Orchestrates the editor, canvas, and toolbar components with shared state.
 * Handles genome execution, history, keyboard shortcuts, and URL sharing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CodonReference } from "@/components/CodonReference";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { PlaygroundCanvas } from "@/components/PlaygroundCanvas";
import { PlaygroundEditor } from "@/components/PlaygroundEditor";
import { PlaygroundToolbar } from "@/components/PlaygroundToolbar";
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
import {
  getNucleotideDisplayMode,
  type NucleotideDisplayMode,
  toggleNucleotideDisplayMode,
  transformForDisplay,
  transformFromDisplay,
} from "@/utils/nucleotide-display";

const DRAFT_STORAGE_KEY = "codoncanvas-draft-genome";
const DEFAULT_GENOME = "ATG GAA AAT GGA TAA";

export function Playground() {
  const [searchParams, setSearchParams] = useSearchParams();
  const exampleFromUrl = searchParams.get("example");

  // --- Hooks ---

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

  const [stats, setStats] = useState({ codons: 0, instructions: 0 });
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

  const handleToggleNucleotideMode = useCallback(() => {
    setNucleotideMode(toggleNucleotideDisplayMode());
  }, []);

  const handleGenomeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newGenome = transformFromDisplay(e.target.value);
      setGenome(newGenome);
      setHistoryState(newGenome);
      setDraftGenome(newGenome);
    },
    [setGenome, setHistoryState, setDraftGenome],
  );

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newState = undo();
      setGenome(newState);
    }
  }, [canUndo, undo, setGenome]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newState = redo();
      setGenome(newState);
    }
  }, [canRedo, redo, setGenome]);

  const handleShare = useCallback(() => {
    copyShareUrl(genome);
  }, [copyShareUrl, genome]);

  const handleCopyCode = useCallback(() => {
    copy(genome);
  }, [copy, genome]);

  const runGenome = useCallback(() => {
    if (!isReady || !renderer) return;
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
  }, [isReady, renderer, validation, clear]);

  const handleExampleChange = useCallback(
    (key: string) => {
      const example = getExample(key);
      if (example) {
        selectExample(key);
        setGenome(example.genome);
        setSearchParams({ example: key });
      }
    },
    [getExample, selectExample, setGenome, setSearchParams],
  );

  const handleSave = useCallback(() => {
    const title = selectedExample?.title ?? "untitled";
    downloadGenomeFile(genome, title.toLowerCase().replace(/\s+/g, "-"), {
      description: selectedExample?.description,
    });
  }, [genome, selectedExample]);

  const handleLoad = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const genomeFile = await readGenomeFile(file);
        setGenome(genomeFile.genome);
        selectExample(null);
        setSearchParams({});
      } catch (err) {
        console.error("Failed to load genome:", err);
      }
    },
    [setGenome, selectExample, setSearchParams],
  );

  const handleExportPNG = useCallback(() => {
    exportPNG("codoncanvas-output.png");
  }, [exportPNG]);

  const handleInsertCodon = useCallback(
    (codon: string) => {
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
    },
    [genome, setGenome],
  );

  // --- Effects ---

  useEffect(() => {
    runGenome();
  }, [runGenome]);

  useEffect(() => {
    if (exampleFromUrl) {
      const example = getExample(exampleFromUrl);
      if (example) {
        selectExample(exampleFromUrl);
        setGenome(example.genome);
      }
    }
  }, [exampleFromUrl, getExample, selectExample, setGenome]);

  // Keyboard shortcuts
  const shortcuts = [
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

  // --- Render ---

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Editor Panel */}
      <div className="flex flex-1 flex-col">
        <PlaygroundToolbar
          canRedo={canRedo}
          canRun={validation.isValid}
          canUndo={canUndo}
          copied={copied}
          examples={allExamples}
          nucleotideMode={nucleotideMode}
          onCopy={handleCopyCode}
          onExampleChange={handleExampleChange}
          onLoad={handleLoad}
          onRedo={handleRedo}
          onRun={runGenome}
          onSave={handleSave}
          onShare={handleShare}
          onShowModeInfo={setShowModeInfo}
          onToggleNucleotideMode={handleToggleNucleotideMode}
          onToggleReference={() => setShowReference(!showReference)}
          onUndo={handleUndo}
          selectedExampleKey={selectedExample?.key ?? null}
          showModeInfo={showModeInfo}
          showReference={showReference}
        />
        <PlaygroundEditor
          displayedGenome={displayedGenome}
          isPending={isPending}
          nucleotideMode={nucleotideMode}
          onGenomeChange={handleGenomeChange}
          ref={editorRef}
          stats={stats}
          validation={validation}
        />
      </div>

      {/* Canvas Panel */}
      <PlaygroundCanvas
        height={400}
        onClear={clear}
        onExportPNG={handleExportPNG}
        ref={canvasRef}
        selectedExample={selectedExample}
        width={400}
      />

      {/* Reference Panel */}
      {showReference && (
        <CodonReference
          onInsert={handleInsertCodon}
          onToggleCollapse={() => setShowReference(false)}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
}

export default Playground;
