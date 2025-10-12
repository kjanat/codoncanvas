/**
 * Built-in example genomes for the playground
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'advanced-showcase';
export type Concept =
  | 'drawing'
  | 'transforms'
  | 'colors'
  | 'stack'
  | 'composition'
  | 'advanced-opcodes'
  | 'state-management';
export type MutationType = 'silent' | 'missense' | 'nonsense' | 'frameshift';

export interface ExampleMetadata {
  title: string;
  description: string;
  genome: string;
  difficulty: DifficultyLevel;
  concepts: Concept[];
  goodForMutations: MutationType[];
  keywords: string[];
}

export const examples: Record<string, ExampleMetadata> = {
  helloCircle: {
    title: 'Hello Circle',
    description: 'Minimal example - draws a single circle',
    genome: `ATG GAA AAT GGA TAA`,
    difficulty: 'beginner',
    concepts: ['drawing'],
    goodForMutations: ['silent', 'missense', 'nonsense'],
    keywords: ['simple', 'intro', 'first', 'basic', 'circle']
  },

  twoShapes: {
    title: 'Two Shapes',
    description: 'Circle and rectangle side by side',
    genome: `ATG
  GAA AAT GGA        ; Push 3, draw small circle
  GAA CCC            ; Push 21
  GAA AAA            ; Push 0
  ACA                ; Translate(21, 0) - move right
  GAA AGG GAA AGG CCA ; Push 10, push 10, draw rect
TAA`,
    difficulty: 'beginner',
    concepts: ['drawing', 'transforms'],
    goodForMutations: ['missense', 'frameshift'],
    keywords: ['shapes', 'translate', 'position', 'rectangle']
  },

  colorfulPattern: {
    title: 'Colorful Pattern',
    description: 'Multiple colored shapes with rotation',
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
    difficulty: 'intermediate',
    concepts: ['drawing', 'colors', 'transforms', 'composition'],
    goodForMutations: ['silent', 'missense'],
    keywords: ['color', 'rotation', 'pattern', 'multiple']
  },

  lineArt: {
    title: 'Line Art',
    description: 'Demonstrates LINE primitive with rotation',
    genome: `ATG
  GAA GCC AAA        ; Push 37, draw line
  GAA GGA AGA        ; Push 26, rotate 26 degrees
  GAA GCC AAA        ; Push 37, draw line
  GAA GGA AGA        ; Push 26, rotate 26 degrees
  GAA GCC AAA        ; Push 37, draw line
  GAA GGA AGA        ; Push 26, rotate 26 degrees
  GAA GCC AAA        ; Push 37, draw line
TAA`,
    difficulty: 'beginner',
    concepts: ['drawing', 'transforms'],
    goodForMutations: ['silent', 'frameshift'],
    keywords: ['line', 'rotation', 'repetition', 'angles']
  },

  triangleDemo: {
    title: 'Triangle Demo',
    description: 'Uses TRIANGLE primitive with different sizes',
    genome: `ATG
  GAA AAT GCA        ; Push 3, draw small triangle
  GAA AGG            ; Push 10
  GAA AAA ACA        ; Push 0, translate(10, 0)
  GAA AGG GCA        ; Push 10, draw medium triangle
  GAA AGG            ; Push 10
  GAA AAA ACA        ; Push 0, translate(10, 0)
  GAA CGC GCA        ; Push 25, draw large triangle
TAA`,
    difficulty: 'beginner',
    concepts: ['drawing', 'transforms'],
    goodForMutations: ['missense', 'nonsense'],
    keywords: ['triangle', 'sizes', 'scaling', 'shapes']
  },

  ellipseGallery: {
    title: 'Ellipse Gallery',
    description: 'ELLIPSE primitive with various aspect ratios',
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
    difficulty: 'intermediate',
    concepts: ['drawing', 'transforms'],
    goodForMutations: ['silent', 'missense'],
    keywords: ['ellipse', 'oval', 'aspect', 'ratio']
  },

  scaleTransform: {
    title: 'Scale Transform',
    description: 'Demonstrates SCALE opcode for sizing',
    genome: `ATG
  GAA AAT GGA        ; Push 3, draw tiny circle
  GAA ACC CGA        ; Push 11, scale by 1.7x
  GAA AAT GGA        ; Push 3, draw scaled circle (appears larger)
  GAA ACC CGA        ; Push 11, scale by 1.7x again
  GAA AAT GGA        ; Push 3, draw even larger
TAA`,
    difficulty: 'intermediate',
    concepts: ['transforms', 'drawing'],
    goodForMutations: ['frameshift', 'missense'],
    keywords: ['scale', 'size', 'transform', 'magnify']
  },

  stackOperations: {
    title: 'Stack Operations',
    description: 'DUP and SWAP for efficient stack management',
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
    difficulty: 'intermediate',
    concepts: ['stack', 'drawing'],
    goodForMutations: ['frameshift', 'nonsense'],
    keywords: ['stack', 'dup', 'swap', 'pop', 'operations']
  },

  rosette: {
    title: 'Rosette Pattern',
    description: 'Complex composition with rotation and color',
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
    difficulty: 'advanced',
    concepts: ['composition', 'colors', 'transforms'],
    goodForMutations: ['silent', 'missense', 'frameshift'],
    keywords: ['rosette', 'flower', 'radial', 'colorful', 'pattern']
  },

  face: {
    title: 'Simple Face',
    description: 'Combines primitives to draw a smiley face',
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
    difficulty: 'intermediate',
    concepts: ['composition', 'drawing', 'transforms'],
    goodForMutations: ['missense', 'nonsense'],
    keywords: ['face', 'smiley', 'fun', 'combine', 'shapes']
  },

  texturedCircle: {
    title: 'Textured Circle with Noise',
    description: 'Demonstrates NOISE opcode for artistic texture effects',
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
    difficulty: 'advanced',
    concepts: ['advanced-opcodes', 'colors', 'drawing'],
    goodForMutations: ['missense', 'frameshift'],
    keywords: ['noise', 'texture', 'artistic', 'advanced', 'effects']
  },

  spiralPattern: {
    title: 'Spiral Pattern',
    description: 'Geometric spiral using iterative rotation and translation',
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
    difficulty: 'advanced',
    concepts: ['composition', 'transforms', 'drawing'],
    goodForMutations: ['silent', 'frameshift'],
    keywords: ['spiral', 'geometric', 'iteration', 'pattern']
  },

  nestedFrames: {
    title: 'Nested Frames with State',
    description: 'SAVE_STATE/RESTORE_STATE for complex layered compositions',
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
    difficulty: 'advanced',
    concepts: ['advanced-opcodes', 'composition', 'colors', 'state-management'],
    goodForMutations: ['nonsense', 'missense'],
    keywords: ['nested', 'layers', 'state', 'save', 'advanced']
  },

  colorGradient: {
    title: 'Color Gradient',
    description: 'Systematic color manipulation for gradient effect',
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
    difficulty: 'intermediate',
    concepts: ['colors', 'drawing', 'transforms', 'composition'],
    goodForMutations: ['silent', 'frameshift'],
    keywords: ['gradient', 'color', 'progression', 'smooth']
  },

  silentMutation: {
    title: 'Silent Mutation Demo',
    description: 'Pedagogical: GGA vs GGC (synonymous CIRCLE codons)',
    genome: `ATG
  GAA CCC GAA CTT GAA AAA TTA ; Color(21, 31, 0) green
  GAA CGC GGA        ; Push 25, CIRCLE using GGA
  GAA GCC GAA AAA ACA ; Push 37, push 0, translate(37, 0)
  GAA CCC GAA CTT GAA AAA TTA ; Color(21, 31, 0) same green
  GAA CGC GGC        ; Push 25, CIRCLE using GGC (synonymous!)
TAA
; Note: Both circles identical - demonstrates silent mutation`,
    difficulty: 'beginner',
    concepts: ['drawing', 'colors'],
    goodForMutations: ['silent'],
    keywords: ['silent', 'mutation', 'pedagogical', 'demo', 'synonymous']
  },

  gridPattern: {
    title: 'Grid Pattern',
    description: 'Systematic positioning with TRANSLATE for grid layout',
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
    difficulty: 'advanced',
    concepts: ['composition', 'transforms', 'stack'],
    goodForMutations: ['frameshift', 'nonsense'],
    keywords: ['grid', 'layout', 'systematic', 'positioning']
  },

  mandala: {
    title: 'Mandala Pattern',
    description: 'Complex radial symmetry with multiple transforms',
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
    difficulty: 'advanced',
    concepts: ['composition', 'colors', 'transforms'],
    goodForMutations: ['silent', 'missense', 'frameshift'],
    keywords: ['mandala', 'radial', 'symmetry', 'complex', 'artistic']
  },

  stackCleanup: {
    title: 'Stack Cleanup with POP',
    description: 'Demonstrates POP for stack management and cleanup',
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
    difficulty: 'intermediate',
    concepts: ['stack', 'drawing'],
    goodForMutations: ['nonsense', 'frameshift'],
    keywords: ['stack', 'cleanup', 'pop', 'management', 'operations']
  },

  fractalTree: {
    title: 'Fractal Tree',
    description: 'Branching tree structure using SAVE/RESTORE_STATE for recursion',
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
    difficulty: 'advanced',
    concepts: ['state-management', 'composition', 'colors', 'transforms'],
    goodForMutations: ['nonsense', 'missense'],
    keywords: ['fractal', 'tree', 'branching', 'recursion', 'nature', 'nested']
  },

  snowflake: {
    title: 'Snowflake Pattern',
    description: 'Six-fold radial symmetry using state preservation',
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
    difficulty: 'advanced',
    concepts: ['state-management', 'composition', 'colors', 'transforms'],
    goodForMutations: ['nonsense', 'frameshift'],
    keywords: ['snowflake', 'radial', 'symmetry', 'winter', 'pattern', 'six-fold']
  },

  flowerGarden: {
    title: 'Flower Garden',
    description: 'Multiple flowers using state isolation for composition',
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
    difficulty: 'advanced',
    concepts: ['state-management', 'composition', 'colors', 'transforms'],
    goodForMutations: ['missense', 'nonsense'],
    keywords: ['flower', 'garden', 'nature', 'composition', 'multiple', 'colorful']
  }
};

export type ExampleKey = keyof typeof examples;
