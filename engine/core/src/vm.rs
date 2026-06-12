//! The stack-based CodonCanvas virtual machine.
//!
//! Unlike the original, which drew straight onto a `CanvasRenderingContext2D`,
//! this VM is renderer-agnostic: it emits an ordered list of [`DrawCommand`]s
//! that any backend (the Svelte canvas, an SVG exporter, a test harness) can
//! replay. Each command carries the full affine transform and color in effect
//! when it was issued, so a backend reproduces the original rendering with
//! `translate -> rotate -> scale -> draw-centered-at-origin`.
//!
//! # The negative-offset fix
//!
//! Stack values are 6-bit (`0..=63`). The original `scaleValue` mapped them to
//! `(v / 64) * width`, which is always `>= 0`, so `TRANSLATE` could only ever
//! move right and down — there was no way to express "move left" or "move up".
//! [`Vm::translate_offset`] fixes this by treating the value as *signed around
//! the midpoint 32*: `offset = ((v - 32) / 64) * width`. So `32` means "stay
//! put", values below 32 move left/up, and values above 32 move right/down.
//! Shape dimensions keep the original unsigned mapping ([`Vm::scale_value`]),
//! since a negative radius is meaningless.

use serde::Serialize;

use crate::codon::opcode_for;
use crate::lexer::Token;
use crate::opcode::Opcode;

const STACK_VALUE_RANGE: f64 = 64.0;
const HUE_DEGREES: f64 = 360.0;
const PERCENT_SCALE: f64 = 100.0;
const SCALE_DIVISOR: f64 = 32.0;
const DEFAULT_MAX_INSTRUCTIONS: u64 = 10_000;
const LOOP_PARAMETER_COUNT: usize = 2;
const MIN_SCALE: f64 = 0.001;
/// Stack value that maps to zero translation; see the module docs.
const TRANSLATE_CENTER: f64 = 32.0;

/// An HSL color: hue in degrees, saturation/lightness in percent.
#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
pub struct Hsl {
    pub h: f64,
    pub s: f64,
    pub l: f64,
}

/// The affine transform in effect for a draw command.
#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
pub struct Transform {
    pub x: f64,
    pub y: f64,
    /// Rotation in degrees, applied clockwise.
    pub rotation: f64,
    pub scale: f64,
}

/// A primitive shape, drawn centered at the transform origin.
#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum Shape {
    Circle { radius: f64 },
    Rect { width: f64, height: f64 },
    Line { length: f64 },
    Triangle { size: f64 },
    Ellipse { rx: f64, ry: f64 },
}

/// A single fill-and-stroke draw operation.
#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
pub struct DrawCommand {
    pub transform: Transform,
    pub color: Hsl,
    pub shape: Shape,
}

/// A snapshot of VM state after one top-level instruction, for the timeline
/// scrubber and stack inspector.
#[derive(Debug, Clone, Serialize)]
pub struct Step {
    /// Token index of the instruction.
    pub index: usize,
    /// The codon executed.
    pub codon: String,
    /// Opcode display name.
    pub opcode: &'static str,
    /// Value pushed, for `PUSH` steps only.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub push_value: Option<f64>,
    /// Stack contents after the instruction (bottom-to-top).
    pub stack: Vec<f64>,
    pub transform: Transform,
    pub color: Hsl,
    /// Number of draw commands emitted so far; render `commands[..command_count]`
    /// to show the canvas at this step.
    pub command_count: usize,
    pub instruction_count: u64,
}

/// The result of running a genome.
#[derive(Debug, Clone, Serialize)]
pub struct RunResult {
    pub ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    pub width: f64,
    pub height: f64,
    pub commands: Vec<DrawCommand>,
    pub steps: Vec<Step>,
}

#[derive(Clone)]
struct HistItem {
    opcode: Opcode,
    codon: String,
    push_value: Option<f64>,
}

#[derive(Clone, Copy)]
struct SavedState {
    x: f64,
    y: f64,
    rotation: f64,
    scale: f64,
    color: Hsl,
}

/// The CodonCanvas virtual machine.
pub struct Vm {
    width: f64,
    height: f64,
    x: f64,
    y: f64,
    rotation: f64,
    scale: f64,
    color: Hsl,
    stack: Vec<f64>,
    state_stack: Vec<SavedState>,
    instruction_count: u64,
    max_instructions: u64,
    ip: usize,
    history: Vec<HistItem>,
    commands: Vec<DrawCommand>,
}

impl Vm {
    /// Creates a VM for a canvas of the given size, using the default
    /// instruction limit (10,000).
    pub fn new(width: f64, height: f64) -> Self {
        Self::with_limit(width, height, DEFAULT_MAX_INSTRUCTIONS)
    }

    /// Creates a VM with a custom instruction limit.
    pub fn with_limit(width: f64, height: f64, max_instructions: u64) -> Self {
        let mut vm = Self {
            width,
            height,
            x: 0.0,
            y: 0.0,
            rotation: 0.0,
            scale: 1.0,
            color: Hsl {
                h: 0.0,
                s: 0.0,
                l: 0.0,
            },
            stack: Vec::new(),
            state_stack: Vec::new(),
            instruction_count: 0,
            max_instructions: max_instructions.max(1),
            ip: 0,
            history: Vec::new(),
            commands: Vec::new(),
        };
        vm.reset();
        vm
    }

    fn reset(&mut self) {
        self.x = self.width / 2.0;
        self.y = self.height / 2.0;
        self.rotation = 0.0;
        self.scale = 1.0;
        self.color = Hsl {
            h: 0.0,
            s: 0.0,
            l: 0.0,
        };
        self.stack.clear();
        self.state_stack.clear();
        self.instruction_count = 0;
        self.ip = 0;
        self.history.clear();
        self.commands.clear();
    }

    fn current_transform(&self) -> Transform {
        Transform {
            x: self.x,
            y: self.y,
            rotation: self.rotation,
            scale: self.scale,
        }
    }

    /// Unsigned `0..=63 -> 0..width` mapping for shape dimensions.
    fn scale_value(&self, v: f64) -> f64 {
        (v / STACK_VALUE_RANGE) * self.width
    }

    /// Signed mapping for translation offsets; see the module docs for the fix.
    fn translate_offset(&self, v: f64) -> f64 {
        ((v - TRANSLATE_CENTER) / STACK_VALUE_RANGE) * self.width
    }

    fn pop(&mut self) -> Result<f64, String> {
        self.stack
            .pop()
            .ok_or_else(|| format!("Stack underflow at instruction {}", self.ip))
    }

    fn count_instruction(&mut self) -> Result<(), String> {
        self.instruction_count += 1;
        if self.instruction_count > self.max_instructions {
            return Err(format!(
                "Instruction limit exceeded (max {})",
                self.max_instructions
            ));
        }
        Ok(())
    }

    /// Runs a full token stream and returns the draw commands plus a per-step
    /// timeline. Hard errors stop execution but the partial render is retained.
    pub fn run(&mut self, tokens: &[Token]) -> RunResult {
        self.reset();
        let mut steps: Vec<Step> = Vec::new();
        let mut error: Option<String> = None;

        let mut i = 0;
        while i < tokens.len() {
            let token = &tokens[i];
            let Some(opcode) = opcode_for(&token.text) else {
                error = Some(format!(
                    "Unknown codon '{}' at position {}",
                    token.text, token.position
                ));
                break;
            };
            self.ip = i;
            let codon = token.text.clone();

            let step_result = match opcode {
                Opcode::Push => match self.execute_push(tokens, i) {
                    Ok((next, value)) => {
                        i = next;
                        Ok(Some(self.make_step(
                            self.ip,
                            codon.clone(),
                            opcode,
                            Some(value),
                        )))
                    }
                    Err(e) => Err(e),
                },
                Opcode::Stop => {
                    steps.push(self.make_step(i, codon, opcode, None));
                    break;
                }
                _ => {
                    if opcode != Opcode::Loop {
                        self.history.push(HistItem {
                            opcode,
                            codon: codon.clone(),
                            push_value: None,
                        });
                    }
                    self.execute(opcode, &codon)
                        .map(|()| Some(self.make_step(i, codon.clone(), opcode, None)))
                }
            };

            match step_result {
                Ok(Some(step)) => steps.push(step),
                Ok(None) => {}
                Err(e) => {
                    error = Some(e);
                    break;
                }
            }

            i += 1;
        }

        RunResult {
            ok: error.is_none(),
            error,
            width: self.width,
            height: self.height,
            commands: self.commands.clone(),
            steps,
        }
    }

    fn make_step(
        &self,
        index: usize,
        codon: String,
        opcode: Opcode,
        push_value: Option<f64>,
    ) -> Step {
        Step {
            index,
            codon,
            opcode: opcode.name(),
            push_value,
            stack: self.stack.clone(),
            transform: self.current_transform(),
            color: self.color,
            command_count: self.commands.len(),
            instruction_count: self.instruction_count,
        }
    }

    /// Handles `PUSH`: counts the instruction, reads the following codon as a
    /// base-4 literal, pushes it, and records it in history. Returns the index
    /// of the literal token (the caller advances past it) and the value.
    fn execute_push(&mut self, tokens: &[Token], i: usize) -> Result<(usize, f64), String> {
        self.count_instruction()?;
        let next = i + 1;
        if next >= tokens.len() {
            return Err("PUSH instruction at end of program (missing numeric literal)".into());
        }
        let value = f64::from(crate::base::decode_literal(&tokens[next].text));
        self.stack.push(value);
        self.history.push(HistItem {
            opcode: Opcode::Push,
            codon: tokens[i].text.clone(),
            push_value: Some(value),
        });
        Ok((next, value))
    }

    fn execute(&mut self, opcode: Opcode, codon: &str) -> Result<(), String> {
        self.count_instruction()?;
        match opcode {
            Opcode::Circle | Opcode::Rect | Opcode::Line | Opcode::Triangle | Opcode::Ellipse => {
                self.execute_draw(opcode)
            }
            Opcode::Translate | Opcode::Rotate | Opcode::Scale | Opcode::Color => {
                self.execute_transform(opcode)
            }
            Opcode::Add | Opcode::Sub | Opcode::Mul | Opcode::Div => self.execute_math(opcode),
            Opcode::Dup | Opcode::Pop | Opcode::Swap => self.execute_stack(opcode),
            Opcode::SaveState | Opcode::RestoreState => self.execute_state(opcode),
            Opcode::Loop => self.execute_loop(),
            Opcode::Eq | Opcode::Lt => self.execute_compare(opcode),
            Opcode::Start | Opcode::Stop | Opcode::Push | Opcode::Nop => Ok(()),
        }
        .map_err(|e: String| e)?;
        let _ = codon;
        Ok(())
    }

    fn emit(&mut self, shape: Shape) {
        self.commands.push(DrawCommand {
            transform: self.current_transform(),
            color: self.color,
            shape,
        });
    }

    fn execute_draw(&mut self, opcode: Opcode) -> Result<(), String> {
        match opcode {
            Opcode::Circle => {
                let v = self.pop()?;
                let radius = self.scale_value(v);
                self.emit(Shape::Circle { radius });
            }
            Opcode::Rect => {
                let h = self.pop()?;
                let w = self.pop()?;
                let height = self.scale_value(h);
                let width = self.scale_value(w);
                self.emit(Shape::Rect { width, height });
            }
            Opcode::Line => {
                let v = self.pop()?;
                let length = self.scale_value(v);
                self.emit(Shape::Line { length });
            }
            Opcode::Triangle => {
                let v = self.pop()?;
                let size = self.scale_value(v);
                self.emit(Shape::Triangle { size });
            }
            Opcode::Ellipse => {
                let ry_v = self.pop()?;
                let rx_v = self.pop()?;
                let ry = self.scale_value(ry_v);
                let rx = self.scale_value(rx_v);
                self.emit(Shape::Ellipse { rx, ry });
            }
            _ => unreachable!("execute_draw called with non-draw opcode"),
        }
        Ok(())
    }

    fn execute_transform(&mut self, opcode: Opcode) -> Result<(), String> {
        match opcode {
            Opcode::Translate => {
                // The negative-offset fix: signed offsets centered at 32.
                let dy_v = self.pop()?;
                let dx_v = self.pop()?;
                self.x += self.translate_offset(dx_v);
                self.y += self.translate_offset(dy_v);
            }
            Opcode::Rotate => {
                let degrees = self.pop()?;
                self.rotation += degrees;
            }
            Opcode::Scale => {
                let factor = self.pop()? / SCALE_DIVISOR;
                self.scale = (self.scale * factor).max(MIN_SCALE);
            }
            Opcode::Color => {
                let l = self.pop()? * (PERCENT_SCALE / STACK_VALUE_RANGE);
                let s = self.pop()? * (PERCENT_SCALE / STACK_VALUE_RANGE);
                let h = self.pop()? * (HUE_DEGREES / STACK_VALUE_RANGE);
                self.color = Hsl { h, s, l };
            }
            _ => unreachable!("execute_transform called with non-transform opcode"),
        }
        Ok(())
    }

    fn execute_math(&mut self, opcode: Opcode) -> Result<(), String> {
        let b = self.pop()?;
        let a = self.pop()?;
        let value = match opcode {
            Opcode::Add => a + b,
            Opcode::Mul => a * b,
            Opcode::Sub => a - b,
            Opcode::Div => {
                if b == 0.0 {
                    return Err(format!("Division by zero at instruction {}", self.ip));
                }
                (a / b).floor()
            }
            _ => unreachable!("execute_math called with non-arithmetic opcode"),
        };
        self.stack.push(value);
        Ok(())
    }

    fn execute_stack(&mut self, opcode: Opcode) -> Result<(), String> {
        match opcode {
            Opcode::Dup => {
                let v = self.pop()?;
                self.stack.push(v);
                self.stack.push(v);
            }
            Opcode::Pop => {
                self.pop()?;
            }
            Opcode::Swap => {
                let b = self.pop()?;
                let a = self.pop()?;
                self.stack.push(b);
                self.stack.push(a);
            }
            _ => unreachable!("execute_stack called with non-stack opcode"),
        }
        Ok(())
    }

    fn execute_state(&mut self, opcode: Opcode) -> Result<(), String> {
        match opcode {
            Opcode::SaveState => {
                self.state_stack.push(SavedState {
                    x: self.x,
                    y: self.y,
                    rotation: self.rotation,
                    scale: self.scale,
                    color: self.color,
                });
            }
            Opcode::RestoreState => {
                let saved = self
                    .state_stack
                    .pop()
                    .ok_or("RESTORE_STATE with empty state stack")?;
                self.x = saved.x;
                self.y = saved.y;
                self.rotation = saved.rotation;
                self.scale = saved.scale;
                self.color = saved.color;
            }
            _ => unreachable!("execute_state called with non-state opcode"),
        }
        Ok(())
    }

    // Float equality here is intentional: it mirrors the original `a === b`
    // semantics over integer-valued stacks.
    #[allow(clippy::float_cmp)]
    fn execute_compare(&mut self, opcode: Opcode) -> Result<(), String> {
        let b = self.pop()?;
        let a = self.pop()?;
        let result = match opcode {
            Opcode::Eq => f64::from(u8::from(a == b)),
            Opcode::Lt => f64::from(u8::from(a < b)),
            _ => unreachable!("execute_compare called with non-comparison opcode"),
        };
        self.stack.push(result);
        Ok(())
    }

    fn execute_loop(&mut self) -> Result<(), String> {
        let loop_count = self.pop()?;
        let instruction_count = self.pop()?;

        if loop_count < 0.0 || instruction_count < 0.0 {
            return Err(format!(
                "LOOP requires non-negative parameters (count: {loop_count}, instructions: {instruction_count})"
            ));
        }
        if self.history.len() < LOOP_PARAMETER_COUNT {
            return Err(format!(
                "LOOP requires at least {LOOP_PARAMETER_COUNT} instructions in history"
            ));
        }

        let max_replayable = self.history.len() - LOOP_PARAMETER_COUNT;
        let instruction_count = instruction_count as usize;
        if instruction_count > max_replayable {
            return Err(format!(
                "LOOP instruction count ({instruction_count}) exceeds available history ({max_replayable})"
            ));
        }

        let start = max_replayable - instruction_count;
        // Clone the slice so we can re-execute while mutating the VM.
        let body: Vec<HistItem> = self.history[start..max_replayable].to_vec();

        for _ in 0..(loop_count as u64) {
            for item in &body {
                self.replay(item)?;
            }
        }
        Ok(())
    }

    fn replay(&mut self, item: &HistItem) -> Result<(), String> {
        match (item.opcode, item.push_value) {
            (Opcode::Push, Some(value)) => {
                self.count_instruction()?;
                self.stack.push(value);
                Ok(())
            }
            _ => self.execute(item.opcode, &item.codon),
        }
    }
}

/// Convenience: tokenize and run a genome string in one call.
pub fn run_genome(source: &str, width: f64, height: f64) -> RunResult {
    match crate::lexer::tokenize(source) {
        Ok(tokens) => Vm::new(width, height).run(&tokens),
        Err(e) => RunResult {
            ok: false,
            error: Some(e),
            width,
            height,
            commands: Vec::new(),
            steps: Vec::new(),
        },
    }
}
