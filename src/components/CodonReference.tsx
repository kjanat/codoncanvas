/**
 * CodonReference - Interactive codon reference panel
 *
 * Shows all codons grouped by opcode with descriptions.
 * Supports search, filtering by category, and click-to-insert.
 */

import { memo } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "@/data";
import { ChevronRightIcon, CloseIcon } from "@/ui/icons";
import { type CodonReferenceProps, useCodonReference } from "./codon-reference";

export const CodonReference = memo(function CodonReference({
  onInsert,
  collapsed = false,
  onToggleCollapse,
}: CodonReferenceProps) {
  const {
    search,
    setSearch,
    category,
    setCategory,
    filteredOpcodes,
    handleCodonClick,
  } = useCodonReference(onInsert);

  if (collapsed) {
    return (
      <button
        className="flex h-full w-10 items-center justify-center border-l border-border bg-bg-light hover:bg-border"
        onClick={onToggleCollapse}
        title="Show codon reference"
        type="button"
      >
        <ChevronRightIcon className="h-5 w-5 text-text-muted" />
      </button>
    );
  }

  return (
    <div className="flex w-72 flex-col border-l border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold text-text">Codon Reference</h3>
        {onToggleCollapse && (
          <button
            className="rounded p-1 hover:bg-bg-light"
            onClick={onToggleCollapse}
            title="Hide reference"
            type="button"
          >
            <CloseIcon className="text-text-muted" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="border-b border-border p-2">
        <input
          className="w-full rounded-md border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search codons..."
          type="search"
          value={search}
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {CATEGORIES.map((cat) => (
          <button
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              category === cat.value
                ? `${CATEGORY_COLORS[cat.value]} text-white`
                : "bg-bg-light text-text-muted hover:bg-border"
            }`}
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            type="button"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Opcode list */}
      <div className="flex-1 overflow-y-auto">
        {filteredOpcodes.map((info) => (
          <div className="border-b border-border p-3" key={info.name}>
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[info.category]}`}
              />
              <span className="font-mono text-sm font-semibold text-text">
                {info.name}
              </span>
            </div>
            <p className="mb-2 text-xs text-text-muted">{info.description}</p>
            <div className="flex flex-wrap gap-1">
              {info.codons.map((codon) => (
                <button
                  className="rounded bg-dark-bg px-1.5 py-0.5 font-mono text-xs text-dark-text transition-colors hover:bg-primary hover:text-white"
                  key={codon}
                  onClick={() => handleCodonClick(codon)}
                  title={`Click to insert ${codon}`}
                  type="button"
                >
                  {codon}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredOpcodes.length === 0 && (
          <div className="p-4 text-center text-sm text-text-muted">
            No matching codons found
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border px-3 py-2 text-xs text-text-muted">
        Click a codon to insert it at cursor
      </div>
    </div>
  );
});

export default CodonReference;
