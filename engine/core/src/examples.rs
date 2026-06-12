//! Built-in example genomes for the gallery and playground.
//!
//! These are authored for the corrected, *signed* `TRANSLATE` (32 = no move,
//! below 32 = left/up, above 32 = right/down), so they exercise the
//! negative-offset fix directly.

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
        description: "The minimal program: start, push a radius, draw one circle, stop.",
        genome: "ATG GAA CGA GGA TAA",
        difficulty: "beginner",
        concepts: &["drawing"],
        good_for_mutations: &["silent", "missense", "nonsense"],
    },
    Example {
        id: "rna-hello",
        title: "RNA Hello",
        description: "The same circle written in RNA notation (U instead of T).",
        genome: "AUG GAA CGA GGA UAA",
        difficulty: "beginner",
        concepts: &["drawing"],
        good_for_mutations: &["silent", "missense"],
    },
    Example {
        id: "color-circle",
        title: "Colored Circle",
        description: "Set an HSL color, then draw. COLOR pops lightness, saturation, hue.",
        genome: "ATG\n  GAA GGG GAA TTT GAA GAA TTA   ; color hue=236 sat=98% light=50%\n  GAA CCA GGA                   ; push 20, circle\nTAA",
        difficulty: "beginner",
        concepts: &["drawing", "colors"],
        good_for_mutations: &["silent", "missense"],
    },
    Example {
        id: "negative-offset",
        title: "Negative Offset Demo",
        description: "Four satellites around a center circle. Two of them (left and up) are only \
             reachable thanks to the signed-TRANSLATE fix; the old engine could move \
             right and down only.",
        genome: "ATG\n\
            GAA GGG GAA TTT GAA GAA TTA  ; blue color\n\
            GAA AGG GGA                  ; center circle (r=10)\n\
            TCA                          ; save center\n\
            GAA TCA GAA GAA ACA          ; translate right (dx=52, dy=32)\n\
            GAA ACG GGA                  ; circle\n\
            TCG                          ; restore center\n\
            TCA\n\
            GAA ATA GAA GAA ACA          ; translate LEFT (dx=12) -- was impossible before\n\
            GAA ACG GGA\n\
            TCG\n\
            TCA\n\
            GAA GAA GAA TCA ACA          ; translate down (dy=52)\n\
            GAA ACG GGA\n\
            TCG\n\
            TCA\n\
            GAA GAA GAA ATA ACA          ; translate UP (dy=12) -- was impossible before\n\
            GAA ACG GGA\n\
            TAA",
        difficulty: "intermediate",
        concepts: &["transforms", "state-management"],
        good_for_mutations: &["missense", "frameshift"],
    },
    Example {
        id: "line-fan",
        title: "Line Fan",
        description: "A line repeatedly drawn and rotated to sweep a fan. ROTATE only affects orientation.",
        genome: "ATG\n  GAA TTA GAA GAA GAA GAA TTA  ; warm color\n  GAA GCC AAA  ; push 37, line\n  GAA CCA AGA  ; rotate 20\n  GAA GCC AAA\n  GAA CCA AGA\n  GAA GCC AAA\n  GAA CCA AGA\n  GAA GCC AAA\nTAA",
        difficulty: "beginner",
        concepts: &["drawing", "transforms"],
        good_for_mutations: &["silent", "frameshift"],
    },
    Example {
        id: "scale-tower",
        title: "Scale Tower",
        description: "SCALE compounds, so each circle is drawn larger than the last.",
        genome: "ATG\n  GAA AAT GGA        ; tiny circle (r=3)\n  GAA TCG CGA        ; push 54, scale ~1.7x\n  GAA AAT GGA\n  GAA TCG CGA\n  GAA AAT GGA\nTAA",
        difficulty: "intermediate",
        concepts: &["transforms", "drawing"],
        good_for_mutations: &["missense", "frameshift"],
    },
    Example {
        id: "stack-ops",
        title: "Stack Ops",
        description: "SWAP reorders the stack so a tall ellipse becomes a wide one.",
        genome: "ATG\n  GAA GGG GAA TTT GAA GAA TTA  ; color\n  GAA AGG        ; push 10\n  GAA CTG        ; push 30\n  TGG            ; SWAP -> [30, 10]\n  GTA            ; ellipse: ry=10, rx=30 (wide)\nTAA",
        difficulty: "intermediate",
        concepts: &["stack", "drawing"],
        good_for_mutations: &["silent", "missense"],
    },
    Example {
        id: "arithmetic",
        title: "Arithmetic",
        description: "Compute a radius on the stack: 12 + 12 = 24, then draw it.",
        genome: "ATG\n  GAA ATA GAA ATA CTG  ; push 12, push 12, ADD -> 24\n  GGA                  ; circle\nTAA",
        difficulty: "intermediate",
        concepts: &["arithmetic", "stack", "drawing"],
        good_for_mutations: &["missense"],
    },
    Example {
        id: "loop-march",
        title: "Loop March",
        description: "LOOP replays the last N instructions. Here a circle is drawn, moved right, and \
             scaled down — repeated to march a shrinking row across the canvas.",
        genome: "ATG\n\
            GAA TTT GAA TTT GAA GAA TTA  ; red color\n\
            GAA AAC GAA GAA ACA          ; translate far left to start\n\
            GAA AGA GGA                  ; push 8, circle      (body start)\n\
            GAA GGA GAA GAA ACA          ; translate right (dx=40)\n\
            GAA CGG CGA                  ; push 26, scale ~0.8 (body end)\n\
            GAA ACT GAA ACG CAA          ; push 7 (count), push 6 (times), LOOP\n\
            TAA",
        difficulty: "advanced",
        concepts: &["advanced-opcodes", "transforms"],
        good_for_mutations: &["missense"],
    },
];
