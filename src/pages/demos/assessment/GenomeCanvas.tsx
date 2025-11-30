import type { JSX, RefObject } from "react";
import { Card } from "@/components/Card";

interface GenomeCanvasProps {
  title: string;
  genome: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export function GenomeCanvas({
  title,
  genome,
  canvasRef,
}: GenomeCanvasProps): JSX.Element {
  return (
    <Card>
      <h3 className="mb-4 text-center font-semibold text-text">{title}</h3>
      <canvas
        className="mx-auto block rounded-lg border border-border"
        height={200}
        ref={canvasRef}
        width={200}
      />
      <pre className="mt-4 overflow-x-auto rounded bg-surface p-2 text-xs">
        {genome}
      </pre>
    </Card>
  );
}
