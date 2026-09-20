import type { ConceptNode } from "@/content/schema";
import { CANOPY_TRUNK_ID, CHAPTER_ORDER } from "@/lib/graph";

/**
 * Canopy limb colors — one hue per chapter so the six branches read apart
 * at overview zoom. Similar lightness so none looks selected or dead.
 * Trunk stays warm bark; brand amber (--sun) stays for AI + focus path.
 */
export const CHAPTER_COLORS: Record<string, string> = {
  foundations: "#5ecf9a", // moss — ground / basics
  models: "#4db8c9", // river teal — structure
  "talking-to-models": "#d4b85c", // pollen gold — speech / asks
  "giving-models-knowledge": "#6aa8e0", // clear sky — lookup / facts
  "building-with-models": "#d4926a", // clay copper — making
  "trust-and-quality": "#c97b8a", // dusty rose — caution / care
  [CANOPY_TRUNK_ID]: "#c4a574", // bark — canopy trunk
  // Deep roots under the canopy
  "artificial-intelligence": "#8f7350",
  "machine-learning": "#9a8060",
  "deep-learning": "#a48c68",
  "neural-network": "#ae9870",
  transformer: "#6aa8e0",
  llm: "#4db8c9",
};

export function resolveChapterId(
  node: ConceptNode,
  byId: Map<string, ConceptNode>,
): string {
  if (CHAPTER_COLORS[node.id]) return node.id;
  if ((CHAPTER_ORDER as readonly string[]).includes(node.id)) return node.id;
  let current: ConceptNode | undefined = node;
  while (current?.parentId) {
    if (
      (CHAPTER_ORDER as readonly string[]).includes(current.parentId) ||
      CHAPTER_COLORS[current.parentId]
    ) {
      return current.parentId;
    }
    current = byId.get(current.parentId);
  }
  return CANOPY_TRUNK_ID;
}

export function chapterColor(chapterId: string): string {
  return CHAPTER_COLORS[chapterId] ?? "#5ecf9a";
}
