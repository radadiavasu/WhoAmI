import { describe, it, expect } from "vitest";
import { breadcrumbFor, getFocusSet } from "@/lib/focus";
import { loadNodes } from "@/content/load";
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

describe("breadcrumbFor", () => {
  it("stops canopy leaves at Generative AI — no underground spine bloat", () => {
    const byId = new Map(loadNodes().map((n) => [n.id, n]));
    const parts = breadcrumbFor("tool-use", byId);
    expect(parts[0]).toBe("Generative AI");
    expect(parts).toContain("Building with models");
    expect(parts).toContain("Tool use / function calling");
    expect(parts.join(" ")).not.toMatch(/Artificial intelligence/i);
    expect(parts.join(" ")).not.toMatch(/\bLLM\b/);
  });

  it("keeps the full spine on underground root cards", () => {
    const byId = new Map(loadNodes().map((n) => [n.id, n]));
    const parts = breadcrumbFor("cnn", byId);
    expect(parts[0]).toBe("Artificial intelligence");
    expect(parts).toContain("Deep learning");
    expect(parts.at(-1)).toBe("CNN");
  });
});
