import { describe, it, expect } from "vitest";
import { loadNodes } from "@/content/load";

describe("nodes.json", () => {
  it("loads and validates", () => {
    expect(() => loadNodes()).not.toThrow();
    expect(loadNodes().length).toBeGreaterThanOrEqual(30);
  });
});
