"use client";

import { useEffect, useState } from "react";
import { WhoAmILockup } from "@/components/brand/WhoAmILockup";
import { ConceptSearch } from "@/components/search/ConceptSearch";
import { LatestFindingStrip } from "@/components/site/LatestFindingStrip";
import { SiteNav } from "@/components/site/SiteNav";
import type { Finding } from "@/content/findings";
import type { ConceptNode } from "@/content/schema";

type Props = {
  nodes: ConceptNode[];
  compactBrand: boolean;
  /** Soften map chrome while the welcome choice is up. */
  welcoming?: boolean;
  latestFinding?: Finding;
  onSelect: (id: string) => void;
};

const FIELD_KEYS_DESKTOP = [
  { label: "drag node" },
  { label: "pan · drag" },
  { label: "scroll zoom" },
  { label: "field · scroll roots" },
  { label: "tap open" },
] as const;

const FIELD_KEYS_TOUCH = [
  { label: "drag to pan" },
  { label: "pinch zoom" },
  { label: "drag past field · roots" },
  { label: "tap open" },
] as const;

export function MapChrome({
  nodes,
  compactBrand,
  welcoming = false,
  latestFinding,
  onSelect,
}: Props) {
  const [quietHints, setQuietHints] = useState(false);
  const [touchHints, setTouchHints] = useState(false);

  useEffect(() => {
    const hush = () => setQuietHints(true);
    window.addEventListener("pointerdown", hush, { once: true, passive: true });
    window.addEventListener("wheel", hush, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", hush);
      window.removeEventListener("wheel", hush);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const sync = () => setTouchHints(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const fieldKeys = touchHints ? FIELD_KEYS_TOUCH : FIELD_KEYS_DESKTOP;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 p-5 md:p-8">
      <div className="pointer-events-auto flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <WhoAmILockup compact={compactBrand} />
          {!compactBrand ? (
            <p className="map-purpose">Place yourself in AI.</p>
          ) : null}
          <div
            className={
              welcoming ? "mt-3 opacity-50 pointer-events-none" : "mt-3"
            }
          >
            <SiteNav overlay />
          </div>
          {!compactBrand && !welcoming ? (
            <p
              className={[
                "field-key",
                quietHints ? "is-quiet" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={
                touchHints
                  ? "Map controls: drag to pan, pinch to zoom, drag down past the field for roots (or tap Enter roots), tap a node to open its card"
                  : "Map controls: drag a node to move it, drag empty space to pan, scroll to zoom the canopy, hover the field and scroll to enter roots, click a node to open its card"
              }
            >
              {fieldKeys.map((item, index) => (
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
        <div
          className={[
            "w-full md:max-w-sm",
            welcoming ? "opacity-40 pointer-events-none" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ConceptSearch nodes={nodes} onSelect={onSelect} />
          {latestFinding ? <LatestFindingStrip finding={latestFinding} /> : null}
        </div>
      </div>
    </header>
  );
}
