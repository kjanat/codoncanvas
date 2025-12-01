import type { ComponentProps } from "react";

interface LabelProps extends Omit<ComponentProps<"label">, "htmlFor"> {
  /** ID of the associated form control */
  htmlFor: string;
  /** Whether the associated field is required */
  required?: boolean;
}

/**
 * Consistent form label component.
 * Always pass htmlFor to associate with an input element.
 */
export function Label({
  htmlFor,
  children,
  className = "",
  required,
  ...props
}: LabelProps) {
  return (
    <label
      className={`mb-1 block text-sm font-medium text-text ${className}`}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}
