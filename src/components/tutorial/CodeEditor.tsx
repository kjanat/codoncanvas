import type { ValidationResult } from "./types";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  validation: ValidationResult | null;
  onRun: () => void;
}

export function CodeEditor({
  code,
  onChange,
  validation,
  onRun,
}: CodeEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <textarea
          className="h-48 w-full rounded-lg border border-border bg-dark-bg p-4 font-mono text-sm text-dark-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your genome code here..."
          spellCheck={false}
          value={code}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
          onClick={onRun}
          type="button"
        >
          Run & Validate
        </button>

        {validation && (
          <div
            className={`text-sm ${validation.passed ? "text-success" : "text-danger"}`}
          >
            {validation.passed
              ? "\u2713 Passed!"
              : `\u2717 ${validation.errors.length} issue(s)`}
          </div>
        )}
      </div>

      {validation && !validation.passed && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
          <ul className="space-y-1 text-sm text-danger">
            {validation.errors.map((error) => (
              <li key={error}>* {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
