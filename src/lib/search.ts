import type { ConceptNode } from "@/content/schema";

export function searchNodes(
  query: string,
  nodes: ConceptNode[],
): ConceptNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return nodes.filter((node) => {
    const haystack = [
      node.id,
      node.name,
      node.alias ?? "",
      ...(node.aliases ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
