/**
 * Linter Handlers Module
 * Manages linting and auto-fix functionality
 */

import {
  editor,
  linterMessages,
  linterPanel,
  linterToggle,
} from "./dom-manager";
import { lexer } from "./ui-state";
import { setStatus } from "./ui-utils";

/**
 * Run linter on source code
 */
export function runLinter(source: string): void {
  try {
    // Try to tokenize first
    const tokens = lexer.tokenize(source);

    // Get validation errors
    const frameErrors = lexer.validateFrame(source);
    const structErrors = lexer.validateStructure(tokens);
    const allErrors = [...frameErrors, ...structErrors];

    displayLinterErrors(allErrors);
  } catch (error) {
    // Tokenization failed - show parse error
    if (Array.isArray(error)) {
      displayLinterErrors(error);
    } else if (error instanceof Error) {
      displayLinterErrors([
        {
          message: error.message,
          position: 0,
          severity: "error" as const,
        },
      ]);
    } else {
      displayLinterErrors([
        {
          message: "Unknown error during linting",
          position: 0,
          severity: "error" as const,
        },
      ]);
    }
  }
}

/**
 * Check if an error can be auto-fixed
 */
function canAutoFix(errorMessage: string): boolean {
  const fixablePatterns = [
    /Program should begin with START codon/,
    /Program should end with STOP codon/,
    /Mid-triplet break detected/,
    /Source length \d+ is not divisible by 3/,
  ];
  return fixablePatterns.some((pattern) => pattern.test(errorMessage));
}

/**
 * Auto-fix a linter error
 */
function autoFixError(errorMessage: string, source: string): string | null {
  // Missing START codon
  if (/Program should begin with START codon/.test(errorMessage)) {
    return `ATG ${source.trim()}`;
  }

  // Missing STOP codon
  if (/Program should end with STOP codon/.test(errorMessage)) {
    return `${source.trim()} TAA`;
  }

  // Mid-triplet break - remove all whitespace and re-space by triplets
  if (/Mid-triplet break detected/.test(errorMessage)) {
    const cleaned = source.replace(/\s+/g, "");
    const triplets: string[] = [];
    for (let i = 0; i < cleaned.length; i += 3) {
      triplets.push(cleaned.slice(i, i + 3));
    }
    return triplets.join(" ");
  }

  // Non-triplet length - pad with 'A' or truncate
  if (/Source length (\d+) is not divisible by 3/.test(errorMessage)) {
    const match = errorMessage.match(/Missing (\d+) bases/);
    if (match) {
      const missing = parseInt(match[1], 10);
      return source.trim() + "A".repeat(missing);
    }
  }

  return null;
}

/**
 * Apply auto-fix to editor
 */
function applyAutoFix(errorMessage: string): void {
  const source = editor.value;
  const fixed = autoFixError(errorMessage, source);

  if (fixed) {
    editor.value = fixed;
    setStatus("Applied auto-fix", "success");
    runLinter(fixed);
  } else {
    setStatus("Could not auto-fix this error", "error");
  }
}

/**
 * Fix all auto-fixable errors iteratively
 */
export function fixAllErrors(): void {
  let source = editor.value;
  let iterations = 0;
  const maxIterations = 10;
  let fixedCount = 0;

  while (iterations < maxIterations) {
    try {
      const tokens = lexer.tokenize(source);
      const frameErrors = lexer.validateFrame(source);
      const structErrors = lexer.validateStructure(tokens);
      const allErrors = [...frameErrors, ...structErrors];

      const fixableError = allErrors.find((err) => canAutoFix(err.message));

      if (!fixableError) {
        break;
      }

      const fixed = autoFixError(fixableError.message, source);
      if (fixed && fixed !== source) {
        source = fixed;
        fixedCount++;
      } else {
        break;
      }
    } catch (error) {
      if (error instanceof Error) {
        const fixed = autoFixError(error.message, source);
        if (fixed && fixed !== source) {
          source = fixed;
          fixedCount++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    iterations++;
  }

  if (fixedCount > 0) {
    editor.value = source;
    setStatus(
      `Fixed ${fixedCount} error${fixedCount > 1 ? "s" : ""}`,
      "success",
    );
    runLinter(source);
  } else {
    setStatus("No auto-fixable errors found", "info");
  }
}

/**
 * Display linter errors
 */
function displayLinterErrors(
  errors: Array<{
    message: string;
    position: number;
    severity: "error" | "warning" | "info";
  }>,
): void {
  linterMessages.textContent = "";

  if (errors.length === 0) {
    const successDiv = document.createElement("div");
    successDiv.style.color = "#89d185";
    successDiv.textContent = "✅ No errors found";
    linterMessages.appendChild(successDiv);
  } else {
    errors.forEach((err) => {
      const icon =
        err.severity === "error"
          ? "🔴"
          : err.severity === "warning"
            ? "🟡"
            : "ℹ️";
      const color =
        err.severity === "error"
          ? "#f48771"
          : err.severity === "warning"
            ? "#dcdcaa"
            : "#4ec9b0";

      const errorDiv = document.createElement("div");
      errorDiv.style.cssText = `margin-bottom: 8px; padding: 6px 8px; border-left: 3px solid ${color}; background: rgba(255,255,255,0.03); display: flex; align-items: center;`;

      const iconSpan = document.createElement("span");
      iconSpan.style.marginRight = "8px";
      iconSpan.textContent = icon;

      const severitySpan = document.createElement("span");
      severitySpan.style.cssText = `color: ${color}; font-weight: 500;`;
      severitySpan.textContent = err.severity.toUpperCase();

      const messageSpan = document.createElement("span");
      messageSpan.style.cssText = "color: #d4d4d4; margin-left: 8px; flex: 1;";
      messageSpan.textContent = err.message;

      errorDiv.appendChild(iconSpan);
      errorDiv.appendChild(severitySpan);
      errorDiv.appendChild(messageSpan);

      if (err.position !== undefined) {
        const posSpan = document.createElement("span");
        posSpan.style.cssText =
          "color: #858585; margin-left: 8px; font-size: 0.9em;";
        posSpan.textContent = `(pos: ${err.position})`;
        errorDiv.appendChild(posSpan);
      }

      if (canAutoFix(err.message)) {
        const fixButton = document.createElement("button");
        fixButton.className = "fix-button";
        fixButton.dataset["errorMsg"] = err.message;
        fixButton.style.cssText =
          "margin-left: 12px; padding: 2px 8px; background: #4ec9b0; color: #1e1e1e; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em; font-weight: 500;";
        fixButton.textContent = "Fix";

        fixButton.addEventListener("mouseover", () => {
          fixButton.style.background = "#6dd3bb";
        });
        fixButton.addEventListener("mouseout", () => {
          fixButton.style.background = "#4ec9b0";
        });
        fixButton.addEventListener("click", (e) => {
          const errorMsg = (e.target as HTMLElement).getAttribute(
            "data-error-msg",
          );
          if (errorMsg) {
            applyAutoFix(errorMsg);
          }
        });

        errorDiv.appendChild(fixButton);
      }

      linterMessages.appendChild(errorDiv);
    });
  }
}

/**
 * Toggle linter panel visibility
 */
export function toggleLinter(): void {
  const isHidden = linterPanel.style.display === "none";

  if (isHidden) {
    linterPanel.style.display = "block";
    linterToggle.textContent = "Hide";
    linterToggle.setAttribute("aria-expanded", "true");
  } else {
    linterPanel.style.display = "none";
    linterToggle.textContent = "Show";
    linterToggle.setAttribute("aria-expanded", "false");
  }
}
