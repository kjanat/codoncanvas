/**
 * @fileoverview Common type definitions used across CodonCanvas
 * @module types/common
 */

/**
 * Diagnostic severity level for parser errors and validation warnings.
 *
 * Used in {@link ParseError} and linter output.
 *
 * - `error` - Prevents execution (e.g., invalid codon, stack underflow)
 * - `warning` - Executes but questionable (e.g., missing STOP codon)
 * - `info` - Stylistic suggestion (e.g., frame alignment)
 */
export type Severity = "error" | "warning" | "info";

/**
 * Risk or priority level for classifications and assessments.
 *
 * Used in security scanning, assessment difficulty ratings, and
 * mutation impact analysis.
 */
export type RiskLevel = "high" | "medium" | "low";
