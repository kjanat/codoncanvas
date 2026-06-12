//! Tokenizer and structural validation for genome source.
//!
//! Parsing rules (unchanged from the original):
//! - Valid bases are `A C G T U`; `U` is normalized to `T`.
//! - Whitespace is ignored and may be used for formatting.
//! - `;` starts a comment that runs to end of line.
//! - The stripped source length must be divisible by 3.

use serde::Serialize;

use crate::base::{is_base, normalize_base};
use crate::codon::{is_stop, opcode_for};

/// A single parsed codon with its source position.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Token {
    /// The three-letter codon, normalized to DNA notation.
    pub text: String,
    /// Index of the codon's first base within the stripped source.
    pub position: usize,
    /// 1-based source line the codon starts on.
    pub line: usize,
}

/// Severity of a [`Diagnostic`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Error,
    Warning,
}

/// A structural or frame-alignment finding. Warnings never block execution.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Diagnostic {
    pub message: String,
    pub position: usize,
    pub severity: Severity,
    pub fix: String,
}

impl Diagnostic {
    fn warning(message: impl Into<String>, position: usize, fix: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            position,
            severity: Severity::Warning,
            fix: fix.into(),
        }
    }
    fn error(message: impl Into<String>, position: usize, fix: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            position,
            severity: Severity::Error,
            fix: fix.into(),
        }
    }
}

/// Strips a trailing `;` comment from a line.
fn code_content(line: &str) -> &str {
    match line.find(';') {
        Some(i) => &line[..i],
        None => line,
    }
}

/// Tokenizes genome source into codons.
///
/// Returns `Err` with a human-readable message for hard errors (invalid base
/// characters, or a stripped length that is not a multiple of three), matching
/// the exceptions thrown by the original lexer.
pub fn tokenize(source: &str) -> Result<Vec<Token>, String> {
    let mut cleaned = String::new();
    // Line each cleaned base came from, parallel to `cleaned`.
    let mut line_of_base: Vec<usize> = Vec::new();

    for (line_idx, line) in source.split('\n').enumerate() {
        for (col, ch) in code_content(line).chars().enumerate() {
            let upper = ch.to_ascii_uppercase();
            if is_base(upper) {
                cleaned.push(normalize_base(upper));
                line_of_base.push(line_idx + 1);
            } else if !ch.is_whitespace() {
                return Err(format!(
                    "Invalid character '{ch}' at line {}, column {col}",
                    line_idx + 1
                ));
            }
        }
    }

    if !cleaned.len().is_multiple_of(3) {
        let missing = 3 - (cleaned.len() % 3);
        return Err(format!(
            "Source length {} is not divisible by 3. Missing {missing} bases for complete codon.",
            cleaned.len()
        ));
    }

    let bytes = cleaned.as_bytes();
    let mut tokens = Vec::with_capacity(cleaned.len() / 3);
    let mut i = 0;
    while i < bytes.len() {
        // `cleaned` is ASCII, so byte and char indices coincide.
        let text = cleaned[i..i + 3].to_string();
        tokens.push(Token {
            text,
            position: i,
            line: line_of_base.get(i).copied().unwrap_or(1),
        });
        i += 3;
    }
    Ok(tokens)
}

/// Validates reading-frame alignment, reporting whitespace breaks that fall
/// mid-triplet. Returns warnings only; never errors.
pub fn validate_frame(source: &str) -> Vec<Diagnostic> {
    let mut diags = Vec::new();
    for (line_idx, line) in source.split('\n').enumerate() {
        let mut base_count = 0usize;
        for (col, ch) in code_content(line).chars().enumerate() {
            if is_base(ch.to_ascii_uppercase()) {
                base_count += 1;
            } else if ch.is_whitespace() && !base_count.is_multiple_of(3) {
                diags.push(Diagnostic::warning(
                    format!(
                        "Mid-triplet break detected at line {}. {} base(s) before whitespace.",
                        line_idx + 1,
                        base_count % 3
                    ),
                    col,
                    "Remove whitespace or complete the codon",
                ));
            }
        }
    }
    diags
}

/// Validates structural integrity: START at the beginning, a STOP at the end,
/// and no START after a STOP. Returns errors and warnings.
pub fn validate_structure(tokens: &[Token]) -> Vec<Diagnostic> {
    let mut diags = Vec::new();
    if tokens.is_empty() {
        return diags;
    }

    if tokens[0].text != "ATG" {
        diags.push(Diagnostic::error(
            "Program should begin with START codon (ATG)",
            0,
            "Add ATG at the beginning",
        ));
    }

    let mut first_stop: Option<usize> = None;
    for (i, token) in tokens.iter().enumerate() {
        if is_stop(&token.text) {
            first_stop.get_or_insert(i);
        } else if first_stop.is_some() && token.text == "ATG" {
            diags.push(Diagnostic::warning(
                format!("START codon after STOP at position {i}"),
                token.position,
                "Remove unreachable code after STOP",
            ));
        }
    }

    if let Some(last) = tokens.last()
        && !is_stop(&last.text)
    {
        diags.push(Diagnostic::warning(
            "Program should end with STOP codon (TAA, TAG, or TGA)",
            last.position,
            "Add TAA at the end",
        ));
    }

    diags
}

/// Reports unknown codons (codons with no opcode). The standard map covers all
/// 64 codons, so this only fires on malformed tokens.
pub fn unknown_codons(tokens: &[Token]) -> Vec<Diagnostic> {
    tokens
        .iter()
        .filter(|t| opcode_for(&t.text).is_none())
        .map(|t| {
            Diagnostic::error(
                format!("Unknown codon '{}'", t.text),
                t.position,
                "Replace with a valid codon",
            )
        })
        .collect()
}
