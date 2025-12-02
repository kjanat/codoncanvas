/**
 * useGenomeFileIO - File save/load operations for genome files
 *
 * Handles downloading genome files and reading uploaded genome files.
 */

import { type ChangeEvent, useCallback } from "react";
import { downloadGenomeFile, readGenomeFile } from "@/genetics/genome-io";

export interface UseGenomeFileIOOptions {
  /** Current genome string */
  genome: string;
  /** Callback when a genome is loaded from file */
  onLoad: (genome: string) => void;
  /** Title for the genome file (used in filename) */
  title?: string;
  /** Description to include in file metadata */
  description?: string;
}

export interface UseGenomeFileIOReturn {
  /** Save current genome to file */
  handleSave: () => void;
  /** Load genome from file input event */
  handleLoad: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

/**
 * Hook for genome file save/load operations.
 *
 * @example
 * ```tsx
 * const { handleSave, handleLoad } = useGenomeFileIO({
 *   genome,
 *   onLoad: (loadedGenome) => setGenome(loadedGenome),
 *   title: selectedExample?.title,
 *   description: selectedExample?.description,
 * });
 *
 * <button onClick={handleSave}>Save</button>
 * <input type="file" onChange={handleLoad} accept=".genome,.txt" />
 * ```
 */
export function useGenomeFileIO({
  genome,
  onLoad,
  title = "untitled",
  description,
}: UseGenomeFileIOOptions): UseGenomeFileIOReturn {
  // Save genome to file
  const handleSave = useCallback(() => {
    const filename = title.toLowerCase().replace(/\s+/g, "-");
    downloadGenomeFile(genome, filename, { description });
  }, [genome, title, description]);

  // Load genome from file
  const handleLoad = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const genomeFile = await readGenomeFile(file);
        onLoad(genomeFile.genome);
      } catch (err) {
        console.error("Failed to load genome:", err);
      } finally {
        // Reset input value to allow re-selecting the same file
        event.currentTarget.value = "";
      }
    },
    [onLoad],
  );

  return {
    handleSave,
    handleLoad,
  };
}

export default useGenomeFileIO;
