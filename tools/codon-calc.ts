#!/usr/bin/env bun
/**
 * Codon Calculator - Utility for CodonCanvas development
 *
 * Subcommands:
 *   value <n>                Convert decimal (0-63) to codon
 *   codon <XYZ>              Convert codon to decimal value
 *   color <h> <s> <l>        Convert HSL (0-360, 0-100, 0-100) to codon triplet
 *   position <dist> <angle>  Calculate translate codons for polar coordinates
 *   table                    Print full codon value table
 *
 * Usage:
 *   bun tools/codon-calc.ts value 21        # -> CCC
 *   bun tools/codon-calc.ts codon CCC       # -> 21
 *   bun tools/codon-calc.ts color 180 50 50 # -> GAA CGG GAA GGG GAA GGG TTA
 *   bun tools/codon-calc.ts position 30 60  # -> Translate codons for 30 units at 60 degrees
 *   bun tools/codon-calc.ts table           # -> Full reference table
 */

// Base encoding: A=0, C=1, G=2, T=3
const BASE_VALUES: Record<string, number> = { A: 0, C: 1, G: 2, T: 3 };
const VALUE_BASES = ["A", "C", "G", "T"];

// Constants matching VM
const STACK_VALUE_RANGE = 64;
const HUE_DEGREES = 360;
const PERCENT_SCALE = 100;

/**
 * Decode a codon (3 bases) to its numeric value (0-63)
 */
function decodeCodon(codon: string): number {
  if (codon.length !== 3) {
    throw new Error(`Invalid codon length: ${codon}`);
  }
  const upper = codon.toUpperCase();
  const d1 = BASE_VALUES[upper[0]];
  const d2 = BASE_VALUES[upper[1]];
  const d3 = BASE_VALUES[upper[2]];

  if (d1 === undefined || d2 === undefined || d3 === undefined) {
    throw new Error(`Invalid codon: ${codon}`);
  }

  return d1 * 16 + d2 * 4 + d3;
}

/**
 * Encode a numeric value (0-63) to a codon
 */
function encodeValue(value: number): string {
  if (value < 0 || value > 63) {
    throw new Error(`Value out of range (0-63): ${value}`);
  }
  const d1 = Math.floor(value / 16);
  const d2 = Math.floor((value % 16) / 4);
  const d3 = value % 4;
  return VALUE_BASES[d1] + VALUE_BASES[d2] + VALUE_BASES[d3];
}

/**
 * Convert HSL values to stack values and codons
 */
function hslToCodons(
  h: number,
  s: number,
  l: number,
): { stackH: number; stackS: number; stackL: number; codons: string } {
  const stackH = Math.round((h / HUE_DEGREES) * (STACK_VALUE_RANGE - 1));
  const stackS = Math.round((s / PERCENT_SCALE) * (STACK_VALUE_RANGE - 1));
  const stackL = Math.round((l / PERCENT_SCALE) * (STACK_VALUE_RANGE - 1));

  const codonH = encodeValue(Math.min(63, Math.max(0, stackH)));
  const codonS = encodeValue(Math.min(63, Math.max(0, stackS)));
  const codonL = encodeValue(Math.min(63, Math.max(0, stackL)));

  return {
    stackH,
    stackS,
    stackL,
    codons: `GAA ${codonH} GAA ${codonS} GAA ${codonL} TTA`,
  };
}

/**
 * Calculate translate codons for polar coordinates
 */
function positionToCodons(
  distance: number,
  angleDeg: number,
): {
  x: number;
  y: number;
  reachable: boolean;
  codons: string | null;
  suggestion: string;
} {
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = Math.round(distance * Math.cos(angleRad));
  const y = Math.round(distance * Math.sin(angleRad));

  const reachable = x >= 0 && x <= 63 && y >= 0 && y <= 63;

  let codons: string | null = null;
  let suggestion: string;

  if (reachable) {
    codons = `GAA ${encodeValue(x)} GAA ${encodeValue(y)} ACA`;
    suggestion = "Position is reachable with positive coordinates";
  } else {
    const altAngles = findReachableAngles(distance);
    suggestion =
      altAngles.length > 0
        ? `Try angles: ${altAngles.join(", ")} degrees`
        : "No reachable angles at this distance";
  }

  return { x, y, reachable, codons, suggestion };
}

function findReachableAngles(distance: number): number[] {
  const angles: number[] = [];
  for (let a = 0; a < 360; a += 15) {
    const ax = Math.round(distance * Math.cos((a * Math.PI) / 180));
    const ay = Math.round(distance * Math.sin((a * Math.PI) / 180));
    if (ax >= 0 && ax <= 63 && ay >= 0 && ay <= 63) {
      angles.push(a);
    }
  }
  return angles;
}

/**
 * Print full codon value table
 */
function printTable(): void {
  console.info("Codon Value Reference Table");
  console.info("===========================\n");

  printCommonValues();
  printRotationValues();
  printColorHues();
  printFullTable();
}

function printCommonValues(): void {
  console.info("Common values:");
  const common = [
    0, 1, 2, 3, 5, 8, 10, 15, 20, 21, 26, 30, 32, 37, 42, 45, 50, 53, 60, 63,
  ];
  for (const v of common) {
    console.info(`  ${v.toString().padStart(2)} = ${encodeValue(v)}`);
  }
}

function printRotationValues(): void {
  console.info("\nRotation values (degrees -> codon):");
  const rotations = [15, 30, 45, 60, 90, 120, 180];
  for (const deg of rotations) {
    const val = deg % 64;
    console.info(
      `  ${deg.toString().padStart(3)}deg = GAA ${encodeValue(val)} AGA (value ${val})`,
    );
  }
}

function printColorHues(): void {
  console.info("\nColor hue reference (hue -> codon, at sat=100 light=71):");
  const hues: Record<string, number> = {
    red: 0,
    orange: 30,
    yellow: 60,
    green: 120,
    cyan: 180,
    blue: 240,
    purple: 270,
    magenta: 300,
  };
  for (const [name, hue] of Object.entries(hues)) {
    const { stackH, codons } = hslToCodons(hue, 100, 71);
    console.info(
      `  ${name.padEnd(8)} (h=${hue.toString().padStart(3)}) = ${codons} (stack h=${stackH})`,
    );
  }
}

function printFullTable(): void {
  console.info("\nFull table (0-63):");
  for (let row = 0; row < 8; row++) {
    const items: string[] = [];
    for (let col = 0; col < 8; col++) {
      const v = row * 8 + col;
      items.push(`${v.toString().padStart(2)}=${encodeValue(v)}`);
    }
    console.info(`  ${items.join("  ")}`);
  }
}

// ============ CLI Handlers ============

function handleValueCommand(args: string[]): void {
  const value = Number.parseInt(args[1], 10);
  if (Number.isNaN(value)) {
    console.error("Error: Please provide a valid number (0-63)");
    process.exit(1);
  }
  try {
    const codon = encodeValue(value);
    console.info(`${value} -> ${codon}`);
    console.info(`PUSH: GAA ${codon}`);
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }
}

function handleCodonCommand(args: string[]): void {
  const codon = args[1];
  if (!codon || codon.length !== 3) {
    console.error("Error: Please provide a valid 3-letter codon");
    process.exit(1);
  }
  try {
    const value = decodeCodon(codon);
    console.info(`${codon.toUpperCase()} -> ${value}`);
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }
}

function handleColorCommand(args: string[]): void {
  const h = Number.parseFloat(args[1]);
  const s = Number.parseFloat(args[2]);
  const l = Number.parseFloat(args[3]);
  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {
    console.error("Error: Please provide valid H S L values");
    console.error("  H: 0-360 (hue degrees)");
    console.error("  S: 0-100 (saturation %)");
    console.error("  L: 0-100 (lightness %)");
    process.exit(1);
  }
  const result = hslToCodons(h, s, l);
  console.info(`HSL(${h}, ${s}%, ${l}%)`);
  console.info(
    `Stack values: H=${result.stackH}, S=${result.stackS}, L=${result.stackL}`,
  );
  console.info(`Codons: ${result.codons}`);
}

function handlePositionCommand(args: string[]): void {
  const dist = Number.parseFloat(args[1]);
  const angle = Number.parseFloat(args[2]);
  if (Number.isNaN(dist) || Number.isNaN(angle)) {
    console.error("Error: Please provide distance and angle");
    console.error("  distance: units (0-63 for direct use)");
    console.error("  angle: degrees (0-360)");
    process.exit(1);
  }
  const result = positionToCodons(dist, angle);
  console.info(`Position at distance ${dist}, angle ${angle} degrees:`);
  console.info(`  Cartesian: x=${result.x}, y=${result.y}`);
  console.info(`  Reachable: ${result.reachable ? "Yes" : "No"}`);
  if (result.codons) {
    console.info(`  Codons: ${result.codons}`);
  }
  console.info(`  Note: ${result.suggestion}`);
}

function printUsage(): void {
  console.info(`Codon Calculator - CodonCanvas utility

Usage:
  bun tools/codon-calc.ts <command> [args]

Commands:
  value <n>               Convert decimal (0-63) to codon
  codon <XYZ>             Convert codon to decimal value  
  color <h> <s> <l>       Convert HSL to codon sequence
  position <dist> <angle> Calculate translate for polar coords
  table                   Print full reference table

Examples:
  bun tools/codon-calc.ts value 21
  bun tools/codon-calc.ts codon CCC
  bun tools/codon-calc.ts color 180 50 50
  bun tools/codon-calc.ts position 21 60
  bun tools/codon-calc.ts table`);
}

// ============ Main ============

const COMMAND_HANDLERS: Record<string, (args: string[]) => void> = {
  value: handleValueCommand,
  codon: handleCodonCommand,
  color: handleColorCommand,
  position: handlePositionCommand,
  pos: handlePositionCommand,
  table: printTable,
};

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0].toLowerCase();
  const handler = COMMAND_HANDLERS[command];

  if (handler) {
    handler(args);
  } else {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}

export { decodeCodon, encodeValue, hslToCodons, positionToCodons };
