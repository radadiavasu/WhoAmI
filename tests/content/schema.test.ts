import { describe, it, expect } from "vitest";
import { conceptNodeSchema } from "@/content/schema";

describe("conceptNodeSchema", () => {
  it("accepts a valid RAG-shaped node", () => {
    const parsed = conceptNodeSchema.parse({
      id: "rag",
      name: "RAG",
      alias: "Retrieval-Augmented Generation",
      parentId: "giving-models-knowledge",
      level: "core",
      oneBreath:
        "Instead of only using what the model memorized, it looks up relevant text and then answers.",
      does: ["Ground answers in your docs"],
      doesNot: ["Not the same as fine-tuning"],
      neighbors: [{ id: "hallucination", relation: "prereq" }],
      nextStep: {
        kind: "goDeeper",
        targetId: "retrieval",
        label: "See how retrieval works",
      },
      analogy: "An open-book exam.",
      example: "Internal wiki chatbot.",
    });
    expect(parsed.id).toBe("rag");
  });

  it("rejects missing oneBreath", () => {
    expect(() =>
      conceptNodeSchema.parse({
        id: "x",
        name: "X",
        parentId: "root",
        level: "intro",
        does: ["a"],
        doesNot: ["b"],
        neighbors: [{ id: "y", relation: "next" }],
        nextStep: { kind: "seeRelated", label: "See Y" },
      }),
    ).toThrow();
  });
});
