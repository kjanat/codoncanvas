//! The codon-to-opcode mapping and the standard genetic code.
//!
//! The opcode map is built from two layers, exactly as in the original
//! TypeScript: ten four-fold-degenerate families keyed by a two-base prefix
//! (the wobble position is irrelevant), overlaid with the special codons that
//! break that symmetry (control flow, partial degeneracy, arithmetic).

use crate::base::normalize;
use crate::opcode::Opcode;

/// Resolves a codon to its opcode, accepting DNA or RNA notation.
///
/// Special codons take precedence over the four-fold families, matching
/// `buildCodonMap` where `SPECIAL_CODONS` overwrites family assignments.
pub fn opcode_for(codon: &str) -> Option<Opcode> {
    let codon = normalize(codon);

    // Special codons (override family assignments).
    match codon.as_str() {
        "ATG" => return Some(Opcode::Start),
        "TAA" | "TAG" | "TGA" => return Some(Opcode::Stop),
        "ATA" | "ATC" | "ATT" => return Some(Opcode::Dup),
        "CAC" => return Some(Opcode::Nop),
        "TAC" | "TAT" | "TGC" => return Some(Opcode::Pop),
        "TGG" | "TGT" => return Some(Opcode::Swap),
        "TCA" | "TCC" => return Some(Opcode::SaveState),
        "TCG" | "TCT" => return Some(Opcode::RestoreState),
        "CTG" => return Some(Opcode::Add),
        "CAG" => return Some(Opcode::Sub),
        "CTT" => return Some(Opcode::Mul),
        "CAT" => return Some(Opcode::Div),
        "CTA" => return Some(Opcode::Eq),
        "CTC" => return Some(Opcode::Lt),
        "CAA" => return Some(Opcode::Loop),
        _ => {}
    }

    // Four-fold degenerate families keyed by the first two bases.
    let prefix = codon.get(0..2)?;
    let op = match prefix {
        "GG" => Opcode::Circle,
        "CC" => Opcode::Rect,
        "AA" => Opcode::Line,
        "GC" => Opcode::Triangle,
        "GT" => Opcode::Ellipse,
        "AC" => Opcode::Translate,
        "AG" => Opcode::Rotate,
        "CG" => Opcode::Scale,
        "TT" => Opcode::Color,
        "GA" => Opcode::Push,
        _ => return None,
    };
    Some(op)
}

/// Returns `true` if the codon is a STOP codon (`TAA`, `TAG`, `TGA` / `UAA`...).
pub fn is_stop(codon: &str) -> bool {
    matches!(opcode_for(codon), Some(Opcode::Stop))
}

/// Standard genetic code: the real amino acid encoded by a codon.
///
/// Used purely for the educational reference chart, alongside the CodonCanvas
/// opcode. Returns the three-letter code (`"Gly"`, `"STOP"`, ...).
pub fn amino_acid(codon: &str) -> &'static str {
    match normalize(codon).as_str() {
        "TTT" | "TTC" => "Phe",
        "TTA" | "TTG" | "CTT" | "CTC" | "CTA" | "CTG" => "Leu",
        "ATT" | "ATC" | "ATA" => "Ile",
        "ATG" => "Met",
        "GTT" | "GTC" | "GTA" | "GTG" => "Val",
        "TCT" | "TCC" | "TCA" | "TCG" | "AGT" | "AGC" => "Ser",
        "CCT" | "CCC" | "CCA" | "CCG" => "Pro",
        "ACT" | "ACC" | "ACA" | "ACG" => "Thr",
        "GCT" | "GCC" | "GCA" | "GCG" => "Ala",
        "TAT" | "TAC" => "Tyr",
        "TAA" | "TAG" | "TGA" => "STOP",
        "CAT" | "CAC" => "His",
        "CAA" | "CAG" => "Gln",
        "AAT" | "AAC" => "Asn",
        "AAA" | "AAG" => "Lys",
        "GAT" | "GAC" => "Asp",
        "GAA" | "GAG" => "Glu",
        "TGT" | "TGC" => "Cys",
        "TGG" => "Trp",
        "CGT" | "CGC" | "CGA" | "CGG" | "AGA" | "AGG" => "Arg",
        "GGT" | "GGC" | "GGA" | "GGG" => "Gly",
        _ => "?",
    }
}

/// Returns all codons that share the given codon's opcode, excluding the codon
/// itself: the synonymous (silent) substitutions.
pub fn synonymous_codons(codon: &str) -> Vec<String> {
    let Some(op) = opcode_for(codon) else {
        return Vec::new();
    };
    let codon = normalize(codon);
    crate::base::all_codons()
        .into_iter()
        .filter(|c| *c != codon && opcode_for(c) == Some(op))
        .collect()
}

/// Returns all codons whose opcode differs from the given codon's and is not
/// STOP: the candidate missense substitutions.
pub fn missense_codons(codon: &str) -> Vec<String> {
    let Some(op) = opcode_for(codon) else {
        return Vec::new();
    };
    let codon = normalize(codon);
    crate::base::all_codons()
        .into_iter()
        .filter(|c| {
            *c != codon
                && opcode_for(c) != Some(op)
                && opcode_for(c) != Some(Opcode::Stop)
        })
        .collect()
}
