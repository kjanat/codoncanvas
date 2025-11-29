/**
 * @fileoverview Branded types for compile-time domain validation
 *
 * Branded types create nominal typing in TypeScript's structural type system.
 * They prevent accidental mixing of values that share the same underlying type
 * but represent different domain concepts.
 *
 * @example
 * ```typescript
 * // Without branded types - compiles but semantically wrong:
 * const rotation: number = 45;
 * const percentage: number = 50;
 * setRotation(percentage); // Oops! No compile error
 *
 * // With branded types - compile-time safety:
 * const rotation: Degrees = degrees(45);
 * const percentage: Percentage = percent(50);
 * setRotation(percentage); // Error: Type 'Percentage' is not assignable to 'Degrees'
 * ```
 *
 * @module types/branded
 */

// ============================================================================
// Brand Symbol Infrastructure
// ============================================================================

/** Unique symbol for brand identification (not exported - internal use only) */
declare const __brand: unique symbol;

/** Base branded type - intersects T with a unique brand */
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// ============================================================================
// Stack Value (0-63 range, 6-bit)
// ============================================================================

/**
 * A 6-bit unsigned integer (0-63) representing a VM stack value.
 * Derived from base-4 encoding of codon triplets.
 *
 * @example
 * ```typescript
 * const value = stackValue(42);  // OK
 * const bad = stackValue(100);   // Runtime error: out of range
 * ```
 */
export type StackValue = Brand<number, "StackValue">;

/** Minimum valid stack value */
export const STACK_VALUE_MIN = 0;
/** Maximum valid stack value (6 bits = 64 values) */
export const STACK_VALUE_MAX = 63;

/**
 * Creates a validated StackValue (0-63).
 *
 * @param value - Number to convert (must be integer 0-63)
 * @returns Branded StackValue
 * @throws {RangeError} If value is outside 0-63 range
 *
 * TODO: Implement validation logic
 * Consider: Should this clamp, wrap, or throw?
 */
export function stackValue(value: number): StackValue {
  // YOUR IMPLEMENTATION HERE:
  // - Check if value is an integer
  // - Check if value is in range [0, 63]
  // - Decide error handling: throw RangeError or clamp?
  if (
    !Number.isInteger(value) ||
    value < STACK_VALUE_MIN ||
    value > STACK_VALUE_MAX
  ) {
    throw new RangeError(
      `StackValue must be integer in [${STACK_VALUE_MIN}, ${STACK_VALUE_MAX}], got: ${value}`,
    );
  }
  return value as StackValue;
}

/** Type guard for StackValue range */
export function isValidStackValue(value: number): value is StackValue {
  return (
    Number.isInteger(value) &&
    value >= STACK_VALUE_MIN &&
    value <= STACK_VALUE_MAX
  );
}

// ============================================================================
// Degrees (rotation angle)
// ============================================================================

/**
 * Rotation angle in degrees.
 * Unbounded (can accumulate beyond 360), but semantically distinct from other numbers.
 */
export type Degrees = Brand<number, "Degrees">;

/**
 * Creates a Degrees value.
 * Does not normalize - rotation can accumulate across multiple operations.
 */
export function degrees(value: number): Degrees {
  return value as Degrees;
}

/**
 * Normalizes degrees to [0, 360) range.
 * Use when you need a canonical angle representation.
 */
export function normalizeDegrees(deg: Degrees): Degrees {
  const normalized = ((deg % 360) + 360) % 360;
  return normalized as Degrees;
}

// ============================================================================
// Percentage (0-100 range)
// ============================================================================

/**
 * Percentage value (0-100) for saturation, lightness, etc.
 */
export type Percentage = Brand<number, "Percentage">;

/** Minimum percentage */
export const PERCENTAGE_MIN = 0;
/** Maximum percentage */
export const PERCENTAGE_MAX = 100;

/**
 * Creates a validated Percentage (0-100).
 *
 * @param value - Number to convert (must be 0-100)
 * @returns Branded Percentage
 * @throws {RangeError} If value is outside 0-100 range
 */
export function percent(value: number): Percentage {
  if (value < PERCENTAGE_MIN || value > PERCENTAGE_MAX) {
    throw new RangeError(
      `Percentage must be in [${PERCENTAGE_MIN}, ${PERCENTAGE_MAX}], got: ${value}`,
    );
  }
  return value as Percentage;
}

/** Clamps value to percentage range without throwing */
export function clampPercent(value: number): Percentage {
  return Math.max(
    PERCENTAGE_MIN,
    Math.min(PERCENTAGE_MAX, value),
  ) as Percentage;
}

// ============================================================================
// Hue (0-360 degrees, wrapping)
// ============================================================================

/**
 * Hue angle (0-360) for HSL colors.
 * Unlike Degrees, Hue wraps at 360 for color wheel semantics.
 */
export type Hue = Brand<number, "Hue">;

/**
 * Creates a Hue value, automatically wrapping to [0, 360).
 */
export function hue(value: number): Hue {
  const wrapped = ((value % 360) + 360) % 360;
  return wrapped as Hue;
}

// ============================================================================
// PositiveNumber (scale factors, sizes)
// ============================================================================

/**
 * Positive number (> 0) for scale factors and sizes.
 */
export type PositiveNumber = Brand<number, "PositiveNumber">;

/**
 * Creates a validated PositiveNumber.
 *
 * @param value - Number to convert (must be > 0)
 * @returns Branded PositiveNumber
 * @throws {RangeError} If value is not positive
 */
export function positive(value: number): PositiveNumber {
  if (value <= 0) {
    throw new RangeError(`Value must be positive, got: ${value}`);
  }
  return value as PositiveNumber;
}

/** Type guard for positive numbers */
export function isPositive(value: number): value is PositiveNumber {
  return value > 0;
}

// ============================================================================
// Improved HSLColor with branded components
// ============================================================================

/**
 * Type-safe HSL color with validated component ranges.
 */
export interface BrandedHSLColor {
  /** Hue (0-360, wrapping) */
  readonly h: Hue;
  /** Saturation (0-100%) */
  readonly s: Percentage;
  /** Lightness (0-100%) */
  readonly l: Percentage;
}

/**
 * Creates a validated HSL color.
 *
 * @example
 * ```typescript
 * const red = hslColor(0, 100, 50);     // Pure red
 * const blue = hslColor(240, 100, 50);  // Pure blue
 * const gray = hslColor(0, 0, 50);      // 50% gray
 * ```
 */
export function hslColor(h: number, s: number, l: number): BrandedHSLColor {
  return {
    h: hue(h),
    s: clampPercent(s),
    l: clampPercent(l),
  };
}

// ============================================================================
// Export convenience re-exports
// ============================================================================

export type { Brand };
