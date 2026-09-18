import { describe, it, expect } from "vitest";
import { searchNodes } from "@/lib/search";
import { loadNodes } from "@/content/load";
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

const vector: ConceptNode = {
  id: "vector-database",
  name: "Vector database",
  alias: "vector DB",
  parentId: "giving-models-knowledge",
  level: "core",
  oneBreath: "x",
  does: ["a"],
  doesNot: ["b"],
  neighbors: [],
  nextStep: { kind: "seeRelated", label: "n" },
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

  it("tolerates typos in a term", () => {
    expect(searchNodes("retreival", [rag]).map((n) => n.id)).toEqual(["rag"]);
  });

  it("matches shorthand like vector db", () => {
    expect(searchNodes("vector db", [vector, rag]).map((n) => n.id)).toEqual([
      "vector-database",
    ]);
  });

  it("ranks exact name above fuzzy near-misses", () => {
    const agent: ConceptNode = {
      ...rag,
      id: "agent",
      name: "Agent",
      alias: undefined,
    };
    const ranked = searchNodes("agent", [rag, agent]).map((n) => n.id);
    expect(ranked[0]).toBe("agent");
  });
});

describe("searchNodes against real content", () => {
  const nodes = loadNodes();

  function topId(q: string) {
    return searchNodes(q, nodes)[0]?.id;
  }

  it("finds RAG by full name and typo of retrieval-augmented", () => {
    expect(topId("retrieval augmented")).toBe("rag");
    expect(topId("retreival augmented")).toBe("rag");
  });

  it("finds common shorthands and slang", () => {
    expect(topId("cot")).toBe("chain-of-thought");
    expect(topId("json mode")).toBe("structured-output");
    expect(topId("chat model")).toBe("llm");
    expect(topId("finetune")).toBe("fine-tuning");
    expect(topId("vector db")).toBe("vector-database");
    expect(topId("function calling")).toBe("tool-use");
  });

  it("does not let short fuzzy noise beat real acronyms", () => {
    expect(topId("cot")).not.toBe("latency-cost");
  });
});
