import { describe, it, expect } from "vitest";
import { getFocusSet } from "@/lib/focus";
import type { ConceptNode } from "@/content/schema";

const nodes: ConceptNode[] = [
  {
    id: "rag",
    name: "RAG",
    parentId: "c",
    level: "core",
    oneBreath: "x",
    does: ["a"],
    doesNot: ["b"],
    neighbors: [{ id: "hallucination", relation: "prereq" }],
    nextStep: { kind: "goDeeper", label: "n" },
  },
  {
    id: "hallucination",
    name: "Hallucination",
    parentId: "c",
    level: "intro",
    oneBreath: "x",
    does: ["a"],
    doesNot: ["b"],
    neighbors: [],
    nextStep: { kind: "seeRelated", label: "n" },
  },
  {
    id: "agent",
    name: "Agent",
    parentId: "c",
    level: "core",
    oneBreath: "x",
    does: ["a"],
    doesNot: ["b"],
    neighbors: [],
    nextStep: { kind: "seeRelated", label: "n" },
  },
];

describe("getFocusSet", () => {
  it("marks non-neighbors dimmed", () => {
    const f = getFocusSet("rag", nodes);
    expect(f.neighborIds.has("hallucination")).toBe(true);
    expect(f.dimmedIds.has("agent")).toBe(true);
    expect(f.dimmedIds.has("rag")).toBe(false);
  });
});
