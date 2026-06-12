//! WebAssembly bindings for the CodonCanvas engine.
//!
//! Every function returns plain JSON-serializable structures via
//! `serde-wasm-bindgen`, so the Svelte side receives ordinary JS objects. The
//! corresponding TypeScript shapes live in `web/src/lib/engine/types.ts`.

use codoncanvas_core as core;
use serde::Serialize;
use wasm_bindgen::prelude::*;

/// Installs a panic hook that forwards Rust panics to the browser console.
#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

fn to_js<T: Serialize>(value: &T) -> Result<JsValue, JsValue> {
    serde_wasm_bindgen::to_value(value).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Tokenizes and runs a genome, returning a `RunResult` (draw commands + a
/// per-step timeline). Lexer/runtime errors are reported in `result.error`
/// rather than thrown.
#[wasm_bindgen]
pub fn run(source: &str, width: f64, height: f64) -> Result<JsValue, JsValue> {
    to_js(&core::run_genome(source, width, height))
}

/// Result of tokenizing, exposed to JS as `{ ok, tokens, error }`.
#[derive(Serialize)]
struct TokenizeResult {
    ok: bool,
    tokens: Vec<core::Token>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

/// Tokenizes a genome into codons.
#[wasm_bindgen]
pub fn tokenize(source: &str) -> Result<JsValue, JsValue> {
    let result = match core::tokenize(source) {
        Ok(tokens) => TokenizeResult {
            ok: true,
            tokens,
            error: None,
        },
        Err(e) => TokenizeResult {
            ok: false,
            tokens: Vec::new(),
            error: Some(e),
        },
    };
    to_js(&result)
}

/// Runs all validators (frame alignment, structure, unknown codons) and returns
/// a flat list of diagnostics.
#[wasm_bindgen]
pub fn validate(source: &str) -> Result<JsValue, JsValue> {
    let mut diags = core::validate_frame(source);
    if let Ok(tokens) = core::tokenize(source) {
        diags.extend(core::validate_structure(&tokens));
        diags.extend(core::lexer::unknown_codons(&tokens));
    }
    to_js(&diags)
}

/// Applies a mutation of the given type (`"silent"`, `"missense"`, `"nonsense"`,
/// `"point"`, `"insertion"`, `"deletion"`, `"frameshift"`). `seed` makes the
/// result reproducible. Throws on unknown type or impossible mutation.
#[wasm_bindgen]
pub fn mutate(genome: &str, kind: &str, seed: u32) -> Result<JsValue, JsValue> {
    let kind = core::MutationType::from_name(kind)
        .ok_or_else(|| JsValue::from_str(&format!("Unknown mutation type: {kind}")))?;
    let result =
        core::mutation::apply(kind, genome, u64::from(seed)).map_err(|e| JsValue::from_str(&e))?;
    to_js(&result)
}

/// Generates `count` varied mutation candidates from a genome (for the
/// Evolution Lab). `seed` makes the batch reproducible.
#[wasm_bindgen]
pub fn mutate_batch(genome: &str, seed: u32, count: usize) -> Result<JsValue, JsValue> {
    to_js(&core::mutation::batch(genome, u64::from(seed), count))
}

/// Returns the codon-level differences between two genomes.
#[wasm_bindgen]
pub fn compare(original: &str, mutated: &str) -> Result<JsValue, JsValue> {
    to_js(&core::mutation::compare(original, mutated))
}

/// Reference data for one codon (opcode, amino acid, literal value).
#[wasm_bindgen]
pub fn codon_info(codon: &str) -> Result<JsValue, JsValue> {
    to_js(&core::codon_info(codon))
}

/// The full 64-codon reference chart.
#[wasm_bindgen]
pub fn codon_chart() -> Result<JsValue, JsValue> {
    to_js(&core::codon_chart())
}

/// The built-in example genomes.
#[wasm_bindgen]
pub fn examples() -> Result<JsValue, JsValue> {
    to_js(&core::examples::all())
}

/// Decodes a codon's base-4 numeric literal (`0..=63`).
#[wasm_bindgen]
pub fn decode_literal(codon: &str) -> u8 {
    core::base::decode_literal(codon)
}

/// The engine semantic version, surfaced in the UI footer.
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
