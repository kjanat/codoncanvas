/**
 * Playground - Main CodonCanvas editor and execution environment
 *
 * Full-featured genome editor with live preview, example browser,
 * validation feedback, and export capabilities.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CodonReference } from "@/components/CodonReference";
import { CodonVM } from "@/core/vm";
import { downloadGenomeFile, readGenomeFile } from "@/genetics/genome-io";
import { useCanvas, useExamples, useGenome } from "@/hooks";
import type { ExampleWithKey } from "@/hooks/useExamples";
import type { GenomeValidation } from "@/hooks/useGenome";
import {
  getModeButtonLabel,
  getModeButtonTooltip,
  getNucleotideDisplayMode,
  getNucleotideModeInfo,
  type NucleotideDisplayMode,
  toggleNucleotideDisplayMode,
  transformForDisplay,
  transformFromDisplay,
} from "@/playground/nucleotide-display";

// --- Sub-Components ---

function NucleotideModeToggle({
  mode,
  showInfo,
  onToggle,
  onShowInfo,
}: {
  mode: NucleotideDisplayMode;
  showInfo: boolean;
  onToggle: () => void;
  onShowInfo: (show: boolean) => void;
}) {
  const info = getNucleotideModeInfo();

  return (
    <div className="relative">
      <button
        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
          mode === "RNA"
            ? "bg-accent/10 text-accent"
            : "text-text hover:bg-bg-light"
        }`}
        onClick={onToggle}
        onMouseEnter={() => onShowInfo(true)}
        onMouseLeave={() => onShowInfo(false)}
        title={getModeButtonTooltip(mode)}
        type="button"
      >
        {getModeButtonLabel(mode)}
      </button>

      {showInfo && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-white p-3 shadow-lg">
          <div className="mb-2 font-medium text-text">
            {info.nucleicAcid} Mode
          </div>
          <p className="text-xs text-text-muted">{info.description}</p>
          <p className="mt-2 text-xs text-text-muted">
            {info.biologicalContext}
          </p>
        </div>
      )}
    </div>
  );
}

function ValidationStatus({
  isPending,
  validation,
  stats,
}: {
  isPending: boolean;
  validation: GenomeValidation;
  stats: { codons: number; instructions: number };
}) {
  return (
    <div className="mt-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {isPending ? (
          <span className="text-text-muted">Validating...</span>
        ) : validation.isValid ? (
          <span className="flex items-center gap-1 text-success">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clipRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                fillRule="evenodd"
              />
            </svg>
            Valid
          </span>
        ) : (
          <span className="flex items-center gap-1 text-danger">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clipRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                fillRule="evenodd"
              />
            </svg>
            {validation.errors.length} error(s)
          </span>
        )}
      </div>
      <span className="text-text-muted">
        {stats.codons} codons, {stats.instructions} instructions
      </span>
    </div>
  );
}

function ErrorDisplay({ validation }: { validation: GenomeValidation }) {
  if (validation.errors.length === 0 && !validation.tokenizeError) return null;

  return (
    <div className="border-t border-danger/20 bg-danger/5 px-4 py-3">
      <ul className="space-y-1 text-sm text-danger">
        {validation.tokenizeError && <li>{validation.tokenizeError}</li>}
        {validation.errors.map((err) => (
          <li key={`${err.position ?? "no-pos"}-${err.message}`}>
            {err.position !== undefined && `Position ${err.position}: `}
            {err.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WarningDisplay({ validation }: { validation: GenomeValidation }) {
  if (validation.warnings.length === 0) return null;

  return (
    <div className="border-t border-warning/20 bg-warning/5 px-4 py-2">
      <ul className="space-y-1 text-sm text-warning">
        {validation.warnings.map((warn) => (
          <li key={`${warn.position ?? "no-pos"}-${warn.message}`}>
            {warn.position !== undefined && `Position ${warn.position}: `}
            {warn.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExampleInfo({ example }: { example: ExampleWithKey }) {
  return (
    <div className="border-t border-dark-border px-4 py-3">
      <h3 className="font-medium text-dark-text">{example.title}</h3>
      <p className="mt-1 text-sm text-dark-text/70">{example.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
          {example.difficulty}
        </span>
        {example.concepts.map((concept) => (
          <span
            className="rounded-full bg-dark-surface px-2 py-0.5 text-xs text-dark-text"
            key={concept}
          >
            {concept}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Main Component ---

export function Playground() {
  const [searchParams, setSearchParams] = useSearchParams();
  const exampleFromUrl = searchParams.get("example");

  // Hooks
  const { allExamples, selectedExample, selectExample, getExample } =
    useExamples({
      initialSelection: exampleFromUrl ?? undefined,
    });

  const { genome, setGenome, validation, isPending } = useGenome({
    initialGenome: selectedExample?.genome ?? "ATG GAA AAT GGA TAA",
  });

  const { canvasRef, renderer, isReady, clear, toDataURL } = useCanvas({
    width: 400,
    height: 400,
  });

  // Stats
  const [stats, setStats] = useState({ codons: 0, instructions: 0 });

  // UI state
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
      setGenome(transformFromDisplay(e.target.value));
    },
    [setGenome],
  );

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

  // --- Render ---

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Editor Panel */}
      <div className="flex flex-1 flex-col border-r border-border bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
          <select
            className="rounded-md border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            onChange={(e) => handleExampleChange(e.target.value)}
            value={selectedExample?.key ?? ""}
          >
            <option value="">Select example...</option>
            {allExamples.map((ex) => (
              <option key={ex.key} value={ex.key}>
                {ex.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <label className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-text hover:bg-bg-light">
              Load
              <input
                accept=".genome,.txt"
                className="hidden"
                onChange={handleLoad}
                type="file"
              />
            </label>
            <button
              className="rounded-md px-3 py-1.5 text-sm text-text hover:bg-bg-light"
              onClick={handleSave}
              type="button"
            >
              Save
            </button>
          </div>

          <NucleotideModeToggle
            mode={nucleotideMode}
            onShowInfo={setShowModeInfo}
            onToggle={handleToggleNucleotideMode}
            showInfo={showModeInfo}
          />

          <button
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              showReference
                ? "bg-primary/10 text-primary"
                : "text-text hover:bg-bg-light"
            }`}
            onClick={() => setShowReference(!showReference)}
            title="Toggle codon reference"
            type="button"
          >
            Reference
          </button>

          <button
            className="ml-auto rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            disabled={!validation.isValid}
            onClick={runGenome}
            type="button"
          >
            Run
          </button>
        </div>

        {/* Editor */}
        <div className="flex flex-1 flex-col p-4">
          <textarea
            className="flex-1 resize-none rounded-lg border border-border bg-dark-bg p-4 font-mono text-sm leading-relaxed text-dark-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            onChange={handleGenomeChange}
            placeholder={`Enter your genome here...\n\nExample:\n${nucleotideMode === "RNA" ? "AUG GAA AAU GGA UAA" : "ATG GAA AAT GGA TAA"}`}
            ref={editorRef}
            spellCheck={false}
            value={displayedGenome}
          />
          <ValidationStatus
            isPending={isPending}
            stats={stats}
            validation={validation}
          />
        </div>

        <ErrorDisplay validation={validation} />
        <WarningDisplay validation={validation} />
      </div>

      {/* Canvas Panel */}
      <div className="flex flex-1 flex-col bg-dark-bg">
        <div className="flex items-center justify-between border-b border-dark-border px-4 py-2">
          <span className="text-sm text-dark-text">Output</span>
          <div className="flex gap-2">
            <button
              className="rounded-md px-3 py-1 text-sm text-dark-text hover:bg-dark-surface"
              onClick={clear}
              type="button"
            >
              Clear
            </button>
            <button
              className="rounded-md px-3 py-1 text-sm text-dark-text hover:bg-dark-surface"
              onClick={handleExportPNG}
              type="button"
            >
              Export PNG
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <canvas
            className="rounded-lg border border-dark-border bg-white shadow-lg"
            height={400}
            ref={canvasRef}
            width={400}
          />
        </div>

        {selectedExample && <ExampleInfo example={selectedExample} />}
      </div>

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
