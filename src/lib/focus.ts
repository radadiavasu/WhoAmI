import type { ConceptNode } from "@/content/schema";

export function getFocusSet(
  focusedId: string,
  nodes: ConceptNode[],
): {
  focusedId: string;
  neighborIds: Set<string>;
  dimmedIds: Set<string>;
} {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const focused = byId.get(focusedId);
  const neighborIds = new Set<string>();

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
    dimmedIds.add(node.id);
  }

  return { focusedId, neighborIds, dimmedIds };
}
