import type { FitnessType } from "./types";

export function evaluateCoverage(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let nonWhitePixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
      nonWhitePixels++;
    }
  }

  return nonWhitePixels / (canvas.width * canvas.height);
}

export function evaluateSymmetry(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  let matches = 0;
  let total = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width / 2; x++) {
      const leftIdx = (y * width + x) * 4;
      const rightIdx = (y * width + (width - 1 - x)) * 4;

      const diff =
        Math.abs(data[leftIdx] - data[rightIdx]) +
        Math.abs(data[leftIdx + 1] - data[rightIdx + 1]) +
        Math.abs(data[leftIdx + 2] - data[rightIdx + 2]);

      if (diff < 30) matches++;
      total++;
    }
  }

  return matches / total;
}

export function evaluateColorVariety(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colors = new Set<string>();

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.floor(data[i] / 32);
    const g = Math.floor(data[i + 1] / 32);
    const b = Math.floor(data[i + 2] / 32);
    colors.add(`${r},${g},${b}`);
  }

  return Math.min(colors.size / 50, 1);
}

export function evaluateComplexity(genome: string): number {
  const codons = genome.replace(/\s+/g, "").match(/.{3}/g) || [];
  const uniqueCodons = new Set(codons);
  const lengthScore = Math.min(codons.length / 20, 1);
  const varietyScore = uniqueCodons.size / Math.max(codons.length, 1);
  return (lengthScore + varietyScore) / 2;
}

export function evaluateFitness(
  fitnessType: FitnessType,
  genome: string,
  canvas: HTMLCanvasElement,
): number {
  switch (fitnessType) {
    case "coverage":
      return evaluateCoverage(canvas);
    case "symmetry":
      return evaluateSymmetry(canvas);
    case "colorVariety":
      return evaluateColorVariety(canvas);
    case "complexity":
      return evaluateComplexity(genome);
    default:
      return 0;
  }
}
