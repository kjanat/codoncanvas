/**
 * useGenome - React hook for genome state management
 *
 * Provides genome editing, validation, and tokenization with debounced
 * error checking. Central hook for genome manipulation across the app.
 */

import { useEffect, useRef, useState } from "react";
import { CodonLexer } from "@/core/lexer";
import {
  createEmptyValidation,
  type GenomeValidation,
  validateGenome,
} from "@/utils/genome-validation";

// Re-export for consumers
export type { GenomeValidation } from "@/utils/genome-validation";

/** Options for useGenome hook */
export interface UseGenomeOptions {
  /** Initial genome string */
  initialGenome?: string;
  /** Debounce delay for validation (ms) */
  debounceMs?: number;
  /** Auto-validate on genome change */
  autoValidate?: boolean;
}

/** Return type of useGenome hook */
export interface UseGenomeReturn {
  /** Current genome string */
  genome: string;
  /** Set genome string */
  setGenome: (genome: string) => void;
  /** Current validation state */
  validation: GenomeValidation;
  /** Manually trigger validation */
  validate: () => GenomeValidation;
  /** Clear genome to empty string */
  clear: () => void;
  /** Reset to initial genome */
  reset: () => void;
  /** Whether validation is pending (debounced) */
  isPending: boolean;
  /** Lexer instance for advanced use */
  lexer: CodonLexer;
}

const DEFAULT_GENOME = "ATG GAA AAT GGA TAA";
const DEFAULT_DEBOUNCE_MS = 150;

/**
 * React hook for genome state management with validation.
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const { genome, setGenome, validation } = useGenome({
 *     initialGenome: "ATG GGA TAA",
 *   });
 *
 *   return (
 *     <div>
 *       <textarea value={genome} onChange={(e) => setGenome(e.target.value)} />
 *       {!validation.isValid && (
 *         <ul>
 *           {validation.errors.map((e) => <li key={e.message}>{e.message}</li>)}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGenome(options: UseGenomeOptions = {}): UseGenomeReturn {
  const {
    initialGenome = DEFAULT_GENOME,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    autoValidate = true,
  } = options;

  // Create lexer once and store in ref
  const lexerRef = useRef<CodonLexer | null>(null);
  if (!lexerRef.current) {
    lexerRef.current = new CodonLexer();
  }
  const lexer = lexerRef.current;

  // Core state
  const [genome, setGenomeState] = useState(initialGenome);
  const [isPending, setIsPending] = useState(false);
  const [validation, setValidation] = useState<GenomeValidation>(
    createEmptyValidation,
  );

  // Ref for debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store initialGenome in ref to avoid stale closure in initial validation
  const initialGenomeRef = useRef(initialGenome);

  // Public validate function
  const validate = (): GenomeValidation => {
    const result = validateGenome(genome, lexer);
    setValidation(result);
    return result;
  };

  // Set genome with optional immediate validation
  const setGenome = (newGenome: string) => {
    setGenomeState(newGenome);

    if (autoValidate) {
      setIsPending(true);

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Schedule validation
      debounceRef.current = setTimeout(() => {
        setIsPending(false);
        const result = validateGenome(newGenome, lexer);
        setValidation(result);
      }, debounceMs);
    }
  };

  // Clear genome
  const clear = () => {
    setGenome("");
  };

  // Reset to initial
  const reset = () => {
    setGenome(initialGenome);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Initial validation on mount
  useEffect(() => {
    const result = validateGenome(initialGenomeRef.current, lexer);
    setValidation(result);
  }, [lexer]);

  return {
    genome,
    setGenome,
    validation,
    validate,
    clear,
    reset,
    isPending,
    lexer,
  };
}

export default useGenome;
