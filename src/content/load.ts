import raw from "./nodes.json";
import { nodesFileSchema, type ConceptNode } from "./schema";
import { validateNodes } from "./validate";

export function loadNodes(): ConceptNode[] {
  const nodes = nodesFileSchema.parse(raw);
  const result = validateNodes(nodes);
  if (!result.ok) {
    throw new Error(`Invalid content:\n${result.errors.join("\n")}`);
  }
  return nodes;
}

export function indexById(nodes: ConceptNode[]): Map<string, ConceptNode> {
  return new Map(nodes.map((n) => [n.id, n]));
}
