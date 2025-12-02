/**
 * Types for DiffViewer component
 */

export interface DiffViewerProps {
  original: string;
  mutated: string;
  title?: string;
  showCanvas?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface CodonHighlight {
  pos: number;
  type: "added" | "removed";
}
