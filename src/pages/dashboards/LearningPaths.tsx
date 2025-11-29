/**
 * Learning Paths Dashboard - Curated learning journeys
 *
 * Provides structured paths from DNA basics to mathematical beauty,
 * with progress tracking and interactive examples.
 */

import { useState } from "react";
import { Link } from "react-router-dom";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  modules: number;
  color: string;
  icon: string;
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "dna-fundamentals",
    title: "DNA Fundamentals",
    description:
      "Learn the basics of DNA structure, codons, and how mutations affect genetic information. Perfect for biology students.",
    duration: "20-30 min",
    difficulty: "Beginner",
    modules: 5,
    color: "from-blue-500 to-cyan-500",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  {
    id: "visual-programming",
    title: "Visual Programming Journey",
    description:
      "Master drawing primitives, transforms, and state management. Ideal for CS students learning stack-based graphics.",
    duration: "30-45 min",
    difficulty: "Beginner",
    modules: 6,
    color: "from-purple-500 to-pink-500",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  },
  {
    id: "natures-algorithms",
    title: "Nature's Algorithms",
    description:
      "Explore fractal branching, phyllotaxis, cell division, and neural networks. Connects biology to computational patterns.",
    duration: "25-35 min",
    difficulty: "Intermediate",
    modules: 6,
    color: "from-green-500 to-emerald-500",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    id: "mathematical-beauty",
    title: "Mathematical Beauty",
    description:
      "Discover Fibonacci spirals, golden ratio, rose curves, and prime number spirals. Mathematical art through code.",
    duration: "30-40 min",
    difficulty: "Advanced",
    modules: 5,
    color: "from-orange-500 to-amber-500",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
];

const difficultyColors = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-warning/10 text-warning",
  Advanced: "bg-danger/10 text-danger",
};

export default function LearningPaths() {
  // Path selection for future modal/detail view
  const [_selectedPath, _setSelectedPath] = useState<string | null>(null);

  // Mock progress data (would come from localStorage in real implementation)
  const progress: Record<string, number> = {
    "dna-fundamentals": 60,
    "visual-programming": 20,
    "natures-algorithms": 0,
    "mathematical-beauty": 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">Learning Paths</h1>
        <p className="mx-auto max-w-2xl text-text-muted">
          Structured learning journeys guide you from genetic fundamentals to
          advanced mathematical concepts. Each path provides curated examples,
          concept narratives, and hands-on experiments.
        </p>
      </div>

      {/* Path Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {LEARNING_PATHS.map((path) => {
          const pathProgress = progress[path.id] || 0;

          return (
            <div
              className="group relative overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-lg"
              key={path.id}
            >
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${path.color}`} />

              <div className="p-6">
                {/* Icon and badges */}
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-lg bg-gradient-to-r p-3 ${path.color}`}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d={path.icon}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${difficultyColors[path.difficulty]}`}
                  >
                    {path.difficulty}
                  </span>
                </div>

                {/* Title and description */}
                <h2 className="mb-2 text-xl font-semibold text-text">
                  {path.title}
                </h2>
                <p className="mb-4 text-sm text-text-muted">
                  {path.description}
                </p>

                {/* Meta info */}
                <div className="mb-4 flex gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1">
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    {path.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    {path.modules} modules
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-text-muted">Progress</span>
                    <span className="text-primary">{pathProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className={`h-full bg-gradient-to-r ${path.color} transition-all`}
                      style={{ width: `${pathProgress}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <Link
                  className={`block w-full rounded-lg bg-gradient-to-r py-2 text-center font-medium text-white transition-opacity hover:opacity-90 ${path.color}`}
                  to={`/?path=${path.id}`}
                >
                  {pathProgress > 0 ? "Continue Learning" : "Start Path"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features section */}
      <div className="mt-12 rounded-xl border border-border bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-center text-xl font-semibold text-text">
          What You'll Learn
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Genetic Concepts",
              desc: "Understand codons, mutations, and reading frames",
            },
            {
              title: "Visual Output",
              desc: "Create graphics through DNA-like programming",
            },
            {
              title: "Pattern Recognition",
              desc: "See connections between biology and computation",
            },
            {
              title: "Creative Coding",
              desc: "Express mathematical beauty through genomes",
            },
          ].map((feature) => (
            <div className="text-center" key={feature.title}>
              <h3 className="mb-2 font-medium text-text">{feature.title}</h3>
              <p className="text-sm text-text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
