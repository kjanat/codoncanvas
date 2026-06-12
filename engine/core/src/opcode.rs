//! The CodonCanvas instruction set.
//!
//! Each [`Opcode`] is a drawing, transform, stack, arithmetic, comparison or
//! control operation. Multiple synonymous codons map to the same opcode, which
//! is the language's central pedagogical idea: genetic redundancy.

use serde::Serialize;

/// A virtual-machine instruction.
///
/// Serializes to its `SCREAMING_SNAKE_CASE` name so the JS/Svelte side can
/// display opcodes without a lookup table (`Opcode::SaveState` -> `"SAVE_STATE"`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Opcode {
    Start,
    Stop,
    Circle,
    Rect,
    Line,
    Triangle,
    Ellipse,
    Translate,
    Rotate,
    Scale,
    Color,
    Push,
    Dup,
    Pop,
    Swap,
    Nop,
    SaveState,
    RestoreState,
    Add,
    Sub,
    Mul,
    Div,
    Loop,
    /// Equality comparison: `[a, b] -> [a == b]`.
    Eq,
    /// Less-than comparison: `[a, b] -> [a < b]`.
    Lt,
}

impl Opcode {
    /// The canonical display name, matching the original TypeScript `Opcode[...]`
    /// enum keys (`"SAVE_STATE"`, `"RESTORE_STATE"`, etc.).
    pub const fn name(self) -> &'static str {
        match self {
            Opcode::Start => "START",
            Opcode::Stop => "STOP",
            Opcode::Circle => "CIRCLE",
            Opcode::Rect => "RECT",
            Opcode::Line => "LINE",
            Opcode::Triangle => "TRIANGLE",
            Opcode::Ellipse => "ELLIPSE",
            Opcode::Translate => "TRANSLATE",
            Opcode::Rotate => "ROTATE",
            Opcode::Scale => "SCALE",
            Opcode::Color => "COLOR",
            Opcode::Push => "PUSH",
            Opcode::Dup => "DUP",
            Opcode::Pop => "POP",
            Opcode::Swap => "SWAP",
            Opcode::Nop => "NOP",
            Opcode::SaveState => "SAVE_STATE",
            Opcode::RestoreState => "RESTORE_STATE",
            Opcode::Add => "ADD",
            Opcode::Sub => "SUB",
            Opcode::Mul => "MUL",
            Opcode::Div => "DIV",
            Opcode::Loop => "LOOP",
            Opcode::Eq => "EQ",
            Opcode::Lt => "LT",
        }
    }

    /// Number of stack values the opcode consumes, used for static analysis and
    /// the reference chart.
    pub const fn stack_arity(self) -> u8 {
        match self {
            Opcode::Circle
            | Opcode::Line
            | Opcode::Triangle
            | Opcode::Rotate
            | Opcode::Scale
            | Opcode::Dup
            | Opcode::Pop => 1,
            Opcode::Rect
            | Opcode::Ellipse
            | Opcode::Translate
            | Opcode::Swap
            | Opcode::Add
            | Opcode::Sub
            | Opcode::Mul
            | Opcode::Div
            | Opcode::Loop
            | Opcode::Eq
            | Opcode::Lt => 2,
            Opcode::Color => 3,
            Opcode::Start
            | Opcode::Stop
            | Opcode::Push
            | Opcode::Nop
            | Opcode::SaveState
            | Opcode::RestoreState => 0,
        }
    }
}
