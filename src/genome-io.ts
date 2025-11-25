/**
 * Genome import/export utilities for .genome file format
 */

export interface GenomeFile {
  version: string;
  title: string;
  description?: string;
  author?: string;
  created?: string;
  genome: string;
  metadata?: Record<string, any>;
}

/**
 * Export genome to .genome file format (JSON)
 */
export function exportGenome(
  genome: string,
  title: string,
  options?: {
    description?: string;
    author?: string;
    metadata?: Record<string, any>;
  },
): string {
  const genomeFile: GenomeFile = {
    version: "1.0.0",
    title,
    description: options?.description,
    author: options?.author,
    created: new Date().toISOString(),
    genome,
    metadata: options?.metadata,
  };

  return JSON.stringify(genomeFile, null, 2);
}

/**
 * Import genome from .genome file format (JSON)
 */
export function importGenome(fileContent: string): GenomeFile {
  try {
    const parsed = JSON.parse(fileContent);

    if (!parsed.version || !parsed.title || !parsed.genome) {
      throw new Error(
        "Invalid .genome file: missing required fields (version, title, genome)",
      );
    }

    return parsed as GenomeFile;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid .genome file: not valid JSON");
    }
    throw error;
  }
}

/**
 * Download genome as .genome file
 */
export function downloadGenomeFile(
  genome: string,
  filename: string,
  options?: {
    description?: string;
    author?: string;
    metadata?: Record<string, any>;
  },
): void {
  const content = exportGenome(
    genome,
    filename.replace(".genome", ""),
    options,
  );
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".genome") ? filename : `${filename}.genome`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read genome from file input
 */
export function readGenomeFile(file: File): Promise<GenomeFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const genomeFile = importGenome(content);
        resolve(genomeFile);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Validate genome file structure
 */
export function validateGenomeFile(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(content);

    if (!parsed.version) {
      errors.push("Missing required field: version");
    }
    if (!parsed.title) {
      errors.push("Missing required field: title");
    }
    if (!parsed.genome) {
      errors.push("Missing required field: genome");
    }
    if (parsed.genome && typeof parsed.genome !== "string") {
      errors.push("Field \"genome\" must be a string");
    }

    // Check genome contains valid bases (only if genome exists)
    if (parsed.genome && typeof parsed.genome === "string") {
      const cleanGenome = parsed.genome
        .replace(/\s+/g, "")
        .replace(/;.*$/gm, "");
      const invalidChars = cleanGenome.match(/[^ACGT]/g);
      if (invalidChars) {
        errors.push(
          `Invalid characters in genome: ${
            [...new Set(invalidChars)].join(
              ", ",
            )
          }`,
        );
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { valid: false, errors: ["Invalid JSON format"] };
  }
}
