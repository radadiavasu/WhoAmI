import type { ConceptNode } from "./schema";

export function validateNodes(
  nodes: ConceptNode[],
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const node of nodes) {
    if (ids.has(node.id)) {
      errors.push(`Duplicate id: ${node.id}`);
    }
    ids.add(node.id);
  }

  const roots = nodes.filter((n) => n.parentId === null);
  if (roots.length !== 1) {
    errors.push(`Expected exactly one root, found ${roots.length}`);
  }

  for (const node of nodes) {
    if (node.parentId !== null && !ids.has(node.parentId)) {
      errors.push(`Unknown parentId "${node.parentId}" on ${node.id}`);
    }
    for (const neighbor of node.neighbors) {
      if (!ids.has(neighbor.id)) {
        errors.push(
          `Unknown neighbor "${neighbor.id}" on ${node.id}`,
        );
      }
    }
    if (node.nextStep.targetId && !ids.has(node.nextStep.targetId)) {
      errors.push(
        `Unknown nextStep.targetId "${node.nextStep.targetId}" on ${node.id}`,
      );
    }
    for (const tech of node.relatedTechniques ?? []) {
      if (!ids.has(tech)) {
        errors.push(`Unknown relatedTechnique "${tech}" on ${node.id}`);
      }
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
