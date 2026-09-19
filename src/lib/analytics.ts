/**
 * Product analytics for WhoAmI via Vercel Web Analytics.
 * Safe no-op off Vercel / when the script isn’t loaded.
 */
import { track as vaTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null | undefined>;

function cleanProps(
  props?: Props,
): Record<string, string | number | boolean> | undefined {
  if (!props) return undefined;
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue;
    clean[key] = value;
  }
  return Object.keys(clean).length ? clean : undefined;
}

export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  try {
    const data = cleanProps(props);
    vaTrack(event, data);
  } catch {
    // Never break the map for analytics.
  }
}

export function trackSearchSelect(query: string, nodeId: string): void {
  track("search_select", { query: query.slice(0, 80), nodeId });
}

export function trackNodeOpen(
  nodeId: string,
  source: "map" | "search" | "neighbor" | "next_step" | "url" | "begin",
): void {
  track("node_open", { nodeId, source });
}

export function trackNextStep(fromId: string, toId: string): void {
  track("next_step", { fromId, toId });
}
