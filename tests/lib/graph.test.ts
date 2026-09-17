import { describe, it, expect } from "vitest";
import { buildFlowGraph, CHAPTER_ORDER } from "@/lib/graph";
import { loadNodes } from "@/content/load";
import type { ConceptNode } from "@/content/schema";

const n = (
  partial: Partial<ConceptNode> &
    Pick<ConceptNode, "id" | "name" | "parentId">,
): ConceptNode => ({
  level: "intro",
  oneBreath: "x",
  does: ["a"],
  doesNot: ["b"],
  neighbors: [],
  nextStep: { kind: "seeRelated", label: "n" },
  ...partial,
});

function centerOf(
  node: { position: { x: number; y: number } },
  w = 196,
  h = 76,
) {
  return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
}

describe("buildFlowGraph", () => {
  it("creates a tree edge from parent to child", () => {
    const nodes = [
      n({ id: "generative-ai", name: "G", parentId: null }),
      n({ id: "foundations", name: "F", parentId: "generative-ai" }),
    ];
    const g = buildFlowGraph(nodes);
    expect(
      g.edges.some(
        (e) => e.source === "generative-ai" && e.target === "foundations",
      ),
    ).toBe(true);
  });

  it("grows chapters upward from the trunk", () => {
    const nodes = [
      n({ id: "generative-ai", name: "G", parentId: null }),
      n({ id: "foundations", name: "F", parentId: "generative-ai" }),
      n({ id: "models", name: "M", parentId: "generative-ai" }),
    ];
    const g = buildFlowGraph(nodes);
    const root = g.nodes.find((x) => x.id === "generative-ai")!;
    const fx = g.nodes.find((x) => x.id === "foundations")!;
    expect(fx.position.y).toBeLessThan(root.position.y);
  });

  it("keeps every pair of leaves from merging in the full tree", () => {
    const g = buildFlowGraph(loadNodes());
    const leaves = g.nodes.filter((x) => x.data.role === "leaf");
    expect(leaves.length).toBeGreaterThan(20);
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const a = centerOf(leaves[i]!);
        const b = centerOf(leaves[j]!);
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(250);
      }
    }
  });

  it("places each chapter's leaves without merging", () => {
    void CHAPTER_ORDER;
    const g = buildFlowGraph(loadNodes());
    const byParent = new Map<string, typeof g.nodes>();
    for (const leaf of g.nodes.filter((x) => x.data.role === "leaf")) {
      const parent = leaf.data.node.parentId!;
      const list = byParent.get(parent) ?? [];
      list.push(leaf);
      byParent.set(parent, list);
    }
    for (const [, group] of byParent) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = centerOf(group[i]!);
          const b = centerOf(group[j]!);
          expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(250);
        }
      }
    }
  });
});
