import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExampleGrid,
  type ExampleWithName,
  GalleryFilters,
  PreviewModal,
  useGalleryFilters,
} from "@/components/gallery";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";

export default function Gallery() {
  const navigate = useNavigate();
  const {
    filters,
    setCategory,
    setSearch,
    setSortBy,
    filteredExamples,
    totalCount,
  } = useGalleryFilters();

  const [selectedExample, setSelectedExample] =
    useState<ExampleWithName | null>(null);

  const handleOpenInPlayground = () => {
    if (selectedExample) {
      navigate(`/?example=${encodeURIComponent(selectedExample.name)}`);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        subtitle={`Browse ${totalCount} examples demonstrating CodonCanvas features`}
        title="Example Gallery"
      />

      <GalleryFilters
        category={filters.category}
        onCategoryChange={setCategory}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        search={filters.search}
        sortBy={filters.sortBy}
      />

      <ExampleGrid examples={filteredExamples} onSelect={setSelectedExample} />

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
