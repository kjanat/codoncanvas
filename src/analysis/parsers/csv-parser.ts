/**
 * CSV parsing for MetricsSession data
 */

import { csv2json } from "csv42";

import {
  type MetricsSession,
  type SchemaField,
  SESSION_SCHEMA,
} from "./schema";

/** Parse result with success flag */
interface ParseResult<T> {
  success: true;
  value: T;
}

/** Parse error with message */
interface ParseError {
  success: false;
  error: string;
}

type ParseOutcome<T> = ParseResult<T> | ParseError;

/** Result of CSV parsing with errors */
export interface ParseCSVResult {
  sessions: MetricsSession[];
  errors: string[];
}

/**
 * Parse a single field value according to schema
 */
function parseField(
  value: unknown,
  field: SchemaField,
): ParseOutcome<string | number | null> {
  const schema = SESSION_SCHEMA[field];
  const strValue = String(value ?? "");

  if (schema.type === "string") {
    if ("required" in schema && schema.required && !strValue.trim()) {
      return { success: false, error: `${field} must be a non-empty string` };
    }
    return { success: true, value: strValue };
  }

  // Handle nullable number
  if ("nullable" in schema && schema.nullable) {
    if (strValue === "null" || strValue === "") {
      return { success: true, value: null };
    }
  }

  const parsed = Number.parseFloat(strValue);
  if (!Number.isFinite(parsed)) {
    return { success: false, error: `${field} must be a valid number` };
  }

  return { success: true, value: parsed };
}

/**
 * Parse a single CSV row into a MetricsSession
 */
function parseRow(
  row: Record<string, string>,
  rowIndex: number,
): ParseOutcome<MetricsSession> {
  const result: Record<string, unknown> = {};

  for (const field of Object.keys(SESSION_SCHEMA) as SchemaField[]) {
    const rawValue = row[field] ?? "";
    const parsed = parseField(rawValue, field);

    if (!parsed.success) {
      return {
        success: false,
        error: `Row ${rowIndex + 1}: ${parsed.error}`,
      };
    }

    result[field] = parsed.value;
  }

  return { success: true, value: result as unknown as MetricsSession };
}

/**
 * Parse CSV content and return both sessions and errors
 */
export function parseCSVContentWithErrors(content: string): ParseCSVResult {
  const trimmed = content.trim();
  if (!trimmed || !trimmed.includes("\n")) {
    throw new Error("CSV file is empty or missing header");
  }

  const rawData = csv2json<Record<string, string>>(trimmed, {
    header: true,
    nested: false,
  });

  if (rawData.length === 0) {
    throw new Error("CSV file is empty or missing header");
  }

  const sessions: MetricsSession[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const parsed = parseRow(rawData[i], i);
    if (parsed.success) {
      sessions.push(parsed.value);
    } else {
      errors.push(parsed.error);
    }
  }

  return { sessions, errors };
}

/**
 * Parse CSV string into MetricsSession objects
 * Uses csv42 for RFC 4180 compliant parsing with schema-based validation
 */
export function parseCSVContent(content: string): MetricsSession[] {
  const result = parseCSVContentWithErrors(content);

  if (result.errors.length > 0) {
    console.warn(
      `Skipped ${result.errors.length} invalid row(s): ${result.errors.slice(0, 5).join("; ")}${result.errors.length > 5 ? "..." : ""}`,
    );
  }

  if (result.sessions.length === 0) {
    throw new Error("No valid sessions found in CSV");
  }

  return result.sessions;
}
