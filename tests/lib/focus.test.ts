import { describe, it, expect } from "vitest";
import { getFocusSet } from "@/lib/focus";
import type { ConceptNode } from "@/content/schema";

const nodes: ConceptNode[] = [
  {
    id: "root",
    name: "Root",
    parentId: null,
    level: "intro",
    oneBreath: "x",
    does: ["a"],
    doesNot: ["b"],
    neighbors: [],
    nextStep: { kind: "seeRelated", label: "n" },
  },
  {
    id: "c",
    name: "Chapter",
    parentId: "root",
    level: "intro",
    oneBreath: "x",
    does: ["a"],
    doesNot: ["b"],
    neighbors: [],
    nextStep: { kind: "seeRelated", label: "n" },
  },
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

  it("keeps the path to root undimmed so placement stays readable", () => {
    const f = getFocusSet("rag", nodes);
    expect(f.pathIds.has("c")).toBe(true);
    expect(f.pathIds.has("root")).toBe(true);
    expect(f.dimmedIds.has("c")).toBe(false);
    expect(f.dimmedIds.has("root")).toBe(false);
  });
});
