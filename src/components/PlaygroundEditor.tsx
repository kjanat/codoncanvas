/**
 * PlaygroundEditor - Editor panel for the Playground
 *
 * Contains the genome textarea, validation status, and error/warning displays.
 */

import { type ChangeEvent, forwardRef, memo, type ReactElement } from "react";
import type { GenomeValidation } from "@/hooks/useGenome";
import { CheckIcon, ErrorIcon } from "@/ui/icons";
import type { NucleotideDisplayMode } from "@/utils/nucleotide-display";

interface ValidationStatusProps {
  isPending: boolean;
  validation: GenomeValidation;
  stats: { codons: number; instructions: number };
}

function ValidationStatus({
  isPending,
  validation,
  stats,
}: ValidationStatusProps): ReactElement {
  return (
    <div className="mt-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {isPending ? (
          <span className="text-text-muted">Validating...</span>
        ) : validation.isValid ? (
          <span className="flex items-center gap-1 text-success">
            <CheckIcon />
            Valid
          </span>
        ) : (
          <span className="flex items-center gap-1 text-danger">
            <ErrorIcon />
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

function ErrorDisplay({
  validation,
}: {
  validation: GenomeValidation;
}): ReactElement | null {
  if (validation.errors.length === 0 && !validation.tokenizeError) return null;

  return (
    <div
      className="border-t border-danger/20 bg-danger/5 px-4 py-3"
      role="alert"
    >
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

function WarningDisplay({
  validation,
}: {
  validation: GenomeValidation;
}): ReactElement | null {
  if (validation.warnings.length === 0) return null;

  return (
    <output className="block border-t border-warning/20 bg-warning/5 px-4 py-2">
      <ul className="space-y-1 text-sm text-warning">
        {validation.warnings.map((warn) => (
          <li key={`${warn.position ?? "no-pos"}-${warn.message}`}>
            {warn.position !== undefined && `Position ${warn.position}: `}
            {warn.message}
          </li>
        ))}
      </ul>
    </output>
  );
}

export interface PlaygroundEditorProps {
  /** Displayed genome text (may be transformed for display) */
  displayedGenome: string;
  /** Callback when genome text changes */
  onGenomeChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Current validation state */
  validation: GenomeValidation;
  /** Whether validation is pending */
  isPending: boolean;
  /** Execution stats */
  stats: { codons: number; instructions: number };
  /** Current nucleotide display mode (for placeholder) */
  nucleotideMode: NucleotideDisplayMode;
}

export const PlaygroundEditor = memo(
  forwardRef<HTMLTextAreaElement, PlaygroundEditorProps>(
    function PlaygroundEditor(
      {
        displayedGenome,
        onGenomeChange,
        validation,
        isPending,
        stats,
        nucleotideMode,
      },
      ref,
    ) {
      return (
        <div className="flex flex-1 flex-col border-r border-border bg-surface">
          {/* Editor textarea */}
          <div className="flex flex-1 flex-col p-4">
            <textarea
              aria-label="Genome editor"
              className="flex-1 resize-none rounded-lg border border-border bg-dark-bg p-4 font-mono text-sm leading-relaxed text-dark-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              onChange={onGenomeChange}
              placeholder={`Enter your genome here...\n\nExample:\n${nucleotideMode === "RNA" ? "AUG GAA AAU GGA UAA" : "ATG GAA AAT GGA TAA"}`}
              ref={ref}
              spellCheck={false}
              value={displayedGenome}
            />
            <ValidationStatus
              isPending={isPending}
              stats={stats}
              validation={validation}
            />
          </div>

          {/* Error and warning displays */}
          <ErrorDisplay validation={validation} />
          <WarningDisplay validation={validation} />
        </div>
      );
    },
  ),
);

export default PlaygroundEditor;
