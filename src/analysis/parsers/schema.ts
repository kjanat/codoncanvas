/**
 * CSV schema definition for MetricsSession
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

export type SchemaField = keyof typeof SESSION_SCHEMA;
