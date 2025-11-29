import { useState } from "react";

const tutorialSteps = [
  {
    title: "Welcome to CodonCanvas",
    content: `CodonCanvas is a DNA-inspired visual programming language. You write code using three-letter "codons" just like how DNA encodes proteins!`,
    example: "ATG GGA TAA",
  },
  {
    title: "The START Codon",
    content: `Every genome must begin with ATG - the START codon. This signals the beginning of execution, just like in real biology where ATG (AUG in RNA) initiates protein synthesis.`,
    example: "ATG",
  },
  {
    title: "Drawing a Circle",
    content: `GGA is the CIRCLE opcode. But first, you need to push a value to the stack for the radius. GAA followed by a number codon does this.`,
    example: "ATG GAA AAT GGA TAA",
  },
  {
    title: "The STOP Codon",
    content: `TAA, TAG, or TGA are STOP codons. They end execution. In biology, these are called "nonsense" codons because they don't code for amino acids.`,
    example: "ATG GAA AAT GGA TAA",
  },
  {
    title: "Silent Mutations",
    content: `Here's where it gets interesting! GGA, GGC, GGG, and GGT all mean CIRCLE. Changing GGA to GGC is a "silent mutation" - different code, same result!`,
    example: "ATG GAA AAT GGC TAA",
  },
  {
    title: "Colors and Transforms",
    content: `Use TTA/TTC/TTG/TTT for COLOR, ACA/ACC/ACG/ACT for TRANSLATE, and AGA/AGC/AGG/AGT for ROTATE. Combine them for complex visuals!`,
    example: "ATG GAA CAA TTA GAA AAT GGA TAA",
  },
];

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-text-muted">
          <span>
            Step {currentStep + 1} of {tutorialSteps.length}
          </span>
          <span>
            {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
            Complete
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all"
            style={{
              width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-text">{step?.title}</h1>
        <p className="mb-6 text-lg text-text-light">{step?.content}</p>

        {/* Code example */}
        <div className="mb-6 rounded-lg bg-dark-bg p-4">
          <pre className="font-mono text-lg text-dark-text">
            {step?.example}
          </pre>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            className="rounded-lg px-6 py-2 text-text-muted transition-colors hover:bg-bg-light disabled:opacity-50"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            type="button"
          >
            Previous
          </button>

          {currentStep < tutorialSteps.length - 1 ? (
            <button
              className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
              onClick={() => setCurrentStep((s) => s + 1)}
              type="button"
            >
              Next Step
            </button>
          ) : (
            <a
              className="rounded-lg bg-success px-6 py-2 text-white transition-colors hover:bg-success-hover"
              href="/"
            >
              Start Coding!
            </a>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="mt-8 flex justify-center gap-2">
        {tutorialSteps.map((tutorialStep, i) => (
          <button
            aria-label={`Go to step ${i + 1}: ${tutorialStep.title}`}
            className={`h-3 w-3 rounded-full transition-colors ${
              i === currentStep
                ? "bg-primary"
                : i < currentStep
                  ? "bg-primary/50"
                  : "bg-border"
            }`}
            key={tutorialStep.title}
            onClick={() => setCurrentStep(i)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
