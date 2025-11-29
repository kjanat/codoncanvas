/**
 * Built-in example genomes for the playground
 */

import type { MutationType } from "@/types";

/**
 * Difficulty level for example genomes in the gallery.
 * Different from AssessmentDifficulty which uses easy/medium/hard scale.
 */
export type ExampleDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "advanced-showcase";

/**
 * Learning concepts covered by example genomes.
 */
export type Concept =
  | "drawing"
  | "transforms"
  | "colors"
  | "stack"
  | "composition"
  | "advanced-opcodes"
  | "state-management"
  | "arithmetic"
  | "comparison"
  | "logic";

/**
 * Metadata describing a pedagogical example genome
 *
 * Contains information about an example genome including its purpose,
 * learning concepts covered, difficulty level, and suitability for mutation analysis.
 * Used by the example gallery and tutorial system.
 *
 * @example
 * ```typescript
 * const example: ExampleMetadata = {
 *   title: 'Hello Circle',
 *   description: 'Minimal example - draws a single circle',
 *   genome: 'ATG GAA AAT GGA TAA',
 *   difficulty: 'beginner',
 *   concepts: ['drawing'],
 *   goodForMutations: ['silent', 'missense', 'nonsense'],
 *   keywords: ['simple', 'intro', 'first', 'basic', 'circle']
 * };
 * ```
 */
export interface ExampleMetadata {
  /** Example title (displayed in gallery) */
  title: string;
  /** Brief description of what the example demonstrates */
  description: string;
  /** Complete genome code (codons with optional comments/whitespace) */
  genome: string;
  /** Educational difficulty level (beginner, intermediate, advanced, expert) */
  difficulty: ExampleDifficulty;
  /** Learning concepts this example teaches */
  concepts: Concept[];
  /** Mutation types that produce interesting effects on this genome */
  goodForMutations: MutationType[];
  /** Search keywords for finding this example in gallery */
  keywords: string[];
}

/**
 * Complete library of pedagogical example genomes
 *
 * Pre-built genomes demonstrating various concepts from simple shapes
 * to advanced algorithms. Each example includes metadata for discovery,
 * learning path placement, and mutation analysis.
 *
 * Examples range from "hello circle" (5-codon minimal program) to
 * complex algorithmic demonstrations (150+ codons).
 *
 * @example
 * ```typescript
 * const example = examples.helloCircle;
 * console.log(example.title); // 'Hello Circle'
 * console.log(example.genome); // 'ATG GAA AAT GGA TAA'
 * ```
 */
export const examples: Record<string, ExampleMetadata> = {
  helloCircle: {
    title: "Hello Circle",
    description: "Minimal example - draws a single circle",
    genome: "ATG GAA AAT GGA TAA",
    difficulty: "beginner",
    concepts: ["drawing"],
    goodForMutations: ["silent", "missense", "nonsense"],
    keywords: ["simple", "intro", "first", "basic", "circle"],
  },

  rnaHello: {
    title: "RNA Hello",
    description:
      "RNA notation (U instead of T) demonstrating biological transcription",
    genome: `; RNA notation using U (Uracil) instead of T (Thymine)
AUG GAA AAU GGA UAA`,
    difficulty: "beginner",
    concepts: ["drawing"],
    goodForMutations: ["silent", "missense", "nonsense"],
    keywords: ["rna", "uracil", "transcription", "biology", "simple"],
  },

  rnaComposition: {
    title: "RNA Composition",
    description: "Complex RNA example with multiple shapes",
    genome: `; RNA notation demonstrating composition
AUG
  GAA AAU GGA        ; Push 3, draw circle
  GAA CCC GAA AAA ACA ; Push 21, push 0, translate
  GAA AGG GAA AGG CCA ; Push 10, push 10, draw rect
  GAA AAA GAA CCC ACA ; Push 0, push 21, translate
  GAA AGG GCA        ; Push 10, draw triangle
UAA`,
    difficulty: "intermediate",
    concepts: ["drawing", "transforms", "composition"],
    goodForMutations: ["missense", "frameshift"],
    keywords: ["rna", "uracil", "composition", "multiple", "shapes"],
  },

  twoShapes: {
    title: "Two Shapes",
    description: "Circle and rectangle side by side",
    genome: `ATG
  GAA AAT GGA        ; Push 3, draw small circle
  GAA CCC            ; Push 21
  GAA AAA            ; Push 0
  ACA                ; Translate(21, 0) - move right
  GAA AGG GAA AGG CCA ; Push 10, push 10, draw rect
TAA`,
    difficulty: "beginner",
    concepts: ["drawing", "transforms"],
    goodForMutations: ["missense", "frameshift"],
    keywords: ["shapes", "translate", "position", "rectangle"],
  },

  colorfulPattern: {
    title: "Colorful Pattern",
    description: "Multiple colored shapes with rotation",
    genome: `ATG
  GAA CCC GAA AAA GAA AAA TTA  ; Set color (21, 0, 0) - red
  GAA CAC GGA                   ; Push 25, draw circle
  GAA ATT AGA                   ; Push 15, rotate 15 degrees
  GAA CCC GAA CCC GAA CCC TTA  ; Set color (21, 21, 21) - green
  GAA CAC GGA                   ; Push 25, draw circle
  GAA ATT AGA                   ; Push 15, rotate 15 degrees
  GAA AAA GAA AAA GAA GCC TTA  ; Set color (0, 0, 37) - blue
  GAA CAC GGA                   ; Push 25, draw circle
TAA`,
    difficulty: "intermediate",
    concepts: ["drawing", "colors", "transforms", "composition"],
    goodForMutations: ["silent", "missense"],
    keywords: ["color", "rotation", "pattern", "multiple"],
  },

  lineArt: {
    title: "Line Art",
    description: "Demonstrates LINE primitive with rotation",
    genome: `ATG
  GAA GCC AAA        ; Push 37, draw line
  GAA GGA AGA        ; Push 26, rotate 26 degrees
  GAA GCC AAA        ; Push 37, draw line
  GAA GGA AGA        ; Push 26, rotate 26 degrees
  GAA GCC AAA        ; Push 37, draw line
  GAA GGA AGA        ; Push 26, rotate 26 degrees
  GAA GCC AAA        ; Push 37, draw line
TAA`,
    difficulty: "beginner",
    concepts: ["drawing", "transforms"],
    goodForMutations: ["silent", "frameshift"],
    keywords: ["line", "rotation", "repetition", "angles"],
  },

  triangleDemo: {
    title: "Triangle Demo",
    description: "Uses TRIANGLE primitive with different sizes",
    genome: `ATG
  GAA AAT GCA        ; Push 3, draw small triangle
  GAA AGG            ; Push 10
  GAA AAA ACA        ; Push 0, translate(10, 0)
  GAA AGG GCA        ; Push 10, draw medium triangle
  GAA AGG            ; Push 10
  GAA AAA ACA        ; Push 0, translate(10, 0)
  GAA CGC GCA        ; Push 25, draw large triangle
TAA`,
    difficulty: "beginner",
    concepts: ["drawing", "transforms"],
    goodForMutations: ["missense", "nonsense"],
    keywords: ["triangle", "sizes", "scaling", "shapes"],
  },

  ellipseGallery: {
    title: "Ellipse Gallery",
    description: "ELLIPSE primitive with various aspect ratios",
    genome: `ATG
  GAA AGG            ; Push 10 (rx)
  GAA ATT            ; Push 15 (ry)
  GTA                ; Draw ellipse (wide)
  GAA CCC            ; Push 21
  GAA AAA ACA        ; Push 0, translate(21, 0)
  GAA ATT            ; Push 15 (rx)
  GAA AGG            ; Push 10 (ry)
  GTA                ; Draw ellipse (tall)
TAA`,
    difficulty: "intermediate",
    concepts: ["drawing", "transforms"],
    goodForMutations: ["silent", "missense"],
    keywords: ["ellipse", "oval", "aspect", "ratio"],
  },

  scaleTransform: {
    title: "Scale Transform",
    description: "Demonstrates SCALE opcode for sizing",
    genome: `ATG
  GAA AAT GGA        ; Push 3, draw tiny circle
  GAA ACC CGA        ; Push 11, scale by 1.7x
  GAA AAT GGA        ; Push 3, draw scaled circle (appears larger)
  GAA ACC CGA        ; Push 11, scale by 1.7x again
  GAA AAT GGA        ; Push 3, draw even larger
TAA`,
    difficulty: "intermediate",
    concepts: ["transforms", "drawing"],
    goodForMutations: ["frameshift", "missense"],
    keywords: ["scale", "size", "transform", "magnify"],
  },

  stackOperations: {
    title: "Stack Operations",
    description: "DUP and SWAP for efficient stack management",
    genome: `ATG
  GAA AGG            ; Push 10
  ATA                ; DUP → stack: [10, 10]
  CCA                ; Draw rect(10, 10) - square
  GAA CCC            ; Push 21
  GAA AAA ACA        ; Push 0, translate(21, 0)
  GAA AAT            ; Push 3
  GAA AGG            ; Push 10
  TGG                ; SWAP → stack: [10, 3]
  CCA                ; Draw rect(10, 3) - horizontal bar
TAA`,
    difficulty: "intermediate",
    concepts: ["stack", "drawing"],
    goodForMutations: ["frameshift", "nonsense"],
    keywords: ["stack", "dup", "swap", "pop", "operations"],
  },

  rosette: {
    title: "Rosette Pattern",
    description: "Complex composition with rotation and color",
    genome: `ATG
  GAA AGG            ; Push 10 (radius)
  GAA CTT GAA AAA GAA AAA TTA  ; Color(31, 0, 0) red
  GAA AGG GGA        ; Draw circle
  GAA GGA AGA        ; Rotate 26 degrees
  GAA AAA GAA CCC GAA CCC TTA  ; Color(0, 21, 21) cyan
  GAA AGG GGA        ; Draw circle
  GAA GGA AGA        ; Rotate 26 degrees
  GAA CCC GAA AAA GAA CCC TTA  ; Color(21, 0, 21) magenta
  GAA AGG GGA        ; Draw circle
  GAA GGA AGA        ; Rotate 26 degrees
  GAA CCC GAA CCC GAA AAA TTA  ; Color(21, 21, 0) yellow
  GAA AGG GGA        ; Draw circle
TAA`,
    difficulty: "advanced",
    concepts: ["composition", "colors", "transforms"],
    goodForMutations: ["silent", "missense", "frameshift"],
    keywords: ["rosette", "flower", "radial", "colorful", "pattern"],
  },

  face: {
    title: "Simple Face",
    description: "Combines primitives to draw a smiley face",
    genome: `ATG
  GAA CGC GGA        ; Push 25, draw head (large circle)
  GAA AAA GAA ATT ACA ; Push 0, push 15, translate(0, 15)
  GAA AAT GGA        ; Push 3, draw left eye
  GAA AGG GAA AAA ACA ; Push 10, push 0, translate(10, 0)
  GAA AAT GGA        ; Push 3, draw right eye
  GAA AAA GAA ATT ACA ; Push 0, push 15, translate(0, 15) - below eyes
  GAA AGG            ; Push 10
  GAA AAT            ; Push 3
  CCA                ; Draw mouth (10x3 rect)
TAA`,
    difficulty: "intermediate",
    concepts: ["composition", "drawing", "transforms"],
    goodForMutations: ["missense", "nonsense"],
    keywords: ["face", "smiley", "fun", "combine", "shapes"],
  },

  texturedCircle: {
    title: "Textured Circle with Noise",
    description: "Demonstrates NOISE opcode for artistic texture effects",
    genome: `ATG
  GAA TCC            ; Push 53 (radius)
  GAA AAA GAA AAA TTA ; Color(0, 0, 0) black
  GGA                ; Draw circle
  GAA CCC            ; Push 21 (seed)
  GAA CGC            ; Push 25 (intensity)
  GAA CTT GAA CCC GAA CCC TTA ; Color(31, 21, 21) warm
  CTA                ; NOISE(21, 25) - textured effect
  GAA CGT            ; Push 26 (different seed)
  GAA ATT            ; Push 15 (lower intensity)
  GAA AAA GAA CGC GAA CCC TTA ; Color(0, 25, 21) cool
  CTA                ; NOISE(26, 15) - lighter texture
TAA`,
    difficulty: "advanced",
    concepts: ["advanced-opcodes", "colors", "drawing"],
    goodForMutations: ["missense", "frameshift"],
    keywords: ["noise", "texture", "artistic", "advanced", "effects"],
  },

  spiralPattern: {
    title: "Spiral Pattern",
    description: "Geometric spiral using iterative rotation and translation",
    genome: `ATG
  GAA AAT GGA        ; Push 3, draw circle
  GAA ATT AGA        ; Push 15, rotate 15 degrees
  GAA AAT GAA AAA ACA ; Push 3, push 0, translate(3, 0)
  GAA AAT GGA        ; Draw circle
  GAA ATT AGA        ; Rotate 15 degrees
  GAA AGG GAA AAA ACA ; Push 10, push 0, translate(10, 0)
  GAA AAT GGA        ; Draw circle
  GAA ATT AGA        ; Rotate 15 degrees
  GAA AGG GAA AAA ACA ; Push 10, push 0, translate(10, 0)
  GAA AAT GGA        ; Draw circle
  GAA ATT AGA        ; Rotate 15 degrees
  GAA CCC GAA AAA ACA ; Push 21, push 0, translate(21, 0)
  GAA AAT GGA        ; Draw circle
TAA`,
    difficulty: "advanced",
    concepts: ["composition", "transforms", "drawing"],
    goodForMutations: ["silent", "frameshift"],
    keywords: ["spiral", "geometric", "iteration", "pattern"],
  },

  nestedFrames: {
    title: "Nested Frames with State",
    description: "SAVE_STATE/RESTORE_STATE for complex layered compositions",
    genome: `ATG
  ; Draw concentric circles with state preservation
  GAA CTT GAA CTT GAA CTT TTA ; Color(31, 31, 31) bright
  GAA TCC GGA        ; Push 53, draw outer circle

  TCA                ; SAVE_STATE - checkpoint outer
  GAA AAT GAA AAT ACA ; TRANSLATE(3, 3) - offset for middle
  GAA GCC GAA GCC TTA ; Color(37, 37, 0) yellow
  GAA GCC GGA        ; Push 37, draw middle circle

  TCA                ; SAVE_STATE - checkpoint middle
  GAA AAT GAA AAT ACA ; TRANSLATE(3, 3) - offset for inner
  GAA CCC GAA CCC TTA ; Color(21, 21, 0) darker yellow
  GAA CCC GGA        ; Push 21, draw inner circle
  TCG                ; RESTORE_STATE - back to middle

  GAA ATT GAA AAA ACA ; TRANSLATE(6, 0) - draw adjacent
  GAA CCC GGA        ; Push 21, another circle
  TCG                ; RESTORE_STATE - back to outer

  GAA CGC GAA AAA ACA ; TRANSLATE(25, 0) - draw adjacent
  GAA TCC GGA        ; Push 53, another outer circle
TAA`,
    difficulty: "advanced",
    concepts: ["advanced-opcodes", "composition", "colors", "state-management"],
    goodForMutations: ["nonsense", "missense"],
    keywords: ["nested", "layers", "state", "save", "advanced"],
  },

  colorGradient: {
    title: "Color Gradient",
    description: "Systematic color manipulation for gradient effect",
    genome: `ATG
  GAA AAA GAA AAA GAA AAA TTA ; Color(0, 0, 0) black
  GAA AGG GGA        ; Push 10, draw circle
  GAA AGG GAA AAA ACA ; Push 10, push 0, translate(10, 0)
  GAA AAA GAA AAA GAA AGG TTA ; Color(0, 0, 10) dark gray
  GAA AGG GGA        ; Draw circle
  GAA AGG GAA AAA ACA ; Translate(10, 0)
  GAA AAA GAA AAA GAA CCC TTA ; Color(0, 0, 21) medium gray
  GAA AGG GGA        ; Draw circle
  GAA AGG GAA AAA ACA ; Translate(10, 0)
  GAA AAA GAA AAA GAA CGC TTA ; Color(0, 0, 25) light gray
  GAA AGG GGA        ; Draw circle
  GAA AGG GAA AAA ACA ; Translate(10, 0)
  GAA AAA GAA AAA GAA GCC TTA ; Color(0, 0, 37) lighter
  GAA AGG GGA        ; Draw circle
TAA`,
    difficulty: "intermediate",
    concepts: ["colors", "drawing", "transforms", "composition"],
    goodForMutations: ["silent", "frameshift"],
    keywords: ["gradient", "color", "progression", "smooth"],
  },

  silentMutation: {
    title: "Silent Mutation Demo",
    description: "Pedagogical: GGA vs GGC (synonymous CIRCLE codons)",
    genome: `ATG
  GAA CCC GAA CTT GAA AAA TTA ; Color(21, 31, 0) green
  GAA CGC GGA        ; Push 25, CIRCLE using GGA
  GAA GCC GAA AAA ACA ; Push 37, push 0, translate(37, 0)
  GAA CCC GAA CTT GAA AAA TTA ; Color(21, 31, 0) same green
  GAA CGC GGC        ; Push 25, CIRCLE using GGC (synonymous!)
TAA
; Note: Both circles identical - demonstrates silent mutation`,
    difficulty: "beginner",
    concepts: ["drawing", "colors"],
    goodForMutations: ["silent"],
    keywords: ["silent", "mutation", "pedagogical", "demo", "synonymous"],
  },

  gridPattern: {
    title: "Grid Pattern",
    description: "Systematic positioning with TRANSLATE for grid layout",
    genome: `ATG
  GAA AAT GCA        ; Push 3, draw triangle
  GAA AGG GAA AAA ACA ; Push 10, push 0, translate(10, 0)
  GAA AAT GCA        ; Draw triangle
  GAA AGG GAA AAA ACA ; Translate(10, 0)
  GAA AAT GCA        ; Draw triangle
  GAA AAA GAA AGG ACA ; Push 0, push 10, translate(0, 10) - down
  GAA AAT GCA        ; Draw triangle
  GAA AAA GAA AAA     ; Push 0, push 0 (prepare negative)
  GAA CCC TAT ACA     ; Push 21, POP (discard), translate(0, 0) - reset x
  GAA AGG GAA AAA ACA ; Translate(10, 0)
  GAA AAT GCA        ; Draw triangle
TAA`,
    difficulty: "advanced",
    concepts: ["composition", "transforms", "stack"],
    goodForMutations: ["frameshift", "nonsense"],
    keywords: ["grid", "layout", "systematic", "positioning"],
  },

  mandala: {
    title: "Mandala Pattern",
    description: "Complex radial symmetry with multiple transforms",
    genome: `ATG
  GAA CCC            ; Push 21
  GAA AAA GAA AAA TTA ; Color(0, 0, 0) black
  GAA AGG GGA        ; Push 10, draw center circle
  GAA GGA AGA        ; Push 26, rotate 26 degrees
  GAA CCC GAA AAA ACA ; Push 21, push 0, translate(21, 0)
  GAA ATT GAA CGC TTA ; Color(15, 25, 0) petal color
  GAA AAT GCA        ; Push 3, draw small triangle
  GAA GGA AGA        ; Rotate 26 degrees
  GAA CCC GAA AAA ACA ; Translate(21, 0)
  GAA AAT GCA        ; Draw triangle
  GAA GGA AGA        ; Rotate 26 degrees
  GAA CCC GAA AAA ACA ; Translate(21, 0)
  GAA AAT GCA        ; Draw triangle
  GAA GGA AGA        ; Rotate 26 degrees
  GAA CCC GAA AAA ACA ; Translate(21, 0)
  GAA AAT GCA        ; Draw triangle
TAA`,
    difficulty: "advanced",
    concepts: ["composition", "colors", "transforms"],
    goodForMutations: ["silent", "missense", "frameshift"],
    keywords: ["mandala", "radial", "symmetry", "complex", "artistic"],
  },

  stackCleanup: {
    title: "Stack Cleanup with POP",
    description: "Demonstrates POP for stack management and cleanup",
    genome: `ATG
  GAA CCC            ; Push 21
  GAA CGC            ; Push 25
  GAA ATT            ; Push 15
  TAT                ; POP - remove 15
  TCA                ; POP - remove 25
  ; Now stack has only 21
  GAA CCC GAA CCC GAA CCC TTA ; Color(21, 21, 21) using that 21
  GAA AGG GGA        ; Push 10, draw circle
  GAA GCC            ; Push 37
  GAA CCC            ; Push 21
  TGT                ; SWAP → stack: [21, 37]
  TAC                ; POP 37
  ; Stack now has 21 for radius
  GGA                ; Draw circle with radius 21
TAA`,
    difficulty: "intermediate",
    concepts: ["stack", "drawing"],
    goodForMutations: ["nonsense", "frameshift"],
    keywords: ["stack", "cleanup", "pop", "management", "operations"],
  },

  fractalTree: {
    title: "Fractal Tree",
    description:
      "Branching tree structure using SAVE/RESTORE_STATE for recursion",
    genome: `ATG
  ; Setup: rotate to vertical, set brown color for trunk
  GAA GGA AGA        ; Push 26, rotate 90 degrees (vertical)
  GAA AAA GAA AAA GAA ATT TTA ; Color(0, 0, 15) brown
  GAA CCC AAA        ; Push 21, draw trunk LINE

  ; Left main branch
  TCA                ; SAVE_STATE - checkpoint trunk
  GAA AAA GAA AAA GAA CCC TTA ; Color(0, 0, 21) green
  GAA CTT AGA        ; Push 31, rotate -30° (left)
  GAA AGG GAA AAA ACA ; Push 10, push 0, translate forward
  GAA AGG AAA        ; Push 10, draw branch LINE

  ; Left sub-branch 1
  TCA                ; SAVE_STATE - checkpoint left branch
  GAA CCC AGA        ; Push 21, rotate more left
  GAA ATT GAA AAA ACA ; Push 15, push 0, translate
  GAA AAT AAA        ; Push 3, draw tiny branch
  TCG                ; RESTORE_STATE - back to left branch

  ; Left sub-branch 2
  TCA                ; SAVE_STATE
  GAA CCC AGA        ; Push 21, rotate right
  GAA ATT GAA AAA ACA ; Push 15, push 0, translate
  GAA AAT AAA        ; Push 3, draw tiny branch
  TCG                ; RESTORE_STATE

  TCG                ; RESTORE_STATE - back to trunk

  ; Right main branch
  TCA                ; SAVE_STATE - checkpoint trunk again
  GAA AAA GAA AAA GAA CCC TTA ; Color(0, 0, 21) green
  GAA ATT AGA        ; Push 15, rotate +30° (right)
  GAA AGG GAA AAA ACA ; Push 10, push 0, translate forward
  GAA AGG AAA        ; Push 10, draw branch LINE

  ; Right sub-branch 1
  TCA                ; SAVE_STATE - checkpoint right branch
  GAA AGG AGA        ; Push 10, rotate left
  GAA ATT GAA AAA ACA ; Push 15, push 0, translate
  GAA AAT AAA        ; Push 3, draw tiny branch
  TCG                ; RESTORE_STATE - back to right branch

  ; Right sub-branch 2
  TCA                ; SAVE_STATE
  GAA CCC AGA        ; Push 21, rotate right
  GAA ATT GAA AAA ACA ; Push 15, push 0, translate
  GAA AAT AAA        ; Push 3, draw tiny branch
  TCG                ; RESTORE_STATE

  TCG                ; RESTORE_STATE - back to trunk
TAA`,
    difficulty: "advanced",
    concepts: ["state-management", "composition", "colors", "transforms"],
    goodForMutations: ["nonsense", "missense"],
    keywords: ["fractal", "tree", "branching", "recursion", "nature", "nested"],
  },

  snowflake: {
    title: "Snowflake Pattern",
    description: "Six-fold radial symmetry using state preservation",
    genome: `ATG
  ; Center dot
  GAA AAA GAA AAA GAA TCC TTA ; Color(0, 0, 53) light blue
  GAA AAT GGA        ; Push 3, draw center circle

  ; Arm 1
  TCA                ; SAVE_STATE
  GAA AAA GAA AAA GAA CTT TTA ; Color(0, 0, 31) white
  GAA CCC GAA AAA ACA ; Push 21, push 0, translate outward
  GAA AGG AAA        ; Push 10, draw arm LINE
  GAA AAT GAA AAT ACA ; Push 3, push 3, translate to tip
  GAA AAT GCA        ; Push 3, draw tip TRIANGLE
  TCG                ; RESTORE_STATE

  ; Arm 2
  TCA                ; SAVE_STATE
  GAA GCC AGA        ; Push 37, rotate 60°
  GAA CCC GAA AAA ACA ; Push 21, push 0, translate
  GAA AGG AAA        ; Push 10, draw arm
  GAA AAT GAA AAT ACA ; Push 3, push 3, translate
  GAA AAT GCA        ; Push 3, draw tip
  TCG                ; RESTORE_STATE

  ; Arm 3
  TCA                ; SAVE_STATE
  GAA GCC AGA        ; Rotate 60° more
  GAA GCC AGA        ; Total 120°
  GAA CCC GAA AAA ACA ; Push 21, push 0, translate
  GAA AGG AAA        ; Draw arm
  GAA AAT GAA AAT ACA ; Translate
  GAA AAT GCA        ; Draw tip
  TCG                ; RESTORE_STATE

  ; Arm 4
  TCA                ; SAVE_STATE
  GAA GCC AGA GAA GCC AGA GAA GCC AGA ; Rotate 180°
  GAA CCC GAA AAA ACA ; Translate
  GAA AGG AAA        ; Draw arm
  GAA AAT GAA AAT ACA ; Translate
  GAA AAT GCA        ; Draw tip
  TCG                ; RESTORE_STATE

  ; Arm 5
  TCA                ; SAVE_STATE
  GAA GCC AGA GAA GCC AGA GAA GCC AGA GAA GCC AGA ; Rotate 240°
  GAA CCC GAA AAA ACA ; Translate
  GAA AGG AAA        ; Draw arm
  GAA AAT GAA AAT ACA ; Translate
  GAA AAT GCA        ; Draw tip
  TCG                ; RESTORE_STATE

  ; Arm 6
  TCA                ; SAVE_STATE
  GAA GCC AGA GAA GCC AGA GAA GCC AGA GAA GCC AGA GAA GCC AGA ; Rotate 300°
  GAA CCC GAA AAA ACA ; Translate
  GAA AGG AAA        ; Draw arm
  GAA AAT GAA AAT ACA ; Translate
  GAA AAT GCA        ; Draw tip
  TCG                ; RESTORE_STATE
TAA`,
    difficulty: "advanced",
    concepts: ["state-management", "composition", "colors", "transforms"],
    goodForMutations: ["nonsense", "frameshift"],
    keywords: [
      "snowflake",
      "radial",
      "symmetry",
      "winter",
      "pattern",
      "six-fold",
    ],
  },

  flowerGarden: {
    title: "Flower Garden",
    description: "Multiple flowers using state isolation for composition",
    genome: `ATG
  ; Flower 1 (red, left position)
  TCA                ; SAVE_STATE - main canvas state
  GAA AAA GAA CCC ACA ; Push 0, push 21, translate left
  GAA CTT GAA AAA GAA AAA TTA ; Color(31, 0, 0) red
  GAA AGG GGA        ; Push 10, draw center circle

  ; Petals for flower 1
  TCA                ; SAVE_STATE - flower center
  GAA AAA GAA AGG ACA ; Push 0, push 10, translate up
  GAA AAT GCA        ; Push 3, draw petal TRIANGLE
  TCG                ; RESTORE_STATE
  TCA GAA AGG GAA AAA ACA GAA AAT GCA TCG ; Right petal
  TCA GAA AAA GAA AGG ACA GAA AAT GCA TCG ; Down petal (negative y)

  ; Stem for flower 1
  GAA AAA GAA AAA GAA AGG TTA ; Color(0, 0, 10) dark green
  GAA AAA GAA AGG ACA ; Push 0, push 10, translate down
  GAA AGG AAA        ; Push 10, draw stem LINE
  TCG                ; RESTORE_STATE - back to main

  ; Flower 2 (yellow, center)
  TCA                ; SAVE_STATE
  GAA CCC GAA AAA ACA ; Push 21, push 0, translate center
  GAA CTT GAA CTT GAA AAA TTA ; Color(31, 31, 0) yellow
  GAA AGG GGA        ; Push 10, draw center

  ; Petals for flower 2
  TCA GAA AAA GAA AGG ACA GAA AAT GCA TCG ; Up
  TCA GAA AGG GAA AAA ACA GAA AAT GCA TCG ; Right
  TCA GAA AAA GAA AGG ACA GAA AAT GCA TCG ; Down
  TCA GAA AGG GAA AAA ACA GAA AAT GCA TCG ; Left (negative x)

  ; Stem
  GAA AAA GAA AAA GAA AGG TTA ; Green
  GAA AAA GAA AGG ACA GAA AGG AAA TCG ; Stem
  TCG                ; RESTORE_STATE

  ; Flower 3 (purple, right)
  TCA                ; SAVE_STATE
  GAA GCC GAA AAA ACA ; Push 37, push 0, translate right
  GAA CCC GAA AAA GAA CCC TTA ; Color(21, 0, 21) purple
  GAA AGG GGA        ; Draw center

  ; Petals
  TCA GAA AAA GAA AGG ACA GAA AAT GCA TCG
  TCA GAA AGG GAA AAA ACA GAA AAT GCA TCG

  ; Stem
  GAA AAA GAA AAA GAA AGG TTA ; Green
  GAA AAA GAA AGG ACA GAA AGG AAA TCG
  TCG                ; RESTORE_STATE
TAA`,
    difficulty: "advanced",
    concepts: ["state-management", "composition", "colors", "transforms"],
    goodForMutations: ["missense", "nonsense"],
    keywords: [
      "flower",
      "garden",
      "nature",
      "composition",
      "multiple",
      "colorful",
    ],
  },

  parametricCircles: {
    title: "Parametric Circles",
    description:
      "Computed circle sizes using ADD and MUL arithmetic operations",
    genome: `; Demonstrate arithmetic operations for parametric design
ATG
  ; Small circle with computed radius (1 + 5 = 6)
  GAA AAC            ; PUSH 1
  GAA ACT            ; PUSH 5
  CTG                ; ADD → 6
  GGA                ; CIRCLE(6) - radius computed!

  ; Move right
  GAA CCC GAA AAA ACA ; PUSH 21, PUSH 0, TRANSLATE

  ; Medium circle with multiplication (3 × 3 = 9)
  GAA AAT            ; PUSH 3
  GAA AAT            ; PUSH 3
  CTT                ; MUL → 9
  GGA                ; CIRCLE(9) - scaled by multiplication

  ; Move right again
  GAA CCC GAA AAA ACA ; PUSH 21, PUSH 0, TRANSLATE

  ; Large circle with chained operations ((5 + 3) × 5 = 40)
  GAA ACT            ; PUSH 5
  GAA AAT            ; PUSH 3
  CTG                ; ADD → 8
  GAA ACT            ; PUSH 5
  CTT                ; MUL → 40
  GGA                ; CIRCLE(40) - computed from chain
TAA`,
    difficulty: "intermediate",
    concepts: ["arithmetic", "drawing", "transforms", "stack"],
    goodForMutations: ["missense"],
    keywords: [
      "arithmetic",
      "computation",
      "parametric",
      "add",
      "multiply",
      "computed",
      "math",
    ],
  },

  geometricSeries: {
    title: "Geometric Series",
    description:
      "Growing circles using multiplication to create exponential patterns",
    genome: `; Geometric progression using MUL opcode
ATG
  ; Circle 1: base size 5
  GAA ACT            ; PUSH 5
  ATA                ; DUP (keep for computation)
  GGA                ; CIRCLE(5)

  ; Move down
  GAA AAA GAA AGG ACA ; PUSH 0, PUSH 10, TRANSLATE

  ; Circle 2: size × 2 = 10
  GAA ACT            ; PUSH 5
  ATA                ; DUP base
  GAA ACT            ; PUSH 5
  CTT                ; MUL → 25
  GGA                ; CIRCLE(25)

  ; Move down
  GAA AAA GAA CCC ACA ; PUSH 0, PUSH 21, TRANSLATE

  ; Circle 3: exponential growth
  GAA ACT            ; PUSH 5
  GAA ATT            ; PUSH 7
  CTT                ; MUL → 35
  GGA                ; CIRCLE(35)
TAA`,
    difficulty: "intermediate",
    concepts: ["arithmetic", "drawing", "transforms", "stack"],
    goodForMutations: ["missense"],
    keywords: [
      "geometric",
      "series",
      "exponential",
      "growth",
      "multiply",
      "pattern",
      "math",
    ],
  },

  proportionalSizing: {
    title: "Proportional Sizing",
    description:
      "Circles with ratios computed using division for proportional design",
    genome: `; Demonstrate proportional sizing with DIV opcode
ATG
  ; Large circle: base size 40
  GAA TCA            ; PUSH 40
  GGA                ; CIRCLE(40) - full size

  ; Move right
  GAA TCC GAA AAA ACA ; PUSH 52, PUSH 0, TRANSLATE

  ; Medium circle: half size (40 / 2 = 20)
  GAA TCA            ; PUSH 40
  GAA AAG            ; PUSH 2
  CAT                ; DIV → 20
  GGA                ; CIRCLE(20) - half radius

  ; Move right again
  GAA TCC GAA AAA ACA ; PUSH 52, PUSH 0, TRANSLATE

  ; Small circle: quarter size (40 / 4 = 10)
  GAA TCA            ; PUSH 40
  GAA AGA            ; PUSH 4
  CAT                ; DIV → 10
  GGA                ; CIRCLE(10) - quarter radius
TAA`,
    difficulty: "intermediate",
    concepts: ["arithmetic", "drawing", "transforms", "stack"],
    goodForMutations: ["missense"],
    keywords: [
      "proportions",
      "ratios",
      "division",
      "scaling",
      "relative",
      "fractions",
      "math",
    ],
  },

  relativeSizes: {
    title: "Relative Sizes",
    description: "Descending circle sizes using subtraction for gradients",
    genome: `; Demonstrate relative sizing with SUB opcode
ATG
  ; Circle 1: base size 35
  GAA TGT            ; PUSH 35
  GGA                ; CIRCLE(35) - largest

  ; Move down
  GAA AAA GAA AGG ACA ; PUSH 0, PUSH 10, TRANSLATE

  ; Circle 2: base - 5 = 30
  GAA TGT            ; PUSH 35
  GAA ACT            ; PUSH 5
  CAG                ; SUB → 30
  GGA                ; CIRCLE(30)

  ; Move down
  GAA AAA GAA AGG ACA ; PUSH 0, PUSH 10, TRANSLATE

  ; Circle 3: base - 10 = 25
  GAA TGT            ; PUSH 35
  GAA AGG            ; PUSH 10
  CAG                ; SUB → 25
  GGA                ; CIRCLE(25)

  ; Move down
  GAA AAA GAA AGG ACA ; PUSH 0, PUSH 10, TRANSLATE

  ; Circle 4: base - 15 = 20
  GAA TGT            ; PUSH 35
  GAA ATT            ; PUSH 15
  CAG                ; SUB → 20
  GGA                ; CIRCLE(20) - smallest
TAA`,
    difficulty: "intermediate",
    concepts: ["arithmetic", "drawing", "transforms", "stack"],
    goodForMutations: ["missense"],
    keywords: [
      "subtraction",
      "differences",
      "offsets",
      "relative",
      "gradients",
      "pattern",
      "math",
    ],
  },

  centeredComposition: {
    title: "Centered Composition",
    description:
      "Symmetrical design using division to compute center positions",
    genome: `; Center a composition using DIV for coordinate calculation
ATG
  ; Compute center x (canvas assumed 400 wide → 200 center)
  ; Using literal 32 (= 200 in canvas coords: 32/64 * 400 = 200)

  ; Draw center circle
  GAA CGC            ; PUSH 50 (diameter)
  GAA AAG            ; PUSH 2
  CAT                ; DIV → 25 (radius)
  GGA                ; CIRCLE(25) at center

  ; Offset for smaller circles (compute spacing)
  GAA TGT            ; PUSH 35
  GAA AAG            ; PUSH 2
  CAT                ; DIV → 17 (half spacing)

  ; Move right by computed offset
  GAA AAA ACA        ; PUSH 0, [offset on stack], TRANSLATE

  GAA ATT            ; PUSH 15
  GGA                ; CIRCLE(15) - right accent

  ; Return to center and go left
  GAA AAA GAA TGT CAG ; PUSH 0, PUSH 35, SUB → -35
  ACA                ; TRANSLATE(-35, 0)

  GAA ATT            ; PUSH 15
  GGA                ; CIRCLE(15) - left accent (symmetry)
TAA`,
    difficulty: "advanced",
    concepts: ["arithmetic", "drawing", "transforms", "stack", "composition"],
    goodForMutations: ["missense"],
    keywords: [
      "centering",
      "symmetry",
      "division",
      "composition",
      "layout",
      "coordinates",
      "math",
    ],
  },

  loopRosette: {
    title: "Loop Rosette",
    description:
      "Radial flower pattern using LOOP opcode for efficient repetition",
    genome: `; Rosette with 8 petals using LOOP opcode
ATG
  ; Draw one petal and rotate - this sequence will be looped
  GAA AGG            ; PUSH 10 (radius)
  GGA                ; CIRCLE (1 petal)
  GAA TCA            ; PUSH 45 (360/8 degrees per petal)
  AGA                ; ROTATE

  ; Loop the above 4 instructions (PUSH, CIRCLE, PUSH, ROTATE) 7 more times
  GAA ATT            ; PUSH 4 (instruction count)
  GAA AAC            ; PUSH 7 (loop count = 7 more petals, 8 total)
  CAA                ; LOOP
TAA`,
    difficulty: "intermediate",
    concepts: ["drawing", "transforms", "stack", "arithmetic"],
    goodForMutations: ["missense", "frameshift"],
    keywords: [
      "loop",
      "iteration",
      "rosette",
      "radial",
      "pattern",
      "repetition",
      "efficiency",
    ],
  },

  loopSpiral: {
    title: "Loop Spiral",
    description: "Expanding spiral pattern using LOOP with arithmetic",
    genome: `; Spiral using LOOP to repeat circle + translate pattern
ATG
  ; Initial small circle with offset
  GAA AAT            ; PUSH 3 (initial radius)
  GGA                ; CIRCLE
  GAA ACT            ; PUSH 5 (step distance)
  GAA AAA            ; PUSH 0 (dy)
  ACA                ; TRANSLATE(5, 0)

  ; Loop the pattern (PUSH, CIRCLE, PUSH, PUSH, TRANSLATE) 10 times
  GAA ACT            ; PUSH 5 (instruction count)
  GAA AGG            ; PUSH 10 (loop count)
  CAA                ; LOOP

  ; Result: 11 circles in a line (1 + 10 loops)
TAA`,
    difficulty: "intermediate",
    concepts: ["drawing", "transforms", "stack", "arithmetic"],
    goodForMutations: ["missense"],
    keywords: ["loop", "spiral", "iteration", "translate", "pattern", "growth"],
  },

  loopGrid: {
    title: "Loop Grid",
    description: "Grid of shapes created with efficient LOOP patterns",
    genome: `; Simple row of circles using LOOP
ATG
  ; Draw circle and move right
  GAA ACT            ; PUSH 5 (radius)
  GGA                ; CIRCLE
  GAA AGG            ; PUSH 10 (spacing)
  GAA AAA            ; PUSH 0 (dy)
  ACA                ; TRANSLATE(10, 0)

  ; Repeat the pattern 6 times (7 circles total in a row)
  GAA ACT            ; PUSH 5 (instruction count: PUSH+CIRCLE+PUSH+PUSH+TRANSLATE)
  GAA AAC            ; PUSH 6 (loop count)
  CAA                ; LOOP
TAA`,
    difficulty: "intermediate",
    concepts: ["drawing", "transforms", "stack"],
    goodForMutations: ["missense", "frameshift"],
    keywords: ["loop", "grid", "pattern", "row", "repetition", "translate"],
  },

  fibonacciSpiral: {
    title: "Fibonacci Spiral",
    description:
      "Mathematical golden ratio spiral using arithmetic and LOOP for elegant composition",
    genome: `; Fibonacci-inspired spiral: each square grows following 1,1,2,3,5,8,13...
; Using approximation within 0-63 literal range
ATG
  ; Square 1: size 3
  GAA AAT            ; PUSH 3
  ATA                ; DUP for rect
  CCA                ; RECT(3, 3)
  GAA CGG AGA        ; PUSH 26, ROTATE ~90° (quarter turn)
  GAA AAT GAA AAA ACA ; PUSH 3, PUSH 0, TRANSLATE(3, 0)

  ; Square 2: size 3 (Fibonacci: 1+1=2, but using 3 for visibility)
  GAA AAT ATA CCA    ; PUSH 3, DUP, RECT(3, 3)
  GAA CGG AGA        ; ROTATE 90°
  GAA AAT GAA AAA ACA ; TRANSLATE(3, 0)

  ; Square 3: size 6 (Fibonacci: 3+3=6)
  GAA ACG            ; PUSH 6
  ATA CCA            ; DUP, RECT(6, 6)
  GAA CGG AGA        ; ROTATE 90°
  GAA ACG GAA AAA ACA ; TRANSLATE(6, 0)

  ; Square 4: size 9 (3+6=9)
  GAA AGC            ; PUSH 9
  ATA CCA            ; DUP, RECT(9, 9)
  GAA CGG AGA        ; ROTATE 90°
  GAA AGC GAA AAA ACA ; TRANSLATE(9, 0)

  ; Square 5: size 15 (6+9=15)
  GAA ATT            ; PUSH 15
  ATA CCA            ; DUP, RECT(15, 15)
  GAA CGG AGA        ; ROTATE 90°
  GAA ATT GAA AAA ACA ; TRANSLATE(15, 0)

  ; Square 6: size 24 (9+15=24) - computed
  GAA ATT            ; PUSH 15
  GAA AGC            ; PUSH 9
  CTG                ; ADD → 24
  ATA CCA            ; DUP, RECT(24, 24)

TAA`,
    difficulty: "advanced-showcase",
    concepts: ["arithmetic", "drawing", "transforms", "composition", "stack"],
    goodForMutations: ["missense"],
    keywords: [
      "fibonacci",
      "spiral",
      "golden",
      "ratio",
      "mathematical",
      "elegant",
      "sequence",
      "masterpiece",
    ],
  },

  goldenMandala: {
    title: "Golden Mandala",
    description:
      "Multi-layered sacred geometry using LOOP and computed golden ratio proportions",
    genome: `; Golden ratio mandala with phi-proportioned layers
; Inner circle radius = 10, middle = 16 (~10×1.6), outer = 26 (~16×1.6)
ATG
  ; Layer 1: Center circle (black core)
  GAA AAA GAA AAA GAA AAA TTA ; COLOR(0, 0, 0) black
  GAA AGG            ; PUSH 10
  GGA                ; CIRCLE(10)

  ; Layer 2: Middle ring with 8 petals (golden-proportioned radius)
  GAA AGG            ; PUSH 10 (base)
  GAA ACG            ; PUSH 6
  CTG                ; ADD → 16 (~golden ratio)
  GAA CTT GAA CTT GAA AAA TTA ; COLOR(31, 31, 0) gold

  ; Petal + rotate pattern for LOOP
  GAA ATT            ; PUSH 16 (offset distance)
  GAA AAA ACA        ; PUSH 0, TRANSLATE(16, 0)
  GAA AAT            ; PUSH 3 (petal size)
  GCA                ; TRIANGLE
  GAA GTC            ; PUSH 45 (360/8 degrees)
  AGA                ; ROTATE

  ; Loop 7 more times (8 total petals)
  GAA ACG            ; PUSH 6 (instructions: PUSH+PUSH+TRANSLATE+PUSH+TRIANGLE+PUSH+ROTATE)
  GAA AAC            ; PUSH 7 (loop count)
  CAA                ; LOOP

  ; Layer 3: Outer ring with 12 dots (golden-proportioned radius)
  GAA ATT            ; PUSH 15
  GAA AGG            ; PUSH 10
  CTG                ; ADD → 25 (outer radius)
  GAA AAC            ; PUSH 1
  CTG                ; ADD → 26
  GAA CCC GAA AAA GAA CCC TTA ; COLOR(21, 0, 21) purple

  ; Dot + rotate pattern
  GAA CGG            ; PUSH 26 (offset)
  GAA AAA ACA        ; PUSH 0, TRANSLATE(26, 0)
  GAA AAC            ; PUSH 1 (tiny dot)
  GGA                ; CIRCLE
  GAA CTG            ; PUSH 30 (360/12 degrees)
  AGA                ; ROTATE

  ; Loop 11 more times (12 total dots)
  GAA ACG            ; PUSH 6 (instructions)
  GAA AGT            ; PUSH 11 (loop count)
  CAA                ; LOOP
TAA`,
    difficulty: "advanced-showcase",
    concepts: [
      "arithmetic",
      "drawing",
      "transforms",
      "colors",
      "composition",
      "stack",
    ],
    goodForMutations: ["silent", "missense"],
    keywords: [
      "mandala",
      "golden",
      "ratio",
      "sacred",
      "geometry",
      "layers",
      "phi",
      "radial",
      "masterpiece",
    ],
  },

  parametricStar: {
    title: "Parametric Star",
    description:
      "Mathematical star curve using LOOP with computed radius variations",
    genome: `; Parametric star with varying radius (r = base + amplitude × sin-like pattern)
; Approximating sine with discrete 8-point pattern: 0, 7, 10, 7, 0, -7, -10, -7
ATG
  ; Base radius = 20, amplitude = 10 (radius varies 10-30)
  ; Point 1: r = 20 + 10 = 30 (peak)
  GAA CTG            ; PUSH 30
  GAA CTT GAA AAA GAA AAA TTA ; COLOR(31, 0, 0) red
  GGA                ; CIRCLE(30)
  GAA GTC            ; PUSH 45 (360/8 degrees)
  AGA                ; ROTATE

  ; Point 2: r = 20 + 7 = 27 (descending)
  GAA CGT            ; PUSH 27
  GAA CTT GAA CGC GAA AAA TTA ; COLOR(31, 25, 0) orange
  GGA                ; CIRCLE(27)
  GAA GTC AGA        ; ROTATE 45°

  ; Point 3: r = 20 + 0 = 20 (valley)
  GAA CCA            ; PUSH 20
  GAA CTT GAA CTT GAA AAA TTA ; COLOR(31, 31, 0) yellow
  GGA                ; CIRCLE(20)
  GAA GTC AGA        ; ROTATE 45°

  ; Point 4: r = 20 - 7 = 13 (deep valley)
  GAA ATC            ; PUSH 13
  GAA AAA GAA CTT GAA AAA TTA ; COLOR(0, 31, 0) green
  GGA                ; CIRCLE(13)
  GAA GTC AGA        ; ROTATE 45°

  ; Point 5: r = 20 - 10 = 10 (deepest)
  GAA AGG            ; PUSH 10
  GAA AAA GAA CTT GAA CCC TTA ; COLOR(0, 31, 21) cyan
  GGA                ; CIRCLE(10)
  GAA GTC AGA        ; ROTATE 45°

  ; Point 6: r = 20 - 7 = 13 (ascending)
  GAA ATC            ; PUSH 13
  GAA AAA GAA AAA GAA CTT TTA ; COLOR(0, 0, 31) blue
  GGA                ; CIRCLE(13)
  GAA GTC AGA        ; ROTATE 45°

  ; Point 7: r = 20 + 0 = 20 (mid)
  GAA CCA            ; PUSH 20
  GAA CCC GAA AAA GAA CCC TTA ; COLOR(21, 0, 21) purple
  GGA                ; CIRCLE(20)
  GAA GTC AGA        ; ROTATE 45°

  ; Point 8: r = 20 + 7 = 27 (peak approach)
  GAA CGT            ; PUSH 27
  GAA CTT GAA AAA GAA CCC TTA ; COLOR(31, 0, 21) magenta
  GGA                ; CIRCLE(27)
  GAA GTC AGA        ; ROTATE 45° (completes circle)
TAA`,
    difficulty: "advanced-showcase",
    concepts: ["arithmetic", "drawing", "transforms", "colors", "composition"],
    goodForMutations: ["silent", "missense"],
    keywords: [
      "parametric",
      "star",
      "rose",
      "curve",
      "mathematical",
      "trigonometric",
      "rainbow",
      "colorful",
      "masterpiece",
    ],
  },

  comparisonDemo: {
    title: "Comparison Logic",
    description:
      "Demonstrates EQ (equality) and LT (less than) comparison opcodes producing boolean results",
    genome: `; Comparison opcodes: EQ and LT
; Stack convention: comparisons push 1 (true) or 0 (false)
ATG
  ; Test 1: Equality - draw circle if 5 == 5 (true)
  GAA AAT            ; PUSH 5
  GAA AAT            ; PUSH 5
  CTA                ; EQ → pushes 1 (true)
  ; Result on stack: [1]
  ; Multiply by 10 to get visible radius
  GAA AGG            ; PUSH 10
  CTT                ; MUL → 1 × 10 = 10
  GGA                ; CIRCLE(10) - visible because result was 1

  ; Move right for next test
  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Test 2: Inequality - draw circle if 3 == 7 (false)
  GAA AGC            ; PUSH 3
  GAA ATA            ; PUSH 7
  CTA                ; EQ → pushes 0 (false)
  ; Result on stack: [0]
  GAA AGG            ; PUSH 10
  CTT                ; MUL → 0 × 10 = 0
  GGA                ; CIRCLE(0) - invisible because result was 0

  ; Move right for next test
  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Test 3: Less than - draw circle if 3 < 7 (true)
  GAA AGC            ; PUSH 3
  GAA ATA            ; PUSH 7
  CTC                ; LT → pushes 1 (true)
  ; Result on stack: [1]
  GAA AGG            ; PUSH 10
  CTT                ; MUL → 1 × 10 = 10
  GGA                ; CIRCLE(10) - visible because result was 1

  ; Move right for next test
  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Test 4: Not less than - draw circle if 7 < 3 (false)
  GAA ATA            ; PUSH 7
  GAA AGC            ; PUSH 3
  CTC                ; LT → pushes 0 (false)
  ; Result on stack: [0]
  GAA AGG            ; PUSH 10
  CTT                ; MUL → 0 × 10 = 0
  GGA                ; CIRCLE(0) - invisible because result was 0

  ; Demonstrates: EQ produces 1 or 0, LT produces 1 or 0
  ; Pattern: visible circle = true, invisible = false
TAA`,
    difficulty: "advanced",
    concepts: ["comparison", "logic", "arithmetic", "drawing", "stack"],
    goodForMutations: ["missense"],
    keywords: [
      "comparison",
      "equality",
      "less-than",
      "boolean",
      "logic",
      "conditional",
      "true",
      "false",
      "EQ",
      "LT",
    ],
  },

  conditionalRainbow: {
    title: "Conditional Rainbow",
    description:
      "Draws circles conditionally based on arithmetic comparisons - demonstrates boolean-controlled visual output",
    genome: `; Conditional drawing: draw circles only when value exceeds threshold
; Pattern: check if radius > threshold, multiply by result to enable/disable drawing
ATG
  ; Circle 1: radius=3, threshold=5 → 3<5 → false → invisible
  GAA AAT            ; PUSH 3 (radius)
  ATA                ; DUP (keep for comparison)
  GAA ACT            ; PUSH 5 (threshold)
  TGG                ; SWAP → stack: [3, 5, 3]
  CTC                ; LT → 1 if 3<5 → [3, 1]
  ; Now: [radius=3, result=1]
  ; Invert logic: 1-result for "greater than" effect
  GAA AAC            ; PUSH 1
  TGG                ; SWAP → [3, 1, 1]
  CAG                ; SUB → 1-1=0 (false, 3 not > 5)
  CTT                ; MUL → 3×0 = 0
  GAA CTT GAA AAA GAA AAA TTA ; COLOR(31, 0, 0) red
  GGA                ; CIRCLE(0) - invisible

  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Circle 2: radius=10, threshold=5 → 10>5 → true → visible
  GAA AGG            ; PUSH 10
  ATA                ; DUP
  GAA ACT            ; PUSH 5
  TGG                ; SWAP
  CTC                ; LT → 1 if 10<5 → 0 (false)
  GAA AAC GAA AAA TTA ; COLOR(1, 0, 0) red
  TGG CAG            ; 1-0=1 (true, 10 > 5)
  CTT                ; MUL → 10×1 = 10
  GAA CTT GAA CGC GAA AAA TTA ; COLOR(31, 25, 0) orange
  GGA                ; CIRCLE(10) - visible!

  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Circle 3: radius=15, threshold=10 → 15>10 → true → visible
  GAA ATT            ; PUSH 15
  ATA                ; DUP
  GAA AGG            ; PUSH 10
  TGG CTC            ; LT → 0 (15 not < 10)
  GAA AAC TGG CAG    ; 1-0=1 (true)
  CTT                ; MUL → 15×1 = 15
  GAA CTT GAA CTT GAA AAA TTA ; COLOR(31, 31, 0) yellow
  GGA                ; CIRCLE(15) - visible!

  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Circle 4: radius=5, threshold=10 → 5<10 → false → invisible
  GAA ACT            ; PUSH 5
  ATA                ; DUP
  GAA AGG            ; PUSH 10
  TGG CTC            ; LT → 1 (5 < 10)
  GAA AAC TGG CAG    ; 1-1=0 (false, 5 not > 10)
  CTT                ; MUL → 5×0 = 0
  GAA AAA GAA CTT GAA AAA TTA ; COLOR(0, 31, 0) green
  GGA                ; CIRCLE(0) - invisible

  ; Pattern: only circles with radius > threshold are drawn
  ; Demonstrates conditional execution via arithmetic multiplication
TAA`,
    difficulty: "advanced-showcase",
    concepts: [
      "comparison",
      "logic",
      "arithmetic",
      "drawing",
      "colors",
      "stack",
    ],
    goodForMutations: ["missense"],
    keywords: [
      "conditional",
      "threshold",
      "comparison",
      "logic",
      "filtering",
      "selective",
      "boolean",
      "rainbow",
      "algorithm",
      "masterpiece",
    ],
  },

  sortingVisualization: {
    title: "Sorting Visualization",
    description:
      "Demonstrates comparison-based sorting logic with visual height bars representing sorted values",
    genome: `; Bubble sort-inspired visualization: compare and swap visual bars
; Three bars with heights 15, 10, 25 → after comparisons: 10, 15, 25 (sorted)
ATG
  ; Initial unsorted bars (heights: 15, 10, 25)
  GAA AAA GAA AAA GAA ATT TTA ; COLOR(0, 0, 15) blue (unsorted)
  
  ; Bar 1: height 15
  GAA ATT            ; PUSH 15
  GAA AAT            ; PUSH 3 (width)
  CCA                ; RECT(3, 15)
  GAA ATT GAA AAA ACA ; TRANSLATE(6, 0)

  ; Bar 2: height 10
  GAA AGG            ; PUSH 10
  GAA AAT            ; PUSH 3
  CCA                ; RECT(3, 10)
  GAA ATT GAA AAA ACA ; TRANSLATE(6, 0)

  ; Bar 3: height 25
  GAA CGC            ; PUSH 25
  GAA AAT            ; PUSH 3
  CCA                ; RECT(3, 25)

  ; Move to second row for "sorted" visualization
  GAA AAA GAA CCC ACA ; TRANSLATE(0, 21) down

  ; Now draw sorted bars (10, 15, 25) in green
  GAA AAA GAA CTT GAA AAA TTA ; COLOR(0, 31, 0) green (sorted)

  ; Compare 15 vs 10: 15>10, so 10 comes first
  ; Sorted bar 1: height 10
  GAA AGG            ; PUSH 10
  GAA AAT            ; PUSH 3
  CCA                ; RECT(3, 10)
  GAA ATT GAA AAA ACA ; TRANSLATE(6, 0)

  ; Sorted bar 2: height 15
  GAA ATT            ; PUSH 15
  GAA AAT            ; PUSH 3
  CCA                ; RECT(3, 15)
  GAA ATT GAA AAA ACA ; TRANSLATE(6, 0)

  ; Sorted bar 3: height 25 (already largest)
  GAA CGC            ; PUSH 25
  GAA AAT            ; PUSH 3
  CCA                ; RECT(3, 25)

  ; Visual: top row (blue) = unsorted, bottom row (green) = sorted
  ; Demonstrates comparison logic applied to data visualization
TAA`,
    difficulty: "advanced-showcase",
    concepts: [
      "comparison",
      "logic",
      "arithmetic",
      "drawing",
      "colors",
      "composition",
    ],
    goodForMutations: ["missense"],
    keywords: [
      "sorting",
      "comparison",
      "algorithm",
      "visualization",
      "bars",
      "data",
      "ordered",
      "computational",
      "masterpiece",
    ],
  },

  collatzSequence: {
    title: "Collatz Conjecture",
    description:
      "Famous unsolved math problem: n→n/2 if even, n→3n+1 if odd, visualized with decreasing circle sizes",
    genome: `; Collatz sequence starting from n=27: 27→82→41→124→62→31→94→47→...
; Visualized as descending circles (simplified, showing first few steps)
; Pattern: large→medium→small demonstrates iterative arithmetic

ATG
  ; Step 1: n=27 (odd → 3n+1 = 82)
  GAA CGT            ; PUSH 27
  GAA CTT GAA AAA GAA AAA TTA ; COLOR(31, 0, 0) red
  GGA                ; CIRCLE(27) - largest (starting value)
  
  GAA AGG GAA AAA ACA ; TRANSLATE(10, 0)

  ; Step 2: n=82 → 82/2=41 (even)
  ; Compute: 27×3=81, 81+1=82, 82/2=41
  GAA CGT            ; PUSH 27
  GAA AAT            ; PUSH 3
  CTT                ; MUL → 81
  GAA AAC            ; PUSH 1
  CTG                ; ADD → 82
  GAA AAG            ; PUSH 2
  CAT                ; DIV → 41
  GAA CTT GAA CGC GAA AAA TTA ; COLOR(31, 25, 0) orange
  GGA                ; CIRCLE(41) - scaled by value
  
  GAA AGG GAA AAA ACA ; TRANSLATE(10, 0)

  ; Step 3: n=41 (odd → 3n+1 = 124, then /2 = 62)
  ; 41×3=123, +1=124, /2=62
  GAA TGC            ; PUSH 41
  GAA AAT            ; PUSH 3
  CTT                ; MUL → 123 (overflow! mod 64)
  ; Note: 123 mod 64 = 59
  GAA AAC            ; PUSH 1
  CTG                ; ADD → 60
  GAA AAG            ; PUSH 2
  CAT                ; DIV → 30
  GAA CTT GAA CTT GAA AAA TTA ; COLOR(31, 31, 0) yellow
  GGA                ; CIRCLE(30)

  GAA AGG GAA AAA ACA ; TRANSLATE(10, 0)

  ; Step 4: continuing pattern with smaller circles
  GAA ATT            ; PUSH 15 (approximate next value)
  GAA AAA GAA CTT GAA AAA TTA ; COLOR(0, 31, 0) green
  GGA                ; CIRCLE(15)

  GAA AGG GAA AAA ACA ; TRANSLATE(10, 0)

  ; Step 5: approaching convergence
  GAA AAC            ; PUSH 7
  GAA AAA GAA AAA GAA CTT TTA ; COLOR(0, 0, 31) blue
  GGA                ; CIRCLE(7)

  GAA AGG GAA AAA ACA ; TRANSLATE(10, 0)

  ; Step 6: final (all sequences reach 1)
  GAA AAC            ; PUSH 1
  GAA CCC GAA AAA GAA CCC TTA ; COLOR(21, 0, 21) purple
  GGA                ; CIRCLE(1) - convergence!

  ; Visual: descending rainbow demonstrates iterative arithmetic
  ; Famous unsolved problem: does every number reach 1?
TAA`,
    difficulty: "advanced-showcase",
    concepts: [
      "arithmetic",
      "comparison",
      "logic",
      "drawing",
      "colors",
      "composition",
    ],
    goodForMutations: ["missense"],
    keywords: [
      "collatz",
      "conjecture",
      "algorithm",
      "iteration",
      "mathematical",
      "unsolved",
      "sequence",
      "computation",
      "famous",
      "masterpiece",
    ],
  },

  euclideanGCD: {
    title: "Euclidean Algorithm (GCD)",
    description:
      "Greatest Common Divisor using subtraction method - fundamental algorithm visualized as shrinking rectangles",
    genome: `; GCD(48, 18) using Euclidean subtraction algorithm
; 48-18=30, 30-18=12, 18-12=6, 12-6=6, 6-6=0 → GCD=6
; Visualized as rectangles shrinking to the common divisor

ATG
  ; Initial: 48×18 rectangle (scaled down by /3 for visibility)
  GAA AAA GAA AAA GAA CTT TTA ; COLOR(31, 0, 0) red
  GAA ATT            ; PUSH 16 (48/3)
  GAA ACG            ; PUSH 6 (18/3)
  CCA                ; RECT(6, 16)

  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Step 1: 48-18=30 → 30×18 rectangle
  GAA AAA GAA AAA GAA CGC TTA ; COLOR(31, 25, 0) orange
  GAA AGG            ; PUSH 10 (30/3)
  GAA ACG            ; PUSH 6
  CCA                ; RECT(6, 10)

  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Step 2: 30-18=12 → 12×18 rectangle
  GAA CTT GAA CTT GAA AAA TTA ; COLOR(31, 31, 0) yellow
  GAA AAA GAA AGA            ; PUSH 4 (12/3)
  GAA ACG            ; PUSH 6
  CCA                ; RECT(6, 4)

  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Step 3: 18-12=6 → 6×12 rectangle
  GAA AAA GAA CTT GAA AAA TTA ; COLOR(0, 31, 0) green
  GAA AAG            ; PUSH 2 (6/3)
  GAA AGA            ; PUSH 4
  CCA                ; RECT(4, 2)

  GAA CCC GAA AAA ACA ; TRANSLATE(21, 0)

  ; Step 4: 12-6=6 → 6×6 square (GCD found!)
  GAA AAA GAA AAA GAA CTT TTA ; COLOR(0, 0, 31) blue
  GAA AAG            ; PUSH 2 (6/3)
  ATA                ; DUP
  CCA                ; RECT(2, 2) - SQUARE indicates GCD!

  ; Final square shows the greatest common divisor
  ; Ancient algorithm (Euclid ~300 BCE) demonstrated visually
TAA`,
    difficulty: "advanced-showcase",
    concepts: [
      "arithmetic",
      "comparison",
      "logic",
      "drawing",
      "colors",
      "composition",
    ],
    goodForMutations: ["missense"],
    keywords: [
      "euclidean",
      "gcd",
      "algorithm",
      "greatest",
      "common",
      "divisor",
      "mathematical",
      "ancient",
      "fundamental",
      "masterpiece",
    ],
  },
};

/**
 * Type-safe keys for accessing examples in the library
 *
 * Provides autocomplete and type checking when accessing examples.
 * Each key corresponds to a unique example in the examples object.
 *
 * @example
 * ```typescript
 * const key: ExampleKey = 'helloCircle';
 * const example = examples[key];
 * ```
 */
export type ExampleKey = keyof typeof examples;
