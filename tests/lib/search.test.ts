import { describe, it, expect } from "vitest";
import { searchNodes } from "@/lib/search";
import type { ConceptNode } from "@/content/schema";

const rag: ConceptNode = {
  id: "rag",
  name: "RAG",
  alias: "Retrieval-Augmented Generation",
  parentId: "giving-models-knowledge",
  level: "core",
  oneBreath: "x",
  does: ["a"],
  doesNot: ["b"],
  neighbors: [],
  nextStep: { kind: "goDeeper", label: "n" },
};

describe("searchNodes", () => {
  it("matches alias substring", () => {
    expect(searchNodes("retrieval-augmented", [rag]).map((n) => n.id)).toEqual([
      "rag",
    ]);
  });
  it("returns [] for empty query", () => {
    expect(searchNodes("   ", [rag])).toEqual([]);
  });
});
