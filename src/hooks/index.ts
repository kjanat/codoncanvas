/**
 * React Hooks for CodonCanvas
 *
 * Provides hooks for genome management, VM execution, canvas rendering,
 * example browsing, user preferences, and history management.
 */

export {
  type CanvasDimensions,
  type UseCanvasOptions,
  type UseCanvasReturn,
  useCanvas,
} from "./useCanvas";
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
export { useLocalStorage } from "./useLocalStorage";
export {
  type UsePreferencesReturn,
  type UserPreferences,
  usePreferences,
} from "./usePreferences";
export {
  type ExecutionResult,
  type PlaybackState,
  type UseVMOptions,
  type UseVMReturn,
  useVM,
} from "./useVM";
