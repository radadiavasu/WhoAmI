"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import type { ConceptNode } from "@/content/schema";
import { indexById } from "@/content/load";
import {
  trackNextStep,
  trackNodeOpen,
} from "@/lib/analytics";
import { chapterColor, resolveChapterId } from "@/lib/chapters";
import { getTourNext } from "@/lib/tour";
import { ConceptMap } from "@/components/map/ConceptMap";
import { MapChrome } from "@/components/map/MapChrome";
import { OrientationCard } from "@/components/card/OrientationCard";
import { OrientationSheet } from "@/components/card/OrientationSheet";
import { TreeAtmosphere } from "@/components/map/TreeAtmosphere";

function breadcrumbFor(
  id: string,
  byId: Map<string, ConceptNode>,
): string[] {
  const parts: string[] = [];
  let current: ConceptNode | undefined = byId.get(id);
  while (current) {
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return parts;
}

function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

type OpenSource = "map" | "search" | "neighbor" | "next_step" | "url";

type Props = {
  nodes: ConceptNode[];
  initialFocusId?: string;
};

export function MapExperience({ nodes, initialFocusId }: Props) {
  const byId = useMemo(() => indexById(nodes), [nodes]);
  const isMobile = useIsMobile();
  const [focusedId, setFocusedId] = useState<string | undefined>(initialFocusId);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(
    () => new Set(initialFocusId ? [initialFocusId] : []),
  );
  const didTrackLanding = useRef(false);

  const openNode = (id: string, source: OpenSource) => {
    trackNodeOpen(id, source);
    setFocusedId(id);
    setVisitedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    window.history.pushState(null, "", `/c/${id}`);
  };

  // Cold load of /c/[id] — track once; focus already seeded from props.
  useEffect(() => {
    if (!initialFocusId || didTrackLanding.current) return;
    didTrackLanding.current = true;
    trackNodeOpen(initialFocusId, "url");
  }, [initialFocusId]);

  useEffect(() => {
    const onPop = () => {
      const match = window.location.pathname.match(/^\/c\/([^/]+)/);
      const id = match?.[1];
      setFocusedId(id);
      if (id) {
        trackNodeOpen(id, "url");
        setVisitedIds((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const focused = focusedId ? byId.get(focusedId) : undefined;
  const accent = focused
    ? chapterColor(resolveChapterId(focused, byId))
    : "var(--map-accent)";

  const onClose = () => {
    setFocusedId(undefined);
    window.history.pushState(null, "", "/");
  };

  const neighborNames = focused
    ? Object.fromEntries(
        focused.neighbors.map((n) => [n.id, byId.get(n.id)?.name ?? n.id]),
      )
    : {};

  const tourNext = focused
    ? getTourNext(focused.id, nodes, visitedIds)
    : undefined;

  const card = focused ? (
    <OrientationCard
      node={focused}
      breadcrumb={breadcrumbFor(focused.id, byId)}
      neighborNames={neighborNames}
      accent={accent}
      tourNext={tourNext}
      onNavigate={(id) => openNode(id, "neighbor")}
      onNextStep={(targetId) => {
        trackNextStep(focused.id, targetId);
        openNode(targetId, "next_step");
      }}
      onClose={onClose}
    />
  ) : null;

  return (
    <div className="map-field relative h-[100dvh] w-full overflow-hidden">
      <TreeAtmosphere />
      <MapChrome
        nodes={nodes}
        compactBrand={Boolean(focused)}
        onSelect={(id) => openNode(id, "search")}
      />
      <div className="absolute inset-0 z-[1] pt-24 md:pt-28">
        <ReactFlowProvider>
          <ConceptMap
            concepts={nodes}
            focusedId={focusedId}
            visitedIds={visitedIds}
            onSelect={(id) => openNode(id, "map")}
          />
        </ReactFlowProvider>
      </div>

      {focused && !isMobile ? (
        <div className="pointer-events-none absolute bottom-4 right-4 top-28 z-20 w-[min(26rem,calc(100%-2rem))]">
          <div className="pointer-events-auto h-full">{card}</div>
        </div>
      ) : null}

      {focused && isMobile ? <OrientationSheet open>{card}</OrientationSheet> : null}
    </div>
  );
}
