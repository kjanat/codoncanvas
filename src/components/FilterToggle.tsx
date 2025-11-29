import type { ReactNode } from "react";

interface FilterOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface FilterToggleProps<T extends string> {
  /** Available filter options */
  options: FilterOption<T>[];
  /** Currently selected value */
  selected: T;
  /** Callback when selection changes */
  onSelect: (value: T) => void;
  /** Visual variant */
  variant?: "pill" | "rounded";
  /** Size variant */
  size?: "sm" | "md";
  /** Custom class for container */
  className?: string;
}

/**
 * Reusable filter toggle button group for category/option selection
 */
export function FilterToggle<T extends string>({
  options,
  selected,
  onSelect,
  variant = "rounded",
  size = "md",
  className = "",
}: FilterToggleProps<T>) {
  const baseClasses = "font-medium transition-colors";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const variantClasses = {
    pill: "rounded-full",
    rounded: "rounded-lg",
  };

  const getButtonClasses = (isSelected: boolean) => {
    const selectedClasses = "bg-primary text-white";
    const unselectedClasses = "bg-surface text-text hover:bg-primary/10";

    return [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      isSelected ? selectedClasses : unselectedClasses,
    ].join(" ");
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => (
        <button
          className={getButtonClasses(selected === opt.value)}
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
