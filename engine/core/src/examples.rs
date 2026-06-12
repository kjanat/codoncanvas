//! Built-in example genomes for the gallery and playground.
//!
//! Authored for the corrected, signed `TRANSLATE` (32 = no move, below 32 =
//! left/up, above 32 = right/down). Every example sets a color so it is
//! visible, and most use translation to lay shapes out across the canvas.
//! Generated genomes are kept on one line; the two hand-written demos keep
//! their comments for the editor.

use serde::Serialize;

/// A pedagogical example genome with display metadata.
#[derive(Debug, Clone, Serialize)]
pub struct Example {
    pub id: &'static str,
    pub title: &'static str,
    pub description: &'static str,
    pub genome: &'static str,
    pub difficulty: &'static str,
    pub concepts: &'static [&'static str],
    pub good_for_mutations: &'static [&'static str],
}

/// All built-in examples.
pub fn all() -> Vec<Example> {
    EXAMPLES.to_vec()
}

/// Looks up an example by id.
pub fn by_id(id: &str) -> Option<Example> {
    EXAMPLES.iter().find(|e| e.id == id).cloned()
}

static EXAMPLES: &[Example] = &[
    Example {
        id: "hello-circle",
        title: "Hello Circle",
        description: "The minimal program with color: start, set a hue, draw one circle, stop.",
        genome: "ATG GAA GAG GAA TCG GAA GAT TTA GAA ATT GGA TAA",
        difficulty: "beginner",
        concepts: &["drawing", "colors"],
        good_for_mutations: &["silent", "missense", "nonsense"],
    },
    Example {
        id: "rna-hello",
        title: "RNA Hello",
        description: "The same idea written in RNA notation (U instead of T) — the engine treats them as synonyms.",
        genome: "AUG GAA UCG GAA UAU GAA GCG UUA GAA AUC GGA UAA",
        difficulty: "beginner",
        concepts: &["drawing", "colors"],
        good_for_mutations: &["silent", "missense"],
    },
    Example {
        id: "color-trio",
        title: "Color Trio",
        description: "Three circles in a row — red, green, blue — positioned with the signed TRANSLATE.",
        genome: "ATG TCA GAA ATT GAA GAA ACA GAA AAA GAA TCG GAA GAT TTA GAA AGA GGA TCG TCA GAA GAA GAA GAA ACA GAA CCC GAA TAA GAA GAA TTA GAA AGA GGA TCG TCA GAA TAC GAA GAA ACA GAA GGA GAA TCG GAA GCC TTA GAA AGA GGA TCG TAA",
        difficulty: "beginner",
        concepts: &["drawing", "colors", "transforms"],
        good_for_mutations: &["missense", "frameshift"],
    },
    Example {
        id: "shape-sampler",
        title: "Shape Sampler",
        description: "Every drawing primitive at once: circle, rectangle, triangle, ellipse, line.",
        genome: "ATG TCA GAA ATA GAA GAA ACA GAA AAA GAA TAT GAA GAT TTA GAA ACT GGA TCG TCA GAA CCG GAA GAA ACA GAA AGC GAA TCG GAA GAT TTA GAA ATA GAA ATA CCA TCG TCA GAA GAA GAA GAA ACA GAA CCC GAA TAA GAA GAA TTA GAA ATC GCA TCG TCA GAA GGG GAA GAA ACA GAA GCA GAA TAT GAA GAT TTA GAA AGC GAA ACC GTA TCG TCA GAA TCA GAA GAA ACA GAA TCC GAA TAA GAA GCG TTA GAA CAA AAA TCG TAA",
        difficulty: "beginner",
        concepts: &["drawing", "colors"],
        good_for_mutations: &["missense"],
    },
    Example {
        id: "bullseye",
        title: "Bullseye",
        description: "Concentric circles drawn largest-first in alternating colors form crisp rings.",
        genome: "ATG GAA TTG GAA TCG GAA GAA TTA GAA CCG GGA GAA AGA GAA TCG GAA GCG TTA GAA CAG GGA GAA TTG GAA TCG GAA GAA TTA GAA ATG GGA GAA AGA GAA TCG GAA GCG TTA GAA AGG GGA GAA TTG GAA TCG GAA GAA TTA GAA ACG GGA GAA AGA GAA TCG GAA GCG TTA GAA AAG GGA TAA",
        difficulty: "beginner",
        concepts: &["drawing", "colors"],
        good_for_mutations: &["silent", "missense"],
    },
    Example {
        id: "starburst",
        title: "Starburst",
        description: "A line through the center, recolored and rotated each step, sweeps a rainbow burst.",
        genome: "ATG GAA AAA GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA ACC GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA AGT GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA CAA GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA CCC GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA CGT GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA GAA GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA GCC GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA GGT GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA TAA GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA TCC GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA GAA TGT GAA TCG GAA GCC TTA GAA CTG AGA GAA CGG AAA TAA",
        difficulty: "intermediate",
        concepts: &["transforms", "colors"],
        good_for_mutations: &["silent", "frameshift"],
    },
    Example {
        id: "color-ring",
        title: "Color Ring",
        description: "Twelve circles spaced evenly around a ring, each a step further around the color wheel.",
        genome: "ATG TCA GAA TCG GAA GAA ACA GAA AAA GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA TAT GAA GGT ACA GAA ACC GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA GGT GAA TAT ACA GAA AGT GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA GAA GAA TCG ACA GAA CAA GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA CCC GAA TAT ACA GAA CCC GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA ATC GAA GGT ACA GAA CGT GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA AGG GAA GAA ACA GAA GAA GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA ATC GAA CCC ACA GAA GCC GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA CCC GAA ATC ACA GAA GGT GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA GAA GAA AGG ACA GAA TAA GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA GGT GAA ATC ACA GAA TCC GAA TAT GAA GCC TTA GAA ACC GGA TCG TCA GAA TAT GAA CCC ACA GAA TGT GAA TAT GAA GCC TTA GAA ACC GGA TCG TAA",
        difficulty: "intermediate",
        concepts: &["transforms", "colors", "composition"],
        good_for_mutations: &["missense"],
    },
    Example {
        id: "mosaic",
        title: "Mosaic",
        description: "A 4x4 grid of rectangles tinted by position — a rainbow tile field.",
        genome: "ATG TCA GAA ATC GAA ATC ACA GAA AAA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA CGG GAA ATC ACA GAA ACA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA GCG GAA ATC ACA GAA AGA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA TAT GAA ATC ACA GAA ATA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA ATC GAA CGG ACA GAA CAA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA CGG GAA CGG ACA GAA CCA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA GCG GAA CGG ACA GAA CGA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA TAT GAA CGG ACA GAA CTA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA ATC GAA GCG ACA GAA GAA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA CGG GAA GCG ACA GAA GCA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA GCG GAA GCG ACA GAA GGA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA TAT GAA GCG ACA GAA GTA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA ATC GAA TAT ACA GAA TAA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA CGG GAA TAT ACA GAA TCA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA GCG GAA TAT ACA GAA TGA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TCA GAA TAT GAA TAT ACA GAA TTA GAA GTC GAA GAT TTA GAA AGG GAA AGG CCA TCG TAA",
        difficulty: "intermediate",
        concepts: &["transforms", "colors", "composition"],
        good_for_mutations: &["missense"],
    },
    Example {
        id: "phyllotaxis",
        title: "Phyllotaxis",
        description: "Florets placed by the golden angle (137.5 deg) — the spiral packing sunflowers use.",
        genome: "ATG TCA GAA GCA GAA GAA ACA GAA AAA GAA TCG GAA GCC TTA GAA ACT GGA TCG TCA GAA CTC GAA GAT ACA GAA AAC GAA TCG GAA GCC TTA GAA ACT GGA TCG TCA GAA GAA GAA CGT ACA GAA AAT GAA TCG GAA GCC TTA GAA ACT GGA TCG TCA GAA GCA GAA GCC ACA GAA ACA GAA TCG GAA GCC TTA GAA ACT GGA TCG TCA GAA CGG GAA CTT ACA GAA ACG GAA TCG GAA GCC TTA GAA ACT GGA TCG TCA GAA GCG GAA CTA ACA GAA ACT GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA CTG GAA GCT ACA GAA AGC GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA CTA GAA CGC ACA GAA AGG GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA GGA GAA GAT ACA GAA AGT GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA CCT GAA GCA ACA GAA ATC GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA GCA GAA CCT ACA GAA ATG GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA GAT GAA GGG ACA GAA CAA GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA CCG GAA CGG ACA GAA CAC GAA TCG GAA GCC TTA GAA ACG GGA TCG TCA GAA GTA GAA CTC ACA GAA CAG GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA CGC GAA GGG ACA GAA CCA GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA CTG GAA CAT ACA GAA CCC GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA GGT GAA GGC ACA GAA CCT GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA CAC GAA GAC ACA GAA CGA GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA GGT GAA CCC ACA GAA CGG GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA CTT GAA TAA ACA GAA CGT GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA CCC GAA CAT ACA GAA CTA GAA TCG GAA GCC TTA GAA ACC GGA TCG TCA GAA TAC GAA GAG ACA GAA CTG GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA CAC GAA GGG ACA GAA CTT GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA GCA GAA ATG ACA GAA GAC GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA GGG GAA TAC ACA GAA GAG GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA ATC GAA CGG ACA GAA GCA GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA TAT GAA CCT ACA GAA GCC GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA CGA GAA TAT ACA GAA GCG GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA CGC GAA ATA ACA GAA GGA GAA TCG GAA GCC TTA GAA ACA GGA TCG TCA GAA TCA GAA GGG ACA GAA GGC GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA AGG GAA GCG ACA GAA GGT GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA GTC GAA ATA ACA GAA GTA GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA GCA GAA TGA ACA GAA GTG GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA ATA GAA CAC ACA GAA GTT GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA TGG GAA CTG ACA GAA TAA GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA ATG GAA TAT ACA GAA TAG GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA GAA GAA ACC ACA GAA TAT GAA TCG GAA GCC TTA GAA AAT GGA TCG TCA GAA TAG GAA TCA ACA GAA TCC GAA TCG GAA GCC TTA GAA AAG GGA TCG TCA GAA ACA GAA CTC ACA GAA TCG GAA TCG GAA GCC TTA GAA AAG GGA TCG TCA GAA TCT GAA ATT ACA GAA TCT GAA TCG GAA GCC TTA GAA AAG GGA TCG TAA",
        difficulty: "advanced",
        concepts: &["transforms", "colors", "composition"],
        good_for_mutations: &["missense"],
    },
    Example {
        id: "negative-offset",
        title: "Negative Offset Demo",
        description: "Satellites around a center circle. The left and up ones are only reachable thanks to the signed-TRANSLATE fix; the old engine could move right and down only.",
        genome: "ATG\nGAA GGG GAA TTT GAA GAA TTA  ; blue color\nGAA AGG GGA                  ; center circle\nTCA\nGAA TCA GAA GAA ACA          ; translate right\nGAA ACG GGA\nTCG\nTCA\nGAA ATA GAA GAA ACA          ; translate LEFT (impossible before the fix)\nGAA ACG GGA\nTCG\nTCA\nGAA GAA GAA TCA ACA          ; translate down\nGAA ACG GGA\nTCG\nTCA\nGAA GAA GAA ATA ACA          ; translate UP (impossible before the fix)\nGAA ACG GGA\nTAA",
        difficulty: "intermediate",
        concepts: &["transforms", "state-management"],
        good_for_mutations: &["missense", "frameshift"],
    },
    Example {
        id: "loop-march",
        title: "Loop March",
        description: "LOOP replays the last N instructions. A circle is drawn, moved right and scaled down, repeated to march a shrinking row across the canvas.",
        genome: "ATG\nGAA TTT GAA TTT GAA GAA TTA  ; red color\nGAA AAC GAA GAA ACA          ; translate far left to start\nGAA AGA GGA                  ; push 8, circle      (body start)\nGAA GGA GAA GAA ACA          ; translate right\nGAA CGG CGA                  ; push 26, scale ~0.8 (body end)\nGAA ACT GAA ACG CAA          ; push 7 (count), push 6 (times), LOOP\nTAA",
        difficulty: "advanced",
        concepts: &["advanced-opcodes", "transforms"],
        good_for_mutations: &["missense"],
    },
];
