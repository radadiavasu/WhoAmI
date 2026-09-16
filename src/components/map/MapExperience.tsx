"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import type { ConceptNode } from "@/content/schema";
import { indexById } from "@/content/load";
import { chapterColor, resolveChapterId } from "@/lib/chapters";
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

type Props = {
  nodes: ConceptNode[];
  initialFocusId?: string;
};

export function MapExperience({ nodes, initialFocusId }: Props) {
  const router = useRouter();
  const byId = useMemo(() => indexById(nodes), [nodes]);
  const focused = initialFocusId ? byId.get(initialFocusId) : undefined;
  const accent = focused
    ? chapterColor(resolveChapterId(focused, byId))
    : "var(--map-accent)";

  const onSelect = (id: string) => {
    router.push(`/c/${id}`);
  };

  const onClose = () => {
    router.push("/");
  };

  const neighborNames = focused
    ? Object.fromEntries(
        focused.neighbors.map((n) => [n.id, byId.get(n.id)?.name ?? n.id]),
      )
    : {};

  return (
    <div className="map-field relative h-[100dvh] w-full overflow-hidden">
      <TreeAtmosphere />
      <MapChrome
        nodes={nodes}
        compactBrand={Boolean(focused)}
        onSelect={onSelect}
      />
      <div className="absolute inset-0 z-[1] pt-24 md:pt-28">
        <ReactFlowProvider>
          <ConceptMap
            concepts={nodes}
            focusedId={initialFocusId}
            onSelect={onSelect}
          />
        </ReactFlowProvider>
      </div>

      {focused ? (
        <>
          <div className="pointer-events-none absolute bottom-4 right-4 top-28 z-20 hidden w-[min(26rem,calc(100%-2rem))] md:block">
            <div className="pointer-events-auto h-full">
              <OrientationCard
                node={focused}
                breadcrumb={breadcrumbFor(focused.id, byId)}
                neighborNames={neighborNames}
                accent={accent}
                onNavigate={onSelect}
                onClose={onClose}
              />
            </div>
          </div>
          <OrientationSheet open>
            <OrientationCard
              node={focused}
              breadcrumb={breadcrumbFor(focused.id, byId)}
              neighborNames={neighborNames}
              accent={accent}
              onNavigate={onSelect}
              onClose={onClose}
            />
          </OrientationSheet>
        </>
      ) : null}
    </div>
  );
}
