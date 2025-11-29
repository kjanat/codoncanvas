/**
 * Playground - Main CodonCanvas editor and execution environment
 *
 * Orchestrates the editor, canvas, and toolbar components with shared state.
 * Handles genome execution, history, keyboard shortcuts, and URL sharing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CodonReference } from "@/components/CodonReference";
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
  useShareUrl,
} from "@/hooks";
import {
  getNucleotideDisplayMode,
  type NucleotideDisplayMode,
  toggleNucleotideDisplayMode,
  transformForDisplay,
  transformFromDisplay,
} from "@/playground/nucleotide-display";

export function Playground() {
  const [searchParams, setSearchParams] = useSearchParams();
  const exampleFromUrl = searchParams.get("example");

  // --- Hooks ---

  const { allExamples, selectedExample, selectExample, getExample } =
    useExamples({
      initialSelection: exampleFromUrl ?? undefined,
    });

  const { sharedGenome, copyShareUrl } = useShareUrl();

  const { genome, setGenome, validation, isPending } = useGenome({
    initialGenome:
      sharedGenome ?? selectedExample?.genome ?? "ATG GAA AAT GGA TAA",
  });

  const {
    state: historyState,
    setState: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<string>(genome);

  const { canvasRef, renderer, isReady, clear, toDataURL } = useCanvas({
    width: 400,
    height: 400,
  });

  const { copy, copied } = useClipboard({ copiedDuration: 2000 });

  // --- Local State ---

  const [stats, setStats] = useState({ codons: 0, instructions: 0 });
  const [showReference, setShowReference] = useState(false);
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
    },
    [setGenome, setHistoryState],
  );

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      setGenome(historyState);
    }
  }, [canUndo, undo, historyState, setGenome]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
      setGenome(historyState);
    }
  }, [canRedo, redo, historyState, setGenome]);

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
    const dataUrl = toDataURL("image/png");
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "codoncanvas-output.png";
    link.href = dataUrl;
    link.click();
  }, [toDataURL]);

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
  useKeyboardShortcuts([
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
  ]);

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
    </div>
  );
}

export default Playground;
