import type { ConceptNode } from "@/content/schema";
import { CHAPTER_ORDER } from "@/lib/graph";

/** Luminous limb colors for dark canopy — similar brightness so no chapter looks inactive. */
export const CHAPTER_COLORS: Record<string, string> = {
  foundations: "#5ecf9a",
  models: "#58c992",
  "talking-to-models": "#4fc088",
  "giving-models-knowledge": "#47b67f",
  "building-with-models": "#52c996",
  "trust-and-quality": "#6ad6a8",
  "generative-ai": "#c4a574",
};

export function resolveChapterId(
  node: ConceptNode,
  byId: Map<string, ConceptNode>,
): string {
  if (node.id === "generative-ai") return "generative-ai";
  if ((CHAPTER_ORDER as readonly string[]).includes(node.id)) return node.id;
  let current: ConceptNode | undefined = node;
  while (current?.parentId) {
    if ((CHAPTER_ORDER as readonly string[]).includes(current.parentId)) {
      return current.parentId;
    }
    current = byId.get(current.parentId);
  }
  return "generative-ai";
}

export function chapterColor(chapterId: string): string {
  return CHAPTER_COLORS[chapterId] ?? "#2a8f6a";
}
