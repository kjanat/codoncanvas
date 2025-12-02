/**
 * Tutorial lesson data for CodonCanvas
 *
 * 10 lessons across 3 modules:
 * - Module 1: First Steps (3 lessons)
 * - Module 2: Mutations (4 lessons)
 * - Module 3: Advanced Techniques (3 lessons)
 */

export interface TutorialLesson {
  id: string;
  module: number;
  lessonNumber: number;
  title: string;
  description: string;
  instructions: string[];
  starterCode: string;
  hints: string[];
  validation: {
    requiredCodons?: string[];
    minInstructions?: number;
    customValidator?: (code: string) => boolean;
  };
  learningObjectives: string[];
  nextLesson?: string;
}

export const tutorialLessons: TutorialLesson[] = [
  // MODULE 1: FIRST STEPS
  {
    id: "basics-1",
    module: 1,
    lessonNumber: 1,
    title: "Hello Circle - Your First Program",
    description:
      "Learn the basic structure of a CodonCanvas program by drawing a simple circle.",
    instructions: [
      "Every program starts with ATG (START codon)",
      "Use GAA to PUSH a number onto the stack",
      "The next codon after PUSH is read as a number (0-63)",
      "Use GGA to draw a CIRCLE with the radius from the stack",
      "End with TAA (STOP codon)",
    ],
    starterCode: "ATG\n\n\nTAA",
    hints: [
      "Try: ATG GAA CCC GGA TAA",
      "CCC encodes the number 21 (C=1, so 1x16 + 1x4 + 1 = 21)",
      "The circle will appear at the center with radius proportional to the number",
    ],
    validation: {
      requiredCodons: ["ATG", "GAA", "GGA", "TAA"],
      minInstructions: 4,
    },
    learningObjectives: [
      "Understand START (ATG) and STOP (TAA) codons",
      "Learn to PUSH numeric values",
      "Draw basic shapes with CIRCLE",
    ],
    nextLesson: "basics-2",
  },
  {
    id: "basics-2",
    module: 1,
    lessonNumber: 2,
    title: "Moving Around - TRANSLATE",
    description: "Learn to move the drawing position to create compositions.",
    instructions: [
      "ACA is the TRANSLATE codon - it moves the drawing position",
      "TRANSLATE needs TWO numbers: dx (horizontal) and dy (vertical)",
      "Push two numbers, then use ACA to move",
      "Draw multiple shapes at different positions",
    ],
    starterCode: "ATG\nGAA AAT GGA\n\n\nTAA",
    hints: [
      "Add: GAA CCC GAA AAA ACA before the final TAA",
      "This pushes 21 for dx, 0 for dy, then translates",
      "Now add another PUSH and CIRCLE to draw at the new position",
    ],
    validation: {
      requiredCodons: ["ATG", "ACA", "TAA"],
      minInstructions: 8,
    },
    learningObjectives: [
      "Use TRANSLATE to move drawing position",
      "Understand stack order (dy on top, dx below)",
      "Create multi-shape compositions",
    ],
    nextLesson: "basics-3",
  },
  {
    id: "basics-3",
    module: 1,
    lessonNumber: 3,
    title: "Adding Color - HSL Values",
    description: "Make your drawings colorful with the COLOR opcode.",
    instructions: [
      "TTA is the COLOR codon",
      "COLOR needs THREE numbers: Hue (0-360), Saturation (0-100), Lightness (0-100)",
      "For CodonCanvas, values are 0-63, scaled automatically",
      "Push three values, then use TTA to set color",
    ],
    starterCode: "ATG\nGAA AAT GGA\nTAA",
    hints: [
      "Insert before GGA: GAA TCC GAA CCC GAA CCC TTA",
      "This sets color: H~53, S~21, L~21 (dark reddish)",
      "Try different values to explore the color space",
    ],
    validation: {
      requiredCodons: ["TTA"],
      minInstructions: 7,
    },
    learningObjectives: [
      "Understand HSL color model",
      "Use COLOR opcode with three stack values",
      "Experiment with color values",
    ],
    nextLesson: "mutations-1",
  },

  // MODULE 2: MUTATIONS
  {
    id: "mutations-1",
    module: 2,
    lessonNumber: 1,
    title: "Silent Mutations - Same Output",
    description: "Discover synonymous codons that produce identical results.",
    instructions: [
      "Many codons map to the SAME opcode (like real genetic code)",
      "GGA, GGC, GGG, GGT all produce CIRCLE",
      "Change one of these to another - the output stays the same",
      "This demonstrates genetic redundancy",
    ],
    starterCode: "ATG\nGAA AAT GGA\nTAA",
    hints: [
      "Try changing GGA to GGC",
      "Or change it to GGG or GGT",
      "All four are synonymous - they all mean CIRCLE",
    ],
    validation: {
      requiredCodons: ["ATG", "TAA"],
      customValidator: (code: string): boolean => {
        const circleCount = (code.match(/GG[ACGT]/g) || []).length;
        return circleCount >= 1;
      },
    },
    learningObjectives: [
      "Understand codon redundancy",
      "Identify synonymous codons",
      "See that mutations can be neutral",
    ],
    nextLesson: "mutations-2",
  },
  {
    id: "mutations-2",
    module: 2,
    lessonNumber: 2,
    title: "Missense Mutations - Different Shape",
    description:
      "Change the function by switching to a different opcode family.",
    instructions: [
      "Changing to a DIFFERENT codon family creates a missense mutation",
      "GGA (CIRCLE) -> CCA (RECT) changes the shape",
      "RECT needs TWO values (width, height), so add another PUSH",
      "Observe how the phenotype changes dramatically",
    ],
    starterCode: "ATG\nGAA AAT GGA\nTAA",
    hints: [
      "Change GGA to CCA (CIRCLE -> RECT)",
      "Add another GAA AAT before CCA for the second dimension",
      "Now you have: GAA AAT GAA AAT CCA",
    ],
    validation: {
      requiredCodons: ["CCA"],
      minInstructions: 6,
    },
    learningObjectives: [
      "Understand missense mutations",
      "See how changing opcode changes phenotype",
      "Adapt code to new opcode requirements",
    ],
    nextLesson: "mutations-3",
  },
  {
    id: "mutations-3",
    module: 2,
    lessonNumber: 3,
    title: "Nonsense Mutations - Early Stop",
    description: "Insert a STOP codon early to truncate the program.",
    instructions: [
      "TAA, TAG, TGA are all STOP codons",
      "Inserting STOP early creates a nonsense mutation",
      "The program terminates before drawing everything",
      "This mimics premature termination in protein synthesis",
    ],
    starterCode: "ATG\nGAA AAT GGA\nGAA CCC GAA AAA ACA\nGAA AGG GGA\nTAA",
    hints: [
      "Insert TAA or TAG after the first GGA",
      "The second circle will disappear",
      "Try removing the early STOP to restore full output",
    ],
    validation: {
      customValidator: (code: string): boolean => {
        const stops = (code.match(/TAA|TAG|TGA/g) || []).length;
        return stops >= 2;
      },
    },
    learningObjectives: [
      "Understand nonsense mutations",
      "See truncation effects",
      "Recognize all three STOP codons",
    ],
    nextLesson: "mutations-4",
  },
  {
    id: "mutations-4",
    module: 2,
    lessonNumber: 4,
    title: "Frameshift - Reading Frame Chaos",
    description:
      "Insert or delete bases to shift the reading frame downstream.",
    instructions: [
      "Inserting/deleting 1-2 bases shifts the reading frame",
      "All downstream codons are reinterpreted",
      "GAA AGG -> GA AAG G... (if you delete one A)",
      "This creates dramatic, unpredictable changes",
    ],
    starterCode: "ATG\nGAA AAT GGA\nGAA CCC GAA AAA ACA\nGAA AGG GGA\nTAA",
    hints: [
      "Delete one A from GAA to make GA",
      "Or insert an extra C anywhere in the middle",
      "Watch the whole downstream sequence scramble",
    ],
    validation: {
      customValidator: (code: string): boolean => {
        const cleaned = code.replace(/\s+/g, "");
        return cleaned.length % 3 !== 0;
      },
    },
    learningObjectives: [
      "Understand frameshift mutations",
      "See global effects of local changes",
      "Appreciate reading frame importance",
    ],
    nextLesson: "advanced-1",
  },

  // MODULE 3: ADVANCED TECHNIQUES
  {
    id: "advanced-1",
    module: 3,
    lessonNumber: 1,
    title: "Stack Magic - DUP and SWAP",
    description: "Use stack operations to reuse values efficiently.",
    instructions: [
      "ATA is DUP - duplicates the top stack value",
      "TGG is SWAP - swaps the top two values",
      "Use DUP to draw multiple shapes with the same size",
      "Use SWAP to reorder values without pushing again",
    ],
    starterCode: "ATG\nGAA AGG\n\nTAA",
    hints: [
      "Add ATA after GAA AGG to duplicate the value",
      "Now you have [10, 10] on the stack",
      "Add GGA to draw a circle, then another GGA for a second circle",
    ],
    validation: {
      requiredCodons: ["ATA"],
    },
    learningObjectives: [
      "Master stack manipulation",
      "Use DUP for efficiency",
      "Understand stack-based programming",
    ],
    nextLesson: "advanced-2",
  },
  {
    id: "advanced-2",
    module: 3,
    lessonNumber: 2,
    title: "Rotation and Scale",
    description: "Transform your drawings with rotation and scaling.",
    instructions: [
      "AGA is ROTATE - rotates drawing direction in degrees",
      "CGA is SCALE - scales subsequent drawing operations",
      "Combine with TRANSLATE for complex compositions",
      "Create patterns with repeated transformations",
    ],
    starterCode: "ATG\nGAA AAT GGA\nTAA",
    hints: [
      "Add: GAA GCC AGA (rotate by 37 degrees)",
      "Add: GAA CCC GAA AAA ACA (translate)",
      "Add: GAA AAT GGA (draw another circle)",
    ],
    validation: {
      requiredCodons: ["AGA"],
      minInstructions: 8,
    },
    learningObjectives: [
      "Use ROTATE to change drawing direction",
      "Apply SCALE for size transformations",
      "Combine transforms for complex effects",
    ],
    nextLesson: "advanced-3",
  },
  {
    id: "advanced-3",
    module: 3,
    lessonNumber: 3,
    title: "Creative Challenge - Make Art!",
    description: "Apply everything you have learned to create your own design.",
    instructions: [
      "Use any combination of opcodes you have learned",
      "Create a design with at least 3 different shapes",
      "Use at least 2 colors",
      "Use transforms (TRANSLATE, ROTATE, or SCALE)",
      "Be creative - there are no wrong answers!",
    ],
    starterCode: "ATG\n\n\n\n\nTAA",
    hints: [
      "Start with a plan: what shapes and where?",
      "Try creating: a flower, a face, a pattern, or abstract art",
      "Use transforms to position and rotate shapes",
    ],
    validation: {
      minInstructions: 15,
      customValidator: (code: string): boolean => {
        const hasMultipleShapes =
          (code.match(/GG[ACGT]|CC[ACGT]|AA[ACGT]|GC[ACGT]/g) || []).length >=
          3;
        const hasColor = /TT[ACGT]/.test(code);
        const hasTransform = /AC[ACGT]|AG[ACGT]|CG[ACGT]/.test(code);
        return hasMultipleShapes && hasColor && hasTransform;
      },
    },
    learningObjectives: [
      "Apply all learned concepts creatively",
      "Plan and structure complex programs",
      "Express creativity through code",
    ],
    nextLesson: undefined,
  },
];

export const moduleNames: Record<number, string> = {
  1: "First Steps",
  2: "Mutations",
  3: "Advanced Techniques",
};

export function getLessonsByModule(module: number): TutorialLesson[] {
  return tutorialLessons.filter((l) => l.module === module);
}

export function getLessonById(id: string): TutorialLesson | undefined {
  return tutorialLessons.find((l) => l.id === id);
}
