import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CanvasPreview } from "@/components/CanvasPreview";
import { type ExampleMetadata, examples } from "@/data/examples";

// --- Types & Constants ---

type Category = "all" | "beginner" | "intermediate" | "advanced" | "showcase";

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

function ExampleCard({ example }: { example: ExampleWithName }) {
  return (
    <Link
      className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-md"
      to={`/?example=${encodeURIComponent(example.name)}`}
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
    </Link>
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
  const [filter, setFilter] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const filteredExamples = useMemo(() => {
    return examplesList
      .filter((ex) => matchesSearchQuery(ex, search))
      .filter((ex) => matchesCategory(ex, filter));
  }, [filter, search]);

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
        <SearchInput onChange={setSearch} value={search} />
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredExamples.map((example) => (
          <ExampleCard example={example} key={example.name} />
        ))}
      </div>

      {filteredExamples.length === 0 && <EmptyState />}
    </div>
  );
}
