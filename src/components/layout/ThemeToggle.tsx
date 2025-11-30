/**
 * ThemeToggle - Theme switching button
 *
 * Displays current theme icon and cycles through light/dark/system on click.
 */

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, cycleTheme, ThemeIcon } = useTheme();

  return (
    <button
      className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg-light hover:text-text"
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
      type="button"
    >
      <span className="sr-only">Toggle theme ({theme})</span>
      <ThemeIcon />
    </button>
  );
}
