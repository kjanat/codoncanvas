/**
 * Mutation Types Data
 *
 * Centralized definitions for mutation types used across the application.
 * Provides consistent labels and descriptions for UI components.
 */

import type { MutationType } from "@/types";

/** Mutation type with display metadata */
export interface MutationTypeInfo {
  /** Mutation type identifier */
  type: MutationType;
  /** Human-readable label */
  label: string;
  /** Description of what this mutation does */
  description: string;
}

/**
 * All mutation types with their display information.
 * Used in MutationDemo, AssessmentDemo, and other components.
 */
export const MUTATION_TYPES: MutationTypeInfo[] = [
  {
    type: "silent",
    label: "Silent",
    description: "Change codon but not function (synonymous substitution)",
  },
  {
    type: "missense",
    label: "Missense",
    description: "Change codon to different function (shape change)",
  },
  {
    type: "nonsense",
    label: "Nonsense",
    description: "Create early STOP codon (truncates output)",
  },
  {
    type: "point",
    label: "Point",
    description: "Change single base (may be silent/missense/nonsense)",
  },
  {
    type: "insertion",
    label: "Insertion",
    description: "Add extra bases (may cause frameshift)",
  },
  {
    type: "deletion",
    label: "Deletion",
    description: "Remove bases (may cause frameshift)",
  },
  {
    type: "frameshift",
    label: "Frameshift",
    description: "Shift reading frame (scrambles downstream)",
  },
];

/**
 * Difficulty-based mutation type filters.
 * Centralizes which mutation types are available at each difficulty level.
 */
const DIFFICULTY_FILTERS: Record<"easy" | "medium" | "hard", MutationType[]> = {
  easy: ["silent", "missense"],
  medium: ["silent", "missense", "nonsense"],
  hard: MUTATION_TYPES.map((m) => m.type),
};

/**
 * Get mutation types filtered by difficulty level.
 * Used for progressive disclosure in assessments.
 */
export function getMutationTypesByDifficulty(
  difficulty: "easy" | "medium" | "hard",
): MutationTypeInfo[] {
  const allowed = DIFFICULTY_FILTERS[difficulty];
  return MUTATION_TYPES.filter((t) => allowed.includes(t.type));
}

/**
 * Get mutation type info by type identifier.
 */
export function getMutationTypeInfo(
  type: MutationType,
): MutationTypeInfo | undefined {
  return MUTATION_TYPES.find((m) => m.type === type);
}

/**
 * Mutation type labels for quick lookup.
 */
export const MUTATION_TYPE_LABELS: Record<MutationType, string> =
  Object.fromEntries(MUTATION_TYPES.map((m) => [m.type, m.label])) as Record<
    MutationType,
    string
  >;
