import { Base, Codon, CodonToken, ParseError } from './types.js';

export interface Lexer {
  tokenize(source: string): CodonToken[];
  validateFrame(source: string): ParseError[];
  validateStructure(tokens: CodonToken[]): ParseError[];
}

export class CodonLexer implements Lexer {
  private readonly validBases = new Set<string>(['A', 'C', 'G', 'T']);

  /**
   * Tokenize source genome into codons
   */
  tokenize(source: string): CodonToken[] {
    // Track line numbers for error reporting
    const lines = source.split('\n');
    let cleanedSource = '';
    const positionMap: Array<{ line: number; column: number }> = [];

    // Strip comments and track positions
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const commentIdx = line.indexOf(';');
      const codeLine = commentIdx >= 0 ? line.slice(0, commentIdx) : line;

      for (let charIdx = 0; charIdx < codeLine.length; charIdx++) {
        const char = codeLine[charIdx];
        if (this.validBases.has(char)) {
          cleanedSource += char;
          positionMap.push({ line: lineIdx + 1, column: charIdx });
        } else if (char.trim() !== '') {
          throw new Error(`Invalid character '${char}' at line ${lineIdx + 1}, column ${charIdx}`);
        }
      }
    }

    // Check for non-triplet length
    if (cleanedSource.length % 3 !== 0) {
      throw new Error(`Source length ${cleanedSource.length} is not divisible by 3. Missing ${3 - (cleanedSource.length % 3)} bases for complete codon.`);
    }

    // Chunk into triplets
    const tokens: CodonToken[] = [];
    for (let i = 0; i < cleanedSource.length; i += 3) {
      const codonText = cleanedSource.slice(i, i + 3);
      tokens.push({
        text: codonText as Codon,
        position: i,
        line: positionMap[i]?.line || 1
      });
    }

    return tokens;
  }

  /**
   * Validate reading frame alignment
   */
  validateFrame(source: string): ParseError[] {
    const errors: ParseError[] = [];
    const lines = source.split('\n');

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const commentIdx = line.indexOf(';');
      const codeLine = commentIdx >= 0 ? line.slice(0, commentIdx) : line;

      // Check for mid-triplet whitespace breaks
      let baseCount = 0;
      for (let charIdx = 0; charIdx < codeLine.length; charIdx++) {
        const char = codeLine[charIdx];
        if (this.validBases.has(char)) {
          baseCount++;
        } else if (char.trim() === '') {
          // Whitespace detected
          if (baseCount % 3 !== 0) {
            errors.push({
              message: `Mid-triplet break detected at line ${lineIdx + 1}. ${baseCount % 3} base(s) before whitespace.`,
              position: charIdx,
              severity: 'warning',
              fix: 'Remove whitespace or complete the codon'
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Check for structural issues (START/STOP placement)
   */
  validateStructure(tokens: CodonToken[]): ParseError[] {
    const errors: ParseError[] = [];

    if (tokens.length === 0) {
      return errors;
    }

    // Check for START codon
    if (tokens[0].text !== 'ATG') {
      errors.push({
        message: 'Program should begin with START codon (ATG)',
        position: 0,
        severity: 'error',
        fix: 'Add ATG at the beginning'
      });
    }

    // Check for STOP codons
    const stopCodons = new Set(['TAA', 'TAG', 'TGA']);
    let firstStopIdx = -1;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (stopCodons.has(token.text)) {
        if (firstStopIdx === -1) {
          firstStopIdx = i;
        }
      } else if (firstStopIdx >= 0 && token.text === 'ATG') {
        // START after STOP
        errors.push({
          message: `START codon after STOP at position ${i}`,
          position: token.position,
          severity: 'warning',
          fix: 'Remove unreachable code after STOP'
        });
      }
    }

    // Check if program ends with STOP
    if (tokens.length > 0 && !stopCodons.has(tokens[tokens.length - 1].text)) {
      errors.push({
        message: 'Program should end with STOP codon (TAA, TAG, or TGA)',
        position: tokens[tokens.length - 1].position,
        severity: 'warning',
        fix: 'Add TAA at the end'
      });
    }

    return errors;
  }
}
