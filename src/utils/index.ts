/**
 * Shared utilities
 */

export {
  escapeHtml,
  getElement,
  getElementOrNull,
  getElementOrNullUnsafe,
  getElementUnsafe,
  querySelector,
  querySelectorAll,
  querySelectorUnsafe,
  showStatus,
} from "./dom";

export type {
  CleanGenomeOptions,
  GenomeLine,
  NumericLiteral,
} from "./genome-utils";
export {
  cleanGenome,
  extractCommentValues,
  findNumericLiterals,
  formatAsCodons,
  isPushCodon,
  parseGenome,
  parseGenomeLines,
} from "./genome-utils";
