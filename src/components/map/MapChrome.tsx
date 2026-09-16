"use client";

import { useEffect, useState } from "react";
import { WhoAmILockup } from "@/components/brand/WhoAmILockup";
import { ConceptSearch } from "@/components/search/ConceptSearch";
import type { ConceptNode } from "@/content/schema";

type Props = {
  nodes: ConceptNode[];
  compactBrand: boolean;
  onSelect: (id: string) => void;
};

const FIELD_KEYS = [
  { label: "drag node" },
  { label: "pan space" },
  { label: "scroll zoom" },
  { label: "click open" },
] as const;

export function MapChrome({ nodes, compactBrand, onSelect }: Props) {
  const [quietHints, setQuietHints] = useState(false);

  useEffect(() => {
    const hush = () => setQuietHints(true);
    window.addEventListener("pointerdown", hush, { once: true, passive: true });
    window.addEventListener("wheel", hush, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", hush);
      window.removeEventListener("wheel", hush);
    };
  }, []);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 p-5 md:p-8">
      <div className="pointer-events-auto flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <WhoAmILockup compact={compactBrand} />
          {!compactBrand ? (
            <p
              className={[
                "field-key",
                quietHints ? "is-quiet" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label="Map controls: drag a node to move it, drag empty space to pan, scroll to zoom, click a node to open its card"
            >
              {FIELD_KEYS.map((item, index) => (
                <span key={item.label} className="field-key-item">
                  {index > 0 ? (
                    <span className="field-key-dot" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                </span>
              ))}
            </p>
          ) : null}
        </div>
        <div className="w-full md:max-w-sm">
          <ConceptSearch nodes={nodes} onSelect={onSelect} />
        </div>
      </div>
    </header>
  );
}
