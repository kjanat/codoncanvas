//! # CodonCanvas core
//!
//! A pure-Rust implementation of the CodonCanvas DNA-inspired visual
//! programming language: lexer, codon map, stack VM, and mutation tools. It has
//! no I/O or platform dependencies and compiles to native (for tests) and to
//! `wasm32-unknown-unknown` (via the `codoncanvas-wasm` crate).
//!
//! The VM emits renderer-agnostic [`vm::DrawCommand`]s rather than drawing
//! directly, and `TRANSLATE` now supports negative offsets — see [`vm`].

pub mod base;
pub mod codon;
pub mod examples;
pub mod genome;
pub mod lexer;
pub mod mutation;
pub mod opcode;
pub mod vm;

pub use codon::{amino_acid, is_stop, opcode_for};
pub use lexer::{Diagnostic, Severity, Token, tokenize, validate_frame, validate_structure};
pub use mutation::{MutationResult, MutationType, Rng};
pub use opcode::Opcode;
pub use vm::{DrawCommand, Hsl, RunResult, Shape, Step, Transform, Vm, run_genome};

/// Full reference data for one codon: its opcode and real amino acid.
#[derive(Debug, Clone, serde::Serialize)]
pub struct CodonInfo {
    pub dna: String,
    pub rna: String,
    pub opcode: Option<&'static str>,
    pub amino_acid: &'static str,
    pub literal_value: u8,
    pub is_start: bool,
    pub is_stop: bool,
}

/// Builds the reference-chart entry for a codon (DNA or RNA notation accepted).
pub fn codon_info(codon: &str) -> CodonInfo {
    let dna = base::normalize(&codon.to_uppercase());
    let op = opcode_for(&dna);
    CodonInfo {
        rna: base::to_rna(&dna),
        opcode: op.map(Opcode::name),
        amino_acid: amino_acid(&dna),
        literal_value: base::decode_literal(&dna),
        is_start: dna == "ATG",
        is_stop: is_stop(&dna),
        dna,
    }
}

/// The full 64-codon reference chart, in canonical order.
pub fn codon_chart() -> Vec<CodonInfo> {
    base::all_codons().iter().map(|c| codon_info(c)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn codon_map_covers_all_64() {
        for c in base::all_codons() {
            assert!(opcode_for(&c).is_some(), "codon {c} has no opcode");
        }
    }

    #[test]
    fn families_and_specials_match_reference() {
        assert_eq!(opcode_for("ATG"), Some(Opcode::Start));
        assert_eq!(opcode_for("TAA"), Some(Opcode::Stop));
        assert_eq!(opcode_for("GGA"), Some(Opcode::Circle));
        assert_eq!(opcode_for("GGT"), Some(Opcode::Circle)); // wobble
        assert_eq!(opcode_for("CAA"), Some(Opcode::Loop));
        assert_eq!(opcode_for("CTG"), Some(Opcode::Add));
        // RNA notation resolves identically.
        assert_eq!(opcode_for("AUG"), Some(Opcode::Start));
        assert_eq!(opcode_for("UAA"), Some(Opcode::Stop));
    }

    #[test]
    fn decodes_base4_literals() {
        assert_eq!(base::decode_literal("AAA"), 0);
        assert_eq!(base::decode_literal("CCC"), 21);
        assert_eq!(base::decode_literal("TTT"), 63);
        assert_eq!(base::decode_literal("AAU"), 3); // RNA == AAT
    }

    #[test]
    fn rna_and_dna_tokenize_identically() {
        let dna = tokenize("ATG GAA CGA GGA TAA").unwrap();
        let rna = tokenize("AUG GAA CGA GGA UAA").unwrap();
        let texts: Vec<_> = dna.iter().map(|t| &t.text).collect();
        let rtexts: Vec<_> = rna.iter().map(|t| &t.text).collect();
        assert_eq!(texts, rtexts);
    }

    #[test]
    fn non_triplet_length_is_an_error() {
        assert!(tokenize("ATGG").is_err());
    }

    #[test]
    fn negative_offset_moves_left_and_up() {
        // value 0 -> -0.5*width, value 32 -> 0, value 63 -> +0.484*width.
        // Translate left: push dx=0, dy=32.
        let res = run_genome("ATG GAA AAA GAA GAA ACA GAA CGA GGA TAA", 600.0, 600.0);
        assert!(res.ok, "error: {:?}", res.error);
        let cmd = res.commands.first().expect("a circle was drawn");
        // Started at center x=300; a negative dx must have moved it left.
        assert!(
            cmd.transform.x < 300.0,
            "expected leftward move, got x={}",
            cmd.transform.x
        );

        // Translate right: push dx=63, dy=32.
        let res = run_genome("ATG GAA TTT GAA GAA ACA GAA CGA GGA TAA", 600.0, 600.0);
        let cmd = res.commands.first().unwrap();
        assert!(
            cmd.transform.x > 300.0,
            "expected rightward move, got x={}",
            cmd.transform.x
        );

        // Translate by midpoint 32 leaves position unchanged.
        let res = run_genome("ATG GAA GAA GAA GAA ACA GAA CGA GGA TAA", 600.0, 600.0);
        let cmd = res.commands.first().unwrap();
        assert!(
            (cmd.transform.x - 300.0).abs() < 1e-9,
            "midpoint should not move"
        );
    }

    #[test]
    fn shape_sizes_stay_unsigned() {
        // A radius literal of 0 yields radius 0, never negative.
        let res = run_genome("ATG GAA AAA GGA TAA", 600.0, 600.0);
        assert!(res.ok);
        if let Shape::Circle { radius } = res.commands[0].shape {
            assert!(radius >= 0.0);
        } else {
            panic!("expected a circle");
        }
    }

    #[test]
    fn stack_underflow_reports_error() {
        let res = run_genome("ATG GGA TAA", 600.0, 600.0); // CIRCLE with empty stack
        assert!(!res.ok);
        assert!(res.error.unwrap().contains("underflow"));
    }

    #[test]
    fn arithmetic_and_div_by_zero() {
        let res = run_genome("ATG GAA ATA GAA ATA CTG GGA TAA", 600.0, 600.0); // 12+12=24
        assert!(res.ok, "{:?}", res.error);
        let res = run_genome("ATG GAA AGG GAA AAA CAT GGA TAA", 600.0, 600.0); // 10 / 0
        assert!(!res.ok);
        assert!(res.error.unwrap().contains("Division by zero"));
    }

    #[test]
    fn all_examples_run_without_error() {
        for ex in examples::all() {
            let res = run_genome(ex.genome, 600.0, 600.0);
            assert!(res.ok, "example '{}' failed: {:?}", ex.id, res.error);
            assert!(!res.commands.is_empty(), "example '{}' drew nothing", ex.id);
        }
    }

    #[test]
    fn loop_replays_body() {
        // loop-march should draw 1 + 6 = 7 circles.
        let ex = examples::by_id("loop-march").unwrap();
        let res = run_genome(ex.genome, 600.0, 600.0);
        assert!(res.ok, "{:?}", res.error);
        let circles = res
            .commands
            .iter()
            .filter(|c| matches!(c.shape, Shape::Circle { .. }))
            .count();
        assert_eq!(circles, 7, "expected 7 circles from the loop");
    }

    #[test]
    fn silent_mutation_keeps_opcode() {
        let mut rng = Rng::new(1);
        let res = mutation::silent("ATG GGA TAA", None, &mut rng).unwrap();
        let diffs = mutation::compare(&res.original, &res.mutated);
        assert_eq!(diffs.len(), 1);
        let d = &diffs[0];
        assert_eq!(opcode_for(&d.original), opcode_for(&d.mutated));
    }

    #[test]
    fn nonsense_mutation_inserts_stop() {
        let mut rng = Rng::new(7);
        let res = mutation::nonsense("ATG GGA CCA TAA", None, &mut rng).unwrap();
        assert!(res.mutated.contains("TAA"));
        assert_eq!(res.mutation_type, MutationType::Nonsense);
    }

    #[test]
    fn mutation_is_deterministic_for_a_seed() {
        let a = mutation::apply(MutationType::Missense, "ATG GGA CCA GGA TAA", 42).unwrap();
        let b = mutation::apply(MutationType::Missense, "ATG GGA CCA GGA TAA", 42).unwrap();
        assert_eq!(a.mutated, b.mutated);
    }
}
