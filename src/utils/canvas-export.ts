/**
 * Canvas export utilities
 *
 * Pure functions for exporting canvas content to various formats.
 * No React dependencies - can be used anywhere.
 */

/**
 * Get canvas content as data URL.
 *
 * @param canvas - The canvas element to export
 * @param type - MIME type (default: "image/png")
 * @param quality - Quality for lossy formats (0-1)
 * @returns Data URL string or null if canvas is null
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement | null,
  type: string = "image/png",
  quality?: number,
): string | null {
  if (!canvas) return null;
  return canvas.toDataURL(type, quality);
}

/**
 * Get canvas content as Blob.
 *
 * @param canvas - The canvas element to export
 * @param type - MIME type (default: "image/png")
 * @param quality - Quality for lossy formats (0-1)
 * @returns Promise resolving to Blob or null
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement | null,
  type: string = "image/png",
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!canvas) {
      resolve(null);
      return;
    }

    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

/**
 * Download canvas content as PNG file.
 *
 * @param canvas - The canvas element to export
 * @param filename - Download filename (default: "canvas-output.png")
 */
export function downloadCanvasPNG(
  canvas: HTMLCanvasElement | null,
  filename: string = "canvas-output.png",
): void {
  if (!canvas) return;

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Clear canvas to white background.
 *
 * @param canvas - The canvas element to clear
 */
export function clearCanvas(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
