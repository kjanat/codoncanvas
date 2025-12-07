import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { useId } from "react";

interface FilterOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface FilterToggleProps<T extends string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "role" | "onSelect"> {
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
  /** Optional radio group name (defaults to unique id per instance) */
  name?: string;
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
  name,
  className = "",
  ...rest
}: FilterToggleProps<T>): ReactElement {
  const generatedId = useId();
  const groupName = name ?? `filter-toggle-${generatedId}`;

  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors";

  // Minimum touch target size: 44x44px (WCAG 2.5.5)
  const sizeClasses = {
    sm: "px-3 py-2 text-xs min-h-11 min-w-11",
    md: "px-4 py-2.5 text-sm min-h-11 min-w-11",
  } as const;

  const variantClasses = {
    pill: "rounded-full",
    rounded: "rounded-lg",
  } as const;

  const getButtonClasses = (isSelected: boolean): string => {
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
    <div
      {...rest}
      className={`flex flex-wrap gap-2 ${className}`}
      role="radiogroup"
    >
      {options.map((opt) => (
        <label
          className={`${getButtonClasses(selected === opt.value)} focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2`}
          key={opt.value}
        >
          <input
            checked={selected === opt.value}
            className="sr-only"
            name={groupName}
            onChange={() => onSelect(opt.value)}
            type="radio"
            value={opt.value}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
