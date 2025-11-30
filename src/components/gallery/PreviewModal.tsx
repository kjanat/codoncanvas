import type { ReactNode } from "react";
import { useEffect } from "react";
import { CanvasPreview } from "@/components/CanvasPreview";
import { CloseIcon } from "@/ui/icons";
import type { ExampleWithName } from "./types";

interface PreviewModalProps {
  example: ExampleWithName;
  onClose: () => void;
  onOpenInPlayground: () => void;
}

export function PreviewModal({
  example,
  onClose,
  onOpenInPlayground,
}: PreviewModalProps): ReactNode {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={() => {
        // Escape key handled by document-level listener in useEffect
      }}
      role="dialog"
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-surface shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface p-4">
          <div>
            <h2 className="text-xl font-bold text-text">{example.title}</h2>
            <p className="text-sm text-text-muted">{example.description}</p>
          </div>
          <button
            aria-label="Close"
            className="rounded-lg p-2 text-text-muted hover:bg-bg-light hover:text-text"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl border border-border bg-dark-bg p-4">
              <CanvasPreview
                className="rounded-lg"
                genome={example.genome}
                height={350}
                width={350}
              />
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {example.difficulty}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex-1 overflow-auto rounded-lg border border-border bg-dark-bg p-4">
              <pre className="font-mono text-sm text-dark-text whitespace-pre-wrap break-all">
                {example.genome}
              </pre>
            </div>
            <button
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
              onClick={onOpenInPlayground}
              type="button"
            >
              Open in Playground
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
