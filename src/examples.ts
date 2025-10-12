/**
 * Built-in example genomes for the playground
 */

export const examples = {
  helloCircle: {
    title: 'Hello Circle',
    description: 'Minimal example - draws a single circle',
    genome: `ATG GAA AAT GGA TAA`
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
TAA`
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
TAA`
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
TAA`
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
TAA`
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
TAA`
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
TAA`
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
TAA`
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
TAA`
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
TAA`
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
TAA`
  }
};

export type ExampleKey = keyof typeof examples;
