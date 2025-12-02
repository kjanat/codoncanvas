/**
 * Types for Playground component
 */

import type { ChangeEvent, RefObject } from "react";
import type { ExampleWithKey } from "@/hooks/useExamples";
import type { GenomeValidation } from "@/hooks/useGenome";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import type { NucleotideDisplayMode } from "@/utils/nucleotide-display";

export interface PlaygroundStats {
  codons: number;
  instructions: number;
}

export interface PlaygroundState {
  genome: string;
  displayedGenome: string;
  validation: GenomeValidation;
  isPending: boolean;
  stats: PlaygroundStats;
  nucleotideMode: NucleotideDisplayMode;
  showReference: boolean;
  showShortcutsHelp: boolean;
  canUndo: boolean;
  canRedo: boolean;
  copied: boolean;
  isReady: boolean;
  selectedExampleKey: string | null;
}

export interface PlaygroundActions {
  handleGenomeChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleShare: () => void;
  handleCopyCode: () => void;
  runGenome: () => void;
  handleExampleChange: (key: string) => void;
  handleSave: () => void;
  handleLoad: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleExportPNG: () => void;
  handleInsertCodon: (codon: string) => void;
  handleToggleNucleotideMode: () => void;
  setShowReference: (show: boolean) => void;
  setShowShortcutsHelp: (show: boolean) => void;
  clear: () => void;
}

export interface UsePlaygroundResult {
  state: PlaygroundState;
  actions: PlaygroundActions;
  refs: {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    editorRef: RefObject<HTMLTextAreaElement | null>;
  };
  examples: ExampleWithKey[];
  selectedExample: ExampleWithKey | null;
  shortcuts: KeyboardShortcut[];
}
