import type { ReactElement } from "react";
import { CanvasPreview } from "@/components/CanvasPreview";
import type { ExampleWithName } from "./types";

interface ExampleCardProps {
  example: ExampleWithName;
  onClick: () => void;
}

export function ExampleCard({
  example,
  onClick,
}: ExampleCardProps): ReactElement {
  return (
    <button
      className="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:shadow-md text-left w-full"
      onClick={onClick}
      type="button"
    >
      <div className="flex aspect-square items-center justify-center bg-surface-alt p-2">
        <CanvasPreview
          className="rounded-md"
          genome={example.genome}
          height={180}
          width={180}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text group-hover:text-primary">
          {example.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
          {example.description}
        </p>
        <div className="mt-2 flex gap-1">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {example.difficulty}
          </span>
        </div>
      </div>
    </button>
  );
}
