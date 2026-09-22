import { describe, it, expect } from "vitest";
import {
  buildFlowGraph,
  canopyMobileOverviewIds,
  canopyOverviewIds,
  CANOPY_FIT_PADDING,
  CHAPTER_ORDER,
  groundFieldY,
  rootBedTopY,
} from "@/lib/graph";
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

  it("hangs AI roots below the Generative AI canopy trunk", () => {
    const g = buildFlowGraph(loadNodes());
    const ai = g.nodes.find((x) => x.id === "artificial-intelligence")!;
    const gen = g.nodes.find((x) => x.id === "generative-ai")!;
    const foundations = g.nodes.find((x) => x.id === "foundations")!;
    expect(ai.position.y).toBeGreaterThan(gen.position.y);
    expect(foundations.position.y).toBeLessThan(gen.position.y);
  });

  it("keeps the main root spine near the trunk", () => {
    const g = buildFlowGraph(loadNodes());
    const gen = g.nodes.find((x) => x.id === "generative-ai")!;
    const trunkX = gen.position.x + 268 / 2;
    const spineIds = [
      "llm",
      "transformer",
      "neural-network",
      "deep-learning",
      "machine-learning",
      "artificial-intelligence",
    ];
    for (const id of spineIds) {
      const root = g.nodes.find((x) => x.id === id)!;
      const cx = root.position.x + 280 / 2;
      expect(Math.abs(cx - trunkX)).toBeLessThan(120);
    }
  });

  it("fans side-root forks left and right of the spine", () => {
    const g = buildFlowGraph(loadNodes());
    const gen = g.nodes.find((x) => x.id === "generative-ai")!;
    const trunkX = gen.position.x + 268 / 2;
    const vision = g.nodes.find((x) => x.id === "computer-vision")!;
    const sequences = g.nodes.find((x) => x.id === "sequence-models")!;
    const cnn = g.nodes.find((x) => x.id === "cnn")!;
    const rnn = g.nodes.find((x) => x.id === "rnn")!;
    const rl = g.nodes.find((x) => x.id === "reinforcement-learning")!;
    expect(vision.data.role).toBe("root");
    expect(sequences.data.role).toBe("root");
    expect(cnn.data.role).toBe("root");
    expect(rnn.data.role).toBe("root");
    expect(rl.data.role).toBe("root");
    expect(vision.position.x + 140).toBeLessThan(trunkX - 200);
    expect(sequences.position.x + 140).toBeGreaterThan(trunkX + 200);
    expect(Math.abs(cnn.position.x - vision.position.x)).toBeLessThan(700);
    expect(cnn.position.x + 140).toBeLessThan(trunkX);
    expect(rnn.position.x + 140).toBeGreaterThan(trunkX + 100);
    expect(rl.position.x + 140).toBeLessThan(trunkX - 200);
  });

  it("nests Vision domain leaves under computer-vision", () => {
    const g = buildFlowGraph(loadNodes());
    const vision = g.nodes.find((x) => x.id === "computer-vision")!;
    const kids = ["cnn", "image-classification", "object-detection"].map(
      (id) => g.nodes.find((x) => x.id === id)!,
    );
    for (const leaf of kids) {
      expect(leaf.data.role).toBe("root");
      // Fan lives to the left of the Vision hub.
      expect(leaf.position.x).toBeLessThan(vision.position.x - 80);
    }
    const od = kids.find((k) => k.id === "object-detection")!;
    const ic = kids.find((k) => k.id === "image-classification")!;
    // Object detection above, image classification below (flow y grows downward).
    expect(od.position.y).toBeLessThan(vision.position.y);
    expect(ic.position.y).toBeGreaterThan(vision.position.y);
    // No two Vision leaves share nearly the same center.
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i]!;
        const b = kids[j]!;
        const dist = Math.hypot(
          a.position.x - b.position.x,
          a.position.y - b.position.y,
        );
        expect(dist).toBeGreaterThan(280);
      }
    }
  });

  it("nests Sequences domain leaves under sequence-models", () => {
    const g = buildFlowGraph(loadNodes());
    const hub = g.nodes.find((x) => x.id === "sequence-models")!;
    const kids = ["rnn", "lstm", "seq2seq"].map(
      (id) => g.nodes.find((x) => x.id === id)!,
    );
    for (const leaf of kids) {
      expect(leaf.data.role).toBe("root");
      expect(leaf.position.x).toBeGreaterThan(hub.position.x + 80);
    }
    const lstm = kids.find((k) => k.id === "lstm")!;
    const seq2seq = kids.find((k) => k.id === "seq2seq")!;
    expect(lstm.position.y).toBeLessThan(hub.position.y);
    expect(seq2seq.position.y).toBeGreaterThan(hub.position.y);
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i]!;
        const b = kids[j]!;
        const dist = Math.hypot(
          a.position.x - b.position.x,
          a.position.y - b.position.y,
        );
        expect(dist).toBeGreaterThan(280);
      }
    }
  });

  it("nests RL domain leaves under reinforcement-learning", () => {
    const g = buildFlowGraph(loadNodes());
    const hub = g.nodes.find((x) => x.id === "reinforcement-learning")!;
    const kids = ["reward", "policy", "rlhf"].map(
      (id) => g.nodes.find((x) => x.id === id)!,
    );
    for (const leaf of kids) {
      expect(leaf.data.role).toBe("root");
      expect(leaf.position.x).toBeLessThan(hub.position.x - 80);
    }
    const policy = kids.find((k) => k.id === "policy")!;
    const rlhf = kids.find((k) => k.id === "rlhf")!;
    expect(policy.position.y).toBeLessThan(hub.position.y);
    expect(rlhf.position.y).toBeGreaterThan(hub.position.y);
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i]!;
        const b = kids[j]!;
        const dist = Math.hypot(
          a.position.x - b.position.x,
          a.position.y - b.position.y,
        );
        expect(dist).toBeGreaterThan(280);
      }
    }
  });

  it("frames overview ids on the canopy only", () => {
    const nodes = loadNodes();
    const ids = new Set(canopyOverviewIds(nodes));
    expect(ids.has("generative-ai")).toBe(true);
    expect(ids.has("foundations")).toBe(true);
    expect(ids.has("prompt")).toBe(true);
    expect(ids.has("artificial-intelligence")).toBe(false);
    expect(ids.has("machine-learning")).toBe(false);
    expect(ids.has("llm")).toBe(false);
  });

  it("frames a compact mobile canopy — trunk + chapters only", () => {
    const nodes = loadNodes();
    const ids = canopyMobileOverviewIds(nodes);
    expect(ids).toEqual([
      "generative-ai",
      "foundations",
      "models",
      "talking-to-models",
      "giving-models-knowledge",
      "building-with-models",
      "trust-and-quality",
    ]);
    expect(ids).not.toContain("prompt");
    expect(ids).not.toContain("llm");
  });

  it("places the meadow band under the mound for canopy framing", () => {
    expect(groundFieldY(1400)).toBeGreaterThan(1400);
    expect(rootBedTopY(1400)).toBeGreaterThan(groundFieldY(1400));
    expect(CANOPY_FIT_PADDING.bottom).toBeGreaterThan(CANOPY_FIT_PADDING.top);
  });
});
