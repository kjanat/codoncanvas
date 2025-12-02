/**
 * RangeSlider Component - Styled range input
 */

import type { InputHTMLAttributes } from "react";

export interface RangeSliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "value"
  > {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
}

export function RangeSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "",
  disabled,
  ...props
}: RangeSliderProps) {
  return (
    <input
      className={`w-full accent-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
      max={max}
      min={min}
      onChange={(e) => onChange(Number(e.target.value))}
      step={step}
      type="range"
      value={value}
      {...props}
    />
  );
}
