//! Genome string manipulation: stripping comments/whitespace and chunking
//! into codons.
//!
//! Comments (`;` to end of line) are stripped per line, then all whitespace is
//! removed. This unifies the behavior the original spread across `cleanGenome`
//! and `parseGenome` and avoids the latent truncation the former had (removing
//! whitespace first merged lines, so a single `;` erased everything after it).

use crate::base::normalize_base;

/// Strips comments and whitespace and normalizes to uppercase DNA, returning a
/// continuous base string.
pub fn clean(genome: &str) -> String {
    let mut out = String::new();
    for line in genome.split('\n') {
        let code = match line.find(';') {
            Some(i) => &line[..i],
            None => line,
        };
        for ch in code.chars() {
            if !ch.is_whitespace() {
                out.push(normalize_base(ch.to_ascii_uppercase()));
            }
        }
    }
    out
}

/// Splits a genome into its codons (groups of three bases), dropping a trailing
/// incomplete group's remainder into a short final codon, matching the original.
pub fn parse(genome: &str) -> Vec<String> {
    let cleaned = clean(genome);
    chunk(&cleaned)
}

/// Formats a continuous base string as space-separated codons.
pub fn format_as_codons(bases: &str) -> String {
    chunk(bases).join(" ")
}

fn chunk(bases: &str) -> Vec<String> {
    let bytes = bases.as_bytes();
    let mut codons = Vec::with_capacity(bytes.len().div_ceil(3));
    let mut i = 0;
    while i < bytes.len() {
        let end = (i + 3).min(bytes.len());
        codons.push(bases[i..end].to_string());
        i += 3;
    }
    codons
}
