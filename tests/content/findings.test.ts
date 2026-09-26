import { describe, expect, it } from "vitest";
import {
  classifyFindingParagraph,
  loadFindings,
  youtubeIdFromUrl,
} from "@/content/findings";

describe("findings", () => {
  it("loads notes with author-facing fields", () => {
    const findings = loadFindings();
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.kind === "Research")).toBe(true);
    expect(findings.some((f) => (f.resources?.length ?? 0) > 0)).toBe(true);
    expect(findings.some((f) => f.image?.includes("edge0-repo"))).toBe(true);
    expect(findings.some((f) => f.slug === "jev-system-one-typed-decisions")).toBe(
      true,
    );
    const jev = findings.find((f) => f.slug === "jev-system-one-typed-decisions");
    expect(jev?.resources?.some((r) => r.href.includes("awesome-jev"))).toBe(
      true,
    );
    expect(jev?.resources?.some((r) => r.href.includes("jaredpalmer/kev"))).toBe(
      true,
    );
  });

  it("marks the path: lede, short beats, then walking paragraphs", () => {
    expect(classifyFindingParagraph("I want to start with a feeling.", 0)).toBe(
      "lede",
    );
    expect(classifyFindingParagraph("Jev’s bet is the swerve.", 3)).toBe("beat");
    expect(
      classifyFindingParagraph(
        "A longer paragraph that keeps explaining the idea in full sentences so a reader can stay with the walk instead of hitting a rest-stop on every line.",
        2,
      ),
    ).toBe("walk");
    expect(classifyFindingParagraph("Can I try it? Not yet.", 0, "after")).toBe(
      "after-open",
    );
  });

  it("reads YouTube ids from common url shapes", () => {
    expect(youtubeIdFromUrl("https://www.youtube.com/watch?v=T-D1OfcDW1M")).toBe(
      "T-D1OfcDW1M",
    );
    expect(youtubeIdFromUrl("https://youtu.be/T-D1OfcDW1M")).toBe("T-D1OfcDW1M");
    expect(
      youtubeIdFromUrl("https://www.youtube.com/embed/T-D1OfcDW1M"),
    ).toBe("T-D1OfcDW1M");
    expect(youtubeIdFromUrl("/c/rag")).toBeUndefined();
  });
});
