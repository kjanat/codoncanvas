//! Nucleotide bases, codons, and base-4 numeric decoding.
//!
//! CodonCanvas accepts both DNA (`T`) and RNA (`U`) notation; `U` is normalized
//! to `T` everywhere before lookup, so the two notations are interchangeable.

/// Returns `true` for a valid base letter in either notation: `A`, `C`, `G`, `T`, `U`.
pub fn is_base(c: char) -> bool {
    matches!(c, 'A' | 'C' | 'G' | 'T' | 'U')
}

/// Normalizes a single base to DNA notation (`U` -> `T`); other characters pass through.
pub fn normalize_base(c: char) -> char {
    if c == 'U' { 'T' } else { c }
}

/// Normalizes an entire sequence to uppercase DNA notation (`U` -> `T`).
///
/// Non-base characters are preserved so callers can normalize before stripping.
pub fn normalize(seq: &str) -> String {
    seq.chars()
        .map(|c| normalize_base(c.to_ascii_uppercase()))
        .collect()
}

/// Base-4 digit value of a DNA base: `A = 0`, `C = 1`, `G = 2`, `T = 3`.
///
/// Returns `None` for non-DNA characters (after normalization `U` is `T`).
pub fn base_index(c: char) -> Option<u8> {
    match normalize_base(c.to_ascii_uppercase()) {
        'A' => Some(0),
        'C' => Some(1),
        'G' => Some(2),
        'T' => Some(3),
        _ => None,
    }
}

/// Decodes a three-base codon into its base-4 numeric literal in `0..=63`.
///
/// `value = d1 * 16 + d2 * 4 + d3`, mirroring the original
/// `decodeNumericLiteral`. Unknown bases contribute `0`, matching the
/// TypeScript `?? 0` fallback.
pub fn decode_literal(codon: &str) -> u8 {
    let mut chars = codon.chars();
    let d1 = chars.next().and_then(base_index).unwrap_or(0);
    let d2 = chars.next().and_then(base_index).unwrap_or(0);
    let d3 = chars.next().and_then(base_index).unwrap_or(0);
    d1 * 16 + d2 * 4 + d3
}

/// The four DNA base letters in base-4 order.
pub const DNA_LETTERS: [char; 4] = ['A', 'C', 'G', 'T'];

/// All 64 DNA codons in canonical order (`AAA`, `AAC`, ... `TTT`).
pub fn all_codons() -> Vec<String> {
    let mut out = Vec::with_capacity(64);
    for a in DNA_LETTERS {
        for b in DNA_LETTERS {
            for c in DNA_LETTERS {
                out.push([a, b, c].iter().collect());
            }
        }
    }
    out
}

/// Converts a DNA codon to RNA notation (`T` -> `U`) for display.
pub fn to_rna(codon: &str) -> String {
    codon.chars().map(|c| if c == 'T' { 'U' } else { c }).collect()
}
