import type React from "react";

export interface StatCardProps {
  /** Label for the stat */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle below the label */
  subtitle?: string;
  /** Whether to display in danger/warning style */
  danger?: boolean;
  /** Visual variant: compact (default) or dashboard */
  variant?: "compact" | "dashboard";
}

export function StatCard({
  label,
  value,
  subtitle,
  danger = false,
  variant = "compact",
}: StatCardProps): React.JSX.Element {
  if (variant === "dashboard") {
    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <p className="text-sm text-text-muted">{label}</p>
        <p
          className={`mt-2 text-3xl font-bold ${danger ? "text-danger" : "text-text"}`}
        >
          {value}
        </p>
        {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface p-4 text-center">
      <div
        className={`text-2xl font-bold ${danger ? "text-red-600" : "text-primary"}`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-text-muted">{label}</div>
      {subtitle && (
        <div className="mt-1 text-xs text-text-muted">{subtitle}</div>
      )}
    </div>
  );
}
