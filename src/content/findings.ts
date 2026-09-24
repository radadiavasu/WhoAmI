import { z } from "zod";
import raw from "./findings.json";

const resourceSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  kind: z.enum(["docs", "paper", "repo", "talk", "tool", "other"]).optional(),
});

const compareRowSchema = z.object({
  topic: z.string().min(1),
  usual: z.string().min(1),
  theirs: z.string().min(1),
});

const compareSchema = z.object({
  usualLabel: z.string().min(1),
  theirsLabel: z.string().min(1),
  rows: z.array(compareRowSchema).min(2),
});

const findingSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  kind: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  afterword: z.string().min(1).optional(),
  nodeIds: z.array(z.string().min(1)).min(1),
  image: z.string().min(1).optional(),
  video: z
    .object({
      url: z.string().min(1),
      title: z.string().min(1),
    })
    .optional(),
  compare: compareSchema.optional(),
  resources: z.array(resourceSchema).optional(),
});

export type Finding = z.infer<typeof findingSchema>;
export type FindingResource = z.infer<typeof resourceSchema>;
export type FindingCompare = z.infer<typeof compareSchema>;

const findingsSchema = z.array(findingSchema).min(1);

export function loadFindings(): Finding[] {
  const findings = findingsSchema.parse(raw);
  return [...findings].sort((a, b) => b.date.localeCompare(a.date));
}

export function getFinding(slug: string): Finding | undefined {
  return loadFindings().find((f) => f.slug === slug);
}

export function latestFinding(): Finding {
  return loadFindings()[0]!;
}

export function formatFindingDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

/** YouTube watch / share / embed URLs → embeddable video id. */
export function youtubeIdFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace(/^\//, "").split("/")[0] || undefined;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || undefined;
      }
      return parsed.searchParams.get("v") ?? undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
