import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CanvasPreview } from "@/components/CanvasPreview";
import { type ExampleMetadata, examples } from "@/data/examples";

// --- Types & Constants ---

type Category = "all" | "beginner" | "intermediate" | "advanced" | "showcase";
type SortOption = "default" | "name" | "difficulty-asc" | "difficulty-desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "name", label: "Name A-Z" },
  { value: "difficulty-asc", label: "Difficulty (Easy first)" },
  { value: "difficulty-desc", label: "Difficulty (Hard first)" },
];

const difficultyOrder: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  "advanced-showcase": 4,
};

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Examples" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "showcase", label: "Showcase" },
];

interface ExampleWithName extends ExampleMetadata {
  name: string;
}

const examplesList: ExampleWithName[] = Object.entries(examples).map(
  ([name, data]) => ({
    name,
    ...data,
  }),
);

// --- Filter Functions (extracted to reduce complexity) ---

function matchesSearchQuery(example: ExampleWithName, query: string): boolean {
  if (!query) return true;
  const lowerQuery = query.toLowerCase();
  return (
    example.name.toLowerCase().includes(lowerQuery) ||
    example.title.toLowerCase().includes(lowerQuery) ||
    example.description.toLowerCase().includes(lowerQuery)
  );
}

function matchesCategory(
  example: ExampleWithName,
  category: Category,
): boolean {
  if (category === "all") return true;
  if (category === "showcase")
    return example.difficulty === "advanced-showcase";
  return example.difficulty === category;
}

// --- Sub-Components ---

function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: Category;
  onSelect: (cat: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selected === cat.value
              ? "bg-primary text-white"
              : "bg-white text-text hover:bg-bg-light"
          }`}
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          type="button"
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      className="rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search examples..."
      type="search"
      value={value}
    />
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <select
      className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      onChange={(e) => onChange(e.target.value as SortOption)}
      value={value}
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ExampleCard({
  example,
  onClick,
}: {
  example: ExampleWithName;
  onClick: () => void;
}) {
  return (
    <button
      className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-md text-left w-full"
      onClick={onClick}
      type="button"
    >
      <div className="flex aspect-square items-center justify-center bg-dark-bg p-2">
        <CanvasPreview
          className="rounded-md"
          genome={example.genome}
          height={180}
          width={180}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text group-hover:text-primary">
          {example.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
          {example.description}
        </p>
        <div className="mt-2 flex gap-1">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {example.difficulty}
          </span>
        </div>
      </div>
    </button>
  );
}

function PreviewModal({
  example,
  onClose,
  onOpenInPlayground,
}: {
  example: ExampleWithName;
  onClose: () => void;
  onOpenInPlayground: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white p-4">
          <div>
            <h2 className="text-xl font-bold text-text">{example.title}</h2>
            <p className="text-sm text-text-muted">{example.description}</p>
          </div>
          <button
            className="rounded-lg p-2 text-text-muted hover:bg-bg-light hover:text-text"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Close</title>
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl border border-border bg-dark-bg p-4">
              <CanvasPreview
                className="rounded-lg"
                genome={example.genome}
                height={350}
                width={350}
              />
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {example.difficulty}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex-1 overflow-auto rounded-lg border border-border bg-dark-bg p-4">
              <pre className="font-mono text-sm text-dark-text whitespace-pre-wrap break-all">
                {example.genome}
              </pre>
            </div>
            <button
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
              onClick={onOpenInPlayground}
              type="button"
            >
              Open in Playground
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <p className="text-text-muted">
        No examples found matching your criteria.
      </p>
    </div>
  );
}

// --- Main Component ---

export default function Gallery() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [selectedExample, setSelectedExample] =
    useState<ExampleWithName | null>(null);

  const filteredExamples = useMemo(() => {
    const filtered = examplesList
      .filter((ex) => matchesSearchQuery(ex, search))
      .filter((ex) => matchesCategory(ex, filter));

    // Apply sorting
    if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "difficulty-asc") {
      filtered.sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
      );
    } else if (sortBy === "difficulty-desc") {
      filtered.sort(
        (a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty],
      );
    }

    return filtered;
  }, [filter, search, sortBy]);

  const handleOpenInPlayground = useCallback(() => {
    if (selectedExample) {
      navigate(`/?example=${encodeURIComponent(selectedExample.name)}`);
    }
  }, [selectedExample, navigate]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">Example Gallery</h1>
        <p className="text-text-muted">
          Browse {examplesList.length} examples demonstrating CodonCanvas
          features
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter onSelect={setFilter} selected={filter} />
        <div className="flex gap-2">
          <SearchInput onChange={setSearch} value={search} />
          <SortSelect onChange={setSortBy} value={sortBy} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredExamples.map((example) => (
          <ExampleCard
            example={example}
            key={example.name}
            onClick={() => setSelectedExample(example)}
          />
        ))}
      </div>

      {filteredExamples.length === 0 && <EmptyState />}

      {/* Preview Modal */}
      {selectedExample && (
        <PreviewModal
          example={selectedExample}
          onClose={() => setSelectedExample(null)}
          onOpenInPlayground={handleOpenInPlayground}
        />
      )}
    </div>
  );
}
