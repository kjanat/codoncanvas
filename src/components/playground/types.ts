/**
 * Types for Playground component
 */

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
  showModeInfo: boolean;
  canUndo: boolean;
  canRedo: boolean;
  copied: boolean;
  isReady: boolean;
  selectedExampleKey: string | null;
}

export interface PlaygroundActions {
  handleGenomeChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleShare: () => void;
  handleCopyCode: () => void;
  runGenome: () => void;
  handleExampleChange: (key: string) => void;
  handleSave: () => void;
  handleLoad: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleExportPNG: () => void;
  handleInsertCodon: (codon: string) => void;
  handleToggleNucleotideMode: () => void;
  setShowReference: (show: boolean) => void;
  setShowShortcutsHelp: (show: boolean) => void;
  setShowModeInfo: (show: boolean) => void;
  clear: () => void;
}

export interface UsePlaygroundResult {
  state: PlaygroundState;
  actions: PlaygroundActions;
  refs: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    editorRef: React.RefObject<HTMLTextAreaElement | null>;
  };
  examples: ExampleWithKey[];
  selectedExample: ExampleWithKey | null;
  shortcuts: KeyboardShortcut[];
}
