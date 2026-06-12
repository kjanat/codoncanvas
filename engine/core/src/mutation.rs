//! The mutation engine: biologically-flavored edits used across the playground,
//! mutation lab, and evolution demos.
//!
//! Each operation returns a [`MutationResult`] describing the change so the UI
//! can render a diff and explanation. Randomness is fully deterministic given a
//! seed (a [`Rng`]), which keeps the WASM boundary free of `getrandom` and
//! makes results reproducible and testable.

use serde::Serialize;

use crate::base::DNA_LETTERS;
use crate::codon::{is_stop, missense_codons, opcode_for, synonymous_codons};
use crate::genome::{clean, format_as_codons, parse};

/// A small, fast, deterministic PRNG (SplitMix64). Not cryptographic; it exists
/// to make "pick a random codon" reproducible from a seed.
pub struct Rng {
    state: u64,
}

impl Rng {
    pub fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    fn next_u64(&mut self) -> u64 {
        self.state = self.state.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.state;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }

    /// Uniform integer in `0..n` (returns 0 when `n == 0`).
    pub fn below(&mut self, n: usize) -> usize {
        if n == 0 {
            0
        } else {
            (self.next_u64() % n as u64) as usize
        }
    }

    /// Returns `true` with probability 1/2.
    pub fn coin(&mut self) -> bool {
        self.next_u64() & 1 == 0
    }

    fn choice<'a, T>(&mut self, items: &'a [T]) -> Option<&'a T> {
        if items.is_empty() {
            None
        } else {
            Some(&items[self.below(items.len())])
        }
    }
}

/// The kind of mutation applied.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum MutationType {
    Silent,
    Missense,
    Nonsense,
    Point,
    Insertion,
    Deletion,
    Frameshift,
}

impl MutationType {
    /// Parses a lowercase type name (`"silent"`, `"frameshift"`, ...).
    pub fn from_name(s: &str) -> Option<Self> {
        Some(match s {
            "silent" => Self::Silent,
            "missense" => Self::Missense,
            "nonsense" => Self::Nonsense,
            "point" => Self::Point,
            "insertion" => Self::Insertion,
            "deletion" => Self::Deletion,
            "frameshift" => Self::Frameshift,
            _ => return None,
        })
    }
}

/// The outcome of a mutation, suitable for a diff viewer.
#[derive(Debug, Clone, Serialize)]
pub struct MutationResult {
    pub original: String,
    pub mutated: String,
    #[serde(rename = "type")]
    pub mutation_type: MutationType,
    /// Codon index for codon-level mutations, base index for base-level ones.
    pub position: usize,
    pub description: String,
}

fn opcode_name(codon: &str) -> &'static str {
    opcode_for(codon).map_or("UNKNOWN", crate::opcode::Opcode::name)
}

/// Silent mutation: replace a codon with a synonymous one (same opcode).
pub fn silent(
    genome: &str,
    position: Option<usize>,
    rng: &mut Rng,
) -> Result<MutationResult, String> {
    let mut codons = parse(genome);
    let pos = match position {
        Some(p) if p < codons.len() => p,
        _ => {
            let candidates: Vec<usize> = (0..codons.len())
                .filter(|&i| !synonymous_codons(&codons[i]).is_empty())
                .collect();
            *rng.choice(&candidates)
                .ok_or("No synonymous mutations available in this genome")?
        }
    };

    let original = codons[pos].clone();
    let syns = synonymous_codons(&original);
    let new = rng
        .choice(&syns)
        .ok_or_else(|| format!("No synonymous codons for {original} at position {pos}"))?
        .clone();
    let description = format!(
        "Silent mutation: {original} → {new} (same opcode: {})",
        opcode_name(&original)
    );
    codons[pos] = new;

    Ok(MutationResult {
        original: genome.to_string(),
        mutated: codons.join(" "),
        mutation_type: MutationType::Silent,
        position: pos,
        description,
    })
}

/// Missense mutation: replace a codon with one of a different (non-STOP) opcode.
pub fn missense(
    genome: &str,
    position: Option<usize>,
    rng: &mut Rng,
) -> Result<MutationResult, String> {
    let mut codons = parse(genome);
    let pos = match position {
        Some(p) if p < codons.len() => p,
        _ => {
            let candidates: Vec<usize> = (0..codons.len())
                .filter(|&i| !missense_codons(&codons[i]).is_empty())
                .collect();
            *rng.choice(&candidates)
                .ok_or("No missense mutations available in this genome")?
        }
    };

    let original = codons[pos].clone();
    let opts = missense_codons(&original);
    let new = rng
        .choice(&opts)
        .ok_or_else(|| format!("No missense codons for {original} at position {pos}"))?
        .clone();
    let description = format!(
        "Missense mutation: {original} → {new} ({} → {})",
        opcode_name(&original),
        opcode_name(&new)
    );
    codons[pos] = new;

    Ok(MutationResult {
        original: genome.to_string(),
        mutated: codons.join(" "),
        mutation_type: MutationType::Missense,
        position: pos,
        description,
    })
}

/// Nonsense mutation: replace a codon with a STOP (`TAA`), truncating execution.
pub fn nonsense(
    genome: &str,
    position: Option<usize>,
    rng: &mut Rng,
) -> Result<MutationResult, String> {
    let mut codons = parse(genome);
    let pos = match position {
        Some(p) if p < codons.len() => p,
        _ => {
            let candidates: Vec<usize> = (0..codons.len())
                .filter(|&i| i > 0 && codons[i] != "ATG" && !is_stop(&codons[i]))
                .collect();
            *rng.choice(&candidates)
                .ok_or("No nonsense mutation positions available")?
        }
    };

    let original = codons[pos].clone();
    codons[pos] = "TAA".to_string();

    Ok(MutationResult {
        original: genome.to_string(),
        mutated: codons.join(" "),
        mutation_type: MutationType::Nonsense,
        position: pos,
        description: format!("Nonsense mutation: {original} → TAA (early termination)"),
    })
}

/// Point mutation: change a single base, which may turn out silent, missense or
/// nonsense depending on position.
pub fn point(
    genome: &str,
    position: Option<usize>,
    rng: &mut Rng,
) -> Result<MutationResult, String> {
    let cleaned = clean(genome);
    if cleaned.is_empty() {
        return Err("Cannot mutate an empty genome".into());
    }
    let pos = position.unwrap_or_else(|| rng.below(cleaned.len()));
    if pos >= cleaned.len() {
        return Err(format!("Position {pos} out of range"));
    }

    let original = cleaned.as_bytes()[pos] as char;
    let others: Vec<char> = DNA_LETTERS.into_iter().filter(|&b| b != original).collect();
    let new = *rng
        .choice(&others)
        .expect("three alternatives always exist");

    let mut mutated = cleaned.clone();
    mutated.replace_range(pos..pos + 1, &new.to_string());

    Ok(MutationResult {
        original: genome.to_string(),
        mutated: format_as_codons(&mutated),
        mutation_type: MutationType::Point,
        position: pos,
        description: format!("Point mutation at base {pos}: {original} → {new}"),
    })
}

/// Insertion: insert `length` random bases. A length not divisible by three
/// causes a frameshift.
pub fn insertion(
    genome: &str,
    position: Option<usize>,
    length: usize,
    rng: &mut Rng,
) -> Result<MutationResult, String> {
    let cleaned = clean(genome);
    let pos = position.unwrap_or_else(|| rng.below(cleaned.len().max(1)));
    if pos > cleaned.len() {
        return Err(format!("Position {pos} out of range"));
    }

    let ins: String = (0..length)
        .map(|_| DNA_LETTERS[rng.below(DNA_LETTERS.len())])
        .collect();
    let mut mutated = String::with_capacity(cleaned.len() + length);
    mutated.push_str(&cleaned[..pos]);
    mutated.push_str(&ins);
    mutated.push_str(&cleaned[pos..]);

    Ok(MutationResult {
        original: genome.to_string(),
        mutated: format_as_codons(&mutated),
        mutation_type: MutationType::Insertion,
        position: pos,
        description: format!(
            "Insertion at base {pos}: +{ins} ({length} base{})",
            if length > 1 { "s" } else { "" }
        ),
    })
}

/// Deletion: remove `length` bases. A length not divisible by three causes a
/// frameshift.
pub fn deletion(
    genome: &str,
    position: Option<usize>,
    length: usize,
    rng: &mut Rng,
) -> Result<MutationResult, String> {
    let cleaned = clean(genome);
    let pos = position.unwrap_or_else(|| rng.below(cleaned.len().saturating_sub(length).max(1)));
    if pos + length > cleaned.len() {
        return Err(format!(
            "Deletion at position {pos} with length {length} exceeds genome length"
        ));
    }

    let deleted = cleaned[pos..pos + length].to_string();
    let mut mutated = String::with_capacity(cleaned.len() - length);
    mutated.push_str(&cleaned[..pos]);
    mutated.push_str(&cleaned[pos + length..]);

    Ok(MutationResult {
        original: genome.to_string(),
        mutated: format_as_codons(&mutated),
        mutation_type: MutationType::Deletion,
        position: pos,
        description: format!(
            "Deletion at base {pos}: -{deleted} ({length} base{})",
            if length > 1 { "s" } else { "" }
        ),
    })
}

/// Frameshift: insert or delete 1–2 bases, guaranteed to disrupt the reading
/// frame and scramble everything downstream.
pub fn frameshift(
    genome: &str,
    position: Option<usize>,
    rng: &mut Rng,
) -> Result<MutationResult, String> {
    let length = 1 + rng.below(2); // 1 or 2
    let insert = rng.coin();
    let mut result = if insert {
        insertion(genome, position, length, rng)?
    } else {
        deletion(genome, position, length, rng)?
    };
    let kind = if insert { "insertion" } else { "deletion" };
    result.description = format!("Frameshift ({kind}): {}", result.description);
    result.mutation_type = MutationType::Frameshift;
    Ok(result)
}

/// Dispatches by mutation type, using a freshly seeded [`Rng`].
pub fn apply(kind: MutationType, genome: &str, seed: u64) -> Result<MutationResult, String> {
    let rng = &mut Rng::new(seed);
    match kind {
        MutationType::Silent => silent(genome, None, rng),
        MutationType::Missense => missense(genome, None, rng),
        MutationType::Nonsense => nonsense(genome, None, rng),
        MutationType::Point => point(genome, None, rng),
        MutationType::Insertion => insertion(genome, None, 1, rng),
        MutationType::Deletion => deletion(genome, None, 1, rng),
        MutationType::Frameshift => frameshift(genome, None, rng),
    }
}

/// Generates `count` candidate mutants from a genome for directed-evolution
/// style selection. Cycles through mutation kinds so the batch shows variety,
/// derives a distinct sub-seed per candidate, and falls back to a point
/// mutation when a chosen kind is impossible for this genome.
pub fn batch(genome: &str, seed: u64, count: usize) -> Vec<MutationResult> {
    const KINDS: [MutationType; 5] = [
        MutationType::Point,
        MutationType::Silent,
        MutationType::Missense,
        MutationType::Insertion,
        MutationType::Deletion,
    ];
    (0..count)
        .filter_map(|i| {
            let sub = seed ^ (i as u64).wrapping_mul(0x9E37_79B9_7F4A_7C15);
            apply(KINDS[i % KINDS.len()], genome, sub)
                .or_else(|_| apply(MutationType::Point, genome, sub.wrapping_add(1)))
                .ok()
        })
        .collect()
}

/// A codon-level difference between two genomes.
#[derive(Debug, Clone, Serialize)]
pub struct CodonDiff {
    pub position: usize,
    pub original: String,
    pub mutated: String,
}

/// Aligns two genomes codon-by-codon and reports the positions that differ.
pub fn compare(original: &str, mutated: &str) -> Vec<CodonDiff> {
    let a = parse(original);
    let b = parse(mutated);
    let max = a.len().max(b.len());
    (0..max)
        .filter_map(|i| {
            let oa = a.get(i).cloned().unwrap_or_default();
            let ob = b.get(i).cloned().unwrap_or_default();
            (oa != ob).then_some(CodonDiff {
                position: i,
                original: oa,
                mutated: ob,
            })
        })
        .collect()
}
