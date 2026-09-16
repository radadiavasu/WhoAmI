import { describe, it, expect } from "vitest";
import { validateNodes } from "@/content/validate";
import type { ConceptNode } from "@/content/schema";

const base = (
  over: Partial<ConceptNode> & Pick<ConceptNode, "id" | "name">,
): ConceptNode => ({
  parentId: "generative-ai",
  level: "intro",
  oneBreath: "x",
  does: ["a"],
  doesNot: ["b"],
  neighbors: [],
  nextStep: { kind: "seeRelated", label: "n" },
  ...over,
});

describe("validateNodes", () => {
  it("flags unknown parentId", () => {
    const nodes = [
      base({ id: "generative-ai", name: "Generative AI", parentId: null }),
      base({ id: "token", name: "Token", parentId: "missing" }),
    ];
    const result = validateNodes(nodes);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/parentId/);
  });

  it("accepts a tiny valid tree", () => {
    const nodes = [
      base({ id: "generative-ai", name: "Generative AI", parentId: null }),
      base({
        id: "foundations",
        name: "Foundations",
        parentId: "generative-ai",
      }),
      base({
        id: "token",
        name: "Token",
        parentId: "foundations",
        neighbors: [{ id: "foundations", relation: "prereq" }],
      }),
    ];
    expect(validateNodes(nodes).ok).toBe(true);
  });
});
