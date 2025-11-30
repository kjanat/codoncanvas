/**
 * useGenome - React hook for genome state management
 *
 * Provides genome editing, validation, and tokenization with debounced
 * error checking. Central hook for genome manipulation across the app.
 */

import { useEffect, useRef, useState } from "react";
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

  // Validate genome helper - stored in ref for stable reference
  const validateGenomeRef = useRef(
    (genomeToValidate: string): GenomeValidation => {
      try {
        const tokens = lexer.tokenize(genomeToValidate);
        const structureErrors = lexer.validateStructure(tokens);
        const frameWarnings = lexer.validateFrame(genomeToValidate);

        const errors = structureErrors.filter((e) => e.severity === "error");
        const warnings = [
          ...structureErrors.filter((e) => e.severity === "warning"),
          ...frameWarnings,
        ];

        return {
          isValid: errors.length === 0,
          tokens,
          errors,
          warnings,
          tokenizeError: null,
        };
      } catch (err) {
        return {
          isValid: false,
          tokens: [],
          errors: [],
          warnings: [],
          tokenizeError: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
  );

  // Public validate function
  const validate = (): GenomeValidation => {
    const result = validateGenomeRef.current(genome);
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
        const result = validateGenomeRef.current(newGenome);
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
    const result = validateGenomeRef.current(initialGenomeRef.current);
    setValidation(result);
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

export default useGenome;
