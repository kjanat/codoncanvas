import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CanvasPreview } from "@/components/CanvasPreview";
import { FilterToggle } from "@/components/FilterToggle";
import {
  type ExampleWithName,
  PreviewModal,
} from "@/components/gallery/PreviewModal";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Select } from "@/components/Select";
import { examples } from "@/data/examples";

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
  return <Select onChange={onChange} options={sortOptions} value={value} />;
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
      className="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:shadow-md text-left w-full"
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
    <PageContainer>
      <PageHeader
        subtitle={`Browse ${examplesList.length} examples demonstrating CodonCanvas features`}
        title="Example Gallery"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterToggle
          onSelect={setFilter}
          options={categories}
          selected={filter}
          variant="pill"
        />
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
    </PageContainer>
  );
}
