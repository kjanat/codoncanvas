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
  }
};

export type ExampleKey = keyof typeof examples;
