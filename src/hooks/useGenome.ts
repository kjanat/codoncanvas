/**
 * useGenome - React hook for genome state management
 *
 * Provides genome editing, validation, and tokenization with debounced
 * error checking. Central hook for genome manipulation across the app.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodonLexer } from "@/core/lexer";
import type { CodonToken, ParseError } from "@/types";

/** Validation result from genome analysis */
export interface GenomeValidation {
  /** Whether the genome is structurally valid */
  isValid: boolean;
  /** Tokenized codons (empty if tokenization failed) */
  tokens: CodonToken[];
  /** Parse/structure errors */
  errors: ParseError[];
  /** Frame alignment warnings */
  warnings: ParseError[];
  /** Error message if tokenization itself failed */
  tokenizeError: string | null;
}

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

  // Memoize lexer instance
  const lexer = useMemo(() => new CodonLexer(), []);

  // Core state
  const [genome, setGenomeState] = useState(initialGenome);
  const [isPending, setIsPending] = useState(false);
  const [validation, setValidation] = useState<GenomeValidation>(() =>
    createEmptyValidation(),
  );

  // Ref for debounce timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validate genome and return result
  const validate = useCallback((): GenomeValidation => {
    try {
      const tokens = lexer.tokenize(genome);
      const structureErrors = lexer.validateStructure(tokens);
      const frameWarnings = lexer.validateFrame(genome);

      const errors = structureErrors.filter((e) => e.severity === "error");
      const warnings = [
        ...structureErrors.filter((e) => e.severity === "warning"),
        ...frameWarnings,
      ];

      const result: GenomeValidation = {
        isValid: errors.length === 0,
        tokens,
        errors,
        warnings,
        tokenizeError: null,
      };

      setValidation(result);
      return result;
    } catch (err) {
      const result: GenomeValidation = {
        isValid: false,
        tokens: [],
        errors: [],
        warnings: [],
        tokenizeError: err instanceof Error ? err.message : "Unknown error",
      };

      setValidation(result);
      return result;
    }
  }, [genome, lexer]);

  // Set genome with optional immediate validation
  const setGenome = useCallback(
    (newGenome: string) => {
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
          // Validation will run via useEffect
        }, debounceMs);
      }
    },
    [autoValidate, debounceMs],
  );

  // Clear genome
  const clear = useCallback(() => {
    setGenome("");
  }, [setGenome]);

  // Reset to initial
  const reset = useCallback(() => {
    setGenome(initialGenome);
  }, [setGenome, initialGenome]);

  // Auto-validate on genome change (debounced)
  // biome-ignore lint/correctness/useExhaustiveDependencies: validate is intentionally excluded to prevent infinite loops
  useEffect(() => {
    if (!autoValidate || isPending) return;
    validate();
  }, [genome, autoValidate, isPending]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Initial validation
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only once on mount
  useEffect(() => {
    validate();
  }, []);

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

/** Create empty validation state */
function createEmptyValidation(): GenomeValidation {
  return {
    isValid: false,
    tokens: [],
    errors: [],
    warnings: [],
    tokenizeError: null,
  };
}

export default useGenome;
