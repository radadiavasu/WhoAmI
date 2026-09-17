"use client";

import { useMemo, useState } from "react";
import type { ConceptNode } from "@/content/schema";
import { trackSearchSelect } from "@/lib/analytics";
import { searchNodes } from "@/lib/search";

type Props = {
  nodes: ConceptNode[];
  onSelect: (id: string) => void;
};

export function ConceptSearch({ nodes, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => searchNodes(query, nodes).slice(0, 8),
    [query, nodes],
  );

  const pick = (id: string) => {
    trackSearchSelect(query, id);
    onSelect(id);
    setQuery("");
  };

  return (
    <div className="relative w-full">
      <label className="sr-only" htmlFor="concept-search">
        I’m confused about
      </label>
      <div className="rounded-full border border-[color-mix(in_oklab,var(--ink)_12%,transparent)] bg-[var(--panel-lift)] px-4 py-3 shadow-[0_12px_36px_color-mix(in_oklab,black_45%,transparent)]">
        <input
          id="concept-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
            if (e.key === "Enter" && results[0]) {
              pick(results[0].id);
            }
          }}
          placeholder="I’m confused about…"
          className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)]"
          autoComplete="off"
        />
      </div>
      {results.length > 0 ? (
        <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[color-mix(in_oklab,var(--ink)_10%,transparent)] bg-[var(--panel-lift)] py-1 shadow-[0_20px_48px_color-mix(in_oklab,black_50%,transparent)]">
          {results.map((node) => (
            <li key={node.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-4 py-2.5 text-left text-sm hover:bg-[color-mix(in_oklab,var(--glow)_22%,var(--panel))]"
                onClick={() => pick(node.id)}
              >
                <span className="font-semibold text-[var(--ink)]">
                  {node.name}
                </span>
                {node.alias ? (
                  <span className="text-xs text-[var(--ink-soft)]">
                    {node.alias}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
