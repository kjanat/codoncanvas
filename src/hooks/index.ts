/**
 * React Hooks for CodonCanvas
 *
 * Provides hooks for genome management, VM execution, canvas rendering,
 * example browsing, user preferences, history, clipboard, and keyboard shortcuts.
 */

export {
  type CanvasDimensions,
  type UseCanvasOptions,
  type UseCanvasReturn,
  useCanvas,
} from "./useCanvas";
export {
  type UseClipboardOptions,
  type UseClipboardReturn,
  useClipboard,
} from "./useClipboard";
export {
  type ExampleFilters,
  type ExampleWithKey,
  type UseExamplesOptions,
  type UseExamplesReturn,
  useExamples,
} from "./useExamples";
export {
  type GenomeValidation,
  type UseGenomeOptions,
  type UseGenomeReturn,
  useGenome,
} from "./useGenome";
export {
  type UseHistoryOptions,
  type UseHistoryReturn,
  useHistory,
} from "./useHistory";
export {
  formatShortcut,
  type KeyboardShortcut,
  type UseKeyboardShortcutsOptions,
  useKeyboardShortcuts,
} from "./useKeyboardShortcuts";
export { useLineChart } from "./useLineChart";
export { useLocalStorage } from "./useLocalStorage";
export {
  type UsePreferencesReturn,
  type UserPreferences,
  usePreferences,
} from "./usePreferences";
export {
  type RenderResult,
  type UseRenderGenomeReturn,
  useRenderGenome,
} from "./useRenderGenome";
export {
  type UseShareUrlOptions,
  type UseShareUrlReturn,
  useShareUrl,
} from "./useShareUrl";
export {
  type SimulationState,
  type UseSimulationOptions,
  type UseSimulationReturn,
  useSimulation,
} from "./useSimulation";
export {
  type ExecutionResult,
  type PlaybackState,
  type UseVMOptions,
  type UseVMReturn,
  useVM,
} from "./useVM";
