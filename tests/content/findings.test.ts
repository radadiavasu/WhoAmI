import { describe, expect, it } from "vitest";
import { loadFindings, youtubeIdFromUrl } from "@/content/findings";

describe("findings", () => {
  it("loads notes with author-facing fields", () => {
    const findings = loadFindings();
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.kind === "Research")).toBe(true);
    expect(findings.some((f) => (f.resources?.length ?? 0) > 0)).toBe(true);
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
