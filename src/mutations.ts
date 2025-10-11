/**
 * Mutation tools for CodonCanvas genomes
 * Implements biological mutation types: point, silent, missense, nonsense, frameshift
 */

import { Base, Codon, CODON_MAP, Opcode } from './types';

export type MutationType = 'silent' | 'missense' | 'nonsense' | 'point' | 'insertion' | 'deletion' | 'frameshift';

export interface MutationResult {
  original: string;
  mutated: string;
  type: MutationType;
  position: number;
  description: string;
}

const BASES: Base[] = ['A', 'C', 'G', 'T'];
const STOP_CODONS: Set<Codon> = new Set(['TAA' as Codon, 'TAG' as Codon, 'TGA' as Codon]);

/**
 * Get synonymous codons (same opcode) for a given codon
 */
function getSynonymousCodons(codon: Codon): Codon[] {
  const opcode = CODON_MAP[codon];
  if (opcode === undefined) return [];

  return Object.entries(CODON_MAP)
    .filter(([c, op]) => op === opcode && c !== codon)
    .map(([c]) => c as Codon);
}

/**
 * Get missense codons (different opcode, but not STOP) for a given codon
 */
function getMissenseCodons(codon: Codon): Codon[] {
  const opcode = CODON_MAP[codon];
  if (opcode === undefined) return [];

  return Object.entries(CODON_MAP)
    .filter(([c, op]) => op !== opcode && !STOP_CODONS.has(c as Codon) && c !== codon)
    .map(([c]) => c as Codon);
}

/**
 * Parse genome string into array of codons
 */
function parseGenome(genome: string): string[] {
  // Strip comments and whitespace
  const cleaned = genome
    .split('\n')
    .map(line => line.split(';')[0])
    .join('')
    .replace(/\s+/g, '');

  const codons: string[] = [];
  for (let i = 0; i < cleaned.length; i += 3) {
    codons.push(cleaned.slice(i, i + 3));
  }
  return codons;
}

/**
 * Apply silent mutation - change codon to synonymous variant
 */
export function applySilentMutation(genome: string, position?: number): MutationResult {
  const codons = parseGenome(genome);

  // Find position with synonymous codons
  let targetPos = position;
  if (targetPos === undefined || targetPos >= codons.length) {
    const candidates = codons
      .map((c, i) => ({ codon: c as Codon, index: i }))
      .filter(({ codon }) => getSynonymousCodons(codon).length > 0);

    if (candidates.length === 0) {
      throw new Error('No synonymous mutations available in this genome');
    }

    targetPos = candidates[Math.floor(Math.random() * candidates.length)].index;
  }

  const originalCodon = codons[targetPos] as Codon;
  const synonymous = getSynonymousCodons(originalCodon);

  if (synonymous.length === 0) {
    throw new Error(`No synonymous codons for ${originalCodon} at position ${targetPos}`);
  }

  const newCodon = synonymous[Math.floor(Math.random() * synonymous.length)];
  codons[targetPos] = newCodon;

  return {
    original: genome,
    mutated: codons.join(' '),
    type: 'silent',
    position: targetPos,
    description: `Silent mutation: ${originalCodon} → ${newCodon} (same opcode: ${Opcode[CODON_MAP[originalCodon]]})`
  };
}

/**
 * Apply missense mutation - change codon to different opcode
 */
export function applyMissenseMutation(genome: string, position?: number): MutationResult {
  const codons = parseGenome(genome);

  let targetPos = position;
  if (targetPos === undefined || targetPos >= codons.length) {
    const candidates = codons
      .map((c, i) => ({ codon: c as Codon, index: i }))
      .filter(({ codon }) => getMissenseCodons(codon).length > 0);

    if (candidates.length === 0) {
      throw new Error('No missense mutations available in this genome');
    }

    targetPos = candidates[Math.floor(Math.random() * candidates.length)].index;
  }

  const originalCodon = codons[targetPos] as Codon;
  const missense = getMissenseCodons(originalCodon);

  if (missense.length === 0) {
    throw new Error(`No missense codons for ${originalCodon} at position ${targetPos}`);
  }

  const newCodon = missense[Math.floor(Math.random() * missense.length)];
  codons[targetPos] = newCodon;

  return {
    original: genome,
    mutated: codons.join(' '),
    type: 'missense',
    position: targetPos,
    description: `Missense mutation: ${originalCodon} → ${newCodon} (${Opcode[CODON_MAP[originalCodon]]} → ${Opcode[CODON_MAP[newCodon]]})`
  };
}

/**
 * Apply nonsense mutation - introduce STOP codon
 */
export function applyNonsenseMutation(genome: string, position?: number): MutationResult {
  const codons = parseGenome(genome);

  let targetPos = position;
  if (targetPos === undefined || targetPos >= codons.length) {
    // Avoid mutating the START codon or existing STOP codons
    const candidates = codons
      .map((c, i) => ({ codon: c as Codon, index: i }))
      .filter(({ codon, index }) => codon !== 'ATG' && !STOP_CODONS.has(codon) && index > 0);

    if (candidates.length === 0) {
      throw new Error('No nonsense mutation positions available');
    }

    targetPos = candidates[Math.floor(Math.random() * candidates.length)].index;
  }

  const originalCodon = codons[targetPos] as Codon;
  const stopCodon = 'TAA'; // Use TAA as standard STOP

  codons[targetPos] = stopCodon;

  return {
    original: genome,
    mutated: codons.join(' '),
    type: 'nonsense',
    position: targetPos,
    description: `Nonsense mutation: ${originalCodon} → ${stopCodon} (early termination)`
  };
}

/**
 * Apply point mutation - random single base change
 */
export function applyPointMutation(genome: string, position?: number): MutationResult {
  const cleaned = genome.replace(/\s+/g, '').replace(/;.*/g, '');

  const targetPos = position ?? Math.floor(Math.random() * cleaned.length);
  if (targetPos >= cleaned.length) {
    throw new Error(`Position ${targetPos} out of range`);
  }

  const originalBase = cleaned[targetPos];
  const otherBases = BASES.filter(b => b !== originalBase);
  const newBase = otherBases[Math.floor(Math.random() * otherBases.length)];

  const mutated = cleaned.substring(0, targetPos) + newBase + cleaned.substring(targetPos + 1);

  // Format as codons
  const codons: string[] = [];
  for (let i = 0; i < mutated.length; i += 3) {
    codons.push(mutated.slice(i, i + 3));
  }

  return {
    original: genome,
    mutated: codons.join(' '),
    type: 'point',
    position: targetPos,
    description: `Point mutation at base ${targetPos}: ${originalBase} → ${newBase}`
  };
}

/**
 * Apply insertion - insert 1-3 random bases
 */
export function applyInsertion(genome: string, position?: number, length: number = 1): MutationResult {
  const cleaned = genome.replace(/\s+/g, '').replace(/;.*/g, '');

  const targetPos = position ?? Math.floor(Math.random() * cleaned.length);
  if (targetPos > cleaned.length) {
    throw new Error(`Position ${targetPos} out of range`);
  }

  // Generate random bases
  const insertion = Array.from({ length }, () =>
    BASES[Math.floor(Math.random() * BASES.length)]
  ).join('');

  const mutated = cleaned.substring(0, targetPos) + insertion + cleaned.substring(targetPos);

  // Format as codons
  const codons: string[] = [];
  for (let i = 0; i < mutated.length; i += 3) {
    codons.push(mutated.slice(i, i + 3));
  }

  return {
    original: genome,
    mutated: codons.join(' '),
    type: 'insertion',
    position: targetPos,
    description: `Insertion at base ${targetPos}: +${insertion} (${length} base${length > 1 ? 's' : ''})`
  };
}

/**
 * Apply deletion - remove 1-3 bases
 */
export function applyDeletion(genome: string, position?: number, length: number = 1): MutationResult {
  const cleaned = genome.replace(/\s+/g, '').replace(/;.*/g, '');

  const targetPos = position ?? Math.floor(Math.random() * Math.max(0, cleaned.length - length));
  if (targetPos + length > cleaned.length) {
    throw new Error(`Deletion at position ${targetPos} with length ${length} exceeds genome length`);
  }

  const deleted = cleaned.substring(targetPos, targetPos + length);
  const mutated = cleaned.substring(0, targetPos) + cleaned.substring(targetPos + length);

  // Format as codons
  const codons: string[] = [];
  for (let i = 0; i < mutated.length; i += 3) {
    codons.push(mutated.slice(i, i + 3));
  }

  return {
    original: genome,
    mutated: codons.join(' '),
    type: 'deletion',
    position: targetPos,
    description: `Deletion at base ${targetPos}: -${deleted} (${length} base${length > 1 ? 's' : ''})`
  };
}

/**
 * Apply frameshift mutation - insert or delete 1-2 bases
 */
export function applyFrameshiftMutation(genome: string, position?: number): MutationResult {
  const isInsertion = Math.random() < 0.5;
  const length = Math.floor(Math.random() * 2) + 1; // 1 or 2 bases

  if (isInsertion) {
    const result = applyInsertion(genome, position, length);
    result.type = 'frameshift';
    result.description = `Frameshift (insertion): ${result.description}`;
    return result;
  } else {
    const result = applyDeletion(genome, position, length);
    result.type = 'frameshift';
    result.description = `Frameshift (deletion): ${result.description}`;
    return result;
  }
}

/**
 * Utility: Compare two genomes and highlight differences
 */
export function compareGenomes(original: string, mutated: string): {
  originalCodons: string[];
  mutatedCodons: string[];
  differences: Array<{ position: number; original: string; mutated: string }>;
} {
  const originalCodons = parseGenome(original);
  const mutatedCodons = parseGenome(mutated);

  const maxLength = Math.max(originalCodons.length, mutatedCodons.length);
  const differences: Array<{ position: number; original: string; mutated: string }> = [];

  for (let i = 0; i < maxLength; i++) {
    const orig = originalCodons[i] || '';
    const mut = mutatedCodons[i] || '';

    if (orig !== mut) {
      differences.push({
        position: i,
        original: orig,
        mutated: mut
      });
    }
  }

  return { originalCodons, mutatedCodons, differences };
}
