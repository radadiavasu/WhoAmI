import { describe, it, expect } from "vitest";
import { loadNodes } from "@/content/load";
import { indexById } from "@/content/load";
import {
  buildFullTourOrder,
  chapterTourOrder,
  getTourNext,
} from "@/lib/tour";

describe("tour", () => {
  const nodes = loadNodes();
  const byId = indexById(nodes);

  it("orders every leaf exactly once across chapters", () => {
    const tour = buildFullTourOrder(nodes, byId);
    const leaves = nodes.filter(
      (n) =>
        n.parentId &&
        n.parentId !== "generative-ai" &&
        n.id !== "generative-ai",
    );
    // leaves are children of chapters (parent is a chapter id)
    const chapterKids = nodes.filter((n) =>
      [
        "foundations",
        "models",
        "talking-to-models",
        "giving-models-knowledge",
        "building-with-models",
        "trust-and-quality",
      ].includes(n.parentId ?? ""),
    );
    expect(tour.length).toBe(chapterKids.length);
    expect(new Set(tour).size).toBe(tour.length);
    void leaves;
  });

  it("finishes foundations before jumping chapters when following next", () => {
    const foundations = chapterTourOrder("foundations", nodes, byId);
    expect(foundations.length).toBeGreaterThan(3);

    const visited = new Set<string>();
    let focus = foundations[0]!;
    visited.add(focus);

    const seenInFoundations: string[] = [focus];
    for (let i = 0; i < foundations.length - 1; i++) {
      const next = getTourNext(focus, nodes, visited);
      expect(next).not.toBeNull();
      expect(foundations).toContain(next!.targetId);
      focus = next!.targetId;
      visited.add(focus);
      seenInFoundations.push(focus);
    }
    expect(new Set(seenInFoundations).size).toBe(foundations.length);

    const after = getTourNext(focus, nodes, visited);
    expect(after?.kind).toBe("next_chapter");
    expect(after?.targetId).toBeDefined();
    const models = chapterTourOrder("models", nodes, byId);
    expect(models).toContain(after!.targetId);
  });

  it("skips already-visited leaves after a random jump", () => {
    const foundations = chapterTourOrder("foundations", nodes, byId);
    const models = chapterTourOrder("models", nodes, byId);
    const visited = new Set(foundations);
    // Jump into models mid-way having finished foundations
    const focus = models[0]!;
    visited.add(focus);
    const next = getTourNext(focus, nodes, visited);
    expect(next).not.toBeNull();
    expect(visited.has(next!.targetId)).toBe(false);
    expect(models).toContain(next!.targetId);
  });

  it("returns null when every leaf is visited", () => {
    const tour = buildFullTourOrder(nodes, byId);
    const visited = new Set(tour);
    const focus = tour[tour.length - 1]!;
    expect(getTourNext(focus, nodes, visited)).toBeNull();
  });

  it("keeps authored invitation copy when next matches nextStep", () => {
    const token = byId.get("token");
    expect(token?.nextStep.targetId).toBe("embedding");
    const visited = new Set(["token"]);
    const next = getTourNext("token", nodes, visited);
    expect(next?.targetId).toBe("embedding");
    expect(next?.label).toBe(token!.nextStep.label);
    expect(next?.label).not.toMatch(/^Continue —/);
  });

  it("keeps invitation voice for every in-chapter tour step", () => {
    for (const chapterId of [
      "foundations",
      "models",
      "talking-to-models",
      "giving-models-knowledge",
      "building-with-models",
      "trust-and-quality",
    ]) {
      const order = chapterTourOrder(chapterId, nodes, byId);
      const visited = new Set<string>();
      let focus = order[0]!;
      visited.add(focus);
      for (let i = 0; i < order.length - 1; i++) {
        const next = getTourNext(focus, nodes, visited);
        expect(next, `${chapterId} from ${focus}`).not.toBeNull();
        const name = byId.get(next!.targetId)?.name ?? next!.targetId;
        expect(next!.label, `${focus} -> ${next!.targetId}`).not.toBe(
          `See ${name}`,
        );
        focus = next!.targetId;
        visited.add(focus);
      }
    }
  });
});
