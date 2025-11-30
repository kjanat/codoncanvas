/**
 * CSV schema definition for MetricsSession
 *
 * This is the single source of truth for MetricsSession structure.
 * The MetricsSession type is derived from this schema.
 */

/** Schema field definition */
export interface SchemaFieldDef {
  type: "string" | "number";
  required?: boolean;
  nullable?: boolean;
}

/** Schema definition for MetricsSession fields */
export const SESSION_SCHEMA = {
  sessionId: { type: "string", required: true },
  startTime: { type: "number", required: true },
  endTime: { type: "number", required: true },
  duration: { type: "number", required: true },
  genomesCreated: { type: "number", required: true },
  genomesExecuted: { type: "number", required: true },
  timeToFirstArtifact: { type: "number", nullable: true },
  mutationsApplied: { type: "number", required: true },
  renderMode_visual: { type: "number", required: true },
  renderMode_audio: { type: "number", required: true },
  renderMode_both: { type: "number", required: true },
  mutation_silent: { type: "number", required: true },
  mutation_missense: { type: "number", required: true },
  mutation_nonsense: { type: "number", required: true },
  mutation_frameshift: { type: "number", required: true },
  mutation_point: { type: "number", required: true },
  mutation_insertion: { type: "number", required: true },
  mutation_deletion: { type: "number", required: true },
  feature_diffViewer: { type: "number", required: true },
  feature_timeline: { type: "number", required: true },
  feature_evolution: { type: "number", required: true },
  feature_assessment: { type: "number", required: true },
  feature_export: { type: "number", required: true },
  errorCount: { type: "number", required: true },
  errorTypes: { type: "string", required: false },
} as const satisfies Record<string, SchemaFieldDef>;

/** All field names in the schema */
export type SchemaField = keyof typeof SESSION_SCHEMA;

// ============================================================================
// Type derivation utilities
// ============================================================================

/** Derive TypeScript type from a schema field definition */
type FieldType<F extends SchemaFieldDef> = F extends { nullable: true }
  ? F["type"] extends "string"
    ? string | null
    : number | null
  : F["type"] extends "string"
    ? string
    : number;

/**
 * MetricsSession interface derived from SESSION_SCHEMA.
 *
 * Flattened session data for CSV export/import and analysis.
 * Used by MetricsAnalyzer for classroom-level analytics.
 */
export type MetricsSession = {
  [K in keyof typeof SESSION_SCHEMA]: FieldType<(typeof SESSION_SCHEMA)[K]>;
};

// ============================================================================
// Required fields
// ============================================================================

/** Extract required field names from schema */
type RequiredKeys<T extends Record<string, SchemaFieldDef>> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never;
}[keyof T];

/** Required field names type */
export type RequiredSessionField = RequiredKeys<typeof SESSION_SCHEMA>;

/** Required field names array (runtime) */
export const REQUIRED_SESSION_FIELDS = (
  Object.entries(SESSION_SCHEMA) as Array<[SchemaField, SchemaFieldDef]>
)
  .filter(([_, def]) => "required" in def && def.required)
  .map(([key]) => key) as RequiredSessionField[];
