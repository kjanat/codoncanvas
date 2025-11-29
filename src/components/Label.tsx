import type { ComponentProps } from "react";

interface LabelProps extends ComponentProps<"label"> {
  /** Whether the associated field is required */
  required?: boolean;
}

/**
 * Consistent form label component.
 * Always pass htmlFor to associate with an input element.
 */
export function Label({
  children,
  className = "",
  required,
  ...props
}: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor passed via spread props
    <label
      className={`mb-1 block text-sm font-medium text-text ${className}`}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}
