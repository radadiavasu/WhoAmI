import type { ConceptNode } from "@/content/schema";
import { CANOPY_TRUNK_ID } from "@/lib/graph";

/** Walk parentId chain from focused node up to the root (excludes focused). */
export function ancestryPathIds(
  focusedId: string,
  byId: Map<string, ConceptNode>,
): Set<string> {
  const path = new Set<string>();
  let current = byId.get(focusedId);
  while (current?.parentId) {
    path.add(current.parentId);
    current = byId.get(current.parentId);
  }
  return path;
}

/**
 * Card breadcrumb names, root → … → focused.
 * Canopy cards stop at Generative AI so the underground spine doesn't bloat every leaf.
 */
export function breadcrumbFor(
  id: string,
  byId: Map<string, ConceptNode>,
): string[] {
  const parts: string[] = [];
  let current: ConceptNode | undefined = byId.get(id);
  while (current) {
    parts.unshift(current.name);
    if (current.id === CANOPY_TRUNK_ID) break;
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return parts;
}

export function getFocusSet(
  focusedId: string,
  nodes: ConceptNode[],
): {
  focusedId: string;
  neighborIds: Set<string>;
  pathIds: Set<string>;
  dimmedIds: Set<string>;
} {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const focused = byId.get(focusedId);
  const neighborIds = new Set<string>();
  const pathIds = ancestryPathIds(focusedId, byId);

  if (focused) {
    for (const n of focused.neighbors) neighborIds.add(n.id);
  }

  for (const node of nodes) {
    if (node.id === focusedId) continue;
    if (node.neighbors.some((n) => n.id === focusedId)) {
      neighborIds.add(node.id);
    }
  }

  const dimmedIds = new Set<string>();
  for (const node of nodes) {
    if (node.id === focusedId) continue;
    if (neighborIds.has(node.id)) continue;
    if (pathIds.has(node.id)) continue;
    dimmedIds.add(node.id);
  }

  return { focusedId, neighborIds, pathIds, dimmedIds };
}
